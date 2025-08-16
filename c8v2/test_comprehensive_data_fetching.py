#!/usr/bin/env python
"""
Comprehensive test script for both technical and fundamental data fetching
Tests the complete data pipeline including:
1. Technical data from Bharat-sm-data (NSE/BSE)
2. Fundamental data from Perplexity API
3. Data enrichment service integration
4. Investment model data population
"""

import os
import sys
import django
from pathlib import Path
import json
import time
from decimal import Decimal

# Add the project root to Python path
project_root = Path(__file__).parent

sys.path.insert(0, str(project_root))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'C8V2.settings')
django.setup()

from investments.bharatsm_service import bharatsm_service, get_bharatsm_frontend_data
from investments.data_enrichment_service import DataEnrichmentService
from investments.perplexity_service import PerplexityAPIService, perplexity_rate_limiter
from investments.models import Investment
from django.contrib.auth import get_user_model

User = get_user_model()


class ComprehensiveDataTest:
    """Comprehensive test suite for data fetching capabilities"""
    
    def __init__(self):
        self.test_symbols = ['RELIANCE', 'TCS', 'HDFCBANK', 'INFY']
        self.test_results = {
            'technical_data': {},
            'fundamental_data': {},
            'enrichment_service': {},
            'investment_creation': {}
        }
    
    def run_all_tests(self):
        """Run all data fetching tests"""
        print("Starting Comprehensive Data Fetching Tests")
        print("=" * 60)
        
        # Test 1: Technical Data Service
        print("\nTesting Technical Data Service")
        print("-" * 40)
        self.test_bharatsm_data_service()
        
        # Test 2: Fundamental Data Service
        print("\nTesting Fundamental Data Service")
        print("-" * 40)
        self.test_fundamental_data_service()
        
        # Test 3: Data Enrichment Service
        print("\nTesting Data Enrichment Service")
        print("-" * 40)
        self.test_data_enrichment_service()
        
        # Test 4: Investment Model Integration
        print("\nTesting Investment Model Integration")
        print("-" * 40)
        self.test_investment_model_integration()
        
        # Test 5: Rate Limiting and Error Handling
        print("\nTesting Rate Limiting and Error Handling")
        print("-" * 40)
        self.test_rate_limiting_and_errors()
        
        # Summary
        self.print_test_summary()
    
    def test_bharatsm_data_service(self):
        """Test data fetching from BharatSM Service"""
        print("Testing BharatSM Service availability...")
        
        if not bharatsm_service or not bharatsm_service.is_available():
            print(" BharatSM Service not available")
            print("   Install with: pip install Bharat-sm-data")
            self.test_results['technical_data']['available'] = False
            return
        
        print(" BharatSM Service is available")
        self.test_results['technical_data']['available'] = True
        
        # Test frontend data for each symbol
        successful_fetches = 0
        for symbol in self.test_symbols:
            print(f"\nTesting frontend data for {symbol}...")
            try:
                frontend_data = get_bharatsm_frontend_data(symbol)
                if frontend_data:
                    print(f"Successfully fetched data for {symbol}")
                    print(f"   Company: {frontend_data.get('company_name', 'N/A')}")
                    print(f"   Volume: {frontend_data.get('volume', 'N/A')}")
                    print(f"   Market Cap: {frontend_data.get('market_cap', 'N/A')}")
                    print(f"   P/E Ratio: {frontend_data.get('pe_ratio', 'N/A')}")
                    print(f"   Growth Rate: {frontend_data.get('growth_rate', 'N/A')}")
                    successful_fetches += 1
                else:
                    print(f" No data returned for {symbol}")
            except Exception as e:
                print(f" Error fetching {symbol}: {e}")
        
        self.test_results['technical_data']['stock_data_success_rate'] = successful_fetches / len(self.test_symbols)
        print(f"\nBharatSM data success rate: {successful_fetches}/{len(self.test_symbols)}")
    
    def test_fundamental_data_service(self):
        """Test fundamental data fetching from Perplexity API"""
        print("Testing Perplexity API availability...")
        
        # Check rate limiter status
        if not perplexity_rate_limiter.can_make_call():
            wait_time = perplexity_rate_limiter.wait_time()
            print(f"WARNING  Rate limit reached, waiting {wait_time:.2f} seconds...")
            time.sleep(wait_time)
        
        # Test fundamental data for each symbol
        successful_fetches = 0
        for symbol in self.test_symbols[:2]:  # Limit to 2 symbols to avoid rate limits
            print(f"\nTesting fundamental data for {symbol}...")
            try:
                perplexity_rate_limiter.record_call()
                fundamental_data = PerplexityAPIService.get_fundamental_data(symbol)
                
                if fundamental_data:
                    print(f"OK Successfully fetched fundamental data for {symbol}")
                    print(f"   PE Ratio: {fundamental_data.get('pe_ratio', 'N/A')}")
                    print(f"   Sector: {fundamental_data.get('sector', 'N/A')}")
                    print(f"   Market Cap: {fundamental_data.get('market_cap', 'N/A')}")
                    print(f"   Dividend Yield: {fundamental_data.get('dividend_yield', 'N/A')}")
                    successful_fetches += 1
                else:
                    print(f"X No fundamental data returned for {symbol}")
                
                # Add delay to respect rate limits
                time.sleep(1)
                
            except Exception as e:
                print(f"X Error fetching fundamental data for {symbol}: {e}")
        
        self.test_results['fundamental_data']['success_rate'] = successful_fetches / min(len(self.test_symbols), 2)
        print(f"\nFundamental data success rate: {successful_fetches}/{min(len(self.test_symbols), 2)}")
        
        # Test basic market data
        print(f"\nTesting basic market data for RELIANCE...")
        try:
            basic_data = DataEnrichmentService.get_basic_market_data("RELIANCE", "stock")
            if basic_data:
                print("OK Successfully fetched basic market data")
                print(f"   Data keys: {list(basic_data.keys())}")
                self.test_results['fundamental_data']['basic_market_data'] = True
            else:
                print("X No basic market data returned")
                self.test_results['fundamental_data']['basic_market_data'] = False
        except Exception as e:
            print(f"X Basic market data failed: {e}")
            self.test_results['fundamental_data']['basic_market_data'] = False
    
    def test_data_enrichment_service(self):
        """Test the data enrichment service integration"""
        print("Testing data enrichment service...")
        
        # Test asset suggestions
        print("\nTesting asset suggestions...")
        try:
            suggestions = DataEnrichmentService.get_asset_suggestions("REL", "stock")
            if suggestions:
                print(f"OK Found {len(suggestions)} asset suggestions")
                for suggestion in suggestions[:3]:
                    print(f"   - {suggestion.get('symbol', 'N/A')}: {suggestion.get('name', 'N/A')}")
                self.test_results['enrichment_service']['suggestions'] = True
            else:
                print("X No asset suggestions found")
                self.test_results['enrichment_service']['suggestions'] = False
        except Exception as e:
            print(f"X Asset suggestions failed: {e}")
            self.test_results['enrichment_service']['suggestions'] = False
        
        # Test different asset types
        asset_types = ['stock', 'crypto', 'gold']
        for asset_type in asset_types:
            print(f"\nTesting {asset_type} data enrichment...")
            try:
                if asset_type == 'stock':
                    test_data = DataEnrichmentService.get_basic_market_data("TCS", asset_type)
                elif asset_type == 'crypto':
                    test_data = DataEnrichmentService.get_basic_market_data("BTC", asset_type)
                elif asset_type == 'gold':
                    test_data = DataEnrichmentService.get_basic_market_data("GOLD", asset_type)
                
                if test_data:
                    print(f"OK {asset_type.capitalize()} data enrichment working")
                    self.test_results['enrichment_service'][asset_type] = True
                else:
                    print(f"X {asset_type.capitalize()} data enrichment failed")
                    self.test_results['enrichment_service'][asset_type] = False
                
                # Add delay between requests
                time.sleep(0.5)
                
            except Exception as e:
                print(f"X {asset_type.capitalize()} enrichment error: {e}")
                self.test_results['enrichment_service'][asset_type] = False
    
    def test_investment_model_integration(self):
        """Test investment model creation and data population"""
        print("Testing investment model integration...")
        
        # Get or create a test user
        try:
            test_user, created = User.objects.get_or_create(
                email='test@example.com',
                defaults={'username': 'test_data_user'}
            )
            if created:
                print("OK Created test user")
            else:
                print("OK Using existing test user")
        except Exception as e:
            print(f"X Failed to create test user: {e}")
            return
        
        # Test creating and enriching investments
        test_investments = [
            {'symbol': 'RELIANCE', 'asset_type': 'stock', 'name': 'Reliance Industries'},
            {'symbol': 'TCS', 'asset_type': 'stock', 'name': 'Tata Consultancy Services'},
        ]
        
        successful_creations = 0
        for inv_data in test_investments:
            print(f"\nTesting investment creation for {inv_data['symbol']}...")
            try:
                # Create investment
                investment = Investment.objects.create(
                    user=test_user,
                    symbol=inv_data['symbol'],
                    name=inv_data['name'],
                    asset_type=inv_data['asset_type'],
                    quantity=Decimal('10'),
                    average_purchase_price=Decimal('100'),
                    exchange='NSE'
                )
                print(f"OK Created investment: {investment.name}")
                
                # Test data enrichment
                print(f"   Enriching data for {investment.symbol}...")
                enrichment_success = DataEnrichmentService.enrich_investment_data(investment.id)
                
                if enrichment_success:
                    # Refresh from database
                    investment.refresh_from_db()
                    print(f"OK Data enrichment successful")
                    print(f"   Current Price: Rs.{investment.current_price or 'N/A'}")
                    print(f"   PE Ratio: {investment.pe_ratio or 'N/A'}")
                    print(f"   Sector: {investment.sector or 'N/A'}")
                    print(f"   Volume: {investment.volume or 'N/A'}")
                    successful_creations += 1
                else:
                    print(f"X Data enrichment failed")
                
                # Add delay between enrichments
                time.sleep(1)
                
            except Exception as e:
                print(f"X Investment creation/enrichment failed: {e}")
        
        self.test_results['investment_creation']['success_rate'] = successful_creations / len(test_investments)
        print(f"\nInvestment creation success rate: {successful_creations}/{len(test_investments)}")
        
        # Clean up test investments
        try:
            Investment.objects.filter(user=test_user, symbol__in=['RELIANCE', 'TCS']).delete()
            print("OK Cleaned up test investments")
        except Exception as e:
            print(f"WARNING  Failed to clean up test investments: {e}")
    
    def test_rate_limiting_and_errors(self):
        """Test rate limiting and error handling"""
        print("Testing rate limiting and error handling...")
        
        # Test rate limiter status
        print(f"Rate limiter status:")
        print(f"   Can make call: {perplexity_rate_limiter.can_make_call()}")
        print(f"   Calls made: {len(perplexity_rate_limiter.calls)}")
        print(f"   Rate limit: {perplexity_rate_limiter.max_calls} calls per {perplexity_rate_limiter.time_window} seconds")
        
        # Test error handling with invalid symbol
        print("\nTesting error handling with invalid symbol...")
        try:
            invalid_data = get_bharatsm_frontend_data("INVALID_SYMBOL_123")
            if not invalid_data:
                print("OK Invalid symbol handled gracefully (returned empty dict)")
                self.test_results['error_handling'] = True
            else:
                print("WARNING  Invalid symbol returned data (unexpected)")
                self.test_results['error_handling'] = False
        except Exception as e:
            print(f"OK Invalid symbol raised exception (handled): {e}")
            self.test_results['error_handling'] = True
        
        # Test network timeout handling
        print("\nTesting network resilience...")
        try:
            # This should work or fail gracefully
            get_bharatsm_frontend_data("RELIANCE")
            print("OK Network requests are working")
        except Exception as e:
            print(f"WARNING  Network issue detected: {e}")
    
    def print_test_summary(self):
        """Print comprehensive test summary"""
        print("\n" + "=" * 60)
        print(" COMPREHENSIVE TEST SUMMARY")
        print("=" * 60)
        
        # Technical Data Summary
        print("\n Technical Data Service:")
        tech_data = self.test_results['technical_data']
        if tech_data.get('available', False):
            print("    Bharat-sm-data library available")
            print(f"   Market status: {'Working' if tech_data.get('market_status') else 'Failed'}")
            print(f"   Stock data: {tech_data.get('stock_data_success_rate', 0):.0%} success rate")
            print(f"    Search: {'Working' if tech_data.get('search') else 'Failed'}")
            print(f"    Indices: {'Working' if tech_data.get('indices') else 'Failed'}")
        else:
            print("    Bharat-sm-data library not available")
        
        # Fundamental Data Summary
        print("\n Fundamental Data Service:")
        fund_data = self.test_results['fundamental_data']
        print(f"    Success rate: {fund_data.get('success_rate', 0):.0%}")
        print(f"    Basic market data: {'Working' if fund_data.get('basic_market_data') else 'Failed'}")
        
        # Enrichment Service Summary
        print("\n Data Enrichment Service:")
        enrich_data = self.test_results['enrichment_service']
        print(f"    Asset suggestions: {'Working' if enrich_data.get('suggestions') else 'Failed'}")
        print(f"    Stock enrichment: {'Working' if enrich_data.get('stock') else 'Failed'}")
        print(f"    Crypto enrichment: {'Working' if enrich_data.get('crypto') else 'Failed'}")
        print(f"    Gold enrichment: {'Working' if enrich_data.get('gold') else 'Failed'}")
        
        # Investment Model Summary
        print("\n Investment Model Integration:")
        inv_data = self.test_results['investment_creation']
        print(f"    Success rate: {inv_data.get('success_rate', 0):.0%}")
        
        # Overall Assessment
        print("\n OVERALL ASSESSMENT:")
        
        # Calculate overall score
        scores = []
        if tech_data.get('available'):
            scores.append(tech_data.get('stock_data_success_rate', 0))
        scores.append(fund_data.get('success_rate', 0))
        scores.append(inv_data.get('success_rate', 0))
        
        overall_score = sum(scores) / len(scores) if scores else 0
        
        if overall_score >= 0.8:
            print("    EXCELLENT: Data fetching system is working very well!")
        elif overall_score >= 0.6:
            print("    GOOD: Data fetching system is working with minor issues")
        elif overall_score >= 0.4:
            print("     FAIR: Data fetching system has some issues that need attention")
        else:
            print("    POOR: Data fetching system needs significant fixes")
        
        print(f"   Overall Score: {overall_score:.0%}")
        
        # Recommendations
        print("\n RECOMMENDATIONS:")
        if not tech_data.get('available'):
            print("   • Install Bharat-sm-data library: pip install Bharat-sm-data")
        if fund_data.get('success_rate', 0) < 0.5:
            print("   • Check Perplexity API configuration and rate limits")
        if inv_data.get('success_rate', 0) < 0.5:
            print("   • Review investment model data enrichment logic")
        if overall_score >= 0.8:
            print("   • System is ready for production use!")


def main():
    """Run comprehensive data fetching tests"""
    test_suite = ComprehensiveDataTest()
    test_suite.run_all_tests()


if __name__ == "__main__":
    main()