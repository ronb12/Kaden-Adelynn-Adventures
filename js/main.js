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
    weaponType: 'normal', // normal, rapid, spread, laser, missile
    hasSpeed: false,
    hasShield: false,
    rapidFireTimer: 0,
    weaponLevel: 1,
    maxWeaponLevel: 3
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
    KeyP: false,
    Digit1: false,
    Digit2: false,
    Digit3: false,
    Digit4: false,
    Digit5: false
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
        const bulletsToCreate = [];
        
        switch(player.weaponType) {
            case 'rapid':
                // Rapid fire - multiple bullets in quick succession
                for (let i = 0; i < 3; i++) {
                    bulletsToCreate.push({
                        x: player.x + player.width / 2 - 2,
                        y: player.y - i * 8,
                        width: 4,
                        height: 8,
                        speed: bulletSpeed * 1.1,
                        damage: 1,
                        type: 'rapid'
                    });
                }
                break;
                
            case 'spread':
                // Spread shot - bullets in a fan pattern
                const angles = [-15, 0, 15]; // degrees
                angles.forEach(angle => {
                    const rad = angle * Math.PI / 180;
                    bulletsToCreate.push({
                        x: player.x + player.width / 2 - 2,
                        y: player.y,
                        width: 4,
                        height: 8,
                        speed: bulletSpeed,
                        damage: 1,
                        type: 'spread',
                        angle: rad,
                        vx: Math.sin(rad) * bulletSpeed * 0.3
                    });
                });
                break;
                
            case 'laser':
                // Laser - powerful single beam
                bulletsToCreate.push({
                    x: player.x + player.width / 2 - 1,
                    y: player.y,
                    width: 2,
                    height: 20,
                    speed: bulletSpeed * 1.5,
                    damage: 3,
                    type: 'laser'
                });
                break;
                
            case 'missile':
                // Missile - homing capability
                bulletsToCreate.push({
                    x: player.x + player.width / 2 - 3,
                    y: player.y,
                    width: 6,
                    height: 12,
                    speed: bulletSpeed * 0.8,
                    damage: 2,
                    type: 'missile',
                    homing: true
                });
                break;
                
            default:
                // Normal shot
                bulletsToCreate.push({
                    x: player.x + player.width / 2 - 2,
                    y: player.y,
                    width: 4,
                    height: 10,
                    speed: bulletSpeed,
                    damage: 1,
                    type: 'normal'
                });
                break;
        }
        
        // Add bullets to the game
        bulletsToCreate.forEach(bullet => {
            if (bullets.length < MAX_BULLETS) {
                bullets.push(bullet);
            }
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
        const powerUpTypes = ['health', 'weapon', 'speed', 'shield', 'rapidfire', 'spread', 'laser', 'missile'];
        const type = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
        
        powerUps.push({
            x: Math.random() * (canvas.width - 20),
            y: -20,
            width: 20,
            height: 20,
            speed: POWERUP_SPEED,
            type: type,
            rotation: 0,
            pulse: 0
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
    
    // Shooting with automatic rapid fire
    if (keys.Space && !window.gameState.paused) {
        if (!keys.SpacePressed) {
            // First shot when space is pressed
            createBullet();
            keys.SpacePressed = true;
            player.rapidFireTimer = 0;
        } else {
            // Rapid fire when space is held down
            player.rapidFireTimer++;
            if (player.rapidFireTimer >= 8) { // Fire every 8 frames (adjust for speed)
                createBullet();
                player.rapidFireTimer = 0;
            }
        }
    } else {
        keys.SpacePressed = false;
        player.rapidFireTimer = 0;
    }
    
    // Power-up activation
    if (keys.KeyS && !keys.KeySPressed) {
        activatePowerUp();
        keys.KeySPressed = true;
    } else if (!keys.KeyS) {
        keys.KeySPressed = false;
    }
    
    // Weapon switching (number keys 1-5)
    if (keys.Digit1) player.weaponType = 'normal';
    if (keys.Digit2) player.weaponType = 'rapid';
    if (keys.Digit3) player.weaponType = 'spread';
    if (keys.Digit4) player.weaponType = 'laser';
    if (keys.Digit5) player.weaponType = 'missile';
    
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
        const bullet = bullets[i];
        
        // Update position based on bullet type
        if (bullet.type === 'spread' && bullet.vx) {
            bullet.x += bullet.vx;
            bullet.y -= bullet.speed;
        } else if (bullet.type === 'missile' && bullet.homing) {
            // Homing missile logic
            let targetEnemy = null;
            let closestDistance = Infinity;
            
            enemies.forEach(enemy => {
                const distance = Math.sqrt(
                    Math.pow(bullet.x - enemy.x, 2) + 
                    Math.pow(bullet.y - enemy.y, 2)
                );
                if (distance < closestDistance) {
                    closestDistance = distance;
                    targetEnemy = enemy;
                }
            });
            
            if (targetEnemy && closestDistance < 100) {
                // Move towards target
                const dx = targetEnemy.x - bullet.x;
                const dy = targetEnemy.y - bullet.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance > 0) {
                    bullet.x += (dx / distance) * bullet.speed * 0.5;
                    bullet.y += (dy / distance) * bullet.speed * 0.5;
                }
            } else {
                // Move straight up
                bullet.y -= bullet.speed;
            }
        } else {
            // Standard movement
            bullet.y -= bullet.speed;
        }
        
        // Remove bullets that are off screen
        if (bullet.y < -bullet.height) {
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
                
                // Store bullet damage before removing it
                const bulletDamage = bullets[i].damage;
                
                // Create explosion particles
                createParticle(enemies[j].x + enemies[j].width/2, enemies[j].y + enemies[j].height/2, '#ff4444');
                
                // Remove bullet
                bullets.splice(i, 1);
                
                // Apply damage to enemy
                enemies[j].health -= bulletDamage;
                
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
        case 'rapidfire':
            player.hasRapidFire = true;
            setTimeout(() => { player.hasRapidFire = false; }, 12000); // 12 seconds
            break;
        case 'spread':
            player.weaponType = 'spread';
            setTimeout(() => { 
                if (player.weaponType === 'spread') player.weaponType = 'normal'; 
            }, 8000); // 8 seconds
            break;
        case 'laser':
            player.weaponType = 'laser';
            setTimeout(() => { 
                if (player.weaponType === 'laser') player.weaponType = 'normal'; 
            }, 8000); // 8 seconds
            break;
        case 'missile':
            player.weaponType = 'missile';
            setTimeout(() => { 
                if (player.weaponType === 'missile') player.weaponType = 'normal'; 
            }, 8000); // 8 seconds
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
    player.rapidFireTimer = 0;
    player.weaponType = 'normal';
    player.weaponLevel = 1;
    
    // Hide game over screen
    document.getElementById('gameOverScreen').classList.add('hidden');
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
        const centerX = player.x + player.width / 2;
        const centerY = player.y + player.height / 2;
        
        // Main ship body (triangular shape)
        ctx.fillStyle = player.hasSpeed ? '#00ff00' : '#4a90e2';
        ctx.beginPath();
        ctx.moveTo(centerX, player.y); // Top point
        ctx.lineTo(player.x, player.y + player.height); // Bottom left
        ctx.lineTo(player.x + player.width, player.y + player.height); // Bottom right
        ctx.closePath();
        ctx.fill();
        
        // Ship outline
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Cockpit (circular)
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(centerX, centerY, 8, 0, Math.PI * 2);
        ctx.fill();
        
        // Cockpit highlight
        ctx.fillStyle = '#00ffff';
        ctx.beginPath();
        ctx.arc(centerX - 2, centerY - 2, 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Engine glow (more detailed)
        if (player.hasSpeed) {
            // Speed boost effect
            ctx.fillStyle = '#00ff00';
            ctx.fillRect(player.x + 8, player.y + player.height, 8, 8);
            ctx.fillRect(player.x + 24, player.y + player.height, 8, 8);
            
            // Speed particles
            for (let i = 0; i < 3; i++) {
                ctx.fillStyle = `rgba(0, 255, 0, ${0.7 - i * 0.2})`;
                ctx.fillRect(player.x + 8 + i * 2, player.y + player.height + 8 + i * 3, 8 - i * 2, 4);
                ctx.fillRect(player.x + 24 + i * 2, player.y + player.height + 8 + i * 3, 8 - i * 2, 4);
            }
        } else {
            // Normal engine glow
            ctx.fillStyle = '#00ffff';
            ctx.fillRect(player.x + 8, player.y + player.height, 8, 6);
            ctx.fillRect(player.x + 24, player.y + player.height, 8, 6);
            
            // Engine particles
            ctx.fillStyle = 'rgba(0, 255, 255, 0.5)';
            ctx.fillRect(player.x + 8, player.y + player.height + 6, 8, 3);
            ctx.fillRect(player.x + 24, player.y + player.height + 6, 8, 3);
        }
        
        // Wing details
        ctx.fillStyle = '#357abd';
        ctx.fillRect(player.x + 2, player.y + player.height - 8, 6, 8);
        ctx.fillRect(player.x + player.width - 8, player.y + player.height - 8, 6, 8);
        
        // Wing highlights
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(player.x + 3, player.y + player.height - 7, 4, 2);
        ctx.fillRect(player.x + player.width - 7, player.y + player.height - 7, 4, 2);
    }
}

function drawBullets() {
    bullets.forEach(bullet => {
        switch(bullet.type) {
            case 'rapid':
                // Rapid fire bullets - multiple small bullets
                ctx.fillStyle = '#00ff00';
                ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 1;
                ctx.strokeRect(bullet.x, bullet.y, bullet.width, bullet.height);
                break;
                
            case 'spread':
                // Spread bullets - angled trajectory
                ctx.fillStyle = '#ff8800';
                ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 1;
                ctx.strokeRect(bullet.x, bullet.y, bullet.width, bullet.height);
                break;
                
            case 'laser':
                // Laser - bright beam
                ctx.fillStyle = '#00ffff';
                ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
                
                // Laser glow effect
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 2;
                ctx.strokeRect(bullet.x - 1, bullet.y, bullet.width + 2, bullet.height);
                break;
                
            case 'missile':
                // Missile - larger with trail
                ctx.fillStyle = '#ff4444';
                ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
                
                // Missile trail
                ctx.fillStyle = 'rgba(255, 68, 68, 0.6)';
                ctx.fillRect(bullet.x + 1, bullet.y + bullet.height, bullet.width - 2, 6);
                
                // Missile outline
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 1;
                ctx.strokeRect(bullet.x, bullet.y, bullet.width, bullet.height);
                break;
                
            default:
                // Standard bullets
                if (player.hasSpeed) {
                    // Speed-enhanced bullets - longer and brighter
                    ctx.fillStyle = '#00ff00';
                    ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height + 4);
                    
                    // Glow effect
                    ctx.strokeStyle = '#ffffff';
                    ctx.lineWidth = 1;
                    ctx.strokeRect(bullet.x, bullet.y, bullet.width, bullet.height + 4);
                } else {
                    // Standard bullets
                    ctx.fillStyle = '#ffff00';
                    ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
                    
                    // Bullet trail effect
                    ctx.fillStyle = 'rgba(255, 255, 0, 0.5)';
                    ctx.fillRect(bullet.x, bullet.y + bullet.height, bullet.width, 3);
                }
                break;
        }
        
        // Add sparkle effect
        if (Math.random() < 0.1) {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(bullet.x + Math.random() * bullet.width, bullet.y + Math.random() * bullet.height, 1, 1);
        }
    });
}

function drawEnemies() {
    enemies.forEach(enemy => {
        const centerX = enemy.x + enemy.width / 2;
        const centerY = enemy.y + enemy.height / 2;
        
        // Different designs based on enemy type
        switch(enemy.type) {
            case 'tank':
                // Tank enemy - large, heavily armored
                // Main body (rectangular)
                ctx.fillStyle = '#ff0000';
                ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
                
                // Armor plates
                ctx.fillStyle = '#cc0000';
                ctx.fillRect(enemy.x + 2, enemy.y + 2, enemy.width - 4, 6);
                ctx.fillRect(enemy.x + 2, enemy.y + enemy.height - 8, enemy.width - 4, 6);
                
                // Cockpit
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(enemy.x + 8, enemy.y + 8, 8, 8);
                
                // Weapon turrets
                ctx.fillStyle = '#880000';
                ctx.fillRect(enemy.x + 4, enemy.y + 4, 4, 4);
                ctx.fillRect(enemy.x + enemy.width - 8, enemy.y + 4, 4, 4);
                
                // Engine glow
                ctx.fillStyle = '#ff4444';
                ctx.fillRect(enemy.x + 6, enemy.y + enemy.height, 6, 4);
                ctx.fillRect(enemy.x + enemy.width - 12, enemy.y + enemy.height, 6, 4);
                break;
                
            case 'fast':
                // Fast enemy - sleek, aerodynamic
                // Main body (diamond shape)
                ctx.fillStyle = '#ff8800';
                ctx.beginPath();
                ctx.moveTo(centerX, enemy.y); // Top
                ctx.lineTo(enemy.x + enemy.width, centerY); // Right
                ctx.lineTo(centerX, enemy.y + enemy.height); // Bottom
                ctx.lineTo(enemy.x, centerY); // Left
                ctx.closePath();
                ctx.fill();
                
                // Outline
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 1;
                ctx.stroke();
                
                // Cockpit
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(enemy.x + 6, enemy.y + 6, 6, 6);
                
                // Engine trails
                ctx.fillStyle = '#ffaa00';
                ctx.fillRect(enemy.x + 4, enemy.y + enemy.height, 4, 6);
                ctx.fillRect(enemy.x + enemy.width - 8, enemy.y + enemy.height, 4, 6);
                break;
                
            default:
                // Basic enemy - standard design
                // Main body (triangular, pointing down)
                ctx.fillStyle = '#ff4444';
                ctx.beginPath();
                ctx.moveTo(centerX, enemy.y + enemy.height); // Bottom point
                ctx.lineTo(enemy.x, enemy.y); // Top left
                ctx.lineTo(enemy.x + enemy.width, enemy.y); // Top right
                ctx.closePath();
                ctx.fill();
                
                // Outline
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 1;
                ctx.stroke();
                
                // Cockpit
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(enemy.x + 8, enemy.y + 4, 6, 6);
                
                // Weapon ports
                ctx.fillStyle = '#cc0000';
                ctx.fillRect(enemy.x + 4, enemy.y + 2, 3, 3);
                ctx.fillRect(enemy.x + enemy.width - 7, enemy.y + 2, 3, 3);
                
                // Engine glow
                ctx.fillStyle = '#ff6666';
                ctx.fillRect(enemy.x + 6, enemy.y + enemy.height, 4, 3);
                ctx.fillRect(enemy.x + enemy.width - 10, enemy.y + enemy.height, 4, 3);
                break;
        }
    });
}

function drawPowerUps() {
    powerUps.forEach(powerUp => {
        // Update animation
        powerUp.rotation += 0.1;
        powerUp.pulse += 0.2;
        
        const centerX = powerUp.x + powerUp.width / 2;
        const centerY = powerUp.y + powerUp.height / 2;
        const pulse = Math.sin(powerUp.pulse) * 0.2 + 0.8;
        
        switch(powerUp.type) {
            case 'health':
                // Health power-up - cross symbol
                ctx.fillStyle = '#00ff00';
                ctx.fillRect(powerUp.x, powerUp.y, powerUp.width, powerUp.height);
                
                // Cross symbol
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(centerX - 1, powerUp.y + 4, 2, 8);
                ctx.fillRect(powerUp.x + 4, centerY - 1, 8, 2);
                
                // Glow effect
                ctx.strokeStyle = '#00ff00';
                ctx.lineWidth = 2;
                ctx.strokeRect(powerUp.x, powerUp.y, powerUp.width, powerUp.height);
                break;
                
            case 'weapon':
                // Weapon power-up - star symbol
                ctx.fillStyle = '#ff00ff';
                ctx.fillRect(powerUp.x, powerUp.y, powerUp.width, powerUp.height);
                
                // Star symbol
                ctx.fillStyle = '#ffffff';
                ctx.beginPath();
                ctx.moveTo(centerX, powerUp.y + 2);
                ctx.lineTo(centerX + 2, centerY);
                ctx.lineTo(centerX, powerUp.y + powerUp.height - 2);
                ctx.lineTo(centerX - 2, centerY);
                ctx.closePath();
                ctx.fill();
                
                // Glow effect
                ctx.strokeStyle = '#ff00ff';
                ctx.lineWidth = 2;
                ctx.strokeRect(powerUp.x, powerUp.y, powerUp.width, powerUp.height);
                break;
                
            case 'speed':
                // Speed power-up - lightning bolt
                ctx.fillStyle = '#00ffff';
                ctx.fillRect(powerUp.x, powerUp.y, powerUp.width, powerUp.height);
                
                // Lightning bolt
                ctx.fillStyle = '#ffffff';
                ctx.beginPath();
                ctx.moveTo(centerX - 2, powerUp.y + 2);
                ctx.lineTo(centerX + 1, centerY - 2);
                ctx.lineTo(centerX - 1, centerY);
                ctx.lineTo(centerX + 2, powerUp.y + powerUp.height - 2);
                ctx.closePath();
                ctx.fill();
                
                // Glow effect
                ctx.strokeStyle = '#00ffff';
                ctx.lineWidth = 2;
                ctx.strokeRect(powerUp.x, powerUp.y, powerUp.width, powerUp.height);
                break;
                
            case 'shield':
                // Shield power-up - shield symbol
                ctx.fillStyle = '#ffff00';
                ctx.fillRect(powerUp.x, powerUp.y, powerUp.width, powerUp.height);
                
                // Shield symbol
                ctx.fillStyle = '#ffffff';
                ctx.beginPath();
                ctx.moveTo(centerX, powerUp.y + 2);
                ctx.lineTo(powerUp.x + 2, centerY);
                ctx.lineTo(powerUp.x + 2, powerUp.y + powerUp.height - 2);
                ctx.lineTo(powerUp.x + powerUp.width - 2, powerUp.y + powerUp.height - 2);
                ctx.lineTo(powerUp.x + powerUp.width - 2, centerY);
                ctx.closePath();
                ctx.fill();
                
                // Glow effect
                ctx.strokeStyle = '#ffff00';
                ctx.lineWidth = 2;
                ctx.strokeRect(powerUp.x, powerUp.y, powerUp.width, powerUp.height);
                break;
                
            case 'rapidfire':
                // Rapid fire power-up - multiple dots
                ctx.fillStyle = '#ff8800';
                ctx.fillRect(powerUp.x, powerUp.y, powerUp.width, powerUp.height);
                
                // Multiple dots
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(centerX - 3, powerUp.y + 4, 2, 2);
                ctx.fillRect(centerX + 1, powerUp.y + 4, 2, 2);
                ctx.fillRect(centerX - 1, powerUp.y + 8, 2, 2);
                ctx.fillRect(centerX - 3, powerUp.y + 12, 2, 2);
                ctx.fillRect(centerX + 1, powerUp.y + 12, 2, 2);
                
                // Glow effect
                ctx.strokeStyle = '#ff8800';
                ctx.lineWidth = 2;
                ctx.strokeRect(powerUp.x, powerUp.y, powerUp.width, powerUp.height);
                break;
                
            case 'spread':
                // Spread power-up - fan symbol
                ctx.fillStyle = '#ff0088';
                ctx.fillRect(powerUp.x, powerUp.y, powerUp.width, powerUp.height);
                
                // Fan symbol
                ctx.fillStyle = '#ffffff';
                ctx.beginPath();
                ctx.moveTo(centerX, powerUp.y + 2);
                ctx.lineTo(powerUp.x + 2, powerUp.y + powerUp.height - 2);
                ctx.lineTo(powerUp.x + powerUp.width - 2, powerUp.y + powerUp.height - 2);
                ctx.closePath();
                ctx.fill();
                
                // Glow effect
                ctx.strokeStyle = '#ff0088';
                ctx.lineWidth = 2;
                ctx.strokeRect(powerUp.x, powerUp.y, powerUp.width, powerUp.height);
                break;
                
            case 'laser':
                // Laser power-up - beam symbol
                ctx.fillStyle = '#0088ff';
                ctx.fillRect(powerUp.x, powerUp.y, powerUp.width, powerUp.height);
                
                // Beam symbol
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(centerX - 1, powerUp.y + 2, 2, powerUp.height - 4);
                
                // Glow effect
                ctx.strokeStyle = '#0088ff';
                ctx.lineWidth = 2;
                ctx.strokeRect(powerUp.x, powerUp.y, powerUp.width, powerUp.height);
                break;
                
            case 'missile':
                // Missile power-up - rocket symbol
                ctx.fillStyle = '#ff4444';
                ctx.fillRect(powerUp.x, powerUp.y, powerUp.width, powerUp.height);
                
                // Rocket symbol
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(centerX - 2, powerUp.y + 2, 4, 8);
                ctx.fillRect(centerX - 1, powerUp.y + 10, 2, 6);
                
                // Glow effect
                ctx.strokeStyle = '#ff4444';
                ctx.lineWidth = 2;
                ctx.strokeRect(powerUp.x, powerUp.y, powerUp.width, powerUp.height);
                break;
                
            default:
                // Default power-up
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(powerUp.x, powerUp.y, powerUp.width, powerUp.height);
                break;
        }
        
        // Add pulsing animation
        ctx.globalAlpha = pulse;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.strokeRect(powerUp.x - 1, powerUp.y - 1, powerUp.width + 2, powerUp.height + 2);
        ctx.globalAlpha = 1;
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
    
    // Draw weapon status on canvas
    ctx.fillStyle = '#ffffff';
    ctx.font = '14px Arial';
    ctx.fillText(`Weapon: ${player.weaponType.toUpperCase()}`, canvas.width - 150, 30);
    
    // Draw power-up status
    if (player.hasSpeed) {
        ctx.fillStyle = '#00ffff';
        ctx.fillText('SPEED BOOST', canvas.width - 150, 50);
    }
    if (player.hasShield) {
        ctx.fillStyle = '#ffff00';
        ctx.fillText('SHIELD ACTIVE', canvas.width - 150, 70);
    }
    
    // Draw controls hint
    ctx.fillStyle = '#888888';
    ctx.font = '12px Arial';
    ctx.fillText('1-5: Switch Weapons', 10, canvas.height - 40);
    ctx.fillText('Hold SPACE: Rapid Fire', 10, canvas.height - 20);
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
        
        // Hide start screen and show game
        document.getElementById('startScreen').classList.add('hidden');
        
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

// Debug: Check if game object is created
console.log('🎮 Game object created:', window.game);
console.log('🎮 startGame function available:', typeof window.game.startGame);

// Initialize when page loads
window.addEventListener('load', () => {
    console.log('✅ Enhanced game loaded and ready!');
    console.log('🎮 Click "Start Game" to begin!');
    console.log('🎮 Game object available:', window.game);
    
    // Load high score
    if (typeof GameStorageManager !== 'undefined') {
        const storage = new GameStorageManager();
        const highScores = storage.getHighScores();
        const topScore = highScores.length > 0 ? highScores[0].score : 0;
        document.getElementById('topScoreDisplay').textContent = topScore;
    }
});