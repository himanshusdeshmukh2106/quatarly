"""
Debug OHLC Data Format
Understanding the exact format of data coming from Google Finance
"""

def debug_ohlc_parsing():
    """Debug the exact format and parsing logic"""
    print("🔍 Debugging OHLC Data Format")
    print("=" * 50)
    
    # Simulate the actual data format from Google Finance historical
    test_data = [
        ['12/27/2024', '2500.50', '2520.00', '2475.00', '2480.00', '1500000'],
        ['12/26/2024', '2480.00', '2510.00', '2465.00', '2470.00', '1200000'],
        ['12/25/2024', '2470.00', '2500.00', '2455.00', '2460.00', '1800000']
    ]
    
    print(f"📊 Test data format: {len(test_data)} rows")
    print("Format: Date, Close, High, Low, Open, Volume (Google Finance 'all' format)")
    
    for row_idx, row in enumerate(test_data):
        print(f"\n🔍 Row {row_idx}: {row}")
        print(f"   Length: {len(row)} columns")
        
        if len(row) >= 6:
            date_val = str(row[0]).strip()
            close = float(str(row[1]).replace(',', '')) if row[1] else None
            high = float(str(row[2]).replace(',', '')) if row[2] else None
            low = float(str(row[3]).replace(',', '')) if row[3] else None
            open_price = float(str(row[4]).replace(',', '')) if row[4] else None
            volume = float(str(row[5]).replace(',', '')) if row[5] else None
            
            print(f"   📅 Date: {date_val}")
            print(f"   💰 Open: {open_price}, High: {high}, Low: {low}, Close: {close}")
            print(f"   📊 Volume: {volume}")
            
            # Test date parsing
            from datetime import datetime
            date_obj = None
            for date_format in ["%m/%d/%Y %H:%M:%S", "%m/%d/%Y", "%Y-%m-%d", "%d/%m/%Y", "%Y/%m/%d"]:
                try:
                    date_obj = datetime.strptime(date_val, date_format)
                    print(f"   ✅ Date parsed with format '{date_format}': {date_obj.strftime('%Y-%m-%d')}")
                    break
                except ValueError:
                    continue
            
            if date_obj and close is not None and close > 0:
                # Use close price as fallback for missing OHLC values
                open_price = open_price if open_price is not None and open_price > 0 else close
                high = high if high is not None and high > 0 else max(open_price, close)
                low = low if low is not None and low > 0 else min(open_price, close)
                volume = volume if volume is not None and volume >= 0 else 0
                
                ohlc_point = {
                    'date': date_obj.strftime("%Y-%m-%d"),
                    'timestamp': date_obj.isoformat(),
                    'open': open_price,
                    'high': high,
                    'low': low,
                    'close': close,
                    'volume': volume
                }
                
                print(f"   ✅ Valid OHLC point: {ohlc_point}")
            else:
                print(f"   ❌ Invalid data: date_obj={date_obj}, close={close}")
    
    print("\n" + "=" * 50)
    print("📊 PARSING ANALYSIS")
    print("=" * 50)
    print("✅ The parsing logic should work correctly")
    print("💡 The issue might be in the data filtering conditions")
    print("🔧 Check the invalid_patterns filtering logic")


if __name__ == "__main__":
    debug_ohlc_parsing()