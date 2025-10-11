#!/bin/bash

# Script to fix React Native render errors
# This clears all caches and rebuilds the app

echo "🔧 Fixing React Native Render Errors..."
echo ""

# Step 1: Stop Metro bundler
echo "1️⃣ Stopping Metro bundler..."
pkill -f "react-native" || true
pkill -f "metro" || true

# Step 2: Clear watchman
echo "2️⃣ Clearing Watchman..."
watchman watch-del-all || echo "Watchman not installed, skipping..."

# Step 3: Clear Metro bundler cache
echo "3️⃣ Clearing Metro bundler cache..."
rm -rf $TMPDIR/react-*
rm -rf $TMPDIR/metro-*
rm -rf $TMPDIR/haste-*

# Step 4: Clear React Native cache
echo "4️⃣ Clearing React Native cache..."
rm -rf node_modules/.cache

# Step 5: Clear npm cache
echo "5️⃣ Clearing npm cache..."
npm cache clean --force

# Step 6: Reinstall node_modules
echo "6️⃣ Reinstalling node_modules..."
rm -rf node_modules
npm install

# Step 7: Clear iOS build (if on Mac)
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "7️⃣ Clearing iOS build..."
    cd ios
    rm -rf build
    rm -rf Pods
    rm -rf ~/Library/Developer/Xcode/DerivedData/*
    pod deintegrate || true
    pod install
    cd ..
fi

# Step 8: Clear Android build
echo "8️⃣ Clearing Android build..."
cd android
./gradlew clean || true
cd ..

# Step 9: Start Metro with reset cache
echo "9️⃣ Starting Metro bundler with reset cache..."
echo ""
echo "✅ Cache cleared! Now run:"
echo "   npm start -- --reset-cache"
echo ""
echo "Then in another terminal:"
echo "   npm run android  (for Android)"
echo "   npm run ios      (for iOS)"

