# 🚀 GitHub Setup & APK Download Instructions

## Quick Setup (5 minutes)

### Step 1: Run Setup Script
```bash
# Windows (double-click or run in Command Prompt)
setup-github.bat

# Or manually:
git init
git add .
git commit -m "Initial commit: BU Alumni Tracer v1.0.0"
```

### Step 2: Repository Already Created! 
✅ **Your repository already exists**: https://github.com/Fleurdelyx/BU-Alumni  
✅ **Public visibility**: Perfect for easy APK sharing  
✅ **Ready to use**: No additional setup needed  

### Step 3: Connect and Push
```bash
# Replace YOUR-USERNAME with your GitHub username
git branch -M main
git remote add origin https://github.com/Fleurdelyx/BU-Alumni.git  
git push -u origin main
```

### Step 4: Create First Release
```bash
# Create version tag (triggers automatic APK build)
git tag v1.0.0
git push origin v1.0.0

# Or use the helper script:
release.bat 1.0.0
```

## 📱 Download APKs

### Where to Find APKs
- **URL**: `https://github.com/Fleurdelyx/BU-Alumni/releases`
- **Build Time**: ~2-3 minutes after creating tag
- **Files Available**:
  - `bu-alumni-tracer-debug.apk` ⭐ (recommended for testing)
  - `bu-alumni-tracer-release.apk` (production optimized)

### Install on Android Phone
1. **Enable Unknown Sources**: Settings → Security → Install unknown apps
2. **Download APK**: Click on APK file in GitHub releases
3. **Install**: Open downloaded file and tap "Install"
4. **Done!** App icon will appear in your app drawer

## 🔄 Creating New Releases

### Option 1: Helper Script (Easiest)
```bash
release.bat 1.1.0  # Creates v1.1.0 release
```

### Option 2: Manual
```bash
# 1. Update version in pubspec.yaml (optional)
version: 1.1.0+2

# 2. Commit changes 
git add .
git commit -m "Update to v1.1.0"

# 3. Create and push tag
git tag v1.1.0
git push origin main  
git push origin v1.1.0
```

### What Happens Next
- ⚙️ GitHub Actions automatically builds APKs
- 📦 Creates release page with download links
- 📱 APKs ready for download in ~3 minutes

## 🛠️ GitHub Actions Features

### Automatic Builds
- ✅ Triggered on version tags (`v*.*.*`)  
- ✅ Builds both debug and release APKs
- ✅ Creates GitHub release with download links
- ✅ Includes installation instructions
- ✅ Manual trigger via "Actions" tab

### Build Information
- **Runner**: Ubuntu latest
- **Java**: Version 17 (Zulu)
- **Flutter**: Version 3.19.0 stable
- **Output**: Android APK files

## 📋 Sharing APKs with Others

### Easy Sharing Options
1. **Direct Link**: Share the releases URL
2. **QR Code**: Generate QR code for the release page
3. **Email**: Attach APK files directly
4. **Cloud Storage**: Upload APKs to Google Drive/Dropbox

### Sample Share Message
```
🎓 BU Alumni Tracer App is ready for testing!

📱 Download: https://github.com/Fleurdelyx/BU-Alumni/releases
📋 Install: Download "bu-alumni-tracer-debug.apk" and enable "Unknown Sources"

✨ Features: Alumni tracking, surveys, statistics, AI chatbot, dark mode
```

## 🔧 Troubleshooting

### Build Failed?
- Check GitHub Actions tab for error details
- Common issues: Android license agreements, dependency versions
- Solution: Update workflow Flutter version if needed

### Can't Download APK?
- Repository must be **Public** for easy access
- Or add collaborators if using Private repository
- Check if build completed successfully

### APK Won't Install?
- Enable "Install apps from unknown sources"
- Check Android version compatibility (API 21+)
- Try debug APK instead of release APK

## 🎯 Next Steps

1. **Test the APK** on your phone
2. **Share with team** for feedback  
3. **Create updates** using `release.bat X.X.X`
4. **Monitor** GitHub Actions for build status
5. **Celebrate** your deployed app! 🎉

---

💡 **Pro Tip**: Bookmark your releases page for quick APK access:
`https://github.com/Fleurdelyx/BU-Alumni/releases`