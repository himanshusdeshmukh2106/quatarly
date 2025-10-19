#!/usr/bin/env python
"""
Debug script to test registration and see actual error messages
"""

import requests
import json

# Test registration with the actual server
url = "http://localhost:8000/api/auth/registration/"

# Test data matching frontend
test_data = {
    "username": "testuser123",
    "email": "testuser123@example.com",
    "password1": "TestPass123!",
    "password2": "TestPass123!"
}

print("Testing registration endpoint...")
print(f"URL: {url}")
print(f"Data: {json.dumps(test_data, indent=2)}")
print("\n" + "="*60 + "\n")

try:
    response = requests.post(url, json=test_data, headers={"Content-Type": "application/json"})
    
    print(f"Status Code: {response.status_code}")
    print(f"Response Headers: {dict(response.headers)}")
    print(f"\nResponse Body:")
    
    try:
        response_json = response.json()
        print(json.dumps(response_json, indent=2))
    except:
        print(response.text)
        
except Exception as e:
    print(f"Error: {e}")

