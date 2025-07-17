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
  powerUps.push({ x, y, w: 18, h: 18, type, speed: 2 });
}
function updatePowerUps() {
  powerUps.forEach(p => p.x -= p.speed);
  powerUps = powerUps.filter(p => p.x > -20);
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
  const type = Math.random() < 0.7 ? 'basic' : 'shooter';
  if (type === 'basic') {
    enemies.push({ x: canvas.width + 32, y, w: 32, h: 24, speed: 2 + Math.random()*1.5, type });
  } else {
    enemies.push({ x: canvas.width + 32, y, w: 32, h: 24, speed: 1.5, type, shootTimer: 0 });
  }
}
let enemyBullets = [];
function updateEnemies() {
  for (let e of enemies) {
    e.x -= e.speed;
    if (e.type === 'shooter') {
      e.shootTimer = (e.shootTimer || 0) + 1;
      if (e.shootTimer > 60) {
        enemyBullets.push({ x: e.x, y: e.y + e.h/2 - 3, w: 10, h: 6, speed: 5 });
        e.shootTimer = 0;
      }
    }
  }
  enemies = enemies.filter(e => e.x > -40);
}
function updateEnemyBullets() {
  enemyBullets.forEach(b => b.x -= b.speed);
  enemyBullets = enemyBullets.filter(b => b.x > -20);
  for (let i = enemyBullets.length-1; i >= 0; i--) {
    if (rectsCollide(player, enemyBullets[i])) {
      if (player.shield > 0) {
        player.shield = 0;
      } else {
        lives--;
        if (lives <= 0) {
          endGame();
          return;
        }
      }
      enemyBullets.splice(i,1);
    }
  }
}
function drawEnemyBullets() {
  ctx.fillStyle = '#ff0';
  enemyBullets.forEach(b => ctx.fillRect(b.x, b.y, b.w, b.h));
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
  // Player movement
  if (keys['ArrowUp']) player.y -= player.speed;
  if (keys['ArrowDown']) player.y += player.speed;
  if (keys['ArrowLeft']) player.x -= player.speed;
  if (keys['ArrowRight']) player.x += player.speed;
  player.y = Math.max(0, Math.min(canvas.height - player.h, player.y));
  player.x = Math.max(0, Math.min(canvas.width - player.w, player.x));

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
  // Player (triangle)
  ctx.save();
  ctx.translate(player.x+player.w/2, player.y+player.h/2);
  ctx.fillStyle = player.shield > 0 ? '#0ff' : '#00fff7';
  ctx.beginPath();
  ctx.moveTo(-player.w/2, -player.h/2);
  ctx.lineTo(player.w/2, 0);
  ctx.lineTo(-player.w/2, player.h/2);
  ctx.closePath();
  ctx.fill();
  // Draw shield
  if (player.shield > 0) {
    ctx.strokeStyle = '#0ff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0,0,20,0,Math.PI*2);
    ctx.stroke();
  }
  ctx.restore();
  // Bullets
  ctx.fillStyle = '#fff';
  bullets.forEach(b => ctx.fillRect(b.x, b.y, b.w, b.h));
  // Enemy bullets
  drawEnemyBullets();
  // Enemies (rects)
  for (let e of enemies) {
    ctx.fillStyle = e.type === 'basic' ? '#ff3366' : '#ffb347';
    ctx.fillRect(e.x, e.y, e.w, e.h);
  }
  // Power-ups
  drawPowerUps();
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