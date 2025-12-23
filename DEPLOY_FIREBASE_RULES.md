# Deploy Firebase Firestore Rules and Indexes

## Quick Setup Guide

I've created the configuration files. Here's how to deploy them:

## Method 1: Firebase Console (Recommended - No CLI needed)

### Deploy Rules:

1. Go to: https://console.firebase.google.com/project/kaden---adelynn-adventures/firestore/rules

2. Copy the contents of `firestore.rules` file:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /highScores/{document=**} {
         allow read: if true;
         allow create: if request.resource.data.score is int &&
                         request.resource.data.playerName is string &&
                         request.resource.data.wave is int &&
                         request.resource.data.level is int &&
                         request.resource.data.kills is int &&
                         request.resource.data.combo is int &&
                         request.resource.data.accuracy is number &&
                         request.resource.data.date is timestamp;
         allow update: if request.resource.data.score is int &&
                         request.resource.data.playerName is string;
         allow delete: if false;
       }
       match /{document=**} {
         allow read, write: if false;
       }
     }
   }
   ```

3. Paste into the rules editor
4. Click **Publish**

### Deploy Indexes:

1. Go to: https://console.firebase.google.com/project/kaden---adelynn-adventures/firestore/indexes

2. The indexes will be created automatically when you first query, OR:

3. Click **Add Index** and create:
   - Collection: `highScores`
   - Fields: `score` (Descending), `date` (Descending)
   - Click **Create**

4. Repeat for other indexes (see firestore.indexes.json)

## Method 2: Firebase CLI

If you're logged into Firebase CLI:

```bash
cd "/Users/ronellbradley/Desktop/kaden-adelynn-space-adventures-ios-swift"
firebase use kaden---adelynn-adventures
firebase deploy --only firestore:rules,firestore:indexes
```

## What the Rules Do

✅ **Allow Public Read**: Anyone can view leaderboards  
✅ **Allow Anonymous Write**: Users can submit scores without signing in  
✅ **Data Validation**: Ensures score data is valid  
❌ **No Deletion**: Scores are permanent (prevents cheating)

## What the Indexes Do

Optimizes queries for:
- Sorting leaderboard by score (descending)
- Sorting by score + date (tiebreaker)
- Sorting by score + wave
- Searching by player name

## Verification

After deploying, check:
1. Rules are published (should see green checkmark)
2. Indexes are building/completed (may take a few minutes)
3. Test by playing a game and checking leaderboard

## Files Created

- ✅ `firestore.rules` - Security rules
- ✅ `firestore.indexes.json` - Database indexes

Both files are ready to deploy!

