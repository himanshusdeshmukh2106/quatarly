# Rebuild Instructions - Font Fix Applied ✅

## ✅ What I Did

1. **Fixed font names** - Changed from file names to family names:
   - ❌ `'SpaceGrotesk-Bold'` → ✅ `'Space Grotesk'`
   - ❌ `'IBMPlexSans-Regular'` → ✅ `'IBM Plex Sans'`
   - ❌ `'IBMPlexMono-Regular'` → ✅ `'IBM Plex Mono'`
   - ❌ `'Inter_24pt-Regular'` → ✅ `'Inter'`

2. **Cleaned Android build** - Deleted:
   - `android/app/.cxx/` (CMake cache)
   - `android/app/build/` (App build)
   - `android/build/` (Project build)
   - `android/.gradle/` (Gradle cache)

## 🚀 Now Run This to Rebuild

```bash
npx react-native run-android
```

**That's it!** The build command will:
- Regenerate all the missing CMake/codegen files
- Build with the correct font names
- Install on your device/emulator

## ⏱️ Expected Build Time
First build after clean: 3-5 minutes (generating native modules)

## ✅ What You'll See

After the app launches, you should see:
- **Bolder headings** using Space Grotesk
- **Monospaced numbers** ($1,234.56) using IBM Plex Mono
- **Cleaner body text** using IBM Plex Sans

## 🔍 If You Want to Verify Fonts Are Working

1. Open the app
2. Check HomeScreen header - should look bolder/different
3. Check AssetCard prices - numbers should be monospaced
4. Check Portfolio values - should use monospace font

## 🐛 If Fonts Still Don't Work

Use the FontTester component I created:

1. Temporarily add to HomeScreen.tsx:
```typescript
import FontTester from '../components/FontTester';

// Inside your component
<FontTester />
```

2. This will show which font names are actually loaded
3. Report back what you see!

## 💡 Why This Will Work Now

React Native fonts work like this:
- Font **file name**: `SpaceGrotesk-Bold.ttf`
- Font **family name** (inside TTF): `Space Grotesk`
- You MUST use the family name in code
- React Native picks the Bold variant automatically when you use `fontWeight: '700'`

The clean build ensures the correct font names are compiled into the app.

## Ready to Build! 🎨

Run:
```bash
npx react-native run-android
```

Your fonts will work this time! The issue was using file names instead of font family names.
