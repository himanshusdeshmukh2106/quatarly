"""
Test Optimized OHLC Historical Data Fetching
Tests the enhanced historical data function that fetches 30 days together
"""

import os
import sys
import django
import time
from unittest.mock import patch, MagicMock

# Add project root to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Django setup
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'C8V2.settings')
django.setup()

from investments.google_sheets_service import GoogleSheetsFinanceService


def test_historical_ohlc_fetching():
    """Test the optimized historical OHLC data fetching"""
    print("🚀 Testing Optimized Historical OHLC Data Fetching")
    print("=" * 60)
    
    # Create service instance
    service = GoogleSheetsFinanceService()
    
    # Mock the Google Sheets API
    mock_service = MagicMock()
    mock_spreadsheets = MagicMock()
    mock_values = MagicMock()
    mock_batch_update = MagicMock()
    
    # Set up the mock chain
    mock_service.spreadsheets.return_value = mock_spreadsheets
    mock_spreadsheets.values.return_value = mock_values
    mock_spreadsheets.batchUpdate.return_value = mock_batch_update
    mock_spreadsheets.get.return_value.execute.return_value = {
        'sheets': [
            {'properties': {'title': 'FinanceData', 'sheetId': 0}},
            {'properties': {'title': 'OHLCData', 'sheetId': 1027862846}}  # Your specific gid
        ]
    }
    
    # Mock successful API responses
    mock_batch_update.execute.return_value = {'replies': []}
    
    # Create realistic historical OHLC mock data (Google Finance "all" format)
    # Google Finance returns: Date, Close, High, Low, Open, Volume
    historical_mock_data = {
        'values': [
            # 30 days of historical data
            ['12/27/2024', '2500.50', '2520.00', '2475.00', '2480.00', '1500000'],
            ['12/26/2024', '2480.00', '2510.00', '2465.00', '2470.00', '1200000'],
            ['12/25/2024', '2470.00', '2500.00', '2455.00', '2460.00', '1800000'],
            ['12/24/2024', '2460.00', '2490.00', '2445.00', '2450.00', '1600000'],
            ['12/23/2024', '2450.00', '2480.00', '2435.00', '2440.00', '1400000'],
            ['12/22/2024', '2440.00', '2470.00', '2425.00', '2430.00', '1300000'],
            ['12/21/2024', '2430.00', '2460.00', '2415.00', '2420.00', '1100000'],
            ['12/20/2024', '2420.00', '2450.00', '2405.00', '2410.00', '1000000'],
            ['12/19/2024', '2410.00', '2440.00', '2395.00', '2400.00', '900000'],
            ['12/18/2024', '2400.00', '2430.00', '2385.00', '2390.00', '800000'],
            ['12/17/2024', '2390.00', '2420.00', '2375.00', '2380.00', '700000'],
            ['12/16/2024', '2380.00', '2410.00', '2365.00', '2370.00', '600000'],
            ['12/15/2024', '2370.00', '2400.00', '2355.00', '2360.00', '500000'],
            ['12/14/2024', '2360.00', '2390.00', '2345.00', '2350.00', '450000'],
            ['12/13/2024', '2350.00', '2380.00', '2335.00', '2340.00', '400000'],
            ['12/12/2024', '2340.00', '2370.00', '2325.00', '2330.00', '350000'],
            ['12/11/2024', '2330.00', '2360.00', '2315.00', '2320.00', '300000'],
            ['12/10/2024', '2320.00', '2350.00', '2305.00', '2310.00', '250000'],
            ['12/09/2024', '2310.00', '2340.00', '2295.00', '2300.00', '200000'],
            ['12/08/2024', '2300.00', '2330.00', '2285.00', '2290.00', '180000'],
            ['12/07/2024', '2290.00', '2320.00', '2275.00', '2280.00', '160000'],
            ['12/06/2024', '2280.00', '2310.00', '2265.00', '2270.00', '140000'],
            ['12/05/2024', '2270.00', '2300.00', '2255.00', '2260.00', '120000'],
            ['12/04/2024', '2260.00', '2290.00', '2245.00', '2250.00', '100000'],
            ['12/03/2024', '2250.00', '2280.00', '2235.00', '2240.00', '90000'],
            ['12/02/2024', '2240.00', '2270.00', '2225.00', '2230.00', '80000'],
            ['12/01/2024', '2230.00', '2260.00', '2215.00', '2220.00', '70000'],
            ['11/30/2024', '2220.00', '2250.00', '2205.00', '2210.00', '60000'],
            ['11/29/2024', '2210.00', '2240.00', '2195.00', '2200.00', '50000'],
            ['11/28/2024', '2200.00', '2230.00', '2185.00', '2190.00', '40000']
        ]
    }
    
    mock_values.get.return_value.execute.return_value = historical_mock_data
    mock_values.clear.return_value.execute.return_value = {}
    
    # Replace the actual service with our mock
    service.service = mock_service
    service.spreadsheet_id = 'test_historical_spreadsheet_id'
    
    print(f"📊 Mock historical data prepared with {len(historical_mock_data['values'])} days")
    
    # Test single symbol OHLC fetch
    print("\n🔍 Testing Single Symbol Historical OHLC Fetch...")
    symbol = 'RELIANCE'
    days = 30
    
    start_time = time.time()
    ohlc_data = service.fetch_ohlc_data(symbol, days=days, force_refresh=True)
    fetch_time = time.time() - start_time
    
    print(f"   📈 OHLC data returned: {len(ohlc_data)} data points")
    print(f"   ⏱️ Fetch time: {fetch_time:.2f} seconds")
    
    if ohlc_data:
        print("   ✅ Successfully parsed historical OHLC data:")
        for i, data_point in enumerate(ohlc_data[:5]):  # Show first 5
            print(f"      {i+1}. {data_point['date']}: O:{data_point['open']} H:{data_point['high']} L:{data_point['low']} C:{data_point['close']} V:{data_point['volume']}")
        
        # Validate data quality
        for data_point in ohlc_data:
            assert data_point['open'] > 0, f"Invalid open price: {data_point['open']}"
            assert data_point['high'] >= data_point['low'], f"High < Low: {data_point}"
            assert data_point['close'] > 0, f"Invalid close price: {data_point['close']}"
            assert data_point['volume'] >= 0, f"Invalid volume: {data_point['volume']}"
        
        print("   ✅ Data quality validation passed")
        single_success = True
    else:
        print("   ❌ No historical OHLC data parsed")
        single_success = False
    
    # Test batch OHLC fetch
    print("\n🔍 Testing Batch Historical OHLC Fetch...")
    symbols = ['RELIANCE', 'TCS', 'INFY', 'HDFCBANK', 'LT']
    
    start_time = time.time()
    batch_data = service.fetch_ohlc_data_batch(symbols, force_refresh=True)
    batch_time = time.time() - start_time
    
    print(f"   📈 Batch OHLC data returned: {len(batch_data)} symbols")
    print(f"   ⏱️ Batch fetch time: {batch_time:.2f} seconds")
    print(f"   🚀 Efficiency: {len(symbols)/batch_time:.1f} symbols/second")
    
    if batch_data:
        for symbol, data in batch_data.items():
            print(f"      {symbol}: {len(data)} data points")
        batch_success = True
    else:
        print("   ❌ No batch historical OHLC data returned")
        batch_success = False
    
    # Test performance comparison
    print("\n📊 Performance Analysis:")
    estimated_individual_time = fetch_time * len(symbols)
    efficiency_gain = estimated_individual_time / batch_time if batch_time > 0 else 0
    print(f"   Individual fetch time (estimated): {estimated_individual_time:.2f}s")
    print(f"   Batch fetch time: {batch_time:.2f}s")
    print(f"   Efficiency gain: {efficiency_gain:.1f}x faster")
    
    # Test cache effectiveness
    print("\n💾 Testing Cache Effectiveness...")
    cache_start_time = time.time()
    cached_data = service.fetch_ohlc_data(symbol, days=days, force_refresh=False)
    cache_time = time.time() - cache_start_time
    
    cache_speedup = fetch_time / cache_time if cache_time > 0 else 0
    print(f"   Cache fetch time: {cache_time:.3f}s")
    print(f"   Cache speedup: {cache_speedup:.1f}x faster")
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 HISTORICAL OHLC TEST SUMMARY")
    print("=" * 60)
    
    tests_passed = 0
    total_tests = 3
    
    if single_success:
        print("✅ Single Symbol Historical Fetch: PASSED")
        tests_passed += 1
    else:
        print("❌ Single Symbol Historical Fetch: FAILED")
    
    if batch_success:
        print("✅ Batch Historical Fetch: PASSED")
        tests_passed += 1
    else:
        print("❌ Batch Historical Fetch: FAILED")
    
    if cache_speedup > 1:
        print("✅ Cache Effectiveness: PASSED")
        tests_passed += 1
    else:
        print("❌ Cache Effectiveness: FAILED")
    
    print(f"\n🎯 Success Rate: {tests_passed}/{total_tests} ({(tests_passed/total_tests*100):.1f}%)")
    
    if tests_passed == total_tests:
        print("🎉 ALL HISTORICAL OHLC TESTS PASSED!")
        print("💡 Historical data fetching is optimized and ready for production")
    else:
        print("⚠️ Some tests failed. Review and fix issues.")
    
    print("=" * 60)
    
    return single_success, batch_success, efficiency_gain


if __name__ == "__main__":
    test_historical_ohlc_fetching()