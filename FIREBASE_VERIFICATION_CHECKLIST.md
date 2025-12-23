# Firebase Setup Verification Checklist

Use this checklist to verify your Firebase project is fully configured for the iOS app.

## Firebase Console: https://console.firebase.google.com/project/kaden---adelynn-adventures

### ✅ Step 1: Verify Firestore Database is Enabled

1. Go to Firebase Console → **Firestore Database**
2. Check if database exists:
   - ✅ **Database exists** → Continue
   - ❌ **No database** → Click "Create database"
     - Choose "Start in test mode" (we'll update rules next)
     - Select location closest to your users

### ✅ Step 2: Verify Firestore Security Rules

1. Go to **Firestore Database** → **Rules** tab
2. Verify rules allow leaderboard access:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // High scores - allow read for everyone, write for anyone
       match /highScores/{document=**} {
         allow read: if true;  // Anyone can read leaderboards
         allow write: if request.resource.data.score is int &&
                        request.resource.data.playerName is string;
       }
     }
   }
   ```
3. Click **Publish** if you made changes

### ✅ Step 3: Check if iOS App is Registered

1. Go to **Project Settings** (gear icon ⚙️)
2. Scroll to **Your apps** section
3. Check for iOS app:
   - ✅ **iOS app exists** → Note the Bundle ID
   - ❌ **No iOS app** → Click "Add app" → iOS
     - **Bundle ID**: Check your Xcode project
       - Open Xcode → Select project → General tab
       - Look for "Bundle Identifier" (e.g., `com.yourcompany.KadenAdelynnSpaceAdventures`)
     - **App nickname**: (optional)
     - **App Store ID**: (optional, leave blank)
     - Click **Register app**

### ✅ Step 4: Download GoogleService-Info.plist

1. In **Project Settings** → **Your apps** → iOS app
2. Click **Download GoogleService-Info.plist**
3. **Important**: Save this file - you'll need it for Xcode

### ✅ Step 5: Verify Firebase Configuration Values

In **Project Settings** → **Your apps** → iOS app, note these values:
- **Project ID**: `kaden---adelynn-adventures`
- **Bundle ID**: (your iOS app bundle ID)
- **App ID**: (starts with `1:`)
- **API Key**: (starts with `AIza...`)

These will be in the `GoogleService-Info.plist` file.

### ✅ Step 6: Check Firestore Collections

1. Go to **Firestore Database** → **Data** tab
2. Check if `highScores` collection exists:
   - ✅ **Exists** → Good! (may be empty, that's fine)
   - ❌ **Doesn't exist** → Will be created automatically when first score is saved

### ✅ Step 7: Verify Firebase SDK in Xcode

**In Xcode:**

1. Open your project
2. Check if Firebase is added:
   - **File** → **Add Packages...**
   - Look for `firebase-ios-sdk` in package dependencies
   - ✅ **Found** → Firebase SDK is added
   - ❌ **Not found** → Need to add (see FIREBASE_SETUP.md)

3. Check for `GoogleService-Info.plist`:
   - Look in project navigator
   - ✅ **Found** → Good!
   - ❌ **Not found** → Need to add (download from Firebase Console)

### ✅ Step 8: Verify Code Configuration

**Check `FirebaseService.swift`:**
- ✅ File exists in `Services/` folder
- ⏳ Firebase imports are uncommented (after SDK is added)
- ⏳ Firebase initialization code is uncommented (after SDK is added)

**Check `KadenAdelynnSpaceAdventuresApp.swift`:**
- ⏳ `FirebaseApp.configure()` is called (after SDK is added)

## Current Status

### ✅ Completed (Code Ready)
- [x] FirebaseService.swift created
- [x] CloudKitService updated to use Firebase
- [x] GameStateManager updated (no sign-in required)
- [x] ScoresView updated (Local/Global tabs)
- [x] Code compiles successfully

### ⏳ Needs Action (Firebase Setup)
- [ ] Firestore Database enabled
- [ ] Firestore Security Rules configured
- [ ] iOS app registered in Firebase Console
- [ ] GoogleService-Info.plist downloaded and added to Xcode
- [ ] Firebase iOS SDK added to Xcode project
- [ ] Firebase code uncommented in FirebaseService.swift
- [ ] Firebase initialized in app

## Quick Verification Commands

After setup, test in Xcode console:
```swift
// Should see: Firebase initialized successfully
// Should see: FirebaseService available: true
```

## What to Check in Firebase Console

1. **Overview Page**: Should show project `kaden---adelynn-adventures`
2. **Firestore Database**: Should be enabled
3. **Project Settings**: Should have iOS app registered
4. **Firestore Rules**: Should allow read/write for `highScores`

## Next Steps After Verification

Once all items are checked:
1. Add Firebase SDK to Xcode (if not done)
2. Add GoogleService-Info.plist to Xcode project
3. Uncomment Firebase code in FirebaseService.swift
4. Test by playing a game and checking leaderboard
5. Verify scores appear in Firebase Console → Firestore Database

## Support

If you encounter issues:
- Check `FIREBASE_SETUP.md` for detailed setup instructions
- Check `FIREBASE_INTEGRATION_SUMMARY.md` for integration details
- Verify all checklist items above

