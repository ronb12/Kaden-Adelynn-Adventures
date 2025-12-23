# Game Center Firebase Authentication Setup

## ✅ What's Been Done

### 1. Firebase Cloud Function Created
- **Location**: `/functions/index.js`
- **Function Name**: `generateGameCenterToken`
- **Purpose**: Generates custom Firebase tokens for Game Center users

### 2. iOS Client Code Updated
- **File**: `FirebaseAuthService.swift`
- **Changes**: 
  - Added `import FirebaseFunctions`
  - Updated `signInWithGameCenter()` to call the Cloud Function
  - Uses custom token authentication instead of anonymous auth

### 3. Function Package Configuration
- **Location**: `/functions/package.json`
- **Dependencies**: Firebase Admin SDK and Functions SDK

## 📋 Next Steps

### Step 1: Add FirebaseFunctions to Xcode

Make sure `FirebaseFunctions` is added to your Xcode project:

1. Open Xcode
2. Go to **File > Add Package Dependencies**
3. Add: `https://github.com/firebase/firebase-ios-sdk`
4. Select **FirebaseFunctions** (in addition to FirebaseCore, FirebaseAuth, FirebaseFirestore)
5. Click **Add Package**

### Step 2: Deploy the Cloud Function

Navigate to the functions directory and deploy:

```bash
cd /Users/ronellbradley/Desktop/kaden-adelynn-space-adventures-ios-swift/functions
npm install
firebase deploy --only functions
```

**Note**: Make sure you're logged into Firebase:
```bash
firebase login
```

### Step 3: Verify Deployment

Check that the function is deployed:

```bash
firebase functions:list
```

You should see `generateGameCenterToken` in the output.

### Step 4: Test in iOS App

1. Build and run the iOS app
2. Tap "Sign in with Game Center"
3. The app will:
   - Authenticate with Game Center
   - Call the Cloud Function
   - Receive a custom token
   - Sign in to Firebase with that token

## 🔍 How It Works

1. **User taps "Sign in with Game Center"**
   - iOS authenticates with Game Center
   - Gets player ID and display name

2. **iOS app calls Cloud Function**
   - Sends player ID and display name to `generateGameCenterToken`
   - Function generates a custom Firebase token

3. **Function creates/updates Firebase user**
   - Creates a consistent UID: `gc_<playerID>`
   - Sets display name
   - Adds custom claims (provider: 'gamecenter')

4. **iOS app signs in with custom token**
   - Uses `Auth.auth().signIn(withCustomToken:)`
   - User is now authenticated with Firebase

## 🎯 Benefits

- **Consistent UIDs**: Same Game Center player always gets the same Firebase UID
- **Proper Authentication**: Uses Firebase custom tokens instead of anonymous auth
- **User Identification**: Custom claims identify the provider as 'gamecenter'
- **Secure**: Server-side token generation ensures security

## 🐛 Troubleshooting

### "Module 'FirebaseFunctions' not found"
- Make sure FirebaseFunctions is added to Xcode project
- Clean build folder: **Product > Clean Build Folder**
- Rebuild the project

### "Function not found"
- Verify function is deployed: `firebase functions:list`
- Check function name matches exactly: `generateGameCenterToken`
- Ensure you're using the correct Firebase project

### "Invalid custom token"
- Check Firebase Console > Functions > Logs for errors
- Verify the function is returning a valid token
- Check Firebase project configuration

### Authentication fails silently
- Check Xcode console for errors
- Verify Game Center is properly authenticated
- Check Firebase Console > Authentication for user creation

## 📚 Additional Resources

- [Firebase Functions Documentation](https://firebase.google.com/docs/functions)
- [Custom Authentication Tokens](https://firebase.google.com/docs/auth/admin/create-custom-tokens)
- [Game Center Integration](https://developer.apple.com/documentation/gamekit)

