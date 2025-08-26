#!/usr/bin/env python
"""
Test script to check different L&T symbol variations
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
        print("Google Sheets service not available")
        return
    
    # Test basic price fetch for different symbols
    test_symbols = ['LT', 'LARSENTOUBRO', 'RELIANCE']
    working_symbols = []
    
    print("Testing basic price fetch for symbols...")
    for symbol in test_symbols:
        try:
            # Test market data fetch first
            market_data = service.fetch_market_data_batch([symbol], force_refresh=True)
            if symbol in market_data and market_data[symbol].get('current_price'):
                price = market_data[symbol]['current_price']
                print(f"✅ {symbol}: Price = {price}")
                working_symbols.append(symbol)
            else:
                print(f"❌ {symbol}: No price data")
        except Exception as e:
            print(f"❌ {symbol}: Error = {e}")
    
    print(f"\nWorking symbols: {working_symbols}")
    
    # Test OHLC for working symbols
    print("\nTesting OHLC data...")
    for symbol in working_symbols:
        try:
            ohlc_data = service.fetch_ohlc_data(symbol, days=5, force_refresh=True)
            print(f"📊 {symbol}: {len(ohlc_data)} OHLC points")
            if ohlc_data:
                sample = ohlc_data[0]
                print(f"   Sample: Date={sample.get('date')}, Close={sample.get('close')}")
        except Exception as e:
            print(f"❌ {symbol} OHLC Error: {e}")

if __name__ == "__main__":
    main()