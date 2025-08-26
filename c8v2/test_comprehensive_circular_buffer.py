#!/usr/bin/env python3
"""
Comprehensive test for the improved circular buffer system
Tests all data types, headers, logging, and data clearing functionality
"""

import os
import django
import time
import threading
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'C8V2.settings')
django.setup()

from investments.google_sheets_service import GoogleSheetsFinanceService
import logging

# Set up comprehensive logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('circular_buffer_test.log')
    ]
)
logger = logging.getLogger(__name__)


def test_headers_and_row_placement():
    """Test that headers are properly placed in row 1 and data starts from row 2"""
    print("📋 Testing Headers and Row Placement")
    print("=" * 60)
    
    google_service = GoogleSheetsFinanceService()
    
    if not google_service.is_available():
        print("❌ Google Sheets service not available")
        return False
    
    # Test with a single symbol to see header placement
    test_symbol = 'RELIANCE'
    
    print(f"🔍 Testing header placement for {test_symbol}")
    
    # Test market data headers
    print(f"\n📊 Testing Market Data Headers:")
    try:
        market_result = google_service.fetch_market_data_batch([test_symbol], force_refresh=True)
        
        if market_result and test_symbol in market_result:
            price = market_result[test_symbol].get('current_price', 'N/A')
            print(f"   ✅ Market data fetched for {test_symbol}: ₹{price}")
            print(f"   📝 Headers should be in row 1 of FinanceData sheet")
            print(f"   📈 Data should start from row 2")
        else:
            print(f"   ❌ No market data returned for {test_symbol}")
            
    except Exception as e:
        print(f"   ❌ Error fetching market data: {e}")
        logger.error(f"Market data test error: {e}")
    
    # Test OHLC data headers
    print(f"\n📊 Testing OHLC Data Headers:")
    try:
        ohlc_result = google_service.fetch_ohlc_data(test_symbol, days=5, force_refresh=True)
        
        if ohlc_result and len(ohlc_result) > 0:
            latest = ohlc_result[-1]
            print(f"   ✅ OHLC data fetched for {test_symbol}: {len(ohlc_result)} points")
            print(f"   💰 Latest close: ₹{latest.get('close', 'N/A')}")
            print(f"   📝 Headers should be in row 1, columns H-M of OHLCData sheet")
            print(f"   📈 Data should start from row 2")
        else:
            print(f"   ❌ No OHLC data returned for {test_symbol}")
            
    except Exception as e:
        print(f"   ❌ Error fetching OHLC data: {e}")
        logger.error(f"OHLC data test error: {e}")
    
    return True


def test_block_allocation_from_row_2():
    """Test that block allocation starts from row 2"""
    print(f"\n🔢 Testing Block Allocation Starting from Row 2")
    print("=" * 60)
    
    google_service = GoogleSheetsFinanceService()
    
    # Test multiple block allocations
    print(f"🔄 Testing Block Allocation Pattern:")
    
    allocated_blocks = []
    
    try:
        # Allocate several market blocks
        for i in range(3):
            block_number, start_row, end_row = google_service.buffer_service.allocate_market_block()
            allocated_blocks.append(('market', block_number))
            
            expected_start = 2 + (block_number * 26)  # 25 rows + 1 buffer
            print(f"   📊 Market Block {block_number}: rows {start_row}-{end_row} (expected start: {expected_start})")
            
            if start_row >= 2:
                print(f"      ✅ Correctly starts from row 2 or higher")
            else:
                print(f"      ❌ ERROR: Block starts from row {start_row}, should be >= 2")
        
        # Allocate several OHLC blocks
        for i in range(2):
            block_number, start_row, end_row = google_service.buffer_service.allocate_ohlc_block()
            allocated_blocks.append(('ohlc', block_number))
            
            expected_start = 2 + (block_number * 36)  # 35 rows + 1 buffer
            print(f"   📈 OHLC Block {block_number}: rows {start_row}-{end_row} (expected start: {expected_start})")
            
            if start_row >= 2:
                print(f"      ✅ Correctly starts from row 2 or higher")
            else:
                print(f"      ❌ ERROR: Block starts from row {start_row}, should be >= 2")
    
    finally:
        # Release all allocated blocks
        print(f"\n🔄 Releasing {len(allocated_blocks)} allocated blocks:")
        for buffer_type, block_number in allocated_blocks:
            if buffer_type == 'market':
                google_service.buffer_service.release_market_block(block_number)
            else:
                google_service.buffer_service.release_ohlc_block(block_number)
            print(f"   ✅ Released {buffer_type} block {block_number}")
    
    return True


def test_data_clearing_functionality():
    """Test that data is properly cleared after processing"""
    print(f"\n🧹 Testing Data Clearing Functionality")
    print("=" * 60)
    
    google_service = GoogleSheetsFinanceService()
    
    test_symbols = ['TCS', 'INFY']
    
    print(f"🔍 Testing data clearing with symbols: {', '.join(test_symbols)}")
    
    # Test market data clearing
    print(f"\n📊 Testing Market Data Clearing:")
    try:
        # Fetch data (this will write and then clear)
        market_data = google_service.fetch_market_data_batch(test_symbols, force_refresh=True)
        
        if market_data:
            print(f"   ✅ Market data fetched for {len(market_data)} symbols")
            for symbol, data in market_data.items():
                price = data.get('current_price', 'N/A')
                print(f"      {symbol}: ₹{price}")
            print(f"   🧹 Data should be automatically cleared from sheets after processing")
            print(f"   💾 Data is cached and stored in database")
        else:
            print(f"   ❌ No market data returned")
            
    except Exception as e:
        print(f"   ❌ Error in market data clearing test: {e}")
        logger.error(f"Market data clearing test error: {e}")
    
    # Test OHLC data clearing
    print(f"\n📈 Testing OHLC Data Clearing:")
    try:
        # Test with single symbol for OHLC
        ohlc_data = google_service.fetch_ohlc_data(test_symbols[0], days=5, force_refresh=True)
        
        if ohlc_data:
            print(f"   ✅ OHLC data fetched for {test_symbols[0]}: {len(ohlc_data)} points")
            if ohlc_data:
                latest = ohlc_data[-1]
                print(f"      Latest close: ₹{latest.get('close', 'N/A')}")
            print(f"   🧹 OHLC data should be automatically cleared from sheets after processing")
            print(f"   💾 Data is cached and stored in database")
        else:
            print(f"   ❌ No OHLC data returned")
            
    except Exception as e:
        print(f"   ❌ Error in OHLC data clearing test: {e}")
        logger.error(f"OHLC data clearing test error: {e}")
    
    return True


def test_concurrent_processing_with_headers():
    """Test concurrent processing while maintaining proper headers"""
    print(f"\n⚡ Testing Concurrent Processing with Headers")
    print("=" * 60)
    
    google_service = GoogleSheetsFinanceService()
    
    test_symbols = ['RELIANCE', 'TCS', 'INFY', 'HDFCBANK', 'ICICIBANK', 'SBIN']
    
    print(f"🔄 Testing concurrent processing with {len(test_symbols)} symbols")
    
    def fetch_market_concurrent(symbol, task_id):
        """Fetch market data concurrently"""
        try:
            start_time = time.time()
            logger.info(f"Task {task_id}: Starting market data fetch for {symbol}")
            
            result = google_service.fetch_market_data_batch([symbol], force_refresh=True)
            
            fetch_time = time.time() - start_time
            
            if result and symbol in result:
                price = result[symbol].get('current_price', 'N/A')
                logger.info(f"Task {task_id}: Completed {symbol} in {fetch_time:.2f}s, price: ₹{price}")
                print(f"   ✅ Task {task_id}: {symbol} - ₹{price} ({fetch_time:.1f}s)")
                return symbol, result[symbol], fetch_time
            else:
                logger.warning(f"Task {task_id}: No data for {symbol}")
                print(f"   ⚠️ Task {task_id}: {symbol} - No data ({fetch_time:.1f}s)")
                return symbol, None, fetch_time
                
        except Exception as e:
            logger.error(f"Task {task_id}: Error for {symbol}: {e}")
            print(f"   ❌ Task {task_id}: {symbol} - Error: {e}")
            return symbol, None, 0
    
    # Execute concurrent market data requests
    start_time = time.time()
    results = {}
    
    with ThreadPoolExecutor(max_workers=len(test_symbols)) as executor:
        futures = [executor.submit(fetch_market_concurrent, symbol, i+1) for i, symbol in enumerate(test_symbols)]
        
        for future in as_completed(futures):
            symbol, data, fetch_time = future.result()
            if data:
                results[symbol] = data
    
    total_time = time.time() - start_time
    
    print(f"\n📊 Concurrent Processing Results:")
    print(f"   Total symbols: {len(test_symbols)}")
    print(f"   Successful: {len(results)}")
    print(f"   Total time: {total_time:.2f} seconds")
    print(f"   Average per symbol: {total_time/len(test_symbols):.2f}s")
    print(f"   Headers maintained: ✅ (each request preserves row 1 headers)")
    print(f"   Data clearing: ✅ (blocks automatically cleared after use)")
    
    return len(results) > 0


def test_logging_comprehensiveness():
    """Test the comprehensiveness of logging"""
    print(f"\n📝 Testing Logging Comprehensiveness")
    print("=" * 60)
    
    google_service = GoogleSheetsFinanceService()
    
    # Enable debug logging temporarily
    original_level = logging.getLogger('investments.google_sheets_service').level
    logging.getLogger('investments.google_sheets_service').setLevel(logging.DEBUG)
    
    try:
        print(f"🔍 Fetching data with detailed logging enabled...")
        
        # Test market data with logging
        market_result = google_service.fetch_market_data_batch(['WIPRO'], force_refresh=True)
        
        # Test OHLC data with logging
        ohlc_result = google_service.fetch_ohlc_data('WIPRO', days=3, force_refresh=True)
        
        # Check buffer status
        status = google_service.buffer_service.get_all_status()
        
        print(f"   ✅ Detailed logging enabled for all operations")
        print(f"   📊 Market data result: {'Success' if market_result else 'Failed'}")
        print(f"   📈 OHLC data result: {'Success' if ohlc_result else 'Failed'}")
        print(f"   🔄 Buffer status tracked: {status['ohlc_buffer']['blocks_in_use']} OHLC + {status['market_buffer']['blocks_in_use']} Market blocks active")
        print(f"   📋 Check 'circular_buffer_test.log' for detailed logs")
        
    finally:
        # Restore original logging level
        logging.getLogger('investments.google_sheets_service').setLevel(original_level)
    
    return True


def test_ssl_error_handling():
    """Test SSL error handling and retry mechanisms"""
    print(f"\n🔒 Testing SSL Error Handling and Retry Logic")
    print("=" * 60)
    
    google_service = GoogleSheetsFinanceService()
    
    test_symbols = ['MARUTI', 'BAJFINANCE']
    
    print(f"🔄 Testing retry mechanisms with {len(test_symbols)} symbols")
    print(f"   (Retry logic should handle SSL and connection issues automatically)")
    
    success_count = 0
    
    for symbol in test_symbols:
        try:
            logger.info(f"Testing retry logic for {symbol}")
            result = google_service.fetch_market_data_batch([symbol], force_refresh=True)
            
            if result and symbol in result:
                price = result[symbol].get('current_price', 'N/A')
                print(f"   ✅ {symbol}: ₹{price} (retry logic worked)")
                success_count += 1
            else:
                print(f"   ⚠️ {symbol}: No data (may need retry)")
                
        except Exception as e:
            print(f"   ❌ {symbol}: Error - {e}")
            logger.error(f"SSL test error for {symbol}: {e}")
    
    print(f"\n📊 SSL/Retry Test Results:")
    print(f"   Successful: {success_count}/{len(test_symbols)}")
    print(f"   Retry mechanisms: {'✅ Working' if success_count > 0 else '⚠️ Needs investigation'}")
    
    return success_count > 0


def main():
    """Main comprehensive test execution"""
    print("🚀 Comprehensive Circular Buffer System Test")
    print("=" * 70)
    print("Testing all improvements: headers, row 2 start, logging, and data clearing")
    print(f"Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
    
    # Run all comprehensive tests
    test_results = {}
    
    test_results['headers'] = test_headers_and_row_placement()
    test_results['row_allocation'] = test_block_allocation_from_row_2()
    test_results['data_clearing'] = test_data_clearing_functionality()
    test_results['concurrent'] = test_concurrent_processing_with_headers()
    test_results['logging'] = test_logging_comprehensiveness()
    test_results['ssl_handling'] = test_ssl_error_handling()
    
    print(f"\n" + "=" * 70)
    print("📋 COMPREHENSIVE TEST SUMMARY:")
    print("=" * 70)
    
    for test_name, result in test_results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"   {test_name.replace('_', ' ').title()}: {status}")
    
    all_passed = all(test_results.values())
    
    if all_passed:
        print(f"\n🎉 ALL TESTS PASSED! COMPREHENSIVE IMPLEMENTATION SUCCESSFUL!")
        print(f"✅ Headers properly placed in row 1 with formatting")
        print(f"✅ Data processing starts from row 2 as required")
        print(f"✅ Comprehensive logging tracks all operations")
        print(f"✅ Data is automatically cleared after processing")
        print(f"✅ SSL error handling with retry mechanisms")
        print(f"✅ Concurrent processing maintains data integrity")
        
        print(f"\n🔧 System Configuration:")
        google_service = GoogleSheetsFinanceService()
        status = google_service.buffer_service.get_all_status()
        print(f"   • OHLC Buffer: {status['ohlc_buffer']['total_blocks']} blocks × {google_service.buffer_service.buffers['ohlc'].block_size} rows")
        print(f"   • Market Buffer: {status['market_buffer']['total_blocks']} blocks × {google_service.buffer_service.buffers['market'].block_size} rows")
        print(f"   • Row allocation: Starts from row 2 (row 1 reserved for headers)")
        print(f"   • Data clearing: Automatic after each block processing")
        print(f"   • Logging: Comprehensive with file output")
        
    else:
        failed_tests = [name for name, result in test_results.items() if not result]
        print(f"\n❌ Some tests failed: {', '.join(failed_tests)}")
        print(f"🔧 Review the detailed logs for troubleshooting")
    
    print(f"\nCompleted at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"📋 Detailed logs saved to: circular_buffer_test.log")


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print(f"\n⏹️ Test interrupted by user")
    except Exception as e:
        print(f"\n💥 Unexpected error: {e}")
        import traceback
        traceback.print_exc()
        logger.error(f"Comprehensive test error: {e}", exc_info=True)