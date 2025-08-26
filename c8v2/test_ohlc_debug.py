"""
Debug OHLC Data Processing
Focused test to identify and fix OHLC data parsing issues
"""

import os
import sys
import django
from unittest.mock import patch, MagicMock

# Add project root to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Django setup
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'C8V2.settings')
django.setup()

from investments.google_sheets_service import GoogleSheetsFinanceService


def test_ohlc_data_parsing():
    """Debug OHLC data parsing issues"""
    print("🔍 Debugging OHLC Data Parsing...")
    
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
            {'properties': {'title': 'OHLCData', 'sheetId': 1}}
        ]
    }
    
    # Mock successful API responses
    mock_batch_update.execute.return_value = {'replies': []}
    
    # Create realistic OHLC mock data (proper format)
    ohlc_mock_data = {
        'values': [
            # Header row is handled separately
            ['12/26/2024 16:00:00', '2480.00', '2520.00', '2475.00', '2500.50', '1500000'],
            ['12/25/2024 16:00:00', '2470.00', '2510.00', '2465.00', '2480.00', '1200000'],
            ['12/24/2024 16:00:00', '2460.00', '2500.00', '2455.00', '2470.00', '1800000'],
            ['12/23/2024 16:00:00', '2450.00', '2490.00', '2445.00', '2460.00', '1600000'],
            ['12/22/2024 16:00:00', '2440.00', '2480.00', '2435.00', '2450.00', '1400000'],
            ['12/21/2024 16:00:00', '2430.00', '2470.00', '2425.00', '2440.00', '1300000'],
            ['12/20/2024 16:00:00', '2420.00', '2460.00', '2415.00', '2430.00', '1100000']
        ]
    }
    
    mock_values.get.return_value.execute.return_value = ohlc_mock_data
    mock_values.clear.return_value.execute.return_value = {}
    
    # Replace the actual service with our mock
    service.service = mock_service
    service.spreadsheet_id = 'test_ohlc_spreadsheet_id'
    
    print("   📊 Mock OHLC data prepared with 7 data points")
    
    # Test OHLC data fetching with debug output
    symbol = 'RELIANCE'
    days = 30
    
    print(f"   🔍 Testing OHLC fetch for {symbol}, {days} days...")
    
    try:
        ohlc_data = service.fetch_ohlc_data(symbol, days=days, force_refresh=True)
        
        print(f"   📈 OHLC data returned: {len(ohlc_data)} data points")
        
        if ohlc_data:
            print("   ✅ Successfully parsed OHLC data:")
            for i, data_point in enumerate(ohlc_data[:5]):  # Show first 5
                print(f"      {i+1}. {data_point['date']}: O:{data_point['open']} H:{data_point['high']} L:{data_point['low']} C:{data_point['close']} V:{data_point['volume']}")
            
            # Validate data quality
            for data_point in ohlc_data:
                assert data_point['open'] > 0, f"Invalid open price: {data_point['open']}"
                assert data_point['high'] >= data_point['open'], f"High < Open: {data_point}"
                assert data_point['low'] <= data_point['open'], f"Low > Open: {data_point}"
                assert data_point['close'] > 0, f"Invalid close price: {data_point['close']}"
                assert data_point['volume'] >= 0, f"Invalid volume: {data_point['volume']}"
            
            print("   ✅ Data quality validation passed")
            return True
        else:
            print("   ❌ No OHLC data parsed - investigating...")
            
            # Debug the mock data directly
            print(f"   🔍 Raw mock data has {len(ohlc_mock_data['values'])} rows")
            for i, row in enumerate(ohlc_mock_data['values'][:3]):
                print(f"      Row {i}: {row}")
            
            return False
            
    except Exception as e:
        print(f"   ❌ OHLC parsing failed with error: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_date_parsing_formats():
    """Test various date format parsing"""
    print("\n📅 Testing Date Format Parsing...")
    
    from datetime import datetime
    
    test_dates = [
        "12/26/2024 16:00:00",
        "12/26/2024",
        "2024-12-26",
        "26/12/2024",
        "2024/12/26"
    ]
    
    date_formats = [
        "%m/%d/%Y %H:%M:%S", 
        "%m/%d/%Y", 
        "%Y-%m-%d", 
        "%d/%m/%Y", 
        "%Y/%m/%d"
    ]
    
    for date_str in test_dates:
        print(f"   🔍 Testing date: '{date_str}'")
        parsed = False
        
        for date_format in date_formats:
            try:
                date_obj = datetime.strptime(date_str, date_format)
                print(f"      ✅ Parsed with format '{date_format}': {date_obj.strftime('%Y-%m-%d')}")
                parsed = True
                break
            except ValueError:
                continue
        
        if not parsed:
            print(f"      ❌ Could not parse date: '{date_str}'")
    
    print("   ✅ Date format testing completed")


def test_volume_formatting():
    """Test volume formatting functionality"""
    print("\n💹 Testing Volume Formatting...")
    
    service = GoogleSheetsFinanceService()
    
    test_volumes = [
        (1500000, "15.0L"),      # 1.5 million -> 15.0L
        (50000000, "5.0Cr"),     # 50 million -> 5.0Cr  
        (5000, "5.0K"),          # 5 thousand -> 5.0K
        (500, "500"),            # 500 -> 500
        (0, "0"),                # 0 -> 0
        (None, "0")              # None -> 0
    ]
    
    for volume, expected in test_volumes:
        formatted = service._format_volume_indian(volume)
        status = "✅" if formatted == expected else "❌"
        print(f"   {status} Volume {volume} -> '{formatted}' (expected: '{expected}')")
        
        if formatted != expected:
            print(f"      ⚠️ Formatting mismatch!")


def run_ohlc_debug_tests():
    """Run all OHLC debugging tests"""
    print("🚀 Starting OHLC Debug Tests")
    print("=" * 50)
    
    # Test 1: OHLC Data Parsing
    ohlc_success = test_ohlc_data_parsing()
    
    # Test 2: Date Format Parsing
    test_date_parsing_formats()
    
    # Test 3: Volume Formatting
    test_volume_formatting()
    
    print("\n" + "=" * 50)
    print("📊 OHLC DEBUG SUMMARY")
    print("=" * 50)
    
    if ohlc_success:
        print("✅ OHLC data parsing is working correctly")
        print("💡 The issue might be in the mock data setup in comprehensive tests")
        print("🔧 Recommendation: Use more realistic mock data in main tests")
    else:
        print("❌ OHLC data parsing has issues")
        print("🔧 Recommendation: Check date parsing logic and data validation")
    
    print("=" * 50)


if __name__ == "__main__":
    run_ohlc_debug_tests()