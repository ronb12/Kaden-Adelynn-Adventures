# Deploy Firebase Functions

## Quick Deploy

To deploy the Game Center authentication function:

```bash
cd /Users/ronellbradley/Desktop/kaden-adelynn-space-adventures-ios-swift/functions
npm install
firebase deploy --only functions
```

## Alternative: Deploy from Parent Project

If you prefer to deploy from the main Firebase project directory:

1. Copy the `functions` folder to the parent project directory
2. Update the parent `firebase.json` to include functions
3. Deploy from there

## Verify Deployment

After deployment, check that the function exists:

```bash
firebase functions:list
```

You should see `generateGameCenterToken` in the output.

## Test the Function

1. Build and run the iOS app
2. Tap "Sign in with Game Center"
3. The app will call the function and authenticate with Firebase

## Troubleshooting

If you get "Function not found" errors:
- Make sure you're logged into Firebase: `firebase login`
- Verify the function is deployed: `firebase functions:list`
- Check the function name matches: `generateGameCenterToken`

