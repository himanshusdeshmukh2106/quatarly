try:
    from celery import shared_task
    CELERY_AVAILABLE = True
except ImportError:
    # Celery not available, create dummy decorator
    def shared_task(func):
        return func
    CELERY_AVAILABLE = False
from .services import InvestmentService, AIInsightsService
from .models import Investment, PriceAlert
from .data_enrichment_service import DataEnrichmentService
from .bharatsm_service import final_bharatsm_service, get_bharatsm_frontend_data
from .perplexity_service import PerplexityAPIService
from .centralized_data_service import CentralizedDataFetchingService
from .google_sheets_service import google_sheets_service
from .market_data_models import AssetSymbol, CentralizedOHLCData, CentralizedMarketData
from django.contrib.auth import get_user_model
from django.utils import timezone
from decimal import Decimal
import logging

User = get_user_model()

logger = logging.getLogger(__name__)


@shared_task
def refresh_all_investment_prices():
    """Background task to refresh all investment prices"""
    try:
        updated_investments = InvestmentService.refresh_investment_prices()
        logger.info(f"Successfully updated {len(updated_investments)} investments")
        return f"Updated {len(updated_investments)} investments"
    except Exception as e:
        logger.error(f"Error in refresh_all_investment_prices task: {e}")
        raise


@shared_task
def refresh_user_investment_prices(user_id):
    """Background task to refresh investment prices for a specific user"""
    try:
        user = User.objects.get(id=user_id)
        updated_investments = InvestmentService.refresh_investment_prices(user=user)
        logger.info(f"Successfully updated {len(updated_investments)} investments for user {user.username}")
        return f"Updated {len(updated_investments)} investments for user {user.username}"
    except User.DoesNotExist:
        logger.error(f"User with id {user_id} not found")
        return f"User with id {user_id} not found"
    except Exception as e:
        logger.error(f"Error in refresh_user_investment_prices task: {e}")
        raise


@shared_task
def update_chart_data_for_all_investments():
    """Background task to update chart data for all investments"""
    try:
        investments = Investment.objects.all()
        updated_count = 0
        
        for investment in investments:
            try:
                InvestmentService.update_chart_data(investment)
                updated_count += 1
            except Exception as e:
                logger.error(f"Error updating chart data for {investment.symbol}: {e}")
        
        logger.info(f"Successfully updated chart data for {updated_count} investments")
        return f"Updated chart data for {updated_count} investments"
    except Exception as e:
        logger.error(f"Error in update_chart_data_for_all_investments task: {e}")
        raise


@shared_task
def generate_ai_analysis_for_all_investments():
    """Background task to generate AI analysis for all investments"""
    try:
        investments = Investment.objects.all()
        updated_count = 0
        
        for investment in investments:
            try:
                InvestmentService.generate_ai_analysis(investment)
                updated_count += 1
            except Exception as e:
                logger.error(f"Error generating AI analysis for {investment.symbol}: {e}")
        
        logger.info(f"Successfully generated AI analysis for {updated_count} investments")
        return f"Generated AI analysis for {updated_count} investments"
    except Exception as e:
        logger.error(f"Error in generate_ai_analysis_for_all_investments task: {e}")
        raise


@shared_task
def check_price_alerts():
    """Background task to check and trigger price alerts"""
    try:
        alerts = PriceAlert.objects.filter(is_active=True, triggered_at__isnull=True)
        triggered_count = 0
        
        for alert in alerts:
            investment = alert.investment
            current_price = investment.current_price
            
            should_trigger = False
            
            if alert.alert_type == 'above' and current_price >= alert.target_value:
                should_trigger = True
            elif alert.alert_type == 'below' and current_price <= alert.target_value:
                should_trigger = True
            elif alert.alert_type == 'change_percent':
                change_percent = abs(investment.daily_change_percent)
                if change_percent >= alert.target_value:
                    should_trigger = True
            
            if should_trigger:
                alert.triggered_at = timezone.now()
                alert.is_active = False
                alert.save()
                triggered_count += 1
                
                # Here you could send notifications to users
                logger.info(f"Price alert triggered for {alert.user.username}: {investment.symbol} {alert.alert_type} {alert.target_value}")
        
        logger.info(f"Checked price alerts, triggered {triggered_count} alerts")
        return f"Triggered {triggered_count} price alerts"
    except Exception as e:
        logger.error(f"Error in check_price_alerts task: {e}")
        raise


@shared_task
def daily_investment_maintenance():
    """Daily maintenance task for investments"""
    try:
        # Refresh all prices
        refresh_all_investment_prices.delay()
        
        # Update chart data
        update_chart_data_for_all_investments.delay()
        
        # Generate AI analysis
        generate_ai_analysis_for_all_investments.delay()
        
        # Check price alerts
        check_price_alerts.delay()
        
        logger.info("Daily investment maintenance tasks scheduled")
        return "Daily investment maintenance tasks scheduled"
    except Exception as e:
        logger.error(f"Error in daily_investment_maintenance task: {e}")
        raise


@shared_task
def market_hours_price_refresh():
    """Task to refresh prices during market hours (every 30 seconds)"""
    try:
        # Only refresh prices for investments that have been updated recently
        recent_investments = Investment.objects.filter(
            last_updated__gte=timezone.now() - timezone.timedelta(hours=1)
        )
        
        updated_count = 0
        for investment in recent_investments:
            try:
                from .services import MarketDataService
                current_price = MarketDataService.get_current_price(investment.symbol)
                if current_price and current_price != investment.current_price:
                    # Calculate daily change
                    previous_price = investment.current_price
                    daily_change, daily_change_percent = MarketDataService.calculate_daily_change(
                        current_price, previous_price
                    )
                    
                    investment.current_price = current_price
                    investment.daily_change = daily_change
                    investment.daily_change_percent = daily_change_percent
                    investment.save()
                    updated_count += 1
            except Exception as e:
                logger.error(f"Error updating price for {investment.symbol}: {e}")
        
        logger.info(f"Market hours refresh: updated {updated_count} investments")
        return f"Market hours refresh: updated {updated_count} investments"
    except Exception as e:
        logger.error(f"Error in market_hours_price_refresh task: {e}")
        raise


@shared_task
def enrich_investment_data_task(investment_id):
    """Background task for data enrichment using BharatSM"""
    try:
        success = DataEnrichmentService.enrich_investment_data(investment_id)
        if success:
            logger.info(f"Successfully enriched data for investment {investment_id}")
            return f"Successfully enriched data for investment {investment_id}"
        else:
            logger.warning(f"Failed to enrich data for investment {investment_id}")
            return f"Failed to enrich data for investment {investment_id}"
    except Exception as e:
        logger.error(f"Error in enrich_investment_data_task: {e}")
        raise


@shared_task
def daily_price_and_data_update():
    """Daily task to update prices and frontend display data for all tradeable assets using BharatSM"""
    try:
        investments = Investment.objects.filter(asset_type__in=['stock', 'etf', 'crypto'])
        updated_count = 0
        bharatsm_success_count = 0
        fallback_count = 0
        
        for investment in investments:
            try:
                if investment.asset_type in ['stock', 'etf']:
                    # Use BharatSM for Indian stocks
                    if final_bharatsm_service:
                        data = get_bharatsm_frontend_data(investment.symbol)
                        if data:
                            # Update frontend display fields
                            if 'volume' in data and data['volume']:
                                investment.volume = data['volume']
                            
                            if 'market_cap' in data and data['market_cap']:
                                investment.market_cap = Decimal(str(data['market_cap']))
                            
                            if 'pe_ratio' in data and data['pe_ratio']:
                                investment.pe_ratio = Decimal(str(data['pe_ratio']))
                            
                            if 'growth_rate' in data and data['growth_rate']:
                                investment.growth_rate = Decimal(str(data['growth_rate']))
                            
                            investment.save()
                            updated_count += 1
                            bharatsm_success_count += 1
                            logger.info(f"Updated {investment.symbol} using BharatSM")
                            continue
                    
                    # Fallback to Perplexity for stocks if BharatSM fails
                    logger.warning(f"BharatSM failed for {investment.symbol}, using Perplexity fallback")
                    fallback_data = PerplexityAPIService.get_fallback_data(investment.symbol)
                    if fallback_data:
                        if 'volume' in fallback_data and fallback_data['volume']:
                            investment.volume = fallback_data['volume']
                        
                        if 'market_cap' in fallback_data and fallback_data['market_cap']:
                            investment.market_cap = Decimal(str(fallback_data['market_cap']))
                        
                        if 'pe_ratio' in fallback_data and fallback_data['pe_ratio']:
                            investment.pe_ratio = Decimal(str(fallback_data['pe_ratio']))
                        
                        if 'growth_rate' in fallback_data and fallback_data['growth_rate']:
                            investment.growth_rate = Decimal(str(fallback_data['growth_rate']))
                        
                        if 'current_price' in fallback_data and fallback_data['current_price']:
                            old_price = investment.current_price
                            investment.current_price = Decimal(str(fallback_data['current_price']))
                            investment.daily_change = investment.current_price - old_price
                            if old_price > 0:
                                investment.daily_change_percent = (investment.daily_change / old_price) * 100
                        
                        investment.save()
                        updated_count += 1
                        fallback_count += 1
                        logger.info(f"Updated {investment.symbol} using Perplexity fallback")
                
                elif investment.asset_type == 'crypto':
                    # Use Perplexity for crypto (BharatSM doesn't support crypto)
                    data = PerplexityAPIService.get_fallback_data(investment.symbol)
                    if data:
                        if 'volume' in data and data['volume']:
                            investment.volume = data['volume']
                        
                        if 'market_cap' in data and data['market_cap']:
                            investment.market_cap = Decimal(str(data['market_cap']))
                        
                        if 'growth_rate' in data and data['growth_rate']:
                            investment.growth_rate = Decimal(str(data['growth_rate']))
                        
                        if 'current_price' in data and data['current_price']:
                            old_price = investment.current_price
                            investment.current_price = Decimal(str(data['current_price']))
                            investment.daily_change = investment.current_price - old_price
                            investment.daily_change_percent = data.get('daily_change_percent', 0)
                        
                        investment.save()
                        updated_count += 1
                        fallback_count += 1
                        logger.info(f"Updated crypto {investment.symbol} using Perplexity")
                
            except Exception as e:
                logger.error(f"Failed to update data for {investment.symbol}: {e}")
        
        logger.info(f"Daily data update completed: {updated_count} investments updated "
                   f"(BharatSM: {bharatsm_success_count}, Fallback: {fallback_count})")
        return f"Daily data update completed: {updated_count} investments updated " \
               f"(BharatSM: {bharatsm_success_count}, Fallback: {fallback_count})"
    except Exception as e:
        logger.error(f"Error in daily_price_and_data_update: {e}")
        raise

@shared_task
def daily_price_update_task():
    """Legacy daily task - now calls the new BharatSM-enabled task"""
    return daily_price_and_data_update()


@shared_task
def refresh_precious_metals_task():
    """Task to refresh precious metal prices"""
    try:
        # Get all precious metal investments
        precious_metals = Investment.objects.filter(asset_type__in=['gold', 'silver'])
        updated_count = 0
        
        for investment in precious_metals:
            try:
                if DataEnrichmentService.enrich_investment_data(investment.id):
                    updated_count += 1
            except Exception as e:
                logger.error(f"Failed to update precious metal {investment.id}: {e}")
        
        logger.info(f"Precious metals update completed: {updated_count} investments updated")
        return f"Precious metals update completed: {updated_count} investments updated"
    except Exception as e:
        logger.error(f"Error in refresh_precious_metals_task: {e}")
        raise


@shared_task
def bulk_enrich_investments_task(investment_ids):
    """Background task for bulk data enrichment"""
    try:
        results = DataEnrichmentService.bulk_enrich_investments(investment_ids)
        logger.info(f"Bulk enrichment completed: {results}")
        return f"Bulk enrichment completed: {results['success']} success, {results['failed']} failed"
    except Exception as e:
        logger.error(f"Error in bulk_enrich_investments_task: {e}")
        raise


@shared_task
def refresh_user_assets_task(user_id, asset_types=None):
    """Background task to refresh assets for a specific user"""
    try:
        user = User.objects.get(id=user_id)
        updated_investments = DataEnrichmentService.refresh_investment_prices(
            user=user, 
            asset_types=asset_types
        )
        
        logger.info(f"User asset refresh completed for {user.username}: {len(updated_investments)} investments updated")
        return f"User asset refresh completed: {len(updated_investments)} investments updated"
    except User.DoesNotExist:
        logger.error(f"User with id {user_id} not found")
        return f"User with id {user_id} not found"
    except Exception as e:
        logger.error(f"Error in refresh_user_assets_task: {e}")
        raise


# ============================================================================
# SERVER-SIDE CENTRALIZED DATA FETCHING TASKS
# ============================================================================

@shared_task
def centralized_ohlc_data_update(force_refresh=False):
    """Server-side task to update OHLC data for all active symbols (daily timeframe only)"""
    try:
        logger.info("Starting centralized OHLC data update for daily timeframe")
        
        # Get symbols that need OHLC updates
        if force_refresh:
            # Force refresh all active symbols
            active_symbols = AssetSymbol.objects.get_tradeable_symbols()
            symbols_to_update = [(s.symbol, s.asset_type) for s in active_symbols]
        else:
            # Only update symbols with stale data
            symbols_to_update = CentralizedDataFetchingService.get_symbols_needing_ohlc_update()
        
        if not symbols_to_update:
            logger.info("No symbols need OHLC data updates")
            return "No symbols needed updates"
        
        # Bulk fetch OHLC data (daily timeframe)
        results = CentralizedDataFetchingService.bulk_fetch_ohlc_data(symbols_to_update)
        
        logger.info(f"Centralized OHLC update completed: {results['successful']}/{results['total']} successful")
        return f"OHLC update completed: {results['successful']}/{results['total']} successful"
        
    except Exception as e:
        logger.error(f"Error in centralized_ohlc_data_update: {e}")
        raise


@shared_task
def centralized_market_data_update(force_refresh=False):
    """Server-side task to update market data for all active symbols"""
    try:
        logger.info("Starting centralized market data update")
        
        # Get symbols that need market data updates
        if force_refresh:
            # Force refresh all active symbols
            active_symbols = AssetSymbol.objects.get_active_symbols()
            symbols_to_update = [(s.symbol, s.asset_type) for s in active_symbols]
        else:
            # Only update symbols with stale data (24-hour threshold)
            symbols_to_update = CentralizedDataFetchingService.get_symbols_needing_market_data_update()
        
        if not symbols_to_update:
            logger.info("No symbols need market data updates")
            return "No symbols needed updates"
        
        # Bulk fetch market data
        results = CentralizedDataFetchingService.bulk_fetch_market_data(symbols_to_update)
        
        logger.info(f"Centralized market data update completed: {results['successful']}/{results['total']} successful")
        return f"Market data update completed: {results['successful']}/{results['total']} successful"
        
    except Exception as e:
        logger.error(f"Error in centralized_market_data_update: {e}")
        raise


@shared_task
def end_of_day_data_refresh():
    """Comprehensive end-of-day data refresh for all assets (daily timeframe only)"""
    try:
        logger.info("Starting end-of-day comprehensive data refresh")
        
        # Step 1: Update OHLC data for daily timeframe
        ohlc_result = centralized_ohlc_data_update.delay(force_refresh=False)
        
        # Step 2: Update market data (PE ratios, market cap, etc.)
        market_result = centralized_market_data_update.delay(force_refresh=False)
        
        # Step 3: Register any new symbols from user investments
        register_new_symbols_from_investments.delay()
        
        # Step 4: Clean up stale data
        cleanup_stale_data.delay()
        
        logger.info("End-of-day data refresh tasks initiated")
        return "End-of-day data refresh tasks initiated successfully"
        
    except Exception as e:
        logger.error(f"Error in end_of_day_data_refresh: {e}")
        raise


@shared_task
def register_new_symbols_from_investments():
    """Register any new symbols from user investments into centralized system"""
    try:
        logger.info("Registering new symbols from user investments")
        
        # Get all unique symbols from user investments
        investments = Investment.objects.filter(
            asset_type__in=['stock', 'etf', 'crypto', 'mutual_fund']
        ).values('symbol', 'asset_type', 'name', 'exchange', 'currency').distinct()
        
        registered_count = 0
        for inv in investments:
            if inv['symbol']:  # Only process investments with symbols
                try:
                    asset_symbol = CentralizedDataFetchingService.register_symbol(
                        symbol=inv['symbol'],
                        asset_type=inv['asset_type'],
                        name=inv['name'] or '',
                        exchange=inv['exchange'] or '',
                        currency=inv['currency'] or 'INR'
                    )
                    registered_count += 1
                except Exception as e:
                    logger.warning(f"Failed to register symbol {inv['symbol']}: {e}")
        
        logger.info(f"Registered {registered_count} symbols from user investments")
        return f"Registered {registered_count} symbols"
        
    except Exception as e:
        logger.error(f"Error in register_new_symbols_from_investments: {e}")
        raise


@shared_task
def cleanup_stale_data(days_threshold=7):
    """Clean up stale data and mark inactive symbols"""
    try:
        logger.info(f"Cleaning up stale data older than {days_threshold} days")
        
        cutoff_date = timezone.now() - timezone.timedelta(days=days_threshold)
        
        # Mark OHLC data as stale
        stale_ohlc_count = CentralizedOHLCData.objects.filter(
            last_updated__lt=cutoff_date
        ).update(is_stale=True)
        
        # Mark market data as stale
        stale_market_count = CentralizedMarketData.objects.filter(
            last_updated__lt=cutoff_date
        ).update(is_stale=True)
        
        # Find symbols not used by any user investments
        active_investment_symbols = set(
            Investment.objects.filter(
                asset_type__in=['stock', 'etf', 'crypto', 'mutual_fund']
            ).values_list('symbol', flat=True)
        )
        
        # Mark unused symbols as inactive
        inactive_count = AssetSymbol.objects.exclude(
            symbol__in=active_investment_symbols
        ).update(is_active=False)
        
        logger.info(f"Cleanup completed: {stale_ohlc_count} OHLC, {stale_market_count} market data marked stale, {inactive_count} symbols marked inactive")
        return f"Cleanup completed: {stale_ohlc_count} OHLC, {stale_market_count} market data, {inactive_count} symbols"
        
    except Exception as e:
        logger.error(f"Error in cleanup_stale_data: {e}")
        raise


@shared_task
def sync_user_investments_with_centralized_data():
    """Sync user investment data with centralized market data"""
    try:
        logger.info("Syncing user investments with centralized data")
        
        # Get all user investments that need syncing
        investments = Investment.objects.filter(
            asset_type__in=['stock', 'etf', 'crypto']
        ).select_related('user')
        
        updated_count = 0
        
        for investment in investments:
            try:
                # Get centralized OHLC data
                ohlc_data = CentralizedDataFetchingService.get_centralized_ohlc_data(
                    investment.symbol, investment.asset_type
                )
                
                # Get centralized market data
                market_data = CentralizedDataFetchingService.get_centralized_market_data(
                    investment.symbol, investment.asset_type
                )
                
                # Update investment with centralized data
                updated = False
                
                if ohlc_data and ohlc_data.get('current_price'):
                    old_price = investment.current_price
                    investment.current_price = Decimal(str(ohlc_data['current_price']))
                    investment.daily_change = Decimal(str(ohlc_data['daily_change']))
                    investment.daily_change_percent = Decimal(str(ohlc_data['daily_change_percent']))
                    
                    # Update total value and gains
                    investment.total_value = investment.current_price * investment.quantity
                    investment.total_gain_loss = investment.total_value - (investment.average_purchase_price * investment.quantity)
                    if investment.average_purchase_price > 0:
                        investment.total_gain_loss_percent = (investment.total_gain_loss / (investment.average_purchase_price * investment.quantity)) * 100
                    
                    # Store OHLC data for charts
                    investment.ohlc_data = ohlc_data['data']
                    investment.ohlc_last_updated = timezone.now()
                    
                    updated = True
                
                if market_data:
                    if market_data.get('pe_ratio'):
                        investment.pe_ratio = Decimal(str(market_data['pe_ratio']))
                    if market_data.get('market_cap'):
                        investment.market_cap = Decimal(str(market_data['market_cap']))
                    if market_data.get('volume'):
                        investment.volume = market_data['volume']
                    if market_data.get('growth_rate'):
                        investment.growth_rate = Decimal(str(market_data['growth_rate']))
                    if market_data.get('sector'):
                        investment.sector = market_data['sector']
                    
                    # Update enhanced data timestamp
                    investment.enhanced_data_last_updated = timezone.now()
                    
                    updated = True
                
                if updated:
                    investment.save()
                    updated_count += 1
                    
            except Exception as e:
                logger.warning(f"Failed to sync investment {investment.id} ({investment.symbol}): {e}")
        
        logger.info(f"Sync completed: {updated_count} investments updated")
        return f"Sync completed: {updated_count} investments updated"
        
    except Exception as e:
        logger.error(f"Error in sync_user_investments_with_centralized_data: {e}")
        raise


# Google Sheets Finance Data Tasks

@shared_task
def daily_complete_data_sync():
    """Complete daily data synchronization at 12:01 AM - fetches all financial data and stores in database"""
    try:
        logger.info("Starting daily complete data sync at 12:01 AM")
        
        if not google_sheets_service.is_available():
            logger.error("Google Sheets service not available for daily sync")
            return "Google Sheets service not available"
        
        # Get all unique symbols from user investments
        symbols = list(Investment.objects.filter(
            asset_type__in=['stock', 'etf', 'crypto', 'mutual_fund']
        ).values_list('symbol', flat=True).distinct())
        
        if not symbols:
            logger.info("No symbols found for daily sync")
            return "No symbols to sync"
        
        logger.info(f"Starting complete data sync for {len(symbols)} symbols")
        
        # Step 1: Sync all market data from Google Sheets and store in database
        market_data = google_sheets_service.fetch_market_data_batch(symbols, force_refresh=True)
        
        market_updated = 0
        market_failed = 0
        
        for symbol, data in market_data.items():
            try:
                # Update investments with fresh data
                investments = Investment.objects.filter(symbol=symbol)
                for investment in investments:
                    investment.current_price = data.get('price', investment.current_price)
                    investment.daily_change = data.get('daily_change', investment.daily_change)
                    investment.daily_change_percent = data.get('daily_change_percent', investment.daily_change_percent)
                    investment.market_cap = data.get('market_cap')
                    investment.volume = data.get('volume')
                    investment.sector = data.get('sector', investment.sector)
                    investment.last_updated = timezone.now()
                    investment.save()
                
                # Store/update centralized market data
                asset_symbol, created = AssetSymbol.objects.get_or_create(
                    symbol=symbol,
                    asset_type=investments.first().asset_type if investments.exists() else 'stock',
                    defaults={'name': data.get('name', symbol)}
                )
                
                CentralizedMarketData.objects.update_or_create(
                    asset_symbol=asset_symbol,
                    defaults={
                        'symbol': symbol,
                        'asset_type': asset_symbol.asset_type,
                        'pe_ratio': data.get('pe_ratio'),
                        'market_cap': data.get('market_cap'),
                        'volume': data.get('volume_formatted'),
                        'volume_raw': data.get('volume_raw'),
                        'fifty_two_week_high': data.get('high_52'),
                        'fifty_two_week_low': data.get('low_52'),
                        'beta': data.get('beta'),
                        'sector': data.get('sector'),
                        'description': data.get('name'),
                        'data_source': 'google_sheets',
                        'last_updated': timezone.now(),
                    }
                )
                
                market_updated += 1
                
            except Exception as e:
                logger.error(f"Failed to update market data for {symbol}: {e}")
                market_failed += 1
        
        # Step 2: Fetch all OHLC data and store in database
        ohlc_updated = 0
        ohlc_failed = 0
        
        for symbol in symbols:
            try:
                logger.info(f"Fetching OHLC data for {symbol}...")
                ohlc_data = google_sheets_service.fetch_ohlc_data(symbol, days=30, force_refresh=True)
                
                if ohlc_data and len(ohlc_data) > 0:
                    # Update investments with OHLC data
                    investments = Investment.objects.filter(symbol=symbol)
                    for investment in investments:
                        investment.ohlc_data = ohlc_data
                        investment.ohlc_last_updated = timezone.now()
                        investment.save(update_fields=['ohlc_data', 'ohlc_last_updated'])
                    
                    # Get or create asset symbol with proper asset type
                    first_investment = investments.first()
                    if first_investment:
                        asset_type = first_investment.asset_type
                    else:
                        # Fallback asset type determination
                        asset_type = 'stock'  # Default to stock
                    
                    asset_symbol, created = AssetSymbol.objects.get_or_create(
                        symbol=symbol,
                        asset_type=asset_type,
                        defaults={'name': symbol, 'is_active': True}
                    )
                    
                    # Calculate current price and daily change from OHLC data
                    current_price = None
                    daily_change = Decimal('0')
                    daily_change_percent = Decimal('0')
                    
                    if len(ohlc_data) >= 2:
                        latest = ohlc_data[-1]
                        previous = ohlc_data[-2]
                        current_price = Decimal(str(latest.get('close', 0)))
                        prev_close = Decimal(str(previous.get('close', 0)))
                        
                        if prev_close > 0:
                            daily_change = current_price - prev_close
                            daily_change_percent = (daily_change / prev_close) * 100
                    elif len(ohlc_data) == 1:
                        # If only one data point, use it as current price
                        latest = ohlc_data[0]
                        current_price = Decimal(str(latest.get('close', 0)))
                    
                    # Store/update centralized OHLC data with proper uniqueness
                    CentralizedOHLCData.objects.update_or_create(
                        asset_symbol=asset_symbol,
                        symbol=symbol,
                        timeframe='1Day',  # Use the correct timeframe value
                        defaults={
                            'asset_type': asset_type,
                            'ohlc_data': ohlc_data,
                            'current_price': current_price,
                            'daily_change': daily_change,
                            'daily_change_percent': daily_change_percent,
                            'data_source': 'google_sheets',
                            'last_updated': timezone.now(),
                            'data_points_count': len(ohlc_data),
                            'is_stale': False,
                        }
                    )
                    
                    ohlc_updated += 1
                    logger.info(f"✅ Successfully updated OHLC data for {symbol} with {len(ohlc_data)} data points")
                    
                else:
                    logger.warning(f"⚠️ No OHLC data returned for {symbol}")
                    ohlc_failed += 1
                    
            except Exception as e:
                logger.error(f"❌ Failed to update OHLC data for {symbol}: {e}")
                ohlc_failed += 1
        
        # Step 3: Clear old cache to ensure next requests use fresh database data
        google_sheets_service.clear_cache()
        
        logger.info(f"Daily complete data sync completed: {market_updated} market data updated, {ohlc_updated} OHLC data updated, {market_failed + ohlc_failed} total failures")
        return f"Daily sync completed: {market_updated} market, {ohlc_updated} OHLC, {market_failed + ohlc_failed} failures"
        
    except Exception as e:
        logger.error(f"Error in daily_complete_data_sync: {e}")
        raise


@shared_task
def sync_google_sheets_data(force_refresh=False):
    """Primary task for syncing financial data from Google Sheets (24-hour cycle)"""
    try:
        logger.info("Starting Google Sheets data synchronization")
        
        if not google_sheets_service.is_available():
            logger.error("Google Sheets service not available")
            return "Google Sheets service not available"
        
        # Get all unique symbols from user investments
        symbols = list(Investment.objects.filter(
            asset_type__in=['stock', 'etf', 'crypto', 'mutual_fund']
        ).values_list('symbol', flat=True).distinct())
        
        if not symbols:
            logger.info("No symbols found for Google Sheets sync")
            return "No symbols to sync"
        
        # Fetch market data from Google Sheets
        market_data = google_sheets_service.fetch_market_data_batch(symbols, force_refresh)
        
        # Update investments with Google Sheets data
        updated_count = 0
        failed_count = 0
        
        for symbol, data in market_data.items():
            try:
                # Update all investments with this symbol
                investments = Investment.objects.filter(symbol=symbol)
                
                for investment in investments:
                    if data.get('current_price'):
                        old_price = investment.current_price
                        investment.current_price = Decimal(str(data['current_price']))
                        
                        # Calculate daily change
                        if data.get('daily_change'):
                            investment.daily_change = Decimal(str(data['daily_change']))
                        if data.get('daily_change_percent'):
                            investment.daily_change_percent = Decimal(str(data['daily_change_percent']))
                        
                        # Update financial metrics
                        if data.get('pe_ratio'):
                            investment.pe_ratio = Decimal(str(data['pe_ratio']))
                        if data.get('market_cap'):
                            investment.market_cap = Decimal(str(data['market_cap']))
                        if data.get('volume'):
                            investment.volume = data['volume']
                        
                        # Update total value and gains
                        investment.total_value = investment.current_price * investment.quantity
                        investment.total_gain_loss = investment.total_value - (investment.average_purchase_price * investment.quantity)
                        if investment.average_purchase_price > 0:
                            investment.total_gain_loss_percent = (investment.total_gain_loss / (investment.average_purchase_price * investment.quantity)) * 100
                        
                        # Update metadata
                        investment.enhanced_data_last_updated = timezone.now()
                        investment.save()
                        
                        updated_count += 1
                        
            except Exception as e:
                logger.error(f"Failed to update investments for symbol {symbol}: {e}")
                failed_count += 1
        
        # Store centralized data for cache
        centralized_updated = 0
        for symbol, data in market_data.items():
            try:
                # Get the asset_symbol for proper relationship
                first_investment = Investment.objects.filter(symbol=symbol).first()
                if first_investment:
                    asset_type = first_investment.asset_type
                    
                    # Get or create asset symbol
                    asset_symbol, created = AssetSymbol.objects.get_or_create(
                        symbol=symbol,
                        asset_type=asset_type,
                        defaults={'name': data.get('company_name', symbol), 'is_active': True}
                    )
                    
                    # Update or create centralized market data
                    market_obj, created = CentralizedMarketData.objects.update_or_create(
                        symbol=symbol,
                        asset_type=asset_type,
                        defaults={
                            'asset_symbol': asset_symbol,
                            'pe_ratio': data.get('pe_ratio'),
                            'market_cap': data.get('market_cap'),
                            'volume': data.get('volume'),  # Formatted volume (e.g., "17.9L")
                            'volume_raw': data.get('raw_volume'),  # Raw volume number
                            'data_source': 'google_sheets',
                            'is_stale': False,
                            'last_updated': timezone.now(),
                        }
                    )
                    centralized_updated += 1
                
            except Exception as e:
                logger.error(f"Failed to update centralized data for {symbol}: {e}")
        
        logger.info(f"Google Sheets sync completed: {updated_count} investments updated, {centralized_updated} centralized records updated, {failed_count} failed")
        return f"Sync completed: {updated_count} investments, {centralized_updated} centralized, {failed_count} failed"
        
    except Exception as e:
        logger.error(f"Error in sync_google_sheets_data: {e}")
        raise


@shared_task
def fetch_google_sheets_ohlc_data(symbols=None, days=30, force_refresh=False):
    """Fetch OHLC data from Google Sheets for chart generation (4-hour cache)"""
    try:
        logger.info(f"Fetching OHLC data from Google Sheets for {len(symbols) if symbols else 'all'} symbols")
        
        if not google_sheets_service.is_available():
            logger.error("Google Sheets service not available")
            return "Google Sheets service not available"
        
        # Get symbols if not provided
        if not symbols:
            symbols = list(Investment.objects.filter(
                asset_type__in=['stock', 'etf', 'crypto']
            ).values_list('symbol', flat=True).distinct())
        
        updated_count = 0
        failed_count = 0
        
        for symbol in symbols:
            try:
                # Fetch OHLC data from Google Sheets
                ohlc_data = google_sheets_service.fetch_ohlc_data(symbol, days, force_refresh)
                
                if ohlc_data:
                    # Update investments with OHLC data
                    investments = Investment.objects.filter(symbol=symbol)
                    
                    for investment in investments:
                        investment.ohlc_data = ohlc_data
                        investment.ohlc_last_updated = timezone.now()
                        investment.save(update_fields=['ohlc_data', 'ohlc_last_updated'])
                    
                    # Store centralized OHLC data
                    ohlc_obj, created = CentralizedOHLCData.objects.update_or_create(
                        symbol=symbol,
                        defaults={
                            'timeframe': 'daily',
                            'data': ohlc_data,
                            'last_updated': timezone.now(),
                            'source': 'google_sheets',
                        }
                    )
                    
                    updated_count += 1
                    
            except Exception as e:
                logger.error(f"Failed to fetch OHLC data for {symbol}: {e}")
                failed_count += 1
        
        logger.info(f"OHLC data fetch completed: {updated_count} symbols updated, {failed_count} failed")
        return f"OHLC fetch completed: {updated_count} updated, {failed_count} failed"
        
    except Exception as e:
        logger.error(f"Error in fetch_google_sheets_ohlc_data: {e}")
        raise


@shared_task
def refresh_google_sheets_prices():
    """Quick price refresh from Google Sheets (hourly updates)"""
    try:
        logger.info("Starting hourly Google Sheets price refresh")
        
        if not google_sheets_service.is_available():
            logger.error("Google Sheets service not available")
            return "Google Sheets service not available"
        
        # Get recently viewed symbols for quick refresh
        recent_symbols = list(Investment.objects.filter(
            last_updated__gte=timezone.now() - timezone.timedelta(hours=6),
            asset_type__in=['stock', 'etf', 'crypto']
        ).values_list('symbol', flat=True).distinct())
        
        if not recent_symbols:
            logger.info("No recent symbols for price refresh")
            return "No recent symbols"
        
        # Limit to top 20 for quick refresh
        recent_symbols = recent_symbols[:20]
        
        # Fetch market data with force refresh
        market_data = google_sheets_service.fetch_market_data_batch(recent_symbols, force_refresh=True)
        
        updated_count = 0
        for symbol, data in market_data.items():
            try:
                if data.get('current_price'):
                    # Update only price-related fields for quick refresh
                    investments = Investment.objects.filter(symbol=symbol)
                    
                    for investment in investments:
                        investment.current_price = Decimal(str(data['current_price']))
                        if data.get('daily_change'):
                            investment.daily_change = Decimal(str(data['daily_change']))
                        if data.get('daily_change_percent'):
                            investment.daily_change_percent = Decimal(str(data['daily_change_percent']))
                        
                        # Update total value
                        investment.total_value = investment.current_price * investment.quantity
                        investment.total_gain_loss = investment.total_value - (investment.average_purchase_price * investment.quantity)
                        if investment.average_purchase_price > 0:
                            investment.total_gain_loss_percent = (investment.total_gain_loss / (investment.average_purchase_price * investment.quantity)) * 100
                        
                        investment.save(update_fields=[
                            'current_price', 'daily_change', 'daily_change_percent',
                            'total_value', 'total_gain_loss', 'total_gain_loss_percent'
                        ])
                        
                        updated_count += 1
                        
            except Exception as e:
                logger.error(f"Failed to update price for symbol {symbol}: {e}")
        
        logger.info(f"Price refresh completed: {updated_count} investments updated")
        return f"Price refresh completed: {updated_count} investments updated"
        
    except Exception as e:
        logger.error(f"Error in refresh_google_sheets_prices: {e}")
        raise


@shared_task
def daily_google_sheets_maintenance():
    """Daily maintenance task for Google Sheets data (end-of-day)"""
    try:
        logger.info("Starting daily Google Sheets maintenance")
        
        # Step 1: Comprehensive data sync (force refresh)
        sync_result = sync_google_sheets_data.delay(force_refresh=True)
        
        # Step 2: Fetch OHLC data for charts
        ohlc_result = fetch_google_sheets_ohlc_data.delay(force_refresh=True)
        
        # Step 3: Clear old cache to ensure fresh data
        google_sheets_service.clear_cache()
        
        logger.info("Daily Google Sheets maintenance tasks initiated")
        return "Daily Google Sheets maintenance tasks initiated successfully"
        
    except Exception as e:
        logger.error(f"Error in daily_google_sheets_maintenance: {e}")
        raise


@shared_task
def setup_google_sheets_integration():
    """Setup and configure Google Sheets integration automatically"""
    try:
        logger.info("Setting up Google Sheets integration")
        
        if not google_sheets_service.is_available():
            logger.error("Google Sheets service not available for setup")
            return "Google Sheets service not available - check credentials"
        
        # Get spreadsheet info
        info = google_sheets_service.get_spreadsheet_info()
        
        if info:
            setup_info = {
                "status": "success",
                "spreadsheet_id": info['id'],
                "title": info['title'],
                "url": info['url'],
                "auto_created": info['auto_created'],
                "worksheet_name": info['worksheet_name'],
                "sheets": info['sheets']
            }
            
            logger.info(f"Google Sheets setup completed: {info['title']}")
            
            if info['auto_created']:
                print("\n" + "="*60)
                print("🎉 GOOGLE SHEETS AUTO-SETUP COMPLETE!")
                print("="*60)
                print(f"📈 Spreadsheet: {info['title']}")
                print(f"🔗 URL: {info['url']}")
                print(f"📄 Worksheet: {info['worksheet_name']}")
                print("\n🔑 IMPORTANT: Add this to your .env file:")
                print(f"GOOGLE_SHEETS_SPREADSHEET_ID={info['id']}")
                print("\n📝 TODO: Share the spreadsheet with your service account email")
                print("="*60)
            
            return f"Setup complete: {info['title']} ({info['id']})"
        else:
            return "Failed to get spreadsheet information"
            
    except Exception as e:
        logger.error(f"Error in setup_google_sheets_integration: {e}")
        return f"Setup failed: {e}"


@shared_task
def test_google_sheets_connection():
    """Test Google Sheets connection and basic functionality"""
    try:
        logger.info("Testing Google Sheets connection")
        
        # Test connection
        if not google_sheets_service.test_connection():
            return "Google Sheets connection failed"
        
        # Get spreadsheet info
        info = google_sheets_service.get_spreadsheet_info()
        
        if info:
            print("\n" + "="*50)
            print("✅ GOOGLE SHEETS CONNECTION TEST")
            print("="*50)
            print(f"📈 Spreadsheet: {info['title']}")
            print(f"🔗 URL: {info['url']}")
            print(f"📄 Active Sheets: {', '.join(info['sheets'])}")
            print("="*50)
        
        # Test basic data fetch with sample symbols
        test_symbols = ['RELIANCE', 'TCS']  # Sample Indian stocks
        test_data = google_sheets_service.fetch_market_data_batch(test_symbols, force_refresh=True)
        
        if test_data:
            logger.info(f"Google Sheets test successful: {len(test_data)} symbols fetched")
            return f"Test successful: {len(test_data)} symbols fetched"
        else:
            logger.warning("Google Sheets test: No data returned")
            return "Test warning: No data returned"
        
    except Exception as e:
        logger.error(f"Google Sheets test failed: {e}")
        return f"Test failed: {e}"


@shared_task
def google_sheets_auto_cleanup():
    """Automatic cleanup when spreadsheet gets full"""
    try:
        logger.info("Starting Google Sheets auto cleanup check")
        
        if not google_sheets_service.is_available():
            logger.error("Google Sheets service not available for cleanup")
            return "Google Sheets service not available"
        
        # Check if cleanup is needed and perform if necessary
        cleanup_result = google_sheets_service.auto_cleanup_if_needed()
        
        if cleanup_result['status'] == 'cleanup_performed':
            logger.info(f"Auto cleanup performed: {cleanup_result['cleanup_result']['message']}")
            return f"Cleanup performed: {cleanup_result['cleanup_result']['message']}"
        elif cleanup_result['status'] == 'no_cleanup_needed':
            space_info = cleanup_result['space_info']
            logger.info(f"No cleanup needed: {space_info['current_rows']}/{space_info['total_rows']} rows ({space_info['usage_percent']:.1f}%)")
            return f"No cleanup needed: {space_info['usage_percent']:.1f}% full"
        else:
            logger.error(f"Cleanup check failed: {cleanup_result['message']}")
            return f"Cleanup check failed: {cleanup_result['message']}"
        
    except Exception as e:
        logger.error(f"Error in google_sheets_auto_cleanup: {e}")
        return f"Auto cleanup failed: {e}"


@shared_task  
def weekly_google_sheets_maintenance():
    """Weekly comprehensive cleanup and maintenance"""
    try:
        logger.info("Starting weekly Google Sheets maintenance")
        
        if not google_sheets_service.is_available():
            logger.error("Google Sheets service not available for maintenance")
            return "Google Sheets service not available"
        
        # Step 1: Get current status
        status = google_sheets_service.get_cleanup_status()
        logger.info(f"Current status: {status}")
        
        # Step 2: Force cleanup regardless of threshold (weekly deep clean)
        cleanup_result = google_sheets_service.cleanup_old_data(days_threshold=7)  # Clean data older than 7 days
        
        # Step 3: Clear cache for fresh start
        google_sheets_service.clear_cache()
        
        # Step 4: Test connection after maintenance
        connection_test = google_sheets_service.test_connection()
        
        maintenance_summary = {
            'cleanup_result': cleanup_result,
            'connection_test': connection_test,
            'final_status': google_sheets_service.get_cleanup_status()
        }
        
        logger.info(f"Weekly maintenance completed: {cleanup_result['message']}")
        return f"Weekly maintenance completed: {cleanup_result['message']}"
        
    except Exception as e:
        logger.error(f"Error in weekly_google_sheets_maintenance: {e}")
        return f"Weekly maintenance failed: {e}"


@shared_task
def check_google_sheets_space():
    """Check Google Sheets space usage and provide recommendations"""
    try:
        logger.info("Checking Google Sheets space usage")
        
        if not google_sheets_service.is_available():
            return "Google Sheets service not available"
        
        status = google_sheets_service.get_cleanup_status()
        
        if status.get('space_info'):
            space_info = status['space_info']
            recommendations = status['recommendations']
            
            logger.info(f"Space usage: {space_info['current_rows']}/{space_info['total_rows']} rows ({space_info['usage_percent']:.1f}%)")
            logger.info(f"Recommendations: {', '.join(recommendations)}")
            
            return f"Space usage: {space_info['usage_percent']:.1f}% full, {space_info['available_rows']} rows available"
        else:
            return "Could not check space usage"
        
    except Exception as e:
        logger.error(f"Error checking Google Sheets space: {e}")
        return f"Space check failed: {e}"
