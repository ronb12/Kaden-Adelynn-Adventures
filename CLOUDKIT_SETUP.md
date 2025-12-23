# CloudKit Setup Guide

This guide explains how to set up CloudKit for the iOS version of Kaden & Adelynn Space Adventures.

## Prerequisites

1. **Apple Developer Account**: You need an active Apple Developer account
2. **Xcode**: Latest version of Xcode
3. **App ID with CloudKit**: Your app's bundle identifier must have CloudKit capability enabled

## Setup Steps

### 1. Enable CloudKit in Xcode

1. Open your Xcode project
2. Select your project in the navigator
3. Select your app target
4. Go to the **Signing & Capabilities** tab
5. Click **+ Capability**
6. Add **CloudKit**
7. Xcode will automatically:
   - Create a CloudKit container
   - Add the CloudKit framework
   - Configure entitlements

### 2. Configure CloudKit Container

1. In the **Signing & Capabilities** tab, you'll see the CloudKit container
2. The default container name will be: `iCloud.$(CFBundleIdentifier)`
3. You can customize this if needed
4. Make sure **CloudKit** is checked

### 3. CloudKit Dashboard Setup

1. Go to [CloudKit Dashboard](https://icloud.developer.apple.com/dashboard)
2. Select your app
3. Select your container (usually matches your bundle ID)
4. Go to **Schema** → **Record Types**

#### Create Record Types

Create the following record types:

**HighScore**
- `playerName` (String)
- `score` (Int64)
- `wave` (Int64)
- `level` (Int64)
- `kills` (Int64)
- `combo` (Int64)
- `accuracy` (Double)
- `date` (Date/Time)

**GameStats**
- `totalGamesPlayed` (Int64)
- `totalPlayTime` (Int64)
- `totalScore` (Int64)
- `totalKills` (Int64)
- `totalWavesCompleted` (Int64)
- `totalBossesDefeated` (Int64)
- `highestScore` (Int64)
- `highestWave` (Int64)
- `highestCombo` (Int64)
- `totalShotsFired` (Int64)
- `totalShotsHit` (Int64)
- `bestAccuracy` (Double)
- `totalPowerUpsCollected` (Int64)
- `achievementsUnlocked` (Int64)
- `lastUpdated` (Date/Time)
- `statsJSON` (String) - Optional, for complex nested data

**Achievement**
- `achievementId` (String)
- `name` (String)
- `description` (String)
- `unlocked` (Int64, 0 or 1)
- `unlockedDate` (Date/Time, Optional)
- `reward` (Int64)

**PlayerProgress**
- `coins` (Int64)
- `unlockedShips` (String List)
- `unlockedCharacters` (String List)
- `storeUpgrades` (String Dictionary)
- `lastUpdated` (Date/Time)

### 4. Set Indexes

For each record type, set up indexes for efficient queries:

**HighScore**
- Index on `score` (Queryable, Sortable)
- Index on `date` (Queryable, Sortable)

**GameStats**
- No indexes needed (single record per user)

**Achievement**
- Index on `achievementId` (Queryable)
- Index on `unlocked` (Queryable)

**PlayerProgress**
- No indexes needed (single record per user)

### 5. Security Roles

1. In CloudKit Dashboard, go to **Security Roles**
2. For all record types, set:
   - **World**: No Access
   - **Authenticated**: Read/Write (for user's own records)

### 6. Development vs Production

- **Development Environment**: Used during development and testing
- **Production Environment**: Used for App Store releases

**Important**: Before submitting to App Store:
1. Deploy your schema from Development to Production
2. In CloudKit Dashboard, go to **Deploy Schema Changes**
3. Review and deploy all record types and indexes

## Testing

### Test CloudKit Locally

1. Run the app on a device or simulator
2. Sign in with Apple
3. Play the game and generate some data
4. Check CloudKit Dashboard → **Data** to see records being created

### Test Data Sync

1. Install app on two devices
2. Sign in with the same Apple ID on both
3. Play on one device
4. Data should sync to the other device automatically

## Troubleshooting

### "CloudKit not available"
- Check that CloudKit capability is enabled
- Verify you're signed in with Apple ID on the device
- Check iCloud is enabled in device settings

### "Record not found"
- Make sure you've created the record types in CloudKit Dashboard
- Verify the record type names match exactly (case-sensitive)
- Check that you're using the correct database (private vs public)

### "Permission denied"
- Verify security roles are set correctly
- Make sure user is signed in with Apple

### Schema Deployment Issues
- Ensure all record types are created in Development
- Deploy schema to Production before App Store submission
- Wait for deployment to complete (can take a few minutes)

## Code Integration

The app already includes:
- `CloudKitService.swift` - Handles all CloudKit operations
- `AppleSignInService.swift` - Handles Sign in with Apple
- `GameStatsManager.swift` - Manages game statistics with CloudKit sync

All data syncing happens automatically when:
1. User signs in with Apple
2. Game data changes (scores, stats, achievements)
3. App launches (syncs from cloud)

## Privacy Considerations

- All data is stored in the user's **private CloudKit database**
- Data is only accessible to the user's Apple ID
- We cannot access or view user data
- Data syncs automatically via iCloud
- Users can delete their data by deleting the app or signing out

## App Store Submission

Before submitting:
1. ✅ Deploy CloudKit schema to Production
2. ✅ Test data sync on multiple devices
3. ✅ Verify Sign in with Apple works correctly
4. ✅ Update Privacy Policy (already done)
5. ✅ Complete App Privacy Questionnaire mentioning CloudKit and Sign in with Apple

## Notes

- CloudKit has free tier limits (see Apple's documentation)
- Data is automatically synced when connected to internet
- Works offline - data syncs when connection is restored
- No additional server setup required - Apple handles everything
