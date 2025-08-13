from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from .models import Investment
from .services import InvestmentService
import logging

logger = logging.getLogger(__name__)


@receiver(post_save, sender=Investment)
def investment_post_save(sender, instance, created, **kwargs):
    """Handle post-save actions for Investment model"""
    if created:
        logger.info(f"New investment created: {instance.symbol} for user {instance.user.username}")
        
        # Update chart data for new investment
        try:
            InvestmentService.update_chart_data(instance)
        except Exception as e:
            logger.error(f"Error updating chart data for new investment {instance.symbol}: {e}")


@receiver(post_delete, sender=Investment)
def investment_post_delete(sender, instance, **kwargs):
    """Handle post-delete actions for Investment model"""
    logger.info(f"Investment deleted: {instance.symbol} for user {instance.user.username}")