# Design Document

## Overview

This design addresses the UI consistency issue where user assets are displayed with different styling than placeholder investment cards. The solution involves updating the `UnifiedAssetCard` component to use the exact same styling as the placeholder `InvestmentCard` component, ensuring a seamless and professional user experience.

## Architecture

### Current State Analysis

**Placeholder Cards (InvestmentCard):**
- Use `exactReplicaCard` styling with dark theme (`#1f1f1f` background)
- Have detailed layout with proper spacing and typography
- Include comprehensive chart section with Y-axis labels
- Display stats in a structured 4-row layout
- Feature professional insight text section

**User Asset Cards (UnifiedAssetCard):**
- Use different styling with lighter dark theme (`#1a1a1a` background)
- Have different dimensions and spacing
- Use simplified chart layout
- Different typography and color schemes
- Inconsistent with placeholder cards

### Target State

All asset cards will use identical styling, layout, and visual elements regardless of whether they are placeholder cards or user assets.

## Components and Interfaces

### UnifiedAssetCard Component Updates

The `UnifiedAssetCard` component will be updated to match the exact styling of placeholder cards:

#### 1. Card Container Styling
```typescript
// Current (inconsistent)
backgroundColor: '#1a1a1a'
borderRadius: 12
padding: 16

// Target (matching placeholder)
backgroundColor: '#1f1f1f'
borderRadius: 16
padding: 20
```

#### 2. Header Section Layout
```typescript
// Icon styling to match placeholder
pixelPerfectIcon: {
  width: 40,        // was 32
  height: 40,       // was 32
  borderRadius: 8,  // was 6
  marginRight: 16,  // was 12
}

// Company name styling
pixelPerfectCompanyName: {
  fontSize: 17,     // was 16
  marginBottom: 4,  // was 2
  lineHeight: 20,
}

// Price styling
pixelPerfectPrice: {
  fontSize: 20,     // maintain
  letterSpacing: -0.2, // add
}
```

#### 3. Chart Section Enhancement
```typescript
// Chart container dimensions
pixelPerfectChartSection: {
  marginRight: 24,  // was 20
}

// Y-axis styling to match
pixelPerfectYAxis: {
  width: 44,        // was 30
  height: 80,       // explicit height
  paddingRight: 10,
  paddingTop: 4,
  paddingBottom: 4,
}

// Chart area
pixelPerfectChart: {
  height: 80,       // was flex: 1
}
```

#### 4. Stats Section Alignment
```typescript
// Stats section width and layout
pixelPerfectStatsSection: {
  width: 130,       // was 120
  paddingTop: 4,
}

// Stat row layout
pixelPerfectStatRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginBottom: 12, // was 8
}
```

#### 5. Insight Section Styling
```typescript
// Insight container
pixelPerfectInsightContainer: {
  paddingTop: 20,   // was 16
  borderTopColor: '#333333', // was '#374151'
  marginTop: 4,
}

// Insight text
pixelPerfectInsightText: {
  fontSize: 14,     // was 13
  lineHeight: 20,   // was 18
  letterSpacing: 0.1,
}
```

### AssetDataProcessor Integration

The `AssetDataProcessor` service will be enhanced to provide data in the format expected by the updated card layout:

#### Enhanced Chart Data Processing
- Generate appropriate Y-axis labels based on asset price range
- Ensure chart data points are properly scaled
- Provide fallback chart data when real data is unavailable

#### Stats Data Formatting
- Format volume, market cap, and other metrics consistently
- Handle missing data gracefully with "N/A" fallbacks
- Ensure proper currency formatting

#### AI Analysis Enhancement
- Generate contextual insights for user assets
- Provide meaningful analysis based on asset performance
- Handle cases where analysis data is unavailable

## Data Models

### AssetDisplayData Interface Updates

```typescript
interface AssetDisplayData {
  symbol: string;
  name: string;
  price: number;
  currency?: string;
  change: number;
  changePercent: number;
  changeColor: string;
  chartData: number[];
  yAxisLabels: string[];  // Enhanced to match placeholder format
  stats: StatItem[];      // Structured to match 4-row layout
  aiAnalysis: string;
  time?: string;          // Add time display
}

interface StatItem {
  label: string;
  value: string;
  color?: string;
}
```

## Error Handling

### Graceful Degradation Strategy

1. **Missing Asset Data:**
   - Display fallback values while maintaining visual consistency
   - Show "N/A" for unavailable metrics
   - Use default chart data to maintain layout

2. **Chart Rendering Errors:**
   - Fall back to flat line chart
   - Maintain chart container dimensions
   - Preserve Y-axis labels structure

3. **Price Data Issues:**
   - Display last known price or "N/A"
   - Maintain price formatting consistency
   - Handle currency conversion errors

### Error Boundaries

- Wrap chart rendering in try-catch blocks
- Validate all numeric data before display
- Provide meaningful fallback content

## Testing Strategy

### Visual Consistency Tests

1. **Snapshot Testing:**
   - Capture screenshots of placeholder cards
   - Compare with updated user asset cards
   - Ensure pixel-perfect matching

2. **Layout Tests:**
   - Verify identical dimensions and spacing
   - Test with various asset data scenarios
   - Validate responsive behavior

3. **Integration Tests:**
   - Test mixed display of placeholder and user cards
   - Verify smooth scrolling and interaction
   - Test error states and fallbacks

### Data Processing Tests

1. **AssetDataProcessor Tests:**
   - Test chart data generation
   - Verify stats formatting
   - Test error handling scenarios

2. **Component Tests:**
   - Test with various asset types
   - Verify proper data display
   - Test interaction handlers

## Implementation Approach

### Phase 1: Style Alignment
1. Update `UnifiedAssetCard` styles to match placeholder cards exactly
2. Ensure all dimensions, colors, and typography are identical
3. Test visual consistency

### Phase 2: Data Processing Enhancement
1. Update `AssetDataProcessor` to provide properly formatted data
2. Enhance chart data generation
3. Improve stats formatting

### Phase 3: Error Handling & Polish
1. Implement comprehensive error handling
2. Add proper fallback displays
3. Optimize performance and interactions

### Phase 4: Testing & Validation
1. Comprehensive visual testing
2. User experience validation
3. Performance optimization