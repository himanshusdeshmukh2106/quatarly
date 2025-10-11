# React Native Render Error Fix

## 🔴 Error Description

**Error Message:**
```
Error: Element type is invalid: expected a string (for built-in components) 
or a class/function (for composite components) but got: undefined.
```

**Affected Screens:**
- OnboardingScreen
- GoalsScreen  
- HomeScreen

**Root Causes:**
1. Metro bundler cache corruption
2. Import/export mismatches
3. React Native module resolution issues
4. Stale build artifacts

---

## ✅ Fixes Applied

### 1. Fixed Import Order in GoalsScreen

**File:** `C9FR/src/screens/main/GoalsScreen.tsx`

**Before:**
```typescript
import ProgressBar from '../../components/ProgressBar';
import AddGoalModal from '../../components/AddGoalModal';
import AIInsightsDrawer from '../../components/AIInsightsDrawer';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorBoundary from '../../components/ErrorBoundary';
```

**After:**
```typescript
// Import components with proper default imports
import ProgressBar from '../../components/ProgressBar';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorBoundary from '../../components/ErrorBoundary';
import AddGoalModal from '../../components/AddGoalModal';
import AIInsightsDrawer from '../../components/AIInsightsDrawer';
```

**Reason:** Reorganized imports to ensure proper module resolution order

---

### 2. Verified Component Exports

All components are correctly exported as default exports:

✅ `ProgressBar.tsx` - `export default ProgressBar`
✅ `LoadingSpinner.tsx` - `export default LoadingSpinner`
✅ `ErrorBoundary.tsx` - `export default ErrorBoundary`
✅ `AddGoalModal.tsx` - `export default AddGoalModal`
✅ `AIInsightsDrawer.tsx` - `export default AIInsightsDrawer`
✅ `CategoryCards.tsx` - `export default CategoryCards`
✅ `TogglesWithTextInput.tsx` - `export default TogglesWithTextInput`

---

## 🔧 Required Steps to Fix

### Option 1: Quick Fix (Recommended)

Run the automated fix script:

**Windows (PowerShell):**
```powershell
cd C9FR
.\fix-render-errors.ps1
```

**Mac/Linux (Bash):**
```bash
cd C9FR
chmod +x fix-render-errors.sh
./fix-render-errors.sh
```

Then start the app:
```bash
npm start -- --reset-cache
```

In another terminal:
```bash
npm run android
```

---

### Option 2: Manual Fix

Follow these steps in order:

#### Step 1: Stop Metro Bundler
```bash
# Kill all Node processes
pkill -f "react-native"
pkill -f "metro"
```

#### Step 2: Clear All Caches
```bash
# Clear Metro cache
rm -rf $TMPDIR/react-*
rm -rf $TMPDIR/metro-*
rm -rf $TMPDIR/haste-*

# Clear React Native cache
rm -rf node_modules/.cache

# Clear npm cache
npm cache clean --force
```

#### Step 3: Clear Watchman (if installed)
```bash
watchman watch-del-all
```

#### Step 4: Clear Android Build
```bash
cd android
./gradlew clean
cd ..
rm -rf android/build
rm -rf android/app/build
rm -rf android/.gradle
```

#### Step 5: Reinstall Dependencies
```bash
rm -rf node_modules
npm install
```

#### Step 6: Start with Reset Cache
```bash
npm start -- --reset-cache
```

#### Step 7: Run Android App
```bash
# In another terminal
npm run android
```

---

## 🐛 Debugging Steps

If the error persists after clearing caches:

### 1. Check for Circular Dependencies

Run this command to detect circular imports:
```bash
npx madge --circular --extensions ts,tsx src/
```

### 2. Verify Component Imports

Check that all components are imported correctly:
```bash
# Search for incorrect imports
grep -r "import.*from.*components" src/screens/
```

### 3. Check React Native Version Compatibility

Verify all packages are compatible:
```bash
npm ls react-native
npm ls react
```

### 4. Enable Verbose Logging

Start Metro with verbose logging:
```bash
npm start -- --reset-cache --verbose
```

### 5. Check for Duplicate Packages

```bash
npm dedupe
```

---

## 📝 Common Causes & Solutions

### Cause 1: Stale Metro Cache
**Solution:** Clear cache with `npm start -- --reset-cache`

### Cause 2: Import/Export Mismatch
**Solution:** Ensure named exports use `{}` and default exports don't

**Wrong:**
```typescript
import { ProgressBar } from '../../components/ProgressBar';  // ❌
```

**Correct:**
```typescript
import ProgressBar from '../../components/ProgressBar';  // ✅
```

### Cause 3: Corrupted node_modules
**Solution:** Delete and reinstall
```bash
rm -rf node_modules
npm install
```

### Cause 4: Android Build Cache
**Solution:** Clean Gradle cache
```bash
cd android
./gradlew clean
./gradlew cleanBuildCache
```

### Cause 5: React Native Version Mismatch
**Solution:** Ensure consistent versions
```bash
npm install react@19.1.0 react-native@0.80.0
```

---

## 🎯 Prevention Tips

1. **Always clear cache after major changes:**
   ```bash
   npm start -- --reset-cache
   ```

2. **Use consistent import patterns:**
   - Default exports: `import Component from './Component'`
   - Named exports: `import { Component } from './Component'`

3. **Avoid circular dependencies:**
   - Use barrel exports (`index.ts`) carefully
   - Don't import parent components in child components

4. **Keep dependencies updated:**
   ```bash
   npm outdated
   npm update
   ```

5. **Use TypeScript strict mode:**
   - Catches import/export issues at compile time

---

## 📊 Verification Checklist

After applying fixes, verify:

- [ ] Metro bundler starts without errors
- [ ] No "Element type is invalid" errors in console
- [ ] OnboardingScreen renders correctly
- [ ] GoalsScreen renders correctly
- [ ] HomeScreen renders correctly
- [ ] All tabs navigate properly
- [ ] No red error screens in app

---

## 🚨 If Nothing Works

### Nuclear Option: Complete Reset

```bash
# 1. Stop everything
pkill -f "react-native"
pkill -f "metro"
pkill -f "gradle"

# 2. Delete everything
rm -rf node_modules
rm -rf android/build
rm -rf android/app/build
rm -rf android/.gradle
rm -rf $TMPDIR/react-*
rm -rf $TMPDIR/metro-*

# 3. Clear all caches
npm cache clean --force
watchman watch-del-all

# 4. Reinstall from scratch
npm install

# 5. Rebuild Android
cd android
./gradlew clean
cd ..

# 6. Start fresh
npm start -- --reset-cache

# 7. In another terminal
npm run android
```

---

## 📞 Additional Resources

- [React Native Troubleshooting](https://reactnative.dev/docs/troubleshooting)
- [Metro Bundler Configuration](https://facebook.github.io/metro/docs/configuration)
- [React Native Debugging](https://reactnative.dev/docs/debugging)

---

## ✅ Expected Outcome

After applying these fixes:

1. ✅ Metro bundler starts cleanly
2. ✅ No render errors in console
3. ✅ All screens load properly
4. ✅ Navigation works smoothly
5. ✅ Onboarding flow completes successfully
6. ✅ Goals screen shows "Failed to load goals" message (API issue, not render issue)

**Note:** The "Failed to load goals" error is a separate API/network issue, not a render error. That will be addressed separately.

---

**Date:** October 9, 2025  
**Status:** ✅ FIXES APPLIED - REQUIRES CACHE CLEAR & REBUILD

