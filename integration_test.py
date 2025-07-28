#!/usr/bin/env python3
"""
Integration test to verify the complete opportunities system
"""
import os
import sys
import django
from django.conf import settings

# Add the Django project to the path
sys.path.append('c8v2')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'C8V2.settings')
django.setup()

from django.contrib.auth import get_user_model
from questionnaire.models import Question, UserResponse
from opportunities.models import Opportunity
from opportunities.services import OpportunityService

User = get_user_model()

def test_complete_workflow():
    print("🚀 Testing Complete Opportunities Workflow...")
    
    # 1. Create a test user
    print("\n1. Creating test user...")
    user, created = User.objects.get_or_create(
        username='testuser',
        defaults={'email': 'test@example.com'}
    )
    if created:
        user.set_password('testpass123')
        user.save()
    print(f"✅ User created/found: {user.username}")
    
    # 2. Create test questions if they don't exist
    print("\n2. Setting up test questionnaire data...")
    question1, _ = Question.objects.get_or_create(
        id=6,
        defaults={
            'text': "What's your monthly income in hand?",
            'question_type': 'NU',
            'group': 'Income & Job',
            'order': 6
        }
    )
    question2, _ = Question.objects.get_or_create(
        id=9,
        defaults={
            'text': 'Do you currently have any loans or debts?',
            'question_type': 'SC',
            'group': 'Debt Situation',
            'order': 9
        }
    )
    print(f"✅ Questions set up")
    
    # 3. Create test responses
    print("\n3. Creating test user responses...")
    UserResponse.objects.update_or_create(
        user=user,
        question=question1,
        defaults={
            'selected_choices_text': [],
            'custom_input': '50000'
        }
    )
    UserResponse.objects.update_or_create(
        user=user,
        question=question2,
        defaults={
            'selected_choices_text': ['Credit card debt'],
            'custom_input': None
        }
    )
    print(f"✅ User responses created")
    
    # 4. Test the opportunity service
    print("\n4. Testing OpportunityService...")
    service = OpportunityService()
    
    # Clear existing opportunities
    Opportunity.objects.filter(user=user).delete()
    
    # Generate opportunities
    opportunities = service.generate_opportunities(user.id)
    print(f"✅ Generated {len(opportunities)} opportunities")
    
    # 5. Verify opportunities were saved
    print("\n5. Verifying opportunities in database...")
    db_opportunities = Opportunity.objects.filter(user=user)
    print(f"✅ Found {db_opportunities.count()} opportunities in database")
    
    # 6. Display sample opportunities
    print("\n6. Sample opportunities:")
    for opp in db_opportunities[:3]:
        print(f"   - {opp.title} ({opp.category}, {opp.priority} priority)")
        print(f"     {opp.description[:100]}...")
        print(f"     Relevance: {opp.relevance_score}")
        print()
    
    print("🎉 Complete workflow test successful!")
    return True

if __name__ == "__main__":
    try:
        test_complete_workflow()
    except Exception as e:
        print(f"❌ Test failed: {e}")
        import traceback
        traceback.print_exc()