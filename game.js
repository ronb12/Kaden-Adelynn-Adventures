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

let gameState = 'menu';
let player, bullets, enemies, score, lives, keys, enemyTimer;

// --- Starfield ---
const STAR_COUNT = 60;
let stars = [];
function initStars() {
  stars = [];
  for (let i = 0; i < STAR_COUNT; i++) {
    stars.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      speed: 0.5 + Math.random() * 1.5,
      size: Math.random() * 1.5 + 0.5
    });
  }
}
function updateStars() {
  // Stars scroll from right to left for horizontal movement effect
  for (let s of stars) {
    s.x -= s.speed;
    if (s.x < 0) {
      s.x = canvas.width;
      s.y = Math.random() * canvas.height;
      s.speed = 0.5 + Math.random() * 1.5;
      s.size = Math.random() * 1.5 + 0.5;
    }
  }
}
function drawStars() {
  ctx.save();
  ctx.fillStyle = '#fff';
  for (let s of stars) {
    ctx.globalAlpha = 0.5 + 0.5 * (s.size / 2);
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  ctx.restore();
}

// --- Power-Ups ---
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
  score = 0;
  lives = 3;
  keys = {};
  enemyTimer = 0;
  initStars();
}

function update() {
  updateStars();
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

  // Collisions: bullets vs enemies
  for (let i = enemies.length-1; i >= 0; i--) {
    for (let j = bullets.length-1; j >= 0; j--) {
      if (rectsCollide(enemies[i], bullets[j])) {
        // 20% chance to drop power-up
        if (Math.random() < 0.2) spawnPowerUp(enemies[i].x, enemies[i].y);
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
}

function draw() {
  ctx.clearRect(0,0,canvas.width,canvas.height);
  drawStars();
  
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
}

function drawPlayerShip() {
  ctx.save();
  ctx.translate(player.x + player.w/2, player.y + player.h/2);
  
  // Main body gradient
  const bodyGradient = ctx.createLinearGradient(-player.w/2, -player.h/2, player.w/2, player.h/2);
  bodyGradient.addColorStop(0, '#1a1a2e');
  bodyGradient.addColorStop(0.3, '#16213e');
  bodyGradient.addColorStop(0.7, '#0f3460');
  bodyGradient.addColorStop(1, '#e94560');
  
  // Draw main body
  ctx.fillStyle = bodyGradient;
  ctx.beginPath();
  ctx.moveTo(-player.w/2, -player.h/2);
  ctx.lineTo(player.w/2 - 4, -player.h/2 + 2);
  ctx.lineTo(player.w/2, 0);
  ctx.lineTo(player.w/2 - 4, player.h/2 - 2);
  ctx.lineTo(-player.w/2, player.h/2);
  ctx.closePath();
  ctx.fill();
  
  // Cockpit
  const cockpitGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 8);
  cockpitGradient.addColorStop(0, '#00ffff');
  cockpitGradient.addColorStop(0.5, '#0088ff');
  cockpitGradient.addColorStop(1, 'transparent');
  
  ctx.fillStyle = cockpitGradient;
  ctx.beginPath();
  ctx.arc(-2, 0, 6, 0, Math.PI * 2);
  ctx.fill();
  
  // Engine glow
  const engineGradient = ctx.createLinearGradient(-player.w/2, -player.h/2, -player.w/2 - 10, 0);
  engineGradient.addColorStop(0, '#ff4444');
  engineGradient.addColorStop(0.5, '#ff8800');
  engineGradient.addColorStop(1, 'transparent');
  
  ctx.fillStyle = engineGradient;
  ctx.beginPath();
  ctx.moveTo(-player.w/2, -player.h/2 + 4);
  ctx.lineTo(-player.w/2 - 8, -player.h/2 + 2);
  ctx.lineTo(-player.w/2 - 8, player.h/2 - 2);
  ctx.lineTo(-player.w/2, player.h/2 - 4);
  ctx.closePath();
  ctx.fill();
  
  // Wing details
  ctx.strokeStyle = '#e94560';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-player.w/2 + 4, -player.h/2);
  ctx.lineTo(-player.w/2 + 8, -player.h/2 - 2);
  ctx.moveTo(-player.w/2 + 4, player.h/2);
  ctx.lineTo(-player.w/2 + 8, player.h/2 + 2);
  ctx.stroke();
  
  // Shield effect
  if (player.shield > 0) {
    const shieldGradient = ctx.createRadialGradient(0, 0, 15, 0, 0, 25);
    shieldGradient.addColorStop(0, 'rgba(0, 255, 255, 0.3)');
    shieldGradient.addColorStop(0.7, 'rgba(0, 255, 255, 0.1)');
    shieldGradient.addColorStop(1, 'transparent');
    
    ctx.fillStyle = shieldGradient;
    ctx.beginPath();
    ctx.arc(0, 0, 25, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.strokeStyle = '#00ffff';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.arc(0, 0, 22, 0, Math.PI * 2);
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
    scoreDisplay.textContent = 'Score: ' + score;
    livesDisplay.textContent = 'Lives: ' + lives;
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