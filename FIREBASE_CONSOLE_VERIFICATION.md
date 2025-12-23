# Firebase Console Verification Guide

## Access Your Firebase Console

**URL**: https://console.firebase.google.com/project/kaden---adelynn-adventures/overview

## What to Verify

### 1. Project Overview ✅
- **Project Name**: `kaden---adelynn-adventures`
- **Status**: Active
- **Location**: (check your region)

### 2. Firestore Database ✅

**Path**: Firebase Console → **Firestore Database**

**Check:**
- [ ] Database exists
- [ ] Database is in **Native mode** (not Datastore mode)
- [ ] Location is set (e.g., `us-central1`, `europe-west1`)
- [ ] **Rules** tab shows security rules (see below)
- [ ] **Data** tab shows collections (may be empty - that's OK)

**Security Rules Should Be:**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /highScores/{document=**} {
      allow read: if true;
      allow write: if request.resource.data.score is int &&
                     request.resource.data.playerName is string;
    }
  }
}
```

### 3. iOS App Registration ✅

**Path**: Firebase Console → **Project Settings** (gear icon) → **Your apps**

**Check:**
- [ ] iOS app is listed
- [ ] Bundle ID matches your Xcode project
- [ ] `GoogleService-Info.plist` is available for download

**If iOS app is NOT registered:**
1. Click **Add app** → **iOS** (</>)
2. Enter your **Bundle ID** from Xcode:
   - Open Xcode → Your project → General tab
   - Copy "Bundle Identifier"
3. Enter **App nickname** (optional)
4. Click **Register app**
5. **Download** `GoogleService-Info.plist`

### 4. Project Settings ✅

**Path**: Firebase Console → **Project Settings**

**Check these values:**
- **Project ID**: `kaden---adelynn-adventures`
- **Project number**: (starts with numbers)
- **Web API Key**: (starts with `AIza...`)

**In Your apps section:**
- **iOS app** should be listed
- **App ID**: (starts with `1:`)
- **Bundle ID**: (matches your Xcode project)

## Current Setup Status

Based on your Firebase project URL, here's what should be configured:

### ✅ Already Configured (PWA)
- Firebase project exists: `kaden---adelynn-adventures`
- Firestore likely enabled (for PWA)
- Web app registered (for PWA)

### ⏳ Needs Configuration (iOS)
- [ ] iOS app registered in Firebase
- [ ] `GoogleService-Info.plist` downloaded
- [ ] Firestore rules updated for iOS (if needed)
- [ ] Firebase iOS SDK added to Xcode

## Quick Checklist

Go through each section in Firebase Console and check:

1. **Firestore Database** → Enabled? ✅
2. **Firestore Rules** → Allow read/write? ✅
3. **Project Settings** → iOS app registered? ⏳
4. **Project Settings** → GoogleService-Info.plist available? ⏳

## What You Need from Firebase Console

1. **GoogleService-Info.plist** file
   - Download from: Project Settings → Your apps → iOS app
   - This file contains all Firebase configuration

2. **Firestore Security Rules**
   - Should allow reading leaderboards (anyone)
   - Should allow writing scores (with validation)

3. **Project ID**
   - Already known: `kaden---adelynn-adventures`

## Next Steps

Once you verify Firebase Console:

1. **If iOS app is NOT registered:**
   - Register iOS app in Firebase Console
   - Download `GoogleService-Info.plist`

2. **If Firestore rules need updating:**
   - Go to Firestore Database → Rules
   - Update rules (see above)
   - Click Publish

3. **Add to Xcode:**
   - Add Firebase iOS SDK
   - Add `GoogleService-Info.plist` to project
   - Uncomment Firebase code

## Verification Questions

Answer these to confirm setup:

1. **Is Firestore Database enabled?** Yes/No
2. **Are security rules configured?** Yes/No
3. **Is iOS app registered?** Yes/No
4. **Do you have GoogleService-Info.plist?** Yes/No
5. **Is Firebase iOS SDK added to Xcode?** Yes/No

If all answers are "Yes", Firebase is fully set up! 🎉

