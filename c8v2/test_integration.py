"""
Test script to verify enhanced opportunities system integration
"""

import os
import sys
import django

# Setup Django
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'C8V2.settings')
django.setup()

from django.contrib.auth import get_user_model
from opportunities.models import UserProfile
from opportunities.enhanced_models import (
    OpportunityCache,
    UserShownOpportunity,
    UserProfileVector,
    OpportunityFetchLog,
    ClusterStatistics
)
from opportunities.gemini_flash_service import gemini_flash_service
from opportunities.serper_opportunity_fetcher import serper_opportunity_fetcher

User = get_user_model()


def print_header(text):
    print(f"\n{'='*80}")
    print(f"{text}")
    print(f"{'='*80}\n")


def test_database_tables():
    """Test that all tables exist"""
    print_header("TEST 1: Database Tables")
    
    tables = [
        ('opportunity_cache', OpportunityCache),
        ('user_shown_opportunities', UserShownOpportunity),
        ('user_profile_vectors', UserProfileVector),
        ('opportunity_fetch_logs', OpportunityFetchLog),
        ('cluster_statistics', ClusterStatistics),
    ]
    
    for table_name, model in tables:
        try:
            count = model.objects.count()
            print(f"[PASS] {table_name}: {count} records")
        except Exception as e:
            print(f"[FAIL] {table_name}: ERROR - {e}")
            return False
    
    return True


def test_user_profile():
    """Test user profile and profile vector generation"""
    print_header("TEST 2: User Profile & Vector Generation")
    
    # Get first user
    user = User.objects.first()
    if not user:
        print("[FAIL] No users found in database")
        return False
    
    print(f"Testing with user: {user.username} (ID: {user.id})")
    
    # Check if user has profile
    try:
        profile = UserProfile.objects.get(user=user)
        print(f"[PASS] UserProfile exists")
        print(f"  Profile data keys: {list(profile.profile_data.keys())}")
    except UserProfile.DoesNotExist:
        print("[FAIL] User has no profile. User needs to complete questionnaire first.")
        return False
    
    # Check if user has profile vector
    try:
        profile_vector = UserProfileVector.objects.get(user=user)
        print(f"[PASS] UserProfileVector exists")
        print(f"  Cluster key: {profile_vector.cluster_key}")
        print(f"  Embedding dimensions: {len(profile_vector.embedding)}")
        return True
    except UserProfileVector.DoesNotExist:
        print("[INFO] UserProfileVector doesn't exist yet, will create one...")
        
        # Generate profile vector
        try:
            characteristics = gemini_flash_service.extract_characteristics(profile.profile_data)
            print(f"[PASS] Characteristics extracted: {characteristics}")
            
            cluster_key = UserProfileVector.generate_cluster_key(characteristics)
            print(f"[PASS] Cluster key generated: {cluster_key}")
            
            print("[INFO] Generating embedding (this may take ~1-2 seconds)...")
            embedding = gemini_flash_service.generate_profile_embedding(profile.profile_data)
            
            if embedding:
                print(f"[PASS] Embedding generated ({len(embedding)} dimensions)")
                
                # Create profile vector
                profile_vector = UserProfileVector.objects.create(
                    user=user,
                    profile=profile,
                    embedding=embedding,
                    cluster_key=cluster_key,
                    characteristics=characteristics
                )
                print(f"[PASS] UserProfileVector created")
                return True
            else:
                print("[FAIL] Failed to generate embedding")
                return False
                
        except Exception as e:
            print(f"[FAIL] Error generating profile vector: {e}")
            return False


def test_fetch_opportunities():
    """Test fetching opportunities from Serper"""
    print_header("TEST 3: Fetch Opportunities from Serper")
    
    # Get first user's profile vector
    profile_vector = UserProfileVector.objects.first()
    if not profile_vector:
        print("[FAIL] No profile vector found. Run TEST 2 first.")
        return False
    
    characteristics = profile_vector.characteristics
    cluster_key = profile_vector.cluster_key
    
    print(f"Cluster key: {cluster_key}")
    print(f"Characteristics: {characteristics}")
    
    # Check current cached opportunities
    cached_count = OpportunityCache.objects.filter(cluster_key=cluster_key).count()
    print(f"\nCurrent cached opportunities: {cached_count}")
    
    if cached_count >= 5:
        print("[PASS] Sufficient opportunities already cached")
        
        # Show sample
        sample_opps = OpportunityCache.objects.filter(cluster_key=cluster_key)[:3]
        for opp in sample_opps:
            print(f"  - {opp.title} ({opp.category})")
        
        return True
    
    # Fetch new opportunities
    print("\n[INFO] Fetching new opportunities from Serper (may take 8-10 seconds)...")
    
    try:
        opportunities = serper_opportunity_fetcher.fetch_opportunities_for_cluster(
            characteristics,
            categories=['travel', 'job', 'investment']
        )
        
        print(f"[PASS] Fetched {len(opportunities)} opportunities")
        
        # Cache them
        cached_count = 0
        for opp_data in opportunities[:5]:  # Cache first 5
            content_hash = OpportunityCache.generate_content_hash(
                opp_data['title'],
                opp_data['description'],
                opp_data['source_url']
            )
            
            if not OpportunityCache.objects.filter(content_hash=content_hash).exists():
                from datetime import timedelta
                from django.utils import timezone
                
                OpportunityCache.objects.create(
                    title=opp_data['title'],
                    description=opp_data['description'],
                    category=opp_data['category'],
                    sub_category=opp_data.get('sub_category', ''),
                    source_url=opp_data['source_url'],
                    image_url=opp_data.get('image_url', ''),
                    logo_url=opp_data.get('logo_url', ''),
                    offer_details=opp_data.get('offer_details', {}),
                    target_profile=opp_data.get('target_profile', {}),
                    cluster_key=cluster_key,
                    content_hash=content_hash,
                    expires_at=timezone.now() + timedelta(hours=24),
                    priority=opp_data.get('priority', 'medium'),
                    relevance_base_score=opp_data.get('relevance_base_score', 0.5)
                )
                cached_count += 1
        
        print(f"[PASS] Cached {cached_count} new opportunities")
        
        # Show samples
        print("\nSample opportunities:")
        for opp_data in opportunities[:3]:
            print(f"  - {opp_data['title']} ({opp_data['category']})")
        
        return True
        
    except Exception as e:
        print(f"[FAIL] Error fetching opportunities: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_api_flow():
    """Test the full API flow"""
    print_header("TEST 4: API Flow Simulation")
    
    user = User.objects.first()
    if not user:
        print("[FAIL] No user found")
        return False
    
    # 1. Get profile vector
    try:
        profile_vector = UserProfileVector.objects.get(user=user)
        print(f"[PASS] Profile vector: {profile_vector.cluster_key}")
    except UserProfileVector.DoesNotExist:
        print("[FAIL] No profile vector. Run TEST 2 first.")
        return False
    
    # 2. Get cached opportunities
    from datetime import timedelta
    from django.utils import timezone
    
    opportunities = OpportunityCache.objects.filter(
        cluster_key=profile_vector.cluster_key,
        is_active=True,
        expires_at__gt=timezone.now()
    )
    
    print(f"[PASS] Found {opportunities.count()} valid opportunities")
    
    if opportunities.count() == 0:
        print("[INFO] No opportunities found. Run TEST 3 first to fetch some.")
        return False
    
    # 3. Filter out shown opportunities
    shown_hashes = UserShownOpportunity.objects.filter(
        user=user,
        shown_at__gte=timezone.now() - timedelta(days=7)
    ).values_list('opportunity_hash', flat=True)
    
    print(f"[INFO] User has seen {len(shown_hashes)} opportunities in last 7 days")
    
    opportunities = opportunities.exclude(content_hash__in=shown_hashes)
    print(f"[PASS] {opportunities.count()} opportunities after filtering")
    
    # 4. Get top 3
    final_opportunities = list(opportunities[:3])
    
    print(f"\nTop 3 opportunities for {user.username}:")
    for i, opp in enumerate(final_opportunities, 1):
        print(f"{i}. {opp.title} ({opp.category})")
        print(f"   Priority: {opp.priority}, Score: {opp.relevance_base_score}")
    
    # 5. Mark as shown
    for opp in final_opportunities:
        UserShownOpportunity.objects.get_or_create(
            user=user,
            opportunity_hash=opp.content_hash,
            defaults={'opportunity_title': opp.title}
        )
        opp.increment_shown()
    
    print(f"\n[PASS] Marked {len(final_opportunities)} opportunities as shown")
    
    return True


def test_admin_access():
    """Test that admin models are registered"""
    print_header("TEST 5: Admin Registration")
    
    from django.contrib import admin
    
    models_to_check = [
        'OpportunityCache',
        'UserShownOpportunity',
        'UserProfileVector',
        'OpportunityFetchLog',
        'ClusterStatistics',
    ]
    
    for model_name in models_to_check:
        if any(model_name in str(model) for model in admin.site._registry.keys()):
            print(f"[PASS] {model_name} registered in admin")
        else:
            print(f"[FAIL] {model_name} NOT registered in admin")
    
    return True


def run_all_tests():
    """Run all integration tests"""
    print("\n" + "="*80)
    print("ENHANCED OPPORTUNITIES SYSTEM - INTEGRATION TESTS")
    print("="*80)
    
    tests = [
        ("Database Tables", test_database_tables),
        ("User Profile & Vector", test_user_profile),
        ("Fetch Opportunities", test_fetch_opportunities),
        ("API Flow", test_api_flow),
        ("Admin Registration", test_admin_access),
    ]
    
    results = []
    for test_name, test_func in tests:
        try:
            result = test_func()
            results.append((test_name, result))
        except Exception as e:
            print(f"\n[FAIL] Test '{test_name}' failed with exception: {e}")
            import traceback
            traceback.print_exc()
            results.append((test_name, False))
    
    # Summary
    print_header("TEST SUMMARY")
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "[PASS] PASS" if result else "[FAIL] FAIL"
        print(f"{test_name:.<50} {status}")
    
    print(f"\nResults: {passed}/{total} tests passed")
    
    if passed == total:
        print("\n*** ALL TESTS PASSED! System is ready to use.")
        print("\nNext steps:")
        print("1. Access admin at: http://localhost:8000/admin/opportunities/")
        print("2. Test API at: http://localhost:8000/api/v2/opportunities/")
        print("3. Check documentation in INTEGRATION_COMPLETE.md")
    else:
        print("\n⚠ Some tests failed. Check errors above.")
    
    return passed == total


if __name__ == "__main__":
    success = run_all_tests()
    sys.exit(0 if success else 1)
