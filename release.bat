@echo off
setlocal enabledelayedexpansion

echo.
echo 🚀 BU Alumni Tracer - Create Release
echo ===================================

if "%1"=="" (
    echo Usage: release.bat [version]
    echo Example: release.bat 1.1.0
    echo.
    echo Current tags:
    git tag -l
    goto :end
)

set VERSION=%1

echo 📝 Creating release v%VERSION%...

REM Check if tag already exists
git tag -l | findstr "v%VERSION%" >nul
if %errorlevel% equ 0 (
    echo ❌ Tag v%VERSION% already exists!
    echo Current tags:
    git tag -l
    goto :end
)

REM Add and commit any changes
echo 📁 Adding any pending changes...
git add .

echo 💾 Committing changes...
git status --porcelain | findstr "." >nul
if %errorlevel% equ 0 (
    git commit -m "Prepare release v%VERSION%"
)

REM Create and push tag
echo 🏷️  Creating tag v%VERSION%...
git tag v%VERSION%

echo 📤 Pushing to GitHub...
git push origin main
git push origin v%VERSION%

echo.
echo ✅ Release v%VERSION% created successfully!
echo.
echo 🤖 GitHub Actions is now building your APKs...
echo 📱 APKs will be available at: 
echo    https://github.com/YOUR-USERNAME/bu-alumni-tracer/releases
echo.
echo ⏱️  Build typically takes 2-3 minutes
echo 🔄 Refresh the releases page to see your new APKs

:end
pause