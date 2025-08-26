"""
Django management command to set up Google Sheets integration automatically.

Usage:
    python manage.py setup_google_sheets
    python manage.py setup_google_sheets --test-only
    python manage.py setup_google_sheets --force-create
"""

from django.core.management.base import BaseCommand
from django.conf import settings
from investments.google_sheets_service import google_sheets_service
from investments.tasks import setup_google_sheets_integration, test_google_sheets_connection
import json


class Command(BaseCommand):
    help = 'Set up Google Sheets integration for financial data'

    def add_arguments(self, parser):
        parser.add_argument(
            '--test-only',
            action='store_true',
            help='Only test the connection without setting up',
        )
        parser.add_argument(
            '--force-create',
            action='store_true',
            help='Force create a new spreadsheet even if one exists',
        )
        parser.add_argument(
            '--show-info',
            action='store_true',
            help='Show current spreadsheet information',
        )

    def handle(self, *args, **options):
        self.stdout.write(
            self.style.HTTP_INFO("🚀 Google Sheets Integration Setup")
        )
        self.stdout.write("=" * 50)

        # Check if credentials are configured
        if not hasattr(settings, 'GOOGLE_SHEETS_CREDENTIALS_JSON') or not settings.GOOGLE_SHEETS_CREDENTIALS_JSON:
            self.stdout.write(
                self.style.ERROR("❌ Google Sheets credentials not configured!")
            )
            self.stdout.write(
                "Please set GOOGLE_SHEETS_CREDENTIALS_JSON in your .env file"
            )
            self.stdout.write(
                "See GOOGLE_SHEETS_SETUP_GUIDE.md for detailed instructions"
            )
            return

        # Test-only mode
        if options['test_only']:
            self.stdout.write("🧪 Testing Google Sheets connection...")
            result = test_google_sheets_connection()
            if "successful" in result:
                self.stdout.write(self.style.SUCCESS(f"✅ {result}"))
            else:
                self.stdout.write(self.style.ERROR(f"❌ {result}"))
            return

        # Show info mode
        if options['show_info']:
            self.stdout.write("📊 Current Google Sheets Information:")
            info = google_sheets_service.get_spreadsheet_info()
            if info:
                self.stdout.write(f"📋 Title: {info['title']}")
                self.stdout.write(f"🆔 ID: {info['id']}")
                self.stdout.write(f"🔗 URL: {info['url']}")
                self.stdout.write(f"📄 Worksheets: {', '.join(info['sheets'])}")
                self.stdout.write(f"🤖 Auto-created: {info['auto_created']}")
            else:
                self.stdout.write(self.style.WARNING("⚠️ No spreadsheet information available"))
            return

        # Force create mode
        if options['force_create']:
            self.stdout.write("🔄 Force creating new spreadsheet...")
            # Reset spreadsheet ID to force creation
            google_sheets_service.spreadsheet_id = None
            google_sheets_service._initialize_service()

        # Main setup
        self.stdout.write("⚙️ Setting up Google Sheets integration...")
        
        try:
            result = setup_google_sheets_integration()
            
            if "success" in result or "complete" in result:
                self.stdout.write(self.style.SUCCESS(f"✅ {result}"))
                
                # Get and display spreadsheet info
                info = google_sheets_service.get_spreadsheet_info()
                if info:
                    self.stdout.write("\n📊 Spreadsheet Details:")
                    self.stdout.write(f"  📋 Title: {info['title']}")
                    self.stdout.write(f"  🆔 ID: {info['id']}")
                    self.stdout.write(f"  🔗 URL: {info['url']}")
                    
                    if info['auto_created']:
                        self.stdout.write("\n🎉 New spreadsheet created!")
                        self.stdout.write(
                            self.style.WARNING(
                                f"⚠️ IMPORTANT: Add this to your .env file:\n"
                                f"GOOGLE_SHEETS_SPREADSHEET_ID={info['id']}"
                            )
                        )
                        
                        # Parse service account email from credentials
                        try:
                            creds_json = settings.GOOGLE_SHEETS_CREDENTIALS_JSON
                            if isinstance(creds_json, str):
                                creds_dict = json.loads(creds_json)
                            else:
                                creds_dict = creds_json
                            
                            service_email = creds_dict.get('client_email')
                            if service_email:
                                self.stdout.write(
                                    self.style.WARNING(
                                        f"📧 Share the spreadsheet with: {service_email}\n"
                                        f"   Grant 'Editor' permissions to enable data updates"
                                    )
                                )
                        except Exception:
                            self.stdout.write(
                                self.style.WARNING(
                                    "📧 Share the spreadsheet with your service account email"
                                )
                            )
                    
                    # Test data fetching
                    self.stdout.write("\n🧪 Testing data fetching...")
                    test_result = test_google_sheets_connection()
                    if "successful" in test_result:
                        self.stdout.write(self.style.SUCCESS(f"✅ {test_result}"))
                        
                        self.stdout.write("\n🎊 Setup Complete! You can now:")
                        self.stdout.write("  • Use Google Sheets as your primary data source")
                        self.stdout.write("  • Run Celery tasks for automated data updates")
                        self.stdout.write("  • View real-time financial data in your app")
                        
                    else:
                        self.stdout.write(self.style.WARNING(f"⚠️ {test_result}"))
                        self.stdout.write("You may need to share the spreadsheet with your service account")
                        
            else:
                self.stdout.write(self.style.ERROR(f"❌ Setup failed: {result}"))
                
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"❌ Setup error: {e}"))

        self.stdout.write("\n" + "=" * 50)
        self.stdout.write("📖 For more help, see: GOOGLE_SHEETS_SETUP_GUIDE.md")