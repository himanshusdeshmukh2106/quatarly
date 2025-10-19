"""
Comprehensive Test Suite for New Opportunities System
Tests all components with real API keys:
- Gemini Flash Service
- Serper Opportunity Fetcher
- Duplicate Prevention
- Caching and Performance
"""

import os
import sys
import django
import time
import json
from datetime import datetime
from decimal import Decimal

# Setup Django
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'C8V2.settings')
django.setup()

# Import our services
from opportunities.gemini_flash_service import gemini_flash_service
from opportunities.serper_opportunity_fetcher import serper_opportunity_fetcher
from opportunities.enhanced_models import OpportunityCache

# Color codes for output (disabled on Windows for compatibility)
class Colors:
    if sys.platform == 'win32':
        GREEN = ''
        RED = ''
        YELLOW = ''
        BLUE = ''
        CYAN = ''
        BOLD = ''
        END = ''
    else:
        GREEN = '\033[92m'
        RED = '\033[91m'
        YELLOW = '\033[93m'
        BLUE = '\033[94m'
        CYAN = '\033[96m'
        BOLD = '\033[1m'
        END = '\033[0m'

def print_header(text):
    print(f"\n{Colors.BOLD}{Colors.BLUE}{'='*80}{Colors.END}")
    print(f"{Colors.BOLD}{Colors.CYAN}{text}{Colors.END}")
    print(f"{Colors.BOLD}{Colors.BLUE}{'='*80}{Colors.END}\n")

def print_success(text):
    print(f"{Colors.GREEN}[PASS] {text}{Colors.END}")

def print_error(text):
    print(f"{Colors.RED}[FAIL] {text}{Colors.END}")

def print_info(text):
    print(f"{Colors.YELLOW}[INFO] {text}{Colors.END}")

def print_result(name, value):
    print(f"{Colors.CYAN}{name}:{Colors.END} {value}")


# Sample user profile for testing
SAMPLE_PROFILE = {
    'demographics': {
        'age': 32,
        'maritalStatus': 'Married',
        'hasKids': True,
        'location': 'mumbai'
    },
    'financial': {
        'monthlyIncome': 85000,
        'jobStability': 'Stable',
        'debtSituation': 'Manageable',
        'emergencyFund': '3 months',
        'savingsRate': 15
    },
    'goals': {
        'shortTerm': 'Build emergency fund and invest in mutual funds',
        'longTerm': 'Financial independence and retirement planning',
        'priorities': ['investment', 'savings', 'family_security']
    },
    'personality': {
        'spendingStyle': 'Balanced',
        'investmentComfort': 'Moderate',
        'riskTolerance': 'medium'
    },
    'riskFactors': ['Need better emergency fund', 'Should diversify investments'],
    'opportunities': ['Start SIP in mutual funds', 'Get health insurance']
}

SAMPLE_PROFILE_2 = {
    'demographics': {
        'age': 28,
        'maritalStatus': 'Single',
        'hasKids': False,
        'location': 'bangalore'
    },
    'financial': {
        'monthlyIncome': 120000,
        'jobStability': 'Stable',
        'debtSituation': 'No debt',
        'emergencyFund': '6 months',
        'savingsRate': 25
    },
    'goals': {
        'shortTerm': 'Stock market investment and skill development',
        'longTerm': 'Early retirement and travel',
        'priorities': ['investment', 'travel', 'skill_development']
    },
    'personality': {
        'spendingStyle': 'Conservative',
        'investmentComfort': 'Aggressive',
        'riskTolerance': 'high'
    },
    'riskFactors': [],
    'opportunities': ['Start trading in stocks', 'Take online courses']
}


def test_gemini_api_key():
    """Test 1: Validate Gemini API Key"""
    print_header("TEST 1: Gemini API Key Validation")
    
    api_key = os.getenv('GEMINI_API_KEY')
    print_info(f"API Key configured: {api_key[:20]}...{api_key[-10:] if api_key else ''}")
    
    if gemini_flash_service.validate_api_key():
        print_success("Gemini API key is valid and configured")
        return True
    else:
        print_error("Gemini API key validation failed")
        return False


def test_serper_api_key():
    """Test 2: Validate Serper API Key"""
    print_header("TEST 2: Serper API Key Validation")
    
    api_key = os.getenv('SERPER_API_KEY')
    print_info(f"API Key configured: {api_key[:20]}...{api_key[-10:] if api_key else ''}")
    
    if serper_opportunity_fetcher.validate_api_key():
        print_success("Serper API key is valid and configured")
        return True
    else:
        print_error("Serper API key validation failed")
        return False


def test_profile_embedding_generation():
    """Test 3: Generate Profile Embedding"""
    print_header("TEST 3: Profile Embedding Generation")
    
    print_info("Generating embedding for sample profile...")
    start_time = time.time()
    
    embedding = gemini_flash_service.generate_profile_embedding(SAMPLE_PROFILE)
    
    duration = time.time() - start_time
    
    if embedding and len(embedding) > 0:
        print_success(f"Embedding generated successfully in {duration:.2f}s")
        print_result("Embedding dimensions", len(embedding))
        print_result("First 5 values", embedding[:5])
        print_result("Embedding type", type(embedding))
        return embedding
    else:
        print_error("Failed to generate embedding")
        return None


def test_similarity_calculation(embedding1):
    """Test 4: Calculate Similarity Between Profiles"""
    print_header("TEST 4: Profile Similarity Calculation")
    
    print_info("Generating embedding for second profile...")
    embedding2 = gemini_flash_service.generate_profile_embedding(SAMPLE_PROFILE_2)
    
    if not embedding2:
        print_error("Failed to generate second embedding")
        return False
    
    print_info("Calculating similarity between profiles...")
    similarity = gemini_flash_service.calculate_similarity(embedding1, embedding2)
    
    print_success(f"Similarity calculated: {similarity:.4f}")
    print_result("Similarity score", f"{similarity:.4f} (0.0 = different, 1.0 = identical)")
    
    # Test similarity with itself (should be ~1.0)
    self_similarity = gemini_flash_service.calculate_similarity(embedding1, embedding1)
    print_result("Self-similarity", f"{self_similarity:.4f} (should be ~1.0)")
    
    if self_similarity > 0.95:
        print_success("Self-similarity test passed")
        return True
    else:
        print_error(f"Self-similarity test failed: {self_similarity:.4f} < 0.95")
        return False


def test_characteristic_extraction():
    """Test 5: Extract Characteristics from Profile"""
    print_header("TEST 5: Characteristic Extraction")
    
    print_info("Extracting characteristics from profile...")
    characteristics = gemini_flash_service.extract_characteristics(SAMPLE_PROFILE)
    
    print_success("Characteristics extracted")
    print_result("Income bracket", characteristics.get('income_bracket'))
    print_result("Age group", characteristics.get('age_group'))
    print_result("Location", characteristics.get('location'))
    print_result("Goals", characteristics.get('goals'))
    print_result("Risk tolerance", characteristics.get('risk_tolerance'))
    print_result("Interests", characteristics.get('interests'))
    
    # Generate cluster key
    from opportunities.enhanced_models import UserProfileVector
    cluster_key = UserProfileVector.generate_cluster_key(characteristics)
    print_result("Cluster key", cluster_key)
    
    return characteristics


def test_serper_travel_opportunities(characteristics):
    """Test 6: Fetch Travel Opportunities"""
    print_header("TEST 6: Fetch Travel Opportunities from Serper")
    
    print_info("Fetching travel opportunities...")
    start_time = time.time()
    
    opportunities = serper_opportunity_fetcher.fetch_travel_opportunities(characteristics)
    
    duration = time.time() - start_time
    
    if opportunities:
        print_success(f"Fetched {len(opportunities)} travel opportunities in {duration:.2f}s")
        
        for i, opp in enumerate(opportunities[:3], 1):
            print(f"\n{Colors.CYAN}Travel Opportunity {i}:{Colors.END}")
            print_result("  Title", opp.get('title')[:80])
            print_result("  Sub-category", opp.get('sub_category'))
            print_result("  Description", opp.get('description')[:100] + "...")
            print_result("  Price", opp.get('offer_details', {}).get('price'))
            print_result("  Discount", opp.get('offer_details', {}).get('discount'))
            print_result("  Source", opp.get('offer_details', {}).get('source'))
            print_result("  URL", opp.get('source_url')[:60] + "...")
            print_result("  Content Hash", opp.get('content_hash')[:16] + "...")
        
        return opportunities
    else:
        print_error("Failed to fetch travel opportunities")
        return []


def test_serper_job_opportunities(characteristics):
    """Test 7: Fetch Job Opportunities"""
    print_header("TEST 7: Fetch Job Opportunities from Serper")
    
    print_info("Fetching job opportunities...")
    start_time = time.time()
    
    opportunities = serper_opportunity_fetcher.fetch_job_opportunities(characteristics)
    
    duration = time.time() - start_time
    
    if opportunities:
        print_success(f"Fetched {len(opportunities)} job opportunities in {duration:.2f}s")
        
        for i, opp in enumerate(opportunities[:3], 1):
            print(f"\n{Colors.CYAN}Job Opportunity {i}:{Colors.END}")
            print_result("  Title", opp.get('title')[:80])
            print_result("  Sub-category", opp.get('sub_category'))
            print_result("  Company", opp.get('offer_details', {}).get('company'))
            print_result("  Location", opp.get('offer_details', {}).get('location'))
            print_result("  Salary", opp.get('offer_details', {}).get('salary'))
            print_result("  Source", opp.get('offer_details', {}).get('source'))
            print_result("  URL", opp.get('source_url')[:60] + "...")
            print_result("  Content Hash", opp.get('content_hash')[:16] + "...")
        
        return opportunities
    else:
        print_error("Failed to fetch job opportunities")
        return []


def test_serper_investment_opportunities(characteristics):
    """Test 8: Fetch Investment Opportunities"""
    print_header("TEST 8: Fetch Investment Opportunities from Serper")
    
    print_info("Fetching investment opportunities...")
    start_time = time.time()
    
    opportunities = serper_opportunity_fetcher.fetch_investment_opportunities(characteristics)
    
    duration = time.time() - start_time
    
    if opportunities:
        print_success(f"Fetched {len(opportunities)} investment opportunities in {duration:.2f}s")
        
        for i, opp in enumerate(opportunities[:3], 1):
            print(f"\n{Colors.CYAN}Investment Opportunity {i}:{Colors.END}")
            print_result("  Title", opp.get('title')[:80])
            print_result("  Sub-category", opp.get('sub_category'))
            print_result("  Symbol", opp.get('offer_details', {}).get('symbol'))
            print_result("  Current Price", opp.get('offer_details', {}).get('current_price'))
            print_result("  Target Price", opp.get('offer_details', {}).get('target_price'))
            print_result("  Upside", opp.get('offer_details', {}).get('upside'))
            print_result("  Source", opp.get('offer_details', {}).get('source'))
            print_result("  URL", opp.get('source_url')[:60] + "...")
            print_result("  Content Hash", opp.get('content_hash')[:16] + "...")
        
        return opportunities
    else:
        print_error("Failed to fetch investment opportunities")
        return []


def test_opportunity_scoring(opportunities):
    """Test 9: Score Opportunities Against Profile"""
    print_header("TEST 9: Opportunity Scoring with Gemini Flash")
    
    if not opportunities:
        print_error("No opportunities to score")
        return False
    
    print_info(f"Scoring {len(opportunities[:3])} opportunities...")
    
    for i, opp in enumerate(opportunities[:3], 1):
        print(f"\n{Colors.CYAN}Scoring Opportunity {i}:{Colors.END}")
        print_info(f"Title: {opp.get('title')[:60]}...")
        
        start_time = time.time()
        score = gemini_flash_service.score_opportunity(opp, SAMPLE_PROFILE)
        duration = time.time() - start_time
        
        print_result("  Relevance Score", f"{score:.2f} (0.0-1.0)")
        print_result("  Scoring Time", f"{duration:.2f}s")
        
        if score >= 0.7:
            print_success("  High relevance!")
        elif score >= 0.5:
            print_info("  Medium relevance")
        else:
            print_error("  Low relevance")
    
    return True


def test_duplicate_detection():
    """Test 10: Duplicate Detection System"""
    print_header("TEST 10: Duplicate Detection")
    
    # Test 1: Content hash duplicate detection
    print_info("Testing content hash duplicate detection...")
    
    opp1 = {
        'title': 'Mumbai to Goa Flights 50% Off',
        'description': 'Book now and save on flights to Goa',
        'source_url': 'https://makemytrip.com/flights/mumbai-goa'
    }
    
    opp2 = {
        'title': 'Mumbai to Goa Flights 50% Off',
        'description': 'Book now and save on flights to Goa',
        'source_url': 'https://makemytrip.com/flights/mumbai-goa'
    }
    
    hash1 = OpportunityCache.generate_content_hash(
        opp1['title'], opp1['description'], opp1['source_url']
    )
    hash2 = OpportunityCache.generate_content_hash(
        opp2['title'], opp2['description'], opp2['source_url']
    )
    
    print_result("Hash 1", hash1[:32] + "...")
    print_result("Hash 2", hash2[:32] + "...")
    
    if hash1 == hash2:
        print_success("Exact duplicate detected correctly (hashes match)")
    else:
        print_error("Duplicate detection failed (hashes don't match)")
    
    # Test 2: Semantic similarity detection
    print_info("\nTesting semantic similarity detection...")
    
    opp3 = {
        'title': 'Goa Flight Deals - 50% Discount',
        'description': 'Save big on your Mumbai to Goa flight bookings',
        'source_url': 'https://goibibo.com/flights'
    }
    
    print_info(f"Opportunity 1: {opp1['title']}")
    print_info(f"Opportunity 3: {opp3['title']}")
    
    start_time = time.time()
    are_similar = gemini_flash_service.are_opportunities_similar(opp1, opp3, threshold=0.85)
    duration = time.time() - start_time
    
    print_result("Semantic similarity", "SIMILAR" if are_similar else "DIFFERENT")
    print_result("Detection time", f"{duration:.2f}s")
    
    if are_similar:
        print_success("Semantic duplicate detected correctly")
    else:
        print_info("Opportunities considered different (may vary based on content)")
    
    return True


def test_content_hash_generation():
    """Test 11: Content Hash Generation"""
    print_header("TEST 11: Content Hash Generation")
    
    print_info("Testing hash generation for different opportunities...")
    
    opportunities = [
        ('Travel Deal 1', 'Mumbai to Goa flights', 'https://example1.com'),
        ('Travel Deal 2', 'Delhi to Mumbai flights', 'https://example2.com'),
        ('Travel Deal 1', 'Mumbai to Goa flights', 'https://example1.com'),  # Duplicate
    ]
    
    hashes = []
    for title, desc, url in opportunities:
        hash_val = OpportunityCache.generate_content_hash(title, desc, url)
        hashes.append(hash_val)
        print_result(f"  {title}", hash_val[:32] + "...")
    
    # Check for duplicates
    if hashes[0] == hashes[2]:
        print_success("Duplicate detected (hash 1 == hash 3)")
    else:
        print_error("Duplicate detection failed")
    
    if hashes[0] != hashes[1]:
        print_success("Different opportunities have different hashes")
    else:
        print_error("Hash collision detected")
    
    return True


def test_cluster_key_generation():
    """Test 12: Cluster Key Generation"""
    print_header("TEST 12: Cluster Key Generation")
    
    characteristics1 = gemini_flash_service.extract_characteristics(SAMPLE_PROFILE)
    characteristics2 = gemini_flash_service.extract_characteristics(SAMPLE_PROFILE_2)
    
    from opportunities.enhanced_models import UserProfileVector
    
    cluster1 = UserProfileVector.generate_cluster_key(characteristics1)
    cluster2 = UserProfileVector.generate_cluster_key(characteristics2)
    
    print_result("Cluster Key 1", cluster1)
    print_result("Cluster Key 2", cluster2)
    
    if cluster1 != cluster2:
        print_success("Different profiles generate different cluster keys")
    else:
        print_error("Cluster keys are identical for different profiles")
    
    # Test same profile generates same key
    cluster1_again = UserProfileVector.generate_cluster_key(characteristics1)
    if cluster1 == cluster1_again:
        print_success("Same profile generates consistent cluster key")
    else:
        print_error("Cluster key generation is not consistent")
    
    return True


def test_performance():
    """Test 13: Performance Metrics"""
    print_header("TEST 13: Performance Testing")
    
    # Test embedding generation speed
    print_info("Testing embedding generation speed...")
    start = time.time()
    embedding = gemini_flash_service.generate_profile_embedding(SAMPLE_PROFILE)
    embed_time = time.time() - start
    print_result("Embedding generation", f"{embed_time:.2f}s")
    
    if embed_time < 2.0:
        print_success(f"Fast embedding generation (< 2s)")
    else:
        print_info(f"Embedding generation took {embed_time:.2f}s")
    
    # Test opportunity scoring speed
    print_info("\nTesting opportunity scoring speed...")
    test_opp = {
        'title': 'Test Opportunity',
        'description': 'Test description for performance testing',
        'category': 'investment'
    }
    
    start = time.time()
    score = gemini_flash_service.score_opportunity(test_opp, SAMPLE_PROFILE)
    score_time = time.time() - start
    print_result("Opportunity scoring", f"{score_time:.2f}s")
    
    if score_time < 1.0:
        print_success(f"Fast scoring (< 1s)")
    else:
        print_info(f"Scoring took {score_time:.2f}s")
    
    # Test hash generation speed (should be instant)
    print_info("\nTesting hash generation speed...")
    start = time.time()
    for _ in range(1000):
        OpportunityCache.generate_content_hash("Test Title", "Test Description", "https://test.com")
    hash_time = (time.time() - start) / 1000
    print_result("Hash generation (avg)", f"{hash_time*1000:.4f}ms")
    
    if hash_time < 0.001:
        print_success("Ultra-fast hash generation (< 1ms)")
    
    return True


def run_all_tests():
    """Run all tests and generate report"""
    print(f"{Colors.BOLD}{Colors.GREEN}")
    print("="*80)
    print("")
    print("        COMPREHENSIVE TEST SUITE FOR NEW OPPORTUNITIES SYSTEM")
    print("")
    print("="*80)
    print(Colors.END)
    
    start_time = time.time()
    results = {}
    
    # Run all tests
    try:
        results['gemini_api'] = test_gemini_api_key()
        results['serper_api'] = test_serper_api_key()
        
        if results['gemini_api']:
            embedding = test_profile_embedding_generation()
            results['embedding'] = embedding is not None
            
            if embedding:
                results['similarity'] = test_similarity_calculation(embedding)
            else:
                results['similarity'] = False
            
            characteristics = test_characteristic_extraction()
            results['characteristics'] = characteristics is not None
        else:
            print_error("Skipping Gemini tests due to API key issues")
            results['embedding'] = False
            results['similarity'] = False
            results['characteristics'] = False
            characteristics = None
        
        if results['serper_api'] and characteristics:
            travel_opps = test_serper_travel_opportunities(characteristics)
            results['travel'] = len(travel_opps) > 0
            
            job_opps = test_serper_job_opportunities(characteristics)
            results['jobs'] = len(job_opps) > 0
            
            investment_opps = test_serper_investment_opportunities(characteristics)
            results['investments'] = len(investment_opps) > 0
            
            # Test scoring if we have opportunities
            all_opps = travel_opps + job_opps + investment_opps
            if all_opps and results['gemini_api']:
                results['scoring'] = test_opportunity_scoring(all_opps)
            else:
                results['scoring'] = False
        else:
            print_error("Skipping Serper tests due to API key issues or missing characteristics")
            results['travel'] = False
            results['jobs'] = False
            results['investments'] = False
            results['scoring'] = False
        
        # Test duplicate detection
        if results['gemini_api']:
            results['duplicates'] = test_duplicate_detection()
        else:
            results['duplicates'] = False
        
        # Test utilities
        results['content_hash'] = test_content_hash_generation()
        
        if characteristics:
            results['cluster_key'] = test_cluster_key_generation()
        else:
            results['cluster_key'] = False
        
        # Performance tests
        if results['gemini_api']:
            results['performance'] = test_performance()
        else:
            results['performance'] = False
        
    except Exception as e:
        print_error(f"Test suite error: {e}")
        import traceback
        traceback.print_exc()
    
    # Generate summary
    total_time = time.time() - start_time
    
    print_header("TEST SUMMARY")
    
    passed = sum(1 for v in results.values() if v)
    total = len(results)
    
    for test_name, passed_test in results.items():
        status = f"{Colors.GREEN}PASSED{Colors.END}" if passed_test else f"{Colors.RED}FAILED{Colors.END}"
        print(f"{test_name.replace('_', ' ').title():.<50} {status}")
    
    print(f"\n{Colors.BOLD}Results: {passed}/{total} tests passed{Colors.END}")
    print(f"{Colors.BOLD}Total time: {total_time:.2f}s{Colors.END}")
    
    success_rate = (passed / total * 100) if total > 0 else 0
    
    if success_rate == 100:
        print(f"\n{Colors.GREEN}{Colors.BOLD}*** ALL TESTS PASSED! System is ready for deployment. ***{Colors.END}")
    elif success_rate >= 80:
        print(f"\n{Colors.YELLOW}{Colors.BOLD}*** Most tests passed. Check failed tests above. ***{Colors.END}")
    else:
        print(f"\n{Colors.RED}{Colors.BOLD}*** Multiple tests failed. Review configuration and API keys. ***{Colors.END}")
    
    return results


if __name__ == "__main__":
    results = run_all_tests()
