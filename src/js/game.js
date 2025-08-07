// Enhanced Game Engine
class EnhancedSpaceShooter {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gameState = 'menu';
        
        // Game stats
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.combo = 0;
        this.maxCombo = 0;
        this.enemiesDestroyed = 0;
        this.powerupsCollected = 0;
        this.survivalTime = 0;
        this.startTime = 0;
        
        // Enhanced player
        this.player = {
            x: 475,
            y: 600,
            width: 50,
            height: 40,
            speed: 5,
            health: 100,
            maxHealth: 100,
            shield: 0,
            invulnerable: 0
        };
        
        // Weapon system
        this.currentWeapon = 'basic';
        this.weaponLevel = 1;
        this.lastShot = 0;
        this.weaponPowerUp = { active: false, timeLeft: 0, type: '' };
        
        // Game objects
        this.bullets = [];
        this.enemyBullets = [];
        this.enemies = [];
        this.powerups = [];
        this.particles = [];
        this.stars = [];
        this.explosions = [];
        
        // Enhanced features
        this.screenShake = 0;
        this.backgroundOffset = 0;
        this.bossActive = false;
        this.boss = null;
        
        // Audio
        this.musicEnabled = true;
        this.sfxEnabled = true;
        
        // Initialize
        this.initializeStars();
        this.setupEventListeners();
        this.loadHighScore();
        
        // Start game loop
        this.gameLoop();
    }
    
    initializeStars() {
        for (let i = 0; i < 100; i++) {
            this.stars.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                speed: 0.5 + Math.random() * 2,
                size: Math.random() * 2,
                brightness: 0.3 + Math.random() * 0.7
            });
        }
    }
    
    setupEventListeners() {
        // Keyboard controls
        this.keys = {};
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            
            // Weapon switching
            if (e.code >= 'Digit1' && e.code <= 'Digit9') {
                const weaponIndex = parseInt(e.code.slice(-1)) - 1;
                const weapons = ['basic', 'plasma', 'spread', 'laser', 'missile', 'lightning', 'ice', 'fire', 'energy'];
                if (weapons[weaponIndex]) {
                    this.currentWeapon = weapons[weaponIndex];
                    this.updateUI();
                }
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
        
        // Touch/Mouse controls for mobile
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.handleTouch(e.touches[0]);
        });
        
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            this.handleTouch(e.touches[0]);
        });
        
        this.canvas.addEventListener('mousemove', (e) => {
            if (this.gameState === 'playing') {
                this.handleMouse(e);
            }
        });
    }
    
    handleTouch(touch) {
        const rect = this.canvas.getBoundingClientRect();
        const x = (touch.clientX - rect.left) * (this.canvas.width / rect.width);
        const y = (touch.clientY - rect.top) * (this.canvas.height / rect.height);
        
        this.player.x = x - this.player.width / 2;
        this.player.y = y - this.player.height / 2;
        this.constrainPlayer();
    }
    
    handleMouse(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left) * (this.canvas.width / rect.width);
        const y = (e.clientY - rect.top) * (this.canvas.height / rect.height);
        
        this.player.x = x - this.player.width / 2;
        this.player.y = y - this.player.height / 2;
        this.constrainPlayer();
    }
    
    constrainPlayer() {
        this.player.x = Math.max(0, Math.min(this.player.x, this.canvas.width - this.player.width));
        this.player.y = Math.max(0, Math.min(this.player.y, this.canvas.height - this.player.height));
    }
    
    startGame() {
        this.gameState = 'playing';
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.combo = 0;
        this.maxCombo = 0;
        this.enemiesDestroyed = 0;
        this.powerupsCollected = 0;
        this.startTime = Date.now();
        
        // Reset player
        this.player.x = 475;
        this.player.y = 600;
        this.player.health = 100;
        this.player.shield = 0;
        this.player.invulnerable = 0;
        
        // Clear arrays
        this.bullets = [];
        this.enemyBullets = [];
        this.enemies = [];
        this.powerups = [];
        this.particles = [];
        this.explosions = [];
        
        // Reset weapon
        this.currentWeapon = 'basic';
        this.weaponLevel = 1;
        this.weaponPowerUp = { active: false, timeLeft: 0, type: '' };
        
        // Hide menu
        document.getElementById('menu').style.display = 'none';
        document.getElementById('gameOver').style.display = 'none';
        
        this.updateUI();
    }
    
    gameLoop() {
        if (this.gameState === 'playing') {
            this.update();
        }
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }
    
    update() {
        this.survivalTime = (Date.now() - this.startTime) / 1000;
        
        // Update player movement
        if (this.keys['ArrowLeft'] || this.keys['KeyA']) this.player.x -= this.player.speed;
        if (this.keys['ArrowRight'] || this.keys['KeyD']) this.player.x += this.player.speed;
        if (this.keys['ArrowUp'] || this.keys['KeyW']) this.player.y -= this.player.speed;
        if (this.keys['ArrowDown'] || this.keys['KeyS']) this.player.y += this.player.speed;
        
        this.constrainPlayer();
        
        // Auto-shoot
        if (Date.now() - this.lastShot > this.getWeaponCooldown()) {
            this.shoot();
            this.lastShot = Date.now();
        }
        
        // Update game objects
        this.updateBullets();
        this.updateEnemies();
        this.updatePowerups();
        this.updateParticles();
        this.updateExplosions();
        this.updateStars();
        
        // Spawn enemies and powerups
        this.spawnEnemies();
        this.spawnPowerups();
        
        // Update power-ups
        if (this.weaponPowerUp.active) {
            this.weaponPowerUp.timeLeft -= 16.67; // ~60fps
            if (this.weaponPowerUp.timeLeft <= 0) {
                this.weaponPowerUp.active = false;
                this.currentWeapon = 'basic';
            }
            this.updatePowerUpIndicator();
        }
        
        // Update player status
        if (this.player.invulnerable > 0) this.player.invulnerable--;
        if (this.player.shield > 0) this.player.shield--;
        
        // Screen shake
        if (this.screenShake > 0) this.screenShake--;
        
        // Level progression
        const newLevel = Math.floor(this.score / 1000) + 1;
        if (newLevel !== this.level) {
            this.level = newLevel;
            this.showCombo(`LEVEL ${this.level}!`, '#00ffff');
        }
        
        // Boss spawning
        if (this.level % 5 === 0 && !this.bossActive && this.enemies.length === 0) {
            this.spawnBoss();
        }
        
        this.updateUI();
    }
    
    shoot() {
        const weapons = {
            basic: () => this.createBullet(this.player.x + 25, this.player.y, 0, -8, '#ffff00', 10),
            plasma: () => {
                this.createBullet(this.player.x + 25, this.player.y, 0, -10, '#00ffff', 20);
                this.createParticle(this.player.x + 25, this.player.y, '#00ffff');
            },
            spread: () => {
                this.createBullet(this.player.x + 25, this.player.y, -2, -8, '#ff0000', 15);
                this.createBullet(this.player.x + 25, this.player.y, 0, -8, '#ff0000', 15);
                this.createBullet(this.player.x + 25, this.player.y, 2, -8, '#ff0000', 15);
            },
            laser: () => {
                for (let i = 0; i < 3; i++) {
                    setTimeout(() => {
                        this.createBullet(this.player.x + 25, this.player.y, 0, -12, '#ff00ff', 12);
                    }, i * 50);
                }
            },
            missile: () => {
                const target = this.findNearestEnemy();
                this.createHomingMissile(this.player.x + 25, this.player.y, target, '#ff8800', 30);
            }
        };
        
        const weaponType = this.weaponPowerUp.active ? this.weaponPowerUp.type : this.currentWeapon;
        if (weapons[weaponType]) {
            weapons[weaponType]();
        }
    }
    
    createBullet(x, y, vx, vy, color, damage) {
        this.bullets.push({
            x, y, vx, vy, color, damage,
            width: 4, height: 8,
            trail: []
        });
    }
    
    createHomingMissile(x, y, target, color, damage) {
        this.bullets.push({
            x, y, vx: 0, vy: -5, color, damage,
            width: 6, height: 12,
            homing: true, target,
            trail: []
        });
    }
    
    findNearestEnemy() {
        let nearest = null;
        let minDist = Infinity;
        
        this.enemies.forEach(enemy => {
            const dist = Math.hypot(enemy.x - this.player.x, enemy.y - this.player.y);
            if (dist < minDist) {
                minDist = dist;
                nearest = enemy;
            }
        });
        
        return nearest;
    }
    
    getWeaponCooldown() {
        const cooldowns = {
            basic: 200,
            plasma: 300,
            spread: 250,
            laser: 100,
            missile: 500
        };
        return cooldowns[this.currentWeapon] || 200;
    }
    
    updateBullets() {
        this.bullets.forEach((bullet, index) => {
            // Homing behavior
            if (bullet.homing && bullet.target) {
                const dx = bullet.target.x - bullet.x;
                const dy = bullet.target.y - bullet.y;
                const dist = Math.hypot(dx, dy);
                
                if (dist > 0) {
                    bullet.vx += (dx / dist) * 0.5;
                    bullet.vy += (dy / dist) * 0.5;
                }
            }
            
            // Add to trail
            bullet.trail.push({ x: bullet.x, y: bullet.y });
            if (bullet.trail.length > 5) bullet.trail.shift();
            
            bullet.x += bullet.vx;
            bullet.y += bullet.vy;
            
            // Remove if off screen
            if (bullet.y < -10 || bullet.y > this.canvas.height + 10) {
                this.bullets.splice(index, 1);
            }
        });
    }
    
    spawnEnemies() {
        if (Math.random() < 0.02 + this.level * 0.005) {
            const enemyTypes = ['basic', 'fast', 'tank', 'shooter'];
            const type = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
            
            const enemy = {
                x: Math.random() * (this.canvas.width - 40),
                y: -40,
                width: 40,
                height: 40,
                type,
                health: type === 'tank' ? 30 : type === 'basic' ? 10 : 15,
                maxHealth: type === 'tank' ? 30 : type === 'basic' ? 10 : 15,
                speed: type === 'fast' ? 3 : type === 'tank' ? 1 : 2,
                lastShot: 0,
                color: type === 'tank' ? '#800080' : type === 'fast' ? '#ff8800' : '#ff0000'
            };
            
            this.enemies.push(enemy);
        }
    }
    
    updateEnemies() {
        this.enemies.forEach((enemy, index) => {
            enemy.y += enemy.speed;
            
            // Enemy shooting
            if (enemy.type === 'shooter' && Date.now() - enemy.lastShot > 1000) {
                this.createEnemyBullet(enemy.x + 20, enemy.y + 40);
                enemy.lastShot = Date.now();
            }
            
            // Remove if off screen
            if (enemy.y > this.canvas.height) {
                this.enemies.splice(index, 1);
                return;
            }
            
            // Check collision with player
            if (this.checkCollision(enemy, this.player) && this.player.invulnerable === 0) {
                this.damagePlayer(20);
                this.createExplosion(enemy.x, enemy.y, '#ff0000');
                this.enemies.splice(index, 1);
                this.combo = 0;
            }
            
            // Check collision with bullets
            this.bullets.forEach((bullet, bulletIndex) => {
                if (this.checkCollision(bullet, enemy)) {
                    enemy.health -= bullet.damage;
                    this.bullets.splice(bulletIndex, 1);
                    
                    if (enemy.health <= 0) {
                        this.destroyEnemy(enemy, index);
                    } else {
                        this.createParticle(enemy.x + 20, enemy.y + 20, enemy.color);
                    }
                }
            });
        });
    }
    
    createEnemyBullet(x, y) {
        this.enemyBullets.push({
            x, y, vx: 0, vy: 4,
            width: 3, height: 6,
            color: '#ff4444'
        });
    }
    
    destroyEnemy(enemy, index) {
        this.score += enemy.maxHealth * 10;
        this.enemiesDestroyed++;
        this.combo++;
        this.maxCombo = Math.max(this.maxCombo, this.combo);
        
        // Show combo
        if (this.combo > 1) {
            this.showCombo(`${this.combo}x COMBO!`, '#ffff00');
        }
        
        this.createExplosion(enemy.x, enemy.y, enemy.color);
        this.enemies.splice(index, 1);
        this.screenShake = 10;
        
        // Chance to drop powerup
        if (Math.random() < 0.15) {
            this.spawnPowerupAt(enemy.x, enemy.y);
        }
    }
    
    spawnPowerups() {
        if (Math.random() < 0.005) {
            this.spawnPowerupAt(Math.random() * (this.canvas.width - 30), -30);
        }
    }
    
    spawnPowerupAt(x, y) {
        const types = ['health', 'shield', 'weapon', 'score', 'life'];
        const type = types[Math.floor(Math.random() * types.length)];
        
        this.powerups.push({
            x, y, type,
            width: 25, height: 25,
            speed: 2,
            rotation: 0,
            pulse: 0
        });
    }
    
    updatePowerups() {
        this.powerups.forEach((powerup, index) => {
            powerup.y += powerup.speed;
            powerup.rotation += 0.1;
            powerup.pulse += 0.2;
            
            if (powerup.y > this.canvas.height) {
                this.powerups.splice(index, 1);
                return;
            }
            
            if (this.checkCollision(powerup, this.player)) {
                this.collectPowerup(powerup);
                this.powerups.splice(index, 1);
            }
        });
    }
    
    collectPowerup(powerup) {
        this.powerupsCollected++;
        this.createParticle(powerup.x, powerup.y, '#00ff00');
        
        switch (powerup.type) {
            case 'health':
                this.player.health = Math.min(100, this.player.health + 25);
                this.showCombo('HEALTH +25', '#00ff00');
                break;
            case 'shield':
                this.player.shield = 300; // 5 seconds at 60fps
                this.showCombo('SHIELD ACTIVE', '#0080ff');
                break;
            case 'weapon':
                const weapons = ['plasma', 'spread', 'laser', 'missile'];
                this.weaponPowerUp = {
                    active: true,
                    timeLeft: 10000, // 10 seconds
                    type: weapons[Math.floor(Math.random() * weapons.length)]
                };
                this.showCombo('WEAPON UPGRADE!', '#ff8800');
                break;
            case 'score':
                this.score += 500;
                this.showCombo('BONUS +500', '#ffff00');
                break;
            case 'life':
                this.lives++;
                this.showCombo('EXTRA LIFE!', '#ff00ff');
                break;
        }
    }
    
    damagePlayer(damage) {
        if (this.player.shield > 0) {
            this.player.shield = Math.max(0, this.player.shield - damage * 10);
            return;
        }
        
        this.player.health -= damage;
        this.player.invulnerable = 60; // 1 second
        this.screenShake = 20;
        
        if (this.player.health <= 0) {
            this.lives--;
            if (this.lives <= 0) {
                this.gameOver();
            } else {
                this.player.health = 100;
                this.showCombo('LIFE LOST!', '#ff0000');
            }
        }
    }
    
    spawnBoss() {
        this.bossActive = true;
        this.boss = {
            x: this.canvas.width / 2 - 75,
            y: -150,
            width: 150,
            height: 100,
            health: 200 + this.level * 50,
            maxHealth: 200 + this.level * 50,
            speed: 1,
            direction: 1,
            lastShot: 0,
            phase: 1
        };
        
        this.enemies.push(this.boss);
        this.showCombo('BOSS INCOMING!', '#ff0000');
    }
    
    createExplosion(x, y, color) {
        for (let i = 0; i < 10; i++) {
            this.particles.push({
                x: x + Math.random() * 40,
                y: y + Math.random() * 40,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8,
                color,
                life: 30,
                maxLife: 30,
                size: 2 + Math.random() * 3
            });
        }
    }
    
    createParticle(x, y, color) {
        for (let i = 0; i < 5; i++) {
            this.particles.push({
                x: x + Math.random() * 20,
                y: y + Math.random() * 20,
                vx: (Math.random() - 0.5) * 4,
                vy: (Math.random() - 0.5) * 4,
                color,
                life: 20,
                maxLife: 20,
                size: 1 + Math.random() * 2
            });
        }
    }
    
    updateParticles() {
        this.particles.forEach((particle, index) => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life--;
            
            if (particle.life <= 0) {
                this.particles.splice(index, 1);
            }
        });
    }
    
    updateExplosions() {
        // Placeholder for explosion animations
    }
    
    updateStars() {
        this.stars.forEach(star => {
            star.y += star.speed;
            if (star.y > this.canvas.height) {
                star.y = -5;
                star.x = Math.random() * this.canvas.width;
            }
        });
    }
    
    showCombo(text, color) {
        const indicator = document.getElementById('comboIndicator');
        indicator.textContent = text;
        indicator.style.color = color;
        indicator.style.opacity = '1';
        indicator.style.transform = 'translate(-50%, -50%) scale(1.2)';
        
        setTimeout(() => {
            indicator.style.opacity = '0';
            indicator.style.transform = 'translate(-50%, -50%) scale(1)';
        }, 1500);
    }
    
    updatePowerUpIndicator() {
        const indicator = document.getElementById('powerUpIndicator');
        if (this.weaponPowerUp.active) {
            indicator.style.display = 'block';
            document.getElementById('powerUpText').textContent = `${this.weaponPowerUp.type.toUpperCase()} ACTIVE`;
            document.getElementById('powerUpTimer').textContent = `Time: ${Math.ceil(this.weaponPowerUp.timeLeft / 1000)}s`;
        } else {
            indicator.style.display = 'none';
        }
    }
    
    checkCollision(obj1, obj2) {
        return obj1.x < obj2.x + obj2.width &&
               obj1.x + obj1.width > obj2.x &&
               obj1.y < obj2.y + obj2.height &&
               obj1.y + obj1.height > obj2.y;
    }
    
    gameOver() {
        this.gameState = 'gameOver';
        this.survivalTime = (Date.now() - this.startTime) / 1000;
        
        // Update high score
        const highScore = localStorage.getItem('highScore') || 0;
        if (this.score > highScore) {
            localStorage.setItem('highScore', this.score);
            document.getElementById('highScoreValue').textContent = this.score;
        }
        
        // Show game over screen
        document.getElementById('finalStats').innerHTML = `
            <div>Final Score: ${this.score}</div>
            <div>Survival Time: ${Math.floor(this.survivalTime)}s</div>
            <div>Enemies Destroyed: ${this.enemiesDestroyed}</div>
            <div>Max Combo: ${this.maxCombo}x</div>
            <div>Power-ups Collected: ${this.powerupsCollected}</div>
        `;
        
        document.getElementById('gameOver').style.display = 'block';
    }
    
    updateUI() {
        document.getElementById('score').textContent = `Score: ${this.score}`;
        document.getElementById('lives').textContent = `Lives: ${this.lives}`;
        document.getElementById('level').textContent = `Level: ${this.level}`;
        document.getElementById('weapon').textContent = `Weapon: ${this.currentWeapon.charAt(0).toUpperCase() + this.currentWeapon.slice(1)}`;
        document.getElementById('combo').textContent = `Combo: ${this.combo}x`;
    }
    
    loadHighScore() {
        const highScore = localStorage.getItem('highScore') || 0;
        document.getElementById('highScoreValue').textContent = highScore;
    }
    
    render() {
        // Clear canvas with screen shake
        const shakeX = this.screenShake > 0 ? (Math.random() - 0.5) * this.screenShake : 0;
        const shakeY = this.screenShake > 0 ? (Math.random() - 0.5) * this.screenShake : 0;
        
        this.ctx.save();
        this.ctx.translate(shakeX, shakeY);
        
        // Background
        const gradient = this.ctx.createRadialGradient(
            this.canvas.width/2, this.canvas.height/2, 0,
            this.canvas.width/2, this.canvas.height/2, this.canvas.width
        );
        gradient.addColorStop(0, '#000033');
        gradient.addColorStop(1, '#000011');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Stars
        this.stars.forEach(star => {
            this.ctx.fillStyle = `rgba(255, 255, 255, ${star.brightness})`;
            this.ctx.fillRect(star.x, star.y, star.size, star.size);
        });
        
        if (this.gameState === 'playing') {
            this.renderGameObjects();
        }
        
        this.ctx.restore();
    }
    
    renderGameObjects() {
        // Player
        this.renderPlayer();
        
        // Bullets
        this.bullets.forEach(bullet => this.renderBullet(bullet));
        this.enemyBullets.forEach(bullet => this.renderEnemyBullet(bullet));
        
        // Enemies
        this.enemies.forEach(enemy => this.renderEnemy(enemy));
        
        // Power-ups
        this.powerups.forEach(powerup => this.renderPowerup(powerup));
        
        // Particles
        this.particles.forEach(particle => this.renderParticle(particle));
        
        // UI overlays
        this.renderHealthBar();
    }
    
    renderPlayer() {
        this.ctx.save();
        
        // Invulnerability flashing
        if (this.player.invulnerable > 0 && Math.floor(this.player.invulnerable / 5) % 2) {
            this.ctx.globalAlpha = 0.5;
        }
        
        // Shield effect
        if (this.player.shield > 0) {
            this.ctx.strokeStyle = '#0080ff';
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            this.ctx.arc(
                this.player.x + this.player.width/2,
                this.player.y + this.player.height/2,
                30 + Math.sin(Date.now() * 0.01) * 5,
                0, Math.PI * 2
            );
            this.ctx.stroke();
        }
        
        // Player ship
        this.ctx.fillStyle = '#0080ff';
        this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);
        
        // Ship details
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(this.player.x + 20, this.player.y + 5, 10, 15);
        
        this.ctx.restore();
    }
    
    renderBullet(bullet) {
        // Trail effect
        bullet.trail.forEach((point, index) => {
            const alpha = (index + 1) / bullet.trail.length * 0.5;
            this.ctx.fillStyle = bullet.color + Math.floor(alpha * 255).toString(16).padStart(2, '0');
            this.ctx.fillRect(point.x, point.y, bullet.width * alpha, bullet.height * alpha);
        });
        
        // Main bullet
        this.ctx.fillStyle = bullet.color;
        this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        
        // Glow effect
        this.ctx.shadowColor = bullet.color;
        this.ctx.shadowBlur = 10;
        this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        this.ctx.shadowBlur = 0;
    }
    
    renderEnemyBullet(bullet) {
        this.ctx.fillStyle = bullet.color;
        this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    }
    
    renderEnemy(enemy) {
        // Health bar
        if (enemy.health < enemy.maxHealth) {
            this.ctx.fillStyle = '#ff0000';
            this.ctx.fillRect(enemy.x, enemy.y - 10, enemy.width, 4);
            this.ctx.fillStyle = '#00ff00';
            this.ctx.fillRect(enemy.x, enemy.y - 10, enemy.width * (enemy.health / enemy.maxHealth), 4);
        }
        
        // Enemy body
        this.ctx.fillStyle = enemy.color;
        this.ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
        
        // Enemy details based on type
        this.ctx.fillStyle = '#ffffff';
        if (enemy.type === 'tank') {
            this.ctx.fillRect(enemy.x + 5, enemy.y + 5, 30, 10);
        } else if (enemy.type === 'fast') {
            this.ctx.fillRect(enemy.x + 15, enemy.y + 15, 10, 10);
        } else {
            this.ctx.fillRect(enemy.x + 10, enemy.y + 10, 20, 20);
        }
    }
    
    renderPowerup(powerup) {
        this.ctx.save();
        this.ctx.translate(powerup.x + powerup.width/2, powerup.y + powerup.height/2);
        this.ctx.rotate(powerup.rotation);
        
        const colors = {
            health: '#00ff00',
            shield: '#0080ff',
            weapon: '#ff8800',
            score: '#ffff00',
            life: '#ff00ff'
        };
        
        const scale = 1 + Math.sin(powerup.pulse) * 0.2;
        this.ctx.scale(scale, scale);
        
        this.ctx.fillStyle = colors[powerup.type];
        this.ctx.fillRect(-powerup.width/2, -powerup.height/2, powerup.width, powerup.height);
        
        // Glow effect
        this.ctx.shadowColor = colors[powerup.type];
        this.ctx.shadowBlur = 15;
        this.ctx.fillRect(-powerup.width/2, -powerup.height/2, powerup.width, powerup.height);
        
        this.ctx.restore();
    }
    
    renderParticle(particle) {
        const alpha = particle.life / particle.maxLife;
        this.ctx.fillStyle = particle.color + Math.floor(alpha * 255).toString(16).padStart(2, '0');
        this.ctx.fillRect(particle.x, particle.y, particle.size, particle.size);
    }
    
    renderHealthBar() {
        // Health bar
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(10, this.canvas.height - 30, 204, 24);
        
        this.ctx.fillStyle = '#ff0000';
        this.ctx.fillRect(12, this.canvas.height - 28, 200, 20);
        
        this.ctx.fillStyle = '#00ff00';
        this.ctx.fillRect(12, this.canvas.height - 28, 200 * (this.player.health / 100), 20);
        
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '12px Orbitron';
        this.ctx.fillText(`Health: ${this.player.health}/100`, 15, this.canvas.height - 15);
    }
}

// Global functions
let game;

function startGame() {
    if (!game) {
        game = new EnhancedSpaceShooter();
    }
    game.startGame();
}

function showMenu() {
    document.getElementById('menu').style.display = 'block';
    document.getElementById('gameOver').style.display = 'none';
    if (game) game.gameState = 'menu';
}

function showInstructions() {
    alert(`🚀 KADEN & ADELYNN ADVENTURES 🚀

CONTROLS:
• Arrow Keys / WASD - Move ship
• Numbers 1-9 - Switch weapons
• Auto-shooting enabled

WEAPONS:
1 - Basic Laser
2 - Plasma Cannon  
3 - Spread Shot
4 - Laser Beam
5 - Homing Missile

POWER-UPS:
💚 Health - Restore health
🛡️ Shield - Temporary protection  
🔫 Weapon - Upgrade firepower
⭐ Score - Bonus points
❤️ Life - Extra life

SURVIVE THE WAVES AND DEFEAT THE BOSSES!`);
}

function showHighScores() {
    const highScore = localStorage.getItem('highScore') || 0;
    alert(`🏆 HIGH SCORES 🏆\n\nBest Score: ${highScore}\n\nKeep playing to beat your record!`);
}

function toggleMusic() {
    // Placeholder for music toggle
    console.log('Music toggled');
}

function toggleSFX() {
    // Placeholder for SFX toggle
    console.log('SFX toggled');
}

// Initialize game when page loads
window.addEventListener('load', () => {
    game = new EnhancedSpaceShooter();
});