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

// Touch Controls
const touchControls = document.getElementById('touch-controls');
const joystick = document.getElementById('joystick');
const joystickThumb = document.getElementById('joystick-thumb');
const fireBtn = document.getElementById('fire-btn');
const pauseBtn = document.getElementById('pause-btn');

// Pause Menu
const pauseMenu = document.getElementById('pause-menu');
const resumeBtn = document.getElementById('resume-btn');
const saveExitBtn = document.getElementById('save-exit-btn');
const exitNoSaveBtn = document.getElementById('exit-no-save-btn');

// Continue button
const continueBtn = document.getElementById('continue-btn');

let gameState = 'menu';
let player, bullets, enemies, score, lives, keys, enemyTimer;
let gameTime = 0;
let difficulty = 1;
let bossSpawned = false;
let boss = null;
let gamePaused = false;
let autoSaveInterval = null;

// Starfield background
let stars = [];

// Touch control variables
let isTouchDevice = false;
let joystickActive = false;
let joystickCenter = { x: 0, y: 0 };
let joystickRadius = 0;
let touchDirection = { x: 0, y: 0 };
let fireButtonPressed = false;

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

// --- Collectibles ---
let collectibles = [];
const COLLECTIBLE_TYPES = [
  { type: 'money', emoji: '💰', value: 50, color: '#ffd700' },
  { type: 'weapon', emoji: '🚀', value: 100, color: '#ff4444' },
  { type: 'health', emoji: '❤️', value: 75, color: '#ff6b6b' },
  { type: 'shield', emoji: '🛡️', value: 80, color: '#00ffff' },
  { type: 'speed', emoji: '⚡', value: 60, color: '#ffff00' },
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
        case 'weapon':
          player.weaponLevel = Math.min((player.weaponLevel || 1) + 1, 5);
          score += c.value;
          playSoundEffect('collect', c.x, c.y);
          break;
        case 'health':
          lives = Math.min(lives + 1, 5);
          score += c.value;
          playSoundEffect('collect', c.x, c.y);
          break;
        case 'shield':
          player.shield = 180;
          score += c.value;
          playSoundEffect('collect', c.x, c.y);
          break;
        case 'speed':
          player.speed = Math.min(player.speed + 1, 8);
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
  const side = Math.floor(Math.random() * 4); // 0: top, 1: right, 2: bottom, 3: left
  let x, y;
  
  if (side === 0) { // Top
    x = Math.random() * (canvas.width - 32) + 8;
    y = -32;
  } else if (side === 1) { // Right
    x = canvas.width + 32;
    y = Math.random() * (canvas.height - 32) + 8;
  } else if (side === 2) { // Bottom
    x = Math.random() * (canvas.width - 32) + 8;
    y = canvas.height + 32;
  } else { // Left
    x = -32;
    y = Math.random() * (canvas.height - 32) + 8;
  }
  
  const type = Math.random() < 0.7 ? 'basic' : 'shooter';
  if (type === 'basic') {
    enemies.push({ x, y, w: 32, h: 24, type, lifeTimer: 0, spawnSide: side });
  } else {
    enemies.push({ x, y, w: 32, h: 24, type, shootTimer: 0, lifeTimer: 0, spawnSide: side });
  }
}
let enemyBullets = [];
function updateEnemies() {
  // Enemies move toward the player
  for (let e of enemies) {
    // Initialize enemy properties
    if (!e.movementSpeed) {
      e.movementSpeed = 1 + Math.random() * 2;
    }
    
    // Calculate direction toward player
    const dx = player.x - e.x;
    const dy = player.y - e.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance > 0) {
      // Move toward player
      e.x += (dx / distance) * e.movementSpeed;
      e.y += (dy / distance) * e.movementSpeed;
    }
    
    // Add some random movement for variety
    if (!e.randomOffset) {
      e.randomOffset = Math.random() * Math.PI * 2;
      e.randomSpeed = 0.5 + Math.random() * 1;
    }
    
    e.randomOffset += e.randomSpeed * 0.02;
    e.x += Math.sin(e.randomOffset) * 0.5;
    e.y += Math.cos(e.randomOffset) * 0.5;
    
    // Keep enemies within screen bounds
    e.x = Math.max(-e.w, Math.min(canvas.width + e.w, e.x));
    e.y = Math.max(-e.h, Math.min(canvas.height + e.h, e.y));
    
    // Update life timer
    e.lifeTimer = (e.lifeTimer || 0) + 1;
    
    // Shooter enemies fire at regular intervals
    if (e.type === 'shooter') {
      e.shootTimer = (e.shootTimer || 0) + 1;
      if (e.shootTimer > 90) { // Shoot every 1.5 seconds
        // Calculate direction toward player for shooting
        const shootDx = player.x - e.x;
        const shootDy = player.y - e.y;
        const shootDistance = Math.sqrt(shootDx * shootDx + shootDy * shootDy);
        
        if (shootDistance > 0) {
          const bulletSpeed = 4;
          const bulletDx = (shootDx / shootDistance) * bulletSpeed;
          const bulletDy = (shootDy / shootDistance) * bulletSpeed;
          
          enemyBullets.push({ 
            x: e.x + e.w/2 - 3, 
            y: e.y + e.h/2 - 3, 
            w: 6, 
            h: 6, 
            speed: bulletSpeed,
            dx: bulletDx,
            dy: bulletDy
          });
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
  // Enemy bullets move in their calculated direction
  for (let i = enemyBullets.length-1; i >= 0; i--) {
    const b = enemyBullets[i];
    
    // Move bullet in its direction
    b.x += b.dx;
    b.y += b.dy;
    
    // Remove bullets that go off screen
    if (b.x < -20 || b.x > canvas.width + 20 || b.y < -20 || b.y > canvas.height + 20) {
      enemyBullets.splice(i, 1);
      continue;
    }
    
    // Check collision with player
    if (rectsCollide(player, b)) {
      if (player.shield > 0) {
        player.shield = 0;
      } else {
        lives--;
        if (lives <= 0) {
          endGame();
          return;
        }
      }
      enemyBullets.splice(i, 1);
      createParticle(b.x, b.y, '#ff0000', 3, 20);
      playSoundEffect('hit', b.x, b.y);
    }
  }
}
function drawEnemyBullets() {
  enemyBullets.forEach(b => {
    ctx.save();
    ctx.translate(b.x + b.w/2, b.y + b.h/2);
    
    // Enemy bullet glow (red/orange)
    const bulletGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, b.w/2);
    bulletGradient.addColorStop(0, '#ffffff');
    bulletGradient.addColorStop(0.5, '#ff4444');
    bulletGradient.addColorStop(1, 'transparent');
    
    ctx.fillStyle = bulletGradient;
    ctx.beginPath();
    ctx.arc(0, 0, b.w/2, 0, Math.PI * 2);
    ctx.fill();
    
    // Enemy bullet trail (in direction of movement)
    ctx.strokeStyle = '#ff4444';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    // Calculate trail direction based on bullet movement
    const angle = Math.atan2(-b.dy, -b.dx);
    const trailLength = 8;
    const trailX = Math.cos(angle) * trailLength;
    const trailY = Math.sin(angle) * trailLength;
    
    ctx.moveTo(trailX, trailY);
    ctx.lineTo(0, 0);
    ctx.stroke();
    
    ctx.restore();
  });
}

function resetGame() {
  player = { x: canvas.width/2-16, y: canvas.height/2-12, w: 32, h: 24, speed: 4, weaponLevel: 1, shield: 0, weaponMultiplier: 4 };
  bullets = [];
  enemies = [];
  enemyBullets = [];
  powerUps = [];
  collectibles = [];
  particles = [];
  soundEffects = [];
  score = 0;
  lives = 3;
  keys = {};
  enemyTimer = 0;
  initStars();
  gameTime = 0;
  difficulty = 1;
  bossSpawned = false;
  boss = null;
  
  // Initialize high score display
  const highScore = localStorage.getItem('highScore') || 0;
  highScoreDisplay.textContent = 'High Score: ' + highScore;
}

function update() {
  updateStars();
  updateParticles();
  updateSoundEffects();
  updateBoss();
  // Player movement - full movement allowed
  if (keys['ArrowLeft'] || (isTouchDevice && touchDirection.x < -0.3)) player.x -= player.speed;
  if (keys['ArrowRight'] || (isTouchDevice && touchDirection.x > 0.3)) player.x += player.speed;
  if (keys['ArrowUp'] || (isTouchDevice && touchDirection.y < -0.3)) player.y -= player.speed;
  if (keys['ArrowDown'] || (isTouchDevice && touchDirection.y > 0.3)) player.y += player.speed;
  // Keep player within screen bounds
  player.x = Math.max(0, Math.min(canvas.width - player.w, player.x));
  player.y = Math.max(0, Math.min(canvas.height - player.h, player.y));

  // Bullets
  bullets.forEach(b => b.y -= b.speed);
  bullets = bullets.filter(b => b.y > -20);

  // Enemies
  updateEnemies();

  // Enemy bullets
  updateEnemyBullets();

  // Power-ups
  updatePowerUps();

  // Collectibles
  updateCollectibles();

  // Collisions: bullets vs enemies
  for (let i = enemies.length-1; i >= 0; i--) {
    for (let j = bullets.length-1; j >= 0; j--) {
      if (rectsCollide(enemies[i], bullets[j])) {
        // 30% chance to drop collectible
        if (Math.random() < 0.3) spawnCollectible(enemies[i].x, enemies[i].y);
        enemies.splice(i,1);
        bullets.splice(j,1);
        score += 100;
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
  if (enemyTimer > 50) {
    spawnEnemy();
    enemyTimer = 0;
  }
  // Shield timer
  if (player.shield > 0) player.shield--;
  
  // Touch shooting
  if (isTouchDevice && fireButtonPressed) {
    shoot();
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
}

function drawPlayerShip() {
  ctx.save();
  ctx.translate(player.x + player.w/2, player.y + player.h/2);
  
  // Blue and silver triangle design with multiple weapons
  const bodyGradient = ctx.createLinearGradient(-player.w/2, -player.h/2, player.w/2, player.h/2);
  bodyGradient.addColorStop(0, '#0066cc');
  bodyGradient.addColorStop(0.3, '#0099ff');
  bodyGradient.addColorStop(0.7, '#c0c0c0');
  bodyGradient.addColorStop(1, '#e6e6e6');
  
  // Main body (triangle shape pointing upward)
  ctx.fillStyle = bodyGradient;
  ctx.beginPath();
  ctx.moveTo(0, -player.h/2);
  ctx.lineTo(-player.w/2, player.h/2);
  ctx.lineTo(player.w/2, player.h/2);
  ctx.closePath();
  ctx.fill();
  
  // Silver metallic outline
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.stroke();
  
  // Cockpit (bright blue)
  const cockpitGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 8);
  cockpitGradient.addColorStop(0, '#00ffff');
  cockpitGradient.addColorStop(0.5, '#0099ff');
  cockpitGradient.addColorStop(1, 'transparent');
  
  ctx.fillStyle = cockpitGradient;
  ctx.beginPath();
  ctx.arc(0, 0, 8, 0, Math.PI * 2);
  ctx.fill();
  
  // Multiple weapon systems
  const weaponLevel = player.weaponLevel || 1;
  
  // Primary gun (center)
  ctx.fillStyle = '#ff4444';
  ctx.fillRect(-3, -player.h/2 - 2, 6, 6);
  
  // Secondary guns (if weapon level 2+)
  if (weaponLevel >= 2) {
    ctx.fillStyle = '#ff8800';
    ctx.fillRect(-player.w/2 + 4, -player.h/2 - 3, 4, 4);
    ctx.fillRect(player.w/2 - 8, -player.h/2 - 3, 4, 4);
  }
  
  // Tertiary guns (if weapon level 3+)
  if (weaponLevel >= 3) {
    ctx.fillStyle = '#ffff00';
    ctx.fillRect(-player.w/2 + 8, -player.h/2 - 4, 3, 3);
    ctx.fillRect(player.w/2 - 11, -player.h/2 - 4, 3, 3);
  }
  
  // Missile launchers (if weapon level 4+)
  if (weaponLevel >= 4) {
    ctx.fillStyle = '#ff00ff';
    ctx.fillRect(-player.w/2 + 12, -player.h/2 - 5, 2, 2);
    ctx.fillRect(player.w/2 - 14, -player.h/2 - 5, 2, 2);
  }
  
  // Heavy weapons (if weapon level 5)
  if (weaponLevel >= 5) {
    ctx.fillStyle = '#00ff00';
    ctx.fillRect(-player.w/2 + 16, -player.h/2 - 6, 1, 1);
    ctx.fillRect(player.w/2 - 17, -player.h/2 - 6, 1, 1);
  }
  
  // Engine exhaust (blue flame)
  const engineGradient = ctx.createLinearGradient(-player.w/2, player.h/2, 0, player.h/2 + 12);
  engineGradient.addColorStop(0, '#00ffff');
  engineGradient.addColorStop(0.3, '#0099ff');
  engineGradient.addColorStop(0.7, '#0066cc');
  engineGradient.addColorStop(1, 'transparent');
  
  ctx.fillStyle = engineGradient;
  ctx.beginPath();
  ctx.moveTo(-player.w/2 + 4, player.h/2);
  ctx.lineTo(-player.w/2 + 2, player.h/2 + 12);
  ctx.lineTo(player.w/2 - 2, player.h/2 + 12);
  ctx.lineTo(player.w/2 - 4, player.h/2);
  ctx.closePath();
  ctx.fill();
  
  // Wing details (silver)
  ctx.strokeStyle = '#c0c0c0';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-player.w/2, -player.h/2 + 4);
  ctx.lineTo(-player.w/2 - 4, -player.h/2 + 12);
  ctx.moveTo(player.w/2, -player.h/2 + 4);
  ctx.lineTo(player.w/2 + 4, -player.h/2 + 12);
  ctx.stroke();
  
  // Shield effect (blue)
  if (player.shield > 0) {
    const shieldGradient = ctx.createRadialGradient(0, 0, 15, 0, 0, 30);
    shieldGradient.addColorStop(0, 'rgba(0, 255, 255, 0.3)');
    shieldGradient.addColorStop(0.7, 'rgba(0, 153, 255, 0.1)');
    shieldGradient.addColorStop(1, 'transparent');
    
    ctx.fillStyle = shieldGradient;
    ctx.beginPath();
    ctx.arc(0, 0, 30, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.strokeStyle = '#00ffff';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.arc(0, 0, 27, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
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

function drawBasicEnemy(e) {
  // Main body gradient
  const bodyGradient = ctx.createLinearGradient(-e.w/2, -e.h/2, e.w/2, e.h/2);
  bodyGradient.addColorStop(0, '#2d1b69');
  bodyGradient.addColorStop(0.3, '#4c1d95');
  bodyGradient.addColorStop(0.7, '#7c3aed');
  bodyGradient.addColorStop(1, '#a855f7');
  
  // Draw main body (diamond shape)
  ctx.fillStyle = bodyGradient;
  ctx.beginPath();
  ctx.moveTo(0, -e.h/2);
  ctx.lineTo(e.w/2 - 2, 0);
  ctx.lineTo(0, e.h/2);
  ctx.lineTo(-e.w/2 + 2, 0);
  ctx.closePath();
  ctx.fill();
  
  // Central core
  const coreGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 6);
  coreGradient.addColorStop(0, '#ff6b6b');
  coreGradient.addColorStop(0.7, '#ee5a24');
  coreGradient.addColorStop(1, 'transparent');
  
  ctx.fillStyle = coreGradient;
  ctx.beginPath();
  ctx.arc(0, 0, 6, 0, Math.PI * 2);
  ctx.fill();
  
  // Wing details
  ctx.strokeStyle = '#a855f7';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-e.w/2 + 4, -e.h/2 + 2);
  ctx.lineTo(-e.w/2 + 8, -e.h/2);
  ctx.moveTo(-e.w/2 + 4, e.h/2 - 2);
  ctx.lineTo(-e.w/2 + 8, e.h/2);
  ctx.stroke();
  
  // Weapon pods
  ctx.fillStyle = '#ff6b6b';
  ctx.fillRect(-e.w/2 + 2, -e.h/2 + 4, 4, 4);
  ctx.fillRect(-e.w/2 + 2, e.h/2 - 8, 4, 4);
}

function drawShooterEnemy(e) {
  // Main body gradient (more aggressive colors)
  const bodyGradient = ctx.createLinearGradient(-e.w/2, -e.h/2, e.w/2, e.h/2);
  bodyGradient.addColorStop(0, '#450a0a');
  bodyGradient.addColorStop(0.3, '#7f1d1d');
  bodyGradient.addColorStop(0.7, '#dc2626');
  bodyGradient.addColorStop(1, '#ef4444');
  
  // Draw main body (hexagonal shape)
  ctx.fillStyle = bodyGradient;
  ctx.beginPath();
  ctx.moveTo(-e.w/2 + 2, -e.h/2);
  ctx.lineTo(e.w/2 - 2, -e.h/2);
  ctx.lineTo(e.w/2, 0);
  ctx.lineTo(e.w/2 - 2, e.h/2);
  ctx.lineTo(-e.w/2 + 2, e.h/2);
  ctx.lineTo(-e.w/2, 0);
  ctx.closePath();
  ctx.fill();
  
  // Central weapon core
  const weaponGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 8);
  weaponGradient.addColorStop(0, '#fbbf24');
  weaponGradient.addColorStop(0.5, '#f59e0b');
  weaponGradient.addColorStop(1, '#d97706');
  
  ctx.fillStyle = weaponGradient;
  ctx.beginPath();
  ctx.arc(0, 0, 8, 0, Math.PI * 2);
  ctx.fill();
  
  // Weapon charging effect
  if (e.shootTimer > 45) {
    const chargeGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 12);
    chargeGradient.addColorStop(0, 'rgba(251, 191, 36, 0.8)');
    chargeGradient.addColorStop(1, 'transparent');
    
    ctx.fillStyle = chargeGradient;
    ctx.beginPath();
    ctx.arc(0, 0, 12, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // Wing structures
  ctx.strokeStyle = '#ef4444';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-e.w/2 + 4, -e.h/2 + 2);
  ctx.lineTo(-e.w/2 + 12, -e.h/2 - 2);
  ctx.moveTo(-e.w/2 + 4, e.h/2 - 2);
  ctx.lineTo(-e.w/2 + 12, e.h/2 + 2);
  ctx.stroke();
  
  // Weapon barrels
  ctx.fillStyle = '#1f2937';
  ctx.fillRect(e.w/2 - 4, -e.h/2 + 6, 6, 4);
  ctx.fillRect(e.w/2 - 4, e.h/2 - 10, 6, 4);
}

function drawBullets() {
  bullets.forEach(b => {
    ctx.save();
    ctx.translate(b.x + b.w/2, b.y + b.h/2);
    
    // Bullet glow
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
    
    ctx.restore();
  });
}

function gameLoop() {
  if (gameState === 'playing') {
    if (!gamePaused) {
      update();
    }
    draw();
    
    // Update HUD
    scoreDisplay.textContent = 'Score: ' + score;
    livesDisplay.textContent = 'Lives: ' + lives;
    weaponLevelDisplay.textContent = 'Weapon: Level ' + (player.weaponLevel || 1) + ' (x' + (player.weaponMultiplier || 4) + ')';
    difficultyDisplay.textContent = 'Difficulty: ' + difficulty;
    
    // Format time (MM:SS)
    const minutes = Math.floor(gameTime / 3600);
    const seconds = Math.floor((gameTime % 3600) / 60);
    timeDisplay.textContent = 'Time: ' + minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
    
    // Update high score
    const highScore = localStorage.getItem('highScore') || 0;
    if (score > highScore) {
      localStorage.setItem('highScore', score);
      highScoreDisplay.textContent = 'High Score: ' + score;
    } else {
      highScoreDisplay.textContent = 'High Score: ' + highScore;
    }
    
    requestAnimationFrame(gameLoop);
  }
}

function rectsCollide(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function endGame() {
  gameState = 'gameover';
  finalScore.textContent = 'Final Score: ' + score;
  gameOverScreen.classList.remove('hidden');
  mainMenu.classList.add('hidden');
  stopAutoSave();
  saveGame(); // Auto-save on game over
}

// Show menu on load
mainMenu.classList.remove('hidden');
gameOverScreen.classList.add('hidden');
canvas.tabIndex = 0;

// Check for saved game
checkForSavedGame();

// Initialize touch controls
function initTouchControls() {
  // Detect touch device
  isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  
  if (isTouchDevice) {
    touchControls.classList.remove('hidden');
    
    // Initialize joystick
    const joystickRect = joystick.getBoundingClientRect();
    joystickCenter = {
      x: joystickRect.left + joystickRect.width / 2,
      y: joystickRect.top + joystickRect.height / 2
    };
    joystickRadius = joystickRect.width / 2 - 20;
    
    // Joystick touch events
    joystick.addEventListener('touchstart', handleJoystickStart);
    joystick.addEventListener('touchmove', handleJoystickMove);
    joystick.addEventListener('touchend', handleJoystickEnd);
    
    // Fire button touch events
    fireBtn.addEventListener('touchstart', handleFireStart);
    fireBtn.addEventListener('touchend', handleFireEnd);

    // Pause button touch events
    pauseBtn.addEventListener('touchstart', handlePauseStart);
    pauseBtn.addEventListener('touchend', handlePauseEnd);
    
    // Prevent default touch behaviors
    joystick.addEventListener('touchstart', e => e.preventDefault());
    joystick.addEventListener('touchmove', e => e.preventDefault());
    fireBtn.addEventListener('touchstart', e => e.preventDefault());
    pauseBtn.addEventListener('touchstart', e => e.preventDefault());
  }
}

function handleJoystickStart(e) {
  e.preventDefault();
  joystickActive = true;
  handleJoystickMove(e);
}

function handleJoystickMove(e) {
  if (!joystickActive) return;
  e.preventDefault();
  
  const touch = e.touches[0];
  const dx = touch.clientX - joystickCenter.x;
  const dy = touch.clientY - joystickCenter.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  if (distance <= joystickRadius) {
    touchDirection.x = dx / joystickRadius;
    touchDirection.y = dy / joystickRadius;
    joystickThumb.style.transform = `translate(${dx}px, ${dy}px)`;
  } else {
    const angle = Math.atan2(dy, dx);
    touchDirection.x = Math.cos(angle);
    touchDirection.y = Math.sin(angle);
    joystickThumb.style.transform = `translate(${Math.cos(angle) * joystickRadius}px, ${Math.sin(angle) * joystickRadius}px)`;
  }
}

function handleJoystickEnd(e) {
  e.preventDefault();
  joystickActive = false;
  touchDirection.x = 0;
  touchDirection.y = 0;
  joystickThumb.style.transform = 'translate(-50%, -50%)';
}

function handleFireStart(e) {
  e.preventDefault();
  fireButtonPressed = true;
}

function handleFireEnd(e) {
  e.preventDefault();
  fireButtonPressed = false;
}

function handlePauseStart(e) {
  e.preventDefault();
  pauseGame();
}

function handlePauseEnd(e) {
  e.preventDefault();
  // No action needed here, pauseGame handles visibility
}

// Initialize touch controls on load
document.addEventListener('DOMContentLoaded', initTouchControls);

// Register service worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
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
    
    // Reset other game elements
    bullets = [];
    enemies = [];
    enemyBullets = [];
    powerUps = [];
    collectibles = [];
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
      shoot();
    }
  }
});

document.addEventListener('keyup', e => {
  if (gameState === 'playing') keys[e.key] = false;
});

// Shooting function
function shoot() {
  if (gameState !== 'playing' || gamePaused) return;
  
  // Shoot with weapon multiplier
  let level = player.weaponLevel || 1;
  let multiplier = player.weaponMultiplier || 4;
  
  // Add shooting particles
  for (let i = 0; i < multiplier * 2; i++) {
    createParticle(player.x + player.w/2, player.y, '#00ffff', 3, 15);
  }
  
  if (level === 1) {
    // Single shot with multiplier
    for (let i = 0; i < multiplier; i++) {
      bullets.push({ x: player.x+player.w/2-3, y: player.y, w: 6, h: 12, speed: 8 });
    }
  } else if (level === 2) {
    // Double shot with multiplier
    for (let i = 0; i < multiplier; i++) {
      bullets.push({ x: player.x+player.w/2-10, y: player.y, w: 6, h: 12, speed: 8 });
      bullets.push({ x: player.x+player.w/2+4, y: player.y, w: 6, h: 12, speed: 8 });
    }
  } else if (level >= 3) {
    // Triple shot with multiplier
    for (let i = 0; i < multiplier; i++) {
      bullets.push({ x: player.x+player.w/2-12, y: player.y, w: 6, h: 12, speed: 8 });
      bullets.push({ x: player.x+player.w/2-3, y: player.y, w: 6, h: 12, speed: 8 });
      bullets.push({ x: player.x+player.w/2+8, y: player.y, w: 6, h: 12, speed: 8 });
    }
  }
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