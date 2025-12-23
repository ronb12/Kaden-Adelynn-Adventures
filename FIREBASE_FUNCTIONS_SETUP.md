# Firebase Functions Setup for Game Center Authentication

This guide explains how to set up and deploy Firebase Cloud Functions to generate custom tokens for Game Center users.

## Overview

Firebase Functions provides a secure way to generate custom authentication tokens for Game Center users. This replaces the anonymous authentication method with proper Game Center integration.

## Prerequisites

1. **Node.js** (v18 or later) - [Download](https://nodejs.org/)
2. **Firebase CLI** - Already installed
3. **Firebase project** - Already configured

## Setup Steps

### 1. Install Dependencies

Navigate to the functions directory and install dependencies:

```bash
cd functions
npm install
```

### 2. Deploy the Function

Deploy the function to Firebase:

```bash
firebase deploy --only functions
```

Or deploy from the project root:

```bash
cd /Users/ronellbradley/Desktop/kaden-adelynn-space-adventures-ios-swift
firebase deploy --only functions
```

### 3. Verify Deployment

After deployment, verify the function is available:

```bash
firebase functions:list
```

You should see `generateGameCenterToken` in the list.

## Function Details

### `generateGameCenterToken`

**Purpose**: Generates a custom Firebase token for Game Center authenticated users.

**Parameters**:
- `playerID` (string, required): Game Center player ID
- `displayName` (string, optional): Game Center display name

**Returns**:
- `token` (string): Custom Firebase token
- `uid` (string): Firebase user ID (format: `gc_<playerID>`)

**Security**:
- The function creates a consistent UID for each Game Center player
- Custom claims are added to identify the provider as 'gamecenter'
- The function is callable from the iOS app

## iOS Integration

The iOS app automatically calls this function when a user signs in with Game Center. The flow is:

1. User authenticates with Game Center
2. iOS app calls `generateGameCenterToken` Cloud Function
3. Function generates and returns a custom token
4. iOS app signs in to Firebase using the custom token
5. User is authenticated with Firebase

## Testing

### Test Locally (Optional)

You can test the function locally before deploying:

```bash
cd functions
npm run serve
```

Then use the Firebase emulator to test.

### Test in Production

1. Build and run the iOS app
2. Tap "Sign in with Game Center"
3. Verify authentication succeeds
4. Check Firebase Console > Authentication to see the new user

## Troubleshooting

### Function Not Found

If you get "Function not found" errors:
- Verify the function is deployed: `firebase functions:list`
- Check the function name matches exactly: `generateGameCenterToken`
- Ensure you're using the correct Firebase project

### Authentication Fails

If authentication fails:
- Check Firebase Console > Functions > Logs for errors
- Verify Game Center is properly authenticated on the device
- Check that the playerID is being sent correctly

### Custom Token Invalid

If you get "Invalid custom token" errors:
- Verify the function is returning a valid token
- Check Firebase project configuration
- Ensure the function has proper permissions

## Security Considerations

1. **Rate Limiting**: Consider adding rate limiting to prevent abuse
2. **Validation**: The function validates the playerID before generating tokens
3. **UID Consistency**: Same Game Center player always gets the same Firebase UID
4. **Custom Claims**: Provider information is stored in custom claims for easy identification

## Next Steps

After deploying:
1. Test Game Center sign-in in the iOS app
2. Verify users appear in Firebase Console > Authentication
3. Check that personal best scores sync correctly
4. Monitor function logs for any issues

## Additional Resources

- [Firebase Functions Documentation](https://firebase.google.com/docs/functions)
- [Custom Authentication Tokens](https://firebase.google.com/docs/auth/admin/create-custom-tokens)
- [Game Center Integration](https://developer.apple.com/documentation/gamekit)

