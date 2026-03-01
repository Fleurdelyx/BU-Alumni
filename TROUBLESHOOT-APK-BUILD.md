# APK Build Troubleshooting Guide

## Issue: Release v1.0.0 only contains source code, no APK files

### Step 1: Check GitHub Actions Status

1. Go to your repository: https://github.com/Fleurdelyx/BU-Alumni
2. Click on the **"Actions"** tab
3. Check if you see:
   - ❌ **If no Actions tab exists**: GitHub Actions is disabled
   - ☑️ **If Actions tab exists**: Check if there are workflow runs

### Step 2: Enable GitHub Actions (if needed)

If GitHub Actions is disabled:
1. Go to repository **Settings** → **Actions** → **General**
2. Under "Actions permissions", select **"Allow all actions and reusable workflows"**
3. Click **"Save"**

### Step 3: Check Workflow Run Status

If Actions is enabled, look for workflow runs:
1. In the **Actions** tab, look for "Build and Release APK" workflows
2. Check if there's a run for the v1.0.0 tag
3. If there's a ❌ failed run, click on it to see error logs
4. If there's no run at all, the tag push didn't trigger it properly

### Step 4A: If Workflow Failed - Common Issues

**Error: "Flutter not found"**
- The workflow should install Flutter automatically
- Check if the Flutter version (3.19.0) is available

**Error: "Build failed"**
- Check if there are missing dependencies
- Verify if Firebase configuration is correct

**Error: "Permission denied"**
- GitHub Actions needs proper permissions
- Check repository settings

### Step 4B: If No Workflow Run - Manual Trigger

1. Go to **Actions** tab
2. Click **"Build and Release APK"** workflow
3. Click **"Run workflow"** button
4. Select the **main** branch
5. Click **"Run workflow"**

### Step 5: Alternative - Delete and Re-create Release

If all else fails, let's delete the current release and recreate it properly:

1. Go to **Releases** page
2. Click on **v1.0.0** release
3. Click **"Delete"** (this removes the release but keeps the tag)
4. Go to **Actions** tab
5. Manually trigger the "Build and Release APK" workflow
6. OR: Create a new tag v1.0.1 to trigger automatically

### Step 6: Create New Release Tag

If you want to try a fresh release:

```bash
# Run this in your local repository
.\git-portable\bin\git.exe tag v1.0.1 -m "Release with APK files"
.\git-portable\bin\git.exe push origin v1.0.1
```

### Step 7: Verify APK Files

Once the workflow completes successfully, you should see:
- ✅ `bu-alumni-tracer-debug.apk` (for testing)
- ✅ `bu-alumni-tracer-release.apk` (for production)

Both files should be attached to the release at:
https://github.com/Fleurdelyx/BU-Alumni/releases

---

## Quick Commands for Local Testing

If GitHub Actions continues to have issues, you can build APKs locally:

```bash
# Build debug APK
flutter build apk --debug

# Build release APK  
flutter build apk --release

# APK files will be in:
# build/app/outputs/flutter-apk/app-debug.apk
# build/app/outputs/flutter-apk/app-release.apk
```

---

## Expected Timeline

✅ **Workflow starts**: Immediately after tag push
✅ **APK build completes**: 2-4 minutes  
✅ **Release updated**: APKs attached automatically

If it takes longer than 5 minutes, check the workflow logs for errors.