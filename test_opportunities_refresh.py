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

def test_opportunities_refresh():
    print("=== Testing Opportunities Refresh System ===")
    
    # Find a user with old opportunities
    old_opportunities = Opportunity.objects.filter(
        created_at__lt=timezone.now() - timedelta(hours=24)
    ).first()
    
    if not old_opportunities:
        print("No old opportunities found to test with")
        return
    
    user_id = old_opportunities.user_id
    print(f"Testing with user {user_id}")
    
    # Check current opportunities
    current_opps = Opportunity.objects.filter(user_id=user_id)
    print(f"Current opportunities for user {user_id}: {current_opps.count()}")
    
    for opp in current_opps:
        hours_ago = (timezone.now() - opp.created_at).total_seconds() / 3600
        print(f"  - {opp.title[:50]} ({hours_ago:.1f}h ago)")
    
    # Test the service
    service = OpportunityService()
    
    print(f"\n=== Testing get_opportunities (should generate new ones) ===")
    new_opportunities = service.get_opportunities(user_id)
    print(f"Generated {len(new_opportunities)} opportunities")
    
    for opp in new_opportunities:
        print(f"  - {opp.title} (Category: {opp.category}, Priority: {opp.priority})")
    
    print(f"\n=== Testing refresh_opportunities ===")
    refreshed_opportunities = service.refresh_opportunities(user_id)
    print(f"Refreshed {len(refreshed_opportunities)} opportunities")
    
    for opp in refreshed_opportunities:
        print(f"  - {opp.title} (Category: {opp.category}, Priority: {opp.priority})")

if __name__ == "__main__":
    test_opportunities_refresh()