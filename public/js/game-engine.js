// Enhanced Game Engine
class EnhancedSpaceShooter {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gameState = 'menu';
        
        // Initialize sprite manager
        this.spriteManager = new SpriteManager();
        
        // Game stats
        this.score = 0;
        this.lives = 25; // Player starts with 25 lives
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
        
        // Enhanced weapon system with multiple weapon types
        this.currentWeapon = 'basic';
        this.weaponLevel = 1;
        this.lastShot = 0;
        this.shotCooldown = 250;
        this.rapidFireMode = false;
        this.rapidFireTimer = 0;
        this.rapidFireCooldown = 30; // Even faster rapid fire
        this.weaponAmmo = {
            basic: Infinity,
            plasma: 75,
            spread: 50,
            laser: 40,
            missile: 15,
            rapidRifle: 150,
            shotgun: 30,
            flamethrower: 60,
            lightning: 45,
            iceCannon: 35
        };
        
        // Ship type and economy
        this.currentShipType = 'starfighter';
        this.money = 0;
        
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
        
        // AI settings
        this.aiMode = false;
        this.aiDifficulty = 'normal';
        
        // Initialize canvas
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        
        // Initialize input system
        this.keys = {};
        this.initInput();
        
        // Load sprites
        this.spriteManager.loadSprites();
        
        // Initialize game
        this.init();
    }
    
    resizeCanvas() {
        const container = document.getElementById('gameContainer');
        const containerRect = container.getBoundingClientRect();
        
        // Set canvas size to fit container while maintaining aspect ratio
        const maxWidth = Math.min(containerRect.width - 40, 1000);
        const maxHeight = Math.min(containerRect.height - 40, 700);
        
        // Round to whole numbers to avoid decimal issues
        this.canvas.width = Math.round(maxWidth);
        this.canvas.height = Math.round(maxHeight);
        
        // Update player position to center of canvas
        this.player.x = this.canvas.width / 2 - this.player.width / 2;
        this.player.y = this.canvas.height - this.player.height - 20;
        
        console.log(`Canvas resized to ${this.canvas.width}x${this.canvas.height}`);
    }
    
    initInput() {
        // Keyboard event listeners
        document.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });
    }
    
    init() {
        // Initialize game state
        this.gameState = 'menu';
        this.score = 0;
        this.lives = 25;
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
        console.log('🎮 Game starting, current state:', this.gameState);
        this.gameState = 'playing';
        this.startTime = Date.now();
        
        // Don't call init() here as it resets the game state to 'menu'
        // this.init();
        
        // Ensure player is positioned correctly for the game
        this.player.x = this.canvas.width / 2 - this.player.width / 2;
        this.player.y = this.canvas.height - this.player.height - 20;
        this.player.health = this.player.maxHealth;
        this.player.shield = 0;
        this.player.invulnerable = 0;
        this.lives = 25; // Ensure 25 lives
        
        // Reset game objects for new game
        this.bullets = [];
        this.enemies = [];
        this.powerups = [];
        this.explosions = [];
        this.particles = [];
        
        // Reset timers
        this.enemySpawnTimer = 0;
        this.powerupSpawnTimer = 0;
        
        // Hide menu and show UI
        document.getElementById('menu').style.display = 'none';
        document.getElementById('gameContainer').classList.add('playing');
        
        console.log('🎮 Game state set to playing, starting game loop...');
        console.log('🎮 Player positioned at:', this.player.x, this.player.y);
        
        // Initialize touch controls
        this.initTouchControls();
        
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
        
        // Save high score
        this.saveHighScore();
    }
    
    gameLoop() {
        if (this.gameState !== 'playing') {
            console.log('🔄 Game loop stopped, state:', this.gameState);
            return;
        }
        
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
        
        // Debug: Log game state every 60 frames (once per second at 60fps)
        if (this.survivalTime % 60 === 0) {
            console.log('🔄 Game update - State:', this.gameState, 'Lives:', this.lives, 'Score:', this.score);
        }
    }
    
    updatePlayer() {
        // Debug keys object
        if (!this.keys) {
            console.log('⚠️ No keys object available');
            return;
        }
        
        // Handle player movement
        if (this.keys['ArrowLeft'] && this.player.x > 0) {
            this.player.x -= this.player.speed;
        }
        if (this.keys['ArrowRight'] && this.player.x < this.canvas.width - this.player.width) {
            this.player.x += this.player.speed;
        }
        if (this.keys['ArrowUp'] && this.player.y > 0) {
            this.player.y -= this.player.speed;
        }
        if (this.keys['ArrowDown'] && this.player.y < this.canvas.height - this.player.height) {
            this.player.y += this.player.speed;
        }
        
        // Handle shooting
        if (this.keys[' '] && Date.now() - this.lastShot > this.shotCooldown) {
            this.shoot();
        }
        
        // Weapon switching with number keys
        if (this.keys['1']) this.currentWeapon = 'basic';
        if (this.keys['2']) this.currentWeapon = 'plasma';
        if (this.keys['3']) this.currentWeapon = 'spread';
        if (this.keys['4']) this.currentWeapon = 'laser';
        if (this.keys['5']) this.currentWeapon = 'missile';
        if (this.keys['6']) this.currentWeapon = 'rapidRifle';
        
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
        
        // Check ammo for current weapon
        if (this.weaponAmmo[this.currentWeapon] <= 0) {
            // Switch to basic weapon if out of ammo
            this.currentWeapon = 'basic';
            return;
        }
        
        // Handle rapid fire mode - enhanced for all weapons
        if (this.rapidFireMode) {
            if (now - this.rapidFireTimer < this.rapidFireCooldown) return;
            this.rapidFireTimer = now;
        } else {
            if (now - this.lastShot < this.shotCooldown) return;
            this.lastShot = now;
        }
        
        // Consume ammo (except for basic weapon)
        if (this.currentWeapon !== 'basic') {
            this.weaponAmmo[this.currentWeapon]--;
        }
        
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
                break;
            case 'rapidRifle':
                // Rapid rifle fires multiple small bullets
                for (let i = 0; i < 3; i++) {
                    this.bullets.push({
                        x: this.player.x + this.player.width / 2 - 1 + (i - 1) * 3,
                        y: this.player.y,
                        width: 2,
                        height: 8,
                        speed: 10,
                        damage: 5,
                        type: 'rapidRifle',
                        spread: i
                    });
                }
                break;
            case 'shotgun':
                // Shotgun fires 5 pellets in a spread
                for (let i = -2; i <= 2; i++) {
                    this.bullets.push({
                        x: this.player.x + this.player.width / 2 - 2 + i * 8,
                        y: this.player.y,
                        width: 3,
                        height: 8,
                        speed: 6,
                        damage: 12,
                        type: 'shotgun',
                        angle: i * 0.2
                    });
                }
                break;
            case 'flamethrower':
                // Flamethrower creates a cone of fire
                for (let i = -1; i <= 1; i++) {
                    this.bullets.push({
                        x: this.player.x + this.player.width / 2 - 3 + i * 6,
                        y: this.player.y,
                        width: 6,
                        height: 12,
                        speed: 4,
                        damage: 18,
                        type: 'flamethrower',
                        angle: i * 0.4
                    });
                }
                break;
            case 'lightning':
                // Lightning creates electric arcs
                this.bullets.push({
                    x: this.player.x + this.player.width / 2 - 2,
                    y: this.player.y,
                    width: 4,
                    height: 20,
                    speed: 9,
                    damage: 30,
                    type: 'lightning'
                });
                break;
            case 'iceCannon':
                // Ice cannon freezes enemies
                this.bullets.push({
                    x: this.player.x + this.player.width / 2 - 3,
                    y: this.player.y,
                    width: 6,
                    height: 14,
                    speed: 7,
                    damage: 20,
                    type: 'iceCannon',
                    freeze: true
                });
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
            
            const powerupTypes = [
                'health', 'shield', 'weapon', 'missile', 'rapidRifle', 'ammo', 
                'coin', 'gem', 'money', 'diamond', 'shotgun', 'flamethrower', 
                'lightning', 'iceCannon', 'rapidFire'
            ];
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
                        this.maxCombo = Math.max(this.maxCombo, this.combo);
                        
                        // Add money based on enemy type
                        if (enemy.type === 'boss') {
                            this.money += 100;
                        } else if (enemy.type === 'tank') {
                            this.money += 25;
                        } else {
                            this.money += 10;
                        }
                        
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
                const weapons = ['basic', 'plasma', 'spread', 'laser', 'missile', 'rapidRifle'];
                this.currentWeapon = weapons[Math.floor(Math.random() * weapons.length)];
                break;
            case 'missile':
                this.player.missiles += 5;
                break;
            case 'rapidRifle':
                this.currentWeapon = 'rapidRifle';
                this.rapidFireMode = true;
                this.weaponAmmo.rapidRifle += 50;
                break;
            case 'rapidFire':
                // Rapid fire powerup for any weapon
                this.rapidFireMode = true;
                // Set a timer to disable rapid fire after 10 seconds
                setTimeout(() => {
                    this.rapidFireMode = false;
                }, 10000);
                break;
            case 'shotgun':
                this.currentWeapon = 'shotgun';
                this.weaponAmmo.shotgun += 30;
                break;
            case 'flamethrower':
                this.currentWeapon = 'flamethrower';
                this.weaponAmmo.flamethrower += 40;
                break;
            case 'lightning':
                this.currentWeapon = 'lightning';
                this.weaponAmmo.lightning += 35;
                break;
            case 'iceCannon':
                this.currentWeapon = 'iceCannon';
                this.weaponAmmo.iceCannon += 25;
                break;
            case 'ammo':
                // Refill all weapon ammo
                for (const weapon in this.weaponAmmo) {
                    if (weapon !== 'basic') {
                        this.weaponAmmo[weapon] += 25;
                    }
                }
                break;
            case 'coin':
                this.money += 5;
                break;
            case 'gem':
                this.money += 25;
                break;
            case 'money':
                this.money += 50;
                break;
            case 'diamond':
                this.money += 100;
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
        
        // Debug: Log render calls
        if (this.survivalTime % 60 === 0) {
            console.log('🎨 Game render - Canvas size:', this.canvas.width, 'x', this.canvas.height);
            console.log('🎨 Player position:', this.player.x, this.player.y, 'Size:', this.player.width, 'x', this.player.height);
            console.log('🎨 Enemies count:', this.enemies.length, 'Bullets count:', this.bullets.length);
        }
    }
    
    drawBackground() {
        // Debug: Log background drawing
        if (this.survivalTime % 60 === 0) {
            console.log('🎨 Drawing background, canvas size:', this.canvas.width, 'x', this.canvas.height);
        }
        
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
        
        // Debug: Log player drawing
        if (this.survivalTime % 60 === 0) {
            console.log('🎨 Drawing player at:', this.player.x, this.player.y, 'Size:', this.player.width, 'x', this.player.height);
        }
        
        // Use sprite if available, fallback to colored rectangle
        if (this.spriteManager && this.spriteManager.isSpriteLoaded('player-fighter')) {
            this.spriteManager.drawSprite(this.ctx, 'player-fighter', this.player.x, this.player.y, this.player.width, this.player.height);
        } else {
            // Fallback to colored rectangle
            this.ctx.fillStyle = '#00ffff';
            this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);
        }
        
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
        for (const bullet of this.bullets) {
            // Different colors and effects for different bullet types
            switch (bullet.type) {
                case 'basic':
                    this.ctx.fillStyle = '#ffff00';
                    this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
                    break;
                case 'plasma':
                    this.ctx.fillStyle = '#ff00ff';
                    this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
                    // Add plasma glow
                    this.ctx.shadowColor = '#ff00ff';
                    this.ctx.shadowBlur = 5;
                    this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
                    this.ctx.shadowBlur = 0;
                    break;
                case 'spread':
                    this.ctx.fillStyle = '#00ffff';
                    this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
                    break;
                case 'laser':
                    this.ctx.fillStyle = '#ff0000';
                    this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
                    // Add laser glow
                    this.ctx.shadowColor = '#ff0000';
                    this.ctx.shadowBlur = 8;
                    this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
                    this.ctx.shadowBlur = 0;
                    break;
                case 'missile':
                    this.ctx.fillStyle = '#ff6600';
                    this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
                    break;
                case 'rapidRifle':
                    this.ctx.fillStyle = '#ffaa00';
                    this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
                    break;
            }
        }
    }
    
    drawEnemies() {
        for (const enemy of this.enemies) {
            // Use sprite if available, fallback to colored rectangle
            let spriteName = '';
            let fallbackColor = '#ff0000';
            
            switch (enemy.type) {
                case 'basic':
                    spriteName = 'enemy-basic';
                    fallbackColor = '#ff0000';
                    break;
                case 'fast':
                    spriteName = 'enemy-fast';
                    fallbackColor = '#ff6600';
                    break;
                case 'tank':
                    spriteName = 'enemy-tank';
                    fallbackColor = '#660066';
                    break;
                case 'boss':
                    spriteName = 'enemy-boss';
                    fallbackColor = '#ff0066';
                    break;
            }
            
            if (this.spriteManager && this.spriteManager.isSpriteLoaded(spriteName)) {
                this.spriteManager.drawSprite(this.ctx, spriteName, enemy.x, enemy.y, enemy.width, enemy.height);
            } else {
                // Fallback to colored rectangle
                this.ctx.fillStyle = fallbackColor;
                this.ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
            }
        }
    }
    
    drawPowerups() {
        for (const powerup of this.powerups) {
            // Use emojis for all powerups
            let emoji = '';
            let color = '#ffffff';
            
            switch (powerup.type) {
                case 'health':
                    emoji = '❤️';
                    color = '#ff0000';
                    break;
                case 'shield':
                    emoji = '🛡️';
                    color = '#00ffff';
                    break;
                case 'weapon':
                    emoji = '⚡';
                    color = '#ffff00';
                    break;
                case 'missile':
                    emoji = '🚀';
                    color = '#ff00ff';
                    break;
                            case 'rapidRifle':
                emoji = '🔫';
                color = '#ff6600';
                break;
            case 'shotgun':
                emoji = '💥';
                color = '#ff4500';
                break;
            case 'flamethrower':
                emoji = '🔥';
                color = '#ff8c00';
                break;
            case 'lightning':
                emoji = '⚡';
                color = '#ffff00';
                break;
            case 'iceCannon':
                emoji = '❄️';
                color = '#87ceeb';
                break;
            case 'ammo':
                emoji = '📦';
                color = '#00ff00';
                break;
                case 'coin':
                    emoji = '🪙';
                    color = '#ffd700';
                    break;
                case 'gem':
                    emoji = '💎';
                    color = '#ff69b4';
                    break;
                case 'money':
                    emoji = '💰';
                    color = '#32cd32';
                    break;
                case 'diamond':
                    emoji = '💠';
                    color = '#00bfff';
                    break;
            }
            
            // Draw emoji
            this.ctx.font = '24px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(emoji, powerup.x + powerup.width / 2, powerup.y + powerup.height / 2);
            
            // Draw glow effect
            this.ctx.shadowColor = color;
            this.ctx.shadowBlur = 10;
            this.ctx.fillText(emoji, powerup.x + powerup.width / 2, powerup.y + powerup.height / 2);
            this.ctx.shadowBlur = 0;
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
        // Enhanced UI with better visibility
        
        // Draw health bar with better contrast
        const healthBarWidth = 200;
        const healthBarHeight = 20;
        const healthBarX = 10;
        const healthBarY = 10;
        
        // Health bar background
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(healthBarX - 2, healthBarY - 2, healthBarWidth + 4, healthBarHeight + 4);
        this.ctx.fillStyle = '#333333';
        this.ctx.fillRect(healthBarX, healthBarY, healthBarWidth, healthBarHeight);
        
        // Health bar fill
        this.ctx.fillStyle = '#00ff00';
        this.ctx.fillRect(healthBarX, healthBarY, (this.player.health / this.player.maxHealth) * healthBarWidth, healthBarHeight);
        
        // Health text
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 12px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(`HP: ${this.player.health}/${this.player.maxHealth}`, healthBarX + healthBarWidth/2, healthBarY + healthBarHeight/2);
        
        // Draw shield bar
        if (this.player.shield > 0) {
            this.ctx.fillStyle = '#000000';
            this.ctx.fillRect(healthBarX - 2, healthBarY + healthBarHeight + 3, healthBarWidth + 4, healthBarHeight + 4);
            this.ctx.fillStyle = '#333333';
            this.ctx.fillRect(healthBarX, healthBarY + healthBarHeight + 5, healthBarWidth, healthBarHeight);
            this.ctx.fillStyle = '#00ffff';
            this.ctx.fillRect(healthBarX, healthBarY + healthBarHeight + 5, (this.player.shield / 100) * healthBarWidth, healthBarHeight);
        }
        
        // Draw weapon info with better styling
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 16px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = 'top';
        
        const weaponY = healthBarY + healthBarHeight * 2 + 20;
        
        // Weapon background
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(healthBarX - 5, weaponY - 5, 300, 60);
        this.ctx.strokeStyle = '#00ffff';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(healthBarX - 5, weaponY - 5, 300, 60);
        
        // Weapon name
        this.ctx.fillStyle = '#ffff00';
        this.ctx.fillText(`Weapon: ${this.currentWeapon.toUpperCase()}`, healthBarX, weaponY);
        
        // Show ammo for current weapon (if not basic)
        if (this.currentWeapon !== 'basic') {
            this.ctx.fillStyle = '#ffaa00';
            this.ctx.fillText(`Ammo: ${this.weaponAmmo[this.currentWeapon]}`, healthBarX, weaponY + 20);
        }
        
        // Show rapid fire status
        if (this.rapidFireMode) {
            this.ctx.fillStyle = '#ff0000';
            this.ctx.font = 'bold 18px Arial';
            this.ctx.fillText('🔥 RAPID FIRE! 🔥', healthBarX + 250, weaponY);
        }
        
        // Draw lives indicator
        this.ctx.fillStyle = '#ff0000';
        this.ctx.font = 'bold 20px Arial';
        this.ctx.textAlign = 'right';
        this.ctx.fillText(`❤️ ${this.lives}`, this.canvas.width - 20, 30);
        
        // Draw score
        this.ctx.fillStyle = '#ffff00';
        this.ctx.font = 'bold 24px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(`Score: ${this.score}`, this.canvas.width / 2, 30);
    }
    
    updateUI() {
        const scoreElement = document.getElementById('score');
        const livesElement = document.getElementById('lives');
        const levelElement = document.getElementById('level');
        const comboElement = document.getElementById('combo');
        const moneyElement = document.getElementById('money');
        const coinsElement = document.getElementById('coins');
        const gemsElement = document.getElementById('gems');
        const diamondsElement = document.getElementById('diamonds');
        
        if (scoreElement) scoreElement.textContent = this.score;
        if (livesElement) livesElement.textContent = this.lives;
        if (levelElement) levelElement.textContent = this.level;
        if (comboElement) comboElement.textContent = this.combo;
        if (moneyElement) moneyElement.textContent = this.money;
        
        // Calculate other currency types from money
        const coins = Math.floor(this.money / 5);
        const gems = Math.floor(this.money / 25);
        const diamonds = Math.floor(this.money / 100);
        
        if (coinsElement) coinsElement.textContent = coins;
        if (gemsElement) gemsElement.textContent = gems;
        if (diamondsElement) diamondsElement.textContent = diamonds;
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
    
    // Store and game management methods
    openStore() {
        console.log('🏪 Opening ship store...');
        // TODO: Implement store UI
        alert('Ship store coming soon!');
    }
    
    closeStore() {
        console.log('🏪 Closing ship store...');
        // TODO: Implement store close
    }
    
    buyShip(shipType) {
        console.log('🛒 Buying ship:', shipType);
        
        const shipPrices = {
            'starfighter': 0,
            'interceptor': 1000,
            'destroyer': 2500,
            'stealth': 5000,
            'elite': 10000
        };
        
        const price = shipPrices[shipType];
        
        if (this.money >= price) {
            this.money -= price;
            this.currentShipType = shipType;
            
            // Apply ship bonuses
            switch (shipType) {
                case 'interceptor':
                    this.player.speed = 8;
                    this.player.maxHealth = 80;
                    break;
                case 'destroyer':
                    this.player.speed = 3;
                    this.player.maxHealth = 150;
                    this.player.shield = 50;
                    break;
                case 'stealth':
                    this.player.speed = 6;
                    this.player.maxHealth = 100;
                    // Stealth ability could be implemented here
                    break;
                case 'elite':
                    this.player.speed = 7;
                    this.player.maxHealth = 200;
                    this.player.shield = 100;
                    break;
                default:
                    this.player.speed = 5;
                    this.player.maxHealth = 100;
                    this.player.shield = 0;
            }
            
            this.player.health = this.player.maxHealth;
            console.log(`✅ Ship ${shipType} purchased for $${price}!`);
            return true;
        } else {
            console.log(`❌ Not enough money! Need $${price}, have $${this.money}`);
            return false;
        }
    }
    
    loadGame() {
        console.log('📂 Loading saved game...');
        // TODO: Implement game loading
        return false; // No saved game for now
    }
    
    saveGame() {
        console.log('💾 Saving game...');
        // TODO: Implement game saving
        const gameData = {
            score: this.score,
            lives: this.lives,
            level: this.level,
            money: this.money,
            currentShipType: this.currentShipType,
            timestamp: Date.now()
        };
        localStorage.setItem('savedGame', JSON.stringify(gameData));
        console.log('✅ Game saved to localStorage');
    }
    
    loadGame() {
        console.log('📂 Loading saved game...');
        const savedGame = localStorage.getItem('savedGame');
        
        if (savedGame) {
            try {
                const gameData = JSON.parse(savedGame);
                this.score = gameData.score || 0;
                this.lives = gameData.lives || 25;
                this.level = gameData.level || 1;
                this.money = gameData.money || 0;
                this.currentShipType = gameData.currentShipType || 'starfighter';
                
                // Apply ship bonuses
                this.buyShip(this.currentShipType);
                
                console.log('✅ Game loaded from localStorage');
                return true;
            } catch (error) {
                console.error('❌ Error loading game:', error);
                return false;
            }
        }
        
        console.log('❌ No saved game found');
        return false;
    }
    
    showHighScores() {
        console.log('🏆 Showing high scores...');
        // TODO: Implement high score display
        alert('High scores coming soon!');
    }
    
    checkForGameUpdates() {
        console.log('🔄 Checking for game updates...');
        // TODO: Implement update checking
        alert('Update system coming soon!');
    }
    
    initTouchControls() {
        console.log('📱 Initializing touch controls...');
        const canvas = this.canvas;
        
        // Touch start
        canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (this.gameState !== 'playing') return;
            
            const touch = e.touches[0];
            const rect = canvas.getBoundingClientRect();
            const x = touch.clientX - rect.left;
            const y = touch.clientY - rect.top;
            
            // Convert to canvas coordinates
            const canvasX = (x / rect.width) * canvas.width;
            const canvasY = (y / rect.height) * canvas.height;
            
            // Move player to touch position
            this.player.x = Math.max(0, Math.min(canvas.width - this.player.width, canvasX - this.player.width / 2));
            this.player.y = Math.max(0, Math.min(canvas.height - this.player.height, canvasY - this.player.height / 2));
            
            // Auto-shoot on touch
            this.shoot();
        });
        
        // Touch move
        canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (this.gameState !== 'playing') return;
            
            const touch = e.touches[0];
            const rect = canvas.getBoundingClientRect();
            const x = touch.clientX - rect.left;
            const y = touch.clientY - rect.top;
            
            // Convert to canvas coordinates
            const canvasX = (x / rect.width) * canvas.width;
            const canvasY = (y / rect.height) * canvas.height;
            
            // Move player to touch position
            this.player.x = Math.max(0, Math.min(canvas.width - this.player.width, canvasX - this.player.width / 2));
            this.player.y = Math.max(0, Math.min(canvas.height - this.player.height, canvasY - this.player.height / 2));
        });
        
        console.log('✅ Touch controls initialized');
    }
}
