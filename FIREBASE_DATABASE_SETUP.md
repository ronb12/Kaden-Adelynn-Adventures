# Firebase Firestore Database Setup

## Files Created

I've created the configuration files for Firestore rules and indexes:

1. **`firestore.rules`** - Security rules for the database
2. **`firestore.indexes.json`** - Database indexes for efficient queries

## Firestore Rules

The rules allow:
- ✅ **Read**: Anyone can read leaderboards (public)
- ✅ **Create**: Anyone can submit scores (anonymous writes)
- ✅ **Validation**: Ensures data integrity (score is int, playerName is string, etc.)
- ❌ **Delete**: Disabled (scores are permanent)

## Firestore Indexes

Indexes created for efficient queries:
1. **Score + Date** - For sorting by score with date tiebreaker
2. **Score + Wave** - For sorting by score with wave tiebreaker  
3. **Player Name + Score** - For searching/filtering by player name

## How to Deploy

### Option 1: Firebase Console (Easiest)

1. **Deploy Rules:**
   - Go to: https://console.firebase.google.com/project/kaden---adelynn-adventures/firestore/rules
   - Copy contents of `firestore.rules`
   - Paste into the rules editor
   - Click **Publish**

2. **Deploy Indexes:**
   - Go to: https://console.firebase.google.com/project/kaden---adelynn-adventures/firestore/indexes
   - Click **Add Index**
   - Or use the JSON import feature
   - Copy contents of `firestore.indexes.json`

### Option 2: Firebase CLI (After Login)

```bash
# Login first
firebase login

# Set project
firebase use kaden---adelynn-adventures

# Deploy rules
firebase deploy --only firestore:rules

# Deploy indexes
firebase deploy --only firestore:indexes
```

## Rules Explanation

### highScores Collection
```javascript
match /highScores/{document=**} {
  // Public read - anyone can view leaderboards
  allow read: if true;
  
  // Anonymous writes - no authentication required
  allow create: if request.resource.data.score is int &&
                  request.resource.data.playerName is string &&
                  // ... other validations
}
```

**Why this works:**
- ✅ No sign-in required for users
- ✅ Scores can be submitted anonymously
- ✅ Leaderboards are public (good for competition)
- ✅ Data validation prevents bad data

## Indexes Explanation

The indexes optimize these queries:
1. **Sort by score (descending)** - Main leaderboard query
2. **Sort by score + date** - Tiebreaker for same scores
3. **Sort by score + wave** - Alternative sorting
4. **Search by player name** - Find specific players

## Verification

After deploying:

1. **Test Rules:**
   - Try reading from `highScores` collection (should work)
   - Try writing a score (should work)
   - Try invalid data (should fail)

2. **Check Indexes:**
   - Go to Firestore Database → Indexes tab
   - Verify indexes are building/completed
   - May take a few minutes to build

## Current Status

- ✅ Rules file created: `firestore.rules`
- ✅ Indexes file created: `firestore.indexes.json`
- ⏳ **Action Required**: Deploy to Firebase

## Next Steps

1. **Deploy Rules** (Firebase Console or CLI)
2. **Deploy Indexes** (Firebase Console or CLI)
3. **Wait for indexes to build** (usually 1-5 minutes)
4. **Test** by playing a game and checking leaderboard

## Quick Deploy Commands

If you're logged into Firebase CLI:

```bash
cd "/Users/ronellbradley/Desktop/kaden-adelynn-space-adventures-ios-swift"
firebase use kaden---adelynn-adventures
firebase deploy --only firestore:rules,firestore:indexes
```

Or manually copy/paste into Firebase Console.

