# Build and Launch Instructions

## Current Status

The command-line build is encountering sandbox permission issues with CocoaPods framework embedding. This is a known limitation when building CocoaPods projects from the terminal.

## ✅ Solution: Build and Run in Xcode

I've triggered a build in Xcode. Here's how to complete the process:

### Option 1: Use Xcode (Recommended)

1. **Wait for build to complete** - Check the status bar at the top of Xcode
2. **Select a simulator** - Choose "iPhone 16 Pro" or any available simulator from the device menu
3. **Run the app** - Press `Cmd+R` or click the Play button ▶️

### Option 2: Manual Steps

If the automated build didn't work:

1. **In Xcode:**
   - Product > Clean Build Folder (Shift+Cmd+K)
   - Product > Build (Cmd+B)
   - Wait for "Build Succeeded" ✅
   - Product > Run (Cmd+R)

2. **Select Simulator:**
   - Click the device selector next to the scheme
   - Choose "iPhone 16 Pro" or any available simulator

3. **App will launch automatically** after build completes

## Why Command Line Build Fails

The `xcodebuild` command line tool runs in a sandbox that doesn't have the same permissions as Xcode's GUI. The CocoaPods "Embed Pods Frameworks" script requires file system permissions that are restricted in the sandbox.

## Alternative: Build Without Embedding (Not Recommended)

If you absolutely must build from command line, you could modify the Podfile to skip framework embedding, but this is **not recommended** as it may cause runtime issues.

## Verification

Once the app launches:
- ✅ Landing page should appear
- ✅ Firebase modules should be loaded
- ✅ No "Unable to find module" errors
- ✅ App should be fully functional

## Next Steps After Launch

1. Test Game Center sign-in
2. Test Apple Sign In
3. Test "Continue as Guest"
4. Verify Firebase connectivity

