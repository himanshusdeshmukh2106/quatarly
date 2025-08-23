# FK Grotesk Font Setup Guide

This guide explains how to set up and use the FK Grotesk font throughout the C9FR React Native app.

## Font Files Required

You need to add the following FK Grotesk font files to `src/assets/fonts/`:

```
src/assets/fonts/
├── FKGrotesk-Light.ttf
├── FKGrotesk-Regular.ttf
├── FKGrotesk-Medium.ttf
├── FKGrotesk-SemiBold.ttf
└── FKGrotesk-Bold.ttf
```

## Installation Steps

### 1. Add Font Files
Place all FK Grotesk font files (.ttf or .otf) in the `src/assets/fonts/` directory.

### 2. Link Fonts (React Native CLI)
Run the following command to link the fonts:
```bash
npx react-native-asset
```

### 3. iOS Setup (if using manual linking)
Add the font files to your iOS project:
1. Open `ios/C9FR.xcworkspace` in Xcode
2. Right-click on your project and select "Add Files to [ProjectName]"
3. Navigate to `src/assets/fonts/` and select all font files
4. Make sure "Add to target" is checked for your main app target
5. Add font names to `ios/C9FR/Info.plist`:

```xml
<key>UIAppFonts</key>
<array>
    <string>FKGrotesk-Light.ttf</string>
    <string>FKGrotesk-Regular.ttf</string>
    <string>FKGrotesk-Medium.ttf</string>
    <string>FKGrotesk-SemiBold.ttf</string>
    <string>FKGrotesk-Bold.ttf</string>
</array>
```

### 4. Android Setup (if using manual linking)
1. Copy font files to `android/app/src/main/assets/fonts/`
2. The fonts will be automatically available

### 5. Clean and Rebuild
```bash
# Clean the project
npx react-native clean

# For iOS
cd ios && pod install && cd ..

# Rebuild the app
npx react-native run-ios
npx react-native run-android
```

## Usage

### Import the font helper
```typescript
import { getFontFamily } from '../config/fonts';
```

### Use in StyleSheet
```typescript
const styles = StyleSheet.create({
  title: {
    fontFamily: getFontFamily('700'), // Bold
    fontSize: 24,
  },
  body: {
    fontFamily: getFontFamily('400'), // Regular
    fontSize: 16,
  },
  subtitle: {
    fontFamily: getFontFamily('600'), // SemiBold
    fontSize: 18,
  },
});
```

### Available Font Weights
- `'300'` or `'light'` → FK Grotesk Light
- `'400'` or `'normal'` → FK Grotesk Regular
- `'500'` or `'medium'` → FK Grotesk Medium
- `'600'` or `'semiBold'` → FK Grotesk SemiBold
- `'700'` or `'bold'` → FK Grotesk Bold

### Global Text Styles
Use the predefined global text styles:
```typescript
import { globalTextStyles } from '../styles/globalStyles';

// In your component
<Text style={globalTextStyles.h1}>Heading 1</Text>
<Text style={globalTextStyles.body1}>Body text</Text>
<Text style={globalTextStyles.button}>Button text</Text>
```

## Troubleshooting

### Font not showing on iOS
1. Check that font files are added to the Xcode project
2. Verify font names in Info.plist match exactly
3. Clean and rebuild the project

### Font not showing on Android
1. Ensure font files are in `android/app/src/main/assets/fonts/`
2. Check font file names match the imports
3. Clean and rebuild the project

### Verify Font Installation
Add this temporary code to check if fonts are loaded:
```typescript
import { Platform } from 'react-native';

// iOS
if (Platform.OS === 'ios') {
  console.log('Available fonts:', require('react-native').NativeModules.RNDeviceInfo.getFontScale());
}

// Android - fonts should work automatically
```

## Files Updated

The following files have been updated to use FK Grotesk:

1. `src/config/fonts.ts` - Font configuration
2. `src/styles/globalStyles.ts` - Global text styles
3. `src/screens/main/AssetsScreen.tsx` - Updated to use FK Grotesk
4. `react-native.config.js` - Font asset configuration

## Next Steps

To complete the font implementation across the entire app:

1. Update all remaining screen components to import and use `getFontFamily()`
2. Update all component files to use FK Grotesk
3. Update theme context to include font information
4. Test on both iOS and Android devices
5. Verify font rendering in different screen sizes and orientations

## Performance Notes

- Font files add to app bundle size
- Consider using font subsets if file size is a concern
- Test font rendering performance on older devices