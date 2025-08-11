# 🔐 GitHub Secrets Setup Guide

## **Secure Firebase Configuration with GitHub Secrets**

This guide shows you how to securely use Firebase API keys with GitHub Secrets for automatic deployment.

### **🚀 Benefits of GitHub Secrets**
- ✅ **No exposed API keys** in repository
- ✅ **Automatic deployment** on push to main
- ✅ **Secure credential management**
- ✅ **Production-ready setup**
- ✅ **Multiple deployment targets** (GitHub Pages + Firebase Hosting)

---

## **📋 Step 1: Get Your Firebase Configuration**

### **From Firebase Console:**
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: `kaden---adelynn-adventures`
3. Click the gear icon ⚙️ → **Project Settings**
4. Scroll down to **"Your apps"** section
5. Copy the configuration object:

```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID",
    measurementId: "YOUR_MEASUREMENT_ID"
};
```

---

## **🔐 Step 2: Set Up GitHub Secrets**

### **Navigate to Repository Settings:**
1. Go to your GitHub repository: `https://github.com/ronb12/Kaden-Adelynn-Adventures`
2. Click **Settings** tab
3. Click **Secrets and variables** → **Actions**
4. Click **New repository secret**

### **Add These Secrets:**

| Secret Name | Value | Description |
|-------------|-------|-------------|
| `FIREBASE_API_KEY` | `YOUR_API_KEY` | Firebase API Key |
| `FIREBASE_AUTH_DOMAIN` | `YOUR_AUTH_DOMAIN` | Auth Domain |
| `FIREBASE_PROJECT_ID` | `YOUR_PROJECT_ID` | Project ID |
| `FIREBASE_STORAGE_BUCKET` | `YOUR_STORAGE_BUCKET` | Storage Bucket |
| `FIREBASE_MESSAGING_SENDER_ID` | `YOUR_MESSAGING_SENDER_ID` | Messaging Sender ID |
| `FIREBASE_APP_ID` | `YOUR_APP_ID` | App ID |
| `FIREBASE_MEASUREMENT_ID` | `YOUR_MEASUREMENT_ID` | Analytics Measurement ID |

---

## **🔑 Step 3: Get Firebase Token (Optional - for Firebase Hosting)**

### **For Firebase Hosting Deployment:**
1. Install Firebase CLI locally:
   ```bash
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```bash
   firebase login
   ```

3. Generate a CI token:
   ```bash
   firebase login:ci
   ```

4. Copy the token and add it as a secret:
   - Secret Name: `FIREBASE_TOKEN`
   - Value: `[your-generated-token]`

---

## **⚙️ Step 4: Configure GitHub Actions**

### **The workflow is already set up!**
The `.github/workflows/deploy.yml` file is configured to:

1. **Use your secrets** during deployment
2. **Replace placeholders** in the HTML file
3. **Deploy to GitHub Pages** automatically
4. **Deploy to Firebase Hosting** (if token provided)

### **What happens on push to main:**
- ✅ Secrets are securely injected
- ✅ Firebase config is updated
- ✅ Game is deployed to GitHub Pages
- ✅ Game is deployed to Firebase Hosting (if configured)

---

## **🎮 Step 5: Test the Setup**

### **Trigger a deployment:**
1. Make a small change to any file
2. Commit and push to main:
   ```bash
   git add .
   git commit -m "Test deployment with secrets"
   git push origin main
   ```

3. Check the Actions tab in GitHub to see the deployment

### **Verify deployment:**
- **GitHub Pages**: `https://ronb12.github.io/Kaden-Adelynn-Adventures/`
- **Firebase Hosting**: `https://kaden---adelynn-adventures.web.app`

---

## **🔒 Security Features**

### **✅ What's Protected:**
- All Firebase API keys are in GitHub Secrets
- No sensitive data in repository
- Automatic cleanup after deployment
- Secure token-based authentication

### **✅ What's Deployed:**
- Game with real Firebase configuration
- All 10 weapons working
- Cloud features enabled
- Analytics tracking active

---

## **🚨 Troubleshooting**

### **If deployment fails:**
1. **Check Actions tab** for error messages
2. **Verify all secrets** are set correctly
3. **Check Firebase project** permissions
4. **Ensure billing** is enabled for Firebase

### **Common Issues:**
- **Missing secrets**: Add all required secrets
- **Invalid token**: Regenerate Firebase token
- **Permission denied**: Check Firebase project settings
- **Billing required**: Enable billing in Firebase Console

---

## **📊 Current Status**

### **✅ Repository Security:**
- No API keys exposed
- Secrets properly configured
- Secure deployment pipeline

### **✅ Game Features:**
- 10 weapon types working
- Firebase integration ready
- Cloud storage available
- Analytics tracking active

### **✅ Deployment:**
- GitHub Pages deployment
- Firebase Hosting deployment
- Automatic on push to main
- Secure credential injection

---

## **🎯 Next Steps**

1. **Set up all GitHub Secrets** (Step 2)
2. **Test deployment** (Step 5)
3. **Monitor Actions** for successful deployment
4. **Enjoy your secure, deployed game!**

**🚀 Your game will be automatically deployed with secure Firebase configuration!** 