#!/usr/bin/env python
"""
Test script to verify the complete onboarding flow.
Tests questionnaire submission with various data scenarios.
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


def create_test_user():
    """Create a test user and return username, password, and token"""
    username = generate_random_username()
    password = "TestPass123!@#"
    email = f"{username}@example.com"
    
    user = User.objects.create_user(
        username=username,
        email=email,
        password=password
    )
    
    token, _ = Token.objects.get_or_create(user=user)
    
    return username, password, token.key, user


def test_complete_onboarding_flow():
    """Test complete onboarding submission with all data"""
    print_header("Testing Complete Onboarding Flow")
    
    username, password, token, user = create_test_user()
    print_info(f"Created test user: {username}")
    
    client = Client()
    
    # Sample questionnaire data matching frontend structure
    questionnaire_data = {
        'responses': [
            {
                'question_id': 1,
                'selected_choices': [],
                'custom_input': 'John Doe'
            },
            {
                'question_id': 2,
                'selected_choices': [],
                'custom_input': '30'
            },
            {
                'question_id': 3,
                'selected_choices': ['Male'],
                'custom_input': None
            },
            {
                'question_id': 4,
                'selected_choices': ['Single'],
                'custom_input': None
            },
            {
                'question_id': 5,
                'selected_choices': ['No'],
                'custom_input': None
            },
            {
                'question_id': 6,
                'selected_choices': [],
                'custom_input': '50000'
            },
            {
                'question_id': 7,
                'selected_choices': ['Permanent job (Very stable)'],
                'custom_input': None
            },
            {
                'question_id': 8,
                'selected_choices': [],
                'custom_input': json.dumps({
                    'Rent/EMI': '15000',
                    'Food & Groceries': '8000',
                    'Transportation': '3000',
                    'Entertainment & Shopping': '5000'
                })
            },
            {
                'question_id': 9,
                'selected_choices': ['No debts (All clear! 🎉)'],
                'custom_input': None
            },
            {
                'question_id': 11,
                'selected_choices': ['3-6 months 😊'],
                'custom_input': None
            },
            {
                'question_id': 12,
                'selected_choices': ['Build emergency fund'],
                'custom_input': None
            },
            {
                'question_id': 13,
                'selected_choices': ['Buy a house'],
                'custom_input': None
            },
            {
                'question_id': 14,
                'selected_choices': ['Just myself'],
                'custom_input': None
            },
            {
                'question_id': 15,
                'selected_choices': ['No support needed'],
                'custom_input': None
            },
            {
                'question_id': 16,
                'selected_choices': [],
                'custom_input': 'I invest in mutual funds and PPF'
            },
            {
                'question_id': 17,
                'selected_choices': ['"Balanced - 50% save, 50% enjoy" ⚖️'],
                'custom_input': None
            },
            {
                'question_id': 18,
                'selected_choices': ['Ready to try mutual funds'],
                'custom_input': None
            },
        ]
    }
    
    try:
        response = client.post(
            '/api/questionnaire/submit/',
            data=json.dumps(questionnaire_data),
            content_type='application/json',
            HTTP_AUTHORIZATION=f'Token {token}',
            HTTP_HOST='localhost'
        )
        
        if response.status_code == 201:
            print_success(f"Questionnaire submitted successfully (Status: {response.status_code})")
            response_data = response.json()
            print_info(f"Responses saved: {response_data.get('responses_saved')}")
            print_info(f"Onboarding complete: {response_data.get('onboarding_complete')}")
            
            # Verify user's onboarding_complete flag
            user.refresh_from_db()
            if user.onboarding_complete:
                print_success("User onboarding_complete flag set to True")
            else:
                print_error("User onboarding_complete flag NOT set")
                return False
            
            # Verify responses were saved
            from questionnaire.models import UserResponse
            saved_responses = UserResponse.objects.filter(user=user).count()
            print_info(f"Total responses in database: {saved_responses}")
            
            return True
        else:
            print_error(f"Questionnaire submission failed (Status: {response.status_code})")
            print_info(f"Response: {response.json()}")
            return False
            
    except Exception as e:
        print_error(f"Test failed: {e}")
        return False
    finally:
        # Cleanup
        user.delete()
        print_info(f"Cleaned up test user: {username}")


def test_minimal_onboarding():
    """Test onboarding with minimal required data"""
    print_header("Testing Minimal Onboarding (Required Fields Only)")
    
    username, password, token, user = create_test_user()
    print_info(f"Created test user: {username}")
    
    client = Client()
    
    # Minimal data - only critical fields
    questionnaire_data = {
        'responses': [
            {
                'question_id': 1,
                'selected_choices': [],
                'custom_input': 'Jane Smith'
            },
            {
                'question_id': 2,
                'selected_choices': [],
                'custom_input': '25'
            },
            {
                'question_id': 6,
                'selected_choices': [],
                'custom_input': '40000'
            },
        ]
    }
    
    try:
        response = client.post(
            '/api/questionnaire/submit/',
            data=json.dumps(questionnaire_data),
            content_type='application/json',
            HTTP_AUTHORIZATION=f'Token {token}',
            HTTP_HOST='localhost'
        )
        
        if response.status_code == 201:
            print_success(f"Minimal questionnaire submitted successfully")
            user.refresh_from_db()
            if user.onboarding_complete:
                print_success("Onboarding completed with minimal data")
                return True
            else:
                print_error("Onboarding flag not set")
                return False
        else:
            print_error(f"Failed (Status: {response.status_code})")
            print_info(f"Response: {response.json()}")
            return False
            
    except Exception as e:
        print_error(f"Test failed: {e}")
        return False
    finally:
        user.delete()
        print_info(f"Cleaned up test user: {username}")


def main():
    """Run all onboarding tests"""
    print("\n" + "="*60)
    print("  Onboarding Flow Test Suite")
    print("="*60)
    
    results = {}
    
    # Test 1: Complete onboarding flow
    results['Complete Onboarding'] = test_complete_onboarding_flow()
    
    # Test 2: Minimal onboarding
    results['Minimal Onboarding'] = test_minimal_onboarding()
    
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
        print_success("All onboarding tests passed!")
        return 0
    else:
        print_error(f"{total - passed} test(s) failed.")
        return 1


if __name__ == '__main__':
    sys.exit(main())

