# Firebase Login Instructions

## ⚠️ Interactive Login Required

Firebase CLI requires interactive browser authentication. You need to run this command manually in your terminal.

## Step 1: Login to Firebase

Open Terminal and run:

```bash
cd "/Users/ronellbradley/Desktop/kaden-adelynn-space-adventures"
firebase login
```

**What will happen:**
1. Command will display a URL
2. Copy the URL or it will open automatically in your browser
3. Sign in with your Google account (the one that has access to `kaden---adelynn-adventures` project)
4. Grant Firebase CLI access
5. Return to terminal - you should see "Success! Logged in as [your-email]"

## Step 2: After Login, Run Verification

Once logged in, you can either:

**Option A: Run the script**
```bash
cd "/Users/ronellbradley/Desktop/kaden-adelynn-space-adventures-ios-swift"
./verify-firebase.sh
```

**Option B: Run commands manually**
```bash
# Set project
firebase use kaden---adelynn-adventures

# Check Firestore
firebase firestore:databases:list

# Check apps
firebase apps:list --platform ios

# Check rules
firebase firestore:rules:get
```

## Alternative: Use Firebase Console

If you prefer not to use CLI, verify directly in Firebase Console:
- https://console.firebase.google.com/project/kaden---adelynn-adventures/overview

**Check:**
1. Firestore Database → Enabled?
2. Project Settings → iOS app registered?
3. Firestore Rules → highScores collection?

## What We Can Verify After Login

Once logged in, the script will check:
- ✅ Firebase authentication
- ✅ Project access (`kaden---adelynn-adventures`)
- ✅ Firestore database status
- ✅ Firestore security rules
- ✅ Registered apps (Web, iOS, Android)
- ✅ iOS app configuration

## Quick Command Reference

```bash
# Login
firebase login

# Set project
firebase use kaden---adelynn-adventures

# Check Firestore
firebase firestore:databases:list

# Check iOS apps
firebase apps:list --platform ios

# View rules
firebase firestore:rules:get

# Run full verification
./verify-firebase.sh
```

