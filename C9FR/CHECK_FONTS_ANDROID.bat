@echo off
echo Checking if fonts are in Android build...
echo.
echo === Checking assets/fonts ===
dir "android\app\src\main\assets\fonts"
echo.
echo === Checking res/font ===
dir "android\app\src\main\res\font"
echo.
echo === Checking if fonts are linked in Info.plist (iOS) ===
findstr "ttf" "ios\C9FR\Info.plist"
echo.
echo Press any key to check Android logcat for font errors...
pause
adb logcat -c
echo Starting logcat... Watch for font errors
adb logcat | findstr /i "font"
