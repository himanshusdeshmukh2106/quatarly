#!/usr/bin/env python3
\"\"\"
Google Sheets Finance Integration Test Suite
Validates Google Sheets integration and data accuracy

Usage:
    python test_google_sheets_integration.py

Requirements:
    - Set up Google Sheets credentials in .env file
    - Install Google Sheets API dependencies
    - Have Django environment configured
\"\"\"

import os
import sys
import django
import json
from datetime import datetime, timedelta
from decimal import Decimal

# Setup Django
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'C8V2.settings')
django.setup()

from investments.google_sheets_service import google_sheets_service
from investments.models import Investment
from investments.data_enrichment_service import DataEnrichmentService
from investments.tasks import (
    sync_google_sheets_data,
    fetch_google_sheets_ohlc_data,
    refresh_google_sheets_prices,
    test_google_sheets_connection
)
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()


class GoogleSheetsIntegrationTester:
    \"\"\"Comprehensive test suite for Google Sheets integration\"\"\"
    
    def __init__(self):
        self.test_symbols = [
            'RELIANCE',  # Indian stock
            'TCS',       # Indian IT stock
            'AAPL',      # US stock
            'BTCUSD',    # Cryptocurrency
        ]
        self.results = {
            'total_tests': 0,
            'passed_tests': 0,
            'failed_tests': 0,
            'test_details': []
        }
    
    def log_test_result(self, test_name: str, passed: bool, message: str = \"\"):
        \"\"\"Log test result\"\"\"
        self.results['total_tests'] += 1
        if passed:
            self.results['passed_tests'] += 1
            status = \"PASS\"
        else:
            self.results['failed_tests'] += 1
            status = \"FAIL\"
        
        result = {
            'test_name': test_name,
            'status': status,
            'message': message,
            'timestamp': datetime.now().isoformat()
        }
        
        self.results['test_details'].append(result)
        print(f\"[{status}] {test_name}: {message}\")
    
    def test_connection(self):
        \"\"\"Test Google Sheets API connection\"\"\"
        try:
            available = google_sheets_service.is_available()
            if available:
                connection_test = google_sheets_service.test_connection()
                self.log_test_result(
                    \"Google Sheets Connection\",
                    connection_test,
                    \"Connected successfully\" if connection_test else \"Connection failed\"
                )
            else:
                self.log_test_result(
                    \"Google Sheets Connection\",
                    False,
                    \"Service not available - check credentials\"
                )
        except Exception as e:
            self.log_test_result(\"Google Sheets Connection\", False, f\"Error: {e}\")
    
    def test_market_data_fetch(self):
        \"\"\"Test fetching market data for test symbols\"\"\"
        try:
            market_data = google_sheets_service.fetch_market_data_batch(
                self.test_symbols, force_refresh=True
            )
            
            if market_data:
                for symbol in self.test_symbols:
                    if symbol in market_data:
                        data = market_data[symbol]
                        has_price = data.get('current_price') is not None
                        has_volume = data.get('volume') is not None
                        
                        self.log_test_result(
                            f\"Market Data - {symbol}\",
                            has_price and has_volume,
                            f\"Price: {data.get('current_price')}, Volume: {data.get('volume')}\"
                        )
                    else:
                        self.log_test_result(
                            f\"Market Data - {symbol}\",
                            False,
                            \"No data returned\"
                        )
            else:
                self.log_test_result(
                    \"Market Data Fetch\",
                    False,
                    \"No market data returned\"
                )
        except Exception as e:
            self.log_test_result(\"Market Data Fetch\", False, f\"Error: {e}\")
    
    def test_ohlc_data_fetch(self):
        \"\"\"Test fetching OHLC data\"\"\"
        test_symbol = 'RELIANCE'  # Use reliable Indian stock
        
        try:
            ohlc_data = google_sheets_service.fetch_ohlc_data(
                test_symbol, days=30, force_refresh=True
            )
            
            if ohlc_data:
                has_required_fields = all(
                    key in ohlc_data[0] for key in ['date', 'open', 'high', 'low', 'close']
                ) if ohlc_data else False
                
                self.log_test_result(
                    f\"OHLC Data - {test_symbol}\",
                    has_required_fields and len(ohlc_data) > 0,
                    f\"Fetched {len(ohlc_data)} data points\"
                )
            else:
                self.log_test_result(
                    f\"OHLC Data - {test_symbol}\",
                    False,
                    \"No OHLC data returned\"
                )
        except Exception as e:
            self.log_test_result(f\"OHLC Data - {test_symbol}\", False, f\"Error: {e}\")
    
    def test_data_enrichment_integration(self):
        \"\"\"Test data enrichment service integration\"\"\"
        try:
            test_symbol = 'RELIANCE'
            
            # Test basic market data retrieval
            basic_data = DataEnrichmentService.get_basic_market_data(test_symbol, 'stock')
            
            if basic_data:
                has_source = 'source' in basic_data
                is_google_sheets = basic_data.get('source') == 'google_sheets'
                
                self.log_test_result(
                    \"Data Enrichment Integration\",
                    has_source and basic_data.get('current_price') is not None,
                    f\"Source: {basic_data.get('source')}, Price: {basic_data.get('current_price')}\"
                )
            else:
                self.log_test_result(
                    \"Data Enrichment Integration\",
                    False,
                    \"No data returned from enrichment service\"
                )
        except Exception as e:
            self.log_test_result(\"Data Enrichment Integration\", False, f\"Error: {e}\")
    
    def test_cache_functionality(self):
        \"\"\"Test caching functionality\"\"\"
        try:
            test_symbol = 'TCS'
            
            # First fetch (should hit Google Sheets)
            start_time = datetime.now()
            data1 = google_sheets_service.fetch_market_data_batch([test_symbol], force_refresh=True)
            first_fetch_time = (datetime.now() - start_time).total_seconds()
            
            # Second fetch (should hit cache)
            start_time = datetime.now()
            data2 = google_sheets_service.fetch_market_data_batch([test_symbol], force_refresh=False)
            second_fetch_time = (datetime.now() - start_time).total_seconds()
            
            # Cache should be faster
            cache_working = second_fetch_time < first_fetch_time and data1 == data2
            
            self.log_test_result(
                \"Cache Functionality\",
                cache_working,
                f\"First fetch: {first_fetch_time:.2f}s, Second fetch: {second_fetch_time:.2f}s\"
            )
        except Exception as e:
            self.log_test_result(\"Cache Functionality\", False, f\"Error: {e}\")
    
    def test_celery_tasks(self):
        \"\"\"Test Celery tasks (without actually running them)\"\"\"
        try:
            # Test task import and signature
            tasks_to_test = [
                sync_google_sheets_data,
                fetch_google_sheets_ohlc_data,
                refresh_google_sheets_prices,
                test_google_sheets_connection
            ]
            
            all_tasks_available = True
            for task in tasks_to_test:
                if not hasattr(task, 'delay'):
                    all_tasks_available = False
                    break
            
            self.log_test_result(
                \"Celery Tasks Import\",
                all_tasks_available,
                \"All Google Sheets tasks imported successfully\" if all_tasks_available else \"Task import failed\"
            )
        except Exception as e:
            self.log_test_result(\"Celery Tasks Import\", False, f\"Error: {e}\")
    
    def test_error_handling(self):
        \"\"\"Test error handling with invalid symbols\"\"\"
        try:
            invalid_symbols = ['INVALID_SYMBOL_123', 'NOT_REAL_STOCK']
            
            # This should not crash the service
            result = google_sheets_service.fetch_market_data_batch(invalid_symbols, force_refresh=True)
            
            # Service should handle gracefully (return empty dict or handle errors)
            error_handled = isinstance(result, dict)
            
            self.log_test_result(
                \"Error Handling\",
                error_handled,
                \"Service handled invalid symbols gracefully\"
            )
        except Exception as e:
            self.log_test_result(\"Error Handling\", False, f\"Service crashed: {e}\")
    
    def test_data_consistency(self):
        \"\"\"Test data consistency and format\"\"\"
        try:
            test_symbol = 'RELIANCE'
            data = google_sheets_service.fetch_market_data_batch([test_symbol], force_refresh=True)
            
            if test_symbol in data:
                symbol_data = data[test_symbol]
                
                # Check required fields
                required_fields = ['current_price', 'volume', 'company_name']
                has_required_fields = all(field in symbol_data for field in required_fields)
                
                # Check data types
                price_is_number = isinstance(symbol_data.get('current_price'), (int, float))
                volume_is_string = isinstance(symbol_data.get('volume'), str)
                
                consistency_check = has_required_fields and price_is_number and volume_is_string
                
                self.log_test_result(
                    \"Data Consistency\",
                    consistency_check,
                    f\"Fields present: {has_required_fields}, Types correct: {price_is_number and volume_is_string}\"
                )
            else:
                self.log_test_result(\"Data Consistency\", False, \"No data for test symbol\")
        except Exception as e:
            self.log_test_result("Data Consistency", False, f"Error: {e}")
    
    def test_spreadsheet_info(self):
        """Test spreadsheet information and auto-creation features"""
        try:
            info = google_sheets_service.get_spreadsheet_info()
            
            if info:
                has_required_info = all(key in info for key in ['id', 'title', 'url'])
                
                message = f"Title: {info.get('title', 'N/A')}, Auto-created: {info.get('auto_created', False)}"
                
                self.log_test_result(
                    "Spreadsheet Info",
                    has_required_info,
                    message
                )
                
                # Test URL generation
                url = google_sheets_service.get_spreadsheet_url()
                url_valid = url and url.startswith('https://docs.google.com/spreadsheets/')
                
                self.log_test_result(
                    "Spreadsheet URL",
                    url_valid,
                    f"URL: {url[:50]}..." if url else "No URL generated"
                )
            else:
                self.log_test_result("Spreadsheet Info", False, "No spreadsheet info available")
        except Exception as e:
            self.log_test_result("Spreadsheet Info", False, f"Error: {e}")
    
    def run_all_tests(self):
        \"\"\"Run all tests and generate report\"\"\"
        print(\"\n\" + \"=\"*50)
        print(\"Google Sheets Integration Test Suite\")
        print(\"=\"*50)
        
        test_methods = [
            self.test_connection,
            self.test_market_data_fetch,
            self.test_ohlc_data_fetch,
            self.test_data_enrichment_integration,
            self.test_cache_functionality,
            self.test_celery_tasks,
            self.test_error_handling,
            self.test_data_consistency,
            self.test_spreadsheet_info,
        ]
        
        for test_method in test_methods:
            try:
                test_method()
            except Exception as e:
                self.log_test_result(test_method.__name__, False, f\"Test crashed: {e}\")
        
        self.generate_report()
    
    def generate_report(self):
        \"\"\"Generate final test report\"\"\"
        print(\"\n\" + \"=\"*50)
        print(\"TEST SUMMARY\")
        print(\"=\"*50)
        
        print(f\"Total Tests: {self.results['total_tests']}\")
        print(f\"Passed: {self.results['passed_tests']}\")
        print(f\"Failed: {self.results['failed_tests']}\")
        
        success_rate = (self.results['passed_tests'] / self.results['total_tests']) * 100 if self.results['total_tests'] > 0 else 0
        print(f\"Success Rate: {success_rate:.1f}%\")
        
        if self.results['failed_tests'] > 0:
            print(\"\nFAILED TESTS:\")
            for test in self.results['test_details']:
                if test['status'] == 'FAIL':
                    print(f\"  - {test['test_name']}: {test['message']}\")
        
        # Save detailed report
        report_file = f\"google_sheets_test_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json\"
        with open(report_file, 'w') as f:
            json.dump(self.results, f, indent=2)
        
        print(f\"\nDetailed report saved to: {report_file}\")
        
        # Return success status
        return self.results['failed_tests'] == 0


def main():
    \"\"\"Main test execution\"\"\"
    print(\"Starting Google Sheets Integration Tests...\")
    
    # Check if credentials are configured
    from django.conf import settings
    if not hasattr(settings, 'GOOGLE_SHEETS_CREDENTIALS_JSON') or not settings.GOOGLE_SHEETS_CREDENTIALS_JSON:
        print(\"\nERROR: Google Sheets credentials not configured!\")
        print(\"Please set GOOGLE_SHEETS_CREDENTIALS_JSON and GOOGLE_SHEETS_SPREADSHEET_ID in your .env file\")
        print(\"See GOOGLE_SHEETS_SETUP_GUIDE.md for setup instructions\")
        return False
    
    tester = GoogleSheetsIntegrationTester()
    success = tester.run_all_tests()
    
    if success:
        print(\"\n✅ All tests passed! Google Sheets integration is working correctly.\")
    else:
        print(\"\n❌ Some tests failed. Please check the configuration and try again.\")
    
    return success


if __name__ == \"__main__\":
    success = main()
    sys.exit(0 if success else 1)