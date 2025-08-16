#!/usr/bin/env python
"""
Test crypto functionality fix
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

from investments.bharatsm_service import FMPAPIService, FinalOptimizedBharatSMService

def test_crypto_functionality():
    """Test crypto data fetching"""
    print("Testing Crypto Functionality")
    print("=" * 40)
    
    # Test FMP crypto service directly
    print("\n1. Testing FMP Crypto Service:")
    print("-" * 30)
    
    crypto_symbols = ['BTC', 'BTCUSD', 'ETH', 'ETHUSD']
    
    for symbol in crypto_symbols:
        print(f"\nTesting {symbol}:")
        try:
            result = FMPAPIService.get_crypto_data(symbol)
            if result:
                print(f"✅ Success: {result.get('company_name', 'N/A')}")
                print(f"   Price: ${result.get('current_price', 'N/A')}")
                print(f"   Volume: {result.get('volume', 'N/A')}")
            else:
                print(f"❌ No data returned for {symbol}")
        except Exception as e:
            print(f"❌ Error: {e}")
    
    # Test through main service
    print("\n\n2. Testing Main Service Crypto Routing:")
    print("-" * 40)
    
    service = FinalOptimizedBharatSMService()
    
    test_symbols = ['BTCUSD', 'ETHUSD']
    
    for symbol in test_symbols:
        print(f"\nTesting {symbol} through main service:")
        try:
            result = service.get_frontend_display_data(symbol)
            if result:
                print(f"✅ Success: {result.get('company_name', 'N/A')}")
                print(f"   Price: ${result.get('current_price', 'N/A')}")
                print(f"   Volume: {result.get('volume', 'N/A')}")
                print(f"   Market Cap: ${result.get('market_cap', 'N/A')}")
            else:
                print(f"❌ No data returned for {symbol}")
        except Exception as e:
            print(f"❌ Error: {e}")

if __name__ == "__main__":
    test_crypto_functionality()