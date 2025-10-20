# 🎮 Automated Demo Instructions

## Watch Your Game Play Itself and Demonstrate All Features! 🤖

This automated demo will open your game in a browser and demonstrate ALL the new features automatically while you watch!

---

## 🚀 Quick Start (3 Steps)

### Step 1: Install Puppeteer

```bash
npm install
```

This will install Puppeteer (browser automation tool) from your updated package.json.

---

### Step 2: Start Your Dev Server

Open a terminal and run:

```bash
npm start
```

Wait for the server to start. You should see:
```
Compiled successfully!

Local:            http://localhost:3000
```

**Keep this terminal open!**

---

### Step 3: Run the Demo (In a NEW Terminal)

Open a **second terminal** and run:

```bash
npm run demo
```

Or directly:

```bash
node puppeteer-demo.js
```

---

## 🎬 What Will Happen

The script will:

1. ✅ Open Chrome browser (you'll see it!)
2. ✅ Navigate to your game
3. ✅ Detect if Test Mode or Game Mode is active
4. ✅ Automatically demonstrate all features

### If Test Mode is Active:
- Click "Run All Tests"
- Navigate through all tabs
- Test each system individually
- Show shop statistics
- Display test logs

### If Game Mode is Active:
- Start the game
- Enable Test Player Mode (~)
- Demonstrate God Mode (G)
- Show hitboxes (H)
- Add currency (M)
- Add lives (L)
- Activate all power-ups (P)
- Trigger combos
- Fill and activate Ultimate (U)
- Spawn bosses (B)
- Demonstrate time scale (1, 2, 3)
- Kill all enemies (K)
- And more!

---

## 📊 What You'll See

### Console Output:
```
╔════════════════════════════════════════════════════════════╗
║   Kaden & Adelynn Space Adventures - Automated Demo       ║
║   Testing ALL New Features                                ║
╚════════════════════════════════════════════════════════════╝

[10:30:45] 🚀 Starting Kaden & Adelynn Space Adventures Demo...
[10:30:46] 📱 Navigating to game...
[10:30:48] 🎮 Game loaded! Starting automated demo...
[10:30:49] 🎮 Game Mode detected - Running in-game demo...

🎮 PHASE 1: Starting Game
🔧 PHASE 2: Activating Test Player Mode
   Pressing ~ to enable test mode...
   ✓ Test Player Mode activated!

💪 PHASE 3: God Mode Demo
   Pressing G for God Mode...
   ✓ God Mode enabled - Player is invincible!

👁️ PHASE 4: Hitbox Display
   Pressing H to show hitboxes...
   ✓ Hitboxes visible!

... and so on for all phases!
```

### Browser Window:
- You'll see Chrome open automatically
- The game will load
- Keys will be pressed automatically
- Features will activate in sequence
- You can watch everything happen in real-time! 🎥

---

## ⚙️ Configuration Options

Edit `puppeteer-demo.js` to customize:

```javascript
// At the top of the file
const GAME_URL = 'http://localhost:3000';  // Change if different port
const DEMO_SPEED = 1000;  // Milliseconds between actions (1000 = 1 second)
```

**Want it faster?** Set `DEMO_SPEED = 500`
**Want it slower?** Set `DEMO_SPEED = 2000`

---

## 🎯 Demo Phases

The automated demo runs through these phases:

### Phase 1: Game Start
- Loads the game
- Detects which mode is active

### Phase 2: Test Mode Activation
- Enables test player with ~ key

### Phase 3: God Mode
- Makes player invincible

### Phase 4: Hitbox Display
- Shows collision boxes

### Phase 5: Currency Addition
- Adds 5000 credits total

### Phase 6: Lives Addition
- Adds 15 extra lives

### Phase 7: Power-ups
- Activates all power-ups
- Triggers combos automatically

### Phase 8: Ultimate Ability
- Charges ultimate
- Activates character ultimate

### Phase 9: Boss Battle
- Spawns boss
- Shows multi-phase mechanics

### Phase 10: Wave System
- Demonstrates wave progression

### Phase 11: Environmental Hazards
- Shows asteroids, black holes, meteors

### Phase 12: Time Scale
- Demonstrates slow motion
- Shows fast forward
- Returns to normal

### Phase 13: Gameplay
- Simulates player movement
- Auto-shooting

### Phase 14: Screen Clear
- Kills all enemies at once

### Phase 15: Stats Display
- Toggles stats panel

### Phase 16: Grand Finale
- Multiple bosses
- All power-ups
- Ultimate activation
- Epic battle showcase

---

## 🛠️ Troubleshooting

### Issue: "Cannot find module 'puppeteer'"
**Solution**: Run `npm install`

### Issue: "Error: net::ERR_CONNECTION_REFUSED"
**Solution**: Make sure dev server is running (`npm start`)

### Issue: Browser doesn't open
**Solution**: 
1. Check that Chrome is installed
2. Try running with sudo (Mac/Linux): `sudo npm run demo`

### Issue: Demo runs too fast/slow
**Solution**: Edit `DEMO_SPEED` in `puppeteer-demo.js`

### Issue: Game doesn't load
**Solution**: 
1. Make sure port 3000 is not blocked
2. Try accessing http://localhost:3000 manually first

---

## 📸 Screenshots

The demo can take screenshots automatically. Uncomment this line in the code:

```javascript
// After each phase, add:
await takeScreenshot(page, 'phase-name');
```

Screenshots will be saved as: `demo-screenshot-{name}-{timestamp}.png`

---

## 🎥 Recording the Demo

Want to record a video? Use these tools:

### Mac:
- QuickTime Player (Screen Recording)
- Command+Shift+5 (built-in screen recorder)

### Windows:
- Windows Game Bar (Win+G)
- OBS Studio (free)

### Linux:
- SimpleScreenRecorder
- OBS Studio (free)

---

## 🔧 Advanced: Custom Demo Script

Create your own demo sequence:

```javascript
// Add to puppeteer-demo.js

async function customDemo(page) {
  log('🎨 Running custom demo...');
  
  // Your custom sequence
  await pressKey(page, 'KeyG'); // God mode
  await wait(1000);
  
  await pressKey(page, 'KeyB'); // Spawn boss
  await wait(2000);
  
  await pressKey(page, 'KeyU'); // Ultimate
  await wait(1000);
  
  // Add more as needed
}
```

---

## 🎮 Quick Commands Reference

These keys are pressed automatically during the demo:

- **~** (Backquote) - Toggle Test Mode
- **G** - God Mode
- **H** - Hitboxes
- **U** - Fill/Activate Ultimate
- **B** - Spawn Boss
- **P** - Add Power-ups
- **M** - Add 1000 Credits
- **K** - Kill All Enemies
- **L** - Add 5 Lives
- **T** - Toggle Stats
- **1** - Time Scale 0.5x
- **2** - Time Scale 1x
- **3** - Time Scale 2x

---

## 📋 Checklist

Before running the demo:

- [ ] Dev server is running (`npm start`)
- [ ] Puppeteer is installed (`npm install`)
- [ ] Port 3000 is accessible
- [ ] Chrome browser is available
- [ ] Second terminal is open

---

## 🎉 Enjoy the Show!

Sit back, relax, and watch your game demonstrate all its amazing features automatically! 🍿

The browser will stay open after the demo completes so you can:
- Inspect the final state
- Take screenshots
- Manually test more features
- Review the test logs

Press **Ctrl+C** in the terminal to stop and close the browser.

---

**Have fun watching your epic space shooter in action!** 🚀✨

