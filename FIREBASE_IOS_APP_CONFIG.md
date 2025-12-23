# Firebase iOS App Configuration

## ✅ iOS App Registered in Firebase

Your iOS app has been successfully registered in Firebase!

## App Configuration Details

### App Information
- **App ID**: `1:265116401918:ios:edc1e0c21bf24fece0e5af`
- **Encoded App ID**: `app-1-265116401918-ios-edc1e0c21bf24fece0e5af`
- **App Nickname**: Kaden & Adelynn Space Adventures
- **Bundle ID**: `Kaden---Adelynn-Space-Adventures`
- **App Store ID**: `6749645849`
- **Team ID**: `4SQJ3AH62S`

### Project Information
- **Project ID**: `kaden---adelynn-adventures`
- **Project**: kaden---adelynn-adventures

## Next Steps

### 1. Download GoogleService-Info.plist

**In Firebase Console:**
1. Go to: https://console.firebase.google.com/project/kaden---adelynn-adventures/settings/general
2. Scroll to **Your apps** section
3. Find your iOS app: **Kaden & Adelynn Space Adventures**
4. Click **Download GoogleService-Info.plist**
5. Save the file

### 2. Add GoogleService-Info.plist to Xcode

1. Open your Xcode project
2. Right-click on the project root (or drag and drop)
3. Select **Add Files to "KadenAdelynnSpaceAdventures"...**
4. Select `GoogleService-Info.plist`
5. **Important**: Check these options:
   - ✅ **Copy items if needed**
   - ✅ **Add to targets**: KadenAdelynnSpaceAdventures
6. Click **Add**

### 3. Verify Bundle ID Matches

**In Xcode:**
1. Select your project in navigator
2. Select **KadenAdelynnSpaceAdventures** target
3. Go to **General** tab
4. Check **Bundle Identifier**: Should be `Kaden---Adelynn-Space-Adventures`
5. If different, update it to match Firebase

### 4. Uncomment Firebase Code

Once SDK is added and GoogleService-Info.plist is in place:

**In `KadenAdelynnSpaceAdventuresApp.swift`:**
- Uncomment `import FirebaseCore`
- Uncomment `AppDelegate` class
- Uncomment `@UIApplicationDelegateAdaptor`

**In `FirebaseService.swift`:**
- Uncomment `import FirebaseCore`
- Uncomment `import FirebaseFirestore`
- Uncomment Firebase code in methods

## Verification Checklist

- [x] iOS app registered in Firebase
- [x] App ID: `1:265116401918:ios:edc1e0c21bf24fece0e5af`
- [x] Bundle ID: `Kaden---Adelynn-Space-Adventures`
- [ ] Firebase SDK added to Xcode (in progress)
- [ ] GoogleService-Info.plist downloaded
- [ ] GoogleService-Info.plist added to Xcode project
- [ ] Bundle ID matches in Xcode
- [ ] Firebase code uncommented
- [ ] Firebase initialized and working

## Current Status

✅ **Firebase Console**: iOS app registered  
⏳ **Xcode**: Adding Firebase SDK (in progress)  
⏳ **Next**: Download and add GoogleService-Info.plist

## Important Notes

- **Bundle ID**: Make sure Xcode project Bundle ID matches: `Kaden---Adelynn-Space-Adventures`
- **GoogleService-Info.plist**: Contains all Firebase configuration - don't commit to git if it has sensitive data
- **Team ID**: `4SQJ3AH62S` - matches your development team

## After Setup

Once everything is configured:
1. Build and run the app
2. Play a game and get a score
3. Check "Global" tab in leaderboard
4. Verify scores appear in Firebase Console → Firestore Database

