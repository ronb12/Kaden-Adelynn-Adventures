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

// Responsive canvas resize for mobile/iOS
function resizeGameCanvas() {
    const dpr = window.devicePixelRatio || 1;
    // Maintain a fixed aspect ratio (4:3)
    const aspectRatio = 4 / 3;
    let width = window.innerWidth;
    let height = window.innerHeight;
    if (width / height > aspectRatio) {
        // Window is too wide, pillarbox
        width = height * aspectRatio;
    } else {
        // Window is too tall, letterbox
        height = width / aspectRatio;
    }
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transform
    ctx.scale(dpr, dpr);
    // Clamp player position after resize
    if (typeof player !== 'undefined') {
        player.x = Math.max(0, Math.min(canvas.width - player.width, player.x));
        player.y = Math.max(0, Math.min(canvas.height - player.height, player.y));
        player.isAlive = true;
    }
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
    weaponType: 'normal', // normal, rapid, spread, laser, missile, multishot, bomb, plasma, freeze, chain, vortex, nova, quantum, thunder
    hasSpeed: false,
    hasShield: false,
    rapidFireTimer: 0,
    weaponLevel: 1,
    maxWeaponLevel: 3,
    weaponMultiplier: 1, // 1x to 4x multiplier
    maxWeaponMultiplier: 4
};

let bullets = [];
let enemyBullets = [];
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
    KeyR: false,
    KeyRPressed: false,
    Digit1: false,
    Digit2: false,
    Digit3: false,
    Digit4: false,
    Digit5: false
};

// Game settings
const BULLET_SPEED = 10;
const ENEMY_SPEED = 2; // Constant speed
const POWERUP_SPEED = 1;
const STAR_SPEED = 1;
let MAX_ENEMIES = 20;
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
        
        // Apply weapon multiplier
        const multiplier = player.weaponMultiplier;
        
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
                
            case 'multishot':
                // Multi-shot - 5 bullets in a spread pattern
                const multishotAngles = [-20, -10, 0, 10, 20];
                multishotAngles.forEach(angle => {
                    const rad = angle * Math.PI / 180;
                    bulletsToCreate.push({
                        x: player.x + player.width / 2 - 2,
                        y: player.y,
                        width: 4,
                        height: 8,
                        speed: bulletSpeed,
                        damage: 1,
                        type: 'multishot',
                        angle: rad,
                        vx: Math.sin(rad) * bulletSpeed * 0.4
                    });
                });
                break;
                
            case 'bomb':
                // Bomb - explosive projectile
                bulletsToCreate.push({
                    x: player.x + player.width / 2 - 4,
                    y: player.y,
                    width: 8,
                    height: 12,
                    speed: bulletSpeed * 0.7,
                    damage: 5,
                    type: 'bomb',
                    explosive: true
                });
                break;
                
            case 'plasma':
                // Plasma - energy ball
                bulletsToCreate.push({
                    x: player.x + player.width / 2 - 3,
                    y: player.y,
                    width: 6,
                    height: 6,
                    speed: bulletSpeed * 1.3,
                    damage: 4,
                    type: 'plasma',
                    energy: true
                });
                break;
                
            case 'freeze':
                // Freeze - ice projectile
                bulletsToCreate.push({
                    x: player.x + player.width / 2 - 2,
                    y: player.y,
                    width: 4,
                    height: 10,
                    speed: bulletSpeed * 0.9,
                    damage: 2,
                    type: 'freeze',
                    ice: true
                });
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
                
            case 'chain':
                // Chain lightning - electric projectile
                bulletsToCreate.push({
                    x: player.x + player.width / 2 - 2,
                    y: player.y,
                    width: 4,
                    height: 12,
                    speed: bulletSpeed * 1.2,
                    damage: 3,
                    type: 'chain',
                    electric: true
                });
                break;
                
            case 'vortex':
                // Vortex - spinning projectile
                bulletsToCreate.push({
                    x: player.x + player.width / 2 - 3,
                    y: player.y,
                    width: 6,
                    height: 6,
                    speed: bulletSpeed * 0.9,
                    damage: 4,
                    type: 'vortex',
                    spinning: true
                });
                break;
                
            case 'nova':
                // Nova - explosive burst
                bulletsToCreate.push({
                    x: player.x + player.width / 2 - 4,
                    y: player.y,
                    width: 8,
                    height: 8,
                    speed: bulletSpeed * 0.6,
                    damage: 6,
                    type: 'nova',
                    explosive: true
                });
                break;
                
            case 'quantum':
                // Quantum - teleporting projectile
                bulletsToCreate.push({
                    x: player.x + player.width / 2 - 2,
                    y: player.y,
                    width: 4,
                    height: 10,
                    speed: bulletSpeed * 1.4,
                    damage: 5,
                    type: 'quantum',
                    teleport: true
                });
                break;
                
            case 'thunder':
                // Thunder - lightning bolt
                bulletsToCreate.push({
                    x: player.x + player.width / 2 - 1,
                    y: player.y,
                    width: 2,
                    height: 16,
                    speed: bulletSpeed * 1.6,
                    damage: 4,
                    type: 'thunder',
                    lightning: true
                });
                break;
                
            case 'rocket':
                // Rocket - powerful explosive projectile
                bulletsToCreate.push({
                    x: player.x + player.width / 2 - 4,
                    y: player.y,
                    width: 8,
                    height: 16,
                    speed: bulletSpeed * 0.6,
                    damage: 8,
                    type: 'rocket',
                    explosive: true,
                    rocket: true
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
        
        // Apply weapon multiplier - create multiple bullets based on multiplier
        for (let m = 0; m < multiplier; m++) {
            bulletsToCreate.forEach(bullet => {
                if (bullets.length < MAX_BULLETS) {
                    // Create a copy of the bullet with slight position offset
                    const newBullet = {...bullet};
                    if (multiplier > 1) {
                        newBullet.x += (m - (multiplier - 1) / 2) * 3; // Spread bullets horizontally
                    }
                    bullets.push(newBullet);
                }
            });
        }
        
        window.gameState.shotsFired++;
        playShootSound();
    }
}

// Create enemy
function createEnemy() {
    // Increase max enemies as level increases
    MAX_ENEMIES = 20 + Math.floor((window.gameState.level - 1) * 2);
    const spawnRate = 0.02 + (window.gameState.level - 1) * 0.005;
    if (Math.random() < spawnRate && enemies.length < MAX_ENEMIES) {
        const enemyTypes = ['basic', 'fast', 'tank', 'scout', 'destroyer'];
        const type = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
        
        let enemy = {
            x: Math.random() * (canvas.width - 30),
            y: -30,
            width: 30,
            height: 30,
            speed: ENEMY_SPEED + Math.random() * 2, // No level scaling
            type: type,
            health: type === 'tank' ? 4 : type === 'destroyer' ? 3 : type === 'scout' ? 1 : 2,
            animation: 0,
            engineGlow: Math.random() * Math.PI * 2,
            shootTimer: 0,
            shootInterval: type === 'tank' ? 90 : type === 'fast' ? 45 : type === 'scout' ? 30 : type === 'destroyer' ? 70 : 60
        };
        
        // Adjust enemy properties based on type
        if (type === 'fast') {
            enemy.speed *= 1.8;
            enemy.width = 24;
            enemy.height = 24;
        } else if (type === 'tank') {
            enemy.speed *= 0.6;
            enemy.width = 45;
            enemy.height = 45;
        } else if (type === 'scout') {
            enemy.speed *= 2.2;
            enemy.width = 20;
            enemy.height = 20;
        } else if (type === 'destroyer') {
            enemy.speed *= 0.8;
            enemy.width = 35;
            enemy.height = 35;
        }
        
        enemies.push(enemy);
    }
}

// Create enemy bullet
function createEnemyBullet(enemy) {
    if (enemyBullets.length < MAX_BULLETS) {
        const bulletSpeed = 3 + Math.random() * 2;
        const bulletTypes = ['normal', 'laser', 'plasma'];
        const bulletType = bulletTypes[Math.floor(Math.random() * bulletTypes.length)];
        
        let bullet = {
            x: enemy.x + enemy.width / 2 - 2,
            y: enemy.y + enemy.height,
            width: 4,
            height: 8,
            speed: bulletSpeed,
            damage: 1,
            type: bulletType,
            enemyType: enemy.type
        };
        
        // Adjust bullet properties based on enemy type
        switch(enemy.type) {
            case 'tank':
                bullet.width = 6;
                bullet.height = 10;
                bullet.damage = 2;
                bullet.speed = bulletSpeed * 0.8;
                break;
            case 'fast':
                bullet.width = 3;
                bullet.height = 6;
                bullet.damage = 1;
                bullet.speed = bulletSpeed * 1.5;
                break;
            case 'scout':
                bullet.width = 2;
                bullet.height = 4;
                bullet.damage = 1;
                bullet.speed = bulletSpeed * 2;
                break;
            case 'destroyer':
                bullet.width = 5;
                bullet.height = 9;
                bullet.damage = 2;
                bullet.speed = bulletSpeed * 0.9;
                break;
        }
        
        enemyBullets.push(bullet);
    }
}

// Create power-up
function createPowerUp() {
    // Increase power-up spawn rate as level increases
    const baseRate = 0.002;
    const spawnRate = baseRate + (window.gameState.level - 1) * 0.0008;
    if (Math.random() < spawnRate) {
        const powerUpTypes = [
            'health', 'weapon', 'speed', 'shield', 'rapidfire', 'spread', 'laser', 'missile', 
            'money', 'money', 'money', 'money', // More money
            'multishot', 'multishot', // Multiple shots
            'bomb', 'bomb', // Bomb weapon
            'plasma', 'plasma', // Plasma weapon
            'freeze', 'freeze', // Freeze weapon
            'chain', 'chain', // Chain lightning weapon
            'vortex', 'vortex', // Vortex weapon
            'nova', 'nova', // Nova explosion weapon
            'quantum', 'quantum', // Quantum weapon
            'thunder', 'thunder', // Thunder weapon
            'rocket', 'rocket', 'rocket', // Rocket weapon (appears more often)
            'multiplier', 'multiplier', 'multiplier' // Weapon multiplier (appears more often)
        ];
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
    
    // Rocket firing
    if (keys.KeyR && !keys.KeyRPressed && !window.gameState.paused) {
        // Fire rocket
        const originalWeapon = player.weaponType;
        player.weaponType = 'rocket';
        createBullet();
        player.weaponType = originalWeapon;
        keys.KeyRPressed = true;
    } else if (!keys.KeyR) {
        keys.KeyRPressed = false;
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
    
    // Clamp player position to keep on screen (especially after input)
    player.x = Math.max(0, Math.min(canvas.width - player.width, player.x));
    player.y = Math.max(0, Math.min(canvas.height - player.height, player.y));
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
        enemies[i].animation += 0.1;
        enemies[i].engineGlow += 0.2;
        
        // Enemy shooting logic
        enemies[i].shootTimer++;
        if (enemies[i].shootTimer >= enemies[i].shootInterval && enemies[i].y > 50) {
            createEnemyBullet(enemies[i]);
            enemies[i].shootTimer = 0;
        }
        
        if (enemies[i].y > canvas.height) {
            enemies.splice(i, 1);
        }
    }
}

// Update enemy bullets
function updateEnemyBullets() {
    for (let i = enemyBullets.length - 1; i >= 0; i--) {
        enemyBullets[i].y += enemyBullets[i].speed;
        if (enemyBullets[i].y > canvas.height) {
            enemyBullets.splice(i, 1);
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
                
                // Special rocket explosion effect
                if (bullets[i].type === 'rocket') {
                    // Create multiple explosion particles for rockets
                    for (let p = 0; p < 8; p++) {
                        createParticle(enemies[j].x + enemies[j].width/2, enemies[j].y + enemies[j].height/2, '#ff6600');
                    }
                    
                    // Rocket explosion damages nearby enemies
                    enemies.forEach((enemy, k) => {
                        if (k !== j) {
                            const distance = Math.sqrt(
                                Math.pow(enemies[j].x - enemy.x, 2) + 
                                Math.pow(enemies[j].y - enemy.y, 2)
                            );
                            if (distance < 60) { // Explosion radius
                                enemy.health -= 3; // Splash damage
                                createParticle(enemy.x + enemy.width/2, enemy.y + enemy.height/2, '#ff8800');
                            }
                        }
                    });
                }
                
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
    
    // Enemy Bullets vs Player
    if (!player.invulnerable && !player.hasShield) {
        for (let i = enemyBullets.length - 1; i >= 0; i--) {
            if (enemyBullets[i] &&
                player.x < enemyBullets[i].x + enemyBullets[i].width &&
                player.x + player.width > enemyBullets[i].x &&
                player.y < enemyBullets[i].y + enemyBullets[i].height &&
                player.y + player.height > enemyBullets[i].y) {
                
                // Create hit particles
                createParticle(enemyBullets[i].x + enemyBullets[i].width/2, enemyBullets[i].y + enemyBullets[i].height/2, '#ff0000');
                
                // Remove enemy bullet
                enemyBullets.splice(i, 1);
                
                // Damage player
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
            window.gameState.score += 25;
            break;
        case 'laser':
            player.weaponType = 'laser';
            window.gameState.score += 25;
            break;
        case 'missile':
            player.weaponType = 'missile';
            window.gameState.score += 25;
            break;
        case 'multishot':
            player.weaponType = 'multishot';
            window.gameState.score += 25;
            break;
        case 'bomb':
            player.weaponType = 'bomb';
            window.gameState.score += 25;
            break;
        case 'plasma':
            player.weaponType = 'plasma';
            window.gameState.score += 25;
            break;
        case 'freeze':
            player.weaponType = 'freeze';
            window.gameState.score += 25;
            break;
        case 'chain':
            player.weaponType = 'chain';
            window.gameState.score += 25;
            break;
        case 'vortex':
            player.weaponType = 'vortex';
            window.gameState.score += 25;
            break;
        case 'nova':
            player.weaponType = 'nova';
            window.gameState.score += 25;
            break;
        case 'quantum':
            player.weaponType = 'quantum';
            window.gameState.score += 25;
            break;
        case 'thunder':
            player.weaponType = 'thunder';
            window.gameState.score += 25;
            break;
        case 'rocket':
            player.weaponType = 'rocket';
            window.gameState.score += 25;
            break;
        case 'multiplier':
            // Increase weapon multiplier (up to 4x)
            if (player.weaponMultiplier < player.maxWeaponMultiplier) {
                player.weaponMultiplier++;
                window.gameState.score += 100;
            } else {
                // If already at max, give bonus points
                window.gameState.score += 200;
            }
            break;
        case 'money':
            window.gameState.money += 10 + Math.floor(Math.random() * 20); // 10-30 money
            window.gameState.score += 25;
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
    
    // Show game over screen
    document.getElementById('gameOverScreen').classList.remove('hidden');
    document.getElementById('startScreen').classList.add('hidden');
    
    // Update final stats
    document.getElementById('finalScore').textContent = window.gameState.score;
    document.getElementById('finalMoney').textContent = window.gameState.money;
    document.getElementById('finalEnemiesKilled').textContent = window.gameState.enemiesKilled;
    
    // Show leaderboard
    updateLeaderboard();
    
    // Set up Save Score button
    const saveBtn = document.getElementById('saveScoreBtn');
    saveBtn.disabled = false;
    saveBtn.textContent = 'Save Score';
    saveBtn.onclick = function() {
        const name = document.getElementById('playerName').value.trim() || 'Player';
        if (typeof GameStorageManager !== 'undefined') {
            const storage = new GameStorageManager();
            storage.saveHighScore(window.gameState.score, name);
            updateLeaderboard();
            saveBtn.disabled = true;
            saveBtn.textContent = 'Saved!';
        }
    };
    
    // Optionally, auto-focus the name input
    setTimeout(() => {
        document.getElementById('playerName').focus();
    }, 300);
    
    const accuracy = window.gameState.shotsFired > 0 ? 
        Math.round((window.gameState.shotsHit / window.gameState.shotsFired) * 100) : 0;
    
    console.log(`Game Over! Final Score: ${window.gameState.score}, Accuracy: ${accuracy}%, Enemies Killed: ${window.gameState.enemiesKilled}`);
}

function updateLeaderboard() {
    const list = document.getElementById('topScoresList');
    list.innerHTML = '';
    if (typeof GameStorageManager !== 'undefined') {
        const storage = new GameStorageManager();
        const highScores = storage.getHighScores();
        highScores.slice(0, 5).forEach((entry, i) => {
            const li = document.createElement('li');
            li.textContent = `${entry.name || 'Player'} — ${entry.score}`;
            list.appendChild(li);
        });
    }
}

// Reset game
function resetGame() {
    window.gameState.score = 0;
    window.gameState.lives = 10;
    window.gameState.level = 1;
    window.gameState.money = 0;
    window.gameState.paused = false;
    window.gameState.enemiesKilled = 0;
    window.gameState.bossesKilled = 0;
    window.gameState.powerUpsCollected = 0;
    window.gameState.shotsFired = 0;
    window.gameState.shotsHit = 0;
    bullets = [];
    enemyBullets = [];
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
    player.weaponMultiplier = 1;
    // Clamp position
    player.x = Math.max(0, Math.min(canvas.width - player.width, player.x));
    player.y = Math.max(0, Math.min(canvas.height - player.height, player.y));
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

// Preload the sci-fi PNG player ship sprite
let playerShipImg = new window.Image();
playerShipImg.src = 'assets/images/player_ship_sci_fi.png';
let playerShipLoaded = false;
playerShipImg.onload = () => { playerShipLoaded = true; };

function drawPlayer() {
    if (!player.isAlive) return;
    const centerX = player.x + player.width / 2;
    const baseY = player.y + player.height;
    ctx.save();
    if (playerShipLoaded) {
        ctx.drawImage(playerShipImg, player.x, player.y, player.width, player.height);
    } else {
        // Fallback: draw triangle
        ctx.fillStyle = player.hasSpeed ? '#00ff00' : '#4a90e2';
        ctx.beginPath();
        ctx.moveTo(centerX, player.y); // Nose
        ctx.lineTo(player.x + player.width * 0.15, baseY); // Left wing
        ctx.lineTo(player.x + player.width * 0.85, baseY); // Right wing
        ctx.closePath();
        ctx.shadowColor = ctx.fillStyle;
        ctx.shadowBlur = 12;
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();
    }
    ctx.restore();
    // --- Visual feedbacks (shield, invincibility, magnet) ---
    if (player.hasShield) {
        ctx.save();
        ctx.strokeStyle = '#00ffff';
        ctx.lineWidth = 3;
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        ctx.arc(centerX, player.y + player.height / 2, player.width * 0.65, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
    }
    if (player.isInvincible) {
        ctx.save();
        ctx.globalAlpha = 0.3;
        ctx.beginPath();
        ctx.arc(centerX, player.y + player.height / 2, player.width, 0, Math.PI * 2);
        ctx.fillStyle = '#ffff44';
        ctx.fill();
        ctx.restore();
    }
    if (player.hasMagnet) {
        ctx.save();
        ctx.globalAlpha = 0.2;
        ctx.beginPath();
        ctx.arc(centerX, player.y + player.height / 2, player.width * 1.3, 0, Math.PI * 2);
        ctx.fillStyle = '#44ffff';
        ctx.fill();
        ctx.restore();
    }
}

function drawEnemyBullets() {
    enemyBullets.forEach(bullet => {
        // Different bullet designs based on enemy type
        switch(bullet.enemyType) {
            case 'tank':
                // Heavy red bullets
                ctx.fillStyle = '#ff0000';
                ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
                
                // Glow effect
                ctx.strokeStyle = '#ff6666';
                ctx.lineWidth = 2;
                ctx.strokeRect(bullet.x - 1, bullet.y - 1, bullet.width + 2, bullet.height + 2);
                break;
                
            case 'fast':
                // Fast orange bullets
                ctx.fillStyle = '#ff8800';
                ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
                
                // Trail effect
                ctx.fillStyle = 'rgba(255, 136, 0, 0.5)';
                ctx.fillRect(bullet.x, bullet.y - 4, bullet.width, 4);
                break;
                
            case 'scout':
                // Small purple bullets
                ctx.fillStyle = '#9932CC';
                ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
                
                // Stealth effect
                ctx.globalAlpha = 0.7;
                ctx.strokeStyle = '#C0C0C0';
                ctx.lineWidth = 1;
                ctx.strokeRect(bullet.x, bullet.y, bullet.width, bullet.height);
                ctx.globalAlpha = 1;
                break;
                
            case 'destroyer':
                // Medium blue bullets
                ctx.fillStyle = '#0088ff';
                ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
                
                // Energy field
                ctx.strokeStyle = '#00ffff';
                ctx.lineWidth = 2;
                ctx.strokeRect(bullet.x - 1, bullet.y - 1, bullet.width + 2, bullet.height + 2);
                break;
                
            default:
                // Basic red bullets
                ctx.fillStyle = '#ff4444';
                ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
                break;
        }
    });
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
                
            case 'multishot':
                // Multi-shot bullets - purple with trail
                ctx.fillStyle = '#ff0088';
                ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
                
                // Trail effect
                ctx.fillStyle = 'rgba(255, 0, 136, 0.6)';
                ctx.fillRect(bullet.x, bullet.y + bullet.height, bullet.width, 4);
                break;
                
            case 'bomb':
                // Bomb - dark explosive projectile
                ctx.fillStyle = '#8B4513';
                ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
                
                // Explosive glow
                ctx.strokeStyle = '#ff6600';
                ctx.lineWidth = 3;
                ctx.strokeRect(bullet.x - 1, bullet.y - 1, bullet.width + 2, bullet.height + 2);
                break;
                
            case 'plasma':
                // Plasma - bright energy ball
                ctx.fillStyle = '#00ffff';
                ctx.beginPath();
                ctx.arc(bullet.x + bullet.width/2, bullet.y + bullet.height/2, bullet.width/2, 0, Math.PI * 2);
                ctx.fill();
                
                // Energy field
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 2;
                ctx.stroke();
                break;
                
            case 'freeze':
                // Freeze - ice projectile
                ctx.fillStyle = '#87ceeb';
                ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
                
                // Ice crystals
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(bullet.x + 1, bullet.y + 2, 2, 2);
                ctx.fillRect(bullet.x + bullet.width - 3, bullet.y + bullet.height - 4, 2, 2);
                break;
                
            case 'chain':
                // Chain lightning - electric projectile
                ctx.fillStyle = '#ffff00';
                ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
                
                // Electric sparks
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(bullet.x + 1, bullet.y + 1, 2, 2);
                ctx.fillRect(bullet.x + bullet.width - 3, bullet.y + bullet.height - 3, 2, 2);
                break;
                
            case 'vortex':
                // Vortex - spinning projectile
                ctx.fillStyle = '#8b4513';
                ctx.beginPath();
                ctx.arc(bullet.x + bullet.width/2, bullet.y + bullet.height/2, bullet.width/2, 0, Math.PI * 2);
                ctx.fill();
                
                // Spinning effect
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 1;
                ctx.stroke();
                break;
                
            case 'nova':
                // Nova - explosive burst
                ctx.fillStyle = '#ff6600';
                ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
                
                // Explosive glow
                ctx.strokeStyle = '#ffff00';
                ctx.lineWidth = 3;
                ctx.strokeRect(bullet.x - 1, bullet.y - 1, bullet.width + 2, bullet.height + 2);
                break;
                
            case 'quantum':
                // Quantum - teleporting projectile
                ctx.fillStyle = '#9932cc';
                ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
                
                // Quantum effect
                ctx.globalAlpha = 0.7;
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 2;
                ctx.strokeRect(bullet.x - 1, bullet.y - 1, bullet.width + 2, bullet.height + 2);
                ctx.globalAlpha = 1;
                break;
                
            case 'thunder':
                // Thunder - lightning bolt
                ctx.fillStyle = '#ffd700';
                ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
                
                // Lightning effect
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 2;
                ctx.strokeRect(bullet.x - 1, bullet.y, bullet.width + 2, bullet.height);
                break;
                
            case 'rocket':
                // Rocket - powerful explosive projectile
                ctx.fillStyle = '#ff4444';
                ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
                
                // Rocket body details
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(bullet.x + 2, bullet.y + 2, 4, 4);
                ctx.fillRect(bullet.x + 2, bullet.y + bullet.height - 6, 4, 4);
                
                // Rocket trail
                ctx.fillStyle = 'rgba(255, 100, 0, 0.8)';
                ctx.fillRect(bullet.x + 1, bullet.y + bullet.height, bullet.width - 2, 8);
                
                // Explosive glow
                ctx.strokeStyle = '#ff6600';
                ctx.lineWidth = 3;
                ctx.strokeRect(bullet.x - 1, bullet.y - 1, bullet.width + 2, bullet.height + 2);
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
                // Tank enemy - Advanced Dreadnought with energy shields
                // Energy shield field
                ctx.globalAlpha = 0.3;
                ctx.fillStyle = '#00FFFF';
                ctx.beginPath();
                ctx.arc(centerX, centerY, enemy.width * 0.6, 0, Math.PI * 2);
                ctx.fill();
                ctx.globalAlpha = 1;
                
                // Main body (octagonal armored core)
                ctx.fillStyle = '#1a1a2e';
                ctx.beginPath();
                ctx.moveTo(enemy.x + 6, enemy.y);
                ctx.lineTo(enemy.x + enemy.width - 6, enemy.y);
                ctx.lineTo(enemy.x + enemy.width, enemy.y + 4);
                ctx.lineTo(enemy.x + enemy.width, enemy.y + enemy.height - 4);
                ctx.lineTo(enemy.x + enemy.width - 6, enemy.y + enemy.height);
                ctx.lineTo(enemy.x + 6, enemy.y + enemy.height);
                ctx.lineTo(enemy.x, enemy.y + enemy.height - 4);
                ctx.lineTo(enemy.x, enemy.y + 4);
                ctx.closePath();
                ctx.fill();
                
                // Reinforced armor plating with energy conduits
                ctx.fillStyle = '#16213e';
                ctx.fillRect(enemy.x + 3, enemy.y + 3, enemy.width - 6, 5);
                ctx.fillRect(enemy.x + 3, enemy.y + enemy.height - 8, enemy.width - 6, 5);
                ctx.fillRect(enemy.x + 3, enemy.y + 8, 5, enemy.height - 16);
                ctx.fillRect(enemy.x + enemy.width - 8, enemy.y + 8, 5, enemy.height - 16);
                
                // Energy conduits (pulsing)
                const pulse1 = Math.sin(Date.now() * 0.008) * 0.4 + 0.6;
                ctx.fillStyle = `rgba(0, 255, 255, ${pulse1})`;
                ctx.fillRect(enemy.x + 8, enemy.y + 5, enemy.width - 16, 2);
                ctx.fillRect(enemy.x + 8, enemy.y + enemy.height - 7, enemy.width - 16, 2);
                ctx.fillRect(enemy.x + 5, enemy.y + 10, 2, enemy.height - 20);
                ctx.fillRect(enemy.x + enemy.width - 7, enemy.y + 10, 2, enemy.height - 20);
                
                // Central command nexus
                ctx.fillStyle = '#FFD700';
                ctx.beginPath();
                ctx.arc(centerX, centerY, 6, 0, Math.PI * 2);
                ctx.fill();
                
                // Holographic display ring
                ctx.strokeStyle = '#00FFFF';
                ctx.lineWidth = 2;
                ctx.globalAlpha = 0.7;
                ctx.beginPath();
                ctx.arc(centerX, centerY, 8, 0, Math.PI * 2);
                ctx.stroke();
                ctx.globalAlpha = 1;
                
                // Heavy weapon platforms (rotating)
                const rotation = Date.now() * 0.005;
                ctx.save();
                ctx.translate(enemy.x + 8, enemy.y + 8);
                ctx.rotate(rotation);
                ctx.fillStyle = '#DC143C';
                ctx.fillRect(-3, -3, 6, 6);
                ctx.restore();
                
                ctx.save();
                ctx.translate(enemy.x + enemy.width - 8, enemy.y + 8);
                ctx.rotate(-rotation);
                ctx.fillStyle = '#DC143C';
                ctx.fillRect(-3, -3, 6, 6);
                ctx.restore();
                
                // Quantum engine clusters
                ctx.fillStyle = '#FF4500';
                ctx.beginPath();
                ctx.arc(enemy.x + 8, enemy.y + enemy.height, 4, 0, Math.PI * 2);
                ctx.arc(enemy.x + enemy.width - 8, enemy.y + enemy.height, 4, 0, Math.PI * 2);
                ctx.fill();
                
                // Plasma exhaust trails
                const pulse2 = Math.sin(Date.now() * 0.01) * 0.5 + 0.5;
                ctx.fillStyle = `rgba(255, 69, 0, ${pulse2})`;
                ctx.globalAlpha = 0.8;
                ctx.fillRect(enemy.x + 4, enemy.y + enemy.height + 4, 8, 8);
                ctx.fillRect(enemy.x + enemy.width - 12, enemy.y + enemy.height + 4, 8, 8);
                ctx.globalAlpha = 1;
                
                // Shield matrix nodes
                ctx.fillStyle = '#00FFFF';
                ctx.globalAlpha = 0.6;
                ctx.fillRect(enemy.x + 2, enemy.y + 2, 3, 3);
                ctx.fillRect(enemy.x + enemy.width - 5, enemy.y + 2, 3, 3);
                ctx.fillRect(enemy.x + 2, enemy.y + enemy.height - 5, 3, 3);
                ctx.fillRect(enemy.x + enemy.width - 5, enemy.y + enemy.height - 5, 3, 3);
                ctx.globalAlpha = 1;
                break;
                
            case 'fast':
                // Fast enemy - sleek interceptor
                // Main body (arrow shape)
                ctx.fillStyle = '#FF8C00';
                ctx.beginPath();
                ctx.moveTo(centerX, enemy.y); // Nose
                ctx.lineTo(enemy.x + enemy.width - 2, enemy.y + 4); // Right wing
                ctx.lineTo(enemy.x + enemy.width - 4, enemy.y + enemy.height - 4); // Right body
                ctx.lineTo(centerX, enemy.y + enemy.height); // Tail
                ctx.lineTo(enemy.x + 4, enemy.y + enemy.height - 4); // Left body
                ctx.lineTo(enemy.x + 2, enemy.y + 4); // Left wing
                ctx.closePath();
                ctx.fill();
                
                // Wing details
                ctx.fillStyle = '#FFA500';
                ctx.fillRect(enemy.x + 2, enemy.y + 4, 4, 8);
                ctx.fillRect(enemy.x + enemy.width - 6, enemy.y + 4, 4, 8);
                
                // Cockpit with glass effect
                ctx.fillStyle = '#87CEEB';
                ctx.fillRect(enemy.x + 6, enemy.y + 6, 6, 4);
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(enemy.x + 7, enemy.y + 7, 4, 2);
                
                // Engine trails with particle effect
                ctx.fillStyle = '#FFD700';
                ctx.fillRect(enemy.x + 3, enemy.y + enemy.height, 4, 8);
                ctx.fillRect(enemy.x + enemy.width - 7, enemy.y + enemy.height, 4, 8);
                
                // Glow effect
                ctx.fillStyle = '#FFA500';
                ctx.globalAlpha = 0.7;
                ctx.fillRect(enemy.x + 2, enemy.y + enemy.height + 8, 6, 4);
                ctx.fillRect(enemy.x + enemy.width - 8, enemy.y + enemy.height + 8, 6, 4);
                ctx.globalAlpha = 1;
                break;
                
            case 'scout':
                // Scout enemy - tiny, ultra-fast stealth fighter
                // Main body (small diamond shape)
                ctx.fillStyle = '#9932CC';
                ctx.beginPath();
                ctx.moveTo(centerX, enemy.y); // Top
                ctx.lineTo(enemy.x + enemy.width - 2, centerY); // Right
                ctx.lineTo(centerX, enemy.y + enemy.height); // Bottom
                ctx.lineTo(enemy.x + 2, centerY); // Left
                ctx.closePath();
                ctx.fill();
                
                // Stealth coating
                ctx.fillStyle = '#8A2BE2';
                ctx.fillRect(enemy.x + 3, enemy.y + 3, enemy.width - 6, 2);
                ctx.fillRect(enemy.x + 3, enemy.y + enemy.height - 5, enemy.width - 6, 2);
                
                // Mini cockpit
                ctx.fillStyle = '#00FFFF';
                ctx.fillRect(enemy.x + 6, enemy.y + 6, 4, 3);
                
                // Stealth engine trails
                ctx.fillStyle = '#9370DB';
                ctx.fillRect(enemy.x + 2, enemy.y + enemy.height, 3, 6);
                ctx.fillRect(enemy.x + enemy.width - 5, enemy.y + enemy.height, 3, 6);
                
                // Cloaking effect
                ctx.globalAlpha = 0.7;
                ctx.strokeStyle = '#C0C0C0';
                ctx.lineWidth = 1;
                ctx.strokeRect(enemy.x - 1, enemy.y - 1, enemy.width + 2, enemy.height + 2);
                ctx.globalAlpha = 1;
                break;
                
            case 'destroyer':
                // Destroyer enemy - Advanced Battlecruiser with stealth tech
                // Cloaking field effect
                const cloakPulse = Math.sin(Date.now() * 0.006) * 0.3 + 0.7;
                ctx.globalAlpha = 0.2 * cloakPulse;
                ctx.fillStyle = '#4B0082';
                ctx.beginPath();
                ctx.ellipse(centerX, centerY, enemy.width * 0.7, enemy.height * 0.5, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.globalAlpha = 1;
                
                // Main body (diamond-shaped stealth hull)
                ctx.fillStyle = '#2F2F4F';
                ctx.beginPath();
                ctx.moveTo(centerX, enemy.y + 2); // Top point
                ctx.lineTo(enemy.x + enemy.width - 3, centerY); // Right point
                ctx.lineTo(centerX, enemy.y + enemy.height - 2); // Bottom point
                ctx.lineTo(enemy.x + 3, centerY); // Left point
                ctx.closePath();
                ctx.fill();
                
                // Stealth armor panels with energy patterns
                ctx.fillStyle = '#1a1a3a';
                ctx.fillRect(enemy.x + 6, enemy.y + 4, enemy.width - 12, 4);
                ctx.fillRect(enemy.x + 6, enemy.y + enemy.height - 8, enemy.width - 12, 4);
                ctx.fillRect(enemy.x + 4, enemy.y + 8, 4, enemy.height - 16);
                ctx.fillRect(enemy.x + enemy.width - 8, enemy.y + 8, 4, enemy.height - 16);
                
                // Neural network nodes (pulsing)
                const nodePulse = Math.sin(Date.now() * 0.01) * 0.5 + 0.5;
                ctx.fillStyle = `rgba(138, 43, 226, ${nodePulse})`;
                ctx.fillRect(enemy.x + 8, enemy.y + 6, 3, 3);
                ctx.fillRect(enemy.x + enemy.width - 11, enemy.y + 6, 3, 3);
                ctx.fillRect(enemy.x + 8, enemy.y + enemy.height - 9, 3, 3);
                ctx.fillRect(enemy.x + enemy.width - 11, enemy.y + enemy.height - 9, 3, 3);
                
                // Central AI core
                ctx.fillStyle = '#FFD700';
                ctx.beginPath();
                ctx.arc(centerX, centerY, 5, 0, Math.PI * 2);
                ctx.fill();
                
                // AI processing rings
                ctx.strokeStyle = '#9370DB';
                ctx.lineWidth = 1;
                ctx.globalAlpha = 0.8;
                ctx.beginPath();
                ctx.arc(centerX, centerY, 7, 0, Math.PI * 2);
                ctx.stroke();
                ctx.beginPath();
                ctx.arc(centerX, centerY, 9, 0, Math.PI * 2);
                ctx.stroke();
                ctx.globalAlpha = 1;
                
                // Adaptive weapon arrays (shape-shifting)
                const weaponPulse = Math.sin(Date.now() * 0.007) * 0.4 + 0.6;
                ctx.fillStyle = `rgba(220, 20, 60, ${weaponPulse})`;
                
                // Top weapons
                ctx.beginPath();
                ctx.moveTo(enemy.x + 4, enemy.y + 2);
                ctx.lineTo(enemy.x + 8, enemy.y + 6);
                ctx.lineTo(enemy.x + 4, enemy.y + 10);
                ctx.closePath();
                ctx.fill();
                
                ctx.beginPath();
                ctx.moveTo(enemy.x + enemy.width - 4, enemy.y + 2);
                ctx.lineTo(enemy.x + enemy.width - 8, enemy.y + 6);
                ctx.lineTo(enemy.x + enemy.width - 4, enemy.y + 10);
                ctx.closePath();
                ctx.fill();
                
                // Bottom weapons
                ctx.beginPath();
                ctx.moveTo(enemy.x + 4, enemy.y + enemy.height - 2);
                ctx.lineTo(enemy.x + 8, enemy.y + enemy.height - 6);
                ctx.lineTo(enemy.x + 4, enemy.y + enemy.height - 10);
                ctx.closePath();
                ctx.fill();
                
                ctx.beginPath();
                ctx.moveTo(enemy.x + enemy.width - 4, enemy.y + enemy.height - 2);
                ctx.lineTo(enemy.x + enemy.width - 8, enemy.y + enemy.height - 6);
                ctx.lineTo(enemy.x + enemy.width - 4, enemy.y + enemy.height - 10);
                ctx.closePath();
                ctx.fill();
                
                // Quantum drive engines
                ctx.fillStyle = '#FF4500';
                ctx.beginPath();
                ctx.arc(enemy.x + 6, enemy.y + enemy.height, 3, 0, Math.PI * 2);
                ctx.arc(enemy.x + enemy.width - 6, enemy.y + enemy.height, 3, 0, Math.PI * 2);
                ctx.fill();
                
                // Temporal distortion trails
                const timePulse = Math.sin(Date.now() * 0.012) * 0.6 + 0.4;
                ctx.fillStyle = `rgba(255, 69, 0, ${timePulse})`;
                ctx.globalAlpha = 0.7;
                ctx.fillRect(enemy.x + 3, enemy.y + enemy.height + 3, 6, 6);
                ctx.fillRect(enemy.x + enemy.width - 9, enemy.y + enemy.height + 3, 6, 6);
                ctx.globalAlpha = 1;
                
                // Stealth field emitters
                ctx.fillStyle = '#8A2BE2';
                ctx.globalAlpha = 0.5;
                ctx.fillRect(enemy.x + 2, enemy.y + 2, 2, 2);
                ctx.fillRect(enemy.x + enemy.width - 4, enemy.y + 2, 2, 2);
                ctx.fillRect(enemy.x + 2, enemy.y + enemy.height - 4, 2, 2);
                ctx.fillRect(enemy.x + enemy.width - 4, enemy.y + enemy.height - 4, 2, 2);
                ctx.globalAlpha = 1;
                break;
                
            default:
                // Basic enemy - classic fighter
                // Main body (improved triangular shape)
                ctx.fillStyle = '#DC143C';
                ctx.beginPath();
                ctx.moveTo(centerX, enemy.y + enemy.height); // Bottom point
                ctx.lineTo(enemy.x + 2, enemy.y + 2); // Top left
                ctx.lineTo(enemy.x + enemy.width - 2, enemy.y + 2); // Top right
                ctx.closePath();
                ctx.fill();
                
                // Body details
                ctx.fillStyle = '#B22222';
                ctx.fillRect(enemy.x + 4, enemy.y + 4, enemy.width - 8, 6);
                ctx.fillRect(enemy.x + 6, enemy.y + 10, enemy.width - 12, 4);
                
                // Cockpit with metallic look
                ctx.fillStyle = '#C0C0C0';
                ctx.fillRect(enemy.x + 8, enemy.y + 6, 6, 4);
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(enemy.x + 9, enemy.y + 7, 4, 2);
                
                // Weapon ports
                ctx.fillStyle = '#8B0000';
                ctx.fillRect(enemy.x + 3, enemy.y + 3, 4, 4);
                ctx.fillRect(enemy.x + enemy.width - 7, enemy.y + 3, 4, 4);
                
                // Engine glow with pulsing effect
                const pulse = Math.sin(Date.now() * 0.01) * 0.3 + 0.7;
                ctx.fillStyle = `rgba(255, 100, 100, ${pulse})`;
                ctx.fillRect(enemy.x + 5, enemy.y + enemy.height, 4, 5);
                ctx.fillRect(enemy.x + enemy.width - 9, enemy.y + enemy.height, 4, 5);
                
                // Glow trails
                ctx.fillStyle = '#FF6B6B';
                ctx.globalAlpha = 0.5;
                ctx.fillRect(enemy.x + 4, enemy.y + enemy.height + 5, 6, 3);
                ctx.fillRect(enemy.x + enemy.width - 10, enemy.y + enemy.height + 5, 6, 3);
                ctx.globalAlpha = 1;
                break;
        }
        
        // Add subtle outline for all enemies
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.3;
        ctx.stroke();
        ctx.globalAlpha = 1;
        
        // Add engine glow animation
        const glowIntensity = Math.sin(enemy.engineGlow) * 0.3 + 0.7;
        ctx.fillStyle = `rgba(255, 100, 100, ${glowIntensity * 0.5})`;
        ctx.fillRect(enemy.x + 4, enemy.y + enemy.height + 2, 6, 4);
        ctx.fillRect(enemy.x + enemy.width - 10, enemy.y + enemy.height + 2, 6, 4);
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
        
        // Create circular background for emoji effect
        ctx.fillStyle = '#000000';
        ctx.fillRect(powerUp.x, powerUp.y, powerUp.width, powerUp.height);
        
        // Add glow effect
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.globalAlpha = pulse;
        ctx.strokeRect(powerUp.x - 1, powerUp.y - 1, powerUp.width + 2, powerUp.height + 2);
        ctx.globalAlpha = 1;
        
        // Draw emoji-style power-ups
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        switch(powerUp.type) {
            case 'health':
                // Health power-up - heart emoji
                ctx.fillStyle = '#ff0000';
                ctx.fillText('❤️', centerX, centerY);
                break;
                
            case 'weapon':
                // Weapon power-up - star emoji
                ctx.fillStyle = '#ffff00';
                ctx.fillText('⭐', centerX, centerY);
                break;
                
            case 'speed':
                // Speed power-up - lightning emoji
                ctx.fillStyle = '#ffff00';
                ctx.fillText('⚡', centerX, centerY);
                break;
                
            case 'shield':
                // Shield power-up - shield emoji
                ctx.fillStyle = '#0000ff';
                ctx.fillText('🛡️', centerX, centerY);
                break;
                
            case 'rapidfire':
                // Rapid fire power-up - fire emoji
                ctx.fillStyle = '#ff6600';
                ctx.fillText('🔥', centerX, centerY);
                break;
                
            case 'spread':
                // Spread power-up - explosion emoji
                ctx.fillStyle = '#ff8800';
                ctx.fillText('💥', centerX, centerY);
                break;
                
            case 'laser':
                // Laser power-up - zap emoji
                ctx.fillStyle = '#00ffff';
                ctx.fillText('⚡', centerX, centerY);
                break;
                
            case 'missile':
                // Missile power-up - rocket emoji
                ctx.fillStyle = '#ff4444';
                ctx.fillText('🚀', centerX, centerY);
                break;
                
            case 'money':
                // Money power-up - coin emoji
                ctx.fillStyle = '#ffd700';
                ctx.fillText('💰', centerX, centerY);
                break;
                
            case 'multishot':
                // Multi-shot power-up - multiple arrows
                ctx.fillStyle = '#ff0088';
                ctx.fillText('🎯', centerX, centerY);
                break;
                
            case 'bomb':
                // Bomb power-up - bomb emoji
                ctx.fillStyle = '#ff6600';
                ctx.fillText('💣', centerX, centerY);
                break;
                
            case 'plasma':
                // Plasma power-up - energy emoji
                ctx.fillStyle = '#00ffff';
                ctx.fillText('⚡', centerX, centerY);
                break;
                
            case 'freeze':
                // Freeze power-up - ice emoji
                ctx.fillStyle = '#87ceeb';
                ctx.fillText('❄️', centerX, centerY);
                break;
                
            case 'chain':
                // Chain lightning power-up - lightning emoji
                ctx.fillStyle = '#ffff00';
                ctx.fillText('⚡', centerX, centerY);
                break;
                
            case 'vortex':
                // Vortex power-up - tornado emoji
                ctx.fillStyle = '#8b4513';
                ctx.fillText('🌪️', centerX, centerY);
                break;
                
            case 'nova':
                // Nova power-up - explosion emoji
                ctx.fillStyle = '#ff6600';
                ctx.fillText('💥', centerX, centerY);
                break;
                
            case 'quantum':
                // Quantum power-up - atom emoji
                ctx.fillStyle = '#9932cc';
                ctx.fillText('⚛️', centerX, centerY);
                break;
                
            case 'thunder':
                // Thunder power-up - thunder emoji
                ctx.fillStyle = '#ffd700';
                ctx.fillText('⚡', centerX, centerY);
                break;
                
            case 'rocket':
                // Rocket power-up - rocket emoji
                ctx.fillStyle = '#ff4444';
                ctx.fillText('🚀', centerX, centerY);
                break;
                
            case 'multiplier':
                // Weapon multiplier power-up - star emoji
                ctx.fillStyle = '#ff1493';
                ctx.fillText('⭐', centerX, centerY);
                break;
                
            default:
                // Default power-up - gem emoji
                ctx.fillStyle = '#ff00ff';
                ctx.fillText('💎', centerX, centerY);
                break;
        }
        
        // Reset text alignment
        ctx.textAlign = 'left';
        ctx.textBaseline = 'alphabetic';
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
    
    // Update weapon display
    document.getElementById('weaponDisplay').textContent = player.weaponType.toUpperCase();
    
    // Update multiplier display
    document.getElementById('multiplierDisplay').textContent = `${player.weaponMultiplier}x`;
    
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
    
    // Draw weapon info (moved to avoid HUD overlap)
    ctx.fillStyle = '#00ff00';
    ctx.font = '12px Arial';
    ctx.fillText('Collect weapons to switch!', canvas.width - 200, 80);
    
    // Draw power-up status (moved to avoid HUD overlap)
    if (player.hasSpeed) {
        ctx.fillStyle = '#00ffff';
        ctx.fillText('SPEED BOOST', canvas.width - 200, 100);
    }
    if (player.hasShield) {
        ctx.fillStyle = '#ffff00';
        ctx.fillText('SHIELD ACTIVE', canvas.width - 200, 120);
    }
    
    // Draw controls hint (moved to avoid HUD overlap)
    ctx.fillStyle = '#888888';
    ctx.font = '12px Arial';
    ctx.fillText('1-5: Quick Weapon Switch', 10, canvas.height - 80);
    ctx.fillText('Hold SPACE: Rapid Fire', 10, canvas.height - 60);
    ctx.fillText('Press R: Fire Rocket', 10, canvas.height - 40);
    ctx.fillText('Touch/Drag: Mobile Controls', 10, canvas.height - 20);
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
    updateEnemyBullets();
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
    drawEnemyBullets();
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

// Touch controls for iOS devices
let touchStartX = 0;
let touchStartY = 0;
let isTouching = false;
let touchShootTimer = 0;

// Touch event handlers
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    touchStartX = touch.clientX - rect.left;
    touchStartY = touch.clientY - rect.top;
    isTouching = true;
    
    // Start shooting on touch
    keys.Space = true;
    keys.SpacePressed = false;
    
    // Convert touch position to canvas coordinates
    const canvasX = (touch.clientX - rect.left) * (canvas.width / rect.width);
    const canvasY = (touch.clientY - rect.top) * (canvas.height / rect.height);
    
    // Move player to touch position
    player.x = Math.max(0, Math.min(canvas.width - player.width, canvasX - player.width / 2));
    player.y = Math.max(0, Math.min(canvas.height - player.height, canvasY - player.height / 2));
}, { passive: false });

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (!isTouching) return;
    
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    
    // Convert touch position to canvas coordinates
    const canvasX = (touch.clientX - rect.left) * (canvas.width / rect.width);
    const canvasY = (touch.clientY - rect.top) * (canvas.height / rect.height);
    
    // Move player to touch position
    player.x = Math.max(0, Math.min(canvas.width - player.width, canvasX - player.width / 2));
    player.y = Math.max(0, Math.min(canvas.height - player.height, canvasY - player.height / 2));
}, { passive: false });

canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    isTouching = false;
    keys.Space = false;
    keys.SpacePressed = false;
}, { passive: false });

// Double tap to fire rocket
let lastTapTime = 0;
canvas.addEventListener('touchend', (e) => {
    const currentTime = new Date().getTime();
    const tapLength = currentTime - lastTapTime;
    
    if (tapLength < 500 && tapLength > 0) {
        // Double tap detected - fire rocket
        const originalWeapon = player.weaponType;
        player.weaponType = 'rocket';
        createBullet();
        player.weaponType = originalWeapon;
    }
    
    lastTapTime = currentTime;
}, { passive: false });

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
    resizeGameCanvas();
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

// Load sci-fi shooting sound
defineShootingSound();

function defineShootingSound() {
    window.shootSound = new Audio('assets/sounds/space_laser.ogg');
    window.shootSound.volume = 0.5;
}

function playShootSound() {
    if (window.shootSound) {
        // Clone to allow overlapping shots
        const sfx = window.shootSound.cloneNode();
        sfx.volume = window.shootSound.volume;
        sfx.play();
    }
}

// Add event listeners to resize canvas on load and resize
window.addEventListener('resize', resizeGameCanvas);
window.addEventListener('orientationchange', resizeGameCanvas);