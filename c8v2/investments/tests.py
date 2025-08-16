from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from decimal import Decimal
from unittest.mock import patch, MagicMock
from .models import Investment, ChartData, PriceAlert
from .services import InvestmentService, MarketDataService, AIInsightsService
from .data_enrichment_service import DataEnrichmentService
from .perplexity_service import PerplexityAPIService
from .asset_suggestions import AssetSuggestionService
from .exceptions import AssetValidationException, DataEnrichmentException

User = get_user_model()


class InvestmentModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        
    def test_stock_investment_creation(self):
        investment = Investment.objects.create(
            user=self.user,
            symbol='AAPL',
            name='Apple Inc.',
            asset_type='stock',
            quantity=Decimal('10'),
            average_purchase_price=Decimal('150.00'),
            current_price=Decimal('175.50')
        )
        
        self.assertEqual(investment.symbol, 'AAPL')
        self.assertEqual(investment.asset_type, 'stock')
        self.assertEqual(investment.total_value, Decimal('1755.00'))
        self.assertEqual(investment.total_gain_loss, Decimal('255.00'))
        self.assertTrue(investment.is_tradeable)
        self.assertFalse(investment.is_physical)
        
    def test_physical_asset_creation(self):
        investment = Investment.objects.create(
            user=self.user,
            name='Gold Bars',
            asset_type='gold',
            quantity=Decimal('100'),
            unit='grams',
            average_purchase_price=Decimal('60.00'),
            current_price=Decimal('65.00')
        )
        
        self.assertEqual(investment.asset_type, 'gold')
        self.assertEqual(investment.unit, 'grams')
        self.assertFalse(investment.is_tradeable)
        self.assertTrue(investment.is_physical)
        self.assertEqual(investment.get_display_unit(), 'grams')
        
    def test_crypto_investment_creation(self):
        investment = Investment.objects.create(
            user=self.user,
            symbol='BTC',
            name='Bitcoin',
            asset_type='crypto',
            quantity=Decimal('0.5'),
            average_purchase_price=Decimal('50000.00'),
            current_price=Decimal('55000.00')
        )
        
        self.assertEqual(investment.asset_type, 'crypto')
        self.assertTrue(investment.is_tradeable)
        self.assertEqual(investment.get_display_unit(), 'coins')
        
    def test_investment_save_calculations(self):
        investment = Investment.objects.create(
            user=self.user,
            symbol='GOOGL',
            name='Alphabet Inc.',
            asset_type='stock',
            quantity=Decimal('5'),
            average_purchase_price=Decimal('2000.00'),
            current_price=Decimal('2200.00')
        )
        
        self.assertEqual(investment.total_value, Decimal('11000.00'))
        self.assertEqual(investment.total_gain_loss, Decimal('1000.00'))
        self.assertEqual(investment.total_gain_loss_percent, Decimal('10.0000'))
        
    def test_investment_manager_methods(self):
        Investment.objects.create(
            user=self.user, symbol='AAPL', name='Apple', asset_type='stock',
            quantity=10, average_purchase_price=150, current_price=175
        )
        Investment.objects.create(
            user=self.user, symbol='BTC', name='Bitcoin', asset_type='crypto',
            quantity=1, average_purchase_price=50000, current_price=55000
        )
        Investment.objects.create(
            user=self.user, name='Gold', asset_type='gold', unit='grams',
            quantity=100, average_purchase_price=60, current_price=65
        )
        
        tradeable = Investment.objects.get_tradeable_assets(self.user)
        physical = Investment.objects.get_physical_assets(self.user)
        stocks = Investment.objects.get_by_asset_type(self.user, 'stock')
        
        self.assertEqual(tradeable.count(), 2)
        self.assertEqual(physical.count(), 1)
        self.assertEqual(stocks.count(), 1)


class InvestmentAPITest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)
        
    def test_create_investment(self):
        data = {
            'symbol': 'AAPL',
            'asset_type': 'stock',
            'quantity': 10,
            'average_purchase_price': 150.00
        }
        
        response = self.client.post('/api/investments/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Investment.objects.count(), 1)
        
    def test_list_investments(self):
        Investment.objects.create(
            user=self.user,
            symbol='AAPL',
            name='Apple Inc.',
            asset_type='stock',
            quantity=Decimal('10'),
            average_purchase_price=Decimal('150.00'),
            current_price=Decimal('175.50')
        )
        
        response = self.client.get('/api/investments/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        
    def test_portfolio_summary(self):
        Investment.objects.create(
            user=self.user,
            symbol='AAPL',
            name='Apple Inc.',
            asset_type='stock',
            quantity=Decimal('10'),
            average_purchase_price=Decimal('150.00'),
            current_price=Decimal('175.50')
        )
        
        response = self.client.get('/api/investments/portfolio_summary/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('total_value', response.data)
        self.assertIn('total_gain_loss', response.data)


class InvestmentServiceTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        
    def test_portfolio_summary(self):
        Investment.objects.create(
            user=self.user,
            symbol='AAPL',
            name='Apple Inc.',
            asset_type='stock',
            quantity=Decimal('10'),
            average_purchase_price=Decimal('150.00'),
            current_price=Decimal('175.50')
        )
        
        Investment.objects.create(
            user=self.user,
            symbol='GOOGL',
            name='Alphabet Inc.',
            asset_type='stock',
            quantity=Decimal('5'),
            average_purchase_price=Decimal('2000.00'),
            current_price=Decimal('1900.00')
        )
        
        summary = InvestmentService.get_portfolio_summary(self.user)
        
        self.assertEqual(summary['investment_count'], 2)
        self.assertEqual(summary['total_value'], Decimal('11255.00'))
        self.assertIsInstance(summary['total_gain_loss'], Decimal)


class ChartDataTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        
        self.investment = Investment.objects.create(
            user=self.user,
            symbol='AAPL',
            name='Apple Inc.',
            asset_type='stock',
            quantity=Decimal('10'),
            average_purchase_price=Decimal('150.00'),
            current_price=Decimal('175.50')
        )
        
    def test_chart_data_creation(self):
        from datetime import date
        
        chart_data = ChartData.objects.create(
            investment=self.investment,
            date=date.today(),
            open_price=Decimal('170.00'),
            high_price=Decimal('180.00'),
            low_price=Decimal('165.00'),
            close_price=Decimal('175.50'),
            volume=1000000,
            timestamp=1234567890
        )
        
        self.assertEqual(chart_data.investment, self.investment)
        self.assertEqual(chart_data.close_price, Decimal('175.50'))


class PriceAlertTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        
        self.investment = Investment.objects.create(
            user=self.user,
            symbol='AAPL',
            name='Apple Inc.',
            asset_type='stock',
            quantity=Decimal('10'),
            average_purchase_price=Decimal('150.00'),
            current_price=Decimal('175.50')
        )
        
    def test_price_alert_creation(self):
        alert = PriceAlert.objects.create(
            user=self.user,
            investment=self.investment,
            alert_type='above',
            target_value=Decimal('200.00')
        )
        
        self.assertEqual(alert.user, self.user)
        self.assertEqual(alert.investment, self.investment)
        self.assertEqual(alert.alert_type, 'above')
        self.assertTrue(alert.is_active)


class DataEnrichmentServiceTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        
    @patch('investments.data_enrichment_service.DataEnrichmentService.enrich_stock_data_with_bharatsm')
    def test_enrich_stock_data(self, mock_enrich_stock_data):
        mock_enrich_stock_data.return_value = True
        
        investment = Investment.objects.create(
            user=self.user,
            symbol='AAPL',
            name='Apple Inc.',
            asset_type='stock',
            quantity=10,
            average_purchase_price=150,
            current_price=150
        )
        
        success = DataEnrichmentService.enrich_investment_data(investment.id)
        
        self.assertTrue(success)
        investment.refresh_from_db()
        self.assertTrue(investment.data_enriched)
        
    @patch('investments.data_enrichment_service.PerplexityAPIService.get_fallback_data')
    def test_enrich_precious_metal_data(self, mock_get_fallback_data):
        mock_get_fallback_data.return_value = {
            'price_per_gram': 65.50,
            'daily_change_percent': 2.5
        }
        
        investment = Investment.objects.create(
            user=self.user,
            name='Gold Bars',
            asset_type='gold',
            unit='grams',
            quantity=100,
            average_purchase_price=60,
            current_price=60
        )
        
        success = DataEnrichmentService.enrich_precious_metal_data(investment)
        
        self.assertTrue(success)
        investment.refresh_from_db()
        self.assertEqual(investment.current_price, Decimal('65.50'))
        self.assertEqual(investment.daily_change_percent, Decimal('2.50'))
        
    def test_get_asset_suggestions(self):
        suggestions = DataEnrichmentService.get_asset_suggestions('apple', 'stock')
        self.assertIsInstance(suggestions, list)
        
    def test_refresh_investment_prices(self):
        Investment.objects.create(
            user=self.user, symbol='AAPL', name='Apple', asset_type='stock',
            quantity=10, average_purchase_price=150, current_price=150
        )
        Investment.objects.create(
            user=self.user, name='Gold', asset_type='gold', unit='grams',
            quantity=100, average_purchase_price=60, current_price=60
        )
        
        with patch.object(DataEnrichmentService, 'enrich_investment_data', return_value=True):
            updated = DataEnrichmentService.refresh_investment_prices(user=self.user)
            self.assertEqual(len(updated), 1)


class PerplexityAPIServiceTest(TestCase):
    @patch('investments.perplexity_service.requests.post')
    def test_get_stock_data(self, mock_post):
        mock_response = MagicMock()
        mock_response.json.return_value = {
            'choices': [{
                'message': {
                    'content': '{"current_price": 180.00, "market_cap": 2800000000000}'
                }
            }]
        }
        mock_response.raise_for_status.return_value = None
        mock_post.return_value = mock_response
        
        result = PerplexityAPIService.get_stock_data('AAPL')
        
        self.assertIsInstance(result, dict)
        self.assertIn('current_price', result)
        
    @patch('investments.perplexity_service.requests.post')
    def test_api_error_handling(self, mock_post):
        mock_post.side_effect = Exception('API Error')
        
        result = PerplexityAPIService.get_stock_data('INVALID')
        
        self.assertEqual(result, {})


class AssetSuggestionServiceTest(TestCase):
    def test_get_stock_suggestions(self):
        suggestions = AssetSuggestionService.get_suggestions('apple', 'stock')
        
        self.assertIsInstance(suggestions, list)
        apple_found = any('apple' in s['name'].lower() for s in suggestions)
        self.assertTrue(apple_found)
        
    def test_get_crypto_suggestions(self):
        suggestions = AssetSuggestionService.get_suggestions('bitcoin', 'crypto')
        
        self.assertIsInstance(suggestions, list)
        bitcoin_found = any('bitcoin' in s['name'].lower() for s in suggestions)
        self.assertTrue(bitcoin_found)
        
    def test_get_physical_asset_suggestions(self):
        suggestions = AssetSuggestionService.get_suggestions('gold', 'gold')
        
        self.assertIsInstance(suggestions, list)
        gold_found = any('gold' in s['name'].lower() for s in suggestions)
        self.assertTrue(gold_found)
        
    def test_calculate_score(self):
        asset = {'symbol': 'AAPL', 'name': 'Apple Inc.', 'sector': 'Technology'}
        
        score = AssetSuggestionService._calculate_score('aapl', asset)
        self.assertGreater(score, 50)
        
        score = AssetSuggestionService._calculate_score('apple', asset)
        self.assertGreater(score, 30)
        
    def test_get_popular_assets_by_type(self):
        popular_stocks = AssetSuggestionService.get_popular_assets_by_type('stock', 5)
        
        self.assertIsInstance(popular_stocks, list)
        self.assertLessEqual(len(popular_stocks), 5)
        self.assertTrue(all('name' in asset for asset in popular_stocks))


class EnhancedInvestmentAPITest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)
        
    def test_create_stock_investment(self):
        data = {
            'asset_type': 'stock',
            'symbol': 'AAPL',
            'name': 'Apple Inc.',
            'quantity': 10,
            'average_purchase_price': 150.00
        }
        
        response = self.client.post('/api/investments/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        investment = Investment.objects.get()
        self.assertEqual(investment.asset_type, 'stock')
        self.assertEqual(investment.symbol, 'AAPL')
        
    def test_create_physical_asset(self):
        data = {
            'asset_type': 'gold',
            'name': 'Gold Bars',
            'quantity': 100,
            'unit': 'grams',
            'average_purchase_price': 60.00
        }
        
        response = self.client.post('/api/investments/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        investment = Investment.objects.get()
        self.assertEqual(investment.asset_type, 'gold')
        self.assertEqual(investment.unit, 'grams')
        
    def test_create_crypto_investment(self):
        data = {
            'asset_type': 'crypto',
            'symbol': 'BTC',
            'name': 'Bitcoin',
            'quantity': 0.5,
            'average_purchase_price': 50000.00
        }
        
        response = self.client.post('/api/investments/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        investment = Investment.objects.get()
        self.assertEqual(investment.asset_type, 'crypto')
        self.assertEqual(investment.symbol, 'BTC')
        
    def test_filter_by_asset_type(self):
        Investment.objects.create(
            user=self.user, symbol='AAPL', name='Apple', asset_type='stock',
            quantity=10, average_purchase_price=150, current_price=175
        )
        Investment.objects.create(
            user=self.user, name='Gold', asset_type='gold', unit='grams',
            quantity=100, average_purchase_price=60, current_price=65
        )
        
        response = self.client.get('/api/investments/?asset_type=stock')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['asset_type'], 'stock')
        
    def test_asset_suggestions_endpoint(self):
        response = self.client.get('/api/investments/asset_suggestions/?q=apple&type=stock')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsInstance(response.data, list)
        
    def test_portfolio_insights_endpoint(self):
        Investment.objects.create(
            user=self.user, symbol='AAPL', name='Apple', asset_type='stock',
            quantity=10, average_purchase_price=150, current_price=175
        )
        
        response = self.client.get('/api/investments/portfolio_insights/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('performance_insights', response.data)
        self.assertIn('diversification_insights', response.data)
        
    def test_asset_type_performance_endpoint(self):
        Investment.objects.create(
            user=self.user, symbol='AAPL', name='Apple', asset_type='stock',
            quantity=10, average_purchase_price=150, current_price=175
        )
        
        response = self.client.get('/api/investments/asset_type_performance/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('stock', response.data)
        
    def test_diversification_analysis_endpoint(self):
        Investment.objects.create(
            user=self.user, symbol='AAPL', name='Apple', asset_type='stock',
            quantity=10, average_purchase_price=150, current_price=175
        )
        
        response = self.client.get('/api/investments/diversification_analysis/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('diversification_score', response.data)
        self.assertIn('asset_allocation', response.data)
        
    @patch('investments.data_enrichment_service.DataEnrichmentService.enrich_investment_data')
    def test_enrich_data_endpoint(self, mock_enrich):
        mock_enrich.return_value = True
        
        investment = Investment.objects.create(
            user=self.user, symbol='AAPL', name='Apple', asset_type='stock',
            quantity=10, average_purchase_price=150, current_price=175
        )
        
        response = self.client.post(f'/api/investments/{investment.id}/enrich_data/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        mock_enrich.assert_called_once_with(investment.id)
        
    @patch('investments.views.refresh_user_assets_task')
    def test_bulk_refresh_endpoint(self, mock_refresh_task):
        response = self.client.post('/api/investments/bulk_refresh/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        mock_refresh_task.delay.assert_called_once_with(self.user.id, None)


class EnhancedInvestmentServiceTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        
    def test_enhanced_portfolio_summary(self):
        Investment.objects.create(
            user=self.user, symbol='AAPL', name='Apple', asset_type='stock',
            quantity=10, average_purchase_price=150, current_price=175
        )
        Investment.objects.create(
            user=self.user, symbol='BTC', name='Bitcoin', asset_type='crypto',
            quantity=1, average_purchase_price=50000, current_price=55000
        )
        Investment.objects.create(
            user=self.user, name='Gold', asset_type='gold', unit='grams',
            quantity=100, average_purchase_price=60, current_price=65
        )
        
        summary = InvestmentService.get_portfolio_summary(self.user)
        
        self.assertEqual(summary['investment_count'], 3)
        self.assertIn('asset_allocation', summary)
        self.assertIn('diversification_score', summary)
        self.assertIn('risk_assessment', summary)
        
        allocation = summary['asset_allocation']
        self.assertIn('stock', allocation)
        self.assertIn('crypto', allocation)
        self.assertIn('gold', allocation)
        
    def test_diversification_score_calculation(self):
        investments = [
            Investment(user=self.user, asset_type='stock', sector='Technology', 
                      total_value=Decimal('1000'), risk_level='medium'),
            Investment(user=self.user, asset_type='stock', sector='Finance', 
                      total_value=Decimal('1000'), risk_level='medium'),
            Investment(user=self.user, asset_type='bond', sector='Government', 
                      total_value=Decimal('1000'), risk_level='low'),
            Investment(user=self.user, asset_type='gold', 
                      total_value=Decimal('1000'), risk_level='low'),
            Investment(user=self.user, asset_type='crypto', 
                      total_value=Decimal('500'), risk_level='high'),
        ]
        
        score = InvestmentService._calculate_diversification_score(investments)
        self.assertGreater(score, 50)
        
    def test_portfolio_risk_assessment(self):
        high_risk_investments = [
            Investment(user=self.user, asset_type='crypto', risk_level='high', 
                      total_value=Decimal('5000')),
            Investment(user=self.user, asset_type='stock', risk_level='high', 
                      total_value=Decimal('3000')),
        ]
        
        risk = InvestmentService._assess_portfolio_risk(high_risk_investments)
        self.assertEqual(risk, 'high')
        
        low_risk_investments = [
            Investment(user=self.user, asset_type='bond', risk_level='low', 
                      total_value=Decimal('5000')),
            Investment(user=self.user, asset_type='gold', risk_level='low', 
                      total_value=Decimal('3000')),
        ]
        
        risk = InvestmentService._assess_portfolio_risk(low_risk_investments)
        self.assertEqual(risk, 'low')
        
    def test_asset_type_performance(self):
        Investment.objects.create(
            user=self.user, symbol='AAPL', name='Apple', asset_type='stock',
            quantity=10, average_purchase_price=150, current_price=175
        )
        Investment.objects.create(
            user=self.user, symbol='GOOGL', name='Google', asset_type='stock',
            quantity=5, average_purchase_price=2000, current_price=1900
        )
        Investment.objects.create(
            user=self.user, name='Gold', asset_type='gold', unit='grams',
            quantity=100, average_purchase_price=60, current_price=65
        )
        
        performance = InvestmentService.get_asset_type_performance(self.user)
        
        self.assertIn('stock', performance)
        self.assertIn('gold', performance)
        
        stock_data = performance['stock']
        self.assertEqual(stock_data['count'], 2)
        self.assertIsNotNone(stock_data['best_performer'])
        self.assertIsNotNone(stock_data['worst_performer'])
        
    def test_portfolio_insights(self):
        Investment.objects.create(
            user=self.user, symbol='AAPL', name='Apple', asset_type='stock',
            quantity=10, average_purchase_price=150, current_price=175
        )
        
        insights = InvestmentService.get_portfolio_insights(self.user)
        
        self.assertIn('performance_insights', insights)
        self.assertIn('diversification_insights', insights)
        self.assertIn('risk_insights', insights)
        self.assertIn('recommendations', insights)
        
        self.assertIsInstance(insights['performance_insights'], list)
        self.assertIsInstance(insights['recommendations'], list)


class AIInsightsServiceTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        
    def test_generate_portfolio_insights(self):
        Investment.objects.create(
            user=self.user, symbol='AAPL', name='Apple', asset_type='stock',
            quantity=10, average_purchase_price=150, current_price=175
        )
        
        insights = AIInsightsService.generate_portfolio_insights(self.user)
        
        self.assertIsInstance(insights, list)
        self.assertGreater(len(insights), 0)
        
    def test_generate_asset_type_insights(self):
        Investment.objects.create(
            user=self.user, symbol='AAPL', name='Apple', asset_type='stock',
            quantity=10, average_purchase_price=150, current_price=175
        )
        Investment.objects.create(
            user=self.user, name='Gold', asset_type='gold', unit='grams',
            quantity=100, average_purchase_price=60, current_price=65
        )
        
        insights = AIInsightsService.generate_asset_type_insights(self.user)
        
        self.assertIn('stock', insights)
        self.assertIn('gold', insights)
        self.assertIsInstance(insights['stock'], list)
        
    def test_generate_market_sentiment_insights(self):
        Investment.objects.create(
            user=self.user, symbol='AAPL', name='Apple', asset_type='stock',
            quantity=10, average_purchase_price=150, current_price=175,
            daily_change_percent=Decimal('3.5')
        )
        Investment.objects.create(
            user=self.user, symbol='BTC', name='Bitcoin', asset_type='crypto',
            quantity=1, average_purchase_price=50000, current_price=55000,
            daily_change_percent=Decimal('8.2')
        )
        
        insights = AIInsightsService.generate_market_sentiment_insights(self.user)
        
        self.assertIsInstance(insights, list)


class ValidationTest(TestCase):
    def test_asset_validation_exceptions(self):
        from .exceptions import AssetValidator
        
        with self.assertRaises(AssetValidationException):
            AssetValidator.validate_asset_type('invalid_type')
            
        with self.assertRaises(AssetValidationException):
            AssetValidator.validate_currency('INVALID')
            
        invalid_tradeable_data = {
            'asset_type': 'stock',
            'quantity': 0,
            'average_purchase_price': 150
        }
        
        with self.assertRaises(AssetValidationException):
            AssetValidator.validate_tradeable_asset(invalid_tradeable_data)
            
        invalid_physical_data = {
            'asset_type': 'gold',
            'quantity': 100,
            'average_purchase_price': -50
        }
        
        with self.assertRaises(AssetValidationException):
            AssetValidator.validate_physical_asset(invalid_physical_data)


class CeleryTaskTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        
    @patch('investments.data_enrichment_service.DataEnrichmentService.enrich_investment_data')
    def test_enrich_investment_data_task(self, mock_enrich):
        from .tasks import enrich_investment_data_task
        
        mock_enrich.return_value = True
        
        investment = Investment.objects.create(
            user=self.user, symbol='AAPL', name='Apple', asset_type='stock',
            quantity=10, average_purchase_price=150, current_price=175
        )
        
        result = enrich_investment_data_task(investment.id)
        
        mock_enrich.assert_called_once_with(investment.id)
        self.assertIn('Successfully enriched', result)
        
    @patch('investments.data_enrichment_service.DataEnrichmentService.refresh_investment_prices')
    def test_daily_price_update_task(self, mock_refresh):
        from .tasks import daily_price_update_task
        
        mock_refresh.return_value = []
        
        result = daily_price_update_task()
        
        mock_refresh.assert_called_once()
        self.assertIn('Daily price update completed', result)