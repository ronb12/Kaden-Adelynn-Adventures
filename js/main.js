// Main game engine for Kaden & Adelynn: Space Shooter - Gradius Style
console.log('Main.js loaded - Gradius Style');

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

console.log('Canvas:', canvas);
console.log('Context:', ctx);

let lastTime = 0;
let gameRunning = true;
let gameStarted = false;

// Gradius-style game state
window.gameState = {
    score: 0,
    lives: 3,
    level: 1,
    money: 0, // Recreate money property
    paused: false,
    powerUpBar: {
        speed: false,
        missile: false,
        double: false,
        laser: false,
        option: false,
        shield: false
    },
    currentPowerUp: 0, // 0-5 for power-up bar
    backgroundOffset: 0,
    backgroundSpeed: 1
};

// Gradius-style asset list
const assetList = [
    'assets/images/space_background.jpg',
    'assets/images/spaceship_modern.png',
    'assets/images/enemy_ship1.png',
    'assets/images/enemy_ship2.png',
    'assets/images/enemy_ship3.png'
];

function preloadAssets(assets, callback) {
    console.log('Preloading Gradius assets:', assets);
    let loaded = 0;
    const total = assets.length;
    
    if (total === 0) {
        console.log('No assets to preload, starting game immediately');
        callback();
        return;
    }
    
    assets.forEach(asset => {
        const img = new Image();
        img.src = asset;
        img.onload = () => {
            loaded++;
            console.log(`Loaded asset: ${asset} (${loaded}/${total})`);
            if (loaded === total) {
                console.log('All assets loaded, starting Gradius game');
                callback();
            }
        };
        img.onerror = () => {
            loaded++;
            console.log(`Failed to load asset: ${asset} (${loaded}/${total})`);
            if (loaded === total) {
                console.log('All assets processed, starting game');
                callback();
            }
        };
    });
}

function startGame() {
    console.log('Starting Gradius-style game...');
    console.log('Available classes:', {
        Player: typeof Player,
        EnemyManager: typeof EnemyManager,
        LevelManager: typeof LevelManager,
        PowerUpManager: typeof PowerUpManager,
        AudioManager: typeof AudioManager,
        UIManager: typeof UIManager,
        GameStorageManager: typeof GameStorageManager
    });
    
    gameStarted = true;
    
    // Initialize game objects with Gradius-style settings
    try {
        window.player = new Player(100, 400); // Start on left side like Gradius
        window.enemyManager = new EnemyManager(canvas, ctx);
        window.levelManager = new LevelManager(canvas, ctx);
        window.powerUpManager = new PowerUpManager(canvas, ctx);
        window.audioManager = new AudioManager();
        window.uiManager = new UIManager();
        window.storageManager = new GameStorageManager();
        
        // Set up Gradius-style power-up system
        setupGradiusPowerUpSystem();
        
        console.log('All Gradius game objects initialized successfully');
        
        // Set up Gradius-style input handling
        setupGradiusInput();
        
    } catch (error) {
        console.error('Error initializing Gradius game objects:', error);
        return;
    }
    
    // Start main loop
    console.log('Starting Gradius game loop');
    requestAnimationFrame(gameLoop);
}

// Make Gradius-style game API available globally for button onclicks
window.game = {
    startGame
};

function setupGradiusPowerUpSystem() {
    // Gradius power-up bar: Speed, Missile, Double, Laser, Option, Shield
    window.gameState.powerUpBar = {
        speed: false,
        missile: false,
        double: false,
        laser: false,
        option: false,
        shield: false
    };
    window.gameState.currentPowerUp = 0;
}

function setupGradiusInput() {
    // Gradius-style input handling
    document.addEventListener('keydown', (e) => {
        switch(e.code) {
            case 'Space':
                e.preventDefault();
                if (window.player) {
                    window.player.setInputState({ shoot: true });
                }
                break;
            case 'KeyS':
                // Activate current power-up
                activateCurrentPowerUp();
                break;
            case 'ArrowLeft':
                if (window.player) {
                    window.player.setInputState({ moveLeft: true });
                }
                break;
            case 'ArrowRight':
                if (window.player) {
                    window.player.setInputState({ moveRight: true });
                }
                break;
            case 'ArrowUp':
                if (window.player) {
                    window.player.setInputState({ moveUp: true });
                }
                break;
            case 'ArrowDown':
                if (window.player) {
                    window.player.setInputState({ moveDown: true });
                }
                break;
        }
    });
    
    document.addEventListener('keyup', (e) => {
        switch(e.code) {
            case 'Space':
                if (window.player) {
                    window.player.setInputState({ shoot: false });
                }
                break;
            case 'ArrowLeft':
                if (window.player) {
                    window.player.setInputState({ moveLeft: false });
                }
                break;
            case 'ArrowRight':
                if (window.player) {
                    window.player.setInputState({ moveRight: false });
                }
                break;
            case 'ArrowUp':
                if (window.player) {
                    window.player.setInputState({ moveUp: false });
                }
                break;
            case 'ArrowDown':
                if (window.player) {
                    window.player.setInputState({ moveDown: false });
                }
                break;
        }
    });
}

function activateCurrentPowerUp() {
    const powerUps = ['speed', 'missile', 'double', 'laser', 'option', 'shield'];
    const currentPowerUp = powerUps[window.gameState.currentPowerUp];
    
    if (window.gameState.powerUpBar[currentPowerUp]) {
        // Activate the power-up
        window.gameState.powerUpBar[currentPowerUp] = false;
        applyPowerUp(currentPowerUp);
        console.log(`Activated power-up: ${currentPowerUp}`);
    }
}

function applyPowerUp(powerUpType) {
    if (!window.player) return;
    
    switch(powerUpType) {
        case 'speed':
            window.player.speed *= 1.5;
            break;
        case 'missile':
            window.player.weaponType = 'missile';
            break;
        case 'double':
            window.player.weaponType = 'double';
            break;
        case 'laser':
            window.player.weaponType = 'laser';
            break;
        case 'option':
            // Add option (drones)
            if (!window.player.options) window.player.options = [];
            window.player.options.push({ x: window.player.x + 30, y: window.player.y });
            break;
        case 'shield':
            window.player.shield = 100;
            break;
    }
}

function gameLoop(time) {
    if (!gameRunning || !gameStarted) {
        requestAnimationFrame(gameLoop);
        return;
    }
    
    const delta = (time - lastTime) / 1000;
    lastTime = time;
    
    // Update scrolling background
    updateScrollingBackground(delta);
    
    // Update game objects
    try {
        if (window.levelManager) window.levelManager.update(delta);
        if (window.enemyManager) window.enemyManager.update(delta);
        if (window.player) window.player.update(delta);
        if (window.powerUpManager) window.powerUpManager.update(delta);
        if (window.uiManager) window.uiManager.update();
        
        // Handle Gradius-style shooting
        if (window.player && window.player.inputState.shoot && window.player.canShoot()) {
            const bullets = window.player.shoot();
            if (bullets && bullets.length > 0) {
                if (!window.gameState.bullets) window.gameState.bullets = [];
                window.gameState.bullets.push(...bullets);
            }
        }
        
    } catch (error) {
        console.error('Error in Gradius game loop:', error);
    }
    
    // Draw everything
    drawGradiusGame(ctx, delta);
    
    // Next frame
    requestAnimationFrame(gameLoop);
}

function updateScrollingBackground(delta) {
    // Gradius-style scrolling background
    window.gameState.backgroundOffset += window.gameState.backgroundSpeed * delta * 50;
    if (window.gameState.backgroundOffset > canvas.height) {
        window.gameState.backgroundOffset = 0;
    }
}

function drawGradiusGame(ctx, delta) {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw scrolling background
    drawScrollingBackground(ctx);
    
    try {
        // Draw game objects
        if (window.levelManager) window.levelManager.draw(ctx);
        if (window.enemyManager) window.enemyManager.draw(ctx);
        if (window.player) window.player.draw(ctx);
        if (window.powerUpManager) window.powerUpManager.draw(ctx);
        if (window.uiManager) window.uiManager.draw(ctx);
        
        // Draw bullets
        drawBullets(ctx);
        
        // Draw Gradius-style UI
        drawGradiusUI(ctx);
        
    } catch (error) {
        console.error('Error drawing Gradius game:', error);
    }
}

function drawScrollingBackground(ctx) {
    // Create starfield effect
    ctx.fillStyle = '#000011';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw stars
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 100; i++) {
        const x = (i * 37) % canvas.width;
        const y = (i * 73 + window.gameState.backgroundOffset) % canvas.height;
        ctx.fillRect(x, y, 1, 1);
    }
}

function drawGradiusUI(ctx) {
    // Draw Gradius-style power-up bar
    drawPowerUpBar(ctx);
    
    // Draw score and lives
    ctx.fillStyle = '#ffffff';
    ctx.font = '16px Arial';
    ctx.fillText(`SCORE: ${window.gameState.score}`, 10, 30);
    ctx.fillText(`LIVES: ${window.gameState.lives}`, 10, 50);
    ctx.fillText(`LEVEL: ${window.gameState.level}`, 10, 70);
    
    // Draw current power-up indicator
    const powerUps = ['SPEED', 'MISSILE', 'DOUBLE', 'LASER', 'OPTION', 'SHIELD'];
    ctx.fillText(`POWER-UP: ${powerUps[window.gameState.currentPowerUp]}`, 10, 90);
}

function drawPowerUpBar(ctx) {
    const barX = canvas.width - 200;
    const barY = 20;
    const barWidth = 180;
    const barHeight = 20;
    
    // Draw power-up bar background
    ctx.fillStyle = '#333333';
    ctx.fillRect(barX, barY, barWidth, barHeight);
    
    // Draw power-up indicators
    const powerUps = ['speed', 'missile', 'double', 'laser', 'option', 'shield'];
    const segmentWidth = barWidth / 6;
    
    powerUps.forEach((powerUp, index) => {
        const x = barX + index * segmentWidth;
        const isActive = window.gameState.powerUpBar[powerUp];
        const isCurrent = index === window.gameState.currentPowerUp;
        
        ctx.fillStyle = isActive ? '#00ff00' : '#666666';
        if (isCurrent) ctx.fillStyle = '#ffff00';
        
        ctx.fillRect(x + 2, barY + 2, segmentWidth - 4, barHeight - 4);
        
        // Draw power-up label
        ctx.fillStyle = '#ffffff';
        ctx.font = '10px Arial';
        ctx.fillText(powerUp.charAt(0).toUpperCase(), x + 5, barY + 15);
    });
}

function drawBullets(ctx) {
    if (!window.gameState.bullets) return;
    
    for (let i = window.gameState.bullets.length - 1; i >= 0; i--) {
        const bullet = window.gameState.bullets[i];
        
        // Update bullet position
        bullet.y -= bullet.speed;
        
        // Remove bullets that are off screen
        if (bullet.y + bullet.height < 0) {
            window.gameState.bullets.splice(i, 1);
            continue;
        }
        
        // Draw bullet based on type
        ctx.save();
        ctx.translate(bullet.x, bullet.y);
        
        if (bullet.type === 'missile') {
            // Draw missile
            ctx.fillStyle = '#ff4444';
            ctx.fillRect(-2, -4, 4, 8);
        } else if (bullet.type === 'laser') {
            // Draw laser
            ctx.fillStyle = '#44ff44';
            ctx.fillRect(-1, -8, 2, 16);
        } else if (bullet.type === 'double') {
            // Draw double shot
            ctx.fillStyle = '#4444ff';
            ctx.fillRect(-3, -3, 6, 6);
        } else {
            // Draw standard bullet
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(-2, -4, 4, 8);
        }
        
        ctx.restore();
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, starting Gradius asset preload...');
    preloadAssets(assetList, startGame);
});

// Prevent iOS scrolling
window.addEventListener('touchmove', function(e) { 
    e.preventDefault(); 
}, { passive: false });

// Handle window resize
window.addEventListener('resize', function() {
    canvas.style.width = '100%';
    canvas.style.height = 'auto';
});

// Add touch controls for mobile
if ('ontouchstart' in window) {
    let touchStartX = 0;
    let touchStartY = 0;
    
    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
        
        if (window.player) {
            window.player.setInputState({ shoot: true });
        }
    });
    
    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        const deltaX = touch.clientX - touchStartX;
        const deltaY = touch.clientY - touchStartY;
        
        if (window.player) {
            const moveSpeed = 5;
            window.player.x += deltaX * moveSpeed * 0.01;
            window.player.y += deltaY * moveSpeed * 0.01;
            touchStartX = touch.clientX;
            touchStartY = touch.clientY;
        }
    });
    
    canvas.addEventListener('touchend', (e) => {
        e.preventDefault();
        if (window.player) {
            window.player.setInputState({ shoot: false });
        }
    });
}