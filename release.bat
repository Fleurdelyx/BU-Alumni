@echo off
setlocal enabledelayedexpansion

echo.
echo 🚀 BU Alumni Tracer - Create Release
echo ===================================

REM Check if Git is installed
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Git is not installed!
    echo.
    echo Please install Git first:
    echo 1. Download from: https://git-scm.com/download/win
    echo 2. Install with default settings
    echo 3. Restart command prompt
    echo 4. Run this script again
    goto :end
)

REM Check if this is a Git repository
if not exist ".git" (
    echo ❌ This is not a Git repository!
    echo.
    echo Please run setup first:
    echo    .\setup-github.bat
    goto :end
)

REM Check if remote origin exists
git remote get-url origin >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ No GitHub remote repository connected!
    echo.
    echo Please connect to GitHub first:
    echo    git remote add origin https://github.com/Fleurdelyx/BU-Alumni.git
    echo    git push -u origin main
    goto :end
)

if "%1"=="" (
    echo ❌ Please specify a version number!
    echo.
    echo Usage: release.bat [version]
    echo Example: release.bat 1.1.0
    echo.
    echo Current tags:
    git tag -l 2>nul || echo No tags found
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

REM Check if we have commits to push
git status --porcelain | findstr "." >nul
if %errorlevel% equ 0 (
    echo 📁 Adding any pending changes...
    git add .
    
    echo 💾 Committing changes...
    git commit -m "Prepare release v%VERSION%"
    if %errorlevel% neq 0 (
        echo ❌ Failed to commit changes!
        goto :end
    )
)

REM Create and push tag
echo 🏷️  Creating tag v%VERSION%...
git tag v%VERSION%
if %errorlevel% neq 0 (
    echo ❌ Failed to create tag!
    goto :end
)

echo 📤 Pushing to GitHub...
git push origin main
if %errorlevel% neq 0 (
    echo ❌ Failed to push to main branch!
    echo.
    echo Make sure you have push access to the repository
    goto :end
)

git push origin v%VERSION%
if %errorlevel% neq 0 (
    echo ❌ Failed to push tag to GitHub!
    echo.
    echo Make sure you have push access to the repository
    goto :end
)

echo.
echo ✅ Release v%VERSION% created successfully!
echo.
echo 🤖 GitHub Actions is now building your APKs...
echo 📱 APKs will be available at: 
echo    https://github.com/Fleurdelyx/BU-Alumni/releases
echo.
echo ⏱️  Build typically takes 2-3 minutes
echo 🔄 Refresh the releases page to see your new APKs

:end
pause