# PowerShell script to restart React Native app with clean cache

Write-Host "🔄 Restarting React Native App..." -ForegroundColor Cyan
Write-Host ""

# Step 1: Kill all Node processes
Write-Host "1️⃣ Stopping all Node processes..." -ForegroundColor Yellow
Get-Process | Where-Object {$_.ProcessName -eq "node"} | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# Step 2: Kill process on port 8081
Write-Host "2️⃣ Freeing port 8081..." -ForegroundColor Yellow
$port8081 = netstat -ano | findstr :8081 | Select-Object -First 1
if ($port8081) {
    $pid = ($port8081 -split '\s+')[-1]
    if ($pid) {
        taskkill /F /PID $pid 2>$null
        Write-Host "   Killed process $pid on port 8081" -ForegroundColor Green
    }
}
Start-Sleep -Seconds 2

# Step 3: Start Metro bundler with reset cache
Write-Host "3️⃣ Starting Metro bundler with reset cache..." -ForegroundColor Yellow
Write-Host ""
Write-Host "✅ Metro will start in a new window" -ForegroundColor Green
Write-Host ""
Write-Host "After Metro starts, run in another terminal:" -ForegroundColor Cyan
Write-Host "   cd C:\Users\Lenovo\Desktop\quatarly\C9FR" -ForegroundColor White
Write-Host "   npm run android" -ForegroundColor White
Write-Host ""

# Start Metro in a new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd C:\Users\Lenovo\Desktop\quatarly\C9FR; npm start -- --reset-cache"

