@echo off
echo ================================================
echo    APK BUILD TROUBLESHOOTING HELPER
echo ================================================
echo.

echo 1. Checking current repository status...
.\git-portable\bin\git.exe status

echo.
echo 2. Checking current tags...
.\git-portable\bin\git.exe tag -l

echo.
echo ================================================
echo    NEXT STEPS:
echo ================================================
echo.
echo A. First, check GitHub Actions:
echo    → Go to: https://github.com/Fleurdelyx/BU-Alumni/actions
echo    → See if GitHub Actions is enabled
echo    → Look for any failed workflow runs
echo.
echo B. If Actions is disabled:
echo    → Go to Settings → Actions → General  
echo    → Enable "Allow all actions and reusable workflows"
echo.
echo C. To manually trigger APK build:
echo    → Go to Actions tab
echo    → Click "Build and Release APK"
echo    → Click "Run workflow"
echo.
echo D. To create a new release tag (v1.0.1):
echo    → Press any key, then type: make-new-release
echo.
echo E. For detailed troubleshooting:
echo    → Read: TROUBLESHOOT-APK-BUILD.md
echo.
echo ================================================

echo.
set /p choice="Press Enter to continue or type 'make-new-release' to create v1.0.1: "

if /i "%choice%"=="make-new-release" (
    echo.
    echo Creating new release tag v1.0.1...
    .\git-portable\bin\git.exe tag v1.0.1 -m "Fixed release with APK files"
    echo.
    echo Pushing tag to GitHub... 
    .\git-portable\bin\git.exe push origin v1.0.1
    echo.
    echo ✅ Created and pushed v1.0.1 tag
    echo ✅ This should trigger the APK build workflow
    echo.
    echo Check the build progress at:
    echo https://github.com/Fleurdelyx/BU-Alumni/actions
    echo.
    echo APKs should be available in 2-4 minutes at:
    echo https://github.com/Fleurdelyx/BU-Alumni/releases
)

echo.
pause