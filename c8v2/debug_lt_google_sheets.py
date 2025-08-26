#!/usr/bin/env python
"""
Debug script to test LT symbol in Google Sheets with different formats
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
    
    print("🔍 Testing LT symbol in Google Sheets...")
    
    # Test different symbol formats for LT
    test_formats = [
        'LT',           # Plain symbol
        'NSE:LT',       # NSE prefix (current)
        'BSE:LT',       # BSE prefix
        'LT.NS',        # Yahoo Finance format
        'LT.BO',        # Bombay Stock Exchange
        'LARSENTOUBRO', # Full name
        'L&T'           # Alternative name
    ]
    
    print("\n📊 Testing formula creation:")
    for symbol_format in test_formats:
        try:
            formula = service._create_finance_formula(symbol_format, 'price')
            print(f"  {symbol_format:12} -> {formula}")
        except Exception as e:
            print(f"  {symbol_format:12} -> ERROR: {e}")
    
    # Test a known working symbol first
    print("\n🧪 Testing known working symbol (RELIANCE):")
    try:
        reliance_data = service.fetch_market_data_batch(['RELIANCE'], force_refresh=True)
        if 'RELIANCE' in reliance_data:
            price = reliance_data['RELIANCE'].get('current_price', 'N/A')
            print(f"  ✅ RELIANCE price: {price}")
        else:
            print("  ❌ RELIANCE failed")
    except Exception as e:
        print(f"  ❌ RELIANCE error: {e}")
    
    # Now test LT with current format
    print("\n🎯 Testing LT with current format:")
    try:
        lt_data = service.fetch_market_data_batch(['LT'], force_refresh=True)
        if 'LT' in lt_data:
            price = lt_data['LT'].get('current_price', 'N/A')
            print(f"  ✅ LT price: {price}")
        else:
            print("  ❌ LT failed to return data")
            print(f"  📝 Raw result: {lt_data}")
    except Exception as e:
        print(f"  ❌ LT error: {e}")
    
    # Test manually writing formula to Google Sheets
    print("\n🔧 Manual formula test:")
    try:
        # Write the formula directly to see what Google calculates
        result = service.service.spreadsheets().values().update(
            spreadsheetId=service.spreadsheet_id,
            range='FinanceData!A100',
            valueInputOption='USER_ENTERED',
            body={'values': [['=GOOGLEFINANCE("NSE:LT", "price")']]}
        ).execute()
        
        # Wait for calculation
        time.sleep(3)
        
        # Read back the result
        read_result = service.service.spreadsheets().values().get(
            spreadsheetId=service.spreadsheet_id,
            range='FinanceData!A100'
        ).execute()
        
        values = read_result.get('values', [])
        if values:
            calculated_value = values[0][0] if values[0] else 'Empty'
            print(f"  📊 Google calculated: {calculated_value}")
            
            if calculated_value == '#N/A' or 'N/A' in str(calculated_value):
                print("  ⚠️  Google Finance doesn't recognize NSE:LT")
                
                # Try alternative formats
                alternatives = ['BSE:LT', 'LT.NS', 'LT.BO']
                for alt in alternatives:
                    print(f"  🔄 Trying {alt}...")
                    result = service.service.spreadsheets().values().update(
                        spreadsheetId=service.spreadsheet_id,
                        range='FinanceData!A101',
                        valueInputOption='USER_ENTERED',
                        body={'values': [[f'=GOOGLEFINANCE("{alt}", "price")']]}
                    ).execute()
                    
                    time.sleep(2)
                    
                    read_result = service.service.spreadsheets().values().get(
                        spreadsheetId=service.spreadsheet_id,
                        range='FinanceData!A101'
                    ).execute()
                    
                    alt_values = read_result.get('values', [])
                    if alt_values:
                        alt_value = alt_values[0][0] if alt_values[0] else 'Empty'
                        print(f"    📊 {alt}: {alt_value}")
                        
                        if alt_value != '#N/A' and 'N/A' not in str(alt_value):
                            print(f"    ✅ {alt} works! Found working format")
                            break
            else:
                print(f"  ✅ NSE:LT works! Price: {calculated_value}")
                
        else:
            print("  ❌ No values returned")
            
    except Exception as e:
        print(f"  ❌ Manual test error: {e}")

if __name__ == "__main__":
    main()