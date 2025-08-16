# BHARAT SM Data Integration Optimization Design

## Overview

This design document outlines the optimization of the BHARAT SM data integration system to address current inefficiencies, improve data accuracy, and ensure reliable operation with proper fallback mechanisms.

## Architecture

### Current Issues Identified

1. **Missing Libraries**: `Fundamentals` and `Technical` libraries not installed
2. **Inefficient Data Processing**: Multiple API calls for single data points
3. **Poor Error Handling**: JSON parsing failures not handled gracefully
4. **Suboptimal Caching**: No intelligent caching based on market hours
5. **Data Validation Gaps**: No validation of extracted financial data
6. **Volume Data Issues**: Inefficient volume fetching from charting API

### Optimized Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    BHARAT SM Service Layer                  │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │   Library       │  │   Data Cache    │  │  Validator  │ │
│  │   Manager       │  │   Manager       │  │  Service    │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │  MoneyControl   │  │   NSE/BSE       │  │  Fallback   │ │
│  │   API Client    │  │   API Client    │  │  Handler    │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │   Batch         │  │   Connection    │  │   Error     │ │
│  │   Processor     │  │   Pool          │  │   Handler   │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. Library Manager

**Purpose**: Ensure proper library installation and availability checking

```python
class LibraryManager:
    @staticmethod
    def check_installation() -> Dict[str, bool]
    @staticmethod
    def install_missing_libraries() -> bool
    @staticmethod
    def get_installation_instructions() -> List[str]
```

**Key Features**:
- Automatic library detection
- Installation guidance
- Version compatibility checking
- Graceful degradation when libraries unavailable

### 2. Optimized BharatSM Service

**Purpose**: Efficient data fetching with proper error handling

```python
class OptimizedBharatSMService:
    def __init__(self):
        self.mc = MoneyControl()
        self.nse = NSE()
        self.cache_manager = CacheManager()
        self.validator = DataValidator()
    
    def get_bulk_stock_data(self, symbols: List[str]) -> Dict[str, Dict]
    def get_optimized_frontend_data(self, symbol: str) -> Dict
    def get_cached_or_fresh_data(self, symbol: str, data_type: str) -> Any
```

**Optimizations**:
- Batch processing for multiple symbols
- Intelligent caching based on market hours
- Connection pooling for API calls
- Efficient pandas operations

### 3. Data Cache Manager

**Purpose**: Intelligent caching with market-aware expiration

```python
class CacheManager:
    def __init__(self):
        self.market_hours = MarketHours()
        self.cache_store = {}
    
    def get_cache_duration(self, data_type: str) -> int
    def is_market_open(self) -> bool
    def should_refresh_cache(self, key: str, data_type: str) -> bool
```

**Cache Strategy**:
- Market hours: 1-minute cache for prices, 5-minute for ratios
- Market closed: 1-hour cache for all data
- Weekends: 4-hour cache
- Error scenarios: 30-second cache for retries

### 4. Data Validator

**Purpose**: Validate extracted financial data for accuracy

```python
class DataValidator:
    @staticmethod
    def validate_price(price: float, symbol: str) -> bool
    @staticmethod
    def validate_pe_ratio(pe: float) -> bool
    @staticmethod
    def validate_market_cap(market_cap: float) -> bool
    @staticmethod
    def validate_volume(volume: str) -> bool
```

**Validation Rules**:
- Price: > 0 and < 100,000 (reasonable range for Indian stocks)
- P/E Ratio: -100 to 1000 (handle negative earnings)
- Market Cap: > 1 crore and < 50 lakh crore
- Volume: Proper format (K, L, Cr) and reasonable values

### 5. Efficient Data Extraction

**Purpose**: Optimized pandas operations for data extraction

```python
class DataExtractor:
    @staticmethod
    def extract_financial_ratios(df: pd.DataFrame) -> Dict[str, float]
    @staticmethod
    def extract_quarterly_growth(df: pd.DataFrame) -> float
    @staticmethod
    def extract_market_metrics(df: pd.DataFrame) -> Dict[str, Any]
```

**Optimizations**:
- Use vectorized pandas operations
- Pre-compile regex patterns
- Cache column mappings
- Minimize dataframe iterations

## Data Models

### Enhanced Stock Data Model

```python
@dataclass
class StockData:
    symbol: str
    company_name: str
    current_price: Optional[float]
    volume: Optional[str]
    market_cap: Optional[float]
    pe_ratio: Optional[float]
    growth_rate: Optional[float]
    sector: Optional[str]
    exchange: str
    last_updated: datetime
    data_source: str  # 'bharatsm' or 'fallback'
    validation_status: bool
```

### Cache Entry Model

```python
@dataclass
class CacheEntry:
    key: str
    data: Any
    created_at: datetime
    expires_at: datetime
    data_type: str
    market_session: str  # 'open', 'closed', 'weekend'
```

## Error Handling

### Graceful Degradation Strategy

1. **Library Missing**: Use Perplexity API fallback
2. **API Timeout**: Retry with exponential backoff (1s, 2s, 4s)
3. **Invalid Response**: Log error, return cached data if available
4. **Rate Limit**: Queue request for later processing
5. **Data Parsing Error**: Skip problematic fields, continue with available data

### Error Recovery Mechanisms

```python
class ErrorHandler:
    def handle_api_error(self, error: Exception, symbol: str) -> Dict
    def handle_parsing_error(self, error: Exception, raw_data: str) -> Dict
    def handle_network_error(self, error: Exception) -> bool
```

## Testing Strategy

### Unit Tests

1. **Library Manager Tests**
   - Test library detection
   - Test installation guidance
   - Test graceful degradation

2. **Data Extraction Tests**
   - Test pandas operations efficiency
   - Test data validation accuracy
   - Test edge case handling

3. **Cache Manager Tests**
   - Test cache expiration logic
   - Test market hours detection
   - Test cache hit/miss scenarios

### Integration Tests

1. **Real Data Validation Tests**
   - Test with known stock symbols (TCS, RELIANCE, INFY)
   - Validate price ranges against market expectations
   - Verify volume formatting accuracy
   - Check P/E ratio reasonableness

2. **Performance Tests**
   - Measure API response times
   - Test concurrent request handling
   - Validate cache effectiveness
   - Monitor memory usage

3. **Error Scenario Tests**
   - Test network failures
   - Test invalid symbols
   - Test malformed API responses
   - Test rate limiting scenarios

### Data Accuracy Tests

```python
class DataAccuracyTests:
    def test_known_stock_prices(self):
        # Test against known price ranges for major stocks
        
    def test_volume_formatting(self):
        # Verify Indian number formatting (1.2Cr, 5.5L, etc.)
        
    def test_pe_ratio_accuracy(self):
        # Compare against reliable financial data sources
        
    def test_growth_calculation(self):
        # Verify mathematical accuracy of growth rate calculations
```

## Performance Optimizations

### 1. Batch Processing

```python
def get_bulk_stock_data(self, symbols: List[str]) -> Dict[str, Dict]:
    """Process multiple symbols in batches to reduce API calls"""
    batch_size = 10
    results = {}
    
    for i in range(0, len(symbols), batch_size):
        batch = symbols[i:i + batch_size]
        batch_results = self._process_symbol_batch(batch)
        results.update(batch_results)
    
    return results
```

### 2. Connection Pooling

```python
class APIClient:
    def __init__(self):
        self.session = requests.Session()
        adapter = HTTPAdapter(
            pool_connections=10,
            pool_maxsize=20,
            max_retries=3
        )
        self.session.mount('http://', adapter)
        self.session.mount('https://', adapter)
```

### 3. Efficient Data Processing

```python
def extract_ratios_optimized(self, df: pd.DataFrame) -> Dict[str, float]:
    """Use vectorized operations for data extraction"""
    # Pre-compile regex patterns
    pe_pattern = re.compile(r'P/E.*\(x\)', re.IGNORECASE)
    
    # Use boolean indexing instead of iterrows()
    pe_mask = df['ratios'].str.contains(pe_pattern, na=False)
    pe_rows = df[pe_mask]
    
    if not pe_rows.empty:
        pe_value = pe_rows.iloc[0, 1]
        return self._parse_numeric_value(pe_value)
    
    return None
```

## Implementation Plan

### Phase 1: Library Installation and Setup
1. Create library installation script
2. Update requirements.txt with proper versions
3. Add library availability checks
4. Implement graceful degradation

### Phase 2: Core Service Optimization
1. Refactor BharatSMService for efficiency
2. Implement batch processing
3. Add intelligent caching
4. Optimize data extraction methods

### Phase 3: Data Validation and Quality
1. Implement data validation service
2. Add financial data reasonableness checks
3. Improve error handling and logging
4. Add data freshness indicators

### Phase 4: Testing and Monitoring
1. Create comprehensive test suite
2. Add real data validation tests
3. Implement performance monitoring
4. Add data accuracy benchmarks

This design ensures the BHARAT SM integration is efficient, reliable, and provides accurate Indian stock market data with proper fallback mechanisms.