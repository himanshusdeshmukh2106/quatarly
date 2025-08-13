#!/usr/bin/env python3
"""
Test script for enhanced goals feature with Gemini API integration
Tests the AI-powered image selection for various Indian goal scenarios
"""

import os
import sys
import django
from django.conf import settings

# Add the project directory to Python path
sys.path.append('c8v2')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'C8V2.settings')
django.setup()

from goals.services import GeminiGoalService

def test_gemini_goal_image_selection():
    """Test Gemini API integration for goal image selection"""
    print("🚀 Testing Enhanced Goals Feature with Gemini API")
    print("=" * 60)
    
    service = GeminiGoalService()
    
    # Test various Indian goal scenarios
    test_goals = [
        {
            'title': 'New Car Purchase',
            'description': 'Saving for a new Maruti Suzuki Swift',
            'category': 'Vehicle'
        },
        {
            'title': 'iPhone 15 Pro',
            'description': 'Latest iPhone for photography',
            'category': 'Electronics'
        },
        {
            'title': 'Dream Home',
            'description': '3BHK apartment in Bangalore',
            'category': 'Real Estate'
        },
        {
            'title': 'MBA Degree',
            'description': 'Master of Business Administration from IIM',
            'category': 'Education'
        },
        {
            'title': 'Goa Vacation',
            'description': 'Family trip to Goa beaches',
            'category': 'Travel'
        },
        {
            'title': 'Emergency Fund',
            'description': '6 months of expenses for financial security',
            'category': 'Financial'
        },
        {
            'title': 'Royal Enfield Bike',
            'description': 'Classic 350 motorcycle',
            'category': 'Vehicle'
        },
        {
            'title': 'MacBook Pro',
            'description': 'For software development work',
            'category': 'Electronics'
        },
        {
            'title': 'Wedding Expenses',
            'description': 'Traditional Indian wedding celebration',
            'category': 'Personal Event'
        },
        {
            'title': 'Gold Jewelry',
            'description': 'Investment in gold ornaments',
            'category': 'Investment'
        }
    ]
    
    print(f"🔑 API Key Status: {'✅ Configured' if service.validate_api_key() else '❌ Missing'}")
    print(f"📊 Available Categories: {len(service.get_available_categories())}")
    print()
    
    for i, goal in enumerate(test_goals, 1):
        print(f"🎯 Test {i}: {goal['title']}")
        print(f"   Description: {goal['description']}")
        print(f"   Category: {goal['category']}")
        
        try:
            # Test image selection
            image_url = service.generate_goal_image(goal)
            print(f"   ✅ Selected Image: {image_url}")
            
            # Test fallback method
            fallback_url = service.get_fallback_image(goal['title'])
            print(f"   🔄 Fallback Image: {fallback_url}")
            
        except Exception as e:
            print(f"   ❌ Error: {e}")
        
        print()
    
    # Test edge cases
    print("🧪 Testing Edge Cases")
    print("-" * 30)
    
    edge_cases = [
        {'title': '', 'description': '', 'category': ''},
        {'title': 'Unknown Goal Type', 'description': 'Something very specific', 'category': 'Unknown'},
        {'title': 'Mixed Keywords Car Phone House', 'description': 'Multiple categories', 'category': 'Mixed'}
    ]
    
    for case in edge_cases:
        try:
            image_url = service.generate_goal_image(case)
            print(f"✅ Edge case handled: {case['title']} -> {image_url}")
        except Exception as e:
            print(f"❌ Edge case failed: {case['title']} -> {e}")
    
    print("\n🎉 Enhanced Goals Feature Test Complete!")

if __name__ == '__main__':
    test_gemini_goal_image_selection()