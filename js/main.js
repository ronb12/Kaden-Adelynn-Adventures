// Simple Space Shooter Game
// Version 1.2 - Core shooting mechanics with ship designs

// Game variables
let canvas, ctx, scoreElement, livesElement, levelElement, gameOverScreen, startScreen, finalScoreElement, restartBtn, startBtn, highScoreElement;

// Game state
let gameState = 'start';
let score = 0;
let lives = 3;
let level = 1;
let gameLoop;
let highScore = localStorage.getItem('spaceShooterHighScore') || 0;

// Player
let player = {
    x: 400,
    y: 550,
    width: 40,
    height: 40,
    speed: 5,
    shipType: 'fighter' // fighter, interceptor, blaster, cruiser
};

// Ship designs
const SHIP_DESIGNS = {
    fighter: {
        name: 'Fighter',
        color: '#4a90e2',
        width: 40,
        height: 40,
        speed: 5,
        fireRate: 1,
        damage: 1
    },
    interceptor: {
        name: 'Interceptor',
        color: '#00ff88',
        width: 35,
        height: 45,
        speed: 6,
        fireRate: 1.2,
        damage: 1
    },
    blaster: {
        name: 'Blaster',
        color: '#ff6b35',
        width: 45,
        height: 35,
        speed: 4,
        fireRate: 0.8,
        damage: 2
    },
    cruiser: {
        name: 'Cruiser',
        color: '#9b59b6',
        width: 50,
        height: 50,
        speed: 3,
        fireRate: 0.6,
        damage: 3
    }
};

// Enemy ship designs
const ENEMY_DESIGNS = [
    {
        name: 'Scout',
        color: '#ff4444',
        width: 30,
        height: 30,
        speed: 3,
        points: 10
    },
    {
        name: 'Fighter',
        color: '#ff6666',
        width: 35,
        height: 35,
        speed: 2.5,
        points: 15
    },
    {
        name: 'Destroyer',
        color: '#ff8888',
        width: 40,
        height: 40,
        speed: 2,
        points: 20
    },
    {
        name: 'Battleship',
        color: '#ffaaaa',
        width: 45,
        height: 45,
        speed: 1.5,
        points: 25
    }
];

// Game objects
let bullets = [];
let enemies = [];
let explosions = [];
let stars = [];

// Game constants
const BULLET_SPEED = 7;
const ENEMY_SPEED = 2;
const ENEMY_SHOOT_RATE = 0.02;
const ENEMY_BULLET_SPEED = 4;
const SHOT_DELAY = 200;

// Input handling
let keys = {};
let lastShotTime = 0;

// Initialize game elements
function initializeGameElements() {
    console.log('=== GAME INITIALIZATION START ===');
    
    // Get DOM elements
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    scoreElement = document.getElementById('score');
    livesElement = document.getElementById('lives');
    levelElement = document.getElementById('level');
    gameOverScreen = document.getElementById('gameOverScreen');
    startScreen = document.getElementById('startScreen');
    finalScoreElement = document.getElementById('finalScore');
    highScoreElement = document.getElementById('highScore');
    restartBtn = document.getElementById('restartBtn');
    startBtn = document.getElementById('startBtn');
    
    console.log('Document ready state:', document.readyState);
    console.log('Window loaded:', window.loaded);
    
    if (canvas) {
        console.log('Canvas found:', canvas);
        canvas.width = 800;
        canvas.height = 600;
        console.log('Canvas context created:', ctx);
    }
    
    // Check if all elements are found
    const elementsFound = {
        canvas: !!canvas,
        startBtn: !!startBtn,
        restartBtn: !!restartBtn,
        scoreElement: !!scoreElement,
        livesElement: !!livesElement,
        levelElement: !!levelElement,
        gameOverScreen: !!gameOverScreen,
        startScreen: !!startScreen,
        finalScoreElement: !!finalScoreElement,
        highScoreElement: !!highScoreElement
    };
    
    console.log('All elements found:', elementsFound);
    
    if (canvas && ctx) {
        console.log('Game elements initialized successfully');
        console.log('Canvas size:', canvas.width, 'x', canvas.height);
        console.log('Player position:', player.x, player.y);
        console.log('Player ship type:', player.shipType);
        
        // Initialize stars
        initStars();
        
        // Setup event listeners
        setupEventListeners();
        
        // Start the game loop
        gameLoop = setInterval(update, 1000 / 60);
        
        console.log('=== GAME INITIALIZATION COMPLETE ===');
    }
}

// Initialize star field
function initStars() {
    for (let i = 0; i < 100; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            speed: Math.random() * 2 + 1
        });
    }
}

// Setup event listeners
function setupEventListeners() {
    // Keyboard events
    document.addEventListener('keydown', (e) => {
        keys[e.key] = true;
    });
    
    document.addEventListener('keyup', (e) => {
        keys[e.key] = false;
    });
    
    // Button events
    if (startBtn) {
        startBtn.addEventListener('click', startGame);
    }
    
    if (restartBtn) {
        restartBtn.addEventListener('click', restartGame);
    }
}

// Start game
function startGame() {
    gameState = 'playing';
    score = 0;
    lives = 3;
    level = 1;
    
    // Clear arrays
    bullets = [];
    enemies = [];
    explosions = [];
    
    // Reset player position
    player.x = 400;
    player.y = 550;
    
    // Hide start screen
    if (startScreen) startScreen.style.display = 'none';
    if (gameOverScreen) gameOverScreen.style.display = 'none';
    
    // Show game canvas and score display
    if (canvas) canvas.style.display = 'block';
    const scoreDisplay = document.getElementById('scoreDisplay');
    if (scoreDisplay) scoreDisplay.classList.remove('hidden');
    
    console.log('Game started!');
}

// Game over
function gameOver() {
    gameState = 'gameOver';
    
    // Check for new high score
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('spaceShooterHighScore', highScore);
    }
    
    // Update final score display
    if (finalScoreElement) finalScoreElement.textContent = score;
    if (highScoreElement) highScoreElement.textContent = highScore;
    
    // Show game over screen
    if (gameOverScreen) gameOverScreen.style.display = 'block';
    
    // Hide score display
    const scoreDisplay = document.getElementById('scoreDisplay');
    if (scoreDisplay) scoreDisplay.classList.add('hidden');
    
    console.log('Game over! Score:', score, 'High score:', highScore);
}

// Restart game
function restartGame() {
    startGame();
}

// Shoot function
function shoot() {
    const currentTime = Date.now();
    const shipDesign = SHIP_DESIGNS[player.shipType];
    const fireDelay = SHOT_DELAY / shipDesign.fireRate;
    
    if (currentTime - lastShotTime < fireDelay) return;
    lastShotTime = currentTime;
    
    bullets.push({
        x: player.x + player.width / 2 - 2,
        y: player.y,
        width: 4,
        height: 8,
        speed: BULLET_SPEED,
        damage: shipDesign.damage
    });
}

// Spawn enemy
function spawnEnemy() {
    if (Math.random() < 0.02) {
        const enemyType = Math.floor(Math.random() * ENEMY_DESIGNS.length);
        const enemyDesign = ENEMY_DESIGNS[enemyType];
        
        enemies.push({
            x: Math.random() * (canvas.width - enemyDesign.width),
            y: -enemyDesign.height,
            width: enemyDesign.width,
            height: enemyDesign.height,
            speed: enemyDesign.speed + Math.random() * 2,
            type: enemyType,
            design: enemyDesign
        });
    }
}

// Update player
function updatePlayer() {
    const shipDesign = SHIP_DESIGNS[player.shipType];
    player.speed = shipDesign.speed;
    
    // Movement
    if (keys['ArrowLeft'] || keys['a'] || keys['A']) {
        player.x = Math.max(0, player.x - player.speed);
    }
    if (keys['ArrowRight'] || keys['d'] || keys['D']) {
        player.x = Math.min(canvas.width - player.width, player.x + player.speed);
    }
    if (keys['ArrowUp'] || keys['w'] || keys['W']) {
        player.y = Math.max(0, player.y - player.speed);
    }
    if (keys['ArrowDown'] || keys['s'] || keys['S']) {
        player.y = Math.min(canvas.height - player.height, player.y + player.speed);
    }
    
    // Shooting
    if (keys[' ']) {
        shoot();
    }
}

// Update bullets
function updateBullets() {
    for (let i = bullets.length - 1; i >= 0; i--) {
        bullets[i].y -= bullets[i].speed;
        if (bullets[i].y < 0) {
            bullets.splice(i, 1);
        }
    }
}

// Update enemies
function updateEnemies() {
    for (let i = enemies.length - 1; i >= 0; i--) {
        enemies[i].y += enemies[i].speed;
        
        // Remove enemies that go off screen
        if (enemies[i].y > canvas.height) {
            enemies.splice(i, 1);
            lives--;
            if (lives <= 0) {
                gameOver();
            }
        }
    }
}

// Update explosions
function updateExplosions() {
    for (let i = explosions.length - 1; i >= 0; i--) {
        explosions[i].life--;
        if (explosions[i].life <= 0) {
            explosions.splice(i, 1);
        }
    }
}

// Update stars
function updateStars() {
    for (let star of stars) {
        star.y += star.speed;
        if (star.y > canvas.height) {
            star.y = 0;
            star.x = Math.random() * canvas.width;
        }
    }
}

// Check collisions
function checkCollisions() {
    // Bullet vs Enemy collisions
    for (let i = bullets.length - 1; i >= 0; i--) {
        for (let j = enemies.length - 1; j >= 0; j--) {
            if (checkCollision(bullets[i], enemies[j])) {
                // Create explosion
                explosions.push({
                    x: enemies[j].x + enemies[j].width / 2,
                    y: enemies[j].y + enemies[j].height / 2,
                    life: 10
                });
                
                // Remove bullet and enemy
                bullets.splice(i, 1);
                enemies.splice(j, 1);
                
                // Increase score based on enemy type
                const points = enemies[j] ? enemies[j].design.points : 10;
                score += points;
                
                break;
            }
        }
    }
}

// Collision detection
function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

// Update level
function updateLevel() {
    if (score > level * 100) {
        level++;
    }
}

// Update UI
function updateUI() {
    if (scoreElement) scoreElement.textContent = score;
    if (livesElement) livesElement.textContent = lives;
    if (levelElement) levelElement.textContent = level;
}

// Render function
function render() {
    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw stars
    drawStars();
    
    // Draw player
    drawPlayer();
    
    // Draw bullets
    drawBullets();
    
    // Draw enemies
    drawEnemies();
    
    // Draw explosions
    drawExplosions();
}

// Draw stars
function drawStars() {
    ctx.fillStyle = '#fff';
    for (let star of stars) {
        ctx.fillRect(star.x, star.y, 1, 1);
    }
}

// Draw player
function drawPlayer() {
    const shipDesign = SHIP_DESIGNS[player.shipType];
    
    // Draw ship body
    ctx.fillStyle = shipDesign.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);
    
    // Draw ship details based on type
    ctx.fillStyle = '#fff';
    
    switch(player.shipType) {
        case 'fighter':
            // Fighter design - sleek and fast
            ctx.fillRect(player.x + 15, player.y + 10, 10, 20);
            ctx.fillRect(player.x + 10, player.y + 15, 20, 10);
            break;
        case 'interceptor':
            // Interceptor design - narrow and fast
            ctx.fillRect(player.x + 12, player.y + 8, 16, 24);
            ctx.fillRect(player.x + 8, player.y + 12, 24, 16);
            break;
        case 'blaster':
            // Blaster design - wide and powerful
            ctx.fillRect(player.x + 18, player.y + 12, 4, 16);
            ctx.fillRect(player.x + 12, player.y + 18, 16, 4);
            break;
        case 'cruiser':
            // Cruiser design - large and heavy
            ctx.fillRect(player.x + 20, player.y + 15, 10, 20);
            ctx.fillRect(player.x + 15, player.y + 20, 20, 10);
            break;
    }
}

// Draw bullets
function drawBullets() {
    ctx.fillStyle = '#ffff00';
    for (let bullet of bullets) {
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    }
}

// Draw enemies
function drawEnemies() {
    for (let enemy of enemies) {
        const design = enemy.design;
        
        // Draw enemy body
        ctx.fillStyle = design.color;
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
        
        // Draw enemy details
        ctx.fillStyle = '#fff';
        ctx.fillRect(enemy.x + 10, enemy.y + 10, enemy.width - 20, enemy.height - 20);
        
        // Draw enemy type indicator
        ctx.fillStyle = '#000';
        ctx.fillRect(enemy.x + 15, enemy.y + 15, enemy.width - 30, enemy.height - 30);
    }
}

// Draw explosions
function drawExplosions() {
    for (let explosion of explosions) {
        const alpha = explosion.life / 10;
        ctx.fillStyle = `rgba(255, 255, 0, ${alpha})`;
        ctx.beginPath();
        ctx.arc(explosion.x, explosion.y, 20 * alpha, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Main update function
function update() {
    if (gameState === 'playing') {
        updatePlayer();
        updateBullets();
        updateEnemies();
        updateExplosions();
        updateStars();
        checkCollisions();
        updateLevel();
        updateUI();
        spawnEnemy();
        render();
    }
}

// Initialize game when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeGameElements);
} else {
    initializeGameElements();
}