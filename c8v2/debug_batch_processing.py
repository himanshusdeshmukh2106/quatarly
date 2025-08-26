#!/usr/bin/env python
"""
Debug script to inspect exactly what Google Sheets returns in batch mode
"""

import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'C8V2.settings')
django.setup()

from investments.google_sheets_service import GoogleSheetsFinanceService
import time
import json

def main():
    service = GoogleSheetsFinanceService()
    
    if not service.is_available():
        print("❌ Google Sheets service not available")
        return
    
    print("🔍 Debugging Google Sheets batch processing...")
    
    # Test with a single symbol using the exact same logic as the service
    symbol = 'LT'
    
    # Get a block allocation manually (similar to the service)
    try:
        print(f"\n1️⃣ Testing batch processing for {symbol}")
        
        # Manually allocate a block (simulate the service logic)
        block_number = service.buffer_service.allocate_market_block()
        start_row, end_row = service.buffer_service.get_market_block_range(block_number)
        
        print(f"📍 Allocated block {block_number}: rows {start_row}-{end_row}")
        
        # Prepare batch request (same as service)
        batch_request = service._prepare_market_batch_request([symbol], 'FinanceData', start_row)
        
        print(f"📝 Batch request prepared with {len(batch_request['requests'])} requests")
        
        # Execute the batch update
        print("⚡ Executing batch update...")
        result = service.service.spreadsheets().batchUpdate(
            spreadsheetId=service.spreadsheet_id,
            body=batch_request
        ).execute()
        
        print(f"✅ Batch update completed: {result.get('replies', [])}")
        
        # Wait for Google to calculate (same timing as service)
        print("⏳ Waiting for Google to calculate formulas...")
        time.sleep(5)  # Same wait time as service
        
        # Read the results (same range as service)
        read_range = f'FinanceData!A{start_row}:M{start_row + len([symbol])}'
        print(f"📖 Reading results from range: {read_range}")
        
        read_result = service.service.spreadsheets().values().get(
            spreadsheetId=service.spreadsheet_id,
            range=read_range,
            valueRenderOption='FORMATTED_VALUE'
        ).execute()
        
        values = read_result.get('values', [])
        print(f"📊 Retrieved {len(values)} rows of data from sheets")
        
        # Inspect the raw data
        print("\n🔬 Raw data inspection:")
        for i, row in enumerate(values):
            print(f"  Row {i}: {row}")
            print(f"    Length: {len(row)}")
            for j, cell in enumerate(row):
                print(f"    Cell {j}: '{cell}' (type: {type(cell)})")
        
        # Try the parsing logic (same as service)
        print("\n🧮 Applying service parsing logic:")
        if len(values) >= 1:
            row = values[0]
            
            def safe_float(value, default=None):
                if value in ['', '#N/A', '#ERROR!', '#VALUE!']:
                    return default
                try:
                    clean_value = str(value).replace(',', '').replace('$', '').replace('%', '')
                    return float(clean_value) if clean_value else default
                except (ValueError, TypeError):
                    return default
            
            price = safe_float(row[1] if len(row) > 1 else None)
            volume = safe_float(row[5] if len(row) > 5 else None)
            market_cap = safe_float(row[6] if len(row) > 6 else None)
            pe_ratio = safe_float(row[7] if len(row) > 7 else None)
            
            print(f"  Parsed price: {price}")
            print(f"  Parsed volume: {volume}")
            print(f"  Parsed market_cap: {market_cap}")
            print(f"  Parsed pe_ratio: {pe_ratio}")
            
            if price is not None and price > 0:
                print(f"  ✅ Valid data found! Price: {price}")
            else:
                print(f"  ❌ No valid price data. Raw price cell: '{row[1] if len(row) > 1 else 'N/A'}'")
                
                # Check if it's a formula error
                if len(row) > 1:
                    price_cell = row[1]
                    if isinstance(price_cell, str) and ('#' in price_cell or 'N/A' in price_cell):
                        print(f"  🚨 Formula error detected: {price_cell}")
                        print("  🔧 This indicates Google Finance doesn't recognize the symbol or there's a formula issue")
        else:
            print("  ❌ No rows returned from Google Sheets")
        
        # Release the block
        service.buffer_service.release_market_block(block_number)
        
    except Exception as e:
        print(f"❌ Error in batch processing test: {e}")
        import traceback
        traceback.print_exc()
    
    # Also test the individual formula again for comparison
    print(f"\n2️⃣ Comparing with direct formula test:")
    try:
        # Write formula directly
        result = service.service.spreadsheets().values().update(
            spreadsheetId=service.spreadsheet_id,
            range='FinanceData!A200',
            valueInputOption='USER_ENTERED',
            body={'values': [['=GOOGLEFINANCE("NSE:LT", "price")']]}
        ).execute()
        
        time.sleep(3)
        
        # Read result
        read_result = service.service.spreadsheets().values().get(
            spreadsheetId=service.spreadsheet_id,
            range='FinanceData!A200'
        ).execute()
        
        values = read_result.get('values', [])
        if values:
            direct_value = values[0][0] if values[0] else 'Empty'
            print(f"  📊 Direct formula result: {direct_value}")
        else:
            print("  ❌ No direct formula result")
            
    except Exception as e:
        print(f"❌ Error in direct formula test: {e}")

if __name__ == "__main__":
    main()