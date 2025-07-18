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
  // Enemies only spawn from the top
  const x = Math.random() * (canvas.width - 48) + 8;
  const y = -48;
  
  const type = Math.random() < 0.6 ? 'basic' : 'shooter';
  if (type === 'basic') {
    enemies.push({ x, y, w: 48, h: 36, type, lifeTimer: 0 });
  } else {
    enemies.push({ x, y, w: 48, h: 36, type, shootTimer: 0, lifeTimer: 0 });
  }
}
let enemyBullets = [];
function updateEnemies() {
  // Cap max enemies
  if (enemies.length > MAX_ENEMIES) return;
  // Enemies move downward with slight horizontal movement
  for (let e of enemies) {
    // Initialize enemy properties
    if (!e.movementSpeed) {
      e.movementSpeed = 1 + Math.random() * 2;
    }
    
    // Move downward
    e.y += e.movementSpeed;
    
    // Add slight horizontal movement for variety
    if (!e.horizontalSpeed) {
      e.horizontalSpeed = (Math.random() - 0.5) * 1; // Slight left/right movement
    }
    
    e.x += e.horizontalSpeed;
    
    // Keep enemies within screen bounds horizontally
    if (e.x < -e.w) {
      e.x = -e.w;
      e.horizontalSpeed = Math.abs(e.horizontalSpeed); // Bounce right
    } else if (e.x > canvas.width) {
      e.x = canvas.width;
      e.horizontalSpeed = -Math.abs(e.horizontalSpeed); // Bounce left
    }
    
    // Update life timer
    e.lifeTimer = (e.lifeTimer || 0) + 1;
    
    // Shooter enemies fire at regular intervals
    if (
      e.type === 'shooter' &&
      e.x + e.w > 0 && e.x < canvas.width &&
      e.y + e.h > 0 && e.y < canvas.height
    ) {
      e.shootTimer = (e.shootTimer || 0) + 1;
      if (e.shootTimer > ENEMY_BULLET_FREQ) { // Shoot every 1 second (more frequent)
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
              x: e.x + e.w/2 - 4, 
              y: e.y + e.h/2 - 4, 
              w: 8, 
              h: 8, 
              speed: bulletSpeed,
              dx: spreadDx,
              dy: spreadDy
            });
          }
        }
        e.shootTimer = 0;
      }
    }
  }
  
  // Remove enemies that go too far off screen
  enemies = enemies.filter(e => 
    e.x > -e.w * 2 && e.x < canvas.width + e.w * 2 && 
    e.y > -e.h * 2 && e.y < canvas.height + e.h * 2
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
  player = { x: canvas.width/2-24, y: canvas.height/2-18, w: 48, h: 36, speed: 5, weaponLevel: 1, shield: 0, weaponMultiplier: 4, invincible: 0 };
  bullets = [];
  enemies = [];
  enemyBullets = [];
  powerUps = [];
  collectibles = [];
  powerCapsules = [];
  particles = [];
  soundEffects = [];
  options = [];
  score = 0;
  lives = 3;
  keys = {};
  enemyTimer = 0;
  powerUpMenu = false;
  selectedPowerUp = 0;
  playerPowerUps = {
    speed: 0,
    missile: 0,
    double: 0,
    laser: 0,
    option: 0,
    forcefield: 0
  };
  initStars();
  gameTime = 0;
  difficulty = 1;
  bossSpawned = false;
  boss = null;
  
  // Reset final score styling
  finalScore.style.color = '';
  finalScore.style.textShadow = '';
  
  // Update high score display
  updateHighScoresDisplay();
}

function update() {
  updateStars();
  updateParticles();
  updateSoundEffects();
  updateBoss();
  
  // Update drones
  updateDrones();
  
  // Player movement - keyboard only
  if (keys['ArrowLeft']) player.x -= player.speed;
  if (keys['ArrowRight']) player.x += player.speed;
  if (keys['ArrowUp']) player.y -= player.speed;
  if (keys['ArrowDown']) player.y += player.speed;
  // Keep player within screen bounds
  player.x = Math.max(0, Math.min(canvas.width - player.w, player.x));
  player.y = Math.max(0, Math.min(canvas.height - player.h, player.y));

  // Bullets
  bullets.forEach(b => {
    if (b.tracking && enemies.length > 0) {
      // Find nearest enemy for missile tracking
      let nearestEnemy = null;
      let nearestDistance = Infinity;
      
      enemies.forEach(enemy => {
        const distance = Math.sqrt((enemy.x - b.x) ** 2 + (enemy.y - b.y) ** 2);
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestEnemy = enemy;
        }
      });
      
      if (nearestEnemy) {
        // Move towards nearest enemy
        const dx = nearestEnemy.x - b.x;
        const dy = nearestEnemy.y - b.y;
        const distance = Math.sqrt(dx ** 2 + dy ** 2);
        
        if (distance > 0) {
          b.x += (dx / distance) * b.speed * 0.5;
          b.y += (dy / distance) * b.speed * 0.5;
        }
      } else {
        b.y -= b.speed;
      }
    } else {
      b.y -= b.speed;
    }
  });
  bullets = bullets.filter(b => b.y > -20 && b.x > -20 && b.x < canvas.width + 20);

  // Enemies
  updateEnemies();

  // Enemy bullets
  updateEnemyBullets();

  // Power-ups
  updatePowerUps();

  // Collectibles
  updateCollectibles();

  // Power capsules
  updatePowerCapsules();

  // Collisions: bullets vs enemies
  for (let i = enemies.length-1; i >= 0; i--) {
    for (let j = bullets.length-1; j >= 0; j--) {
      if (rectsCollide(enemies[i], bullets[j])) {
        // 20% chance to drop power capsule, 10% chance to drop collectible
        if (Math.random() < POWERUP_DROP_RATE) {
          spawnPowerCapsule(enemies[i].x, enemies[i].y);
        } else if (Math.random() < COLLECTIBLE_DROP_RATE) {
          spawnCollectible(enemies[i].x, enemies[i].y);
        }
        enemies.splice(i,1);
        bullets.splice(j,1);
        score += 100;
        stageProgress++;
        credits += 5;
        if (stageProgress >= stageGoal) endStage();
        if (stage % 3 === 0 && stageProgress >= stageGoal) startBoss();
        break;
      }
    }
  }
  
  // Collisions: player vs enemies
  for (let i = enemies.length-1; i >= 0; i--) {
    if (rectsCollide(player, enemies[i])) {
      if (player.shield > 0) {
        player.shield = 0;
      } else {
        enemies.splice(i,1);
        lives--;
        if (lives <= 0) {
          endGame();
          return;
        }
      }
    }
  }

  // Enemy spawn
  enemyTimer++;
  if (enemyTimer > ENEMY_SPAWN_RATE) {
    spawnEnemy();
    enemyTimer = 0;
  }
  
  // Shield timer
  if (player.shield > 0) player.shield--;
  
  // Rapid fire logic
  if (fireHeld && !gamePaused && gameState === 'playing') {
    if (fireCooldown <= 0) {
      shoot();
      fireCooldown = FIRE_RATE;
    }
  }
  if (fireCooldown > 0) fireCooldown--;

  // Auto-shoot on touch devices
  if (isTouchDevice && isTouching && gameState === 'playing' && !gamePaused) {
    if (fireCooldown <= 0) {
      shoot();
      fireCooldown = FIRE_RATE;
    }
  }
  
  gameTime++;
}

function draw() {
  ctx.clearRect(0,0,canvas.width,canvas.height);
  drawStars();
  drawParticles();
  drawSoundEffects();
  drawBoss();
  
  // Draw player ship
  drawPlayerShip();
  
  // Draw drones
  drawDrones();
  
  // Bullets
  drawBullets();
  
  // Enemy bullets
  drawEnemyBullets();
  
  // Enemies
  drawEnemies();
  
  // Power-ups
  drawPowerUps();

  // Collectibles
  drawCollectibles();

  // Power capsules
  drawPowerCapsules();
  
  // Power-up menu
  if (powerUpMenu) {
    drawPowerUpMenu();
  }
}

function drawPowerUpMenu() {
  // Semi-transparent background
  ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Menu background
  const menuWidth = 400;
  const menuHeight = 300;
  const menuX = (canvas.width - menuWidth) / 2;
  const menuY = (canvas.height - menuHeight) / 2;
  
  // Menu border
  ctx.strokeStyle = '#00ffff';
  ctx.lineWidth = 3;
  ctx.shadowColor = '#00ffff';
  ctx.shadowBlur = 10;
  ctx.strokeRect(menuX, menuY, menuWidth, menuHeight);
  ctx.shadowBlur = 0;
  
  // Menu background
  ctx.fillStyle = 'rgba(10, 10, 35, 0.95)';
  ctx.fillRect(menuX, menuY, menuWidth, menuHeight);
  
  // Title
  ctx.fillStyle = '#00ffff';
  ctx.font = 'bold 24px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText('POWER-UP SELECTION', canvas.width / 2, menuY + 20);
  
  // Instructions
  ctx.fillStyle = '#ffffff';
  ctx.font = '16px Arial';
  ctx.fillText('Use Arrow Keys to Select, Spacebar to Confirm', canvas.width / 2, menuY + 50);
  
  // Power-up options
  const optionHeight = 35;
  const startY = menuY + 100;
  
  POWER_UP_OPTIONS.forEach((option, index) => {
    const y = startY + index * optionHeight;
    const isSelected = index === selectedPowerUp;
    
    // Selection indicator
    if (isSelected) {
      ctx.fillStyle = '#00ffff';
      ctx.fillRect(menuX + 10, y - 5, menuWidth - 20, optionHeight);
    }
    
    // Option background
    ctx.fillStyle = isSelected ? '#003333' : 'rgba(255, 255, 255, 0.1)';
    ctx.fillRect(menuX + 15, y, menuWidth - 30, optionHeight - 10);
    
    // Option text
    ctx.fillStyle = isSelected ? '#ffffff' : '#cccccc';
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${option.icon} ${option.name}`, menuX + 30, y + (optionHeight - 10) / 2);
    
    // Current level
    const currentLevel = playerPowerUps[option.effect] || 0;
    const maxLevel = option.maxLevel;
    ctx.fillStyle = '#ffff00';
    ctx.font = '14px Arial';
    ctx.textAlign = 'right';
    ctx.fillText(`Level ${currentLevel}/${maxLevel}`, menuX + menuWidth - 30, y + (optionHeight - 10) / 2);
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
    ctx.translate(e.x + e.w/2, e.y + e.h/2);
    
    if (e.type === 'basic') {
      drawBasicEnemy(e);
    } else {
      drawShooterEnemy(e);
    }
    
    ctx.restore();
  }
}

// --- Safe arc helper ---
function safeArc(ctx, x, y, r, a1, a2) {
  if (r > 0) ctx.arc(x, y, r, a1, a2);
}

function drawBasicEnemy(e) {
  ctx.save();
  ctx.translate(e.x + e.w/2, e.y + e.h/2);
  const w = e.w, h = e.h;

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
  if (gameState === 'playing' || gameState === 'boss') {
    if (!gamePaused) {
      update();
    }
    draw();
    updateTopBar();
    requestAnimationFrame(gameLoop);
  } else if (gameState === 'upgrade') {
    draw(); // Still draw background/ships for effect
    updateTopBar();
    requestAnimationFrame(gameLoop);
  } else if (gameState === 'menu' || gameState === 'gameover') {
    // Only draw menu/overlays
    draw();
    requestAnimationFrame(gameLoop);
  }
}

function rectsCollide(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

// Show menu on load
mainMenu.classList.remove('hidden');
gameOverScreen.classList.add('hidden');
canvas.tabIndex = 0;

// Load high scores and check for saved game
loadHighScores();
updateHighScoresDisplay();
checkForSavedGame();

// Initialize touch support for iOS
initTouchSupport();



// Register service worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(registration => {
        console.log('SW registered: ', registration);
      })
      .catch(registrationError => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

// --- Starfield Background ---
function initStars() {
  stars = [];
  for (let i = 0; i < 100; i++) {
    stars.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2 + 1,
      speed: Math.random() * 2 + 1
    });
  }
}

function updateStars() {
  stars.forEach(star => {
    star.y += star.speed;
    if (star.y > canvas.height + 5) {
      star.y = -5;
      star.x = Math.random() * canvas.width;
    }
  });
}

function drawStars() {
  stars.forEach(star => {
    ctx.fillStyle = `rgba(255, 255, 255, ${star.size / 3})`;
    ctx.fillRect(star.x, star.y, star.size, star.size);
  });
} 

// --- Save/Load System ---
function saveGame() {
  const gameData = {
    player: player,
    score: score,
    lives: lives,
    gameTime: gameTime,
    difficulty: difficulty,
    weaponLevel: player.weaponLevel,
    weaponMultiplier: player.weaponMultiplier,
    playerPowerUps: playerPowerUps,
    options: options,
    timestamp: Date.now()
  };
  
  try {
    localStorage.setItem('kadenAdelynnSave', JSON.stringify(gameData));
    console.log('Game saved successfully');
    return true;
  } catch (error) {
    console.error('Failed to save game:', error);
    return false;
  }
}

function loadGame() {
  try {
    const savedData = localStorage.getItem('kadenAdelynnSave');
    if (!savedData) return false;
    
    const gameData = JSON.parse(savedData);
    
    // Check if save is not too old (24 hours)
    const saveAge = Date.now() - gameData.timestamp;
    if (saveAge > 24 * 60 * 60 * 1000) {
      localStorage.removeItem('kadenAdelynnSave');
      return false;
    }
    
    player = gameData.player;
    score = gameData.score;
    lives = gameData.lives;
    gameTime = gameData.gameTime;
    difficulty = gameData.difficulty;
    player.weaponLevel = gameData.weaponLevel || 1;
    player.weaponMultiplier = gameData.weaponMultiplier || 4;
    playerPowerUps = gameData.playerPowerUps || {
      speed: 0,
      missile: 0,
      double: 0,
      laser: 0,
      option: 0,
      forcefield: 0
    };
    options = gameData.options || [];
    
    // Reset other game elements
    bullets = [];
    enemies = [];
    enemyBullets = [];
    powerUps = [];
    collectibles = [];
    powerCapsules = [];
    particles = [];
    soundEffects = [];
    boss = null;
    bossSpawned = false;
    
    console.log('Game loaded successfully');
    return true;
  } catch (error) {
    console.error('Failed to load game:', error);
    return false;
  }
}

function startAutoSave() {
  // Auto-save every 30 seconds
  autoSaveInterval = setInterval(() => {
    if (gameState === 'playing' && !gamePaused) {
      saveGame();
    }
  }, 30000);
}

function stopAutoSave() {
  if (autoSaveInterval) {
    clearInterval(autoSaveInterval);
    autoSaveInterval = null;
  }
}

function clearSave() {
  localStorage.removeItem('kadenAdelynnSave');
  console.log('Save data cleared');
}

// --- High Scores System ---
function loadHighScores() {
  try {
    const savedScores = localStorage.getItem('kadenAdelynnHighScores');
    if (savedScores) {
      highScores = JSON.parse(savedScores);
    } else {
      highScores = [];
    }
  } catch (error) {
    console.error('Failed to load high scores:', error);
    highScores = [];
  }
}

function saveHighScores() {
  try {
    localStorage.setItem('kadenAdelynnHighScores', JSON.stringify(highScores));
    return true;
  } catch (error) {
    console.error('Failed to save high scores:', error);
    return false;
  }
}

function addHighScore(newScore) {
  // Add new score to the list
  highScores.push(newScore);
  
  // Sort scores in descending order
  highScores.sort((a, b) => b.score - a.score);
  
  // Keep only top 5 scores
  highScores = highScores.slice(0, 5);
  
  // Save to localStorage
  saveHighScores();
  
  // Update display
  updateHighScoresDisplay();
}

function updateHighScoresDisplay() {
  const scoreElements = document.querySelectorAll('#high-scores-list .score-value');
  
  // Fill in the scores
  for (let i = 0; i < 5; i++) {
    if (highScores[i]) {
      scoreElements[i].textContent = highScores[i].score.toLocaleString();
    } else {
      scoreElements[i].textContent = '0';
    }
  }
  
  // Update the HUD high score display
  if (highScores.length > 0) {
    highScoreDisplay.textContent = 'High Score: ' + highScores[0].score.toLocaleString();
  }
}

function checkForNewHighScore() {
  if (highScores.length === 0 || score > highScores[highScores.length - 1].score) {
    // This is a new high score
    const newHighScore = {
      score: score,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString()
    };
    addHighScore(newHighScore);
    return true;
  }
  return false;
}

// --- Pause System ---
function pauseGame() {
  if (gameState === 'playing') {
    gamePaused = true;
    pauseMenu.classList.remove('hidden');
    stopAutoSave();
  }
}

function resumeGame() {
  gamePaused = false;
  pauseMenu.classList.add('hidden');
  startAutoSave();
  canvas.focus();
}

function exitGame(save = true) {
  if (save) {
    saveGame();
  }
  gamePaused = false;
  pauseMenu.classList.add('hidden');
  gameOverScreen.classList.add('hidden');
  mainMenu.classList.remove('hidden');
  gameState = 'menu';
  stopAutoSave();
  resetGame();
}

// Event Listeners
document.addEventListener('keydown', e => {
  if (gameState === 'playing') {
    if (powerUpMenu) {
      // Power-up menu navigation
      switch(e.key) {
        case 'ArrowUp':
          e.preventDefault();
          selectedPowerUp = Math.max(0, selectedPowerUp - 1);
          break;
        case 'ArrowDown':
          e.preventDefault();
          selectedPowerUp = Math.min(POWER_UP_OPTIONS.length - 1, selectedPowerUp + 1);
          break;
        case ' ':
        case 'Spacebar':
          e.preventDefault();
          applyPowerUp();
          powerUpMenu = false;
          break;
      }
      return;
    }
    
    if (e.key === 'Escape') {
      if (gamePaused) {
        resumeGame();
      } else {
        pauseGame();
      }
      return;
    }
    
    keys[e.key] = true;
    if (e.key === ' ' || e.key === 'Spacebar') {
      fireHeld = true;
    }
  }
});



document.addEventListener('keyup', e => {
  if (gameState === 'playing') keys[e.key] = false;
  if (e.key === ' ' || e.key === 'Spacebar') {
    fireHeld = false;
  }
});

// Shooting function
function shoot() {
  if (gameState !== 'playing' || gamePaused) return;
  
  // Shoot with weapon multiplier
  let level = player.weaponLevel || 1;
  let multiplier = player.weaponMultiplier || 4;
  let hasMissiles = playerPowerUps.missile > 0;
  let hasLaser = playerPowerUps.laser > 0;
  
  // Add shooting particles
  for (let i = 0; i < multiplier * 2; i++) {
    createParticle(player.x + player.w/2, player.y, '#00ffff', 3, 15);
  }
  
  // Main weapon shots
  if (level === 1) {
    // Single shot with multiplier
    for (let i = 0; i < multiplier; i++) {
      bullets.push({ 
        x: player.x+player.w/2-4, 
        y: player.y, 
        w: 8, 
        h: 16, 
        speed: 10,
        type: hasLaser ? 'laser' : 'normal'
      });
    }
  } else if (level === 2) {
    // Double shot with multiplier
    for (let i = 0; i < multiplier; i++) {
      bullets.push({ 
        x: player.x+player.w/2-16, 
        y: player.y, 
        w: 8, 
        h: 16, 
        speed: 10,
        type: hasLaser ? 'laser' : 'normal'
      });
      bullets.push({ 
        x: player.x+player.w/2+8, 
        y: player.y, 
        w: 8, 
        h: 16, 
        speed: 10,
        type: hasLaser ? 'laser' : 'normal'
      });
    }
  } else if (level >= 3) {
    // Triple shot with multiplier
    for (let i = 0; i < multiplier; i++) {
      bullets.push({ 
        x: player.x+player.w/2-20, 
        y: player.y, 
        w: 8, 
        h: 16, 
        speed: 10,
        type: hasLaser ? 'laser' : 'normal'
      });
      bullets.push({ 
        x: player.x+player.w/2-4, 
        y: player.y, 
        w: 8, 
        h: 16, 
        speed: 10,
        type: hasLaser ? 'laser' : 'normal'
      });
      bullets.push({ 
        x: player.x+player.w/2+12, 
        y: player.y, 
        w: 8, 
        h: 16, 
        speed: 10,
        type: hasLaser ? 'laser' : 'normal'
      });
    }
  }
  
  // Missiles (if available)
  if (hasMissiles) {
    for (let i = 0; i < playerPowerUps.missile; i++) {
      bullets.push({ 
        x: player.x+player.w/2-6, 
        y: player.y, 
        w: 12, 
        h: 20, 
        speed: 8,
        type: 'missile',
        tracking: true
      });
    }
  }
  
  // Drone shots
  options.forEach(drone => {
    bullets.push({ 
      x: drone.x+drone.w/2-2, 
      y: drone.y, 
      w: 4, 
      h: 12, 
      speed: 12,
      type: 'drone'
    });
  });
}

function applyPowerUp() {
  const selectedOption = POWER_UP_OPTIONS[selectedPowerUp];
  const currentLevel = playerPowerUps[selectedOption.effect] || 0;
  
  if (currentLevel < selectedOption.maxLevel) {
    playerPowerUps[selectedOption.effect] = currentLevel + 1;
    
    // Apply the power-up effect
    switch(selectedOption.effect) {
      case 'speed':
        player.speed = Math.min(player.speed + 1, 8);
        break;
      case 'missile':
        // Missiles will be implemented in shooting
        break;
      case 'double':
        player.weaponLevel = Math.min(player.weaponLevel + 1, 5);
        break;
      case 'laser':
        // Laser will be implemented in shooting
        break;
      case 'option':
        // Add a drone
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
      case 'forcefield':
        player.shield = 300; // Longer shield duration
        break;
    }
    
    playSoundEffect('collect', player.x, player.y);
  }
}

// --- Drone (Options) System ---
function updateDrones() {
  options.forEach(drone => {
    // Calculate target position relative to player
    const targetX = player.x + drone.offsetX;
    const targetY = player.y + drone.offsetY;
    
    // Smooth movement towards target position
    const dx = targetX - drone.x;
    const dy = targetY - drone.y;
    drone.x += dx * 0.1;
    drone.y += dy * 0.1;
    
    // Keep drones within screen bounds
    drone.x = Math.max(0, Math.min(canvas.width - drone.w, drone.x));
    drone.y = Math.max(0, Math.min(canvas.height - drone.h, drone.y));
  });
}

function drawDrones() {
  options.forEach(drone => {
    ctx.save();
    ctx.translate(drone.x + drone.w/2, drone.y + drone.h/2);
    
    // Drone glow effect
    const glowGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 15);
    glowGradient.addColorStop(0, '#00ffff80');
    glowGradient.addColorStop(0.5, '#00ffff40');
    glowGradient.addColorStop(1, 'transparent');
    
    ctx.fillStyle = glowGradient;
    ctx.beginPath();
    ctx.arc(0, 0, 15, 0, Math.PI * 2);
    ctx.fill();
    
    // Drone body
    const droneGradient = ctx.createLinearGradient(-drone.w/2, -drone.h/2, drone.w/2, drone.h/2);
    droneGradient.addColorStop(0, '#00ffff');
    droneGradient.addColorStop(0.5, '#ffffff');
    droneGradient.addColorStop(1, '#00ffff');
    
    ctx.fillStyle = droneGradient;
    ctx.beginPath();
    ctx.arc(0, 0, drone.w/2, 0, Math.PI * 2);
    ctx.fill();
    
    // Drone outline
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.shadowColor = '#00ffff';
    ctx.shadowBlur = 6;
    ctx.stroke();
    ctx.shadowBlur = 0;
    
    // Drone weapon
    ctx.fillStyle = '#ff4444';
    ctx.fillRect(-2, -drone.h/2 - 2, 4, 4);
    
    ctx.restore();
  });
}

// Button Event Handlers
startBtn.onclick = () => {
  mainMenu.classList.add('hidden');
  gameOverScreen.classList.add('hidden');
  canvas.focus();
  resetGame();
  gameState = 'playing';
  startAutoSave();
  gameLoop();
};

continueBtn.onclick = () => {
  if (loadGame()) {
    mainMenu.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    canvas.focus();
    gameState = 'playing';
    startAutoSave();
    gameLoop();
  } else {
    // If load fails, hide continue button
    continueBtn.classList.add('hidden');
  }
};

restartBtn.onclick = () => {
  gameOverScreen.classList.add('hidden');
  mainMenu.classList.add('hidden');
  canvas.focus();
  resetGame();
  gameState = 'playing';
  startAutoSave();
  gameLoop();
};

mainMenuBtn.onclick = () => {
  exitGame(false);
};

resumeBtn.onclick = () => {
  resumeGame();
};

saveExitBtn.onclick = () => {
  exitGame(true);
};

exitNoSaveBtn.onclick = () => {
  exitGame(false);
}; 

// Check for saved game on load
function checkForSavedGame() {
  const savedData = localStorage.getItem('kadenAdelynnSave');
  if (savedData) {
    try {
      const gameData = JSON.parse(savedData);
      const saveAge = Date.now() - gameData.timestamp;
      if (saveAge <= 24 * 60 * 60 * 1000) {
        continueBtn.classList.remove('hidden');
        return true;
      } else {
        // Clear old save
        localStorage.removeItem('kadenAdelynnSave');
      }
    } catch (error) {
      console.error('Error checking saved game:', error);
    }
  }
  continueBtn.classList.add('hidden');
  return false;
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