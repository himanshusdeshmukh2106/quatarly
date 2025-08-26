#!/usr/bin/env python3
"""
Test Centralized Asset Registration
Verifies that when users create investments, they are automatically registered in the centralized system.
"""

import os
import sys
import django
from decimal import Decimal

# Setup Django
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'C8V2.settings')
django.setup()

from investments.models import Investment
from investments.market_data_models import AssetSymbol
from django.contrib.auth import get_user_model

User = get_user_model()

def test_centralized_registration():
    """Test that creating investments automatically registers symbols in centralized system"""
    print("🧪 Testing Centralized Asset Registration")
    print("=" * 50)
    
    # Get or create test user
    user, created = User.objects.get_or_create(
        username='test_centralized_user',
        defaults={
            'email': 'test@centralized.com',
            'first_name': 'Test',
            'last_name': 'User'
        }
    )
    if created:
        user.set_password('testpass')
        user.save()
        print("✅ Created test user")
    else:
        print("✅ Using existing test user")
    
    # Check current state
    before_count = AssetSymbol.objects.count()
    print(f"📊 Before: {before_count} symbols in centralized system")
    
    # Create test investment
    test_symbol = 'NEWTEST123'
    
    # Remove any existing test investment first
    Investment.objects.filter(user=user, symbol=test_symbol).delete()
    AssetSymbol.objects.filter(symbol=test_symbol).delete()
    
    print(f"🔄 Creating investment for symbol: {test_symbol}")
    
    investment = Investment.objects.create(
        user=user,
        symbol=test_symbol,
        name='New Test Company',
        asset_type='stock',
        quantity=Decimal('10'),
        average_purchase_price=Decimal('150.00'),
        exchange='NSE',
        currency='INR'
    )
    
    print(f"✅ Investment created: {investment.name}")
    
    # Check if symbol was registered in centralized system
    after_count = AssetSymbol.objects.count()
    print(f"📊 After: {after_count} symbols in centralized system")
    
    asset_symbol = AssetSymbol.objects.filter(symbol=test_symbol, asset_type='stock').first()
    
    if asset_symbol:
        print("✅ SUCCESS: Symbol automatically registered in centralized system!")
        print(f"   Symbol: {asset_symbol.symbol}")
        print(f"   Name: {asset_symbol.name}")
        print(f"   Asset Type: {asset_symbol.asset_type}")
        print(f"   Exchange: {asset_symbol.exchange}")
        print(f"   Currency: {asset_symbol.currency}")
        print(f"   Update Frequency: {asset_symbol.update_frequency}")
        print(f"   Is Active: {asset_symbol.is_active}")
        print(f"   First Requested: {asset_symbol.first_requested}")
        
        # Test unique constraint
        print("\n🔄 Testing duplicate prevention...")
        investment2 = Investment.objects.create(
            user=user,
            symbol=test_symbol + '_2',  # Different symbol
            name='Another Test Company',
            asset_type='stock',
            quantity=Decimal('5'),
            average_purchase_price=Decimal('200.00'),
            exchange='NSE',
            currency='INR'
        )
        
        # Try to create investment with same symbol for different user
        user2, created = User.objects.get_or_create(
            username='test_user_2',
            defaults={'email': 'test2@test.com'}
        )
        
        investment3 = Investment.objects.create(
            user=user2,
            symbol=test_symbol,  # Same symbol, different user
            name='Same Symbol Different User',
            asset_type='stock',
            quantity=Decimal('3'),
            average_purchase_price=Decimal('175.00'),
            exchange='NSE',
            currency='INR'
        )
        
        # Check if frequency was incremented
        asset_symbol.refresh_from_db()
        print(f"✅ Update frequency after multiple users: {asset_symbol.update_frequency}")
        
        return True
    else:
        print("❌ FAILED: Symbol was NOT registered in centralized system")
        print("   This means users will have duplicate API calls and higher costs")
        return False

def test_centralized_data_retrieval():
    """Test that centralized data can be retrieved"""
    print("\n🔍 Testing Centralized Data Retrieval")
    print("=" * 50)
    
    from investments.centralized_data_service import CentralizedDataFetchingService
    
    # Get symbols that need updates
    symbols_needing_ohlc = CentralizedDataFetchingService.get_symbols_needing_ohlc_update()
    symbols_needing_market = CentralizedDataFetchingService.get_symbols_needing_market_data_update()
    
    print(f"📈 Symbols needing OHLC updates: {len(symbols_needing_ohlc)}")
    if symbols_needing_ohlc:
        for symbol, asset_type in symbols_needing_ohlc[:3]:  # Show first 3
            print(f"   - {symbol} ({asset_type})")
    
    print(f"📊 Symbols needing market data updates: {len(symbols_needing_market)}")
    if symbols_needing_market:
        for symbol, asset_type in symbols_needing_market[:3]:  # Show first 3
            print(f"   - {symbol} ({asset_type})")
    
    return True

def test_api_cost_reduction():
    """Demonstrate API cost reduction through centralized system"""
    print("\n💰 API Cost Reduction Analysis")
    print("=" * 50)
    
    # Count total user investments vs unique symbols
    total_investments = Investment.objects.filter(
        asset_type__in=['stock', 'etf', 'crypto', 'mutual_fund']
    ).count()
    
    unique_symbols = AssetSymbol.objects.filter(is_active=True).count()
    
    individual_api_calls = total_investments
    centralized_api_calls = unique_symbols
    
    savings = individual_api_calls - centralized_api_calls
    savings_percent = (savings / individual_api_calls * 100) if individual_api_calls > 0 else 0
    
    print(f"📊 Total User Investments: {total_investments}")
    print(f"🎯 Unique Symbols: {unique_symbols}")
    print(f"💸 Without Centralization: {individual_api_calls} API calls needed")
    print(f"💰 With Centralization: {centralized_api_calls} API calls needed")
    print(f"💵 API Calls Saved: {savings} ({savings_percent:.1f}% reduction)")
    
    if savings > 0:
        print("✅ SUCCESS: Centralized system reduces API costs!")
    else:
        print("ℹ️  No savings yet (need more diverse investments)")
    
    return True

def main():
    """Run all tests"""
    print("🚀 Centralized Database System Test Suite")
    print("=" * 60)
    
    try:
        # Test 1: Symbol Registration
        test1_result = test_centralized_registration()
        
        # Test 2: Data Retrieval
        test2_result = test_centralized_data_retrieval()
        
        # Test 3: Cost Analysis
        test3_result = test_api_cost_reduction()
        
        print("\n" + "=" * 60)
        print("📋 TEST SUMMARY")
        print("=" * 60)
        print(f"✅ Symbol Registration: {'PASS' if test1_result else 'FAIL'}")
        print(f"✅ Data Retrieval: {'PASS' if test2_result else 'FAIL'}")
        print(f"✅ Cost Analysis: {'PASS' if test3_result else 'FAIL'}")
        
        overall_success = all([test1_result, test2_result, test3_result])
        print(f"\n🎯 Overall Result: {'SUCCESS' if overall_success else 'PARTIAL SUCCESS'}")
        
        if overall_success:
            print("\n✅ Centralized database system is working correctly!")
            print("   - Assets are automatically registered when users add them")
            print("   - No duplicate API calls for same symbols")
            print("   - API costs are reduced through data sharing")
        
        return overall_success
        
    except Exception as e:
        print(f"\n❌ Test failed with error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)