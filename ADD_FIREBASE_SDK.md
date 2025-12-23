# Adding Firebase iOS SDK to Xcode Project

## Repository URL
```
https://github.com/firebase/firebase-ios-sdk
```

## Step-by-Step Instructions

### Method 1: Via Xcode UI (Recommended)

1. **Open Xcode Project**
   - Open `KadenAdelynnSpaceAdventures.xcodeproj` in Xcode

2. **Add Package Dependency**
   - In Xcode, select the **project** (blue icon) in the navigator
   - Select the **KadenAdelynnSpaceAdventures** project (not the target)
   - Go to the **Package Dependencies** tab

3. **Add Firebase Package**
   - Click the **+** button at the bottom left
   - In the search field, paste: `https://github.com/firebase/firebase-ios-sdk`
   - Click **Add Package**

4. **Select Firebase Products**
   - Xcode will show available Firebase products
   - Select these products:
     - ✅ **FirebaseFirestore** (required for leaderboards)
     - ✅ **FirebaseCore** (required base)
   - Click **Add Package**

5. **Verify Installation**
   - Check that packages appear in **Package Dependencies** tab
   - Check that they're linked to your target in **Build Phases** → **Link Binary With Libraries**

### Method 2: Quick Add (If Xcode Auto-detects)

1. **File** → **Add Packages...**
2. Paste URL: `https://github.com/firebase/firebase-ios-sdk`
3. Click **Add Package**
4. Select **FirebaseFirestore** and **FirebaseCore**
5. Click **Add Package**

## After Adding SDK

### 1. Update FirebaseService.swift

Uncomment the Firebase code:

```swift
import FirebaseCore
import FirebaseFirestore
```

Update `init()`:
```swift
private init() {
    if FirebaseApp.app() == nil {
        FirebaseApp.configure()
    }
    checkAvailability()
}
```

Update `checkAvailability()`:
```swift
func checkAvailability() {
    isAvailable = FirebaseApp.app() != nil
}
```

Uncomment the Firebase code in `saveHighScore()` and `fetchHighScores()` methods.

### 2. Initialize Firebase in App

Update `KadenAdelynnSpaceAdventuresApp.swift`:

```swift
import SwiftUI
import FirebaseCore

@main
struct KadenAdelynnSpaceAdventuresApp: App {
    @StateObject private var gameState = GameStateManager()
    @StateObject private var themeManager = ThemeManager.shared
    
    init() {
        FirebaseApp.configure()
    }
    
    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(gameState)
                .environmentObject(themeManager)
                .preferredColorScheme(themeManager.currentTheme.colorScheme)
        }
    }
}
```

### 3. Add GoogleService-Info.plist

1. Download from Firebase Console:
   - Go to: Project Settings → Your apps → iOS app
   - Download `GoogleService-Info.plist`

2. Add to Xcode:
   - Drag `GoogleService-Info.plist` into your Xcode project
   - Make sure **"Copy items if needed"** is checked
   - Select your app target
   - Click **Add**

## Verification

After setup, build the project:
```bash
xcodebuild -project KadenAdelynnSpaceAdventures.xcodeproj \
  -scheme KadenAdelynnSpaceAdventures \
  -destination 'platform=iOS Simulator,name=iPhone 14 Pro Max' \
  build
```

Should see: **BUILD SUCCEEDED**

## Troubleshooting

**Package not found:**
- Check internet connection
- Verify URL is correct: `https://github.com/firebase/firebase-ios-sdk`
- Try: File → Packages → Reset Package Caches

**Build errors:**
- Make sure FirebaseFirestore and FirebaseCore are added
- Check that imports are correct
- Verify GoogleService-Info.plist is in project

**Runtime errors:**
- Make sure `FirebaseApp.configure()` is called in app init
- Verify GoogleService-Info.plist is included in target

## Next Steps

Once SDK is added:
1. ✅ Uncomment Firebase code in FirebaseService.swift
2. ✅ Add Firebase initialization in app
3. ✅ Add GoogleService-Info.plist
4. ✅ Test leaderboard functionality

