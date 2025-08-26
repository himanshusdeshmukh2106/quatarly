import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'C8V2.settings')
django.setup()

from investments.google_sheets_service import GoogleSheetsFinanceService
from datetime import datetime
import hashlib

service = GoogleSheetsFinanceService()

if service.is_available():
    print("🔍 Debugging OHLC parsing for LT...")
    
    # Calculate where LT data is stored
    symbol_hash = int(hashlib.md5('LT'.encode()).hexdigest()[:4], 16)
    start_row = 200 + (symbol_hash % 100)
    print(f"LT data should be at row: {start_row}")
    
    # First, let's check what's actually in that range
    result = service.service.spreadsheets().values().get(
        spreadsheetId=service.spreadsheet_id,
        range=f'FinanceData!A{start_row}:F{start_row + 10}',
        valueRenderOption='FORMATTED_VALUE'
    ).execute()
    
    values = result.get('values', [])
    print(f"\nRaw values from Google Sheets ({len(values)} rows):")
    for i, row in enumerate(values):
        print(f"  Row {start_row + i}: {row}")
    
    # Now let's manually simulate the parsing logic to see where it fails
    print("\n🔧 Manual parsing simulation:")
    
    if len(values) < 2:
        print("❌ Not enough rows returned")
    else:
        print(f"✅ Got {len(values)} rows, proceeding with parsing...")
        
        # Skip first row (formula/header) and process data rows
        ohlc_data = []
        for i, row in enumerate(values[1:], 1):
            print(f"\nProcessing row {i}: {row}")
            
            if len(row) >= 6 and str(row[0]).strip():
                date_str = str(row[0]).strip()
                print(f"  Date string: '{date_str}'")
                
                # Check if it looks like header
                if date_str.lower() in ['date', 'date/time', '']:
                    print("  ❌ Skipping header row")
                    continue
                
                # Try to parse values
                try:
                    open_price = float(row[1]) if row[1] and str(row[1]) not in ['', '#N/A', '#ERROR!'] else None
                    high = float(row[2]) if row[2] and str(row[2]) not in ['', '#N/A', '#ERROR!'] else None
                    low = float(row[3]) if row[3] and str(row[3]) not in ['', '#N/A', '#ERROR!'] else None
                    close = float(row[4]) if row[4] and str(row[4]) not in ['', '#N/A', '#ERROR!'] else None
                    volume = float(row[5]) if row[5] and str(row[5]) not in ['', '#N/A', '#ERROR!'] else None
                    
                    print(f"  Values: O={open_price}, H={high}, L={low}, C={close}, V={volume}")
                    
                    # Try to parse date
                    date_obj = None
                    for date_format in ["%m/%d/%Y %H:%M:%S", "%m/%d/%Y", "%Y-%m-%d", "%d/%m/%Y", "%Y/%m/%d"]:
                        try:
                            date_obj = datetime.strptime(date_str, date_format)
                            print(f"  ✅ Date parsed with format '{date_format}': {date_obj}")
                            break
                        except ValueError:
                            continue
                    
                    if date_obj and all(v is not None for v in [open_price, high, low, close]):
                        data_point = {
                            'date': date_obj.strftime("%Y-%m-%d"),
                            'timestamp': date_obj.isoformat(),
                            'open': open_price,
                            'high': high,
                            'low': low,
                            'close': close,
                            'volume': volume or 0
                        }
                        ohlc_data.append(data_point)
                        print(f"  ✅ Valid data point created: {data_point}")
                    else:
                        if not date_obj:
                            print(f"  ❌ Date parsing failed for: '{date_str}'")
                        if not all(v is not None for v in [open_price, high, low, close]):
                            print(f"  ❌ Missing OHLC values")
                            
                except Exception as e:
                    print(f"  ❌ Error parsing values: {e}")
            else:
                print(f"  ❌ Row too short or empty date: {len(row)} columns, date='{row[0] if row else 'N/A'}'")
        
        print(f"\n🎯 Final result: {len(ohlc_data)} valid OHLC data points")
        if ohlc_data:
            print("Sample data point:")
            print(ohlc_data[0])