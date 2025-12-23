# Firebase Firestore Rules & Indexes - Deploy Instructions

## ✅ Files Created

1. **`firestore.rules`** - Security rules (supports both PWA and iOS formats)
2. **`firestore.indexes.json`** - Database indexes for efficient queries

## 🚀 Quick Deploy (Firebase Console)

### Step 1: Deploy Rules

1. Open: https://console.firebase.google.com/project/kaden---adelynn-adventures/firestore/rules
2. Copy the entire contents of `firestore.rules`
3. Paste into the rules editor
4. Click **Publish**

### Step 2: Deploy Indexes

1. Open: https://console.firebase.google.com/project/kaden---adelynn-adventures/firestore/indexes
2. Click **Add Index** (or use JSON import if available)
3. Create these indexes:

   **Index 1: Score + Date**
   - Collection: `highScores`
   - Fields: `score` (Descending), `date` (Descending)

   **Index 2: Score + CreatedAt**
   - Collection: `highScores`
   - Fields: `score` (Descending), `createdAt` (Descending)

   **Index 3: Score + Wave**
   - Collection: `highScores`
   - Fields: `score` (Descending), `wave` (Descending)

   **Index 4: PlayerName + Score**
   - Collection: `highScores`
   - Fields: `playerName` (Ascending), `score` (Descending)

   **Index 5: Player + Score**
   - Collection: `highScores`
   - Fields: `player` (Ascending), `score` (Descending)

4. Wait for indexes to build (usually 1-5 minutes)

## 📋 What the Rules Do

✅ **Public Read**: Anyone can view leaderboards  
✅ **Anonymous Write**: Users can submit scores without signing in  
✅ **Dual Format Support**: Works with both PWA (`player`, `createdAt`) and iOS (`playerName`, `date`, `wave`, etc.)  
✅ **Data Validation**: Ensures score data is valid  
❌ **No Deletion**: Scores are permanent (prevents cheating)

## 📊 What the Indexes Do

Optimizes queries for:
- **Main leaderboard**: Sort by score (descending)
- **Tiebreaker**: Sort by score + date/createdAt
- **Wave sorting**: Sort by score + wave
- **Player search**: Find scores by player name

## ✅ Verification Checklist

After deploying:

- [ ] Rules are published (green checkmark in Firebase Console)
- [ ] All 5 indexes are building/completed
- [ ] Test: Play game and check leaderboard appears
- [ ] Test: Submit score from iOS app
- [ ] Test: Submit score from PWA
- [ ] Test: View leaderboard from both apps

## 🔍 Current Status

- ✅ Rules file created with dual format support
- ✅ Indexes file created (5 indexes)
- ⏳ **Action Required**: Deploy to Firebase Console

## 📝 Notes

- Indexes may take a few minutes to build after creation
- Rules take effect immediately after publishing
- Both PWA and iOS apps can use the same Firestore collection
- No authentication required - fully anonymous leaderboard

