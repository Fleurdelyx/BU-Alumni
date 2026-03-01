@echo off
echo ====================================================
echo    MANUAL APK RELEASE TRIGGER - GET YOUR APKs NOW!
echo ====================================================
echo.

echo 🎯 PROBLEM: Only tags exist, no APK releases yet
echo ✅ SOLUTION: Manual trigger for guaranteed APK builds
echo.

echo 📱 To create APK releases RIGHT NOW:
echo.
echo 1. Go to this URL:
echo    https://github.com/Fleurdelyx/BU-Alumni/actions/workflows/manual-apk-release.yml
echo.
echo 2. Click the "Run workflow" dropdown button (green button)
echo.
echo 3. Enter version name: v1.0.5 (or any version you want)
echo.
echo 4. Click "Run workflow" to start building APKs
echo.
echo 5. Wait 5-8 minutes, then check:
echo    https://github.com/Fleurdelyx/BU-Alumni/releases

echo.
echo ====================================================
echo    WHY THIS WORKS:
echo ====================================================
echo.
echo ✅ Fixed minSdk compatibility issue in build.gradle.kts
echo ✅ Created dedicated manual release workflow
echo ✅ Uses exact Flutter version (3.41.2) from your computer
echo ✅ Builds both debug AND release APKs
echo ✅ Automatically creates GitHub release with downloadable APKs
echo.

echo 🚀 OPENING MANUAL TRIGGER PAGE...
echo.

start https://github.com/Fleurdelyx/BU-Alumni/actions/workflows/manual-apk-release.yml

echo.
echo 💡 TIP: Bookmark this URL for future APK builds!
echo.

pause