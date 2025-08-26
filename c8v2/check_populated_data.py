#!/usr/bin/env python3
import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'C8V2.settings')
django.setup()

from investments.models import Investment
from investments.market_data_models import CentralizedMarketData, CentralizedOHLCData

print("="*60)
print("📊 FINANCIAL DATA POPULATION CHECK")
print("="*60)

print("\n📈 INVESTMENTS:")
investments = Investment.objects.all()[:8]
for inv in investments:
    price_status = f"${float(inv.current_price):.2f}" if inv.current_price else "No price"
    print(f"  • {inv.symbol}: {price_status}")

print(f"\n📊 MARKET DATA ({CentralizedMarketData.objects.count()} records):")
for market_data in CentralizedMarketData.objects.all():
    print(f"  • {market_data.symbol}: PE={market_data.pe_ratio}, Market Cap={market_data.get_formatted_market_cap()}")

print(f"\n📈 OHLC DATA ({CentralizedOHLCData.objects.count()} records):")
for ohlc_data in CentralizedOHLCData.objects.all():
    sample_point = ohlc_data.ohlc_data[0] if ohlc_data.ohlc_data else None
    print(f"  • {ohlc_data.symbol}: {len(ohlc_data.ohlc_data)} data points")
    if sample_point:
        print(f"    Latest: Date={sample_point.get('timestamp', 'N/A')}, Close=${sample_point.get('close', 'N/A')}")

print("\n✅ Data population check completed!")