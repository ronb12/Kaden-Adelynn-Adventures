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

function resetGame() {
  player = { x: 40, y: canvas.height/2-16, w: 32, h: 24, speed: 4 };
  bullets = [];
  enemies = [];
  score = 0;
  lives = 3;
  keys = {};
  enemyTimer = 0;
}

function spawnEnemy() {
  const y = Math.random() * (canvas.height - 32) + 8;
  enemies.push({ x: canvas.width + 32, y, w: 32, h: 24, speed: 2 + Math.random()*1.5 });
}

function update() {
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
  enemies.forEach(e => e.x -= e.speed);
  enemies = enemies.filter(e => e.x > -40);

  // Collisions: bullets vs enemies
  for (let i = enemies.length-1; i >= 0; i--) {
    for (let j = bullets.length-1; j >= 0; j--) {
      if (rectsCollide(enemies[i], bullets[j])) {
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
      enemies.splice(i,1);
      lives--;
      if (lives <= 0) {
        endGame();
        return;
      }
    }
  }

  // Enemy spawn
  enemyTimer++;
  if (enemyTimer > 50) {
    spawnEnemy();
    enemyTimer = 0;
  }
}

function draw() {
  ctx.clearRect(0,0,canvas.width,canvas.height);
  // Background
  ctx.fillStyle = '#181830';
  ctx.fillRect(0,0,canvas.width,canvas.height);
  // Player (triangle)
  ctx.save();
  ctx.translate(player.x+player.w/2, player.y+player.h/2);
  ctx.fillStyle = '#00fff7';
  ctx.beginPath();
  ctx.moveTo(-player.w/2, -player.h/2);
  ctx.lineTo(player.w/2, 0);
  ctx.lineTo(-player.w/2, player.h/2);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
  // Bullets
  ctx.fillStyle = '#fff';
  bullets.forEach(b => ctx.fillRect(b.x, b.y, b.w, b.h));
  // Enemies (rects)
  ctx.fillStyle = '#ff3366';
  enemies.forEach(e => ctx.fillRect(e.x, e.y, e.w, e.h));
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
      bullets.push({ x: player.x+player.w, y: player.y+player.h/2-3, w: 12, h: 6, speed: 8 });
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