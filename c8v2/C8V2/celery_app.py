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
    'daily-price-and-data-update': {
        'task': 'investments.tasks.daily_price_and_data_update',
        'schedule': 60.0 * 60.0 * 24.0,  # Run daily (24 hours)
        # 'schedule': crontab(hour=9, minute=0),  # Run at 9 AM daily
    },
    'refresh-precious-metals': {
        'task': 'investments.tasks.refresh_precious_metals_task',
        'schedule': 60.0 * 60.0 * 6.0,  # Run every 6 hours
    },
}

app.conf.timezone = 'UTC'


@app.task(bind=True)
def debug_task(self):
    print(f'Request: {self.request!r}')