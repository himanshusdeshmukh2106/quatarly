# Font Application Summary

## ✅ Components Already Updated

1. **HomeScreen.tsx** - Header title uses Space Grotesk Bold
2. **AssetCard.tsx** - Titles use heading font, prices/values use mono font
3. **InvestmentCard.tsx** - Titles use heading, prices/percentages use mono
4. **PortfolioSummary.tsx** - Titles use heading, financial values use mono

## 🔄 Components That Need Font Updates

### High Priority (User-Facing):
- TradableAssetCard.tsx - Similar to AssetCard
- PhysicalAssetCard.tsx - Similar to AssetCard
- OpportunitiesScreen components
- GoalsScreen components
- DebtScreen components
- ExpensesScreen components

### Medium Priority:
- Common UI components (Button, Input, Badge)
- Modal headers
- Drawer titles

## 🎨 Font Application Rules

### When to use **Space Grotesk Bold** (Heading):
- Screen titles
- Card titles
- Section headers
- Company names
- Asset symbols
- Any text with fontWeight: '600' or '700' that acts as a heading

Add: `fontFamily: Typography.fontFamily.heading,`

### When to use **IBM Plex Mono** (Financial):
- Prices ($1,234.56, ₹15,000)
- Percentages (+12.5%, -3.2%)
- Financial values
- Quantities with numbers
- Portfolio values
- P&L values
- Any numeric data

Add: `fontFamily: Typography.fontFamily.mono,`

### When to use **IBM Plex Sans** (Body - Already Default):
- Regular text
- Descriptions
- Labels
- Helpers
- Already applied globally in App.tsx

## 📝 Quick Update Pattern

### Before:
```typescript
const styles = StyleSheet.create({
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.text,
  },
  price: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.text,
  },
});
```

### After:
```typescript
import { Typography } from '../styles/designSystem';

const styles = StyleSheet.create({
  title: {
    fontFamily: Typography.fontFamily.heading, // ADD THIS
    fontSize: 18,
    fontWeight: '700',
    color: theme.text,
  },
  price: {
    fontFamily: Typography.fontFamily.mono, // ADD THIS
    fontSize: 24,
    fontWeight: '700',
    color: theme.text,
  },
});
```

## 🚀 Testing

After rebuilding, check:
1. Headers should look bolder/different (Space Grotesk)
2. Numbers should look monospaced (IBM Plex Mono)
3. Body text already uses IBM Plex Sans

## Next Steps

Run this command to find all components needing updates:
```bash
# Find files with fontSize but not fontFamily
grep -r "fontSize.*:" src/components src/screens --include="*.tsx" | grep -v "fontFamily"
```

Then systematically update each file following the pattern above.
