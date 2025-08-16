# Bharat-sm-data Library Integration

## Overview

Successfully integrated the Bharat-sm-data library to provide real-time Indian stock market data from NSE/BSE exchanges. This implementation uses a hybrid approach:

- **Technical Data**: Real-time prices, volume, OHLC data from NSE/BSE via Bharat-sm-data
- **Fundamental Data**: P/E ratios, sector analysis, company info via Perplexity API

## Library Documentation Reference

Based on the official Bharat-sm-data documentation, we're using:

### Core Import:
```python
from Technical import NSE
```

### Key Methods Used:
- `nse.search(query)` - Search for stocks
- `nse.get_nse_equity_meta_info(symbol)` - Get company metadata
- `nse.get_ohlc_data(symbol, is_index=False)` - Get OHLC data
- `nse.get_market_status_and_current_val()` - Get market status
- `nse.get_all_indices()` - Get indices data

## Implementation Details

### 1. **TechnicalDataService** (`technical_data_service.py`)

**Core Features:**
```python
class TechnicalDataService:
    def get_stock_data(symbol, exchange="NSE")     # Complete stock data
    def get_market_status()                        # Market open/close status
    def search_stocks(query, limit=10)             # Stock search
    def get_indices_data()                         # Nifty 50, Bank Nifty data
```

**Data Fetched:**
- Real-time stock prices from NSE
- Company metadata (name, sector, industry)
- OHLC data (Open, High, Low, Close)
- Market status and Nifty values
- Stock search functionality

### 2. **Enhanced DataEnrichmentService**

**Two-Tier Approach:**
1. **Primary**: Technical data from NSE/BSE (Bharat-sm-data)
2. **Secondary**: Fundamental data from Perplexity API

**Benefits:**
- Real NSE data for Indian stocks
- No API rate limits for technical data
- Accurate volume and price information
- Fallback to Perplexity for comprehensive coverage

### 3. **Volume Data Implementation**

**Data Flow:**
```
NSE API → Bharat-sm-data → TechnicalDataService → DataEnrichmentService → Database → Frontend
```

**Volume Formatting:**
- Raw volume numbers converted to readable format
- Indian format: "1.2Cr", "5.5L", "2.3K"
- Handles large trading volumes appropriately

## API Methods Available

### Stock Data:
```python
# Get comprehensive stock data
data = technical_data_service.get_stock_data("RELIANCE", "NSE")

# Response format:
{
    "current_price": 2850.50,
    "company_name": "Reliance Industries Limited",
    "exchange": "NSE",
    "sector": "Oil & Gas",
    "volume": "2.5Cr",
    "open_price": 2845.00,
    "high_price": 2865.00,
    "low_price": 2840.00,
    "last_updated": "2025-01-15T14:30:00"
}
```

### Market Status:
```python
# Get current market status
status = technical_data_service.get_market_status()

# Response format:
{
    "status": "open",
    "message": "Open",
    "nifty_value": 25438.5,
    "timestamp": "2025-01-15T14:30:00"
}
```

### Stock Search:
```python
# Search for stocks
results = technical_data_service.search_stocks("REL", limit=5)

# Response format:
[
    {
        "symbol": "RELIANCE",
        "name": "Reliance Industries Limited",
        "exchange": "NSE",
        "country": "India",
        "type": "stock"
    }
]
```

### Indices Data:
```python
# Get major indices
indices = technical_data_service.get_indices_data()

# Response format:
{
    "NIFTY_50": {
        "value": 25438.5,
        "change": -21.65,
        "change_percent": -0.09,
        "open": 25450.45,
        "high": 25489.80,
        "low": 25407.20
    },
    "NIFTY_BANK": {
        "value": 56957.90,
        "change": -74.00,
        "change_percent": -0.13,
        ...
    }
}
```

## Installation & Setup

### 1. **Install Library**
```bash
pip install Bharat-sm-data
```

### 2. **Test Integration**
```bash
# Run the comprehensive test
python test_bharat_sm_integration.py

# Or use Django management command
python manage.py test_technical_data --symbol RELIANCE --exchange NSE
```

### 3. **Database Migration**
```bash
python manage.py migrate
```

## Error Handling & Fallbacks

### Graceful Degradation:
1. **Library Not Available**: Falls back to Perplexity API
2. **NSE API Down**: Uses cached data or Perplexity fallback
3. **Invalid Symbols**: Returns empty results with proper logging
4. **Network Issues**: Implements timeout and retry logic

### Logging Strategy:
- Info level: Successful data fetches
- Warning level: Fallback usage, rate limits
- Error level: API failures, parsing errors

## Performance Optimizations

### Caching Strategy:
- Market status: 5-minute cache
- Stock data: 1-minute cache during market hours
- Search results: 10-minute cache
- Indices data: 2-minute cache

### Async Processing:
- Background enrichment via Celery
- Non-blocking API calls
- Batch processing for multiple stocks

## Data Quality Features

### Volume Formatting:
```python
# Indian number format
10,000,000+ → "1.0Cr"
100,000+    → "1.0L" 
1,000+      → "1.0K"
< 1,000     → "500"
```

### Price Accuracy:
- Real-time NSE prices during market hours
- End-of-day prices after market close
- Proper decimal handling for Indian rupees

## Integration Benefits

### 1. **Real Data**:
- Actual NSE/BSE prices instead of mock data
- Real trading volumes
- Accurate daily changes and percentages

### 2. **No Rate Limits**:
- Direct library access without API restrictions
- Unlimited requests during development
- Cost-effective solution

### 3. **Indian Market Focus**:
- Optimized for Indian stock exchanges
- Proper handling of Indian number formats
- Support for NSE and BSE symbols

### 4. **Comprehensive Coverage**:
- Equity stocks
- ETFs and mutual funds
- Indices (Nifty 50, Bank Nifty, etc.)
- Market status and trading hours

## Testing Examples

### Basic Usage:
```python
from investments.technical_data_service import get_stock_market_data

# Get Reliance stock data
data = get_stock_market_data("RELIANCE", "NSE")
print(f"Current Price: ₹{data['current_price']}")
print(f"Volume: {data['volume']}")
```

### Search Functionality:
```python
from investments.technical_data_service import search_indian_stocks

# Search for stocks
results = search_indian_stocks("Tata", limit=5)
for stock in results:
    print(f"{stock['symbol']}: {stock['name']}")
```

### Market Status:
```python
from investments.technical_data_service import is_market_open

if is_market_open():
    print("Market is currently open")
else:
    print("Market is closed")
```

## Future Enhancements

### Planned Features:
1. **Derivatives Support**: Options and futures data
2. **Historical Charts**: Multi-timeframe OHLC data
3. **Corporate Actions**: Dividends, splits, bonuses
4. **Sector Analysis**: Industry-wise performance
5. **Block Deals**: Large transaction monitoring

### Additional Data Sources:
- BSE integration for broader coverage
- Commodity prices (gold, silver)
- Currency rates (USD/INR)
- Government securities (G-Sec)

## Troubleshooting

### Common Issues:
1. **Import Error**: Install library with `pip install Bharat-sm-data`
2. **Network Timeout**: Check internet connection and NSE website accessibility
3. **Symbol Not Found**: Verify symbol format (use NSE symbols without .NS suffix)
4. **No Data Returned**: Check if market is open or symbol is valid

### Debug Commands:
```bash
# Test specific symbol
python manage.py test_technical_data --symbol TCS

# Run comprehensive test
python test_bharat_sm_integration.py

# Check logs
tail -f logs/django.log | grep technical_data
```

This implementation provides a robust, accurate, and cost-effective solution for Indian stock market data integration, significantly improving the user experience with real market information.