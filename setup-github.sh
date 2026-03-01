#!/bin/bash

# BU Alumni Tracer - GitHub Repository Setup Script
# This script helps you initialize and push the project to GitHub

echo "🎓 BU Alumni Tracer - GitHub Setup"
echo "=================================="

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed. Please install Git first."
    exit 1
fi

# Initialize git repository if not already initialized
if [ ! -d ".git" ]; then
    echo "📚 Initializing Git repository..."
    git init
    echo "✅ Git repository initialized"
else
    echo "📚 Git repository already exists"
fi

# Add all files
echo "📁 Adding files to Git..."
git add .

# Commit initial files
echo "💾 Creating initial commit..."
git commit -m "Initial commit: BU Alumni Tracer v1.0.0

✨ Features:
- Firebase Authentication & Firestore
- Interactive questionnaires & surveys  
- Alumni directory & participant management
- Statistics & analytics with charts
- AI-powered chatbot (BUddy)
- Dark/Light mode theme switching
- Responsive Material Design UI

🚀 Ready for production use with automated APK builds"

# Instructions for GitHub setup
echo ""
echo "🔗 Next Steps - GitHub Setup:"
echo "1. Create a new repository on GitHub.com:"
echo "   - Name: bu-alumni-tracer"
echo "   - Description: Alumni tracer study app for Baliuag University"
echo "   - Visibility: Public (recommended for easy APK downloads)"
echo ""
echo "2. Your repository is already created at:"
echo "   https://github.com/Fleurdelyx/BU-Alumni"
echo "   No need to create a new repository!"
echo ""
echo "3. Copy and run these commands:"
echo ""
echo "   git branch -M main"
echo "   git remote add origin https://github.com/Fleurdelyx/BU-Alumni.git"
echo "   git push -u origin main"
echo ""
echo "3. Create your first release:"
echo "   git tag v1.0.0"
echo "   git push origin v1.0.0"
echo ""
echo "📱 APK Download:"
echo "After pushing the tag, GitHub Actions will automatically:"
echo "- Build debug and release APKs"
echo "- Create a release page"
echo "- Upload APKs for download"
echo ""
echo "🌐 Your APK will be available at:"
echo "https://github.com/Fleurdelyx/BU-Alumni/releases"
echo ""
echo "✅ Setup complete! Happy coding! 🎉"