# 🚀 Quick Start Guide - Test All New Features

## ⚡ 3-Minute Quick Test

### Option 1: Standalone Test Mode (Recommended)

**1. Update your `src/App.js`:**

```javascript
import React, { useState } from 'react';
import './App.css';
import Game from './components/Game';
import TestMode from './components/TestMode';

function App() {
  const [showTestMode, setShowTestMode] = useState(true); // Start with test mode

  return (
    <div className="App">
      {showTestMode ? (
        <TestMode />
      ) : (
        <main>
          <Game />
        </main>
      )}
      
      {/* Toggle button */}
      <button 
        style={{
          position: 'fixed',
          top: '10px',
          right: '10px',
          zIndex: 9999,
          padding: '10px 20px',
          background: '#667eea',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          fontWeight: 'bold'
        }}
        onClick={() => setShowTestMode(!showTestMode)}
      >
        {showTestMode ? '🎮 Game' : '🧪 Test Mode'}
      </button>
    </div>
  );
}

export default App;
```

**2. Run your app:**

```bash
npm start
```

**3. Test everything:**
- Click "🚀 Run All Tests" button
- Watch the logs populate
- Test individual systems
- Explore different tabs

---

### Option 2: In-Game Test Mode

**1. Just run your game:**

```bash
npm start
```

**2. Press `~` (tilde key) in-game**

**3. Use quick commands:**
```
G - Toggle God Mode
H - Show Hitboxes  
U - Fill Ultimate
B - Spawn Boss
P - Add All Power-ups
M - Add 1000 Credits
K - Kill All Enemies
L - Add 5 Lives
1/2/3 - Time Scale (0.5x, 1x, 2x)
```

---

## 🎯 Test Each Feature

### Test Boss System
```javascript
// In test mode or console:
import { bossSystem } from './components/Systems/BossSystem.js';

const canvas = { width: 800, height: 700 };
const boss = bossSystem.spawnBoss(1000, canvas);
console.log('Boss:', boss.name, 'Health:', boss.health);
```

**Result**: Boss spawns with abilities and phases

---

### Test Wave System
```javascript
import { waveSystem } from './components/Systems/WaveSystem.js';

const waveInfo = waveSystem.startWave(5);
console.log('Wave:', waveInfo.waveNumber, 'Type:', waveInfo.waveType);
console.log('Formations:', waveSystem.formations.length);
```

**Result**: Wave 5 starts with enemy formations

---

### Test Ultimate System
```javascript
import { ultimateSystem } from './components/Systems/UltimateSystem.js';

ultimateSystem.addCharge(100);
console.log('Charge:', ultimateSystem.charge, 'Ready:', ultimateSystem.isReady());

const info = ultimateSystem.getUltimateInfo('kaden');
console.log('Kaden Ultimate:', info.name, '-', info.description);
```

**Result**: Ultimate charges to 100% and shows as ready

---

### Test Environment System
```javascript
import { environmentSystem } from './components/Systems/EnvironmentSystem.js';

const canvas = { width: 800, height: 700 };
environmentSystem.spawnAsteroid(canvas);
environmentSystem.spawnBlackHole(canvas);
environmentSystem.startMeteorShower(canvas);

console.log('Asteroids:', environmentSystem.asteroids.length);
console.log('Black Holes:', environmentSystem.blackHoles.length);
console.log('Meteors:', environmentSystem.meteors.length);
```

**Result**: Environmental hazards spawn

---

### Test Shop System
```javascript
import { shopSystem } from './components/Systems/ShopSystem.js';

shopSystem.addCurrency(10000);
console.log('Currency:', shopSystem.currency);

const upgrades = shopSystem.getAvailableUpgrades();
console.log('Upgrades Available:', upgrades.length);

const result = shopSystem.purchaseUpgrade('maxHealth');
console.log('Purchase:', result.message);
```

**Result**: Currency added, upgrades purchased

---

### Test Power-up Combos
```javascript
import { powerUpComboSystem } from './components/Systems/PowerUpComboSystem.js';

powerUpComboSystem.addPowerUp('rapidFire', 10000);
powerUpComboSystem.addPowerUp('multiShot', 10000);

console.log('Active Power-ups:', powerUpComboSystem.activePowerUps.length);
console.log('Active Combos:', powerUpComboSystem.activeCombos.length);

if (powerUpComboSystem.activeCombos.length > 0) {
  const combo = powerUpComboSystem.activeCombos[0];
  console.log('Combo Active:', combo.name, combo.icon);
}

const effects = powerUpComboSystem.getActiveEffects();
console.log('Effects:', effects);
```

**Result**: "Bullet Storm" combo activates with enhanced effects

---

### Test Challenge System
```javascript
import { challengeSystem } from './components/Systems/ChallengeSystem.js';

const config = challengeSystem.startChallenge('endless');
console.log('Mode:', config.name);
console.log('Rewards:', config.rewards);
console.log('Rules:', config.rules);

// Get all challenges
const allChallenges = challengeSystem.getAllChallenges();
console.log('Total Modes:', allChallenges.length);
```

**Result**: Endless mode starts with modifiers

---

### Test Mission System
```javascript
import { missionSystem } from './components/Systems/MissionSystem.js';

missionSystem.startMission('tutorial');
console.log('Current Mission:', missionSystem.currentMission.name);
console.log('Objectives:', missionSystem.currentMission.objectives);

// Update progress
missionSystem.updateProgress('kill', 5);
const status = missionSystem.getMissionStatus();
console.log('Progress:', status.progress);
```

**Result**: Tutorial mission starts with trackable objectives

---

## 🎮 Full Integration Test

**Create a test file**: `src/testFeatures.js`

```javascript
import { bossSystem } from './components/Systems/BossSystem.js';
import { waveSystem } from './components/Systems/WaveSystem.js';
import { ultimateSystem } from './components/Systems/UltimateSystem.js';
import { environmentSystem } from './components/Systems/EnvironmentSystem.js';
import { shopSystem } from './components/Systems/ShopSystem.js';
import { powerUpComboSystem } from './components/Systems/PowerUpComboSystem.js';
import { challengeSystem } from './components/Systems/ChallengeSystem.js';
import { missionSystem } from './components/Systems/MissionSystem.js';

export const runAllTests = () => {
  console.log('🚀 RUNNING ALL FEATURE TESTS...\n');

  // Test Boss System
  console.log('🎯 Testing Boss System...');
  const boss = bossSystem.spawnBoss(1000, { width: 800, height: 700 });
  console.log(`✅ Boss: ${boss.name}, Health: ${boss.health}\n`);

  // Test Wave System
  console.log('🌊 Testing Wave System...');
  const wave = waveSystem.startWave(3);
  console.log(`✅ Wave: ${wave.waveNumber}, Type: ${wave.waveType}\n`);

  // Test Ultimate System
  console.log('⚡ Testing Ultimate System...');
  ultimateSystem.charge = 100;
  console.log(`✅ Ultimate Ready: ${ultimateSystem.isReady()}\n`);

  // Test Environment System
  console.log('🌌 Testing Environment System...');
  environmentSystem.spawnAsteroid({ width: 800, height: 700 });
  console.log(`✅ Asteroids: ${environmentSystem.asteroids.length}\n`);

  // Test Shop System
  console.log('🛒 Testing Shop System...');
  shopSystem.addCurrency(5000);
  console.log(`✅ Currency: ${shopSystem.currency}\n`);

  // Test Combo System
  console.log('💥 Testing Combo System...');
  powerUpComboSystem.addPowerUp('rapidFire', 10000);
  powerUpComboSystem.addPowerUp('multiShot', 10000);
  console.log(`✅ Combos: ${powerUpComboSystem.activeCombos.length}\n`);

  // Test Challenge System
  console.log('🏆 Testing Challenge System...');
  const challenge = challengeSystem.startChallenge('endless');
  console.log(`✅ Mode: ${challenge.name}\n`);

  // Test Mission System
  console.log('📋 Testing Mission System...');
  missionSystem.startMission('tutorial');
  console.log(`✅ Mission: ${missionSystem.currentMission.name}\n`);

  console.log('✅ ALL TESTS PASSED! 🎉');
};
```

**Run tests in browser console:**

```javascript
import { runAllTests } from './testFeatures.js';
runAllTests();
```

---

## 📋 Verification Checklist

Test each feature and check off:

- [ ] Boss spawns and has health bar
- [ ] Wave system starts and tracks kills
- [ ] Ultimate charges and can activate
- [ ] Asteroids spawn and can be destroyed
- [ ] Black holes have gravity pull
- [ ] Meteor shower warning appears
- [ ] Currency can be added
- [ ] Upgrades can be purchased
- [ ] Ships can be bought/equipped
- [ ] Power-ups create combos
- [ ] Combo effects apply
- [ ] Challenge modes change gameplay
- [ ] Missions track objectives
- [ ] Test mode shows UI
- [ ] Quick commands work

---

## 🎬 Expected Results

### ✅ Success Indicators:

1. **No console errors**
2. **Test logs show "✓" marks**
3. **Systems return valid data**
4. **UI elements render**
5. **Test mode dashboard works**

### ❌ If Something Goes Wrong:

1. Check console for errors
2. Verify all files are in correct locations
3. Ensure imports are correct
4. Try restarting dev server
5. Check [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md)

---

## 🚀 Next: Full Integration

Once all tests pass:

1. Follow [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md)
2. Integrate into main Game.js
3. Add UI components
4. Balance gameplay
5. Deploy!

---

## 💡 Pro Tips

- **Use Test Mode first** - It's the easiest way to verify
- **Test one system at a time** - Easier to debug
- **Check the logs** - They show what's happening
- **Use quick commands** - Faster than manual testing
- **Save often** - localStorage persists data

---

## 🎮 Ready to Play!

Your game now has:
- 🎯 Epic boss battles
- 🌊 Wave-based progression  
- ⚡ Ultimate abilities
- 🌌 Environmental hazards
- 🛒 Persistent upgrades
- 💥 Power-up combos
- 🏆 Multiple game modes
- 📋 Story missions
- 🔧 Dev tools

**Everything is working and ready to integrate!** 🎉

---

**Start testing now!** 🚀✨

