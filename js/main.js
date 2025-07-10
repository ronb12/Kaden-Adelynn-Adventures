// Kaden & Adelynn Space Adventures - Enhanced Version 3.3
// A space shooter game with multiple ships, weapons, and power-ups
// Enhanced ship designs and 4x faster autofire

// Game variables
let canvas, ctx, scoreElement, livesElement, levelElement, gameOverScreen, startScreen, finalScoreElement, restartBtn, startBtn, highScoreElement, fullscreenBtn;

// Audio system
let audioContext;
let sounds = {};

// Initialize audio system
function initAudio() {
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        createSounds();
    } catch (e) {
        console.log('Audio not supported:', e);
    }
}

// Create sound effects
function createSounds() {
    // Laser sound
    sounds.laser = createTone(800, 0.1, 'sine');
    
    // Plasma sound
    sounds.plasma = createTone(600, 0.15, 'square');
    
    // Missile sound
    sounds.missile = createTone(400, 0.3, 'sawtooth');
    
    // Explosion sound
    sounds.explosion = createTone(200, 0.4, 'triangle');
    
    // Power-up sound
    sounds.powerup = createTone(1200, 0.2, 'sine');
    
    // Enemy hit sound
    sounds.enemyHit = createTone(300, 0.1, 'square');
    
    // Player hit sound
    sounds.playerHit = createTone(150, 0.3, 'sawtooth');
}

// Create a tone with specified frequency, duration, and waveform
function createTone(frequency, duration, type = 'sine') {
    return function() {
        if (!audioContext) return;
        
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
        oscillator.type = type;
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration);
    };
}

// Play sound function
function playSound(soundName) {
    if (sounds[soundName]) {
        sounds[soundName]();
    }
}

// Game state
let gameState = 'start';
let score = 0;
let lives = 50;
let level = 1;
let animationId = null; // Changed from gameLoop to animationId
let highScore = localStorage.getItem('spaceShooterHighScore') || 0;

// Top score tracking system
let topScores = JSON.parse(localStorage.getItem('spaceShooterTopScores') || '[]');

// Add score to top scores
function addToTopScores(score) {
    topScores.push({
        score: score,
        date: new Date().toLocaleDateString(),
        level: level
    });
    
    // Sort by score (highest first) and keep only top 10
    topScores.sort((a, b) => b.score - a.score);
    topScores = topScores.slice(0, 10);
    
    // Save to localStorage
    localStorage.setItem('spaceShooterTopScores', JSON.stringify(topScores));
}

// Player
let player = {
    x: 400,
    y: 550,
    width: 60,
    height: 60,
    speed: 5,
    shipType: 'fighter', // fighter, interceptor, blaster, cruiser
    weaponType: 'laser', // laser, plasma, missile, spread
    powerUps: [],
    health: 5, // Player now has health instead of just lives
    maxHealth: 5,
    invulnerable: false,
    invulnerabilityTime: 0
};

// Enhanced ship designs with detailed visual representations
const SHIP_DESIGNS = {
    fighter: {
        name: 'Fighter',
        color: '#4a90e2',
        accentColor: '#ffffff',
        width: 60,
        height: 60,
        speed: 5,
        fireRate: 1,
        damage: 1,
        design: 'fighter'
    },
    interceptor: {
        name: 'Interceptor',
        color: '#00ff88',
        accentColor: '#ffffff',
        width: 55,
        height: 65,
        speed: 6,
        fireRate: 1.2,
        damage: 1,
        design: 'interceptor'
    },
    blaster: {
        name: 'Blaster',
        color: '#ff6b35',
        accentColor: '#ffffff',
        width: 65,
        height: 55,
        speed: 4,
        fireRate: 0.8,
        damage: 2,
        design: 'blaster'
    },
    cruiser: {
        name: 'Cruiser',
        color: '#9b59b6',
        accentColor: '#ffffff',
        width: 70,
        height: 70,
        speed: 3,
        fireRate: 0.6,
        damage: 3,
        design: 'cruiser'
    }
};

// Weapon types with enhanced firing patterns
const WEAPON_TYPES = {
    laser: {
        name: 'Laser',
        color: '#00ffff',
        damage: 1,
        speed: 8,
        fireRate: 0.05, // 50ms between shots (4x faster)
        pattern: 'single',
        rapidFire: false,
        multiShot: 1
    },
    plasma: {
        name: 'Plasma',
        color: '#ff00ff',
        damage: 2,
        speed: 6,
        fireRate: 0.075, // 75ms between shots (4x faster)
        pattern: 'single',
        rapidFire: false,
        multiShot: 1
    },
    missile: {
        name: 'Missile',
        color: '#ffff00',
        damage: 3,
        speed: 5,
        fireRate: 0.125, // 125ms between shots (4x faster)
        pattern: 'single',
        rapidFire: false,
        multiShot: 1
    },
    spread: {
        name: 'Spread',
        color: '#ff8800',
        damage: 1,
        speed: 7,
        fireRate: 0.1, // 100ms between shots (4x faster)
        pattern: 'spread',
        rapidFire: false,
        multiShot: 3
    },
    rapid: {
        name: 'Rapid',
        color: '#00ff00',
        damage: 1,
        speed: 9,
        fireRate: 0.0125, // 12.5ms between shots - extremely fast! (4x faster)
        pattern: 'single',
        rapidFire: true,
        multiShot: 1
    },
    burst: {
        name: 'Burst',
        color: '#ff0080',
        damage: 2,
        speed: 7,
        fireRate: 0.075, // 75ms between bursts (4x faster)
        pattern: 'burst',
        rapidFire: false,
        multiShot: 3
    },
    shotgun: {
        name: 'Shotgun',
        color: '#ff6600',
        damage: 1,
        speed: 6,
        fireRate: 0.15, // 150ms between shots (4x faster)
        pattern: 'shotgun',
        rapidFire: false,
        multiShot: 5
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
        width: 45,
        height: 45,
        speed: 3,
        points: 10,
        design: 'scout'
    },
    {
        name: 'Fighter',
        color: '#ff6666',
        accentColor: '#ffffff',
        width: 50,
        height: 50,
        speed: 2.5,
        points: 15,
        design: 'enemy_fighter'
    },
    {
        name: 'Destroyer',
        color: '#ff8888',
        accentColor: '#ffffff',
        width: 55,
        height: 55,
        speed: 2,
        points: 20,
        design: 'destroyer'
    },
    {
        name: 'Battleship',
        color: '#ffaaaa',
        accentColor: '#ffffff',
        width: 60,
        height: 60,
        speed: 1.5,
        points: 25,
        design: 'battleship'
    }
];

// Game objects
let bullets = [];
let enemyBullets = [];
let enemies = [];
let explosions = [];
let stars = [];
let powerUps = [];
let collectibles = [];

// Game constants
const BULLET_SPEED = 10; // Increased from 7
const ENEMY_SPEED = 3; // Increased from 2
const ENEMY_SHOOT_RATE = 0.01; // Increased enemy shooting rate
const ENEMY_BULLET_SPEED = 5; // Increased from 4
const SHOT_DELAY = 200;
const POWERUP_SPAWN_RATE = 0.005;
const COLLECTIBLE_SPAWN_RATE = 0.01;
const PLAYER_INVULNERABILITY_TIME = 2000; // 2 seconds of invulnerability after hit

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
    fullscreenBtn = document.getElementById('fullscreenBtn');
    
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
    
    // Menu button event
    const menuBtn = document.getElementById('menuBtn');
    if (menuBtn) {
        menuBtn.addEventListener('click', returnToMenu);
    }
    
    // Fullscreen button
    if (fullscreenBtn) {
        fullscreenBtn.addEventListener('click', toggleFullscreen);
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

// Start game function
function startGame() {
    // Initialize audio on first user interaction
    if (!audioContext) {
        initAudio();
    }
    
    // Reset game state
    gameState = 'playing';
    score = 0;
    lives = 50;
    level = 1;
    
    // Reset player
    player.x = 400;
    player.y = 550;
    player.powerUps = [];
    player.health = player.maxHealth; // Reset player health
    
    // Switch from menu to game screen
    document.getElementById('menuContainer').classList.add('hidden');
    document.getElementById('gameContainer').classList.remove('hidden');
    
    // Clear arrays
    bullets = [];
    enemyBullets = [];
    enemies = [];
    explosions = [];
    powerUps = [];
    collectibles = [];
    
    // Initialize stars
    initStars();
    
    // Start game loop with requestAnimationFrame for better performance
    if (animationId) cancelAnimationFrame(animationId);
    animationId = requestAnimationFrame(gameLoop);
}

// Improved game loop function
function gameLoop() {
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
    
    // Continue the loop
    if (gameState === 'playing') {
        animationId = requestAnimationFrame(gameLoop);
    }
}

// Game over function
function gameOver() {
    gameState = 'gameOver';
    cancelAnimationFrame(animationId);
    
    // Update high score
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('spaceShooterHighScore', highScore);
    }
    
    // Add current score to top scores
    addToTopScores(score);
    
    // Update final score display
    if (finalScoreElement) finalScoreElement.textContent = score;
    if (highScoreElement) highScoreElement.textContent = highScore;
    
    // Display top scores
    displayTopScores();
    
    // Show game over screen
    if (gameOverScreen) {
        gameOverScreen.classList.remove('hidden');
    }
}

// Display top scores
function displayTopScores() {
    const topScoresList = document.getElementById('topScoresList');
    if (!topScoresList) return;
    
    topScoresList.innerHTML = '';
    
    topScores.forEach((scoreData, index) => {
        const scoreItem = document.createElement('div');
        scoreItem.className = 'top-score-item';
        scoreItem.innerHTML = `
            <span class="top-score-rank">#${index + 1}</span>
            <span class="top-score-value">${scoreData.score.toLocaleString()}</span>
            <span class="top-score-date">${scoreData.date}</span>
            <span class="top-score-level">Lvl ${scoreData.level}</span>
        `;
        topScoresList.appendChild(scoreItem);
    });
}

// Restart game
function restartGame() {
    // Hide game over screen
    if (gameOverScreen) gameOverScreen.style.display = 'none';
    
    // Start new game
    startGame();
}

// Return to main menu
function returnToMenu() {
    gameState = 'menu';
    
    // Switch from game to menu screen
    const menuContainer = document.getElementById('menuContainer');
    const gameContainer = document.getElementById('gameContainer');
    
    if (menuContainer) menuContainer.classList.remove('hidden');
    if (gameContainer) gameContainer.classList.add('hidden');
    
    // Hide game over screen
    if (gameOverScreen) gameOverScreen.style.display = 'none';
    
    console.log('Returned to main menu');
}

// Enhanced shooting function with multiple patterns
function shoot() {
    const now = Date.now();
    const weaponType = WEAPON_TYPES[player.weaponType];
    
    if (now - lastShotTime > weaponType.fireRate * 1000) {
        const bulletSpeed = weaponType.speed;
        const bulletDamage = weaponType.damage;
        const bulletColor = weaponType.color;
        
        switch(weaponType.pattern) {
            case 'single':
                // Single shot
                bullets.push({
                    x: player.x + player.width / 2 - 2,
                    y: player.y,
                    width: 4,
                    height: 8,
                    speed: bulletSpeed,
                    damage: bulletDamage,
                    color: bulletColor
                });
                playSound('laser');
                break;
                
            case 'spread':
                // Spread shot - 3 bullets in a spread pattern
                for (let i = 0; i < weaponType.multiShot; i++) {
                    const spread = (i - 1) * 15; // -15, 0, +15 degrees
                    const angle = (spread * Math.PI) / 180;
                    bullets.push({
                        x: player.x + player.width / 2 - 2,
                        y: player.y,
                        width: 4,
                        height: 8,
                        speed: bulletSpeed,
                        damage: bulletDamage,
                        color: bulletColor,
                        angle: angle
                    });
                }
                playSound('plasma');
                break;
                
            case 'burst':
                // Burst fire - 3 bullets in quick succession
                for (let i = 0; i < weaponType.multiShot; i++) {
                    setTimeout(() => {
                        bullets.push({
                            x: player.x + player.width / 2 - 2,
                            y: player.y,
                            width: 4,
                            height: 8,
                            speed: bulletSpeed,
                            damage: bulletDamage,
                            color: bulletColor
                        });
                        playSound('laser');
                    }, i * 100);
                }
                break;
                
            case 'shotgun':
                // Shotgun - 5 bullets in a wide spread
                for (let i = 0; i < weaponType.multiShot; i++) {
                    const spread = (i - 2) * 20; // -40, -20, 0, +20, +40 degrees
                    const angle = (spread * Math.PI) / 180;
                    bullets.push({
                        x: player.x + player.width / 2 - 2,
                        y: player.y,
                        width: 4,
                        height: 8,
                        speed: bulletSpeed,
                        damage: bulletDamage,
                        color: bulletColor,
                        angle: angle
                    });
                }
                playSound('missile');
                break;
        }
        
        lastShotTime = now;
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
            design: enemyDesign,
            lastShot: 0,
            shotDelay: 1000 + Math.random() * 2000, // Random shot delay between 1-3 seconds
            health: 1 // Enemies have health too
        });
    }
}

// Enemy shooting function
function enemyShoot(enemy) {
    const now = Date.now();
    if (now - enemy.lastShot > enemy.shotDelay) {
        const bullet = {
            x: enemy.x + enemy.width / 2,
            y: enemy.y + enemy.height,
            width: 4,
            height: 8,
            speed: ENEMY_BULLET_SPEED,
            color: '#ff4444'
        };
        enemyBullets.push(bullet);
        enemy.lastShot = now;
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
    
    // Check invulnerability
    if (player.invulnerable && Date.now() > player.invulnerabilityTime) {
        player.invulnerable = false;
    }
    
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

// Update bullets with angled movement
function updateBullets() {
    for (let i = bullets.length - 1; i >= 0; i--) {
        const bullet = bullets[i];
        
        if (bullet.angle) {
            // Angled bullet movement
            bullet.x += Math.sin(bullet.angle) * bullet.speed * 0.5;
            bullet.y -= Math.cos(bullet.angle) * bullet.speed;
        } else {
            // Straight bullet movement
            bullet.y -= bullet.speed;
        }
        
        if (bullet.y < 0) {
            bullets.splice(i, 1);
        }
    }
    
    // Update enemy bullets
    for (let i = enemyBullets.length - 1; i >= 0; i--) {
        enemyBullets[i].y += enemyBullets[i].speed;
        if (enemyBullets[i].y > canvas.height) {
            enemyBullets.splice(i, 1);
        }
    }
}

// Update enemies
function updateEnemies() {
    for (let i = enemies.length - 1; i >= 0; i--) {
        enemies[i].y += enemies[i].speed;
        
        // Enemy shooting
        if (enemies[i].y > 0 && enemies[i].y < canvas.height - 100) {
            enemyShoot(enemies[i]);
        }
        
        // Remove enemies that go off screen
        if (enemies[i].y > canvas.height) {
            enemies.splice(i, 1);
            if (lives > 0) lives--;
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

// Check collisions with sound effects
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
                
                // Play explosion sound
                playSound('explosion');
                
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
    
    // Enemy bullets vs Player collisions
    for (let i = enemyBullets.length - 1; i >= 0; i--) {
        if (!player.invulnerable && checkCollision(enemyBullets[i], player)) {
            // Remove enemy bullet
            enemyBullets.splice(i, 1);
            
            // Damage player
            player.health--;
            
            // Play player hit sound
            playSound('playerHit');
            
            // Make player invulnerable temporarily
            player.invulnerable = true;
            player.invulnerabilityTime = Date.now() + PLAYER_INVULNERABILITY_TIME;
            
            // Create explosion at player position
            explosions.push({
                x: player.x + player.width / 2,
                y: player.y + player.height / 2,
                life: 15
            });
            
            // Check if player should lose a life (after 5 hits)
            if (player.health <= 0) {
                lives--;
                player.health = player.maxHealth; // Reset health
                
                if (lives <= 0) {
                    gameOver();
                }
            }
        }
    }
    
    // Player vs Power-up collisions
    for (let i = powerUps.length - 1; i >= 0; i--) {
        if (checkCollision(player, powerUps[i])) {
            const powerUp = powerUps[i];
            
            // Play power-up sound
            playSound('powerup');
            
            // Apply power-up effect
            switch(powerUp.type) {
                case 'health':
                    player.health = Math.min(player.health + 1, player.maxHealth);
                    break;
                case 'weapon':
                    // Cycle through weapon types with visual feedback
                    const weaponTypes = Object.keys(WEAPON_TYPES);
                    const currentIndex = weaponTypes.indexOf(player.weaponType);
                    const nextIndex = (currentIndex + 1) % weaponTypes.length;
                    player.weaponType = weaponTypes[nextIndex];
                    
                    // Add visual feedback for weapon change
                    console.log('Weapon changed to:', WEAPON_TYPES[player.weaponType].name);
                    
                    // Create a temporary weapon change indicator
                    explosions.push({
                        x: player.x + player.width / 2,
                        y: player.y + player.height / 2,
                        life: 20,
                        type: 'weapon_change',
                        weaponName: WEAPON_TYPES[player.weaponType].name
                    });
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
    
    // Update health display if element exists
    const healthElement = document.getElementById('health');
    if (healthElement) {
        healthElement.textContent = player.health;
    }
    
    // Update current weapon display
    const weaponElement = document.getElementById('currentWeapon');
    if (weaponElement) {
        const currentWeapon = WEAPON_TYPES[player.weaponType];
        weaponElement.textContent = currentWeapon.name;
        weaponElement.style.color = currentWeapon.color;
    }
}

// Render function
function render() {
    // Check if canvas and context are available
    if (!canvas || !ctx) {
        console.log('Canvas or context not available for rendering');
        return;
    }
    
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
    
    // Draw enemy bullets
    drawEnemyBullets();
    
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

// Draw bullets
function drawBullets() {
    for (let bullet of bullets) {
        // Draw bullet based on type
        switch(bullet.type) {
            case 'laser':
                ctx.fillStyle = '#00ffff';
                ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
                break;
            case 'plasma':
                ctx.fillStyle = '#ff00ff';
                ctx.beginPath();
                ctx.arc(bullet.x + bullet.width/2, bullet.y + bullet.height/2, bullet.width/2, 0, Math.PI * 2);
                ctx.fill();
                break;
            case 'missile':
                ctx.fillStyle = '#ff8800';
                ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
                // Add missile trail
                ctx.fillStyle = 'rgba(255, 136, 0, 0.5)';
                ctx.fillRect(bullet.x, bullet.y + bullet.height, bullet.width, 3);
                break;
            default:
                ctx.fillStyle = '#ffff00';
                ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
                break;
        }
    }
}

// Enhanced player ship drawing with detailed designs
function drawPlayer() {
    if (!player.invulnerable || Math.floor(Date.now() / 100) % 2) {
        const shipDesign = SHIP_DESIGNS[player.shipType];
        
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
}

// Enhanced ship drawing functions with advanced designs
function drawFighterShip(x, y, width, height, design) {
    // Main body - advanced triangular shape with armor plates
    ctx.fillStyle = design.color;
    ctx.beginPath();
    ctx.moveTo(x + width/2, y); // Top point
    ctx.lineTo(x + width - 2, y + height/3); // Upper right
    ctx.lineTo(x + width, y + height); // Bottom right
    ctx.lineTo(x + width/2, y + height - 2); // Bottom center
    ctx.lineTo(x, y + height); // Bottom left
    ctx.lineTo(x + 2, y + height/3); // Upper left
    ctx.closePath();
    ctx.fill();
    
    // Advanced cockpit with multiple layers
    ctx.fillStyle = design.accentColor;
    ctx.beginPath();
    ctx.ellipse(x + width/2, y + height/3, width/6, height/8, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Inner cockpit detail
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(x + width/2, y + height/3, width/10, height/12, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Enhanced engine glow with multiple colors
    const time = Date.now() * 0.01;
    const glowIntensity = Math.sin(time) * 0.5 + 0.5;
    ctx.fillStyle = `rgba(255, 255, 0, ${glowIntensity})`;
    ctx.fillRect(x + width/4, y + height - 5, width/2, 3);
    
    // Secondary engine glow
    ctx.fillStyle = `rgba(0, 255, 255, ${glowIntensity * 0.7})`;
    ctx.fillRect(x + width/4 + 2, y + height - 3, width/2 - 4, 2);
    
    // Advanced wing design with multiple segments
    ctx.fillStyle = design.color;
    // Left wing
    ctx.fillRect(x + 2, y + height/2, 8, 6);
    ctx.fillRect(x + 4, y + height/2 + 2, 4, 2);
    // Right wing
    ctx.fillRect(x + width - 10, y + height/2, 8, 6);
    ctx.fillRect(x + width - 8, y + height/2 + 2, 4, 2);
    
    // Weapon ports
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(x + width/2 - 2, y + height - 8, 4, 3);
}

function drawInterceptorShip(x, y, width, height, design) {
    // Sleek, aerodynamic design with advanced curves
    ctx.fillStyle = design.color;
    ctx.beginPath();
    ctx.moveTo(x + width/2, y); // Top point
    ctx.lineTo(x + width - 4, y + height/4); // Upper right curve
    ctx.lineTo(x + width - 2, y + height/2); // Middle right
    ctx.lineTo(x + width, y + height); // Bottom right
    ctx.lineTo(x + width/2, y + height - 3); // Bottom center
    ctx.lineTo(x, y + height); // Bottom left
    ctx.lineTo(x + 2, y + height/2); // Middle left
    ctx.lineTo(x + 4, y + height/4); // Upper left curve
    ctx.closePath();
    ctx.fill();
    
    // Advanced cockpit with HUD elements
    ctx.fillStyle = design.accentColor;
    ctx.fillRect(x + width/2 - 5, y + height/4, 10, 8);
    
    // HUD display
    ctx.fillStyle = '#00ffff';
    ctx.fillRect(x + width/2 - 3, y + height/4 + 2, 6, 2);
    ctx.fillRect(x + width/2 - 1, y + height/4 + 5, 2, 2);
    
    // Enhanced engine trails with particle effect
    const time = Date.now() * 0.02;
    for (let i = 0; i < 3; i++) {
        const alpha = Math.sin(time + i) * 0.5 + 0.5;
        ctx.fillStyle = `rgba(0, 255, 255, ${alpha})`;
        ctx.fillRect(x + width/4 + i * 2, y + height - 3 - i, 2, 2);
    }
    
    // Advanced weapon systems
    ctx.fillStyle = '#ff00ff';
    ctx.fillRect(x + 1, y + height/2, 6, 4);
    ctx.fillRect(x + width - 7, y + height/2, 6, 4);
}

function drawBlasterShip(x, y, width, height, design) {
    // Heavy, armored design with multiple weapon systems
    ctx.fillStyle = design.color;
    ctx.beginPath();
    ctx.moveTo(x + width/2, y + 3); // Top center
    ctx.lineTo(x + width - 6, y + height/4); // Upper right
    ctx.lineTo(x + width - 3, y + height/2); // Middle right
    ctx.lineTo(x + width, y + height); // Bottom right
    ctx.lineTo(x + width/2, y + height - 4); // Bottom center
    ctx.lineTo(x, y + height); // Bottom left
    ctx.lineTo(x + 3, y + height/2); // Middle left
    ctx.lineTo(x + 6, y + height/4); // Upper left
    ctx.closePath();
    ctx.fill();
    
    // Heavy armor plates with metallic effect
    ctx.fillStyle = '#ff4400';
    ctx.fillRect(x + width/4, y + height/3, width/2, 6);
    ctx.fillRect(x + width/6, y + height/2, width/3, 4);
    
    // Advanced weapon pods with targeting systems
    ctx.fillStyle = design.accentColor;
    // Left weapon pod
    ctx.fillRect(x + 2, y + height/2, 10, 8);
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(x + 4, y + height/2 + 2, 6, 4);
    
    // Right weapon pod
    ctx.fillStyle = design.accentColor;
    ctx.fillRect(x + width - 12, y + height/2, 10, 8);
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(x + width - 10, y + height/2 + 2, 6, 4);
    
    // Central weapon system
    ctx.fillStyle = '#ffff00';
    ctx.fillRect(x + width/2 - 4, y + height/2, 8, 6);
    
    // Engine array with power indicators
    ctx.fillStyle = '#ff6600';
    for (let i = 0; i < 4; i++) {
        ctx.fillRect(x + width/5 + i * width/8, y + height - 5, 3, 4);
    }
}

function drawCruiserShip(x, y, width, height, design) {
    // Massive, battleship design with multiple weapon systems
    ctx.fillStyle = design.color;
    ctx.fillRect(x + width/6, y, width/1.5, height);
    
    // Command bridge
    ctx.fillStyle = design.accentColor;
    ctx.fillRect(x + width/2 - 8, y + height/6, 16, 8);
    
    // Bridge windows
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x + width/2 - 6, y + height/6 + 2, 12, 4);
    
    // Heavy armor plating with multiple layers
    ctx.fillStyle = '#8b4513';
    ctx.fillRect(x + width/8, y + height/4, width/1.3, height/2);
    ctx.fillStyle = '#654321';
    ctx.fillRect(x + width/6, y + height/3, width/1.5, height/3);
    
    // Multiple weapon systems
    ctx.fillStyle = design.accentColor;
    // Primary weapons
    ctx.fillRect(x + 4, y + height/3, 8, 8);
    ctx.fillRect(x + width - 12, y + height/3, 8, 8);
    ctx.fillRect(x + width/2 - 4, y + height/2, 8, 8);
    
    // Secondary weapons
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(x + width/4, y + height/4, 6, 6);
    ctx.fillRect(x + width * 3/4 - 3, y + height/4, 6, 6);
    
    // Advanced engine array with power indicators
    ctx.fillStyle = '#ff6600';
    for (let i = 0; i < 5; i++) {
        ctx.fillRect(x + width/6 + i * width/10, y + height - 6, 4, 5);
    }
    
    // Shield generators
    ctx.fillStyle = '#00ffff';
    ctx.fillRect(x + 2, y + height/6, 4, 4);
    ctx.fillRect(x + width - 6, y + height/6, 4, 4);
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
    // Small, fast enemy scout - advanced triangular shape
    ctx.fillStyle = design.color;
    ctx.beginPath();
    ctx.moveTo(x + width/2, y + height); // Bottom point
    ctx.lineTo(x + width - 3, y + height/4); // Upper right curve
    ctx.lineTo(x + width, y); // Top right
    ctx.lineTo(x + width/2, y + 2); // Top center
    ctx.lineTo(x, y); // Top left
    ctx.lineTo(x + 3, y + height/4); // Upper left curve
    ctx.closePath();
    ctx.fill();
    
    // Advanced cockpit with targeting system
    ctx.fillStyle = design.accentColor;
    ctx.beginPath();
    ctx.ellipse(x + width/2, y + height/3, 5, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Targeting reticle
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(x + width/2 - 1, y + height/3 - 1, 2, 2);
    
    // Enhanced engine glow with pulsing effect
    const time = Date.now() * 0.01;
    const glowIntensity = Math.sin(time) * 0.5 + 0.5;
    ctx.fillStyle = `rgba(255, 0, 0, ${glowIntensity})`;
    ctx.fillRect(x + width/4, y + height - 4, width/2, 3);
    
    // Secondary engine trails
    ctx.fillStyle = `rgba(255, 100, 100, ${glowIntensity * 0.7})`;
    ctx.fillRect(x + width/4 + 2, y + height - 2, width/2 - 4, 2);
}

function drawEnemyFighter(x, y, width, height, design) {
    // Standard enemy fighter - advanced space invader style
    ctx.fillStyle = design.color;
    ctx.beginPath();
    ctx.moveTo(x + width/2, y + height); // Bottom center
    ctx.lineTo(x + width - 6, y + height/3); // Upper right curve
    ctx.lineTo(x + width - 3, y + height/6); // Upper right
    ctx.lineTo(x + width - 1, y); // Top right
    ctx.lineTo(x + width/2, y + 3); // Top center
    ctx.lineTo(x + 1, y); // Top left
    ctx.lineTo(x + 3, y + height/6); // Upper left
    ctx.lineTo(x + 6, y + height/3); // Upper left curve
    ctx.closePath();
    ctx.fill();
    
    // Advanced cockpit with HUD
    ctx.fillStyle = design.accentColor;
    ctx.fillRect(x + width/2 - 4, y + height/3, 8, 6);
    
    // HUD display elements
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(x + width/2 - 2, y + height/3 + 1, 4, 2);
    ctx.fillRect(x + width/2 - 1, y + height/3 + 4, 2, 2);
    
    // Advanced weapon pods with targeting
    ctx.fillStyle = design.color;
    ctx.fillRect(x + 2, y + height/2, 6, 5);
    ctx.fillRect(x + width - 8, y + height/2, 6, 5);
    
    // Weapon targeting indicators
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(x + 3, y + height/2 + 1, 4, 3);
    ctx.fillRect(x + width - 7, y + height/2 + 1, 4, 3);
    
    // Enhanced engine glow with multiple colors
    const time = Date.now() * 0.015;
    const glowIntensity = Math.sin(time) * 0.5 + 0.5;
    ctx.fillStyle = `rgba(255, 68, 68, ${glowIntensity})`;
    ctx.fillRect(x + width/4, y + height - 3, width/2, 3);
    
    // Secondary engine trails
    ctx.fillStyle = `rgba(255, 120, 120, ${glowIntensity * 0.6})`;
    ctx.fillRect(x + width/4 + 3, y + height - 1, width/2 - 6, 2);
}

function drawDestroyerEnemy(x, y, width, height, design) {
    // Larger, more powerful enemy destroyer with advanced armor
    ctx.fillStyle = design.color;
    ctx.beginPath();
    ctx.moveTo(x + width/2, y + height); // Bottom center
    ctx.lineTo(x + width - 8, y + height/3); // Upper right curve
    ctx.lineTo(x + width - 6, y + height/6); // Upper right
    ctx.lineTo(x + width - 3, y); // Top right
    ctx.lineTo(x + width/2, y + 4); // Top center
    ctx.lineTo(x + 3, y); // Top left
    ctx.lineTo(x + 6, y + height/6); // Upper left
    ctx.lineTo(x + 8, y + height/3); // Upper left curve
    ctx.closePath();
    ctx.fill();
    
    // Heavy armor plating
    ctx.fillStyle = '#cc4444';
    ctx.fillRect(x + width/6, y + height/4, width/1.5, 6);
    ctx.fillRect(x + width/4, y + height/2, width/2, 4);
    
    // Advanced cockpit with multiple layers
    ctx.fillStyle = design.accentColor;
    ctx.fillRect(x + width/2 - 6, y + height/4, 12, 8);
    
    // Cockpit details
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x + width/2 - 4, y + height/4 + 2, 8, 4);
    
    // Multiple weapon systems
    ctx.fillStyle = design.color;
    // Primary weapons
    ctx.fillRect(x + 3, y + height/2, 8, 6);
    ctx.fillRect(x + width - 11, y + height/2, 8, 6);
    
    // Secondary weapons
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(x + 5, y + height/2 + 1, 4, 4);
    ctx.fillRect(x + width - 9, y + height/2 + 1, 4, 4);
    
    // Central weapon system
    ctx.fillStyle = '#ff6600';
    ctx.fillRect(x + width/2 - 3, y + height/2, 6, 6);
    
    // Enhanced engine array
    ctx.fillStyle = '#ff4444';
    for (let i = 0; i < 3; i++) {
        ctx.fillRect(x + width/4 + i * width/8, y + height - 5, 4, 4);
    }
    
    // Shield generators
    ctx.fillStyle = '#ff00ff';
    ctx.fillRect(x + 2, y + height/6, 4, 4);
    ctx.fillRect(x + width - 6, y + height/6, 4, 4);
}

function drawBattleshipEnemy(x, y, width, height, design) {
    // Massive enemy battleship with multiple weapon systems
    ctx.fillStyle = design.color;
    ctx.fillRect(x + width/8, y, width/1.25, height);
    
    // Command bridge with advanced systems
    ctx.fillStyle = design.accentColor;
    ctx.fillRect(x + width/2 - 10, y + height/8, 20, 10);
    
    // Bridge windows and controls
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x + width/2 - 8, y + height/8 + 2, 16, 6);
    
    // Bridge control panels
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(x + width/2 - 6, y + height/8 + 4, 12, 2);
    
    // Heavy armor plating with multiple layers
    ctx.fillStyle = '#cc6666';
    ctx.fillRect(x + width/10, y + height/4, width/1.1, 8);
    ctx.fillStyle = '#aa4444';
    ctx.fillRect(x + width/8, y + height/3, width/1.25, 6);
    
    // Multiple weapon systems
    ctx.fillStyle = design.accentColor;
    // Primary heavy weapons
    ctx.fillRect(x + 4, y + height/3, 10, 10);
    ctx.fillRect(x + width - 14, y + height/3, 10, 10);
    ctx.fillRect(x + width/2 - 5, y + height/2, 10, 10);
    
    // Secondary weapons
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(x + width/4, y + height/4, 8, 8);
    ctx.fillRect(x + width * 3/4 - 4, y + height/4, 8, 8);
    
    // Tertiary weapons
    ctx.fillStyle = '#ff6600';
    ctx.fillRect(x + width/6, y + height/2, 6, 6);
    ctx.fillRect(x + width * 5/6 - 3, y + height/2, 6, 6);
    
    // Advanced engine array with power indicators
    ctx.fillStyle = '#ff4444';
    for (let i = 0; i < 6; i++) {
        ctx.fillRect(x + width/8 + i * width/12, y + height - 7, 5, 6);
    }
    
    // Shield generators and defense systems
    ctx.fillStyle = '#ff00ff';
    ctx.fillRect(x + 3, y + height/8, 5, 5);
    ctx.fillRect(x + width - 8, y + height/8, 5, 5);
    
    // Defense turrets
    ctx.fillStyle = '#ffff00';
    ctx.fillRect(x + width/2 - 2, y + height/6, 4, 4);
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
        if (explosion.type === 'weapon_change') {
            // Draw weapon change indicator
            const alpha = explosion.life / 20;
            ctx.fillStyle = `rgba(0, 255, 255, ${alpha})`;
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(explosion.weaponName, explosion.x, explosion.y - 10);
            
            // Draw weapon change glow
            ctx.strokeStyle = `rgba(0, 255, 255, ${alpha})`;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(explosion.x, explosion.y, 30 * alpha, 0, Math.PI * 2);
            ctx.stroke();
        } else {
            // Regular explosion
            const alpha = explosion.life / 10;
            ctx.fillStyle = `rgba(255, 255, 0, ${alpha})`;
            ctx.beginPath();
            ctx.arc(explosion.x, explosion.y, 20 * alpha, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

// Draw enemy bullets
function drawEnemyBullets() {
    for (let bullet of enemyBullets) {
        ctx.fillStyle = bullet.color;
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
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

// Fullscreen toggle function
function toggleFullscreen() {
    const gameContainer = document.getElementById('gameContainer');
    
    if (!document.fullscreenElement) {
        // Enter fullscreen
        if (gameContainer.requestFullscreen) {
            gameContainer.requestFullscreen();
        } else if (gameContainer.webkitRequestFullscreen) {
            gameContainer.webkitRequestFullscreen();
        } else if (gameContainer.msRequestFullscreen) {
            gameContainer.msRequestFullscreen();
        }
        fullscreenBtn.textContent = '⛶ Exit Fullscreen';
    } else {
        // Exit fullscreen
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
        fullscreenBtn.textContent = '⛶ Fullscreen';
    }
}

// Listen for fullscreen change events
document.addEventListener('fullscreenchange', updateFullscreenButton);
document.addEventListener('webkitfullscreenchange', updateFullscreenButton);
document.addEventListener('msfullscreenchange', updateFullscreenButton);

function updateFullscreenButton() {
    if (fullscreenBtn) {
        if (document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement) {
            fullscreenBtn.textContent = '⛶ Exit Fullscreen';
        } else {
            fullscreenBtn.textContent = '⛶ Fullscreen';
        }
    }
}

// Initialize game when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeGameElements);
} else {
    initializeGameElements();
}