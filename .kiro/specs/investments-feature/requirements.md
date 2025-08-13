# Requirements Document

## Introduction

The asset management feature will provide users with a comprehensive view of their entire asset portfolio through an interactive card-based interface. This includes traditional investments (stocks, ETFs, bonds), physical assets (gold, silver, commodities), and cryptocurrency. Each asset card will display relevant performance data and charts where applicable. The feature includes automated import functionality for password-protected holding statements and maintains UI/UX consistency with existing goals and opportunities pages.

## Requirements

### Requirement 1

**User Story:** As an asset owner, I want to view my entire asset portfolio in a card-based layout, so that I can quickly scan through all my holdings including stocks, bonds, crypto, gold, and other assets.

#### Acceptance Criteria

1. WHEN the user navigates to the assets screen THEN the system SHALL display asset cards in a scrollable grid layout
2. WHEN the assets screen loads THEN the system SHALL fetch and display all user asset holdings across all asset types
3. IF no assets exist THEN the system SHALL display an empty state with options to add assets
4. WHEN the screen is refreshed THEN the system SHALL update all asset data and applicable charts
5. WHEN displaying assets THEN the system SHALL group or filter by asset type (stocks, bonds, crypto, commodities, etc.)

### Requirement 2

**User Story:** As an asset owner, I want to select from different asset types when adding assets, so that I can properly categorize and track all my holdings including tradeable securities and physical assets.

#### Acceptance Criteria

1. WHEN the user taps add asset THEN the system SHALL display asset type selection options (stocks, ETFs, bonds, crypto, gold, silver, other commodities)
2. WHEN tradeable securities are selected (stocks, ETFs, bonds, crypto) THEN the system SHALL provide both manual entry and PDF import options
3. WHEN physical assets are selected (gold, silver, commodities) THEN the system SHALL show manual entry fields only
4. WHEN adding stocks/ETFs manually THEN the system SHALL provide symbol search and real-time price data
5. WHEN adding physical assets THEN the system SHALL allow quantity, unit price, purchase date, and current market value entry
6. WHEN adding crypto manually THEN the system SHALL provide cryptocurrency search and current price data
7. WHEN adding bonds manually THEN the system SHALL allow entry of bond details, face value, and yield information

### Requirement 3

**User Story:** As an asset owner, I want each asset card to display relevant information based on the asset type, so that I can quickly assess performance and key metrics for all my holdings.

#### Acceptance Criteria

1. WHEN a stock/ETF card is displayed THEN the system SHALL show symbol, name, current price, daily change, and candlestick chart
2. WHEN a bond card is displayed THEN the system SHALL show bond name, face value, current yield, maturity date, and price change
3. WHEN a physical asset card is displayed THEN the system SHALL show asset name, quantity, unit price, total value, and market price change
4. WHEN a crypto card is displayed THEN the system SHALL show symbol, name, current price, daily change, and price chart
5. WHEN price data updates THEN the system SHALL use green color for positive changes and red for negative changes
6. WHEN the asset has income information (dividends, interest) THEN the system SHALL display yield or income data
7. WHEN market data is unavailable THEN the system SHALL show last known values with timestamp

### Requirement 4

**User Story:** As an investor, I want to import my holdings from password-protected PDF statements, so that I can quickly add multiple tradeable securities without manual entry.

#### Acceptance Criteria

1. WHEN the user selects "Import from PDF" option THEN the system SHALL allow file selection from device storage
2. WHEN a PDF is selected THEN the system SHALL prompt for the document password
3. WHEN the password is entered THEN the system SHALL decrypt and parse the PDF content
4. WHEN parsing is successful THEN the system SHALL extract asset symbols, quantities, and purchase prices for stocks, ETFs, bonds, and crypto
5. WHEN extraction is complete THEN the system SHALL display a preview of detected holdings for user confirmation
6. WHEN the user confirms the import THEN the system SHALL add all confirmed assets to their portfolio
7. WHEN PDF parsing fails THEN the system SHALL display an error message with manual entry option
8. WHEN the password is incorrect THEN the system SHALL prompt to re-enter the password

### Requirement 5

**User Story:** As an asset owner, I want to access detailed insights for each asset, so that I can make informed decisions about my portfolio.

#### Acceptance Criteria

1. WHEN the user taps the insights area below an asset card THEN the system SHALL open the insights drawer
2. WHEN the insights drawer opens THEN the system SHALL display AI-generated analysis and recommendations relevant to the asset type
3. WHEN insights are loading THEN the system SHALL show a loading indicator
4. WHEN the user swipes down or taps outside THEN the system SHALL close the insights drawer
5. WHEN insights fail to load THEN the system SHALL display an error message with retry option

### Requirement 6

**User Story:** As an asset owner, I want the assets page to maintain visual consistency with other app sections, so that I have a familiar and cohesive user experience.

#### Acceptance Criteria

1. WHEN the assets screen loads THEN the system SHALL use the same card design patterns as goals and opportunities pages
2. WHEN displaying insights THEN the system SHALL use the same drawer component and animations
3. WHEN showing loading states THEN the system SHALL use consistent loading indicators
4. WHEN displaying errors THEN the system SHALL use the same error handling patterns
5. WHEN applying themes THEN the system SHALL respect the current app theme settings

### Requirement 7

**User Story:** As an asset owner, I want to manage my existing assets, so that I can update quantities, values, or remove assets I no longer hold.

#### Acceptance Criteria

1. WHEN the user long-presses an asset card THEN the system SHALL show edit/delete options
2. WHEN the user selects edit THEN the system SHALL open a modal to modify asset details appropriate to the asset type
3. WHEN the user selects delete THEN the system SHALL show a confirmation dialog
4. WHEN changes are saved THEN the system SHALL update the asset data and refresh the display
5. WHEN the operation fails THEN the system SHALL display an error message and revert changes

### Requirement 8

**User Story:** As an asset owner, I want daily price updates for market-traded assets, so that I can see current market values reflected in my portfolio.

#### Acceptance Criteria

1. WHEN the app loads THEN the system SHALL update stock/ETF/crypto prices with the latest daily closing prices
2. WHEN the user refreshes the screen THEN the system SHALL fetch the most recent price data available
3. WHEN price updates occur THEN the system SHALL smoothly update displayed values and charts
4. WHEN network connectivity is poor THEN the system SHALL show last known prices with timestamp
5. WHEN market data is unavailable THEN the system SHALL display last available data with appropriate disclaimer
6. WHEN assets don't have market prices (physical assets like gold, silver) THEN the system SHALL show last manually updated values