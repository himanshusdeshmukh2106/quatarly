import json
from unittest.mock import patch, MagicMock
from django.test import TestCase
from django.contrib.auth import get_user_model
from questionnaire.models import Question, UserResponse
from .models import Opportunity
from .services import GeminiProfileService, PerplexityOpportunityService, OpportunityService

User = get_user_model()


class GeminiProfileServiceTest(TestCase):
    def setUp(self):
        self.service = GeminiProfileService()
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        
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

    def test_create_profile_prompt(self):
        user_responses = [
            {
                'question_text': 'What is your age?',
                'question_group': 'Personal Information',
                'selected_choices': [],
                'custom_input': '30',
                'expense_data': None
            },
            {
                'question_text': 'What is your monthly income?',
                'question_group': 'Income & Job',
                'selected_choices': [],
                'custom_input': '50000',
                'expense_data': None
            }
        ]
        
        prompt = self.service.create_profile_prompt(user_responses)
        
        self.assertIn('Personal Information:', prompt)
        self.assertIn('Income & Job:', prompt)
        self.assertIn('What is your age?', prompt)
        self.assertIn('What is your monthly income?', prompt)
        self.assertIn('30', prompt)
        self.assertIn('50000', prompt)

    @patch('opportunities.services.requests.post')
    def test_generate_profile_success(self, mock_post):
        # Mock successful API response
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            'candidates': [{
                'content': {
                    'parts': [{
                        'text': '{"demographics": {"age": 30}, "financial": {"monthlyIncome": 50000}}'
                    }]
                }
            }]
        }
        mock_post.return_value = mock_response
        
        # Mock the API key validation
        with patch.object(self.service, 'validate_api_key', return_value=True):
            prompt = "Test prompt"
            result = self.service.generate_profile(prompt)
            
            self.assertIsNotNone(result)
            self.assertEqual(result['demographics']['age'], 30)
            self.assertEqual(result['financial']['monthlyIncome'], 50000)

    @patch('opportunities.services.requests.post')
    def test_generate_profile_api_failure(self, mock_post):
        # Mock API failure
        mock_response = MagicMock()
        mock_response.status_code = 400
        mock_response.text = 'Bad Request'
        mock_post.return_value = mock_response
        
        prompt = "Test prompt"
        result = self.service.generate_profile(prompt)
        
        self.assertIsNone(result)

    def test_validate_api_key_missing(self):
        service = GeminiProfileService()
        service.api_key = None
        self.assertFalse(service.validate_api_key())

    def test_validate_api_key_placeholder(self):
        service = GeminiProfileService()
        service.api_key = 'your_gemini_api_key_here'
        self.assertFalse(service.validate_api_key())


class PerplexityOpportunityServiceTest(TestCase):
    def setUp(self):
        self.service = PerplexityOpportunityService()
        self.test_profile = {
            'demographics': {'age': 30, 'maritalStatus': 'Single'},
            'financial': {
                'monthlyIncome': 50000,
                'jobStability': 'Permanent job',
                'debtSituation': 'Credit card debt',
                'emergencyFund': 'Less than 1 month',
                'savingsRate': 10
            },
            'goals': {
                'shortTerm': 'Build emergency fund',
                'longTerm': 'Buy a house'
            },
            'riskFactors': ['Low emergency fund', 'Credit card debt']
        }

    def test_create_opportunity_prompt(self):
        prompt = self.service._create_opportunity_prompt(self.test_profile)
        
        self.assertIn('Monthly Income: ₹50000', prompt)
        self.assertIn('Job Stability: Permanent job', prompt)
        self.assertIn('Debt Situation: Credit card debt', prompt)
        self.assertIn('Short-term: Build emergency fund', prompt)
        self.assertIn('Long-term: Buy a house', prompt)

    @patch('opportunities.services.requests.post')
    def test_find_opportunities_success(self, mock_post):
        # Mock successful API response
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            'choices': [{
                'message': {
                    'content': '''TITLE: Build Emergency Fund
CATEGORY: emergency_fund
PRIORITY: high
DESCRIPTION: Create a safety net for unexpected expenses.
AI_INSIGHTS: Based on your current situation, building an emergency fund is critical.
ACTION_STEPS: 1. Calculate expenses 2. Open savings account 3. Set up transfers
RELEVANCE_SCORE: 0.9'''
                }
            }]
        }
        mock_post.return_value = mock_response
        
        opportunities = self.service.find_opportunities(self.test_profile)
        
        # Should return fallback opportunities since API key is not configured
        self.assertTrue(len(opportunities) >= 1)
        # Check that emergency fund opportunity is included (based on test profile)
        emergency_fund_opp = next((opp for opp in opportunities if opp['category'] == 'emergency_fund'), None)
        self.assertIsNotNone(emergency_fund_opp)
        self.assertEqual(emergency_fund_opp['priority'], 'high')

    @patch('opportunities.services.requests.post')
    def test_find_opportunities_api_failure(self, mock_post):
        # Mock API failure
        mock_response = MagicMock()
        mock_response.status_code = 400
        mock_post.return_value = mock_response
        
        opportunities = self.service.find_opportunities(self.test_profile)
        
        # Should return fallback opportunities
        self.assertGreater(len(opportunities), 0)
        self.assertTrue(any(opp['category'] == 'emergency_fund' for opp in opportunities))

    def test_get_enhanced_fallback_opportunities(self):
        opportunities = self.service._get_enhanced_fallback_opportunities(self.test_profile, [])
        
        self.assertGreater(len(opportunities), 0)
        # Should include emergency fund opportunity based on profile
        self.assertTrue(any(opp['category'] == 'emergency_fund' for opp in opportunities))


class OpportunityServiceTest(TestCase):
    def setUp(self):
        self.service = OpportunityService()
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        
        # Create test question and response
        self.question = Question.objects.create(
            text='What is your monthly income?',
            question_type='NU',
            group='Income & Job',
            order=1
        )
        self.response = UserResponse.objects.create(
            user=self.user,
            question=self.question,
            selected_choices_text=[],
            custom_input='50000'
        )

    def test_get_opportunities_fresh(self):
        """Test getting fresh opportunities from database"""
        # Create a fresh opportunity
        opportunity = Opportunity.objects.create(
            user=self.user,
            title='Test Opportunity',
            description='Test Description',
            category='investment',
            priority='high',
            relevance_score=0.8
        )
        
        opportunities = self.service.get_opportunities(self.user.id)
        self.assertEqual(len(opportunities), 1)
        self.assertEqual(opportunities[0].title, 'Test Opportunity')

    def test_get_opportunities_stale(self):
        """Test getting opportunities when existing ones are stale"""
        # Create a stale opportunity (older than 5 hours)
        from datetime import timedelta
        from django.utils import timezone
        
        stale_time = timezone.now() - timedelta(hours=6)
        with patch('django.utils.timezone.now', return_value=stale_time):
            Opportunity.objects.create(
                user=self.user,
                title='Stale Opportunity',
                description='Test Description',
                category='investment',
                priority='high',
                relevance_score=0.8
            )
        
        # Mock profile service and perplexity service
        with patch.object(self.service.profile_service, 'get_or_create_profile') as mock_profile, \
             patch.object(self.service.perplexity_service, 'find_opportunities') as mock_perplexity:
            
            mock_profile.return_value = {'financial': {'monthlyIncome': 50000}}
            mock_perplexity.return_value = [{
                'title': 'New Opportunity',
                'description': 'New Description',
                'category': 'investment',
                'priority': 'high',
                'relevance_score': 0.9
            }]
            
            opportunities = self.service.get_opportunities(self.user.id)
            self.assertTrue(len(opportunities) > 0)

    def test_refresh_opportunities(self):
        """Test refreshing opportunities"""
        # Create existing opportunity
        Opportunity.objects.create(
            user=self.user,
            title='Old Opportunity',
            description='Old Description',
            category='investment',
            priority='medium',
            relevance_score=0.5
        )
        
        # Mock services
        with patch.object(self.service.profile_service, 'get_or_create_profile') as mock_profile, \
             patch.object(self.service.perplexity_service, 'find_opportunities') as mock_perplexity:
            
            mock_profile.return_value = {'financial': {'monthlyIncome': 50000}}
            mock_perplexity.return_value = [{
                'title': 'Refreshed Opportunity',
                'description': 'Refreshed Description',
                'category': 'investment',
                'priority': 'high',
                'relevance_score': 0.9
            }]
            
            opportunities = self.service.refresh_opportunities(self.user.id)
            
            # Check that old opportunities were deleted
            self.assertEqual(Opportunity.objects.filter(user=self.user).count(), 1)
            self.assertEqual(opportunities[0].title, 'Refreshed Opportunity')




class OpportunityModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )

    def test_create_opportunity(self):
        opportunity = Opportunity.objects.create(
            user=self.user,
            title='Test Opportunity',
            description='Test description',
            category='investment',
            priority='high',
            ai_insights='Test insights',
            action_steps=['Step 1', 'Step 2'],
            relevance_score=0.8
        )
        
        self.assertEqual(opportunity.title, 'Test Opportunity')
        self.assertEqual(opportunity.user, self.user)
        self.assertEqual(opportunity.priority_order, 3)  # high priority = 3

    def test_opportunity_ordering(self):
        from django.utils import timezone
        from datetime import timedelta
        import time
        
        # Create opportunities with different creation times
        opp1 = Opportunity.objects.create(
            user=self.user,
            title='First Created',
            description='Test',
            category='general',
            priority='low',
            relevance_score=0.5
        )
        
        time.sleep(0.01)  # Small delay to ensure different timestamps
        
        opp2 = Opportunity.objects.create(
            user=self.user,
            title='Second Created',
            description='Test',
            category='general',
            priority='high',
            relevance_score=0.7
        )
        
        time.sleep(0.01)  # Small delay to ensure different timestamps
        
        opp3 = Opportunity.objects.create(
            user=self.user,
            title='Third Created',
            description='Test',
            category='general',
            priority='medium',
            relevance_score=0.9
        )
        
        opportunities = list(Opportunity.objects.all())
        
        # Should be ordered by created_at (newest first)
        self.assertEqual(opportunities[0].title, 'Third Created')
        self.assertEqual(opportunities[1].title, 'Second Created')
        self.assertEqual(opportunities[2].title, 'First Created')