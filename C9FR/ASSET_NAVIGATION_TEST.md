# Asset Navigation Testing Guide

## Quick Test Steps

### 1. Start the App
```bash
npm start
# or
yarn start
```

### 2. Navigate to Assets Tab
- Open the app
- Tap on the "Assets" tab (4th icon from left in bottom navigation)
- You should see the list of investment cards

### 3. Test Asset Card Press
- Tap on any investment card (e.g., "Tata Consultancy Services")
- The AssetDetailScreen should open with:
  - Back button in top-left
  - Asset name in header
  - Current price displayed prominently
  - Change indicator (↑ or ↓) with percentage
  - Tabs: Overview, Financials, Historical Data, Earnings
  - Timeframe selector buttons
  - Chart placeholder
  - Financial Profile section
  - AI Insights (if available)
  - Latest News section

### 4. Test Back Navigation
- Press the back button (←) in top-left
- Should return to Assets Screen
- Assets list should still be visible

### 5. Test Different Assets
- Try tapping on different investment cards
- Each should open with its own data
- Verify positive changes show green
- Verify negative changes show red

## Expected Behavior

### ✅ Success Indicators
- Smooth navigation transition
- Asset data displays correctly
- Colors match the theme (dark background, teal accents)
- Back button works
- No console errors
- Geometric background pattern visible

### ❌ Failure Indicators
- App crashes on card press
- Navigation doesn't work
- Data doesn't display
- Colors are wrong
- Back button doesn't work

## Debug Checklist

If navigation doesn't work:

1. **Check Navigation Setup**
   ```typescript
   // In AppNavigator.tsx
   <AppStack.Screen name="AssetDetail" component={AssetDetailScreen} />
   ```

2. **Check HomeScreen**
   ```typescript
   // Should have useNavigation hook
   const navigation = useNavigation<HomeScreenNavigationProp>();
   
   // Should pass navigation to AssetsScreenFinal
   <AssetsScreenFinal navigation={navigation} />
   ```

3. **Check AssetsScreenFinal**
   ```typescript
   // Should accept navigation prop
   interface AssetsScreenFinalProps {
     navigation?: any;
   }
   
   // Should call navigation.navigate
   navigation.navigate('AssetDetail', { asset: assetData });
   ```

4. **Check Console**
   - Look for TypeScript errors
   - Look for navigation errors
   - Look for missing dependencies

## Manual Testing Checklist

- [ ] App starts without errors
- [ ] Assets tab loads successfully
- [ ] Investment cards are visible
- [ ] Tapping a card navigates to detail screen
- [ ] Detail screen shows correct asset name
- [ ] Price and change display correctly
- [ ] Colors match the theme
- [ ] Back button returns to assets screen
- [ ] Can navigate to multiple different assets
- [ ] No memory leaks or performance issues
- [ ] Geometric background renders
- [ ] All sections are visible (price, chart, profile, insights, news)

## Common Issues & Solutions

### Issue 1: "Cannot read property 'navigate' of undefined"
**Solution:** Ensure navigation prop is passed from HomeScreen to AssetsScreenFinal

### Issue 2: "AssetDetail is not defined in navigation"
**Solution:** Check AppNavigator.tsx has AssetDetail screen registered

### Issue 3: Asset data is undefined
**Solution:** Verify data transformation in AssetsScreenFinal onPress handler

### Issue 4: Colors don't match
**Solution:** Ensure using perplexityColors from theme

### Issue 5: Back button doesn't work
**Solution:** Check navigation.goBack() is called correctly

## Performance Testing

### Metrics to Check
- Navigation transition: < 300ms
- Screen render: < 500ms
- Scroll performance: 60fps
- Memory usage: Stable (no leaks)

### Tools
- React DevTools
- React Native Debugger
- Performance Monitor (Cmd+D → Show Perf Monitor)

## Accessibility Testing

- [ ] VoiceOver/TalkBack can read all text
- [ ] Back button is accessible
- [ ] Tab buttons are accessible
- [ ] Timeframe buttons are accessible
- [ ] All interactive elements have labels

## Device Testing

Test on:
- [ ] iOS Simulator
- [ ] Android Emulator
- [ ] Physical iOS device
- [ ] Physical Android device
- [ ] Different screen sizes (small, medium, large)

## Edge Cases

1. **Asset with no AI analysis**
   - AI Insights section should be hidden

2. **Asset with very long name**
   - Should truncate or wrap properly

3. **Asset with extreme values**
   - Large numbers should format correctly (T, B, Cr, L, K)

4. **Rapid navigation**
   - Tap multiple cards quickly
   - Should handle gracefully

5. **Back button spam**
   - Press back button multiple times
   - Should not crash

## Regression Testing

After any changes, verify:
- [ ] Assets screen still loads
- [ ] Other tabs still work (Goals, Debt, Expenses, Opportunities)
- [ ] Profile modal still opens
- [ ] Bottom navigation still works
- [ ] Theme switching still works (if applicable)

## Sign-off

- [ ] All tests passed
- [ ] No critical bugs found
- [ ] Performance is acceptable
- [ ] Ready for production

**Tested by:** _____________
**Date:** _____________
**Device:** _____________
**OS Version:** _____________
**App Version:** _____________

## Notes

Add any additional observations or issues here:

---

