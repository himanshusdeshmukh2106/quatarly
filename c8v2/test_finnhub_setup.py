#!/usr/bin/env python
"""
Test script to verify Finnhub API setup and connectivity
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

from django.conf import settings

def test_finnhub_setup():
    """Test Finnhub API setup and basic connectivity"""
    print("Testing Finnhub API Setup")
    print("=" * 40)
    
    # Test 1: Check API key configuration
    print("\n1. Checking API key configuration...")
    finnhub_api_key = getattr(settings, 'FINNHUB_API_KEY', None)
    
    if not finnhub_api_key:
        print("❌ FINNHUB_API_KEY not found in settings")
        return False
    
    if len(finnhub_api_key) < 10:
        print("❌ FINNHUB_API_KEY appears to be invalid (too short)")
        return False
    
    print(f"✅ FINNHUB_API_KEY configured: {finnhub_api_key[:10]}...")
    
    # Test 2: Check finnhub-python package
    print("\n2. Checking finnhub-python package...")
    try:
        import finnhub
        print(f"✅ finnhub-python package imported successfully")
        print(f"   Package version: {finnhub.__version__ if hasattr(finnhub, '__version__') else 'Unknown'}")
    except ImportError as e:
        print(f"❌ Failed to import finnhub-python: {e}")
        return False
    
    # Test 3: Test API connectivity
    print("\n3. Testing API connectivity...")
    try:
        finnhub_client = finnhub.Client(api_key=finnhub_api_key)
        
        # Test with a simple quote request
        quote = finnhub_client.quote('AAPL')
        
        if quote and 'c' in quote:
            print(f"✅ API connectivity successful")
            print(f"   AAPL current price: ${quote['c']}")
            return True
        else:
            print("❌ API returned empty or invalid response")
            return False
            
    except Exception as e:
        print(f"❌ API connectivity failed: {e}")
        return False

def main():
    """Run Finnhub setup tests"""
    success = test_finnhub_setup()
    
    print("\n" + "=" * 40)
    if success:
        print("🎉 Finnhub setup is working correctly!")
        print("Ready to proceed with implementation.")
    else:
        print("❌ Finnhub setup has issues that need to be resolved.")
        print("Please check your API key and network connectivity.")
    
    return success

if __name__ == "__main__":
    main()