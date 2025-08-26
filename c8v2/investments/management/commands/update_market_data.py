from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from django.utils import timezone
from investments.models import Investment
from investments.data_enrichment_service import DataEnrichmentService
from decimal import Decimal
import logging
import time

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Update enhanced market data (PE ratio, market cap, etc.) for all investments'

    def add_arguments(self, parser):
        parser.add_argument(
            '--symbols',
            nargs='+',
            help='Specific symbols to update (optional)',
        )
        parser.add_argument(
            '--asset-type',
            type=str,
            help='Filter by asset type (stock, etf, etc.)',
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be updated without making changes',
        )
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
            help='Delay between API calls in seconds',
        )

    def handle(self, *args, **options):
        start_time = timezone.now()
        
        self.stdout.write(
            self.style.SUCCESS(
                f'Starting enhanced market data update at {start_time.strftime("%Y-%m-%d %H:%M:%S")}'
            )
        )

        # Build queryset
        queryset = Investment.objects.filter(
            asset_type__in=['stock', 'etf', 'mutual_fund']  # Only tradeable assets
        ).exclude(symbol__isnull=True).exclude(symbol__exact='')

        if options['symbols']:
            queryset = queryset.filter(symbol__in=[s.upper() for s in options['symbols']])
            
        if options['asset_type']:
            queryset = queryset.filter(asset_type=options['asset_type'])

        # Get unique symbols to avoid duplicate API calls
        unique_symbols = list(set(queryset.values_list('symbol', flat=True)))
        total_symbols = len(unique_symbols)
        
        self.stdout.write(f'Found {total_symbols} unique symbols to update')
        
        if options['dry_run']:
            self.stdout.write(self.style.WARNING('DRY RUN MODE - No changes will be made'))
            for symbol in unique_symbols[:10]:  # Show first 10
                self.stdout.write(f'  Would update: {symbol}')
            if total_symbols > 10:
                self.stdout.write(f'  ... and {total_symbols - 10} more')
            return

        success_count = 0
        error_count = 0
        batch_size = options['batch_size']
        delay = options['delay']

        # Process in batches
        for i in range(0, total_symbols, batch_size):
            batch_symbols = unique_symbols[i:i + batch_size]
            
            self.stdout.write(
                f'Processing batch {i // batch_size + 1}/{(total_symbols + batch_size - 1) // batch_size}'
            )

            for symbol in batch_symbols:
                try:
                    updated_count = self.update_symbol_data(symbol, dry_run=False)
                    success_count += updated_count
                    
                    if updated_count > 0:
                        self.stdout.write(
                            self.style.SUCCESS(f'  ✓ Updated {updated_count} investments for {symbol}')
                        )
                    else:
                        self.stdout.write(
                            self.style.WARNING(f'  - No data updated for {symbol}')
                        )
                        
                except Exception as e:
                    error_count += 1
                    self.stdout.write(
                        self.style.ERROR(f'  ✗ Error updating {symbol}: {str(e)}')
                    )
                    logger.error(f'Error updating market data for {symbol}: {e}')

                # Add delay between API calls
                if delay > 0:
                    time.sleep(delay)

        # Summary
        end_time = timezone.now()
        duration = end_time - start_time
        
        self.stdout.write('\n' + '=' * 50)
        self.stdout.write(self.style.SUCCESS('MARKET DATA UPDATE COMPLETE'))
        self.stdout.write(f'Duration: {duration}')
        self.stdout.write(f'Symbols processed: {total_symbols}')
        self.stdout.write(f'Investments updated: {success_count}')
        self.stdout.write(f'Errors: {error_count}')
        
        if error_count > 0:
            self.stdout.write(
                self.style.WARNING(f'⚠️  {error_count} symbols had errors - check logs for details')
            )

    def update_symbol_data(self, symbol: str, dry_run: bool = False) -> int:
        """Update market data for all investments with the given symbol"""
        investments = Investment.objects.filter(symbol=symbol)
        updated_count = 0
        
        if not investments.exists():
            return 0

        try:
            # Get enhanced market data from the data enrichment service
            sample_investment = investments.first()
            
            # Use the data enrichment service to get fresh data
            success = DataEnrichmentService.enrich_investment_data(sample_investment.id)
            
            if success:
                # Refresh the sample investment to get updated data
                sample_investment.refresh_from_db()
                
                # Apply the same data to all investments with this symbol
                update_fields = {}
                
                if sample_investment.pe_ratio:
                    update_fields['pe_ratio'] = sample_investment.pe_ratio
                    
                if sample_investment.market_cap:
                    update_fields['market_cap'] = sample_investment.market_cap
                    
                if sample_investment.volume:
                    update_fields['volume'] = sample_investment.volume
                    
                if sample_investment.growth_rate:
                    update_fields['growth_rate'] = sample_investment.growth_rate
                    
                if sample_investment.current_price and sample_investment.current_price > 0:
                    update_fields['current_price'] = sample_investment.current_price
                    
                if sample_investment.sector:
                    update_fields['sector'] = sample_investment.sector

                # Update all investments with this symbol
                if update_fields and not dry_run:
                    update_fields['last_updated'] = timezone.now()
                    updated_count = investments.update(**update_fields)
                    
                    # Recalculate performance metrics for each investment
                    for investment in investments:
                        if investment.current_price and investment.current_price > 0:
                            investment.total_value = investment.quantity * investment.current_price
                            investment.total_gain_loss = investment.total_value - (
                                investment.quantity * investment.average_purchase_price
                            )
                            
                            if investment.average_purchase_price > 0:
                                investment.total_gain_loss_percent = (
                                    investment.total_gain_loss / 
                                    (investment.quantity * investment.average_purchase_price) * 100
                                )
                            
                            investment.save(update_fields=[
                                'total_value', 'total_gain_loss', 'total_gain_loss_percent'
                            ])
                elif dry_run:
                    updated_count = investments.count()
                    
        except Exception as e:
            logger.error(f'Error in update_symbol_data for {symbol}: {e}')
            raise
            
        return updated_count