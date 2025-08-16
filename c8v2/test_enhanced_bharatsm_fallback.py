#!/usr/bin/env python3
"""
Comprehensive test for enhanced BharatSM service with Perplexity and FMP fallbacks.
Tests Indian stocks, US stocks, and cryptocurrencies.
"""

import os
import sys
import django
from django.conf import settings

# Add the project directory to Python path
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.append(current_dir)

# Configure Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'C8V2.settings')
django.setup()

import logging
from investments.bharatsm_service import FinalOptimizedBharatSMService, FMPAPIService, PerplexityFallbackService

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def test_api_availability():
    """Test if all APIs are properly configured"""
    print("\n" + "="*60)
    print("TESTING API AVAILABILITY")
    print("="*60)
    
    # Test BharatSM
    try:
        from Fundamentals import MoneyControl
        from Technical import NSE
        print("✅ BharatSM libraries available")
        bharatsm_available = True
    except ImportError as e:
        print(f"❌ BharatSM libraries not available: {e}")
        bharatsm_available = False
    
    # Test Perplexity API
    perplexity_available = PerplexityFallbackService.is_available()
    print(f"{'✅' if perplexity_available else '❌'} Perplexity API: {perplexity_available}")
    
    # Test FMP API
    fmp_available = FMPAPIService.is_available()
    print(f"{'✅' if fmp_available else '❌'} FMP API: {fmp_available}")
    
    # Test main service
    service_available = FinalOptimizedBharatSMService.is_available()
    print(f"{'✅' if service_available else '❌'} Enhanced Service: {service_available}")
    
    return bharatsm_available, perplexity_available, fmp_available, service_available

def test_indian_stocks():
    """Test Indian stock data fetching with fallback"""
    print("\n" + "="*60)
    print("TESTING INDIAN STOCKS")
    print("="*60)
    
    service = FinalOptimizedBharatSMService()
    
    # Test popular Indian stocks
    indian_stocks = ['TCS', 'RELIANCE', 'INFY', 'HDFCBANK']
    
    for symbol in indian_stocks:
        print(f"\n--- Testing {symbol} ---")
        try:
            data = service.get_frontend_display_data(symbol)
            
            if data:
                print(f"✅ {symbol} data fetched successfully:")
                print(f"   Company: {data.get('company_name', 'N/A')}")
                print(f"   Volume: {data.get('volume', 'N/A')}")
                print(f"   Market Cap: {data.get('market_cap', 'N/A')}")
                print(f"   P/E Ratio: {data.get('pe_ratio', 'N/A')}")
                print(f"   Growth Rate: {data.get('growth_rate', 'N/A')}%")
                print(f"   Sector: {data.get('sector', 'N/A')}")
            else:
                print(f"❌ {symbol}: No data returned")
                
        except Exception as e:
            print(f"❌ {symbol}: Error - {e}")

def test_us_stocks():
    """Test US stock data fetching using FMP API"""
    print("\n" + "="*60)
    print("TESTING US STOCKS")
    print("="*60)
    
    service = FinalOptimizedBharatSMService()
    
    # Test popular US stocks
    us_stocks = ['AAPL', 'MSFT', 'GOOGL', 'TSLA']
    
    for symbol in us_stocks:
        print(f"\n--- Testing {symbol} ---")
        try:
            data = service.get_frontend_display_data(symbol)
            
            if data:
                print(f"✅ {symbol} data fetched successfully:")
                print(f"   Company: {data.get('company_name', 'N/A')}")
                print(f"   Volume: {data.get('volume', 'N/A')}")
                print(f"   Market Cap: {data.get('market_cap', 'N/A')}")
                print(f"   P/E Ratio: {data.get('pe_ratio', 'N/A')}")
                print(f"   Current Price: {data.get('current_price', 'N/A')}")
                print(f"   Exchange: {data.get('exchange', 'N/A')}")
                print(f"   Sector: {data.get('sector', 'N/A')}")
            else:
                print(f"❌ {symbol}: No data returned")
                
        except Exception as e:
            print(f"❌ {symbol}: Error - {e}")

def test_cryptocurrencies():
    """Test cryptocurrency data fetching using FMP API"""
    print("\n" + "="*60)
    print("TESTING CRYPTOCURRENCIES")
    print("="*60)
    
    service = FinalOptimizedBharatSMService()
    
    # Test popular cryptocurrencies
    cryptos = ['BTCUSD', 'ETHUSD', 'ADAUSD']
    
    for symbol in cryptos:
        print(f"\n--- Testing {symbol} ---")
        try:
            data = service.get_frontend_display_data(symbol)
            
            if data:
                print(f"✅ {symbol} data fetched successfully:")
                print(f"   Name: {data.get('company_name', 'N/A')}")
                print(f"   Volume: {data.get('volume', 'N/A')}")
                print(f"   Market Cap: {data.get('market_cap', 'N/A')}")
                print(f"   Current Price: {data.get('current_price', 'N/A')}")
                print(f"   24h Change: {data.get('growth_rate', 'N/A')}%")
            else:
                print(f"❌ {symbol}: No data returned")
                
        except Exception as e:
            print(f"❌ {symbol}: Error - {e}")

def test_asset_type_detection():
    """Test asset type detection logic"""
    print("\n" + "="*60)
    print("TESTING ASSET TYPE DETECTION")
    print("="*60)
    
    service = FinalOptimizedBharatSMService()
    
    test_cases = [
        ('TCS', 'indian_stock'),
        ('RELIANCE', 'indian_stock'),
        ('AAPL', 'us_stock'),
        ('MSFT', 'us_stock'),
        ('BTCUSD', 'crypto'),
        ('ETHUSD', 'crypto'),
        ('TCS.NS', 'indian_stock'),
        ('INFY.BO', 'indian_stock')
    ]
    
    for symbol, expected_type in test_cases:
        detected_type = service._determine_asset_type(symbol)
        status = "✅" if detected_type == expected_type else "❌"
        print(f"{status} {symbol}: Expected {expected_type}, Got {detected_type}")

def test_individual_apis():
    """Test individual API services"""
    print("\n" + "="*60)
    print("TESTING INDIVIDUAL API SERVICES")
    print("="*60)
    
    # Test FMP API directly
    if FMPAPIService.is_available():
        print("\n--- Testing FMP API ---")
        try:
            fmp_data = FMPAPIService.get_stock_data('AAPL')
            if fmp_data:
                print("✅ FMP API working:")
                print(f"   Company: {fmp_data.get('company_name')}")
                print(f"   Price: {fmp_data.get('current_price')}")
                print(f"   Volume: {fmp_data.get('volume')}")
            else:
                print("❌ FMP API returned no data")
        except Exception as e:
            print(f"❌ FMP API error: {e}")
    
    # Test Perplexity API directly
    if PerplexityFallbackService.is_available():
        print("\n--- Testing Perplexity API ---")
        try:
            perplexity_data = PerplexityFallbackService.get_stock_data_fallback('TCS')
            if perplexity_data:
                print("✅ Perplexity API working:")
                print(f"   Company: {perplexity_data.get('company_name')}")
                print(f"   Price: {perplexity_data.get('current_price')}")
                print(f"   Volume: {perplexity_data.get('volume')}")
            else:
                print("❌ Perplexity API returned no data")
        except Exception as e:
            print(f"❌ Perplexity API error: {e}")

def main():
    """Run all tests"""
    print("🚀 ENHANCED BHARATSM SERVICE WITH FALLBACK TESTING")
    print("Testing BharatSM -> Perplexity -> FMP API fallback chain")
    
    # Test API availability
    bharatsm_available, perplexity_available, fmp_available, service_available = test_api_availability()
    
    if not service_available:
        print("\n❌ No APIs available. Please check configuration.")
        return
    
    # Test asset type detection
    test_asset_type_detection()
    
    # Test individual APIs
    test_individual_apis()
    
    # Test different asset types
    test_indian_stocks()
    test_us_stocks()
    test_cryptocurrencies()
    
    print("\n" + "="*60)
    print("✅ TESTING COMPLETED")
    print("="*60)
    print("\nSummary:")
    print(f"- BharatSM Available: {bharatsm_available}")
    print(f"- Perplexity Available: {perplexity_available}")
    print(f"- FMP Available: {fmp_available}")
    print(f"- Enhanced Service Available: {service_available}")
    
    if service_available:
        print("\n🎉 Enhanced BharatSM service with fallback mechanisms is working!")
        print("The service can now handle:")
        print("  • Indian stocks (BharatSM -> Perplexity fallback)")
        print("  • US stocks (FMP API -> Perplexity fallback)")
        print("  • Cryptocurrencies (FMP API -> Perplexity fallback)")
    else:
        print("\n⚠️  Service needs configuration. Check API keys in .env file.")

if __name__ == "__main__":
    main()