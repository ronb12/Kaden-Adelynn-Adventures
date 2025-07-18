// --- Game Variables ---
let canvas, ctx, hud, mainMenu, startBtn, gameOverScreen, restartBtn, mainMenuBtn;
let scoreDisplay, livesDisplay, finalScore, highScoreDisplay, weaponLevelDisplay, difficultyDisplay, timeDisplay;
let pauseMenu, resumeBtn, saveExitBtn, exitNoSaveBtn, continueBtn;

// --- Input System ---
// Keyboard event listeners will be added in initGame()

// --- Game States ---
let gameState = 'menu'; // 'menu', 'playing', 'upgrade', 'boss', 'gameover'
let stage = 1;
let stageProgress = 0;
let stageGoal = 20; // Enemies to defeat per stage
let credits = 0;
let upgrades = [];

// --- Mission System ---
let currentMission = 1;
let totalMissions = 50;
let missionData = [];
let missionObjectives = [];
let missionCompleted = false;

// --- Level Progression ---
let playerLevel = 1;
let playerXP = 0;
let xpToNextLevel = 100;
let skillPoints = 0;

// --- Enemy Types ---
const ENEMY_TYPES = {
  scout: {
    name: 'Scout Fighter',
    health: 1,
    speed: 2,
    points: 10,
    color: '#ff4444',
    size: 20,
    fireRate: 0,
    behavior: 'straight'
  },
  interceptor: {
    name: 'Interceptor',
    health: 2,
    speed: 3,
    points: 25,
    color: '#ff8844',
    size: 25,
    fireRate: 0.02,
    behavior: 'straight'
  },
  bomber: {
    name: 'Bomber',
    health: 4,
    speed: 1,
    points: 50,
    color: '#ff4444',
    size: 35,
    fireRate: 0.01,
    behavior: 'straight'
  },
  fighter: {
    name: 'Fighter',
    health: 3,
    speed: 2.5,
    points: 35,
    color: '#8844ff',
    size: 30,
    fireRate: 0.03,
    behavior: 'straight'
  },
  destroyer: {
    name: 'Destroyer',
    health: 8,
    speed: 1.5,
    points: 100,
    color: '#ff4488',
    size: 45,
    fireRate: 0.02,
    behavior: 'straight'
  }
};

// --- Mission Definitions ---
function generateMissions() {
  missionData = [];
  for (let i = 1; i <= totalMissions; i++) {
    const mission = {
      id: i,
      name: `Mission ${i}`,
      description: `Clear the sector of enemy forces`,
      enemyTypes: [],
      enemyCount: Math.min(10 + i * 2, 50),
      bossType: i % 10 === 0 ? 'boss' : null,
      background: i % 5 === 0 ? 'nebula' : 'stars',
      difficulty: Math.min(1 + i * 0.1, 5),
      reward: {
        credits: i * 10,
        xp: i * 5
      }
    };
    
    // Add enemy types based on mission level
    if (i <= 5) {
      mission.enemyTypes = ['scout'];
    } else if (i <= 10) {
      mission.enemyTypes = ['scout', 'interceptor'];
    } else if (i <= 20) {
      mission.enemyTypes = ['scout', 'interceptor', 'bomber'];
    } else if (i <= 30) {
      mission.enemyTypes = ['scout', 'interceptor', 'bomber', 'fighter'];
    } else {
      mission.enemyTypes = ['scout', 'interceptor', 'bomber', 'fighter', 'destroyer'];
    }
    
    missionData.push(mission);
  }
}

// --- Mission Management ---
function startMission(missionId) {
  currentMission = missionId;
  const mission = missionData[missionId - 1];
  stageProgress = 0;
  stageGoal = mission.enemyCount;
  missionCompleted = false;
  bossSpawned = false;
  boss = null;
  
  // Set mission objectives
  missionObjectives = [
    `Destroy ${mission.enemyCount} enemies`,
    `Survive the mission`,
    mission.bossType ? 'Defeat the boss' : null
  ].filter(Boolean);
  
  gameState = 'playing';
  updateMissionUI();
}

function updateMissionUI() {
  const mission = missionData[currentMission - 1];
  document.getElementById('mission-name').textContent = mission.name;
  document.getElementById('mission-description').textContent = mission.description;
  
  const objectivesList = document.getElementById('mission-objectives');
  objectivesList.innerHTML = '';
  missionObjectives.forEach(obj => {
    const li = document.createElement('li');
    li.textContent = obj;
    objectivesList.appendChild(li);
  });
  
  const progress = Math.min(100, Math.floor((stageProgress / stageGoal) * 100));
  document.getElementById('mission-progress').style.width = progress + '%';
  document.getElementById('mission-progress-text').textContent = `${stageProgress}/${stageGoal}`;
}

function completeMission() {
  const mission = missionData[currentMission - 1];
  missionCompleted = true;
  
  // Award rewards
  credits += mission.reward.credits;
  addXP(mission.reward.xp);
  
  // Show mission complete screen
  showMissionComplete(mission);
}

function showMissionComplete(mission) {
  const screen = document.getElementById('mission-complete');
  document.getElementById('mission-complete-name').textContent = mission.name;
  document.getElementById('mission-complete-credits').textContent = `+${mission.reward.credits} Credits`;
  document.getElementById('mission-complete-xp').textContent = `+${mission.reward.xp} XP`;
  
  screen.classList.remove('hidden');
  gameState = 'mission-complete';
}

// --- Player Progression ---
function addXP(amount) {
  playerXP += amount;
  while (playerXP >= xpToNextLevel) {
    playerXP -= xpToNextLevel;
    playerLevel++;
    skillPoints++;
    xpToNextLevel = Math.floor(xpToNextLevel * 1.2);
    
    // Show level up effect
    showLevelUpEffect();
  }
  updateProgressionUI();
}

function showLevelUpEffect() {
  // Create level up particles
  for (let i = 0; i < 20; i++) {
    createParticle(player.x + player.width/2, player.y + player.height/2, '#ffff00', 3, 60);
  }
  
  // Show level up text
  playSoundEffect('levelup', player.x + player.width/2, player.y + player.height/2);
}

function updateProgressionUI() {
  document.getElementById('player-level').textContent = `Level ${playerLevel}`;
  document.getElementById('player-xp').textContent = `${playerXP}/${xpToNextLevel} XP`;
  document.getElementById('skill-points').textContent = `${skillPoints} SP`;
  
  const xpPercent = (playerXP / xpToNextLevel) * 100;
  document.getElementById('xp-bar').style.width = xpPercent + '%';
}

// --- Upgrade Pool ---
const UPGRADE_POOL = [
  { name: 'Weapon Power +1', effect: 'weapon', icon: '🔫' },
  { name: 'Drone +1', effect: 'drone', icon: '🛸' },
  { name: 'Shield +1', effect: 'shield', icon: '🛡️' },
  { name: 'Speed +1', effect: 'speed', icon: '⚡' },
  { name: 'Missile', effect: 'missile', icon: '🚀' },
  { name: 'Triple Shot', effect: 'triple', icon: '🔱' },
  { name: 'Heal', effect: 'heal', icon: '❤️' },
  { name: 'Bomb', effect: 'bomb', icon: '💣' }
];

// --- State Transition Functions ---
function startStage() {
  gameState = 'playing';
  stageProgress = 0;
  updateTopBar();
}

function endStage() {
  gameState = 'upgrade';
  showUpgradeMenu();
}

function startBoss() {
  gameState = 'boss';
  // TODO: spawn boss
  updateTopBar();
}

function endGame() {
  gameState = 'gameover';
  finalScore.textContent = 'Final Score: ' + score;
  
  // Check for new high score
  const isNewHighScore = checkForNewHighScore();
  
  gameOverScreen.classList.remove('hidden');
  mainMenu.classList.add('hidden');
  stopAutoSave();
  saveGame(); // Auto-save on game over
  
  // Show high score celebration if it's a new record
  if (isNewHighScore) {
    finalScore.textContent = 'Final Score: ' + score + ' - NEW HIGH SCORE! 🎉';
    finalScore.style.color = '#ffff00';
    finalScore.style.textShadow = '0 0 10px #ffff00';
  }
}

// --- Top Bar Update ---
function updateTopBar() {
  document.getElementById('stage-indicator').textContent = `Stage ${stage}`;
  document.getElementById('credits').textContent = `Credits: ${credits}`;
  const percent = Math.min(100, Math.floor((stageProgress / stageGoal) * 100));
  document.getElementById('progress-fill').style.width = percent + '%';
}

// --- Upgrade Menu ---
function showUpgradeMenu() {
  const menu = document.getElementById('upgrade-menu');
  const optionsDiv = document.getElementById('upgrade-options');
  optionsDiv.innerHTML = '';
  // Pick 3 random upgrades
  const choices = [];
  while (choices.length < 3) {
    const pick = UPGRADE_POOL[Math.floor(Math.random() * UPGRADE_POOL.length)];
    if (!choices.includes(pick)) choices.push(pick);
  }
  choices.forEach((upg, idx) => {
    const div = document.createElement('div');
    div.className = 'upgrade-option';
    div.innerHTML = `<span style="font-size:2rem;">${upg.icon}</span><br>${upg.name}`;
    div.onclick = () => {
      document.querySelectorAll('.upgrade-option').forEach(el => el.classList.remove('selected'));
      div.classList.add('selected');
      div.dataset.selected = 'true';
    };
    optionsDiv.appendChild(div);
  });
  menu.classList.remove('hidden');
}

let player, bullets, enemies, score, lives, keys, enemyTimer;
let gameTime = 0;
let difficulty = 1;
let bossSpawned = false;
let boss = null;
let gamePaused = false;
let autoSaveInterval = null;
let highScores = [];

// Gradius-style power-up system
let powerUpMenu = false;
let selectedPowerUp = 0;
let options = []; // Drones that follow the player

// Touch support for iOS
let isTouchDevice = false;
let touchStartX = 0;
let touchStartY = 0;
let touchX = 0;
let touchY = 0;
let isTouching = false;

// Starfield background
let stars = [];



// --- Particle System ---
let particles = [];
function createParticle(x, y, color, speed = 2, life = 30) {
  particles.push({
    x, y,
    vx: (Math.random() - 0.5) * speed,
    vy: (Math.random() - 0.5) * speed,
    life, maxLife: life,
    color, size: Math.random() * 3 + 1
  });
}

function updateParticles() {
  particles.forEach(p => {
    p.x += p.vx;
    p.y += p.vy;
    p.life--;
  });
  particles = particles.filter(p => p.life > 0);
}

function drawParticles() {
  particles.forEach(p => {
    ctx.save();
    ctx.globalAlpha = p.life / p.maxLife;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });
}

// --- Sound Effects (Visual) ---
let soundEffects = [];
function playSoundEffect(type, x, y) {
  soundEffects.push({
    type, x, y, timer: 0, maxTimer: 20,
    text: type === 'collect' ? '+100' : type === 'hit' ? 'HIT!' : 'BOOM!',
    color: type === 'collect' ? '#00ff00' : type === 'hit' ? '#ff0000' : '#ffaa00'
  });
}

function updateSoundEffects() {
  soundEffects.forEach(s => {
    s.timer++;
    s.y -= 1;
  });
  soundEffects = soundEffects.filter(s => s.timer < s.maxTimer);
}

function drawSoundEffects() {
  soundEffects.forEach(s => {
    ctx.save();
    ctx.globalAlpha = 1 - (s.timer / s.maxTimer);
    ctx.fillStyle = s.color;
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(s.text, s.x, s.y);
    ctx.restore();
  });
}

// --- Boss System ---
let bossHealth = 0;
let bossMaxHealth = 0;

const BOSS_TYPES = {
  destroyer: {
    name: 'Destroyer Boss',
    health: 50,
    size: 80,
    speed: 1,
    fireRate: 0.05,
    pattern: 'circle',
    color: '#ff0000'
  },
  carrier: {
    name: 'Carrier Boss',
    health: 75,
    size: 100,
    speed: 0.8,
    fireRate: 0.03,
    pattern: 'spawn',
    color: '#ff8800'
  },
  dreadnought: {
    name: 'Dreadnought Boss',
    health: 100,
    size: 120,
    speed: 0.6,
    fireRate: 0.04,
    pattern: 'laser',
    color: '#ff00ff'
  }
};

// --- Skill Tree System ---
let skillTree = {
  weapons: {
    name: 'Weapons',
    skills: [
      { id: 'rapid_fire', name: 'Rapid Fire', cost: 1, maxLevel: 3, effect: 'Increase fire rate' },
      { id: 'multi_shot', name: 'Multi Shot', cost: 2, maxLevel: 3, effect: 'Fire multiple bullets' },
      { id: 'laser_beam', name: 'Laser Beam', cost: 3, maxLevel: 1, effect: 'Unlock laser weapon' },
      { id: 'missile_launcher', name: 'Missile Launcher', cost: 2, maxLevel: 2, effect: 'Add missile weapons' }
    ]
  },
  defense: {
    name: 'Defense',
    skills: [
      { id: 'shield_boost', name: 'Shield Boost', cost: 1, maxLevel: 3, effect: 'Increase shield duration' },
      { id: 'armor_plating', name: 'Armor Plating', cost: 2, maxLevel: 2, effect: 'Reduce damage taken' },
      { id: 'auto_repair', name: 'Auto Repair', cost: 3, maxLevel: 1, effect: 'Slowly regenerate health' }
    ]
  },
  mobility: {
    name: 'Mobility',
    skills: [
      { id: 'speed_boost', name: 'Speed Boost', cost: 1, maxLevel: 3, effect: 'Increase movement speed' },
      { id: 'dash', name: 'Dash', cost: 2, maxLevel: 1, effect: 'Quick dodge ability' },
      { id: 'teleport', name: 'Teleport', cost: 3, maxLevel: 1, effect: 'Short-range teleport' }
    ]
  }
};

let playerSkills = {};

// --- Advanced Weapon System ---
let weaponTypes = {
  basic: { name: 'Basic Laser', damage: 1, fireRate: 1, type: 'laser' },
  rapid: { name: 'Rapid Laser', damage: 1, fireRate: 2, type: 'laser' },
  heavy: { name: 'Heavy Laser', damage: 3, fireRate: 0.5, type: 'laser' },
  missile: { name: 'Missile', damage: 5, fireRate: 0.3, type: 'missile' },
  plasma: { name: 'Plasma Cannon', damage: 4, fireRate: 0.4, type: 'plasma' }
};

let currentWeapon = 'basic';
let weaponLevel = 1;

function spawnBoss() {
  const mission = missionData[currentMission - 1];
  if (!mission.bossType) return;
  
  const bossType = BOSS_TYPES[mission.bossType] || BOSS_TYPES.destroyer;
  boss = {
    x: canvas.width / 2 - bossType.size / 2,
    y: -bossType.size,
    width: bossType.size,
    height: bossType.size,
    health: bossType.health,
    maxHealth: bossType.health,
    speed: bossType.speed,
    fireRate: bossType.fireRate,
    pattern: bossType.pattern,
    type: mission.bossType,
    lastShot: 0,
    phase: 1,
    moveTimer: 0
  };
  
  bossSpawned = true;
  bossHealth = boss.health;
  bossMaxHealth = boss.health;
  
  // Create boss entrance effect
  for (let i = 0; i < 50; i++) {
    createParticle(canvas.width/2, canvas.height/2, '#ff0000', 5, 60);
  }
}

function updateBoss() {
  if (!boss) return;
  
  // Boss movement patterns
  boss.moveTimer++;
  
  switch (boss.pattern) {
    case 'circle':
      // Move in a circular pattern
      const angle = boss.moveTimer * 0.02;
      const radius = 100;
      boss.x = canvas.width/2 + Math.cos(angle) * radius - boss.width/2;
      boss.y = canvas.height/3 + Math.sin(angle) * radius - boss.height/2;
      break;
      
    case 'spawn':
      // Move side to side and spawn enemies
      boss.x = canvas.width/2 + Math.sin(boss.moveTimer * 0.01) * 200 - boss.width/2;
      boss.y = canvas.height/4 - boss.height/2;
      
      // Spawn enemies periodically
      if (boss.moveTimer % 120 === 0) {
        spawnEnemy();
      }
      break;
      
    case 'laser':
      // Stay in center and fire lasers
      boss.x = canvas.width/2 - boss.width/2;
      boss.y = canvas.height/4 - boss.height/2;
      break;
  }
  
  // Boss shooting
  boss.lastShot++;
  if (boss.lastShot > (1 / boss.fireRate) * 60) {
    fireBossWeapon();
    boss.lastShot = 0;
  }
  
  // Boss phase changes
  const healthPercent = boss.health / boss.maxHealth;
  if (healthPercent <= 0.5 && boss.phase === 1) {
    boss.phase = 2;
    boss.fireRate *= 1.5;
    // Phase 2 effect
    for (let i = 0; i < 30; i++) {
      createParticle(boss.x + boss.width/2, boss.y + boss.height/2, '#ff0000', 3, 40);
    }
  }
  
  if (healthPercent <= 0.25 && boss.phase === 2) {
    boss.phase = 3;
    boss.fireRate *= 2;
    // Phase 3 effect
    for (let i = 0; i < 50; i++) {
      createParticle(boss.x + boss.width/2, boss.y + boss.height/2, '#ff0000', 4, 50);
    }
  }
}

function fireBossWeapon() {
  if (!boss) return;
  
  const bossType = BOSS_TYPES[boss.type];
  
  switch (boss.pattern) {
    case 'circle':
      // Fire in all directions
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const speed = 4;
        enemyBullets.push({
          x: boss.x + boss.width/2 - 4,
          y: boss.y + boss.height/2 - 4,
          w: 8, h: 8,
          dx: Math.cos(angle) * speed,
          dy: Math.sin(angle) * speed
        });
      }
      break;
      
    case 'spawn':
      // Fire at player
      const dx = player.x - boss.x;
      const dy = player.y - boss.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance > 0) {
        const speed = 5;
        enemyBullets.push({
          x: boss.x + boss.width/2 - 4,
          y: boss.y + boss.height/2 - 4,
          w: 8, h: 8,
          dx: (dx / distance) * speed,
          dy: (dy / distance) * speed
        });
      }
      break;
      
    case 'laser':
      // Fire laser beam
      const laserWidth = 20;
      enemyBullets.push({
        x: boss.x + boss.width/2 - laserWidth/2,
        y: boss.y + boss.height/2,
        w: laserWidth,
        h: canvas.height,
        dx: 0,
        dy: 8,
        type: 'laser'
      });
      break;
  }
}

function drawBoss() {
  if (!boss) return;
  
  ctx.save();
  ctx.translate(boss.x + boss.width/2, boss.y + boss.height/2);
  
  const bossType = BOSS_TYPES[boss.type];
  const w = boss.width, h = boss.height;
  
  // Boss hull
  const hullGrad = ctx.createLinearGradient(-w/2, -h/2, w/2, h/2);
  hullGrad.addColorStop(0, '#000');
  hullGrad.addColorStop(0.3, bossType.color);
  hullGrad.addColorStop(0.7, '#fff');
  hullGrad.addColorStop(1, '#000');
  
  ctx.fillStyle = hullGrad;
  ctx.beginPath();
  ctx.moveTo(0, -h/2);
  ctx.lineTo(w/2, -h/4);
  ctx.lineTo(w/2, h/4);
  ctx.lineTo(w/3, h/2);
  ctx.lineTo(0, h/2);
  ctx.lineTo(-w/3, h/2);
  ctx.lineTo(-w/2, h/4);
  ctx.lineTo(-w/2, -h/4);
  ctx.closePath();
  ctx.fill();
  
  // Boss health bar
  const healthPercent = boss.health / boss.maxHealth;
  const barWidth = w;
  const barHeight = 8;
  
  ctx.fillStyle = '#333';
  ctx.fillRect(-barWidth/2, -h/2 - 20, barWidth, barHeight);
  
  ctx.fillStyle = healthPercent > 0.5 ? '#00ff00' : healthPercent > 0.25 ? '#ffff00' : '#ff0000';
  ctx.fillRect(-barWidth/2, -h/2 - 20, barWidth * healthPercent, barHeight);
  
  // Boss name
  ctx.fillStyle = '#fff';
  ctx.font = '12px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(bossType.name, 0, -h/2 - 30);
  
  ctx.restore();
}

// --- Gradius Power-Up System ---
let powerCapsules = [];
const POWER_UP_OPTIONS = [
  { name: 'Speed Up', icon: '⚡', effect: 'speed', maxLevel: 3 },
  { name: 'Missile', icon: '🚀', effect: 'missile', maxLevel: 2 },
  { name: 'Double Shot', icon: '🔫', effect: 'double', maxLevel: 1 },
  { name: 'Laser', icon: '⚡', effect: 'laser', maxLevel: 1 },
  { name: 'Option', icon: '🛸', effect: 'option', maxLevel: 2 },
  { name: 'Force Field', icon: '🛡️', effect: 'forcefield', maxLevel: 1 }
];

// Player power-up levels
let playerPowerUps = {
  speed: 0,
  missile: 0,
  double: 0,
  laser: 0,
  option: 0,
  forcefield: 0
};

// --- Collectibles (Legacy) ---
let collectibles = [];
const COLLECTIBLE_TYPES = [
  { type: 'money', emoji: '💰', value: 50, color: '#ffd700' },
  { type: 'health', emoji: '❤️', value: 75, color: '#ff6b6b' },
  { type: 'bomb', emoji: '💣', value: 200, color: '#ff8800' },
  { type: 'star', emoji: '⭐', value: 150, color: '#ffaa00' },
  { type: 'gem', emoji: '💎', value: 300, color: '#00aaff' }
];

function spawnCollectible(x, y) {
  const collectible = COLLECTIBLE_TYPES[Math.floor(Math.random() * COLLECTIBLE_TYPES.length)];
  collectibles.push({ 
    x, 
    y, 
    w: 24, 
    h: 24, 
    type: collectible.type,
    emoji: collectible.emoji,
    value: collectible.value,
    color: collectible.color,
    floatOffset: Math.random() * Math.PI * 2,
    floatSpeed: 0.05 + Math.random() * 0.05
  });
}

function spawnPowerCapsule(x, y) {
  powerCapsules.push({
    x: x,
    y: y,
    w: 20,
    h: 20,
    collected: false,
    floatOffset: Math.random() * Math.PI * 2,
    floatSpeed: 0.03 + Math.random() * 0.02
  });
}

function updateCollectibles() {
  // Collectibles move from top to bottom
  collectibles.forEach(c => {
    c.y += 1; // Slow movement
    c.floatOffset += c.floatSpeed;
  });
  
  // Remove collectibles that go off screen
  collectibles = collectibles.filter(c => c.y < canvas.height + 30);
  
  // Player collects collectibles
  for (let i = collectibles.length-1; i >= 0; i--) {
    if (rectsCollide(player, collectibles[i])) {
      const c = collectibles[i];
      
      // Apply effects based on type
      switch(c.type) {
        case 'money':
          score += c.value;
          playSoundEffect('collect', c.x, c.y);
          break;
        case 'health':
          lives = Math.min(lives + 1, 5);
          score += c.value;
          playSoundEffect('collect', c.x, c.y);
          break;
        case 'bomb':
          // Clear all enemies on screen
          enemies.forEach(e => score += 50);
          enemies = [];
          score += c.value;
          playSoundEffect('collect', c.x, c.y);
          break;
        case 'star':
          score += c.value;
          playSoundEffect('collect', c.x, c.y);
          break;
        case 'gem':
          score += c.value;
          playSoundEffect('collect', c.x, c.y);
          break;
      }
      
      collectibles.splice(i, 1);
    }
  }
}

function updatePowerCapsules() {
  // Power capsules move from top to bottom
  powerCapsules.forEach(c => {
    c.y += 1;
    c.floatOffset += c.floatSpeed;
  });
  
  // Remove capsules that go off screen
  powerCapsules = powerCapsules.filter(c => c.y < canvas.height + 30);
  
  // Player collects power capsules
  for (let i = powerCapsules.length-1; i >= 0; i--) {
    if (rectsCollide(player, powerCapsules[i]) && !powerCapsules[i].collected) {
      powerCapsules[i].collected = true;
      applyRandomPowerUp();
      powerCapsules.splice(i, 1);
      break; // Only collect one at a time
    }
  }
}

function drawCollectibles() {
  collectibles.forEach(c => {
    ctx.save();
    ctx.translate(c.x + c.w/2, c.y + c.h/2);
    
    // Floating animation
    const floatY = Math.sin(c.floatOffset) * 3;
    ctx.translate(0, floatY);
    
    // Glow effect
    const glowGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 20);
    glowGradient.addColorStop(0, c.color + '40');
    glowGradient.addColorStop(1, 'transparent');
    
    ctx.fillStyle = glowGradient;
    ctx.beginPath();
    ctx.arc(0, 0, 20, 0, Math.PI * 2);
    ctx.fill();
    
    // Emoji
    ctx.font = '20px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(c.emoji, 0, 0);
    
    ctx.restore();
  });
}

function drawPowerCapsules() {
  powerCapsules.forEach(c => {
    ctx.save();
    ctx.translate(c.x + c.w/2, c.y + c.h/2);
    
    // Floating animation
    const floatY = Math.sin(c.floatOffset) * 4;
    ctx.translate(0, floatY);
    
    // Power capsule glow
    const glowGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 25);
    glowGradient.addColorStop(0, '#00ffff80');
    glowGradient.addColorStop(0.5, '#00ffff40');
    glowGradient.addColorStop(1, 'transparent');
    
    ctx.fillStyle = glowGradient;
    ctx.beginPath();
    ctx.arc(0, 0, 25, 0, Math.PI * 2);
    ctx.fill();
    
    // Power capsule body
    const capsuleGradient = ctx.createLinearGradient(-c.w/2, -c.h/2, c.w/2, c.h/2);
    capsuleGradient.addColorStop(0, '#00ffff');
    capsuleGradient.addColorStop(0.5, '#ffffff');
    capsuleGradient.addColorStop(1, '#00ffff');
    
    ctx.fillStyle = capsuleGradient;
    ctx.beginPath();
    ctx.arc(0, 0, c.w/2, 0, Math.PI * 2);
    ctx.fill();
    
    // Capsule outline
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.shadowColor = '#00ffff';
    ctx.shadowBlur = 8;
    ctx.stroke();
    ctx.shadowBlur = 0;
    
    // Power symbol
    ctx.fillStyle = '#ffffff';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('P', 0, 0);
    
    ctx.restore();
  });
}

// --- Power-Ups (Legacy) ---
let powerUps = [];
const POWERUP_TYPES = ['weapon', 'shield'];
function spawnPowerUp(x, y) {
  const type = POWERUP_TYPES[Math.floor(Math.random() * POWERUP_TYPES.length)];
  powerUps.push({ x, y, w: 18, h: 18, type });
}
function updatePowerUps() {
  // Power-ups stay in fixed positions - no horizontal movement
  // Player collects power-up
  for (let i = powerUps.length-1; i >= 0; i--) {
    if (rectsCollide(player, powerUps[i])) {
      if (powerUps[i].type === 'weapon') {
        player.weaponLevel = Math.min((player.weaponLevel||1)+1, 3);
      } else if (powerUps[i].type === 'shield') {
        player.shield = 180; // frames of shield
      }
      powerUps.splice(i,1);
    }
  }
}
function drawPowerUps() {
  for (let p of powerUps) {
    ctx.save();
    ctx.translate(p.x + p.w/2, p.y + p.h/2);
    if (p.type === 'weapon') {
      ctx.strokeStyle = '#ff0';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0,0,8,0,Math.PI*2);
      ctx.stroke();
      ctx.fillStyle = '#ff0';
      ctx.fillRect(-4,-4,8,8);
    } else if (p.type === 'shield') {
      ctx.strokeStyle = '#0ff';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0,0,8,0,Math.PI*2);
      ctx.stroke();
      ctx.fillStyle = '#0ff';
      ctx.beginPath();
      ctx.arc(0,0,4,0,Math.PI*2);
      ctx.fill();
    }
    ctx.restore();
  }
}

// --- Enemy Types ---
function spawnEnemy() {
  const mission = missionData[currentMission - 1];
  const availableTypes = mission.enemyTypes;
  const enemyType = availableTypes[Math.floor(Math.random() * availableTypes.length)];
  const enemyData = ENEMY_TYPES[enemyType];
  
  const enemy = {
    x: Math.random() * (canvas.width - 40) + 20,
    y: -50,
    width: enemyData.size,
    height: enemyData.size,
    speed: enemyData.speed,
    health: enemyData.health,
    maxHealth: enemyData.health,
    points: enemyData.points,
    type: enemyType,
    fireRate: enemyData.fireRate,
    lastShot: 0,
    behavior: enemyData.behavior,
    angle: 0,
    color: enemyData.color
  };
  
  enemies.push(enemy);
}
let enemyBullets = [];
function updateEnemies() {
  // Cap max enemies
  if (enemies.length > MAX_ENEMIES) return;
  
  // Enemies move downward with slight horizontal movement
  for (let e of enemies) {
    // Initialize enemy properties if not set
    if (!e.movementSpeed) {
      e.movementSpeed = e.speed || 1 + Math.random() * 2;
    }
    
    // Move downward
    e.y += e.movementSpeed;
    
    // Add slight horizontal movement for variety
    if (!e.horizontalSpeed) {
      e.horizontalSpeed = (Math.random() - 0.5) * 1; // Slight left/right movement
    }
    
    e.x += e.horizontalSpeed;
    
    // Keep enemies within screen bounds horizontally
    if (e.x < -e.width) {
      e.x = -e.width;
      e.horizontalSpeed = Math.abs(e.horizontalSpeed); // Bounce right
    } else if (e.x > canvas.width) {
      e.x = canvas.width;
      e.horizontalSpeed = -Math.abs(e.horizontalSpeed); // Bounce left
    }
    
    // Update life timer
    e.lifeTimer = (e.lifeTimer || 0) + 1;
    
    // Enemy shooting based on fire rate
    if (e.fireRate && e.fireRate > 0) {
      e.lastShot = (e.lastShot || 0) + 1;
      if (e.lastShot > (1 / e.fireRate) * 60) { // Convert fire rate to frames
        // Calculate direction toward player for shooting
        const shootDx = player.x - e.x;
        const shootDy = player.y - e.y;
        const shootDistance = Math.sqrt(shootDx * shootDx + shootDy * shootDy);
        
        if (shootDistance > 0) {
          const bulletSpeed = 5; // Faster bullets
          const bulletDx = (shootDx / shootDistance) * bulletSpeed;
          const bulletDy = (shootDy / shootDistance) * bulletSpeed;
          
          // Create multiple bullets for more challenging gameplay
          for (let i = 0; i < 2; i++) {
            const spread = (i - 0.5) * 0.3; // Spread bullets slightly
            const spreadDx = bulletDx + spread * bulletDy;
            const spreadDy = bulletDy - spread * bulletDx;
            
            enemyBullets.push({ 
              x: e.x + e.width/2 - 4, 
              y: e.y + e.height/2 - 4, 
              w: 8, 
              h: 8, 
              speed: bulletSpeed,
              dx: spreadDx,
              dy: spreadDy
            });
          }
        }
        e.lastShot = 0;
      }
    }
  }
  
  // Remove enemies that go too far off screen
  enemies = enemies.filter(e => 
    e.x > -e.width * 2 && e.x < canvas.width + e.width * 2 && 
    e.y > -e.height * 2 && e.y < canvas.height + e.height * 2
  );
}
function updateEnemyBullets() {
  enemyBullets.forEach(b => {
    b.x += b.dx || 0;
    b.y += (b.dy || ENEMY_BULLET_SPEED);
  });
  enemyBullets = enemyBullets.filter(b => b.y < canvas.height + 20 && b.x > -20 && b.x < canvas.width + 20);
}
function drawEnemyBullets() {
  enemyBullets.forEach(b => {
    ctx.save();
    ctx.translate(b.x + b.w/2, b.y + b.h/2);
    
    // Classic Gradius enemy bullets - simple red circles
    ctx.fillStyle = '#ff0000';
    ctx.beginPath();
    ctx.arc(0, 0, b.w/2, 0, Math.PI * 2);
    ctx.fill();
    
    // White outline
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    ctx.restore();
  });
}

function resetGame() {
  player = { x: canvas.width/2 - 24, y: canvas.height - 80, width: 48, height: 36, speed: 4, weaponLevel: 1, shield: 0 };
  bullets = [];
  enemies = [];
  enemyBullets = [];
  score = 0;
  lives = 3;
  gameTime = 0;
  difficulty = 1;
  bossSpawned = false;
  boss = null;
  gamePaused = false;
  enemyTimer = 60;
  powerUpMenu = false;
  selectedPowerUp = 0;
  options = [];
  particles = [];
  soundEffects = [];
  powerUps = [];
  collectibles = [];
  powerCapsules = [];
  
  // Reset mission system
  currentMission = 1;
  stageProgress = 0;
  stageGoal = 20;
  missionCompleted = false;
  
  // Reset player progression
  playerLevel = 1;
  playerXP = 0;
  xpToNextLevel = 100;
  skillPoints = 0;
  credits = 0;
  
  // Initialize mission data if not already done
  if (missionData.length === 0) {
    generateMissions();
  }
  
  // Start first mission
  startMission(1);
  
  // Show game UI
  showGameUI();
  
  // Update displays
  scoreDisplay.textContent = 'Score: ' + score;
  livesDisplay.textContent = 'Lives: ' + lives;
  weaponLevelDisplay.textContent = 'Weapon: Level ' + player.weaponLevel;
  difficultyDisplay.textContent = 'Difficulty: ' + difficulty;
  timeDisplay.textContent = 'Time: ' + Math.floor(gameTime/60) + ':' + (gameTime%60).toString().padStart(2, '0');
  
  // Start auto-save
  startAutoSave();
}

function update() {
  if (gamePaused) return;
  
  gameTime++;
  
  // Update player
  if (keys['ArrowUp'] && player.y > 0) player.y -= player.speed;
  if (keys['ArrowDown'] && player.y < canvas.height - player.height) player.y += player.speed;
  if (keys['ArrowLeft'] && player.x > 0) player.x -= player.speed;
  if (keys['ArrowRight'] && player.x < canvas.width - player.width) player.x += player.speed;
  
  // Touch controls for iOS
  if (isTouchDevice && isTouching) {
    const targetX = touchX - player.width / 2;
    const targetY = touchY - player.height / 2;
    player.x = Math.max(0, Math.min(canvas.width - player.width, targetX));
    player.y = Math.max(0, Math.min(canvas.height - player.height, targetY));
  }
  
  // Auto-shoot for touch devices
  if (isTouchDevice && isTouching) {
    if (gameTime % 10 === 0) shoot();
  }
  
  // Rapid fire
  if (keys[' '] || fireHeld) {
    if (gameTime % 5 === 0) shoot();
  }
  
  // Update bullets
  bullets.forEach(bullet => {
    bullet.y -= bullet.speed;
  });
  bullets = bullets.filter(bullet => bullet.y > -10);
  
  // Bullet collision detection
  for (let i = bullets.length - 1; i >= 0; i--) {
    const bullet = bullets[i];
    for (let j = enemies.length - 1; j >= 0; j--) {
      const enemy = enemies[j];
      if (rectsCollide(bullet, enemy)) {
        // Enemy hit
        enemy.health = (enemy.health || 1) - 1;
        
        // Create explosion particles
        for (let k = 0; k < 5; k++) {
          createParticle(enemy.x + enemy.width/2, enemy.y + enemy.height/2, '#ff4444', 2, 20);
        }
        
        // Remove bullet
        bullets.splice(i, 1);
        
        // Check if enemy is destroyed
        if (enemy.health <= 0) {
          // Award points
          score += enemy.points || 10;
          
          // Update mission progress
          stageProgress++;
          
          // Create more explosion particles
          for (let k = 0; k < 10; k++) {
            createParticle(enemy.x + enemy.width/2, enemy.y + enemy.height/2, '#ff0000', 3, 30);
          }
          
          // Remove enemy
          enemies.splice(j, 1);
          
          // Play explosion sound effect
          playSoundEffect('hit', enemy.x + enemy.width/2, enemy.y + enemy.height/2);
          
          // Chance to drop collectible
          if (Math.random() < COLLECTIBLE_DROP_RATE) {
            spawnCollectible(enemy.x + enemy.width/2, enemy.y + enemy.height/2);
          }
          
          // Chance to drop power capsule
          if (Math.random() < POWERUP_DROP_RATE) {
            spawnPowerCapsule(enemy.x + enemy.width/2, enemy.y + enemy.height/2);
          }
        }
        
        break; // Bullet can only hit one enemy
      }
    }
  }
  
  // Player collision with enemies
  for (let i = enemies.length - 1; i >= 0; i--) {
    const enemy = enemies[i];
    if (rectsCollide(player, enemy)) {
      // Player hit by enemy
      lives--;
      
      // Create explosion particles
      for (let k = 0; k < 8; k++) {
        createParticle(player.x + player.width/2, player.y + player.height/2, '#ff0000', 2, 25);
      }
      
      // Remove enemy
      enemies.splice(i, 1);
      
      // Play hit sound effect
      playSoundEffect('hit', player.x + player.width/2, player.y + player.height/2);
      
      // Check game over
      if (lives <= 0) {
        endGame();
        return;
      }
    }
  }
  
  // Player collision with enemy bullets
  for (let i = enemyBullets.length - 1; i >= 0; i--) {
    const bullet = enemyBullets[i];
    if (rectsCollide(player, bullet)) {
      // Player hit by enemy bullet
      lives--;
      
      // Create explosion particles
      for (let k = 0; k < 5; k++) {
        createParticle(player.x + player.width/2, player.y + player.height/2, '#ff0000', 2, 20);
      }
      
      // Remove bullet
      enemyBullets.splice(i, 1);
      
      // Play hit sound effect
      playSoundEffect('hit', player.x + player.width/2, player.y + player.height/2);
      
      // Check game over
      if (lives <= 0) {
        endGame();
        return;
      }
    }
  }
  
  // Update enemy bullets
  updateEnemyBullets();
  
  // Update enemies
  updateEnemies();
  
  // Update collectibles
  updateCollectibles();
  updatePowerCapsules();
  updatePowerUps();
  
  // Update drones
  updateDrones();
  
  // Update particles
  updateParticles();
  
  // Update sound effects
  updateSoundEffects();
  
  // Update stars
  updateStars();
  
  // Spawn enemies
  if (gameTime % enemyTimer === 0) {
    spawnEnemy();
    enemyTimer = Math.max(20, 60 - difficulty * 10);
  }
  
  // Spawn collectibles
  if (gameTime % 300 === 0) {
    spawnCollectible(Math.random() * (canvas.width - 20) + 10, -20);
  }
  
  // Spawn power capsules
  if (gameTime % 600 === 0) {
    spawnPowerCapsule(Math.random() * (canvas.width - 20) + 10, -20);
  }
  
  // Check mission completion
  if (stageProgress >= stageGoal && !missionCompleted) {
    const mission = missionData[currentMission - 1];
    if (mission.bossType && !bossSpawned) {
      spawnBoss();
    } else if (!mission.bossType || (boss && boss.health <= 0)) {
      completeMission();
    }
  }
  
  // Boss collision detection
  if (boss) {
    // Player bullets hitting boss
    for (let i = bullets.length - 1; i >= 0; i--) {
      const bullet = bullets[i];
      if (rectsCollide(bullet, boss)) {
        // Boss hit
        boss.health--;
        bossHealth = boss.health;
        
        // Create explosion particles
        for (let k = 0; k < 8; k++) {
          createParticle(bullet.x, bullet.y, '#ff0000', 3, 25);
        }
        
        // Remove bullet
        bullets.splice(i, 1);
        
        // Check if boss is defeated
        if (boss.health <= 0) {
          // Boss defeated
          score += 1000;
          
          // Create massive explosion
          for (let k = 0; k < 100; k++) {
            createParticle(boss.x + boss.width/2, boss.y + boss.height/2, '#ff0000', 5, 60);
          }
          
          // Remove boss
          boss = null;
          bossSpawned = false;
          
          // Play explosion sound effect
          playSoundEffect('hit', boss.x + boss.width/2, boss.y + boss.height/2);
          
          // Check mission completion
          if (stageProgress >= stageGoal && !missionCompleted) {
            completeMission();
          }
        }
        
        break; // Bullet can only hit boss once
      }
    }
    
    // Player collision with boss
    if (rectsCollide(player, boss)) {
      // Player hit by boss
      lives--;
      
      // Create explosion particles
      for (let k = 0; k < 10; k++) {
        createParticle(player.x + player.width/2, player.y + player.height/2, '#ff0000', 3, 30);
      }
      
      // Play hit sound effect
      playSoundEffect('hit', player.x + player.width/2, player.y + player.height/2);
      
      // Check game over
      if (lives <= 0) {
        endGame();
        return;
      }
    }
  }
  
  // Update UI
  updateMissionUI();
  updateProgressionUI();
  
  // Check achievements
  checkAchievements();
  
  // Update difficulty
  difficulty = 1 + Math.floor(gameTime / 1000);
  
  // Check for boss spawn
  if (gameTime > 3000 && !bossSpawned) {
    spawnBoss();
  }
  
  // Update boss
  if (boss) {
    updateBoss();
  }
}

function draw() {
  // Clear canvas
  ctx.fillStyle = '#0a0a23';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Draw stars
  drawStars();
  
  // Draw player
  drawPlayerShip();
  
  // Draw enemies
  drawEnemies();
  
  // Draw bullets
  drawBullets();
  drawEnemyBullets();
  
  // Draw collectibles
  drawCollectibles();
  drawPowerCapsules();
  drawPowerUps();
  
  // Draw drones
  drawDrones();
  
  // Draw particles
  drawParticles();
  
  // Draw sound effects
  drawSoundEffects();
  
  // Draw boss
  if (boss) {
    drawBoss();
  }
  
  // Draw power-up menu
  if (powerUpMenu) {
    drawPowerUpMenu();
  }
}

function gameLoop() {
  if (gameState === 'playing') {
    update();
    draw();
  }
  requestAnimationFrame(gameLoop);
}

// --- UI Management ---
function showGameUI() {
  document.getElementById('mission-ui').classList.remove('hidden');
  document.getElementById('progression-ui').classList.remove('hidden');
  hud.classList.remove('hidden');
  document.getElementById('top-bar').classList.remove('hidden');
}

function hideGameUI() {
  document.getElementById('mission-ui').classList.add('hidden');
  document.getElementById('progression-ui').classList.add('hidden');
  hud.classList.add('hidden');
  document.getElementById('top-bar').classList.add('hidden');
}

function drawBullets() {
  bullets.forEach(b => {
    ctx.save();
    ctx.translate(b.x + b.w/2, b.y + b.h/2);
    
    const bulletType = b.type || 'normal';
    
    if (bulletType === 'laser') {
      // Laser beam effect
      const laserGradient = ctx.createLinearGradient(0, -b.h/2, 0, b.h/2);
      laserGradient.addColorStop(0, '#ff0000');
      laserGradient.addColorStop(0.5, '#ffffff');
      laserGradient.addColorStop(1, '#ff0000');
      
      ctx.fillStyle = laserGradient;
      ctx.shadowColor = '#ff0000';
      ctx.shadowBlur = 8;
      ctx.fillRect(-b.w/2, -b.h/2, b.w, b.h);
      ctx.shadowBlur = 0;
      
      // Laser trail
      ctx.strokeStyle = '#ff0000';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, b.h/2 + 8);
      ctx.lineTo(0, b.h/2);
      ctx.stroke();
      
    } else if (bulletType === 'missile') {
      // Missile with tracking effect
      const missileGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, b.w/2);
      missileGradient.addColorStop(0, '#ffff00');
      missileGradient.addColorStop(0.5, '#ff8800');
      missileGradient.addColorStop(1, '#ff0000');
      
      ctx.fillStyle = missileGradient;
      ctx.shadowColor = '#ff8800';
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.arc(0, 0, b.w/2, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      
      // Missile trail
      ctx.strokeStyle = '#ff8800';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, b.h/2 + 6);
      ctx.lineTo(0, b.h/2);
      ctx.stroke();
      
    } else if (bulletType === 'drone') {
      // Drone bullet
      const droneGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, b.w/2);
      droneGradient.addColorStop(0, '#00ffff');
      droneGradient.addColorStop(0.5, '#0088ff');
      droneGradient.addColorStop(1, '#0044ff');
      
      ctx.fillStyle = droneGradient;
      ctx.shadowColor = '#00ffff';
      ctx.shadowBlur = 4;
      ctx.beginPath();
      ctx.arc(0, 0, b.w/2, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      
    } else {
      // Normal bullet
      const bulletGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, b.w/2);
      bulletGradient.addColorStop(0, '#ffffff');
      bulletGradient.addColorStop(0.5, '#00ffff');
      bulletGradient.addColorStop(1, 'transparent');
      
      ctx.fillStyle = bulletGradient;
      ctx.beginPath();
      ctx.arc(0, 0, b.w/2, 0, Math.PI * 2);
      ctx.fill();
      
      // Bullet trail
      ctx.strokeStyle = '#00ffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, b.h/2 + 4);
      ctx.lineTo(0, b.h/2);
      ctx.stroke();
    }
    
    ctx.restore();
  });
}

function drawPlayerShip() {
  ctx.save();
  ctx.translate(player.x + player.w/2, player.y + player.h/2);
  const w = player.w, h = player.h;

  // --- Main hull ---
  const hullGrad = ctx.createLinearGradient(-w/2, -h/2, w/2, h/2);
  hullGrad.addColorStop(0, '#0a1a2f');
  hullGrad.addColorStop(0.2, '#1e3a5c');
  hullGrad.addColorStop(0.5, '#3fd0ff');
  hullGrad.addColorStop(0.8, '#1e3a5c');
  hullGrad.addColorStop(1, '#0a1a2f');
  ctx.fillStyle = hullGrad;
  ctx.beginPath();
  ctx.moveTo(0, -h/2); // nose
  ctx.lineTo(-w/2.2, h/4);
  ctx.lineTo(-w/3, h/2.5);
  ctx.lineTo(-w/8, h/2);
  ctx.lineTo(w/8, h/2);
  ctx.lineTo(w/3, h/2.5);
  ctx.lineTo(w/2.2, h/4);
  ctx.closePath();
  ctx.fill();

  // --- Layered armor plates ---
  ctx.save();
  ctx.globalAlpha = 0.18;
  ctx.fillStyle = '#b3e6ff';
  ctx.beginPath();
  ctx.moveTo(0, -h/2.2);
  ctx.lineTo(-w/4, 0);
  ctx.lineTo(0, h/3);
  ctx.lineTo(w/4, 0);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // --- Panel lines and vents ---
  ctx.strokeStyle = 'rgba(255,255,255,0.13)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, -h/2);
  ctx.lineTo(0, h/2);
  ctx.moveTo(-w/4, -h/8);
  ctx.lineTo(w/4, -h/8);
  ctx.moveTo(-w/6, h/8);
  ctx.lineTo(w/6, h/8);
  ctx.moveTo(-w/8, h/3);
  ctx.lineTo(w/8, h/3);
  ctx.stroke();

  // --- Vents ---
  ctx.save();
  ctx.strokeStyle = '#222';
  ctx.lineWidth = 1.2;
  for (let i = -1; i <= 1; i += 2) {
    ctx.beginPath();
    ctx.moveTo(i*w/6, h/6);
    ctx.lineTo(i*w/6, h/4);
    ctx.stroke();
  }
  ctx.restore();

  // --- Cockpit glass with highlights ---
  const cockpitGrad = ctx.createRadialGradient(0, -h/6, 2, 0, -h/6, h/7);
  cockpitGrad.addColorStop(0, '#b3e6ff');
  cockpitGrad.addColorStop(0.7, '#1e90ff');
  cockpitGrad.addColorStop(1, 'rgba(30,144,255,0.1)');
  ctx.fillStyle = cockpitGrad;
  ctx.beginPath();
  ctx.ellipse(0, -h/6, w/8, h/7, 0, 0, Math.PI*2);
  ctx.fill();
  ctx.strokeStyle = '#b3e6ff';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  // Reflection highlight
  ctx.save();
  ctx.globalAlpha = 0.25;
  ctx.strokeStyle = '#fff';
  ctx.beginPath();
  ctx.ellipse(0, -h/6, w/16, h/20, Math.PI/4, 0, Math.PI);
  ctx.stroke();
  ctx.restore();
  // Pilot silhouette
  ctx.save();
  ctx.globalAlpha = 0.18;
  ctx.fillStyle = '#222';
  ctx.beginPath();
  ctx.ellipse(0, -h/6+2, w/24, h/18, 0, 0, Math.PI*2);
  ctx.fill();
  ctx.restore();

  // --- Engine glow with rings ---
  const engineGrad = ctx.createRadialGradient(0, h/2, 2, 0, h/2, w/5);
  engineGrad.addColorStop(0, '#fffbe6');
  engineGrad.addColorStop(0.3, '#ffe066');
  engineGrad.addColorStop(1, 'rgba(255,255,0,0)');
  ctx.save();
  ctx.globalAlpha = 0.7;
  ctx.fillStyle = engineGrad;
  ctx.beginPath();
  ctx.ellipse(0, h/2, w/6, h/10, 0, 0, Math.PI*2);
  ctx.fill();
  // Engine rings
  ctx.globalAlpha = 0.18;
  ctx.strokeStyle = '#ffe066';
  for (let r = 1; r <= 2; r++) {
    ctx.beginPath();
    ctx.ellipse(0, h/2, w/8*r, h/18*r, 0, 0, Math.PI*2);
    ctx.stroke();
  }
  ctx.restore();

  // --- Side thrusters with animated exhaust ---
  ctx.save();
  ctx.globalAlpha = 0.5;
  ctx.fillStyle = '#00fff7';
  ctx.beginPath();
  ctx.ellipse(-w/4, h/2.5, w/16, h/16, 0, 0, Math.PI*2);
  ctx.ellipse(w/4, h/2.5, w/16, h/16, 0, 0, Math.PI*2);
  ctx.fill();
  // Animated exhaust
  ctx.globalAlpha = 0.18 + 0.12*Math.sin(Date.now()*0.04);
  ctx.fillStyle = '#3fd0ff';
  ctx.beginPath();
  ctx.ellipse(-w/4, h/2.5+8, w/24, h/12, 0, 0, Math.PI*2);
  ctx.ellipse(w/4, h/2.5+8, w/24, h/12, 0, 0, Math.PI*2);
  ctx.fill();
  ctx.restore();

  // --- Wing edge lights and sensors ---
  ctx.save();
  ctx.strokeStyle = '#00fff7';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-w/2.2, h/4);
  ctx.lineTo(-w/3, h/2.5);
  ctx.moveTo(w/2.2, h/4);
  ctx.lineTo(w/3, h/2.5);
  ctx.stroke();
  // Antenna/sensor
  ctx.globalAlpha = 0.7;
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(0, -h/2);
  ctx.lineTo(0, -h/2-10);
  ctx.stroke();
  ctx.restore();

  // --- Weapon pods (sci-fi, glowing tips) ---
  ctx.save();
  ctx.fillStyle = '#ff4444';
  ctx.shadowColor = '#ff4444';
  ctx.shadowBlur = 8;
  ctx.fillRect(-w/16-2, -h/2-8, 6, 12);
  ctx.fillRect(w/16-4, -h/2-8, 6, 12);
  // Glowing tips
  ctx.globalAlpha = 0.7;
  ctx.fillStyle = '#fffbe6';
  ctx.fillRect(-w/16-1, -h/2-8, 4, 4);
  ctx.fillRect(w/16-3, -h/2-8, 4, 4);
  ctx.restore();

  // --- Shield effect ---
  if (player.shield > 0) {
    ctx.save();
    ctx.globalAlpha = 0.25 + 0.15*Math.sin(Date.now()*0.01);
    ctx.strokeStyle = '#00fff7';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(0, 0, w/2+8, 0, Math.PI*2);
    ctx.stroke();
    // Shield ring
    ctx.globalAlpha = 0.12;
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.arc(0, 0, w/2+16, 0, Math.PI*2);
    ctx.stroke();
    ctx.restore();
  }

  ctx.restore();
}

function drawEnemies() {
  for (let e of enemies) {
    ctx.save();
    ctx.translate(e.x + e.width/2, e.y + e.height/2);
    
    // Draw based on enemy type
    switch (e.type) {
      case 'scout':
        drawScoutEnemy(e);
        break;
      case 'interceptor':
        drawInterceptorEnemy(e);
        break;
      case 'bomber':
        drawBomberEnemy(e);
        break;
      case 'fighter':
        drawFighterEnemy(e);
        break;
      case 'destroyer':
        drawDestroyerEnemy(e);
        break;
      default:
        drawBasicEnemy(e);
        break;
    }
    
    ctx.restore();
  }
}

// --- Enemy Drawing Functions ---
function drawScoutEnemy(e) {
  const w = e.width, h = e.height;
  
  // Main hull - small and fast
  const hullGrad = ctx.createLinearGradient(-w/2, -h/2, w/2, h/2);
  hullGrad.addColorStop(0, '#2a2a2a');
  hullGrad.addColorStop(0.3, '#b22222');
  hullGrad.addColorStop(0.7, '#ff4444');
  hullGrad.addColorStop(1, '#2a2a2a');
  ctx.fillStyle = hullGrad;
  ctx.beginPath();
  ctx.moveTo(0, -h/2);
  ctx.lineTo(w/2.2, 0);
  ctx.lineTo(w/3, h/4);
  ctx.lineTo(0, h/2);
  ctx.lineTo(-w/3, h/4);
  ctx.lineTo(-w/2.2, 0);
  ctx.closePath();
  ctx.fill();
  
  // Engine glow
  const pulse = 0.7 + 0.3*Math.sin(Date.now()*0.1);
  ctx.fillStyle = `rgba(255,68,68,${0.5 * pulse})`;
  ctx.beginPath();
  ctx.arc(0, h/2 + 2, w/6, 0, Math.PI * 2);
  ctx.fill();
}

function drawInterceptorEnemy(e) {
  const w = e.width, h = e.height;
  
  // Main hull - medium size
  const hullGrad = ctx.createLinearGradient(-w/2, -h/2, w/2, h/2);
  hullGrad.addColorStop(0, '#2a2a2a');
  hullGrad.addColorStop(0.3, '#ff8844');
  hullGrad.addColorStop(0.7, '#ffaa44');
  hullGrad.addColorStop(1, '#2a2a2a');
  ctx.fillStyle = hullGrad;
  ctx.beginPath();
  ctx.moveTo(0, -h/2);
  ctx.lineTo(w/2.5, -h/4);
  ctx.lineTo(w/2, h/8);
  ctx.lineTo(w/2.5, h/4);
  ctx.lineTo(0, h/2);
  ctx.lineTo(-w/2.5, h/4);
  ctx.lineTo(-w/2, h/8);
  ctx.lineTo(-w/2.5, -h/4);
  ctx.closePath();
  ctx.fill();
  
  // Weapon ports
  ctx.fillStyle = '#ff0000';
  ctx.beginPath();
  ctx.arc(-w/4, 0, w/12, 0, Math.PI * 2);
  ctx.arc(w/4, 0, w/12, 0, Math.PI * 2);
  ctx.fill();
}

function drawBomberEnemy(e) {
  const w = e.width, h = e.height;
  
  // Main hull - large and slow
  const hullGrad = ctx.createLinearGradient(-w/2, -h/2, w/2, h/2);
  hullGrad.addColorStop(0, '#1a1a1a');
  hullGrad.addColorStop(0.3, '#8b0000');
  hullGrad.addColorStop(0.7, '#ff0000');
  hullGrad.addColorStop(1, '#1a1a1a');
  ctx.fillStyle = hullGrad;
  ctx.beginPath();
  ctx.moveTo(0, -h/2);
  ctx.lineTo(w/2, -h/3);
  ctx.lineTo(w/2, h/3);
  ctx.lineTo(0, h/2);
  ctx.lineTo(-w/2, h/3);
  ctx.lineTo(-w/2, -h/3);
  ctx.closePath();
  ctx.fill();
  
  // Bomb bay
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.rect(-w/4, -h/6, w/2, h/3);
  ctx.fill();
  
  // Engine glow
  const pulse = 0.6 + 0.4*Math.sin(Date.now()*0.08);
  ctx.fillStyle = `rgba(255,0,0,${0.7 * pulse})`;
  ctx.beginPath();
  ctx.arc(-w/3, h/2 + 3, w/8, 0, Math.PI * 2);
  ctx.arc(w/3, h/2 + 3, w/8, 0, Math.PI * 2);
  ctx.fill();
}

function drawFighterEnemy(e) {
  const w = e.width, h = e.height;
  
  // Main hull - sleek design
  const hullGrad = ctx.createLinearGradient(-w/2, -h/2, w/2, h/2);
  hullGrad.addColorStop(0, '#222');
  hullGrad.addColorStop(0.3, '#8844ff');
  hullGrad.addColorStop(0.7, '#aa66ff');
  hullGrad.addColorStop(1, '#222');
  ctx.fillStyle = hullGrad;
  ctx.beginPath();
  ctx.moveTo(0, -h/2);
  ctx.lineTo(w/2.2, -h/6);
  ctx.lineTo(w/2, h/6);
  ctx.lineTo(w/2.2, h/3);
  ctx.lineTo(0, h/2);
  ctx.lineTo(-w/2.2, h/3);
  ctx.lineTo(-w/2, h/6);
  ctx.lineTo(-w/2.2, -h/6);
  ctx.closePath();
  ctx.fill();
  
  // Energy core
  const pulse = 0.8 + 0.2*Math.sin(Date.now()*0.12);
  ctx.fillStyle = `rgba(255,255,255,${0.8 * pulse})`;
  ctx.beginPath();
  ctx.arc(0, 0, w/8, 0, Math.PI * 2);
  ctx.fill();
}

function drawDestroyerEnemy(e) {
  const w = e.width, h = e.height;
  
  // Main hull - massive and intimidating
  const hullGrad = ctx.createLinearGradient(-w/2, -h/2, w/2, h/2);
  hullGrad.addColorStop(0, '#000');
  hullGrad.addColorStop(0.3, '#8b0000');
  hullGrad.addColorStop(0.7, '#ff4488');
  hullGrad.addColorStop(1, '#000');
  ctx.fillStyle = hullGrad;
  ctx.beginPath();
  ctx.moveTo(0, -h/2);
  ctx.lineTo(w/2, -h/4);
  ctx.lineTo(w/2, h/4);
  ctx.lineTo(w/3, h/2);
  ctx.lineTo(0, h/2);
  ctx.lineTo(-w/3, h/2);
  ctx.lineTo(-w/2, h/4);
  ctx.lineTo(-w/2, -h/4);
  ctx.closePath();
  ctx.fill();
  
  // Heavy weapon systems
  ctx.fillStyle = '#ff0000';
  ctx.beginPath();
  ctx.arc(-w/3, -h/6, w/10, 0, Math.PI * 2);
  ctx.arc(w/3, -h/6, w/10, 0, Math.PI * 2);
  ctx.arc(-w/3, h/6, w/10, 0, Math.PI * 2);
  ctx.arc(w/3, h/6, w/10, 0, Math.PI * 2);
  ctx.fill();
  
  // Central cannon
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.rect(-w/8, -h/4, w/4, h/2);
  ctx.fill();
}

// --- Safe arc helper ---
function safeArc(ctx, x, y, r, a1, a2) {
  if (r > 0) ctx.arc(x, y, r, a1, a2);
}

function drawBasicEnemy(e) {
  const w = e.width || e.w, h = e.height || e.h;

  // --- Main hull ---
  const hullGrad = ctx.createLinearGradient(-w/2, -h/2, w/2, h/2);
  hullGrad.addColorStop(0, '#2a2a2a');
  hullGrad.addColorStop(0.3, '#b22222');
  hullGrad.addColorStop(0.7, '#ff4444');
  hullGrad.addColorStop(1, '#2a2a2a');
  ctx.fillStyle = hullGrad;
  ctx.beginPath();
  ctx.moveTo(0, -h/2);
  ctx.lineTo(w/2.2, 0);
  ctx.lineTo(w/3, h/4);
  ctx.lineTo(0, h/2);
  ctx.lineTo(-w/3, h/4);
  ctx.lineTo(-w/2.2, 0);
  ctx.closePath();
  ctx.fill();

  // --- Layered armor ---
  ctx.save();
  ctx.globalAlpha = 0.13;
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.moveTo(0, -h/2.5);
  ctx.lineTo(w/4, 0);
  ctx.lineTo(0, h/4);
  ctx.lineTo(-w/4, 0);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // --- Panel lines and vents ---
  ctx.strokeStyle = 'rgba(255,255,255,0.10)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(0, -h/2);
  ctx.lineTo(0, h/2);
  ctx.moveTo(-w/4, 0);
  ctx.lineTo(w/4, 0);
  ctx.moveTo(-w/6, h/8);
  ctx.lineTo(w/6, h/8);
  ctx.stroke();
  // Vents
  ctx.save();
  ctx.strokeStyle = '#222';
  ctx.lineWidth = 1.1;
  for (let i = -1; i <= 1; i += 2) {
    ctx.beginPath();
    ctx.moveTo(i*w/6, h/8);
    ctx.lineTo(i*w/6, h/4);
    ctx.stroke();
  }
  ctx.restore();

  // --- Glowing core with shield ring ---
  const pulse = 0.7 + 0.3*Math.sin(Date.now()*0.08);
  const minRadius = 2;
  const unclampedCore = w/7*pulse;
  const coreRadius = Math.max(minRadius, unclampedCore);
  const gradRadius = coreRadius;
  const shieldRadius = Math.max(minRadius, w/5);
  // Always use 0 as the start radius for radial gradients
  const coreGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, gradRadius);
  coreGrad.addColorStop(0, '#fff');
  coreGrad.addColorStop(0.5, '#ff4444');
  coreGrad.addColorStop(1, 'rgba(255,68,68,0)');
  ctx.save();
  ctx.globalAlpha = 0.8;
  ctx.fillStyle = coreGrad;
  ctx.beginPath();
  safeArc(ctx, 0, 0, coreRadius, 0, Math.PI*2);
  ctx.fill();
  // Shield ring
  ctx.globalAlpha = 0.18;
  ctx.strokeStyle = '#ff4444';
  ctx.lineWidth = 4;
  ctx.beginPath();
  safeArc(ctx, 0, 0, shieldRadius, 0, Math.PI*2);
  ctx.stroke();
  ctx.restore();

  // --- Side lights and scanning dots ---
  ctx.save();
  ctx.fillStyle = '#00fff7';
  ctx.globalAlpha = 0.5;
  ctx.beginPath();
  safeArc(ctx, -w/3, h/6, w/16, 0, Math.PI*2);
  safeArc(ctx, w/3, h/6, w/16, 0, Math.PI*2);
  ctx.fill();
  // Scanning lights
  ctx.globalAlpha = 0.7;
  ctx.fillStyle = '#fff';
  for (let i = -1; i <= 1; i += 2) {
    ctx.beginPath();
    const scanRadius = Math.max(2, w/40 + (Math.sin(Date.now()*0.01 + i)*2));
    safeArc(ctx, i*w/3, h/6, scanRadius, 0, Math.PI*2);
    ctx.fill();
  }
  ctx.restore();
}

function drawShooterEnemy(e) {
  ctx.save();
  ctx.translate(e.x + e.w/2, e.y + e.h/2);
  const w = e.w, h = e.h;

  // --- Main hull ---
  const hullGrad = ctx.createLinearGradient(-w/2, -h/2, w/2, h/2);
  hullGrad.addColorStop(0, '#222');
  hullGrad.addColorStop(0.3, '#ff8800');
  hullGrad.addColorStop(0.7, '#ffaa00');
  hullGrad.addColorStop(1, '#222');
  ctx.fillStyle = hullGrad;
  ctx.beginPath();
  ctx.moveTo(0, -h/2);
  ctx.lineTo(w/2.5, -h/4);
  ctx.lineTo(w/2, h/8);
  ctx.lineTo(w/2.5, h/4);
  ctx.lineTo(0, h/2);
  ctx.lineTo(-w/2.5, h/4);
  ctx.lineTo(-w/2, h/8);
  ctx.lineTo(-w/2.5, -h/4);
  ctx.closePath();
  ctx.fill();

  // --- Layered armor and bolts ---
  ctx.save();
  ctx.globalAlpha = 0.13;
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.moveTo(0, -h/2.5);
  ctx.lineTo(w/4, 0);
  ctx.lineTo(0, h/4);
  ctx.lineTo(-w/4, 0);
  ctx.closePath();
  ctx.fill();
  // Bolts
  ctx.globalAlpha = 0.25;
  ctx.fillStyle = '#ffaa00';
  for (let i = -1; i <= 1; i += 2) {
    ctx.beginPath();
    ctx.arc(i*w/3, -h/8, w/32, 0, Math.PI*2);
    ctx.fill();
  }
  ctx.restore();

  // --- Panel lines and scratches ---
  ctx.strokeStyle = 'rgba(255,255,255,0.10)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(0, -h/2);
  ctx.lineTo(0, h/2);
  ctx.moveTo(-w/4, 0);
  ctx.lineTo(w/4, 0);
  ctx.moveTo(-w/6, h/8);
  ctx.lineTo(w/6, h/8);
  ctx.stroke();
  // Scratches
  ctx.save();
  ctx.strokeStyle = '#fffbe6';
  ctx.globalAlpha = 0.08;
  ctx.lineWidth = 1;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.moveTo(-w/4 + i*10, h/8 + i*4);
    ctx.lineTo(-w/4 + i*10 + 8, h/8 + i*4 + 2);
    ctx.stroke();
  }
  ctx.restore();

  // --- Weapon core with charging ring ---
  const pulse = 0.7 + 0.3*Math.sin(Date.now()*0.09);
  const coreGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, w/6*pulse);
  coreGrad.addColorStop(0, '#fffbe6');
  coreGrad.addColorStop(0.5, '#ffe066');
  coreGrad.addColorStop(1, 'rgba(255,224,102,0)');
  ctx.save();
  ctx.globalAlpha = 0.8;
  ctx.fillStyle = coreGrad;
  ctx.beginPath();
  ctx.arc(0, 0, w/6*pulse, 0, Math.PI*2);
  ctx.fill();
  // Charging ring
  ctx.globalAlpha = 0.18;
  ctx.strokeStyle = '#ffe066';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(0, 0, w/4, 0, Math.PI*2);
  ctx.stroke();
  ctx.restore();

  // --- Weapon barrels with muzzle glow ---
  ctx.save();
  ctx.fillStyle = '#222';
  ctx.fillRect(w/2.5-2, -h/8, 8, 12);
  ctx.fillRect(w/2.5-2, h/8, 8, 12);
  // Muzzle glow
  ctx.globalAlpha = 0.7;
  ctx.fillStyle = '#ffaa00';
  ctx.beginPath();
  ctx.arc(w/2.5+10, -h/8+3, 4, 0, Math.PI*2);
  ctx.arc(w/2.5+10, h/8+3, 4, 0, Math.PI*2);
  ctx.fill();
  ctx.restore();

  // --- Thruster glows and exhaust ---
  ctx.save();
  ctx.globalAlpha = 0.5;
  ctx.fillStyle = '#00fff7';
  ctx.beginPath();
  ctx.ellipse(-w/3, h/2.5, w/14, h/16, 0, 0, Math.PI*2);
  ctx.ellipse(w/3, h/2.5, w/14, h/16, 0, 0, Math.PI*2);
  ctx.fill();
  // Animated exhaust
  ctx.globalAlpha = 0.18 + 0.12*Math.sin(Date.now()*0.04);
  ctx.fillStyle = '#3fd0ff';
  ctx.beginPath();
  ctx.ellipse(-w/3, h/2.5+8, w/24, h/12, 0, 0, Math.PI*2);
  ctx.ellipse(w/3, h/2.5+8, w/24, h/12, 0, 0, Math.PI*2);
  ctx.fill();
  ctx.restore();

  ctx.restore();
}

function drawBullets() {
  bullets.forEach(b => {
    ctx.save();
    ctx.translate(b.x + b.w/2, b.y + b.h/2);
    
    const bulletType = b.type || 'normal';
    
    if (bulletType === 'laser') {
      // Laser beam effect
      const laserGradient = ctx.createLinearGradient(0, -b.h/2, 0, b.h/2);
      laserGradient.addColorStop(0, '#ff0000');
      laserGradient.addColorStop(0.5, '#ffffff');
      laserGradient.addColorStop(1, '#ff0000');
      
      ctx.fillStyle = laserGradient;
      ctx.shadowColor = '#ff0000';
      ctx.shadowBlur = 8;
      ctx.fillRect(-b.w/2, -b.h/2, b.w, b.h);
      ctx.shadowBlur = 0;
      
      // Laser trail
      ctx.strokeStyle = '#ff0000';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, b.h/2 + 8);
      ctx.lineTo(0, b.h/2);
      ctx.stroke();
      
    } else if (bulletType === 'missile') {
      // Missile with tracking effect
      const missileGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, b.w/2);
      missileGradient.addColorStop(0, '#ffff00');
      missileGradient.addColorStop(0.5, '#ff8800');
      missileGradient.addColorStop(1, '#ff0000');
      
      ctx.fillStyle = missileGradient;
      ctx.shadowColor = '#ff8800';
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.arc(0, 0, b.w/2, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      
      // Missile trail
      ctx.strokeStyle = '#ff8800';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, b.h/2 + 6);
      ctx.lineTo(0, b.h/2);
      ctx.stroke();
      
    } else if (bulletType === 'drone') {
      // Drone bullet
      const droneGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, b.w/2);
      droneGradient.addColorStop(0, '#00ffff');
      droneGradient.addColorStop(0.5, '#0088ff');
      droneGradient.addColorStop(1, '#0044ff');
      
      ctx.fillStyle = droneGradient;
      ctx.shadowColor = '#00ffff';
      ctx.shadowBlur = 4;
      ctx.beginPath();
      ctx.arc(0, 0, b.w/2, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      
    } else {
      // Normal bullet
      const bulletGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, b.w/2);
      bulletGradient.addColorStop(0, '#ffffff');
      bulletGradient.addColorStop(0.5, '#00ffff');
      bulletGradient.addColorStop(1, 'transparent');
      
      ctx.fillStyle = bulletGradient;
      ctx.beginPath();
      ctx.arc(0, 0, b.w/2, 0, Math.PI * 2);
      ctx.fill();
      
      // Bullet trail
      ctx.strokeStyle = '#00ffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, b.h/2 + 4);
      ctx.lineTo(0, b.h/2);
      ctx.stroke();
    }
    
    ctx.restore();
  });
}

function gameLoop() {
  if (gameState === 'playing') {
    update();
    draw();
  }
  requestAnimationFrame(gameLoop);
}

// --- UI Management ---
function showGameUI() {
  document.getElementById('mission-ui').classList.remove('hidden');
  document.getElementById('progression-ui').classList.remove('hidden');
  hud.classList.remove('hidden');
  document.getElementById('top-bar').classList.remove('hidden');
}

function hideGameUI() {
  document.getElementById('mission-ui').classList.add('hidden');
  document.getElementById('progression-ui').classList.add('hidden');
  hud.classList.add('hidden');
  document.getElementById('top-bar').classList.add('hidden');
}

function draw() {
  // Clear canvas
  ctx.fillStyle = '#0a0a23';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Draw stars
  drawStars();
  
  // Draw player
  drawPlayerShip();
  
  // Draw enemies
  drawEnemies();
  
  // Draw bullets
  drawBullets();
  drawEnemyBullets();
  
  // Draw collectibles
  drawCollectibles();
  drawPowerCapsules();
  drawPowerUps();
  
  // Draw drones
  drawDrones();
  
  // Draw particles
  drawParticles();
  
  // Draw sound effects
  drawSoundEffects();
  
  // Draw boss
  if (boss) {
    drawBoss();
  }
  
  // Draw power-up menu
  if (powerUpMenu) {
    drawPowerUpMenu();
  }
}

function gameLoop() {
  if (gameState === 'playing') {
    update();
    draw();
  }
  requestAnimationFrame(gameLoop);
}

// --- Touch Support for iOS ---
function initTouchSupport() {
  // Detect touch device
  isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  
  if (isTouchDevice) {
    // Add touch event listeners to canvas
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd, { passive: false });
    
    // Prevent default touch behaviors to avoid scrolling
    canvas.addEventListener('touchstart', e => e.preventDefault(), { passive: false });
    canvas.addEventListener('touchmove', e => e.preventDefault(), { passive: false });
    
    // Add touch event listeners to all buttons
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
      button.addEventListener('touchstart', e => {
        e.preventDefault();
        button.click();
      }, { passive: false });
    });
  }
}

function handleTouchStart(e) {
  e.preventDefault();
  const touch = e.touches[0];
  const rect = canvas.getBoundingClientRect();
  
  touchStartX = touch.clientX - rect.left;
  touchStartY = touch.clientY - rect.top;
  touchX = touchStartX;
  touchY = touchStartY;
  isTouching = true;
}

function handleTouchMove(e) {
  e.preventDefault();
  if (!isTouching) return;
  
  const touch = e.touches[0];
  const rect = canvas.getBoundingClientRect();
  
  touchX = touch.clientX - rect.left;
  touchY = touch.clientY - rect.top;
  
  // Move player to touch position
  if (gameState === 'playing' && !gamePaused) {
    player.x = Math.max(0, Math.min(canvas.width - player.width, touchX - player.w/2));
    player.y = Math.max(0, Math.min(canvas.height - player.height, touchY - player.h/2));
  }
}

function handleTouchEnd(e) {
  e.preventDefault();
  isTouching = false;
} 

// --- Rapid Fire System ---
let fireHeld = false;
let fireCooldown = 0;
const FIRE_RATE = 5; // Lower is faster (frames between shots) 

// --- Balance Tweaks ---
const ENEMY_SPAWN_RATE = 90; // Higher = slower spawn
const MAX_ENEMIES = 7; // Cap on enemies on screen
const ENEMY_BULLET_SPEED = 3; // Slower enemy bullets
const ENEMY_BULLET_FREQ = 80; // Higher = less frequent
const PLAYER_BULLET_DAMAGE = 2; // Player bullets do more damage
const PLAYER_INVINCIBILITY_FRAMES = 60; // 1 second of invincibility
const POWERUP_DROP_RATE = 0.35; // 35% chance
const COLLECTIBLE_DROP_RATE = 0.2; // 20% chance
const PLAYER_COLLISION_SHRINK = 0.7; // 70% of sprite size
const ENEMY_BULLET_COLLISION_SHRINK = 0.6;

// --- Lockdown: Prevent page scroll and touchmove ---
window.addEventListener('scroll', () => { window.scrollTo(0, 0); });
document.body.addEventListener('touchmove', e => e.preventDefault(), { passive: false });
document.body.addEventListener('wheel', e => e.preventDefault(), { passive: false });

// --- Power-Up Pool ---
const POWERUP_POOL = [
  { name: 'Weapon Power +1', effect: 'weapon', icon: '🔫' },
  { name: 'Drone +1', effect: 'drone', icon: '🛸' },
  { name: 'Shield +1', effect: 'shield', icon: '🛡️' },
  { name: 'Speed +1', effect: 'speed', icon: '⚡' },
  { name: 'Missile', effect: 'missile', icon: '🚀' },
  { name: 'Triple Shot', effect: 'triple', icon: '🔱' },
  { name: 'Heal', effect: 'heal', icon: '❤️' },
  { name: 'Bomb', effect: 'bomb', icon: '💣' }
];

// --- When a power-up capsule is collected ---
function applyRandomPowerUp() {
  const upg = POWERUP_POOL[Math.floor(Math.random() * POWERUP_POOL.length)];
  // Apply upgrade effect (implement as needed)
  switch (upg.effect) {
    case 'weapon':
      player.weaponLevel = Math.min((player.weaponLevel || 1) + 1, 5);
      break;
    case 'drone':
      if (options.length < 2) {
        options.push({
          x: player.x - 30,
          y: player.y,
          w: 20,
          h: 20,
          offsetX: -30 - (options.length * 20),
          offsetY: 0
        });
      }
      break;
    case 'shield':
      player.shield = 300;
      break;
    case 'speed':
      player.speed = Math.min(player.speed + 1, 8);
      break;
    case 'missile':
      playerPowerUps.missile = (playerPowerUps.missile || 0) + 1;
      break;
    case 'triple':
      player.weaponMultiplier = 6;
      break;
    case 'heal':
      lives = Math.min(lives + 1, 5);
      break;
    case 'bomb':
      enemies.forEach(e => score += 50);
      enemies = [];
      break;
  }
  playSoundEffect('collect', player.x, player.y);
}

// --- Game Initialization ---
function initGame() {
  console.log('🎮 Initializing DOM elements...');
  
  // Initialize DOM elements
  canvas = document.getElementById('gameCanvas');
  ctx = canvas.getContext('2d');
  hud = document.getElementById('hud');
  mainMenu = document.getElementById('main-menu');
  startBtn = document.getElementById('start-btn');
  gameOverScreen = document.getElementById('game-over');
  restartBtn = document.getElementById('restart-btn');
  mainMenuBtn = document.getElementById('main-menu-btn');
  scoreDisplay = document.getElementById('score');
  livesDisplay = document.getElementById('lives');
  finalScore = document.getElementById('final-score');
  highScoreDisplay = document.getElementById('high-score');
  weaponLevelDisplay = document.getElementById('weapon-level');
  difficultyDisplay = document.getElementById('difficulty');
  timeDisplay = document.getElementById('time');
  
  // Pause Menu
  pauseMenu = document.getElementById('pause-menu');
  resumeBtn = document.getElementById('resume-btn');
  saveExitBtn = document.getElementById('save-exit-btn');
  exitNoSaveBtn = document.getElementById('exit-no-save-btn');
  
  // Continue button
  continueBtn = document.getElementById('continue-btn');
  
  // Check if all critical elements exist
  if (!canvas || !ctx || !mainMenu || !startBtn) {
    throw new Error('Critical DOM elements not found. Please refresh the page.');
  }
  
  console.log('🎮 DOM elements initialized');
  
  // Initialize game systems
  generateMissions();
  initHighScores();
  initSavedGame();
  initStars();
  initTouchSupport();
  
  // Update main menu buttons
  console.log('🎮 Updating main menu buttons...');
  console.log('🎮 Start button before:', startBtn.textContent);
  startBtn.textContent = 'Start Mission';
  console.log('🎮 Start button after:', startBtn.textContent);
  startBtn.onclick = () => {
    console.log('🎮 Start button clicked');
    const missionDropdown = document.getElementById('mission-dropdown');
    console.log('🎮 Mission dropdown element:', missionDropdown);
    if (missionDropdown) {
      const selectedMission = parseInt(missionDropdown.value);
      console.log('🎮 Selected mission:', selectedMission);
      console.log('🎮 Starting mission:', selectedMission);
      mainMenu.classList.add('hidden');
      startMission(selectedMission);
    } else {
      console.error('❌ Mission dropdown not found');
      // Fallback to mission 1
      console.log('🎮 Falling back to mission 1');
      mainMenu.classList.add('hidden');
      startMission(1);
    }
  };
  
  // Add event listeners for new UI with null checks
  const nextMissionBtn = document.getElementById('next-mission');
  if (nextMissionBtn) {
    nextMissionBtn.onclick = () => {
      document.getElementById('mission-complete').classList.add('hidden');
      if (currentMission < totalMissions) {
        startMission(currentMission + 1);
      } else {
        // Game completed!
        showGameComplete();
      }
    };
  }
  
  const missionSelectBtn = document.getElementById('mission-select-btn');
  if (missionSelectBtn) {
    missionSelectBtn.onclick = () => {
      document.getElementById('mission-complete').classList.add('hidden');
      mainMenu.classList.remove('hidden');
    };
  }
  
  // Skill tree event listeners
  const skillTreeBtn = document.getElementById('skill-tree-btn');
  if (skillTreeBtn) {
    skillTreeBtn.onclick = () => {
      mainMenu.classList.add('hidden');
      showSkillTree();
    };
  }
  
  const backFromSkillsBtn = document.getElementById('back-from-skills');
  if (backFromSkillsBtn) {
    backFromSkillsBtn.onclick = () => {
      document.getElementById('skill-tree').classList.add('hidden');
      mainMenu.classList.remove('hidden');
    };
  }
  
  // Pause menu event listeners
  if (resumeBtn) resumeBtn.onclick = resumeGame;
  if (saveExitBtn) saveExitBtn.onclick = () => exitGame(true);
  if (exitNoSaveBtn) exitNoSaveBtn.onclick = () => exitGame(false);
  
  // Game over event listeners
  if (restartBtn) restartBtn.onclick = resetGame;
  if (mainMenuBtn) {
    mainMenuBtn.onclick = () => {
      gameOverScreen.classList.add('hidden');
      mainMenu.classList.remove('hidden');
    };
  }
  
  // Initialize keyboard input system
  keys = {};
  
  // Keyboard event listeners
  document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    
    // Pause/resume with Escape or P
    if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
      if (gameState === 'playing') {
        pauseGame();
      } else if (gameState === 'paused') {
        resumeGame();
      }
    }
  });
  
  document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
  });
  
  console.log('✅ Game initialization complete');
}

function showGameComplete() {
  const gameComplete = document.getElementById('game-complete');
  
  // Update final stats
  document.getElementById('final-total-score').textContent = score;
  document.getElementById('final-level').textContent = playerLevel;
  document.getElementById('final-credits').textContent = credits;
  document.getElementById('final-missions').textContent = '50/50';
  
  gameComplete.classList.remove('hidden');
  gameState = 'game-complete';
  
  // Add event listeners
  document.getElementById('new-game-plus').onclick = () => {
    startNewGamePlus();
  };
  
  document.getElementById('back-to-main').onclick = () => {
    gameComplete.classList.add('hidden');
    mainMenu.classList.remove('hidden');
  };
}

// High Score Functions
function initHighScores() {
  const saved = localStorage.getItem('highScores');
  if (saved) {
    try {
      highScores = JSON.parse(saved);
    } catch (e) {
      highScores = [];
    }
  }
  updateHighScoreDisplay();
}

function updateHighScoreDisplay() {
  if (highScoreDisplay) {
    const topScore = highScores.length > 0 ? Math.max(...highScores) : 0;
    highScoreDisplay.textContent = `High Score: ${topScore.toLocaleString()}`;
  }
}

function checkForNewHighScore() {
  const topScore = highScores.length > 0 ? Math.max(...highScores) : 0;
  return score > topScore;
}

function saveHighScore() {
  highScores.push(score);
  highScores.sort((a, b) => b - a); // Sort descending
  highScores = highScores.slice(0, 10); // Keep top 10
  localStorage.setItem('highScores', JSON.stringify(highScores));
  updateHighScoreDisplay();
}

function showNewHighScoreCelebration() {
  // Create celebration effect
  for (let i = 0; i < 50; i++) {
    createParticle(
      canvas.width / 2 + (Math.random() - 0.5) * 200,
      canvas.height / 2 + (Math.random() - 0.5) * 200,
      ['#ffd700', '#ff6b6b', '#4ecdc4', '#45b7d1'][Math.floor(Math.random() * 4)],
      3,
      60
    );
  }
  
  // Show notification
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: linear-gradient(45deg, #ffd700, #ff6b6b);
    color: white;
    padding: 20px 40px;
    border-radius: 12px;
    font-size: 24px;
    font-weight: bold;
    text-align: center;
    z-index: 10000;
    animation: celebration 2s ease-out;
  `;
  notification.innerHTML = '🎉 NEW HIGH SCORE! 🎉';
  document.body.appendChild(notification);
  
  // Add CSS animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes celebration {
      0% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
      50% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; }
      100% { transform: translate(-50%, -50%) scale(1); opacity: 0; }
    }
  `;
  document.head.appendChild(style);
  
  // Remove after animation
  setTimeout(() => {
    document.body.removeChild(notification);
    document.head.removeChild(style);
  }, 2000);
}

// Saved Game Functions
function initSavedGame() {
  const saved = localStorage.getItem('gameData');
  if (saved) {
    try {
      const data = JSON.parse(saved);
      // Load saved game data
      playerLevel = data.playerLevel || 1;
      skillPoints = data.skillPoints || 0;
      credits = data.credits || 0;
      currentMission = data.currentMission || 1;
      playerSkills = data.playerSkills || {};
      difficulty = data.difficulty || 1;
      
      // Update UI
      updateProgressionUI();
      console.log('🎮 Loaded saved game data');
    } catch (e) {
      console.log('🎮 No valid saved game found, starting fresh');
    }
  }
}

// Star Background Functions
function initStars() {
  stars = [];
  for (let i = 0; i < 100; i++) {
    stars.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      speed: 0.5 + Math.random() * 1.5,
      size: 1 + Math.random() * 2,
      brightness: 0.3 + Math.random() * 0.7
    });
  }
}

function updateStars() {
  stars.forEach(star => {
    star.y += star.speed;
    if (star.y > canvas.height) {
      star.y = -10;
      star.x = Math.random() * canvas.width;
    }
  });
}

function drawStars() {
  ctx.fillStyle = '#ffffff';
  stars.forEach(star => {
    ctx.globalAlpha = star.brightness;
    ctx.fillRect(star.x, star.y, star.size, star.size);
  });
  ctx.globalAlpha = 1;
}

// Pause/Resume Functions
function pauseGame() {
  if (gameState === 'playing') {
    gameState = 'paused';
    gamePaused = true;
    pauseMenu.classList.remove('hidden');
    console.log('🎮 Game paused');
  }
}

function resumeGame() {
  if (gameState === 'paused') {
    gameState = 'playing';
    gamePaused = false;
    pauseMenu.classList.add('hidden');
    console.log('🎮 Game resumed');
  }
}



// Initialize the game when the page loads
window.addEventListener('load', () => {
  console.log('🎮 Kaden & Adelynn Adventures - Loading...');
  
  // Show loading indicator
  const loadingDiv = document.createElement('div');
  loadingDiv.id = 'loading-indicator';
  loadingDiv.innerHTML = `
    <div style="
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(10,10,35,0.95);
      color: #00fff7;
      padding: 20px;
      border-radius: 12px;
      border: 2px solid #00fff7;
      text-align: center;
      z-index: 10000;
    ">
      <h2>Loading Kaden & Adelynn Adventures...</h2>
      <p>Please wait while the game initializes...</p>
    </div>
  `;
  document.body.appendChild(loadingDiv);
  
  try {
    initGame();
    console.log('✅ Game initialized successfully');
    
    // Remove loading indicator
    document.body.removeChild(loadingDiv);
    
    gameLoop();
    console.log('✅ Game loop started');
    
    // Show success message
    setTimeout(() => {
      const successDiv = document.createElement('div');
      successDiv.innerHTML = `
        <div style="
          position: fixed;
          top: 20px;
          right: 20px;
          background: rgba(0,255,0,0.9);
          color: #000;
          padding: 10px;
          border-radius: 8px;
          z-index: 10000;
          font-weight: bold;
        ">
          ✅ New Game Loaded Successfully!
        </div>
      `;
      document.body.appendChild(successDiv);
      setTimeout(() => document.body.removeChild(successDiv), 3000);
    }, 1000);
    
  } catch (error) {
    console.error('❌ Error initializing game:', error);
    
    // Remove loading indicator
    if (document.getElementById('loading-indicator')) {
      document.body.removeChild(loadingDiv);
    }
    
    // Show error message
    const errorDiv = document.createElement('div');
    errorDiv.innerHTML = `
      <div style="
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(255,0,0,0.9);
        color: #fff;
        padding: 20px;
        border-radius: 12px;
        text-align: center;
        z-index: 10000;
      ">
        <h2>❌ Game Loading Error</h2>
        <p>Please refresh the page to try again.</p>
        <p>Error: ${error.message}</p>
      </div>
    `;
    document.body.appendChild(errorDiv);
  }
});

// --- Skill Tree UI ---
function showSkillTree() {
  const skillTreeUI = document.getElementById('skill-tree');
  const skillTreeContent = document.getElementById('skill-tree-content');
  
  skillTreeContent.innerHTML = '';
  
  Object.keys(skillTree).forEach(category => {
    const categoryData = skillTree[category];
    const categoryDiv = document.createElement('div');
    categoryDiv.className = 'skill-category';
    
    categoryDiv.innerHTML = `
      <h3>${categoryData.name}</h3>
      <div class="skill-grid">
        ${categoryData.skills.map(skill => {
          const currentLevel = playerSkills[skill.id] || 0;
          const canAfford = skillPoints >= skill.cost;
          const canUpgrade = currentLevel < skill.maxLevel;
          
          return `
            <div class="skill-item ${canAfford && canUpgrade ? 'available' : 'locked'}" 
                 data-skill="${skill.id}" 
                 data-cost="${skill.cost}">
              <div class="skill-name">${skill.name}</div>
              <div class="skill-effect">${skill.effect}</div>
              <div class="skill-level">Level ${currentLevel}/${skill.maxLevel}</div>
              <div class="skill-cost">Cost: ${skill.cost} SP</div>
            </div>
          `;
        }).join('')}
      </div>
    `;
    
    skillTreeContent.appendChild(categoryDiv);
  });
  
  // Add event listeners
  document.querySelectorAll('.skill-item.available').forEach(item => {
    item.onclick = () => purchaseSkill(item.dataset.skill, parseInt(item.dataset.cost));
  });
  
  skillTreeUI.classList.remove('hidden');
  gameState = 'skill-tree';
}

function purchaseSkill(skillId, cost) {
  if (skillPoints < cost) return;
  
  const currentLevel = playerSkills[skillId] || 0;
  const skill = findSkill(skillId);
  
  if (currentLevel >= skill.maxLevel) return;
  
  skillPoints -= cost;
  playerSkills[skillId] = currentLevel + 1;
  
  // Apply skill effect
  applySkillEffect(skillId, currentLevel + 1);
  
  // Update UI
  updateProgressionUI();
  showSkillTree(); // Refresh skill tree
  
  // Show effect
  playSoundEffect('levelup', player.x + player.width/2, player.y + player.height/2);
}

function findSkill(skillId) {
  for (const category of Object.values(skillTree)) {
    const skill = category.skills.find(s => s.id === skillId);
    if (skill) return skill;
  }
  return null;
}

function applySkillEffect(skillId, level) {
  switch (skillId) {
    case 'rapid_fire':
      player.fireRate = Math.max(0.1, 1 - (level * 0.2));
      break;
    case 'multi_shot':
      player.multiShot = level;
      break;
    case 'laser_beam':
      currentWeapon = 'laser';
      break;
    case 'missile_launcher':
      player.hasMissiles = true;
      player.missileLevel = level;
      break;
    case 'shield_boost':
      player.shieldDuration = 300 + (level * 60);
      break;
    case 'armor_plating':
      player.armor = level;
      break;
    case 'auto_repair':
      player.autoRepair = true;
      break;
    case 'speed_boost':
      player.speed = 4 + (level * 1);
      break;
    case 'dash':
      player.canDash = true;
      break;
    case 'teleport':
      player.canTeleport = true;
      break;
  }
}

function shoot() {
  if (gameState !== 'playing' || gamePaused) return;
  
  const weaponType = weaponTypes[currentWeapon];
  const multiShot = player.multiShot || 1;
  
  for (let i = 0; i < multiShot; i++) {
    const spread = (i - (multiShot - 1) / 2) * 10;
    
    switch (currentWeapon) {
      case 'laser':
        bullets.push({
          x: player.x + player.width/2 - 2,
          y: player.y,
          w: 4,
          h: 20,
          speed: 8,
          damage: weaponType.damage,
          type: 'laser'
        });
        break;
        
      case 'missile':
        bullets.push({
          x: player.x + player.width/2 - 4,
          y: player.y,
          w: 8,
          h: 16,
          speed: 6,
          damage: weaponType.damage,
          type: 'missile',
          tracking: true
        });
        break;
        
      case 'plasma':
        bullets.push({
          x: player.x + player.width/2 - 6,
          y: player.y,
          w: 12,
          h: 12,
          speed: 5,
          damage: weaponType.damage,
          type: 'plasma'
        });
        break;
        
      default:
        bullets.push({
          x: player.x + player.width/2 - 2 + spread,
          y: player.y,
          w: 4,
          h: 12,
          speed: 7,
          damage: weaponType.damage,
          type: 'basic'
        });
        break;
    }
  }
  
  // Create muzzle flash
  for (let i = 0; i < 5; i++) {
    createParticle(player.x + player.width/2, player.y, '#ffff00', 2, 10);
  }
}

function saveGame() {
  const saveData = {
    score,
    lives,
    playerLevel,
    playerXP,
    xpToNextLevel,
    skillPoints,
    credits,
    currentMission,
    stageProgress,
    stageGoal,
    playerSkills,
    currentWeapon,
    weaponLevel,
    difficulty,
    gameTime,
    highScores,
    missionData,
    timestamp: Date.now()
  };
  
  localStorage.setItem('gameSave', JSON.stringify(saveData));
}

function loadGame() {
  const saveData = localStorage.getItem('gameSave');
  if (!saveData) return false;
  
  try {
    const data = JSON.parse(saveData);
    
    score = data.score || 0;
    lives = data.lives || 3;
    playerLevel = data.playerLevel || 1;
    playerXP = data.playerXP || 0;
    xpToNextLevel = data.xpToNextLevel || 100;
    skillPoints = data.skillPoints || 0;
    credits = data.credits || 0;
    currentMission = data.currentMission || 1;
    stageProgress = data.stageProgress || 0;
    stageGoal = data.stageGoal || 20;
    playerSkills = data.playerSkills || {};
    currentWeapon = data.currentWeapon || 'basic';
    weaponLevel = data.weaponLevel || 1;
    difficulty = data.difficulty || 1;
    gameTime = data.gameTime || 0;
    highScores = data.highScores || [];
    missionData = data.missionData || [];
    
    // Apply loaded skills
    Object.keys(playerSkills).forEach(skillId => {
      applySkillEffect(skillId, playerSkills[skillId]);
    });
    
    // Update UI
    updateProgressionUI();
    updateMissionUI();
    
    return true;
  } catch (error) {
    console.error('Error loading save data:', error);
    return false;
  }
}

// --- Achievement System ---
let achievements = {
  firstBlood: { name: 'First Blood', description: 'Destroy your first enemy', unlocked: false },
  sharpshooter: { name: 'Sharpshooter', description: 'Destroy 100 enemies', unlocked: false, progress: 0, target: 100 },
  bossSlayer: { name: 'Boss Slayer', description: 'Defeat your first boss', unlocked: false },
  missionMaster: { name: 'Mission Master', description: 'Complete 10 missions', unlocked: false, progress: 0, target: 10 },
  skillMaster: { name: 'Skill Master', description: 'Unlock 5 skills', unlocked: false, progress: 0, target: 5 },
  ultimateChampion: { name: 'Ultimate Champion', description: 'Complete all 50 missions', unlocked: false }
};

function checkAchievements() {
  // First Blood
  if (score > 0 && !achievements.firstBlood.unlocked) {
    unlockAchievement('firstBlood');
  }
  
  // Sharpshooter
  if (!achievements.sharpshooter.unlocked) {
    achievements.sharpshooter.progress = Math.floor(score / 10); // Rough estimate
    if (achievements.sharpshooter.progress >= achievements.sharpshooter.target) {
      unlockAchievement('sharpshooter');
    }
  }
  
  // Boss Slayer
  if (boss && boss.health <= 0 && !achievements.bossSlayer.unlocked) {
    unlockAchievement('bossSlayer');
  }
  
  // Mission Master
  if (!achievements.missionMaster.unlocked) {
    achievements.missionMaster.progress = currentMission - 1;
    if (achievements.missionMaster.progress >= achievements.missionMaster.target) {
      unlockAchievement('missionMaster');
    }
  }
  
  // Skill Master
  if (!achievements.skillMaster.unlocked) {
    achievements.skillMaster.progress = Object.keys(playerSkills).length;
    if (achievements.skillMaster.progress >= achievements.skillMaster.target) {
      unlockAchievement('skillMaster');
    }
  }
  
  // Ultimate Champion
  if (currentMission > totalMissions && !achievements.ultimateChampion.unlocked) {
    unlockAchievement('ultimateChampion');
  }
}

function unlockAchievement(achievementId) {
  if (achievements[achievementId].unlocked) return;
  
  achievements[achievementId].unlocked = true;
  
  // Show achievement notification
  showAchievementNotification(achievements[achievementId].name);
  
  // Save achievements
  localStorage.setItem('achievements', JSON.stringify(achievements));
}

function showAchievementNotification(achievementName) {
  const notification = document.createElement('div');
  notification.className = 'achievement-notification';
  notification.innerHTML = `
    <div class="achievement-icon">🏆</div>
    <div class="achievement-text">
      <div class="achievement-title">Achievement Unlocked!</div>
      <div class="achievement-name">${achievementName}</div>
    </div>
  `;
  
  document.body.appendChild(notification);
  
  // Animate in
  setTimeout(() => {
    notification.classList.add('show');
  }, 100);
  
  // Remove after 3 seconds
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 500);
  }, 3000);
}