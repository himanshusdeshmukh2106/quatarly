from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone
from decimal import Decimal
from investments.models import Investment
from investments.google_sheets_service import GoogleSheetsFinanceService
from investments.data_enrichment_service import DataEnrichmentService
from investments.centralized_data_service import CentralizedDataFetchingService
import logging
import time

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Refill database with fresh Google Finance data'

    def add_arguments(self, parser):
        parser.add_argument(
            '--batch-size',
            type=int,
            default=10,
            help='Number of investments to process in each batch',
        )
        parser.add_argument(
            '--delay',
            type=float,
            default=1.0,
            help='Delay between batches in seconds to avoid rate limiting',
        )
        parser.add_argument(
            '--user-id',
            type=int,
            help='Refill data for specific user ID only',
        )
        parser.add_argument(
            '--asset-type',
            choices=['stock', 'etf', 'crypto', 'bond', 'mutual_fund'],
            help='Refill data for specific asset type only',
        )

    def handle(self, *args, **options):
        batch_size = options['batch_size']
        delay = options['delay'] 
        user_id = options.get('user_id')
        asset_type = options.get('asset_type')

        self.stdout.write(
            self.style.WARNING('Starting Google Finance data refill process...')
        )

        # Initialize Google Sheets service
        google_sheets_service = GoogleSheetsFinanceService()
        
        if not google_sheets_service.is_available():
            self.stdout.write(
                self.style.ERROR(
                    '❌ Google Sheets service is not available.\n'
                    'Please check your Google Sheets credentials and configuration.'
                )
            )
            return

        # Get investments to process
        investments_query = Investment.objects.filter(
            asset_type__in=['stock', 'etf', 'crypto', 'bond', 'mutual_fund']
        )
        
        if user_id:
            investments_query = investments_query.filter(user_id=user_id)
            
        if asset_type:
            investments_query = investments_query.filter(asset_type=asset_type)
            
        investments = list(investments_query.order_by('symbol'))
        total_investments = len(investments)

        if total_investments == 0:
            self.stdout.write('No investments found to process')
            return

        self.stdout.write(f'Found {total_investments} investments to refill with Google Finance data')

        # Process investments in batches
        successful_updates = 0
        failed_updates = 0
        
        for i in range(0, total_investments, batch_size):
            batch = investments[i:i + batch_size]
            batch_number = (i // batch_size) + 1
            total_batches = (total_investments + batch_size - 1) // batch_size
            
            self.stdout.write(f'\nProcessing batch {batch_number}/{total_batches} ({len(batch)} investments)...')
            
            for investment in batch:
                try:
                    success = self._process_investment(investment, google_sheets_service)
                    if success:
                        successful_updates += 1
                        self.stdout.write(
                            self.style.SUCCESS(f'  ✅ {investment.symbol} ({investment.name})')
                        )
                    else:
                        failed_updates += 1
                        self.stdout.write(
                            self.style.WARNING(f'  ⚠️ {investment.symbol} ({investment.name}) - No data available')
                        )
                        
                except Exception as e:
                    failed_updates += 1
                    logger.error(f"Error processing {investment.symbol}: {e}")
                    self.stdout.write(
                        self.style.ERROR(f'  ❌ {investment.symbol} ({investment.name}) - Error: {e}')
                    )

            # Add delay between batches if not the last batch
            if i + batch_size < total_investments and delay > 0:
                self.stdout.write(f'Waiting {delay} seconds before next batch...')
                time.sleep(delay)

        # Final summary
        self.stdout.write(f'\n' + '='*60)
        self.stdout.write(
            self.style.SUCCESS(
                f'🎉 Google Finance data refill completed!\n'
                f'Successfully updated: {successful_updates}/{total_investments} investments\n'
                f'Failed updates: {failed_updates}/{total_investments} investments'
            )
        )
        
        if failed_updates > 0:
            self.stdout.write(
                self.style.WARNING(
                    f'Note: {failed_updates} investments failed to update. '
                    'This may be due to invalid symbols or unavailable data.'
                )
            )

    def _process_investment(self, investment, google_sheets_service):
        """Process a single investment with Google Finance data"""
        try:
            if not investment.symbol:
                return False

            # Register symbol in centralized system
            CentralizedDataFetchingService.register_symbol(
                symbol=investment.symbol,
                asset_type=investment.asset_type,
                name=investment.name or '',
                exchange=investment.exchange or '',
                currency=investment.currency or 'INR'
            )

            # Fetch OHLC data (4-hour cache)
            ohlc_data = google_sheets_service.fetch_ohlc_data(
                symbol=investment.symbol,
                days=30  # 30 days of historical data
            )

            # Fetch market data (24-hour cache) 
            market_data_result = google_sheets_service.fetch_market_data_batch(
                symbols=[investment.symbol]
            )
            market_data = market_data_result.get(investment.symbol, {})

            # Update investment with Google Finance data
            updated = False

            # Process OHLC data
            if ohlc_data and len(ohlc_data) > 0:
                # Get latest price from OHLC data
                latest_data = ohlc_data[-1] if ohlc_data else {}
                current_price = latest_data.get('close')
                
                if current_price and current_price > 0:
                    investment.current_price = Decimal(str(current_price))
                    
                    # Calculate daily change if we have previous data
                    if len(ohlc_data) >= 2:
                        previous_data = ohlc_data[-2]
                        previous_close = previous_data.get('close', 0)
                        if previous_close > 0:
                            daily_change = current_price - previous_close
                            daily_change_percent = (daily_change / previous_close) * 100
                            investment.daily_change = Decimal(str(daily_change))
                            investment.daily_change_percent = Decimal(str(daily_change_percent))
                    
                    # Update total value and gains
                    investment.total_value = investment.current_price * investment.quantity
                    investment.total_gain_loss = investment.total_value - (investment.average_purchase_price * investment.quantity)
                    if investment.average_purchase_price > 0:
                        investment.total_gain_loss_percent = (investment.total_gain_loss / (investment.average_purchase_price * investment.quantity)) * 100

                    # Store OHLC data for charts
                    investment.ohlc_data = ohlc_data
                    investment.ohlc_last_updated = timezone.now()
                    updated = True

            # Process market data
            if market_data:
                # Update market data fields from Google Sheets response
                if market_data.get('pe'):
                    investment.pe_ratio = Decimal(str(market_data['pe']))
                if market_data.get('marketcap'):
                    investment.market_cap = Decimal(str(market_data['marketcap']))
                if market_data.get('volume'):
                    investment.volume = str(market_data['volume'])
                if market_data.get('high'):
                    investment.fifty_two_week_high = Decimal(str(market_data['high']))
                if market_data.get('low'):
                    investment.fifty_two_week_low = Decimal(str(market_data['low']))
                if market_data.get('name'):
                    investment.name = market_data['name']
                if market_data.get('exchange'):
                    investment.exchange = market_data['exchange']
                if market_data.get('currency'):
                    investment.currency = market_data['currency']

                # Update enhanced data timestamp
                investment.enhanced_data_last_updated = timezone.now()
                investment.data_enriched = True
                updated = True

            # Save the investment if any data was updated
            if updated:
                investment.save()
                return True
            else:
                return False

        except Exception as e:
            logger.error(f"Error processing investment {investment.symbol}: {e}")
            raise