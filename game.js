// Kaden & Adelynn Adventures - Clean Version
console.log('🚀 game.js loading...');

// Game state variables
let canvas, ctx;
let gameState = 'menu';
let gamePaused = false;
let score = 0;
let lives = 3;
let gameTime = 0;
let enemyTimer = 60;
let difficulty = 1;
let stageProgress = 0;
let stageGoal = 20;
let missionCompleted = false;
let bossSpawned = false;
let bossHealth = 100;
let fireHeld = false;
let fireCooldown = 0;
let currentMission = 1;
let totalMissions = 50;
let playerLevel = 1;
let playerXP = 0;
let skillPoints = 0;
let credits = 0;
let playerSkills = {};
let highScores = [];
let highScoreDisplay;
let isTouchDevice = false;
let isTouching = false;
let touchX = 0;
let touchY = 0;
let stage = 1;
let upgrades = [];
let missionObjectives = [];
let xpToNextLevel = 100;
let DEBUG_MODE = true;
let autoSaveInterval;
let powerUpMenu = false;
let selectedPowerUp = 0;
let touchStartX = 0;
let touchStartY = 0;
let currentWeapon = 'basic';
let weaponLevel = 1;

// Game objects
let player = null;
let boss = null;

// Arrays
let bullets = [];
let enemies = [];
let enemyBullets = [];
let particles = [];
let soundEffects = [];
let collectibles = [];
let powerCapsules = [];
let powerUps = [];
let options = [];
let stars = [];
let keys = {};

// DOM elements
let mainMenu;
let hud;
let pauseMenu;

// Mission data
const missionData = [
  { id: 1, name: 'Mission 1', description: 'Clear the sector of enemy forces', enemyTypes: ['scout'], enemyCount: 12, bossType: null },
  { id: 2, name: 'Mission 2', description: 'First contact with enemy forces', enemyTypes: ['scout', 'interceptor'], enemyCount: 15, bossType: null },
  { id: 3, name: 'Mission 3', description: 'Navigate through asteroid field', enemyTypes: ['scout', 'interceptor', 'bomber'], enemyCount: 18, bossType: null },
  { id: 4, name: 'Mission 4', description: 'Enter enemy territory', enemyTypes: ['scout', 'interceptor', 'bomber', 'fighter'], enemyCount: 20, bossType: null },
  { id: 5, name: 'Mission 5', description: 'Face the challenge', enemyTypes: ['scout', 'interceptor', 'bomber', 'fighter', 'destroyer'], enemyCount: 25, bossType: 'basic' }
];

// Enemy types
const ENEMY_TYPES = {
  scout: { width: 30, height: 30, speed: 2, health: 1, fireRate: 0, points: 10 },
  interceptor: { width: 35, height: 35, speed: 3, health: 2, fireRate: 60, points: 20 },
  bomber: { width: 40, height: 40, speed: 1, health: 3, fireRate: 90, points: 30 },
  fighter: { width: 45, height: 45, speed: 4, health: 2, fireRate: 45, points: 25 },
  destroyer: { width: 50, height: 50, speed: 1.5, health: 5, fireRate: 30, points: 50 }
};

// Debug logging
function debugLog(message, data = null) {
  if (DEBUG_MODE) {
    if (data) {
      console.log(`🔍 DEBUG: ${message}`, data);
    } else {
      console.log(`🔍 DEBUG: ${message}`);
    }
  }
}

// Initialize game
function initGame() {
  debugLog('🎮 Kaden & Adelynn Adventures - Loading...');
  
  // Initialize DOM elements
  canvas = document.getElementById('gameCanvas');
  ctx = canvas.getContext('2d');
  mainMenu = document.getElementById('main-menu');
  hud = document.getElementById('hud');
  highScoreDisplay = document.getElementById('high-score');
  pauseMenu = document.getElementById('pause-menu');
  
  debugLog('🎮 DOM elements initialized');
  
  // Set initial body class
  document.body.classList.add('menu-active');
  debugLog('Body class initialized for menu state');
  
  // Initialize game systems
  initHighScores();
  initSavedGame();
  initStars();
  
  // Set up button event listeners
  setupButtonListeners();
  
  // Set up keyboard input
  setupKeyboardInput();
  
  // Start game loop
  gameLoop();
  
  debugLog('✅ Game initialization complete');
}

// Set up button event listeners
function setupButtonListeners() {
  debugLog('🎮 Setting up button listeners...');
  
  // Start button
  const startBtn = document.getElementById('start-btn');
  if (startBtn) {
    startBtn.onclick = () => {
      debugLog('🎮 Start button clicked');
      const missionDropdown = document.getElementById('mission-dropdown');
      if (missionDropdown) {
        const selectedMission = parseInt(missionDropdown.value);
        debugLog('🎮 Starting mission:', selectedMission);
        startMission(selectedMission);
      }
    };
  }
  
  // Continue button
  const continueBtn = document.getElementById('continue-btn');
  if (continueBtn) {
    continueBtn.onclick = () => {
      debugLog('🎮 Continue button clicked');
      loadGame();
    };
  }
  
  // Skill tree button
  const skillTreeBtn = document.getElementById('skill-tree-btn');
  if (skillTreeBtn) {
    skillTreeBtn.onclick = () => {
      debugLog('🎮 Skill tree button clicked');
      showSkillTree();
    };
  }
  
  // Other buttons
  const backFromSkillsBtn = document.getElementById('back-from-skills');
  if (backFromSkillsBtn) {
    backFromSkillsBtn.onclick = () => {
      document.getElementById('skill-tree').classList.add('hidden');
      mainMenu.classList.remove('hidden');
    };
  }
  
  const restartBtn = document.getElementById('restart-btn');
  if (restartBtn) {
    restartBtn.onclick = () => {
      resetGame();
    };
  }
  
  const mainMenuBtn = document.getElementById('main-menu-btn');
  if (mainMenuBtn) {
    mainMenuBtn.onclick = () => {
      resetGame();
    };
  }
  
  const nextMissionBtn = document.getElementById('next-mission');
  if (nextMissionBtn) {
    nextMissionBtn.onclick = () => {
      currentMission++;
      if (currentMission <= totalMissions) {
        startMission(currentMission);
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
  
  const resumeBtn = document.getElementById('resume-btn');
  if (resumeBtn) {
    resumeBtn.onclick = () => {
      resumeGame();
    };
  }
  
  const saveExitBtn = document.getElementById('save-exit-btn');
  if (saveExitBtn) {
    saveExitBtn.onclick = () => {
      saveGame();
      resetGame();
    };
  }
  
  const exitNoSaveBtn = document.getElementById('exit-no-save-btn');
  if (exitNoSaveBtn) {
    exitNoSaveBtn.onclick = () => {
      resetGame();
    };
  }
}

// Set up keyboard input
function setupKeyboardInput() {
  document.addEventListener('keydown', (e) => {
    keys[e.code] = true;
    if (e.code === 'Escape' || e.code === 'KeyP') {
      e.preventDefault();
      if (gameState === 'playing') {
        if (gamePaused) {
          resumeGame();
        } else {
          pauseGame();
        }
      }
    }
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
      e.preventDefault();
    }
  });
  
  document.addEventListener('keyup', (e) => {
    keys[e.code] = false;
  });
}

// Start mission
function startMission(missionId) {
  debugLog(`Starting mission ${missionId}`);
  
  currentMission = missionId;
  const mission = missionData[missionId - 1];
  
  if (!mission) {
    console.error(`❌ Mission ${missionId} not found`);
    return;
  }
  
  debugLog(`Mission data:`, mission);
  
  // Initialize player
  player = {
    x: canvas.width / 2 - 25,
    y: canvas.height - 100,
    width: 50,
    height: 50,
    w: 50,
    h: 50,
    speed: 5,
    weaponLevel: 1,
    weaponMultiplier: 1,
    shield: 0
  };
  
  // Reset game arrays
  bullets = [];
  enemies = [];
  enemyBullets = [];
  particles = [];
  soundEffects = [];
  collectibles = [];
  powerCapsules = [];
  powerUps = [];
  options = [];
  
  // Reset game state
  gameTime = 0;
  score = 0;
  lives = 3;
  gamePaused = false;
  enemyTimer = 60;
  stageProgress = 0;
  stageGoal = mission.enemyCount;
  missionCompleted = false;
  bossSpawned = false;
  boss = null;
  
  // Set mission objectives
  missionObjectives = [
    `Destroy ${mission.enemyCount} enemies`,
    `Survive the mission`
  ];
  
  debugLog(`Mission objectives:`, missionObjectives);
  
  gameState = 'playing';
  debugLog(`Game state set to: ${gameState}`);
  
  // Show game UI
  showGameUI();
  
  // Update mission UI
  updateMissionUI();
  
  debugLog(`Mission ${missionId} started successfully`);
}

// Show game UI
function showGameUI() {
  debugLog('Showing game UI');
  
  // Add body class for game playing state
  document.body.classList.add('game-playing');
  document.body.classList.remove('menu-active');
  
  // Hide main menu
  if (mainMenu) {
    mainMenu.classList.add('hidden');
  }
  
  // Show HUD
  if (hud) {
    hud.classList.remove('hidden');
  }
  
  // Show mission UI
  const missionUI = document.getElementById('mission-ui');
  if (missionUI) {
    missionUI.classList.remove('hidden');
  }
  
  // Show progression UI
  const progressionUI = document.getElementById('progression-ui');
  if (progressionUI) {
    progressionUI.classList.remove('hidden');
  }
  
  // Show top bar
  const topBar = document.getElementById('top-bar');
  if (topBar) {
    topBar.classList.remove('hidden');
  }
  
  // Make canvas visible
  if (canvas) {
    canvas.style.display = 'block';
    canvas.style.zIndex = '10';
    canvas.style.position = 'absolute';
    canvas.focus();
  }
  
  debugLog('Game UI shown successfully');
}

// Hide game UI
function hideGameUI() {
  document.body.classList.remove('game-playing');
  document.body.classList.add('menu-active');
  
  if (mainMenu) mainMenu.classList.remove('hidden');
  if (hud) hud.classList.add('hidden');
  
  const missionUI = document.getElementById('mission-ui');
  if (missionUI) missionUI.classList.add('hidden');
  
  const progressionUI = document.getElementById('progression-ui');
  if (progressionUI) progressionUI.classList.add('hidden');
  
  const topBar = document.getElementById('top-bar');
  if (topBar) topBar.classList.add('hidden');
  
  if (canvas) {
    canvas.style.zIndex = '1';
  }
}

// Update mission UI
function updateMissionUI() {
  const missionName = document.getElementById('mission-name');
  const missionDesc = document.getElementById('mission-description');
  const missionProgress = document.getElementById('mission-progress');
  const missionProgressText = document.getElementById('mission-progress-text');
  const missionObjectivesList = document.getElementById('mission-objectives');
  
  if (missionName) missionName.textContent = `Mission ${currentMission}`;
  if (missionDesc) missionDesc.textContent = missionData[currentMission - 1]?.description || '';
  if (missionProgress) missionProgress.style.width = `${(stageProgress / stageGoal) * 100}%`;
  if (missionProgressText) missionProgressText.textContent = `${stageProgress}/${stageGoal}`;
  
  if (missionObjectivesList) {
    missionObjectivesList.innerHTML = '';
    missionObjectives.forEach(objective => {
      const li = document.createElement('li');
      li.textContent = objective;
      missionObjectivesList.appendChild(li);
    });
  }
}

// Spawn enemy
function spawnEnemy() {
  const mission = missionData[currentMission - 1];
  const availableTypes = mission.enemyTypes;
  const enemyType = availableTypes[Math.floor(Math.random() * availableTypes.length)];
  const enemyData = ENEMY_TYPES[enemyType];
  
  const enemy = {
    x: Math.random() * (canvas.width - enemyData.width),
    y: -enemyData.height,
    width: enemyData.width,
    height: enemyData.height,
    w: enemyData.width,
    h: enemyData.height,
    speed: enemyData.speed,
    health: enemyData.health,
    maxHealth: enemyData.health,
    fireRate: enemyData.fireRate,
    fireTimer: 0,
    points: enemyData.points,
    type: enemyType
  };
  
  enemies.push(enemy);
}

// Update enemies
function updateEnemies() {
  for (let i = enemies.length - 1; i >= 0; i--) {
    const enemy = enemies[i];
    enemy.y += enemy.speed;
    
    // Fire bullets
    if (enemy.fireRate > 0) {
      enemy.fireTimer++;
      if (enemy.fireTimer >= enemy.fireRate) {
        enemyBullets.push({
          x: enemy.x + enemy.width / 2,
          y: enemy.y + enemy.height,
          width: 4,
          height: 8,
          speed: 3
        });
        enemy.fireTimer = 0;
      }
    }
    
    // Remove if off screen
    if (enemy.y > canvas.height) {
      enemies.splice(i, 1);
    }
  }
}

// Update enemy bullets
function updateEnemyBullets() {
  for (let i = enemyBullets.length - 1; i >= 0; i--) {
    const bullet = enemyBullets[i];
    bullet.y += bullet.speed;
    
    if (bullet.y > canvas.height) {
      enemyBullets.splice(i, 1);
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

// Shoot
function shoot() {
  if (fireCooldown <= 0) {
    bullets.push({
      x: player.x + player.width / 2 - 2,
      y: player.y,
      width: 4,
      height: 8,
      speed: 8
    });
    fireCooldown = 5;
  }
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
  if (keys['Space'] || fireHeld) {
    shoot();
  }
  
  if (fireCooldown > 0) {
    fireCooldown--;
  }
}

// Check collisions
function checkCollisions() {
  if (!player) return;
  
  // Player bullets vs enemies
  for (let i = bullets.length - 1; i >= 0; i--) {
    const bullet = bullets[i];
    for (let j = enemies.length - 1; j >= 0; j--) {
      const enemy = enemies[j];
      if (rectsCollide(bullet, enemy)) {
        enemy.health--;
        bullets.splice(i, 1);
        
        if (enemy.health <= 0) {
          score += enemy.points;
          stageProgress++;
          enemies.splice(j, 1);
          
          if (stageProgress >= stageGoal) {
            completeMission();
          }
        }
        break;
      }
    }
  }
  
  // Enemy bullets vs player
  for (let i = enemyBullets.length - 1; i >= 0; i--) {
    const bullet = enemyBullets[i];
    if (rectsCollide(bullet, player)) {
      lives--;
      enemyBullets.splice(i, 1);
      
      if (lives <= 0) {
        gameOver();
      }
    }
  }
  
  // Player vs enemies
  for (let i = enemies.length - 1; i >= 0; i--) {
    const enemy = enemies[i];
    if (rectsCollide(player, enemy)) {
      lives--;
      enemies.splice(i, 1);
      
      if (lives <= 0) {
        gameOver();
      }
    }
  }
}

// Collision detection
function rectsCollide(rect1, rect2) {
  return rect1.x < rect2.x + rect2.width &&
         rect1.x + rect1.width > rect2.x &&
         rect1.y < rect2.y + rect2.height &&
         rect1.y + rect1.height > rect2.y;
}

// Complete mission
function completeMission() {
  missionCompleted = true;
  gameState = 'mission-complete';
  
  const missionComplete = document.getElementById('mission-complete');
  if (missionComplete) {
    missionComplete.classList.remove('hidden');
  }
  
  debugLog('Mission completed!');
}

// Game over
function gameOver() {
  gameState = 'game-over';
  
  const gameOverScreen = document.getElementById('game-over');
  if (gameOverScreen) {
    gameOverScreen.classList.remove('hidden');
  }
  
  debugLog('Game over!');
}

// Reset game
function resetGame() {
  gameState = 'menu';
  hideGameUI();
  
  // Hide all overlays
  const overlays = document.querySelectorAll('.overlay');
  overlays.forEach(overlay => {
    overlay.classList.add('hidden');
  });
  
  // Show main menu
  if (mainMenu) {
    mainMenu.classList.remove('hidden');
  }
}

// Pause game
function pauseGame() {
  gamePaused = true;
  if (pauseMenu) {
    pauseMenu.classList.remove('hidden');
  }
}

// Resume game
function resumeGame() {
  gamePaused = false;
  if (pauseMenu) {
    pauseMenu.classList.add('hidden');
  }
}

// Save game
function saveGame() {
  const saveData = {
    score, lives, currentMission, playerLevel, playerXP, credits
  };
  localStorage.setItem('gameSave', JSON.stringify(saveData));
}

// Load game
function loadGame() {
  const saved = localStorage.getItem('gameSave');
  if (saved) {
    const saveData = JSON.parse(saved);
    score = saveData.score || 0;
    lives = saveData.lives || 3;
    currentMission = saveData.currentMission || 1;
    playerLevel = saveData.playerLevel || 1;
    playerXP = saveData.playerXP || 0;
    credits = saveData.credits || 0;
    
    startMission(currentMission);
  }
}

// Show skill tree
function showSkillTree() {
  const skillTree = document.getElementById('skill-tree');
  if (skillTree) {
    skillTree.classList.remove('hidden');
    mainMenu.classList.add('hidden');
  }
}

// Initialize high scores
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

// Update high score display
function updateHighScoreDisplay() {
  if (highScoreDisplay) {
    const topScore = highScores.length > 0 ? Math.max(...highScores) : 0;
    highScoreDisplay.textContent = `High Score: ${topScore.toLocaleString()}`;
  }
}

// Initialize saved game
function initSavedGame() {
  const saved = localStorage.getItem('gameSave');
  if (saved) {
    const continueBtn = document.getElementById('continue-btn');
    if (continueBtn) {
      continueBtn.classList.remove('hidden');
    }
  }
}

// Initialize stars
function initStars() {
  for (let i = 0; i < 100; i++) {
    stars.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      speed: Math.random() * 0.5 + 0.1
    });
  }
}

// Update stars
function updateStars() {
  stars.forEach(star => {
    star.y += star.speed;
    if (star.y > canvas.height) {
      star.y = 0;
      star.x = Math.random() * canvas.width;
    }
  });
}

// Draw stars
function drawStars() {
  ctx.fillStyle = '#ffffff';
  stars.forEach(star => {
    ctx.fillRect(star.x, star.y, 1, 1);
  });
}

// Draw player
function drawPlayer() {
  if (!player) return;
  
  ctx.fillStyle = '#00ff00';
  ctx.fillRect(player.x, player.y, player.width, player.height);
  
  // Draw player details
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(player.x + 5, player.y + 5, player.width - 10, 5);
  ctx.fillRect(player.x + 10, player.y + 15, player.width - 20, 5);
  ctx.fillRect(player.x + 15, player.y + 25, player.width - 30, 5);
}

// Draw enemies
function drawEnemies() {
  ctx.fillStyle = '#ff0000';
  enemies.forEach(enemy => {
    ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
    
    // Draw enemy details
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(enemy.x + 5, enemy.y + 5, enemy.width - 10, 3);
    ctx.fillStyle = '#ff0000';
  });
}

// Draw bullets
function drawBullets() {
  ctx.fillStyle = '#ffff00';
  bullets.forEach(bullet => {
    ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
  });
}

// Draw enemy bullets
function drawEnemyBullets() {
  ctx.fillStyle = '#ff00ff';
  enemyBullets.forEach(bullet => {
    ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
  });
}

// Update HUD
function updateHUD() {
  const scoreElement = document.getElementById('score');
  const livesElement = document.getElementById('lives');
  const weaponElement = document.getElementById('weapon-level');
  const difficultyElement = document.getElementById('difficulty');
  const timeElement = document.getElementById('time');
  
  if (scoreElement) scoreElement.textContent = `Score: ${score.toLocaleString()}`;
  if (livesElement) livesElement.textContent = `Lives: ${lives}`;
  if (weaponElement) weaponElement.textContent = `Weapon: Level ${weaponLevel}`;
  if (difficultyElement) difficultyElement.textContent = `Difficulty: ${difficulty}`;
  if (timeElement) timeElement.textContent = `Time: ${Math.floor(gameTime / 60)}:${(gameTime % 60).toString().padStart(2, '0')}`;
}

// Update function
function update() {
  if (gameState !== 'playing' || gamePaused) return;
  
  gameTime++;
  
  // Spawn enemies
  if (gameTime % enemyTimer === 0) {
    spawnEnemy();
    enemyTimer = Math.max(20, 60 - difficulty * 10);
  }
  
  // Update game objects
  updatePlayer();
  updateEnemies();
  updateEnemyBullets();
  updateBullets();
  updateStars();
  
  // Check collisions
  checkCollisions();
  
  // Update HUD
  updateHUD();
}

// Draw function
function draw() {
  // Clear canvas
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Draw stars
  drawStars();
  
  // Draw game objects
  drawPlayer();
  drawEnemies();
  drawBullets();
  drawEnemyBullets();
}

// Game loop
function gameLoop() {
  if (gameState === 'playing' && !gamePaused) {
    update();
    draw();
  } else if (gameState === 'menu') {
    drawStars();
  }
  
  requestAnimationFrame(gameLoop);
}

// Initialize when page loads
window.addEventListener('load', () => {
  debugLog('Window load event fired');
  initGame();
}); 