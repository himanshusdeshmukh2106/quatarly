#!/usr/bin/env python
"""
Simple LT test to understand the Google Sheets issue
"""

import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'C8V2.settings')
django.setup()

from investments.google_sheets_service import GoogleSheetsFinanceService
import time

def main():
    service = GoogleSheetsFinanceService()
    
    if not service.is_available():
        print("❌ Google Sheets service not available")
        return
    
    print("🔍 Simple LT test...")
    
    # Test 1: Manual formula with longer wait time
    print("\n1️⃣ Manual formula test with extended wait:")
    try:
        # Write the formula manually
        result = service.service.spreadsheets().values().update(
            spreadsheetId=service.spreadsheet_id,
            range='FinanceData!A300',
            valueInputOption='USER_ENTERED',
            body={'values': [['=GOOGLEFINANCE("NSE:LT", "price")']]}
        ).execute()
        
        print("   ⚡ Formula written, waiting 10 seconds...")
        time.sleep(10)  # Longer wait
        
        # Read result
        read_result = service.service.spreadsheets().values().get(
            spreadsheetId=service.spreadsheet_id,
            range='FinanceData!A300'
        ).execute()
        
        values = read_result.get('values', [])
        if values and values[0]:
            manual_price = values[0][0]
            print(f"   📊 Manual result: {manual_price}")
        else:
            print("   ❌ No manual result")
            
    except Exception as e:
        print(f"   ❌ Manual test error: {e}")
    
    # Test 2: Batch processing with extended wait time
    print("\n2️⃣ Testing batch processing with longer wait:")
    try:
        # Get block allocation
        block_data = service.buffer_service.allocate_market_block()
        block_number, start_row, end_row = block_data
        
        print(f"   📍 Allocated block {block_number}: rows {start_row}-{end_row}")
        
        # Create minimal batch request
        headers = ['Symbol', 'Price']
        requests = []
        sheet_id = service._get_sheet_id('FinanceData')
        
        # Add just one formula
        formulas = ['LT', '=GOOGLEFINANCE("NSE:LT", "price")']
        row_values = [
            {'userEnteredValue': {'stringValue': formulas[0]}},  # Symbol
            {'userEnteredValue': {'formulaValue': formulas[1]}}   # Price formula
        ]
        
        requests.append({
            'updateCells': {
                'range': {
                    'sheetId': sheet_id,
                    'startRowIndex': start_row - 1,  # Convert to 0-indexed
                    'endRowIndex': start_row,
                    'startColumnIndex': 0,
                    'endColumnIndex': 2
                },
                'rows': [{'values': row_values}],
                'fields': 'userEnteredValue'
            }
        })
        
        # Execute batch
        print(f"   ⚡ Executing batch update...")
        result = service.service.spreadsheets().batchUpdate(
            spreadsheetId=service.spreadsheet_id,
            body={'requests': requests}
        ).execute()
        
        print(f"   ⏳ Waiting 10 seconds for calculation...")
        time.sleep(10)  # Longer wait
        
        # Read result
        read_range = f'FinanceData!A{start_row}:B{start_row}'
        print(f"   📖 Reading from: {read_range}")
        
        read_result = service.service.spreadsheets().values().get(
            spreadsheetId=service.spreadsheet_id,
            range=read_range
        ).execute()
        
        values = read_result.get('values', [])
        print(f"   📊 Batch result: {values}")
        
        if values and len(values[0]) > 1:
            batch_price = values[0][1]
            print(f"   💰 Batch price: {batch_price}")
        else:
            print("   ❌ No batch price data")
        
        # Release block
        service.buffer_service.release_market_block(block_number)
        
    except Exception as e:
        print(f"   ❌ Batch test error: {e}")
        import traceback
        traceback.print_exc()
    
    # Test 3: Compare with known working symbol
    print("\n3️⃣ Testing RELIANCE for comparison:")
    try:
        # Test RELIANCE with same method
        result = service.service.spreadsheets().values().update(
            spreadsheetId=service.spreadsheet_id,
            range='FinanceData!A310',
            valueInputOption='USER_ENTERED',
            body={'values': [['=GOOGLEFINANCE("NSE:RELIANCE", "price")']]}
        ).execute()
        
        time.sleep(5)
        
        read_result = service.service.spreadsheets().values().get(
            spreadsheetId=service.spreadsheet_id,
            range='FinanceData!A310'
        ).execute()
        
        values = read_result.get('values', [])
        if values and values[0]:
            reliance_price = values[0][0]
            print(f"   📊 RELIANCE result: {reliance_price}")
        else:
            print("   ❌ No RELIANCE result")
            
    except Exception as e:
        print(f"   ❌ RELIANCE test error: {e}")

if __name__ == "__main__":
    main()