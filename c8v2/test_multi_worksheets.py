import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'C8V2.settings')
django.setup()

from investments.google_sheets_service import GoogleSheetsFinanceService

def test_multi_worksheet():
    """Test the new multi-worksheet implementation"""
    print("🔧 Testing multi-worksheet Google Sheets service...")
    
    # Initialize service
    service = GoogleSheetsFinanceService()
    
    if not service.is_available():
        print("❌ Google Sheets service not available")
        return
    
    print(f"✅ Service available")
    print(f"📋 Worksheets configured: {service.worksheets}")
    
    # Test spreadsheet info
    info = service.get_spreadsheet_info()
    print(f"📊 Available sheets: {info.get('sheets', [])}")
    
    # Test OHLC data with dedicated sheet
    print("\n📈 Testing OHLC data with dedicated OHLCData sheet...")
    try:
        ohlc_data = service.fetch_ohlc_data('LT', days=5, force_refresh=True)
        print(f"LT OHLC data points: {len(ohlc_data)}")
        
        if ohlc_data and len(ohlc_data) > 0:
            print(f"✅ OHLC working: Sample = {ohlc_data[0]}")
        else:
            print("⚠️ No OHLC data returned")
            
    except Exception as e:
        print(f"❌ OHLC error: {e}")
    
    # Test market data with dedicated sheet
    print("\n💰 Testing market data with dedicated FinanceData sheet...")
    try:
        market_data = service.fetch_market_data_batch(['LT'], force_refresh=True)
        print(f"LT market data available: {'LT' in market_data}")
        
        if 'LT' in market_data:
            price = market_data['LT'].get('current_price', 'N/A')
            print(f"✅ Market data working: Price = {price}")
        else:
            print("⚠️ No market data returned")
            
    except Exception as e:
        print(f"❌ Market data error: {e}")
    
    print("\n🎯 Multi-worksheet test completed!")

if __name__ == "__main__":
    test_multi_worksheet()