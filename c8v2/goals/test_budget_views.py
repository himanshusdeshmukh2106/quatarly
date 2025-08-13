from django.test import TestCase
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from rest_framework.authtoken.models import Token

User = get_user_model()


class BudgetNotesAPITest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.token = Token.objects.create(user=self.user)
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token.key)
    
    def test_budget_notes_authenticated(self):
        """Test that authenticated users can access budget notes"""
        url = reverse('budget-notes')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsInstance(response.data, dict)
        
        # Check that we get expected categories
        expected_categories = [
            'Food & Dining',
            'Transportation', 
            'Shopping',
            'Entertainment',
            'Bills & Utilities',
            'Healthcare'
        ]
        
        for category in expected_categories:
            self.assertIn(category, response.data)
            self.assertIsInstance(response.data[category], str)
            self.assertTrue(len(response.data[category]) > 0)
    
    def test_budget_notes_unauthenticated(self):
        """Test that unauthenticated users cannot access budget notes"""
        self.client.credentials()  # Remove authentication
        url = reverse('budget-notes')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_budget_notes_content(self):
        """Test that budget notes contain meaningful content"""
        url = reverse('budget-notes')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Check that each note is a non-empty string
        for category, note in response.data.items():
            self.assertIsInstance(note, str)
            self.assertTrue(len(note.strip()) > 10)  # Ensure meaningful content
            # Should contain financial advice keywords
            financial_keywords = ['budget', 'spending', 'save', 'cost', 'expense', 'money', 'financial']
            has_financial_keyword = any(keyword in note.lower() for keyword in financial_keywords)
            self.assertTrue(has_financial_keyword, f"Note for {category} should contain financial advice")