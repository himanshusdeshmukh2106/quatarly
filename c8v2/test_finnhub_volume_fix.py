#!/usr/bin/env python
"""
Test script to verify Finnhub volume data fix
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

from investments.bharatsm_service import FinnhubAPIService, FinalOptimizedBharatSMService
import finnhub


def test_finnhub_volume_data():
    """Test Finnhub volume data extraction"""
    print("Testing Finnhub Volume Data Fix")
    print("=" * 50)
    
    api_key = FinnhubAPIService.get_api_key()
    if not api_key:
        print("❌ No Finnhub API key available")
        return False
    
    finnhub_client = finnhub.Client(api_key=api_key)
    
    # Test symbols
    test_symbols = ['AAPL', 'MSFT', 'GOOGL']
    
    for symbol in test_symbols:
        print(f"\nTesting {symbol}:")
        print("-" * 20)
        
        # Test quote data (should not have volume)
        quote_data = FinnhubAPIService.get_quote_data(finnhub_client, symbol)
        print(f"Quote volume: {quote_data.get('volume', 'N/A')}")
        
        # Test basic financials (should have volume)
        financials_data = FinnhubAPIService.get_basic_financials(finnhub_client, symbol)
        print(f"Financials volume: {financials_data.get('volume', 'N/A')}")
        
        # Test complete stock data (should use financials volume)
        stock_data = FinnhubAPIService.get_stock_data(symbol)
        print(f"Final volume: {stock_data.get('volume', 'N/A')}")
        
        if stock_data.get('volume') and stock_data.get('volume') != '0':
            print(f"✅ Volume data available: {stock_data.get('volume')}")
        else:
            print(f"❌ No volume data available")


def test_integrated_volume_data():
    """Test volume data through the main service"""
    print("\n\nTesting Integrated Volume Data")
    print("=" * 50)
    
    service = FinalOptimizedBharatSMService()
    
    test_symbols = ['AAPL', 'MSFT', 'TSLA']
    
    for symbol in test_symbols:
        print(f"\nTesting {symbol} through main service:")
        print("-" * 30)
        
        try:
            result = service.get_frontend_display_data(symbol)
            
            if result:
                volume = result.get('volume', 'N/A')
                company = result.get('company_name', 'N/A')
                price = result.get('current_price', 'N/A')
                
                print(f"Company: {company}")
                print(f"Price: ${price}")
                print(f"Volume: {volume}")
                
                if volume and volume != '0' and volume != 'N/A':
                    print(f"✅ Volume data available and formatted")
                else:
                    print(f"❌ Volume data missing or zero")
            else:
                print(f"❌ No data returned")
                
        except Exception as e:
            print(f"❌ Error: {e}")


def test_volume_formatting():
    """Test volume formatting with actual Finnhub data"""
    print("\n\nTesting Volume Formatting")
    print("=" * 50)
    
    # Test the formatting function with sample volume values
    test_volumes = [
        (50000000, "5.0Cr"),      # 50 million
        (15000000, "1.5Cr"),     # 15 million  
        (2500000, "25.0L"),      # 2.5 million
        (750000, "7.5L"),        # 750 thousand
        (50000, "50.0K"),        # 50 thousand
    ]
    
    for volume, expected in test_volumes:
        formatted = FinnhubAPIService._format_volume_indian(volume)
        if formatted == expected:
            print(f"✅ {volume:,} → {formatted}")
        else:
            print(f"❌ {volume:,} → {formatted} (expected {expected})")


def main():
    """Run volume data tests"""
    print("Finnhub Volume Data Fix Verification")
    print("=" * 60)
    
    # Test Finnhub volume data extraction
    test_finnhub_volume_data()
    
    # Test integrated volume data
    test_integrated_volume_data()
    
    # Test volume formatting
    test_volume_formatting()
    
    print("\n" + "=" * 60)
    print("Volume data fix testing completed!")


if __name__ == "__main__":
    main()