# Design Document

## Overview

This design consolidates the three separate asset card components (TradableAssetCard, PhysicalAssetCard, and AssetCard) into a single, efficient UnifiedAssetCard component. The solution eliminates code duplication while maintaining the exact visual appearance and functionality of the existing cards. The design leverages the existing asset utilities and type system to provide intelligent data handling and display logic.

## Architecture

### Component Structure

```
UnifiedAssetCard
├── AssetCardHeader (symbol, name, price, change)
├── AssetCardBody
│   ├── ChartSection (Y-axis labels, chart, time)
│   └── StatsSection (4 stat rows with labels/values)
└── AssetCardInsights (AI analysis text)
```

### Data Flow

```
Asset Data → AssetDataProcessor → DisplayData → UnifiedAssetCard → UI
```

The UnifiedAssetCard will use a data processor that:
1. Determines asset type (tradable vs physical)
2. Extracts appropriate data fields
3. Generates fallback values for missing data
4. Formats data for display
5. Provides chart data and insights

### Type System Integration

The design leverages the existing type system:
- `Asset` (base interface)
- `TradableAsset` (extends Asset)
- `PhysicalAsset` (extends Asset)
- Existing type guards: `isTradableAsset()`, `isPhysicalAsset()`
- Existing utilities in `assetUtils.ts`

## Components and Interfaces

### UnifiedAssetCard Component

```typescript
interface UnifiedAssetCardProps {
  asset: Asset;
  onPress?: () => void;
  onLongPress?: () => void;
  onInsightsPress?: () => void;
  onUpdateValue?: (assetId: string, newValue: number) => void;
  style?: any;
}
```

### AssetDisplayData Interface

```typescript
interface AssetDisplayData {
  // Header data
  symbol: string;
  name: string;
  price: number;
  currency?: string;
  change: number;
  changePercent: number;
  changeColor: string;
  
  // Chart data
  chartData: number[];
  yAxisLabels: string[];
  
  // Stats data
  stats: AssetStatItem[];
  
  // Insights
  aiAnalysis: string;
}

interface AssetStatItem {
  label: string;
  value: string;
  color?: string;
}
```

### AssetDataProcessor Service

```typescript
class AssetDataProcessor {
  static processAssetForDisplay(asset: Asset, theme: any): AssetDisplayData;
  static generateChartData(asset: Asset): number[];
  static getStatsForAsset(asset: Asset): AssetStatItem[];
  static generateInsight(asset: Asset): string;
  static getPerformanceColor(value: number, theme: any): string;
}
```

## Data Models

### Unified Asset Statistics

The component will display 4 statistics based on asset type:

**For Tradable Assets:**
1. Volume (from asset.volume or calculated)
2. Market Cap (from asset.marketCap or calculated)
3. P/E Ratio (from asset.peRatio or mock)
4. Growth Rate (from asset.growthRate or N/A)

**For Physical Assets:**
1. Volume (calculated from totalValue)
2. Market Cap (calculated estimate)
3. Purchase Price (from asset.purchasePrice)
4. Quantity (from asset.quantity + unit)

### Chart Data Processing

```typescript
interface ChartDataConfig {
  basePrice: number;
  isPositive: boolean;
  dataPoints: number; // 12 points
  volatility: number; // 0.02 (2%)
}
```

### Fallback Data Generation

```typescript
interface FallbackDataConfig {
  volume: {
    tradable: (asset: Asset) => string;
    physical: (asset: Asset) => string;
  };
  marketCap: {
    tradable: (asset: Asset) => string;
    physical: (asset: Asset) => string;
  };
  peRatio: () => string;
  growthRate: (asset: Asset) => string | null;
}
```

## Error Handling

### Missing Data Handling

1. **Missing Prices**: Use totalValue or purchasePrice as fallback
2. **Missing Volume**: Calculate based on totalValue
3. **Missing Market Cap**: Generate realistic estimate
4. **Missing Chart Data**: Generate mock data based on performance
5. **Missing AI Analysis**: Generate contextual insight

### Invalid Data Handling

1. **Zero/Negative Values**: Display "N/A" or appropriate message
2. **NaN/Infinity**: Handle gracefully with fallbacks
3. **Missing Required Fields**: Use asset name for symbol generation
4. **Network Errors**: Show cached data with stale indicator

### Error Boundaries

```typescript
interface AssetCardErrorState {
  hasError: boolean;
  errorMessage: string;
  fallbackData: Partial<AssetDisplayData>;
}
```

## Testing Strategy

### Unit Tests

1. **AssetDataProcessor Tests**
   - Test data processing for all asset types
   - Test fallback data generation
   - Test edge cases (missing data, invalid values)
   - Test chart data generation

2. **UnifiedAssetCard Tests**
   - Test rendering with different asset types
   - Test user interactions (press, long press)
   - Test error states and fallbacks
   - Test accessibility compliance

3. **Integration Tests**
   - Test with real asset data from API
   - Test with mock/legacy investment data
   - Test performance with large datasets
   - Test theme integration

### Performance Tests

1. **Rendering Performance**
   - Measure render time with 100+ assets
   - Test memory usage with large datasets
   - Test scroll performance in asset list

2. **Chart Rendering**
   - Test SVG rendering performance
   - Test chart data calculation efficiency
   - Test chart interaction responsiveness

### Visual Regression Tests

1. **Pixel-Perfect Matching**
   - Compare with existing TradableAssetCard
   - Compare with existing PhysicalAssetCard
   - Test across different screen sizes
   - Test with different themes

## Implementation Phases

### Phase 1: Core Component Structure
- Create UnifiedAssetCard component shell
- Implement basic header, body, and insights sections
- Set up styling to match existing cards exactly

### Phase 2: Data Processing Layer
- Implement AssetDataProcessor service
- Add type-specific data extraction logic
- Implement fallback data generation

### Phase 3: Chart Integration
- Integrate SVG chart rendering
- Implement chart data processing
- Add chart interaction handling

### Phase 4: Statistics Display
- Implement dynamic stats based on asset type
- Add proper formatting and color coding
- Handle missing data gracefully

### Phase 5: Integration and Cleanup
- Update AssetsScreen to use UnifiedAssetCard
- Remove old card components
- Update tests and documentation

### Phase 6: Performance Optimization
- Add memoization for expensive calculations
- Optimize chart rendering
- Implement proper loading states

## Migration Strategy

### Backward Compatibility

1. **Gradual Migration**: Replace components one by one
2. **Feature Flags**: Use flags to switch between old/new components
3. **Data Compatibility**: Ensure new component works with existing data
4. **API Compatibility**: No changes to backend APIs required

### Rollback Plan

1. **Component Isolation**: Keep old components until migration complete
2. **Quick Rollback**: Simple import changes to revert
3. **Data Integrity**: No data structure changes required
4. **User Experience**: No visible changes during migration

## Performance Considerations

### Rendering Optimization

1. **React.memo**: Memoize component to prevent unnecessary re-renders
2. **useMemo**: Memoize expensive calculations (chart data, stats)
3. **useCallback**: Memoize event handlers
4. **Lazy Loading**: Load chart data only when needed

### Memory Management

1. **Chart Data**: Limit chart data points to essential minimum
2. **Image Caching**: Optimize logo/image loading
3. **Data Cleanup**: Clean up unused data references
4. **Cache Management**: Implement proper cache invalidation

### Network Optimization

1. **Data Batching**: Batch asset updates where possible
2. **Incremental Updates**: Update only changed data
3. **Offline Support**: Use cached data when offline
4. **Error Recovery**: Graceful degradation on network errors