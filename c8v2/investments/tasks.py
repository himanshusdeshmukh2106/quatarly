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