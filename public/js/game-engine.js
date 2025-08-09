// Enhanced Game Engine
class EnhancedSpaceShooter {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        if (!this.canvas) {
            console.error('Canvas not found!');
            return;
        }
        this.ctx = this.canvas.getContext('2d');
        if (!this.ctx) {
            console.error('Could not get 2D context!');
            return;
        }
        this.gameState = 'menu';
        
        // Initialize sprite manager
        this.spriteManager = new SpriteManager();
        this.useSprites = true;
        
        // Game stats
        this.score = 0;
        this.lives = 25; // Increased to 25 lives
        this.level = 1;
        this.combo = 0;
        this.maxCombo = 0;
        this.enemiesDestroyed = 0;
        this.powerupsCollected = 0;
        this.coinsCollected = 0;
        this.gemsCollected = 0;
        this.streak = 0;
        this.maxStreak = 0;
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
        
        // Enhanced weapon system - MORE WEAPONS!
        this.currentWeapon = 'basic';
        this.weaponLevel = 1;
        this.lastShot = 0;
        this.shotCooldown = 100; // Reduced for rapid fire (was 250)
        this.rapidFireEnabled = true;
        this.rapidFireRate = 50; // Even faster rapid fire
        this.lastRapidShot = 0;
        
        // NEW WEAPONS
        this.availableWeapons = ['basic', 'plasma', 'spread', 'laser', 'missile', 'spread-shot', 'railgun', 'flamethrower', 'thunder', 'nuclear'];
        this.weaponUnlocked = {
            'basic': true,
            'plasma': false,
            'spread': false,
            'laser': false,
            'missile': false,
            'spread-shot': false,
            'railgun': false,
            'flamethrower': false,
            'thunder': false,
            'nuclear': false
        };
        
        // Game objects
        this.bullets = [];
        this.enemies = [];
        this.powerups = [];
        this.collectibles = []; // NEW: Separate collectibles array
        this.explosions = [];
        this.particles = [];
        
        // Game settings - HARDER DIFFICULTY
        this.enemySpawnRate = 90; // Slower initial spawn
        this.enemySpawnTimer = 0;
        this.powerupSpawnRate = 400; // Rarer powerups
        this.powerupSpawnTimer = 0;
        this.collectibleSpawnRate = 300; // NEW: Collectible spawn rate
        this.collectibleSpawnTimer = 0;
        this.levelUpThreshold = 2000; // Much harder to advance levels
        this.difficultyRamp = 1.5; // Steeper difficulty increase
        
        // Mobile touch controls
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.touchActive = false;
        this.lastTouchX = 0;
        this.lastTouchY = 0;
        this.autoShoot = true; // Auto-shoot on mobile
        
        // Addictiveness features
        this.comboMultiplier = 1;
        this.comboTimer = 0;
        this.comboDecayTime = 3000; // 3 seconds to maintain combo
        this.scoreMultiplier = 1;
        this.powerupChance = 0.05; // Rarer powerups
        this.collectibleChance = 0.15; // NEW: Collectible chance
        this.streakBonus = 1; // NEW: Streak bonus multiplier
        
        // Sound effects
        this.sounds = {};
        this.soundEnabled = true;
        this.initSounds();
        
        // Pause/Resume functionality
        this.isPaused = false;
        this.pauseTime = 0;
        this.totalPauseTime = 0;
        
        // Initialize canvas
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        
        // Initialize sprites
        this.initSprites();
        
        // Initialize touch controls
        this.initTouchControls();
        
        // Initialize keyboard controls for pause/resume
        this.initKeyboardControls();
        
        // Initialize game
        this.init();
        
        console.log('Game engine initialized successfully');
    }
    
    initKeyboardControls() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
                if (this.gameState === 'playing') {
                    this.pauseGame();
                } else if (this.gameState === 'paused') {
                    this.resumeGame();
                }
            }
        });
    }
    
    initSounds() {
        // Create audio context for sound effects
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Generate sound effects
            this.sounds.missile = this.generateMissileSound();
            this.sounds.explosion = this.generateExplosionSound();
            this.sounds.shoot = this.generateShootSound();
            this.sounds.powerup = this.generatePowerupSound();
            this.sounds.levelUp = this.generateLevelUpSound();
            this.sounds.coin = this.generateCoinSound();
            this.sounds.gem = this.generateGemSound();
            
        } catch (error) {
            console.log('Audio not supported, sounds will be disabled');
            this.soundEnabled = false;
        }
    }
    
    generateCoinSound() {
        if (!this.audioContext) return null;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(1200, this.audioContext.currentTime + 0.2);
        
        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
        
        return { oscillator, gainNode };
    }
    
    generateGemSound() {
        if (!this.audioContext) return null;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(600, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(1500, this.audioContext.currentTime + 0.3);
        
        gainNode.gain.setValueAtTime(0.4, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
        
        return { oscillator, gainNode };
    }
    
    generateMissileSound() {
        if (!this.audioContext) return null;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(50, this.audioContext.currentTime + 0.5);
        
        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);
        
        return { oscillator, gainNode };
    }
    
    generateExplosionSound() {
        if (!this.audioContext) return null;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(100, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(20, this.audioContext.currentTime + 0.3);
        
        gainNode.gain.setValueAtTime(0.4, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
        
        return { oscillator, gainNode };
    }
    
    generateShootSound() {
        if (!this.audioContext) return null;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(400, this.audioContext.currentTime + 0.1);
        
        gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
        
        return { oscillator, gainNode };
    }
    
    generatePowerupSound() {
        if (!this.audioContext) return null;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(400, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(800, this.audioContext.currentTime + 0.2);
        
        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
        
        return { oscillator, gainNode };
    }
    
    generateLevelUpSound() {
        if (!this.audioContext) return null;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(800, this.audioContext.currentTime + 0.5);
        
        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);
        
        return { oscillator, gainNode };
    }
    
    playSound(soundType) {
        if (!this.soundEnabled || !this.sounds[soundType]) return;
        
        try {
            const sound = this.sounds[soundType];
            if (sound.oscillator && sound.gainNode) {
                const oscillator = this.audioContext.createOscillator();
                const gainNode = this.audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(this.audioContext.destination);
                
                // Copy the sound parameters
                oscillator.frequency.setValueAtTime(sound.oscillator.frequency.value, this.audioContext.currentTime);
                gainNode.gain.setValueAtTime(sound.gainNode.gain.value, this.audioContext.currentTime);
                
                oscillator.start(this.audioContext.currentTime);
                oscillator.stop(this.audioContext.currentTime + 0.5);
            }
        } catch (error) {
            // Ignore sound errors
        }
    }
    
    initTouchControls() {
        // Touch start
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const rect = this.canvas.getBoundingClientRect();
            this.touchStartX = touch.clientX - rect.left;
            this.touchStartY = touch.clientY - rect.top;
            this.touchActive = true;
            this.lastTouchX = this.touchStartX;
            this.lastTouchY = this.touchStartY;
            
            // Move player to touch position
            this.movePlayerToTouch(this.touchStartX, this.touchStartY);
            
            // Auto-shoot on touch
            if (this.autoShoot && this.gameState === 'playing') {
                this.shoot();
            }
        });
        
        // Touch move
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (!this.touchActive) return;
            
            const touch = e.touches[0];
            const rect = this.canvas.getBoundingClientRect();
            const touchX = touch.clientX - rect.left;
            const touchY = touch.clientY - rect.top;
            
            // Move player to touch position
            this.movePlayerToTouch(touchX, touchY);
            
            this.lastTouchX = touchX;
            this.lastTouchY = touchY;
        });
        
        // Touch end
        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.touchActive = false;
        });
    }
    
    movePlayerToTouch(touchX, touchY) {
        if (this.gameState !== 'playing') return;
        
        // Convert touch coordinates to canvas coordinates
        const scaleX = this.canvas.width / this.canvas.offsetWidth;
        const scaleY = this.canvas.height / this.canvas.offsetHeight;
        
        const canvasX = touchX * scaleX;
        const canvasY = touchY * scaleY;
        
        // Move player to touch position with smooth interpolation
        const targetX = Math.max(0, Math.min(canvasX - this.player.width / 2, this.canvas.width - this.player.width));
        const targetY = Math.max(0, Math.min(canvasY - this.player.height / 2, this.canvas.height - this.player.height));
        
        // Smooth movement
        const moveSpeed = 0.3;
        this.player.x += (targetX - this.player.x) * moveSpeed;
        this.player.y += (targetY - this.player.y) * moveSpeed;
    }
    
    initSprites() {
        console.log('🎨 Initializing sprites...');
        this.spriteManager.loadSprites();
    }
    
    resizeCanvas() {
        const container = document.getElementById('gameContainer');
        if (!container) {
            console.error('Game container not found!');
            return;
        }
        
        const containerRect = container.getBoundingClientRect();
        
        // Set canvas size to fit container while maintaining aspect ratio
        const maxWidth = Math.min(containerRect.width - 40, 1000);
        const maxHeight = Math.min(containerRect.height - 40, 700);
        
        this.canvas.width = maxWidth;
        this.canvas.height = maxHeight;
        
        // Update player position to center of canvas
        this.player.x = this.canvas.width / 2 - this.player.width / 2;
        this.player.y = this.canvas.height - this.player.height - 20;
        
        console.log(`Canvas resized to ${maxWidth}x${maxHeight}`);
    }
    
    init() {
        // Initialize game state
        this.gameState = 'menu';
        this.score = 0;
        this.lives = 25; // Start with 25 lives
        this.level = 1;
        this.combo = 0;
        this.maxCombo = 0;
        this.enemiesDestroyed = 0;
        this.powerupsCollected = 0;
        this.coinsCollected = 0;
        this.gemsCollected = 0;
        this.streak = 0;
        this.maxStreak = 0;
        this.survivalTime = 0;
        
        // Clear all game objects
        this.bullets = [];
        this.enemies = [];
        this.powerups = [];
        this.collectibles = [];
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
        this.lastRapidShot = 0;
        
        // Reset timers
        this.enemySpawnTimer = 0;
        this.powerupSpawnTimer = 0;
        this.collectibleSpawnTimer = 0;
        
        // Update UI
        this.updateUI();
        
        console.log('Game initialized with 25 lives');
    }
    
    startGame() {
        console.log('Starting game...');
        this.gameState = 'playing';
        this.startTime = Date.now();
        
        // Reset game stats for new game
        this.score = 0;
        this.lives = 25; // Start with 25 lives
        this.level = 1;
        this.combo = 0;
        this.maxCombo = 0;
        this.enemiesDestroyed = 0;
        this.powerupsCollected = 0;
        this.coinsCollected = 0;
        this.gemsCollected = 0;
        this.streak = 0;
        this.maxStreak = 0;
        this.survivalTime = 0;
        
        // Clear all game objects
        this.bullets = [];
        this.enemies = [];
        this.powerups = [];
        this.collectibles = [];
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
        this.lastRapidShot = 0;
        
        // Reset timers
        this.enemySpawnTimer = 0;
        this.powerupSpawnTimer = 0;
        this.collectibleSpawnTimer = 0;
        
        // Hide menu and show UI
        const menu = document.getElementById('menu');
        if (menu) menu.style.display = 'none';
        
        const gameContainer = document.getElementById('gameContainer');
        if (gameContainer) gameContainer.classList.add('playing');
        
        // Update UI
        this.updateUI();
        
        // Track game start event
        if (typeof firebaseUtils !== 'undefined' && firebaseUtils.isAvailable()) {
            firebaseUtils.trackEvent('game_started', {
                timestamp: new Date().toISOString()
            });
        }
        
        // Start game loop
        this.gameLoop();
        console.log('Game started successfully with 25 lives');
    }
    
    pauseGame() {
        if (this.gameState === 'playing') {
            this.gameState = 'paused';
            this.isPaused = true;
            this.pauseTime = Date.now();
            
            // Show pause overlay
            const pauseOverlay = document.getElementById('pauseOverlay');
            if (pauseOverlay) {
                pauseOverlay.style.display = 'flex';
                
                // Update pause overlay content
                const pauseContent = document.getElementById('pauseContent');
                if (pauseContent) {
                    pauseContent.innerHTML = `
                        <h2>⏸️ Game Paused</h2>
                        <p>Score: ${this.score}</p>
                        <p>Level: ${this.level}</p>
                        <p>Lives: ${this.lives}</p>
                        <p>Combo: ${this.combo}</p>
                        <p>Streak: ${this.streak}</p>
                        <div style="margin: 20px 0;">
                            <button class="btn" onclick="resumeGame()">▶️ Resume</button>
                            <button class="btn" onclick="showMenu()">🏠 Main Menu</button>
                        </div>
                        <p style="font-size: 12px; opacity: 0.7;">Press ESC, P, or click Resume to continue</p>
                    `;
                }
            }
        }
    }
    
    resumeGame() {
        if (this.gameState === 'paused') {
            this.gameState = 'playing';
            this.isPaused = false;
            this.totalPauseTime += Date.now() - this.pauseTime;
            
            // Hide pause overlay
            const pauseOverlay = document.getElementById('pauseOverlay');
            if (pauseOverlay) {
                pauseOverlay.style.display = 'none';
            }
            
            // Resume game loop
            this.gameLoop();
        }
    }
    
    gameOver() {
        this.gameState = 'gameOver';
        const gameContainer = document.getElementById('gameContainer');
        if (gameContainer) gameContainer.classList.remove('playing');
        
        const gameOver = document.getElementById('gameOver');
        if (gameOver) gameOver.style.display = 'flex';
        
        // Update final stats
        const finalScore = document.getElementById('finalScore');
        const finalTime = document.getElementById('finalTime');
        const finalEnemies = document.getElementById('finalEnemies');
        const finalPowerups = document.getElementById('finalPowerups');
        
        if (finalScore) finalScore.textContent = this.score;
        if (finalTime) finalTime.textContent = this.survivalTime;
        if (finalEnemies) finalEnemies.textContent = this.enemiesDestroyed;
        if (finalPowerups) finalPowerups.textContent = this.powerupsCollected;
        
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
        if (this.gameState !== 'playing') return;
        
        // Update survival time
        this.survivalTime = Math.floor((Date.now() - this.startTime) / 1000);
        
        // Update combo timer
        if (this.comboTimer > 0) {
            this.comboTimer -= 16; // Assuming 60fps
            if (this.comboTimer <= 0) {
                this.combo = 0;
                this.comboMultiplier = 1;
            }
        }
        
        // Update player
        this.updatePlayer();
        
        // Update game objects
        this.updateBullets();
        this.updateEnemies();
        this.updatePowerups();
        this.updateExplosions();
        this.updateParticles();
        this.updateCollectibles(); // NEW: Update collectibles
        
        // Spawn enemies and powerups
        this.spawnEnemies();
        this.spawnPowerups();
        this.spawnCollectibles(); // NEW: Spawn collectibles
        
        // Check collisions
        this.checkCollisions();
        
        // Update difficulty based on score
        this.updateDifficulty();
        
        // Update UI
        this.updateUI();
    }
    
    updateDifficulty() {
        // Much harder difficulty progression
        const newLevel = Math.floor(this.score / this.levelUpThreshold) + 1;
        if (newLevel > this.level) {
            this.level = newLevel;
            
            // Much steeper difficulty increase
            this.enemySpawnRate = Math.max(15, 90 - (this.level * 8)); // Faster spawn rate
            this.powerupChance = Math.min(0.2, 0.05 + (this.level * 0.01)); // Rarer powerups
            
            // Increase enemy health and speed based on level
            this.enemyHealthMultiplier = 1 + (this.level * 0.3);
            this.enemySpeedMultiplier = 1 + (this.level * 0.15);
            
            // Increase level threshold for next level (exponential difficulty)
            this.levelUpThreshold = Math.floor(this.levelUpThreshold * 1.2);
            
            // Show level up notification
            this.showLevelUpNotification();
            
            // Play level up sound
            this.playSound('levelUp');
        }
    }
    
    showLevelUpNotification() {
        // Create level up notification
        const notification = document.createElement('div');
        notification.className = 'event-notification';
        notification.innerHTML = `🎯 LEVEL ${this.level}!<br><small>Difficulty Increased!</small>`;
        notification.style.background = 'linear-gradient(135deg, #00ff00, #00cc00)';
        notification.style.color = '#000';
        notification.style.fontWeight = 'bold';
        notification.style.fontSize = '28px';
        
        document.getElementById('gameContainer').appendChild(notification);
        
        // Remove notification after animation
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
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
        
        // Rapid fire mode
        if (this.rapidFireEnabled && this.keys && this.keys[' ']) {
            if (now - this.lastRapidShot > this.rapidFireRate) {
                this.lastRapidShot = now;
                this.createBullet();
            }
        } else {
            // Single shot mode
            if (now - this.lastShot > this.shotCooldown) {
                this.lastShot = now;
                this.createBullet();
            }
        }
    }
    
    createBullet() {
        // Play shoot sound
        this.playSound('shoot');
        
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
                    this.playSound('missile');
                }
                break;
            case 'spread-shot':
                // 5-way spread shot
                for (let i = -2; i <= 2; i++) {
                    this.bullets.push({
                        x: this.player.x + this.player.width / 2 - 2,
                        y: this.player.y,
                        width: 4,
                        height: 10,
                        speed: 6,
                        damage: 6,
                        type: 'spread-shot',
                        angle: i * 0.2
                    });
                }
                break;
            case 'railgun':
                // High-speed piercing projectile
                this.bullets.push({
                    x: this.player.x + this.player.width / 2 - 1,
                    y: this.player.y,
                    width: 2,
                    height: 8,
                    speed: 15,
                    damage: 30,
                    type: 'railgun',
                    piercing: true
                });
                break;
            case 'flamethrower':
                // Multiple rapid fire bullets
                for (let i = 0; i < 3; i++) {
                    this.bullets.push({
                        x: this.player.x + this.player.width / 2 - 2 + (i - 1) * 4,
                        y: this.player.y - i * 5,
                        width: 3,
                        height: 8,
                        speed: 4,
                        damage: 5,
                        type: 'flamethrower'
                    });
                }
                break;
            case 'thunder':
                // Lightning bolt weapon
                for (let i = -1; i <= 1; i++) {
                    this.bullets.push({
                        x: this.player.x + this.player.width / 2 - 1,
                        y: this.player.y,
                        width: 2,
                        height: 12,
                        speed: 10,
                        damage: 20,
                        type: 'thunder',
                        angle: i * 0.4
                    });
                }
                break;
            case 'nuclear':
                // Massive nuclear blast
                this.bullets.push({
                    x: this.player.x + this.player.width / 2 - 8,
                    y: this.player.y,
                    width: 16,
                    height: 20,
                    speed: 3,
                    damage: 100,
                    type: 'nuclear',
                    explosionRadius: 50
                });
                break;
        }
    }
    
    updateBullets() {
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            
            // Update position based on angle
            if (bullet.angle) {
                bullet.x += Math.sin(bullet.angle) * bullet.speed;
                bullet.y -= Math.cos(bullet.angle) * bullet.speed;
            } else {
                bullet.y -= bullet.speed;
            }
            
            // Remove bullets that are off screen
            if (bullet.y + bullet.height < 0 || bullet.x < 0 || bullet.x > this.canvas.width) {
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
    
    updateCollectibles() {
        for (let i = this.collectibles.length - 1; i >= 0; i--) {
            const collectible = this.collectibles[i];
            
            // Update position
            collectible.y += collectible.speed;
            
            // Remove collectibles that are off screen
            if (collectible.y > this.canvas.height) {
                this.collectibles.splice(i, 1);
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
            
            // More enemy types for higher levels
            let enemyTypes = ['basic', 'fast', 'tank'];
            if (this.level >= 3) enemyTypes.push('boss');
            if (this.level >= 5) enemyTypes.push('elite');
            if (this.level >= 8) enemyTypes.push('superboss');
            
            const type = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
            
            // Calculate health and speed multipliers
            const healthMultiplier = this.enemyHealthMultiplier || 1;
            const speedMultiplier = this.enemySpeedMultiplier || 1;
            
            let health, speed, width, height;
            
            switch(type) {
                case 'basic':
                    health = Math.floor(20 * healthMultiplier);
                    speed = 2 * speedMultiplier;
                    width = 60;
                    height = 60;
                    break;
                case 'fast':
                    health = Math.floor(15 * healthMultiplier);
                    speed = 4 * speedMultiplier;
                    width = 50;
                    height = 50;
                    break;
                case 'tank':
                    health = Math.floor(100 * healthMultiplier);
                    speed = 1 * speedMultiplier;
                    width = 80;
                    height = 80;
                    break;
                case 'boss':
                    health = Math.floor(200 * healthMultiplier);
                    speed = 1.5 * speedMultiplier;
                    width = 100;
                    height = 100;
                    break;
                case 'elite':
                    health = Math.floor(150 * healthMultiplier);
                    speed = 3 * speedMultiplier;
                    width = 70;
                    height = 70;
                    break;
                case 'superboss':
                    health = Math.floor(500 * healthMultiplier);
                    speed = 2 * speedMultiplier;
                    width = 120;
                    height = 120;
                    break;
                default:
                    health = Math.floor(20 * healthMultiplier);
                    speed = 2 * speedMultiplier;
                    width = 60;
                    height = 60;
            }
            
            const enemy = {
                x: Math.random() * (this.canvas.width - width),
                y: -height,
                width: width,
                height: height,
                speed: speed,
                health: health,
                maxHealth: health,
                type: type
            };
            
            this.enemies.push(enemy);
        }
    }
    
    spawnPowerups() {
        this.powerupSpawnTimer++;
        
        if (this.powerupSpawnTimer >= this.powerupSpawnRate) {
            this.powerupSpawnTimer = 0;
            
            const powerupTypes = ['health', 'shield', 'weapon', 'missile', 'rapid-fire'];
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
    
    spawnCollectibles() {
        this.collectibleSpawnTimer++;
        
        if (this.collectibleSpawnTimer >= this.collectibleSpawnRate) {
            this.collectibleSpawnTimer = 0;
            
            const collectibleTypes = ['coin', 'gem'];
            const type = collectibleTypes[Math.floor(Math.random() * collectibleTypes.length)];
            
            const collectible = {
                x: Math.random() * (this.canvas.width - 20),
                y: -20,
                width: 20,
                height: 20,
                speed: 1.5,
                type: type
            };
            
            this.collectibles.push(collectible);
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
                    
                    // Remove bullet unless it's piercing
                    if (!bullet.piercing) {
                        this.bullets.splice(i, 1);
                    }
                    
                    // Check if enemy is destroyed
                    if (enemy.health <= 0) {
                        this.enemies.splice(j, 1);
                        
                        // Create explosion
                        this.createExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
                        
                        // Update combo and score
                        this.updateComboAndScore(enemy.type);
                    }
                    
                    break;
                }
            }
        }
        
        // Check player-enemy collisions
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            if (this.isColliding(this.player, enemy) && this.player.invulnerable <= 0) {
                // Remove enemy
                this.enemies.splice(i, 1);
                
                // Create explosion
                this.createExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
                
                // Damage player based on enemy type
                let damage = 20;
                switch(enemy.type) {
                    case 'basic':
                        damage = 20;
                        break;
                    case 'fast':
                        damage = 25;
                        break;
                    case 'tank':
                        damage = 40;
                        break;
                    case 'boss':
                        damage = 60;
                        break;
                    case 'elite':
                        damage = 35;
                        break;
                    case 'superboss':
                        damage = 80;
                        break;
                }
                
                this.player.health -= damage;
                this.player.invulnerable = 120; // 2 seconds of invulnerability
                
                // Reset combo
                this.combo = 0;
                this.comboMultiplier = 1;
                this.comboTimer = 0;
                
                // Check if player died
                if (this.player.health <= 0) {
                    this.lives--;
                    this.player.health = this.player.maxHealth;
                    if (this.lives <= 0) {
                        this.gameOver();
                        return;
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

        // Check player-collectible collisions
        for (let i = this.collectibles.length - 1; i >= 0; i--) {
            const collectible = this.collectibles[i];
            if (this.isColliding(this.player, collectible)) {
                this.collectCollectible(collectible);
                this.collectibles.splice(i, 1);
            }
        }
    }
    
    updateComboAndScore(enemyType) {
        // Update combo
        this.combo++;
        this.comboTimer = this.comboDecayTime;
        
        // Calculate score based on enemy type and combo
        let baseScore = 10;
        switch (enemyType) {
            case 'basic':
                baseScore = 10;
                break;
            case 'fast':
                baseScore = 25;
                break;
            case 'tank':
                baseScore = 50;
                break;
            case 'boss':
                baseScore = 200;
                break;
        }
        
        // Apply combo multiplier
        this.comboMultiplier = Math.min(10, 1 + (this.combo * 0.5));
        const finalScore = Math.floor(baseScore * this.comboMultiplier * this.scoreMultiplier);
        
        this.score += finalScore;
        this.enemiesDestroyed++;
        
        // Show score popup
        this.showScorePopup(finalScore, enemyType);
        
        // Update max combo
        if (this.combo > this.maxCombo) {
            this.maxCombo = this.combo;
        }
    }
    
    showScorePopup(score, enemyType) {
        // Create score popup
        const popup = document.createElement('div');
        popup.style.position = 'absolute';
        popup.style.left = `${Math.random() * 80 + 10}%`;
        popup.style.top = `${Math.random() * 60 + 20}%`;
        popup.style.color = '#ffff00';
        popup.style.fontSize = '24px';
        popup.style.fontWeight = 'bold';
        popup.style.textShadow = '2px 2px 4px rgba(0,0,0,0.8)';
        popup.style.zIndex = '1000';
        popup.style.pointerEvents = 'none';
        popup.style.animation = 'scorePopup 2s ease-out forwards';
        popup.textContent = `+${score}`;
        
        document.getElementById('gameContainer').appendChild(popup);
        
        // Remove popup after animation
        setTimeout(() => {
            if (popup.parentNode) {
                popup.parentNode.removeChild(popup);
            }
        }, 2000);
    }
    
    isColliding(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }
    
    collectPowerup(powerup) {
        // Play powerup sound
        this.playSound('powerup');
        
        switch (powerup.type) {
            case 'health':
                this.player.health = Math.min(this.player.health + 30, this.player.maxHealth);
                break;
            case 'shield':
                this.player.shield = Math.min(this.player.shield + 50, 100);
                break;
            case 'weapon':
                // Unlock a new weapon
                this.unlockRandomWeapon();
                break;
            case 'missile':
                this.player.missiles += 5;
                break;
            case 'rapid-fire':
                this.rapidFireEnabled = true;
                this.rapidFireRate = Math.max(20, this.rapidFireRate - 10);
                setTimeout(() => {
                    this.rapidFireEnabled = false;
                    this.rapidFireRate = 50;
                }, 10000);
                break;
        }
        
        this.powerupsCollected++;
        
        // Track powerup collection
        if (typeof firebaseUtils !== 'undefined' && firebaseUtils.isAvailable()) {
            firebaseUtils.trackEvent('powerup_collected', {
                type: powerup.type,
                timestamp: new Date().toISOString()
            });
        }
    }

    collectCollectible(collectible) {
        // Play collectible sound
        this.playSound(collectible.type === 'coin' ? 'coin' : 'gem');

        switch (collectible.type) {
            case 'coin':
                this.coinsCollected++;
                this.score += 10 * this.streakBonus; // Small score for coins
                this.showScorePopup(10 * this.streakBonus, 'coin');
                break;
            case 'gem':
                this.gemsCollected++;
                this.score += 50 * this.streakBonus; // Medium score for gems
                this.showScorePopup(50 * this.streakBonus, 'gem');
                break;
        }

        // Update streak bonus
        this.streak++;
        this.comboMultiplier = Math.min(10, 1 + (this.combo * 0.5) + (this.streak * 0.1)); // Increase combo multiplier with streak
        this.comboTimer = this.comboDecayTime; // Reset combo timer

        // Track collectible collection
        if (typeof firebaseUtils !== 'undefined' && firebaseUtils.isAvailable()) {
            firebaseUtils.trackEvent('collectible_collected', {
                type: collectible.type,
                timestamp: new Date().toISOString()
            });
        }
    }
    
    unlockRandomWeapon() {
        const lockedWeapons = this.availableWeapons.filter(weapon => !this.weaponUnlocked[weapon]);
        
        if (lockedWeapons.length > 0) {
            const randomWeapon = lockedWeapons[Math.floor(Math.random() * lockedWeapons.length)];
            this.weaponUnlocked[randomWeapon] = true;
            this.currentWeapon = randomWeapon;
            
            // Show weapon unlock notification
            this.showWeaponUnlockNotification(randomWeapon);
            
            // Track weapon unlock
            if (typeof firebaseUtils !== 'undefined' && firebaseUtils.isAvailable()) {
                firebaseUtils.trackEvent('weapon_unlocked', {
                    weapon: randomWeapon,
                    timestamp: new Date().toISOString()
                });
            }
        }
    }
    
    showWeaponUnlockNotification(weaponName) {
        const notification = document.createElement('div');
        notification.className = 'event-notification';
        notification.innerHTML = `🔫 NEW WEAPON UNLOCKED!<br><small>${weaponName.toUpperCase()}</small>`;
        notification.style.background = 'linear-gradient(135deg, #ff6600, #ff4400)';
        notification.style.color = '#fff';
        notification.style.fontWeight = 'bold';
        notification.style.fontSize = '24px';
        
        document.getElementById('gameContainer').appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }
    
    createExplosion(x, y) {
        // Play explosion sound
        this.playSound('explosion');
        
        // Create explosion effect
        this.explosions.push({
            x: x - 20,
            y: y - 20,
            width: 40,
            height: 40,
            frame: 0,
            maxFrames: 20
        });
        
        // Create particle effects
        for (let i = 0; i < 8; i++) {
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
        this.drawCollectibles(); // NEW: Draw collectibles
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
        
        // Try to draw sprite first
        if (this.useSprites && this.spriteManager.isSpriteLoaded('player-fighter')) {
            if (this.spriteManager.drawSprite(this.ctx, 'player-fighter', this.player.x, this.player.y, this.player.width, this.player.height)) {
                // Sprite drawn successfully
            } else {
                // Fallback to Gradius-style sprite
                this.drawGradiusPlayer();
            }
        } else {
            // Fallback to Gradius-style sprite
            this.drawGradiusPlayer();
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
    
    drawGradiusPlayer() {
        // Generate and draw Gradius-style ship
        const gradiusCanvas = this.generateGradiusSprite('#C0C0C0');
        this.ctx.drawImage(gradiusCanvas, this.player.x, this.player.y, this.player.width, this.player.height);
    }
    
    drawBullets() {
        for (const bullet of this.bullets) {
            // Try to draw sprite first
            if (this.useSprites) {
                const spriteName = this.getBulletSpriteName(bullet.type);
                if (this.spriteManager.isSpriteLoaded(spriteName)) {
                    if (this.spriteManager.drawSprite(this.ctx, spriteName, bullet.x, bullet.y, bullet.width, bullet.height)) {
                        continue; // Sprite drawn successfully
                    }
                }
            }
            
            // Fallback to geometric shape - ENHANCED VISUALS
            this.ctx.shadowColor = this.getBulletColor(bullet.type);
            this.ctx.shadowBlur = 10;
            
            switch (bullet.type) {
                case 'basic':
                    this.ctx.fillStyle = '#ffff00';
                    this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
                    break;
                case 'plasma':
                    this.ctx.fillStyle = '#00ffff';
                    this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
                    // Add plasma glow
                    this.ctx.globalAlpha = 0.6;
                    this.ctx.fillStyle = '#ffffff';
                    this.ctx.fillRect(bullet.x - 1, bullet.y - 1, bullet.width + 2, bullet.height + 2);
                    this.ctx.globalAlpha = 1.0;
                    break;
                case 'laser':
                    this.ctx.fillStyle = '#ff00ff';
                    this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
                    break;
                case 'missile':
                    this.ctx.fillStyle = '#ff6600';
                    this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
                    break;
                case 'railgun':
                    this.ctx.fillStyle = '#00ff00';
                    this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
                    // Add railgun trail
                    this.ctx.globalAlpha = 0.4;
                    this.ctx.fillRect(bullet.x - 2, bullet.y + bullet.height, bullet.width + 4, 10);
                    this.ctx.globalAlpha = 1.0;
                    break;
                case 'flamethrower':
                    this.ctx.fillStyle = '#ff4400';
                    this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
                    break;
                case 'thunder':
                    this.ctx.fillStyle = '#ffff00';
                    this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
                    // Add lightning effect
                    this.ctx.globalAlpha = 0.7;
                    this.ctx.fillStyle = '#ffffff';
                    this.ctx.fillRect(bullet.x - 1, bullet.y - 1, bullet.width + 2, bullet.height + 2);
                    this.ctx.globalAlpha = 1.0;
                    break;
                case 'nuclear':
                    this.ctx.fillStyle = '#ff0000';
                    this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
                    // Add nuclear glow
                    this.ctx.globalAlpha = 0.8;
                    this.ctx.fillStyle = '#ffff00';
                    this.ctx.fillRect(bullet.x - 4, bullet.y - 4, bullet.width + 8, bullet.height + 8);
                    this.ctx.globalAlpha = 1.0;
                    break;
                default:
                    this.ctx.fillStyle = '#ffff00';
                    this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
            }
            
            this.ctx.shadowBlur = 0;
        }
    }
    
    drawEnemies() {
        for (const enemy of this.enemies) {
            // Try to draw sprite first
            if (this.useSprites) {
                const spriteName = this.getEnemySpriteName(enemy.type);
                if (this.spriteManager.isSpriteLoaded(spriteName)) {
                    if (this.spriteManager.drawSprite(this.ctx, spriteName, enemy.x, enemy.y, enemy.width, enemy.height)) {
                        continue; // Sprite drawn successfully
                    }
                }
            }
            
            // Fallback to geometric shape - BRIGHTER COLORS
            this.ctx.shadowColor = this.getEnemyColor(enemy.type);
            this.ctx.shadowBlur = 8;
            
            switch (enemy.type) {
                case 'basic':
                    this.ctx.fillStyle = '#ff4444'; // Brighter red
                    break;
                case 'fast':
                    this.ctx.fillStyle = '#ff8844'; // Brighter orange
                    break;
                case 'tank':
                    this.ctx.fillStyle = '#8844ff'; // Brighter purple
                    break;
                case 'boss':
                    this.ctx.fillStyle = '#ff4488'; // Brighter pink
                    break;
                case 'elite':
                    this.ctx.fillStyle = '#44ff44'; // Bright green
                    break;
                case 'superboss':
                    this.ctx.fillStyle = '#ff0044'; // Bright red-pink
                    break;
            }
            
            this.ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
            
            // Add health bar for enemies with high health
            if (enemy.maxHealth > 50) {
                const healthBarWidth = enemy.width;
                const healthBarHeight = 4;
                const healthBarX = enemy.x;
                const healthBarY = enemy.y - 8;
                const healthPercentage = enemy.health / enemy.maxHealth;
                
                // Health bar background
                this.ctx.fillStyle = '#333333';
                this.ctx.fillRect(healthBarX, healthBarY, healthBarWidth, healthBarHeight);
                
                // Health bar fill
                this.ctx.fillStyle = healthPercentage > 0.5 ? '#00ff00' : healthPercentage > 0.25 ? '#ffff00' : '#ff0000';
                this.ctx.fillRect(healthBarX, healthBarY, healthBarWidth * healthPercentage, healthBarHeight);
            }
            
            // Add glow effect for better visibility
            this.ctx.globalAlpha = 0.4;
            this.ctx.fillStyle = '#ffffff';
            this.ctx.fillRect(enemy.x - 2, enemy.y - 2, enemy.width + 4, enemy.height + 4);
            this.ctx.globalAlpha = 1.0;
            this.ctx.shadowBlur = 0;
        }
    }
    
    drawPowerups() {
        for (const powerup of this.powerups) {
            // Try to draw sprite first
            if (this.useSprites && this.spriteManager.isSpriteLoaded('effect-powerup')) {
                if (this.spriteManager.drawSprite(this.ctx, 'effect-powerup', powerup.x, powerup.y, powerup.width, powerup.height)) {
                    continue; // Sprite drawn successfully
                }
            }
            
            // Fallback to geometric shape
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
                case 'rapid-fire':
                    this.ctx.fillStyle = '#ff6600';
                    break;
            }
            this.ctx.fillRect(powerup.x, powerup.y, powerup.width, powerup.height);
        }
    }

    drawCollectibles() {
        for (const collectible of this.collectibles) {
            // Add glow effect for collectibles
            this.ctx.shadowColor = this.getCollectibleColor(collectible.type);
            this.ctx.shadowBlur = 8;
            
            switch (collectible.type) {
                case 'coin':
                    // Draw coin as a circle with gold color
                    this.ctx.fillStyle = '#FFD700';
                    this.ctx.beginPath();
                    this.ctx.arc(collectible.x + collectible.width/2, collectible.y + collectible.height/2, collectible.width/2, 0, Math.PI * 2);
                    this.ctx.fill();
                    
                    // Add coin shine effect
                    this.ctx.globalAlpha = 0.7;
                    this.ctx.fillStyle = '#FFFFFF';
                    this.ctx.beginPath();
                    this.ctx.arc(collectible.x + collectible.width/2 - 2, collectible.y + collectible.height/2 - 2, collectible.width/4, 0, Math.PI * 2);
                    this.ctx.fill();
                    this.ctx.globalAlpha = 1.0;
                    break;
                    
                case 'gem':
                    // Draw gem as a diamond shape with silver color
                    this.ctx.fillStyle = '#C0C0C0';
                    this.ctx.beginPath();
                    this.ctx.moveTo(collectible.x + collectible.width/2, collectible.y);
                    this.ctx.lineTo(collectible.x + collectible.width, collectible.y + collectible.height/2);
                    this.ctx.lineTo(collectible.x + collectible.width/2, collectible.y + collectible.height);
                    this.ctx.lineTo(collectible.x, collectible.y + collectible.height/2);
                    this.ctx.closePath();
                    this.ctx.fill();
                    
                    // Add gem shine effect
                    this.ctx.globalAlpha = 0.8;
                    this.ctx.fillStyle = '#FFFFFF';
                    this.ctx.fillRect(collectible.x + collectible.width/3, collectible.y + collectible.height/3, collectible.width/3, collectible.height/3);
                    this.ctx.globalAlpha = 1.0;
                    break;
            }
            
            this.ctx.shadowBlur = 0;
        }
    }
    
    drawExplosions() {
        for (const explosion of this.explosions) {
            // Try to draw sprite first
            if (this.useSprites && this.spriteManager.isSpriteLoaded('effect-explosion')) {
                if (this.spriteManager.drawSprite(this.ctx, 'effect-explosion', explosion.x, explosion.y, explosion.width, explosion.height)) {
                    continue; // Sprite drawn successfully
                }
            }
            
            // Fallback to geometric shape
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

        // Draw score
        const scoreElement = document.getElementById('score');
        if (scoreElement) scoreElement.textContent = this.score;

        // Draw lives
        const livesElement = document.getElementById('lives');
        if (livesElement) livesElement.textContent = this.lives;

        // Draw level
        const levelElement = document.getElementById('level');
        if (levelElement) levelElement.textContent = this.level;

        // Draw combo
        const comboElement = document.getElementById('combo');
        if (comboElement) comboElement.textContent = this.combo;

        // Draw streak
        const streakElement = document.getElementById('streak');
        if (streakElement) streakElement.textContent = this.streak;

        // Draw max streak
        const maxStreakElement = document.getElementById('maxStreak');
        if (maxStreakElement) maxStreakElement.textContent = this.maxStreak;

        // Draw coins
        const coinsElement = document.getElementById('coins');
        if (coinsElement) coinsElement.textContent = this.coinsCollected;

        // Draw gems
        const gemsElement = document.getElementById('gems');
        if (gemsElement) gemsElement.textContent = this.gemsCollected;
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
        // Prepare score data
        const scoreData = {
            score: this.score,
            date: new Date().toISOString(),
            survivalTime: this.survivalTime,
            enemiesDestroyed: this.enemiesDestroyed,
            powerupsCollected: this.powerupsCollected,
            coinsCollected: this.coinsCollected,
            gemsCollected: this.gemsCollected,
            streak: this.maxStreak,
            finalWeapon: this.currentWeapon,
            livesRemaining: this.lives
        };

        // Save to localStorage (fallback)
        const highScores = JSON.parse(localStorage.getItem('highScores') || '[]');
        highScores.push(scoreData);
        
        // Sort by score (highest first)
        highScores.sort((a, b) => b.score - a.score);
        
        // Keep only top 10
        highScores.splice(10);
        
        localStorage.setItem('highScores', JSON.stringify(highScores));
        
        // Save to Firebase if available
        if (typeof firebaseUtils !== 'undefined' && firebaseUtils.isAvailable()) {
            firebaseUtils.saveHighScore(scoreData).then(() => {
                console.log('✅ High score saved to Firebase');
            }).catch(error => {
                console.warn('⚠️ Failed to save to Firebase:', error);
            });
            
            // Track game completion event
            firebaseUtils.trackEvent('game_completed', {
                final_score: this.score,
                survival_time: this.survivalTime,
                enemies_destroyed: this.enemiesDestroyed,
                powerups_collected: this.powerupsCollected,
                coins_collected: this.coinsCollected,
                gems_collected: this.gemsCollected,
                final_level: this.level,
                max_combo: this.maxCombo,
                max_streak: this.maxStreak
            });
        } else {
            console.log('⚠️ Firebase not available, score saved locally only');
        }
        
        console.log('🏆 High score saved locally and to Firebase');
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
    
    getEnemySpriteName(enemyType) {
        const spriteMap = {
            'basic': 'enemy-basic',
            'fast': 'enemy-fast',
            'tank': 'enemy-tank',
            'boss': 'enemy-boss'
        };
        return spriteMap[enemyType] || 'enemy-basic';
    }
    
    getBulletSpriteName(bulletType) {
        const spriteMap = {
            'basic': 'weapon-laser',
            'plasma': 'weapon-plasma',
            'missile': 'weapon-missile',
            'laser': 'weapon-laser'
        };
        return spriteMap[bulletType] || 'weapon-laser';
    }

    // Generate Gradius-style ship sprite as fallback
    generateGradiusSprite(color = '#C0C0C0') {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 64;
        canvas.height = 64;
        
        // Gradius Vic Viper ship design - SILVER METALLIC
        const shipColor = color; // Silver color
        const accentColor = '#E6E6FA'; // Light lavender for accents
        const cockpitColor = '#87CEEB'; // Sky blue for cockpit
        const engineColor = '#FF6600'; // Orange for engines
        const cockpitDetailColor = '#000080'; // Navy blue for cockpit details
        const metallicGradient = '#FFFFFF'; // White for metallic highlights
        
        // Main body - nose cone with metallic effect
        ctx.fillStyle = shipColor;
        ctx.beginPath();
        ctx.moveTo(32, 8);
        ctx.lineTo(28, 16);
        ctx.lineTo(36, 16);
        ctx.closePath();
        ctx.fill();
        
        // Add metallic highlight to nose
        ctx.fillStyle = metallicGradient;
        ctx.globalAlpha = 0.6;
        ctx.fillRect(31, 10, 2, 4);
        ctx.globalAlpha = 1.0;
        
        // Main body - fuselage
        ctx.fillStyle = shipColor;
        ctx.beginPath();
        ctx.moveTo(28, 16);
        ctx.lineTo(24, 32);
        ctx.lineTo(22, 40);
        ctx.lineTo(20, 48);
        ctx.lineTo(18, 56);
        ctx.lineTo(46, 56);
        ctx.lineTo(44, 48);
        ctx.lineTo(42, 40);
        ctx.lineTo(40, 32);
        ctx.lineTo(36, 16);
        ctx.closePath();
        ctx.fill();
        
        // Add metallic highlights to body
        ctx.fillStyle = metallicGradient;
        ctx.globalAlpha = 0.4;
        ctx.fillRect(30, 20, 4, 20);
        ctx.globalAlpha = 1.0;
        
        // Wings with metallic effect
        ctx.fillStyle = shipColor;
        // Left wing
        ctx.beginPath();
        ctx.moveTo(24, 32);
        ctx.lineTo(16, 40);
        ctx.lineTo(14, 48);
        ctx.lineTo(20, 48);
        ctx.lineTo(22, 40);
        ctx.closePath();
        ctx.fill();
        
        // Right wing
        ctx.beginPath();
        ctx.moveTo(40, 32);
        ctx.lineTo(48, 40);
        ctx.lineTo(50, 48);
        ctx.lineTo(44, 48);
        ctx.lineTo(42, 40);
        ctx.closePath();
        ctx.fill();
        
        // Add metallic highlights to wings
        ctx.fillStyle = metallicGradient;
        ctx.globalAlpha = 0.3;
        ctx.fillRect(18, 36, 4, 8);
        ctx.fillRect(42, 36, 4, 8);
        ctx.globalAlpha = 1.0;
        
        // Engine details with enhanced glow
        ctx.fillStyle = engineColor;
        ctx.shadowColor = engineColor;
        ctx.shadowBlur = 8;
        ctx.fillRect(26, 44, 3, 8);
        ctx.fillRect(35, 44, 3, 8);
        ctx.shadowBlur = 0;
        
        // Cockpit with enhanced detail
        ctx.fillStyle = cockpitColor;
        ctx.beginPath();
        ctx.ellipse(32, 28, 6, 4, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Cockpit details
        ctx.fillStyle = cockpitDetailColor;
        ctx.beginPath();
        ctx.ellipse(32, 28, 3, 2, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Ship details and accents
        ctx.fillStyle = accentColor;
        // Nose detail
        ctx.fillRect(31, 10, 2, 4);
        
        // Body line
        ctx.beginPath();
        ctx.moveTo(32, 16);
        ctx.lineTo(32, 48);
        ctx.strokeStyle = accentColor;
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // Wing details
        ctx.fillStyle = accentColor;
        ctx.fillRect(30, 36, 4, 2);
        ctx.fillRect(30, 42, 4, 2);
        
        return canvas;
    }

    getEnemyColor(enemyType) {
        switch (enemyType) {
            case 'basic':
                return '#ff4444';
            case 'fast':
                return '#ff8844';
            case 'tank':
                return '#8844ff';
            case 'boss':
                return '#ff4488';
            case 'elite':
                return '#44ff44';
            case 'superboss':
                return '#ff0044';
            default:
                return '#ff0000';
        }
    }

    getBulletColor(bulletType) {
        switch (bulletType) {
            case 'basic':
                return '#ffff00';
            case 'plasma':
                return '#00ffff';
            case 'laser':
                return '#ff00ff';
            case 'missile':
                return '#ff6600';
            case 'railgun':
                return '#00ff00';
            case 'flamethrower':
                return '#ff4400';
            case 'thunder':
                return '#ffff00';
            case 'nuclear':
                return '#ff0000';
            default:
                return '#ffff00';
        }
    }

    getCollectibleColor(collectibleType) {
        switch (collectibleType) {
            case 'coin':
                return '#FFD700';
            case 'gem':
                return '#C0C0C0';
            default:
                return '#FFFFFF';
        }
    }
}
