# Implementation Plan

- [x] 1. Set up comprehensive asset data models and types





  - Create TypeScript interfaces for Asset, TradableAsset, PhysicalAsset, and AssetType enum
  - Define CandlestickData, ChartTouchData, and CreateAssetRequest interfaces
  - Add ParsedAssetData and PDFParsingResult interfaces for PDF import functionality
  - Define asset-related enums for asset types, risk levels, and recommendations
  - Add all asset types to the main types/index.ts file
  - _Requirements: 1.1, 2.1, 3.1_

- [x] 2. Implement asset API service functions


  - Add fetchAssets function to api.ts for retrieving user's complete portfolio
  - Implement createAsset function for adding new assets of different types
  - Add updateAsset and deleteAsset functions for portfolio management
  - Create fetchChartData function for retrieving historical price data for tradeable assets
  - Implement fetchDailyPrices function for daily price updates
  - Add refreshAssetPrices function for daily bulk price refresh
  - _Requirements: 1.2, 2.3, 7.4, 8.1_

- [x] 3. Create PDF import service and parsing functionality


  - Install and configure PDF parsing library (react-native-pdf or similar)
  - Create PDFImportService with password decryption capabilities
  - Implement PDF text extraction and parsing logic for common brokerage formats
  - Add asset data extraction functions for stocks, ETFs, bonds, and crypto
  - Create confidence scoring system for parsed data accuracy
  - Implement error handling for corrupted or unsupported PDF formats
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 4. Create AssetTypeSelector component


  - Build AssetTypeSelector component with visual asset type cards
  - Implement selection state management for different asset types
  - Add icons and descriptions for each asset type (stocks, ETFs, bonds, crypto, gold, silver, commodities)
  - Create clear categorization between tradeable and physical assets
  - Apply consistent styling with existing UI components
  - _Requirements: 2.1, 2.2_

- [x] 5. Create PDFImportComponent for file handling


  - Build PDFImportComponent with file picker integration
  - Implement password input modal for encrypted PDFs
  - Add PDF parsing progress indicators and loading states
  - Create preview component for detected holdings before confirmation
  - Implement error handling for parsing failures and invalid passwords
  - Add retry mechanisms and fallback to manual entry
  - _Requirements: 4.1, 4.2, 4.3, 4.5, 4.6, 4.7, 4.8_

- [x] 6. Create adaptive AssetCard component structure


  - Build base AssetCard component with props interface for different asset types
  - Implement adaptive display logic based on asset type
  - Create TradableAssetCard subcomponent for stocks, ETFs, bonds, crypto
  - Create PhysicalAssetCard subcomponent for gold, silver, commodities
  - Apply consistent styling with existing card components
  - _Requirements: 1.1, 3.1, 3.2, 6.1_

- [x] 7. Integrate charts into TradableAssetCard


  - Embed CandlestickChart component for stocks and crypto assets
  - Create PriceChart component for bonds showing yield information
  - Implement chart loading states and error placeholders
  - Add chart interaction callbacks to tradeable asset cards
  - Ensure proper chart sizing within card constraints
  - _Requirements: 3.1, 3.4_

- [x] 8. Implement PhysicalAssetCard for manual tracking


  - Create PhysicalAssetCard component for gold, silver, and commodities
  - Add quantity, unit price, and total value display
  - Implement manual value update functionality
  - Add last updated timestamp display
  - Include purity, storage, and certificate information where applicable
  - _Requirements: 3.3, 3.7_

- [x] 9. Create comprehensive AddAssetModal component


  - Build AddAssetModal with asset type selection integration
  - Implement conditional form rendering based on selected asset type
  - Add manual entry forms for all asset types
  - Integrate PDFImportComponent for tradeable securities
  - Include asset search with autocomplete for tradeable assets
  - Add validation and error handling for different asset types
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7_

- [x] 10. Create AssetsScreen main component


  - Build AssetsScreen component with comprehensive state management
  - Implement asset type filtering/tabs functionality
  - Add ScrollView with RefreshControl for pull-to-refresh
  - Create loading states with skeleton screens for different asset types
  - Implement error handling with retry mechanisms
  - Add market status indicator for tradeable assets
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x] 11. Implement asset data fetching and state management


  - Add useEffect hooks for initial data loading in AssetsScreen
  - Implement refresh functionality with loading states
  - Add error handling for API failures with user feedback
  - Create state updates for daily price changes
  - Handle empty state when no assets exist
  - Implement asset type filtering logic
  - _Requirements: 1.2, 1.3, 1.4, 8.1_

- [x] 12. Create AssetInsightsDrawer component



  - Build AssetInsightsDrawer following existing drawer patterns
  - Implement modal with animated slide-up behavior
  - Add pan gesture handling for swipe-to-close functionality
  - Create drawer content sections tailored to different asset types
  - Apply consistent styling with existing insight drawers
  - _Requirements: 5.1, 5.2, 5.4, 6.2_

- [x] 13. Populate AssetInsightsDrawer with asset-specific data


  - Add asset summary section with current value and P&L
  - Display AI-generated analysis tailored to asset type
  - Include market insights for tradeable assets
  - Add personalized recommendations and risk assessment
  - Implement loading states for insights generation
  - Handle different insight types for physical vs tradeable assets
  - _Requirements: 5.2, 5.3, 5.5_



- [x] 14. Implement asset management functionality


  - Add long-press gesture handling for edit/delete options
  - Create edit asset modal with asset-type-specific fields
  - Implement delete confirmation dialog
  - Add save/update functionality with API integration
  - Handle operation errors with appropriate user feedback
  - Support editing different asset types with appropriate forms


  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 15. Add daily price update system


  - Implement daily price refresh functionality for tradeable assets
  - Create price update service that fetches latest closing prices
  - Add app launch price update checks
  - Handle network connectivity issues with cached data and timestamps


  - Add smooth animations for price changes
  - Implement manual refresh capability for users
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_

- [x] 16. Integrate assets screen into navigation


  - Add AssetsScreen to the main navigation structure


  - Update navigation tab or menu item from "Investments" to "Assets"
  - Ensure proper screen transitions and back navigation
  - Add screen title and header configuration
  - Test navigation flow between assets and other screens
  - _Requirements: 1.1, 6.1_

- [x] 17. Implement comprehensive error handling and loading states


  - Add error boundaries for asset components
  - Create loading skeletons for different asset card types
  - Implement retry mechanisms for failed API calls
  - Add network status handling with offline indicators
  - Create user-friendly error messages for PDF import failures
  - Handle asset-type-specific error scenarios
  - _Requirements: 1.4, 3.7, 5.5, 7.5_



- [x] 18. Add asset data caching and optimization


  - Implement local storage for chart data caching with daily expiration
  - Add intelligent caching for different asset types
  - Create data compression for large historical datasets
  - Implement selective re-rendering for asset card updates
  - Add lazy loading for off-screen charts


  - Optimize memory management for mixed asset portfolios
  - _Requirements: 8.4, 8.5, 8.6_

- [x] 19. Create comprehensive test suite for asset components


  - Write unit tests for AssetCard components (both tradeable and physical)
  - Add tests for PDFImportComponent parsing functionality
  - Create integration tests for API service functions across asset types
  - Implement E2E tests for complete asset management flow
  - Add performance tests for chart rendering and PDF processing
  - Test asset type filtering and switching functionality
  - _Requirements: All requirements - testing coverage_

- [x] 20. Apply accessibility features and final UI polish



  - Add screen reader support for different asset types and data
  - Implement proper touch target sizes (minimum 44px)
  - Ensure WCAG AA color contrast compliance
  - Add voice-over labels for asset performance across types
  - Apply final styling touches and animation refinements
  - Test accessibility with different asset combinations
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_