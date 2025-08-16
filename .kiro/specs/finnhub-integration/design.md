# Design Document

## Overview

This design implements Finnhub API integration as the primary data source for US stocks within the existing Bharat SM data fetching architecture. The solution maintains the current multi-tier fallback system while replacing FMP as the primary US stock data provider with Finnhub's free tier endpoints.

## Architecture

### Current Architecture Enhancement

The existing `FinalOptimizedBharatSMService` will be enhanced to include a new `FinnhubAPIService` class that sits between the asset type detection and the current FMP fallback. The routing logic will be:

```
Asset Type Detection → Route Selection → Primary Service → Fallback Service
     ↓                      ↓               ↓              ↓
Indian Stock → BharatSM → Perplexity → FMP (final fallback)
US Stock → Finnhub → FMP → Perplexity (final fallback)  
Crypto → FMP → Perplexity (fallback)
```

### Service Integration Points

1. **FinnhubAPIService**: New service class for Finnhub API interactions
2. **Enhanced Asset Type Detection**: Improved logic to better identify US stocks
3. **Unified Volume Formatting**: Consistent Indian formatting across all services
4. **Environment Configuration**: Finnhub API key management

## Components and Interfaces

### FinnhubAPIService Class

```python
class FinnhubAPIService:
    """
    Finnhub API service for US stock data using free tier endpoints
    """
    
    BASE_URL = "https://finnhub.io/api/v1"
    
    @classmethod
    def get_api_key(cls) -> Optional[str]
    
    @classmethod
    def is_available(cls) -> bool
    
    @classmethod
    def get_stock_data(cls, symbol: str) -> Dict
    
    @classmethod
    def get_company_profile(cls, symbol: str) -> Dict
    
    @classmethod
    def get_basic_financials(cls, symbol: str) -> Dict
    
    @classmethod
    def get_quote_data(cls, symbol: str) -> Dict
    
    @classmethod
    def search_symbol(cls, symbol: str) -> List[Dict]
    
    @classmethod
    def _format_volume_indian(cls, volume: float) -> str
```

### Enhanced FinalOptimizedBharatSMService

The main service class will be updated with:

```python
class FinalOptimizedBharatSMService:
    def __init__(self):
        # Existing initialization
        self.finnhub_service = FinnhubAPIService()
    
    def _get_us_stock_data(self, symbol: str) -> Dict:
        """Enhanced US stock data with Finnhub primary, FMP fallback"""
        
    def _determine_asset_type(self, symbol: str) -> str:
        """Enhanced asset type detection"""
        
    def _format_volume_indian_standard(self, volume: float) -> str:
        """Unified Indian volume formatting"""
```

## Data Models

### Finnhub API Response Mapping

#### Quote Endpoint Response
```json
{
  "c": 150.25,    // Current price
  "d": 2.15,      // Change
  "dp": 1.45,     // Percent change
  "h": 152.00,    // High
  "l": 148.50,    // Low
  "o": 149.00,    // Open
  "pc": 148.10,   // Previous close
  "t": 1642678800 // Timestamp
}
```

#### Company Profile 2 Response
```json
{
  "country": "US",
  "currency": "USD",
  "exchange": "NASDAQ",
  "finnhubIndustry": "Technology",
  "ipo": "1980-12-12",
  "marketCapitalization": 2500000,
  "name": "Apple Inc",
  "shareOutstanding": 16.32,
  "ticker": "AAPL",
  "weburl": "https://www.apple.com/"
}
```

#### Basic Financials Response
```json
{
  "metric": {
    "peBasicExclExtraTTM": 25.5,
    "peNormalizedAnnual": 24.8,
    "52WeekHigh": 182.94,
    "52WeekLow": 124.17
  },
  "series": {},
  "symbol": "AAPL"
}
```

### Unified Data Model

All services will return data in this standardized format:

```python
{
    'volume': str,              # "2.5Cr", "1.2L", "850K" (Indian format)
    'market_cap': float,        # Actual market cap value
    'pe_ratio': float,          # P/E ratio (can be None)
    'growth_rate': float,       # Growth rate percentage (can be None)
    'company_name': str,        # Company name
    'sector': str,              # Sector/Industry
    'current_price': float,     # Current stock price
    'exchange': str,            # Exchange name
    'currency': str             # Currency (USD, INR, etc.)
}
```

## Error Handling

### Finnhub API Error Scenarios

1. **API Key Missing/Invalid**
   - Log warning and disable Finnhub service
   - Fallback to FMP immediately

2. **Rate Limit Exceeded**
   - Implement exponential backoff
   - Fallback to FMP after 3 retries

3. **Network Timeouts**
   - 10-second timeout for all requests
   - Retry once, then fallback

4. **Invalid Symbol**
   - Return empty dict
   - Log debug message

5. **Malformed Response**
   - Parse safely with try-catch
   - Fallback to FMP if parsing fails

### Fallback Chain Implementation

```python
def _get_us_stock_data(self, symbol: str) -> Dict:
    # Try Finnhub first
    if self.finnhub_service.is_available():
        result = self.finnhub_service.get_stock_data(symbol)
        if self._is_valid_result(result):
            return result
    
    # Fallback to FMP
    if self.fmp_service.is_available():
        result = self.fmp_service.get_stock_data(symbol)
        if self._is_valid_result(result):
            return result
    
    # Final fallback to Perplexity
    if self.perplexity_service.is_available():
        result = self._get_us_stock_data_perplexity(symbol)
        return result
    
    return {}
```

## Testing Strategy

### Unit Tests

1. **FinnhubAPIService Tests**
   - Test each endpoint method
   - Mock API responses
   - Test error handling scenarios
   - Test volume formatting

2. **Integration Tests**
   - Test fallback mechanisms
   - Test asset type detection
   - Test end-to-end data flow

3. **Volume Formatting Tests**
   - Test Indian number formatting
   - Test edge cases (zero, negative, very large numbers)
   - Test consistency across services

### Test Data

```python
FINNHUB_TEST_SYMBOLS = [
    'AAPL',    # Large cap tech
    'TSLA',    # High volatility
    'BRK.A',   # High price stock
    'PENNY',   # Penny stock (if available)
]

VOLUME_TEST_CASES = [
    (150000000, "15.0Cr"),
    (2500000, "25.0L"),
    (75000, "75.0K"),
    (500, "500")
]
```

### Performance Tests

1. **Response Time Benchmarks**
   - Finnhub API: < 2 seconds
   - Fallback chain: < 5 seconds total
   - Cache hit: < 100ms

2. **Rate Limit Testing**
   - Test free tier limits
   - Verify fallback activation
   - Test recovery after rate limit reset

## Implementation Phases

### Phase 1: Core Finnhub Service
- Implement FinnhubAPIService class
- Add environment variable configuration
- Implement basic endpoints (quote, profile, financials)
- Add unit tests

### Phase 2: Integration and Routing
- Enhance asset type detection
- Integrate Finnhub into main service
- Implement fallback logic
- Add integration tests

### Phase 3: Volume Formatting Standardization
- Implement unified Indian volume formatting
- Update all services to use consistent formatting
- Update frontend display logic
- Add formatting tests

### Phase 4: Error Handling and Optimization
- Implement comprehensive error handling
- Add retry logic and rate limiting
- Optimize caching strategies
- Performance testing and optimization

## Configuration Management

### Environment Variables

```bash
# Required for Finnhub integration
FINNHUB_API_KEY=your_finnhub_api_key_here

# Existing variables (maintained)
FMP_API_KEY=existing_fmp_key
PERPLEXITY_API_KEY=existing_perplexity_key
```

### Django Settings Integration

```python
# settings.py additions
FINNHUB_API_KEY = os.getenv('FINNHUB_API_KEY')

# Logging configuration for Finnhub
LOGGING = {
    'loggers': {
        'investments.finnhub_service': {
            'handlers': ['file'],
            'level': 'INFO',
            'propagate': True,
        },
    }
}
```

## Security Considerations

1. **API Key Protection**
   - Store in environment variables only
   - Never log API keys
   - Validate key format before use

2. **Request Validation**
   - Sanitize symbol inputs
   - Validate response data types
   - Implement request timeouts

3. **Rate Limiting**
   - Respect Finnhub free tier limits
   - Implement client-side rate limiting
   - Monitor usage patterns

## Monitoring and Logging

### Key Metrics to Track

1. **Service Availability**
   - Finnhub API success rate
   - Fallback activation frequency
   - Response times per service

2. **Data Quality**
   - Percentage of complete data responses
   - Volume formatting accuracy
   - P/E ratio availability

3. **Error Patterns**
   - Most common error types
   - Symbol-specific failures
   - Time-based error patterns

### Logging Strategy

```python
# Success logging
logger.info(f"Successfully fetched {symbol} data from Finnhub")

# Fallback logging
logger.warning(f"Finnhub failed for {symbol}, falling back to FMP")

# Error logging
logger.error(f"All services failed for {symbol}: {error_details}")
```

This design ensures seamless integration of Finnhub API while maintaining system reliability through robust fallback mechanisms and consistent data formatting.