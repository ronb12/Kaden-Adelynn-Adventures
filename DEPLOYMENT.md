# Deployment Guide

## Automatic Deployment Setup

This project is configured to automatically deploy to GitHub and Firebase Hosting whenever changes are pushed to the main branch.

### Deployment Process

After making changes to the codebase:

1. **Build the project:**

   ```bash
   npm run build
   ```

2. **Commit and push to GitHub:**

   ```bash
   git add -A
   git commit -m "Your commit message"
   git push origin main
   ```

3. **Deploy to Firebase Hosting:**
   ```bash
   firebase deploy --only hosting
   ```

### Quick Deployment

Run this single command to deploy everything:

```bash
./deploy.sh
```

### Manual Testing

To test locally before deploying:

```bash
npm run dev      # Start dev server
npm run build    # Build for production
npm run preview  # Preview production build
```

## CI/CD with GitHub Actions (Optional)

For fully automated deployments, you can set up GitHub Actions by using the workflow file: `.github/workflows/deploy.yml`

### Required Secrets

Add these secrets to your GitHub repository (Settings > Secrets):

- `FIREBASE_SERVICE_ACCOUNT`: Firebase service account JSON (get from Firebase Console)

## Files Included

- `public/sw.js` - Service Worker for PWA features
- `public/manifest.json` - App manifest
- `firebase.json` - Firebase configuration
- `.github/workflows/deploy.yml` - GitHub Actions workflow (if enabled)
