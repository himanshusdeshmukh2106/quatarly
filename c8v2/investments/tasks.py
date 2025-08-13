from celery import shared_task
from .services import InvestmentService, AIInsightsService
from .models import Investment, PriceAlert
from django.contrib.auth import get_user_model
from django.utils import timezone
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