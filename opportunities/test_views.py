import json
from unittest.mock import patch, MagicMock
from django.test import TestCase
from django.urls import reverse
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from rest_framework.authtoken.models import Token
from questionnaire.models import Question, UserResponse
from .models import Opportunity
from .services import OpportunityService

User = get_user_model()


class OpportunitiesAPITest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.token = Token.objects.create(user=self.user)
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token.key)
        
        # Create test opportunities
        self.opportunity1 = Opportunity.objects.create(
            user=self.user,
            title='Build Emergency Fund',
            description='Create a safety net for unexpected expenses.',
            category='emergency_fund',
            priority='high',
            ai_insights='This is critical for your financial security.',
            action_steps=['Calculate expenses', 'Open account'],
            relevance_score=0.9
        )
        self.opportunity2 = Opportunity.objects.create(
            user=self.user,
            title='Start SIP Investment',
            description='Begin systematic investment planning.',
            category='investment',
            priority='medium',
            ai_insights='Good for long-term wealth building.',
            action_steps=['Complete KYC', 'Choose funds'],
            relevance_score=0.7
        )

    def test_list_opportunities_authenticated(self):
        """Test fetching opportunities for authenticated user"""
        url = reverse('opportunities-list')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)
        
        # Check first opportunity (should be ordered by priority)
        first_opportunity = response.data[0]
        self.assertEqual(first_opportunity['title'], 'Build Emergency Fund')
        self.assertEqual(first_opportunity['priority'], 'high')
        self.assertEqual(first_opportunity['category'], 'emergency_fund')
        self.assertEqual(float(first_opportunity['relevance_score']), 0.9)

    def test_list_opportunities_unauthenticated(self):
        """Test that unauthenticated requests are rejected"""
        self.client.credentials()  # Remove authentication
        url = reverse('opportunities-list')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_list_opportunities_different_user(self):
        """Test that users only see their own opportunities"""
        # Create another user with opportunities
        other_user = User.objects.create_user(
            username='otheruser',
            email='other@example.com',
            password='testpass123'
        )
        Opportunity.objects.create(
            user=other_user,
            title='Other User Opportunity',
            description='This should not be visible',
            category='general',
            priority='low',
            relevance_score=0.5
        )
        
        url = reverse('opportunities-list')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)  # Only current user's opportunities
        
        titles = [opp['title'] for opp in response.data]
        self.assertNotIn('Other User Opportunity', titles)

    @patch.object(OpportunityService, 'generate_opportunities')
    def test_list_opportunities_generates_when_empty(self, mock_generate):
        """Test that opportunities are generated when user has none"""
        # Delete existing opportunities
        Opportunity.objects.filter(user=self.user).delete()
        
        # Mock the service to return new opportunities
        mock_opportunity = Opportunity(
            user=self.user,
            title='Generated Opportunity',
            description='Auto-generated',
            category='general',
            priority='medium',
            relevance_score=0.6
        )
        mock_generate.return_value = [mock_opportunity]
        
        url = reverse('opportunities-list')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        mock_generate.assert_called_once_with(self.user.id)

    @patch.object(OpportunityService, 'generate_opportunities')
    def test_list_opportunities_generation_failure(self, mock_generate):
        """Test handling when opportunity generation fails"""
        # Delete existing opportunities
        Opportunity.objects.filter(user=self.user).delete()
        
        # Mock the service to return empty list
        mock_generate.return_value = []
        
        url = reverse('opportunities-list')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('message', response.data)
        self.assertIn('complete your profile', response.data['message'].lower())

    def test_refresh_opportunities(self):
        """Test refreshing opportunities"""
        url = reverse('opportunities-refresh')
        
        # Count initial opportunities
        initial_count = Opportunity.objects.filter(user=self.user).count()
        self.assertEqual(initial_count, 2)
        
        with patch.object(OpportunityService, 'generate_opportunities') as mock_generate:
            # Mock new opportunities
            new_opportunity = Opportunity(
                user=self.user,
                title='New Opportunity',
                description='Refreshed opportunity',
                category='skill_development',
                priority='high',
                relevance_score=0.8
            )
            mock_generate.return_value = [new_opportunity]
            
            response = self.client.post(url)
            
            self.assertEqual(response.status_code, status.HTTP_200_OK)
            mock_generate.assert_called_once_with(self.user.id)
            
            # Old opportunities should be deleted
            self.assertEqual(Opportunity.objects.filter(user=self.user).count(), 0)

    def test_refresh_opportunities_unauthenticated(self):
        """Test that unauthenticated refresh requests are rejected"""
        self.client.credentials()  # Remove authentication
        url = reverse('opportunities-refresh')
        response = self.client.post(url)
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    @patch.object(OpportunityService, 'generate_opportunities')
    def test_refresh_opportunities_generation_failure(self, mock_generate):
        """Test handling when refresh generation fails"""
        mock_generate.return_value = []
        
        url = reverse('opportunities-refresh')
        response = self.client.post(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('message', response.data)
        self.assertIn('complete your profile', response.data['message'].lower())

    @patch.object(OpportunityService, 'generate_opportunities')
    def test_refresh_opportunities_service_exception(self, mock_generate):
        """Test handling when opportunity service raises exception"""
        mock_generate.side_effect = Exception('Service error')
        
        url = reverse('opportunities-refresh')
        response = self.client.post(url)
        
        self.assertEqual(response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR)
        self.assertIn('error', response.data)

    def test_opportunities_ordering(self):
        """Test that opportunities are returned in correct order"""
        # Create opportunities with different priorities and relevance scores
        Opportunity.objects.filter(user=self.user).delete()
        
        low_priority = Opportunity.objects.create(
            user=self.user,
            title='Low Priority',
            description='Low priority opportunity',
            category='general',
            priority='low',
            relevance_score=0.9  # High relevance but low priority
        )
        high_priority = Opportunity.objects.create(
            user=self.user,
            title='High Priority',
            description='High priority opportunity',
            category='emergency_fund',
            priority='high',
            relevance_score=0.5  # Low relevance but high priority
        )
        medium_priority_high_relevance = Opportunity.objects.create(
            user=self.user,
            title='Medium Priority High Relevance',
            description='Medium priority with high relevance',
            category='investment',
            priority='medium',
            relevance_score=0.8
        )
        medium_priority_low_relevance = Opportunity.objects.create(
            user=self.user,
            title='Medium Priority Low Relevance',
            description='Medium priority with low relevance',
            category='insurance',
            priority='medium',
            relevance_score=0.3
        )
        
        url = reverse('opportunities-list')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        titles = [opp['title'] for opp in response.data]
        
        # Expected order: high priority first, then medium (by relevance), then low
        expected_order = [
            'High Priority',
            'Medium Priority High Relevance',
            'Medium Priority Low Relevance',
            'Low Priority'
        ]
        
        self.assertEqual(titles, expected_order)


class QuestionnaireResponsesAPITest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.token = Token.objects.create(user=self.user)
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token.key)
        
        # Create test questions
        self.question1 = Question.objects.create(
            text='What is your age?',
            question_type='NU',
            group='Personal Information',
            order=1
        )
        self.question2 = Question.objects.create(
            text='What is your monthly income?',
            question_type='NU',
            group='Income & Job',
            order=2
        )
        
        # Create test responses
        self.response1 = UserResponse.objects.create(
            user=self.user,
            question=self.question1,
            selected_choices_text=[],
            custom_input='30'
        )
        self.response2 = UserResponse.objects.create(
            user=self.user,
            question=self.question2,
            selected_choices_text=[],
            custom_input='50000'
        )

    def test_get_user_responses_authenticated(self):
        """Test fetching user responses for authenticated user"""
        url = reverse('questionnaire-responses')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('responses', response.data)
        self.assertEqual(len(response.data['responses']), 2)
        
        # Check response structure
        first_response = response.data['responses'][0]
        self.assertIn('question_id', first_response)
        self.assertIn('question_text', first_response)
        self.assertIn('question_group', first_response)
        self.assertIn('selected_choices', first_response)
        self.assertIn('custom_input', first_response)

    def test_get_user_responses_unauthenticated(self):
        """Test that unauthenticated requests are rejected"""
        self.client.credentials()  # Remove authentication
        url = reverse('questionnaire-responses')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_get_user_responses_no_responses(self):
        """Test response when user has no questionnaire responses"""
        # Create user with no responses
        other_user = User.objects.create_user(
            username='otheruser',
            email='other@example.com',
            password='testpass123'
        )
        other_token = Token.objects.create(user=other_user)
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + other_token.key)
        
        url = reverse('questionnaire-responses')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('message', response.data)
        self.assertIn('complete your profile', response.data['message'].lower())
        self.assertEqual(len(response.data['responses']), 0)

    def test_get_user_responses_different_user(self):
        """Test that users only see their own responses"""
        # Create another user with responses
        other_user = User.objects.create_user(
            username='otheruser',
            email='other@example.com',
            password='testpass123'
        )
        UserResponse.objects.create(
            user=other_user,
            question=self.question1,
            selected_choices_text=[],
            custom_input='25'
        )
        
        url = reverse('questionnaire-responses')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['responses']), 2)  # Only current user's responses
        
        # Check that we get the current user's data
        custom_inputs = [resp['custom_input'] for resp in response.data['responses']]
        self.assertIn('30', custom_inputs)
        self.assertIn('50000', custom_inputs)
        self.assertNotIn('25', custom_inputs)

    def test_get_user_responses_with_expense_data(self):
        """Test response format with expense data"""
        # Create question with expense data
        expense_question = Question.objects.create(
            text='List your monthly expenses',
            question_type='MC',
            group='Expenses',
            order=3
        )
        expense_data = {
            'Rent/EMI': 25000,
            'Food & Groceries': 8000,
            'Transportation': 5000
        }
        UserResponse.objects.create(
            user=self.user,
            question=expense_question,
            selected_choices_text=[],
            custom_input=None,
            expense_data=expense_data
        )
        
        url = reverse('questionnaire-responses')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['responses']), 3)
        
        # Find the expense response
        expense_response = next(
            resp for resp in response.data['responses'] 
            if resp['question_text'] == 'List your monthly expenses'
        )
        self.assertEqual(expense_response['expense_data'], expense_data)

    def test_response_includes_user_info(self):
        """Test that response includes user information"""
        url = reverse('questionnaire-responses')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('user_id', response.data)
        self.assertIn('username', response.data)
        self.assertEqual(response.data['user_id'], self.user.id)
        self.assertEqual(response.data['username'], self.user.username)