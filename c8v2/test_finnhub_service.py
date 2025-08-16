#!/usr/bin/env python
"""
Unit tests for FinnhubAPIService class
"""

import os
import sys
import django
from pathlib import Path
import unittest
from unittest.mock import patch, MagicMock

# Add the project root to Python path
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'C8V2.settings')
django.setup()

from investments.bharatsm_service import FinnhubAPIService


class TestFinnhubAPIService(unittest.TestCase):
    """Test cases for FinnhubAPIService"""
    
    def setUp(self):
        """Set up test fixtures"""
        self.test_symbol = 'AAPL'
        
    def test_get_api_key(self):
        """Test API key retrieval"""
        api_key = FinnhubAPIService.get_api_key()
        self.assertIsNotNone(api_key)
        self.assertIsInstance(api_key, str)
        
    def test_is_available(self):
        """Test service availability check"""
        self.assertTrue(FinnhubAPIService.is_available())
        
    @patch('investments.bharatsm_service.settings')
    def test_is_available_no_key(self, mock_settings):
        """Test service availability when no API key"""
        mock_settings.FINNHUB_API_KEY = None
        self.assertFalse(FinnhubAPIService.is_available())
        
    def test_format_volume_indian(self):
        """Test Indian volume formatting"""
        # Test crores
        self.assertEqual(FinnhubAPIService._format_volume_indian(150000000), "15.0Cr")
        
        # Test lakhs
        self.assertEqual(FinnhubAPIService._format_volume_indian(2500000), "25.0L")
        
        # Test thousands
        self.assertEqual(FinnhubAPIService._format_volume_indian(75000), "75.0K")
        
        # Test small numbers
        self.assertEqual(FinnhubAPIService._format_volume_indian(500), "500")
        
        # Test zero
        self.assertEqual(FinnhubAPIService._format_volume_indian(0), "0")
        
        # Test None
        self.assertEqual(FinnhubAPIService._format_volume_indian(None), "0")
        
    @patch('finnhub.Client')
    def test_get_quote_data(self, mock_finnhub_client):
        """Test quote data fetching"""
        # Mock finnhub client
        mock_client = MagicMock()
        mock_finnhub_client.return_value = mock_client
        
        # Mock quote response
        mock_quote = {
            'c': 150.25,  # Current price
            'v': 50000000,  # Volume
            'd': 2.15,    # Change
            'dp': 1.45,   # Percent change
            'h': 152.00,  # High
            'l': 148.50,  # Low
            'o': 149.00,  # Open
            'pc': 148.10  # Previous close
        }
        mock_client.quote.return_value = mock_quote
        
        result = FinnhubAPIService.get_quote_data(mock_client, self.test_symbol)
        
        self.assertEqual(result['current_price'], 150.25)
        self.assertEqual(result['volume'], 50000000)
        self.assertEqual(result['change'], 2.15)
        
    @patch('finnhub.Client')
    def test_get_company_profile(self, mock_finnhub_client):
        """Test company profile fetching"""
        # Mock finnhub client
        mock_client = MagicMock()
        mock_finnhub_client.return_value = mock_client
        
        # Mock profile response
        mock_profile = {
            'name': 'Apple Inc',
            'country': 'US',
            'currency': 'USD',
            'exchange': 'NASDAQ',
            'finnhubIndustry': 'Technology',
            'marketCapitalization': 2500000000000
        }
        mock_client.company_profile2.return_value = mock_profile
        
        result = FinnhubAPIService.get_company_profile(mock_client, self.test_symbol)
        
        self.assertEqual(result['name'], 'Apple Inc')
        self.assertEqual(result['country'], 'US')
        self.assertEqual(result['finnhubIndustry'], 'Technology')
        
    @patch('finnhub.Client')
    def test_get_basic_financials(self, mock_finnhub_client):
        """Test basic financials fetching"""
        # Mock finnhub client
        mock_client = MagicMock()
        mock_finnhub_client.return_value = mock_client
        
        # Mock financials response
        mock_financials = {
            'metric': {
                'peBasicExclExtraTTM': 25.5,
                '52WeekHigh': 182.94,
                '52WeekLow': 124.17,
                'beta': 1.2
            }
        }
        mock_client.company_basic_financials.return_value = mock_financials
        
        result = FinnhubAPIService.get_basic_financials(mock_client, self.test_symbol)
        
        self.assertEqual(result['pe_ratio'], 25.5)
        self.assertEqual(result['52_week_high'], 182.94)
        self.assertEqual(result['beta'], 1.2)
        
    @patch('finnhub.Client')
    def test_get_stock_data_integration(self, mock_finnhub_client):
        """Test complete stock data integration"""
        # Mock finnhub client
        mock_client = MagicMock()
        mock_finnhub_client.return_value = mock_client
        
        # Mock all responses
        mock_client.quote.return_value = {
            'c': 150.25,
            'v': 50000000
        }
        
        mock_client.company_profile2.return_value = {
            'name': 'Apple Inc',
            'finnhubIndustry': 'Technology',
            'marketCapitalization': 2500000000000,
            'exchange': 'NASDAQ',
            'currency': 'USD'
        }
        
        mock_client.company_basic_financials.return_value = {
            'metric': {
                'peBasicExclExtraTTM': 25.5
            }
        }
        
        result = FinnhubAPIService.get_stock_data(self.test_symbol)
        
        self.assertIsInstance(result, dict)
        self.assertEqual(result['current_price'], 150.25)
        self.assertEqual(result['company_name'], 'Apple Inc')
        self.assertEqual(result['pe_ratio'], 25.5)
        self.assertEqual(result['volume'], '5.0Cr')  # 50M formatted as Indian
        
    def test_error_handling_no_api_key(self):
        """Test error handling when API key is missing"""
        with patch.object(FinnhubAPIService, 'get_api_key', return_value=None):
            result = FinnhubAPIService.get_stock_data(self.test_symbol)
            self.assertEqual(result, {})


def run_tests():
    """Run all Finnhub service tests"""
    print("Running FinnhubAPIService Tests")
    print("=" * 40)
    
    # Create test suite
    suite = unittest.TestLoader().loadTestsFromTestCase(TestFinnhubAPIService)
    
    # Run tests
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    
    # Print summary
    print(f"\nTests run: {result.testsRun}")
    print(f"Failures: {len(result.failures)}")
    print(f"Errors: {len(result.errors)}")
    
    if result.wasSuccessful():
        print("✅ All tests passed!")
        return True
    else:
        print("❌ Some tests failed!")
        return False


if __name__ == "__main__":
    run_tests()