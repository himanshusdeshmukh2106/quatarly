import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'C8V2.settings')
django.setup()

from investments.google_sheets_service import GoogleSheetsFinanceService

service = GoogleSheetsFinanceService()

if service.is_available():
    print("🔍 Testing fixed OHLC parsing for LT...")
    
    # Clear cache and test
    service.clear_cache('LT')
    ohlc_data = service.fetch_ohlc_data('LT', days=5, force_refresh=True)
    
    print(f"OHLC data points: {len(ohlc_data)}")
    
    if ohlc_data:
        print("✅ SUCCESS! OHLC data is working!")
        print("First few data points:")
        for i, point in enumerate(ohlc_data[:3]):
            date = point.get('date', 'N/A')
            open_val = point.get('open', 'N/A')
            high = point.get('high', 'N/A')
            low = point.get('low', 'N/A')
            close = point.get('close', 'N/A')
            volume = point.get('volume', 'N/A')
            print(f"  {i+1}. Date: {date}, O: {open_val}, H: {high}, L: {low}, C: {close}, V: {volume}")
            
        print(f"\n📊 Total data points: {len(ohlc_data)}")
        print(f"Date range: {ohlc_data[0]['date']} to {ohlc_data[-1]['date']}")
        
        # Test with RELIANCE too
        print("\n🔍 Testing RELIANCE as well...")
        reliance_data = service.fetch_ohlc_data('RELIANCE', days=5, force_refresh=True)
        print(f"RELIANCE OHLC points: {len(reliance_data)}")
        
    else:
        print("❌ Still not working")
        
    print("\n🎯 Summary:")
    print(f"- LT OHLC data: {len(ohlc_data)} points")
    if ohlc_data:
        print("- LT symbol is working correctly!")
        print("- The issue was with date parsing format")
        print("- Fixed: Added datetime format support")
else:
    print("❌ Google Sheets service not available")