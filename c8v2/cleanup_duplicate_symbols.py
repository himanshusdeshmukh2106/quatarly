#!/usr/bin/env python3
"""
Database Cleanup Script
Removes duplicate symbols and fixes inconsistencies in centralized data tables
"""

import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'C8V2.settings')
django.setup()

from django.db import transaction
from investments.market_data_models import AssetSymbol, CentralizedOHLCData, CentralizedMarketData
from investments.models import Investment
from collections import defaultdict
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class DatabaseCleanupService:
    """Service to cleanup duplicate symbols and fix data inconsistencies"""
    
    def __init__(self):
        self.stats = {
            'duplicate_asset_symbols_removed': 0,
            'duplicate_ohlc_data_removed': 0,
            'duplicate_market_data_removed': 0,
            'orphaned_records_removed': 0,
            'symbols_consolidated': 0
        }
    
    def run_complete_cleanup(self):
        """Run complete database cleanup"""
        print("🧹 Starting Database Cleanup...")
        print("=" * 50)
        
        with transaction.atomic():
            # Step 1: Clean duplicate AssetSymbols
            self._cleanup_duplicate_asset_symbols()
            
            # Step 2: Clean duplicate OHLC data
            self._cleanup_duplicate_ohlc_data()
            
            # Step 3: Clean duplicate market data
            self._cleanup_duplicate_market_data()
            
            # Step 4: Remove orphaned records
            self._cleanup_orphaned_records()
            
            # Step 5: Consolidate symbols from investments
            self._consolidate_symbols_from_investments()
        
        self._show_cleanup_results()
    
    def _cleanup_duplicate_asset_symbols(self):
        """Remove duplicate AssetSymbol entries"""
        print("🔍 Step 1: Cleaning duplicate AssetSymbol entries...")
        
        # Find duplicates by (symbol, asset_type)
        symbol_groups = defaultdict(list)
        for asset_symbol in AssetSymbol.objects.all():
            key = (asset_symbol.symbol, asset_symbol.asset_type)
            symbol_groups[key].append(asset_symbol)
        
        duplicates_removed = 0
        for key, asset_symbols in symbol_groups.items():
            if len(asset_symbols) > 1:
                # Keep the one with the latest update or highest frequency
                keeper = max(asset_symbols, key=lambda x: (x.last_updated, x.update_frequency))
                
                # Remove duplicates
                for asset_symbol in asset_symbols:
                    if asset_symbol.id != keeper.id:
                        print(f"  🗑️  Removing duplicate: {asset_symbol.symbol} ({asset_symbol.asset_type}) ID:{asset_symbol.id}")
                        
                        # Transfer any related data to the keeper
                        CentralizedOHLCData.objects.filter(asset_symbol=asset_symbol).update(asset_symbol=keeper)
                        CentralizedMarketData.objects.filter(asset_symbol=asset_symbol).update(asset_symbol=keeper)
                        
                        asset_symbol.delete()
                        duplicates_removed += 1
        
        self.stats['duplicate_asset_symbols_removed'] = duplicates_removed
        print(f"  ✅ Removed {duplicates_removed} duplicate AssetSymbol entries")
    
    def _cleanup_duplicate_ohlc_data(self):
        """Remove duplicate OHLC data entries"""
        print("🔍 Step 2: Cleaning duplicate OHLC data entries...")
        
        # Find duplicates by (symbol, asset_type, timeframe)
        ohlc_groups = defaultdict(list)
        for ohlc_data in CentralizedOHLCData.objects.all():
            key = (ohlc_data.symbol, ohlc_data.asset_type, ohlc_data.timeframe)
            ohlc_groups[key].append(ohlc_data)
        
        duplicates_removed = 0
        for key, ohlc_entries in ohlc_groups.items():
            if len(ohlc_entries) > 1:
                # Keep the one with the latest update and most data points
                keeper = max(ohlc_entries, key=lambda x: (x.last_updated, x.data_points_count or 0))
                
                # Remove duplicates
                for ohlc_entry in ohlc_entries:
                    if ohlc_entry.id != keeper.id:
                        print(f"  🗑️  Removing duplicate OHLC: {ohlc_entry.symbol} ({ohlc_entry.timeframe}) ID:{ohlc_entry.id}")
                        ohlc_entry.delete()
                        duplicates_removed += 1
        
        self.stats['duplicate_ohlc_data_removed'] = duplicates_removed
        print(f"  ✅ Removed {duplicates_removed} duplicate OHLC data entries")
    
    def _cleanup_duplicate_market_data(self):
        """Remove duplicate market data entries"""
        print("🔍 Step 3: Cleaning duplicate market data entries...")
        
        # Find duplicates by (symbol, asset_type)
        market_groups = defaultdict(list)
        for market_data in CentralizedMarketData.objects.all():
            key = (market_data.symbol, market_data.asset_type)
            market_groups[key].append(market_data)
        
        duplicates_removed = 0
        for key, market_entries in market_groups.items():
            if len(market_entries) > 1:
                # Keep the one with the latest update and highest completeness score
                keeper = max(market_entries, key=lambda x: (x.last_updated, x.data_completeness_score or 0))
                
                # Remove duplicates
                for market_entry in market_entries:
                    if market_entry.id != keeper.id:
                        print(f"  🗑️  Removing duplicate market data: {market_entry.symbol} ID:{market_entry.id}")
                        market_entry.delete()
                        duplicates_removed += 1
        
        self.stats['duplicate_market_data_removed'] = duplicates_removed
        print(f"  ✅ Removed {duplicates_removed} duplicate market data entries")
    
    def _cleanup_orphaned_records(self):
        """Remove orphaned records that don't have corresponding AssetSymbol"""
        print("🔍 Step 4: Cleaning orphaned records...")
        
        orphaned_removed = 0
        
        # Find OHLC data without corresponding AssetSymbol
        orphaned_ohlc = CentralizedOHLCData.objects.filter(asset_symbol__isnull=True)
        orphaned_count = orphaned_ohlc.count()
        if orphaned_count > 0:
            print(f"  🗑️  Removing {orphaned_count} orphaned OHLC records")
            orphaned_ohlc.delete()
            orphaned_removed += orphaned_count
        
        # Find market data without corresponding AssetSymbol
        orphaned_market = CentralizedMarketData.objects.filter(asset_symbol__isnull=True)
        orphaned_count = orphaned_market.count()
        if orphaned_count > 0:
            print(f"  🗑️  Removing {orphaned_count} orphaned market data records")
            orphaned_market.delete()
            orphaned_removed += orphaned_count
        
        self.stats['orphaned_records_removed'] = orphaned_removed
        print(f"  ✅ Removed {orphaned_removed} orphaned records")
    
    def _consolidate_symbols_from_investments(self):
        """Ensure all investment symbols have corresponding AssetSymbol entries"""
        print("🔍 Step 5: Consolidating symbols from investments...")
        
        # Get all unique symbols from investments
        investment_symbols = Investment.objects.values('symbol', 'asset_type').distinct()
        
        consolidated = 0
        for inv_data in investment_symbols:
            symbol = inv_data['symbol']
            asset_type = inv_data['asset_type']
            
            if symbol:  # Skip empty symbols
                asset_symbol, created = AssetSymbol.objects.get_or_create(
                    symbol=symbol,
                    asset_type=asset_type,
                    defaults={
                        'name': symbol,
                        'is_active': True,
                        'update_frequency': 1
                    }
                )
                
                if created:
                    print(f"  ➕ Created AssetSymbol: {symbol} ({asset_type})")
                    consolidated += 1
        
        self.stats['symbols_consolidated'] = consolidated
        print(f"  ✅ Consolidated {consolidated} symbols from investments")
    
    def _show_cleanup_results(self):
        """Show final cleanup results"""
        print("\n" + "=" * 50)
        print("🎉 DATABASE CLEANUP COMPLETED!")
        print("=" * 50)
        
        print(f"📊 Cleanup Statistics:")
        print(f"  • Duplicate AssetSymbols removed: {self.stats['duplicate_asset_symbols_removed']}")
        print(f"  • Duplicate OHLC data removed: {self.stats['duplicate_ohlc_data_removed']}")
        print(f"  • Duplicate market data removed: {self.stats['duplicate_market_data_removed']}")
        print(f"  • Orphaned records removed: {self.stats['orphaned_records_removed']}")
        print(f"  • Symbols consolidated: {self.stats['symbols_consolidated']}")
        
        # Show current status
        print(f"\n📋 Current Database Status:")
        print(f"  • AssetSymbol entries: {AssetSymbol.objects.count()}")
        print(f"  • OHLC data entries: {CentralizedOHLCData.objects.count()}")
        print(f"  • Market data entries: {CentralizedMarketData.objects.count()}")
        print(f"  • Investment entries: {Investment.objects.count()}")
        
        print(f"\n✨ Database is now clean and optimized!")


def main():
    """Main execution function"""
    cleanup_service = DatabaseCleanupService()
    cleanup_service.run_complete_cleanup()


if __name__ == "__main__":
    main()