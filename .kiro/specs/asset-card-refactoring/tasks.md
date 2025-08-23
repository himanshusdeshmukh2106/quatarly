# Implementation Plan

- [x] 1. Evaluate and standardize chart rendering approach


  - Analyze current asset card SVG implementation (simple Line components)
  - Compare with DonutChart approach (d3-shape with Path components)
  - Compare with CandlestickChart/PriceChart approach (react-native-chart-kit)
  - Determine optimal approach for asset card charts (performance vs consistency)
  - Document decision and ensure compatibility with existing chart ecosystem
  - _Requirements: 4.3, 2.3_

- [x] 2. Create AssetDataProcessor service for unified data handling


  - Implement data processing logic to extract display data from any asset type
  - Add fallback data generation for missing fields (volume, market cap, P/E ratio)
  - Create chart data generation logic with proper bounds calculation
  - Add asset-specific statistics generation (tradable vs physical asset stats)
  - _Requirements: 1.1, 1.4, 1.5, 3.1, 3.3_

- [x] 3. Implement UnifiedAssetCard component structure with pixel-perfect UI preservation


  - Create component shell with header, body, and insights sections using EXACT same styling
  - Copy all existing styles from TradableAssetCard and PhysicalAssetCard without any modifications
  - Preserve exact dimensions, colors, fonts, spacing, and visual appearance
  - Add proper TypeScript interfaces for component props and internal data
  - Ensure zero visual changes - component must look identical to existing cards
  - _Requirements: 1.1, 2.1, 2.3_

- [x] 4. Add dynamic header section preserving exact visual layout

  - Implement symbol/abbreviation generation logic using existing patterns
  - Add price display with identical currency formatting as existing cards
  - Implement performance change display with same color coding and arrow styles
  - Preserve exact text truncation, font sizes, and spacing from existing cards
  - Maintain identical header layout and alignment without any visual changes
  - _Requirements: 1.2, 1.3, 2.2, 5.1_

- [x] 5. Implement chart section with optimized SVG rendering

  - Evaluate current simple SVG approach vs d3-shape (used in DonutChart) for consistency
  - Create chart data processing using exact same logic as existing cards
  - Implement SVG line chart rendering with identical dimensions and scaling (140x70)
  - Add Y-axis labels generation matching existing format and positioning
  - Implement chart color coding using same colors and stroke width (2.5)
  - Preserve exact time display positioning and chart container styling
  - Consider using d3-shape for better path generation if it improves performance/consistency
  - _Requirements: 2.3, 4.3, 5.1_

- [x] 6. Create dynamic statistics section with preserved formatting

  - Implement asset-type-specific statistics using exact same display logic
  - Add formatting for volume, market cap, P/E ratio matching existing cards precisely
  - Implement color coding using identical colors (#22c55e, #ef4444, #ffffff)
  - Preserve exact font sizes, spacing, and alignment from existing stat sections
  - Add fallback handling while maintaining identical visual appearance
  - _Requirements: 1.2, 1.3, 3.3, 5.1_

- [x] 7. Add AI insights section preserving exact styling

  - Implement asset-type-aware insight generation using existing patterns
  - Preserve exact text formatting, font size (13px), and line height (18px)
  - Maintain identical container styling with border-top and padding
  - Create contextual insights while keeping same text structure and length
  - Preserve exact color (#d1d5db) and text wrapping behavior
  - _Requirements: 2.1, 2.4, 5.1_

- [x] 8. Implement user interaction handling

  - Add onPress, onLongPress, and onInsightsPress event handling
  - Implement proper touch feedback and active opacity
  - Add debouncing for rapid interactions to prevent performance issues
  - Ensure consistent interaction behavior across all asset types
  - _Requirements: 2.1, 4.4_

- [x] 9. Add performance optimizations and memoization

  - Implement React.memo for component memoization
  - Add useMemo for expensive calculations (chart data, statistics)
  - Implement useCallback for event handlers
  - Add proper dependency arrays to prevent unnecessary recalculations
  - _Requirements: 4.1, 4.2, 4.3_

- [x] 10. Implement error handling and fallback states


  - Add error boundaries for graceful error handling
  - Implement fallback data display for invalid or missing asset data
  - Add proper error state indicators and user feedback
  - Implement stale data indicators for outdated price information
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [x] 11. Update AssetsScreen to use UnifiedAssetCard


  - Replace conditional rendering logic with single UnifiedAssetCard usage
  - Remove imports for TradableAssetCard and PhysicalAssetCard
  - Update renderAssetCard function to use unified component
  - Ensure all existing functionality (long press, insights) continues to work
  - _Requirements: 1.1, 2.1_

- [x] 12. Create comprehensive unit tests for UnifiedAssetCard


  - Write tests for AssetDataProcessor with different asset types
  - Test component rendering with tradable and physical assets
  - Add tests for user interactions and event handling
  - Test error states and fallback data scenarios
  - Test performance with large datasets and rapid interactions
  - _Requirements: 1.1, 1.4, 2.1, 4.4, 5.1_

- [x] 13. Add integration tests with visual regression verification


  - Test component with actual API responses
  - Test with mock investment data from AssetsScreen
  - Verify pixel-perfect visual consistency with existing card components
  - Take screenshots and compare with existing cards to ensure zero UI changes
  - Test accessibility compliance and screen reader support
  - _Requirements: 2.1, 2.2, 5.5_

- [x] 14. Remove deprecated asset card components


  - Delete TradableAssetCard.tsx file
  - Delete PhysicalAssetCard.tsx file
  - Update any remaining imports or references
  - Clean up unused test files for deprecated components
  - _Requirements: 1.1_

- [x] 15. Update asset utilities with chart rendering consistency


  - Enhance assetUtils.ts with additional formatting functions
  - Add chart data processing utilities compatible with existing SVG approach
  - Evaluate integration with d3-shape (used in DonutChart) for consistent chart rendering
  - Implement improved fallback data generation
  - Add performance optimization utilities for asset processing
  - Ensure chart rendering approach is consistent across all chart components
  - _Requirements: 3.1, 3.3, 4.1_

- [x] 16. Optimize backend data structure handling



  - Ensure Investment model data maps correctly to unified component
  - Verify that all asset types provide necessary data fields
  - Add any missing data transformations in API responses
  - Test data consistency across different asset types
  - _Requirements: 3.1, 3.2, 5.5_