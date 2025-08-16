# Requirements Document

## Introduction

The asset backend enhancement will expand the existing Django investment backend to support comprehensive asset management including both traditional investments and physical assets. Users will be able to manually add various asset types (stocks, bonds, crypto, gold, silver, real estate, etc.), store them in the database, and automatically fetch missing data like current prices, PE ratios, and market information using the Perplexity API. The system will provide RESTful APIs for the frontend to display assets in cards with real-time data.

## Requirements

### Requirement 1

**User Story:** As a user, I want to manually add different types of assets to my portfolio, so that I can track all my investments and physical assets in one place.

#### Acceptance Criteria

1. WHEN the user submits an asset creation request THEN the system SHALL accept assets of type stock, ETF, bond, crypto, gold, silver, real estate, commodity, or other
2. WHEN creating a stock asset THEN the system SHALL require symbol, quantity, and purchase price as minimum fields
3. WHEN creating a physical asset (gold, silver) THEN the system SHALL require name, quantity, unit, and purchase price
4. WHEN creating real estate THEN the system SHALL require property name, location, purchase price, and current estimated value
5. WHEN creating crypto THEN the system SHALL require symbol, quantity, and purchase price
6. WHEN asset data is saved THEN the system SHALL store it in the appropriate database table with user association
7. WHEN required fields are missing THEN the system SHALL return validation errors with specific field requirements

### Requirement 2

**User Story:** As a user, I want the system to automatically fetch the exact data displayed on the frontend using the Bharat SM library, so that I get accurate volume, market cap, P/E ratio, and growth rate data for my assets.

#### Acceptance Criteria

1. WHEN a stock or ETF is added THEN the system SHALL fetch volume, market cap, P/E ratio, and growth rate using Bharat SM MoneyControl API
2. WHEN fetching volume data THEN the system SHALL retrieve trading volume from MoneyControl and format it appropriately (e.g., "1.2M", "500K")
3. WHEN fetching market cap THEN the system SHALL get market capitalization from MoneyControl financial data and format it (e.g., "150B", "2.5M")
4. WHEN fetching P/E ratio THEN the system SHALL retrieve price-to-earnings ratio from MoneyControl ratios data
5. WHEN fetching growth rate THEN the system SHALL calculate revenue growth rate from MoneyControl quarterly/yearly financial statements to replace dividend yield
6. WHEN API data is successfully fetched THEN the system SHALL store volume, marketCap, peRatio, and growthRate fields in the database
7. WHEN MoneyControl API calls fail THEN the system SHALL fallback to Perplexity API for basic data and log the error

### Requirement 3

**User Story:** As a user, I want to view all my assets through API endpoints, so that the frontend can display them in organized cards with current market data.

#### Acceptance Criteria

1. WHEN the frontend requests user assets THEN the system SHALL return all assets with current market data
2. WHEN returning asset data THEN the system SHALL include calculated fields like total value, gain/loss, and percentage change
3. WHEN assets are requested THEN the system SHALL support filtering by asset type (stocks, crypto, physical, etc.)
4. WHEN returning tradeable assets THEN the system SHALL include current price, daily change, and market status
5. WHEN returning physical assets THEN the system SHALL include quantity, unit price, and total estimated value
6. WHEN API response is generated THEN the system SHALL format data consistently for frontend consumption
7. WHEN no assets exist THEN the system SHALL return an empty array with appropriate HTTP status

### Requirement 4

**User Story:** As a user, I want to update and delete my assets, so that I can maintain accurate portfolio information as my holdings change.

#### Acceptance Criteria

1. WHEN the user requests to update an asset THEN the system SHALL allow modification of quantity, purchase price, and other editable fields
2. WHEN updating tradeable assets THEN the system SHALL recalculate total value and gain/loss metrics
3. WHEN updating physical assets THEN the system SHALL allow changes to quantity, estimated value, and location
4. WHEN the user requests to delete an asset THEN the system SHALL remove it from the database after confirmation
5. WHEN asset updates are saved THEN the system SHALL refresh market data if applicable
6. WHEN update operations fail THEN the system SHALL return appropriate error messages with field-specific details
7. WHEN assets are modified THEN the system SHALL update the last_modified timestamp

### Requirement 5

**User Story:** As a user, I want the system to provide portfolio analytics and insights, so that I can understand my asset allocation and performance.

#### Acceptance Criteria

1. WHEN portfolio summary is requested THEN the system SHALL calculate total portfolio value across all asset types
2. WHEN generating analytics THEN the system SHALL provide asset allocation breakdown by type and percentage
3. WHEN calculating performance THEN the system SHALL show total gain/loss and percentage change for the entire portfolio
4. WHEN displaying insights THEN the system SHALL identify top performing and worst performing assets
5. WHEN analytics are generated THEN the system SHALL include diversification metrics and risk assessment
6. WHEN market data is available THEN the system SHALL provide daily portfolio change and trending information
7. WHEN generating reports THEN the system SHALL support different time periods (daily, weekly, monthly, yearly)

### Requirement 6

**User Story:** As a system administrator, I want comprehensive database models for different asset types, so that all asset information is properly structured and stored.

#### Acceptance Criteria

1. WHEN the system is deployed THEN the database SHALL have tables for Asset, TradableAsset, PhysicalAsset, and RealEstate
2. WHEN storing tradeable assets THEN the system SHALL include fields for symbol, exchange, current_price, market_cap, pe_ratio
3. WHEN storing physical assets THEN the system SHALL include fields for quantity, unit, purity, storage_location
4. WHEN storing real estate THEN the system SHALL include fields for property_type, location, square_footage, estimated_value
5. WHEN creating database relationships THEN the system SHALL properly link assets to users with foreign keys
6. WHEN defining constraints THEN the system SHALL ensure data integrity with appropriate validations
7. WHEN implementing models THEN the system SHALL support efficient querying and indexing for performance

### Requirement 7

**User Story:** As a developer, I want well-structured API endpoints with proper serialization, so that the frontend can easily consume asset data.

#### Acceptance Criteria

1. WHEN API endpoints are created THEN the system SHALL provide RESTful endpoints for CRUD operations on assets
2. WHEN serializing asset data THEN the system SHALL use Django REST Framework serializers with proper field validation
3. WHEN returning API responses THEN the system SHALL include consistent error handling and status codes
4. WHEN processing requests THEN the system SHALL implement proper authentication and user authorization
5. WHEN handling bulk operations THEN the system SHALL support batch asset creation and updates
6. WHEN API documentation is generated THEN the system SHALL provide clear endpoint descriptions and example requests
7. WHEN implementing pagination THEN the system SHALL support efficient loading of large asset portfolios

### Requirement 8

**User Story:** As a user, I want automatic price and volume updates for my tradeable assets using Bharat SM library, so that my portfolio reflects current market values with comprehensive trading data.

#### Acceptance Criteria

1. WHEN the system runs scheduled tasks THEN it SHALL update prices, volume, and market data for all tradeable assets daily using Bharat SM
2. WHEN price updates occur THEN the system SHALL fetch latest prices, trading volume, and market metrics using MoneyControl API
3. WHEN new data is retrieved THEN the system SHALL calculate and update daily change, percentage change, and volume metrics
4. WHEN Bharat SM updates fail THEN the system SHALL fallback to Perplexity API and log errors with retry logic
5. WHEN market is closed THEN the system SHALL use last available closing prices and volume data from MoneyControl
6. WHEN updating data THEN the system SHALL preserve historical price and volume data for trend analysis
7. WHEN updates complete THEN the system SHALL update portfolio totals, analytics, and volume-based insights

### Requirement 9

**User Story:** As a user, I want the frontend to display growth rate instead of dividend yield, so that I can see revenue growth trends for better investment analysis.

#### Acceptance Criteria

1. WHEN displaying tradeable assets THEN the system SHALL show growth rate instead of dividend yield in the asset cards
2. WHEN calculating growth rate THEN the system SHALL use revenue growth from latest quarterly data compared to previous year same quarter
3. WHEN growth rate is unavailable THEN the system SHALL display "N/A" or calculate from available financial statement data
4. WHEN storing growth rate THEN the system SHALL save it as a percentage value in the database (e.g., 15.5 for 15.5% growth)
5. WHEN frontend requests asset data THEN the system SHALL return growthRate field instead of dividendYield for display
6. WHEN updating asset data THEN the system SHALL recalculate growth rate from latest MoneyControl financial statements
7. WHEN displaying growth rate THEN the system SHALL format it as percentage with appropriate color coding (green for positive, red for negative)

### Requirement 10

**User Story:** As a user, I want the backend to provide exactly the data fields shown on the frontend (volume, market cap, P/E ratio, growth rate) using Bharat SM library, so that all displayed information is accurate and real-time.

#### Acceptance Criteria

1. WHEN frontend requests asset data THEN the backend SHALL return volume, marketCap, peRatio, and growthRate fields populated from Bharat SM
2. WHEN TradableAssetCard displays stats THEN it SHALL show volume from MoneyControl, market cap from financial data, P/E ratio from ratios, and growth rate from revenue analysis
3. WHEN AssetCard renders THEN it SHALL use the same four data fields (volume, marketCap, peRatio, growthRate) for all tradeable assets
4. WHEN PhysicalAssetCard displays THEN it SHALL continue showing its current fields (volume mock, market cap mock, purchase price, quantity) without changes
5. WHEN API returns data THEN the backend SHALL format volume as string (e.g., "1.2M"), market cap as number, P/E ratio as number, and growth rate as number
6. WHEN data is missing THEN the backend SHALL provide appropriate fallback values or "N/A" for display consistency
7. WHEN frontend components access these fields THEN they SHALL work without any code changes to the existing UI components