# Score System Debug

## Deployment Status
✅ Fixed: Removed `score` from gameLoop dependency array
✅ Added: Console logging to track score updates
✅ Live at: https://kaden---adelynn-adventures.web.app

## Testing Instructions
1. Open the game on Firebase
2. Start a game and shoot enemies
3. Open browser console (F12)
4. Look for "Score update: X -> Y" messages
5. Verify score increases on screen

## Expected Console Output
```
Score update: 0 -> 10
Score update: 10 -> 20
Score update: 20 -> 30
```

## If Score Still Not Updating
Check:
- Are you seeing console.log messages? (Yes = collisions work, No = collision issue)
- Is score UI showing updates? (Refresh page)
- Clear browser cache and retry
