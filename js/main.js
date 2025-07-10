// Simple Space Shooter Game
// Version 2.0 - Core shooting mechanics with enhanced ship designs and mobile touch controls

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

// Enhanced ship designs with detailed visual representations
const SHIP_DESIGNS = {
    fighter: {
        name: 'Fighter',
        color: '#4a90e2',
        accentColor: '#ffffff',
        width: 40,
        height: 40,
        speed: 5,
        fireRate: 1,
        damage: 1,
        design: 'fighter'
    },
    interceptor: {
        name: 'Interceptor',
        color: '#00ff88',
        accentColor: '#ffffff',
        width: 35,
        height: 45,
        speed: 6,
        fireRate: 1.2,
        damage: 1,
        design: 'interceptor'
    },
    blaster: {
        name: 'Blaster',
        color: '#ff6b35',
        accentColor: '#ffffff',
        width: 45,
        height: 35,
        speed: 4,
        fireRate: 0.8,
        damage: 2,
        design: 'blaster'
    },
    cruiser: {
        name: 'Cruiser',
        color: '#9b59b6',
        accentColor: '#ffffff',
        width: 50,
        height: 50,
        speed: 3,
        fireRate: 0.6,
        damage: 3,
        design: 'cruiser'
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

// Enhanced enemy ship designs
const ENEMY_DESIGNS = [
    {
        name: 'Scout',
        color: '#ff4444',
        accentColor: '#ffffff',
        width: 30,
        height: 30,
        speed: 3,
        points: 10,
        design: 'scout'
    },
    {
        name: 'Fighter',
        color: '#ff6666',
        accentColor: '#ffffff',
        width: 35,
        height: 35,
        speed: 2.5,
        points: 15,
        design: 'enemy_fighter'
    },
    {
        name: 'Destroyer',
        color: '#ff8888',
        accentColor: '#ffffff',
        width: 40,
        height: 40,
        speed: 2,
        points: 20,
        design: 'destroyer'
    },
    {
        name: 'Battleship',
        color: '#ffaaaa',
        accentColor: '#ffffff',
        width: 45,
        height: 45,
        speed: 1.5,
        points: 25,
        design: 'battleship'
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

// Touch controls for mobile
let touchControls = {
    isTouching: false,
    touchX: 0,
    touchY: 0,
    autoShoot: false,
    shootInterval: null
};

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
    
    // Touch controls for mobile
    setupTouchControls();
    
    // Button events
    if (startBtn) {
        startBtn.addEventListener('click', startGame);
    }
    
    if (restartBtn) {
        restartBtn.addEventListener('click', restartGame);
    }
}

// Setup touch controls for mobile devices
function setupTouchControls() {
    if (!canvas) return;
    
    // Prevent default touch behaviors
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd, { passive: false });
    canvas.addEventListener('touchcancel', handleTouchEnd, { passive: false });
    
    // Prevent zoom and scroll on canvas
    canvas.addEventListener('gesturestart', (e) => e.preventDefault());
    canvas.addEventListener('gesturechange', (e) => e.preventDefault());
    canvas.addEventListener('gestureend', (e) => e.preventDefault());
}

// Handle touch start
function handleTouchStart(e) {
    e.preventDefault();
    if (gameState !== 'playing') return;
    
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    touchControls.touchX = touch.clientX - rect.left;
    touchControls.touchY = touch.clientY - rect.top;
    touchControls.isTouching = true;
    
    // Start auto-shooting
    if (!touchControls.autoShoot) {
        touchControls.autoShoot = true;
        touchControls.shootInterval = setInterval(() => {
            if (gameState === 'playing') {
                shoot();
            }
        }, 300); // Shoot every 300ms while touching
    }
}

// Handle touch move
function handleTouchMove(e) {
    e.preventDefault();
    if (gameState !== 'playing' || !touchControls.isTouching) return;
    
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    touchControls.touchX = touch.clientX - rect.left;
    touchControls.touchY = touch.clientY - rect.top;
}

// Handle touch end
function handleTouchEnd(e) {
    e.preventDefault();
    touchControls.isTouching = false;
    
    // Stop auto-shooting
    if (touchControls.autoShoot) {
        touchControls.autoShoot = false;
        if (touchControls.shootInterval) {
            clearInterval(touchControls.shootInterval);
            touchControls.shootInterval = null;
        }
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
    
    // Keyboard movement
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
    
    // Touch movement for mobile
    if (touchControls.isTouching && gameState === 'playing') {
        // Move player towards touch position
        const targetX = touchControls.touchX - player.width / 2;
        const targetY = touchControls.touchY - player.height / 2;
        
        // Smooth movement towards touch position
        if (Math.abs(player.x - targetX) > 5) {
            player.x += (targetX - player.x) * 0.1;
        }
        if (Math.abs(player.y - targetY) > 5) {
            player.y += (targetY - player.y) * 0.1;
        }
        
        // Keep player within bounds
        player.x = Math.max(0, Math.min(canvas.width - player.width, player.x));
        player.y = Math.max(0, Math.min(canvas.height - player.height, player.y));
    }
    
    // Keyboard shooting
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
    
    // Draw touch indicator for mobile
    drawTouchIndicator();
}

// Draw stars
function drawStars() {
    ctx.fillStyle = '#fff';
    for (let star of stars) {
        ctx.fillRect(star.x, star.y, 1, 1);
    }
}

// Enhanced player ship drawing with detailed designs
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
    
    // Draw ship based on type
    switch(player.shipType) {
        case 'fighter':
            drawFighterShip(player.x, player.y, player.width, player.height, shipDesign);
            break;
        case 'interceptor':
            drawInterceptorShip(player.x, player.y, player.width, player.height, shipDesign);
            break;
        case 'blaster':
            drawBlasterShip(player.x, player.y, player.width, player.height, shipDesign);
            break;
        case 'cruiser':
            drawCruiserShip(player.x, player.y, player.width, player.height, shipDesign);
            break;
    }
}

// Enhanced ship drawing functions with advanced designs
function drawFighterShip(x, y, width, height, design) {
    // Main body - sleek fighter design
    ctx.fillStyle = design.color;
    ctx.beginPath();
    ctx.moveTo(x + width/2, y);
    ctx.lineTo(x + width - 5, y + height/3);
    ctx.lineTo(x + width - 8, y + height - 10);
    ctx.lineTo(x + width/2, y + height);
    ctx.lineTo(x + 8, y + height - 10);
    ctx.lineTo(x + 5, y + height/3);
    ctx.closePath();
    ctx.fill();
    
    // Cockpit
    ctx.fillStyle = design.accentColor;
    ctx.beginPath();
    ctx.ellipse(x + width/2, y + height/3, 8, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Wings
    ctx.fillStyle = design.color;
    ctx.fillRect(x - 3, y + height/2, 8, 4);
    ctx.fillRect(x + width - 5, y + height/2, 8, 4);
    
    // Engine glow
    ctx.fillStyle = '#ffff00';
    ctx.fillRect(x + width/2 - 3, y + height - 2, 6, 2);
    ctx.fillStyle = '#ff8800';
    ctx.fillRect(x + width/2 - 2, y + height - 1, 4, 1);
}

function drawInterceptorShip(x, y, width, height, design) {
    // Main body - fast interceptor design
    ctx.fillStyle = design.color;
    ctx.beginPath();
    ctx.moveTo(x + width/2, y);
    ctx.lineTo(x + width - 3, y + height/4);
    ctx.lineTo(x + width - 5, y + height/2);
    ctx.lineTo(x + width - 3, y + height - 5);
    ctx.lineTo(x + width/2, y + height);
    ctx.lineTo(x + 3, y + height - 5);
    ctx.lineTo(x + 5, y + height/2);
    ctx.lineTo(x + 3, y + height/4);
    ctx.closePath();
    ctx.fill();
    
    // Cockpit
    ctx.fillStyle = design.accentColor;
    ctx.beginPath();
    ctx.ellipse(x + width/2, y + height/3, 6, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Extended wings
    ctx.fillStyle = design.color;
    ctx.fillRect(x - 8, y + height/3, 12, 3);
    ctx.fillRect(x + width - 4, y + height/3, 12, 3);
    
    // Engine glow
    ctx.fillStyle = '#00ffff';
    ctx.fillRect(x + width/2 - 2, y + height - 1, 4, 1);
    ctx.fillStyle = '#0088ff';
    ctx.fillRect(x + width/2 - 1, y + height, 2, 1);
}

function drawBlasterShip(x, y, width, height, design) {
    // Main body - heavy blaster design
    ctx.fillStyle = design.color;
    ctx.beginPath();
    ctx.moveTo(x + width/2, y);
    ctx.lineTo(x + width - 8, y + height/4);
    ctx.lineTo(x + width - 5, y + height/2);
    ctx.lineTo(x + width - 8, y + height - 8);
    ctx.lineTo(x + width/2, y + height);
    ctx.lineTo(x + 8, y + height - 8);
    ctx.lineTo(x + 5, y + height/2);
    ctx.lineTo(x + 8, y + height/4);
    ctx.closePath();
    ctx.fill();
    
    // Cockpit
    ctx.fillStyle = design.accentColor;
    ctx.fillRect(x + width/2 - 4, y + height/3, 8, 8);
    
    // Weapon pods
    ctx.fillStyle = design.color;
    ctx.fillRect(x + 2, y + 5, 10, 10);
    ctx.fillRect(x + width - 12, y + 5, 10, 10);
    
    // Engine glow
    ctx.fillStyle = '#ff4400';
    ctx.fillRect(x + width/2 - 4, y + height - 3, 8, 3);
    ctx.fillStyle = '#ff8800';
    ctx.fillRect(x + width/2 - 2, y + height - 1, 4, 1);
}

function drawCruiserShip(x, y, width, height, design) {
    // Main body - massive cruiser design
    ctx.fillStyle = design.color;
    ctx.beginPath();
    ctx.moveTo(x + width/2, y);
    ctx.lineTo(x + width - 10, y + height/5);
    ctx.lineTo(x + width - 8, y + height/2);
    ctx.lineTo(x + width - 10, y + height - 10);
    ctx.lineTo(x + width/2, y + height);
    ctx.lineTo(x + 10, y + height - 10);
    ctx.lineTo(x + 8, y + height/2);
    ctx.lineTo(x + 10, y + height/5);
    ctx.closePath();
    ctx.fill();
    
    // Cockpit
    ctx.fillStyle = design.accentColor;
    ctx.fillRect(x + width/2 - 6, y + height/4, 12, 12);
    
    // Heavy armor plates
    ctx.fillStyle = design.color;
    ctx.fillRect(x + 1, y + height/3, 8, 8);
    ctx.fillRect(x + width - 9, y + height/3, 8, 8);
    
    // Engine glow
    ctx.fillStyle = '#ff00ff';
    ctx.fillRect(x + width/2 - 6, y + height - 4, 12, 4);
    ctx.fillStyle = '#ff88ff';
    ctx.fillRect(x + width/2 - 3, y + height - 1, 6, 1);
}

// Enhanced enemy ship drawing
function drawEnemies() {
    for (let enemy of enemies) {
        const design = enemy.design;
        
        switch(design.design) {
            case 'scout':
                drawScoutEnemy(enemy.x, enemy.y, enemy.width, enemy.height, design);
                break;
            case 'enemy_fighter':
                drawEnemyFighter(enemy.x, enemy.y, enemy.width, enemy.height, design);
                break;
            case 'destroyer':
                drawDestroyerEnemy(enemy.x, enemy.y, enemy.width, enemy.height, design);
                break;
            case 'battleship':
                drawBattleshipEnemy(enemy.x, enemy.y, enemy.width, enemy.height, design);
                break;
        }
    }
}

// Enhanced enemy ship designs
function drawScoutEnemy(x, y, width, height, design) {
    // Small, fast enemy scout
    ctx.fillStyle = design.color;
    ctx.beginPath();
    ctx.moveTo(x + width/2, y + height);
    ctx.lineTo(x + width - 3, y + height/2);
    ctx.lineTo(x + width - 2, y);
    ctx.lineTo(x + width/2, y + 2);
    ctx.lineTo(x + 2, y);
    ctx.lineTo(x + 3, y + height/2);
    ctx.closePath();
    ctx.fill();
    
    // Cockpit
    ctx.fillStyle = design.accentColor;
    ctx.beginPath();
    ctx.ellipse(x + width/2, y + height/3, 4, 3, 0, 0, Math.PI * 2);
    ctx.fill();
}

function drawEnemyFighter(x, y, width, height, design) {
    // Standard enemy fighter
    ctx.fillStyle = design.color;
    ctx.beginPath();
    ctx.moveTo(x + width/2, y + height);
    ctx.lineTo(x + width - 5, y + height/3);
    ctx.lineTo(x + width - 3, y);
    ctx.lineTo(x + width/2, y + 3);
    ctx.lineTo(x + 3, y);
    ctx.lineTo(x + 5, y + height/3);
    ctx.closePath();
    ctx.fill();
    
    // Cockpit
    ctx.fillStyle = design.accentColor;
    ctx.fillRect(x + width/2 - 3, y + height/3, 6, 4);
    
    // Wings
    ctx.fillStyle = design.color;
    ctx.fillRect(x + 1, y + height/2, 4, 3);
    ctx.fillRect(x + width - 5, y + height/2, 4, 3);
}

function drawDestroyerEnemy(x, y, width, height, design) {
    // Larger, more powerful enemy destroyer
    ctx.fillStyle = design.color;
    ctx.beginPath();
    ctx.moveTo(x + width/2, y + height);
    ctx.lineTo(x + width - 8, y + height/3);
    ctx.lineTo(x + width - 5, y);
    ctx.lineTo(x + width/2, y + 5);
    ctx.lineTo(x + 5, y);
    ctx.lineTo(x + 8, y + height/3);
    ctx.closePath();
    ctx.fill();
    
    // Cockpit
    ctx.fillStyle = design.accentColor;
    ctx.fillRect(x + width/2 - 5, y + height/4, 10, 8);
    
    // Weapon pods
    ctx.fillStyle = design.color;
    ctx.fillRect(x + 2, y + 3, 6, 6);
    ctx.fillRect(x + width - 8, y + 3, 6, 6);
}

function drawBattleshipEnemy(x, y, width, height, design) {
    // Largest, most powerful enemy battleship
    ctx.fillStyle = design.color;
    ctx.beginPath();
    ctx.moveTo(x + width/2, y + height);
    ctx.lineTo(x + width - 12, y + height/3);
    ctx.lineTo(x + width - 8, y);
    ctx.lineTo(x + width/2, y + 8);
    ctx.lineTo(x + 8, y);
    ctx.lineTo(x + 12, y + height/3);
    ctx.closePath();
    ctx.fill();
    
    // Cockpit
    ctx.fillStyle = design.accentColor;
    ctx.fillRect(x + width/2 - 8, y + height/5, 16, 12);
    
    // Heavy armor
    ctx.fillStyle = design.color;
    ctx.fillRect(x + 1, y + height/3, 6, 6);
    ctx.fillRect(x + width - 7, y + height/3, 6, 6);
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

// Draw touch indicator for mobile
function drawTouchIndicator() {
    if (touchControls.isTouching && gameState === 'playing') {
        // Draw touch position indicator
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.arc(touchControls.touchX, touchControls.touchY, 20, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
        
        // Draw line from player to touch position
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(player.x + player.width / 2, player.y + player.height / 2);
        ctx.lineTo(touchControls.touchX, touchControls.touchY);
        ctx.stroke();
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