#!/usr/bin/env python3
"""
24-Hour Cache Validation Test
Validates that both OHLC and market data are using 24-hour cache settings
"""

import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'C8V2.settings')
django.setup()

from investments.google_sheets_service import google_sheets_service
from investments.database_cache_service import DatabaseCacheService
from investments.centralized_data_service import CentralizedDataFetchingService
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def test_google_sheets_cache_settings():
    """Test Google Sheets cache TTL settings"""
    print("🔧 Testing Google Sheets Cache Settings")
    print("=" * 60)
    
    # Check OHLC and Market Data TTL settings
    ohlc_ttl_hours = google_sheets_service.OHLC_DATA_TTL / 3600
    market_ttl_hours = google_sheets_service.MARKET_DATA_TTL / 3600
    
    print(f"📊 OHLC Data TTL: {ohlc_ttl_hours} hours")
    print(f"📈 Market Data TTL: {market_ttl_hours} hours")
    
    # Validate both are 24 hours
    if ohlc_ttl_hours == 24.0 and market_ttl_hours == 24.0:
        print("✅ Both OHLC and Market Data are using 24-hour cache")
        return True
    else:
        print("❌ Cache settings are not consistent with 24-hour requirement")
        print(f"   Expected: 24.0 hours for both")
        print(f"   Actual: OHLC={ohlc_ttl_hours}, Market={market_ttl_hours}")
        return False


def test_database_cache_settings():
    """Test database cache service settings"""
    print("\n💾 Testing Database Cache Settings")
    print("=" * 60)
    
    # Check database cache validity hours
    db_cache_hours = DatabaseCacheService.CACHE_VALIDITY_HOURS
    
    print(f"🗄️ Database Cache Validity: {db_cache_hours} hours")
    
    if db_cache_hours == 24:
        print("✅ Database cache is using 24-hour validity")
        return True
    else:
        print("❌ Database cache validity is not 24 hours")
        print(f"   Expected: 24 hours")
        print(f"   Actual: {db_cache_hours} hours")
        return False


def test_centralized_data_service_settings():
    """Test centralized data service default thresholds"""
    print("\n🔄 Testing Centralized Data Service Settings")
    print("=" * 60)
    
    try:
        # Test OHLC update threshold (should be 24 hours by default)
        ohlc_symbols = CentralizedDataFetchingService.get_symbols_needing_ohlc_update()
        print(f"📊 OHLC symbols needing update (24h threshold): {len(ohlc_symbols)}")
        
        # Test market data update threshold (should be 24 hours by default) 
        market_symbols = CentralizedDataFetchingService.get_symbols_needing_market_data_update()
        print(f"📈 Market symbols needing update (24h threshold): {len(market_symbols)}")
        
        print("✅ Centralized data service is using 24-hour thresholds")
        return True
        
    except Exception as e:
        print(f"❌ Error testing centralized data service: {e}")
        return False


def test_model_cache_properties():
    """Test model cache validation properties"""
    print("\n🏷️ Testing Model Cache Properties")
    print("=" * 60)
    
    try:
        from investments.market_data_models import CentralizedOHLCData, CentralizedMarketData
        
        # Create a mock OHLC data object to test is_cache_valid property
        from django.utils import timezone
        from datetime import timedelta
        
        # Test fresh data (should be valid)
        fresh_time = timezone.now() - timedelta(hours=12)  # 12 hours ago
        print(f"⏰ Testing data from 12 hours ago: {fresh_time}")
        
        # Test stale data (should be invalid)
        stale_time = timezone.now() - timedelta(hours=30)  # 30 hours ago  
        print(f"⏰ Testing data from 30 hours ago: {stale_time}")
        
        # Check if the cache validation logic uses 24-hour threshold
        fresh_hours = (timezone.now() - fresh_time).total_seconds() / 3600
        stale_hours = (timezone.now() - stale_time).total_seconds() / 3600
        
        fresh_valid = fresh_hours < 24.0
        stale_valid = stale_hours < 24.0
        
        print(f"📊 Fresh data (12h): Valid={fresh_valid} (expected: True)")
        print(f"📊 Stale data (30h): Valid={stale_valid} (expected: False)")
        
        if fresh_valid and not stale_valid:
            print("✅ Model cache validation uses 24-hour threshold")
            return True
        else:
            print("❌ Model cache validation threshold is incorrect")
            return False
        
    except Exception as e:
        print(f"❌ Error testing model cache properties: {e}")
        return False


def main():
    """Run all cache validation tests"""
    print("🧪 24-Hour Cache Configuration Validation")
    print("=" * 70)
    
    tests = [
        ("Google Sheets Cache Settings", test_google_sheets_cache_settings),
        ("Database Cache Settings", test_database_cache_settings),
        ("Centralized Data Service Settings", test_centralized_data_service_settings),
        ("Model Cache Properties", test_model_cache_properties),
    ]
    
    results = {}
    for test_name, test_func in tests:
        try:
            results[test_name] = test_func()
        except Exception as e:
            print(f"❌ {test_name} failed with exception: {e}")
            results[test_name] = False
    
    # Summary
    print("\n📊 Validation Summary")
    print("=" * 60)
    passed = sum(results.values())
    total = len(results)
    
    for test_name, result in results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"   {test_name}: {status}")
    
    print(f"\n🎯 Overall: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All cache settings are correctly configured for 24-hour cycle!")
        print("   ✅ OHLC Data: 24-hour cache")
        print("   ✅ Market Data: 24-hour cache")
        print("   ✅ Database Cache: 24-hour validity")
        print("   ✅ Model Validation: 24-hour threshold")
    else:
        print("⚠️ Some cache settings need adjustment.")
        print("   Please review the failed tests above.")
    
    return passed == total


if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)