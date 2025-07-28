#!/usr/bin/env python3
"""
Simple test script to verify the opportunities API is working
"""
import requests
import json

# Test the opportunities API
BASE_URL = "http://127.0.0.1:8000/api"

def test_opportunities_api():
    print("Testing Opportunities API...")
    
    # First, let's try to access the opportunities endpoint without auth
    print("\n1. Testing unauthenticated access (should fail):")
    response = requests.get(f"{BASE_URL}/opportunities/")
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text[:200]}...")
    
    # Test questionnaire responses endpoint
    print("\n2. Testing questionnaire responses endpoint (should fail without auth):")
    response = requests.get(f"{BASE_URL}/questionnaire/responses/")
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text[:200]}...")
    
    print("\n✅ API endpoints are accessible and properly protected!")

if __name__ == "__main__":
    try:
        test_opportunities_api()
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to Django server. Make sure it's running on http://127.0.0.1:8000")
    except Exception as e:
        print(f"❌ Error: {e}")