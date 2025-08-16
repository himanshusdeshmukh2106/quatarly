# Celery Setup Guide for Asset Backend Enhancement

This guide explains how to set up and run Celery for background tasks in the investment system.

## Prerequisites

1. **Redis Server**: Celery uses Redis as a message broker
2. **Python Dependencies**: Install required packages

### Install Redis

**Windows:**
```bash
# Using Chocolatey
choco install redis-64

# Or download from: https://github.com/microsoftarchive/redis/releases
```

**macOS:**
```bash
brew install redis
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get install redis-server
```

### Install Python Dependencies

```bash
pip install -r requirements_investments.txt
```

## Configuration

The Celery configuration is already set up in:
- `C8V2/celery.py` - Main Celery configuration
- `C8V2/settings.py` - Django settings for Celery
- `C8V2/__init__.py` - Celery app import

## Running the System

### 1. Start Redis Server

**Windows:**
```bash
redis-server
```

**macOS/Linux:**
```bash
redis-server
# Or as a service:
sudo systemctl start redis
```

### 2. Start Django Development Server

```bash
cd c8v2
python manage.py runserver
```

### 3. Start Celery Worker (in a new terminal)

```bash
cd c8v2
celery -A C8V2 worker --loglevel=info
```

### 4. Start Celery Beat Scheduler (in another terminal)

```bash
cd c8v2
celery -A C8V2 beat --loglevel=info
```

## Background Tasks

The system includes these background tasks:

### Data Enrichment Tasks
- `enrich_investment_data_task` - Enriches individual investment data
- `bulk_enrich_investments_task` - Bulk enrichment for multiple investments

### Price Update Tasks
- `daily_price_update_task` - Updates prices for all tradeable assets (runs daily)
- `refresh_precious_metals_task` - Updates precious metal prices (runs every 6 hours)
- `refresh_user_assets_task` - Updates assets for a specific user

### Monitoring Tasks
- `check_price_alerts` - Checks and triggers price alerts

## Testing the Setup

### 1. Test Celery Integration

```bash
cd c8v2
python test_celery_integration.py
```

### 2. Test Perplexity API

```bash
cd c8v2
python test_perplexity_api.py
```

### 3. Test Data Enrichment

```bash
cd c8v2
# Test specific investment
python manage.py test_enrichment --investment-id 1

# Test all investments for a user
python manage.py test_enrichment --user-id 1

# Test with background tasks
python manage.py test_enrichment --investment-id 1 --async
```

### 4. Manual Price Refresh

```bash
cd c8v2
python manage.py refresh_prices
```

## API Endpoints

With Celery enabled, these endpoints now work with background tasks:

### Create Investment (Auto-enrichment)
```bash
POST /api/investments/
{
  "asset_type": "stock",
  "symbol": "AAPL",
  "quantity": 10,
  "average_purchase_price": 150.00
}
```
- Immediately fetches basic market data
- Triggers background enrichment task for detailed data

### Manual Data Enrichment
```bash
POST /api/investments/{id}/enrich_data/
```

### Bulk Refresh
```bash
POST /api/investments/bulk_refresh/
{
  "asset_types": ["stock", "crypto"]
}
```

## Monitoring

### Celery Flower (Optional)

Install and run Flower for web-based monitoring:

```bash
pip install flower
celery -A C8V2 flower
```

Access at: http://localhost:5555

### Redis CLI

Monitor Redis queues:

```bash
redis-cli
> KEYS *
> LLEN celery
```

## Troubleshooting

### Common Issues

1. **Redis Connection Error**
   - Ensure Redis server is running
   - Check Redis connection settings in `settings.py`

2. **Task Not Executing**
   - Verify Celery worker is running
   - Check worker logs for errors
   - Ensure task is properly imported

3. **Perplexity API Errors**
   - Verify API key is set in `.env`
   - Check API rate limits
   - Monitor API response logs

### Logs

Check these log files for debugging:
- Django logs: Console output from `runserver`
- Celery worker logs: Console output from worker
- Celery beat logs: Console output from beat scheduler

### Development vs Production

**Development:**
- Use `--loglevel=info` for detailed logs
- Run worker and beat in separate terminals
- Use Redis on localhost

**Production:**
- Use process managers (systemd, supervisor)
- Configure proper logging
- Use Redis cluster for high availability
- Set up monitoring and alerting

## Environment Variables

Ensure these are set in your `.env` file:

```env
# Perplexity API
PERPLEXITY_API_KEY=your_api_key_here

# Celery (optional, defaults are set)
CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/0
```

## Performance Tuning

### Worker Configuration

```bash
# Multiple workers
celery -A C8V2 worker --concurrency=4

# Specific queues
celery -A C8V2 worker --queues=enrichment,price_updates
```

### Task Routing

Tasks can be routed to specific queues for better performance:

```python
# In celery.py
app.conf.task_routes = {
    'investments.tasks.enrich_investment_data_task': {'queue': 'enrichment'},
    'investments.tasks.daily_price_update_task': {'queue': 'price_updates'},
}
```

## Success Indicators

When everything is working correctly, you should see:

1. ✅ Redis server running
2. ✅ Celery worker connected and ready
3. ✅ Celery beat scheduler running
4. ✅ Django server running
5. ✅ New investments automatically enriched
6. ✅ Background tasks executing successfully
7. ✅ Daily price updates running on schedule

The system is now fully operational with background task processing!