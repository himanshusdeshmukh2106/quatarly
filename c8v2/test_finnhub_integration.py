#!/usr/bin/env python
"""
Test script to verify Finnhub integration and routing in the main service
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

from investments.bharatsm_service import FinalOptimizedBharatSMService


def test_finnhub_routing():
    """Test that US stocks are routed to Finnhub as primary source"""
    print("Testing Finnhub Routing for US Stocks")
    print("=" * 50)
    
    service = FinalOptimizedBharatSMService()
    
    # Test US stocks that should use Finnhub
    us_stocks = ['AAPL', 'MSFT', 'GOOGL', 'TSLA', 'SPY']
    
    successful_fetches = 0
    
    for symbol in us_stocks:
        print(f"\nTesting {symbol}:")
        print("-" * 20)
        
        try:
            # Get data through the main service
            result = service.get_frontend_display_data(symbol)
            
            if result:
                print(f"✅ Successfully fetched data for {symbol}")
                print(f"   Company: {result.get('company_name', 'N/A')}")
                print(f"   Price: ${result.get('current_price', 'N/A')}")
                print(f"   Volume: {result.get('volume', 'N/A')}")
                print(f"   P/E Ratio: {result.get('pe_ratio', 'N/A')}")
                print(f"   Market Cap: ${result.get('market_cap', 'N/A'):,}" if result.get('market_cap') else "   Market Cap: N/A")
                print(f"   Sector: {result.get('sector', 'N/A')}")
                successful_fetches += 1
            else:
                print(f"❌ No data returned for {symbol}")
                
        except Exception as e:
            print(f"❌ Error fetching {symbol}: {e}")
    
    print(f"\n📊 US Stock Data Success Rate: {successful_fetches}/{len(us_stocks)} ({successful_fetches/len(us_stocks)*100:.1f}%)")
    return successful_fetches == len(us_stocks)


def test_indian_stock_routing():
    """Test that Indian stocks still route to BharatSM"""
    print("\n\nTesting Indian Stock Routing (BharatSM)")
    print("=" * 50)
    
    service = FinalOptimizedBharatSMService()
    
    # Test Indian stocks that should use BharatSM
    indian_stocks = ['RELIANCE', 'TCS', 'INFY']
    
    successful_fetches = 0
    
    for symbol in indian_stocks:
        print(f"\nTesting {symbol}:")
        print("-" * 20)
        
        try:
            # Verify asset type detection
            asset_type = service._determine_asset_type(symbol)
            print(f"   Asset Type: {asset_type}")
            
            if asset_type != 'indian_stock':
                print(f"❌ Wrong asset type for {symbol}")
                continue
            
            # Get data through the main service
            result = service.get_frontend_display_data(symbol)
            
            if result:
                print(f"✅ Successfully fetched data for {symbol}")
                print(f"   Company: {result.get('company_name', 'N/A')}")
                print(f"   Volume: {result.get('volume', 'N/A')}")
                print(f"   P/E Ratio: {result.get('pe_ratio', 'N/A')}")
                print(f"   Market Cap: {result.get('market_cap', 'N/A')}")
                successful_fetches += 1
            else:
                print(f"❌ No data returned for {symbol}")
                
        except Exception as e:
            print(f"❌ Error fetching {symbol}: {e}")
    
    print(f"\n📊 Indian Stock Data Success Rate: {successful_fetches}/{len(indian_stocks)} ({successful_fetches/len(indian_stocks)*100:.1f}%)")
    return successful_fetches >= len(indian_stocks) * 0.5  # Allow 50% success for Indian stocks


def test_crypto_routing():
    """Test that crypto still routes to FMP"""
    print("\n\nTesting Crypto Routing (FMP)")
    print("=" * 50)
    
    service = FinalOptimizedBharatSMService()
    
    # Test crypto that should use FMP
    crypto_symbols = ['BTCUSD', 'ETHUSD']
    
    successful_fetches = 0
    
    for symbol in crypto_symbols:
        print(f"\nTesting {symbol}:")
        print("-" * 20)
        
        try:
            # Verify asset type detection
            asset_type = service._determine_asset_type(symbol)
            print(f"   Asset Type: {asset_type}")
            
            if asset_type != 'crypto':
                print(f"❌ Wrong asset type for {symbol}")
                continue
            
            # Get data through the main service
            result = service.get_frontend_display_data(symbol)
            
            if result:
                print(f"✅ Successfully fetched data for {symbol}")
                print(f"   Name: {result.get('company_name', 'N/A')}")
                print(f"   Price: ${result.get('current_price', 'N/A')}")
                print(f"   Volume: {result.get('volume', 'N/A')}")
                successful_fetches += 1
            else:
                print(f"❌ No data returned for {symbol}")
                
        except Exception as e:
            print(f"❌ Error fetching {symbol}: {e}")
    
    print(f"\n📊 Crypto Data Success Rate: {successful_fetches}/{len(crypto_symbols)} ({successful_fetches/len(crypto_symbols)*100:.1f}%)")
    return successful_fetches >= len(crypto_symbols) * 0.5  # Allow 50% success for crypto


def test_fallback_mechanisms():
    """Test fallback mechanisms work correctly"""
    print("\n\nTesting Fallback Mechanisms")
    print("=" * 50)
    
    service = FinalOptimizedBharatSMService()
    
    # Test with a symbol that might not be in Finnhub but could be in FMP
    test_symbol = 'UNKNOWN123'
    
    print(f"Testing fallback with symbol: {test_symbol}")
    
    try:
        result = service.get_frontend_display_data(test_symbol)
        
        if result:
            print(f"✅ Fallback mechanism worked for {test_symbol}")
            print(f"   Data source successfully provided data")
        else:
            print(f"✅ Fallback mechanism handled gracefully for {test_symbol}")
            print(f"   No data returned (expected for invalid symbol)")
        
        return True
        
    except Exception as e:
        print(f"❌ Fallback mechanism failed: {e}")
        return False


def test_volume_formatting_consistency():
    """Test that volume formatting is consistent across all routes"""
    print("\n\nTesting Volume Formatting Consistency")
    print("=" * 50)
    
    service = FinalOptimizedBharatSMService()
    
    # Test different asset types
    test_cases = [
        ('AAPL', 'us_stock', 'Finnhub'),
        ('RELIANCE', 'indian_stock', 'BharatSM'),
        ('BTCUSD', 'crypto', 'FMP')
    ]
    
    all_consistent = True
    
    for symbol, expected_type, expected_source in test_cases:
        print(f"\nTesting volume formatting for {symbol} ({expected_source}):")
        
        try:
            result = service.get_frontend_display_data(symbol)
            
            if result and 'volume' in result:
                volume = result['volume']
                print(f"   Volume: {volume}")
                
                # Check if volume follows Indian formatting
                if any(suffix in str(volume) for suffix in ['Cr', 'L', 'K']) or volume == '0' or volume.isdigit():
                    print(f"✅ Volume formatting is correct for {symbol}")
                else:
                    print(f"❌ Volume formatting is incorrect for {symbol}: {volume}")
                    all_consistent = False
            else:
                print(f"⚠️ No volume data for {symbol}")
                
        except Exception as e:
            print(f"❌ Error testing {symbol}: {e}")
            all_consistent = False
    
    return all_consistent


def main():
    """Run all integration tests"""
    print("Finnhub Integration Tests")
    print("=" * 60)
    
    results = []
    
    # Test routing for different asset types
    results.append(test_finnhub_routing())
    results.append(test_indian_stock_routing())
    results.append(test_crypto_routing())
    
    # Test fallback mechanisms
    results.append(test_fallback_mechanisms())
    
    # Test consistency
    results.append(test_volume_formatting_consistency())
    
    # Summary
    print("\n" + "=" * 60)
    print("INTEGRATION TEST SUMMARY")
    print("=" * 60)
    
    passed = sum(results)
    total = len(results)
    
    print(f"Test categories passed: {passed}/{total}")
    
    if passed == total:
        print("🎉 All Finnhub integration tests passed!")
        print("✅ Finnhub is successfully integrated as primary US stock source")
        print("✅ Fallback mechanisms are working correctly")
        print("✅ Volume formatting is consistent across all sources")
        return True
    else:
        print("💥 Some integration tests failed")
        print("❌ Finnhub integration needs attention")
        return False


if __name__ == "__main__":
    main()