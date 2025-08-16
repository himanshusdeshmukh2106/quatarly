#!/usr/bin/env python
"""
Test script to verify Perplexity API integration
"""

import os
import sys
import django

# Add the project directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'C8V2.settings')
django.setup()

from investments.perplexity_service import PerplexityAPIService
from django.conf import settings

def test_perplexity_api():
    """Test Perplexity API functionality"""
    print("Testing Perplexity API integration...")
    
    # Check API key configuration
    api_key = getattr(settings, 'PERPLEXITY_API_KEY', None)
    if not api_key:
        print("❌ PERPLEXITY_API_KEY not configured in settings")
        return False
    
    print(f"✅ API key configured: {api_key[:10]}...")
    
    # Test connection
    print("\nTesting API connection...")
    if PerplexityAPIService.test_api_connection():
        print("✅ API connection test passed")
    else:
        print("❌ API connection test failed")
        return False
    
    # Test different asset types
    test_cases = [
        ("AAPL", "stock", "Apple stock data"),
        ("BTC", "crypto", "Bitcoin data"),
        ("gold", "precious_metal", "Gold price data"),
    ]
    
    for symbol, asset_type, description in test_cases:
        print(f"\nTesting {description}...")
        try:
            if asset_type == "stock":
                data = PerplexityAPIService.get_basic_market_data(symbol, asset_type)
            elif asset_type == "crypto":
                data = PerplexityAPIService.get_basic_market_data(symbol, asset_type)
            elif asset_type == "precious_metal":
                data = PerplexityAPIService.get_precious_metal_price(symbol)
            
            if data:
                print(f"✅ Successfully fetched {description}")
                print(f"   Sample data keys: {list(data.keys())[:3]}")
            else:
                print(f"⚠️  No data returned for {description}")
                
        except Exception as e:
            print(f"❌ Error fetching {description}: {e}")
    
    print("\n🎉 Perplexity API test completed!")
    return True

if __name__ == "__main__":
    success = test_perplexity_api()
    sys.exit(0 if success else 1)