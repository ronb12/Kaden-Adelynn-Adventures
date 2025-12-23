# Firebase SDK Selection Guide

## SDK Version

✅ **Use the default (latest) version** - This is recommended and will give you the most up-to-date features and bug fixes.

## Firebase Libraries to Add

Select these products when prompted:

### Required for Leaderboards:
1. ✅ **FirebaseCore** - Base Firebase SDK (required)
2. ✅ **FirebaseFirestore** - For leaderboard data storage (required)

### Recommended:
3. ✅ **FirebaseAnalytics** - For app analytics (recommended by Firebase)
   - OR **FirebaseAnalyticsWithoutAdId** - If you don't want IDFA collection
   - Choose one: Analytics (with IDFA) or AnalyticsWithoutAdId (no IDFA)

### Optional (Not needed for leaderboards):
- ❌ FirebaseAuth - Not needed (scores are anonymous)
- ❌ FirebaseStorage - Not needed
- ❌ FirebaseMessaging - Not needed
- ❌ Other products - Not needed for this use case

## Summary: What to Select

**Minimum Required:**
- ✅ FirebaseCore
- ✅ FirebaseFirestore

**Recommended:**
- ✅ FirebaseAnalytics (or FirebaseAnalyticsWithoutAdId)

**Total: 3 products**

## After Selection

Once you've added the packages:
1. Click "Add Package"
2. Wait for packages to download
3. Verify they appear in Package Dependencies
4. Then uncomment Firebase code (see next steps)

## Next Steps After Adding SDK

1. Uncomment imports in `FirebaseService.swift`
2. Uncomment Firebase code
3. Add Firebase initialization in app
4. Add GoogleService-Info.plist

