# Music Setup Guide

## Current Status
All three music files are currently using the same track (8-bit Epic Space Shooter Music from OpenGameArt.org). This works but using different tracks would provide better audio variety.

## Recommended Setup

### Menu Music (`menu.mp3`)
**Recommended:** Calm, ambient, welcoming
- **Option 1:** "Starfield Romance" from OpenGameArt.org
  - URL: https://opengameart.org/content/starfield-romance-cc0-ambient-emotional-space-theme
  - License: CC0 (no attribution needed)
  
- **Option 2:** "Heavenly Loop" from OpenGameArt.org
  - URL: https://opengameart.org/content/heavenly-loop
  - License: CC0 (no attribution needed)

### Gameplay Music (`gameplay.mp3`)
**Current:** ✅ "8-bit Epic Space Shooter Music" - This is perfect! Keep this one.
- Action-packed, energetic, loops well
- Already downloaded and working

### Boss Music (`boss.mp3`)
**Recommended:** Intense, dramatic, builds tension
- **Option 1:** "Space Boss Battle" from OpenGameArt.org
  - URL: https://opengameart.org/content/space-boss-battle
  - License: CC0 (no attribution needed)
  
- **Option 2:** "Space Battle" from OpenGameArt.org
  - URL: https://opengameart.org/content/space-battle
  - License: CC0 (no attribution needed)

## How to Download and Replace

1. Visit the OpenGameArt.org links above
2. Click the download button on each track's page
3. Download the MP3 version
4. Rename and place in `public/music/`:
   - Menu track → `menu.mp3`
   - Boss track → `boss.mp3`
   - Keep `gameplay.mp3` as is (it's already perfect!)

5. Rebuild and deploy:
   ```bash
   npm run build
   firebase deploy --only hosting
   ```

## Alternative: Kevin MacLeod's Music (Requires Attribution)

If you want to use Kevin MacLeod's music from Incompetech:
- Visit: https://incompetech.com/music/royalty-free/music.html
- Search for: "Space Fighter Loop", "Space Jazz", "Neon Laser Horizon"
- **Note:** These require attribution (CC BY 3.0)
- Add credit in your game: "Music by Kevin MacLeod"

## Why Different Tracks?

Using different tracks for each game state:
- ✅ **Better atmosphere** - Each moment feels unique
- ✅ **Player feedback** - Music signals game state changes
- ✅ **Professional feel** - Shows attention to detail
- ✅ **Prevents repetition** - Players won't get tired of the same track
