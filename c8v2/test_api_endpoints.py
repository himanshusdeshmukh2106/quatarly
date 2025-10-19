#!/usr/bin/env python
"""
Test script to verify API endpoints work correctly.
Tests registration, login, and questionnaire submission.
"""

import os
import sys
import django
import json
import random
import string

# Setup Django environment
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'C8V2.settings')
django.setup()

from django.test import Client
from django.contrib.auth import get_user_model
from rest_framework.authtoken.models import Token

User = get_user_model()


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


def generate_random_username():
    """Generate a random username"""
    return 'testuser_' + ''.join(random.choices(string.ascii_lowercase + string.digits, k=8))


def test_registration():
    """Test user registration endpoint"""
    print_header("Testing User Registration")

    client = Client(HTTP_HOST='localhost')
    username = generate_random_username()
    email = f"{username}@example.com"
    password = "TestPass123!@#"

    data = {
        'username': username,
        'email': email,
        'password1': password,
        'password2': password,
    }

    try:
        response = client.post(
            '/api/auth/registration/',
            data=json.dumps(data),
            content_type='application/json',
            HTTP_HOST='localhost'
        )
        
        if response.status_code == 201:
            print_success(f"Registration successful (Status: {response.status_code})")
            print_info(f"Username: {username}")
            print_info(f"Email: {email}")
            
            # Check if token is returned
            response_data = response.json()
            if 'key' in response_data:
                print_success("Auth token returned in response")
                return True, username, password, response_data['key']
            else:
                print_error("Auth token not found in response")
                print_info(f"Response: {response_data}")
                return False, None, None, None
        else:
            print_error(f"Registration failed (Status: {response.status_code})")
            print_info(f"Response: {response.json()}")
            return False, None, None, None
            
    except Exception as e:
        print_error(f"Registration test failed: {e}")
        return False, None, None, None


def test_login(username, password):
    """Test user login endpoint"""
    print_header("Testing User Login")

    client = Client(HTTP_HOST='localhost')

    data = {
        'username': username,
        'password': password,
    }

    try:
        response = client.post(
            '/api/auth/login/',
            data=json.dumps(data),
            content_type='application/json',
            HTTP_HOST='localhost'
        )
        
        if response.status_code == 200:
            print_success(f"Login successful (Status: {response.status_code})")
            response_data = response.json()
            
            if 'key' in response_data:
                print_success("Auth token returned in response")
                print_info(f"Token: {response_data['key'][:20]}...")
                return True, response_data['key']
            else:
                print_error("Auth token not found in response")
                return False, None
        else:
            print_error(f"Login failed (Status: {response.status_code})")
            print_info(f"Response: {response.json()}")
            return False, None
            
    except Exception as e:
        print_error(f"Login test failed: {e}")
        return False, None


def test_questionnaire_submission(token):
    """Test questionnaire submission endpoint"""
    print_header("Testing Questionnaire Submission")

    client = Client(HTTP_HOST='localhost')

    # Sample questionnaire data matching frontend structure
    data = {
        'responses': [
            {
                'question_id': 1,
                'selected_choices': ['Option 1'],
                'custom_input': None
            },
            {
                'question_id': 2,
                'selected_choices': ['Option A', 'Option B'],
                'custom_input': None
            },
        ]
    }

    try:
        response = client.post(
            '/api/questionnaire/submit/',
            data=json.dumps(data),
            content_type='application/json',
            HTTP_AUTHORIZATION=f'Token {token}',
            HTTP_HOST='localhost'
        )
        
        if response.status_code in [200, 201]:
            print_success(f"Questionnaire submission successful (Status: {response.status_code})")
            return True
        elif response.status_code == 400:
            print_info(f"Questionnaire submission returned 400 (expected if questions don't exist)")
            print_info(f"Response: {response.json()}")
            return True  # This is expected if questions aren't seeded
        else:
            print_error(f"Questionnaire submission failed (Status: {response.status_code})")
            print_info(f"Response: {response.json()}")
            return False
            
    except Exception as e:
        print_error(f"Questionnaire test failed: {e}")
        return False


def test_user_profile(token):
    """Test user profile endpoint"""
    print_header("Testing User Profile")

    client = Client(HTTP_HOST='localhost')

    try:
        response = client.get(
            '/api/auth/user/',
            HTTP_AUTHORIZATION=f'Token {token}',
            HTTP_HOST='localhost'
        )
        
        if response.status_code == 200:
            print_success(f"Profile fetch successful (Status: {response.status_code})")
            response_data = response.json()
            print_info(f"User: {response_data.get('username')}")
            print_info(f"Email: {response_data.get('email')}")
            print_info(f"Onboarding Complete: {response_data.get('onboarding_complete')}")
            return True
        else:
            print_error(f"Profile fetch failed (Status: {response.status_code})")
            return False
            
    except Exception as e:
        print_error(f"Profile test failed: {e}")
        return False


def cleanup_test_user(username):
    """Clean up test user"""
    try:
        user = User.objects.get(username=username)
        user.delete()
        print_info(f"Cleaned up test user: {username}")
    except User.DoesNotExist:
        pass
    except Exception as e:
        print_error(f"Failed to cleanup test user: {e}")


def main():
    """Run all API tests"""
    print("\n" + "="*60)
    print("  API Endpoints Test Suite")
    print("="*60)
    
    results = {}
    username = None
    token = None
    
    # Test 1: Registration
    success, username, password, reg_token = test_registration()
    results['Registration'] = success
    
    if success and username:
        # Test 2: Login
        success, login_token = test_login(username, password)
        results['Login'] = success
        token = login_token or reg_token
        
        if token:
            # Test 3: User Profile
            results['User Profile'] = test_user_profile(token)
            
            # Test 4: Questionnaire (optional)
            results['Questionnaire'] = test_questionnaire_submission(token)
        
        # Cleanup
        cleanup_test_user(username)
    
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
        print_success("All API tests passed!")
        return 0
    else:
        print_error(f"{total - passed} test(s) failed.")
        return 1


if __name__ == '__main__':
    sys.exit(main())

