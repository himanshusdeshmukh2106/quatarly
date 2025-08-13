from django.core.management.base import BaseCommand
from investments.services import InvestmentService
import logging

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Refresh investment prices for all users'

    def add_arguments(self, parser):
        parser.add_argument(
            '--user-id',
            type=int,
            help='Refresh prices for specific user ID only',
        )

    def handle(self, *args, **options):
        user_id = options.get('user_id')
        
        try:
            if user_id:
                from django.contrib.auth import get_user_model
                User = get_user_model()
                user = User.objects.get(id=user_id)
                updated_investments = InvestmentService.refresh_investment_prices(user=user)
                self.stdout.write(
                    self.style.SUCCESS(
                        f'Successfully updated {len(updated_investments)} investments for user {user.username}'
                    )
                )
            else:
                updated_investments = InvestmentService.refresh_investment_prices()
                self.stdout.write(
                    self.style.SUCCESS(
                        f'Successfully updated {len(updated_investments)} investments for all users'
                    )
                )
                
        except Exception as e:
            logger.error(f"Error refreshing prices: {e}")
            self.stdout.write(
                self.style.ERROR(f'Error refreshing prices: {e}')
            )