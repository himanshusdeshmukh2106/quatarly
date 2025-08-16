"""
Test script for BharatSM service integration
Run this script to test the BharatSM service functionality
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

from investments.bharatsm_service import bharatsm_service, get_bharatsm_frontend_data
import json


def test_library_availability():
    """Test if BharatSM libraries are available"""
    print("=== Testing Library Availability ===")
    if bharatsm_service and bharatsm_service.is_available():
        print("✅ BharatSM libraries (Fundamentals, Technical) are available")
        return True
    else:
        print("❌ BharatSM libraries are not available")
        print("Install with: pip install Bharat-sm-data")
        return False


def test_frontend_data(symbol="RELIANCE"):
    """Test frontend display data fetching"""
    print(f"\n=== Testing Frontend Display Data for {symbol} ===")
    try:
        data = get_bharatsm_frontend_data(symbol)
        if data:
            print(f"✅ Successfully fetched frontend data for {symbol}")
            print(f"Data: {json.dumps(data, indent=2, default=str)}")
            return True
        else:
            print(f"❌ No data returned for {symbol}")
            return False
    except Exception as e:
        print(f"❌ Error fetching frontend data: {e}")
        return False


def test_data_enrichment_integration():
    """Test integration with data enrichment service"""
    print("\n=== Testing Data Enrichment Integration ===")
    try:
        from investments.data_enrichment_service import DataEnrichmentService
        
        # Test basic market data
        basic_data = DataEnrichmentService.get_basic_market_data("TCS", "stock")
        if basic_data:
            print("✅ Basic market data integration working")
            print(f"Basic data: {json.dumps(basic_data, indent=2, default=str)}")
            return True
        else:
            print("❌ Basic market data integration failed")
            return False
    except Exception as e:
        print(f"❌ Error testing data enrichment integration: {e}")
        return False


def main():
    """Run all tests"""
    print("🚀 Starting BharatSM Service Integration Tests")
    print("=" * 50)
    
    tests = [
        test_library_availability,
        lambda: test_frontend_data("RELIANCE"),
        lambda: test_frontend_data("INFY"),
        test_data_enrichment_integration,
    ]
    
    passed = 0
    total = len(tests)
    
    for test in tests:
        try:
            if test():
                passed += 1
        except Exception as e:
            print(f"❌ Test failed with exception: {e}")
    
    print("\n" + "=" * 50)
    print(f"📊 Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! BharatSM service integration is working correctly.")
    else:
        print("⚠️  Some tests failed. Check the output above for details.")
        
        if passed == 0:
            print("\n💡 Quick fixes:")
            print("1. Install the library: pip install Bharat-sm-data")
            print("2. Check your internet connection")
            print("3. Verify MoneyControl and NSE websites are accessible")
    
    return passed == total


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
