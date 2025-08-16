#!/usr/bin/env python
"""
Test to understand the actual volume values from Finnhub
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

from investments.bharatsm_service import FinnhubAPIService
import finnhub


def analyze_volume_data():
    """Analyze the actual volume data from Finnhub"""
    print("Analyzing Finnhub Volume Data")
    print("=" * 40)
    
    api_key = FinnhubAPIService.get_api_key()
    finnhub_client = finnhub.Client(api_key=api_key)
    
    symbols = ['AAPL', 'MSFT', 'GOOGL']
    
    for symbol in symbols:
        print(f"\n{symbol}:")
        print("-" * 15)
        
        # Get raw financials data
        financials = finnhub_client.company_basic_financials(symbol, 'all')
        
        if financials and 'metric' in financials:
            metrics = financials['metric']
            
            # Check all volume-related fields
            volume_fields = [
                '10DayAverageTradingVolume',
                '3MonthAverageTradingVolume',
                'averageVolume10days',
                'averageVolume3months'
            ]
            
            for field in volume_fields:
                if field in metrics:
                    value = metrics[field]
                    print(f"  {field}: {value}")
                    
                    # Convert to actual shares (assuming it's in millions)
                    if value:
                        actual_shares = value * 1_000_000
                        formatted = FinnhubAPIService._format_volume_indian(actual_shares)
                        print(f"    → As shares: {actual_shares:,.0f}")
                        print(f"    → Formatted: {formatted}")


if __name__ == "__main__":
    analyze_volume_data()