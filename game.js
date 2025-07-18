// Extremely Simple Space Shooter
console.log('🚀 Simple game loading...');

// Game variables
let canvas, ctx;
let gameState = 'menu';
let score = 0;
let lives = 3;
let player = null;
let bullets = [];
let enemies = [];
let keys = {};

// Initialize game
function initGame() {
  console.log('🎮 Initializing simple game...');
  
  // Get canvas
  canvas = document.getElementById('gameCanvas');
  ctx = canvas.getContext('2d');
  
  // Set up button
  const startBtn = document.getElementById('start-btn');
  if (startBtn) {
    startBtn.textContent = 'Start Game';
    startBtn.onclick = startGame;
  }
  
  // Set up keyboard
  document.addEventListener('keydown', (e) => {
    keys[e.code] = true;
    if (e.code === 'Space') e.preventDefault();
  });
  
  document.addEventListener('keyup', (e) => {
    keys[e.code] = false;
  });
  
  // Start game loop
  gameLoop();
  
  console.log('✅ Game initialized');
}

// Start game
function startGame() {
  console.log('🎮 Starting game...');
  
  // Create player
  player = {
    x: canvas.width / 2 - 25,
    y: canvas.height - 100,
    width: 50,
    height: 50,
    speed: 5
  };
  
  // Reset game state
  score = 0;
  lives = 3;
  bullets = [];
  enemies = [];
  gameState = 'playing';
  
  // Hide menu
  const mainMenu = document.getElementById('main-menu');
  if (mainMenu) mainMenu.style.display = 'none';
  
  // Show HUD
  const hud = document.getElementById('hud');
  if (hud) hud.style.display = 'block';
  
  console.log('✅ Game started');
}

// Update player
function updatePlayer() {
  if (!player) return;
  
  // Movement
  if (keys['ArrowLeft'] || keys['KeyA']) {
    player.x = Math.max(0, player.x - player.speed);
  }
  if (keys['ArrowRight'] || keys['KeyD']) {
    player.x = Math.min(canvas.width - player.width, player.x + player.speed);
  }
  if (keys['ArrowUp'] || keys['KeyW']) {
    player.y = Math.max(0, player.y - player.speed);
  }
  if (keys['ArrowDown'] || keys['KeyS']) {
    player.y = Math.min(canvas.height - player.height, player.y + player.speed);
  }
  
  // Shooting
  if (keys['Space']) {
    bullets.push({
      x: player.x + player.width / 2 - 2,
      y: player.y,
      width: 4,
      height: 8,
      speed: 8
    });
  }
}

// Spawn enemy
function spawnEnemy() {
  enemies.push({
    x: Math.random() * (canvas.width - 30),
    y: -30,
    width: 30,
    height: 30,
    speed: 2
  });
}

// Update enemies
function updateEnemies() {
  for (let i = enemies.length - 1; i >= 0; i--) {
    const enemy = enemies[i];
    enemy.y += enemy.speed;
    
    // Remove if off screen
    if (enemy.y > canvas.height) {
      enemies.splice(i, 1);
    }
  }
}

// Update bullets
function updateBullets() {
  for (let i = bullets.length - 1; i >= 0; i--) {
    const bullet = bullets[i];
    bullet.y -= bullet.speed;
    
    if (bullet.y < 0) {
      bullets.splice(i, 1);
    }
  }
}

// Check collisions
function checkCollisions() {
  if (!player) return;
  
  // Bullets vs enemies
  for (let i = bullets.length - 1; i >= 0; i--) {
    const bullet = bullets[i];
    for (let j = enemies.length - 1; j >= 0; j--) {
      const enemy = enemies[j];
      if (bullet.x < enemy.x + enemy.width &&
          bullet.x + bullet.width > enemy.x &&
          bullet.y < enemy.y + enemy.height &&
          bullet.y + bullet.height > enemy.y) {
        score += 10;
        bullets.splice(i, 1);
        enemies.splice(j, 1);
        break;
      }
    }
  }
  
  // Player vs enemies
  for (let i = enemies.length - 1; i >= 0; i--) {
    const enemy = enemies[i];
    if (player.x < enemy.x + enemy.width &&
        player.x + player.width > enemy.x &&
        player.y < enemy.y + enemy.height &&
        player.y + player.height > enemy.y) {
      lives--;
      enemies.splice(i, 1);
      
      if (lives <= 0) {
        gameOver();
      }
    }
  }
}

// Game over
function gameOver() {
  gameState = 'game-over';
  console.log('Game Over! Score:', score);
  
  // Show game over screen
  const gameOver = document.getElementById('game-over');
  if (gameOver) {
    gameOver.style.display = 'block';
  }
}

// Draw player
function drawPlayer() {
  if (!player) return;
  
  ctx.fillStyle = '#00ff00';
  ctx.fillRect(player.x, player.y, player.width, player.height);
}

// Draw enemies
function drawEnemies() {
  ctx.fillStyle = '#ff0000';
  enemies.forEach(enemy => {
    ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
  });
}

// Draw bullets
function drawBullets() {
  ctx.fillStyle = '#ffff00';
  bullets.forEach(bullet => {
    ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
  });
}

// Update HUD
function updateHUD() {
  const scoreElement = document.getElementById('score');
  const livesElement = document.getElementById('lives');
  
  if (scoreElement) scoreElement.textContent = `Score: ${score}`;
  if (livesElement) livesElement.textContent = `Lives: ${lives}`;
}

// Update function
function update() {
  if (gameState !== 'playing') return;
  
  // Spawn enemies every 60 frames
  if (Math.random() < 0.02) {
    spawnEnemy();
  }
  
  updatePlayer();
  updateEnemies();
  updateBullets();
  checkCollisions();
  updateHUD();
}

// Draw function
function draw() {
  // Clear canvas
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  if (gameState === 'playing') {
    drawPlayer();
    drawEnemies();
    drawBullets();
  }
}

// Game loop
function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

// Initialize when page loads
window.addEventListener('load', initGame); 