@echo off
echo.
echo 🎓 BU Alumni Tracer - GitHub Setup
echo ==================================

REM Check if git is installed
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Git is not installed. Please install Git first.
    pause
    exit /b 1
)

REM Initialize git repository if not already initialized
if not exist ".git" (
    echo 📚 Initializing Git repository...
    git init
    echo ✅ Git repository initialized
) else (
    echo 📚 Git repository already exists
)

REM Add all files
echo 📁 Adding files to Git...
git add .

REM Commit initial files
echo 💾 Creating initial commit...
git commit -m "Initial commit: BU Alumni Tracer v1.0.0" -m "" -m "✨ Features:" -m "- Firebase Authentication & Firestore" -m "- Interactive questionnaires & surveys" -m "- Alumni directory & participant management" -m "- Statistics & analytics with charts" -m "- AI-powered chatbot (BUddy)" -m "- Dark/Light mode theme switching" -m "- Responsive Material Design UI" -m "" -m "🚀 Ready for production use with automated APK builds"

REM Instructions for GitHub setup
echo.
echo 🔗 Next Steps - GitHub Setup:
echo 1. Create a new repository on GitHub.com:
echo    - Name: bu-alumni-tracer
echo    - Description: Alumni tracer study app for Baliuag University
echo    - Visibility: Public (recommended for easy APK downloads)
echo.
echo 2. Your repository is already created at:
echo    https://github.com/Fleurdelyx/BU-Alumni
echo    No need to create a new repository!
echo.
echo 3. Copy and run these commands:
echo.
echo    git branch -M main
echo    git remote add origin https://github.com/Fleurdelyx/BU-Alumni.git
echo    git push -u origin main
echo.
echo 3. Create your first release:
echo    git tag v1.0.0
echo    git push origin v1.0.0
echo.
echo 📱 APK Download:
echo After pushing the tag, GitHub Actions will automatically:
echo - Build debug and release APKs
echo - Create a release page
echo - Upload APKs for download
echo.
echo 🌐 Your APK will be available at:
echo https://github.com/Fleurdelyx/BU-Alumni/releases
echo.
echo ✅ Setup complete! Happy coding! 🎉
echo.
pause