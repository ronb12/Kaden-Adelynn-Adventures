# Per-User Personal Best Score Syncing

## ✅ What Was Added

### 1. **Per-User Score Collection**
- New Firestore collection: `userScores`
- Each document ID is the user's unique ID (Game Center, Apple Sign In, or Firebase UID)
- Stores the user's personal best score that syncs across all their devices

### 2. **FirebaseService Updates**
Added new methods:
- `savePersonalBestScore(_:userId:)` - Saves personal best for a specific user
- `fetchPersonalBestScore(userId:)` - Fetches personal best for a specific user
- `syncPersonalBestScore(_:userId:)` - Only saves if new score is better than existing
- `getCurrentUserId()` - Gets user ID from Game Center, Apple Sign In, or Firebase Auth

### 3. **Firestore Rules Updated**
- Added rules for `userScores` collection
- Users can read/write their own personal best scores
- Scores are validated before saving

### 4. **GameStateManager Updates**
- Automatically syncs personal best scores when saving to global leaderboard
- Only syncs if user is authenticated (has a user ID)

### 5. **ScoresView Updates**
- Loads synced personal best from Firebase
- Displays the best score across all user's devices

## 🔄 How It Works

### When User Plays a Game:

1. **Game Ends** → `saveHighScoreToCloud()` is called
2. **Global Leaderboard** → Score is saved to `highScores` collection (public)
3. **Personal Best Check** → If user is authenticated:
   - Gets user ID (Game Center, Apple Sign In, or Firebase UID)
   - Fetches current personal best from `userScores` collection
   - If new score is better → saves to `userScores` collection
   - This syncs across all user's devices

### When User Opens Scores View:

1. **Loads Local Scores** → From UserDefaults
2. **Loads Global Leaderboard** → From `highScores` collection
3. **Loads Synced Personal Best** → From `userScores` collection (if authenticated)
4. **Displays Best** → Shows the highest score across all sources

## 📱 Cross-Device Syncing

### Example Scenario:

**User has iPhone and iPad, both signed in with Game Center:**

1. **Plays on iPhone** → Scores 15,000 points
   - Saves to global leaderboard
   - Saves to `userScores/gc_[playerID]` as personal best

2. **Plays on iPad** → Scores 12,000 points
   - Saves to global leaderboard
   - Checks `userScores/gc_[playerID]` → sees 15,000 is better
   - Does NOT overwrite (keeps 15,000 as personal best)

3. **Plays on iPhone again** → Scores 18,000 points
   - Saves to global leaderboard
   - Checks `userScores/gc_[playerID]` → sees 15,000 is lower
   - **Overwrites** with 18,000 (new personal best)
   - **iPad will now show 18,000** when user opens scores

## 🔐 User ID Format

The system uses different prefixes to identify user types:

- **Game Center**: `gc_[playerID]` (e.g., `gc_G:123456789`)
- **Apple Sign In**: `apple_[userIdentifier]` (e.g., `apple_001234.567890abcdef`)
- **Firebase Auth**: `[firebaseUID]` (e.g., `abc123def456`)

This ensures each authentication method has unique IDs.

## 📊 Firestore Structure

### Global Leaderboard (`highScores`):
```
highScores/
  ├── [document1]
  │   ├── playerName: "Player1"
  │   ├── score: 15000
  │   ├── wave: 5
  │   └── ...
  └── [document2]
      ├── playerName: "Player2"
      ├── score: 12000
      └── ...
```

### Personal Best Scores (`userScores`):
```
userScores/
  ├── gc_G:123456789
  │   ├── playerName: "Player1"
  │   ├── score: 15000
  │   ├── wave: 5
  │   └── updatedAt: [timestamp]
  └── apple_001234.567890abcdef
      ├── playerName: "Player2"
      ├── score: 12000
      └── updatedAt: [timestamp]
```

## 🚀 Next Steps

### 1. Deploy Updated Firestore Rules

The rules have been updated to support `userScores` collection. Deploy them:

```bash
cd "/Users/ronellbradley/Library/Mobile Documents/com~apple~CloudDocs/Desktop/kaden-adelynn-space-adventures"
firebase deploy --only firestore:rules
```

### 2. Test Per-User Syncing

1. **Sign in with Game Center** on device 1
2. **Play a game** and achieve a score
3. **Sign in with same Game Center account** on device 2
4. **Check scores** → Should see the same personal best

### 3. Verify in Firebase Console

- **Database**: https://console.firebase.google.com/project/kaden---adelynn-adventures/firestore/databases/-default-/data
- Check `userScores` collection after playing a game
- Should see documents with user IDs as document IDs

## ✨ Features

- ✅ **Automatic Syncing** - Personal best syncs automatically when user is authenticated
- ✅ **Cross-Device** - Works across iPhone, iPad, and other devices
- ✅ **Multiple Auth Methods** - Supports Game Center, Apple Sign In, and Firebase Auth
- ✅ **Smart Updates** - Only saves if new score is better
- ✅ **Fallback Support** - Works with local storage until Firebase SDK is added
- ✅ **Global + Personal** - Both global leaderboard and personal best are maintained

## 🔍 Verification

After deploying rules and testing:

1. **Play a game** while signed in
2. **Check Firebase Console** → `userScores` collection
3. **Verify document** → Should have your user ID as document ID
4. **Check on another device** → Personal best should sync

## 📝 Notes

- Personal best syncing only works when user is authenticated
- Guest users can still save to global leaderboard, but won't have synced personal best
- The system automatically determines user ID from available authentication methods
- Scores are validated before saving (ensures data integrity)

