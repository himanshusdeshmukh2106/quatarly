#!/usr/bin/env python
"""
Final comprehensive test to verify complete Finnhub integration
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

from investments.bharatsm_service import FinalOptimizedBharatSMService, FinnhubAPIService


def test_complete_integration():
    """Test complete Finnhub integration"""
    print("🚀 FINNHUB INTEGRATION - FINAL VERIFICATION")
    print("=" * 60)
    
    # Test 1: Service Availability
    print("\n1. Testing Service Availability")
    print("-" * 40)
    
    finnhub_available = FinnhubAPIService.is_available()
    api_key = FinnhubAPIService.get_api_key()
    
    print(f"✅ Finnhub API Key: {'Configured' if api_key else 'Missing'}")
    print(f"✅ Finnhub Service: {'Available' if finnhub_available else 'Unavailable'}")
    
    if not finnhub_available:
        print("❌ Cannot proceed without Finnhub API key")
        return False
    
    # Test 2: Asset Type Detection & Routing
    print("\n2. Testing Asset Type Detection & Routing")
    print("-" * 40)
    
    service = FinalOptimizedBharatSMService()
    
    test_cases = [
        ('AAPL', 'us_stock', 'Finnhub'),
        ('SPY', 'us_stock', 'Finnhub'),
        ('RELIANCE', 'indian_stock', 'BharatSM'),
        ('TCS', 'indian_stock', 'BharatSM'),
        ('BTCUSD', 'crypto', 'FMP'),
    ]
    
    routing_success = 0
    
    for symbol, expected_type, expected_source in test_cases:
        detected_type = service._determine_asset_type(symbol)
        
        if detected_type == expected_type:
            print(f"✅ {symbol} → {detected_type} (routes to {expected_source})")
            routing_success += 1
        else:
            print(f"❌ {symbol} → {detected_type} (expected {expected_type})")
    
    routing_score = routing_success / len(test_cases)
    print(f"\n📊 Routing Accuracy: {routing_success}/{len(test_cases)} ({routing_score*100:.1f}%)")
    
    # Test 3: Data Fetching from Each Source
    print("\n3. Testing Data Fetching from Each Source")
    print("-" * 40)
    
    data_tests = [
        ('AAPL', 'US Stock via Finnhub'),
        ('MSFT', 'US Stock via Finnhub'),
        ('RELIANCE', 'Indian Stock via BharatSM'),
    ]
    
    data_success = 0
    
    for symbol, description in data_tests:
        print(f"\nTesting {symbol} ({description}):")
        
        try:
            result = service.get_frontend_display_data(symbol)
            
            if result:
                print(f"  ✅ Data fetched successfully")
                print(f"     Company: {result.get('company_name', 'N/A')}")
                print(f"     Price: ${result.get('current_price', 'N/A')}")
                print(f"     Volume: {result.get('volume', 'N/A')}")
                print(f"     P/E Ratio: {result.get('pe_ratio', 'N/A')}")
                print(f"     Market Cap: ${result.get('market_cap', 'N/A'):,}" if result.get('market_cap') else "     Market Cap: N/A")
                print(f"     Sector: {result.get('sector', 'N/A')}")
                data_success += 1
            else:
                print(f"  ❌ No data returned")
                
        except Exception as e:
            print(f"  ❌ Error: {e}")
    
    data_score = data_success / len(data_tests)
    print(f"\n📊 Data Fetching Success: {data_success}/{len(data_tests)} ({data_score*100:.1f}%)")
    
    # Test 4: Volume Formatting Consistency
    print("\n4. Testing Volume Formatting Consistency")
    print("-" * 40)
    
    volume_tests = [
        ('AAPL', 'Finnhub'),
        ('RELIANCE', 'BharatSM'),
    ]
    
    volume_success = 0
    
    for symbol, source in volume_tests:
        try:
            result = service.get_frontend_display_data(symbol)
            
            if result and 'volume' in result:
                volume = result['volume']
                
                # Check Indian formatting
                if (any(suffix in str(volume) for suffix in ['Cr', 'L', 'K']) or 
                    volume == '0' or str(volume).isdigit()):
                    print(f"✅ {symbol} ({source}): {volume} - Correct Indian format")
                    volume_success += 1
                else:
                    print(f"❌ {symbol} ({source}): {volume} - Incorrect format")
            else:
                print(f"⚠️ {symbol} ({source}): No volume data")
                
        except Exception as e:
            print(f"❌ {symbol} ({source}): Error - {e}")
    
    volume_score = volume_success / len(volume_tests)
    print(f"\n📊 Volume Formatting Consistency: {volume_success}/{len(volume_tests)} ({volume_score*100:.1f}%)")
    
    # Test 5: Error Handling
    print("\n5. Testing Error Handling")
    print("-" * 40)
    
    error_tests = [
        ('INVALID123', 'Invalid symbol'),
        ('', 'Empty symbol'),
        (None, 'None symbol'),
    ]
    
    error_success = 0
    
    for symbol, description in error_tests:
        try:
            result = service.get_frontend_display_data(symbol)
            
            if not result:
                print(f"✅ {description}: Handled gracefully (empty result)")
                error_success += 1
            else:
                print(f"⚠️ {description}: Returned data (unexpected)")
                
        except Exception as e:
            print(f"✅ {description}: Handled with exception - {e}")
            error_success += 1
    
    error_score = error_success / len(error_tests)
    print(f"\n📊 Error Handling: {error_success}/{len(error_tests)} ({error_score*100:.1f}%)")
    
    # Test 6: Performance Check
    print("\n6. Testing Performance")
    print("-" * 40)
    
    import time
    
    performance_tests = [
        ('AAPL', 'Finnhub'),
        ('GOOGL', 'Finnhub'),
    ]
    
    performance_success = 0
    
    for symbol, source in performance_tests:
        start_time = time.time()
        
        try:
            result = service.get_frontend_display_data(symbol)
            end_time = time.time()
            
            response_time = end_time - start_time
            
            if result and response_time < 5.0:  # 5 second threshold
                print(f"✅ {symbol} ({source}): {response_time:.2f}s - Good performance")
                performance_success += 1
            elif result:
                print(f"⚠️ {symbol} ({source}): {response_time:.2f}s - Slow but working")
                performance_success += 0.5
            else:
                print(f"❌ {symbol} ({source}): {response_time:.2f}s - No data")
                
        except Exception as e:
            end_time = time.time()
            response_time = end_time - start_time
            print(f"❌ {symbol} ({source}): {response_time:.2f}s - Error: {e}")
    
    performance_score = performance_success / len(performance_tests)
    print(f"\n📊 Performance: {performance_success}/{len(performance_tests)} ({performance_score*100:.1f}%)")
    
    # Overall Assessment
    print("\n" + "=" * 60)
    print("🎯 OVERALL INTEGRATION ASSESSMENT")
    print("=" * 60)
    
    scores = [routing_score, data_score, volume_score, error_score, performance_score]
    overall_score = sum(scores) / len(scores)
    
    print(f"📊 Routing Accuracy: {routing_score*100:.1f}%")
    print(f"📊 Data Fetching: {data_score*100:.1f}%")
    print(f"📊 Volume Formatting: {volume_score*100:.1f}%")
    print(f"📊 Error Handling: {error_score*100:.1f}%")
    print(f"📊 Performance: {performance_score*100:.1f}%")
    print(f"\n🏆 OVERALL SCORE: {overall_score*100:.1f}%")
    
    if overall_score >= 0.9:
        print("\n🎉 EXCELLENT! Finnhub integration is working perfectly!")
        print("✅ Ready for production deployment")
        status = "EXCELLENT"
    elif overall_score >= 0.8:
        print("\n👍 GOOD! Finnhub integration is working well with minor issues")
        print("✅ Ready for production with monitoring")
        status = "GOOD"
    elif overall_score >= 0.7:
        print("\n⚠️ FAIR! Finnhub integration has some issues that need attention")
        print("🔧 Requires fixes before production")
        status = "FAIR"
    else:
        print("\n❌ POOR! Finnhub integration has significant issues")
        print("🚫 Not ready for production")
        status = "POOR"
    
    # Summary Report
    print(f"\n📋 INTEGRATION SUMMARY")
    print("-" * 30)
    print(f"Status: {status}")
    print(f"Finnhub Service: {'✅ Working' if finnhub_available else '❌ Not Available'}")
    print(f"US Stock Routing: {'✅ Working' if routing_score >= 0.8 else '❌ Issues'}")
    print(f"Data Quality: {'✅ Good' if data_score >= 0.8 else '❌ Issues'}")
    print(f"Volume Formatting: {'✅ Consistent' if volume_score >= 0.8 else '❌ Inconsistent'}")
    print(f"Error Handling: {'✅ Robust' if error_score >= 0.8 else '❌ Needs Work'}")
    print(f"Performance: {'✅ Acceptable' if performance_score >= 0.7 else '❌ Slow'}")
    
    return overall_score >= 0.8


def main():
    """Run final integration verification"""
    success = test_complete_integration()
    
    if success:
        print(f"\n🚀 DEPLOYMENT READY!")
        print(f"Finnhub integration has been successfully implemented and tested.")
        return True
    else:
        print(f"\n🔧 NEEDS ATTENTION!")
        print(f"Please address the issues before deploying to production.")
        return False


if __name__ == "__main__":
    main()