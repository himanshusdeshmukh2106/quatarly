#!/usr/bin/env python
"""
Verification script to test all the fixes applied to the Quatarly application.
Run this script to verify that all critical issues have been resolved.
"""

import os
import sys
import subprocess
from pathlib import Path

# Colors for terminal output
GREEN = '\033[92m'
RED = '\033[91m'
YELLOW = '\033[93m'
BLUE = '\033[94m'
RESET = '\033[0m'

def print_header(text):
    print(f"\n{BLUE}{'='*60}{RESET}")
    print(f"{BLUE}{text.center(60)}{RESET}")
    print(f"{BLUE}{'='*60}{RESET}\n")

def print_success(text):
    print(f"{GREEN}✓ {text}{RESET}")

def print_error(text):
    print(f"{RED}✗ {text}{RESET}")

def print_warning(text):
    print(f"{YELLOW}⚠ {text}{RESET}")

def print_info(text):
    print(f"{BLUE}ℹ {text}{RESET}")

def check_file_exists(filepath, description):
    """Check if a file exists"""
    if Path(filepath).exists():
        print_success(f"{description} exists: {filepath}")
        return True
    else:
        print_error(f"{description} missing: {filepath}")
        return False

def check_env_variable(filepath, var_name):
    """Check if an environment variable is defined in .env file"""
    try:
        with open(filepath, 'r') as f:
            content = f.read()
            if f"{var_name}=" in content:
                print_success(f"Environment variable '{var_name}' is defined")
                return True
            else:
                print_error(f"Environment variable '{var_name}' is missing")
                return False
    except FileNotFoundError:
        print_error(f".env file not found: {filepath}")
        return False

def check_settings_configuration(filepath, check_name, search_string):
    """Check if a specific configuration exists in settings.py"""
    try:
        with open(filepath, 'r') as f:
            content = f.read()
            if search_string in content:
                print_success(f"{check_name} is configured")
                return True
            else:
                print_error(f"{check_name} is not configured")
                return False
    except FileNotFoundError:
        print_error(f"settings.py not found: {filepath}")
        return False

def check_redis_running():
    """Check if Redis is running"""
    try:
        result = subprocess.run(
            ['redis-cli', 'ping'],
            capture_output=True,
            text=True,
            timeout=5
        )
        if result.returncode == 0 and 'PONG' in result.stdout:
            print_success("Redis is running")
            return True
        else:
            print_error("Redis is not responding")
            return False
    except FileNotFoundError:
        print_warning("redis-cli not found - cannot verify Redis status")
        return None
    except subprocess.TimeoutExpired:
        print_error("Redis connection timeout")
        return False
    except Exception as e:
        print_warning(f"Could not check Redis status: {e}")
        return None

def check_django_configuration():
    """Check Django configuration"""
    try:
        os.chdir('c8v2')
        result = subprocess.run(
            [sys.executable, 'manage.py', 'check'],
            capture_output=True,
            text=True,
            timeout=30
        )
        os.chdir('..')
        
        if result.returncode == 0:
            print_success("Django configuration check passed")
            return True
        else:
            print_error("Django configuration check failed")
            print_info(f"Output: {result.stdout}")
            print_info(f"Errors: {result.stderr}")
            return False
    except Exception as e:
        print_error(f"Could not run Django check: {e}")
        os.chdir('..')
        return False

def main():
    print_header("QUATARLY APP - FIXES VERIFICATION")
    
    all_checks_passed = True
    
    # Check 1: File Structure
    print_header("1. Checking File Structure")
    checks = [
        ('c8v2/.env', '.env file'),
        ('c8v2/.env.example', '.env.example file'),
        ('c8v2/C8V2/settings.py', 'settings.py'),
        ('c8v2/C8V2/health.py', 'health.py'),
        ('c8v2/.gitignore', '.gitignore'),
        ('FIXES_APPLIED.md', 'FIXES_APPLIED.md'),
        ('CODE_ANALYSIS_AND_OPTIMIZATION_REPORT.md', 'Analysis Report'),
        ('OPTIMIZATION_IMPLEMENTATION_GUIDE.md', 'Implementation Guide'),
    ]
    
    for filepath, description in checks:
        if not check_file_exists(filepath, description):
            all_checks_passed = False
    
    # Check 2: Environment Variables
    print_header("2. Checking Environment Variables")
    env_vars = [
        'SECRET_KEY',
        'DEBUG',
        'ALLOWED_HOSTS',
        'DB_NAME',
        'DB_USER',
        'DB_PASSWORD',
        'REDIS_URL',
        'CORS_ALLOWED_ORIGINS',
    ]
    
    for var in env_vars:
        if not check_env_variable('c8v2/.env', var):
            all_checks_passed = False
    
    # Check 3: Security Configurations
    print_header("3. Checking Security Configurations")
    security_checks = [
        ("SECRET_KEY from environment", "os.getenv('SECRET_KEY'"),
        ("DEBUG from environment", "os.getenv('DEBUG'"),
        ("CORS configuration", "CORS_ALLOWED_ORIGINS"),
        ("Security headers", "SECURE_SSL_REDIRECT"),
    ]
    
    for check_name, search_string in security_checks:
        if not check_settings_configuration('c8v2/C8V2/settings.py', check_name, search_string):
            all_checks_passed = False
    
    # Check 4: Performance Configurations
    print_header("4. Checking Performance Configurations")
    performance_checks = [
        ("Database connection pooling", "CONN_MAX_AGE"),
        ("Redis caching", "CACHES"),
        ("API rate limiting", "DEFAULT_THROTTLE_CLASSES"),
        ("Pagination", "DEFAULT_PAGINATION_CLASS"),
    ]
    
    for check_name, search_string in performance_checks:
        if not check_settings_configuration('c8v2/C8V2/settings.py', check_name, search_string):
            all_checks_passed = False
    
    # Check 5: Code Optimizations
    print_header("5. Checking Code Optimizations")
    code_checks = [
        ("Investment queryset optimization", "c8v2/investments/views.py", "prefetch_related"),
        ("Serializer optimization", "c8v2/investments/serializers.py", "recent_chart_data"),
        ("Health check endpoint", "c8v2/C8V2/urls.py", "health_check"),
    ]
    
    for check_name, filepath, search_string in code_checks:
        if not check_settings_configuration(filepath, check_name, search_string):
            all_checks_passed = False
    
    # Check 6: Redis Status
    print_header("6. Checking Redis Status")
    redis_status = check_redis_running()
    if redis_status is False:
        all_checks_passed = False
        print_warning("Redis is required for caching. Please start Redis server.")
        print_info("Windows: redis-server")
        print_info("Linux/Mac: sudo systemctl start redis")
    
    # Check 7: Django Configuration
    print_header("7. Checking Django Configuration")
    if not check_django_configuration():
        all_checks_passed = False
    
    # Final Summary
    print_header("VERIFICATION SUMMARY")
    
    if all_checks_passed:
        print_success("All checks passed! ✓")
        print_info("\nYour application is ready with all fixes applied.")
        print_info("\nNext steps:")
        print_info("1. Start Redis: redis-server")
        print_info("2. Run migrations: cd c8v2 && python manage.py migrate")
        print_info("3. Start server: python manage.py runserver")
        print_info("4. Test health endpoint: curl http://localhost:8000/health/")
    else:
        print_error("Some checks failed. Please review the errors above.")
        print_info("\nRefer to FIXES_APPLIED.md for detailed information.")
    
    print()
    return 0 if all_checks_passed else 1

if __name__ == '__main__':
    sys.exit(main())

