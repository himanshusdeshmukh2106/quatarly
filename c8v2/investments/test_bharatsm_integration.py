import unittest
from unittest.mock import patch, MagicMock
from decimal import Decimal
import pandas as pd
from django.test import TestCase
from django.contrib.auth import get_user_model

from .models import Investment
from .bharatsm_service import FinalOptimizedBharatSMService, get_bharatsm_frontend_data, get_bharatsm_basic_info
from .data_enrichment_service import DataEnrichmentService
from .exceptions import BharatSMAPIException

User = get_user_model()

class MockNSE:
    def get_ohlc_from_charting(self, *args, **kwargs):
        return pd.DataFrame({'volume': [1000000, 400000]})

class BharatSMServiceIntegrationTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', email='test@example.com', password='testpassword')
        self.investment = Investment.objects.create(
            user=self.user,
            symbol='RELIANCE',
            name='Reliance Industries',
            asset_type='stock',
            quantity=Decimal('10'),
            average_purchase_price=Decimal('2500.00')
        )

    @patch('investments.bharatsm_service.BHARATSM_AVAILABLE', True)
    @patch('investments.bharatsm_service.TECHNICAL_AVAILABLE', True)
    @patch('Fundamentals.MoneyControl')
    @patch('Technical.NSE', new_callable=MockNSE)
    def test_get_frontend_display_data_success(self, mock_nse, mock_money_control):
        mock_mc_instance = mock_money_control.return_value
        mock_mc_instance.get_ticker.return_value = ('RI', [{'link_src': 'http://someurl.com', 'name': 'Reliance Industries', 'sc_sector': 'Oil & Gas'}])
        
        ratios_df = pd.DataFrame({
            'ratios': ['Market Cap (Cr.)', 'P/E (x)'],
            'Mar 25': [150000, 25.5]
        })
        mock_mc_instance.get_complete_ratios_data.return_value = ratios_df
        
        quarterly_df = pd.DataFrame({
            'Quarterly Results': ['Net Sales/Income from operations'],
            'Mar \'25': [75000],
            'Mar \'24': [60000]
        })
        mock_mc_instance.get_complete_quarterly_results.return_value = quarterly_df

        service = BharatSMService()
        data = service.get_frontend_display_data('RELIANCE')

        self.assertEqual(data['volume'], '1.4M')
        self.assertEqual(data['market_cap'], 1500000000000.0)
        self.assertEqual(data['pe_ratio'], 25.5)
        self.assertEqual(data['growth_rate'], 25.0)
        self.assertEqual(data['company_name'], 'Reliance Industries')
        self.assertEqual(data['sector'], 'Oil & Gas')

    @patch('investments.bharatsm_service.BHARATSM_AVAILABLE', True)
    @patch('investments.bharatsm_service.TECHNICAL_AVAILABLE', False)
    @patch('Fundamentals.MoneyControl')
    def test_get_frontend_display_data_no_technical_library(self, mock_money_control):
        mock_mc_instance = mock_money_control.return_value
        mock_mc_instance.get_ticker.return_value = ('RI', [{'link_src': 'http://someurl.com', 'name': 'Reliance Industries', 'sc_sector': 'Oil & Gas'}])
        
        ratios_df = pd.DataFrame({
            'ratios': ['Market Cap (Cr.)', 'P/E (x)'],
            'Mar 25': [150000, 25.5]
        })
        mock_mc_instance.get_complete_ratios_data.return_value = ratios_df
        
        quarterly_df = pd.DataFrame({
            'Quarterly Results': ['Net Sales/Income from operations'],
            'Mar \'25': [75000],
            'Mar \'24': [60000]
        })
        mock_mc_instance.get_complete_quarterly_results.return_value = quarterly_df

        service = BharatSMService()
        data = service.get_frontend_display_data('RELIANCE')

        self.assertEqual(data['volume'], 'N/A')

    @patch('investments.bharatsm_service.BHARATSM_AVAILABLE', True)
    @patch('Fundamentals.MoneyControl')
    def test_get_basic_stock_info_success(self, mock_money_control):
        mock_mc_instance = mock_money_control.return_value
        mock_mc_instance.get_ticker.return_value = ('TCS', [{'name': 'Tata Consultancy Services', 'sc_sector': 'IT - Software'}])

        service = BharatSMService()
        data = service.get_basic_stock_info('TCS')

        self.assertEqual(data['name'], 'Tata Consultancy Services')
        self.assertEqual(data['sector'], 'IT - Software')
        self.assertEqual(data['symbol'], 'TCS')
        self.assertEqual(data['exchange'], 'NSE')

    @patch('investments.data_enrichment_service.get_bharatsm_frontend_data')
    def test_enrich_stock_data_with_bharatsm_success(self, mock_get_bharatsm_data):
        mock_get_bharatsm_data.return_value = {
            'volume': '2.5M',
            'market_cap': 500000000000.0,
            'pe_ratio': 28.5,
            'growth_rate': 15.2,
            'sector': 'IT - Software',
            'company_name': 'Infosys Limited'
        }

        investment = Investment.objects.create(
            user=self.user,
            symbol='INFY',
            name='Infosys',
            asset_type='stock',
            quantity=Decimal('50'),
            average_purchase_price=Decimal('1500.00')
        )

        success = DataEnrichmentService.enrich_stock_data_with_bharatsm(investment)
        self.assertTrue(success)

        investment.refresh_from_db()
        self.assertEqual(investment.volume, '2.5M')
        self.assertEqual(investment.market_cap, Decimal('500000000000.0'))
        self.assertEqual(investment.pe_ratio, Decimal('28.5'))
        self.assertEqual(investment.growth_rate, Decimal('15.2'))
        self.assertEqual(investment.sector, 'IT - Software')
        self.assertEqual(investment.name, 'Infosys Limited')

    @patch('investments.data_enrichment_service.get_bharatsm_frontend_data', side_effect=BharatSMAPIException("API Error"))
    @patch('investments.data_enrichment_service.PerplexityAPIService.get_fallback_data')
    def test_enrich_stock_data_bharatsm_fallback(self, mock_get_fallback_data, mock_get_bharatsm_data):
        mock_get_fallback_data.return_value = {
            'volume': '1.8M',
            'market_cap': 450000000000.0,
            'pe_ratio': 26.0,
            'growth_rate': 12.5,
            'current_price': 1550.0
        }

        investment = Investment.objects.create(
            user=self.user,
            symbol='INFY',
            name='Infosys',
            asset_type='stock',
            quantity=Decimal('50'),
            average_purchase_price=Decimal('1500.00')
        )

        success = DataEnrichmentService.enrich_stock_data_with_bharatsm(investment)
        self.assertTrue(success)

        investment.refresh_from_db()
        self.assertEqual(investment.volume, '1.8M')
        self.assertEqual(investment.market_cap, Decimal('450000000000.0'))
        self.assertEqual(investment.current_price, Decimal('1550.0000'))

    @patch('investments.bharatsm_service.BHARATSM_AVAILABLE', True)
    @patch('Fundamentals.MoneyControl')
    def test_get_basic_stock_info_no_ticker(self, mock_money_control):
        mock_mc_instance = mock_money_control.return_value
        mock_mc_instance.get_ticker.return_value = (None, None)

        service = BharatSMService()
        data = service.get_basic_stock_info('NONEXISTENT')
        self.assertEqual(data, {})

        @patch('investments.bharatsm_service.BHARATSM_AVAILABLE', True)
    @patch('Fundamentals.MoneyControl')
    def test_get_basic_stock_info_api_error(self, mock_money_control):
        mock_mc_instance = mock_money_control.return_value
        mock_mc_instance.get_ticker.side_effect = Exception("API Error")

        service = BharatSMService()
        with self.assertRaises(BharatSMAPIException):
            service.get_basic_stock_info('ANYTICKER')

if __name__ == '__main__':
    unittest.main()