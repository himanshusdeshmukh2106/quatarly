# Design Document

## Overview

The asset management feature will provide users with a comprehensive portfolio management interface that displays their diverse asset holdings through adaptive cards with relevant performance data. The design maintains consistency with existing goals and opportunities pages while introducing specialized capabilities for different asset types including tradeable securities (stocks, ETFs, bonds, crypto) and physical assets (gold, silver, commodities). The feature includes automated PDF import functionality for password-protected holding statements and displays appropriate visualizations based on asset type.

## Architecture

### Component Hierarchy

```
AssetsScreen
├── ScrollView (with RefreshControl)
├── Asset Type Filter/Tabs
├── Asset Cards
│   ├── AssetCard (adaptive based on asset type)
│   │   ├── TradableAssetCard (stocks, ETFs, bonds, crypto)
│   │   │   ├── CandlestickChart (for stocks/crypto)
│   │   │   ├── PriceChart (for bonds)
│   │   │   └── Asset Information Display
│   │   └── PhysicalAssetCard (gold, silver, commodities)
│   │       ├── Asset Information Display
│   │       └── Manual Value Tracking
│   └── AssetInsightsButton
├── AddAssetModal
│   ├── AssetTypeSelector
│   ├── ManualEntryForm
│   └── PDFImportComponent
└── AssetInsightsDrawer
    ├── Portfolio Summary
    ├── AI Analysis
    ├── Asset-specific Insights
    └── Action Recommendations
```

### Data Flow

1. **Initial Load**: Fetch user's complete asset portfolio from backend API
2. **Chart Data**: Retrieve historical price data for tradeable assets (daily updates)
3. **PDF Import**: Process password-protected PDFs to extract holding data
4. **Price Updates**: Daily price updates for market-traded assets
5. **Insights Generation**: AI-powered analysis based on portfolio composition and asset performance
6. **User Interactions**: Touch events on charts and asset-specific actions

## Components and Interfaces

### AssetsScreen Component

**Props**: None (screen component)

**State Management**:
```typescript
interface AssetsScreenState {
  assets: Asset[];
  loading: boolean;
  refreshing: boolean;
  selectedAsset: Asset | null;
  showInsightsDrawer: boolean;
  error: string | null;
  activeFilter: AssetType | 'all';
  marketStatus: 'open' | 'closed' | 'pre-market' | 'after-hours';
}
```

**Key Features**:
- Pull-to-refresh functionality
- Asset type filtering/tabs
- Error handling with retry mechanisms
- Loading states with skeleton screens
- Market status indicator for tradeable assets
- Add new asset functionality with type selection

### AssetCard Component

**Props**:
```typescript
interface AssetCardProps {
  asset: Asset;
  onInsightsPress: (asset: Asset) => void;
  onChartInteraction?: (touchData: ChartTouchData) => void;
}
```

**Features**:
- Adaptive display based on asset type
- For tradeable assets: embedded charts, real-time prices, daily changes
- For physical assets: manual value tracking, quantity display
- Asset name, type, and current value display
- Color coding for gains/losses
- Touch interactions for supported chart types
- Loading states for dynamic data

### TradableAssetCard Component

**Props**:
```typescript
interface TradableAssetCardProps {
  asset: TradableAsset;
  onInsightsPress: (asset: Asset) => void;
  onChartInteraction?: (touchData: ChartTouchData) => void;
}
```

**Features**:
- Embedded candlestick chart for stocks/crypto (150px height)
- Price chart for bonds showing yield curves
- Symbol, name, and current price display
- Daily change percentage with color coding
- Quantity owned and total value
- Touch interactions for chart exploration

### PhysicalAssetCard Component

**Props**:
```typescript
interface PhysicalAssetCardProps {
  asset: PhysicalAsset;
  onInsightsPress: (asset: Asset) => void;
}
```

**Features**:
- Asset name and type display
- Quantity and unit price information
- Total value calculation
- Manual value update capability
- Last updated timestamp
- No chart display (manual tracking only)

### CandlestickChart Component

**Props**:
```typescript
interface CandlestickChartProps {
  data: CandlestickData[];
  width: number;
  height: number;
  onTouch?: (touchData: ChartTouchData) => void;
  interactive?: boolean;
  timeframe: 'daily' | 'weekly' | 'monthly';
}
```

**Chart Library**: Victory Native or react-native-chart-kit
- Interactive touch gestures (pan, zoom, crosshair)
- Customizable timeframes
- Real-time data updates
- Responsive design for different screen sizes
- Financial color scheme (green/red for gains/losses)

### AssetInsightsDrawer Component

**Props**:
```typescript
interface AssetInsightsDrawerProps {
  visible: boolean;
  asset: Asset | null;
  onClose: () => void;
}
```

**Content Sections**:
- Asset summary (current value, P&L, allocation)
- AI-generated analysis tailored to asset type
- Market insights for tradeable assets
- Personalized recommendations
- Risk assessment and portfolio impact

### AddAssetModal Component

**Props**:
```typescript
interface AddAssetModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (assetData: CreateAssetRequest) => void;
  loading: boolean;
}
```

**Features**:
- Asset type selection (stocks, ETFs, bonds, crypto, gold, silver, commodities)
- Conditional input forms based on asset type
- Manual entry for all asset types
- PDF import option for tradeable securities
- Asset validation and verification
- Error handling for invalid data

### PDFImportComponent

**Props**:
```typescript
interface PDFImportComponentProps {
  onImportComplete: (assets: ParsedAssetData[]) => void;
  onError: (error: string) => void;
  loading: boolean;
}
```

**Features**:
- File picker for PDF selection
- Password input for encrypted PDFs
- PDF parsing and data extraction
- Preview of detected holdings
- Confirmation before adding to portfolio
- Support for multiple brokerage statement formats

### AssetTypeSelector Component

**Props**:
```typescript
interface AssetTypeSelectorProps {
  selectedType: AssetType | null;
  onTypeSelect: (type: AssetType) => void;
}
```

**Features**:
- Visual asset type cards (stocks, ETFs, bonds, crypto, gold, silver, commodities)
- Clear categorization between tradeable and physical assets
- Icons and descriptions for each asset type
- Selection state management

## Data Models

### Base Asset Interface

```typescript
interface Asset {
  id: string;
  name: string;
  assetType: AssetType;
  totalValue: number;
  
  // Performance Metrics
  totalGainLoss: number;
  totalGainLossPercent: number;
  
  // AI Insights
  aiAnalysis: string;
  riskLevel: 'low' | 'medium' | 'high';
  recommendation: 'buy' | 'hold' | 'sell' | 'monitor';
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  lastUpdated: string;
}

type AssetType = 'stock' | 'etf' | 'bond' | 'crypto' | 'gold' | 'silver' | 'commodity';
```

### TradableAsset Interface (extends Asset)

```typescript
interface TradableAsset extends Asset {
  symbol: string; // e.g., "AAPL", "BTC-USD"
  exchange: string; // e.g., "NASDAQ", "NSE", "Binance"
  currency: string; // e.g., "USD", "INR"
  
  // Holdings Information
  quantity: number;
  averagePurchasePrice: number;
  currentPrice: number;
  
  // Performance Metrics
  dailyChange: number;
  dailyChangePercent: number;
  
  // Chart Data (for stocks, crypto)
  chartData: CandlestickData[];
  
  // Metadata
  logoUrl?: string;
  sector?: string;
  marketCap?: number;
  dividendYield?: number; // for stocks
  yieldToMaturity?: number; // for bonds
  maturityDate?: string; // for bonds
}
```

### PhysicalAsset Interface (extends Asset)

```typescript
interface PhysicalAsset extends Asset {
  // Holdings Information
  quantity: number;
  unit: string; // e.g., "grams", "ounces", "kg"
  purchasePrice: number; // per unit
  currentMarketPrice?: number; // per unit (optional, manually updated)
  
  // Physical Asset Specific
  purity?: string; // e.g., "24K", "22K" for gold
  storage?: string; // storage location or method
  certificate?: string; // certificate number if applicable
  
  // Manual tracking
  manuallyUpdated: boolean;
}
```

### CandlestickData Interface

```typescript
interface CandlestickData {
  date: string; // ISO date string
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  timestamp: number;
}
```

### ChartTouchData Interface

```typescript
interface ChartTouchData {
  x: number;
  y: number;
  date: string;
  price: number;
  candlestick: CandlestickData;
}
```

### CreateAssetRequest Interface

```typescript
interface CreateAssetRequest {
  assetType: AssetType;
  name: string;
  
  // For tradeable assets
  symbol?: string;
  exchange?: string;
  currency?: string;
  
  // Common fields
  quantity: number;
  purchasePrice: number;
  purchaseDate?: string;
  
  // For physical assets
  unit?: string;
  purity?: string;
  storage?: string;
  certificate?: string;
}
```

### ParsedAssetData Interface (for PDF import)

```typescript
interface ParsedAssetData {
  symbol: string;
  name: string;
  quantity: number;
  averagePurchasePrice: number;
  currentValue?: number;
  assetType: 'stock' | 'etf' | 'bond' | 'crypto';
  confidence: number; // parsing confidence score
}
```

### PDFParsingResult Interface

```typescript
interface PDFParsingResult {
  success: boolean;
  assets: ParsedAssetData[];
  errors: string[];
  warnings: string[];
  totalAssetsFound: number;
  parsingConfidence: number;
}
```

## Error Handling

### Chart Data Errors
- **No Data Available**: Display placeholder chart with message
- **API Failures**: Show retry button with error message
- **Invalid Symbol**: Validate symbols before adding tradeable assets
- **Network Issues**: Cache last known data with timestamp

### PDF Import Errors
- **Invalid Password**: Prompt user to re-enter password with clear error message
- **Corrupted PDF**: Display error message and fallback to manual entry
- **Parsing Failures**: Show partial results with manual correction options
- **Unsupported Format**: Provide format guidelines and manual entry alternative
- **Large File Size**: Implement file size limits with compression suggestions

### Daily Update Errors
- **API Rate Limiting**: Implement exponential backoff for price updates
- **Market Closure**: Display last known prices with closure notice
- **Data Provider Issues**: Fallback to alternative data sources

### User Input Errors
- **Invalid Quantities**: Validate positive numbers only
- **Symbol Not Found**: Provide search suggestions for tradeable assets
- **Duplicate Assets**: Allow multiple entries with different purchase dates
- **Missing Required Fields**: Highlight required fields based on asset type

## Testing Strategy

### Unit Tests
- **AssetCard Components**: Rendering with different asset types and states
- **CandlestickChart Component**: Chart rendering and touch interactions
- **PDFImportComponent**: PDF parsing and data extraction
- **Data Transformations**: API response to frontend model conversion
- **Utility Functions**: Price formatting, percentage calculations, asset type validation

### Integration Tests
- **API Integration**: Asset CRUD operations across different asset types
- **Chart Data Loading**: Historical data fetching and caching for tradeable assets
- **PDF Import Flow**: End-to-end PDF parsing and asset creation
- **Daily Updates**: Price update mechanisms for tradeable assets
- **Insights Generation**: AI analysis integration for different asset types

### E2E Tests
- **Asset Management Flow**: Add, view, edit, delete assets of different types
- **PDF Import Workflow**: Select PDF, enter password, preview, and confirm import
- **Chart Interactions**: Touch gestures and data display for tradeable assets
- **Asset Type Filtering**: Filter and display assets by type
- **Insights Drawer**: Open, navigate, and close functionality for different asset types
- **Refresh Functionality**: Pull-to-refresh and data updates

### Performance Tests
- **Chart Rendering**: Large datasets and smooth animations
- **PDF Processing**: Large PDF files and parsing performance
- **Memory Usage**: Multiple charts and data caching
- **Network Efficiency**: Optimized API calls and data compression

## UI/UX Consistency

### Design System Alignment
- **Card Layout**: Same border radius (12px), elevation, and spacing as goals/opportunities
- **Color Scheme**: Financial theme colors for gains/losses (green/red)
- **Typography**: Consistent font weights and sizes across components
- **Icons**: Material Community Icons for consistency

### Interaction Patterns
- **Insights Drawer**: Same animation and gesture handling as existing drawers
- **Loading States**: Consistent skeleton screens and loading indicators
- **Error States**: Same error message styling and retry mechanisms
- **Pull-to-Refresh**: Identical implementation to other screens

### Accessibility
- **Screen Reader Support**: Proper labels for chart data and prices
- **Touch Targets**: Minimum 44px touch areas for all interactive elements
- **Color Contrast**: WCAG AA compliance for text and background colors
- **Voice Over**: Descriptive labels for investment performance

## Daily Price Update Architecture

### Price Update Service
```typescript
interface PriceUpdateService {
  fetchDailyPrices(symbols: string[]): Promise<PriceUpdate[]>;
  scheduleUpdates(): void;
  getLastUpdateTime(): string;
  updateAssetPrices(assets: TradableAsset[]): Promise<TradableAsset[]>;
}
```

### Update Strategy
- **Daily Updates**: Fetch latest closing prices once per day
- **App Launch**: Check for updates when app becomes active
- **Manual Refresh**: Allow user-triggered price updates
- **Error Recovery**: Retry failed updates with exponential backoff

### Data Caching Strategy
- **Chart Data**: Cache 30-day historical data locally
- **Price Updates**: Store last 100 price updates per symbol
- **Offline Support**: Display cached data when network unavailable
- **Cache Invalidation**: Refresh on app foreground and daily basis

## Performance Optimizations

### Chart Rendering
- **Data Sampling**: Reduce data points for smaller screens
- **Lazy Loading**: Load charts as they come into viewport
- **Memory Management**: Dispose of off-screen chart instances
- **Animation Optimization**: Use native driver for smooth interactions

### API Efficiency
- **Batch Requests**: Fetch multiple symbols in single API call
- **Data Compression**: Use gzip compression for large datasets
- **Request Debouncing**: Prevent excessive API calls during interactions
- **Caching Headers**: Implement proper HTTP caching strategies

### State Management
- **Selective Updates**: Only re-render changed investment cards
- **Memoization**: Use React.memo for expensive components
- **State Normalization**: Flatten data structures for efficient updates
- **Background Processing**: Handle data transformations off main thread