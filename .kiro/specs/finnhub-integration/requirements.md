# Requirements Document

## Introduction

This feature implements Finnhub API integration as the primary data source for US stocks in the Bharat SM data fetching system. The implementation will use Finnhub's free tier endpoints for US stocks while maintaining FMP as a fallback for data not available in Finnhub's free tier, and keeping the existing BharatSM service for Indian stocks.

## Requirements

### Requirement 1

**User Story:** As a user, I want the system to fetch US stock data from Finnhub API as the primary source, so that I get accurate and reliable market data for US equities.

#### Acceptance Criteria

1. WHEN a US stock symbol is detected THEN the system SHALL use Finnhub API as the primary data source
2. WHEN Finnhub API is available THEN the system SHALL fetch data from Finnhub free tier endpoints
3. WHEN Finnhub API returns valid data THEN the system SHALL format and return the data to the frontend
4. IF Finnhub API fails or returns incomplete data THEN the system SHALL fallback to FMP API

### Requirement 2

**User Story:** As a user, I want the system to fetch comprehensive stock data including price, volume, P/E ratio, and market cap from Finnhub, so that I have all necessary information for investment decisions.

#### Acceptance Criteria

1. WHEN fetching US stock data THEN the system SHALL retrieve current price from Finnhub quote endpoint
2. WHEN fetching US stock data THEN the system SHALL retrieve volume from Finnhub quote endpoint
3. WHEN fetching US stock data THEN the system SHALL retrieve P/E ratio from Finnhub basic financials endpoint
4. WHEN fetching US stock data THEN the system SHALL retrieve market capitalization from Finnhub company profile endpoint
5. WHEN fetching US stock data THEN the system SHALL retrieve company name and sector information

### Requirement 3

**User Story:** As a user, I want the system to maintain existing functionality for Indian stocks and crypto, so that the integration doesn't break current features.

#### Acceptance Criteria

1. WHEN an Indian stock symbol is detected THEN the system SHALL continue using BharatSM service as primary source
2. WHEN a cryptocurrency symbol is detected THEN the system SHALL continue using FMP API
3. WHEN the asset type cannot be determined THEN the system SHALL use appropriate fallback logic
4. WHEN Finnhub integration is added THEN existing Indian stock and crypto functionality SHALL remain unchanged

### Requirement 4

**User Story:** As a user, I want the system to handle API failures gracefully with proper fallback mechanisms, so that I always get data even if one service is down.

#### Acceptance Criteria

1. WHEN Finnhub API is unavailable THEN the system SHALL fallback to FMP API for US stocks
2. WHEN both Finnhub and FMP APIs fail THEN the system SHALL return empty data with proper error logging
3. WHEN API rate limits are exceeded THEN the system SHALL implement appropriate retry logic
4. WHEN network timeouts occur THEN the system SHALL handle them gracefully without crashing

### Requirement 5

**User Story:** As a developer, I want the Finnhub API key to be configurable through environment variables, so that the system can be deployed with proper API credentials.

#### Acceptance Criteria

1. WHEN the system starts THEN it SHALL check for FINNHUB_API_KEY environment variable
2. WHEN FINNHUB_API_KEY is not configured THEN the system SHALL log a warning and disable Finnhub service
3. WHEN FINNHUB_API_KEY is configured THEN the system SHALL use it for all Finnhub API requests
4. WHEN API key is invalid THEN the system SHALL handle authentication errors gracefully

### Requirement 6

**User Story:** As a user, I want the system to format volume data consistently across all data sources using Indian conventions, so that the display is uniform and familiar to Indian users regardless of the data provider.

#### Acceptance Criteria

1. WHEN volume data is retrieved from Finnhub THEN it SHALL be formatted in Indian conventions (Cr, L, K)
2. WHEN volume data is retrieved from any source THEN it SHALL follow consistent Indian formatting rules
3. WHEN volume is greater than 1 crore (10 million) THEN it SHALL be displayed as "X.XCr"
4. WHEN volume is greater than 1 lakh (100 thousand) THEN it SHALL be displayed as "X.XL"
5. WHEN volume is greater than 1 thousand THEN it SHALL be displayed as "X.XK"
6. WHEN volume is less than 1 thousand THEN it SHALL be displayed as the actual number

### Requirement 7

**User Story:** As a developer, I want the system to activate the virtual environment before any file operations or installations, so that dependencies are managed properly and don't affect the system Python environment.

#### Acceptance Criteria

1. WHEN installing Python packages THEN the system SHALL activate the virtual environment first
2. WHEN running Python scripts THEN the system SHALL ensure virtual environment is active
3. WHEN downloading or processing files THEN the system SHALL use the virtual environment context
4. WHEN the virtual environment is not found THEN the system SHALL provide clear instructions to create it