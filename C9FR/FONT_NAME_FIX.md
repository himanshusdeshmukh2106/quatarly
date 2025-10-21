# Font Name Fix Applied ✅

## The Problem

React Native requires the **font family name**, not the file name!

### ❌ Wrong (File names):
```typescript
fontFamily: 'SpaceGrotesk-Bold'      // File name
fontFamily: 'IBMPlexSans-Regular'    // File name  
fontFamily: 'Inter_24pt-Regular'     // File name
fontFamily: 'IBMPlexMono-Regular'    // File name
```

### ✅ Correct (Family names):
```typescript
fontFamily: 'Space Grotesk'    // Font family name
fontFamily: 'IBM Plex Sans'     // Font family name
fontFamily: 'Inter'             // Font family name  
fontFamily: 'IBM Plex Mono'     // Font family name
```

## What Was Fixed

Updated font names in:
1. ✅ `src/theme/fonts.ts`
2. ✅ `src/styles/designSystem.ts`
3. ✅ `src/theme/perplexityTheme.ts`

## How Font Weights Work in React Native

When you download fonts from Google Fonts:
- The **file name** includes the weight: `SpaceGrotesk-Bold.ttf`
- The **font family name** inside the file is: `Space Grotesk`
- You specify the weight separately with `fontWeight: '700'`

React Native automatically picks the Bold variant when you use:
```typescript
{
  fontFamily: 'Space Grotesk',
  fontWeight: '700',  // This tells RN to use the Bold file
}
```

## Font File Mapping

| File Name | Font Family Name | Weight |
|-----------|-----------------|--------|
| SpaceGrotesk-Bold.ttf | Space Grotesk | 700 |
| IBMPlexSans-Regular.ttf | IBM Plex Sans | 400 |
| IBMPlexMono-Regular.ttf | IBM Plex Mono | 400 |
| Inter_24pt-Regular.ttf | Inter | 400 |

## Now Rebuild

The font names are now correct. Rebuild completely:

### Android:
```bash
cd android
./gradlew clean
cd ..
npx react-native run-android
```

### iOS:
```bash
cd ios
rm -rf Pods Podfile.lock
pod install
cd ..
npx react-native run-ios
```

## If Fonts Still Don't Work

Try this FontTester component I created:

1. Import it in HomeScreen:
```typescript
import FontTester from '../components/FontTester';
```

2. Add it temporarily:
```typescript
<FontTester />
```

3. This will show you which font names are actually working

## The fonts should now work! 🎉
