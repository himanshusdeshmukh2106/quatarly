#!/usr/bin/env python3
"""
Test single sheet functionality after multi-sheet removal
Verifies that the circular buffer and basic Google Sheets operations still work correctly
"""

import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'C8V2.settings')
django.setup()

from investments.google_sheets_service import google_sheets_service
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def test_service_initialization():
    """Test that the Google Sheets service initializes correctly"""
    print("🔧 Testing Google Sheets Service Initialization")
    print("=" * 60)
    
    # Check if service is available
    if google_sheets_service.is_available():
        print("✅ Google Sheets service is available")
        print(f"   Spreadsheet ID: {google_sheets_service.spreadsheet_id[:20] + '...' if google_sheets_service.spreadsheet_id else 'None'}")
        return True
    else:
        print("❌ Google Sheets service is not available")
        return False


def test_circular_buffer_system():
    """Test the circular buffer system"""
    print("\n🔄 Testing Circular Buffer System")
    print("=" * 60)
    
    try:
        # Test market data buffer allocation
        print("📊 Testing market data buffer allocation:")
        block_num, start_row, end_row = google_sheets_service.buffer_service.allocate_market_block()
        print(f"   Allocated market block {block_num}: rows {start_row}-{end_row}")
        
        # Test OHLC buffer allocation
        print("📈 Testing OHLC data buffer allocation:")
        ohlc_block_num, ohlc_start_row, ohlc_end_row = google_sheets_service.buffer_service.allocate_ohlc_block()
        print(f"   Allocated OHLC block {ohlc_block_num}: rows {ohlc_start_row}-{ohlc_end_row}")
        
        # Get buffer status
        print("📋 Buffer status:")
        status = google_sheets_service.buffer_service.get_all_status()
        print(f"   Market buffer: {status['market_buffer']['blocks_in_use']}/{status['market_buffer']['total_blocks']} blocks in use")
        print(f"   OHLC buffer: {status['ohlc_buffer']['blocks_in_use']}/{status['ohlc_buffer']['total_blocks']} blocks in use")
        
        # Release blocks
        google_sheets_service.buffer_service.release_market_block(block_num)
        google_sheets_service.buffer_service.release_ohlc_block(ohlc_block_num)
        print("✅ Circular buffer system working correctly")
        
        return True
        
    except Exception as e:
        print(f"❌ Circular buffer test failed: {e}")
        return False


def test_basic_market_data_fetch():
    """Test basic market data fetching functionality"""
    print("\n📊 Testing Basic Market Data Fetch")
    print("=" * 60)
    
    if not google_sheets_service.is_available():
        print("⚠️ Skipping market data test - service not available")
        return False
    
    try:
        # Test with a small set of symbols
        test_symbols = ['RELIANCE', 'TCS']
        print(f"   Testing with symbols: {test_symbols}")
        
        # Fetch market data (this should use the circular buffer)
        result = google_sheets_service.fetch_market_data_batch(test_symbols)
        
        if result:
            print(f"✅ Market data fetch successful for {len(result)} symbols")
            for symbol in test_symbols:
                if symbol in result:
                    data = result[symbol]
                    print(f"   {symbol}: Price={data.get('current_price', 'N/A')}, Volume={data.get('volume', 'N/A')}")
                else:
                    print(f"   {symbol}: No data returned")
            return True
        else:
            print("⚠️ Market data fetch returned empty result")
            return False
            
    except Exception as e:
        print(f"❌ Market data fetch failed: {e}")
        return False


def test_worksheet_configuration():
    """Test worksheet configuration"""
    print("\n📋 Testing Worksheet Configuration")
    print("=" * 60)
    
    try:
        worksheets = google_sheets_service.worksheets
        print("   Configured worksheets:")
        for key, value in worksheets.items():
            print(f"     {key}: {value}")
        
        print(f"   Default worksheet: {google_sheets_service.worksheet_name}")
        print("✅ Worksheet configuration looks correct")
        return True
        
    except Exception as e:
        print(f"❌ Worksheet configuration test failed: {e}")
        return False


def main():
    """Run all tests"""
    print("🧪 Single Sheet Functionality Test Suite")
    print("="*70)
    
    tests = [
        ("Service Initialization", test_service_initialization),
        ("Circular Buffer System", test_circular_buffer_system),
        ("Worksheet Configuration", test_worksheet_configuration),
        ("Basic Market Data Fetch", test_basic_market_data_fetch),
    ]
    
    results = {}
    for test_name, test_func in tests:
        try:
            results[test_name] = test_func()
        except Exception as e:
            print(f"❌ {test_name} failed with error: {e}")
            results[test_name] = False
    
    # Summary
    print("\n📊 Test Summary")
    print("=" * 60)
    passed = sum(results.values())
    total = len(results)
    
    for test_name, result in results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"   {test_name}: {status}")
    
    print(f"\n🎯 Overall: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! Single sheet functionality is working correctly.")
    else:
        print("⚠️ Some tests failed. Check the output above for details.")
    
    return passed == total


if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)