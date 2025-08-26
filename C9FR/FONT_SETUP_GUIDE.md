# Typography System Font Setup Guide - FREE FONTS EDITION

This guide explains how to set up and use the complete typography system in the C9FR React Native app, featuring **100% FREE fonts**:
- **Headers**: Inter (Medium/Bold weights) - FREE alternative to FK Grotesk
- **Body text**: IBM Plex Sans (Regular/Light weights) - FREE
- **Code/Data**: IBM Plex Mono for numbers, symbols, and technical content - FREE

## Font Files Required (ALL FREE!)

You need to add the following font files to `src/assets/fonts/`:

### Inter (Headers) - FREE
**Download from**: https://github.com/rsms/inter/releases
```
src/assets/fonts/
├── Inter-Medium.ttf
├── Inter-SemiBold.ttf
└── Inter-Bold.ttf
```

### IBM Plex Sans (Body Text) - FREE
**Download from**: https://github.com/IBM/plex/releases
```
src/assets/fonts/
├── IBMPlexSans-Light.ttf
├── IBMPlexSans-Regular.ttf
├── IBMPlexSans-Medium.ttf
├── IBMPlexSansCondensed-Light.ttf
└── IBMPlexSansCondensed-Regular.ttf
```

### IBM Plex Mono (Code/Data/Numbers) - FREE
**Download from**: https://github.com/IBM/plex/releases
```
src/assets/fonts/
├── IBMPlexMono-Light.ttf
├── IBMPlexMono-Regular.ttf
├── IBMPlexMono-Medium.ttf
├── IBMPlexMono-SemiBold.ttf
└── IBMPlexMono-Bold.ttf
```

## Download Instructions (Step by Step)

### 1. Download Inter Font (Headers)
1. Go to: https://github.com/rsms/inter/releases
2. Download the latest release (look for "Inter-[version].zip")
3. Extract the ZIP file
4. Navigate to the extracted folder
5. Copy these files from the TTF folder to `src/assets/fonts/`:
   - `Inter-Medium.ttf`
   - `Inter-SemiBold.ttf`
   - `Inter-Bold.ttf`

### 2. Download IBM Plex Fonts (Body & Code)
1. Go to: https://github.com/IBM/plex/releases
2. Download the latest release (look for "Source code (zip)")
3. Extract the ZIP file
4. Navigate to the extracted folder
5. Copy these files to `src/assets/fonts/`:

**From `IBM-Plex-Sans/fonts/complete/ttf/`:**
- `IBMPlexSans-Light.ttf`
- `IBMPlexSans-Regular.ttf`
- `IBMPlexSans-Medium.ttf`

**From `IBM-Plex-Sans-Condensed/fonts/complete/ttf/`:**
- `IBMPlexSansCondensed-Light.ttf`
- `IBMPlexSansCondensed-Regular.ttf`

**From `IBM-Plex-Mono/fonts/complete/ttf/`:**
- `IBMPlexMono-Light.ttf`
- `IBMPlexMono-Regular.ttf`
- `IBMPlexMono-Medium.ttf`
- `IBMPlexMono-SemiBold.ttf`
- `IBMPlexMono-Bold.ttf`

## Font Linking Steps
Run the following command to link the fonts:
```bash
npx react-native-asset
```

### 2. iOS Setup (if using manual linking)
Add the font files to your iOS project:
1. Open `ios/C9FR.xcworkspace` in Xcode
2. Right-click on your project and select "Add Files to [ProjectName]"
3. Navigate to `src/assets/fonts/` and select all font files
4. Make sure "Add to target" is checked for your main app target
5. Add font names to `ios/C9FR/Info.plist`:

```xml
<key>UIAppFonts</key>
<array>
    <!-- Inter (Headers) -->
    <string>Inter-Medium.ttf</string>
    <string>Inter-SemiBold.ttf</string>
    <string>Inter-Bold.ttf</string>
    <!-- IBM Plex Sans (Body) -->
    <string>IBMPlexSans-Light.ttf</string>
    <string>IBMPlexSans-Regular.ttf</string>
    <string>IBMPlexSans-Medium.ttf</string>
    <string>IBMPlexSansCondensed-Light.ttf</string>
    <string>IBMPlexSansCondensed-Regular.ttf</string>
    <!-- IBM Plex Mono (Code/Data) -->
    <string>IBMPlexMono-Light.ttf</string>
    <string>IBMPlexMono-Regular.ttf</string>
    <string>IBMPlexMono-Medium.ttf</string>
    <string>IBMPlexMono-SemiBold.ttf</string>
    <string>IBMPlexMono-Bold.ttf</string>
</array>
```

### 3. Android Setup (if using manual linking)
1. Copy font files to `android/app/src/main/assets/fonts/`
2. The fonts will be automatically available

### 4. Clean and Rebuild
```bash
# Clean the project
npx react-native clean

# For iOS
cd ios && pod install && cd ..

# Rebuild the app
npx react-native run-ios
npx react-native run-android
```

## Typography System Usage

### Import the font helpers
```typescript
import { 
  getHeaderFont, 
  getBodyFont, 
  getMonoFont, 
  FontType,
  createHeaderStyle,
  createBodyStyle,
  createMonoStyle
} from '../config/fonts';
import { globalTextStyles } from '../styles/globalStyles';
```

### Headers (Inter)
Use Inter for headings, navigation, and prominent UI elements:

```typescript
const styles = StyleSheet.create({
  mainTitle: {
    fontFamily: getHeaderFont('bold'), // Inter Bold
    fontSize: 28,
  },
  sectionHeader: {
    fontFamily: getHeaderFont('medium'), // Inter Medium
    fontSize: 20,
  },
  buttonText: {
    fontFamily: getHeaderFont('medium'), // Inter Medium
    fontSize: 16,
  },
});

// Or use global styles
<Text style={globalTextStyles.h1}>Main Heading</Text>
<Text style={globalTextStyles.h3}>Section Header</Text>
<Text style={globalTextStyles.button}>Button Text</Text>
```

### Body Text (IBM Plex Sans)
Use IBM Plex Sans for all body content, descriptions, and regular text:

```typescript
const styles = StyleSheet.create({
  bodyText: {
    fontFamily: getBodyFont('regular'), // IBM Plex Sans Regular
    fontSize: 16,
  },
  lightText: {
    fontFamily: getBodyFont('light'), // IBM Plex Sans Light
    fontSize: 14,
  },
  secondaryInfo: {
    fontFamily: getCondensedFont(false), // IBM Plex Sans Condensed
    fontSize: 12,
  },
});

// Or use global styles
<Text style={globalTextStyles.body1}>Regular body text</Text>
<Text style={globalTextStyles.body3}>Light body text</Text>
<Text style={globalTextStyles.secondary}>Secondary information</Text>
```

### Code/Data/Numbers (IBM Plex Mono)
Use IBM Plex Mono for numbers, symbols, code, and technical content:

```typescript
const styles = StyleSheet.create({
  price: {
    fontFamily: getMonoFont('medium'), // IBM Plex Mono Medium
    fontSize: 20,
  },
  percentage: {
    fontFamily: getMonoFont('regular'), // IBM Plex Mono Regular
    fontSize: 14,
  },
  symbol: {
    fontFamily: getMonoFont('semiBold'), // IBM Plex Mono SemiBold
    fontSize: 16,
  },
});

// Or use global styles
<Text style={globalTextStyles.numberLarge}>$1,234.56</Text>
<Text style={globalTextStyles.technical}>+2.5%</Text>
<Text style={globalTextStyles.symbol}>AAPL</Text>
```

### Weight Combinations

#### Strong Contrast
Pair Inter Bold with IBM Plex Sans Regular:
```typescript
<Text style={createHeaderStyle(24, 'bold')}>Header</Text>
<Text style={createBodyStyle(16, 'regular')}>Body text</Text>
```

#### Softer Hierarchy
Pair Inter Medium with IBM Plex Sans Light:
```typescript
<Text style={createHeaderStyle(20, 'medium')}>Header</Text>
<Text style={createBodyStyle(14, 'light')}>Body text</Text>
```

## Advanced Usage

### Dynamic Font Selection
```typescript
import { getFontFamily, FontType } from '../config/fonts';

const getTextStyle = (type: 'header' | 'body' | 'code', weight: string) => ({
  fontFamily: getFontFamily(
    type === 'header' ? FontType.HEADER :
    type === 'code' ? FontType.MONO :
    FontType.BODY,
    weight
  ),
});
```

### Custom Style Helpers
```typescript
// Create consistent pricing display
const createPriceStyle = (size: 'large' | 'medium' | 'small') => {
  const fontSize = size === 'large' ? 24 : size === 'medium' ? 18 : 14;
  return createMonoStyle(fontSize, 'medium', '#000000');
};

// Create consistent header hierarchy
const createPageHeader = (level: 1 | 2 | 3) => {
  const fontSize = level === 1 ? 28 : level === 2 ? 24 : 20;
  const weight = level === 1 ? 'bold' : 'medium';
  return createHeaderStyle(fontSize, weight);
};
```

## Troubleshooting

### Font not showing on iOS
1. Check that font files are added to the Xcode project
2. Verify font names in Info.plist match exactly
3. Clean and rebuild the project
4. Check font file names match the postscript names

### Font not showing on Android
1. Ensure font files are in `android/app/src/main/assets/fonts/`
2. Check font file names match the imports
3. Clean and rebuild the project

### Wrong Font Being Used
1. Verify you're using the correct helper function (`getHeaderFont`, `getBodyFont`, `getMonoFont`)
2. Check the font weight parameter
3. Ensure font files are properly named

### Verify Font Installation
Add this temporary code to check if fonts are loaded:
```typescript
import { Platform } from 'react-native';

// Test different font types
const testFonts = {
  header: getHeaderFont('bold'),
  body: getBodyFont('regular'),
  mono: getMonoFont('medium'),
};

console.log('Font configuration:', testFonts);
```

## Performance Notes

- Font files add to app bundle size (~15-20MB for all variants)
- Consider using font subsets if file size is a concern
- Test font rendering performance on older devices
- IBM Plex fonts are optimized for screen reading
- Mono fonts may render slightly slower due to fixed-width calculations

## Typography Best Practices

1. **Headers**: Always use Inter for visual hierarchy
2. **Body**: Use IBM Plex Sans for readability
3. **Data**: Use IBM Plex Mono for precise alignment of numbers
4. **Consistency**: Stick to the predefined global styles when possible
5. **Contrast**: Use the recommended weight combinations for optimal hierarchy
6. **Accessibility**: Ensure sufficient contrast ratios for all text

## Why These Fonts?

### Inter (Headers)
- **Free**: Open source, no licensing costs
- **Modern**: Used by GitHub, Discord, and many top apps
- **Readable**: Designed specifically for digital interfaces
- **Similar to FK Grotesk**: Provides the same professional look

### IBM Plex Sans (Body)
- **Free**: IBM's open source typeface
- **Optimized**: Designed for modern digital experiences
- **Corporate**: Professional appearance for financial apps

### IBM Plex Mono (Code/Data)
- **Free**: Part of IBM's open source collection
- **Precise**: Perfect for financial data alignment
- **Readable**: Clear distinction between characters

## Cost Comparison

| Font | Cost | License |
|------|------|----------|
| FK Grotesk | $200+ | Commercial |
| **Inter** | **FREE** | **Open Source** |
| IBM Plex Sans | FREE | Open Source |
| IBM Plex Mono | FREE | Open Source |

**Total Savings: $200+** 💰

## Files Updated

The following files implement the new typography system:

1. `src/config/fonts.ts` - Font configuration and helper functions
2. `src/styles/globalStyles.ts` - Global text styles with proper font assignment
3. Typography system supports legacy `getFontFamily()` calls for backwards compatibility

## Migration Guide

For existing components:

1. **Headers/Titles**: Replace with `getHeaderFont()` or `globalTextStyles.h1-h6`
2. **Body Text**: Replace with `getBodyFont()` or `globalTextStyles.body1-body3`
3. **Numbers/Prices**: Replace with `getMonoFont()` or `globalTextStyles.number*`
4. **Technical Content**: Use `globalTextStyles.technical` or `globalTextStyles.symbol`

## Next Steps

To complete the typography implementation:

1. Download and add all required font files to `src/assets/fonts/`
2. Update all screen components to use the new font system
3. Update all component files to use appropriate font types
4. Test rendering on both iOS and Android devices
5. Verify accessibility and readability across different screen sizes