#!/usr/bin/env python3
"""
Complete Data Reset and Refill Script
Clears all existing financial data and refills with fresh Google Sheets data
using the new 24-hour cycle system.
"""

import os
import sys
import django
import time
from datetime import datetime

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'C8V2.settings')
django.setup()

from django.db import transaction
from django.core.management import call_command
from investments.tasks import daily_complete_data_sync
from investments.google_sheets_service import google_sheets_service
from investments.database_cache_service import DatabaseCacheService
from investments.models import Investment
from investments.market_data_models import CentralizedOHLCData, CentralizedMarketData, AssetSymbol
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class DataResetAndRefillManager:
    """Manages the complete data reset and refill process"""
    
    def __init__(self):
        self.stats = {
            'start_time': datetime.now(),
            'investments_cleared': 0,
            'centralized_data_cleared': 0,
            'symbols_processed': 0,
            'successful_updates': 0,
            'failed_updates': 0,
            'errors': []
        }
    
    def run_complete_reset_and_refill(self, confirm=False):
        """Run the complete data reset and refill process"""
        if not confirm:
            print("🚨 WARNING: This will PERMANENTLY DELETE all existing financial data!")
            print("This includes:")
            print("  - All price data in investments")
            print("  - All centralized OHLC data")
            print("  - All centralized market data")
            print("  - All data fetch logs")
            print("\nTo proceed, run with: python reset_and_refill_data.py --confirm")
            return False
        
        print("🚀 Starting Complete Data Reset and Refill Process...")
        print("="*60)
        
        # Step 1: Clear all existing data
        self._clear_all_data()
        
        # Step 2: Verify Google Sheets availability
        if not self._verify_google_sheets():
            return False
        
        # Step 3: Run the daily complete data sync
        self._run_data_sync()
        
        # Step 4: Verify data was populated
        self._verify_data_population()
        
        # Step 5: Show final statistics
        self._show_final_stats()
        
        return True
    
    def _clear_all_data(self):
        """Clear all existing financial data"""
        print("\n🧹 Step 1: Clearing All Existing Data...")
        
        try:
            with transaction.atomic():
                # Get counts before clearing
                investment_count = Investment.objects.count()
                ohlc_count = CentralizedOHLCData.objects.count()
                market_count = CentralizedMarketData.objects.count()
                
                print(f"   📊 Found {investment_count} investments")
                print(f"   📊 Found {ohlc_count} OHLC data records")
                print(f"   📊 Found {market_count} market data records")
                
                # Clear investment price data
                if investment_count > 0:
                    Investment.objects.update(
                        current_price=0,
                        daily_change=0,
                        daily_change_percent=0,
                        total_value=0,
                        total_gain_loss=0,
                        total_gain_loss_percent=0,
                        pe_ratio=None,
                        fifty_two_week_high=None,
                        fifty_two_week_low=None,
                        volume=None,
                        market_cap=None,
                        growth_rate=None,
                        chart_data=[],
                        ohlc_data=[],
                        ohlc_last_updated=None,
                        enhanced_data_last_updated=None,
                        data_enriched=False,
                        enrichment_attempted=False,
                        enrichment_error=None,
                        ai_analysis=None,
                        logo_url=None,
                        sector=None
                    )
                    print(f"   ✅ Cleared price data for {investment_count} investments")
                
                # Clear centralized data
                CentralizedOHLCData.objects.all().delete()
                CentralizedMarketData.objects.all().delete()
                print(f"   ✅ Deleted {ohlc_count} OHLC records")
                print(f"   ✅ Deleted {market_count} market data records")
                
                # Reset asset symbols but keep them
                AssetSymbol.objects.update(update_frequency=0)
                print(f"   ✅ Reset asset symbol frequencies")
                
                # Clear Google Sheets cache
                google_sheets_service.clear_cache()
                print(f"   ✅ Cleared Google Sheets cache")
                
                self.stats['investments_cleared'] = investment_count
                self.stats['centralized_data_cleared'] = ohlc_count + market_count
                
        except Exception as e:
            error_msg = f"Error clearing data: {e}"
            self.stats['errors'].append(error_msg)
            print(f"   ❌ {error_msg}")
            raise
    
    def _verify_google_sheets(self):
        """Verify Google Sheets service is available"""
        print("\n🔗 Step 2: Verifying Google Sheets Connection...")
        
        if not google_sheets_service.is_available():
            error_msg = "Google Sheets service not available"
            self.stats['errors'].append(error_msg)
            print(f"   ❌ {error_msg}")
            print("   Please check your Google Sheets credentials and configuration")
            return False
        
        print("   ✅ Google Sheets service is available")
        
        # Test cache TTL settings
        print(f"   📋 OHLC Cache TTL: {google_sheets_service.OHLC_DATA_TTL / 3600:.1f} hours")
        print(f"   📋 Market Cache TTL: {google_sheets_service.MARKET_DATA_TTL / 3600:.1f} hours")
        
        if google_sheets_service.OHLC_DATA_TTL != 24 * 3600:
            print("   ⚠️  Warning: OHLC cache TTL is not set to 24 hours")
        
        return True
    
    def _run_data_sync(self):
        """Run the daily complete data sync task"""
        print("\n📥 Step 3: Running Complete Data Synchronization...")
        
        try:
            # Get list of symbols that will be processed
            symbols = list(Investment.objects.filter(
                asset_type__in=['stock', 'etf', 'crypto', 'mutual_fund']
            ).values_list('symbol', flat=True).distinct())
            
            self.stats['symbols_processed'] = len(symbols)
            print(f"   📊 Found {len(symbols)} unique symbols to process")
            print(f"   🔄 Starting data sync at {datetime.now().strftime('%H:%M:%S')}...")
            
            # Run the daily complete data sync task
            result = daily_complete_data_sync()
            print(f"   📝 Sync result: {result}")
            
            # Parse the result to get success/failure counts
            if isinstance(result, str) and 'market' in result and 'OHLC' in result:
                parts = result.split(',')
                for part in parts:
                    if 'market' in part and 'updated' in part:
                        try:
                            count = int(part.split()[0].split(':')[1].strip())
                            self.stats['successful_updates'] += count
                        except:
                            pass
                    elif 'OHLC' in part and 'updated' in part:
                        try:
                            count = int(part.split()[0])
                            self.stats['successful_updates'] += count
                        except:
                            pass
                    elif 'failures' in part:
                        try:
                            count = int(part.split()[0])
                            self.stats['failed_updates'] = count
                        except:
                            pass
            
            print(f"   ✅ Data synchronization completed at {datetime.now().strftime('%H:%M:%S')}")
            
        except Exception as e:
            error_msg = f"Error during data sync: {e}"
            self.stats['errors'].append(error_msg)
            print(f"   ❌ {error_msg}")
            raise
    
    def _verify_data_population(self):
        """Verify that data was successfully populated"""
        print("\n✅ Step 4: Verifying Data Population...")
        
        # Check database cache status
        cache_status = DatabaseCacheService.get_cache_status()
        
        print(f"   📊 Fresh market data records: {cache_status['fresh_market_data']}")
        print(f"   📊 Total market data records: {cache_status['total_market_data']}")
        print(f"   📊 Fresh OHLC data records: {cache_status['fresh_ohlc_data']}")
        print(f"   📊 Total OHLC data records: {cache_status['total_ohlc_data']}")
        print(f"   📈 Market cache hit rate: {cache_status['market_cache_hit_rate']:.1f}%")
        print(f"   📈 OHLC cache hit rate: {cache_status['ohlc_cache_hit_rate']:.1f}%")
        
        # Check if we have any data at all
        total_data = cache_status['total_market_data'] + cache_status['total_ohlc_data']
        if total_data == 0:
            print("   ⚠️  Warning: No data was populated. Check Google Sheets connectivity.")
        else:
            print(f"   ✅ Successfully populated {total_data} data records")
        
        # Check some sample investments
        sample_investments = Investment.objects.filter(current_price__gt=0)[:5]
        if sample_investments.exists():
            print("   📋 Sample updated investments:")
            for inv in sample_investments:
                print(f"      • {inv.symbol}: ${inv.current_price} ({inv.daily_change_percent:+.2f}%)")
        else:
            print("   ⚠️  Warning: No investments have updated prices")
    
    def _show_final_stats(self):
        """Show final statistics"""
        print("\n" + "="*60)
        print("🎉 DATA RESET AND REFILL COMPLETED!")
        print("="*60)
        
        duration = datetime.now() - self.stats['start_time']
        
        print(f"⏱️  Total Duration: {duration}")
        print(f"🧹 Investments Cleared: {self.stats['investments_cleared']}")
        print(f"🗑️  Centralized Data Cleared: {self.stats['centralized_data_cleared']}")
        print(f"🎯 Symbols Processed: {self.stats['symbols_processed']}")
        print(f"✅ Successful Updates: {self.stats['successful_updates']}")
        print(f"❌ Failed Updates: {self.stats['failed_updates']}")
        
        if self.stats['errors']:
            print(f"\n⚠️  Errors Encountered: {len(self.stats['errors'])}")
            for error in self.stats['errors']:
                print(f"   • {error}")
        else:
            print("\n🎊 Process completed without errors!")
        
        print("\n📋 Next Steps:")
        print("   1. Check your frontend app - data should now be served from database cache")
        print("   2. The system will automatically update data daily at 12:01 AM")
        print("   3. Frontend requests will be much faster (database vs API calls)")
        print("   4. Monitor cache hit rates for optimal performance")


def main():
    """Main execution function"""
    import sys
    
    confirm = '--confirm' in sys.argv
    
    manager = DataResetAndRefillManager()
    success = manager.run_complete_reset_and_refill(confirm=confirm)
    
    if not success and not confirm:
        print("\nTo proceed with the data reset, run:")
        print("python reset_and_refill_data.py --confirm")
        sys.exit(1)
    elif not success:
        print("\n❌ Data reset and refill failed!")
        sys.exit(1)
    else:
        print("\n🎉 Data reset and refill completed successfully!")


if __name__ == "__main__":
    main()