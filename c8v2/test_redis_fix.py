#!/usr/bin/env python
"""
Test script to verify Redis configuration fix and other potential issues.
Run this script to ensure all fixes are working correctly.
"""

import os
import sys
import django

# Setup Django environment
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'C8V2.settings')
django.setup()

from django.core.cache import cache
from django.conf import settings
import requests
import subprocess


def print_header(text):
    """Print a formatted header"""
    print(f"\n{'='*60}")
    print(f"  {text}")
    print(f"{'='*60}\n")


def print_success(text):
    """Print success message"""
    print(f"✅ {text}")


def print_error(text):
    """Print error message"""
    print(f"❌ {text}")


def print_info(text):
    """Print info message"""
    print(f"ℹ️  {text}")


def test_redis_connection():
    """Test Redis connection"""
    print_header("Testing Redis Connection")
    
    try:
        # Test ping
        result = subprocess.run(['redis-cli', 'ping'], capture_output=True, text=True, timeout=5)
        if result.returncode == 0 and 'PONG' in result.stdout:
            print_success("Redis server is running")
            return True
        else:
            print_error("Redis server is not responding")
            print_info("Start Redis with: redis-server")
            return False
    except Exception as e:
        print_error(f"Failed to connect to Redis: {e}")
        return False


def test_django_cache():
    """Test Django cache configuration"""
    print_header("Testing Django Cache Configuration")
    
    try:
        # Test cache set/get
        test_key = 'test_redis_fix_key'
        test_value = 'test_redis_fix_value'
        
        cache.set(test_key, test_value, 60)
        retrieved_value = cache.get(test_key)
        
        if retrieved_value == test_value:
            print_success("Cache set/get working correctly")
            cache.delete(test_key)
            return True
        else:
            print_error(f"Cache value mismatch: expected '{test_value}', got '{retrieved_value}'")
            return False
    except Exception as e:
        print_error(f"Cache test failed: {e}")
        print_info("Check Redis configuration in settings.py")
        return False


def test_cache_configuration():
    """Test cache configuration settings"""
    print_header("Testing Cache Configuration Settings")
    
    try:
        caches_config = settings.CACHES
        default_cache = caches_config.get('default', {})
        
        print_info(f"Cache Backend: {default_cache.get('BACKEND')}")
        print_info(f"Cache Location: {default_cache.get('LOCATION')}")
        print_info(f"Cache Timeout: {default_cache.get('TIMEOUT')} seconds")
        
        # Check for unsupported options
        options = default_cache.get('OPTIONS', {})
        if 'connection_pool_kwargs' in options:
            print_error("Found unsupported 'connection_pool_kwargs' in cache OPTIONS")
            print_info("This parameter is not supported in Django's RedisCache backend")
            return False
        
        print_success("Cache configuration is correct")
        return True
    except Exception as e:
        print_error(f"Failed to check cache configuration: {e}")
        return False


def test_allauth_configuration():
    """Test django-allauth configuration"""
    print_header("Testing Django-Allauth Configuration")
    
    try:
        # Check for deprecated settings
        deprecated_settings = []
        
        if hasattr(settings, 'ACCOUNT_USERNAME_REQUIRED'):
            deprecated_settings.append('ACCOUNT_USERNAME_REQUIRED')
        
        if hasattr(settings, 'ACCOUNT_EMAIL_REQUIRED'):
            deprecated_settings.append('ACCOUNT_EMAIL_REQUIRED')
        
        if deprecated_settings:
            print_error(f"Found deprecated settings: {', '.join(deprecated_settings)}")
            print_info("These settings should be removed. Use ACCOUNT_SIGNUP_FIELDS instead.")
            return False
        
        # Check required settings
        if not hasattr(settings, 'ACCOUNT_SIGNUP_FIELDS'):
            print_error("ACCOUNT_SIGNUP_FIELDS is not configured")
            return False
        
        if not hasattr(settings, 'ACCOUNT_LOGIN_METHODS'):
            print_error("ACCOUNT_LOGIN_METHODS is not configured")
            return False
        
        print_success("Django-allauth configuration is correct")
        print_info(f"Login Methods: {settings.ACCOUNT_LOGIN_METHODS}")
        print_info(f"Signup Fields: {settings.ACCOUNT_SIGNUP_FIELDS}")
        return True
    except Exception as e:
        print_error(f"Failed to check allauth configuration: {e}")
        return False


def test_django_check():
    """Run Django system check"""
    print_header("Running Django System Check")
    
    try:
        from django.core.management import call_command
        from io import StringIO
        
        out = StringIO()
        call_command('check', stdout=out, stderr=out)
        output = out.getvalue()
        
        if 'System check identified no issues' in output:
            print_success("Django system check passed")
            return True
        else:
            print_error("Django system check found issues:")
            print(output)
            return False
    except Exception as e:
        print_error(f"Django check failed: {e}")
        return False


def test_rest_framework_throttling():
    """Test REST Framework throttling configuration"""
    print_header("Testing REST Framework Throttling")

    try:
        rest_config = settings.REST_FRAMEWORK

        if 'DEFAULT_THROTTLE_CLASSES' not in rest_config:
            print_error("DEFAULT_THROTTLE_CLASSES not configured")
            return False

        if 'DEFAULT_THROTTLE_RATES' not in rest_config:
            print_error("DEFAULT_THROTTLE_RATES not configured")
            return False

        # Check for dj_rest_auth scope
        throttle_rates = rest_config['DEFAULT_THROTTLE_RATES']
        if 'dj_rest_auth' not in throttle_rates:
            print_error("'dj_rest_auth' scope not configured in DEFAULT_THROTTLE_RATES")
            print_info("This is required for dj_rest_auth endpoints")
            return False

        print_success("REST Framework throttling is configured")
        print_info(f"Throttle Rates: {throttle_rates}")
        return True
    except Exception as e:
        print_error(f"Failed to check REST Framework configuration: {e}")
        return False


def test_celery_configuration():
    """Test Celery configuration"""
    print_header("Testing Celery Configuration")
    
    try:
        if not hasattr(settings, 'CELERY_BROKER_URL'):
            print_error("CELERY_BROKER_URL not configured")
            return False
        
        if not hasattr(settings, 'CELERY_RESULT_BACKEND'):
            print_error("CELERY_RESULT_BACKEND not configured")
            return False
        
        print_success("Celery configuration is present")
        print_info(f"Broker URL: {settings.CELERY_BROKER_URL}")
        print_info(f"Result Backend: {settings.CELERY_RESULT_BACKEND}")
        return True
    except Exception as e:
        print_error(f"Failed to check Celery configuration: {e}")
        return False


def main():
    """Run all tests"""
    print("\n" + "="*60)
    print("  Redis Configuration Fix - Verification Script")
    print("="*60)
    
    results = {
        'Redis Connection': test_redis_connection(),
        'Django Cache': test_django_cache(),
        'Cache Configuration': test_cache_configuration(),
        'Allauth Configuration': test_allauth_configuration(),
        'Django System Check': test_django_check(),
        'REST Framework Throttling': test_rest_framework_throttling(),
        'Celery Configuration': test_celery_configuration(),
    }
    
    # Print summary
    print_header("Test Summary")
    
    passed = sum(1 for result in results.values() if result)
    total = len(results)
    
    for test_name, result in results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} - {test_name}")
    
    print(f"\n{'='*60}")
    print(f"  Results: {passed}/{total} tests passed")
    print(f"{'='*60}\n")
    
    if passed == total:
        print_success("All tests passed! Your configuration is correct.")
        return 0
    else:
        print_error(f"{total - passed} test(s) failed. Please review the errors above.")
        return 1


if __name__ == '__main__':
    sys.exit(main())

