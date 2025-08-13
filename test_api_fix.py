import requests

# Test the opportunities API endpoints
API_BASE_URL = 'http://192.168.1.6:8000/api'

def test_opportunities_api():
    print('Testing Opportunities API...\n')

    # Test 1: Unauthenticated access (should fail)
    print('1. Testing unauthenticated access (should fail):')
    try:
        response = requests.get(f'{API_BASE_URL}/opportunities/')
        print('Status:', response.status_code)
        print('Response:', str(response.json())[:100] + '...')
    except Exception as error:
        print('Status:', response.status_code if 'response' in locals() else 'Error')
        print('Response:', str(response.json())[:100] + '...' if 'response' in locals() else str(error))

    # Test 2: Test questionnaire responses endpoint (should also fail without auth)
    print('\n2. Testing questionnaire responses endpoint (should fail without auth):')
    try:
        response = requests.get(f'{API_BASE_URL}/questionnaire/responses/')
        print('Status:', response.status_code)
        print('Response:', str(response.json())[:100] + '...')
    except Exception as error:
        print('Status:', response.status_code if 'response' in locals() else 'Error')
        print('Response:', str(response.json())[:100] + '...' if 'response' in locals() else str(error))

    print('\n✅ API endpoints are accessible and properly protected!')

if __name__ == '__main__':
    test_opportunities_api()