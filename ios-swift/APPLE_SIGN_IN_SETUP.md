# Sign in with Apple Setup Guide

This guide explains how to set up Sign in with Apple for the iOS version.

## Prerequisites

1. **Apple Developer Account**: Active Apple Developer account ($99/year)
2. **App ID**: Your app must have a unique bundle identifier
3. **Xcode**: Latest version of Xcode

## Setup Steps

### 1. Enable Sign in with Apple Capability

1. Open your Xcode project
2. Select your project in the navigator
3. Select your app target
4. Go to the **Signing & Capabilities** tab
5. Click **+ Capability**
6. Add **Sign in with Apple**
7. Xcode will automatically configure the entitlements

### 2. Configure App ID in Apple Developer Portal

1. Go to [Apple Developer Portal](https://developer.apple.com/account)
2. Navigate to **Certificates, Identifiers & Profiles**
3. Click **Identifiers**
4. Select your App ID
5. Under **Capabilities**, ensure **Sign in with Apple** is checked
6. Click **Save**

### 3. Test Sign in with Apple

#### On Simulator
- Sign in with Apple works on iOS 13+ simulators
- You'll need to be signed in with an Apple ID in the simulator's Settings

#### On Physical Device
- Requires iOS 13.0 or later
- Device must be signed in with an Apple ID in Settings
- Works with any Apple ID (doesn't need to be a developer account)

### 4. App Store Connect Configuration

When submitting to App Store:
1. Go to App Store Connect
2. Select your app
3. Go to **App Information**
4. Under **Sign in with Apple**, it will be automatically enabled if capability is added

## How It Works

1. **First Launch**: App shows Sign in screen
2. **User Taps "Sign in with Apple"**: Apple's authentication sheet appears
3. **User Authenticates**: Uses Face ID, Touch ID, or password
4. **App Receives**: 
   - User identifier (unique, stable ID)
   - Name (only on first sign-in)
   - Email (only on first sign-in, if user grants permission)
5. **Data Sync**: Game data syncs to iCloud using CloudKit

## Privacy

- **User Identifier**: Unique to your app, cannot be used to identify user across apps
- **Name/Email**: Only provided on first sign-in, stored locally
- **No Tracking**: We don't track users or collect personal information
- **User Control**: Users can revoke access in Settings → Apple ID → Password & Security → Apps Using Apple ID

## Code Integration

The app includes:
- `AppleSignInService.swift` - Handles all Sign in with Apple operations
- `SignInView.swift` - UI for sign in screen
- Automatic integration with CloudKit for data sync

## Testing Checklist

- [ ] Sign in with Apple button appears
- [ ] Authentication sheet appears when tapped
- [ ] Sign in completes successfully
- [ ] User identifier is saved
- [ ] Name/email are saved (if provided)
- [ ] Sign out works correctly
- [ ] Data syncs to CloudKit after sign in
- [ ] App remembers sign-in state between launches

## Troubleshooting

### "Sign in with Apple not available"
- Check capability is enabled in Xcode
- Verify App ID has Sign in with Apple enabled in Developer Portal
- Ensure device/simulator is signed in with Apple ID

### "Invalid client"
- Check bundle identifier matches App ID
- Verify App ID has Sign in with Apple capability

### Name/Email not received
- Name/email are only provided on first sign-in
- User may have chosen "Hide My Email"
- Check if user granted email permission

## App Store Submission

Before submitting:
1. ✅ Sign in with Apple capability enabled
2. ✅ Tested on physical device
3. ✅ Privacy Policy updated (already done)
4. ✅ App Privacy Questionnaire completed mentioning Sign in with Apple

## Notes

- Sign in with Apple is **required** for apps that use third-party sign-in
- If you offer other sign-in methods, you must also offer Sign in with Apple
- Since we only use Sign in with Apple, this requirement is met
- Users can choose to continue without signing in (data stored locally only)
