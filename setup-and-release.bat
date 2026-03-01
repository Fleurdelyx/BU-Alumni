@echo off
set GIT_PATH=%~dp0git-portable\bin\git.exe
echo Using Git from: %GIT_PATH%

echo.
echo 🚀 Initializing BU Alumni Repository...
echo ======================================

REM Initialize git repository
echo 📚 Initializing Git repository...
"%GIT_PATH%" init
if %errorlevel% neq 0 (
    echo ❌ Failed to initialize Git repository
    pause
    exit /b 1
)

REM Configure git (basic setup)
echo ⚙️  Configuring Git...
"%GIT_PATH%" config user.name "BU Alumni Developer"
"%GIT_PATH%" config user.email "developer@bualumni.com"

REM Add all files
echo 📁 Adding all project files...
"%GIT_PATH%" add .

REM Create initial commit
echo 💾 Creating initial commit...
"%GIT_PATH%" commit -m "Initial commit: BU Alumni Tracer v1.0.0" -m "" -m "✨ Features:" -m "- Firebase Authentication & Firestore" -m "- Interactive questionnaires & surveys" -m "- Alumni directory & participant management" -m "- Statistics & analytics with charts" -m "- AI-powered chatbot (BUddy)" -m "- Dark/Light mode theme switching" -m "- Responsive Material Design UI" -m "" -m "🚀 Ready for production use with automated APK builds"

REM Set main branch
echo 🌿 Setting up main branch...
"%GIT_PATH%" branch -M main

REM Add remote origin
echo 🔗 Connecting to GitHub repository...
"%GIT_PATH%" remote add origin https://github.com/Fleurdelyx/BU-Alumni.git

REM Push to GitHub
echo 📤 Pushing to GitHub...
"%GIT_PATH%" push -u origin main

if %errorlevel% neq 0 (
    echo.
    echo ⚠️  Push failed - this is normal for the first time!
    echo.
    echo 📋 To complete setup, you need to:
    echo 1. Go to: https://github.com/Fleurdelyx/BU-Alumni
    echo 2. Make sure the repository exists and you have write access
    echo 3. Try running this script again
    echo.
    echo Or manually run: 
    echo %GIT_PATH% push -u origin main
) else (
    echo.
    echo ✅ Successfully pushed to GitHub!
    echo.
    echo 🏷️  Creating first release tag...
    "%GIT_PATH%" tag v1.0.0
    "%GIT_PATH%" push origin v1.0.0
    
    if %errorlevel% equ 0 (
        echo.
        echo 🎉 SUCCESS! Your app is now on GitHub!
        echo.
        echo 🤖 GitHub Actions is building your APKs...
        echo 📱 APK downloads will be available at:
        echo    https://github.com/Fleurdelyx/BU-Alumni/releases
        echo.
        echo ⏱️  Check back in 2-3 minutes for the APK files!
    )
)

pause