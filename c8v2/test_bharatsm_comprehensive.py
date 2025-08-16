#!/usr/bin/env python
"""
Comprehensive test script for BharatSM integration
Run this script to test BharatSM functionality with real API calls
"""

import os
import sys
import django
from decimal import Decimal

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'C8V2.settings')
django.setup()

from investments.bharatsm_service import BharatSMService, bharatsm_service, get_bharatsm_frontend_data
from investments.data_enrichment_service import DataEnrichmentService
from investments.models import Investment
from django.contrib.auth import get_user_model

User = get_user_model()


def test_bharatsm_availability():
    """Test if BharatSM service is available"""
    print("=" * 60)
    print("TESTING BHARATSM AVAILABILITY")
    print("=" * 60)
    
    if bharatsm_service:
        print("✅ BharatSM service is available")
        return True
    else:
        print("❌ BharatSM service is not available")
        print("   Make sure 'Fundamentals' library is installed: pip install Fundamentals")
        return False


def test_bharatsm_frontend_data():
    """Test BharatSM frontend data fetching"""
    print("\n" + "=" * 60)
    print("TESTING BHARATSM FRONTEND DATA FETCHING")
    print("=" * 60)
    
    if not bharatsm_service:
        print("❌ BharatSM service not available, skipping tests")
        return
    
    # Test with well-known Indian stocks
    test_symbols = ['TCS', 'RELIANCE', 'INFY', 'HDFCBANK', 'WIPRO']
    
    for symbol in test_symbols:
        print(f"\n📊 Testing {symbol}:")
        try:
            data = get_bharatsm_frontend_data(symbol)
            
            if data:
                print(f"   ✅ Data fetched successfully")
                print(f"   📈 Volume: {data.get('volume', 'N/A')}")
                print(f"   💰 Market Cap: {data.get('market_cap', 'N/A')}")
                print(f"   📊 P/E Ratio: {data.get('pe_ratio', 'N/A')}")
                print(f"   📈 Growth Rate: {data.get('growth_rate', 'N/A')}%")
                print(f"   🏢 Company: {data.get('company_name', 'N/A')}")
                print(f"   🏭 Sector: {data.get('sector', 'N/A')}")
            else:
                print(f"   ⚠️  No data returned for {symbol}")
                
        except Exception as e:
            print(f"   ❌ Error fetching data for {symbol}: {e}")


def test_bharatsm_basic_info():
    """Test BharatSM basic info fetching"""
    print("\n" + "=" * 60)
    print("TESTING BHARATSM BASIC INFO FETCHING")
    print("=" * 60)
    
    if not bharatsm_service:
        print("❌ BharatSM service not available, skipping tests")
        return
    
    test_symbols = ['TCS', 'RELIANCE', 'INFY']
    
    for symbol in test_symbols:
        print(f"\n🔍 Testing basic info for {symbol}:")
        try:
            info = bharatsm_service.get_basic_stock_info(symbol)
            
            if info:
                print(f"   ✅ Basic info fetched successfully")
                print(f"   🏢 Name: {info.get('name', 'N/A')}")
                print(f"   🏭 Sector: {info.get('sector', 'N/A')}")
                print(f"   📊 Symbol: {info.get('symbol', 'N/A')}")
                print(f"   🏛️  Exchange: {info.get('exchange', 'N/A')}")
            else:
                print(f"   ⚠️  No basic info returned for {symbol}")
                
        except Exception as e:
            print(f"   ❌ Error fetching basic info for {symbol}: {e}")


def test_data_enrichment_integration():
    """Test data enrichment service with BharatSM"""
    print("\n" + "=" * 60)
    print("TESTING DATA ENRICHMENT INTEGRATION")
    print("=" * 60)
    
    # Create test user and investment
    try:
        user, created = User.objects.get_or_create(
            username='bharatsm_test_user',
            defaults={
                'email': 'test@bharatsm.com',
                'first_name': 'BharatSM',
                'last_name': 'Test'
            }
        )
        
        if created:
            user.set_password('testpass123')
            user.save()
            print("✅ Created test user")
        else:
            print("✅ Using existing test user")
        
        # Create test investment
        investment, created = Investment.objects.get_or_create(
            user=user,
            symbol='TCS',
            asset_type='stock',
            defaults={
                'name': 'Tata Consultancy Services',
                'quantity': Decimal('10'),
                'average_purchase_price': Decimal('3500.00'),
                'current_price': Decimal('3500.00'),
                'exchange': 'NSE'
            }
        )
        
        if created:
            print("✅ Created test investment")
        else:
            print("✅ Using existing test investment")
        
        # Test data enrichment
        print(f"\n🔄 Testing data enrichment for {investment.symbol}:")
        
        # Store original values
        original_volume = investment.volume
        original_market_cap = investment.market_cap
        original_pe_ratio = investment.pe_ratio
        original_growth_rate = investment.growth_rate
        
        print(f"   📊 Before enrichment:")
        print(f"      Volume: {original_volume}")
        print(f"      Market Cap: {original_market_cap}")
        print(f"      P/E Ratio: {original_pe_ratio}")
        print(f"      Growth Rate: {original_growth_rate}")
        
        # Perform enrichment
        success = DataEnrichmentService.enrich_investment_data(investment.id)
        
        if success:
            print("   ✅ Data enrichment completed successfully")
            
            # Refresh from database
            investment.refresh_from_db()
            
            print(f"   📊 After enrichment:")
            print(f"      Volume: {investment.volume}")
            print(f"      Market Cap: {investment.market_cap}")
            print(f"      P/E Ratio: {investment.pe_ratio}")
            print(f"      Growth Rate: {investment.growth_rate}")
            
            # Check if any data was updated
            data_updated = (
                investment.volume != original_volume or
                investment.market_cap != original_market_cap or
                investment.pe_ratio != original_pe_ratio or
                investment.growth_rate != original_growth_rate
            )
            
            if data_updated:
                print("   ✅ Investment data was successfully updated")
            else:
                print("   ⚠️  Investment data was not updated (API might have failed)")
        else:
            print("   ❌ Data enrichment failed")
            print(f"   Error: {investment.enrichment_error}")
        
    except Exception as e:
        print(f"❌ Error in data enrichment integration test: {e}")


def test_volume_formatting():
    """Test volume formatting functionality"""
    print("\n" + "=" * 60)
    print("TESTING VOLUME FORMATTING")
    print("=" * 60)
    
    if not bharatsm_service:
        print("❌ BharatSM service not available, skipping tests")
        return
    
    test_volumes = [
        (1500000000, '1.5B'),
        (2500000, '2.5M'),
        (750000, '750.0K'),
        (500, '500')
    ]
    
    for volume, expected in test_volumes:
        result = bharatsm_service._format_volume(volume)
        if result == expected:
            print(f"✅ {volume:,} -> {result} (expected: {expected})")
        else:
            print(f"❌ {volume:,} -> {result} (expected: {expected})")


def test_error_handling():
    """Test error handling in BharatSM integration"""
    print("\n" + "=" * 60)
    print("TESTING ERROR HANDLING")
    print("=" * 60)
    
    if not bharatsm_service:
        print("❌ BharatSM service not available, skipping tests")
        return
    
    # Test with invalid symbol
    print("🔍 Testing with invalid symbol:")
    try:
        result = get_bharatsm_frontend_data('INVALID_SYMBOL_12345')
        if result == {}:
            print("   ✅ Invalid symbol handled correctly (returned empty dict)")
        else:
            print(f"   ⚠️  Unexpected result for invalid symbol: {result}")
    except Exception as e:
        print(f"   ❌ Exception with invalid symbol: {e}")
    
    # Test with empty symbol
    print("\n🔍 Testing with empty symbol:")
    try:
        result = get_bharatsm_frontend_data('')
        if result == {}:
            print("   ✅ Empty symbol handled correctly (returned empty dict)")
        else:
            print(f"   ⚠️  Unexpected result for empty symbol: {result}")
    except Exception as e:
        print(f"   ❌ Exception with empty symbol: {e}")


def main():
    """Run all BharatSM tests"""
    print("🚀 BHARATSM COMPREHENSIVE TEST SUITE")
    print("=" * 60)
    
    # Test availability first
    if not test_bharatsm_availability():
        print("\n❌ BharatSM service not available. Please install the Fundamentals library:")
        print("   pip install Fundamentals")
        return
    
    # Run all tests
    test_bharatsm_frontend_data()
    test_bharatsm_basic_info()
    test_data_enrichment_integration()
    test_volume_formatting()
    test_error_handling()
    
    print("\n" + "=" * 60)
    print("🎉 BHARATSM TEST SUITE COMPLETED")
    print("=" * 60)
    print("\n📝 Summary:")
    print("   - BharatSM service availability: ✅")
    print("   - Frontend data fetching: Tested with multiple symbols")
    print("   - Basic info fetching: Tested with multiple symbols")
    print("   - Data enrichment integration: Tested with real investment")
    print("   - Volume formatting: Tested with various ranges")
    print("   - Error handling: Tested with invalid inputs")
    print("\n💡 Note: Some API calls may fail due to network issues or API limitations.")
    print("   This is normal and the system should handle these gracefully.")


if __name__ == '__main__':
    main()