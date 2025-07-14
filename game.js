// Simple Space Shooter Game
class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gameState = 'start'; // start, playing, gameOver
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        
        // Game objects
        this.player = null;
        this.enemies = [];
        this.bullets = [];
        this.particles = [];
        this.enemyBullets = [];
        this.collectibles = [];
        
        // Input handling
        this.keys = {};
        this.setupInput();
        
        // Game timing
        this.lastTime = 0;
        this.enemySpawnTimer = 0;
        this.enemySpawnRate = 2000; // milliseconds
        
        // Start game loop
        this.gameLoop();
    }
    
    setupInput() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            if (e.code === 'Space') {
                e.preventDefault();
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
        
        // Button event listeners
        document.getElementById('startBtn').addEventListener('click', () => {
            this.startGame();
        });
        
        document.getElementById('restartBtn').addEventListener('click', () => {
            this.restartGame();
        });
    }
    
    startGame() {
        this.gameState = 'playing';
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.enemies = [];
        this.bullets = [];
        this.particles = [];
        this.enemyBullets = [];
        this.collectibles = [];
        
        this.player = new Player(400, 500);
        
        document.getElementById('startScreen').classList.add('hidden');
        document.getElementById('gameOverScreen').classList.add('hidden');
    }
    
    restartGame() {
        this.startGame();
    }
    
    gameOver() {
        this.gameState = 'gameOver';
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('gameOverScreen').classList.remove('hidden');
    }
    
    update(deltaTime) {
        if (this.gameState !== 'playing') return;
        
        // Update player
        if (this.player) {
            this.player.update(deltaTime, this.keys);
            
            // Handle shooting
            if (this.keys['Space']) {
                const bullet = this.player.shoot();
                if (bullet) {
                    if (Array.isArray(bullet)) {
                        this.bullets.push(...bullet);
                    } else {
                        this.bullets.push(bullet);
                    }
                }
            }
        }
        
        // Spawn enemies
        this.enemySpawnTimer += deltaTime;
        if (this.enemySpawnTimer >= this.enemySpawnRate) {
            this.spawnEnemy();
            this.enemySpawnTimer = 0;
            this.enemySpawnRate = Math.max(500, this.enemySpawnRate - 50); // Faster spawning
        }
        
        // Update enemies
        this.enemies.forEach(enemy => {
            enemy.update(deltaTime);
            // Enemy shooting logic
            if (enemy.canShoot()) {
                const bullets = enemy.shootAt(this.player);
                if (bullets) {
                    // Handle both single bullets and arrays of bullets
                    if (Array.isArray(bullets)) {
                        bullets.forEach(bullet => this.enemyBullets.push(bullet));
                    } else {
                        this.enemyBullets.push(bullets);
                    }
                }
            }
        });
        
        // Update bullets
        this.bullets.forEach(bullet => {
            bullet.update(deltaTime);
        });
        
        // Update enemy bullets
        this.enemyBullets.forEach(bullet => bullet.update(deltaTime));
        
        // Update particles
        this.particles.forEach(particle => {
            particle.update(deltaTime);
        });
        
        // Spawn collectibles randomly
        if (Math.random() < 0.01) { // Increased from 0.002 to 0.01
            // 50% chance weapon, 50% health
            if (Math.random() < 0.5) {
                this.collectibles.push(new Collectible(Math.random() * (this.canvas.width - 32), -32, 'weapon'));
                console.log('Spawned weapon collectible');
            } else {
                this.collectibles.push(new Collectible(Math.random() * (this.canvas.width - 32), -32, 'health'));
                console.log('Spawned health collectible');
            }
        }
        // Update collectibles
        this.collectibles.forEach(c => c.update(deltaTime));
        // Remove off-screen collectibles
        this.collectibles = this.collectibles.filter(c => c.y < this.canvas.height + 32);
        
        // Remove off-screen objects
        this.enemies = this.enemies.filter(enemy => enemy.y < 650);
        this.bullets = this.bullets.filter(bullet => bullet.y > -10 && bullet.y < 610);
        this.enemyBullets = this.enemyBullets.filter(bullet => bullet.y > -10 && bullet.y < 610);
        this.particles = this.particles.filter(particle => particle.life > 0);
        
        // Check collisions
        this.checkCollisions();
        
        // Update HUD
        this.updateHUD();
    }
    
    spawnEnemy() {
        const x = Math.random() * (this.canvas.width - 40);
        // 70% chance for regular enemy, 30% chance for sideways enemy
        if (Math.random() < 0.7) {
            const enemy = new Enemy(x, -30);
            this.enemies.push(enemy);
        } else {
            const sidewaysEnemy = new SidewaysEnemy(x, -30);
            this.enemies.push(sidewaysEnemy);
        }
    }
    
    checkCollisions() {
        // Player bullets vs enemies
        this.bullets.forEach((bullet, bulletIndex) => {
            this.enemies.forEach((enemy, enemyIndex) => {
                if (this.checkCollision(bullet, enemy)) {
                    // Remove bullet and enemy
                    this.bullets.splice(bulletIndex, 1);
                    this.enemies.splice(enemyIndex, 1);
                    
                    // Add score
                    this.score += 10;
                    
                    // Create explosion particles
                    this.createExplosion(enemy.x + enemy.width/2, enemy.y + enemy.height/2);
                }
            });
        });
        
        // Enemies vs player
        if (this.player) {
            this.enemies.forEach(enemy => {
                if (this.checkCollision(this.player, enemy)) {
                    this.lives--;
                    this.createExplosion(this.player.x + this.player.width/2, this.player.y + this.player.height/2);
                    
                    if (this.lives <= 0) {
                        this.gameOver();
                    } else {
                        // Reset player position
                        this.player.x = 400;
                        this.player.y = 500;
                    }
                }
            });
        }
        // Enemy bullets vs player
        if (this.player) {
            this.enemyBullets.forEach((bullet, bulletIndex) => {
                if (this.checkCollision(this.player, bullet)) {
                    this.enemyBullets.splice(bulletIndex, 1);
                    this.lives--;
                    this.createExplosion(this.player.x + this.player.width/2, this.player.y + this.player.height/2);
                    if (this.lives <= 0) {
                        this.gameOver();
                    } else {
                        this.player.x = 400;
                        this.player.y = 500;
                    }
                }
            });
        }
        // Player vs collectibles
        if (this.player) {
            this.collectibles.forEach((c, i) => {
                if (this.checkCollision(this.player, c)) {
                    if (c.type === 'weapon') {
                        this.player.upgradeWeapon();
                    } else if (c.type === 'health') {
                        this.lives = Math.min(5, this.lives + 1);
                    }
                    this.collectibles.splice(i, 1);
                }
            });
        }
    }
    
    checkCollision(obj1, obj2) {
        return obj1.x < obj2.x + obj2.width &&
               obj1.x + obj1.width > obj2.x &&
               obj1.y < obj2.y + obj2.height &&
               obj1.y + obj1.height > obj2.y;
    }
    
    createExplosion(x, y) {
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 * i) / 8;
            const speed = 2 + Math.random() * 2;
            const particle = new Particle(
                x, y,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                '#ff4444'
            );
            this.particles.push(particle);
        }
    }
    
    updateHUD() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('lives').textContent = this.lives;
        document.getElementById('level').textContent = this.level;
    }
    
    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw starfield background
        this.drawStarfield();
        
        // Draw game objects
        if (this.player) {
            this.player.draw(this.ctx);
        }
        
        this.enemies.forEach(enemy => enemy.draw(this.ctx));
        this.bullets.forEach(bullet => bullet.draw(this.ctx));
        this.enemyBullets.forEach(bullet => bullet.draw(this.ctx));
        this.particles.forEach(particle => particle.draw(this.ctx));
        // Draw collectibles (to be implemented)
        this.collectibles.forEach(c => c.draw(this.ctx));
    }
    
    drawStarfield() {
        this.ctx.fillStyle = '#fff';
        for (let i = 0; i < 100; i++) {
            const x = (i * 37) % this.canvas.width;
            const y = (i * 73 + Date.now() * 0.01) % this.canvas.height;
            this.ctx.fillRect(x, y, 1, 1);
        }
    }
    
    gameLoop(currentTime = 0) {
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        this.update(deltaTime);
        this.draw();
        
        requestAnimationFrame((time) => this.gameLoop(time));
    }
}

// Player class
class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 40;
        this.height = 30;
        this.speed = 5;
        this.lastShot = 0;
        this.shotCooldown = 200; // milliseconds
        this.weaponLevel = 1;
    }
    
    update(deltaTime, keys) {
        // Movement
        if (keys['ArrowLeft']) this.x -= this.speed;
        if (keys['ArrowRight']) this.x += this.speed;
        if (keys['ArrowUp']) this.y -= this.speed;
        if (keys['ArrowDown']) this.y += this.speed;
        
        // Keep player on screen
        this.x = Math.max(0, Math.min(760, this.x));
        this.y = Math.max(0, Math.min(570, this.y));
    }
    
    shoot() {
        const now = Date.now();
        if (now - this.lastShot >= this.shotCooldown) {
            this.lastShot = now;
            if (this.weaponLevel > 1) {
                // Double shot
                return [
                    new Bullet(this.x + 8, this.y, 0, -8),
                    new Bullet(this.x + this.width - 12, this.y, 0, -8)
                ];
            }
            return new Bullet(this.x + this.width/2 - 2, this.y, 0, -8);
        }
        return null;
    }
    
    upgradeWeapon() {
        this.weaponLevel = Math.min(2, this.weaponLevel + 1);
    }
    
    draw(ctx) {
        // Draw player ship (blue triangle)
        ctx.fillStyle = '#0066ff';
        ctx.beginPath();
        ctx.moveTo(this.x + this.width/2, this.y);
        ctx.lineTo(this.x, this.y + this.height);
        ctx.lineTo(this.x + this.width, this.y + this.height);
        ctx.closePath();
        ctx.fill();
        
        // Draw cockpit
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(this.x + this.width/2 - 3, this.y + 5, 6, 8);
    }
}

// Enemy class
class Enemy {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 30;
        this.height = 25;
        this.speed = 2 + Math.random() * 2;
        this.shootCooldown = 2000 + Math.random() * 1000; // 2-3 seconds between shots
        this.lastShot = Date.now();
    }
    
    update(deltaTime) {
        this.y += this.speed;
    }
    
    canShoot() {
        return Date.now() - this.lastShot > this.shootCooldown;
    }
    
    shootAt(player) {
        if (!player) return null;
        this.lastShot = Date.now();
        console.log('Enemy shooting straight down');
        // Shoot straight down
        return new Bullet(this.x + this.width/2 - 2, this.y + this.height, 0, 4, true);
    }
    
    draw(ctx) {
        // Draw enemy ship (red triangle pointing down)
        ctx.fillStyle = '#ff4444';
        ctx.beginPath();
        ctx.moveTo(this.x + this.width/2, this.y + this.height);
        ctx.lineTo(this.x, this.y);
        ctx.lineTo(this.x + this.width, this.y);
        ctx.closePath();
        ctx.fill();
        
        // Draw enemy cockpit
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(this.x + this.width/2 - 2, this.y + 2, 4, 6);
    }
}

// SidewaysEnemy class - shoots left and right
class SidewaysEnemy {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 35;
        this.height = 20;
        this.speed = 1.5 + Math.random() * 1.5; // Slightly slower
        this.shootCooldown = 2500 + Math.random() * 1500; // 2.5-4 seconds between shots
        this.lastShot = Date.now();
        this.shootDirection = Math.random() < 0.5 ? 'left' : 'right'; // Random initial direction
    }
    
    update(deltaTime) {
        this.y += this.speed;
    }
    
    canShoot() {
        return Date.now() - this.lastShot > this.shootCooldown;
    }
    
    shootAt(player) {
        if (!player) return null;
        this.lastShot = Date.now();
        console.log('Sideways enemy shooting ' + this.shootDirection);
        
        // Shoot left and right bullets
        const bullets = [];
        bullets.push(new Bullet(this.x, this.y + this.height/2, -4, 0, true)); // Left bullet
        bullets.push(new Bullet(this.x + this.width, this.y + this.height/2, 4, 0, true)); // Right bullet
        
        // Toggle direction for next shot
        this.shootDirection = this.shootDirection === 'left' ? 'right' : 'left';
        
        return bullets;
    }
    
    draw(ctx) {
        // Draw sideways enemy ship (purple rectangle with wings)
        ctx.fillStyle = '#8844ff';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Draw wings
        ctx.fillStyle = '#6622cc';
        ctx.fillRect(this.x - 5, this.y + 5, 5, 10);
        ctx.fillRect(this.x + this.width, this.y + 5, 5, 10);
        
        // Draw cockpit
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(this.x + this.width/2 - 3, this.y + 5, 6, 8);
    }
}

// Bullet class
class Bullet {
    constructor(x, y, vx, vy, isEnemy = false) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.width = 4;
        this.height = 8;
        this.isEnemy = isEnemy;
    }
    
    update(deltaTime) {
        this.x += this.vx;
        this.y += this.vy;
    }
    
    draw(ctx) {
        ctx.fillStyle = this.isEnemy ? '#ff4444' : '#ffff00';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

// Particle class for explosions
class Particle {
    constructor(x, y, vx, vy, color) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.color = color;
        this.life = 60; // frames
        this.maxLife = 60;
    }
    
    update(deltaTime) {
        this.x += this.vx;
        this.y += this.vy;
        this.life--;
    }
    
    draw(ctx) {
        const alpha = this.life / this.maxLife;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, 3, 3);
        ctx.globalAlpha = 1;
    }
}

// Collectible class for weapons and health
class Collectible {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type; // 'weapon' or 'health'
        this.width = 32;
        this.height = 32;
        this.emoji = type === 'weapon' ? '🚀' : '❤️';
        this.speed = 2;
    }
    update(deltaTime) {
        this.y += this.speed;
    }
    draw(ctx) {
        ctx.font = '28px serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.emoji, this.x + this.width/2, this.y + this.height/2);
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    new Game();
}); 