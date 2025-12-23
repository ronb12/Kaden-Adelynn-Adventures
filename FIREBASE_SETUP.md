# Firebase Setup for iOS App

This guide will help you set up Firebase for the iOS app to enable global leaderboards.

## Prerequisites

- Firebase project: `kaden---adelynn-adventures` (already set up for PWA)
- Xcode project: `KadenAdelynnSpaceAdventures.xcodeproj`

## Step 1: Add Firebase iOS SDK

### Option A: Swift Package Manager (Recommended)

1. Open your Xcode project
2. Go to **File** → **Add Packages...**
3. Enter: `https://github.com/firebase/firebase-ios-sdk`
4. Select **FirebaseFirestore** package
5. Click **Add Package**
6. Select your app target and click **Add Package**

### Option B: CocoaPods

1. Install CocoaPods if not already installed:
   ```bash
   sudo gem install cocoapods
   ```

2. Navigate to your project directory:
   ```bash
   cd "/Users/ronellbradley/Desktop/kaden-adelynn-space-adventures-ios-swift"
   ```

3. Create `Podfile`:
   ```bash
   pod init
   ```

4. Edit `Podfile` and add:
   ```ruby
   platform :ios, '15.0'
   use_frameworks!

   target 'KadenAdelynnSpaceAdventures' do
     pod 'Firebase/Firestore'
   end
   ```

5. Install:
   ```bash
   pod install
   ```

6. Open `.xcworkspace` instead of `.xcodeproj`:
   ```bash
   open KadenAdelynnSpaceAdventures.xcworkspace
   ```

## Step 2: Get Firebase Configuration

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **kaden---adelynn-adventures**
3. Click the gear icon ⚙️ → **Project Settings**
4. Scroll to **Your apps** section
5. Click **Add app** → **iOS** (if you haven't added iOS app yet)
6. Register your iOS app:
   - **Bundle ID**: Check your Xcode project's Bundle Identifier
     - Usually: `com.yourcompany.KadenAdelynnSpaceAdventures` or similar
   - **App nickname**: (optional)
   - **App Store ID**: (optional, leave blank for now)
7. Download `GoogleService-Info.plist`
8. Drag `GoogleService-Info.plist` into your Xcode project (make sure to check "Copy items if needed")

## Step 3: Update FirebaseService.swift

1. Open `KadenAdelynnSpaceAdventures/Services/FirebaseService.swift`
2. Add import at the top:
   ```swift
   import FirebaseCore
   import FirebaseFirestore
   ```

3. Update the `init()` method:
   ```swift
   private init() {
       // Initialize Firebase if not already initialized
       if FirebaseApp.app() == nil {
           FirebaseApp.configure()
       }
       checkAvailability()
   }
   ```

4. Update `checkAvailability()`:
   ```swift
   func checkAvailability() {
       isAvailable = FirebaseApp.app() != nil
   }
   ```

5. Uncomment the Firebase code in `saveHighScore()` and `fetchHighScores()` methods
6. Update the Firebase config values with your actual values from `GoogleService-Info.plist`

## Step 4: Initialize Firebase in App

1. Open `KadenAdelynnSpaceAdventuresApp.swift`
2. Add import:
   ```swift
   import FirebaseCore
   ```

3. Update the `init()` or add to `body`:
   ```swift
   init() {
       FirebaseApp.configure()
   }
   ```

## Step 5: Configure Firestore Security Rules

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Firestore Database** → **Rules**
4. Update rules to allow read/write for leaderboards:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // High scores - allow read for everyone, write for authenticated users
       match /highScores/{document=**} {
         allow read: if true;  // Anyone can read leaderboards
         allow write: if request.auth != null || 
                        request.resource.data.score is int &&
                        request.resource.data.playerName is string;  // Allow anonymous writes with validation
       }
     }
   }
   ```

## Step 6: Test Firebase Connection

1. Build and run the app
2. Play a game and get a score
3. Check the leaderboard - scores should sync to Firebase
4. Check Firebase Console → Firestore Database to see if scores are being saved

## Troubleshooting

### Firebase not initializing
- Make sure `GoogleService-Info.plist` is in the project root
- Check that Bundle ID matches Firebase project
- Verify Firebase SDK is properly installed

### Scores not saving
- Check Firestore security rules
- Verify network connection
- Check Xcode console for error messages

### Scores not appearing
- Check Firestore Database in Firebase Console
- Verify `fetchHighScores()` is being called
- Check network connectivity

## Current Status

✅ **FirebaseService.swift** - Created and ready
✅ **CloudKitService.swift** - Updated to use Firebase
✅ **ScoresView.swift** - Already configured to use CloudKitService

⏳ **Next Steps:**
1. Add Firebase iOS SDK to project
2. Add `GoogleService-Info.plist`
3. Uncomment Firebase code in `FirebaseService.swift`
4. Test leaderboard sync

## Notes

- The service currently falls back to local storage until Firebase is configured
- Once Firebase is set up, scores will sync globally across all users
- No sign-in required for reading leaderboards
- Writing scores can be anonymous (no authentication needed)

