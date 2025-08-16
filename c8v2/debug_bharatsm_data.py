#!/usr/bin/env python
"""
Debug script to examine the actual data structure from BharatSM APIs
"""

import os
import sys
import django
import pandas as pd

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'C8V2.settings')
django.setup()

try:
    from Fundamentals import MoneyControl
    from Technical import NSE
    
    def debug_data_structure():
        """Debug the actual data structure returned by BharatSM APIs"""
        print("🔍 BHARATSM DATA STRUCTURE DEBUG")
        print("=" * 60)
        
        mc = MoneyControl()
        nse = NSE()
        
        # Test with TCS
        symbol = 'TCS'
        print(f"\n📊 Debugging data structure for {symbol}:")
        
        # Get ticker info
        ticker_result, ticker_raw = mc.get_ticker(symbol)
        print(f"\nTicker Result: {ticker_result}")
        print(f"Ticker Raw: {ticker_raw}")
        
        if ticker_result and ticker_raw:
            company_url = ticker_raw[0].get('link_src')
            print(f"Company URL: {company_url}")
            
            if company_url:
                # Get ratios data
                print(f"\n📈 Ratios Data Structure:")
                try:
                    ratios_df = mc.get_complete_ratios_data(company_url, statement_type='standalone', num_years=5)
                    if ratios_df is not None and not ratios_df.empty:
                        print(f"Shape: {ratios_df.shape}")
                        print(f"Columns: {list(ratios_df.columns)}")
                        print(f"\nFirst 10 rows:")
                        print(ratios_df.head(10))
                        
                        # Look for P/E and Market Cap specifically
                        print(f"\n🔍 Searching for P/E ratio:")
                        pe_rows = ratios_df[ratios_df.iloc[:, 0].str.contains('P/E', case=False, na=False)]
                        print(f"P/E rows found: {len(pe_rows)}")
                        if not pe_rows.empty:
                            print(pe_rows)
                        
                        print(f"\n🔍 Searching for Market Cap:")
                        mc_rows = ratios_df[ratios_df.iloc[:, 0].str.contains('Market.*Cap', case=False, na=False)]
                        print(f"Market Cap rows found: {len(mc_rows)}")
                        if not mc_rows.empty:
                            print(mc_rows)
                        
                        # Show all rows containing 'Market'
                        print(f"\n🔍 All rows containing 'Market':")
                        market_rows = ratios_df[ratios_df.iloc[:, 0].str.contains('Market', case=False, na=False)]
                        if not market_rows.empty:
                            print(market_rows)
                        
                        # Show all rows containing 'Cap'
                        print(f"\n🔍 All rows containing 'Cap':")
                        cap_rows = ratios_df[ratios_df.iloc[:, 0].str.contains('Cap', case=False, na=False)]
                        if not cap_rows.empty:
                            print(cap_rows)
                            
                    else:
                        print("No ratios data available")
                except Exception as e:
                    print(f"Error fetching ratios data: {e}")
                
                # Get quarterly data
                print(f"\n📊 Quarterly Data Structure:")
                try:
                    quarterly_df = mc.get_complete_quarterly_results(company_url, statement_type='standalone', num_quarters=5)
                    if quarterly_df is not None and not quarterly_df.empty:
                        print(f"Shape: {quarterly_df.shape}")
                        print(f"Columns: {list(quarterly_df.columns)}")
                        print(f"\nFirst 10 rows:")
                        print(quarterly_df.head(10))
                        
                        # Look for revenue rows
                        print(f"\n🔍 Searching for Revenue:")
                        revenue_rows = quarterly_df[quarterly_df.iloc[:, 0].str.contains('revenue|sales|income', case=False, na=False)]
                        print(f"Revenue rows found: {len(revenue_rows)}")
                        if not revenue_rows.empty:
                            print(revenue_rows.head())
                    else:
                        print("No quarterly data available")
                except Exception as e:
                    print(f"Error fetching quarterly data: {e}")
        
        # Test NSE volume methods
        print(f"\n📈 NSE Volume Data Methods:")
        
        # Method 1: Equity meta info
        print(f"\n🔍 Method 1 - Equity Meta Info:")
        try:
            meta_info = nse.get_nse_equity_meta_info(symbol)
            print(f"Meta info keys: {list(meta_info.keys()) if meta_info else 'None'}")
            if meta_info:
                for key, value in meta_info.items():
                    if 'volume' in key.lower() or 'traded' in key.lower():
                        print(f"  {key}: {value}")
        except Exception as e:
            print(f"Error with equity meta info: {e}")
        
        # Method 2: OHLC data
        print(f"\n🔍 Method 2 - OHLC Data:")
        try:
            ohlc_data = nse.get_ohlc_data(symbol, is_index=False)
            print(f"OHLC data keys: {list(ohlc_data.keys()) if ohlc_data else 'None'}")
            if ohlc_data:
                for key, value in ohlc_data.items():
                    if 'volume' in key.lower():
                        print(f"  {key}: {value}")
        except Exception as e:
            print(f"Error with OHLC data: {e}")
        
        # Method 3: Search results
        print(f"\n🔍 Method 3 - Search Results:")
        try:
            search_results = nse.search(symbol)
            print(f"Search results: {search_results}")
        except Exception as e:
            print(f"Error with search: {e}")
    
    if __name__ == '__main__':
        debug_data_structure()
        
except ImportError as e:
    print(f"Libraries not available: {e}")