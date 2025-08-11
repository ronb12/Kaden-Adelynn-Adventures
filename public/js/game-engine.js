// Enhanced Game Engine
class EnhancedSpaceShooter {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gameState = 'menu';
        
        // Initialize sprite manager
        this.spriteManager = new SpriteManager();
        
        // Initialize input handling
        this.keys = {};
        
        // Game stats
        this.score = 0;
        this.lives = 25; // Player starts with 25 lives
        this.level = 1;
        this.combo = 0;
        this.maxCombo = 0;
        this.maxStreak = 0;
        this.enemiesDestroyed = 0;
        this.bossesDefeated = 0;
        this.powerupsCollected = 0;
        this.survivalTime = 0;
        
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
        
        // Game settings - DIFFICULTY-BASED BALANCE
        this.difficulty = 'easy'; // Default to easy (kid-friendly)
        this.enemySpawnRate = 120; // Slower enemy spawning (was 60)
        this.enemySpawnTimer = 0;
        this.powerupSpawnRate = 150; // More frequent powerups (was 300)
        this.powerupSpawnTimer = 0;
        
        // KID MODE: Bonus rewards for extended survival
        this.bonusLifeTimer = 0;
        this.bonusLifeInterval = 1800; // Give bonus life every 30 seconds (1800 frames at 60fps)
        this.bonusShieldTimer = 0;
        this.bonusShieldInterval = 900; // Give bonus shield every 15 seconds (900 frames at 60fps)
        
        // Difficulty multipliers
        this.difficultyMultipliers = {
            easy: {
                enemySpawnRate: 1.5,      // 1.5x slower spawning
                enemyHealth: 0.7,         // 30% less health
                enemySpeed: 0.8,          // 20% slower
                powerupSpawnRate: 1.5,    // 1.5x more powerups
                bonusLifeInterval: 0.8,   // 20% faster bonus lives
                bonusShieldInterval: 0.8, // 20% faster bonus shields
                playerDamage: 1.3,        // 30% more damage
                startingLives: 25         // 25 starting lives
            },
            medium: {
                enemySpawnRate: 1.0,      // Normal spawning
                enemyHealth: 1.0,         // Normal health
                enemySpeed: 1.0,          // Normal speed
                powerupSpawnRate: 1.0,    // Normal powerup rate
                bonusLifeInterval: 1.0,   // Normal bonus life rate
                bonusShieldInterval: 1.0, // Normal bonus shield rate
                playerDamage: 1.0,        // Normal damage
                startingLives: 15         // 15 starting lives
            },
            hard: {
                enemySpawnRate: 0.7,      // 1.4x faster spawning
                enemyHealth: 1.4,         // 40% more health
                enemySpeed: 1.3,          // 30% faster
                powerupSpawnRate: 0.7,    // 1.4x fewer powerups
                bonusLifeInterval: 1.5,   // 50% slower bonus lives
                bonusShieldInterval: 1.5, // 50% slower bonus shields
                playerDamage: 0.8,        // 20% less damage
                startingLives: 10         // 10 starting lives
            }
        };
        
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
        
        // Load saved difficulty preference
        this.loadDifficultyPreference();
        
        // Expose difficulty setting to global scope
        this.exposeDifficultyToGlobal();
    }
    
    // Expose difficulty methods to global scope for HTML interaction
    exposeDifficultyToGlobal() {
        if (typeof window !== 'undefined') {
            window.game = this;
        }
    }
    
    // Set difficulty and apply multipliers
    setDifficulty(difficulty) {
        if (this.difficultyMultipliers[difficulty]) {
            this.difficulty = difficulty;
            this.applyDifficultyMultipliers();
            console.log(`🎯 Difficulty set to: ${difficulty}`);
        }
    }
    
    // Apply difficulty multipliers to game settings
    applyDifficultyMultipliers() {
        const multipliers = this.difficultyMultipliers[this.difficulty];
        
        // Apply enemy spawn rate multiplier
        this.enemySpawnRate = Math.round(120 * multipliers.enemySpawnRate);
        
        // Apply powerup spawn rate multiplier
        this.powerupSpawnRate = Math.round(150 * multipliers.powerupSpawnRate);
        
        // Apply bonus interval multipliers
        this.bonusLifeInterval = Math.round(1800 * multipliers.bonusLifeInterval);
        this.bonusShieldInterval = Math.round(900 * multipliers.bonusShieldInterval);
        
        // Update starting lives
        this.lives = multipliers.startingLives;
        
        console.log(`🎮 Applied ${this.difficulty} difficulty settings`);
    }
    
    // Load difficulty preference from localStorage
    loadDifficultyPreference() {
        try {
            const saved = localStorage.getItem('gameDifficulty');
            if (saved && this.difficultyMultipliers[saved]) {
                this.setDifficulty(saved);
            }
        } catch (error) {
            console.log('Using default difficulty: easy');
        }
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
            
            // Handle special keys
            if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
                if (this.gameState === 'playing') {
                    this.pauseGame();
                } else if (this.gameState === 'paused') {
                    this.resumeGame();
                }
            }
            
            // Save game shortcut
            if (e.key === 's' || e.key === 'S') {
                if (this.gameState === 'playing') {
                    this.saveGame();
                }
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });
    }
    
    init() {
        console.log('🎮 Initializing game...');
        
        // Initialize canvas and context
        if (!this.canvas || !this.ctx) {
            console.error('❌ Canvas or context not available');
            return;
        }
        
        // Load sprites
        this.spriteManager.loadSprites();
        console.log('✅ Sprites loaded');
        
        // Initialize input handling
        this.initInput();
        console.log('✅ Input initialized');
        
        // Resize canvas to fit screen
        this.resizeCanvas();
        console.log('✅ Canvas resized');
        
        // Initialize game state
        this.gameState = 'menu';
        this.score = 0;
        this.lives = 25;
        this.level = 1;
        this.combo = 0;
        this.maxCombo = 0;
        this.maxStreak = 0;
        this.enemiesDestroyed = 0;
        this.bossesDefeated = 0;
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
        
        console.log('✅ Game initialization complete');
    }
    
    startGame() {
        console.log('🎮 Starting game...');
        this.gameState = 'playing';
        this.startTime = Date.now();
        
        // Show game UI and hide menu
        document.getElementById('menu').style.display = 'none';
        document.getElementById('ui').style.display = 'block';
        document.getElementById('gameContainer').classList.add('playing');
        
        // Show save button
        const saveBtn = document.getElementById('saveBtn');
        if (saveBtn) {
            saveBtn.style.display = 'block';
        }
        
        // Update pause button text
        const pauseBtn = document.getElementById('pauseBtn');
        if (pauseBtn) {
            pauseBtn.textContent = '⏸️';
            pauseBtn.title = 'Pause Game (ESC/P)';
        }
        
        // Start game loop
        this.gameLoop();
        console.log('✅ Game started successfully');
    }
    
    pauseGame() {
        if (this.gameState === 'playing') {
            this.gameState = 'paused';
            
            // Update pause button text
            const pauseBtn = document.getElementById('pauseBtn');
            if (pauseBtn) {
                pauseBtn.textContent = '▶️';
                pauseBtn.title = 'Resume Game (ESC/P)';
            }
            
            // Show pause overlay
            document.getElementById('pauseOverlay').style.display = 'flex';
            
            // Hide save button
            const saveBtn = document.getElementById('saveBtn');
            if (saveBtn) {
                saveBtn.style.display = 'none';
            }
            
            // Update pause overlay stats
            document.getElementById('pauseScore').textContent = this.score;
            document.getElementById('pauseLevel').textContent = this.level;
            document.getElementById('pauseLives').textContent = this.lives;
            document.getElementById('pauseCombo').textContent = this.combo;
            document.getElementById('pauseStreak').textContent = this.maxStreak;
            
            // Calculate accuracy for pause screen
            const accuracy = this.enemiesDestroyed > 0 ? Math.round((this.enemiesDestroyed / (this.enemiesDestroyed + this.bullets.length)) * 100) : 0;
            document.getElementById('pauseAccuracy').textContent = accuracy;
            
            console.log('⏸️ Game paused');
        }
    }
    
    resumeGame() {
        if (this.gameState === 'paused') {
            this.gameState = 'playing';
            
            // Update pause button text
            const pauseBtn = document.getElementById('pauseBtn');
            if (pauseBtn) {
                pauseBtn.textContent = '⏸️';
                pauseBtn.title = 'Pause Game (ESC/P)';
            }
            
            // Show save button
            const saveBtn = document.getElementById('saveBtn');
            if (saveBtn) {
                saveBtn.style.display = 'block';
            }
            
            // Hide pause overlay
            document.getElementById('pauseOverlay').style.display = 'none';
            
            // Resume game loop
            this.gameLoop();
            console.log('▶️ Game resumed');
        }
    }
    
    gameOver() {
        this.gameState = 'gameOver';
        
        // Calculate final stats
        const finalScore = this.score;
        const finalLevel = this.level;
        const finalLives = this.lives;
        const finalCombo = this.combo;
        const finalStreak = this.maxStreak;
        const finalEnemiesDestroyed = this.enemiesDestroyed;
        const finalBossesDefeated = this.bossesDefeated;
        const finalPowerupsCollected = this.powerupsCollected;
        const finalSurvivalTime = Math.floor((Date.now() - this.startTime) / 1000);
        const finalMoney = this.money;
        
        // Calculate accuracy
        const totalShots = this.bullets.length;
        const accuracy = finalEnemiesDestroyed > 0 ? Math.round((finalEnemiesDestroyed / (finalEnemiesDestroyed + totalShots)) * 100) : 0;
        
        // Update game over screen with all current stats
        const gameOverElements = {
            'gameOverScore': finalScore,
            'gameOverLevel': finalLevel,
            'gameOverLives': finalLives,
            'gameOverCombo': finalCombo,
            'gameOverStreak': finalStreak,
            'gameOverEnemiesDestroyed': finalEnemiesDestroyed,
            'gameOverBossesDefeated': finalBossesDefeated,
            'gameOverPowerupsCollected': finalPowerupsCollected,
            'gameOverSurvivalTime': finalSurvivalTime,
            'gameOverMoney': finalMoney,
            'gameOverAccuracy': accuracy,
            'gameOverTotalShots': totalShots
        };
        
        // Update all game over screen elements
        Object.entries(gameOverElements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            } else {
                console.warn(`⚠️ Game over element not found: ${id}`);
            }
        });
        
        // Save high score
        this.saveHighScore();
        
        // Show game over screen
        document.getElementById('gameOver').style.display = 'flex';
        
        // Hide game UI
        document.getElementById('ui').style.display = 'none';
        
        // Hide save button
        const saveBtn = document.getElementById('saveBtn');
        if (saveBtn) {
            saveBtn.style.display = 'none';
        }
        
        console.log('💀 Game Over - Final Score:', finalScore, 'Level:', finalLevel);
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
        
        // KID MODE: Give bonus rewards for extended survival
        this.bonusLifeTimer++;
        this.bonusShieldTimer++;
        
        // Give bonus life every 30 seconds
        if (this.bonusLifeTimer >= this.bonusLifeInterval) {
            this.bonusLifeTimer = 0;
            if (this.lives < 50) { // Cap at 50 lives
                this.lives++;
                console.log('🎁 KID MODE: Bonus life awarded! Lives:', this.lives);
            }
        }
        
        // Give bonus shield every 15 seconds
        if (this.bonusShieldTimer >= this.bonusShieldInterval) {
            this.bonusShieldTimer = 0;
            if (this.player.shield < 100) { // Cap at 100 shield
                this.player.shield = Math.min(100, this.player.shield + 30);
                console.log('🛡️ KID MODE: Bonus shield awarded! Shield:', this.player.shield);
            }
        }
        
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
        
        // Helper function to apply difficulty multiplier to damage
        const getDamage = (baseDamage) => {
            const multipliers = this.difficultyMultipliers[this.difficulty];
            return Math.round(baseDamage * multipliers.playerDamage);
        };
        
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
                    damage: getDamage(20), // Apply difficulty multiplier
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
                    damage: getDamage(25),
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
                        damage: getDamage(8),
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
                    damage: getDamage(15),
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
                    damage: getDamage(40),
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
                        damage: getDamage(5),
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
                        damage: getDamage(12),
                        type: 'shotgun',
                        angle: i * 0.2
                    });
                }
                break;
            case 'flamethrower':
                // 4x Missiles - fires 4 powerful missiles
                for (let i = 0; i < 4; i++) {
                    this.bullets.push({
                        x: this.player.x + this.player.width / 2 - 3 + (i - 1.5) * 8,
                        y: this.player.y,
                        width: 6,
                        height: 12,
                        speed: 6,
                        damage: getDamage(35),
                        type: 'flamethrower',
                        missile: true,
                        spread: i
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
                    damage: getDamage(30),
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
                    damage: getDamage(20),
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
            
            // Apply difficulty multipliers to enemy stats
            const multipliers = this.difficultyMultipliers[this.difficulty];
            const baseSpeed = type === 'fast' ? 3 : type === 'tank' ? 1 : 2;
            const baseHealth = type === 'tank' ? 50 : type === 'boss' ? 80 : 15;
            
            const enemy = {
                x: Math.random() * (this.canvas.width - 60),
                y: -60,
                width: 60,
                height: 60,
                speed: Math.round(baseSpeed * multipliers.enemySpeed),
                health: Math.round(baseHealth * multipliers.enemyHealth),
                maxHealth: Math.round(baseHealth * multipliers.enemyHealth),
                type: type
            };
            
            this.enemies.push(enemy);
        }
    }
    
    spawnPowerups() {
        this.powerupSpawnTimer++;
        
        if (this.powerupSpawnTimer >= this.powerupSpawnRate) {
            this.powerupSpawnTimer = 0;
            
            // KID-FRIENDLY: Weighted powerup spawning - more helpful items!
            const powerupWeights = [
                { type: 'health', weight: 25 },      // 25% chance for health
                { type: 'shield', weight: 20 },      // 20% chance for shield
                { type: 'ammo', weight: 15 },        // 15% chance for ammo
                { type: 'rapidFire', weight: 10 },   // 10% chance for rapid fire
                { type: 'coin', weight: 8 },         // 8% chance for coin
                { type: 'gem', weight: 6 },          // 6% chance for gem
                { type: 'money', weight: 5 },        // 5% chance for money
                { type: 'diamond', weight: 3 },      // 3% chance for diamond
                { type: 'weapon', weight: 3 },       // 3% chance for weapon
                { type: 'missile', weight: 2 },      // 2% chance for missile
                { type: 'rapidRifle', weight: 1 },   // 1% chance for rapid rifle
                { type: 'shotgun', weight: 1 },      // 1% chance for shotgun
                { type: 'flamethrower', weight: 1 }, // 1% chance for 4x missiles
                { type: 'lightning', weight: 1 },    // 1% chance for lightning
                { type: 'iceCannon', weight: 1 }     // 1% chance for ice cannon
            ];
            
            // Select powerup based on weights
            const totalWeight = powerupWeights.reduce((sum, item) => sum + item.weight, 0);
            let random = Math.random() * totalWeight;
            let type = 'health'; // Default to health
            
            for (const item of powerupWeights) {
                random -= item.weight;
                if (random <= 0) {
                    type = item.type;
                    break;
                }
            }
            
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
                        
                        // Track bosses defeated
                        if (enemy.type === 'boss') {
                            this.bossesDefeated++;
                        }
                        
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
                    // KID-FRIENDLY: Much less punishing collision damage
                    // Only lose life if no shield, and reduce invulnerability time
                    if (this.player.shield <= 0) {
                        this.lives--;
                        this.player.invulnerable = 90; // 1.5 seconds at 60fps (was 2 seconds)
                    } else {
                        // Shield absorbs the hit
                        this.player.shield = Math.max(0, this.player.shield - 20);
                        this.player.invulnerable = 60; // 1 second at 60fps
                    }
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
                this.weaponAmmo.flamethrower += 60; // More ammo for 4x missiles
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
        
        // Use sprite if available, fallback to enhanced custom design
        if (this.spriteManager && this.spriteManager.isSpriteLoaded('player-fighter')) {
            this.spriteManager.drawSprite(this.ctx, 'player-fighter', this.player.x, this.player.y, this.player.width, this.player.height);
        } else {
            // Enhanced custom ship design with gradients and effects
            const x = this.player.x;
            const y = this.player.y;
            const w = this.player.width;
            const h = this.player.height;
            
            // Save context for effects
            this.ctx.save();
            
            // Main body - metallic blue gradient
            const bodyGradient = this.ctx.createLinearGradient(x, y, x, y + h);
            bodyGradient.addColorStop(0, '#1e3a8a');    // Dark blue
            bodyGradient.addColorStop(0.5, '#3b82f6');  // Bright blue
            bodyGradient.addColorStop(1, '#1e40af');     // Medium blue
            this.ctx.fillStyle = bodyGradient;
            this.ctx.fillRect(x + w * 0.15, y + h * 0.25, w * 0.7, h * 0.5);
            
            // Nose cone - silver metallic gradient
            const noseGradient = this.ctx.createLinearGradient(x + w * 0.3, y, x + w * 0.7, y);
            noseGradient.addColorStop(0, '#e5e7eb');    // Light silver
            noseGradient.addColorStop(0.5, '#f9fafb');  // White silver
            noseGradient.addColorStop(1, '#d1d5db');    // Dark silver
            
            this.ctx.fillStyle = noseGradient;
            this.ctx.beginPath();
            this.ctx.moveTo(x + w * 0.5, y);
            this.ctx.lineTo(x + w * 0.25, y + h * 0.25);
            this.ctx.lineTo(x + w * 0.75, y + h * 0.25);
            this.ctx.closePath();
            this.ctx.fill();
            
            // Wings - blue with silver edges and gradients
            const wingGradient = this.ctx.createLinearGradient(x, y + h * 0.35, x + w * 0.3, y + h * 0.35);
            wingGradient.addColorStop(0, '#1e40af');    // Dark blue
            wingGradient.addColorStop(0.7, '#3b82f6');  // Bright blue
            wingGradient.addColorStop(1, '#60a5fa');    // Light blue
            
            // Left wing
            this.ctx.fillStyle = wingGradient;
            this.ctx.fillRect(x, y + h * 0.35, w * 0.35, h * 0.25);
            
            // Right wing
            this.ctx.fillRect(x + w * 0.65, y + h * 0.35, w * 0.35, h * 0.25);
            
            // Wing edges - metallic silver
            const edgeGradient = this.ctx.createLinearGradient(x, y + h * 0.35, x + w * 0.05, y + h * 0.35);
            edgeGradient.addColorStop(0, '#fbbf24');    // Gold
            edgeGradient.addColorStop(0.5, '#f59e0b');  // Dark gold
            edgeGradient.addColorStop(1, '#d97706');     // Darker gold
            
            this.ctx.fillStyle = edgeGradient;
            this.ctx.fillRect(x, y + h * 0.35, w * 0.05, h * 0.25);
            this.ctx.fillRect(x + w * 0.95, y + h * 0.35, w * 0.05, h * 0.25);
            
            // Tail fins - blue with gradients
            const tailGradient = this.ctx.createLinearGradient(x + w * 0.1, y + h * 0.65, x + w * 0.25, y + h * 0.65);
            tailGradient.addColorStop(0, '#1e3a8a');    // Dark blue
            tailGradient.addColorStop(1, '#3b82f6');    // Bright blue
            
            this.ctx.fillStyle = tailGradient;
            this.ctx.fillRect(x + w * 0.08, y + h * 0.65, w * 0.18, h * 0.35);
            this.ctx.fillRect(x + w * 0.74, y + h * 0.65, w * 0.18, h * 0.35);
            
            // Engine exhausts - glowing orange/red
            const engineGradient = this.ctx.createRadialGradient(
                x + w * 0.4, y + h * 0.85, 0,
                x + w * 0.4, y + h * 0.85, w * 0.15
            );
            engineGradient.addColorStop(0, '#fbbf24');   // Bright orange
            engineGradient.addColorStop(0.5, '#f59e0b'); // Orange
            engineGradient.addColorStop(1, '#dc2626');   // Red
            
            this.ctx.fillStyle = engineGradient;
            this.ctx.fillRect(x + w * 0.32, y + h * 0.75, w * 0.12, h * 0.25);
            this.ctx.fillRect(x + w * 0.56, y + h * 0.75, w * 0.12, h * 0.25);
            
            // Cockpit - glass-like with reflection
            const cockpitGradient = this.ctx.createRadialGradient(
                x + w * 0.45, y + h * 0.35, 0,
                x + w * 0.45, y + h * 0.35, w * 0.15
            );
            cockpitGradient.addColorStop(0, '#e0f2fe');  // Light blue
            cockpitGradient.addColorStop(0.3, '#b3e5fc'); // Blue
            cockpitGradient.addColorStop(0.7, '#81d4fa'); // Medium blue
            cockpitGradient.addColorStop(1, '#4fc3f7');   // Dark blue
            
            this.ctx.fillStyle = cockpitGradient;
            this.ctx.fillRect(x + w * 0.38, y + h * 0.32, w * 0.24, h * 0.18);
            
            // Cockpit reflection
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            this.ctx.fillRect(x + w * 0.4, y + h * 0.34, w * 0.08, h * 0.06);
            
            // Weapon ports - glowing
            const weaponGradient = this.ctx.createRadialGradient(
                x + w * 0.45, y + h * 0.45, 0,
                x + w * 0.45, y + h * 0.45, w * 0.08
            );
            weaponGradient.addColorStop(0, '#fbbf24');   // Bright orange
            weaponGradient.addColorStop(1, '#f59e0b');   // Orange
            
            this.ctx.fillStyle = weaponGradient;
            this.ctx.fillRect(x + w * 0.42, y + h * 0.42, w * 0.06, h * 0.06);
            this.ctx.fillRect(x + w * 0.52, y + h * 0.42, w * 0.06, h * 0.06);
            
            // Restore context
            this.ctx.restore();
        }
        
        // Draw shield with enhanced effects
        if (this.player.shield > 0) {
            this.ctx.save();
            
            // Shield glow effect
            this.ctx.shadowColor = '#00ffff';
            this.ctx.shadowBlur = 15;
            this.ctx.strokeStyle = '#00ffff';
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            this.ctx.arc(this.player.x + this.player.width / 2, this.player.y + this.player.height / 2, 
                        this.player.width / 2 + 12, 0, Math.PI * 2);
            this.ctx.stroke();
            
            // Inner shield ring
            this.ctx.shadowBlur = 8;
            this.ctx.strokeStyle = '#ffffff';
            this.ctx.lineWidth = 1;
            this.ctx.beginPath();
            this.ctx.arc(this.player.x + this.player.width / 2, this.player.y + this.player.height / 2, 
                        this.player.width / 2 + 8, 0, Math.PI * 2);
            this.ctx.stroke();
            
            this.ctx.restore();
        }
        
        // Draw invulnerability effect
        if (this.player.invulnerable > 0) {
            this.ctx.save();
            this.ctx.globalAlpha = 0.5;
            this.ctx.strokeStyle = '#ffff00';
            this.ctx.lineWidth = 2;
            this.ctx.setLineDash([5, 5]);
            this.ctx.strokeRect(this.player.x - 2, this.player.y - 2, this.player.width + 4, this.player.height + 4);
            this.ctx.restore();
        }
    }
    
    drawBullets() {
        for (const bullet of this.bullets) {
            // Save context for effects
            this.ctx.save();
            
            // Different colors and effects for different bullet types
            switch (bullet.type) {
                case 'basic':
                    // Enhanced basic bullet with glow
                    this.ctx.shadowColor = '#ffff00';
                    this.ctx.shadowBlur = 8;
                    this.ctx.fillStyle = '#ffff00';
                    this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
                    
                    // Add bright center
                    this.ctx.shadowBlur = 0;
                    this.ctx.fillStyle = '#ffffff';
                    this.ctx.fillRect(bullet.x + bullet.width * 0.25, bullet.y + bullet.height * 0.25, 
                                   bullet.width * 0.5, bullet.height * 0.5);
                    break;
                    
                case 'plasma':
                    // Enhanced plasma with stronger glow and trail
                    this.ctx.shadowColor = '#ff00ff';
                    this.ctx.shadowBlur = 12;
                    this.ctx.fillStyle = '#ff00ff';
                    this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
                    
                    // Add plasma trail
                    this.ctx.shadowBlur = 0;
                    this.ctx.fillStyle = 'rgba(255, 0, 255, 0.6)';
                    this.ctx.fillRect(bullet.x + bullet.width, bullet.y, bullet.width * 0.8, bullet.height);
                    
                    // Bright center
                    this.ctx.fillStyle = '#ffffff';
                    this.ctx.fillRect(bullet.x + bullet.width * 0.2, bullet.y + bullet.height * 0.2, 
                                   bullet.width * 0.6, bullet.height * 0.6);
                    break;
                    
                case 'spread':
                    // Enhanced spread with cyan glow
                    this.ctx.shadowColor = '#00ffff';
                    this.ctx.shadowBlur = 10;
                    this.ctx.fillStyle = '#00ffff';
                    this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
                    
                    // Add trail
                    this.ctx.shadowBlur = 0;
                    this.ctx.fillStyle = 'rgba(0, 255, 255, 0.5)';
                    this.ctx.fillRect(bullet.x + bullet.width, bullet.y, bullet.width * 0.6, bullet.height);
                    break;
                    
                case 'laser':
                    // Enhanced laser with strong red glow and beam effect
                    this.ctx.shadowColor = '#ff0000';
                    this.ctx.shadowBlur = 15;
                    this.ctx.fillStyle = '#ff0000';
                    this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
                    
                    // Add laser beam trail
                    this.ctx.shadowBlur = 0;
                    this.ctx.fillStyle = 'rgba(255, 0, 0, 0.7)';
                    this.ctx.fillRect(bullet.x + bullet.width, bullet.y, bullet.width * 1.2, bullet.height);
                    
                    // Bright center
                    this.ctx.fillStyle = '#ffffff';
                    this.ctx.fillRect(bullet.x + bullet.width * 0.15, bullet.y + bullet.height * 0.15, 
                                   bullet.width * 0.7, bullet.height * 0.7);
                    break;
                    
                case 'missile':
                    // Enhanced missile with orange glow and smoke trail
                    this.ctx.shadowColor = '#ff6600';
                    this.ctx.shadowBlur = 10;
                    this.ctx.fillStyle = '#ff6600';
                    this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
                    
                    // Add missile trail
                    this.ctx.shadowBlur = 0;
                    this.ctx.fillStyle = 'rgba(255, 102, 0, 0.4)';
                    this.ctx.fillRect(bullet.x + bullet.width, bullet.y, bullet.width * 0.8, bullet.height);
                    
                    // Bright tip
                    this.ctx.fillStyle = '#ffffff';
                    this.ctx.fillRect(bullet.x, bullet.y + bullet.height * 0.3, bullet.width * 0.3, bullet.height * 0.4);
                    break;
                    
                case 'rapidRifle':
                    // Enhanced rapid rifle with yellow glow
                    this.ctx.shadowColor = '#ffaa00';
                    this.ctx.shadowBlur = 8;
                    this.ctx.fillStyle = '#ffaa00';
                    this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
                    
                    // Add trail
                    this.ctx.shadowBlur = 0;
                    this.ctx.fillStyle = 'rgba(255, 170, 0, 0.5)';
                    this.ctx.fillRect(bullet.x + bullet.width, bullet.y, bullet.width * 0.5, bullet.height);
                    break;
                    
                case 'shotgun':
                    // Enhanced shotgun with white glow
                    this.ctx.shadowColor = '#ffffff';
                    this.ctx.shadowBlur = 10;
                    this.ctx.fillStyle = '#ffffff';
                    this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
                    
                    // Add trail
                    this.ctx.shadowBlur = 0;
                    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
                    this.ctx.fillRect(bullet.x + bullet.width, bullet.y, bullet.width * 0.7, bullet.height);
                    break;
                    
                case 'flamethrower':
                    // Enhanced flamethrower with fire effect
                    this.ctx.shadowColor = '#ff4400';
                    this.ctx.shadowBlur = 12;
                    this.ctx.fillStyle = '#ff4400';
                    this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
                    
                    // Add fire trail
                    this.ctx.shadowBlur = 0;
                    this.ctx.fillStyle = 'rgba(255, 68, 0, 0.6)';
                    this.ctx.fillRect(bullet.x + bullet.width, bullet.y, bullet.width * 1.0, bullet.height);
                    
                    // Bright center
                    this.ctx.fillStyle = '#ffff00';
                    this.ctx.fillRect(bullet.x + bullet.width * 0.2, bullet.y + bullet.height * 0.2, 
                                   bullet.width * 0.6, bullet.height * 0.6);
                    break;
                    
                case 'lightning':
                    // Enhanced lightning with electric effect
                    this.ctx.shadowColor = '#00ffff';
                    this.ctx.shadowBlur = 15;
                    this.ctx.fillStyle = '#00ffff';
                    this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
                    
                    // Add lightning trail
                    this.ctx.shadowBlur = 0;
                    this.ctx.fillStyle = 'rgba(0, 255, 255, 0.7)';
                    this.ctx.fillRect(bullet.x + bullet.width, bullet.y, bullet.width * 1.1, bullet.height);
                    
                    // Bright center
                    this.ctx.fillStyle = '#ffffff';
                    this.ctx.fillRect(bullet.x + bullet.width * 0.15, bullet.y + bullet.height * 0.15, 
                                   bullet.width * 0.7, bullet.height * 0.7);
                    break;
                    
                case 'iceCannon':
                    // Enhanced ice cannon with blue glow
                    this.ctx.shadowColor = '#0088ff';
                    this.ctx.shadowBlur = 10;
                    this.ctx.fillStyle = '#0088ff';
                    this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
                    
                    // Add ice trail
                    this.ctx.shadowBlur = 0;
                    this.ctx.fillStyle = 'rgba(0, 136, 255, 0.5)';
                    this.ctx.fillRect(bullet.x + bullet.width, bullet.y, bullet.width * 0.9, bullet.height);
                    
                    // Bright center
                    this.ctx.fillStyle = '#ffffff';
                    this.ctx.fillRect(bullet.x + bullet.width * 0.2, bullet.y + bullet.height * 0.2, 
                                   bullet.width * 0.6, bullet.height * 0.6);
                    break;
                    
                default:
                    // Default enhanced bullet
                    this.ctx.shadowColor = '#ffffff';
                    this.ctx.shadowBlur = 6;
                    this.ctx.fillStyle = '#ffffff';
                    this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
                    break;
            }
            
            // Restore context
            this.ctx.restore();
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
                emoji = '🚀🚀🚀🚀';
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
        
        // KID MODE: Show bonus reward countdown
        this.ctx.fillStyle = '#00ff00';
        this.ctx.font = 'bold 14px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`🎁 Bonus Life in: ${Math.ceil((this.bonusLifeInterval - this.bonusLifeTimer) / 60)}s`, 10, this.canvas.height - 40);
        this.ctx.fillText(`🛡️ Bonus Shield in: ${Math.ceil((this.bonusShieldInterval - this.bonusShieldTimer) / 60)}s`, 10, this.canvas.height - 20);
        
        // KID MODE: Show special mode indicator
        this.ctx.fillStyle = '#ff69b4';
        this.ctx.font = 'bold 18px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(`🌟 KID MODE 🌟`, this.canvas.width / 2, 60);
        
        // Show current difficulty
        const difficultyColors = {
            easy: '#00ff00',
            medium: '#ffff00', 
            hard: '#ff0000'
        };
        this.ctx.fillStyle = difficultyColors[this.difficulty] || '#ffffff';
        this.ctx.font = 'bold 16px Arial';
        this.ctx.textAlign = 'right';
        this.ctx.fillText(`Difficulty: ${this.difficulty.toUpperCase()}`, this.canvas.width - 20, 60);
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
    
    saveGame() {
        console.log('💾 Saving game...');
        try {
            // Save current game state to localStorage
            const gameData = {
                score: this.score,
                lives: this.lives,
                level: this.level,
                money: this.money,
                currentWeapon: this.currentWeapon,
                weaponLevel: this.weaponLevel,
                currentShipType: this.currentShipType,
                combo: this.combo,
                maxCombo: this.maxCombo,
                maxStreak: this.maxStreak,
                enemiesDestroyed: this.enemiesDestroyed,
                bossesDefeated: this.bossesDefeated,
                powerupsCollected: this.powerupsCollected,
                survivalTime: this.survivalTime,
                timestamp: Date.now()
            };
            
            localStorage.setItem('savedGame', JSON.stringify(gameData));
            console.log('✅ Game saved successfully');
            
            // Show save confirmation
            this.showSaveConfirmation();
        } catch (error) {
            console.error('❌ Error saving game:', error);
            alert('❌ Error saving game. Please try again.');
        }
    }
    
    showSaveConfirmation() {
        // Create a temporary save confirmation message
        const confirmation = document.createElement('div');
        confirmation.textContent = '✅ Game Saved!';
        confirmation.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, #10b981, #059669);
            color: white;
            padding: 15px 25px;
            border-radius: 10px;
            font-weight: bold;
            font-size: 18px;
            z-index: 3000;
            box-shadow: 0 5px 20px rgba(16, 185, 129, 0.4);
            animation: fadeInOut 2s ease-in-out;
        `;
        
        // Add animation CSS
        if (!document.getElementById('saveAnimation')) {
            const style = document.createElement('style');
            style.id = 'saveAnimation';
            style.textContent = `
                @keyframes fadeInOut {
                    0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
                    20% { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
                    80% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                    100% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
                }
            `;
            document.head.appendChild(style);
            console.log('✅ Save animation CSS added');
        }
        
        document.body.appendChild(confirmation);
        console.log('✅ Save confirmation displayed');
        
        // Remove after animation
        setTimeout(() => {
            if (confirmation.parentNode) {
                confirmation.parentNode.removeChild(confirmation);
                console.log('✅ Save confirmation removed');
            }
        }, 2000);
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

// ===== GLOBAL FUNCTION EXPOSURE =====
// These functions are called by the HTML buttons and need to be globally accessible

let currentDifficulty = 'easy';

// Difficulty selection functions
function selectDifficulty(difficulty) {
    console.log('🎯 selectDifficulty called with:', difficulty);
    console.log('Current difficulty:', currentDifficulty);
    
    currentDifficulty = difficulty;
    
    // Update UI
    const currentDifficultyElement = document.getElementById('currentDifficulty');
    console.log('Current difficulty element:', currentDifficultyElement);
    
    if (currentDifficultyElement) {
        currentDifficultyElement.textContent = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
        console.log('✅ Difficulty text updated');
    } else {
        console.error('❌ Current difficulty element not found');
    }
    
    // Remove active class from all buttons
    const allButtons = document.querySelectorAll('.difficulty-btn');
    console.log('Found difficulty buttons:', allButtons.length);
    
    allButtons.forEach(btn => {
        btn.classList.remove('active');
        console.log('Removed active class from:', btn.textContent);
    });
    
    // Add active class to selected button
    const selectedBtn = document.getElementById(difficulty + 'Btn');
    console.log('Selected button element:', selectedBtn);
    
    if (selectedBtn) {
        selectedBtn.classList.add('active');
        console.log('✅ Added active class to:', selectedBtn.textContent);
    } else {
        console.error('❌ Selected button not found for difficulty:', difficulty);
    }
    
    console.log('🎯 Difficulty set to:', difficulty);
    
    // Store difficulty preference
    localStorage.setItem('gameDifficulty', difficulty);
    console.log('✅ Difficulty saved to localStorage');
    
    // Update game engine if game is running
    if (gameInstance) {
        try {
            gameInstance.setDifficulty(difficulty);
            console.log('✅ Game engine difficulty updated');
        } catch (error) {
            console.error('❌ Error updating game engine difficulty:', error);
        }
    } else {
        console.log('⚠️ Game instance not available yet');
    }
}

// Load saved difficulty preference
function loadDifficultyPreference() {
    console.log('📂 Loading difficulty preference...');
    
    try {
        const saved = localStorage.getItem('gameDifficulty');
        console.log('Saved difficulty from localStorage:', saved);
        
        if (saved && ['easy', 'medium', 'hard'].includes(saved)) {
            console.log('✅ Loading saved difficulty:', saved);
            selectDifficulty(saved);
        } else {
            console.log('⚠️ No valid saved difficulty, using default: easy');
            selectDifficulty('easy'); // Default to easy
        }
    } catch (error) {
        console.error('❌ Error loading difficulty preference:', error);
        console.log('⚠️ Using default difficulty: easy');
        selectDifficulty('easy');
    }
}

// Global functions called by HTML buttons
function startGame() {
    console.log('🎮 Start game button clicked');
    console.log('Game instance:', gameInstance);
    console.log('Game state:', gameInstance ? gameInstance.gameState : 'No instance');
    
    if (gameInstance) {
        try {
            gameInstance.startGame();
            console.log('✅ Game started successfully');
        } catch (error) {
            console.error('❌ Error starting game:', error);
        }
    } else {
        console.error('❌ Game instance not initialized');
        alert('Game not ready yet. Please wait for initialization to complete.');
    }
}

function loadGame() {
    console.log('💾 Load game button clicked');
    if (gameInstance) {
        try {
            gameInstance.loadGame();
            console.log('✅ Game loaded successfully');
        } catch (error) {
            console.error('❌ Error loading game:', error);
        }
    } else {
        console.error('❌ Game instance not initialized');
        alert('Game not ready yet. Please wait for initialization to complete.');
    }
}

function openStore() {
    console.log('🏪 Store button clicked');
    if (gameInstance) {
        try {
            gameInstance.openStore();
            console.log('✅ Store opened successfully');
        } catch (error) {
            console.error('❌ Error opening store:', error);
        }
    } else {
        console.error('❌ Game instance not initialized');
        alert('Game not ready yet. Please wait for initialization to complete.');
    }
}

function showHighScores() {
    console.log('🏆 High scores button clicked');
    try {
        // Show high scores overlay
        const highScoresOverlay = document.getElementById('highScoresOverlay');
        if (highScoresOverlay) {
            highScoresOverlay.style.display = 'flex';
            console.log('✅ High scores displayed successfully');
        } else {
            console.error('❌ High scores overlay not found');
            alert('High scores coming soon!');
        }
    } catch (error) {
        console.error('❌ Error showing high scores:', error);
        alert('High scores coming soon!');
    }
}

function closeHighScores() {
    console.log('❌ Close high scores button clicked');
    try {
        const highScoresOverlay = document.getElementById('highScoresOverlay');
        if (highScoresOverlay) {
            highScoresOverlay.style.display = 'none';
            console.log('✅ High scores closed successfully');
        } else {
            console.error('❌ High scores overlay not found');
        }
    } catch (error) {
        console.error('❌ Error closing high scores:', error);
    }
}

function showBriefing() {
    console.log('📋 Briefing button clicked');
    if (gameInstance) {
        try {
            const briefingOverlay = document.getElementById('briefingOverlay');
            if (briefingOverlay) {
                briefingOverlay.style.display = 'flex';
                console.log('✅ Briefing displayed successfully');
            } else {
                console.error('❌ Briefing overlay not found');
            }
        } catch (error) {
            console.error('❌ Error showing briefing:', error);
        }
    } else {
        console.error('❌ Game instance not initialized');
        alert('Game not ready yet. Please wait for initialization to complete.');
    }
}

function checkForGameUpdates() {
    console.log('🔄 Check updates button clicked');
    alert('🎮 Game is up to date! Current version: Enhanced Space Shooter v1.0.0');
}

function togglePause() {
    console.log('⏸️ Toggle pause button clicked');
    if (gameInstance) {
        try {
            if (gameInstance.gameState === 'playing') {
                gameInstance.pauseGame();
                console.log('✅ Game paused successfully');
            } else if (gameInstance.gameState === 'paused') {
                gameInstance.resumeGame();
                console.log('✅ Game resumed successfully');
            }
        } catch (error) {
            console.error('❌ Error toggling pause:', error);
        }
    } else {
        console.error('❌ Game instance not initialized');
        alert('Game not ready yet. Please wait for initialization to complete.');
    }
}

function showMenu() {
    console.log('🏠 Show menu button clicked');
    if (gameInstance) {
        try {
            gameInstance.gameState = 'menu';
            document.getElementById('gameContainer').classList.remove('playing');
            document.getElementById('menu').style.display = 'flex';
            
            // Hide all overlays
            const overlays = ['gameOver', 'pauseOverlay', 'briefingOverlay'];
            overlays.forEach(id => {
                const overlay = document.getElementById(id);
                if (overlay) overlay.style.display = 'none';
            });
            
            console.log('✅ Menu displayed successfully');
        } catch (error) {
            console.error('❌ Error showing menu:', error);
        }
    } else {
        console.error('❌ Game instance not initialized');
        alert('Game not ready yet. Please wait for initialization to complete.');
    }
}

function switchWeapon(weaponType) {
    console.log('🔫 Switch weapon button clicked:', weaponType);
    if (gameInstance) {
        try {
            gameInstance.currentWeapon = weaponType;
            console.log('✅ Weapon switched to:', weaponType);
        } catch (error) {
            console.error('❌ Error switching weapon:', error);
        }
    } else {
        console.error('❌ Game instance not initialized');
        alert('Game not ready yet. Please wait for initialization to complete.');
    }
}

function closeBriefing() {
    console.log('✕ Close briefing button clicked');
    const briefingOverlay = document.getElementById('briefingOverlay');
    if (briefingOverlay) {
        briefingOverlay.style.display = 'none';
        console.log('✅ Briefing closed successfully');
    }
}

function closeStore() {
    console.log('✕ Close store button clicked');
    if (gameInstance) {
        try {
            gameInstance.closeStore();
            console.log('✅ Store closed successfully');
        } catch (error) {
            console.error('❌ Error closing store:', error);
        }
    }
}

function buyShip(shipType) {
    console.log('🚀 Buy ship button clicked:', shipType);
    if (gameInstance) {
        try {
            gameInstance.buyShip(shipType);
            console.log('✅ Ship purchased successfully:', shipType);
        } catch (error) {
            console.error('❌ Error buying ship:', error);
        }
    }
}

function closeGameOver() {
    console.log('✕ Close game over button clicked');
    const gameOver = document.getElementById('gameOver');
    if (gameOver) {
        gameOver.style.display = 'none';
        console.log('✅ Game over screen closed successfully');
    }
}

function closePause() {
    console.log('✕ Close pause button clicked');
    const pauseOverlay = document.getElementById('pauseOverlay');
    if (pauseOverlay) {
        pauseOverlay.style.display = 'none';
        console.log('✅ Pause overlay closed successfully');
    }
}

// Add missing functions that HTML buttons are calling
function restartGame() {
    console.log('🔄 Restart game button clicked');
    if (gameInstance) {
        try {
            // Reset game state
            gameInstance.gameState = 'menu';
            gameInstance.score = 0;
            gameInstance.lives = 25;
            gameInstance.level = 1;
            gameInstance.combo = 0;
            gameInstance.maxCombo = 0;
            gameInstance.maxStreak = 0;
            gameInstance.enemiesDestroyed = 0;
            gameInstance.bossesDefeated = 0;
            gameInstance.powerupsCollected = 0;
            gameInstance.survivalTime = 0;
            gameInstance.money = 0;
            
            // Clear game objects
            gameInstance.bullets = [];
            gameInstance.enemies = [];
            gameInstance.powerups = [];
            gameInstance.explosions = [];
            gameInstance.particles = [];
            
            // Reset player
            gameInstance.player.x = 475;
            gameInstance.player.y = 600;
            gameInstance.player.health = 100;
            gameInstance.player.shield = 0;
            gameInstance.player.invulnerable = 0;
            gameInstance.player.missiles = 0;
            
            // Hide game over screen and show menu
            document.getElementById('gameOver').style.display = 'none';
            document.getElementById('menu').style.display = 'flex';
            document.getElementById('gameContainer').classList.remove('playing');
            
            console.log('✅ Game restarted successfully');
        } catch (error) {
            console.error('❌ Error restarting game:', error);
        }
    } else {
        console.error('❌ Game instance not initialized');
        alert('Game not ready yet. Please wait for initialization to complete.');
    }
}

function resumeGame() {
    console.log('▶️ Resume game button clicked');
    if (gameInstance) {
        try {
            gameInstance.resumeGame();
            console.log('✅ Game resumed successfully');
        } catch (error) {
            console.error('❌ Error resuming game:', error);
        }
    } else {
        console.error('❌ Game instance not initialized');
        alert('Game not ready yet. Please wait for initialization to complete.');
    }
}

function saveGame() {
    console.log('💾 Save game button clicked');
    if (gameInstance) {
        try {
            // Save current game state to localStorage
            const gameData = {
                score: gameInstance.score,
                lives: gameInstance.lives,
                level: gameInstance.level,
                money: gameInstance.money,
                currentWeapon: gameInstance.currentWeapon,
                weaponLevel: gameInstance.weaponLevel,
                currentShipType: gameInstance.currentShipType,
                timestamp: Date.now()
            };
            
            localStorage.setItem('savedGame', JSON.stringify(gameData));
            alert('✅ Game saved successfully!');
            console.log('✅ Game saved successfully');
        } catch (error) {
            console.error('❌ Error saving game:', error);
            alert('❌ Error saving game. Please try again.');
        }
    } else {
        console.error('❌ Game instance not initialized');
        alert('Game not ready yet. Please wait for initialization to complete.');
    }
}

console.log('✅ Global game functions exposed');

// Initialize game when DOM is ready
let gameInstance = null;

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 DOM loaded, initializing game...');
    
    try {
        // Create game instance
        gameInstance = new EnhancedSpaceShooter();
        console.log('✅ Game instance created:', gameInstance);
        
        // Initialize the game
        gameInstance.init();
        console.log('✅ Game initialized successfully');
        
        // Load difficulty preference
        gameInstance.loadDifficultyPreference();
        console.log('✅ Difficulty preference loaded');
        
        // Initialize touch controls for mobile
        gameInstance.initTouchControls();
        console.log('✅ Touch controls initialized');
        
        // Expose difficulty functions to global scope
        gameInstance.exposeDifficultyToGlobal();
        console.log('✅ Difficulty functions exposed');
        
        console.log('🎮 Game ready! All buttons should now work.');
        
    } catch (error) {
        console.error('❌ Error during game initialization:', error);
        alert('❌ Error initializing game. Please refresh the page and try again.');
    }
});

// Fallback initialization for when DOMContentLoaded has already fired
if (document.readyState === 'loading') {
    // DOM is still loading, wait for DOMContentLoaded
    console.log('⏳ DOM still loading, waiting for DOMContentLoaded...');
} else {
    // DOM is already loaded, initialize immediately
    console.log('🚀 DOM already loaded, initializing game immediately...');
    
    try {
        // Create game instance
        gameInstance = new EnhancedSpaceShooter();
        console.log('✅ Game instance created:', gameInstance);
        
        // Initialize the game
        gameInstance.init();
        console.log('✅ Game initialized successfully');
        
        // Load difficulty preference
        gameInstance.loadDifficultyPreference();
        console.log('✅ Difficulty preference loaded');
        
        // Initialize touch controls for mobile
        gameInstance.initTouchControls();
        console.log('✅ Touch controls initialized');
        
        // Expose difficulty functions to global scope
        gameInstance.exposeDifficultyToGlobal();
        console.log('✅ Difficulty functions exposed');
        
        console.log('🎮 Game ready! All buttons should now work.');
        
    } catch (error) {
        console.error('❌ Error during game initialization:', error);
        alert('❌ Error initializing game. Please refresh the page and try again.');
    }
}
