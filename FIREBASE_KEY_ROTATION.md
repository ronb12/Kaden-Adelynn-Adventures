# Firebase API Key Rotation Guide

## ⚠️ Important Context

Your app is currently deployed at: **https://kaden---adelynn-adventures.web.app/**

### Key Point: Firebase API Keys Are Public By Design

**Firebase web API keys are meant to be public** - they're included in client-side code. This is different from server-side API keys. The real security comes from:
- **Firebase Security Rules** (Firestore rules)
- **Firebase App Check**
- **Authentication & Authorization**

### Why Rotate?

You **don't need to rotate** for security reasons. However, you may want to:
- Clear the GitHub secret scanning alert (can also mark as "false positive")
- Follow best practices for key management
- If you do rotate, follow the steps below

## Step 1: Rotate API Key in Firebase Console

### Instructions:
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **kaden---adelynn-adventures**
3. Click the gear icon ⚙️ → **Project Settings**
4. Scroll to **Your apps** section
5. Find your **Web app** (App ID: `1:265116401918:web:e1511695b92aeb05e0e5af`)
6. **Option A - Create New Web App (Recommended):**
   - Click **"Add app"** → **Web** (</>) 
   - Register a new web app with a new name
   - Copy the new configuration values
   - Update Firebase Hosting to use the new app configuration
7. **Option B - Regenerate Key (if available):**
   - Click the three dots menu (⋮) next to your web app
   - Select **"Regenerate key"** or **"Reset key"**
   - Copy the new API key
8. **Important:** After rotation, redeploy to Firebase Hosting so the new config takes effect

### Current Exposed Key (to be replaced):
```
API Key: AIzaSyC1b-JWvBRGti5LFKk7LqSS8p1QFbP_D88
Project ID: kaden---adelynn-adventures
```

## Step 2: Update .env File

After getting your new Firebase credentials, update the `.env` file:

```bash
# Edit .env and replace with your new values
VITE_FIREBASE_API_KEY=your_new_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=kaden---adelynn-adventures.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=kaden---adelynn-adventures
VITE_FIREBASE_STORAGE_BUCKET=kaden---adelynn-adventures.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=265116401918
VITE_FIREBASE_APP_ID=your_new_app_id_here
```

## Step 3: Update Firebase Hosting Config

Since your app uses Firebase Hosting auto-init (`/__/firebase/init.js`):

1. **If you created a new web app:**
   - Go to Firebase Console → Hosting
   - Update the hosting configuration to use the new web app
   - Or update the `firebase.json` if you have custom init.js

2. **Redeploy to Firebase Hosting:**
   ```bash
   npm run build
   firebase deploy --only hosting
   ```

3. **Verify the new config is live:**
   - Visit https://kaden---adelynn-adventures.web.app/
   - Check browser console for Firebase initialization
   - Verify cloud scores still work

## Step 4: Resolve GitHub Security Alert

1. Go to your GitHub repository
2. Navigate to **Security** → **Secret scanning alerts**
3. Find the alert for the Google API key
4. Click on the alert
5. Choose one of these options:
   - **Mark as resolved** (if you've rotated the key)
   - **Revoke secret** (if you want to invalidate it)
   - **Dismiss as false positive** (only if it's not actually a secret)

## Step 5: Verify Security

After rotation, verify:
- ✅ New API key is working in production
- ✅ Old key is no longer valid
- ✅ `.env` file is not committed (check `.gitignore`)
- ✅ No hardcoded keys in current source code
- ✅ GitHub alert is resolved

## Important Notes

- **Firebase API keys are public by design** - they're meant to be in client-side code
- However, you should still:
  - Use Firebase Security Rules to restrict database access
  - Enable Firebase App Check for additional protection
  - Rotate keys if they've been exposed in public repositories
  - Use environment variables for local development

## Security Best Practices Going Forward

1. Never commit `.env` files
2. Use `.env.example` as a template
3. Rotate keys periodically
4. Use Firebase Security Rules
5. Enable Firebase App Check
6. Monitor GitHub secret scanning alerts

