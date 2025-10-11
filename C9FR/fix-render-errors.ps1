# PowerShell script to fix React Native render errors
# This clears all caches and rebuilds the app

Write-Host "🔧 Fixing React Native Render Errors..." -ForegroundColor Cyan
Write-Host ""

# Step 1: Stop Metro bundler
Write-Host "1️⃣ Stopping Metro bundler..." -ForegroundColor Yellow
Get-Process | Where-Object {$_.ProcessName -like "*node*"} | Where-Object {$_.CommandLine -like "*metro*"} | Stop-Process -Force -ErrorAction SilentlyContinue

# Step 2: Clear Metro bundler cache
Write-Host "2️⃣ Clearing Metro bundler cache..." -ForegroundColor Yellow
if (Test-Path "$env:TEMP\react-*") {
    Remove-Item "$env:TEMP\react-*" -Recurse -Force -ErrorAction SilentlyContinue
}
if (Test-Path "$env:TEMP\metro-*") {
    Remove-Item "$env:TEMP\metro-*" -Recurse -Force -ErrorAction SilentlyContinue
}
if (Test-Path "$env:TEMP\haste-*") {
    Remove-Item "$env:TEMP\haste-*" -Recurse -Force -ErrorAction SilentlyContinue
}

# Step 3: Clear React Native cache
Write-Host "3️⃣ Clearing React Native cache..." -ForegroundColor Yellow
if (Test-Path "node_modules\.cache") {
    Remove-Item "node_modules\.cache" -Recurse -Force -ErrorAction SilentlyContinue
}

# Step 4: Clear npm cache
Write-Host "4️⃣ Clearing npm cache..." -ForegroundColor Yellow
npm cache clean --force

# Step 5: Clear Android build
Write-Host "5️⃣ Clearing Android build..." -ForegroundColor Yellow
if (Test-Path "android\build") {
    Remove-Item "android\build" -Recurse -Force -ErrorAction SilentlyContinue
}
if (Test-Path "android\app\build") {
    Remove-Item "android\app\build" -Recurse -Force -ErrorAction SilentlyContinue
}
if (Test-Path "android\.gradle") {
    Remove-Item "android\.gradle" -Recurse -Force -ErrorAction SilentlyContinue
}

Push-Location android
try {
    .\gradlew clean
} catch {
    Write-Host "Gradle clean failed, continuing..." -ForegroundColor Red
}
Pop-Location

# Step 6: Reinstall node_modules
Write-Host "6️⃣ Reinstalling node_modules..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Remove-Item "node_modules" -Recurse -Force
}
npm install

Write-Host ""
Write-Host "✅ Cache cleared successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Now run these commands:" -ForegroundColor Cyan
Write-Host "   npm start -- --reset-cache" -ForegroundColor White
Write-Host ""
Write-Host "Then in another terminal:" -ForegroundColor Cyan
Write-Host "   npm run android" -ForegroundColor White

