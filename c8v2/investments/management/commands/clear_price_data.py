from django.core.management.base import BaseCommand
from django.db import transaction
from investments.models import Investment
from investments.market_data_models import CentralizedOHLCData, CentralizedMarketData, AssetSymbol, DataFetchLog
import logging

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Clear existing price data from the database to prepare for Google Finance refill'

    def add_arguments(self, parser):
        parser.add_argument(
            '--confirm',
            action='store_true',
            help='Confirm that you want to clear all price data',
        )
        parser.add_argument(
            '--clear-centralized',
            action='store_true', 
            help='Also clear centralized market data',
        )

    def handle(self, *args, **options):
        if not options['confirm']:
            self.stdout.write(
                self.style.ERROR(
                    'This will clear ALL existing price data from the database!\n'
                    'To confirm this action, run the command with --confirm flag'
                )
            )
            return

        self.stdout.write(
            self.style.WARNING('Starting price data clearing process...')
        )

        try:
            with transaction.atomic():
                # Clear price-related fields from Investment model
                investment_count = Investment.objects.count()
                
                if investment_count > 0:
                    self.stdout.write(f'Clearing price data for {investment_count} investments...')
                    
                    # Reset all price-related fields to default values
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
                    
                    self.stdout.write(
                        self.style.SUCCESS(f'✅ Cleared price data for {investment_count} investments')
                    )
                else:
                    self.stdout.write('No investments found to clear')

                # Clear centralized market data if requested
                if options['clear_centralized']:
                    self.stdout.write('Clearing centralized market data...')
                    
                    # Clear OHLC data
                    ohlc_count = CentralizedOHLCData.objects.count()
                    CentralizedOHLCData.objects.all().delete()
                    
                    # Clear market data  
                    market_count = CentralizedMarketData.objects.count()
                    CentralizedMarketData.objects.all().delete()
                    
                    # Reset asset symbol update frequencies but keep the symbols
                    AssetSymbol.objects.update(
                        update_frequency=0
                    )
                    
                    # Clear data fetch logs
                    log_count = DataFetchLog.objects.count()
                    DataFetchLog.objects.all().delete()
                    
                    self.stdout.write(
                        self.style.SUCCESS(
                            f'✅ Cleared centralized data: {ohlc_count} OHLC records, '
                            f'{market_count} market data records, {log_count} fetch logs'
                        )
                    )

                self.stdout.write(
                    self.style.SUCCESS(
                        '\n🎉 Price data clearing completed successfully!\n'
                        'Database is now ready for Google Finance data refill.'
                    )
                )

        except Exception as e:
            logger.error(f"Error clearing price data: {e}")
            self.stdout.write(
                self.style.ERROR(f'❌ Error clearing price data: {e}')
            )
            raise