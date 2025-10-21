# PowerShell script to extract font names from TTF files
# This will show us the REAL internal font names

$fontFolder = "C:\Users\Lenovo\Desktop\quatarly\C9FR\src\assets\fonts"

Write-Host "Extracting font names from TTF files..." -ForegroundColor Green
Write-Host ""

Get-ChildItem -Path $fontFolder -Filter "*.ttf" | ForEach-Object {
    $fontFile = $_.FullName
    $fontName = $_.Name
    
    Write-Host "File: $fontName" -ForegroundColor Yellow
    
    # Try to load the font and get its properties
    try {
        $shell = New-Object -ComObject Shell.Application
        $folder = $shell.Namespace((Get-Item $fontFile).DirectoryName)
        $file = $folder.ParseName((Get-Item $fontFile).Name)
        
        # Get font name property (index 21 is usually font name)
        $fontFullName = $folder.GetDetailsOf($file, 21)
        
        if ($fontFullName) {
            Write-Host "  Internal Name: $fontFullName" -ForegroundColor Cyan
        } else {
            Write-Host "  Could not extract internal name" -ForegroundColor Red
        }
    }
    catch {
        Write-Host "  Error reading font: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Write-Host ""
}

Write-Host "Done! Use these internal names in your React Native code." -ForegroundColor Green
