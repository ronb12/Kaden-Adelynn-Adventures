# Quick Guide: Adding Firebase iOS SDK

## Repository URL
```
https://github.com/firebase/firebase-ios-sdk
```

## In Xcode (When Prompted)

1. **File** → **Add Packages...** (or click **+** in Package Dependencies tab)

2. **Enter URL**: 
   ```
   https://github.com/firebase/firebase-ios-sdk
   ```

3. **Click "Add Package"**

4. **Select Products**:
   - ✅ **FirebaseFirestore** (for leaderboards)
   - ✅ **FirebaseCore** (required base)
   
5. **Click "Add Package"**

6. **Verify**:
   - Packages should appear in Project Navigator under "Package Dependencies"
   - Should be linked to your target

## After Adding SDK

### 1. Update Imports in FirebaseService.swift

Add at the top:
```swift
import FirebaseCore
import FirebaseFirestore
```

### 2. Uncomment Firebase Code

In `FirebaseService.swift`, uncomment all the Firebase code that's currently commented out.

### 3. Initialize in App

Update `KadenAdelynnSpaceAdventuresApp.swift`:
```swift
import FirebaseCore

init() {
    FirebaseApp.configure()
}
```

### 4. Add GoogleService-Info.plist

Download from Firebase Console and add to Xcode project.

## That's It!

Once SDK is added and code is uncommented, Firebase will work!

