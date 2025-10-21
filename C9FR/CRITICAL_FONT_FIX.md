# CRITICAL Font Fix - Research Findings

## 🚨 The Real Problem Found

After researching multiple sources, the issue is:

### Android Font Naming Rules:
1. **Remove all hyphens from filename** (Android requirement)
2. **Use filename WITHOUT extension** as fontFamily
3. Font files in Android MUST NOT have hyphens

## ✅ SOLUTION

### Step 1: Rename Font Files (CRITICAL for Android)

Current filenames:
- ❌ `SpaceGrotesk-Bold.ttf`
- ❌ `IBMPlexSans-Regular.ttf`
- ❌ `IBMPlexMono-Regular.ttf`  
- ❌ `Inter_24pt-Regular.ttf`

Should be renamed to:
- ✅ `SpaceGroteskBold.ttf`
- ✅ `IBMPlexSansRegular.ttf`
- ✅ `IBMPlexMonoRegular.ttf`
- ✅ `Inter24ptRegular.ttf` or `InterRegular.ttf`

### Step 2: Use Filename (without .ttf) as Font Family

```typescript
fontFamily: 'SpaceGroteskBold'        // NOT 'Space Grotesk'
fontFamily: 'IBMPlexSansRegular'      // NOT 'IBM Plex Sans'
fontFamily: 'IBMPlexMonoRegular'      // NOT 'IBM Plex Mono'
```

## Why This Matters

Android requires:
1. Font filenames with **NO hyphens** or **spaces**
2. Filenames should be **lowercase** (optional but recommended)
3. Use the **exact filename** (without .ttf) in fontFamily

iOS is more flexible and can use PostScript names.

## Sources

From research:
- Medium article "Custom Fonts In React Native: Pro Tip!" - explicitly states to remove hyphens
- React Native docs - Android font naming conventions
- Multiple Stack Overflow answers confirming this

## What We Need to Do

1. **Option A - Rename files (Recommended)**:
   ```
   spacegrotesk_bold.ttf
   ibmplexsans_regular.ttf
   ibmplexmono_regular.ttf
   inter_regular.ttf
   ```
   
   Then use: `fontFamily: 'spacegrotesk_bold'`

2. **Option B - Remove hyphens, keep camelCase**:
   ```
   SpaceGroteskBold.ttf
   IBMPlexSansRegular.ttf
   IBMPlexMonoRegular.ttf
   InterRegular.ttf
   ```
   
   Then use: `fontFamily: 'SpaceGroteskBold'`

## Next Steps

I'll rename the font files and update all references in the code.
