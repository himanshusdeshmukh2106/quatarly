#!/usr/bin/env python
"""
Test script to verify Finnhub API endpoints work correctly
"""

import os
import sys
import django
from pathlib import Path

# Add the project root to Python path
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'C8V2.settings')
django.setup()

from investments.bharatsm_service import FinnhubAPIService
import finnhub


def test_quote_endpoint():
    """Test quote data fetching"""
    print("Testing Quote Endpoint")
    print("-" * 30)
    
    api_key = FinnhubAPIService.get_api_key()
    if not api_key:
        print("❌ No API key available")
        return False
    
    try:
        finnhub_client = finnhub.Client(api_key=api_key)
        
        # Test with AAPL
        quote_data = FinnhubAPIService.get_quote_data(finnhub_client, 'AAPL')
        
        if quote_data:
            print("✅ Quote data fetched successfully")
            print(f"   Current Price: ${quote_data.get('current_price')}")
            print(f"   Volume: {quote_data.get('volume')}")
            print(f"   Change: {quote_data.get('change')}")
            print(f"   Change %: {quote_data.get('change_percent')}%")
            return True
        else:
            print("❌ No quote data returned")
            return False
            
    except Exception as e:
        print(f"❌ Quote endpoint error: {e}")
        return False


def test_profile_endpoint():
    """Test company profile fetching"""
    print("\nTesting Company Profile Endpoint")
    print("-" * 30)
    
    api_key = FinnhubAPIService.get_api_key()
    if not api_key:
        print("❌ No API key available")
        return False
    
    try:
        finnhub_client = finnhub.Client(api_key=api_key)
        
        # Test with AAPL
        profile_data = FinnhubAPIService.get_company_profile(finnhub_client, 'AAPL')
        
        if profile_data:
            print("✅ Profile data fetched successfully")
            print(f"   Company: {profile_data.get('name')}")
            print(f"   Industry: {profile_data.get('finnhubIndustry')}")
            print(f"   Market Cap: ${profile_data.get('marketCapitalization'):,}" if profile_data.get('marketCapitalization') else "   Market Cap: N/A")
            print(f"   Exchange: {profile_data.get('exchange')}")
            return True
        else:
            print("❌ No profile data returned")
            return False
            
    except Exception as e:
        print(f"❌ Profile endpoint error: {e}")
        return False


def test_financials_endpoint():
    """Test basic financials fetching"""
    print("\nTesting Basic Financials Endpoint")
    print("-" * 30)
    
    api_key = FinnhubAPIService.get_api_key()
    if not api_key:
        print("❌ No API key available")
        return False
    
    try:
        finnhub_client = finnhub.Client(api_key=api_key)
        
        # Test with AAPL
        financials_data = FinnhubAPIService.get_basic_financials(finnhub_client, 'AAPL')
        
        if financials_data:
            print("✅ Financials data fetched successfully")
            print(f"   P/E Ratio: {financials_data.get('pe_ratio')}")
            print(f"   52W High: ${financials_data.get('52_week_high')}")
            print(f"   52W Low: ${financials_data.get('52_week_low')}")
            print(f"   Beta: {financials_data.get('beta')}")
            return True
        else:
            print("❌ No financials data returned")
            return False
            
    except Exception as e:
        print(f"❌ Financials endpoint error: {e}")
        return False


def test_integrated_stock_data():
    """Test complete integrated stock data fetching"""
    print("\nTesting Integrated Stock Data")
    print("-" * 30)
    
    try:
        # Test with multiple symbols
        test_symbols = ['AAPL', 'MSFT', 'GOOGL']
        
        for symbol in test_symbols:
            print(f"\nTesting {symbol}:")
            stock_data = FinnhubAPIService.get_stock_data(symbol)
            
            if stock_data:
                print(f"✅ {symbol} data fetched successfully")
                print(f"   Company: {stock_data.get('company_name')}")
                print(f"   Price: ${stock_data.get('current_price')}")
                print(f"   Volume: {stock_data.get('volume')}")
                print(f"   P/E Ratio: {stock_data.get('pe_ratio')}")
                print(f"   Market Cap: ${stock_data.get('market_cap'):,}" if stock_data.get('market_cap') else "   Market Cap: N/A")
            else:
                print(f"❌ {symbol} data fetch failed")
                
        return True
        
    except Exception as e:
        print(f"❌ Integrated data error: {e}")
        return False


def test_volume_formatting():
    """Test Indian volume formatting"""
    print("\nTesting Volume Formatting")
    print("-" * 30)
    
    test_cases = [
        (150000000, "15.0Cr"),
        (25000000, "2.5Cr"),
        (2500000, "25.0L"),
        (750000, "7.5L"),
        (75000, "75.0K"),
        (5000, "5.0K"),
        (500, "500"),
        (0, "0"),
        (None, "0")
    ]
    
    all_passed = True
    for volume, expected in test_cases:
        result = FinnhubAPIService._format_volume_indian(volume)
        if result == expected:
            print(f"✅ {volume} -> {result}")
        else:
            print(f"❌ {volume} -> {result} (expected {expected})")
            all_passed = False
    
    return all_passed


def main():
    """Run all endpoint tests"""
    print("Testing Finnhub API Endpoints")
    print("=" * 50)
    
    results = []
    
    # Test individual endpoints
    results.append(test_quote_endpoint())
    results.append(test_profile_endpoint())
    results.append(test_financials_endpoint())
    
    # Test integrated functionality
    results.append(test_integrated_stock_data())
    
    # Test volume formatting
    results.append(test_volume_formatting())
    
    # Summary
    print("\n" + "=" * 50)
    print("TEST SUMMARY")
    print("=" * 50)
    
    passed = sum(results)
    total = len(results)
    
    print(f"Tests passed: {passed}/{total}")
    
    if passed == total:
        print("🎉 All Finnhub endpoint tests passed!")
        return True
    else:
        print("💥 Some tests failed. Check the output above.")
        return False


if __name__ == "__main__":
    main()