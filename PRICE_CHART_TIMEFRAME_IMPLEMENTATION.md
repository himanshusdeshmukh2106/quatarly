# Price Chart Timeframe Selector Implementation

## Overview
Implemented an interactive timeframe selector for the price chart in the AssetDetailScreen, matching the Perplexity design pattern.

## Features Implemented

### 1. Timeframe Button
- **Location**: Top-left corner of the chart card
- **Display**: Shows current selected timeframe (e.g., "6 month")
- **Interaction**: Tappable button with dropdown icon
- **Styling**: Semi-transparent dark background with border, matching the app theme

### 2. Bottom Sheet Modal
- **Animation**: Slides up from bottom when button is pressed
- **Backdrop**: Semi-transparent overlay (70% opacity)
- **Design**: Rounded top corners, dark theme matching the app

### 3. Timeframe Options
Available timeframes:
- 1 day
- 5 day
- 1 month
- 6 month (default)
- Year to date
- 1 year
- 5 year
- Max

### 4. Selection Indicator
- Selected option highlighted in cyan/super color
- Checkmark icon appears next to selected option
- Bold text weight for selected item

## Files Modified

### New Files
1. **C9FR/src/components/TimeframeSelector.tsx**
   - Reusable bottom sheet component
   - Handles timeframe selection logic
   - Accessible with proper ARIA labels

### Modified Files
1. **C9FR/src/screens/AssetDetailScreen.tsx**
   - Added timeframe state management
   - Integrated TimeframeSelector component
   - Added timeframe button overlay on chart
   - Implemented callbacks for selection handling

## Technical Details

### State Management
```typescript
const [selectedTimeframe, setSelectedTimeframe] = useState<Timeframe>('6M');
const [showTimeframeSelector, setShowTimeframeSelector] = useState(false);
```

### Timeframe Type
```typescript
export type Timeframe = '1D' | '5D' | '1M' | '6M' | 'YTD' | '1Y' | '5Y' | 'MAX';
```

### Key Features
- **Memoized label computation** for performance
- **Callback optimization** with useCallback
- **Accessibility support** with proper labels and hints
- **Modal backdrop dismissal** by tapping outside
- **Smooth animations** with React Native's Modal component

## Usage

The timeframe selector is now fully functional:
1. Tap the timeframe button in the top-left of the chart
2. Bottom sheet slides up with all available options
3. Tap any option to select it
4. Sheet automatically closes after selection
5. Selected timeframe is displayed on the button

## Next Steps (Optional Enhancements)

1. **Chart Data Integration**: Connect timeframe selection to actual chart data API
2. **Chart Animation**: Animate chart transitions when timeframe changes
3. **Loading States**: Add loading indicator while fetching new chart data
4. **Error Handling**: Handle API errors gracefully
5. **Persistence**: Save user's preferred timeframe to AsyncStorage
6. **Chart Library**: Consider integrating a proper charting library (e.g., react-native-chart-kit, victory-native) for real data visualization

## Design Compliance

✅ Matches Perplexity design pattern
✅ Consistent with app's dark theme
✅ Uses perplexity color palette
✅ Proper spacing and typography
✅ Smooth user interactions
✅ Accessible for screen readers
