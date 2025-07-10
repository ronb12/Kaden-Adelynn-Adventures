// Kaden & Adelynn Space Adventures - Enhanced Version 3.10
// A space shooter game with multiple ships, weapons, and power-ups
// Boss battles, phases, checkpoint system, enhanced power-ups, advanced enemy types, advanced weapon systems, environmental hazards, and visual enhancements

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

// Enhanced score calculation with multiplier
function addScore(points) {
    score += points * player.scoreMultiplier;
}

// Player with weapon heat tracking
let player = {
    x: 400,
    y: 550,
    width: 60,
    height: 60,
    speed: 5,
    shipType: 'fighter',
    weaponType: 'laser',
    powerUps: [],
    health: 5,
    maxHealth: 5,
    invulnerable: false,
    invulnerabilityTime: 0,
    shieldActive: false,
    shieldEndTime: 0,
    speedBoostActive: false,
    speedBoostEndTime: 0,
    scoreMultiplier: 1,
    multiplierEndTime: 0,
    weaponHeat: 0,
    charging: false,
    chargeLevel: 0,
    maxChargeLevel: 100
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

// Enhanced weapon types with advanced systems
const WEAPON_TYPES = {
    laser: {
        name: 'Laser',
        color: '#00ffff',
        damage: 1,
        speed: 8,
        fireRate: 0.05,
        pattern: 'single',
        rapidFire: false,
        multiShot: 1,
        chargeable: false,
        homing: false,
        beam: false,
        heat: 0,
        maxHeat: 100
    },
    plasma: {
        name: 'Plasma',
        color: '#ff00ff',
        damage: 2,
        speed: 6,
        fireRate: 0.075,
        pattern: 'single',
        rapidFire: false,
        multiShot: 1,
        chargeable: false,
        homing: false,
        beam: false,
        heat: 0,
        maxHeat: 100
    },
    missile: {
        name: 'Missile',
        color: '#ffff00',
        damage: 3,
        speed: 5,
        fireRate: 0.125,
        pattern: 'single',
        rapidFire: false,
        multiShot: 1,
        chargeable: false,
        homing: true,
        beam: false,
        heat: 0,
        maxHeat: 100
    },
    spread: {
        name: 'Spread',
        color: '#ff8800',
        damage: 1,
        speed: 7,
        fireRate: 0.1,
        pattern: 'spread',
        rapidFire: false,
        multiShot: 3,
        chargeable: false,
        homing: false,
        beam: false,
        heat: 0,
        maxHeat: 100
    },
    rapid: {
        name: 'Rapid',
        color: '#00ff00',
        damage: 1,
        speed: 9,
        fireRate: 0.0125,
        pattern: 'single',
        rapidFire: true,
        multiShot: 1,
        chargeable: false,
        homing: false,
        beam: false,
        heat: 0,
        maxHeat: 100
    },
    burst: {
        name: 'Burst',
        color: '#ff0080',
        damage: 2,
        speed: 7,
        fireRate: 0.075,
        pattern: 'burst',
        rapidFire: false,
        multiShot: 3,
        chargeable: false,
        homing: false,
        beam: false,
        heat: 0,
        maxHeat: 100
    },
    shotgun: {
        name: 'Shotgun',
        color: '#ff6600',
        damage: 1,
        speed: 6,
        fireRate: 0.15,
        pattern: 'shotgun',
        rapidFire: false,
        multiShot: 5,
        chargeable: false,
        homing: false,
        beam: false,
        heat: 0,
        maxHeat: 100
    },
    charge: {
        name: 'Charge',
        color: '#ff00ff',
        damage: 5,
        speed: 10,
        fireRate: 0.5,
        pattern: 'charge',
        rapidFire: false,
        multiShot: 1,
        chargeable: true,
        homing: false,
        beam: false,
        heat: 0,
        maxHeat: 150
    },
    beam: {
        name: 'Beam',
        color: '#00ffff',
        damage: 2,
        speed: 0,
        fireRate: 0.1,
        pattern: 'beam',
        rapidFire: false,
        multiShot: 1,
        chargeable: false,
        homing: false,
        beam: true,
        heat: 0,
        maxHeat: 200
    },
    homing: {
        name: 'Homing',
        color: '#ffff00',
        damage: 3,
        speed: 6,
        fireRate: 0.2,
        pattern: 'single',
        rapidFire: false,
        multiShot: 1,
        chargeable: false,
        homing: true,
        beam: false,
        heat: 0,
        maxHeat: 100
    }
};

// Enhanced power-up types
const POWERUP_TYPES = {
    health: {
        name: 'Health',
        color: '#00ff00',
        symbol: '❤️',
        effect: 'restore',
        duration: 0
    },
    weapon: {
        name: 'Weapon',
        color: '#ff8800',
        symbol: '⚔️',
        effect: 'upgrade',
        duration: 0
    },
    speed: {
        name: 'Speed',
        color: '#00ffff',
        symbol: '⚡',
        effect: 'boost',
        duration: 10000 // 10 seconds
    },
    shield: {
        name: 'Shield',
        color: '#8888ff',
        symbol: '🛡️',
        effect: 'protect',
        duration: 8000 // 8 seconds
    },
    bomb: {
        name: 'Bomb',
        color: '#ff0080',
        symbol: '💣',
        effect: 'clear',
        duration: 0
    },
    multiplier: {
        name: 'Multiplier',
        color: '#ffff00',
        symbol: '⭐',
        effect: 'multiply',
        duration: 15000 // 15 seconds
    },
    life: {
        name: 'Life',
        color: '#ff0000',
        symbol: '💖',
        effect: 'extend',
        duration: 0
    }
};

// Enhanced enemy designs with advanced types
const ENEMY_DESIGNS = [
    {
        name: 'Scout',
        color: '#ff4444',
        accentColor: '#ffffff',
        width: 45,
        height: 45,
        speed: 3,
        points: 10,
        design: 'scout',
        type: 'normal'
    },
    {
        name: 'Fighter',
        color: '#ff6666',
        accentColor: '#ffffff',
        width: 50,
        height: 50,
        speed: 2.5,
        points: 15,
        design: 'enemy_fighter',
        type: 'normal'
    },
    {
        name: 'Destroyer',
        color: '#ff8888',
        accentColor: '#ffffff',
        width: 55,
        height: 55,
        speed: 2,
        points: 20,
        design: 'destroyer',
        type: 'normal'
    },
    {
        name: 'Battleship',
        color: '#ffaaaa',
        accentColor: '#ffffff',
        width: 60,
        height: 60,
        speed: 1.5,
        points: 25,
        design: 'battleship',
        type: 'normal'
    },
    {
        name: 'Kamikaze',
        color: '#ff0000',
        accentColor: '#ffff00',
        width: 40,
        height: 40,
        speed: 4,
        points: 30,
        design: 'kamikaze',
        type: 'kamikaze'
    },
    {
        name: 'Shielded',
        color: '#4444ff',
        accentColor: '#ffffff',
        width: 55,
        height: 55,
        speed: 2,
        points: 35,
        design: 'shielded',
        type: 'shielded',
        shieldHealth: 3
    },
    {
        name: 'Splitter',
        color: '#ff8800',
        accentColor: '#ffffff',
        width: 50,
        height: 50,
        speed: 2.5,
        points: 25,
        design: 'splitter',
        type: 'splitter',
        splitCount: 2
    },
    {
        name: 'Teleporter',
        color: '#8800ff',
        accentColor: '#ffffff',
        width: 45,
        height: 45,
        speed: 3,
        points: 40,
        design: 'teleporter',
        type: 'teleporter',
        teleportCooldown: 3000
    }
];

// Boss object
let boss = null;
let bossActive = false;
let bossPhase = 0;
let bossHealthBarHeight = 20;

// Boss designs
const BOSS_DESIGNS = [
    {
        name: 'Dreadnought',
        color: '#ff00cc',
        accentColor: '#fff',
        width: 180,
        height: 120,
        maxHealth: 200,
        phases: 3,
        pattern: 'dreadnought',
        reward: 500
    },
    {
        name: 'Obliterator',
        color: '#00ffcc',
        accentColor: '#fff',
        width: 200,
        height: 140,
        maxHealth: 300,
        phases: 4,
        pattern: 'obliterator',
        reward: 1000
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

// Environmental hazards
let asteroids = [];
let barriers = [];
let movingObstacles = [];
let damageZones = [];

// Hazard types
const HAZARD_TYPES = {
    asteroid: {
        name: 'Asteroid',
        color: '#888888',
        width: 30,
        height: 30,
        speed: 2,
        damage: 1,
        points: 5
    },
    barrier: {
        name: 'Barrier',
        color: '#444444',
        width: 60,
        height: 20,
        speed: 1,
        damage: 2,
        points: 10
    },
    movingObstacle: {
        name: 'Moving Obstacle',
        color: '#ff4444',
        width: 40,
        height: 40,
        speed: 3,
        damage: 3,
        points: 15
    },
    damageZone: {
        name: 'Damage Zone',
        color: '#ff0000',
        width: 100,
        height: 50,
        speed: 1,
        damage: 5,
        points: 20
    }
};

// Visual enhancement variables
let particles = [];
let screenShake = 0;
let parallaxLayers = [];
let lightingEffects = [];
let shipDamageAnimation = 0;

// Particle system
class Particle {
    constructor(x, y, color, velocity, life) {
        this.x = x;
        this.y = y;
        this.vx = velocity.x;
        this.vy = velocity.y;
        this.color = color;
        this.life = life;
        this.maxLife = life;
        this.size = Math.random() * 3 + 1;
    }
    
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life--;
        this.vx *= 0.98;
        this.vy *= 0.98;
    }
    
    draw(ctx) {
        const alpha = this.life / this.maxLife;
        ctx.fillStyle = `rgba(${this.color}, ${alpha})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

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
    particles = [];
    lightingEffects = [];
    screenShake = 0;
    shipDamageAnimation = 0;
    
    // Initialize visual effects
    initParallaxBackground();
    
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
        updateBoss();
        updatePowerUps();
        updatePowerUpEffects();
        updateWeaponSystems();
        updateHazards();
        updateParticles(); // Add this line
        updateScreenShake(); // Add this line
        updateParallaxBackground(); // Add this line
        updateLightingEffects(); // Add this line
        updateShipDamageAnimation(); // Add this line
        updateCollectibles();
        updateExplosions();
        updateStars();
        checkCollisions();
        updateLevel();
        updateUI();
        spawnEnemy();
        spawnPowerUp();
        spawnCollectible();
        spawnHazards();
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

// Enhanced shooting function with advanced weapon systems
function shoot() {
    const now = Date.now();
    const weaponType = WEAPON_TYPES[player.weaponType];
    
    // Check weapon heat
    if (player.weaponHeat >= weaponType.maxHeat) {
        return; // Weapon overheated
    }
    
    if (now - lastShotTime > weaponType.fireRate * 1000) {
        const bulletSpeed = weaponType.speed;
        const bulletDamage = weaponType.damage;
        const bulletColor = weaponType.color;
        
        // Add heat to weapon
        player.weaponHeat += 10;
        
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
                    color: bulletColor,
                    homing: weaponType.homing,
                    beam: weaponType.beam
                });
                playSound('laser');
                break;
                
            case 'spread':
                // Spread shot
                for (let i = 0; i < weaponType.multiShot; i++) {
                    const spread = (i - 1) * 15;
                    const angle = (spread * Math.PI) / 180;
                    bullets.push({
                        x: player.x + player.width / 2 - 2,
                        y: player.y,
                        width: 4,
                        height: 8,
                        speed: bulletSpeed,
                        damage: bulletDamage,
                        color: bulletColor,
                        angle: angle,
                        homing: weaponType.homing,
                        beam: weaponType.beam
                    });
                }
                playSound('plasma');
                break;
                
            case 'charge':
                // Charge weapon - damage based on charge level
                const chargeDamage = bulletDamage + Math.floor(player.chargeLevel / 10);
                bullets.push({
                    x: player.x + player.width / 2 - 3,
                    y: player.y,
                    width: 6,
                    height: 12,
                    speed: bulletSpeed,
                    damage: chargeDamage,
                    color: bulletColor,
                    homing: weaponType.homing,
                    beam: weaponType.beam
                });
                player.chargeLevel = 0;
                playSound('missile');
                break;
                
            case 'beam':
                // Beam weapon - continuous damage
                bullets.push({
                    x: player.x + player.width / 2 - 2,
                    y: 0,
                    width: 4,
                    height: player.y,
                    speed: 0,
                    damage: bulletDamage,
                    color: bulletColor,
                    homing: false,
                    beam: true
                });
                playSound('plasma');
                break;
                
            default:
                // Default single shot
                bullets.push({
                    x: player.x + player.width / 2 - 2,
                    y: player.y,
                    width: 4,
                    height: 8,
                    speed: bulletSpeed,
                    damage: bulletDamage,
                    color: bulletColor,
                    homing: weaponType.homing,
                    beam: weaponType.beam
                });
                playSound('laser');
                break;
        }
        
        lastShotTime = now;
    }
}

// Enhanced enemy spawning with formations
function spawnEnemy() {
    if (bossActive) return; // Don't spawn regular enemies during boss
    
    // Spawn formations at higher levels
    if (level >= 5 && Math.random() < 0.1) {
        spawnEnemyFormation();
        return;
    }
    
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
            shotDelay: 1000 + Math.random() * 2000,
            health: enemyDesign.type === 'shielded' ? enemyDesign.shieldHealth : 1,
            maxHealth: enemyDesign.type === 'shielded' ? enemyDesign.shieldHealth : 1,
            enemyType: enemyDesign.type,
            lastTeleport: 0,
            teleportCooldown: enemyDesign.teleportCooldown || 0,
            splitCount: enemyDesign.splitCount || 0
        });
    }
}

// Spawn enemy formations
function spawnEnemyFormation() {
    const formationTypes = ['v', 'h', 'diamond', 'circle'];
    const formation = formationTypes[Math.floor(Math.random() * formationTypes.length)];
    const baseX = Math.random() * (canvas.width - 200);
    const baseY = -100;
    
    switch(formation) {
        case 'v':
            // V formation
            for (let i = 0; i < 5; i++) {
                const enemyType = Math.floor(Math.random() * ENEMY_DESIGNS.length);
                const enemyDesign = ENEMY_DESIGNS[enemyType];
                enemies.push({
                    x: baseX + (i - 2) * 40,
                    y: baseY + i * 20,
                    width: enemyDesign.width,
                    height: enemyDesign.height,
                    speed: enemyDesign.speed,
                    type: enemyType,
                    design: enemyDesign,
                    lastShot: 0,
                    shotDelay: 1000 + Math.random() * 2000,
                    health: enemyDesign.type === 'shielded' ? enemyDesign.shieldHealth : 1,
                    maxHealth: enemyDesign.type === 'shielded' ? enemyDesign.shieldHealth : 1,
                    enemyType: enemyDesign.type,
                    lastTeleport: 0,
                    teleportCooldown: enemyDesign.teleportCooldown || 0,
                    splitCount: enemyDesign.splitCount || 0
                });
            }
            break;
        case 'h':
            // Horizontal line formation
            for (let i = 0; i < 4; i++) {
                const enemyType = Math.floor(Math.random() * ENEMY_DESIGNS.length);
                const enemyDesign = ENEMY_DESIGNS[enemyType];
                enemies.push({
                    x: baseX + i * 50,
                    y: baseY,
                    width: enemyDesign.width,
                    height: enemyDesign.height,
                    speed: enemyDesign.speed,
                    type: enemyType,
                    design: enemyDesign,
                    lastShot: 0,
                    shotDelay: 1000 + Math.random() * 2000,
                    health: enemyDesign.type === 'shielded' ? enemyDesign.shieldHealth : 1,
                    maxHealth: enemyDesign.type === 'shielded' ? enemyDesign.shieldHealth : 1,
                    enemyType: enemyDesign.type,
                    lastTeleport: 0,
                    teleportCooldown: enemyDesign.teleportCooldown || 0,
                    splitCount: enemyDesign.splitCount || 0
                });
            }
            break;
        case 'diamond':
            // Diamond formation
            const diamondPositions = [
                {x: 0, y: 0}, {x: 40, y: 20}, {x: 80, y: 0},
                {x: 40, y: -20}, {x: 40, y: 40}
            ];
            for (let i = 0; i < 5; i++) {
                const enemyType = Math.floor(Math.random() * ENEMY_DESIGNS.length);
                const enemyDesign = ENEMY_DESIGNS[enemyType];
                enemies.push({
                    x: baseX + diamondPositions[i].x,
                    y: baseY + diamondPositions[i].y,
                    width: enemyDesign.width,
                    height: enemyDesign.height,
                    speed: enemyDesign.speed,
                    type: enemyType,
                    design: enemyDesign,
                    lastShot: 0,
                    shotDelay: 1000 + Math.random() * 2000,
                    health: enemyDesign.type === 'shielded' ? enemyDesign.shieldHealth : 1,
                    maxHealth: enemyDesign.type === 'shielded' ? enemyDesign.shieldHealth : 1,
                    enemyType: enemyDesign.type,
                    lastTeleport: 0,
                    teleportCooldown: enemyDesign.teleportCooldown || 0,
                    splitCount: enemyDesign.splitCount || 0
                });
            }
            break;
        case 'circle':
            // Circle formation
            for (let i = 0; i < 6; i++) {
                const angle = (i / 6) * Math.PI * 2;
                const radius = 60;
                const enemyType = Math.floor(Math.random() * ENEMY_DESIGNS.length);
                const enemyDesign = ENEMY_DESIGNS[enemyType];
                enemies.push({
                    x: baseX + 100 + Math.cos(angle) * radius,
                    y: baseY + 50 + Math.sin(angle) * radius,
                    width: enemyDesign.width,
                    height: enemyDesign.height,
                    speed: enemyDesign.speed,
                    type: enemyType,
                    design: enemyDesign,
                    lastShot: 0,
                    shotDelay: 1000 + Math.random() * 2000,
                    health: enemyDesign.type === 'shielded' ? enemyDesign.shieldHealth : 1,
                    maxHealth: enemyDesign.type === 'shielded' ? enemyDesign.shieldHealth : 1,
                    enemyType: enemyDesign.type,
                    lastTeleport: 0,
                    teleportCooldown: enemyDesign.teleportCooldown || 0,
                    splitCount: enemyDesign.splitCount || 0
                });
            }
            break;
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

// Spawn environmental hazards
function spawnHazards() {
    // Spawn asteroids
    if (Math.random() < 0.01) {
        const hazard = HAZARD_TYPES.asteroid;
        asteroids.push({
            x: Math.random() * (canvas.width - hazard.width),
            y: -hazard.height,
            width: hazard.width,
            height: hazard.height,
            speed: hazard.speed + Math.random() * 2,
            damage: hazard.damage,
            points: hazard.points,
            rotation: 0,
            rotationSpeed: (Math.random() - 0.5) * 0.1
        });
    }
    
    // Spawn barriers at higher levels
    if (level >= 3 && Math.random() < 0.005) {
        const hazard = HAZARD_TYPES.barrier;
        barriers.push({
            x: Math.random() * (canvas.width - hazard.width),
            y: -hazard.height,
            width: hazard.width,
            height: hazard.height,
            speed: hazard.speed,
            damage: hazard.damage,
            points: hazard.points
        });
    }
    
    // Spawn moving obstacles at higher levels
    if (level >= 5 && Math.random() < 0.003) {
        const hazard = HAZARD_TYPES.movingObstacle;
        movingObstacles.push({
            x: Math.random() * (canvas.width - hazard.width),
            y: -hazard.height,
            width: hazard.width,
            height: hazard.height,
            speed: hazard.speed,
            damage: hazard.damage,
            points: hazard.points,
            direction: Math.random() > 0.5 ? 1 : -1
        });
    }
    
    // Spawn damage zones at higher levels
    if (level >= 7 && Math.random() < 0.002) {
        const hazard = HAZARD_TYPES.damageZone;
        damageZones.push({
            x: Math.random() * (canvas.width - hazard.width),
            y: -hazard.height,
            width: hazard.width,
            height: hazard.height,
            speed: hazard.speed,
            damage: hazard.damage,
            points: hazard.points,
            pulse: 0
        });
    }
}

// Enhanced power-up collection logic
function collectPowerUp(powerUp) {
    const powerUpType = POWERUP_TYPES[powerUp.type];
    const now = Date.now();
    
    switch(powerUpType.effect) {
        case 'restore':
            player.health = Math.min(player.maxHealth, player.health + 2);
            break;
        case 'upgrade':
            // Cycle through weapon types
            const weaponTypes = Object.keys(WEAPON_TYPES);
            const currentIndex = weaponTypes.indexOf(player.weaponType);
            const nextIndex = (currentIndex + 1) % weaponTypes.length;
            player.weaponType = weaponTypes[nextIndex];
            break;
        case 'boost':
            player.speedBoostActive = true;
            player.speedBoostEndTime = now + powerUpType.duration;
            player.speed = 8; // Boosted speed
            break;
        case 'protect':
            player.shieldActive = true;
            player.shieldEndTime = now + powerUpType.duration;
            break;
        case 'clear':
            // Clear all enemies and bullets
            enemies.length = 0;
            enemyBullets.length = 0;
            // Add explosion effects
            for (let i = 0; i < 20; i++) {
                explosions.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    life: 15
                });
            }
            break;
        case 'multiply':
            player.scoreMultiplier = 3;
            player.multiplierEndTime = now + powerUpType.duration;
            break;
        case 'extend':
            lives++;
            break;
    }
    
    playSound('powerup');
    powerUps.splice(powerUps.indexOf(powerUp), 1);
}

// Boss spawn logic (call at level milestones)
function maybeSpawnBoss() {
    if (level % 3 === 0 && !bossActive) {
        const bossDesign = BOSS_DESIGNS[(level/3-1) % BOSS_DESIGNS.length];
        boss = {
            ...bossDesign,
            x: canvas.width/2 - bossDesign.width/2,
            y: 40,
            health: bossDesign.maxHealth,
            phase: 1,
            active: true
        };
        bossActive = true;
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
        
        if (bullet.beam) {
            // Beam weapons stay in place
            bullet.y = 0;
            bullet.height = player.y;
        } else if (bullet.homing) {
            // Homing missiles
            if (enemies.length > 0) {
                // Find closest enemy
                let closestEnemy = null;
                let closestDistance = Infinity;
                
                for (let enemy of enemies) {
                    const dx = enemy.x - bullet.x;
                    const dy = enemy.y - bullet.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance < closestDistance) {
                        closestDistance = distance;
                        closestEnemy = enemy;
                    }
                }
                
                if (closestEnemy) {
                    // Move toward closest enemy
                    const dx = closestEnemy.x - bullet.x;
                    const dy = closestEnemy.y - bullet.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance > 0) {
                        bullet.x += (dx / distance) * bullet.speed * 0.1;
                        bullet.y += (dy / distance) * bullet.speed * 0.1;
                    }
                } else {
                    // No enemies, move straight
                    bullet.y -= bullet.speed;
                }
            } else {
                bullet.y -= bullet.speed;
            }
        } else if (bullet.angle) {
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

// Enhanced enemy update logic
function updateEnemies() {
    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        
        // Update based on enemy type
        switch(enemy.enemyType) {
            case 'kamikaze':
                // Kamikaze enemies move faster towards player
                const dx = player.x - enemy.x;
                const dy = player.y - enemy.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance > 0) {
                    enemy.x += (dx / distance) * enemy.speed;
                    enemy.y += (dy / distance) * enemy.speed;
                }
                break;
            case 'teleporter':
                // Teleporter enemies randomly teleport
                if (Date.now() - enemy.lastTeleport > enemy.teleportCooldown) {
                    enemy.x = Math.random() * (canvas.width - enemy.width);
                    enemy.y = Math.random() * (canvas.height / 2);
                    enemy.lastTeleport = Date.now();
                } else {
                    enemy.y += enemy.speed;
                }
                break;
            default:
                // Normal movement
                enemy.y += enemy.speed;
                break;
        }
        
        // Enemy shooting
        if (enemy.y > 0 && enemy.y < canvas.height - 100) {
            enemyShoot(enemy);
        }
        
        // Remove enemies that go off screen
        if (enemy.y > canvas.height) {
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

// Update power-up effects
function updatePowerUpEffects() {
    const now = Date.now();
    
    // Update shield
    if (player.shieldActive && now > player.shieldEndTime) {
        player.shieldActive = false;
    }
    
    // Update speed boost
    if (player.speedBoostActive && now > player.speedBoostEndTime) {
        player.speedBoostActive = false;
        player.speed = 5; // Reset to normal speed
    }
    
    // Update score multiplier
    if (player.scoreMultiplier > 1 && now > player.multiplierEndTime) {
        player.scoreMultiplier = 1;
    }
}

// Update weapon heat and charge
function updateWeaponSystems() {
    const now = Date.now();
    
    // Cool down weapon heat
    if (player.weaponHeat > 0) {
        player.weaponHeat = Math.max(0, player.weaponHeat - 2);
    }
    
    // Update charge level
    if (player.charging) {
        player.chargeLevel = Math.min(player.maxChargeLevel, player.chargeLevel + 2);
    }
}

// Update environmental hazards
function updateHazards() {
    // Update asteroids
    for (let i = asteroids.length - 1; i >= 0; i--) {
        const asteroid = asteroids[i];
        asteroid.y += asteroid.speed;
        asteroid.rotation += asteroid.rotationSpeed;
        
        if (asteroid.y > canvas.height) {
            asteroids.splice(i, 1);
        }
    }
    
    // Update barriers
    for (let i = barriers.length - 1; i >= 0; i--) {
        const barrier = barriers[i];
        barrier.y += barrier.speed;
        
        if (barrier.y > canvas.height) {
            barriers.splice(i, 1);
        }
    }
    
    // Update moving obstacles
    for (let i = movingObstacles.length - 1; i >= 0; i--) {
        const obstacle = movingObstacles[i];
        obstacle.y += obstacle.speed;
        obstacle.x += obstacle.direction * 2;
        
        // Bounce off screen edges
        if (obstacle.x <= 0 || obstacle.x + obstacle.width >= canvas.width) {
            obstacle.direction *= -1;
        }
        
        if (obstacle.y > canvas.height) {
            movingObstacles.splice(i, 1);
        }
    }
    
    // Update damage zones
    for (let i = damageZones.length - 1; i >= 0; i--) {
        const zone = damageZones[i];
        zone.y += zone.speed;
        zone.pulse += 0.1;
        
        if (zone.y > canvas.height) {
            damageZones.splice(i, 1);
        }
    }
}

// Enhanced collision detection for advanced enemy types
function checkCollisions() {
    // Bullet vs Enemy collisions
    for (let i = bullets.length - 1; i >= 0; i--) {
        for (let j = enemies.length - 1; j >= 0; j--) {
            if (checkCollision(bullets[i], enemies[j])) {
                // Handle different enemy types
                const enemy = enemies[j];
                
                if (enemy.enemyType === 'shielded') {
                    // Shielded enemies take multiple hits
                    enemy.health--;
                    if (enemy.health <= 0) {
                        // Enemy destroyed
                        explosions.push({
                            x: enemy.x + enemy.width / 2,
                            y: enemy.y + enemy.height / 2,
                            life: 10
                        });
                        playSound('explosion');
                        enemies.splice(j, 1);
                        addScore(enemy.design.points);
                    } else {
                        // Shield hit effect
                        explosions.push({
                            x: bullets[i].x,
                            y: bullets[i].y,
                            life: 5,
                            type: 'shield'
                        });
                    }
                } else if (enemy.enemyType === 'splitter') {
                    // Splitter enemies create smaller enemies when destroyed
                    explosions.push({
                        x: enemy.x + enemy.width / 2,
                        y: enemy.y + enemy.height / 2,
                        life: 10
                    });
                    playSound('explosion');
                    enemies.splice(j, 1);
                    addScore(enemy.design.points);
                    
                    // Create smaller enemies
                    for (let k = 0; k < enemy.splitCount; k++) {
                        const smallEnemy = {
                            x: enemy.x + Math.random() * 20 - 10,
                            y: enemy.y + Math.random() * 20 - 10,
                            width: enemy.width * 0.6,
                            height: enemy.height * 0.6,
                            speed: enemy.speed * 1.5,
                            type: enemy.type,
                            design: enemy.design,
                            lastShot: 0,
                            shotDelay: enemy.shotDelay,
                            health: 1,
                            maxHealth: 1,
                            enemyType: 'normal',
                            lastTeleport: 0,
                            teleportCooldown: 0,
                            splitCount: 0
                        };
                        enemies.push(smallEnemy);
                    }
                } else {
                    // Normal enemy destruction
                    explosions.push({
                        x: enemy.x + enemy.width / 2,
                        y: enemy.y + enemy.height / 2,
                        life: 10
                    });
                    playSound('explosion');
                    enemies.splice(j, 1);
                    addScore(enemy.design.points);
                }
                
                bullets.splice(i, 1);
                break;
            }
        }
    }
    
    // Enemy bullets vs Player collisions (with shield protection)
    for (let i = enemyBullets.length - 1; i >= 0; i--) {
        if (!player.invulnerable && !player.shieldActive && checkCollision(enemyBullets[i], player)) {
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
        } else if (player.shieldActive && checkCollision(enemyBullets[i], player)) {
            // Shield absorbs the bullet
            enemyBullets.splice(i, 1);
            // Create shield effect
            explosions.push({
                x: player.x + player.width / 2,
                y: player.y + player.height / 2,
                life: 5,
                type: 'shield'
            });
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

    // Bullet vs Boss collisions
    if (boss && boss.active) {
        for (let i = bullets.length - 1; i >= 0; i--) {
            if (
                bullets[i].x < boss.x + boss.width &&
                bullets[i].x + bullets[i].width > boss.x &&
                bullets[i].y < boss.y + boss.height &&
                bullets[i].y + bullets[i].height > boss.y
            ) {
                boss.health -= WEAPON_TYPES[player.weaponType].damage;
                explosions.push({
                    x: bullets[i].x,
                    y: bullets[i].y,
                    life: 10
                });
                playSound('explosion');
                bullets.splice(i, 1);
                if (boss.health <= 0) {
                    // Boss defeated
                    score += boss.reward;
                    explosions.push({
                        x: boss.x + boss.width/2,
                        y: boss.y + boss.height/2,
                        life: 40
                    });
                    boss.active = false;
                    boss = null;
                    bossActive = false;
                    // Advance to next level
                    level++;
                    // Save checkpoint
                    checkpoint.level = level;
                    checkpoint.score = score;
                    // Optional: drop power-ups or special rewards
                }
                break;
            }
        }
    }
    
    // Player vs Environmental Hazards
    if (!player.invulnerable && !player.shieldActive) {
        // Check asteroids
        for (let i = asteroids.length - 1; i >= 0; i--) {
            if (checkCollision(asteroids[i], player)) {
                player.health -= asteroids[i].damage;
                asteroids.splice(i, 1);
                createPlayerHitEffect();
            }
        }
        
        // Check barriers
        for (let i = barriers.length - 1; i >= 0; i--) {
            if (checkCollision(barriers[i], player)) {
                player.health -= barriers[i].damage;
                barriers.splice(i, 1);
                createPlayerHitEffect();
            }
        }
        
        // Check moving obstacles
        for (let i = movingObstacles.length - 1; i >= 0; i--) {
            if (checkCollision(movingObstacles[i], player)) {
                player.health -= movingObstacles[i].damage;
                movingObstacles.splice(i, 1);
                createPlayerHitEffect();
            }
        }
        
        // Check damage zones
        for (let i = damageZones.length - 1; i >= 0; i--) {
            if (checkCollision(damageZones[i], player)) {
                player.health -= damageZones[i].damage;
                createPlayerHitEffect();
            }
        }
    }
    
    // Bullets vs Environmental Hazards
    for (let i = bullets.length - 1; i >= 0; i--) {
        // Check bullets vs asteroids
        for (let j = asteroids.length - 1; j >= 0; j--) {
            if (checkCollision(bullets[i], asteroids[j])) {
                bullets.splice(i, 1);
                asteroids.splice(j, 1);
                addScore(asteroids[j] ? asteroids[j].points : 5);
                createExplosion(bullets[i].x, bullets[i].y);
                break;
            }
        }
        
        // Check bullets vs barriers
        for (let j = barriers.length - 1; j >= 0; j--) {
            if (checkCollision(bullets[i], barriers[j])) {
                bullets.splice(i, 1);
                barriers.splice(j, 1);
                addScore(barriers[j] ? barriers[j].points : 10);
                createExplosion(bullets[i].x, bullets[i].y);
                break;
            }
        }
        
        // Check bullets vs moving obstacles
        for (let j = movingObstacles.length - 1; j >= 0; j--) {
            if (checkCollision(bullets[i], movingObstacles[j])) {
                bullets.splice(i, 1);
                movingObstacles.splice(j, 1);
                addScore(movingObstacles[j] ? movingObstacles[j].points : 15);
                createExplosion(bullets[i].x, bullets[i].y);
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

// Update level and spawn boss if needed
function updateLevel() {
    // Only increment level if boss is not active
    if (!bossActive && score > level * 100) {
        level++;
        maybeSpawnBoss();
        // Optional: checkpoint logic here
    }
}

// Update boss logic
function updateBoss() {
    if (!boss || !boss.active) return;
    // Simple movement: oscillate horizontally
    boss.x += Math.sin(Date.now() / 500) * 2;
    // Boss attacks: fire bullets at intervals
    if (!boss.lastShot) boss.lastShot = Date.now();
    if (Date.now() - boss.lastShot > 800 - boss.phase * 100) {
        // Fire a spread of bullets
        for (let i = -1; i <= 1; i++) {
            enemyBullets.push({
                x: boss.x + boss.width / 2 + i * 30,
                y: boss.y + boss.height,
                width: 8,
                height: 16,
                speed: 6 + boss.phase,
                color: '#ff00cc'
            });
        }
        boss.lastShot = Date.now();
    }
    // Boss phase logic: increase phase at health thresholds
    if (boss.phase < boss.phases && boss.health < boss.maxHealth * (1 - boss.phase / boss.phases)) {
        boss.phase++;
        // Optional: add effects or change attack pattern
    }
}

// Update UI to show active power-ups
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
    
    // Update power-up status display
    const powerUpStatusElement = document.getElementById('powerUpStatus');
    if (powerUpStatusElement) {
        let statusText = '';
        const now = Date.now();
        
        if (player.shieldActive) {
            const shieldTime = Math.ceil((player.shieldEndTime - now) / 1000);
            statusText += `🛡️ Shield: ${shieldTime}s `;
        }
        if (player.speedBoostActive) {
            const speedTime = Math.ceil((player.speedBoostEndTime - now) / 1000);
            statusText += `⚡ Speed: ${speedTime}s `;
        }
        if (player.scoreMultiplier > 1) {
            const multiplierTime = Math.ceil((player.multiplierEndTime - now) / 1000);
            statusText += `⭐ x${player.scoreMultiplier}: ${multiplierTime}s `;
        }
        
        powerUpStatusElement.textContent = statusText;
    }
    
    // Update weapon heat display
    const weaponHeatElement = document.getElementById('weaponHeat');
    if (weaponHeatElement) {
        const currentWeapon = WEAPON_TYPES[player.weaponType];
        const heatPercent = Math.round((player.weaponHeat / currentWeapon.maxHeat) * 100);
        weaponHeatElement.textContent = `Heat: ${heatPercent}%`;
        
        // Change color based on heat level
        if (heatPercent > 80) {
            weaponHeatElement.style.color = '#ff0000';
        } else if (heatPercent > 50) {
            weaponHeatElement.style.color = '#ff8800';
        } else {
            weaponHeatElement.style.color = '#00ff00';
        }
    }
    
    // Update charge level display
    const chargeLevelElement = document.getElementById('chargeLevel');
    if (chargeLevelElement && WEAPON_TYPES[player.weaponType].chargeable) {
        const chargePercent = Math.round((player.chargeLevel / player.maxChargeLevel) * 100);
        chargeLevelElement.textContent = `Charge: ${chargePercent}%`;
        chargeLevelElement.style.color = '#ff00ff';
    } else if (chargeLevelElement) {
        chargeLevelElement.textContent = '';
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
    
    // Draw parallax background
    drawParallaxBackground();
    
    // Draw lighting effects
    drawLightingEffects();
    
    // Draw particles
    drawParticles();
    
    // Draw player
    drawPlayer();
    
    // Draw bullets
    drawBullets();
    
    // Draw enemies
    drawEnemies();
    
    // Draw environmental hazards
    drawHazards();
    
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
    
    // Draw boss
    drawBoss();
}

// Draw stars
function drawStars() {
    ctx.fillStyle = '#fff';
    for (let star of stars) {
        ctx.fillRect(star.x, star.y, 1, 1);
    }
}

// Enhanced bullet drawing with beam effects
function drawBullets() {
    for (let bullet of bullets) {
        if (bullet.beam) {
            // Draw beam weapon
            const gradient = ctx.createLinearGradient(bullet.x, bullet.y, bullet.x, bullet.y + bullet.height);
            gradient.addColorStop(0, bullet.color);
            gradient.addColorStop(1, 'transparent');
            
            ctx.fillStyle = gradient;
            ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
            
            // Add beam glow effect
            ctx.strokeStyle = bullet.color;
            ctx.lineWidth = 2;
            ctx.strokeRect(bullet.x - 1, bullet.y, bullet.width + 2, bullet.height);
        } else {
            // Draw regular bullet based on type
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
                    ctx.fillStyle = bullet.color || '#ffff00';
                    ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
                    break;
            }
        }
    }
}

// Enhanced player ship drawing with detailed designs
function drawPlayer() {
    if (!player.invulnerable || Math.floor(Date.now() / 100) % 2) {
        // Apply screen shake
        const shakeX = screenShake > 0 ? (Math.random() - 0.5) * screenShake : 0;
        const shakeY = screenShake > 0 ? (Math.random() - 0.5) * screenShake : 0;
        
        ctx.save();
        ctx.translate(shakeX, shakeY);
        
        // Draw damage animation effect
        if (shipDamageAnimation > 0) {
            ctx.globalAlpha = 0.5;
            ctx.fillStyle = '#ff0000';
            ctx.fillRect(player.x - 5, player.y - 5, player.width + 10, player.height + 10);
            ctx.globalAlpha = 1;
        }
        
        // Draw shield effect
        if (player.shieldActive) {
            ctx.strokeStyle = '#8888ff';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(player.x + player.width/2, player.y + player.height/2, 
                   player.width/2 + 10, 0, Math.PI * 2);
            ctx.stroke();
        }
        
        // Draw ship
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
        
        ctx.restore();
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

// Enhanced enemy ship drawing with advanced types
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
            case 'kamikaze':
                drawKamikazeEnemy(enemy.x, enemy.y, enemy.width, enemy.height, design);
                break;
            case 'shielded':
                drawShieldedEnemy(enemy.x, enemy.y, enemy.width, enemy.height, design, enemy);
                break;
            case 'splitter':
                drawSplitterEnemy(enemy.x, enemy.y, enemy.width, enemy.height, design);
                break;
            case 'teleporter':
                drawTeleporterEnemy(enemy.x, enemy.y, enemy.width, enemy.height, design);
                break;
        }
    }
}

// Draw kamikaze enemy
function drawKamikazeEnemy(x, y, width, height, design) {
    // Kamikaze enemies have a distinctive red color and warning stripes
    ctx.fillStyle = design.color;
    ctx.fillRect(x, y, width, height);
    
    // Warning stripes
    ctx.fillStyle = design.accentColor;
    ctx.fillRect(x, y + height/4, width, height/8);
    ctx.fillRect(x, y + height*3/4, width, height/8);
    
    // Explosive symbol
    ctx.fillStyle = '#ff0000';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('💥', x + width/2, y + height/2 + 4);
}

// Draw shielded enemy
function drawShieldedEnemy(x, y, width, height, design, enemy) {
    // Draw shield effect
    if (enemy.health > 1) {
        ctx.strokeStyle = '#4444ff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(x + width/2, y + height/2, width/2 + 5, 0, Math.PI * 2);
        ctx.stroke();
    }
    
    // Draw enemy ship
    ctx.fillStyle = design.color;
    ctx.fillRect(x, y, width, height);
    
    // Shield indicator
    ctx.fillStyle = '#ffffff';
    ctx.font = '10px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`🛡️${enemy.health}`, x + width/2, y + height/2 + 3);
}

// Draw splitter enemy
function drawSplitterEnemy(x, y, width, height, design) {
    // Splitter enemies have a distinctive orange color
    ctx.fillStyle = design.color;
    ctx.fillRect(x, y, width, height);
    
    // Split indicator
    ctx.fillStyle = design.accentColor;
    ctx.fillRect(x + width/4, y + height/4, width/2, height/2);
    
    // Split symbol
    ctx.fillStyle = '#ff8800';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('⚡', x + width/2, y + height/2 + 4);
}

// Draw teleporter enemy
function drawTeleporterEnemy(x, y, width, height, design) {
    // Teleporter enemies have a purple color and teleport effect
    ctx.fillStyle = design.color;
    ctx.fillRect(x, y, width, height);
    
    // Teleport effect (pulsing)
    const time = Date.now() * 0.01;
    const alpha = Math.sin(time) * 0.5 + 0.5;
    ctx.strokeStyle = `rgba(136, 0, 255, ${alpha})`;
    ctx.lineWidth = 2;
    ctx.strokeRect(x - 2, y - 2, width + 4, height + 4);
    
    // Teleport symbol
    ctx.fillStyle = '#8800ff';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('🌀', x + width/2, y + height/2 + 4);
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
        } else if (explosion.type === 'shield') {
            // Draw shield effect
            const alpha = explosion.life / 5;
            ctx.strokeStyle = `rgba(136, 136, 255, ${alpha})`;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(explosion.x, explosion.y, 10, 0, Math.PI * 2);
            ctx.stroke();
        }
        else {
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

// Boss rendering
function drawBoss() {
    if (!boss || !boss.active) return;
    // Draw boss ship (simple rectangle for now, can enhance later)
    ctx.save();
    ctx.globalAlpha = 0.95;
    ctx.fillStyle = boss.color;
    ctx.fillRect(boss.x, boss.y, boss.width, boss.height);
    ctx.restore();
    // Draw boss health bar
    ctx.fillStyle = '#222';
    ctx.fillRect(canvas.width/2 - 100, 10, 200, bossHealthBarHeight);
    ctx.fillStyle = '#ff00cc';
    ctx.fillRect(canvas.width/2 - 100, 10, 200 * (boss.health / boss.maxHealth), bossHealthBarHeight);
    ctx.strokeStyle = '#fff';
    ctx.strokeRect(canvas.width/2 - 100, 10, 200, bossHealthBarHeight);
    // Draw boss name
    ctx.fillStyle = '#fff';
    ctx.font = '18px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(boss.name + ' (Phase ' + boss.phase + ')', canvas.width/2, 40);
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

// Add weapon switching hotkeys
document.addEventListener('keydown', function(e) {
    keys[e.key] = true;
    
    // Weapon switching hotkeys
    if (gameState === 'playing') {
        const weaponTypes = Object.keys(WEAPON_TYPES);
        const currentIndex = weaponTypes.indexOf(player.weaponType);
        
        switch(e.key) {
            case '1':
            case '2':
            case '3':
            case '4':
            case '5':
            case '6':
            case '7':
            case '8':
            case '9':
                const weaponIndex = parseInt(e.key) - 1;
                if (weaponIndex < weaponTypes.length) {
                    player.weaponType = weaponTypes[weaponIndex];
                }
                break;
            case 'q':
                // Previous weapon
                const prevIndex = (currentIndex - 1 + weaponTypes.length) % weaponTypes.length;
                player.weaponType = weaponTypes[prevIndex];
                break;
            case 'e':
                // Next weapon
                const nextIndex = (currentIndex + 1) % weaponTypes.length;
                player.weaponType = weaponTypes[nextIndex];
                break;
            case ' ':
                // Space bar for charge weapons
                if (WEAPON_TYPES[player.weaponType].chargeable) {
                    player.charging = true;
                }
                break;
        }
    }
});

document.addEventListener('keyup', function(e) {
    keys[e.key] = false;
    
    if (e.key === ' ' && player.charging) {
        player.charging = false;
        shoot(); // Fire charged shot
    }
});

// Helper function to create player hit effect
function createPlayerHitEffect() {
    playSound('playerHit');
    player.invulnerable = true;
    player.invulnerabilityTime = Date.now() + PLAYER_INVULNERABILITY_TIME;
    
    // Create explosion
    explosions.push({
        x: player.x + player.width / 2,
        y: player.y + player.height / 2,
        life: 15
    });
    
    // Create particles
    createParticles(player.x + player.width / 2, player.y + player.height / 2, '255, 0, 0', 20);
    
    // Add screen shake
    addScreenShake(5);
    
    // Trigger ship damage animation
    triggerShipDamageAnimation();
    
    if (player.health <= 0) {
        lives--;
        player.health = player.maxHealth;
        
        if (lives <= 0) {
            gameOver();
        }
    }
}

// Helper function to create explosion
function createExplosion(x, y) {
    explosions.push({
        x: x,
        y: y,
        life: 10
    });
    
    // Create particle effects
    createParticles(x, y, '255, 255, 255', 15);
    createParticles(x, y, '255, 200, 0', 10);
    createParticles(x, y, '255, 100, 0', 5);
    
    // Add screen shake
    addScreenShake(3);
    
    // Create lighting effect
    createLightingEffect(x, y, '#ffff00', 0.5);
    
    playSound('explosion');
}

// Draw environmental hazards
function drawHazards() {
    // Draw asteroids
    for (let asteroid of asteroids) {
        ctx.save();
        ctx.translate(asteroid.x + asteroid.width/2, asteroid.y + asteroid.height/2);
        ctx.rotate(asteroid.rotation);
        ctx.fillStyle = HAZARD_TYPES.asteroid.color;
        ctx.fillRect(-asteroid.width/2, -asteroid.height/2, asteroid.width, asteroid.height);
        ctx.restore();
    }
    
    // Draw barriers
    for (let barrier of barriers) {
        ctx.fillStyle = HAZARD_TYPES.barrier.color;
        ctx.fillRect(barrier.x, barrier.y, barrier.width, barrier.height);
        
        // Add barrier texture
        ctx.strokeStyle = '#666666';
        ctx.lineWidth = 1;
        for (let i = 0; i < barrier.width; i += 10) {
            ctx.beginPath();
            ctx.moveTo(barrier.x + i, barrier.y);
            ctx.lineTo(barrier.x + i, barrier.y + barrier.height);
            ctx.stroke();
        }
    }
    
    // Draw moving obstacles
    for (let obstacle of movingObstacles) {
        ctx.fillStyle = HAZARD_TYPES.movingObstacle.color;
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        
        // Add warning stripes
        ctx.fillStyle = '#ffff00';
        ctx.fillRect(obstacle.x, obstacle.y + obstacle.height/4, obstacle.width, obstacle.height/8);
        ctx.fillRect(obstacle.x, obstacle.y + obstacle.height*3/4, obstacle.width, obstacle.height/8);
    }
    
    // Draw damage zones
    for (let zone of damageZones) {
        const alpha = Math.sin(zone.pulse) * 0.5 + 0.5;
        ctx.fillStyle = `rgba(255, 0, 0, ${alpha})`;
        ctx.fillRect(zone.x, zone.y, zone.width, zone.height);
        
        // Add danger symbol
        ctx.fillStyle = '#ffffff';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('⚠️', zone.x + zone.width/2, zone.y + zone.height/2 + 6);
    }
}

// Create particle effects
function createParticles(x, y, color, count = 10) {
    for (let i = 0; i < count; i++) {
        particles.push(new Particle(
            x,
            y,
            color,
            {
                x: (Math.random() - 0.5) * 4,
                y: (Math.random() - 0.5) * 4
            },
            Math.random() * 30 + 20
        ));
    }
}

// Update particles
function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update();
        if (particles[i].life <= 0) {
            particles.splice(i, 1);
        }
    }
}

// Draw particles
function drawParticles() {
    for (let particle of particles) {
        particle.draw(ctx);
    }
}

// Screen shake effect
function addScreenShake(intensity = 5) {
    screenShake = Math.max(screenShake, intensity);
}

function updateScreenShake() {
    if (screenShake > 0) {
        screenShake *= 0.9;
        if (screenShake < 0.1) screenShake = 0;
    }
}

// Parallax background system
function initParallaxBackground() {
    parallaxLayers = [
        {
            stars: [],
            speed: 0.5,
            color: '#ffffff'
        },
        {
            stars: [],
            speed: 1,
            color: '#cccccc'
        },
        {
            stars: [],
            speed: 1.5,
            color: '#888888'
        }
    ];
    
    // Initialize stars for each layer
    for (let layer of parallaxLayers) {
        for (let i = 0; i < 50; i++) {
            layer.stars.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                size: Math.random() * 2 + 1
            });
        }
    }
}

function updateParallaxBackground() {
    for (let layer of parallaxLayers) {
        for (let star of layer.stars) {
            star.y += layer.speed;
            if (star.y > canvas.height) {
                star.y = -5;
                star.x = Math.random() * canvas.width;
            }
        }
    }
}

function drawParallaxBackground() {
    for (let layer of parallaxLayers) {
        ctx.fillStyle = layer.color;
        for (let star of layer.stars) {
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

// Lighting effects
function createLightingEffect(x, y, color, intensity) {
    lightingEffects.push({
        x: x,
        y: y,
        color: color,
        intensity: intensity,
        life: 30
    });
}

function updateLightingEffects() {
    for (let i = lightingEffects.length - 1; i >= 0; i--) {
        lightingEffects[i].life--;
        if (lightingEffects[i].life <= 0) {
            lightingEffects.splice(i, 1);
        }
    }
}

function drawLightingEffects() {
    for (let effect of lightingEffects) {
        const alpha = effect.life / 30;
        const gradient = ctx.createRadialGradient(
            effect.x, effect.y, 0,
            effect.x, effect.y, 100
        );
        gradient.addColorStop(0, `${effect.color}${Math.floor(alpha * 255).toString(16).padStart(2, '0')}`);
        gradient.addColorStop(1, 'transparent');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(effect.x - 100, effect.y - 100, 200, 200);
    }
}

// Ship damage animation
function triggerShipDamageAnimation() {
    shipDamageAnimation = 10;
}

function updateShipDamageAnimation() {
    if (shipDamageAnimation > 0) {
        shipDamageAnimation--;
    }
}

// Draw enemy fighter
function drawEnemyFighter(x, y, width, height, design) {
    // Enemy fighter - triangular design
    ctx.fillStyle = design.color;
    ctx.beginPath();
    ctx.moveTo(x + width/2, y + height); // Bottom point
    ctx.lineTo(x + width, y); // Top right
    ctx.lineTo(x + width/2, y + height/4); // Upper center
    ctx.lineTo(x, y); // Top left
    ctx.closePath();
    ctx.fill();
    
    // Cockpit
    ctx.fillStyle = design.accentColor;
    ctx.beginPath();
    ctx.ellipse(x + width/2, y + height/3, width/8, height/12, 0, 0, Math.PI * 2);
    ctx.fill();
}

// Draw destroyer enemy
function drawDestroyerEnemy(x, y, width, height, design) {
    // Destroyer - larger, more armored design
    ctx.fillStyle = design.color;
    ctx.fillRect(x, y, width, height);
    
    // Armor plates
    ctx.fillStyle = design.accentColor;
    ctx.fillRect(x + width/4, y + height/4, width/2, height/2);
    
    // Weapon ports
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(x + width/6, y + height/3, width/12, height/6);
    ctx.fillRect(x + width*2/3, y + height/3, width/12, height/6);
}

// Draw battleship enemy
function drawBattleshipEnemy(x, y, width, height, design) {
    // Battleship - largest enemy design
    ctx.fillStyle = design.color;
    ctx.fillRect(x, y, width, height);
    
    // Multiple weapon turrets
    ctx.fillStyle = design.accentColor;
    ctx.fillRect(x + width/6, y + height/4, width/6, height/6);
    ctx.fillRect(x + width*2/3, y + height/4, width/6, height/6);
    ctx.fillRect(x + width/3, y + height/2, width/3, height/6);
    
    // Command bridge
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x + width/3, y + height/6, width/3, height/6);
}