# Placeholder Investment Cards - Perplexity Redesign Update

**Date:** 2025-10-09  
**Status:** ✅ Complete  
**File:** `C9FR/src/screens/main/AssetsScreen.tsx`

---

## Overview

In addition to updating the main asset card components (`AssetCard.tsx`, `TradableAssetCard.tsx`, `PhysicalAssetCard.tsx`), the **placeholder/mock investment cards** displayed in the `AssetsScreen.tsx` have also been updated to match the Perplexity design aesthetic.

---

## What Are Placeholder Cards?

The `AssetsScreen.tsx` file contains an **inline `InvestmentCard` component** (starting at line 231) that renders mock/placeholder investment data for demonstration purposes. These cards display sample stocks like:

- Gartner, Inc. (IT)
- Vertex Pharmaceuticals (VRTX)
- Apple Inc. (AAPL)
- Microsoft Corporation (MSFT)
- Tesla, Inc. (TSLA)
- NVIDIA Corporation (NVDA)

These placeholder cards are shown when the app is in demo mode or when real asset data is not available.

---

## Changes Made

### 1. Component Logic Updates

**Before:**
```typescript
const InvestmentCard = ({ investment }: { investment: any; index: number }) => {
  const isNegative = investment.change < 0;
  const changeColor = isNegative ? '#ef4444' : '#22c55e'; // Green for positive
  // ...
};
```

**After:**
```typescript
const InvestmentCard = ({ investment }: { investment: any; index: number }) => {
  const isNegative = investment.change < 0;
  const chartColor = isNegative ? '#ef4444' : '#22d3ee'; // Cyan for positive (Perplexity)
  const percentageColor = isNegative ? '#ef4444' : '#10b981'; // Green for percentage
  // ...
};
```

**Key Changes:**
- ✅ Separated chart color from percentage color
- ✅ Chart uses cyan (#22d3ee) for positive trends (Perplexity signature)
- ✅ Percentage uses green (#10b981) for positive values

---

### 2. Header Section Updates

**Before:**
```typescript
<View style={styles.pixelPerfectHeader}>
  <View style={styles.pixelPerfectLeft}>
    <View style={styles.pixelPerfectIcon}>
      <Text style={styles.pixelPerfectIconText}>{investment.symbol}</Text>
    </View>
    // ...
  </View>
  <View style={styles.pixelPerfectRight}>
    <Text style={styles.pixelPerfectPrice}>
      ${investment.price.toFixed(2)}
    </Text>
    <Text style={[styles.pixelPerfectChange, { color: changeColor }]}>
      ↓ {Math.abs(investment.changePercent).toFixed(2)}%
    </Text>
  </View>
</View>
```

**After:**
```typescript
<View style={styles.perplexityHeader}>
  <View style={styles.perplexityLeft}>
    <View style={styles.perplexityIconFallback}>
      <Text style={styles.perplexityIconText}>{investment.symbol.substring(0, 2)}</Text>
    </View>
    // ...
  </View>
  <View style={styles.perplexityRight}>
    <Text style={styles.perplexityPrice}>
      ${investment.price.toFixed(2)}
    </Text>
    <View style={styles.perplexityChangeContainer}>
      <Text style={[styles.perplexityChangeIcon, { color: percentageColor }]}>
        {isNegative ? '↓' : '↑'}
      </Text>
      <Text style={[styles.perplexityChange, { color: percentageColor }]}>
        {Math.abs(investment.changePercent).toFixed(2)}%
      </Text>
    </View>
  </View>
</View>
```

**Key Changes:**
- ✅ Updated all style names from `pixelPerfect*` to `perplexity*`
- ✅ Icon shows first 2 letters of symbol instead of full symbol
- ✅ Percentage change separated into icon and text
- ✅ Dynamic arrow direction based on performance

---

### 3. Chart Section Updates

**Before:**
```typescript
<Line
  key={idx}
  x1={x1}
  y1={y1}
  x2={x2}
  y2={y2}
  stroke={changeColor} // Green or red
  strokeWidth="2.5"
/>
```

**After:**
```typescript
<Line
  key={idx}
  x1={x1}
  y1={y1}
  x2={x2}
  y2={y2}
  stroke={chartColor} // Cyan or red
  strokeWidth="2.5"
  strokeLinecap="round" // NEW: Rounded line caps
/>
```

**Key Changes:**
- ✅ Chart uses cyan (#22d3ee) for positive trends
- ✅ Added rounded line caps for smoother appearance
- ✅ Dynamic timestamp: `new Date().toLocaleTimeString()`

---

### 4. Stats Section Updates

**Before:**
```typescript
<View style={styles.pixelPerfectStatsSection}>
  <View style={styles.pixelPerfectStatRow}>
    <Text style={styles.pixelPerfectStatLabel}>Growth Rate</Text>
    <Text style={[
      styles.pixelPerfectStatValue,
      { color: investment.growthRate > 0 ? '#22c55e' : '#ef4444' }
    ]}>
      {investment.growthRate ? `${investment.growthRate.toFixed(1)}%` : 'N/A'}
    </Text>
  </View>
</View>
```

**After:**
```typescript
<View style={styles.perplexityStatsSection}>
  <View style={styles.perplexityStatRow}>
    <Text style={styles.perplexityStatLabel}>Growth Rate</Text>
    <Text style={[
      styles.perplexityStatValue,
      { color: investment.growthRate > 0 ? '#10b981' : '#ef4444' }
    ]}>
      {investment.growthRate ? `${investment.growthRate.toFixed(1)}%` : 'N/A'}
    </Text>
  </View>
</View>
```

**Key Changes:**
- ✅ Updated all style names to `perplexity*`
- ✅ Growth rate uses green (#10b981) instead of cyan

---

### 5. Style Updates

**Card Container:**
```typescript
// BEFORE
exactReplicaCard: {
  backgroundColor: '#1a1a1a',
  borderRadius: 12,
  marginHorizontal: 20,
  marginBottom: 20,
  padding: 16,
  shadowOpacity: 0.3,
  shadowRadius: 8,
  elevation: 8,
}

// AFTER
exactReplicaCard: {
  backgroundColor: '#1a1a1a',
  borderRadius: 16,        // +33%
  marginHorizontal: 16,    // -20%
  marginBottom: 16,        // -20%
  padding: 20,             // +25%
  shadowOpacity: 0.4,      // +33%
  shadowRadius: 12,        // +50%
  elevation: 12,           // +50%
  borderWidth: 1,          // NEW
  borderColor: '#2a2a2a',  // NEW
}
```

**Icon:**
```typescript
// BEFORE
pixelPerfectIcon: {
  width: 36,
  height: 36,
  borderRadius: 8,
  backgroundColor: '#374151', // Gray
}

// AFTER
perplexityIconFallback: {
  width: 48,                  // +33%
  height: 48,                 // +33%
  borderRadius: 8,
  backgroundColor: '#dc2626', // Red
}
```

**Typography:**
```typescript
// BEFORE
pixelPerfectCompanyName: {
  fontSize: 17,
  fontWeight: '600',
}

// AFTER
perplexityCompanyName: {
  fontSize: 18,              // +6%
  fontWeight: '600',
  letterSpacing: -0.3,       // NEW
}
```

---

## Complete Style Mapping

| Old Style Name | New Style Name | Changes |
|----------------|----------------|---------|
| `pixelPerfectHeader` | `perplexityHeader` | alignItems: 'flex-start' |
| `pixelPerfectLeft` | `perplexityLeft` | marginRight: 16 |
| `pixelPerfectIcon` | `perplexityIconFallback` | 48x48, red background |
| `pixelPerfectIconText` | `perplexityIconText` | 16px, letterSpacing: 0.5 |
| `pixelPerfectCompanyInfo` | `perplexityCompanyInfo` | justifyContent: 'center' |
| `pixelPerfectCompanyName` | `perplexityCompanyName` | 18px, letterSpacing: -0.3 |
| `pixelPerfectSymbol` | `perplexitySymbol` | 13px, letterSpacing: 0.2 |
| `pixelPerfectRight` | `perplexityRight` | alignItems: 'flex-end' |
| `pixelPerfectPrice` | `perplexityPrice` | 24px, letterSpacing: -0.5 |
| `pixelPerfectChange` | `perplexityChange` | 16px, letterSpacing: 0.2 |
| - | `perplexityChangeContainer` | NEW: flexDirection: 'row' |
| - | `perplexityChangeIcon` | NEW: 16px, fontWeight: '700' |
| `pixelPerfectBody` | `perplexityBody` | minHeight: 100 |
| `pixelPerfectChartSection` | `perplexityChartSection` | marginRight: 24 |
| `pixelPerfectYAxis` | `perplexityYAxis` | width: 40, paddingRight: 8 |
| `pixelPerfectYLabel` | `perplexityYLabel` | textAlign: 'right' |
| `pixelPerfectChartContainer` | `perplexityChartContainer` | justifyContent: 'center' |
| `pixelPerfectChart` | `perplexityChart` | flex: 1, alignItems: 'center' |
| `pixelPerfectTime` | `perplexityTime` | Same positioning |
| `pixelPerfectStatsSection` | `perplexityStatsSection` | width: 130 |
| `pixelPerfectStatRow` | `perplexityStatRow` | marginBottom: 10 |
| `pixelPerfectStatLabel` | `perplexityStatLabel` | 12px, letterSpacing: 0.1 |
| `pixelPerfectStatValue` | `perplexityStatValue` | 15px, letterSpacing: -0.2 |
| `pixelPerfectInsightContainer` | `perplexityInsightContainer` | borderTopColor: '#2a2a2a' |
| `pixelPerfectInsightText` | `perplexityInsightText` | letterSpacing: 0.1 |

---

## Visual Improvements

### Before (Old Design)
- 36x36 gray icon
- 17px company name
- 20px price
- Green chart for positive
- 13px stats
- Static "6:00 PM" time

### After (Perplexity Design)
- 48x48 red icon
- 18px company name with letter spacing
- 24px price with letter spacing
- Cyan chart for positive
- 15px stats with letter spacing
- Dynamic current time

---

## Testing

### Visual Verification
- [x] Placeholder cards match Perplexity design
- [x] Cyan chart color for positive trends
- [x] Green percentage for positive changes
- [x] Red icon background (48x48)
- [x] Enhanced typography with letter spacing
- [x] Dynamic timestamp displays correctly

### Functional Verification
- [x] All 6 placeholder investments render correctly
- [x] Positive and negative performance indicators work
- [x] Charts render with correct colors
- [x] Stats display properly
- [x] No TypeScript errors
- [x] No console warnings

---

## Impact

### User Experience
- ✅ Consistent design across all asset cards (real and placeholder)
- ✅ Modern, professional appearance
- ✅ Better visual hierarchy
- ✅ Enhanced readability

### Code Quality
- ✅ Consistent naming convention (perplexity*)
- ✅ Separated chart and percentage colors
- ✅ Dynamic timestamp instead of static
- ✅ Cleaner, more maintainable code

---

## Summary

The placeholder investment cards in `AssetsScreen.tsx` have been successfully updated to match the Perplexity design aesthetic, ensuring a **consistent visual experience** across all asset cards in the application, whether they're displaying real data or placeholder/demo data.

**Key Achievements:**
- ✅ All placeholder cards now use Perplexity-style design
- ✅ Cyan chart color for positive trends (signature Perplexity look)
- ✅ Enhanced typography and spacing
- ✅ Larger, color-coded icons (48x48, red)
- ✅ Dynamic timestamp display
- ✅ Consistent with main asset card components
- ✅ Zero breaking changes
- ✅ Production ready

---

**Status:** ✅ Complete  
**Files Modified:** 1 (`AssetsScreen.tsx`)  
**Lines Changed:** ~150 lines  
**Breaking Changes:** None  
**Backward Compatible:** Yes

