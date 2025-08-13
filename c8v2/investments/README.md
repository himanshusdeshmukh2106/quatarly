# Investments API Documentation

## Overview

The Investments API provides comprehensive portfolio management functionality with real-time price updates, AI-powered insights, and interactive chart data.

## Models

### Investment
- **User Portfolio Management**: Track multiple investments per user
- **Real-time Pricing**: Current prices with daily change calculations
- **Performance Metrics**: Total P&L, percentage gains/losses
- **AI Analysis**: Automated investment recommendations and risk assessment
- **Chart Data**: Historical price data for interactive charts

### ChartData
- **Historical Data**: OHLCV (Open, High, Low, Close, Volume) data
- **Multiple Timeframes**: Daily, weekly, monthly views
- **Real-time Updates**: Automatic data refresh

### PriceAlert
- **Custom Alerts**: Price above/below thresholds
- **Percentage Alerts**: Trigger on percentage changes
- **Automatic Notifications**: Background monitoring

## API Endpoints

### Investments

#### List/Create Investments
```
GET /api/investments/
POST /api/investments/
```

**POST Request Body:**
```json
{
    "symbol": "AAPL",
    "quantity": 10,
    "purchase_price": 150.00,
    "purchase_date": "2024-01-15"
}
```

#### Investment Details
```
GET /api/investments/{id}/
PUT /api/investments/{id}/
PATCH /api/investments/{id}/
DELETE /api/investments/{id}/
```

#### Refresh Prices
```
POST /api/investments/refresh_prices/
```
Updates all investment prices for the authenticated user.

#### Chart Data
```
GET /api/investments/{id}/chart_data/?timeframe=daily
```
**Parameters:**
- `timeframe`: daily, weekly, monthly

#### Real-time Prices
```
POST /api/investments/real_time_prices/
```
**Request Body:**
```json
{
    "symbols": ["AAPL", "GOOGL", "MSFT"]
}
```

#### Portfolio Summary
```
GET /api/investments/portfolio_summary/
```
**Response:**
```json
{
    "total_value": "25000.00",
    "total_gain_loss": "2500.00",
    "total_gain_loss_percent": "11.11",
    "daily_change": "150.00",
    "daily_change_percent": "0.60",
    "investment_count": 5,
    "top_performer": "AAPL",
    "worst_performer": "XYZ"
}
```

#### AI Insights
```
GET /api/investments/ai_insights/
```
Returns AI-generated portfolio insights and recommendations.

### Price Alerts

#### List/Create Alerts
```
GET /api/price-alerts/
POST /api/price-alerts/
```

**POST Request Body:**
```json
{
    "investment": 1,
    "alert_type": "above",
    "target_value": "200.00"
}
```

#### Check Alerts
```
POST /api/price-alerts/check_alerts/
```
Manually trigger alert checking (normally done automatically).

## Services

### MarketDataService
- **Real-time Pricing**: Integration with Yahoo Finance API
- **Company Information**: Fetch company details, sector, market cap
- **Historical Data**: Retrieve OHLCV data for charts
- **Daily Change Calculations**: Automatic price change calculations

### InvestmentService
- **Price Refresh**: Bulk price updates for all investments
- **Chart Data Management**: Update and maintain historical data
- **AI Analysis Generation**: Automated investment analysis
- **Portfolio Calculations**: Summary statistics and performance metrics

### AIInsightsService
- **Portfolio Analysis**: Overall portfolio performance insights
- **Risk Assessment**: Automated risk level evaluation
- **Recommendations**: Buy/hold/sell recommendations
- **Diversification Analysis**: Sector and asset allocation insights

## Background Tasks (Celery)

### Scheduled Tasks
- **Market Hours Refresh**: Every 30 seconds during market hours
- **After Hours Refresh**: Every 5 minutes after market close
- **Daily Maintenance**: Complete data refresh and AI analysis
- **Price Alert Monitoring**: Continuous alert checking

### Manual Tasks
- `refresh_all_investment_prices`: Update all investment prices
- `refresh_user_investment_prices(user_id)`: Update specific user's investments
- `update_chart_data_for_all_investments`: Refresh all chart data
- `generate_ai_analysis_for_all_investments`: Regenerate AI analysis
- `check_price_alerts`: Check and trigger price alerts

## Management Commands

### Refresh Prices
```bash
python manage.py refresh_prices
python manage.py refresh_prices --user-id 1
```

## Installation & Setup

### 1. Install Dependencies
```bash
pip install -r requirements_investments.txt
```

### 2. Run Migrations
```bash
python manage.py makemigrations investments
python manage.py migrate
```

### 3. Setup Celery (Optional)
```bash
# Install Redis
pip install redis

# Start Celery Worker
celery -A C8V2 worker --loglevel=info

# Start Celery Beat (for scheduled tasks)
celery -A C8V2 beat --loglevel=info
```

### 4. Configure Settings
Add to `settings.py`:
```python
# Celery Configuration
CELERY_BROKER_URL = 'redis://localhost:6379/0'
CELERY_RESULT_BACKEND = 'redis://localhost:6379/0'

# Logging
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'file': {
            'level': 'INFO',
            'class': 'logging.FileHandler',
            'filename': 'investments.log',
        },
    },
    'loggers': {
        'investments': {
            'handlers': ['file'],
            'level': 'INFO',
            'propagate': True,
        },
    },
}
```

## Usage Examples

### Frontend Integration
The API is designed to work seamlessly with the React Native frontend:

```typescript
// Fetch investments
const investments = await fetchInvestments();

// Create new investment
const newInvestment = await createInvestment({
    symbol: 'AAPL',
    quantity: 10,
    purchase_price: 150.00
});

// Refresh prices
const updatedInvestments = await refreshInvestmentPrices();

// Get chart data
const chartData = await fetchChartData('AAPL', 'daily');
```

### Real-time Updates
The system supports multiple refresh intervals:
- **Market Hours**: 30-second updates
- **After Hours**: 5-minute updates  
- **Market Closed**: 15-minute updates

### AI Features
- **Automated Analysis**: Generated on investment creation/update
- **Risk Assessment**: Low/Medium/High risk categorization
- **Recommendations**: Buy/Hold/Sell suggestions
- **Portfolio Insights**: Diversification and performance analysis

## Error Handling

All endpoints include comprehensive error handling:
- **400 Bad Request**: Invalid input data
- **401 Unauthorized**: Authentication required
- **404 Not Found**: Investment not found
- **500 Internal Server Error**: Server-side errors

## Security

- **Authentication Required**: All endpoints require valid authentication
- **User Isolation**: Users can only access their own investments
- **Input Validation**: All inputs are validated and sanitized
- **Rate Limiting**: API calls are rate-limited to prevent abuse

## Testing

Run the test suite:
```bash
python manage.py test investments
```

The test suite includes:
- Model tests for calculations and validations
- API endpoint tests for all CRUD operations
- Service tests for business logic
- Integration tests for external API calls