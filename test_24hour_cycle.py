#!/usr/bin/env python3
"""
Test script for 24-hour data cycle implementation
Validates database caching, data freshness, and API integration
"""
import os
import sys
import django

# Setup Django
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'C8V2.settings')
django.setup()

from investments.database_cache_service import DatabaseCacheService
from investments.data_enrichment_service import DataEnrichmentService
from investments.market_data_models import CentralizedOHLCData, CentralizedMarketData
from investments.google_sheets_service import google_sheets_service

def test_database_cache():
    """Test database cache service"""
    print("=== Testing Database Cache Service ===")
    
    # Test cache status
    status = DatabaseCacheService.get_cache_status()
    print(f"Cache Status: {status}")
    
    # Test single symbol lookup
    test_symbol = 'RELIANCE'
    market_data = DatabaseCacheService.get_market_data(test_symbol, 'stock')
    print(f"Market data for {test_symbol}: {market_data is not None}")
    
    ohlc_data = DatabaseCacheService.get_ohlc_data(test_symbol, 'stock')
    print(f"OHLC data for {test_symbol}: {ohlc_data is not None}")

def test_data_enrichment():
    """Test data enrichment with database priority"""
    print("\n=== Testing Data Enrichment Service ===")
    
    test_symbol = 'TCS'
    
    # Test basic market data fetch
    basic_data = DataEnrichmentService.get_basic_market_data(test_symbol, 'stock')
    print(f"Basic market data for {test_symbol}: {basic_data.get('source', 'No data')}")

def test_google_sheets_cache():
    """Test Google Sheets cache settings"""
    print("\n=== Testing Google Sheets Cache ===")
    
    if google_sheets_service.is_available():
        print(f"OHLC Cache TTL: {google_sheets_service.OHLC_DATA_TTL / 3600} hours")
        print(f"Market Data TTL: {google_sheets_service.MARKET_DATA_TTL / 3600} hours")
    else:
        print("Google Sheets service not available")

def main():
    """Run all tests"""
    print("🔍 Testing 24-Hour Data Cycle Implementation\n")
    
    test_database_cache()
    test_data_enrichment()
    test_google_sheets_cache()
    
    print("\n✅ Testing completed!")

if __name__ == "__main__":
    main()