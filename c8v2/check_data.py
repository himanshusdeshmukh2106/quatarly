import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'C8V2.settings')
django.setup()

from investments.models import Investment
from investments.market_data_models import CentralizedOHLCData, CentralizedMarketData

print("📊 Database Status Check")
print("=" * 40)

# Check investments
investments = Investment.objects.all()
investments_with_prices = Investment.objects.filter(current_price__gt=0)

print(f"Total investments: {investments.count()}")
print(f"Investments with prices: {investments_with_prices.count()}")

# Check centralized data
ohlc_count = CentralizedOHLCData.objects.count()
market_count = CentralizedMarketData.objects.count()

print(f"OHLC data records: {ohlc_count}")
print(f"Market data records: {market_count}")

print("\n📋 Sample Investment Data:")
for inv in investments_with_prices[:5]:
    print(f"  {inv.symbol}: ${inv.current_price} ({inv.daily_change_percent}%)")

print("\n📈 Sample OHLC Data:")
for ohlc in CentralizedOHLCData.objects.all()[:3]:
    print(f"  {ohlc.symbol}: {len(ohlc.ohlc_data)} data points, last updated: {ohlc.last_updated}")

print("\n📊 Sample Market Data:")
for market in CentralizedMarketData.objects.all()[:3]:
    print(f"  {market.symbol}: PE={market.pe_ratio}, Cap={market.market_cap}, Vol={market.volume}")