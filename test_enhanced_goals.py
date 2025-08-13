#!/usr/bin/env python3
"""
Test script for enhanced goals functionality
Tests the new PerplexityGoalService with full goal context
"""

import os
import sys
import django
from django.conf import settings

# Add the Django project to the path
sys.path.append('c8v2')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'C8V2.settings')
django.setup()

from goals.services import GeminiGoalService


def test_gemini_goal_service():
    """Test the new Gemini-powered goal service with Indian scenarios"""
    
    print("Testing Gemini Goal Service for Indian Scenarios")
    print("=" * 60)
    
    # Initialize service
    service = GeminiGoalService()
    
    # Test API key validation
    print("1. Testing Gemini API key validation...")
    if service.validate_api_key():
        print("✓ Gemini API key is configured")
    else:
        print("⚠ Gemini API key not configured - will use fallback selection")
    print()
    
    # Test various Indian scenario goals
    test_goals = [
        {
            'title': 'XUV700',
            'description': 'Saving for a new Mahindra XUV700 SUV',
            'category': 'car'
        },
        {
            'title': 'iPhone 15 Pro',
            'description': 'Saving for the latest iPhone 15 Pro',
            'category': 'electronics'
        },
        {
            'title': 'Goa Trip',
            'description': 'Planning a family vacation to Goa beaches',
            'category': 'vacation'
        },
        {
            'title': 'Wedding Fund',
            'description': 'Saving for my sister\'s wedding expenses',
            'category': 'wedding'
        },
        {
            'title': 'MBA Course',
            'description': 'Saving for MBA admission and fees',
            'category': 'education'
        },
        {
            'title': 'Royal Enfield',
            'description': 'Saving for a Royal Enfield Classic 350',
            'category': 'bike'
        },
        {
            'title': 'Emergency Fund',
            'description': 'Building emergency fund for unexpected expenses',
            'category': 'emergency'
        },
        {
            'title': 'Home Down Payment',
            'description': 'Saving for down payment of 2BHK apartment',
            'category': 'house'
        }
    ]
    
    print("2. Testing Gemini AI image selection for various Indian goals...")
    print("-" * 60)
    
    for i, goal_data in enumerate(test_goals, 2):
        print(f"{i}. Goal: {goal_data['title']}")
        print(f"   Description: {goal_data['description']}")
        print(f"   Category: {goal_data['category']}")
        
        image_url = service.generate_goal_image(goal_data)
        print(f"   Selected Image: {image_url}")
        print()
    
    # Test insights generation (should be disabled)
    print(f"{len(test_goals) + 2}. Testing AI insights generation (should be disabled)...")
    insights = service.generate_goal_insights(test_goals[0])
    if insights:
        print("⚠ Insights were generated (should be disabled)")
        print(insights)
    else:
        print("✓ Insights generation is properly disabled")
    print()
    
    # Show available categories
    print(f"{len(test_goals) + 3}. Available image categories:")
    categories = service.get_available_categories()
    print(f"Total categories: {len(categories)}")
    print("Categories:", ", ".join(categories[:20]) + "..." if len(categories) > 20 else ", ".join(categories))
    print()
    
    print("Gemini Goal Service test completed!")
    print("\nKey Features:")
    print("- AI-powered image selection using Gemini")
    print("- Comprehensive Indian scenario coverage")
    print("- 50+ goal categories supported")
    print("- Intelligent context-aware selection")
    print("- Fallback mechanism for reliability")


if __name__ == "__main__":
    test_gemini_goal_service()