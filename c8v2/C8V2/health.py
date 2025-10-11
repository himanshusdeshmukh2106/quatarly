"""
Health check endpoint for monitoring application status
"""
from django.http import JsonResponse
from django.db import connection
from django.core.cache import cache
import logging

logger = logging.getLogger(__name__)


def health_check(request):
    """
    Health check endpoint that verifies:
    - Database connectivity
    - Cache (Redis) connectivity
    - Overall application health
    
    Returns:
        JsonResponse with status 200 if healthy, 503 if unhealthy
    """
    health_status = {
        'status': 'healthy',
        'checks': {}
    }
    
    # Database check
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            cursor.fetchone()
        health_status['checks']['database'] = 'ok'
    except Exception as e:
        logger.error(f"Database health check failed: {e}")
        health_status['checks']['database'] = f'error: {str(e)}'
        health_status['status'] = 'unhealthy'
    
    # Cache check
    try:
        test_key = 'health_check_test'
        test_value = 'ok'
        cache.set(test_key, test_value, 10)
        cached_value = cache.get(test_key)
        
        if cached_value == test_value:
            health_status['checks']['cache'] = 'ok'
            cache.delete(test_key)
        else:
            health_status['checks']['cache'] = 'error: cache value mismatch'
            health_status['status'] = 'unhealthy'
    except Exception as e:
        logger.error(f"Cache health check failed: {e}")
        health_status['checks']['cache'] = f'error: {str(e)}'
        health_status['status'] = 'unhealthy'
    
    # Determine HTTP status code
    status_code = 200 if health_status['status'] == 'healthy' else 503
    
    return JsonResponse(health_status, status=status_code)


def readiness_check(request):
    """
    Readiness check for Kubernetes/container orchestration
    Checks if the application is ready to serve traffic
    """
    return health_check(request)


def liveness_check(request):
    """
    Liveness check for Kubernetes/container orchestration
    Simple check to verify the application is running
    """
    return JsonResponse({'status': 'alive'}, status=200)

