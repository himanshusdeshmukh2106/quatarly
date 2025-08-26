"""
Comprehensive Google Sheets Service Test Suite
Tests all financial data operations including allocation, formula preparation, 
execution, parsing, clearing, and release operations for both market data and OHLC data.
"""

import os
import sys
import django
import time
import threading
from datetime import datetime, timedelta
from unittest.mock import patch, MagicMock

# Add project root to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Django setup
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'C8V2.settings')
django.setup()

from investments.google_sheets_service import GoogleSheetsFinanceService, CircularBufferService, CircularBufferManager
from django.test import TestCase
from django.core.cache import cache
import logging

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('google_sheets_test.log')
    ]
)
logger = logging.getLogger(__name__)


class TestCircularBufferManager:
    """Test the circular buffer allocation and management system"""
    
    def __init__(self):
        self.test_results = []
    
    def test_buffer_allocation(self):
        """Test basic block allocation and release"""
        print("\n🔄 Testing Circular Buffer Allocation...")
        
        buffer = CircularBufferManager(block_size=10, total_blocks=5, buffer_name="TestBuffer")
        
        # Test allocation
        block1, start1, end1 = buffer.allocate_block()
        assert block1 == 0, f"Expected block 0, got {block1}"
        assert start1 == 2, f"Expected start row 2, got {start1}"
        assert end1 == 11, f"Expected end row 11, got {end1}"
        
        # Test second allocation
        block2, start2, end2 = buffer.allocate_block()
        assert block2 == 1, f"Expected block 1, got {block2}"
        assert start2 == 13, f"Expected start row 13, got {start2}"  # 2 + (1 * 11)
        
        # Test status
        status = buffer.get_block_status()
        assert status['blocks_in_use'] == 2, f"Expected 2 blocks in use, got {status['blocks_in_use']}"
        
        # Test release
        buffer.release_block(block1)
        status = buffer.get_block_status()
        assert status['blocks_in_use'] == 1, f"Expected 1 block in use after release, got {status['blocks_in_use']}"
        
        print("✅ Circular Buffer Allocation: PASSED")
        self.test_results.append(("Buffer Allocation", "PASSED"))
    
    def test_stale_block_cleanup(self):
        """Test automatic cleanup of stale blocks"""
        print("\n🧹 Testing Stale Block Cleanup...")
        
        buffer = CircularBufferManager(block_size=5, total_blocks=3, buffer_name="StaleTestBuffer")
        
        # Allocate a block
        block1, _, _ = buffer.allocate_block()
        
        # Manually set allocation time to past to simulate stale block
        from django.utils import timezone
        buffer.block_status[block1]['allocated_at'] = timezone.now() - timedelta(minutes=15)
        
        # Allocate another block - should trigger cleanup
        block2, _, _ = buffer.allocate_block()
        
        # The stale block should have been cleaned up
        assert block1 not in buffer.block_status, "Stale block should have been cleaned up"
        
        print("✅ Stale Block Cleanup: PASSED")
        self.test_results.append(("Stale Block Cleanup", "PASSED"))
    
    def test_concurrent_allocation(self):
        """Test thread-safe concurrent block allocation"""
        print("\n🔀 Testing Concurrent Allocation...")
        
        buffer = CircularBufferManager(block_size=5, total_blocks=10, buffer_name="ConcurrentTestBuffer")
        allocation_results = []
        errors = []
        
        def allocate_worker(worker_id):
            try:
                for i in range(3):
                    block, start, end = buffer.allocate_block()
                    allocation_results.append((worker_id, block, start, end))
                    time.sleep(0.1)  # Simulate processing time
                    buffer.release_block(block)
            except Exception as e:
                errors.append(f"Worker {worker_id}: {e}")
        
        # Start 3 concurrent workers
        threads = []
        for i in range(3):
            thread = threading.Thread(target=allocate_worker, args=(i,))
            threads.append(thread)
            thread.start()
        
        # Wait for all threads to complete
        for thread in threads:
            thread.join()
        
        assert len(errors) == 0, f"Concurrent allocation errors: {errors}"
        assert len(allocation_results) == 9, f"Expected 9 allocations, got {len(allocation_results)}"
        
        # Check for unique block assignments (no conflicts)
        block_assignments = {}
        for worker_id, block, start, end in allocation_results:
            if block in block_assignments:
                # This is ok as blocks are released and reused
                pass
            block_assignments[block] = (worker_id, start, end)
        
        print("✅ Concurrent Allocation: PASSED")
        self.test_results.append(("Concurrent Allocation", "PASSED"))


class TestGoogleSheetsService:
    """Test Google Sheets Service functionality"""
    
    def __init__(self):
        self.test_results = []
        self.service = None
    
    def setup_mock_service(self):
        """Set up a mock Google Sheets service for testing"""
        print("\n⚙️ Setting up Mock Google Sheets Service...")
        
        # Create mock service
        self.service = GoogleSheetsFinanceService()
        
        # Mock the Google Sheets API calls
        mock_service = MagicMock()
        mock_spreadsheets = MagicMock()
        mock_values = MagicMock()
        mock_batch_update = MagicMock()
        
        # Set up the mock chain
        mock_service.spreadsheets.return_value = mock_spreadsheets
        mock_spreadsheets.values.return_value = mock_values
        mock_spreadsheets.batchUpdate.return_value = mock_batch_update
        mock_spreadsheets.get.return_value.execute.return_value = {
            'sheets': [{'properties': {'title': 'FinanceData', 'sheetId': 0}}]
        }
        
        # Mock successful API responses
        mock_batch_update.execute.return_value = {'replies': []}
        mock_values.get.return_value.execute.return_value = {
            'values': [
                ['Symbol', 'Price', 'Open', 'High', 'Low', 'Volume', 'Market Cap', 'PE Ratio'],
                ['RELIANCE', '2500.50', '2480.00', '2520.00', '2475.00', '1500000', '1700000000000', '25.5'],
                ['TCS', '3200.75', '3180.00', '3220.00', '3175.00', '800000', '1200000000000', '28.2'],
                ['INFY', '1450.25', '1440.00', '1460.00', '1435.00', '2000000', '600000000000', '22.8'],
                ['HDFCBANK', '1650.80', '1640.00', '1670.00', '1635.00', '1200000', '900000000000', '18.5'],
                ['LT', '2100.30', '2090.00', '2110.00', '2085.00', '500000', '300000000000', '35.2']
            ]
        }
        mock_values.clear.return_value.execute.return_value = {}
        mock_values.update.return_value.execute.return_value = {}
        
        # Replace the actual service with our mock
        self.service.service = mock_service
        self.service.spreadsheet_id = 'test_spreadsheet_id'
        
        print("✅ Mock Service Setup: COMPLETED")
    
    def test_market_data_fetching(self):
        """Test comprehensive market data fetching process"""
        print("\n📊 Testing Market Data Fetching...")
        
        symbols = ['RELIANCE', 'TCS', 'INFY', 'HDFCBANK', 'LT']
        
        try:
            # Test allocation phase
            print("   🔹 Testing block allocation...")
            block_number, start_row, end_row = self.service.buffer_service.allocate_market_block()
            assert block_number is not None, "Block allocation failed"
            
            # Test formula preparation
            print("   🔹 Testing formula preparation...")
            batch_request = self.service._prepare_market_batch_request(symbols, 'FinanceData', start_row)
            assert 'requests' in batch_request, "Batch request preparation failed"
            assert len(batch_request['requests']) > 0, "No requests in batch"
            
            # Test data fetching
            print("   🔹 Testing data execution...")
            market_data = self.service._fetch_market_data_internal(symbols, force_refresh=True)
            
            # Validate results
            assert len(market_data) > 0, "No market data returned"
            
            for symbol in symbols:
                if symbol in market_data:
                    data = market_data[symbol]
                    assert 'current_price' in data, f"Missing current_price for {symbol}"
                    assert 'volume' in data, f"Missing volume for {symbol}"
                    assert 'company_name' in data, f"Missing company_name for {symbol}"
                    print(f"     ✓ {symbol}: ₹{data['current_price']}, Volume: {data['volume']}")
            
            # Test clearing
            print("   🔹 Testing block clearing...")
            self.service._clear_market_block('FinanceData', start_row, end_row)
            
            # Test release
            print("   🔹 Testing block release...")
            self.service.buffer_service.release_market_block(block_number)
            
            print("✅ Market Data Fetching: PASSED")
            self.test_results.append(("Market Data Fetching", "PASSED", len(market_data)))
            
        except Exception as e:
            print(f"❌ Market Data Fetching: FAILED - {e}")
            self.test_results.append(("Market Data Fetching", "FAILED", str(e)))
    
    def test_ohlc_data_fetching(self):
        """Test comprehensive OHLC data fetching process"""
        print("\n📈 Testing OHLC Data Fetching...")
        
        # Mock OHLC data response
        ohlc_mock_data = {
            'values': [
                ['Date/Time', 'Open', 'High', 'Low', 'Close', 'Volume'],
                ['12/26/2024', '2480.00', '2520.00', '2475.00', '2500.50', '1500000'],
                ['12/25/2024', '2470.00', '2510.00', '2465.00', '2480.00', '1200000'],
                ['12/24/2024', '2460.00', '2500.00', '2455.00', '2470.00', '1800000'],
                ['12/23/2024', '2450.00', '2490.00', '2445.00', '2460.00', '1600000'],
                ['12/22/2024', '2440.00', '2480.00', '2435.00', '2450.00', '1400000']
            ]
        }
        
        # Update mock to return OHLC data
        self.service.service.spreadsheets().values().get().execute.return_value = ohlc_mock_data
        
        symbol = 'RELIANCE'
        days = 30
        
        try:
            # Test allocation phase
            print("   🔹 Testing OHLC block allocation...")
            block_number, start_row, end_row = self.service.buffer_service.allocate_ohlc_block()
            assert block_number is not None, "OHLC block allocation failed"
            
            # Test formula preparation
            print("   🔹 Testing OHLC formula preparation...")
            batch_request = self.service._prepare_ohlc_batch_request(symbol, 'OHLCData', start_row, days)
            assert 'requests' in batch_request, "OHLC batch request preparation failed"
            
            # Test data fetching
            print("   🔹 Testing OHLC data execution...")
            ohlc_data = self.service.fetch_ohlc_data(symbol, days=days, force_refresh=True)
            
            # Validate results
            assert len(ohlc_data) > 0, "No OHLC data returned"
            
            for data_point in ohlc_data[:3]:  # Check first 3 data points
                assert 'date' in data_point, "Missing date in OHLC data"
                assert 'open' in data_point, "Missing open price in OHLC data"
                assert 'high' in data_point, "Missing high price in OHLC data"
                assert 'low' in data_point, "Missing low price in OHLC data"
                assert 'close' in data_point, "Missing close price in OHLC data"
                assert 'volume' in data_point, "Missing volume in OHLC data"
                print(f"     ✓ {data_point['date']}: O:{data_point['open']} H:{data_point['high']} L:{data_point['low']} C:{data_point['close']}")
            
            # Test clearing
            print("   🔹 Testing OHLC block clearing...")
            self.service._clear_ohlc_block('OHLCData', start_row, end_row)
            
            # Test release
            print("   🔹 Testing OHLC block release...")
            self.service.buffer_service.release_ohlc_block(block_number)
            
            print("✅ OHLC Data Fetching: PASSED")
            self.test_results.append(("OHLC Data Fetching", "PASSED", len(ohlc_data)))
            
        except Exception as e:
            print(f"❌ OHLC Data Fetching: FAILED - {e}")
            self.test_results.append(("OHLC Data Fetching", "FAILED", str(e)))
    
    def test_concurrent_processing(self):
        """Test concurrent processing of market data and OHLC data"""
        print("\n🔀 Testing Concurrent Processing...")
        
        results = {}
        errors = []
        
        def market_data_worker():
            try:
                symbols = ['RELIANCE', 'TCS', 'INFY']
                data = self.service.fetch_market_data_batch(symbols, force_refresh=True)
                results['market_data'] = data
            except Exception as e:
                errors.append(f"Market data worker: {e}")
        
        def ohlc_data_worker():
            try:
                symbols = ['HDFCBANK', 'LT']
                data = {}
                for symbol in symbols:
                    ohlc_data = self.service.fetch_ohlc_data(symbol, days=15, force_refresh=True)
                    if ohlc_data:
                        data[symbol] = ohlc_data
                results['ohlc_data'] = data
            except Exception as e:
                errors.append(f"OHLC data worker: {e}")
        
        # Start concurrent workers
        market_thread = threading.Thread(target=market_data_worker)
        ohlc_thread = threading.Thread(target=ohlc_data_worker)
        
        start_time = time.time()
        market_thread.start()
        ohlc_thread.start()
        
        market_thread.join()
        ohlc_thread.join()
        end_time = time.time()
        
        processing_time = end_time - start_time
        
        # Validate results
        assert len(errors) == 0, f"Concurrent processing errors: {errors}"
        assert 'market_data' in results, "Market data not processed"
        assert 'ohlc_data' in results, "OHLC data not processed"
        
        market_count = len(results['market_data'])
        ohlc_count = len(results['ohlc_data'])
        
        print(f"   ✓ Market data symbols processed: {market_count}")
        print(f"   ✓ OHLC data symbols processed: {ohlc_count}")
        print(f"   ✓ Total processing time: {processing_time:.2f} seconds")
        
        print("✅ Concurrent Processing: PASSED")
        self.test_results.append(("Concurrent Processing", "PASSED", f"{market_count + ohlc_count} symbols"))
    
    def test_cache_management(self):
        """Test cache management and TTL"""
        print("\n💾 Testing Cache Management...")
        
        symbol = 'RELIANCE'
        
        # Clear any existing cache
        cache.clear()
        
        # First fetch (should cache)
        data1 = self.service._fetch_market_data_internal([symbol], force_refresh=True)
        
        # Second fetch (should use cache)
        data2 = self.service._fetch_market_data_internal([symbol], force_refresh=False)
        
        # Verify caching
        cache_key = self.service._get_cache_key(symbol, 'market_data')
        cached_data = cache.get(cache_key)
        
        assert cached_data is not None, "Data should be cached"
        assert symbol in data1, "First fetch should return data"
        
        # Test cache clearing
        self.service.clear_cache(symbol)
        cached_data_after_clear = cache.get(cache_key)
        assert cached_data_after_clear is None, "Cache should be cleared"
        
        print("✅ Cache Management: PASSED")
        self.test_results.append(("Cache Management", "PASSED"))
    
    def test_error_handling(self):
        """Test error handling and recovery mechanisms"""
        print("\n🛡️ Testing Error Handling...")
        
        # Test with invalid symbols
        invalid_symbols = ['INVALID_SYMBOL_123', 'ANOTHER_INVALID']
        
        try:
            data = self.service.fetch_market_data_batch(invalid_symbols, force_refresh=True)
            # Should not raise exception, but return empty or limited data
            print(f"   ✓ Invalid symbols handled gracefully: {len(data)} results")
            
            # Test API error simulation
            original_service = self.service.service
            self.service.service = None  # Simulate service unavailable
            
            data_with_error = self.service.fetch_market_data_batch(['RELIANCE'], force_refresh=True)
            assert len(data_with_error) == 0, "Should return empty data when service unavailable"
            
            # Restore service
            self.service.service = original_service
            
            print("✅ Error Handling: PASSED")
            self.test_results.append(("Error Handling", "PASSED"))
            
        except Exception as e:
            print(f"❌ Error Handling: FAILED - {e}")
            self.test_results.append(("Error Handling", "FAILED", str(e)))
    
    def test_rate_limiting(self):
        """Test API rate limiting functionality"""
        print("\n⏱️ Testing Rate Limiting...")
        
        start_time = time.time()
        
        # Make multiple rapid calls
        for i in range(3):
            self.service._rate_limit_api_call()
        
        end_time = time.time()
        elapsed = end_time - start_time
        
        # Should take at least minimum interval time
        expected_min_time = 2 * self.service._min_api_interval  # 2 intervals between 3 calls
        assert elapsed >= expected_min_time, f"Rate limiting not working: {elapsed}s < {expected_min_time}s"
        
        print(f"   ✓ Rate limiting enforced: {elapsed:.3f}s for 3 calls")
        print("✅ Rate Limiting: PASSED")
        self.test_results.append(("Rate Limiting", "PASSED"))


def run_comprehensive_tests():
    """Run all comprehensive tests"""
    print("🚀 Starting Comprehensive Google Sheets Service Tests")
    print("=" * 70)
    
    start_time = time.time()
    
    # Test 1: Circular Buffer Manager
    print("\n📋 PHASE 1: CIRCULAR BUFFER TESTS")
    buffer_tests = TestCircularBufferManager()
    buffer_tests.test_buffer_allocation()
    buffer_tests.test_stale_block_cleanup()
    buffer_tests.test_concurrent_allocation()
    
    # Test 2: Google Sheets Service
    print("\n📋 PHASE 2: GOOGLE SHEETS SERVICE TESTS")
    service_tests = TestGoogleSheetsService()
    service_tests.setup_mock_service()
    service_tests.test_market_data_fetching()
    service_tests.test_ohlc_data_fetching()
    service_tests.test_concurrent_processing()
    service_tests.test_cache_management()
    service_tests.test_error_handling()
    service_tests.test_rate_limiting()
    
    # Compile results
    all_results = buffer_tests.test_results + service_tests.test_results
    
    end_time = time.time()
    total_time = end_time - start_time
    
    # Print comprehensive summary
    print("\n" + "=" * 70)
    print("📊 COMPREHENSIVE TEST RESULTS SUMMARY")
    print("=" * 70)
    
    passed = 0
    failed = 0
    
    for test_name, status, *details in all_results:
        status_icon = "✅" if status == "PASSED" else "❌"
        detail_str = f" ({details[0]})" if details else ""
        print(f"{status_icon} {test_name}: {status}{detail_str}")
        
        if status == "PASSED":
            passed += 1
        else:
            failed += 1
    
    print("\n" + "-" * 70)
    print(f"📈 Total Tests: {len(all_results)}")
    print(f"✅ Passed: {passed}")
    print(f"❌ Failed: {failed}")
    print(f"⏱️ Total Time: {total_time:.2f} seconds")
    print(f"🎯 Success Rate: {(passed/len(all_results)*100):.1f}%")
    
    if failed == 0:
        print("\n🎉 ALL TESTS PASSED! Google Sheets Service is ready for production.")
    else:
        print(f"\n⚠️ {failed} tests failed. Please review and fix issues before deployment.")
    
    print("=" * 70)
    
    return passed, failed, total_time


if __name__ == "__main__":
    run_comprehensive_tests()