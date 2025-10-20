# 🚀 New Features Integration Guide

This guide explains how to integrate all the new game systems into the main Game.js file.

## 📋 Table of Contents

1. [Imports](#imports)
2. [System Initialization](#system-initialization)
3. [Game Loop Integration](#game-loop-integration)
4. [Event Handlers](#event-handlers)
5. [Rendering](#rendering)
6. [Testing](#testing)

---

## 1. Imports

Add these imports at the top of `Game.js`:

```javascript
// New Systems
import { bossSystem } from './Systems/BossSystem.js';
import { waveSystem } from './Systems/WaveSystem.js';
import { ultimateSystem } from './Systems/UltimateSystem.js';
import { environmentSystem } from './Systems/EnvironmentSystem.js';
import { shopSystem } from './Systems/ShopSystem.js';
import { powerUpComboSystem } from './Systems/PowerUpComboSystem.js';
import { challengeSystem } from './Systems/ChallengeSystem.js';
import { missionSystem } from './Systems/MissionSystem.js';
import { testPlayerSystem } from './Systems/TestPlayerSystem.js';

// Constants
import { SHIP_TYPES } from '../constants/ShipConstants.js';
```

---

## 2. System Initialization

Add these to your game state initialization:

```javascript
const gameRef = useRef({
  // ... existing state ...
  
  // New Systems
  bossSystem: bossSystem,
  waveSystem: waveSystem,
  ultimateSystem: ultimateSystem,
  environmentSystem: environmentSystem,
  shopSystem: shopSystem,
  powerUpComboSystem: powerUpComboSystem,
  challengeSystem: challengeSystem,
  missionSystem: missionSystem,
  testPlayerSystem: testPlayerSystem,
  
  // Additional state
  ultimateRing: null,
  tacticalStrikeActive: false,
  tacticalTint: false,
  canvas: null
});

// Initialize systems on component mount
useEffect(() => {
  // Load saved shop data
  shopSystem.loadFromStorage();
  
  // Load mission progress
  missionSystem.loadProgress();
  
  // Apply shop upgrades to player
  const upgradedStats = shopSystem.applyUpgrades(gameRef.current.player);
  gameRef.current.player = { ...gameRef.current.player, ...upgradedStats };
  
  // Start first mission if no progress
  if (!missionSystem.currentMission && missionSystem.completedMissions.length === 0) {
    missionSystem.startMission('tutorial');
  }
}, []);
```

---

## 3. Game Loop Integration

Update your game loop to include new systems:

```javascript
const gameLoop = useCallback((currentTime) => {
  if (gameState !== 'playing') return;
  
  const game = gameRef.current;
  const deltaTime = currentTime - game.lastTime;
  const cappedDeltaTime = Math.min(deltaTime, 50);
  
  // Test Player - apply god mode and time scale
  if (testPlayerSystem.enabled) {
    testPlayerSystem.applyGodMode(game);
    testPlayerSystem.applyTimeScale(game);
  }
  
  // Update Wave System
  if (waveSystem.waveActive) {
    waveSystem.update(deltaTime, game);
  } else if (!waveSystem.betweenWaves && gameState === 'playing') {
    // Start first wave
    waveSystem.startWave(1);
  }
  
  // Update Boss System
  if (bossSystem.isActive()) {
    bossSystem.update(deltaTime, canvas, game);
    
    // Check bullet collisions with boss
    game.bullets = game.bullets.filter(bullet => {
      const boss = bossSystem.getBoss();
      if (checkCollision(bullet, boss)) {
        const defeated = bossSystem.damage(bullet.damage || 10);
        
        if (defeated) {
          game.score += 1000;
          game.bossActive = false;
          
          // Update mission progress
          missionSystem.updateProgress('boss', 1);
          
          // Grant rewards
          const bossReward = shopSystem.convertScoreToCurrency(1000);
          ultimateSystem.addCharge(30);
          
          // Wave system boss wave complete
          if (waveSystem.currentWave % 5 === 0) {
            waveSystem.completeWave(game);
          }
          
          bossSystem.reset();
        }
        
        return false;
      }
      return true;
    });
  }
  
  // Spawn boss on boss waves
  if (waveSystem.currentWave % 5 === 0 && !bossSystem.isActive() && waveSystem.enemiesKilled > 0) {
    bossSystem.spawnBoss(game.score, canvas);
    game.bossActive = true;
  }
  
  // Update Ultimate System
  ultimateSystem.update(deltaTime);
  
  // Update Environment System
  environmentSystem.update(deltaTime, game, canvas);
  
  // Update Power-up Combo System
  powerUpComboSystem.update(deltaTime);
  
  // Apply combo effects
  const comboEffects = powerUpComboSystem.getActiveEffects();
  if (comboEffects.fireRateBonus > 0) {
    // Apply fire rate bonus
  }
  if (comboEffects.invulnerable) {
    game.respawnInvincible = 1000;
  }
  if (comboEffects.healthRegen > 0) {
    game.player.health = Math.min(
      game.player.health + comboEffects.healthRegen * (deltaTime / 1000),
      game.player.maxHealth
    );
  }
  
  // Update Challenge System
  if (challengeSystem.currentMode !== 'normal') {
    challengeSystem.update(deltaTime, game);
  }
  
  // Update Mission System
  missionSystem.updateProgress('time', deltaTime / 1000);
  
  // ... rest of your existing game loop ...
  
  // Enemy kills - update systems
  const enemyKilled = () => {
    // Wave system
    waveSystem.registerKill();
    
    // Ultimate system
    ultimateSystem.addCharge(5);
    
    // Mission system
    missionSystem.updateProgress('kill', 1);
    
    // Shop currency
    shopSystem.addCurrency(1);
  };
  
  game.lastTime = currentTime;
  requestAnimationFrame(gameLoop);
}, [gameState]);
```

---

## 4. Event Handlers

Add event handlers for new features:

```javascript
// Keyboard controls
useEffect(() => {
  const handleKeyDown = (event) => {
    // Test Player quick commands
    if (testPlayerSystem.enabled) {
      if (testPlayerSystem.handleKeyPress(event, gameRef.current)) {
        return; // Command handled
      }
    }
    
    // Ultimate ability (U key or Space+Shift)
    if (event.code === 'KeyU' || (event.code === 'Space' && event.shiftKey)) {
      const game = gameRef.current;
      if (ultimateSystem.isReady()) {
        ultimateSystem.activateUltimate(selectedCharacter, game);
      }
    }
    
    // Toggle test mode (~ key)
    if (event.code === 'Backquote') {
      testPlayerSystem.toggle();
    }
    
    // ... existing key handlers ...
  };
  
  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, []);

// Touch/Click for ultimate on mobile
const handleCanvasClick = (event) => {
  if (!isMobile) return;
  
  // Double tap for ultimate
  const now = Date.now();
  if (now - lastTapTime < 300) {
    if (ultimateSystem.isReady()) {
      ultimateSystem.activateUltimate(selectedCharacter, gameRef.current);
    }
  }
  lastTapTime = now;
};
```

---

## 5. Rendering

Add rendering for all new systems in your render function:

```javascript
const render = () => {
  const game = gameRef.current;
  const canvas = canvasRef.current;
  const ctx = canvas.getContext('2d');
  
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // ... existing rendering ...
  
  // Render Environmental Hazards
  environmentSystem.render(ctx, canvas);
  
  // Render Boss
  if (bossSystem.isActive()) {
    bossSystem.render(ctx);
  }
  
  // Render Wave UI
  if (waveSystem.waveActive || waveSystem.betweenWaves) {
    waveSystem.render(ctx, canvas);
  }
  
  // Render Ultimate Charge Meter
  ultimateSystem.renderChargeMeter(ctx, canvas);
  
  // Render Ultimate Effects
  ultimateSystem.renderUltimateEffects(ctx, canvas, game);
  
  // Render Power-up Combos
  powerUpComboSystem.render(ctx, canvas);
  
  // Render Challenge Mode UI
  if (challengeSystem.currentMode !== 'normal') {
    challengeSystem.render(ctx, canvas, game);
  }
  
  // Render Mission Objectives
  if (missionSystem.currentMission) {
    missionSystem.render(ctx, canvas);
  }
  
  // Render Test Player UI (when enabled)
  if (testPlayerSystem.enabled) {
    testPlayerSystem.render(ctx, canvas, game);
  }
};
```

---

## 6. Testing

### A. Using Test Mode Component

Add the TestMode component to your App.js for standalone testing:

```javascript
import TestMode from './components/TestMode';

function App() {
  const [showTestMode, setShowTestMode] = useState(false);
  
  return (
    <div className="App">
      {showTestMode ? (
        <TestMode />
      ) : (
        <Game />
      )}
      <button 
        style={{position: 'fixed', top: 10, right: 10, zIndex: 9999}}
        onClick={() => setShowTestMode(!showTestMode)}
      >
        {showTestMode ? 'Game' : 'Test Mode'}
      </button>
    </div>
  );
}
```

### B. In-Game Testing

Enable test player in-game by pressing the `~` key:

**Quick Commands:**
- `G` - Toggle God Mode
- `H` - Toggle Hitboxes
- `U` - Fill Ultimate
- `B` - Spawn Boss
- `P` - Add All Power-ups
- `M` - Add 1000 Credits
- `K` - Kill All Enemies
- `L` - Add 5 Lives
- `1/2/3` - Time Scale (0.5x, 1x, 2x)

### C. Automated Testing

Run all tests programmatically:

```javascript
// In console or test file
import { testPlayerSystem } from './components/Systems/TestPlayerSystem.js';

testPlayerSystem.toggle();
testPlayerSystem.runScenario('bossTest', gameRef.current);
testPlayerSystem.runScenario('waveTest', gameRef.current);
testPlayerSystem.runScenario('ultimateTest', gameRef.current);
```

---

## 🎮 Game Modes

### Starting Different Modes

```javascript
// Normal Mode (default)
challengeSystem.startChallenge('normal');

// Endless Mode
challengeSystem.startChallenge('endless');

// Time Attack
challengeSystem.startChallenge('timeAttack');

// One Life Mode
challengeSystem.startChallenge('oneLife');

// Perfect Run
challengeSystem.startChallenge('perfectRun');
```

---

## 💾 Save/Load Integration

Add save/load for new systems:

```javascript
const saveGame = () => {
  // Existing save code...
  
  // Save new systems
  shopSystem.saveToStorage();
  missionSystem.saveProgress();
  challengeSystem.saveLeaderboards();
};

const loadGame = () => {
  // Existing load code...
  
  // Load new systems
  shopSystem.loadFromStorage();
  missionSystem.loadProgress();
};
```

---

## 🎨 UI Components

### Shop UI

Create a Shop modal/screen to display:

```javascript
const upgrades = shopSystem.getAvailableUpgrades();
const ships = shopSystem.getAvailableShips();
const currency = shopSystem.currency;

// Render shop UI with these values
```

### Mission UI

Display current mission in a corner:

```javascript
const missionStatus = missionSystem.getMissionStatus();
// Show mission name and objectives with progress
```

---

## 🔧 Configuration

All systems use constants that can be tweaked:

- `BossTypes.js` - Boss configurations
- `ShipConstants.js` - Ship stats
- `GameConstants.js` - Game balance

---

## ⚡ Performance Tips

1. **Object Pooling**: Already implemented in WeaponSystem
2. **Render Culling**: Skip rendering off-screen entities
3. **Update Throttling**: Update complex systems less frequently
4. **Particle Limits**: Cap particle counts in EnvironmentSystem

---

## 🐛 Troubleshooting

### Boss not spawning
- Check `game.score >= 1000`
- Ensure `bossSystem` is imported and initialized
- Verify `game.bossActive` is set to `true`

### Ultimate not charging
- Call `ultimateSystem.addCharge(amount)` on enemy kills
- Check that charge is being accumulated properly

### Combos not activating
- Ensure power-ups are added via `powerUpComboSystem.addPowerUp()`
- Check that multiple required power-ups are active
- Call `powerUpComboSystem.checkCombos()` after adding power-ups

### Test Mode not working
- Press `~` (tilde/backtick) key to toggle
- Check console for errors
- Ensure testPlayerSystem is initialized

---

## 📚 System Reference

### Boss System
```javascript
bossSystem.spawnBoss(score, canvas)  // Spawn boss
bossSystem.damage(amount)            // Damage boss
bossSystem.isActive()                // Check if boss active
bossSystem.reset()                   // Reset system
```

### Wave System
```javascript
waveSystem.startWave(number)         // Start wave
waveSystem.registerKill()            // Register enemy kill
waveSystem.getStats()                // Get wave info
```

### Ultimate System
```javascript
ultimateSystem.addCharge(amount)     // Add charge
ultimateSystem.isReady()             // Check if ready
ultimateSystem.activateUltimate(char, game)  // Activate
```

### Shop System
```javascript
shopSystem.addCurrency(amount)       // Add credits
shopSystem.purchaseUpgrade(name)     // Buy upgrade
shopSystem.equipShip(name)           // Equip ship
```

---

## 🎯 Next Steps

1. ✅ All systems created
2. ✅ Test mode implemented
3. 🔄 Integrate into main Game.js
4. 🔄 Create Shop UI component
5. 🔄 Add gamepad support for ultimates
6. 🔄 Balance testing

---

## 🚀 Ready to Launch!

All systems are now ready for integration. Use the Test Mode component to verify everything works, then integrate piece by piece into your main game!

**Happy coding! 🎮✨**

