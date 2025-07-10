// Simple Space Shooter Game
// Version 1.4 - Core shooting mechanics with ship designs, collectibles, and advanced weapons

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
    shipType: 'fighter', // fighter, interceptor, blaster, cruiser
    weaponType: 'laser', // laser, plasma, missile, spread
    powerUps: []
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

// Weapon types
const WEAPON_TYPES = {
    laser: {
        name: 'Laser',
        color: '#00ffff',
        damage: 1,
        speed: 8,
        fireRate: 1
    },
    plasma: {
        name: 'Plasma',
        color: '#ff00ff',
        damage: 2,
        speed: 6,
        fireRate: 0.8
    },
    missile: {
        name: 'Missile',
        color: '#ffff00',
        damage: 3,
        speed: 5,
        fireRate: 0.6
    },
    spread: {
        name: 'Spread',
        color: '#ff8800',
        damage: 1,
        speed: 7,
        fireRate: 1.2
    }
};

// Power-up types
const POWERUP_TYPES = {
    health: {
        name: 'Health',
        color: '#00ff00',
        symbol: '❤️',
        effect: 'restore'
    },
    weapon: {
        name: 'Weapon',
        color: '#ff8800',
        symbol: '⚔️',
        effect: 'upgrade'
    },
    speed: {
        name: 'Speed',
        color: '#00ffff',
        symbol: '⚡',
        effect: 'boost'
    },
    shield: {
        name: 'Shield',
        color: '#8888ff',
        symbol: '🛡️',
        effect: 'protect'
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
let powerUps = [];
let collectibles = [];

// Game constants
const BULLET_SPEED = 7;
const ENEMY_SPEED = 2;
const ENEMY_SHOOT_RATE = 0.02;
const ENEMY_BULLET_SPEED = 4;
const SHOT_DELAY = 200;
const POWERUP_SPAWN_RATE = 0.005;
const COLLECTIBLE_SPAWN_RATE = 0.01;

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
    powerUps = [];
    collectibles = [];
    
    // Reset player position and power-ups
    player.x = 400;
    player.y = 550;
    player.powerUps = [];
    
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
    const weaponType = WEAPON_TYPES[player.weaponType];
    const fireDelay = SHOT_DELAY / (shipDesign.fireRate * weaponType.fireRate);
    
    if (currentTime - lastShotTime < fireDelay) return;
    lastShotTime = currentTime;
    
    // Create bullets based on weapon type
    switch(player.weaponType) {
        case 'laser':
            bullets.push({
                x: player.x + player.width / 2 - 2,
                y: player.y,
                width: 4,
                height: 8,
                speed: weaponType.speed,
                damage: weaponType.damage * shipDesign.damage,
                color: weaponType.color,
                type: 'laser'
            });
            break;
        case 'plasma':
            bullets.push({
                x: player.x + player.width / 2 - 3,
                y: player.y,
                width: 6,
                height: 10,
                speed: weaponType.speed,
                damage: weaponType.damage * shipDesign.damage,
                color: weaponType.color,
                type: 'plasma'
            });
            break;
        case 'missile':
            bullets.push({
                x: player.x + player.width / 2 - 4,
                y: player.y,
                width: 8,
                height: 12,
                speed: weaponType.speed,
                damage: weaponType.damage * shipDesign.damage,
                color: weaponType.color,
                type: 'missile'
            });
            break;
        case 'spread':
            // Create multiple bullets in a spread pattern
            for (let i = -1; i <= 1; i++) {
                bullets.push({
                    x: player.x + player.width / 2 - 2 + (i * 8),
                    y: player.y,
                    width: 4,
                    height: 8,
                    speed: weaponType.speed,
                    damage: weaponType.damage * shipDesign.damage,
                    color: weaponType.color,
                    type: 'spread'
                });
            }
            break;
    }
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

// Spawn power-up
function spawnPowerUp() {
    if (Math.random() < POWERUP_SPAWN_RATE) {
        const powerUpTypes = Object.keys(POWERUP_TYPES);
        const randomType = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
        const powerUpDesign = POWERUP_TYPES[randomType];
        
        powerUps.push({
            x: Math.random() * (canvas.width - 30),
            y: -30,
            width: 30,
            height: 30,
            speed: 2,
            type: randomType,
            design: powerUpDesign
        });
    }
}

// Spawn collectible
function spawnCollectible() {
    if (Math.random() < COLLECTIBLE_SPAWN_RATE) {
        collectibles.push({
            x: Math.random() * (canvas.width - 20),
            y: -20,
            width: 20,
            height: 20,
            speed: 3,
            value: Math.floor(Math.random() * 5) + 5, // 5-10 points
            color: '#ffd700'
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

// Update power-ups
function updatePowerUps() {
    for (let i = powerUps.length - 1; i >= 0; i--) {
        powerUps[i].y += powerUps[i].speed;
        
        // Remove power-ups that go off screen
        if (powerUps[i].y > canvas.height) {
            powerUps.splice(i, 1);
        }
    }
}

// Update collectibles
function updateCollectibles() {
    for (let i = collectibles.length - 1; i >= 0; i--) {
        collectibles[i].y += collectibles[i].speed;
        
        // Remove collectibles that go off screen
        if (collectibles[i].y > canvas.height) {
            collectibles.splice(i, 1);
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
    
    // Player vs Power-up collisions
    for (let i = powerUps.length - 1; i >= 0; i--) {
        if (checkCollision(player, powerUps[i])) {
            const powerUp = powerUps[i];
            
            // Apply power-up effect
            switch(powerUp.type) {
                case 'health':
                    lives = Math.min(lives + 1, 5);
                    break;
                case 'weapon':
                    // Cycle through weapon types
                    const weaponTypes = Object.keys(WEAPON_TYPES);
                    const currentIndex = weaponTypes.indexOf(player.weaponType);
                    const nextIndex = (currentIndex + 1) % weaponTypes.length;
                    player.weaponType = weaponTypes[nextIndex];
                    break;
                case 'speed':
                    player.powerUps.push({ type: 'speed', duration: 300 });
                    break;
                case 'shield':
                    player.powerUps.push({ type: 'shield', duration: 300 });
                    break;
            }
            
            // Remove power-up
            powerUps.splice(i, 1);
            score += 5;
        }
    }
    
    // Player vs Collectible collisions
    for (let i = collectibles.length - 1; i >= 0; i--) {
        if (checkCollision(player, collectibles[i])) {
            score += collectibles[i].value;
            collectibles.splice(i, 1);
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
    
    // Draw power-ups
    drawPowerUps();
    
    // Draw collectibles
    drawCollectibles();
    
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
    
    // Draw shield effect if active
    const hasShield = player.powerUps.some(p => p.type === 'shield');
    if (hasShield) {
        ctx.strokeStyle = '#8888ff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(player.x + player.width / 2, player.y + player.height / 2, player.width / 2 + 5, 0, Math.PI * 2);
        ctx.stroke();
    }
    
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
    for (let bullet of bullets) {
        ctx.fillStyle = bullet.color || '#ffff00';
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

// Draw power-ups
function drawPowerUps() {
    for (let powerUp of powerUps) {
        const design = powerUp.design;
        
        // Draw power-up background
        ctx.fillStyle = design.color;
        ctx.fillRect(powerUp.x, powerUp.y, powerUp.width, powerUp.height);
        
        // Draw power-up symbol
        ctx.fillStyle = '#fff';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(design.symbol, powerUp.x + powerUp.width / 2, powerUp.y + powerUp.height / 2 + 5);
    }
}

// Draw collectibles
function drawCollectibles() {
    for (let collectible of collectibles) {
        // Draw collectible
        ctx.fillStyle = collectible.color;
        ctx.fillRect(collectible.x, collectible.y, collectible.width, collectible.height);
        
        // Draw value
        ctx.fillStyle = '#fff';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(collectible.value.toString(), collectible.x + collectible.width / 2, collectible.y + collectible.height / 2 + 3);
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
        updatePowerUps();
        updateCollectibles();
        updateExplosions();
        updateStars();
        checkCollisions();
        updateLevel();
        updateUI();
        spawnEnemy();
        spawnPowerUp();
        spawnCollectible();
        render();
    }
}

// Initialize game when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeGameElements);
} else {
    initializeGameElements();
}