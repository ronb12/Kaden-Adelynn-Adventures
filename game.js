const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const hud = document.getElementById('hud');
const mainMenu = document.getElementById('main-menu');
const startBtn = document.getElementById('start-btn');
const gameOverScreen = document.getElementById('game-over');
const restartBtn = document.getElementById('restart-btn');
const scoreDisplay = document.getElementById('score');
const livesDisplay = document.getElementById('lives');
const finalScore = document.getElementById('final-score');
const highScoreDisplay = document.getElementById('high-score');
const weaponLevelDisplay = document.getElementById('weapon-level');
const difficultyDisplay = document.getElementById('difficulty');
const timeDisplay = document.getElementById('time');

let gameState = 'menu';
let player, bullets, enemies, score, lives, keys, enemyTimer;
let gameTime = 0;
let difficulty = 1;
let bossSpawned = false;
let boss = null;

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
  // Collectibles move from right to left
  collectibles.forEach(c => {
    c.x -= 1; // Slow movement
    c.floatOffset += c.floatSpeed;
  });
  
  // Remove collectibles that go off screen
  collectibles = collectibles.filter(c => c.x > -30);
  
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
  const y = Math.random() * (canvas.height - 32) + 8;
  const x = canvas.width + 32; // Spawn from right side of screen
  const type = Math.random() < 0.7 ? 'basic' : 'shooter';
  if (type === 'basic') {
    enemies.push({ x, y, w: 32, h: 24, type, lifeTimer: 0 });
  } else {
    enemies.push({ x, y, w: 32, h: 24, type, shootTimer: 0, lifeTimer: 0 });
  }
}
let enemyBullets = [];
function updateEnemies() {
  // Enemies move from right to left like Gradius
  for (let e of enemies) {
    // Initialize enemy properties
    if (!e.movementSpeed) {
      e.movementSpeed = 2 + Math.random() * 2;
    }
    
    // Move from right to left
    e.x -= e.movementSpeed;
    
    // Add some vertical movement patterns
    if (!e.verticalPattern) {
      e.verticalPattern = Math.random() < 0.5 ? 'sine' : 'linear';
      e.verticalSpeed = 0.5 + Math.random() * 1;
      e.verticalDirection = Math.random() < 0.5 ? 1 : -1;
      e.originalY = e.y;
      e.sineOffset = Math.random() * Math.PI * 2;
    }
    
    // Vertical movement patterns
    if (e.verticalPattern === 'sine') {
      e.y = e.originalY + Math.sin((e.x + e.sineOffset) * 0.02) * 30;
    } else if (e.verticalPattern === 'linear') {
      e.y += e.verticalSpeed * e.verticalDirection;
      if (e.y > e.originalY + 40 || e.y < e.originalY - 40) {
        e.verticalDirection *= -1;
      }
    }
    
    // Keep enemies within screen bounds
    e.y = Math.max(10, Math.min(canvas.height - e.h - 10, e.y));
    
    // Update life timer
    e.lifeTimer = (e.lifeTimer || 0) + 1;
    
    // Shooter enemies fire at regular intervals
    if (e.type === 'shooter') {
      e.shootTimer = (e.shootTimer || 0) + 1;
      if (e.shootTimer > 90) { // Shoot every 1.5 seconds
        // Shoot straight left
        enemyBullets.push({ 
          x: e.x, 
          y: e.y + e.h/2 - 3, 
          w: 10, 
          h: 6, 
          speed: 6,
          dx: -6,
          dy: 0
        });
        e.shootTimer = 0;
      }
    }
  }
  
  // Remove enemies that go off the left side of screen
  enemies = enemies.filter(e => e.x > -e.w);
}
function updateEnemyBullets() {
  // Enemy bullets move from right to left
  for (let i = enemyBullets.length-1; i >= 0; i--) {
    const b = enemyBullets[i];
    
    // Move bullet left
    b.x -= b.speed;
    
    // Remove bullets that go off the left side of screen
    if (b.x < -20) {
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
    
    // Enemy bullet trail
    ctx.strokeStyle = '#ff4444';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(b.w/2 + 4, 0);
    ctx.lineTo(b.w/2, 0);
    ctx.stroke();
    
    ctx.restore();
  });
}

function resetGame() {
  player = { x: 40, y: canvas.height/2-16, w: 32, h: 24, speed: 4, weaponLevel: 1, shield: 0 };
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
  // Player movement - only vertical movement allowed
  if (keys['ArrowUp']) player.y -= player.speed;
  if (keys['ArrowDown']) player.y += player.speed;
  // Remove left/right movement - player stays at fixed horizontal position
  player.y = Math.max(0, Math.min(canvas.height - player.h, player.y));
  // Keep player at fixed horizontal position (40 pixels from left edge)
  player.x = 40;

  // Bullets
  bullets.forEach(b => b.x += b.speed);
  bullets = bullets.filter(b => b.x < canvas.width + 20);

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
  
  // Main body (triangle shape)
  ctx.fillStyle = bodyGradient;
  ctx.beginPath();
  ctx.moveTo(-player.w/2, -player.h/2);
  ctx.lineTo(player.w/2, 0);
  ctx.lineTo(-player.w/2, player.h/2);
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
  ctx.arc(-2, 0, 8, 0, Math.PI * 2);
  ctx.fill();
  
  // Multiple weapon systems
  const weaponLevel = player.weaponLevel || 1;
  
  // Primary gun (center)
  ctx.fillStyle = '#ff4444';
  ctx.fillRect(player.w/2 - 2, -3, 6, 6);
  
  // Secondary guns (if weapon level 2+)
  if (weaponLevel >= 2) {
    ctx.fillStyle = '#ff8800';
    ctx.fillRect(player.w/2 - 3, -player.h/2 + 4, 4, 4);
    ctx.fillRect(player.w/2 - 3, player.h/2 - 8, 4, 4);
  }
  
  // Tertiary guns (if weapon level 3+)
  if (weaponLevel >= 3) {
    ctx.fillStyle = '#ffff00';
    ctx.fillRect(player.w/2 - 4, -player.h/2 + 8, 3, 3);
    ctx.fillRect(player.w/2 - 4, player.h/2 - 11, 3, 3);
  }
  
  // Missile launchers (if weapon level 4+)
  if (weaponLevel >= 4) {
    ctx.fillStyle = '#ff00ff';
    ctx.fillRect(player.w/2 - 5, -player.h/2 + 12, 2, 2);
    ctx.fillRect(player.w/2 - 5, player.h/2 - 14, 2, 2);
  }
  
  // Heavy weapons (if weapon level 5)
  if (weaponLevel >= 5) {
    ctx.fillStyle = '#00ff00';
    ctx.fillRect(player.w/2 - 6, -player.h/2 + 16, 1, 1);
    ctx.fillRect(player.w/2 - 6, player.h/2 - 17, 1, 1);
  }
  
  // Engine exhaust (blue flame)
  const engineGradient = ctx.createLinearGradient(-player.w/2, -player.h/2, -player.w/2 - 12, 0);
  engineGradient.addColorStop(0, '#00ffff');
  engineGradient.addColorStop(0.3, '#0099ff');
  engineGradient.addColorStop(0.7, '#0066cc');
  engineGradient.addColorStop(1, 'transparent');
  
  ctx.fillStyle = engineGradient;
  ctx.beginPath();
  ctx.moveTo(-player.w/2, -player.h/2 + 4);
  ctx.lineTo(-player.w/2 - 12, -player.h/2 + 2);
  ctx.lineTo(-player.w/2 - 12, player.h/2 - 2);
  ctx.lineTo(-player.w/2, player.h/2 - 4);
  ctx.closePath();
  ctx.fill();
  
  // Wing details (silver)
  ctx.strokeStyle = '#c0c0c0';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-player.w/2 + 4, -player.h/2);
  ctx.lineTo(-player.w/2 + 12, -player.h/2 - 4);
  ctx.moveTo(-player.w/2 + 4, player.h/2);
  ctx.lineTo(-player.w/2 + 12, player.h/2 + 4);
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
    ctx.moveTo(-b.w/2 - 4, 0);
    ctx.lineTo(-b.w/2, 0);
    ctx.stroke();
    
    ctx.restore();
  });
}

function gameLoop() {
  if (gameState === 'playing') {
    update();
    draw();
    
    // Update HUD
    scoreDisplay.textContent = 'Score: ' + score;
    livesDisplay.textContent = 'Lives: ' + lives;
    weaponLevelDisplay.textContent = 'Weapon: Level ' + (player.weaponLevel || 1);
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

document.addEventListener('keydown', e => {
  if (gameState === 'playing') {
    keys[e.key] = true;
    if (e.key === ' ' || e.key === 'Spacebar') {
      // Shoot
      let level = player.weaponLevel || 1;
      if (level === 1) {
        bullets.push({ x: player.x+player.w, y: player.y+player.h/2-3, w: 12, h: 6, speed: 8 });
      } else if (level === 2) {
        bullets.push({ x: player.x+player.w, y: player.y+player.h/2-10, w: 12, h: 6, speed: 8 });
        bullets.push({ x: player.x+player.w, y: player.y+player.h/2+4, w: 12, h: 6, speed: 8 });
      } else if (level >= 3) {
        bullets.push({ x: player.x+player.w, y: player.y+player.h/2-12, w: 12, h: 6, speed: 8 });
        bullets.push({ x: player.x+player.w, y: player.y+player.h/2-3, w: 12, h: 6, speed: 8 });
        bullets.push({ x: player.x+player.w, y: player.y+player.h/2+8, w: 12, h: 6, speed: 8 });
      }
    }
  }
});
document.addEventListener('keyup', e => {
  if (gameState === 'playing') keys[e.key] = false;
});

startBtn.onclick = () => {
  mainMenu.classList.add('hidden');
  gameOverScreen.classList.add('hidden');
  canvas.focus();
  resetGame();
  gameState = 'playing';
  gameLoop();
};

restartBtn.onclick = () => {
  gameOverScreen.classList.add('hidden');
  mainMenu.classList.add('hidden');
  canvas.focus();
  resetGame();
  gameState = 'playing';
  gameLoop();
};

function endGame() {
  gameState = 'gameover';
  finalScore.textContent = 'Final Score: ' + score;
  gameOverScreen.classList.remove('hidden');
  mainMenu.classList.add('hidden');
}

// Show menu on load
mainMenu.classList.remove('hidden');
gameOverScreen.classList.add('hidden');
canvas.tabIndex = 0; 