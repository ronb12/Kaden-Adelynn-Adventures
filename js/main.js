// Enhanced Space Shooter Game - Kaden & Adelynn Adventures
console.log('🎮 Loading Enhanced Kaden & Adelynn Adventures...');

// Get canvas and context
const canvas = document.getElementById('gameCanvas');
if (!canvas) {
    console.error('Canvas element not found!');
    throw new Error('Canvas element not found!');
}
const ctx = canvas.getContext('2d');
if (!ctx) {
    console.error('Could not get 2D context from canvas!');
    throw new Error('Could not get 2D context from canvas!');
}

// Enhanced game state
window.gameState = {
    score: 0,
    lives: 5,
    level: 1,
    money: 0,
    paused: false,
    powerUpBar: {
        speed: false,
        missile: false,
        double: false,
        laser: false,
        option: false,
        shield: false
    },
    currentPowerUp: 0,
    backgroundOffset: 0,
    backgroundSpeed: 1,
    enemiesKilled: 0,
    bossesKilled: 0,
    powerUpsCollected: 0,
    shotsFired: 0,
    shotsHit: 0
};

// Game objects
let player = {
    x: canvas.width / 2,
    y: canvas.height - 80,
    width: 40,
    height: 40,
    speed: 5,
    health: 100,
    isAlive: true,
    invulnerable: false,
    invulnerabilityTime: 0,
    weaponType: 'normal',
    hasSpeed: false,
    hasShield: false
};

let bullets = [];
let enemies = [];
let powerUps = [];
let stars = [];
let particles = [];

// Input state
let keys = {
    ArrowLeft: false,
    ArrowRight: false,
    ArrowUp: false,
    ArrowDown: false,
    Space: false,
    SpacePressed: false,
    KeyS: false,
    KeyP: false
};

// Game settings
const BULLET_SPEED = 10;
const ENEMY_SPEED = 2;
const POWERUP_SPEED = 1;
const STAR_SPEED = 1;
const MAX_ENEMIES = 20;
const MAX_BULLETS = 50;
const MAX_PARTICLES = 100;

// Initialize stars for background
function initStars() {
    for (let i = 0; i < 100; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 2 + 1,
            speed: Math.random() * 2 + 0.5
        });
    }
}

// Create bullet
function createBullet() {
    if (bullets.length < MAX_BULLETS) {
        const bulletSpeed = player.hasSpeed ? BULLET_SPEED * 1.2 : BULLET_SPEED;
        bullets.push({
            x: player.x + player.width / 2 - 2,
            y: player.y,
            width: 4,
            height: 10,
            speed: bulletSpeed,
            damage: 1
        });
        window.gameState.shotsFired++;
    }
}

// Create enemy
function createEnemy() {
    const spawnRate = 0.02 + (window.gameState.level - 1) * 0.005;
    if (Math.random() < spawnRate && enemies.length < MAX_ENEMIES) {
        const enemyTypes = ['basic', 'fast', 'tank'];
        const type = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
        
        let enemy = {
            x: Math.random() * (canvas.width - 30),
            y: -30,
            width: 30,
            height: 30,
            speed: ENEMY_SPEED + Math.random() * 2 + (window.gameState.level - 1) * 0.5,
            type: type,
            health: type === 'tank' ? 3 : 1
        };
        
        // Adjust enemy properties based on type
        if (type === 'fast') {
            enemy.speed *= 1.5;
            enemy.width = 25;
            enemy.height = 25;
        } else if (type === 'tank') {
            enemy.speed *= 0.7;
            enemy.width = 40;
            enemy.height = 40;
        }
        
        enemies.push(enemy);
    }
}

// Create power-up
function createPowerUp() {
    if (Math.random() < 0.001) {
        const powerUpTypes = ['health', 'weapon', 'speed', 'shield'];
        const type = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
        
        powerUps.push({
            x: Math.random() * (canvas.width - 20),
            y: -20,
            width: 20,
            height: 20,
            speed: POWERUP_SPEED,
            type: type
        });
    }
}

// Create particle effect
function createParticle(x, y, color = '#ffff00') {
    if (particles.length < MAX_PARTICLES) {
        particles.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 4,
            vy: (Math.random() - 0.5) * 4,
            life: 30,
            maxLife: 30,
            color: color,
            size: Math.random() * 3 + 1
        });
    }
}

// Update player
function updatePlayer() {
    const moveSpeed = player.hasSpeed ? player.speed * 1.5 : player.speed;
    
    if (keys.ArrowLeft && player.x > 0) player.x -= moveSpeed;
    if (keys.ArrowRight && player.x < canvas.width - player.width) player.x += moveSpeed;
    if (keys.ArrowUp && player.y > 0) player.y -= moveSpeed;
    if (keys.ArrowDown && player.y < canvas.height - player.height) player.y += moveSpeed;
    
    // Shooting
    if (keys.Space && !window.gameState.paused) {
        if (!keys.SpacePressed) {
            createBullet();
            keys.SpacePressed = true;
        }
    } else {
        keys.SpacePressed = false;
    }
    
    // Power-up activation
    if (keys.KeyS && !keys.KeySPressed) {
        activatePowerUp();
        keys.KeySPressed = true;
    } else if (!keys.KeyS) {
        keys.KeySPressed = false;
    }
    
    // Update invulnerability
    if (player.invulnerable) {
        player.invulnerabilityTime--;
        if (player.invulnerabilityTime <= 0) {
            player.invulnerable = false;
        }
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
        if (enemies[i].y > canvas.height) {
            enemies.splice(i, 1);
        }
    }
}

// Update power-ups
function updatePowerUps() {
    for (let i = powerUps.length - 1; i >= 0; i--) {
        powerUps[i].y += powerUps[i].speed;
        if (powerUps[i].y > canvas.height) {
            powerUps.splice(i, 1);
        }
    }
}

// Update particles
function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].x += particles[i].vx;
        particles[i].y += particles[i].vy;
        particles[i].life--;
        
        if (particles[i].life <= 0) {
            particles.splice(i, 1);
        }
    }
}

// Update stars
function updateStars() {
    for (let i = stars.length - 1; i >= 0; i--) {
        stars[i].y += stars[i].speed;
        if (stars[i].y > canvas.height) {
            stars[i].y = 0;
            stars[i].x = Math.random() * canvas.width;
        }
    }
}

// Check collisions
function checkCollisions() {
    // Bullets vs Enemies
    for (let i = bullets.length - 1; i >= 0; i--) {
        for (let j = enemies.length - 1; j >= 0; j--) {
            if (bullets[i] && enemies[j] &&
                bullets[i].x < enemies[j].x + enemies[j].width &&
                bullets[i].x + bullets[i].width > enemies[j].x &&
                bullets[i].y < enemies[j].y + enemies[j].height &&
                bullets[i].y + bullets[i].height > enemies[j].y) {
                
                // Create explosion particles
                createParticle(enemies[j].x + enemies[j].width/2, enemies[j].y + enemies[j].height/2, '#ff4444');
                
                bullets.splice(i, 1);
                enemies[j].health -= bullets[i].damage;
                
                if (enemies[j].health <= 0) {
                    enemies.splice(j, 1);
                    window.gameState.score += 10;
                    window.gameState.enemiesKilled++;
                    window.gameState.shotsHit++;
                    
                    // Add money
                    window.gameState.money += 5;
                }
                break;
            }
        }
    }
    
    // Player vs Enemies
    if (!player.invulnerable) {
        for (let i = enemies.length - 1; i >= 0; i--) {
            if (enemies[i] &&
                player.x < enemies[i].x + enemies[i].width &&
                player.x + player.width > enemies[i].x &&
                player.y < enemies[i].y + enemies[i].height &&
                player.y + player.height > enemies[i].y) {
                
                // Create explosion particles
                createParticle(enemies[i].x + enemies[i].width/2, enemies[i].y + enemies[i].height/2, '#ff4444');
                
                enemies.splice(i, 1);
                window.gameState.lives--;
                
                // Make player invulnerable temporarily
                player.invulnerable = true;
                player.invulnerabilityTime = 120; // 2 seconds at 60fps
                
                if (window.gameState.lives <= 0) {
                    gameOver();
                }
            }
        }
    }
    
    // Player vs Power-ups
    for (let i = powerUps.length - 1; i >= 0; i--) {
        if (powerUps[i] &&
            player.x < powerUps[i].x + powerUps[i].width &&
            player.x + player.width > powerUps[i].x &&
            player.y < powerUps[i].y + powerUps[i].height &&
            player.y + player.height > powerUps[i].y) {
            
            applyPowerUp(powerUps[i].type);
            powerUps.splice(i, 1);
            window.gameState.powerUpsCollected++;
        }
    }
}

// Apply power-up
function applyPowerUp(type) {
    switch(type) {
        case 'health':
            window.gameState.lives = Math.min(window.gameState.lives + 1, 10);
            break;
        case 'weapon':
            window.gameState.score += 50;
            break;
        case 'speed':
            player.hasSpeed = true;
            setTimeout(() => { player.hasSpeed = false; }, 10000); // 10 seconds
            break;
        case 'shield':
            player.hasShield = true;
            setTimeout(() => { player.hasShield = false; }, 15000); // 15 seconds
            break;
    }
}

// Activate power-up
function activatePowerUp() {
    // This could be used for special weapons or abilities
    console.log('Power-up activated!');
}

// Game over
function gameOver() {
    window.gameState.paused = true;
    
    // Save high score
    if (typeof GameStorageManager !== 'undefined') {
        const storage = new GameStorageManager();
        storage.saveHighScore(window.gameState.score);
    }
    
    // Show game over screen
    document.getElementById('gameOverScreen').classList.remove('hidden');
    document.getElementById('startScreen').classList.add('hidden');
    
    // Update final stats
    document.getElementById('finalScore').textContent = window.gameState.score;
    document.getElementById('finalMoney').textContent = window.gameState.money;
    
    const accuracy = window.gameState.shotsFired > 0 ? 
        Math.round((window.gameState.shotsHit / window.gameState.shotsFired) * 100) : 0;
    
    console.log(`Game Over! Final Score: ${window.gameState.score}, Accuracy: ${accuracy}%`);
}

// Reset game
function resetGame() {
    window.gameState.score = 0;
    window.gameState.lives = 5;
    window.gameState.level = 1;
    window.gameState.money = 0;
    window.gameState.paused = false;
    window.gameState.enemiesKilled = 0;
    window.gameState.bossesKilled = 0;
    window.gameState.powerUpsCollected = 0;
    window.gameState.shotsFired = 0;
    window.gameState.shotsHit = 0;
    
    bullets = [];
    enemies = [];
    powerUps = [];
    particles = [];
    
    player.x = canvas.width / 2;
    player.y = canvas.height - 80;
    player.health = 100;
    player.isAlive = true;
    player.invulnerable = false;
    player.hasSpeed = false;
    player.hasShield = false;
    
    // Hide game over screen
    document.getElementById('gameOverScreen').classList.add('hidden');
    document.getElementById('startScreen').classList.remove('hidden');
}

// Draw functions
function drawStars() {
    ctx.fillStyle = '#ffffff';
    stars.forEach(star => {
        ctx.fillRect(star.x, star.y, star.size, star.size);
    });
}

function drawPlayer() {
    // Draw shield effect
    if (player.hasShield) {
        ctx.strokeStyle = '#00ffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(player.x + player.width/2, player.y + player.height/2, player.width/2 + 5, 0, Math.PI * 2);
        ctx.stroke();
    }
    
    // Draw player with invulnerability flash
    if (!player.invulnerable || Math.floor(Date.now() / 100) % 2) {
        ctx.fillStyle = player.hasSpeed ? '#00ff00' : '#4a90e2';
        ctx.fillRect(player.x, player.y, player.width, player.height);
        
        // Draw cockpit
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(player.x + 15, player.y + 10, 10, 10);
        
        // Draw engine glow
        ctx.fillStyle = '#00ffff';
        ctx.fillRect(player.x + 5, player.y + player.height, 8, 5);
        ctx.fillRect(player.x + 27, player.y + player.height, 8, 5);
    }
}

function drawBullets() {
    ctx.fillStyle = '#ffff00';
    bullets.forEach(bullet => {
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    });
}

function drawEnemies() {
    enemies.forEach(enemy => {
        // Draw enemy body
        ctx.fillStyle = enemy.type === 'tank' ? '#ff0000' : enemy.type === 'fast' ? '#ff8800' : '#ff4444';
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
        
        // Draw enemy details
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(enemy.x + 5, enemy.y + 5, enemy.width - 10, enemy.height - 10);
        
        // Draw enemy cockpit
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(enemy.x + 10, enemy.y + 10, 10, 10);
    });
}

function drawPowerUps() {
    powerUps.forEach(powerUp => {
        switch(powerUp.type) {
            case 'health':
                ctx.fillStyle = '#00ff00';
                break;
            case 'weapon':
                ctx.fillStyle = '#ff00ff';
                break;
            case 'speed':
                ctx.fillStyle = '#00ffff';
                break;
            case 'shield':
                ctx.fillStyle = '#ffff00';
                break;
            default:
                ctx.fillStyle = '#ffffff';
        }
        ctx.fillRect(powerUp.x, powerUp.y, powerUp.width, powerUp.height);
    });
}

function drawParticles() {
    particles.forEach(particle => {
        const alpha = particle.life / particle.maxLife;
        ctx.fillStyle = particle.color;
        ctx.globalAlpha = alpha;
        ctx.fillRect(particle.x, particle.y, particle.size, particle.size);
    });
    ctx.globalAlpha = 1;
}

function drawUI() {
    // Update HUD elements
    document.getElementById('score').textContent = window.gameState.score;
    document.getElementById('lives').textContent = window.gameState.lives;
    document.getElementById('level').textContent = window.gameState.level;
    document.getElementById('moneyAmount').textContent = window.gameState.money;
    
    // Update statistics
    document.getElementById('enemiesKilled').textContent = window.gameState.enemiesKilled;
    document.getElementById('bossesKilled').textContent = window.gameState.bossesKilled;
    document.getElementById('powerUpsCollected').textContent = window.gameState.powerUpsCollected;
    
    const accuracy = window.gameState.shotsFired > 0 ? 
        Math.round((window.gameState.shotsHit / window.gameState.shotsFired) * 100) : 0;
    document.getElementById('accuracy').textContent = accuracy + '%';
    
    // Update top score
    if (typeof GameStorageManager !== 'undefined') {
        const storage = new GameStorageManager();
        const highScores = storage.getHighScores();
        const topScore = highScores.length > 0 ? highScores[0].score : 0;
        document.getElementById('topScoreDisplay').textContent = topScore;
    }
}

// Main game loop
function gameLoop() {
    if (window.gameState.paused) return;
    
    // Clear canvas
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Update game objects
    updatePlayer();
    updateBullets();
    updateEnemies();
    updatePowerUps();
    updateParticles();
    updateStars();
    checkCollisions();
    
    // Spawn new objects
    createEnemy();
    createPowerUp();
    
    // Level progression (every 1000 frames = ~16 seconds at 60fps)
    if (window.gameState.score > 0 && window.gameState.score % 500 === 0 && window.gameState.score % 1000 !== 0) {
        window.gameState.level++;
        console.log(`🎯 Level up! Now at level ${window.gameState.level}`);
    }
    
    // Draw everything
    drawStars();
    drawPlayer();
    drawBullets();
    drawEnemies();
    drawPowerUps();
    drawParticles();
    drawUI();
    
    // Continue loop
    requestAnimationFrame(gameLoop);
}

// Input handling
document.addEventListener('keydown', (e) => {
    if (keys.hasOwnProperty(e.code)) {
        keys[e.code] = true;
        e.preventDefault();
    }
});

document.addEventListener('keyup', (e) => {
    if (keys.hasOwnProperty(e.code)) {
        keys[e.code] = false;
    }
});

// Start game function
function startGame() {
    console.log('🚀 Starting Enhanced Kaden & Adelynn Adventures...');
    
    try {
        // Initialize stars if not already done
        if (stars.length === 0) {
            initStars();
        }
        
        // Reset game state
        resetGame();
        
        // Start the game loop
        window.gameState.paused = false;
        gameLoop();
        
        console.log('✅ Enhanced game started successfully!');
    } catch (error) {
        console.error('❌ Error starting game:', error);
        alert('Error starting game. Please refresh the page and try again.');
    }
}

// Restart game function
function restartGame() {
    startGame();
}

// Make game API available globally
window.game = {
    startGame,
    restartGame
};

// Initialize when page loads
window.addEventListener('load', () => {
    console.log('✅ Enhanced game loaded and ready!');
    console.log('🎮 Click "Start Game" to begin!');
    
    // Load high score
    if (typeof GameStorageManager !== 'undefined') {
        const storage = new GameStorageManager();
        const highScores = storage.getHighScores();
        const topScore = highScores.length > 0 ? highScores[0].score : 0;
        document.getElementById('topScoreDisplay').textContent = topScore;
    }
});