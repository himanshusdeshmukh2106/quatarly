import os
from celery import Celery
from django.conf import settings

# Set the default Django settings module for the 'celery' program.
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'C8V2.settings')

app = Celery('C8V2')

# Using a string here means the worker doesn't have to serialize
# the configuration object to child processes.
app.config_from_object('django.conf:settings', namespace='CELERY')

# Load task modules from all registered Django apps.
app.autodiscover_tasks()

# Celery configuration
app.conf.update(
    broker_url='redis://localhost:6379/0',
    result_backend='redis://localhost:6379/0',
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='UTC',
    enable_utc=True,
    task_track_started=True,
    task_time_limit=30 * 60,  # 30 minutes
    task_soft_time_limit=25 * 60,  # 25 minutes
    worker_prefetch_multiplier=1,
    worker_max_tasks_per_child=1000,
)

# Periodic tasks configuration
app.conf.beat_schedule = {
    # End-of-day comprehensive data refresh (runs at 6 PM IST)
    'end-of-day-data-refresh': {
        'task': 'investments.tasks.end_of_day_data_refresh',
        'schedule': 60.0 * 60.0 * 24.0,  # Run daily (24 hours)
        # 'schedule': crontab(hour=18, minute=0),  # Run at 6 PM daily (market close + buffer)
    },
    
    # Sync user investments with centralized data (every 4 hours)
    'sync-user-investments': {
        'task': 'investments.tasks.sync_user_investments_with_centralized_data',
        'schedule': 60.0 * 60.0 * 4.0,  # Run every 4 hours
    },
    
    # Legacy precious metals refresh (keep for compatibility)
    'refresh-precious-metals': {
        'task': 'investments.tasks.refresh_precious_metals_task',
        'schedule': 60.0 * 60.0 * 6.0,  # Run every 6 hours
    },
    
    # Weekly cleanup task
    'weekly-data-cleanup': {
        'task': 'investments.tasks.cleanup_stale_data',
        'schedule': 60.0 * 60.0 * 24.0 * 7.0,  # Run weekly
        # 'schedule': crontab(hour=2, minute=0, day_of_week=1),  # Monday at 2 AM
    },
}

app.conf.timezone = 'UTC'


@app.task(bind=True)
def debug_task(self):
    print(f'Request: {self.request!r}')