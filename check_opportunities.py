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
from django.utils import timezone
from datetime import timedelta

print("=== Current Opportunities Status ===")
print(f"Total opportunities: {Opportunity.objects.count()}")
print(f"Total profiles: {UserProfile.objects.count()}")
print(f"Users with opportunities: {Opportunity.objects.values('user').distinct().count()}")

print("\n=== Recent Opportunities ===")
for opp in Opportunity.objects.all().order_by('-created_at')[:10]:
    hours_ago = (timezone.now() - opp.created_at).total_seconds() / 3600
    print(f"User {opp.user_id}: {opp.title[:50]} - {opp.created_at.strftime('%Y-%m-%d %H:%M')} ({hours_ago:.1f}h ago)")

print("\n=== Opportunity Categories ===")
categories = Opportunity.objects.values('category').distinct()
for cat in categories:
    count = Opportunity.objects.filter(category=cat['category']).count()
    print(f"{cat['category']}: {count} opportunities")

print("\n=== User Profile Status ===")
for profile in UserProfile.objects.all():
    is_stale = profile.is_stale()
    print(f"User {profile.user_id}: Profile created {profile.created_at.strftime('%Y-%m-%d %H:%M')}, stale: {is_stale}")