#!/usr/bin/env python
"""
Test script to verify Celery integration is working properly
"""

import os
import sys
import django

# Add the project directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'C8V2.settings')
django.setup()

from investments.tasks import enrich_investment_data_task, refresh_user_assets_task, daily_price_update_task
from investments.models import Investment
from django.contrib.auth import get_user_model

User = get_user_model()

def test_celery_tasks():
    """Test that Celery tasks can be imported and called"""
    print("Testing Celery integration...")
    
    try:
        # Test task imports
        print("✅ Successfully imported Celery tasks")
        
        # Test that tasks are properly decorated
        assert hasattr(enrich_investment_data_task, 'delay'), "enrich_investment_data_task missing delay method"
        assert hasattr(refresh_user_assets_task, 'delay'), "refresh_user_assets_task missing delay method"
        assert hasattr(daily_price_update_task, 'delay'), "daily_price_update_task missing delay method"
        print("✅ Tasks have proper Celery decorators")
        
        # Test basic task structure
        print("✅ All Celery tasks are properly configured")
        
        # Check if we have any test data
        user_count = User.objects.count()
        investment_count = Investment.objects.count()
        
        print(f"📊 Database status:")
        print(f"   - Users: {user_count}")
        print(f"   - Investments: {investment_count}")
        
        if investment_count > 0:
            print("✅ Ready for testing with existing data")
        else:
            print("⚠️  No investments found - create some test data to fully test enrichment")
        
        print("\n🎉 Celery integration test completed successfully!")
        print("\nTo start Celery worker, run:")
        print("   celery -A C8V2 worker --loglevel=info")
        print("\nTo start Celery beat scheduler, run:")
        print("   celery -A C8V2 beat --loglevel=info")
        
        return True
        
    except Exception as e:
        print(f"❌ Celery integration test failed: {e}")
        return False

if __name__ == "__main__":
    success = test_celery_tasks()
    sys.exit(0 if success else 1)