const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const hud = document.getElementById('hud');
const mainMenu = document.getElementById('main-menu');
const startBtn = document.getElementById('start-btn');
const gameOverScreen = document.getElementById('game-over');
const restartBtn = document.getElementById('restart-btn');
const mainMenuBtn = document.getElementById('main-menu-btn');
const scoreDisplay = document.getElementById('score');
const livesDisplay = document.getElementById('lives');
const finalScore = document.getElementById('final-score');
const highScoreDisplay = document.getElementById('high-score');
const weaponLevelDisplay = document.getElementById('weapon-level');
const difficultyDisplay = document.getElementById('difficulty');
const timeDisplay = document.getElementById('time');



// Pause Menu
const pauseMenu = document.getElementById('pause-menu');
const resumeBtn = document.getElementById('resume-btn');
const saveExitBtn = document.getElementById('save-exit-btn');
const exitNoSaveBtn = document.getElementById('exit-no-save-btn');

// Continue button
const continueBtn = document.getElementById('continue-btn');

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

document.getElementById('upgrade-confirm').onclick = () => {
  const selected = document.querySelector('.upgrade-option.selected');
  if (!selected) return;
  // Apply upgrade (TODO: implement effects)
  // Hide menu and start next stage
  document.getElementById('upgrade-menu').classList.add('hidden');
  stage++;
  startStage();
};

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
function spawnBoss() {
  if (!bossSpawned && gameTime > 3000) { // Spawn boss after 50 seconds
    boss = {
      x: canvas.width + 50,
      y: canvas.height / 2 - 40,
      w: 80, h: 60,
      health: 20,
      maxHealth: 20,
      speed: 1,
      shootTimer: 0,
      phase: 0,
      movePattern: 'approach'
    };
    bossSpawned = true;
  }
}

function updateBoss() {
  if (!boss) return;
  
  // Boss movement patterns
  switch(boss.movePattern) {
    case 'approach':
      boss.x -= boss.speed;
      if (boss.x < canvas.width - 100) {
        boss.movePattern = 'attack';
      }
      break;
    case 'attack':
      boss.y += Math.sin(gameTime * 0.01) * 2;
      boss.shootTimer++;
      if (boss.shootTimer > 30) {
        // Multi-directional shots
        for (let i = 0; i < 8; i++) {
          const angle = (i / 8) * Math.PI * 2;
          enemyBullets.push({
            x: boss.x + boss.w/2,
            y: boss.y + boss.h/2,
            w: 12, h: 12,
            speed: 4,
            dx: Math.cos(angle) * 4,
            dy: Math.sin(angle) * 4
          });
        }
        boss.shootTimer = 0;
      }
      break;
  }
  
  // Boss health check
  if (boss.health <= 0) {
    // Boss defeated
    for (let i = 0; i < 20; i++) {
      createParticle(boss.x + boss.w/2, boss.y + boss.h/2, '#ff0000', 5, 60);
    }
    score += 1000;
    boss = null;
    bossSpawned = false;
  }
}

function drawBoss() {
  if (!boss) return;
  
  ctx.save();
  ctx.translate(boss.x + boss.w/2, boss.y + boss.h/2);
  
  // Boss body
  const bossGradient = ctx.createLinearGradient(-boss.w/2, -boss.h/2, boss.w/2, boss.h/2);
  bossGradient.addColorStop(0, '#8b0000');
  bossGradient.addColorStop(0.5, '#ff0000');
  bossGradient.addColorStop(1, '#8b0000');
  
  ctx.fillStyle = bossGradient;
  ctx.fillRect(-boss.w/2, -boss.h/2, boss.w, boss.h);
  
  // Boss details
  ctx.strokeStyle = '#ffff00';
  ctx.lineWidth = 3;
  ctx.strokeRect(-boss.w/2, -boss.h/2, boss.w, boss.h);
  
  // Health bar
  const healthPercent = boss.health / boss.maxHealth;
  ctx.fillStyle = '#ff0000';
  ctx.fillRect(-boss.w/2, -boss.h/2 - 10, boss.w, 5);
  ctx.fillStyle = '#00ff00';
  ctx.fillRect(-boss.w/2, -boss.h/2 - 10, boss.w * healthPercent, 5);
  
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
    completeMission();
  }
  
  // Update UI
  updateMissionUI();
  updateProgressionUI();
  
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
    player.x = Math.max(0, Math.min(canvas.width - player.w, touchX - player.w/2));
    player.y = Math.max(0, Math.min(canvas.height - player.h, touchY - player.h/2));
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
  generateMissions();
  loadHighScores();
  checkForSavedGame();
  initStars();
  initTouchSupport();
  
  // Update main menu buttons
  startBtn.textContent = 'Mission Select';
  startBtn.onclick = showMissionSelect;
  
  // Add event listeners for new UI
  document.getElementById('back-to-menu').onclick = () => {
    document.getElementById('mission-select').classList.add('hidden');
    mainMenu.classList.remove('hidden');
  };
  
  document.getElementById('next-mission').onclick = () => {
    document.getElementById('mission-complete').classList.add('hidden');
    if (currentMission < totalMissions) {
      startMission(currentMission + 1);
    } else {
      // Game completed!
      showGameComplete();
    }
  };
  
  document.getElementById('mission-select-btn').onclick = () => {
    document.getElementById('mission-complete').classList.add('hidden');
    showMissionSelect();
  };
}

function showMissionSelect() {
  mainMenu.classList.add('hidden');
  const missionSelect = document.getElementById('mission-select');
  const missionGrid = document.getElementById('mission-grid');
  
  missionGrid.innerHTML = '';
  
  missionData.forEach((mission, index) => {
    const card = document.createElement('div');
    card.className = 'mission-card';
    if (index + 1 > currentMission) {
      card.classList.add('locked');
    } else if (index + 1 < currentMission) {
      card.classList.add('completed');
    }
    
    card.innerHTML = `
      <h3>${mission.name}</h3>
      <p>${mission.description}</p>
      <div class="difficulty">Difficulty: ${mission.difficulty.toFixed(1)}</div>
      <div class="reward">Reward: ${mission.reward.credits} Credits, ${mission.reward.xp} XP</div>
    `;
    
    if (index + 1 <= currentMission) {
      card.onclick = () => {
        missionSelect.classList.add('hidden');
        startMission(index + 1);
      };
    }
    
    missionGrid.appendChild(card);
  });
  
  missionSelect.classList.remove('hidden');
}

function showGameComplete() {
  // TODO: Implement game completion screen
  alert('Congratulations! You have completed all missions!');
  mainMenu.classList.remove('hidden');
}

// Initialize the game when the page loads
window.addEventListener('load', () => {
  initGame();
  gameLoop();
});