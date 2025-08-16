# Production Deployment Guide

## Overview

This guide covers the deployment and configuration of the enhanced investment backend with BharatSM integration in a production environment.

## Prerequisites

- Python 3.8+
- PostgreSQL 12+
- Redis 6+
- Nginx (for reverse proxy)
- SSL certificate
- Domain name

## Environment Setup

### 1. Environment Variables

Create a `.env` file in the production environment with the following variables:

```bash
# Django Settings
SECRET_KEY=your_production_secret_key_here
DEBUG=False
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com

# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/investment_db

# Redis Configuration
REDIS_URL=redis://localhost:6379/0

# API Keys
PERPLEXITY_API_KEY=your_perplexity_api_key_here

# Celery Configuration
CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/0

# Email Configuration (for notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your_email@gmail.com
EMAIL_HOST_PASSWORD=your_app_password

# Security Settings
SECURE_SSL_REDIRECT=True
SECURE_PROXY_SSL_HEADER=HTTP_X_FORWARDED_PROTO,https
SESSION_COOKIE_SECURE=True
CSRF_COOKIE_SECURE=True
```

### 2. Install Dependencies

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install Python dependencies
pip install -r requirements.txt

# Install BharatSM dependencies
pip install Fundamentals

# Install production server
pip install gunicorn
```

### 3. Database Setup

```bash
# Create PostgreSQL database
sudo -u postgres createdb investment_db
sudo -u postgres createuser investment_user
sudo -u postgres psql -c "ALTER USER investment_user WITH PASSWORD 'secure_password';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE investment_db TO investment_user;"

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Collect static files
python manage.py collectstatic --noinput
```

### 4. Redis Setup

```bash
# Install Redis
sudo apt update
sudo apt install redis-server

# Configure Redis
sudo systemctl enable redis-server
sudo systemctl start redis-server

# Test Redis connection
redis-cli ping
```

## Celery Configuration

### 1. Create Celery Service Files

Create `/etc/systemd/system/celery.service`:

```ini
[Unit]
Description=Celery Service
After=network.target

[Service]
Type=forking
User=www-data
Group=www-data
EnvironmentFile=/path/to/your/project/.env
WorkingDirectory=/path/to/your/project
ExecStart=/path/to/your/project/venv/bin/celery multi start worker1 \
    -A C8V2 --pidfile=/var/run/celery/%n.pid \
    --logfile=/var/log/celery/%n%I.log --loglevel=INFO
ExecStop=/path/to/your/project/venv/bin/celery multi stopwait worker1 \
    --pidfile=/var/run/celery/%n.pid
ExecReload=/path/to/your/project/venv/bin/celery multi restart worker1 \
    -A C8V2 --pidfile=/var/run/celery/%n.pid \
    --logfile=/var/log/celery/%n%I.log --loglevel=INFO

[Install]
WantedBy=multi-user.target
```

Create `/etc/systemd/system/celerybeat.service`:

```ini
[Unit]
Description=Celery Beat Service
After=network.target

[Service]
Type=simple
User=www-data
Group=www-data
EnvironmentFile=/path/to/your/project/.env
WorkingDirectory=/path/to/your/project
ExecStart=/path/to/your/project/venv/bin/celery -A C8V2 beat \
    --pidfile=/var/run/celery/beat.pid \
    --logfile=/var/log/celery/beat.log --loglevel=INFO

[Install]
WantedBy=multi-user.target
```

### 2. Create Log Directories

```bash
sudo mkdir -p /var/log/celery
sudo mkdir -p /var/run/celery
sudo chown www-data:www-data /var/log/celery
sudo chown www-data:www-data /var/run/celery
```

### 3. Start Celery Services

```bash
sudo systemctl daemon-reload
sudo systemctl enable celery
sudo systemctl enable celerybeat
sudo systemctl start celery
sudo systemctl start celerybeat
```

## Gunicorn Configuration

### 1. Create Gunicorn Configuration

Create `gunicorn.conf.py`:

```python
bind = "127.0.0.1:8000"
workers = 3
worker_class = "sync"
worker_connections = 1000
max_requests = 1000
max_requests_jitter = 100
timeout = 30
keepalive = 2
preload_app = True
user = "www-data"
group = "www-data"
tmp_upload_dir = None
errorlog = "/var/log/gunicorn/error.log"
accesslog = "/var/log/gunicorn/access.log"
access_log_format = '%(h)s %(l)s %(u)s %(t)s "%(r)s" %(s)s %(b)s "%(f)s" "%(a)s"'
loglevel = "info"
```

### 2. Create Gunicorn Service

Create `/etc/systemd/system/gunicorn.service`:

```ini
[Unit]
Description=gunicorn daemon
Requires=gunicorn.socket
After=network.target

[Service]
Type=notify
User=www-data
Group=www-data
RuntimeDirectory=gunicorn
WorkingDirectory=/path/to/your/project
ExecStart=/path/to/your/project/venv/bin/gunicorn \
    --config /path/to/your/project/gunicorn.conf.py \
    C8V2.wsgi:application
ExecReload=/bin/kill -s HUP $MAINPID
KillMode=mixed
TimeoutStopSec=5
PrivateTmp=true

[Install]
WantedBy=multi-user.target
```

Create `/etc/systemd/system/gunicorn.socket`:

```ini
[Unit]
Description=gunicorn socket

[Socket]
ListenStream=/run/gunicorn.sock
SocketUser=www-data

[Install]
WantedBy=sockets.target
```

### 3. Start Gunicorn

```bash
sudo mkdir -p /var/log/gunicorn
sudo chown www-data:www-data /var/log/gunicorn

sudo systemctl daemon-reload
sudo systemctl enable gunicorn.socket
sudo systemctl start gunicorn.socket
sudo systemctl enable gunicorn
sudo systemctl start gunicorn
```

## Nginx Configuration

### 1. Create Nginx Site Configuration

Create `/etc/nginx/sites-available/investment-api`:

```nginx
upstream app_server {
    server unix:/run/gunicorn.sock fail_timeout=0;
}

server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL Configuration
    ssl_certificate /path/to/your/ssl/certificate.crt;
    ssl_certificate_key /path/to/your/ssl/private.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;

    # Security Headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    client_max_body_size 4G;
    keepalive_timeout 5;

    # Static files
    location /static/ {
        alias /path/to/your/project/staticfiles/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Media files
    location /media/ {
        alias /path/to/your/project/media/;
        expires 1y;
        add_header Cache-Control "public";
    }

    # API endpoints
    location / {
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Host $http_host;
        proxy_redirect off;
        proxy_buffering off;
        proxy_pass http://app_server;
    }
}
```

### 2. Enable Site

```bash
sudo ln -s /etc/nginx/sites-available/investment-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## Monitoring and Logging

### 1. Configure Logging

Update `settings.py` for production logging:

```python
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
            'style': '{',
        },
        'simple': {
            'format': '{levelname} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'file': {
            'level': 'INFO',
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': '/var/log/django/django.log',
            'maxBytes': 1024*1024*15,  # 15MB
            'backupCount': 10,
            'formatter': 'verbose',
        },
        'celery_file': {
            'level': 'INFO',
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': '/var/log/django/celery.log',
            'maxBytes': 1024*1024*15,  # 15MB
            'backupCount': 10,
            'formatter': 'verbose',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['file'],
            'level': 'INFO',
            'propagate': True,
        },
        'investments': {
            'handlers': ['file'],
            'level': 'INFO',
            'propagate': True,
        },
        'celery': {
            'handlers': ['celery_file'],
            'level': 'INFO',
            'propagate': True,
        },
    },
}
```

### 2. Create Log Directories

```bash
sudo mkdir -p /var/log/django
sudo chown www-data:www-data /var/log/django
```

### 3. Set up Log Rotation

Create `/etc/logrotate.d/django`:

```
/var/log/django/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
    postrotate
        systemctl reload gunicorn
    endscript
}
```

## Health Checks and Monitoring

### 1. Create Health Check Endpoint

Add to `urls.py`:

```python
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
import redis
from django.db import connection

@csrf_exempt
@require_http_methods(["GET"])
def health_check(request):
    """Health check endpoint for load balancers"""
    try:
        # Check database
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
        
        # Check Redis
        r = redis.Redis.from_url(settings.CELERY_BROKER_URL)
        r.ping()
        
        return JsonResponse({
            'status': 'healthy',
            'database': 'ok',
            'redis': 'ok',
            'timestamp': timezone.now().isoformat()
        })
    except Exception as e:
        return JsonResponse({
            'status': 'unhealthy',
            'error': str(e),
            'timestamp': timezone.now().isoformat()
        }, status=503)

urlpatterns = [
    path('health/', health_check, name='health_check'),
    # ... other patterns
]
```

### 2. Monitoring Script

Create `monitor.py`:

```python
#!/usr/bin/env python
import requests
import sys
import time
from datetime import datetime

def check_health():
    """Check application health"""
    try:
        response = requests.get('https://yourdomain.com/health/', timeout=10)
        if response.status_code == 200:
            data = response.json()
            print(f"[{datetime.now()}] Health check: {data['status']}")
            return True
        else:
            print(f"[{datetime.now()}] Health check failed: HTTP {response.status_code}")
            return False
    except Exception as e:
        print(f"[{datetime.now()}] Health check error: {e}")
        return False

if __name__ == "__main__":
    if not check_health():
        sys.exit(1)
```

## Backup Strategy

### 1. Database Backup Script

Create `backup_db.sh`:

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/postgresql"
DB_NAME="investment_db"
DB_USER="investment_user"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Create backup
pg_dump -U $DB_USER -h localhost $DB_NAME | gzip > $BACKUP_DIR/backup_${DATE}.sql.gz

# Keep only last 30 days of backups
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +30 -delete

echo "Database backup completed: backup_${DATE}.sql.gz"
```

### 2. Set up Cron Job

```bash
# Add to crontab
0 2 * * * /path/to/backup_db.sh >> /var/log/backup.log 2>&1
```

## Performance Optimization

### 1. Database Optimization

```sql
-- Create additional indexes for production
CREATE INDEX CONCURRENTLY idx_investment_user_updated ON investments_investment(user_id, updated_at DESC);
CREATE INDEX CONCURRENTLY idx_chartdata_date_desc ON investments_chartdata(date DESC);
CREATE INDEX CONCURRENTLY idx_pricealert_active_triggered ON investments_pricealert(is_active, triggered_at);
```

### 2. Redis Configuration

Update `/etc/redis/redis.conf`:

```
maxmemory 256mb
maxmemory-policy allkeys-lru
save 900 1
save 300 10
save 60 10000
```

## Security Checklist

- [ ] SSL certificate installed and configured
- [ ] Firewall configured (only ports 80, 443, 22 open)
- [ ] Database user has minimal required permissions
- [ ] Secret keys are properly secured
- [ ] Debug mode is disabled
- [ ] ALLOWED_HOSTS is properly configured
- [ ] Security headers are set in Nginx
- [ ] Regular security updates are applied
- [ ] Backup strategy is implemented and tested
- [ ] Monitoring and alerting are configured

## Testing Production Deployment

### 1. API Endpoints Test

```bash
# Test health check
curl -f https://yourdomain.com/health/

# Test authentication
curl -X POST https://yourdomain.com/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "password": "testpass"}'

# Test investments endpoint
curl -H "Authorization: Token your_token" \
  https://yourdomain.com/api/investments/
```

### 2. BharatSM Integration Test

```bash
# Run BharatSM test script
python test_bharatsm_comprehensive.py
```

### 3. Celery Tasks Test

```bash
# Test Celery worker
celery -A C8V2 inspect active

# Test scheduled tasks
celery -A C8V2 inspect scheduled
```

## Maintenance

### 1. Regular Tasks

- Monitor disk space and logs
- Update dependencies regularly
- Review and rotate API keys
- Monitor performance metrics
- Test backup and restore procedures

### 2. Scaling Considerations

- Add more Gunicorn workers as needed
- Consider Redis clustering for high availability
- Implement database read replicas for scaling
- Use CDN for static files
- Consider container orchestration (Docker/Kubernetes)

## Troubleshooting

### Common Issues

1. **502 Bad Gateway**: Check Gunicorn service status
2. **Database connection errors**: Verify PostgreSQL is running and credentials are correct
3. **Celery tasks not running**: Check Redis connection and Celery worker status
4. **BharatSM API failures**: Check internet connectivity and API availability
5. **High memory usage**: Monitor Redis memory usage and configure limits

### Log Locations

- Django: `/var/log/django/django.log`
- Gunicorn: `/var/log/gunicorn/`
- Celery: `/var/log/celery/`
- Nginx: `/var/log/nginx/`
- PostgreSQL: `/var/log/postgresql/`

This deployment guide ensures a robust, secure, and scalable production environment for the enhanced investment backend with BharatSM integration.