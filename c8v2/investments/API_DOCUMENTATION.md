# Investment API Documentation

## Overview

The Investment API provides comprehensive asset management functionality supporting multiple asset types including stocks, ETFs, bonds, cryptocurrencies, and physical assets like gold and silver. The API includes automatic data enrichment using BharatSM (MoneyControl) for Indian stocks and Perplexity API fallback, providing real-time volume, market cap, P/E ratios, and growth rates.

## Key Features

- **Multi-Source Data Integration**: 
  - **Finnhub API**: Primary source for US stocks (real-time quotes, P/E ratios, market cap)
  - **BharatSM Integration**: Primary data source for Indian stocks using MoneyControl API
  - **FMP API**: Fallback for US stocks and primary for cryptocurrencies
  - **Perplexity API**: Final fallback for all asset types
- **Frontend Data Fields**: Fetches exact data displayed on UI (Volume, Market Cap, P/E Ratio, Growth Rate)
- **Intelligent Routing**: Automatic asset type detection and routing to appropriate data sources
- **Unified Volume Formatting**: Consistent Indian number formatting (Cr, L, K) across all sources
- **Growth Rate**: Revenue growth rate replaces dividend yield for better investment analysis
- **Real-time Updates**: Daily background tasks update all asset data using appropriate sources

## Base URL

```
/api/investments/
```

## Authentication

All endpoints require authentication using Token Authentication:

```
Authorization: Token your_token_here
```

## Asset Types Supported

- `stock` - Individual stocks
- `etf` - Exchange Traded Funds
- `mutual_fund` - Mutual Funds
- `crypto` - Cryptocurrencies
- `bond` - Bonds
- `gold` - Gold investments
- `silver` - Silver investments
- `commodity` - Other commodities

## Data Sources & Routing

The API automatically routes requests to appropriate data sources based on asset type:

### US Stocks & ETFs → Finnhub API (Primary)
- **Symbols**: AAPL, MSFT, GOOGL, SPY, QQQ, etc.
- **Data**: Real-time quotes, company profiles, P/E ratios, market cap
- **Fallback**: FMP API → Perplexity API
- **Free Tier**: 60 calls/minute, real-time data

### Indian Stocks → BharatSM (MoneyControl)
- **Symbols**: RELIANCE, TCS, INFY, HDFCBANK, etc.
- **Exchanges**: NSE (.NS), BSE (.BO)
- **Data**: Volume, P/E ratios, market cap, growth rates
- **Fallback**: Perplexity API → FMP API

### Cryptocurrencies → FMP API
- **Symbols**: BTCUSD, ETHUSD, ADAUSD, etc.
- **Data**: Real-time prices, market cap, 24h volume
- **Fallback**: Perplexity API

### Volume Formatting
All volume data is formatted using Indian conventions:
- **Crores**: 150M+ → "15.0Cr"
- **Lakhs**: 100K+ → "25.0L" 
- **Thousands**: 1K+ → "75.0K"
- **Units**: <1K → "500"

## Endpoints

### 1. List Investments

**GET** `/api/investments/`

Get all investments for the authenticated user.

**Query Parameters:**
- `asset_type` (optional): Filter by asset type

**Example Request:**
```bash
curl -H "Authorization: Token your_token" \
     "http://localhost:8000/api/investments/?asset_type=stock"
```

**Example Response:**
```json
[
  {
    "id": 1,
    "symbol": "AAPL",
    "name": "Apple Inc.",
    "asset_type": "stock",
    "exchange": "NASDAQ",
    "currency": "USD",
    "quantity": "10.0000",
    "average_purchase_price": "150.0000",
    "current_price": "175.5000",
    "total_value": "1755.00",
    "daily_change": "2.5000",
    "daily_change_percent": "1.4450",
    "total_gain_loss": "255.00",
    "total_gain_loss_percent": "17.0000",
    "chart_data": [...],
    "last_updated": "2024-01-15T10:30:00Z",
    "ai_analysis": "Strong performance with 17% gains...",
    "risk_level": "medium",
    "recommendation": "hold",
    "logo_url": "https://logo.clearbit.com/apple.com",
    "sector": "Technology",
    "market_cap": "2800000000000.00",
    "dividend_yield": "0.5200",
    "pe_ratio": "28.50",
    "fifty_two_week_high": "185.0000",
    "fifty_two_week_low": "140.0000",
    "unit": null,
    "data_enriched": true,
    "enrichment_attempted": true,
    "enrichment_error": null,
    "created_at": "2024-01-10T09:00:00Z",
    "updated_at": "2024-01-15T10:30:00Z",
    "progress_percentage": 17.0,
    "display_unit": "shares",
    "asset_specific_fields": {
      "pe_ratio": "28.50",
      "fifty_two_week_high": "185.0000",
      "fifty_two_week_low": "140.0000",
      "market_cap": "2800000000000.00"
    }
  }
]
```

### 2. Create Investment

**POST** `/api/investments/`

Create a new investment.

**Request Body (Stock Example):**
```json
{
  "asset_type": "stock",
  "symbol": "AAPL",
  "name": "Apple Inc.",
  "exchange": "NASDAQ",
  "currency": "USD",
  "quantity": 10,
  "average_purchase_price": 150.00
}
```

**Request Body (Physical Asset Example):**
```json
{
  "asset_type": "gold",
  "name": "Gold Bars",
  "quantity": 100,
  "unit": "grams",
  "average_purchase_price": 60.00,
  "currency": "USD"
}
```

**Request Body (Cryptocurrency Example):**
```json
{
  "asset_type": "crypto",
  "symbol": "BTC",
  "name": "Bitcoin",
  "quantity": 0.5,
  "average_purchase_price": 50000.00,
  "currency": "USD"
}
```

**Response:** Returns the created investment object with auto-generated fields.

### 3. Update Investment

**PUT/PATCH** `/api/investments/{id}/`

Update an existing investment.

**Request Body:**
```json
{
  "quantity": 15,
  "average_purchase_price": 160.00,
  "unit": "grams"
}
```

### 4. Delete Investment

**DELETE** `/api/investments/{id}/`

Delete an investment.

### 5. Portfolio Summary

**GET** `/api/investments/portfolio_summary/`

Get comprehensive portfolio summary including all asset types.

**Example Response:**
```json
{
  "total_value": "25750.00",
  "total_gain_loss": "3250.00",
  "total_gain_loss_percent": "14.4444",
  "daily_change": "125.50",
  "daily_change_percent": "0.4900",
  "investment_count": 5,
  "top_performer": "AAPL",
  "worst_performer": "GOOGL",
  "asset_allocation": {
    "stock": {
      "count": 2,
      "total_value": "15000.00",
      "percentage": "58.25"
    },
    "crypto": {
      "count": 1,
      "total_value": "5500.00",
      "percentage": "21.36"
    },
    "gold": {
      "count": 1,
      "total_value": "5250.00",
      "percentage": "20.39"
    }
  },
  "diversification_score": 75,
  "risk_assessment": "medium"
}
```

### 6. Asset Suggestions

**GET** `/api/investments/asset_suggestions/`

Get asset suggestions for autocomplete functionality.

**Query Parameters:**
- `q` (required): Search query (minimum 2 characters)
- `type` (optional): Asset type filter

**Example Request:**
```bash
curl -H "Authorization: Token your_token" \
     "http://localhost:8000/api/investments/asset_suggestions/?q=apple&type=stock"
```

**Example Response:**
```json
[
  {
    "name": "Apple Inc.",
    "symbol": "AAPL",
    "type": "stock",
    "exchange": "NASDAQ",
    "country": "US",
    "current_price": 175.50,
    "currency": "USD"
  },
  {
    "name": "Apple Hospitality REIT Inc.",
    "symbol": "APLE",
    "type": "stock",
    "exchange": "NYSE",
    "country": "US"
  }
]
```

### 7. Refresh Prices

**POST** `/api/investments/refresh_prices/`

Refresh current prices for tradeable assets.

**Request Body (Optional):**
```json
{
  "asset_types": ["stock", "crypto"]
}
```

**Response:**
```json
{
  "message": "Updated 3 investments",
  "investments": [...]
}
```

### 8. Enrich Data

**POST** `/api/investments/{id}/enrich_data/`

Manually trigger data enrichment for a specific investment.

**Response:** Returns the updated investment object with enriched data.

### 9. Portfolio Insights

**GET** `/api/investments/portfolio_insights/`

Get detailed portfolio insights and recommendations.

**Example Response:**
```json
{
  "performance_insights": [
    "Good portfolio performance with solid gains across your holdings."
  ],
  "diversification_insights": [
    "Good diversification, but there's room for improvement in spreading risk.",
    "High concentration in stock (58.3%). Consider rebalancing."
  ],
  "risk_insights": [
    "Your portfolio has moderate risk exposure suitable for balanced growth."
  ],
  "recommendations": [
    "Consider adding bonds to improve diversification.",
    "Review GOOGL - significant losses may warrant attention."
  ]
}
```

### 10. Asset Type Performance

**GET** `/api/investments/asset_type_performance/`

Get performance breakdown by asset type.

**Example Response:**
```json
{
  "stock": {
    "count": 2,
    "total_value": "15000.00",
    "total_gain_loss": "2000.00",
    "total_gain_loss_percent": "15.38",
    "best_performer": {
      "id": 1,
      "symbol": "AAPL",
      "total_gain_loss_percent": "17.00"
    },
    "worst_performer": {
      "id": 2,
      "symbol": "GOOGL",
      "total_gain_loss_percent": "-5.00"
    }
  },
  "crypto": {
    "count": 1,
    "total_value": "5500.00",
    "total_gain_loss": "500.00",
    "total_gain_loss_percent": "10.00",
    "best_performer": {...},
    "worst_performer": {...}
  }
}
```

### 11. Asset Type Statistics

**GET** `/api/investments/asset_type_stats/`

Get statistics by asset type.

**Example Response:**
```json
[
  {
    "asset_type": "stock",
    "count": 2,
    "total_value": 15000.00,
    "total_gain_loss": 2000.00,
    "percentage_of_portfolio": 58.25
  },
  {
    "asset_type": "crypto",
    "count": 1,
    "total_value": 5500.00,
    "total_gain_loss": 500.00,
    "percentage_of_portfolio": 21.36
  }
]
```

### 12. Market Sentiment

**GET** `/api/investments/market_sentiment/`

Get market sentiment insights based on daily changes.

**Example Response:**
```json
{
  "insights": [
    "Market sentiment is positive for your portfolio today with more assets gaining than losing.",
    "Cryptocurrency holdings are showing strong momentum today.",
    "Your physical asset holdings provide portfolio stability during market volatility."
  ]
}
```

### 13. Diversification Analysis

**GET** `/api/investments/diversification_analysis/`

Get detailed diversification analysis.

**Example Response:**
```json
{
  "diversification_score": 75,
  "asset_allocation": {
    "stock": {
      "count": 2,
      "total_value": "15000.00",
      "percentage": "58.25"
    }
  },
  "risk_assessment": "medium",
  "recommendations": [
    "Consider adding bonds to improve diversification."
  ]
}
```

### 14. Bulk Refresh

**POST** `/api/investments/bulk_refresh/`

Trigger bulk refresh for user's assets in background.

**Request Body (Optional):**
```json
{
  "asset_types": ["stock", "etf", "crypto"]
}
```

**Response:**
```json
{
  "message": "Bulk refresh started in background",
  "status": "processing"
}
```

## Error Responses

The API uses standard HTTP status codes and returns detailed error information:

### 400 Bad Request
```json
{
  "error": "Validation failed",
  "message": "Symbol is required for tradeable assets",
  "field": "symbol",
  "code": "validation_error"
}
```

### 401 Unauthorized
```json
{
  "detail": "Authentication credentials were not provided."
}
```

### 404 Not Found
```json
{
  "detail": "Not found."
}
```

### 429 Too Many Requests
```json
{
  "error": "Rate limit exceeded",
  "message": "Too many API requests",
  "code": "rate_limit_error"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error",
  "message": "An unexpected error occurred",
  "code": "internal_error"
}
```

### 503 Service Unavailable
```json
{
  "error": "External data service unavailable",
  "message": "Perplexity API is currently unavailable",
  "code": "api_error"
}
```

## Data Enrichment

The API automatically enriches asset data using external services:

### For Stocks/ETFs:
- Current price
- Market capitalization
- P/E ratio
- 52-week high/low
- Dividend yield
- Sector information
- Company name

### For Cryptocurrencies:
- Current price
- Market capitalization
- 24-hour change
- All-time high/low

### For Precious Metals:
- Current spot prices
- Daily change percentage
- Market analysis

### For Bonds:
- Current yield
- Credit rating
- Maturity information

## Rate Limiting

The API implements rate limiting for external data services:
- 50 requests per minute for Perplexity API calls
- Automatic retry with exponential backoff
- Graceful degradation when limits are reached

## Caching

The API uses intelligent caching to improve performance:
- Portfolio summaries cached for 5 minutes
- Asset suggestions cached for 1 hour
- Market data cached for 1 minute
- Cache automatically invalidated when data changes

## Background Tasks

Several operations run in the background:
- Daily price updates for all tradeable assets
- Data enrichment for newly created investments
- Precious metals price updates every 6 hours

## Best Practices

1. **Asset Creation**: Always provide accurate asset_type to ensure proper validation
2. **Batch Operations**: Use bulk_refresh for updating multiple assets
3. **Error Handling**: Implement proper error handling for all API calls
4. **Caching**: Leverage cached endpoints for frequently accessed data
5. **Rate Limiting**: Respect rate limits and implement retry logic

## Examples

### Complete Portfolio Management Flow

```javascript
// 1. Create a stock investment
const stockData = {
  asset_type: 'stock',
  symbol: 'AAPL',
  name: 'Apple Inc.',
  quantity: 10,
  average_purchase_price: 150.00
};

const response = await fetch('/api/investments/', {
  method: 'POST',
  headers: {
    'Authorization': 'Token your_token',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(stockData)
});

// 2. Get portfolio summary
const summary = await fetch('/api/investments/portfolio_summary/', {
  headers: { 'Authorization': 'Token your_token' }
});

// 3. Get insights and recommendations
const insights = await fetch('/api/investments/portfolio_insights/', {
  headers: { 'Authorization': 'Token your_token' }
});

// 4. Refresh prices
await fetch('/api/investments/refresh_prices/', {
  method: 'POST',
  headers: {
    'Authorization': 'Token your_token',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ asset_types: ['stock', 'crypto'] })
});
```

### Asset Search and Selection

```javascript
// Search for assets
const searchResults = await fetch(
  '/api/investments/asset_suggestions/?q=apple&type=stock',
  { headers: { 'Authorization': 'Token your_token' } }
);

// Create investment from search result
const selectedAsset = searchResults[0];
const investmentData = {
  asset_type: selectedAsset.type,
  symbol: selectedAsset.symbol,
  name: selectedAsset.name,
  quantity: 10,
  average_purchase_price: selectedAsset.current_price || 150.00
};
```

## Troubleshooting

### Common Issues

1. **Symbol not found**: Ensure the symbol is valid and properly formatted
2. **Data enrichment fails**: Check if the external API service is available
3. **Rate limit exceeded**: Implement exponential backoff retry logic
4. **Validation errors**: Verify all required fields are provided for the asset type

### Support

For additional support or questions about the API, please refer to the test suite in `tests.py` for comprehensive examples of API usage.

## BharatSM Integration

### Data Fields

The API now provides the following enhanced data fields using BharatSM (MoneyControl):

#### Frontend Display Fields
- **volume**: Trading volume formatted as string (e.g., "1.2M", "500K")
- **market_cap**: Market capitalization as number
- **pe_ratio**: Price-to-earnings ratio as number
- **growth_rate**: Revenue growth rate as percentage (replaces dividend_yield)

#### Data Sources
1. **Primary**: BharatSM MoneyControl API for Indian stocks
2. **Fallback**: Perplexity API for non-Indian stocks or when BharatSM fails
3. **Technical Data**: NSE/BSE data for price information

### Example Enhanced Response

```json
{
  "id": 1,
  "symbol": "TCS",
  "name": "Tata Consultancy Services",
  "asset_type": "stock",
  "exchange": "NSE",
  "currency": "INR",
  "quantity": "10.0000",
  "average_purchase_price": "3500.0000",
  "current_price": "3650.0000",
  "total_value": "36500.00",
  "volume": "2.5M",
  "market_cap": 1320000000000.0,
  "pe_ratio": 28.5,
  "growth_rate": 15.2,
  "sector": "IT - Software",
  "data_enriched": true,
  "enrichment_attempted": true,
  "enrichment_error": null
}
```

### Data Enrichment Process

1. **Asset Creation**: Basic info fetched immediately using BharatSM
2. **Background Enrichment**: Detailed data fetched asynchronously
3. **Daily Updates**: All data refreshed daily using BharatSM
4. **Fallback Handling**: Perplexity API used when BharatSM fails

### Error Handling

The API includes comprehensive error handling for BharatSM integration:

#### BharatSM Errors
```json
{
  "error": "BharatSM data service error",
  "message": "Failed to fetch data for SYMBOL",
  "code": "bharatsm_error"
}
```

#### Fallback Scenarios
- BharatSM API unavailable → Perplexity API
- Invalid symbol → Empty data with graceful handling
- Network errors → Cached data or default values

### Performance Optimizations

- **Caching**: Portfolio summaries cached for 5 minutes
- **Database Indexes**: Optimized queries for user + asset_type
- **Bulk Operations**: Efficient batch updates for price data
- **Query Optimization**: select_related and prefetch_related used

### Troubleshooting

#### Common Issues

1. **BharatSM Service Unavailable**
   - Check if Fundamentals library is installed: `pip install Fundamentals`
   - Verify MoneyControl API is accessible

2. **Volume Data Shows "N/A"**
   - BharatSM volume data may not be available for all stocks
   - System will show "N/A" gracefully

3. **Growth Rate Missing**
   - Requires quarterly financial data from MoneyControl
   - May not be available for all companies

4. **Slow API Responses**
   - BharatSM calls can be slow for complex financial data
   - Background tasks handle heavy lifting
   - Cached data used when available

#### Testing BharatSM Integration

Run the comprehensive test suite:

```bash
cd c8v2
python test_bharatsm_comprehensive.py
```

This will test:
- BharatSM service availability
- Frontend data fetching
- Data enrichment integration
- Error handling
- Volume formatting

#### Monitoring

Check enrichment status:
```bash
# Check investments that need enrichment
python manage.py shell
>>> from investments.models import Investment
>>> Investment.objects.filter(data_enriched=False).count()

# Check enrichment errors
>>> Investment.objects.exclude(enrichment_error__isnull=True).values('enrichment_error')
```