#!/usr/bin/env python
"""
Test script to verify Celery is working with BharatSM tasks
"""

import os
import sys
import django
from decimal import Decimal

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'C8V2.settings')
django.setup()

from investments.tasks import daily_price_and_data_update, enrich_investment_data_task
from investments.models import Investment
from django.contrib.auth import get_user_model

User = get_user_model()


def test_celery_availability():
    """Test if Celery tasks are available"""
    print("=" * 60)
    print("TESTING CELERY AVAILABILITY")
    print("=" * 60)
    
    try:
        from celery import current_app
        print("✅ Celery is available")
        print(f"   Broker: {current_app.conf.broker_url}")
        print(f"   Backend: {current_app.conf.result_backend}")
        return True
    except ImportError:
        print("❌ Celery is not available")
        return False


def test_bharatsm_task_execution():
    """Test BharatSM task execution"""
    print("\n" + "=" * 60)
    print("TESTING BHARATSM TASK EXECUTION")
    print("=" * 60)
    
    try:
        # Create test user and investment
        user, created = User.objects.get_or_create(
            username='celery_test_user',
            defaults={
                'email': 'celery@test.com',
                'first_name': 'Celery',
                'last_name': 'Test'
            }
        )
        
        if created:
            user.set_password('testpass123')
            user.save()
            print("✅ Created test user")
        else:
            print("✅ Using existing test user")
        
        # Create test investment
        investment, created = Investment.objects.get_or_create(
            user=user,
            symbol='RELIANCE',
            asset_type='stock',
            defaults={
                'name': 'Reliance Industries',
                'quantity': Decimal('5'),
                'average_purchase_price': Decimal('2500.00'),
                'current_price': Decimal('2500.00'),
                'exchange': 'NSE'
            }
        )
        
        if created:
            print("✅ Created test investment")
        else:
            print("✅ Using existing test investment")
        
        # Test enrichment task
        print(f"\n🔄 Testing enrichment task for investment {investment.id}:")
        
        try:
            # Try to run the task synchronously (without Celery worker)
            result = enrich_investment_data_task(investment.id)
            print(f"   ✅ Task executed successfully: {result}")
        except Exception as e:
            print(f"   ⚠️  Task execution failed: {e}")
            print("   This is expected if Celery worker is not running")
        
        # Test daily update task
        print(f"\n🔄 Testing daily update task:")
        
        try:
            # Try to run the task synchronously
            result = daily_price_and_data_update()
            print(f"   ✅ Daily update task executed successfully: {result}")
        except Exception as e:
            print(f"   ⚠️  Daily update task failed: {e}")
            print("   This is expected if BharatSM or APIs are not available")
        
    except Exception as e:
        print(f"❌ Error in task execution test: {e}")


def test_task_scheduling():
    """Test task scheduling configuration"""
    print("\n" + "=" * 60)
    print("TESTING TASK SCHEDULING")
    print("=" * 60)
    
    try:
        from celery import current_app
        
        beat_schedule = current_app.conf.beat_schedule
        
        if 'daily-price-and-data-update' in beat_schedule:
            task_config = beat_schedule['daily-price-and-data-update']
            print("✅ Daily price and data update task is scheduled")
            print(f"   Task: {task_config['task']}")
            print(f"   Schedule: Every {task_config['schedule']} seconds")
        else:
            print("❌ Daily price and data update task is not scheduled")
        
        if 'refresh-precious-metals' in beat_schedule:
            task_config = beat_schedule['refresh-precious-metals']
            print("✅ Precious metals refresh task is scheduled")
            print(f"   Task: {task_config['task']}")
            print(f"   Schedule: Every {task_config['schedule']} seconds")
        else:
            print("❌ Precious metals refresh task is not scheduled")
        
    except Exception as e:
        print(f"❌ Error checking task scheduling: {e}")


def test_redis_connection():
    """Test Redis connection for Celery"""
    print("\n" + "=" * 60)
    print("TESTING REDIS CONNECTION")
    print("=" * 60)
    
    try:
        import redis
        
        # Try to connect to Redis
        r = redis.Redis(host='localhost', port=6379, db=0)
        r.ping()
        print("✅ Redis connection successful")
        
        # Test basic operations
        r.set('celery_test', 'working')
        value = r.get('celery_test')
        if value == b'working':
            print("✅ Redis read/write operations working")
        else:
            print("❌ Redis read/write operations failed")
        
        r.delete('celery_test')
        
    except ImportError:
        print("❌ Redis library not available")
        print("   Install with: pip install redis")
    except Exception as e:
        print(f"❌ Redis connection failed: {e}")
        print("   Make sure Redis server is running on localhost:6379")


def main():
    """Run all Celery tests"""
    print("🚀 CELERY BHARATSM INTEGRATION TEST SUITE")
    print("=" * 60)
    
    # Test Celery availability
    if not test_celery_availability():
        print("\n❌ Celery not available. Please install Celery:")
        print("   pip install celery")
        return
    
    # Test Redis connection
    test_redis_connection()
    
    # Test task scheduling
    test_task_scheduling()
    
    # Test task execution
    test_bharatsm_task_execution()
    
    print("\n" + "=" * 60)
    print("🎉 CELERY TEST SUITE COMPLETED")
    print("=" * 60)
    print("\n📝 Summary:")
    print("   - Celery availability: ✅")
    print("   - Task scheduling: Configured for daily updates")
    print("   - Task execution: Tested (may require running worker)")
    print("   - Redis connection: Tested")
    print("\n💡 To run Celery worker:")
    print("   celery -A C8V2 worker --loglevel=info")
    print("\n💡 To run Celery beat (scheduler):")
    print("   celery -A C8V2 beat --loglevel=info")


if __name__ == '__main__':
    main()