# Requirements Document

## Introduction

The current asset management system has significant code duplication and inefficiency in the frontend asset card components. There are three separate card components (TradableAssetCard, PhysicalAssetCard, and AssetCard) that share nearly identical UI structure and styling, with only minor differences in data display. This creates maintenance overhead, inconsistent behavior, and unnecessary complexity. The goal is to consolidate these into a single, efficient, and maintainable unified asset card component.

## Requirements

### Requirement 1

**User Story:** As a developer, I want a single unified asset card component, so that I can maintain consistent UI behavior and reduce code duplication.

#### Acceptance Criteria

1. WHEN the system renders any asset type THEN it SHALL use a single unified AssetCard component
2. WHEN displaying tradable assets (stocks, ETFs, bonds, crypto) THEN the card SHALL show appropriate market data (volume, market cap, P/E ratio, growth rate)
3. WHEN displaying physical assets (gold, silver, commodities) THEN the card SHALL show appropriate physical asset data (quantity, unit, purchase price)
4. WHEN rendering any asset card THEN it SHALL maintain the exact same visual appearance and styling as current cards
5. WHEN an asset has missing data fields THEN the card SHALL gracefully handle and display fallback values

### Requirement 2

**User Story:** As a user, I want consistent asset card behavior across all asset types, so that I have a predictable and uniform experience.

#### Acceptance Criteria

1. WHEN interacting with any asset card THEN all cards SHALL respond to press, long press, and insights actions consistently
2. WHEN viewing asset performance data THEN all cards SHALL use the same color coding and formatting rules
3. WHEN viewing chart data THEN all cards SHALL display charts with consistent styling and behavior
4. WHEN viewing AI insights THEN all cards SHALL show insights in the same format and location
5. WHEN cards are loading or updating THEN they SHALL show consistent loading states

### Requirement 3

**User Story:** As a developer, I want simplified backend data handling, so that I can reduce complexity in data processing and API responses.

#### Acceptance Criteria

1. WHEN the backend serves asset data THEN it SHALL use a unified data structure for all asset types
2. WHEN processing asset statistics THEN the system SHALL calculate appropriate metrics based on asset type
3. WHEN generating mock data for missing fields THEN the system SHALL provide realistic fallback values
4. WHEN updating asset data THEN the system SHALL handle both tradable and physical asset updates through unified endpoints
5. WHEN caching asset data THEN the system SHALL use consistent caching strategies across asset types

### Requirement 4

**User Story:** As a developer, I want optimized component rendering, so that the asset screen performs efficiently with large numbers of assets.

#### Acceptance Criteria

1. WHEN rendering multiple assets THEN the system SHALL use efficient rendering patterns to prevent unnecessary re-renders
2. WHEN calculating derived data THEN the system SHALL memoize expensive calculations
3. WHEN displaying charts THEN the system SHALL optimize SVG rendering for performance
4. WHEN handling user interactions THEN the system SHALL debounce rapid interactions to prevent performance issues
5. WHEN loading asset data THEN the system SHALL implement proper loading states and error boundaries

### Requirement 5

**User Story:** As a user, I want reliable asset data display, so that I can trust the information shown in my portfolio.

#### Acceptance Criteria

1. WHEN asset data is missing or invalid THEN the card SHALL display appropriate fallback values or indicators
2. WHEN price data is stale THEN the card SHALL indicate the last update time
3. WHEN calculations result in invalid numbers THEN the system SHALL handle edge cases gracefully
4. WHEN network requests fail THEN the card SHALL show appropriate error states
5. WHEN asset types change THEN the card SHALL adapt its display fields accordingly