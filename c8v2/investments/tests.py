from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework import status
from decimal import Decimal
from .models import Investment, ChartData, PriceAlert
from .services import InvestmentService, MarketDataService

User = get_user_model()


class InvestmentModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        
    def test_investment_creation(self):
        investment = Investment.objects.create(
            user=self.user,
            symbol='AAPL',
            name='Apple Inc.',
            quantity=Decimal('10'),
            average_purchase_price=Decimal('150.00'),
            current_price=Decimal('175.50')
        )
        
        self.assertEqual(investment.symbol, 'AAPL')
        self.assertEqual(investment.total_value, Decimal('1755.00'))
        self.assertEqual(investment.total_gain_loss, Decimal('255.00'))
        
    def test_investment_save_calculations(self):
        investment = Investment.objects.create(
            user=self.user,
            symbol='GOOGL',
            name='Alphabet Inc.',
            quantity=Decimal('5'),
            average_purchase_price=Decimal('2000.00'),
            current_price=Decimal('2200.00')
        )
        
        # Test automatic calculations
        self.assertEqual(investment.total_value, Decimal('11000.00'))
        self.assertEqual(investment.total_gain_loss, Decimal('1000.00'))
        self.assertEqual(investment.total_gain_loss_percent, Decimal('10.0000'))


class InvestmentAPITest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.client.force_authenticate(user=self.user)
        
    def test_create_investment(self):
        data = {
            'symbol': 'AAPL',
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
        # Create test investments
        Investment.objects.create(
            user=self.user,
            symbol='AAPL',
            name='Apple Inc.',
            quantity=Decimal('10'),
            average_purchase_price=Decimal('150.00'),
            current_price=Decimal('175.50')
        )
        
        Investment.objects.create(
            user=self.user,
            symbol='GOOGL',
            name='Alphabet Inc.',
            quantity=Decimal('5'),
            average_purchase_price=Decimal('2000.00'),
            current_price=Decimal('1900.00')
        )
        
        summary = InvestmentService.get_portfolio_summary(self.user)
        
        self.assertEqual(summary['investment_count'], 2)
        self.assertEqual(summary['total_value'], Decimal('11255.00'))  # 1755 + 9500
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