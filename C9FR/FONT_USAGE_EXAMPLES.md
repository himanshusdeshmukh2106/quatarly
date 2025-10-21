# Font Usage Examples

## ✅ Global Default Font Applied

After rebuilding, **ALL Text components** will use **IBM Plex Sans** by default (set in App.tsx).

## 📝 How to Use Specific Fonts

### Option 1: Import textStyles utility

```typescript
import { headingStyles, bodyStyles, monoStyles } from '../utils/textStyles';

// For headings
<Text style={headingStyles.h1}>Portfolio Value</Text>
<Text style={headingStyles.h2}>Section Title</Text>
<Text style={headingStyles.h3}>Card Title</Text>

// For body text (already default, but explicit)
<Text style={bodyStyles.regular}>Description text</Text>
<Text style={bodyStyles.small}>Helper text</Text>

// For financial numbers/prices
<Text style={monoStyles.price}>$1,234.56</Text>
<Text style={monoStyles.percentage}>+12.5%</Text>
```

### Option 2: Import Typography components

```typescript
import { H1, H2, H3, BodyText, MonoText, Price, Percentage } from '../components/ui/Typography';

// Headings
<H1>Portfolio</H1>
<H2>Assets</H2>
<H3>Card Title</H3>

// Body text
<BodyText>This is regular body text</BodyText>

// Financial data
<Price>$1,234.56</Price>
<Percentage>+12.5%</Percentage>
<MonoText>123,456.78</MonoText>
```

### Option 3: Direct fontFamily in styles

```typescript
import { Typography } from '../styles/designSystem';

const styles = StyleSheet.create({
  heading: {
    fontFamily: Typography.fontFamily.heading, // Space Grotesk Bold
    fontSize: 24,
    fontWeight: '700',
  },
  bodyText: {
    fontFamily: Typography.fontFamily.body, // IBM Plex Sans (default)
    fontSize: 16,
  },
  price: {
    fontFamily: Typography.fontFamily.mono, // IBM Plex Mono
    fontSize: 20,
  },
});
```

## 🎯 Font Assignment by Use Case

| Use Case | Font | How to Apply |
|----------|------|--------------|
| **All Headings** (H1-H6, titles, section headers) | Space Grotesk Bold | `headingStyles.h1` or `<H1>` |
| **Body text** (descriptions, labels, paragraphs) | IBM Plex Sans *(default)* | No change needed or `bodyStyles.regular` |
| **Financial numbers** (prices, returns, percentages) | IBM Plex Mono | `monoStyles.price` or `<Price>` |
| **Percentages** | IBM Plex Mono | `monoStyles.percentage` or `<Percentage>` |
| **Code/Technical data** | IBM Plex Mono | `monoStyles.number` |
| **Alternative body** (if needed) | Inter | `Typography.fontFamily.bodyAlt` |

## 🔧 Quick Component Updates

### Update HomeScreen Header
```typescript
// BEFORE
<Text style={styles.headerTitle}>{routes[index].title}</Text>

// AFTER
import { headingStyles } from '../utils/textStyles';
<Text style={[styles.headerTitle, headingStyles.h3]}>{routes[index].title}</Text>
```

### Update Asset Card Title
```typescript
// BEFORE
<Text style={styles.symbol}>{asset.symbol}</Text>

// AFTER
import { headingStyles } from '../utils/textStyles';
<Text style={[styles.symbol, headingStyles.h4]}>{asset.symbol}</Text>
```

### Update Prices/Financial Numbers
```typescript
// BEFORE
<Text style={styles.price}>${price}</Text>

// AFTER
import { monoStyles } from '../utils/textStyles';
<Text style={[styles.price, monoStyles.price]}>${price}</Text>
```

## 🚀 After Rebuilding

1. **Default text** → IBM Plex Sans (automatic)
2. **Headings** → Need to add `headingStyles` or `<H1>` components
3. **Prices/Numbers** → Need to add `monoStyles` for monospace look

## Next Steps

To see the full font system in action:

1. **Rebuild the app**: 
   ```bash
   npx react-native run-android
   # or
   npx react-native run-ios
   ```

2. **All body text will change** to IBM Plex Sans automatically

3. **Update specific components**:
   - Add `headingStyles` to titles/headers
   - Add `monoStyles` to prices/percentages
   
The fonts are installed and ready! 🎉
