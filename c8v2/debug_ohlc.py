import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'C8V2.settings')
django.setup()

from investments.google_sheets_service import GoogleSheetsFinanceService
import time

service = GoogleSheetsFinanceService()

if service.is_available():
    print("Testing OHLC formulas for LT...")
    
    # Test different approaches
    formulas_to_test = [
        ("all attribute", '=GOOGLEFINANCE("NSE:LT", "all", DATE(2025,8,1), DATE(2025,8,24), "DAILY")'),
        ("price attribute", '=GOOGLEFINANCE("NSE:LT", "price", DATE(2025,8,1), DATE(2025,8,24), "DAILY")'),
        ("close attribute", '=GOOGLEFINANCE("NSE:LT", "close", DATE(2025,8,1), DATE(2025,8,24), "DAILY")')
    ]
    
    start_row = 400
    
    for i, (name, formula) in enumerate(formulas_to_test):
        row = start_row + i * 15
        print(f"\n{i+1}. Testing {name} at row {row}")
        print(f"   Formula: {formula}")
        
        try:
            # Write formula
            service.service.spreadsheets().values().update(
                spreadsheetId=service.spreadsheet_id,
                range=f'FinanceData!A{row}',
                valueInputOption='USER_ENTERED',
                body={'values': [[formula]]}
            ).execute()
            
            # Wait for Google to calculate
            print("   Waiting for calculation...")
            time.sleep(5)
            
            # Read result
            result = service.service.spreadsheets().values().get(
                spreadsheetId=service.spreadsheet_id,
                range=f'FinanceData!A{row}:F{row + 10}',
                valueRenderOption='FORMATTED_VALUE'
            ).execute()
            
            values = result.get('values', [])
            print(f"   Returned {len(values)} rows:")
            
            for j, row_data in enumerate(values[:6]):
                if row_data:
                    print(f"     Row {row + j}: {row_data}")
            
            # Check if we got valid OHLC data structure
            if len(values) > 1:
                header_row = values[0] if values else []
                data_rows = values[1:] if len(values) > 1 else []
                
                if data_rows and len(data_rows[0]) >= 2:
                    print(f"   ✅ Success: Got {len(data_rows)} data points")
                    print(f"   Sample data: {data_rows[0]}")
                else:
                    print("   ❌ No valid data rows")
            else:
                print("   ❌ Formula didn't return historical data")
                
        except Exception as e:
            print(f"   ❌ Error: {e}")
    
    print("\nDone testing OHLC formulas.")