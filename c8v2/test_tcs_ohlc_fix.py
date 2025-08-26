#!/usr/bin/env python3
"""
Test script for TCS OHLC data fetching with the new H-M column logic
"""

import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'C8V2.settings')
django.setup()

from investments.google_sheets_service import GoogleSheetsFinanceService
from investments.centralized_data_service import CentralizedDataFetchingService
from investments.market_data_models import AssetSymbol, CentralizedOHLCData
from investments.models import Investment
import logging
from datetime import datetime

# Set up logging to see debug output
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def test_tcs_ohlc_fix():
    """Test the TCS OHLC data fix with H-M column logic"""
    print("🧪 Testing TCS OHLC Data Fix with H-M Column Logic")
    print("=" * 60)
    
    # Initialize Google Sheets service
    google_service = GoogleSheetsFinanceService()
    
    if not google_service.is_available():
        print("❌ Google Sheets service not available")
        return False
    
    print("✅ Google Sheets service is available")
    
    # Test the new row assignment for TCS
    tcs_row = google_service._get_symbol_row_for_ohlc('TCS')
    print(f"📍 TCS assigned to row: {tcs_row}")
    
    # Test OHLC data fetching for TCS
    print(f"\n🔍 Testing TCS OHLC data fetch (using H-M columns)...")
    
    try:
        # Clear any existing cache for TCS
        google_service.clear_cache('TCS')
        
        # Fetch OHLC data with force refresh
        tcs_ohlc = google_service.fetch_ohlc_data('TCS', days=30, force_refresh=True)
        
        if tcs_ohlc and len(tcs_ohlc) > 0:
            print(f"✅ TCS OHLC data successfully retrieved!")
            print(f"   📊 Data points: {len(tcs_ohlc)}")
            print(f"   📅 Date range: {tcs_ohlc[0]['date']} to {tcs_ohlc[-1]['date']}")
            
            # Show sample data points
            print(f"\n   📈 Sample data points:")
            for i, point in enumerate(tcs_ohlc[:3]):  # Show first 3 points
                print(f"   {i+1}. {point['date']}: Open={point['open']}, High={point['high']}, Low={point['low']}, Close={point['close']}, Volume={point['volume']}")
            
            # Test storing in centralized database
            print(f"\n💾 Testing centralized storage...")
            
            # Get or create asset symbol
            asset_symbol, created = AssetSymbol.objects.get_or_create(
                symbol='TCS',
                asset_type='stock',
                defaults={'name': 'Tata Consultancy Services', 'is_active': True}
            )
            
            if created:
                print(f"   ➕ Created new AssetSymbol for TCS")
            else:
                print(f"   🔄 Using existing AssetSymbol for TCS")
            
            # Calculate current price and daily change
            current_price = None
            daily_change = 0
            daily_change_percent = 0
            
            if len(tcs_ohlc) >= 2:
                latest = tcs_ohlc[-1]
                previous = tcs_ohlc[-2]
                current_price = latest.get('close', 0)
                prev_close = previous.get('close', 0)
                
                if prev_close > 0:
                    daily_change = current_price - prev_close
                    daily_change_percent = (daily_change / prev_close) * 100
            elif len(tcs_ohlc) == 1:
                latest = tcs_ohlc[0]
                current_price = latest.get('close', 0)
            
            # Store in centralized OHLC data
            centralized_ohlc, created = CentralizedOHLCData.objects.update_or_create(
                asset_symbol=asset_symbol,
                symbol='TCS',
                timeframe='1Day',
                defaults={
                    'asset_type': 'stock',
                    'ohlc_data': tcs_ohlc,
                    'current_price': current_price,
                    'daily_change': daily_change,
                    'daily_change_percent': daily_change_percent,
                    'data_source': 'google_sheets',
                    'data_points_count': len(tcs_ohlc),
                    'is_stale': False,
                }
            )
            
            if created:
                print(f"   ➕ Created new centralized OHLC data for TCS")
            else:
                print(f"   🔄 Updated existing centralized OHLC data for TCS")
            
            print(f"   💰 Current price: ₹{current_price}")
            print(f"   📈 Daily change: ₹{daily_change:.2f} ({daily_change_percent:.2f}%)")
            
            return True
            
        else:
            print("❌ No TCS OHLC data retrieved")
            
            # Debug information
            print("\n🔍 Debug Information:")
            print(f"   - TCS row assignment: {tcs_row}")
            print(f"   - Expected data range: H{tcs_row}:M{tcs_row + 35}")
            
            return False
            
    except Exception as e:
        print(f"❌ Error during TCS OHLC test: {e}")
        logger.exception("Detailed error:")
        return False


def test_other_symbols():
    """Test OHLC data for other common symbols"""
    print(f"\n🔍 Testing OHLC data for other symbols...")
    
    google_service = GoogleSheetsFinanceService()
    test_symbols = ['RELIANCE', 'INFY', 'HDFCBANK']
    
    for symbol in test_symbols:
        try:
            print(f"\n   Testing {symbol}:")
            row = google_service._get_symbol_row_for_ohlc(symbol)
            print(f"   📍 Row assignment: {row}")
            
            ohlc_data = google_service.fetch_ohlc_data(symbol, days=5, force_refresh=True)
            
            if ohlc_data and len(ohlc_data) > 0:
                print(f"   ✅ Success: {len(ohlc_data)} data points")
                latest = ohlc_data[-1]
                print(f"   💰 Latest close: ₹{latest.get('close', 'N/A')}")
            else:
                print(f"   ❌ No data retrieved")
                
        except Exception as e:
            print(f"   ❌ Error: {e}")


def test_database_uniqueness():
    """Test database symbol uniqueness"""
    print(f"\n🔍 Testing Database Symbol Uniqueness...")
    
    # Check for duplicate AssetSymbols
    from django.db.models import Count
    duplicates = AssetSymbol.objects.values('symbol', 'asset_type').annotate(count=Count('id')).filter(count__gt=1)
    
    if duplicates:
        print(f"❌ Found {len(duplicates)} duplicate symbol entries:")
        for dup in duplicates:
            print(f"   - {dup['symbol']} ({dup['asset_type']}): {dup['count']} entries")
    else:
        print(f"✅ No duplicate symbols found in database")
    
    # Check for duplicate OHLC data
    ohlc_duplicates = CentralizedOHLCData.objects.values('symbol', 'asset_type', 'timeframe').annotate(count=Count('id')).filter(count__gt=1)
    
    if ohlc_duplicates:
        print(f"❌ Found {len(ohlc_duplicates)} duplicate OHLC entries:")
        for dup in ohlc_duplicates:
            print(f"   - {dup['symbol']} ({dup['asset_type']}, {dup['timeframe']}): {dup['count']} entries")
    else:
        print(f"✅ No duplicate OHLC data found in database")


def main():
    """Main test execution"""
    print("🚀 TCS OHLC Data Fix Test Suite")
    print("=" * 60)
    print(f"Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Run tests
    tcs_success = test_tcs_ohlc_fix()
    test_other_symbols()
    test_database_uniqueness()
    
    print(f"\n" + "=" * 60)
    if tcs_success:
        print("🎉 TCS OHLC data fix appears to be working!")
        print("✅ The H-M column logic is correctly implemented")
        print("📊 TCS data should now be updating properly")
    else:
        print("❌ TCS OHLC data fix needs further investigation")
        print("🔧 Check Google Sheets setup and column H-M data")
    
    print(f"\nCompleted at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")


if __name__ == "__main__":
    main()