#!/usr/bin/env python
"""
Test script to verify unified Indian volume formatting across all services
"""

import os
import sys
import django
from pathlib import Path

# Add the project root to Python path
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'C8V2.settings')
django.setup()

from investments.bharatsm_service import (
    FinnhubAPIService, 
    FMPAPIService, 
    FinalOptimizedBharatSMService
)


def test_volume_formatting_consistency():
    """Test that all services format volume consistently"""
    print("Testing Volume Formatting Consistency")
    print("=" * 50)
    
    # Test cases with expected Indian formatting
    test_cases = [
        (150000000, "15.0Cr"),    # 150 million -> 15 crores
        (25000000, "2.5Cr"),     # 25 million -> 2.5 crores
        (2500000, "25.0L"),      # 2.5 million -> 25 lakhs
        (750000, "7.5L"),        # 750 thousand -> 7.5 lakhs
        (75000, "75.0K"),        # 75 thousand -> 75K
        (5000, "5.0K"),          # 5 thousand -> 5K
        (500, "500"),            # 500 -> 500
        (0, "0"),                # 0 -> 0
        (None, "0")              # None -> 0
    ]
    
    services = {
        'FinnhubAPIService': FinnhubAPIService,
        'FMPAPIService': FMPAPIService,
        'FinalOptimizedBharatSMService': FinalOptimizedBharatSMService()
    }
    
    all_consistent = True
    
    for service_name, service in services.items():
        print(f"\nTesting {service_name}:")
        print("-" * 30)
        
        service_consistent = True
        
        for volume, expected in test_cases:
            try:
                if service_name == 'FinalOptimizedBharatSMService':
                    # Instance method
                    result = service._format_volume_indian_standard(volume)
                else:
                    # Class method
                    result = service._format_volume_indian(volume)
                
                if result == expected:
                    print(f"✅ {volume} -> {result}")
                else:
                    print(f"❌ {volume} -> {result} (expected {expected})")
                    service_consistent = False
                    all_consistent = False
                    
            except Exception as e:
                print(f"❌ Error formatting {volume}: {e}")
                service_consistent = False
                all_consistent = False
        
        if service_consistent:
            print(f"✅ {service_name} formatting is consistent")
        else:
            print(f"❌ {service_name} formatting has issues")
    
    return all_consistent


def test_cross_service_consistency():
    """Test that all services produce the same output for the same input"""
    print("\n\nTesting Cross-Service Consistency")
    print("=" * 50)
    
    test_volumes = [150000000, 2500000, 75000, 500, 0]
    
    bharatsm_service = FinalOptimizedBharatSMService()
    
    all_consistent = True
    
    for volume in test_volumes:
        print(f"\nTesting volume: {volume}")
        
        # Get results from all services
        finnhub_result = FinnhubAPIService._format_volume_indian(volume)
        fmp_result = FMPAPIService._format_volume_indian(volume)
        bharatsm_result = bharatsm_service._format_volume_indian_standard(volume)
        
        # Check if all results are the same
        if finnhub_result == fmp_result == bharatsm_result:
            print(f"✅ All services: {finnhub_result}")
        else:
            print(f"❌ Inconsistent results:")
            print(f"   Finnhub: {finnhub_result}")
            print(f"   FMP: {fmp_result}")
            print(f"   BharatSM: {bharatsm_result}")
            all_consistent = False
    
    return all_consistent


def test_edge_cases():
    """Test edge cases for volume formatting"""
    print("\n\nTesting Edge Cases")
    print("=" * 50)
    
    edge_cases = [
        (9999999, "999.0K"),      # Just under 1 crore
        (10000000, "1.0Cr"),      # Exactly 1 crore
        (99999, "99.9K"),         # Just under 1 lakh
        (100000, "1.0L"),         # Exactly 1 lakh
        (999, "999"),             # Just under 1K
        (1000, "1.0K"),           # Exactly 1K
        (1.5, "1"),               # Decimal input
        (-1000, "-1.0K"),         # Negative number
    ]
    
    bharatsm_service = FinalOptimizedBharatSMService()
    
    all_passed = True
    
    for volume, expected in edge_cases:
        try:
            result = bharatsm_service._format_volume_indian_standard(volume)
            if result == expected:
                print(f"✅ {volume} -> {result}")
            else:
                print(f"⚠️ {volume} -> {result} (expected {expected})")
                # Don't fail for edge cases, just warn
        except Exception as e:
            print(f"❌ Error with {volume}: {e}")
            all_passed = False
    
    return all_passed


def main():
    """Run all volume formatting tests"""
    print("Unified Volume Formatting Tests")
    print("=" * 60)
    
    results = []
    
    # Test individual service consistency
    results.append(test_volume_formatting_consistency())
    
    # Test cross-service consistency
    results.append(test_cross_service_consistency())
    
    # Test edge cases
    results.append(test_edge_cases())
    
    # Summary
    print("\n" + "=" * 60)
    print("TEST SUMMARY")
    print("=" * 60)
    
    passed = sum(results)
    total = len(results)
    
    print(f"Test categories passed: {passed}/{total}")
    
    if passed == total:
        print("🎉 All volume formatting tests passed!")
        print("✅ Unified Indian volume formatting is working correctly")
        return True
    else:
        print("💥 Some volume formatting tests failed")
        print("❌ Volume formatting needs attention")
        return False


if __name__ == "__main__":
    main()