#!/usr/bin/env python
import os
import sys
import django

# Add the project directory to the Python path
project_path = os.path.join(os.getcwd(), 'c8v2')
sys.path.append(project_path)
os.chdir(project_path)

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'C8V2.settings')
django.setup()

from opportunities.models import Opportunity, UserProfile
from opportunities.services import OpportunityService
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta

User = get_user_model()

def test_user_opportunities():
    print("=== Testing User Opportunities System ===")
    
    # Test with user 13
    user_id = 13
    service = OpportunityService()
    
    print(f"Testing with user {user_id}")
    
    # Check current opportunities
    current_opps = Opportunity.objects.filter(user_id=user_id)
    print(f"Current opportunities: {current_opps.count()}")
    
    for opp in current_opps:
        hours_ago = (timezone.now() - opp.created_at).total_seconds() / 3600
        print(f"  - {opp.title} ({hours_ago:.1f}h ago)")
    
    print(f"\n=== Testing get_opportunities ===")
    opportunities = service.get_opportunities(user_id)
    print(f"Retrieved {len(opportunities)} opportunities")
    
    for opp in opportunities:
        print(f"  - {opp.title} (Category: {opp.category}, Priority: {opp.priority})")
    
    print(f"\n=== Testing refresh_opportunities ===")
    refreshed_opportunities = service.refresh_opportunities(user_id)
    print(f"Refreshed {len(refreshed_opportunities)} opportunities")
    
    for opp in refreshed_opportunities:
        print(f"  - {opp.title} (Category: {opp.category}, Priority: {opp.priority})")
    
    print(f"\n=== Testing uniqueness - refresh again ===")
    refreshed_again = service.refresh_opportunities(user_id)
    print(f"Second refresh generated {len(refreshed_again)} opportunities")
    
    for opp in refreshed_again:
        print(f"  - {opp.title} (Category: {opp.category}, Priority: {opp.priority})")

if __name__ == "__main__":
    test_user_opportunities()