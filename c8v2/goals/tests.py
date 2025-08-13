from django.test import TestCase
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from rest_framework.authtoken.models import Token
from decimal import Decimal
from .models import Goal

User = get_user_model()


class GoalModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
    
    def test_goal_creation(self):
        goal = Goal.objects.create(
            user=self.user,
            title='Emergency Fund',
            target_amount=Decimal('50000.00'),
            current_amount=Decimal('15000.00')
        )
        self.assertEqual(goal.title, 'Emergency Fund')
        self.assertEqual(goal.target_amount, Decimal('50000.00'))
        self.assertEqual(goal.current_amount, Decimal('15000.00'))
        self.assertEqual(goal.user, self.user)
    
    def test_progress_percentage(self):
        goal = Goal.objects.create(
            user=self.user,
            title='Test Goal',
            target_amount=Decimal('1000.00'),
            current_amount=Decimal('250.00')
        )
        self.assertEqual(goal.progress_percentage, 25.0)
    
    def test_progress_percentage_over_100(self):
        goal = Goal.objects.create(
            user=self.user,
            title='Test Goal',
            target_amount=Decimal('1000.00'),
            current_amount=Decimal('1500.00')
        )
        self.assertEqual(goal.progress_percentage, 100.0)


class GoalAPITest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.token = Token.objects.create(user=self.user)
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token.key)
        
        self.goal_data = {
            'title': 'Test Goal',
            'target_amount': '5000.00',
            'description': 'Test description',
            'category': 'savings'
        }
    
    def test_create_goal(self):
        url = reverse('goal-list')
        response = self.client.post(url, self.goal_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Goal.objects.count(), 1)
        self.assertEqual(Goal.objects.get().title, 'Test Goal')
    
    def test_list_goals(self):
        Goal.objects.create(
            user=self.user,
            title='Goal 1',
            target_amount=Decimal('1000.00')
        )
        Goal.objects.create(
            user=self.user,
            title='Goal 2',
            target_amount=Decimal('2000.00')
        )
        
        url = reverse('goal-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)
    
    def test_update_goal(self):
        goal = Goal.objects.create(
            user=self.user,
            title='Original Title',
            target_amount=Decimal('1000.00')
        )
        
        url = reverse('goal-detail', kwargs={'pk': goal.pk})
        update_data = {'title': 'Updated Title', 'current_amount': '500.00'}
        response = self.client.patch(url, update_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        goal.refresh_from_db()
        self.assertEqual(goal.title, 'Updated Title')
        self.assertEqual(goal.current_amount, Decimal('500.00'))
    
    def test_delete_goal(self):
        goal = Goal.objects.create(
            user=self.user,
            title='To Delete',
            target_amount=Decimal('1000.00')
        )
        
        url = reverse('goal-detail', kwargs={'pk': goal.pk})
        response = self.client.delete(url)
        
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Goal.objects.count(), 0)
    
    def test_user_isolation(self):
        # Create another user and goal
        other_user = User.objects.create_user(
            username='otheruser',
            email='other@example.com',
            password='otherpass123'
        )
        Goal.objects.create(
            user=other_user,
            title='Other User Goal',
            target_amount=Decimal('1000.00')
        )
        
        # Current user should only see their own goals
        url = reverse('goal-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 0)
    
    def test_unauthenticated_access(self):
        self.client.credentials()  # Remove authentication
        url = reverse('goal-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

class PerplexityImageServiceTest(TestCase):
    def setUp(self):
        from .services import PerplexityImageService
        self.service = PerplexityImageService()
    
    def test_get_default_image_emergency(self):
        image_url = self.service.get_default_image('Emergency Fund')
        self.assertIn('Emergency', image_url)
    
    def test_get_default_image_vacation(self):
        image_url = self.service.get_default_image('Dream Vacation')
        self.assertIn('Vacation', image_url)
    
    def test_get_default_image_fallback(self):
        image_url = self.service.get_default_image('Random Goal Title')
        self.assertIn('Financial+Goal', image_url)
    
    def test_validate_api_key_not_configured(self):
        # Mock the API key to be not configured
        import os
        original_key = os.environ.get('PERPLEXITY_API_KEY')
        os.environ['PERPLEXITY_API_KEY'] = 'your_perplexity_api_key_here'
        
        # Create new service instance with mocked key
        from .services import PerplexityImageService
        service = PerplexityImageService()
        
        # Should return False when API key is not properly configured
        self.assertFalse(service.validate_api_key())
        
        # Restore original key
        if original_key:
            os.environ['PERPLEXITY_API_KEY'] = original_key
    
    def test_generate_goal_image_without_api_key(self):
        # Mock the API key to be not configured
        import os
        original_key = os.environ.get('PERPLEXITY_API_KEY')
        os.environ['PERPLEXITY_API_KEY'] = 'your_perplexity_api_key_here'
        
        # Create new service instance with mocked key
        from .services import PerplexityImageService
        service = PerplexityImageService()
        
        # Should return default image when API key is not configured
        image_url = service.generate_goal_image('Test Goal')
        self.assertTrue(image_url.startswith('https://via.placeholder.com'))
        
        # Restore original key
        if original_key:
            os.environ['PERPLEXITY_API_KEY'] = original_key