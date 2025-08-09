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
        
        // Game stats with enhanced tracking
        this.score = 0;
        this.lives = 25;
        this.level = 1;
        this.maxLevel = 50;
        this.combo = 0;
        this.maxCombo = 0;
        this.enemiesDestroyed = 0;
        this.enemiesSpawned = 0;
        this.shotsFired = 0;
        this.shotsHit = 0;
        this.accuracy = 0;
        this.powerupsCollected = 0;
        this.coinsCollected = 0;
        this.gemsCollected = 0;
        this.moneyCollected = 0;
        this.diamondsCollected = 0;
        this.streak = 0;
        this.maxStreak = 0;
        this.survivalTime = 0;
        this.startTime = 0;
        this.bossDefeated = 0;
        this.challengesCompleted = 0;
        
        // Enhanced player with multiple ships
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
            lastAutoDefense: 0,
            shipType: 'gradius',
            shipLevel: 1
        };
        
        // Enhanced weapon system
        this.currentWeapon = 'basic';
        this.weaponLevel = 1;
        this.lastShot = 0;
        this.shotCooldown = 100;
        this.rapidFireEnabled = true;
        this.rapidFireRate = 50;
        this.lastRapidShot = 0;
        
        // Weapons
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
        
        // Ship designs
        this.availableShips = ['gradius', 'interceptor', 'destroyer', 'battleship', 'stealth'];
        this.shipUnlocked = {
            'gradius': true,
            'interceptor': false,
            'destroyer': false,
            'battleship': false,
            'stealth': false
        };
        this.shipPrices = {
            'interceptor': 1000,
            'destroyer': 2500,
            'battleship': 5000,
            'stealth': 10000
        };
        
        // Game objects
        this.bullets = [];
        this.enemies = [];
        this.bosses = [];
        this.powerups = [];
        this.collectibles = [];
        this.explosions = [];
        this.particles = [];
        
        // Level and boss system
        this.enemiesPerLevel = 10; // Enemies needed to advance level
        this.enemiesDestroyedThisLevel = 0;
        this.boss = null;
        this.bossSpawned = false;
        this.bossHealth = 0;
        this.maxBossHealth = 0;
        this.bossDefeatedThisLevel = false;
        
        // Game settings
        this.enemySpawnRate = 90;
        this.enemySpawnTimer = 0;
        this.powerupSpawnRate = 400;
        this.powerupSpawnTimer = 0;
        this.collectibleSpawnRate = 300;
        this.collectibleSpawnTimer = 0;
        this.levelUpThreshold = 10; // Enemies destroyed per level
        this.difficultyRamp = 1.5;
        
        // Mobile touch controls
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.touchActive = false;
        this.lastTouchX = 0;
        this.lastTouchY = 0;
        this.autoShoot = true;
        this.isShooting = false;
        
        // Addictiveness features
        this.comboMultiplier = 1;
        this.comboTimer = 0;
        this.comboDecayTime = 3000;
        this.scoreMultiplier = 1;
        this.powerupChance = 0.05;
        this.collectibleChance = 0.15;
        this.streakBonus = 1;
        
        // Sound effects
        this.sounds = {};
        this.soundEnabled = true;
        this.initSounds();
        
        // Pause/Resume functionality
        this.isPaused = false;
        this.pauseTime = 0;
        this.totalPauseTime = 0;
        
        // Medal system
        this.medals = {
            bronze: { score: 5000, icon: '🥉' },
            silver: { score: 15000, icon: '🥈' },
            gold: { score: 30000, icon: '🥇' }
        };
        
        // Store system
        this.storeOpen = false;
        
        // Save/Load system
        this.saveData = null;
        this.autoSaveInterval = null;
        
        // Challenges system
        this.challenges = [
            { id: 'accuracy', name: 'Sharpshooter', description: 'Achieve 90% accuracy', target: 0.9, completed: false },
            { id: 'combo', name: 'Combo Master', description: 'Get a 50x combo', target: 50, completed: false },
            { id: 'survival', name: 'Survivor', description: 'Survive 10 minutes', target: 600, completed: false },
            { id: 'boss', name: 'Boss Hunter', description: 'Defeat 5 bosses', target: 5, completed: false },
            { id: 'score', name: 'High Scorer', description: 'Score 100,000 points', target: 100000, completed: false }
        ];
        
        // Initialize canvas
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        
        // Initialize sprites
        this.initSprites();
        
        // Initialize touch controls
        this.initTouchControls();
        
        // Initialize keyboard controls
        this.initKeyboardControls();
        
        // Initialize game
        this.init();
        
        console.log('Game engine initialized successfully');
    }
    
    initSounds() {
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
            this.sounds.money = this.generateMoneySound();
            this.sounds.diamond = this.generateDiamondSound();
            this.sounds.boss = this.generateBossSound();
            this.sounds.bossDefeat = this.generateBossDefeatSound();
            
        } catch (error) {
            console.log('Audio not supported, sounds will be disabled');
            this.soundEnabled = false;
        }
    }
    
    generateBossSound() {
        if (!this.audioContext) return null;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(100, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(200, this.audioContext.currentTime + 0.5);
        
        gainNode.gain.setValueAtTime(0.4, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);
        
        return { oscillator, gainNode };
    }
    
    generateBossDefeatSound() {
        if (!this.audioContext) return null;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(800, this.audioContext.currentTime + 0.8);
        
        gainNode.gain.setValueAtTime(0.5, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.8);
        
        return { oscillator, gainNode };
    }
    
    updateDifficulty() {
        // Level advancement based on enemies destroyed
        if (this.enemiesDestroyedThisLevel >= this.enemiesPerLevel) {
            this.levelUp();
        }
    }
    
    levelUp() {
        this.level++;
        this.enemiesDestroyedThisLevel = 0;
        this.bossDefeatedThisLevel = false;
        
        // Spawn boss every 5 levels
        if (this.level % 5 === 0) {
            this.spawnBoss();
        }
        
        // Increase difficulty
        this.enemySpawnRate = Math.max(15, 90 - (this.level * 8));
        this.powerupChance = Math.min(0.2, 0.05 + (this.level * 0.01));
        this.enemyHealthMultiplier = 1 + (this.level * 0.3);
        this.enemySpeedMultiplier = 1 + (this.level * 0.15);
        
        // Show level up notification
        this.showLevelUpNotification();
        
        // Play level up sound
        this.playSound('levelUp');
        
        // Auto-save after level up
        this.saveGame();
    }
    
    spawnBoss() {
        if (this.bossSpawned) return;
        
        const bossTypes = [
            'cyber-dragon', 'void-walker', 'star-destroyer', 'nebula-beast', 'quantum-leviathan',
            'time-warper', 'gravity-shifter', 'plasma-phantom', 'crystal-giant', 'dark-void',
            'lightning-lord', 'frost-king', 'fire-demon', 'earth-shaper', 'wind-walker',
            'shadow-master', 'light-bringer', 'chaos-bringer', 'order-keeper', 'balance-maintainer',
            'void-crawler', 'star-eater', 'nebula-dweller', 'quantum-bender', 'time-shifter',
            'gravity-puller', 'plasma-fist', 'crystal-binder', 'dark-master', 'lightning-fist',
            'frost-finger', 'fire-hand', 'earth-mover', 'wind-blower', 'shadow-caster',
            'light-ray', 'chaos-fist', 'order-hand', 'balance-scale', 'void-king',
            'star-prince', 'nebula-queen', 'quantum-king', 'time-queen', 'gravity-king',
            'plasma-queen', 'crystal-king', 'dark-queen', 'lightning-king', 'frost-queen'
        ];
        
        const bossType = bossTypes[Math.min(this.level - 1, bossTypes.length - 1)];
        const bossHealth = 500 + (this.level * 100);
        const bossSpeed = 1 + (this.level * 0.1);
        
        this.boss = {
            x: this.canvas.width / 2 - 75,
            y: -150,
            width: 150,
            height: 150,
            speed: bossSpeed,
            health: bossHealth,
            maxHealth: bossHealth,
            type: bossType,
            phase: 1,
            attackPattern: 0,
            lastAttack: 0,
            attackCooldown: 2000
        };
        
        this.maxBossHealth = bossHealth;
        this.bossSpawned = true;
        
        // Play boss sound
        this.playSound('boss');
        
        // Show boss notification
        this.showBossNotification(bossType);
    }
    
    showBossNotification(bossType) {
        const notification = document.createElement('div');
        notification.className = 'event-notification';
        notification.innerHTML = `👹 BOSS BATTLE!<br><small>${bossType.toUpperCase()}</small>`;
        notification.style.background = 'linear-gradient(135deg, #ff0000, #800000)';
        notification.style.color = '#fff';
        notification.style.fontWeight = 'bold';
        notification.style.fontSize = '32px';
        
        document.getElementById('gameContainer').appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 4000);
    }
    
    updateBoss() {
        if (!this.boss || this.bossHealth <= 0) return;
        
        // Move boss down
        if (this.boss.y < 50) {
            this.boss.y += 1;
        }
        
        // Boss attack patterns
        const now = Date.now();
        if (now - this.boss.lastAttack > this.boss.attackCooldown) {
            this.bossAttack();
            this.boss.lastAttack = now;
        }
    }
    
    bossAttack() {
        // Different attack patterns based on boss type and phase
        const attackPatterns = [
            this.spreadAttack.bind(this),
            this.circleAttack.bind(this),
            this.laserAttack.bind(this),
            this.missileAttack.bind(this),
            this.orbitalAttack.bind(this)
        ];
        
        const pattern = attackPatterns[this.boss.attackPattern % attackPatterns.length];
        pattern();
        
        this.boss.attackPattern++;
    }
    
    spreadAttack() {
        for (let i = -2; i <= 2; i++) {
            this.enemies.push({
                x: this.boss.x + this.boss.width / 2 - 15,
                y: this.boss.y + this.boss.height,
                width: 30,
                height: 30,
                speed: 3,
                health: 50,
                maxHealth: 50,
                type: 'boss-minion',
                angle: i * 0.5
            });
        }
    }
    
    circleAttack() {
        for (let i = 0; i < 8; i++) {
            const angle = (i * Math.PI * 2) / 8;
            this.enemies.push({
                x: this.boss.x + this.boss.width / 2 - 15,
                y: this.boss.y + this.boss.height,
                width: 20,
                height: 20,
                speed: 2,
                health: 30,
                maxHealth: 30,
                type: 'boss-projectile',
                angle: angle
            });
        }
    }
    
    laserAttack() {
        // Create laser beam
        this.bullets.push({
            x: this.boss.x + this.boss.width / 2 - 1,
            y: this.boss.y + this.boss.height,
            width: 2,
            height: this.canvas.height,
            speed: 8,
            damage: 40,
            type: 'boss-laser',
            isBossBullet: true
        });
    }
    
    missileAttack() {
        for (let i = 0; i < 3; i++) {
            this.bullets.push({
                x: this.boss.x + (i - 1) * 30,
                y: this.boss.y + this.boss.height,
                width: 8,
                height: 16,
                speed: 4,
                damage: 30,
                type: 'boss-missile',
                isBossBullet: true,
                angle: Math.PI / 2
            });
        }
    }
    
    orbitalAttack() {
        // Create orbital projectiles
        for (let i = 0; i < 4; i++) {
            const angle = (i * Math.PI * 2) / 4 + Date.now() * 0.001;
            this.enemies.push({
                x: this.boss.x + this.boss.width / 2 + Math.cos(angle) * 100,
                y: this.boss.y + this.boss.height / 2 + Math.sin(angle) * 100,
                width: 25,
                height: 25,
                speed: 1.5,
                health: 40,
                maxHealth: 40,
                type: 'boss-orbital',
                orbitAngle: angle,
                orbitRadius: 100,
                orbitCenter: { x: this.boss.x + this.boss.width / 2, y: this.boss.y + this.boss.height / 2 }
            });
        }
    }
    
    saveGame() {
        const saveData = {
            score: this.score,
            level: this.level,
            lives: this.lives,
            enemiesDestroyed: this.enemiesDestroyed,
            enemiesDestroyedThisLevel: this.enemiesDestroyedThisLevel,
            bossDefeated: this.bossDefeated,
            challengesCompleted: this.challengesCompleted,
            coinsCollected: this.coinsCollected,
            gemsCollected: this.gemsCollected,
            moneyCollected: this.moneyCollected,
            diamondsCollected: this.diamondsCollected,
            streak: this.streak,
            maxStreak: this.maxStreak,
            accuracy: this.accuracy,
            shotsFired: this.shotsFired,
            shotsHit: this.shotsHit,
            weaponUnlocked: this.weaponUnlocked,
            shipUnlocked: this.shipUnlocked,
            currentWeapon: this.currentWeapon,
            playerShipType: this.player.shipType,
            timestamp: new Date().toISOString()
        };
        
        // Save to localStorage
        localStorage.setItem('spaceShooterSave', JSON.stringify(saveData));
        
        // Save to Firebase if available
        if (typeof firebaseUtils !== 'undefined' && firebaseUtils.isAvailable()) {
            firebaseUtils.saveGameProgress(saveData).then(() => {
                console.log('Game progress saved to Firebase');
            }).catch(error => {
                console.error('Failed to save game progress:', error);
            });
        }
    }
    
    loadGame() {
        // Try to load from localStorage first
        const savedData = localStorage.getItem('spaceShooterSave');
        if (savedData) {
            try {
                const data = JSON.parse(savedData);
                this.score = data.score || 0;
                this.level = data.level || 1;
                this.lives = data.lives || 25;
                this.enemiesDestroyed = data.enemiesDestroyed || 0;
                this.enemiesDestroyedThisLevel = data.enemiesDestroyedThisLevel || 0;
                this.bossDefeated = data.bossDefeated || 0;
                this.challengesCompleted = data.challengesCompleted || 0;
                this.coinsCollected = data.coinsCollected || 0;
                this.gemsCollected = data.gemsCollected || 0;
                this.moneyCollected = data.moneyCollected || 0;
                this.diamondsCollected = data.diamondsCollected || 0;
                this.streak = data.streak || 0;
                this.maxStreak = data.maxStreak || 0;
                this.accuracy = data.accuracy || 0;
                this.shotsFired = data.shotsFired || 0;
                this.shotsHit = data.shotsHit || 0;
                
                if (data.weaponUnlocked) {
                    this.weaponUnlocked = { ...this.weaponUnlocked, ...data.weaponUnlocked };
                }
                
                if (data.shipUnlocked) {
                    this.shipUnlocked = { ...this.shipUnlocked, ...data.shipUnlocked };
                }
                
                this.currentWeapon = data.currentWeapon || 'basic';
                this.player.shipType = data.playerShipType || 'gradius';
                
                console.log('Game loaded successfully');
                return true;
            } catch (error) {
                console.error('Failed to parse save data:', error);
            }
        }
        
        // Try to load from Firebase if localStorage failed
        if (typeof firebaseUtils !== 'undefined' && firebaseUtils.isAvailable()) {
            firebaseUtils.loadGameProgress().then((data) => {
                if (data) {
                    this.score = data.score || 0;
                    this.level = data.level || 1;
                    this.lives = data.lives || 25;
                    // ... load other data
                    console.log('Game loaded from Firebase');
                }
            }).catch(error => {
                console.error('Failed to load from Firebase:', error);
            });
        }
        
        return false;
    }
    
    drawCollectibles() {
        for (const collectible of this.collectibles) {
            // Add glow effect for collectibles
            this.ctx.shadowColor = this.getCollectibleColor(collectible.type);
            this.ctx.shadowBlur = 8;
            
            switch (collectible.type) {
                case 'coin':
                    // Draw coin as emoji
                    this.ctx.font = `${collectible.height}px Arial`;
                    this.ctx.textAlign = 'center';
                    this.ctx.textBaseline = 'middle';
                    this.ctx.fillText('🪙', collectible.x + collectible.width/2, collectible.y + collectible.height/2);
                    break;
                    
                case 'gem':
                    // Draw gem as emoji
                    this.ctx.font = `${collectible.height}px Arial`;
                    this.ctx.textAlign = 'center';
                    this.ctx.textBaseline = 'middle';
                    this.ctx.fillText('💎', collectible.x + collectible.width/2, collectible.y + collectible.height/2);
                    break;
                    
                case 'money':
                    // Draw money as emoji
                    this.ctx.font = `${collectible.height}px Arial`;
                    this.ctx.textAlign = 'center';
                    this.ctx.textBaseline = 'middle';
                    this.ctx.fillText('💰', collectible.x + collectible.width/2, collectible.y + collectible.height/2);
                    break;
                    
                case 'diamond':
                    // Draw diamond as emoji
                    this.ctx.font = `${collectible.height}px Arial`;
                    this.ctx.textAlign = 'center';
                    this.ctx.textBaseline = 'middle';
                    this.ctx.fillText('💠', collectible.x + collectible.width/2, collectible.y + collectible.height/2);
                    break;
            }
            
            this.ctx.shadowBlur = 0;
        }
    }
    
    updateComboAndScore(enemyType) {
        // Update combo
        this.combo++;
        this.comboTimer = this.comboDecayTime;
        
        // Update accuracy
        this.shotsHit++;
        this.accuracy = this.shotsFired > 0 ? this.shotsHit / this.shotsFired : 0;
        
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
            case 'boss-minion':
                baseScore = 75;
                break;
            case 'boss-projectile':
                baseScore = 30;
                break;
            case 'boss-orbital':
                baseScore = 60;
                break;
        }
        
        // Apply combo multiplier
        this.comboMultiplier = Math.min(10, 1 + (this.combo * 0.5));
        const finalScore = Math.floor(baseScore * this.comboMultiplier * this.scoreMultiplier);
        
        this.score += finalScore;
        this.enemiesDestroyed++;
        this.enemiesDestroyedThisLevel++;
        
        // Show score popup
        this.showScorePopup(finalScore, enemyType);
        
        // Update max combo
        if (this.combo > this.maxCombo) {
            this.maxCombo = this.combo;
        }
        
        // Check challenges
        this.checkChallenges();
    }
    
    checkChallenges() {
        // Check accuracy challenge
        if (this.accuracy >= 0.9 && !this.challenges.find(c => c.id === 'accuracy').completed) {
            this.challenges.find(c => c.id === 'accuracy').completed = true;
            this.showChallengeNotification('Sharpshooter', 'Achieve 90% accuracy');
        }
        
        // Check combo challenge
        if (this.combo >= 50 && !this.challenges.find(c => c.id === 'combo').completed) {
            this.challenges.find(c => c.id === 'combo').completed = true;
            this.showChallengeNotification('Combo Master', 'Get a 50x combo');
        }
        
        // Check survival challenge
        if (this.survivalTime >= 600 && !this.challenges.find(c => c.id === 'survival').completed) {
            this.challenges.find(c => c.id === 'survival').completed = true;
            this.showChallengeNotification('Survivor', 'Survive 10 minutes');
        }
        
        // Check boss challenge
        if (this.bossDefeated >= 5 && !this.challenges.find(c => c.id === 'boss').completed) {
            this.challenges.find(c => c.id === 'boss').completed = true;
            this.showChallengeNotification('Boss Hunter', 'Defeat 5 bosses');
        }
        
        // Check score challenge
        if (this.score >= 100000 && !this.challenges.find(c => c.id === 'score').completed) {
            this.challenges.find(c => c.id === 'score').completed = true;
            this.showChallengeNotification('High Scorer', 'Score 100,000 points');
        }
    }
    
    showChallengeNotification(challengeName, description) {
        const notification = document.createElement('div');
        notification.className = 'event-notification';
        notification.innerHTML = `🏆 CHALLENGE COMPLETED!<br><small>${challengeName}: ${description}</small>`;
        notification.style.background = 'linear-gradient(135deg, #FFD700, #FFA500)';
        notification.style.color = '#000';
        notification.style.fontWeight = 'bold';
        notification.style.fontSize = '24px';
        
        document.getElementById('gameContainer').appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 4000);
    }
    
    shoot() {
        const now = Date.now();
        
        // Track shots fired for accuracy
        this.shotsFired++;
        
        // Rapid fire mode
        if (this.rapidFireEnabled && (this.keys && this.keys[' '] || this.isShooting)) {
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
        this.updateBoss();
        this.updatePowerups();
        this.updateExplosions();
        this.updateParticles();
        this.updateCollectibles();
        
        // Spawn enemies and powerups
        this.spawnEnemies();
        this.spawnPowerups();
        this.spawnCollectibles();
        
        // Check collisions
        this.checkCollisions();
        
        // Update difficulty based on enemies destroyed
        this.updateDifficulty();
        
        // Update UI
        this.updateUI();
        
        // Auto-save every 30 seconds
        if (this.survivalTime % 30 === 0 && this.survivalTime > 0) {
            this.saveGame();
        }
    }
    
    updateUI() {
        const scoreElement = document.getElementById('score');
        const livesElement = document.getElementById('lives');
        const levelElement = document.getElementById('level');
        const comboElement = document.getElementById('combo');
        const streakElement = document.getElementById('streak');
        const accuracyElement = document.getElementById('accuracy');
        const coinsElement = document.getElementById('coins');
        const gemsElement = document.getElementById('gems');
        const moneyElement = document.getElementById('money');
        const diamondsElement = document.getElementById('diamonds');
        
        if (scoreElement) scoreElement.textContent = this.score.toLocaleString();
        if (livesElement) livesElement.textContent = this.lives;
        if (levelElement) levelElement.textContent = `${this.level}/50`;
        if (comboElement) comboElement.textContent = this.combo;
        if (streakElement) streakElement.textContent = this.streak;
        if (accuracyElement) accuracyElement.textContent = Math.round(this.accuracy * 100);
        if (coinsElement) coinsElement.textContent = this.coinsCollected;
        if (gemsElement) gemsElement.textContent = this.gemsCollected;
        if (moneyElement) moneyElement.textContent = this.moneyCollected.toLocaleString();
        if (diamondsElement) diamondsElement.textContent = this.diamondsCollected;
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
    
    initTouchControls() {
        // Touch start
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const rect = this.canvas.getBoundingClientRect();
            this.touchStartX = touch.clientX - rect.left;
            this.touchStartY = touch.clientY - rect.top;
            this.touchActive = true;
            this.isShooting = true; // Start shooting when touch begins
            this.lastTouchX = this.touchStartX;
            this.lastTouchY = this.touchStartY;
            
            // Move player to touch position
            this.movePlayerToTouch(this.touchStartX, this.touchStartY);
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
            this.isShooting = false; // Stop shooting when touch ends
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
        this.lives = 25;
        this.level = 1;
        this.combo = 0;
        this.maxCombo = 0;
        this.enemiesDestroyed = 0;
        this.enemiesDestroyedThisLevel = 0;
        this.shotsFired = 0;
        this.shotsHit = 0;
        this.accuracy = 0;
        this.powerupsCollected = 0;
        this.coinsCollected = 0;
        this.gemsCollected = 0;
        this.moneyCollected = 0;
        this.diamondsCollected = 0;
        this.streak = 0;
        this.maxStreak = 0;
        this.survivalTime = 0;
        
        // Clear all game objects
        this.bullets = [];
        this.enemies = [];
        this.bosses = [];
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
        
        // Reset boss
        this.boss = null;
        this.bossSpawned = false;
        this.bossHealth = 0;
        this.maxBossHealth = 0;
        this.bossDefeatedThisLevel = false;
        
        // Update UI
        this.updateUI();
        
        console.log('Game initialized with 25 lives');
    }
    
    startGame() {
        console.log('Starting game...');
        this.gameState = 'playing';
        this.startTime = Date.now();
        
        // Reset game stats for new game
        this.init();
        
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
    
    gameLoop() {
        if (this.gameState !== 'playing') return;
        
        // Update game
        this.update();
        
        // Render game
        this.render();
        
        // Continue loop
        requestAnimationFrame(() => this.gameLoop());
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
        this.drawBoss();
        this.drawPowerups();
        this.drawCollectibles();
        this.drawExplosions();
        this.drawParticles();
        
        // Draw UI
        this.drawUI();
    }

    // Store functionality
    openStore() {
        if (this.gameState === 'playing') {
            this.gameState = 'paused';
        }
        
        // Create store overlay
        const storeOverlay = document.createElement('div');
        storeOverlay.id = 'storeOverlay';
        storeOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        `;
        
        const storeContent = document.createElement('div');
        storeContent.className = 'menu-content';
        storeContent.style.cssText = `
            background: linear-gradient(135deg, rgba(26, 26, 46, 0.98) 0%, rgba(22, 33, 62, 0.98) 100%);
            padding: 40px;
            border-radius: 25px;
            border: 2px solid rgba(0, 255, 136, 0.3);
            text-align: center;
            max-width: 800px;
            width: 90%;
            max-height: 80vh;
            overflow-y: auto;
            box-shadow: 0 0 50px rgba(0, 255, 136, 0.3);
        `;
        
        storeContent.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px;">
                <h2 style="margin: 0; color: #00ff88;">🏪 Ship Store</h2>
                <button onclick="game.closeStore()" style="
                    background: rgba(255, 255, 255, 0.1);
                    border: 2px solid rgba(255, 255, 255, 0.3);
                    border-radius: 50%;
                    width: 40px;
                    height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    font-size: 18px;
                    font-weight: bold;
                    color: white;
                ">✕</button>
            </div>
            <div style="margin-bottom: 20px; font-size: 1.2em; color: #00ff88;">
                💰 Money: $${this.moneyCollected} | 💠 Diamonds: ${this.diamondsCollected}
            </div>
            <div style="
                background: linear-gradient(135deg, rgba(0, 255, 136, 0.1) 0%, rgba(0, 204, 102, 0.1) 100%);
                border: 2px solid rgba(0, 255, 136, 0.3);
                border-radius: 15px;
                padding: 15px 20px;
                margin-bottom: 20px;
                text-align: center;
            ">
                <div style="color: #00ff88; font-weight: bold; font-size: 1.1em; margin-bottom: 5px;">
                    🎮 In-Game Currency Only
                </div>
                <div style="color: rgba(255, 255, 255, 0.8); font-size: 0.9em;">
                    This store uses <strong>fake money earned by playing the game</strong>, not real money!
                </div>
            </div>
            <div id="storeItems" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px;">
                ${this.generateStoreItems()}
            </div>
        `;
        
        storeOverlay.appendChild(storeContent);
        document.body.appendChild(storeOverlay);
    }

    closeStore() {
        const storeOverlay = document.getElementById('storeOverlay');
        if (storeOverlay) {
            storeOverlay.remove();
        }
        
        if (this.gameState === 'paused') {
            this.gameState = 'playing';
        }
    }

    generateStoreItems() {
        let itemsHTML = '';
        
        for (const shipType of this.availableShips) {
            if (!this.shipUnlocked[shipType]) {
                const price = this.shipPrices[shipType] || 100;
                const description = this.getShipDescription(shipType);
                
                itemsHTML += `
                    <div style="
                        background: linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%);
                        border: 1px solid rgba(0, 255, 136, 0.2);
                        border-radius: 20px;
                        padding: 25px;
                        transition: all 0.3s ease;
                        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
                    ">
                        <div style="display: flex; align-items: center; margin-bottom: 15px;">
                            <div style="font-size: 2.5em; margin-right: 15px;">
                                ${this.getShipIcon(shipType)}
                            </div>
                            <div>
                                <h3 style="margin: 0; color: #00ff88; font-size: 1.5em;">${shipType.charAt(0).toUpperCase() + shipType.slice(1)}</h3>
                                <p style="margin: 5px 0; color: rgba(255, 255, 255, 0.7); font-size: 0.9em;">${description}</p>
                            </div>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div style="color: #00ff88; font-weight: bold; font-size: 1.2em;">
                                💰 $${price}
                            </div>
                            <button onclick="game.buyShip('${shipType}')" style="
                                background: linear-gradient(135deg, #00ff88, #00cc66);
                                border: none;
                                padding: 10px 20px;
                                border-radius: 25px;
                                color: #000;
                                font-weight: bold;
                                font-size: 14px;
                                cursor: pointer;
                                transition: all 0.3s ease;
                                box-shadow: 0 5px 15px rgba(0, 255, 136, 0.3);
                            ">Buy Ship</button>
                        </div>
                    </div>
                `;
            }
        }
        
        if (itemsHTML === '') {
            itemsHTML = `
                <div style="
                    background: linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%);
                    border: 1px solid rgba(0, 255, 136, 0.2);
                    border-radius: 20px;
                    padding: 25px;
                    text-align: center;
                ">
                    <h3 style="color: #00ff88; margin-bottom: 10px;">🎉 All Ships Unlocked!</h3>
                    <p style="color: rgba(255, 255, 255, 0.7);">You've unlocked all available ships!</p>
                </div>
            `;
        }
        
        return itemsHTML;
    }

    getShipDescription(shipType) {
        const descriptions = {
            'gradius': 'Balanced starter ship with good all-around stats',
            'interceptor': 'Fast and agile fighter with enhanced damage',
            'destroyer': 'Heavy damage dealer, slower but powerful',
            'battleship': 'Massive ship with multiple weapons',
            'stealth': 'Sleek and dark with stealth capabilities'
        };
        return descriptions[shipType] || 'Unknown ship type';
    }

    getShipIcon(shipType) {
        const icons = {
            'gradius': '🛸',
            'interceptor': '🚀',
            'destroyer': '🛰️',
            'battleship': '⚔️',
            'stealth': '🕶️'
        };
        return icons[shipType] || '🚀';
    }

    buyShip(shipType) {
        const price = this.shipPrices[shipType] || 100;
        
        if (this.moneyCollected >= price) {
            this.moneyCollected -= price;
            this.shipUnlocked[shipType] = true;
            this.player.shipType = shipType;
            
            // Show purchase notification
            this.showPurchaseNotification(shipType);
            
            // Update store display
            const storeItems = document.getElementById('storeItems');
            if (storeItems) {
                storeItems.innerHTML = this.generateStoreItems();
            }
            
            // Update UI
            this.updateUI();
            
            console.log(`Ship ${shipType} purchased successfully!`);
        } else {
            alert('Not enough money to purchase this ship!');
        }
    }

    showPurchaseNotification(shipType) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, #00ff88, #00cc66);
            color: #000;
            padding: 20px 40px;
            border-radius: 15px;
            font-weight: bold;
            font-size: 24px;
            text-align: center;
            z-index: 2000;
            box-shadow: 0 0 30px rgba(0, 255, 136, 0.5);
            animation: notificationPop 0.5s ease-out;
        `;
        
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 1.5em;">🎉</span>
                <span>Ship ${shipType.charAt(0).toUpperCase() + shipType.slice(1)} purchased!</span>
            </div>
        `;

        document.body.appendChild(notification);

        // Remove after 3 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }
}
