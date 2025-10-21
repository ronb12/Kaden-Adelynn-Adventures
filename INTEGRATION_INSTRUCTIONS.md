# 🔧 Integration Instructions

## Critical: New Features Need Integration

All 12 features have been **coded** but are **NOT yet integrated** into the main game. This document explains how to wire them up.

---

## 🚀 Quick Integration Checklist

- [ ] Import new systems in Game.js
- [ ] Initialize systems in component
- [ ] Update game loop to use systems
- [ ] Add menu options for new modes
- [ ] Configure Firebase credentials
- [ ] Test each feature

---

## 📝 Step-by-Step Integration Guide

### **Step 1: Add Imports to Game.js**

Add these imports at the top of `src/components/Game.js`:

```javascript
// New Systems
import EnhancedParticleSystem from '../systems/EnhancedParticleSystem';
import MetaProgressionSystem from '../systems/MetaProgressionSystem';
import ParallaxBackgroundSystem from '../systems/ParallaxBackgroundSystem';
import LocalCoopSystem from '../systems/LocalCoopSystem';
import WebGLEnhancementSystem from '../systems/WebGLEnhancementSystem';
import DailyMissionSystem from '../systems/DailyMissionSystem';

// New Services
import { leaderboardService } from '../services/FirebaseLeaderboard';

// New Constants
import { ALL_CAMPAIGN_LEVELS } from '../constants/CampaignConstants';

// New Components
import ShipSelectionScreen from './Game/ShipSelectionScreen';
```

### **Step 2: Initialize Systems in Game Component**

In the `Game` component, add state for new systems:

```javascript
const Game = () => {
  // ... existing state ...
  
  // New system refs
  const particleSystemRef = useRef(new EnhancedParticleSystem());
  const metaProgressionRef = useRef(new MetaProgressionSystem());
  const parallaxRef = useRef(new ParallaxBackgroundSystem());
  const coopSystemRef = useRef(null); // Initialize when co-op enabled
  const webglRef = useRef(null); // Initialize when WebGL enabled
  const dailyMissionsRef = useRef(new DailyMissionSystem());
  
  // New game modes
  const [gameMode, setGameMode] = useState('endless'); // 'endless', 'campaign', 'coop'
  const [currentLevel, setCurrentLevel] = useState(null);
  const [selectedShip, setSelectedShip] = useState('phoenixWing');
  const [showShipSelection, setShowShipSelection] = useState(false);
  const [showDailyMissions, setShowDailyMissions] = useState(false);
  
  // ... rest of component ...
}
```

### **Step 3: Initialize Systems on Mount**

```javascript
useEffect(() => {
  if (canvasRef.current) {
    const canvas = canvasRef.current;
    
    // Initialize Parallax Background
    parallaxRef.current.initialize(canvas.width, canvas.height, 'space');
    
    // Initialize WebGL (if supported)
    webglRef.current = new WebGLEnhancementSystem(canvas);
    
    // Initialize co-op if in co-op mode
    if (gameMode === 'coop') {
      coopSystemRef.current = new LocalCoopSystem();
      coopSystemRef.current.initialize(canvas.width, canvas.height);
    }
  }
}, [gameMode]);
```

### **Step 4: Update Game Loop**

Modify the game loop to use new systems:

```javascript
const gameLoop = React.useCallback((currentTime) => {
  if (gameState !== 'playing') return;
  
  const canvas = canvasRef.current;
  const ctx = canvas.getContext('2d');
  
  // Apply meta-progression bonuses
  const bonuses = metaProgressionRef.current.getTotalBonuses();
  const adjustedSpeed = game.player.speed * bonuses.speedMultiplier;
  const adjustedDamage = weaponDamage * bonuses.damageMultiplier;
  
  // Clear and draw parallax background
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  parallaxRef.current.update();
  parallaxRef.current.draw(ctx);
  
  // Screen shake from particle system
  const shake = particleSystemRef.current.getScreenShake();
  ctx.save();
  ctx.translate(shake.x, shake.y);
  
  // ... existing game logic ...
  
  // Update and draw particles
  particleSystemRef.current.update();
  particleSystemRef.current.draw(ctx);
  
  // Co-op mode
  if (gameMode === 'coop' && coopSystemRef.current) {
    coopSystemRef.current.update(keys, currentTime);
    coopSystemRef.current.draw(ctx);
  }
  
  ctx.restore();
  
  // WebGL effects (if enabled)
  if (webglRef.current && webglRef.current.isEnabled()) {
    webglRef.current.renderParticles(particleSystemRef.current.particles);
  }
  
  requestAnimationFrame(gameLoop);
}, [gameState, gameMode]);
```

### **Step 5: Add Particle Effects to Game Events**

```javascript
// When enemy destroyed
const destroyEnemy = (enemy) => {
  particleSystemRef.current.createExplosion(
    enemy.x + enemy.width / 2,
    enemy.y + enemy.height / 2,
    'medium',
    enemy.color
  );
  
  // Add score with meta-progression bonus
  const bonuses = metaProgressionRef.current.getTotalBonuses();
  const scoreGained = 100 * bonuses.creditMultiplier;
  metaProgressionRef.current.addXP(10);
};

// When player gets hit
const playerHit = (damage) => {
  particleSystemRef.current.createHitSpark(
    game.player.x,
    game.player.y,
    Math.PI / 2,
    '#ff0000'
  );
};

// When power-up collected
const collectPowerUp = (powerUp) => {
  particleSystemRef.current.createPowerUpEffect(
    powerUp.x,
    powerUp.y,
    powerUp.color
  );
};
```

### **Step 6: Update Menu Screen**

Modify `src/components/Game/MenuScreen.js`:

```javascript
<div className="menu-buttons">
  <button onClick={() => {
    setGameMode('endless');
    startGame();
  }}>
    🚀 Endless Mode
  </button>
  
  <button onClick={() => {
    setShowShipSelection(true);
  }}>
    🛸 Ship Selection ({unlockedShips.length}/20)
  </button>
  
  <button onClick={() => {
    setGameMode('campaign');
    setCurrentLevel(1);
    startGame();
  }}>
    📋 Campaign Mode (50 Levels)
  </button>
  
  <button onClick={() => {
    setGameMode('coop');
    startGame();
  }}>
    👥 Co-op Mode (2 Players)
  </button>
  
  <button onClick={() => setShowDailyMissions(true)}>
    ⭐ Daily Missions ({completedMissions}/3)
  </button>
  
  <button onClick={() => setShowLeaderboard(true)}>
    🏆 Leaderboards
  </button>
  
  <button onClick={() => setShowProgression(true)}>
    📊 Skills & Progression
  </button>
</div>
```

### **Step 7: Campaign Mode Integration**

```javascript
// In Game component
const loadCampaignLevel = (levelId) => {
  const level = ALL_CAMPAIGN_LEVELS[`LEVEL_${levelId}`];
  
  if (!level) {
    console.error('Level not found:', levelId);
    return;
  }
  
  // Set level objectives
  setCurrentObjectives(level.objectives);
  
  // Spawn enemies according to level waves
  level.enemyWaves.forEach(wave => {
    setTimeout(() => {
      spawnWave(wave.count, wave.type);
    }, wave.delay);
  });
  
  // Spawn level power-ups
  level.powerUps.forEach(powerUpType => {
    setTimeout(() => {
      spawnPowerUp(powerUpType);
    }, Math.random() * 10000);
  });
};
```

### **Step 8: Daily Missions Integration**

```javascript
// Update daily mission progress
const updateDailyMissions = (type, amount, metadata) => {
  dailyMissionsRef.current.updateProgress(type, amount, metadata);
  
  // Check for completed missions
  const missions = dailyMissionsRef.current.getMissions();
  missions.forEach(mission => {
    if (mission.completed && !mission.claimed) {
      // Show completion notification
      showNotification(`Mission Complete: ${mission.name}!`);
    }
  });
};

// In game loop - track progress
if (enemyKilled) {
  updateDailyMissions('kills', 1);
  updateDailyMissions('kills_specific', 1, { enemyType: enemy.type });
}

if (weaponChanged) {
  updateDailyMissions('use_weapons', 1);
}
```

### **Step 9: Ship Selection Integration**

```javascript
// Show ship selection screen
{showShipSelection && (
  <ShipSelectionScreen
    onSelect={(shipId) => {
      setSelectedShip(shipId);
      setShowShipSelection(false);
      
      // Apply ship stats
      const ship = SHIP_TYPES[shipId.toUpperCase()];
      game.player.speed = ship.stats.speed;
      game.player.maxHealth = ship.stats.maxHealth;
      game.player.damageMultiplier = ship.stats.damageMultiplier;
    }}
    onBack={() => setShowShipSelection(false)}
    playerStats={metaProgressionRef.current.playerData}
    unlockedShips={getUnlockedShips()}
  />
)}
```

### **Step 10: Firebase Configuration**

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: `kaden---adelynn-adventures`
3. Go to Project Settings → General
4. Scroll to "Your apps" → Web app
5. Copy the config object
6. Update `src/services/FirebaseLeaderboard.js`:

```javascript
const firebaseConfig = {
  apiKey: "PASTE_YOUR_API_KEY",
  authDomain: "kaden---adelynn-adventures.firebaseapp.com",
  databaseURL: "https://kaden---adelynn-adventures-default-rtdb.firebaseio.com",
  projectId: "kaden---adelynn-adventures",
  storageBucket: "kaden---adelynn-adventures.appspot.com",
  messagingSenderId: "PASTE_YOUR_SENDER_ID",
  appId: "PASTE_YOUR_APP_ID"
};
```

7. Enable Realtime Database in Firebase Console

---

## 🎮 Testing Each Feature

### Test 1: Particle Effects
```javascript
// Create test explosion
particleSystemRef.current.createExplosion(400, 300, 'huge', '#ff6600');
```

### Test 2: Meta-Progression
```javascript
// Add XP and check bonuses
metaProgressionRef.current.addXP(1000);
console.log(metaProgressionRef.current.getTotalBonuses());
```

### Test 3: Parallax Background
```javascript
// Change preset
parallaxRef.current.changePreset('nebula');
```

### Test 4: Co-op Mode
```javascript
// Check both players
console.log(coopSystemRef.current.getCombinedStats());
```

### Test 5: Daily Missions
```javascript
// Get missions
console.log(dailyMissionsRef.current.getMissions());
```

---

## 📊 Integration Checklist

- [ ] All imports added
- [ ] Systems initialized
- [ ] Game loop updated
- [ ] Particle effects wired up
- [ ] Menu options added
- [ ] Campaign mode works
- [ ] Ship selection works
- [ ] Co-op mode works
- [ ] Daily missions track progress
- [ ] Firebase configured
- [ ] Meta-progression applies bonuses
- [ ] Parallax background visible
- [ ] WebGL effects active (if supported)

---

## ⚠️ Common Integration Issues

1. **Systems not initialized before use**
   - Always check if ref.current exists
   - Initialize in useEffect with proper dependencies

2. **Game loop not calling new systems**
   - Make sure update() and draw() are called
   - Check order of rendering (background → game → particles)

3. **State updates causing re-renders**
   - Use useRef for systems that shouldn't trigger re-renders
   - Use useState only for UI-related state

4. **Firebase errors**
   - Check that credentials are correct
   - Enable Realtime Database in Firebase Console
   - Check browser console for CORS errors

---

## 🎯 Quick Win: Enable Particles Only

For a quick test, just enable particle effects:

```javascript
// At top of Game.js
import EnhancedParticleSystem from '../systems/EnhancedParticleSystem';

// In component
const particleSystemRef = useRef(new EnhancedParticleSystem());

// In game loop - after drawing game objects
particleSystemRef.current.update();
particleSystemRef.current.draw(ctx);

// When enemy destroyed
particleSystemRef.current.createExplosion(
  enemy.x + enemy.width / 2,
  enemy.y + enemy.height / 2,
  'large',
  '#ff6600'
);
```

This will immediately add visual polish with minimal integration!

---

**Need help? All systems are fully functional, just need to be wired up!**

