from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from investments.models import Investment
from investments.data_enrichment_service import DataEnrichmentService
from investments.tasks import enrich_investment_data_task

User = get_user_model()


class Command(BaseCommand):
    help = 'Test data enrichment functionality'

    def add_arguments(self, parser):
        parser.add_argument(
            '--investment-id',
            type=int,
            help='Specific investment ID to enrich',
        )
        parser.add_argument(
            '--user-id',
            type=int,
            help='Enrich all investments for a specific user',
        )
        parser.add_argument(
            '--async',
            action='store_true',
            help='Use Celery background tasks',
        )

    def handle(self, *args, **options):
        investment_id = options.get('investment_id')
        user_id = options.get('user_id')
        use_async = options.get('async', False)

        if investment_id:
            try:
                investment = Investment.objects.get(id=investment_id)
                self.stdout.write(f"Testing enrichment for investment: {investment}")
                
                if use_async:
                    self.stdout.write("Using Celery background task...")
                    result = enrich_investment_data_task.delay(investment_id)
                    self.stdout.write(f"Task ID: {result.id}")
                else:
                    self.stdout.write("Using synchronous enrichment...")
                    success = DataEnrichmentService.enrich_investment_data(investment_id)
                    if success:
                        self.stdout.write(
                            self.style.SUCCESS(f"Successfully enriched investment {investment_id}")
                        )
                    else:
                        self.stdout.write(
                            self.style.ERROR(f"Failed to enrich investment {investment_id}")
                        )
                        
            except Investment.DoesNotExist:
                self.stdout.write(
                    self.style.ERROR(f"Investment with ID {investment_id} not found")
                )
                
        elif user_id:
            try:
                user = User.objects.get(id=user_id)
                investments = Investment.objects.filter(user=user, asset_type__in=['stock', 'etf', 'crypto'])
                
                self.stdout.write(f"Found {investments.count()} tradeable investments for user {user.username}")
                
                for investment in investments:
                    self.stdout.write(f"Enriching: {investment}")
                    
                    if use_async:
                        result = enrich_investment_data_task.delay(investment.id)
                        self.stdout.write(f"  Task ID: {result.id}")
                    else:
                        success = DataEnrichmentService.enrich_investment_data(investment.id)
                        status = "✅" if success else "❌"
                        self.stdout.write(f"  {status} {'Success' if success else 'Failed'}")
                        
            except User.DoesNotExist:
                self.stdout.write(
                    self.style.ERROR(f"User with ID {user_id} not found")
                )
                
        else:
            # Show available investments
            investments = Investment.objects.filter(asset_type__in=['stock', 'etf', 'crypto'])[:10]
            
            if investments:
                self.stdout.write("Available investments for testing:")
                for inv in investments:
                    self.stdout.write(f"  ID: {inv.id} - {inv.symbol} ({inv.name}) - User: {inv.user.username}")
                    
                self.stdout.write("\nUsage examples:")
                self.stdout.write("  python manage.py test_enrichment --investment-id 1")
                self.stdout.write("  python manage.py test_enrichment --user-id 1 --async")
            else:
                self.stdout.write("No tradeable investments found in database")
                self.stdout.write("Create some stocks, ETFs, or crypto investments first")