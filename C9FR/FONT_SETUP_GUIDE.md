# Font Setup Guide

## Required Font Files

Download these fonts from Google Fonts and place them in `src/assets/fonts/`:

### 1. Space Grotesk Bold (for Headings)
- **File**: `SpaceGrotesk-Bold.ttf`
- **Link**: https://fonts.google.com/specimen/Space+Grotesk
- **Weight**: 700
- **Usage**: All headings (H1, H2, H3, titles, section headers)

### 2. IBM Plex Sans Regular (for Body Text)
- **File**: `IBMPlexSans-Regular.ttf`
- **Link**: https://fonts.google.com/specimen/IBM+Plex+Sans
- **Weight**: 400
- **Usage**: Primary body text, descriptions, labels, paragraphs

### 3. Inter Regular (Alternative Body Text)
- **File**: `Inter-Regular.ttf`
- **Link**: https://fonts.google.com/specimen/Inter
- **Weight**: 400
- **Usage**: Alternative body text where needed

### 4. IBM Plex Mono (for Financial Data & Code)
- **File**: `IBMPlexMono-Regular.ttf`
- **Link**: https://fonts.google.com/specimen/IBM+Plex+Mono
- **Weight**: 400
- **Usage**: Financial numbers, prices, percentages, code snippets

## Installation Steps

### Step 1: Download Fonts
1. Visit each Google Fonts link above
2. Click "Download family" button
3. Extract the `.ttf` files from the downloaded zip
4. Find the specific weight mentioned (e.g., Bold 700, Regular 400)

### Step 2: Place Font Files
Copy the font files to: `C9FR/src/assets/fonts/`

Your directory should look like:
```
C9FR/
  src/
    assets/
      fonts/
        SpaceGrotesk-Bold.ttf
        IBMPlexSans-Regular.ttf
        Inter-Regular.ttf
        IBMPlexMono-Regular.ttf
```

### Step 3: Link Fonts to Native Projects
Run this command from the project root:
```bash
npx react-native-asset
```

This will automatically link fonts to both iOS and Android projects.

### Step 4: Rebuild the App
**iOS:**
```bash
cd ios
pod install
cd ..
npx react-native run-ios
```

**Android:**
```bash
npx react-native run-android
```

## Font Usage in Code

### Using Typography constants:
```typescript
import { Typography } from './src/styles/designSystem';

// For headings
<Text style={{ fontFamily: Typography.fontFamily.heading }}>
  My Portfolio
</Text>

// For body text
<Text style={{ fontFamily: Typography.fontFamily.body }}>
  Your investment description
</Text>

// For financial data
<Text style={{ fontFamily: Typography.fontFamily.mono }}>
  $1,234.56
</Text>
```

### Using Font Helper:
```typescript
import { FontUsage } from './src/theme/fonts';

// For headings
<Text style={FontUsage.heading}>
  Section Title
</Text>

// For financial numbers
<Text style={FontUsage.financial}>
  +12.5%
</Text>
```

## Troubleshooting

### Fonts not showing up?
1. Ensure font files are in `src/assets/fonts/`
2. Check file names match exactly (case-sensitive)
3. Run `npx react-native-asset` again
4. Clean build:
   - iOS: `cd ios && rm -rf Pods Podfile.lock && pod install`
   - Android: `cd android && ./gradlew clean`
5. Rebuild the app completely

### Font name not recognized?
The font name in code must match the font's internal name, not the file name. Our config uses:
- `SpaceGrotesk-Bold` (not SpaceGroteskBold)
- `IBMPlexSans-Regular`
- `Inter-Regular`
- `IBMPlexMono-Regular`

## Font Configuration Files

All font configurations are centralized in:
- `src/theme/fonts.ts` - Main font definitions and usage guide
- `src/theme/perplexityTheme.ts` - Perplexity theme fonts
- `src/styles/designSystem.ts` - Design system typography

## react-native.config.js

Already configured:
```javascript
module.exports = {
  project: {
    ios: {},
    android: {},
  },
  assets: ['./src/assets/fonts/'],
};
```
