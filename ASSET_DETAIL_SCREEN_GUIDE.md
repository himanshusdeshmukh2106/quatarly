# Asset Detail Screen - Visual Guide

## Screen Layout

```
┌─────────────────────────────────────────┐
│  ← [Logo] Asset Name              [ ]  │ ← Header with back button
├─────────────────────────────────────────┤
│ Overview | Financials | Historical...  │ ← Tabs
├─────────────────────────────────────────┤
│                                         │
│  ₹3,054                                │ ← Current Price (Large)
│  ↑ ₹48.60  +1.57%                     │ ← Change (Green/Red)
│  At close: Aug 22, 6:00:00 AM EDT     │ ← Timestamp
│                                         │
├─────────────────────────────────────────┤
│  [1D] [5D] [1M] [6M] [YTD] [1Y] [5Y]  │ ← Timeframe Selector
│                                         │
│  ┌───────────────────────────────────┐ │
│  │                                   │ │
│  │        Chart Visualization        │ │ ← Chart Area
│  │                                   │ │
│  └───────────────────────────────────┘ │
│  ↑ ₹48.60        Prev close: ₹3,102.60│
│                                         │
├─────────────────────────────────────────┤
│  Financial Profile                      │
│                                         │
│  Prev Close        52W Range           │
│  ₹3.10K           ₹2.99K - ₹4.59K     │
│                                         │
│  Market Cap        Open                │
│  ₹11.05T          ₹3.09K              │
│                                         │
│  P/E Ratio         Dividend Yield      │
│  22.42            3.83%                │
│                                         │
│  Day Range         Volume              │
│  ₹3.05K - ₹3.10K  1.6M                │
│                                         │
│  EPS                                   │
│  ₹136.21                               │
│                                         │
├─────────────────────────────────────────┤
│  AI Insights                           │
│  💡 [AI analysis text here...]         │
│                                         │
├─────────────────────────────────────────┤
│  Latest News                           │
│  📰 Market Update: Asset Performance   │
│     ⏰ Aug 22, 2025                    │
│                                         │
└─────────────────────────────────────────┘
```

## Color Scheme

### Background Colors
- **Main Background**: `#191a1a` (Dark charcoal)
- **Card Background**: `#1A1A1A` (Slightly lighter)
- **Border**: `#2A2A2A` (Subtle gray)

### Text Colors
- **Primary Text**: `#FFFFFF` (White)
- **Secondary Text**: `#E8E8E8` (Light gray)
- **Muted Text**: `#8A8A8A` (Medium gray)

### Accent Colors
- **Primary Accent**: `#20D9D2` (Teal) - Used for active tabs, buttons
- **Success**: `#22C55E` (Green) - Positive changes
- **Danger**: `#EF4444` (Red) - Negative changes

## Interactive Elements

### 1. Back Button (Top Left)
- Icon: `arrow-back`
- Action: Navigate back to Assets Screen
- Color: White

### 2. Tabs
- **Active Tab**: Teal underline, white text
- **Inactive Tab**: Gray text, no underline
- Tabs: Overview, Financials, Historical Data, Earnings

### 3. Timeframe Selector
- **Active Button**: Darker background, white text
- **Inactive Button**: Lighter background, gray text
- Options: 1D, 5D, 1M, 6M, YTD, 1Y, 5Y, MAX

### 4. Chart Area
- Placeholder with simulated line
- Color matches positive/negative trend
- Shows gradient fill below line

## Data Display Format

### Price Format
```typescript
₹3,054.00  // Indian Rupee with 2 decimals
$1,234.56  // US Dollar with 2 decimals
```

### Change Format
```typescript
↑ ₹48.60 +1.57%  // Positive (Green)
↓ ₹48.60 -1.57%  // Negative (Red)
```

### Compact Numbers
```typescript
₹11.05T  // Trillion
₹1.23B   // Billion
₹45.67Cr // Crore (Indian)
₹12.34L  // Lakh (Indian)
₹5.67K   // Thousand
```

## Component Hierarchy

```
AssetDetailScreen
├── SafeAreaView
│   ├── StatusBar (light-content)
│   └── View (container)
│       ├── GeometricBackground (opacity: 0.05)
│       ├── Header
│       │   ├── BackButton
│       │   ├── HeaderInfo (Logo + Title)
│       │   └── Placeholder
│       └── ScrollView
│           ├── TabsContainer
│           ├── PriceSection
│           ├── ChartContainer
│           │   ├── TimeframeSelector
│           │   ├── ChartDisplay
│           │   └── ChartStats
│           ├── FinancialProfile
│           │   └── ProfileGrid (2 columns)
│           ├── AIInsights (if available)
│           └── LatestNews
```

## Responsive Behavior

### Spacing
- Horizontal padding: `16px` (perplexitySpacing.lg)
- Vertical sections: `20px` (perplexitySpacing.xl)
- Card padding: `16px`
- Gap between items: `12px` (perplexitySpacing.md)

### Grid Layout
- Financial Profile: 2-column grid
- Each row has equal-width columns
- Responsive to screen width

## Animation & Transitions

### Navigation
- Slide from right (default stack navigation)
- Fade in background

### Tab Selection
- Instant color change
- Underline animation (if implemented)

### Button Press
- Opacity: 0.7 (activeOpacity)
- No scale animation

## Accessibility

### Labels
- Back button: "Navigate back"
- Tabs: "Overview tab", "Financials tab", etc.
- Timeframe buttons: "1 day", "5 days", etc.

### Roles
- TouchableOpacity: "button"
- Text: "text"
- ScrollView: "scrollable"

## Data Flow

```
AssetsScreen
    ↓ (onPress)
Investment Data
    ↓ (transform)
Asset Data {
  id, name, symbol,
  currentPrice, change,
  totalValue, metrics,
  aiAnalysis, etc.
}
    ↓ (navigate)
AssetDetailScreen
    ↓ (display)
Formatted UI
```

## Example Asset Data Structure

```typescript
{
  id: "1",
  name: "Tata Consultancy Services Limited",
  assetType: "stock",
  symbol: "TCS",
  exchange: "NSE",
  currency: "INR",
  currentPrice: 3054,
  dailyChange: -48.60,
  dailyChangePercent: -1.57,
  totalValue: 30540,
  totalGainLoss: -486,
  totalGainLossPercent: -1.57,
  marketCap: 11050000000000,
  volume: "1.6M",
  peRatio: 22.42,
  growthRate: 3.83,
  aiAnalysis: "Strong fundamentals...",
  riskLevel: "medium",
  recommendation: "hold",
  lastUpdated: "2025-08-22T06:00:00Z"
}
```

## Testing Scenarios

1. **Positive Change Asset**
   - Green colors for change
   - Up arrow (↑)
   - Green chart line

2. **Negative Change Asset**
   - Red colors for change
   - Down arrow (↓)
   - Red chart line

3. **With AI Analysis**
   - AI Insights section visible
   - Lightbulb icon shown

4. **Without AI Analysis**
   - AI Insights section hidden

5. **Different Asset Types**
   - Stock: Full metrics
   - ETF: Similar to stock
   - Physical: Different metrics

## Performance Considerations

- Geometric background: Low opacity (0.05) for performance
- ScrollView: Optimized with showsVerticalScrollIndicator={false}
- Images: Lazy loaded (if implemented)
- Chart: SVG-based for smooth rendering

## Status Indicators

✅ Implemented
🚧 Placeholder (needs real data)
📋 Future enhancement

- ✅ Navigation
- ✅ Layout
- ✅ Styling
- ✅ Tabs UI
- 🚧 Chart data
- 🚧 Tab content switching
- 📋 Real-time updates
- 📋 Share functionality
