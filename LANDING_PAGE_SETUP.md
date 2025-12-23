# Landing/Login Page Setup

## ✅ What Was Created

### 1. **LandingView.swift**
A beautiful landing/login page with:
- **Game Center Sign In** - Button to authenticate with Game Center
- **Sign in with Apple** - Native Apple Sign In button
- **Continue as Guest** - Option to skip authentication
- **Animated Stars Background** - Space-themed visual effect
- **Loading States** - Shows progress during authentication
- **Error Handling** - Displays errors if sign-in fails

### 2. **GameCenterService.swift**
Service to handle Game Center authentication:
- Authenticates local player
- Provides player name and ID
- Integrates with Firebase Authentication

### 3. **FirebaseAuthService.swift**
Service to handle Firebase Authentication:
- **Game Center Integration** - Signs in to Firebase with Game Center credentials
- **Apple Sign In Integration** - Signs in to Firebase with Apple credentials
- **Auth State Management** - Tracks current user and authentication status
- **Ready for Firebase SDK** - Code is prepared, just needs SDK uncommented

## 🔧 Configuration Required

### 1. Enable Game Center in Xcode

1. Open your Xcode project
2. Select your project → Target "KadenAdelynnSpaceAdventures"
3. Go to **"Signing & Capabilities"** tab
4. Click **"+ Capability"**
5. Add **"Game Center"**
6. Xcode will automatically configure it

### 2. Enable Sign in with Apple in Xcode

1. In the same **"Signing & Capabilities"** tab
2. Click **"+ Capability"** (if not already added)
3. Add **"Sign in with Apple"**
4. Xcode will automatically configure the entitlements

### 3. Add Firebase SDK (When Ready)

Once you add the Firebase iOS SDK:

1. **Uncomment Firebase imports** in:
   - `FirebaseAuthService.swift`
   - `KadenAdelynnSpaceAdventuresApp.swift`

2. **Uncomment Firebase code** in:
   - `FirebaseAuthService.swift` - All the authentication methods
   - `KadenAdelynnSpaceAdventuresApp.swift` - AppDelegate for Firebase initialization

3. **Download GoogleService-Info.plist** from Firebase Console and add to Xcode

## 📱 How It Works

### First Launch:
1. App checks if user has signed in before
2. If not, shows `LandingView` (landing page)
3. User can choose:
   - **Game Center** - Authenticates with Game Center, then Firebase
   - **Sign in with Apple** - Authenticates with Apple, then Firebase
   - **Continue as Guest** - Skips authentication, goes to main menu

### Subsequent Launches:
1. App checks authentication state
2. If authenticated (Game Center, Apple, or Firebase), goes directly to main menu
3. If not authenticated and user chose guest before, goes to main menu
4. Only shows landing page if user hasn't signed in and hasn't chosen guest

## 🎨 UI Features

- **Space Theme** - Dark gradient background with animated stars
- **Modern Design** - Clean, iOS-native design with proper spacing
- **Accessibility** - Proper button sizes and contrast
- **Loading States** - Shows progress indicator during authentication
- **Error Handling** - Alerts for authentication errors

## 🔐 Authentication Flow

### Game Center:
1. User taps "Continue with Game Center"
2. Game Center authentication dialog appears
3. User authenticates with Face ID/Touch ID/password
4. Game Center credentials sent to Firebase
5. Firebase creates/updates user account
6. User navigated to main menu

### Sign in with Apple:
1. User taps "Sign in with Apple" button
2. Apple authentication sheet appears
3. User authenticates with Face ID/Touch ID/password
4. Apple credentials sent to Firebase
5. Firebase creates/updates user account
6. User navigated to main menu

### Guest:
1. User taps "Continue as Guest"
2. No authentication required
3. User navigated to main menu
4. Can sign in later from Settings

## 📝 Files Modified

- ✅ `ContentView.swift` - Updated to use `LandingView` instead of `SignInView`
- ✅ `GameStateManager.swift` - Default screen set to main menu (app handles routing)
- ✅ `KadenAdelynnSpaceAdventuresApp.swift` - Added authentication state check on app launch

## 🚀 Next Steps

1. **Enable Capabilities** in Xcode (Game Center and Sign in with Apple)
2. **Test Game Center** - Run on device or simulator with Game Center enabled
3. **Test Apple Sign In** - Run on device or simulator with Apple ID signed in
4. **Add Firebase SDK** - When ready, uncomment Firebase code
5. **Test Firebase Integration** - Verify authentication works with Firebase

## 🐛 Troubleshooting

### Game Center not working:
- Ensure Game Center capability is enabled in Xcode
- Check that device/simulator has Game Center enabled in Settings
- Verify you're signed in with an Apple ID in Settings

### Sign in with Apple not working:
- Ensure Sign in with Apple capability is enabled in Xcode
- Check that device/simulator has an Apple ID signed in
- Verify entitlements are properly configured

### Firebase not working:
- Ensure Firebase SDK is added to project
- Verify `GoogleService-Info.plist` is in the project
- Check that Firebase code is uncommented
- Verify Firebase Authentication is enabled in Firebase Console

## ✨ Features

- ✅ Beautiful landing page with space theme
- ✅ Game Center authentication
- ✅ Sign in with Apple
- ✅ Guest mode (skip authentication)
- ✅ Firebase integration (ready for SDK)
- ✅ Persistent authentication state
- ✅ Error handling and loading states
- ✅ Smooth navigation flow

