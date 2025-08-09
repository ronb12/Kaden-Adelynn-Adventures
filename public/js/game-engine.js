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
        
        // Enhanced player with multiple weapons
        this.player = {
            x: 475,
            y: 600,
            width: 80,
            height: 60,
            speed: 5,
            health: 100,
            maxHealth: 100,
            shield: 0,
            invulnerable: 0,
            missiles: 0,
            autoDefense: true,
            weaponSlots: {
                primary: 'basic',
                secondary: 'missile',
                tertiary: 'plasma'
            },
            lastAutoDefense: 0
        };
        
        // Weapon system
        this.currentWeapon = 'basic';
        this.weaponLevel = 1;
        this.lastShot = 0;
        this.shotCooldown = 250;
        
        // Game objects
        this.bullets = [];
        this.enemies = [];
        this.powerups = [];
        this.explosions = [];
        this.particles = [];
        
        // Game settings
        this.enemySpawnRate = 60;
        this.enemySpawnTimer = 0;
        this.powerupSpawnRate = 300;
        this.powerupSpawnTimer = 0;
        
        // Initialize canvas
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        
        // Initialize game
        this.init();
    }
    
    resizeCanvas() {
        const container = document.getElementById('gameContainer');
        const containerRect = container.getBoundingClientRect();
        
        // Set canvas size to fit container while maintaining aspect ratio
        const maxWidth = Math.min(containerRect.width - 40, 1000);
        const maxHeight = Math.min(containerRect.height - 40, 700);
        
        this.canvas.width = maxWidth;
        this.canvas.height = maxHeight;
        
        // Update player position to center of canvas
        this.player.x = this.canvas.width / 2 - this.player.width / 2;
        this.player.y = this.canvas.height - this.player.height - 20;
    }
    
    init() {
        // Initialize game state
        this.gameState = 'menu';
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.combo = 0;
        this.maxCombo = 0;
        this.enemiesDestroyed = 0;
        this.powerupsCollected = 0;
        this.survivalTime = 0;
        
        // Clear all game objects
        this.bullets = [];
        this.enemies = [];
        this.powerups = [];
        this.explosions = [];
        this.particles = [];
        
        // Reset player
        this.player.x = this.canvas.width / 2 - this.player.width / 2;
        this.player.y = this.canvas.height - this.player.height - 20;
        this.player.health = this.player.maxHealth;
        this.player.shield = 0;
        this.player.invulnerable = 0;
        
        // Reset weapons
        this.currentWeapon = 'basic';
        this.weaponLevel = 1;
        this.lastShot = 0;
        
        // Reset timers
        this.enemySpawnTimer = 0;
        this.powerupSpawnTimer = 0;
        
        // Update UI
        this.updateUI();
    }
    
    startGame() {
        this.gameState = 'playing';
        this.startTime = Date.now();
        this.init();
        
        // Hide menu and show UI
        document.getElementById('menu').style.display = 'none';
        document.getElementById('gameContainer').classList.add('playing');
        
        // Start game loop
        this.gameLoop();
    }
    
    pauseGame() {
        if (this.gameState === 'playing') {
            this.gameState = 'paused';
            document.getElementById('pauseOverlay').style.display = 'flex';
        }
    }
    
    resumeGame() {
        if (this.gameState === 'paused') {
            this.gameState = 'playing';
            document.getElementById('pauseOverlay').style.display = 'none';
            this.gameLoop();
        }
    }
    
    gameOver() {
        this.gameState = 'gameOver';
        document.getElementById('gameContainer').classList.remove('playing');
        document.getElementById('gameOver').style.display = 'flex';
        
        // Update final stats
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('finalTime').textContent = this.survivalTime;
        document.getElementById('finalEnemies').textContent = this.enemiesDestroyed;
        document.getElementById('finalPowerups').textContent = this.powerupsCollected;
        
        // Save high score
        this.saveHighScore();
    }
    
    gameLoop() {
        if (this.gameState !== 'playing') return;
        
        // Update game
        this.update();
        
        // Render game
        this.render();
        
        // Continue loop
        requestAnimationFrame(() => this.gameLoop());
    }
    
    update() {
        // Update survival time
        this.survivalTime = Math.floor((Date.now() - this.startTime) / 1000);
        
        // Update player
        this.updatePlayer();
        
        // Update bullets
        this.updateBullets();
        
        // Update enemies
        this.updateEnemies();
        
        // Update powerups
        this.updatePowerups();
        
        // Update explosions
        this.updateExplosions();
        
        // Update particles
        this.updateParticles();
        
        // Spawn enemies
        this.spawnEnemies();
        
        // Spawn powerups
        this.spawnPowerups();
        
        // Check collisions
        this.checkCollisions();
        
        // Update UI
        this.updateUI();
    }
    
    updatePlayer() {
        // Handle player movement
        if (this.keys && this.keys['ArrowLeft'] && this.player.x > 0) {
            this.player.x -= this.player.speed;
        }
        if (this.keys && this.keys['ArrowRight'] && this.player.x < this.canvas.width - this.player.width) {
            this.player.x += this.player.speed;
        }
        if (this.keys && this.keys['ArrowUp'] && this.player.y > 0) {
            this.player.y -= this.player.speed;
        }
        if (this.keys && this.keys['ArrowDown'] && this.player.y < this.canvas.height - this.player.height) {
            this.player.y += this.player.speed;
        }
        
        // Handle shooting
        if (this.keys && this.keys[' '] && Date.now() - this.lastShot > this.shotCooldown) {
            this.shoot();
        }
        
        // Update invulnerability
        if (this.player.invulnerable > 0) {
            this.player.invulnerable--;
        }
        
        // Update auto defense
        if (this.player.autoDefense && Date.now() - this.player.lastAutoDefense > 5000) {
            this.player.shield = Math.min(this.player.shield + 20, 100);
            this.player.lastAutoDefense = Date.now();
        }
    }
    
    shoot() {
        const now = Date.now();
        if (now - this.lastShot < this.shotCooldown) return;
        
        this.lastShot = now;
        
        switch (this.currentWeapon) {
            case 'basic':
                this.bullets.push({
                    x: this.player.x + this.player.width / 2 - 2,
                    y: this.player.y,
                    width: 4,
                    height: 10,
                    speed: 8,
                    damage: 10,
                    type: 'basic'
                });
                break;
            case 'plasma':
                this.bullets.push({
                    x: this.player.x + this.player.width / 2 - 4,
                    y: this.player.y,
                    width: 8,
                    height: 15,
                    speed: 6,
                    damage: 25,
                    type: 'plasma'
                });
                break;
            case 'spread':
                for (let i = -1; i <= 1; i++) {
                    this.bullets.push({
                        x: this.player.x + this.player.width / 2 - 2 + i * 10,
                        y: this.player.y,
                        width: 4,
                        height: 10,
                        speed: 7,
                        damage: 8,
                        type: 'spread',
                        angle: i * 0.3
                    });
                }
                break;
            case 'laser':
                this.bullets.push({
                    x: this.player.x + this.player.width / 2 - 1,
                    y: this.player.y,
                    width: 2,
                    height: this.canvas.height,
                    speed: 12,
                    damage: 15,
                    type: 'laser'
                });
                break;
            case 'missile':
                if (this.player.missiles > 0) {
                    this.bullets.push({
                        x: this.player.x + this.player.width / 2 - 3,
                        y: this.player.y,
                        width: 6,
                        height: 12,
                        speed: 5,
                        damage: 40,
                        type: 'missile',
                        homing: true
                    });
                    this.player.missiles--;
                }
                break;
        }
    }
    
    updateBullets() {
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            
            // Update position
            bullet.y -= bullet.speed;
            
            // Remove bullets that are off screen
            if (bullet.y + bullet.height < 0) {
                this.bullets.splice(i, 1);
            }
        }
    }
    
    updateEnemies() {
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            
            // Update position
            enemy.y += enemy.speed;
            
            // Remove enemies that are off screen
            if (enemy.y > this.canvas.height) {
                this.enemies.splice(i, 1);
                this.lives--;
                if (this.lives <= 0) {
                    this.gameOver();
                }
            }
        }
    }
    
    updatePowerups() {
        for (let i = this.powerups.length - 1; i >= 0; i--) {
            const powerup = this.powerups[i];
            
            // Update position
            powerup.y += powerup.speed;
            
            // Remove powerups that are off screen
            if (powerup.y > this.canvas.height) {
                this.powerups.splice(i, 1);
            }
        }
    }
    
    updateExplosions() {
        for (let i = this.explosions.length - 1; i >= 0; i--) {
            const explosion = this.explosions[i];
            explosion.frame++;
            
            if (explosion.frame >= explosion.maxFrames) {
                this.explosions.splice(i, 1);
            }
        }
    }
    
    updateParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life--;
            
            if (particle.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }
    
    spawnEnemies() {
        this.enemySpawnTimer++;
        
        if (this.enemySpawnTimer >= this.enemySpawnRate) {
            this.enemySpawnTimer = 0;
            
            const enemyTypes = ['basic', 'fast', 'tank', 'boss'];
            const type = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
            
            const enemy = {
                x: Math.random() * (this.canvas.width - 60),
                y: -60,
                width: 60,
                height: 60,
                speed: type === 'fast' ? 4 : type === 'tank' ? 1 : 2,
                health: type === 'tank' ? 100 : type === 'boss' ? 200 : 20,
                maxHealth: type === 'tank' ? 100 : type === 'boss' ? 200 : 20,
                type: type
            };
            
            this.enemies.push(enemy);
        }
    }
    
    spawnPowerups() {
        this.powerupSpawnTimer++;
        
        if (this.powerupSpawnTimer >= this.powerupSpawnRate) {
            this.powerupSpawnTimer = 0;
            
            const powerupTypes = ['health', 'shield', 'weapon', 'missile'];
            const type = powerupTypes[Math.floor(Math.random() * powerupTypes.length)];
            
            const powerup = {
                x: Math.random() * (this.canvas.width - 30),
                y: -30,
                width: 30,
                height: 30,
                speed: 2,
                type: type
            };
            
            this.powerups.push(powerup);
        }
    }
    
    checkCollisions() {
        // Check bullet-enemy collisions
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            
            for (let j = this.enemies.length - 1; j >= 0; j--) {
                const enemy = this.enemies[j];
                
                if (this.isColliding(bullet, enemy)) {
                    // Damage enemy
                    enemy.health -= bullet.damage;
                    
                    // Remove bullet
                    this.bullets.splice(i, 1);
                    
                    // Check if enemy is destroyed
                    if (enemy.health <= 0) {
                        this.enemies.splice(j, 1);
                        this.score += enemy.type === 'boss' ? 500 : enemy.type === 'tank' ? 200 : 100;
                        this.enemiesDestroyed++;
                        this.combo++;
                        
                        // Create explosion
                        this.createExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
                    }
                    
                    break;
                }
            }
        }
        
        // Check player-enemy collisions
        if (this.player.invulnerable === 0) {
            for (let i = this.enemies.length - 1; i >= 0; i--) {
                const enemy = this.enemies[i];
                
                if (this.isColliding(this.player, enemy)) {
                    this.lives--;
                    this.player.invulnerable = 120; // 2 seconds at 60fps
                    this.combo = 0;
                    
                    // Create explosion
                    this.createExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
                    
                    // Remove enemy
                    this.enemies.splice(i, 1);
                    
                    if (this.lives <= 0) {
                        this.gameOver();
                    }
                }
            }
        }
        
        // Check player-powerup collisions
        for (let i = this.powerups.length - 1; i >= 0; i--) {
            const powerup = this.powerups[i];
            
            if (this.isColliding(this.player, powerup)) {
                this.collectPowerup(powerup);
                this.powerups.splice(i, 1);
            }
        }
    }
    
    isColliding(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }
    
    collectPowerup(powerup) {
        this.powerupsCollected++;
        
        switch (powerup.type) {
            case 'health':
                this.player.health = Math.min(this.player.health + 30, this.player.maxHealth);
                break;
            case 'shield':
                this.player.shield = Math.min(this.player.shield + 50, 100);
                break;
            case 'weapon':
                const weapons = ['basic', 'plasma', 'spread', 'laser', 'missile'];
                this.currentWeapon = weapons[Math.floor(Math.random() * weapons.length)];
                break;
            case 'missile':
                this.player.missiles += 5;
                break;
        }
    }
    
    createExplosion(x, y) {
        this.explosions.push({
            x: x - 25,
            y: y - 25,
            width: 50,
            height: 50,
            frame: 0,
            maxFrames: 8
        });
        
        // Create particles
        for (let i = 0; i < 10; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 10,
                vy: (Math.random() - 0.5) * 10,
                life: 30
            });
        }
    }
    
    render() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw background
        this.drawBackground();
        
        // Draw game objects
        this.drawPlayer();
        this.drawBullets();
        this.drawEnemies();
        this.drawPowerups();
        this.drawExplosions();
        this.drawParticles();
        
        // Draw UI
        this.drawUI();
    }
    
    drawBackground() {
        // Draw starfield
        this.ctx.fillStyle = '#000033';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw stars
        this.ctx.fillStyle = '#ffffff';
        for (let i = 0; i < 100; i++) {
            const x = (i * 37) % this.canvas.width;
            const y = (i * 73 + Date.now() * 0.01) % this.canvas.height;
            this.ctx.fillRect(x, y, 1, 1);
        }
    }
    
    drawPlayer() {
        if (this.player.invulnerable > 0 && Math.floor(this.player.invulnerable / 10) % 2) {
            return; // Blink when invulnerable
        }
        
        this.ctx.fillStyle = '#00ffff';
        this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);
        
        // Draw shield
        if (this.player.shield > 0) {
            this.ctx.strokeStyle = '#00ffff';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.arc(this.player.x + this.player.width / 2, this.player.y + this.player.height / 2, 
                        this.player.width / 2 + 10, 0, Math.PI * 2);
            this.ctx.stroke();
        }
    }
    
    drawBullets() {
        this.ctx.fillStyle = '#ffff00';
        for (const bullet of this.bullets) {
            this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        }
    }
    
    drawEnemies() {
        for (const enemy of this.enemies) {
            switch (enemy.type) {
                case 'basic':
                    this.ctx.fillStyle = '#ff0000';
                    break;
                case 'fast':
                    this.ctx.fillStyle = '#ff6600';
                    break;
                case 'tank':
                    this.ctx.fillStyle = '#660066';
                    break;
                case 'boss':
                    this.ctx.fillStyle = '#ff0066';
                    break;
            }
            this.ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
        }
    }
    
    drawPowerups() {
        for (const powerup of this.powerups) {
            switch (powerup.type) {
                case 'health':
                    this.ctx.fillStyle = '#00ff00';
                    break;
                case 'shield':
                    this.ctx.fillStyle = '#00ffff';
                    break;
                case 'weapon':
                    this.ctx.fillStyle = '#ffff00';
                    break;
                case 'missile':
                    this.ctx.fillStyle = '#ff00ff';
                    break;
            }
            this.ctx.fillRect(powerup.x, powerup.y, powerup.width, powerup.height);
        }
    }
    
    drawExplosions() {
        for (const explosion of this.explosions) {
            const alpha = 1 - (explosion.frame / explosion.maxFrames);
            this.ctx.fillStyle = `rgba(255, 255, 0, ${alpha})`;
            this.ctx.fillRect(explosion.x, explosion.y, explosion.width, explosion.height);
        }
    }
    
    drawParticles() {
        this.ctx.fillStyle = '#ffff00';
        for (const particle of this.particles) {
            this.ctx.fillRect(particle.x, particle.y, 2, 2);
        }
    }
    
    drawUI() {
        // Draw health bar
        const healthBarWidth = 200;
        const healthBarHeight = 20;
        const healthBarX = 10;
        const healthBarY = 10;
        
        this.ctx.fillStyle = '#333333';
        this.ctx.fillRect(healthBarX, healthBarY, healthBarWidth, healthBarHeight);
        
        this.ctx.fillStyle = '#00ff00';
        this.ctx.fillRect(healthBarX, healthBarY, (this.player.health / this.player.maxHealth) * healthBarWidth, healthBarHeight);
        
        // Draw shield bar
        if (this.player.shield > 0) {
            this.ctx.fillStyle = '#00ffff';
            this.ctx.fillRect(healthBarX, healthBarY + healthBarHeight + 5, (this.player.shield / 100) * healthBarWidth, healthBarHeight);
        }
    }
    
    updateUI() {
        const scoreElement = document.getElementById('score');
        const livesElement = document.getElementById('lives');
        const levelElement = document.getElementById('level');
        const comboElement = document.getElementById('combo');
        
        if (scoreElement) scoreElement.textContent = this.score;
        if (livesElement) livesElement.textContent = this.lives;
        if (levelElement) levelElement.textContent = this.level;
        if (comboElement) comboElement.textContent = this.combo;
    }
    
    saveHighScore() {
        // Save to localStorage
        const highScores = JSON.parse(localStorage.getItem('highScores') || '[]');
        highScores.push({
            score: this.score,
            date: new Date().toISOString(),
            survivalTime: this.survivalTime,
            enemiesDestroyed: this.enemiesDestroyed,
            powerupsCollected: this.powerupsCollected
        });
        
        // Sort by score (highest first)
        highScores.sort((a, b) => b.score - a.score);
        
        // Keep only top 10
        highScores.splice(10);
        
        localStorage.setItem('highScores', JSON.stringify(highScores));
    }
    
    getPlayerSpriteName() {
        const spriteMap = {
            "starfighter": "player-fighter",
            "interceptor": "player-interceptor",
            "destroyer": "player-destroyer",
            "stealth": "player-fighter",
            "elite": "player-interceptor"
        };
        return spriteMap[this.currentShipType] || "player-fighter";
    }
}
