// Enhanced Space Shooter Game with Boss Battles, Power-ups, and Multiplayer!
class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = 800;
        this.canvas.height = 600;
        
        this.player = null;
        this.player2 = null; // Second player for multiplayer
        this.enemies = [];
        this.bullets = [];
        this.enemyBullets = [];
        this.particles = [];
        this.collectibles = [];
        this.powerUps = [];
        this.bosses = [];
        this.asteroids = [];
        
        this.score = 0;
        this.lives = 5;
        this.lives2 = 5; // Second player lives
        this.level = 1;
        this.gameState = 'start';
        this.gameRunning = false;
        this.lastTime = 0;
        this.multiplayerMode = false; // Track if multiplayer is active
        
        // Top score tracking
        this.topScore = this.loadTopScore();
        
        // Enemy spawning
        this.enemySpawnTimer = 0;
        this.enemySpawnInterval = 1200;
        
        // Boss system
        this.bossSpawnScore = 500; // First boss at 500 points
        this.bossSpawnInterval = 1000; // Additional bosses every 1000 points
        this.currentBoss = null;
        this.bossDefeated = false;
        
        // Power-up system
        this.activePowerUps = {
            invincibility: { active: false, duration: 0, maxDuration: 10000 },
            speedBoost: { active: false, duration: 0, maxDuration: 8000 },
            spreadShot: { active: false, duration: 0, maxDuration: 12000 },
            rapidFire: { active: false, duration: 0, maxDuration: 15000 }
        };
        this.activePowerUps2 = { // Second player power-ups
            invincibility: { active: false, duration: 0, maxDuration: 10000 },
            speedBoost: { active: false, duration: 0, maxDuration: 8000 },
            spreadShot: { active: false, duration: 0, maxDuration: 12000 },
            rapidFire: { active: false, duration: 0, maxDuration: 15000 }
        };
        
        // Achievement system
        this.achievements = {
            firstKill: { unlocked: false, name: "First Blood", description: "Destroy your first enemy" },
            score100: { unlocked: false, name: "Century", description: "Reach 100 points" },
            score500: { unlocked: false, name: "Halfway There", description: "Reach 500 points" },
            score1000: { unlocked: false, name: "Master", description: "Reach 1000 points" },
            bossKiller: { unlocked: false, name: "Boss Slayer", description: "Defeat your first boss" },
            survivor: { unlocked: false, name: "Survivor", description: "Survive for 2 minutes" },
            sharpshooter: { unlocked: false, name: "Sharpshooter", description: "Hit 50 enemies without missing" },
            teamPlayer: { unlocked: false, name: "Team Player", description: "Play multiplayer mode" }
        };
        this.loadAchievements();
        
        // Statistics
        this.stats = {
            enemiesKilled: 0,
            bossesKilled: 0,
            powerUpsCollected: 0,
            timeSurvived: 0,
            shotsFired: 0,
            shotsHit: 0
        };
        
        // Visual effects
        this.screenShake = 0;
        this.starfield = [];
        this.initStarfield();
        
        // Audio system
        this.audioContext = null;
        this.sounds = {};
        this.initAudio();
        
        // Shop system
        this.money = 0;
        this.shopOpen = false;
        this.weaponLevel = 1;
        this.weaponLevel2 = 1; // Second player weapon level
        this.shieldLevel = 0;
        this.shieldLevel2 = 0; // Second player shield level
        this.specialAbilities = {
            rapidFire: false,
            homingMissiles: false,
            shield: false,
            multiShot: false
        };
        this.specialAbilities2 = { // Second player abilities
            rapidFire: false,
            homingMissiles: false,
            shield: false,
            multiShot: false
        };
        this.shipType = 'basic';
        this.shipType2 = 'basic'; // Second player ship type
        this.scoreMultiplier = 1;
        this.scoreMultiplier2 = 1; // Second player score multiplier
        this.specialWeapons = [];
        this.specialWeapons2 = []; // Second player special weapons
        
        // Enhanced shop items
        this.shopItems = [
            { id: 'weapon_upgrade', name: 'Weapon Upgrade', cost: 50, emoji: '🔫', description: 'Upgrade weapon damage' },
            { id: 'shield', name: 'Shield', cost: 75, emoji: '🛡️', description: 'Block enemy bullets' },
            { id: 'rapid_fire', name: 'Rapid Fire', cost: 100, emoji: '⚡', description: 'Faster shooting' },
            { id: 'homing_missiles', name: 'Homing Missiles', cost: 150, emoji: '🎯', description: 'Auto-targeting missiles' },
            { id: 'multi_shot', name: 'Multi Shot', cost: 120, emoji: '🔫', description: 'Shoot multiple bullets' },
            { id: 'score_multiplier', name: 'Score Multiplier', cost: 80, emoji: '⭐', description: '2x score points' },
            { id: 'extra_life', name: 'Extra Life', cost: 200, emoji: '❤️', description: 'Gain 1 life' },
            { id: 'special_weapon', name: 'Special Weapon', cost: 300, emoji: '💥', description: 'One-time powerful weapon' },
            { id: 'invincibility', name: 'Invincibility', cost: 400, emoji: '✨', description: 'Temporary invincibility' },
            { id: 'speed_boost', name: 'Speed Boost', cost: 250, emoji: '🏃', description: 'Temporary speed boost' }
        ];
        
        this.keys = {};
        this.keys2 = {}; // Second player keys
        this.setupInput();
        this.createShootSound = this.createShootSound();
    }
    
    loadAchievements() {
        const savedAchievements = localStorage.getItem('achievements');
        if (savedAchievements) {
            const loaded = JSON.parse(savedAchievements);
            Object.keys(loaded).forEach(key => {
                if (this.achievements[key]) {
                    this.achievements[key].unlocked = loaded[key].unlocked;
                }
            });
        }
    }
    
    saveAchievements() {
        localStorage.setItem('achievements', JSON.stringify(this.achievements));
    }
    
    initStarfield() {
        this.starfield = [];
        for (let i = 0; i < 100; i++) {
            this.starfield.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                speed: Math.random() * 50 + 10,
                size: Math.random() * 2 + 1
            });
        }
    }
    
    initAudio() {
        // Initialize audio context for sound effects
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.log('Audio not supported');
        }
    }
    
    loadTopScore() {
        const topScore = localStorage.getItem('topScore');
        return topScore ? parseInt(topScore) : 0;
    }
    
    saveTopScore() {
        localStorage.setItem('topScore', this.topScore);
    }
    
    initializeTopScoreDisplay() {
        document.getElementById('topScoreDisplay').textContent = this.topScore;
    }
    
    setupInput() {
        document.addEventListener('keydown', (e) => {
            // Player 1 controls (WASD + Space)
            if (e.key === 'w' || e.key === 'W') this.keys2['w'] = true;
            if (e.key === 's' || e.key === 'S') this.keys2['s'] = true;
            if (e.key === 'a' || e.key === 'A') this.keys2['a'] = true;
            if (e.key === 'd' || e.key === 'D') this.keys2['d'] = true;
            if (e.key === ' ') this.keys[' '] = true; // Player 1 shoots with spacebar
            
            // Player 2 controls (Arrow keys + Enter)
            if (e.key === 'ArrowLeft') this.keys['ArrowLeft'] = true;
            if (e.key === 'ArrowRight') this.keys['ArrowRight'] = true;
            if (e.key === 'ArrowUp') this.keys['ArrowUp'] = true;
            if (e.key === 'ArrowDown') this.keys['ArrowDown'] = true;
            if (e.key === 'Enter') this.keys2['Enter'] = true; // Player 2 shoots with Enter
            
            // Shop controls
            if (e.key === 'p' || e.key === 'P') {
                this.toggleShop();
            }
            
            // Special weapon activation
            if (e.key === 's' || e.key === 'S') {
                this.activateSpecialWeapon();
            }
            if (e.key === 'f' || e.key === 'F') {
                this.activateSpecialWeapon2(); // Player 2 special weapon
            }
            
            // Number keys for shop items
            if (this.shopOpen && e.key >= '1' && e.key <= '8') {
                this.buyShopItem(parseInt(e.key) - 1);
            }
            
            // Multiplayer toggle
            if (e.key === 'm' || e.key === 'M') {
                this.toggleMultiplayer();
            }
            
            // Debug spacebar
            if (e.key === ' ') {
                console.log('Spacebar pressed!');
            }
        });
        
        document.addEventListener('keyup', (e) => {
            // Player 1 controls
            if (e.key === 'w' || e.key === 'W') this.keys2['w'] = false;
            if (e.key === 's' || e.key === 'S') this.keys2['s'] = false;
            if (e.key === 'a' || e.key === 'A') this.keys2['a'] = false;
            if (e.key === 'd' || e.key === 'D') this.keys2['d'] = false;
            if (e.key === ' ') this.keys[' '] = false;
            
            // Player 2 controls
            if (e.key === 'ArrowLeft') this.keys['ArrowLeft'] = false;
            if (e.key === 'ArrowRight') this.keys['ArrowRight'] = false;
            if (e.key === 'ArrowUp') this.keys['ArrowUp'] = false;
            if (e.key === 'ArrowDown') this.keys['ArrowDown'] = false;
            if (e.key === 'Enter') this.keys2['Enter'] = false;
        });
        
        // Mobile touch controls
        let isTouching = false;
        let touchShootTimer = 0;
        
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            isTouching = true;
            touchShootTimer = 0;
            
            const touch = e.touches[0];
            const rect = this.canvas.getBoundingClientRect();
            const x = touch.clientX - rect.left;
            const y = touch.clientY - rect.top;
            
            if (this.player) {
                this.player.x = x - this.player.width/2;
                this.player.y = y - this.player.height/2;
            }
        });
        
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const rect = this.canvas.getBoundingClientRect();
            const x = touch.clientX - rect.left;
            const y = touch.clientY - rect.top;
            
            if (this.player) {
                this.player.x = x - this.player.width/2;
                this.player.y = y - this.player.height/2;
            }
        });
        
        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            isTouching = false;
        });
        
        // Store touch state for shooting
        this.isTouching = false;
        this.touchShootTimer = 0;
        
        // Update touch state in game loop
        this.updateTouchShooting = () => {
            if (isTouching) {
                this.touchShootTimer += 16; // Assuming 60fps
                if (this.touchShootTimer >= 200) { // Shoot every 200ms on touch
                    this.touchShootTimer = 0;
                    return true;
                }
            }
            return false;
        };
    }
    
    toggleShop() {
        this.shopOpen = !this.shopOpen;
        if (this.shopOpen) {
            this.pauseGame();
        } else {
            this.resumeGame();
        }
        this.drawShop();
    }
    
    toggleMultiplayer() {
        if (this.gameState === 'menu') {
            this.multiplayer = !this.multiplayer;
            const multiplayerText = document.getElementById('multiplayerText');
            if (multiplayerText) {
                multiplayerText.textContent = `Multiplayer: ${this.multiplayer ? 'ON' : 'OFF'}`;
                multiplayerText.style.color = this.multiplayer ? '#00ff00' : '#ff0000';
            }
        }
    }
    
    pauseGame() {
        this.gameRunning = false;
    }
    
    resumeGame() {
        this.gameRunning = true;
        this.gameLoop();
    }
    
    buyShopItem(itemIndex) {
        if (itemIndex >= 0 && itemIndex < this.shopItems.length) {
            const item = this.shopItems[itemIndex];
            
            if (this.money >= item.cost) {
                this.money -= item.cost;
                
                switch (item.id) {
                    case 'weapon_upgrade':
                        this.weaponLevel = Math.min(3, this.weaponLevel + 1);
                        break;
                    case 'shield':
                        this.shieldLevel = Math.min(3, this.shieldLevel + 1);
                        this.specialAbilities.shield = true;
                        break;
                    case 'rapid_fire':
                        this.specialAbilities.rapidFire = true;
                        break;
                    case 'homing_missiles':
                        this.specialAbilities.homingMissiles = true;
                        break;
                    case 'multi_shot':
                        this.specialAbilities.multiShot = true;
                        break;
                    case 'score_multiplier':
                        this.scoreMultiplier = 2;
                        break;
                    case 'extra_life':
                        this.lives = Math.min(5, this.lives + 1);
                        break;
                    case 'special_weapon':
                        this.specialWeapons.push('nuke');
                        break;
                    case 'invincibility':
                        this.activePowerUps.invincibility.active = true;
                        this.activePowerUps.invincibility.duration = this.activePowerUps.invincibility.maxDuration;
                        break;
                    case 'speed_boost':
                        this.activePowerUps.speedBoost.active = true;
                        this.activePowerUps.speedBoost.duration = this.activePowerUps.speedBoost.maxDuration;
                        break;
                }
                
                this.updateHUD();
                this.drawShop();
            }
        }
    }
    
    drawShop() {
        if (!this.shopOpen) return;
        
        // Semi-transparent overlay
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Shop background
        this.ctx.fillStyle = '#2a2a2a';
        this.ctx.fillRect(100, 50, 600, 500);
        
        // Shop title
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 24px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('🛒 SHOP - Press P to close', 400, 90);
        
        // Money display
        this.ctx.fillStyle = '#ffff00';
        this.ctx.font = 'bold 20px Arial';
        this.ctx.fillText(`💰 Money: ${this.money}`, 400, 120);
        
        // Shop items
        this.ctx.font = '16px Arial';
        this.ctx.textAlign = 'left';
        
        for (let i = 0; i < this.shopItems.length; i++) {
            const item = this.shopItems[i];
            const y = 160 + i * 50;
            const canAfford = this.money >= item.cost;
            
            // Item background
            this.ctx.fillStyle = canAfford ? '#4a4a4a' : '#3a3a3a';
            this.ctx.fillRect(120, y - 10, 560, 40);
            
            // Item number
            this.ctx.fillStyle = '#ffffff';
            this.ctx.fillText(`${i + 1}.`, 130, y + 5);
            
            // Item emoji and name
            this.ctx.fillStyle = canAfford ? '#ffffff' : '#888888';
            this.ctx.fillText(`${item.emoji} ${item.name}`, 160, y + 5);
            
            // Cost
            this.ctx.fillStyle = canAfford ? '#ffff00' : '#888888';
            this.ctx.fillText(`$${item.cost}`, 400, y + 5);
            
            // Description
            this.ctx.fillStyle = '#cccccc';
            this.ctx.fillText(item.description, 500, y + 5);
        }
        
        // Instructions
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '14px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Press number keys (1-8) to buy items', 400, 580);
    }
    
    startGame() {
        this.gameState = 'playing';
        this.gameRunning = true;
        this.score = 0;
        this.lives = 5;
        this.lives2 = 5; // Reset second player lives
        this.level = 1;
        
        // Clear all game objects
        this.enemies = [];
        this.bullets = [];
        this.particles = [];
        this.enemyBullets = [];
        this.collectibles = [];
        this.powerUps = [];
        this.bosses = [];
        this.asteroids = [];
        
        // Reset shop upgrades
        this.weaponLevel = 1;
        this.weaponLevel2 = 1; // Reset second player weapon level
        this.shieldLevel = 0;
        this.shieldLevel2 = 0; // Reset second player shield level
        this.specialAbilities = {
            rapidFire: false,
            homingMissiles: false,
            shield: false,
            multiShot: false
        };
        this.specialAbilities2 = { // Reset second player abilities
            rapidFire: false,
            homingMissiles: false,
            shield: false,
            multiShot: false
        };
        this.scoreMultiplier = 1;
        this.scoreMultiplier2 = 1; // Reset second player score multiplier
        this.specialWeapons = [];
        this.specialWeapons2 = []; // Reset second player special weapons
        this.activePowerUps = {
            invincibility: { active: false, duration: 0, maxDuration: 10000 },
            speedBoost: { active: false, duration: 0, maxDuration: 8000 },
            spreadShot: { active: false, duration: 0, maxDuration: 12000 },
            rapidFire: { active: false, duration: 0, maxDuration: 15000 }
        };
        this.activePowerUps2 = { // Reset second player power-ups
            invincibility: { active: false, duration: 0, maxDuration: 10000 },
            speedBoost: { active: false, duration: 0, maxDuration: 8000 },
            spreadShot: { active: false, duration: 0, maxDuration: 12000 },
            rapidFire: { active: false, duration: 0, maxDuration: 15000 }
        };
        
        // Create players based on multiplayer mode
        this.player = new Player(400, 500);
        this.player.setGame(this); // Set game reference
        
        if (this.multiplayerMode) {
            this.player2 = new Player(300, 500); // Second player starts on the left
            this.player2.setGame(this); // Set game reference
            this.player2.isPlayer2 = true; // Mark as second player
            this.unlockAchievement('teamPlayer'); // Unlock multiplayer achievement
        } else {
            this.player2 = null;
        }
        
        document.getElementById('startScreen').classList.add('hidden');
        document.getElementById('gameOverScreen').classList.add('hidden');
    }
    
    restartGame() {
        this.startGame();
    }
    
    gameOver() {
        this.gameState = 'gameOver';
        
        // Check if current score is higher than top score
        const isNewRecord = this.score > this.topScore;
        if (isNewRecord) {
            this.topScore = this.score;
            this.saveTopScore();
        }
        
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('finalMoney').textContent = this.money;
        document.getElementById('topScore').textContent = this.topScore;
        
        // Show new record message if applicable
        const newRecordElement = document.getElementById('newRecord');
        if (isNewRecord) {
            if (!newRecordElement) {
                const statsSection = document.querySelector('.stats-section');
                const newRecordDiv = document.createElement('div');
                newRecordDiv.id = 'newRecord';
                newRecordDiv.className = 'new-record';
                newRecordDiv.innerHTML = '🎉 NEW RECORD! 🎉';
                statsSection.insertBefore(newRecordDiv, statsSection.firstChild);
            }
        } else if (newRecordElement) {
            newRecordElement.remove();
        }
        
        // Show multiplayer result if applicable
        if (this.multiplayerMode) {
            const multiplayerResult = document.getElementById('multiplayerResult');
            if (!multiplayerResult) {
                const statsSection = document.querySelector('.stats-section');
                const resultDiv = document.createElement('div');
                resultDiv.id = 'multiplayerResult';
                resultDiv.className = 'multiplayer-result';
                resultDiv.innerHTML = `🎮 Multiplayer Game Complete! 🎮`;
                resultDiv.style.color = '#00ffff';
                resultDiv.style.fontWeight = 'bold';
                resultDiv.style.margin = '10px 0';
                statsSection.appendChild(resultDiv);
            }
        }
        
        document.getElementById('gameOverScreen').classList.remove('hidden');
    }
    
    update(deltaTime) {
        if (this.gameState !== 'playing') return;
        
        // Update statistics
        this.stats.timeSurvived += deltaTime;
        
        // Update starfield
        this.starfield.forEach(star => {
            star.y += star.speed;
            if (star.y > this.canvas.height) {
                star.y = -5;
                star.x = Math.random() * this.canvas.width;
            }
        });
        
        // Update screen shake
        if (this.screenShake > 0) {
            this.screenShake = Math.max(0, this.screenShake - deltaTime * 0.01);
        }
        
        // Update power-ups
        for (let key in this.activePowerUps) {
            if (this.activePowerUps[key].active) {
                this.activePowerUps[key].duration -= deltaTime;
                if (this.activePowerUps[key].duration <= 0) {
                    this.activePowerUps[key].active = false;
                    this.activePowerUps[key].duration = 0;
                }
            }
        }
        
        // Update player
        if (this.player) {
            this.player.update(deltaTime, this.keys);
            
            // Handle shooting (spacebar or touch)
            const shouldShoot = this.keys[' '] || this.keys['Space'] || this.updateTouchShooting();
            
            if (shouldShoot) {
                console.log('Shooting triggered by:', this.keys[' '] ? 'spacebar' : this.keys['Space'] ? 'Space' : 'touch');
                const bullets = this.player.shoot();
                if (bullets) {
                    console.log('Bullets created:', bullets.length);
                    if (Array.isArray(bullets)) {
                        this.bullets.push(...bullets);
                    } else {
                        this.bullets.push(bullets);
                    }
                    this.stats.shotsFired += bullets.length;
                    this.shootSound();
                } else {
                    console.log('No bullets created (cooldown)');
                }
            }
        }
        
        // Update second player in multiplayer mode
        if (this.player2 && this.multiplayerMode) {
            this.player2.update(deltaTime, this.keys2);
            
            // Handle second player shooting (Enter key)
            const shouldShoot2 = this.keys2['Enter'];
            
            if (shouldShoot2) {
                const bullets = this.player2.shoot();
                if (bullets) {
                    if (Array.isArray(bullets)) {
                        this.bullets.push(...bullets);
                    } else {
                        this.bullets.push(bullets);
                    }
                    this.stats.shotsFired += bullets.length;
                    this.shootSound();
                }
            }
        }
        
        // Boss spawning system
        if (!this.currentBoss && this.score >= this.bossSpawnScore && this.score % this.bossSpawnInterval === 0) {
            this.spawnBoss();
        }
        
        // Update boss
        if (this.currentBoss) {
            this.currentBoss.update(deltaTime);
            if (this.currentBoss.canShoot()) {
                const bullets = this.currentBoss.shootAt(this.player);
                if (bullets) {
                    if (Array.isArray(bullets)) {
                        bullets.forEach(bullet => this.enemyBullets.push(bullet));
                    } else {
                        this.enemyBullets.push(bullets);
                    }
                    this.shootSound();
                }
            }
        }
        
        // Dynamic enemy spawn rate
        this.enemySpawnTimer += deltaTime;
        // Decrease interval as score increases (min 300ms)
        this.enemySpawnInterval = Math.max(300, 1200 - Math.floor(this.score / 50) * 100);
        if (this.enemySpawnTimer > this.enemySpawnInterval) {
            this.spawnEnemy();
            this.enemySpawnTimer = 0;
            
            // Spawn additional enemies at higher scores
            if (this.score > 200 && Math.random() < 0.3) {
                this.spawnEnemy(); // Spawn second enemy
            }
            if (this.score > 500 && Math.random() < 0.2) {
                this.spawnEnemy(); // Spawn third enemy
            }
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
                    this.shootSound();
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
        if (Math.random() < 0.01) {
            const r = Math.random();
            if (r < 0.4) {
                this.collectibles.push(new Collectible(Math.random() * (this.canvas.width - 32), -32, 'weapon'));
            } else if (r < 0.8) {
                this.collectibles.push(new Collectible(Math.random() * (this.canvas.width - 32), -32, 'health'));
            } else {
                this.collectibles.push(new Collectible(Math.random() * (this.canvas.width - 32), -32, 'money'));
            }
        }
        
        // Spawn power-ups randomly (rarer than collectibles)
        if (Math.random() < 0.005) {
            const powerUpTypes = ['invincibility', 'speedBoost', 'spreadShot', 'rapidFire', 'bomb'];
            const randomType = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
            this.powerUps.push(new PowerUp(Math.random() * (this.canvas.width - 32), -32, randomType));
        }
        
        // Spawn asteroids randomly
        if (Math.random() < 0.003) {
            const sizes = ['large', 'medium', 'small'];
            const randomSize = sizes[Math.floor(Math.random() * sizes.length)];
            this.asteroids.push(new Asteroid(Math.random() * (this.canvas.width - 40), -40, randomSize));
        }
        
        // Update collectibles
        this.collectibles.forEach(c => c.update(deltaTime));
        // Update power-ups
        this.powerUps.forEach(p => p.update(deltaTime));
        // Update asteroids
        this.asteroids.forEach(a => a.update(deltaTime));
        
        // Remove off-screen objects
        this.collectibles = this.collectibles.filter(c => c.y < this.canvas.height + 32);
        this.powerUps = this.powerUps.filter(p => p.y < this.canvas.height + 32);
        this.asteroids = this.asteroids.filter(a => a.y < this.canvas.height + 40);
        
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
    
    spawnBoss() {
        const x = (this.canvas.width - 120) / 2; // Center the boss
        this.currentBoss = new Boss(x, -100);
        this.addScreenShake(5);
        this.showBossWarning();
    }
    
    showBossWarning() {
        const warning = document.createElement('div');
        warning.className = 'boss-warning';
        warning.innerHTML = '⚠️ BOSS INCOMING! ⚠️';
        document.body.appendChild(warning);
        
        setTimeout(() => {
            warning.remove();
        }, 3000);
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
                    
                    // Add score and stats
                    this.score += 10;
                    this.stats.enemiesKilled++;
                    this.stats.shotsHit++;
                    
                    // Check achievements
                    if (this.stats.enemiesKilled === 1) {
                        this.unlockAchievement('firstKill');
                    }
                    
                    // Create explosion particles
                    this.createExplosion(enemy.x + enemy.width/2, enemy.y + enemy.height/2);
                }
            });
        });
        
        // Player bullets vs boss
        if (this.currentBoss) {
            this.bullets.forEach((bullet, bulletIndex) => {
                if (this.checkCollision(bullet, this.currentBoss)) {
                    this.bullets.splice(bulletIndex, 1);
                    this.stats.shotsHit++;
                    
                    // Boss takes damage
                    if (this.currentBoss.takeDamage(1)) {
                        // Boss defeated!
                        this.stats.bossesKilled++;
                        this.unlockAchievement('bossKiller');
                        this.score += 500; // Big score bonus
                        this.money += 200; // Big money bonus
                        this.createBossExplosion(this.currentBoss.x + this.currentBoss.width/2, this.currentBoss.y + this.currentBoss.height/2);
                        this.currentBoss = null;
                        this.addScreenShake(10);
                    } else {
                        // Boss hit but not defeated
                        this.createExplosion(bullet.x, bullet.y);
                    }
                }
            });
        }
        
        // Player bullets vs asteroids
        this.bullets.forEach((bullet, bulletIndex) => {
            this.asteroids.forEach((asteroid, asteroidIndex) => {
                if (this.checkCollision(bullet, asteroid)) {
                    this.bullets.splice(bulletIndex, 1);
                    this.stats.shotsHit++;
                    
                    if (asteroid.takeDamage()) {
                        this.asteroids.splice(asteroidIndex, 1);
                        this.createExplosion(asteroid.x + asteroid.width/2, asteroid.y + asteroid.height/2);
                    }
                }
            });
        });
        
        // Enemies vs player
        if (this.player && !this.activePowerUps.invincibility.active) {
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
        
        // Enemies vs player 2 (multiplayer)
        if (this.player2 && this.multiplayerMode && !this.activePowerUps2.invincibility.active) {
            this.enemies.forEach(enemy => {
                if (this.checkCollision(this.player2, enemy)) {
                    this.lives2--;
                    this.createExplosion(this.player2.x + this.player2.width/2, this.player2.y + this.player2.height/2);
                    
                    if (this.lives2 <= 0) {
                        // Player 2 is out, but game continues if player 1 is alive
                        this.player2 = null;
                    } else {
                        // Reset player 2 position
                        this.player2.x = 300;
                        this.player2.y = 500;
                    }
                }
            });
        }
        
        // Enemy bullets vs player
        if (this.player && !this.activePowerUps.invincibility.active) {
            this.enemyBullets.forEach((bullet, bulletIndex) => {
                if (this.checkCollision(this.player, bullet)) {
                    this.enemyBullets.splice(bulletIndex, 1);
                    
                    // Check if shield is active
                    if (this.specialAbilities.shield) {
                        // Shield blocks the bullet, no damage
                        this.createExplosion(bullet.x, bullet.y);
                    } else {
                        this.lives--;
                        this.createExplosion(this.player.x + this.player.width/2, this.player.y + this.player.height/2);
                        if (this.lives <= 0) {
                            this.gameOver();
                        } else {
                            this.player.x = 400;
                            this.player.y = 500;
                        }
                    }
                }
            });
        }
        
        // Enemy bullets vs player 2 (multiplayer)
        if (this.player2 && this.multiplayerMode && !this.activePowerUps2.invincibility.active) {
            this.enemyBullets.forEach((bullet, bulletIndex) => {
                if (this.checkCollision(this.player2, bullet)) {
                    this.enemyBullets.splice(bulletIndex, 1);
                    
                    // Check if shield is active
                    if (this.specialAbilities2.shield) {
                        // Shield blocks the bullet, no damage
                        this.createExplosion(bullet.x, bullet.y);
                    } else {
                        this.lives2--;
                        this.createExplosion(this.player2.x + this.player2.width/2, this.player2.y + this.player2.height/2);
                        if (this.lives2 <= 0) {
                            // Player 2 is out, but game continues if player 1 is alive
                            this.player2 = null;
                        } else {
                            this.player2.x = 300;
                            this.player2.y = 500;
                        }
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
                    } else if (c.type === 'money') {
                        this.money += 25;
                        this.score += 25 * this.scoreMultiplier;
                    }
                    this.collectibles.splice(i, 1);
                }
            });
            
            // Player vs power-ups
            this.powerUps.forEach((powerUp, i) => {
                if (this.checkCollision(this.player, powerUp)) {
                    this.activatePowerUp(powerUp.type);
                    this.powerUps.splice(i, 1);
                    this.stats.powerUpsCollected++;
                }
            });
            
            // Player vs asteroids (if not invincible)
            if (!this.activePowerUps.invincibility.active) {
                this.asteroids.forEach((asteroid, i) => {
                    if (this.checkCollision(this.player, asteroid)) {
                        this.lives--;
                        this.createExplosion(this.player.x + this.player.width/2, this.player.y + this.player.height/2);
                        this.asteroids.splice(i, 1);
                        
                        if (this.lives <= 0) {
                            this.gameOver();
                        } else {
                            this.player.x = 400;
                            this.player.y = 500;
                        }
                    }
                });
            }
        }
        
        // Player 2 vs collectibles (multiplayer)
        if (this.player2 && this.multiplayerMode) {
            this.collectibles.forEach((c, i) => {
                if (this.checkCollision(this.player2, c)) {
                    if (c.type === 'weapon') {
                        this.player2.upgradeWeapon();
                    } else if (c.type === 'health') {
                        this.lives2 = Math.min(5, this.lives2 + 1);
                    } else if (c.type === 'money') {
                        this.money += 25;
                        this.score += 25 * this.scoreMultiplier2;
                    }
                    this.collectibles.splice(i, 1);
                }
            });
            
            // Player 2 vs power-ups
            this.powerUps.forEach((powerUp, i) => {
                if (this.checkCollision(this.player2, powerUp)) {
                    this.activatePowerUp2(powerUp.type);
                    this.powerUps.splice(i, 1);
                    this.stats.powerUpsCollected++;
                }
            });
            
            // Player 2 vs asteroids (if not invincible)
            if (!this.activePowerUps2.invincibility.active) {
                this.asteroids.forEach((asteroid, i) => {
                    if (this.checkCollision(this.player2, asteroid)) {
                        this.lives2--;
                        this.createExplosion(this.player2.x + this.player2.width/2, this.player2.y + this.player2.height/2);
                        this.asteroids.splice(i, 1);
                        
                        if (this.lives2 <= 0) {
                            this.player2 = null;
                        } else {
                            this.player2.x = 300;
                            this.player2.y = 500;
                        }
                    }
                });
            }
        }
    }
    
    checkCollision(obj1, obj2) {
        return obj1.x < obj2.x + obj2.width &&
               obj1.x + obj1.width > obj2.x &&
               obj1.y < obj2.y + obj2.height &&
               obj1.y + obj1.height > obj2.y;
    }
    
    activatePowerUp(type) {
        switch (type) {
            case 'invincibility':
                this.activePowerUps.invincibility.active = true;
                this.activePowerUps.invincibility.duration = this.activePowerUps.invincibility.maxDuration;
                break;
            case 'speedBoost':
                this.activePowerUps.speedBoost.active = true;
                this.activePowerUps.speedBoost.duration = this.activePowerUps.speedBoost.maxDuration;
                break;
            case 'spreadShot':
                this.activePowerUps.spreadShot.active = true;
                this.activePowerUps.spreadShot.duration = this.activePowerUps.spreadShot.maxDuration;
                break;
            case 'rapidFire':
                this.activePowerUps.rapidFire.active = true;
                this.activePowerUps.rapidFire.duration = this.activePowerUps.rapidFire.maxDuration;
                break;
            case 'bomb':
                // Clear all enemies on screen
                this.enemies.forEach(enemy => {
                    this.createExplosion(enemy.x + enemy.width/2, enemy.y + enemy.height/2);
                });
                this.enemies = [];
                this.addScreenShake(8);
                break;
        }
    }
    
    activatePowerUp2(type) {
        switch (type) {
            case 'invincibility':
                this.activePowerUps2.invincibility.active = true;
                this.activePowerUps2.invincibility.duration = this.activePowerUps2.invincibility.maxDuration;
                break;
            case 'speedBoost':
                this.activePowerUps2.speedBoost.active = true;
                this.activePowerUps2.speedBoost.duration = this.activePowerUps2.speedBoost.maxDuration;
                break;
            case 'spreadShot':
                this.activePowerUps2.spreadShot.active = true;
                this.activePowerUps2.spreadShot.duration = this.activePowerUps2.spreadShot.maxDuration;
                break;
            case 'rapidFire':
                this.activePowerUps2.rapidFire.active = true;
                this.activePowerUps2.rapidFire.duration = this.activePowerUps2.rapidFire.maxDuration;
                break;
            case 'bomb':
                // Clear all enemies on screen
                this.enemies.forEach(enemy => {
                    this.createExplosion(enemy.x + enemy.width/2, enemy.y + enemy.height/2);
                });
                this.enemies = [];
                this.addScreenShake(8);
                break;
        }
    }
    
    createExplosion(x, y) {
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 * i) / 8;
            const speed = 100 + Math.random() * 100; // 100-200 pixels per second
            const particle = new Particle(
                x, y,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                '#ff4444'
            );
            this.particles.push(particle);
        }
        this.addScreenShake(2);
    }
    
    createBossExplosion(x, y) {
        // Epic boss explosion with many particles
        for (let i = 0; i < 20; i++) {
            const angle = (Math.PI * 2 * i) / 20;
            const speed = 150 + Math.random() * 200;
            const particle = new Particle(
                x, y,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                '#ff8800'
            );
            this.particles.push(particle);
        }
        this.addScreenShake(15);
    }
    
    updateHUD() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('lives').textContent = this.lives;
        document.getElementById('level').textContent = this.level;
        document.getElementById('topScoreDisplay').textContent = this.topScore;
        
        // Add money display to HUD
        const moneyElement = document.getElementById('money');
        if (moneyElement) {
            moneyElement.textContent = this.money;
        } else {
            // Create money display if it doesn't exist
            const hud = document.querySelector('.hud');
            if (hud) {
                const moneyDiv = document.createElement('div');
                moneyDiv.id = 'money';
                moneyDiv.innerHTML = `💰 <span id="moneyAmount">${this.money}</span>`;
                moneyDiv.style.color = '#ffff00';
                moneyDiv.style.fontWeight = 'bold';
                hud.appendChild(moneyDiv);
            }
        }
        
        // Update multiplayer HUD
        if (this.multiplayerMode) {
            this.updateMultiplayerHUD();
        }
        
        // Update power-up status display
        this.updatePowerUpDisplay();
        
        // Check for achievements
        this.checkAchievements();
    }
    
    updateMultiplayerHUD() {
        // Update or create player 2 lives display
        let lives2Element = document.getElementById('lives2');
        if (!lives2Element) {
            const hud = document.querySelector('.hud');
            if (hud) {
                lives2Element = document.createElement('div');
                lives2Element.id = 'lives2';
                lives2Element.innerHTML = `P2 Lives: <span id="lives2Amount">${this.lives2}</span>`;
                lives2Element.style.color = '#00ffff';
                lives2Element.style.fontWeight = 'bold';
                hud.appendChild(lives2Element);
            }
        } else {
            lives2Element.innerHTML = `P2 Lives: <span id="lives2Amount">${this.lives2}</span>`;
        }
        
        // Update player labels
        let player1Label = document.getElementById('player1Label');
        if (!player1Label) {
            const hud = document.querySelector('.hud');
            if (hud) {
                player1Label = document.createElement('div');
                player1Label.id = 'player1Label';
                player1Label.innerHTML = `P1 Lives: <span id="lives1Amount">${this.lives}</span>`;
                player1Label.style.color = '#ff00ff';
                player1Label.style.fontWeight = 'bold';
                hud.insertBefore(player1Label, hud.firstChild);
            }
        } else {
            player1Label.innerHTML = `P1 Lives: <span id="lives1Amount">${this.lives}</span>`;
        }
    }
    
    updatePowerUpDisplay() {
        let powerUpDisplay = document.getElementById('powerUpDisplay');
        if (!powerUpDisplay) {
            const hud = document.querySelector('.hud');
            if (hud) {
                powerUpDisplay = document.createElement('div');
                powerUpDisplay.id = 'powerUpDisplay';
                powerUpDisplay.className = 'power-up-status';
                hud.appendChild(powerUpDisplay);
            }
        }
        
        if (powerUpDisplay) {
            powerUpDisplay.innerHTML = '';
            
            const powerUps = [
                { key: 'invincibility', emoji: '✨', name: 'Invincibility' },
                { key: 'speedBoost', emoji: '🏃', name: 'Speed Boost' },
                { key: 'spreadShot', emoji: '🔫', name: 'Spread Shot' },
                { key: 'rapidFire', emoji: '⚡', name: 'Rapid Fire' }
            ];
            
            powerUps.forEach(powerUp => {
                const isActive = this.activePowerUps[powerUp.key].active;
                const duration = this.activePowerUps[powerUp.key].duration;
                const maxDuration = this.activePowerUps[powerUp.key].maxDuration;
                const percent = isActive ? (duration / maxDuration) * 100 : 0;
                
                const icon = document.createElement('div');
                icon.className = `power-up-icon ${isActive ? 'active' : ''}`;
                icon.innerHTML = powerUp.emoji;
                icon.title = `${powerUp.name}${isActive ? ` (${Math.ceil(percent)}%)` : ''}`;
                
                if (isActive) {
                    icon.style.background = `linear-gradient(to top, #ffff00 ${percent}%, transparent ${percent}%)`;
                }
                
                powerUpDisplay.appendChild(icon);
            });
        }
    }
    
    unlockAchievement(achievementId) {
        if (this.achievements[achievementId] && !this.achievements[achievementId].unlocked) {
            this.achievements[achievementId].unlocked = true;
            this.saveAchievements();
            
            // Show achievement notification
            this.showAchievementNotification(this.achievements[achievementId].name);
        }
    }
    
    showAchievementNotification(achievementName) {
        const notification = document.createElement('div');
        notification.className = 'achievement-notification';
        notification.textContent = `🏆 Achievement Unlocked: ${achievementName}!`;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }
    
    checkAchievements() {
        // Score achievements
        if (this.score >= 100 && !this.achievements.score100.unlocked) {
            this.unlockAchievement('score100');
        }
        if (this.score >= 500 && !this.achievements.score500.unlocked) {
            this.unlockAchievement('score500');
        }
        if (this.score >= 1000 && !this.achievements.score1000.unlocked) {
            this.unlockAchievement('score1000');
        }
        
        // Time survival achievement
        if (this.stats.timeSurvived >= 120000 && !this.achievements.survivor.unlocked) { // 2 minutes
            this.unlockAchievement('survivor');
        }
        
        // Accuracy achievement
        if (this.stats.shotsFired > 0) {
            const accuracy = this.stats.shotsHit / this.stats.shotsFired;
            if (accuracy >= 0.8 && this.stats.shotsHit >= 50 && !this.achievements.sharpshooter.unlocked) {
                this.unlockAchievement('sharpshooter');
            }
        }
    }
    
    draw() {
        // Apply screen shake
        this.ctx.save();
        if (this.screenShake > 0) {
            const shakeX = (Math.random() - 0.5) * this.screenShake;
            const shakeY = (Math.random() - 0.5) * this.screenShake;
            this.ctx.translate(shakeX, shakeY);
        }
        
        // Clear canvas
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw starfield background
        this.drawStarfield();
        
        // Draw game objects
        if (this.player) {
            this.player.draw(this.ctx);
        }
        
        // Draw second player in multiplayer mode
        if (this.player2 && this.multiplayerMode) {
            this.player2.draw(this.ctx);
        }
        
        this.enemies.forEach(enemy => enemy.draw(this.ctx));
        this.bullets.forEach(bullet => bullet.draw(this.ctx));
        this.enemyBullets.forEach(bullet => bullet.draw(this.ctx));
        this.particles.forEach(particle => particle.draw(this.ctx));
        this.collectibles.forEach(c => c.draw(this.ctx));
        this.powerUps.forEach(p => p.draw(this.ctx));
        this.asteroids.forEach(a => a.draw(this.ctx));
        
        // Draw boss
        if (this.currentBoss) {
            this.currentBoss.draw(this.ctx);
        }
        
        // Draw power-up effects on player
        if (this.player && this.activePowerUps.invincibility.active) {
            this.ctx.strokeStyle = '#ffff00';
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            this.ctx.arc(this.player.x + this.player.width/2, this.player.y + this.player.height/2, 
                this.player.width/2 + 10, 0, Math.PI * 2);
            this.ctx.stroke();
        }
        
        // Draw power-up effects on player 2
        if (this.player2 && this.multiplayerMode && this.activePowerUps2.invincibility.active) {
            this.ctx.strokeStyle = '#00ffff';
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            this.ctx.arc(this.player2.x + this.player2.width/2, this.player2.y + this.player2.height/2, 
                this.player2.width/2 + 10, 0, Math.PI * 2);
            this.ctx.stroke();
        }
        
        // Draw shop if open
        if (this.shopOpen) {
            this.drawShop();
        }
        
        this.ctx.restore();
    }
    
    drawStarfield() {
        this.ctx.fillStyle = '#fff';
        this.starfield.forEach(star => {
            this.ctx.globalAlpha = star.size / 2;
            this.ctx.fillRect(star.x, star.y, star.size, star.size);
        });
        this.ctx.globalAlpha = 1;
    }
    
    gameLoop(currentTime = 0) {
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        if (this.gameState === 'playing' && this.gameRunning) {
            this.update(deltaTime);
        }
        
        this.draw();
        
        requestAnimationFrame((time) => this.gameLoop(time));
    }

    createShootSound() {
        // Returns a function to play a beep sound
        return () => {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const o = ctx.createOscillator();
            const g = ctx.createGain();
            o.type = 'square';
            o.frequency.value = 440;
            g.gain.value = 0.1;
            o.connect(g);
            g.connect(ctx.destination);
            o.start();
            o.stop(ctx.currentTime + 0.08);
            o.onended = () => ctx.close();
        };
    }
    
    shootSound() {
        // Simple beep sound for shooting
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const o = ctx.createOscillator();
            const g = ctx.createGain();
            o.type = 'square';
            o.frequency.value = 440;
            g.gain.value = 0.1;
            o.connect(g);
            g.connect(ctx.destination);
            o.start();
            o.stop(ctx.currentTime + 0.08);
            o.onended = () => ctx.close();
        } catch (e) {
            // Silently fail if audio is not supported
            console.log('Audio not supported');
        }
    }

    activateSpecialWeapon() {
        if (this.specialWeapons.length > 0) {
            const weapon = this.specialWeapons.pop();
            if (weapon === 'nuke') {
                // Nuke destroys all enemies on screen
                this.enemies.forEach(enemy => {
                    this.createExplosion(enemy.x + enemy.width/2, enemy.y + enemy.height/2);
                    this.score += 10;
                });
                this.enemies = [];
                
                // Create a big explosion effect
                for (let i = 0; i < 20; i++) {
                    const angle = (Math.PI * 2 * i) / 20;
                    const speed = 150 + Math.random() * 150; // 150-300 pixels per second
                    const particle = new Particle(
                        this.canvas.width/2, this.canvas.height/2,
                        Math.cos(angle) * speed,
                        Math.sin(angle) * speed,
                        '#ff0000'
                    );
                    this.particles.push(particle);
                }
            }
        }
    }

    activateSpecialWeapon2() {
        if (this.specialWeapons2.length > 0) {
            const weapon = this.specialWeapons2.pop();
            if (weapon === 'nuke') {
                // Nuke destroys all enemies on screen
                this.enemies.forEach(enemy => {
                    this.createExplosion(enemy.x + enemy.width/2, enemy.y + enemy.height/2);
                    this.score += 10;
                });
                this.enemies = [];
                
                // Create a big explosion effect
                for (let i = 0; i < 20; i++) {
                    const angle = (Math.PI * 2 * i) / 20;
                    const speed = 150 + Math.random() * 150; // 150-300 pixels per second
                    const particle = new Particle(
                        this.canvas.width/2, this.canvas.height/2,
                        Math.cos(angle) * speed,
                        Math.sin(angle) * speed,
                        '#ff0000'
                    );
                    this.particles.push(particle);
                }
            }
        }
    }
}

// Player class
class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 40;
        this.height = 30;
        this.speed = 300; // pixels per second - increased for normal movement
        this.lastShot = Date.now();
        this.shotCooldown = 200; // milliseconds
        this.weaponLevel = 1;
        this.game = null; // Reference to game for upgrades
    }
    
    setGame(game) {
        this.game = game;
    }
    
    update(deltaTime, keys) {
        // Movement - scale by deltaTime for consistent speed
        let moveSpeed = this.speed * (deltaTime / 1000); // Convert to pixels per second
        
        // Speed boost power-up
        if (this.game && this.game.activePowerUps.speedBoost.active) {
            moveSpeed *= 1.5;
        }
        if (this.isPlayer2 && this.game && this.game.activePowerUps2.speedBoost.active) {
            moveSpeed *= 1.5;
        }
        
        // Different controls for player 2
        if (this.isPlayer2) {
            // Player 2 uses WASD
            if (keys['a']) this.x -= moveSpeed;
            if (keys['d']) this.x += moveSpeed;
            if (keys['w']) this.y -= moveSpeed;
            if (keys['s']) this.y += moveSpeed;
        } else {
            // Player 1 uses arrow keys
            if (keys['ArrowLeft']) this.x -= moveSpeed;
            if (keys['ArrowRight']) this.x += moveSpeed;
            if (keys['ArrowUp']) this.y -= moveSpeed;
            if (keys['ArrowDown']) this.y += moveSpeed;
        }
        
        // Keep player on screen
        this.x = Math.max(0, Math.min(760, this.x));
        this.y = Math.max(0, Math.min(570, this.y));
    }
    
    shoot() {
        const now = Date.now();
        let cooldown = this.game && this.game.specialAbilities.rapidFire ? 100 : 200;
        
        // Rapid fire power-up
        if (this.game && this.game.activePowerUps.rapidFire.active) {
            cooldown = 50;
        }
        if (this.isPlayer2 && this.game && this.game.activePowerUps2.rapidFire.active) {
            cooldown = 50;
        }
        
        if (now - this.lastShot >= cooldown) {
            this.lastShot = now;
            const bullets = [];
            
            // Get the appropriate power-ups and abilities for this player
            const powerUps = this.isPlayer2 ? this.game.activePowerUps2 : this.game.activePowerUps;
            const abilities = this.isPlayer2 ? this.game.specialAbilities2 : this.game.specialAbilities;
            const weaponLevel = this.isPlayer2 ? this.game.weaponLevel2 : this.game.weaponLevel;
            
            // Spread shot power-up
            if (powerUps.spreadShot.active) {
                // Shoot in a spread pattern
                for (let i = -2; i <= 2; i++) {
                    const angle = (Math.PI / 2) + (i * 0.3);
                    bullets.push(new Bullet(
                        this.x + this.width/2 - 2,
                        this.y,
                        Math.cos(angle) * 300,
                        Math.sin(angle) * 300
                    ));
                }
            } else {
                // Normal shooting
                // Always shoot at least one bullet
                bullets.push(new Bullet(this.x + this.width/2 - 2, this.y, 0, -300)); // 300 pixels per second
                
                // Multi shot ability
                if (abilities.multiShot) {
                    bullets.push(new Bullet(this.x + 8, this.y, 0, -300));
                    bullets.push(new Bullet(this.x + this.width - 12, this.y, 0, -300));
                }
                
                // Weapon level 2+ (double shot) - only if not multi shot
                if (weaponLevel >= 2 && !abilities.multiShot) {
                    bullets.push(new Bullet(this.x + 8, this.y, 0, -300));
                    bullets.push(new Bullet(this.x + this.width - 12, this.y, 0, -300));
                }
                
                // Weapon level 3+ (triple shot) - additional center bullet
                if (weaponLevel >= 3) {
                    bullets.push(new Bullet(this.x + this.width/2 - 2, this.y, 0, -350)); // Center, faster
                }
                
                // Homing missiles
                if (abilities.homingMissiles) {
                    // Find nearest enemy
                    if (this.game.enemies.length > 0) {
                        const nearest = this.game.enemies.reduce((nearest, enemy) => {
                            const dist = Math.sqrt((enemy.x - this.x)**2 + (enemy.y - this.y)**2);
                            return dist < nearest.dist ? {enemy, dist} : nearest;
                        }, {enemy: null, dist: Infinity});
                        
                        if (nearest.enemy) {
                            const dx = nearest.enemy.x - this.x;
                            const dy = nearest.enemy.y - this.y;
                            const angle = Math.atan2(dy, dx);
                            bullets.push(new Bullet(this.x + this.width/2, this.y, 
                                Math.cos(angle) * 250, Math.sin(angle) * 250));
                        }
                    }
                }
            }
            
            return bullets;
        }
        return null;
    }
    
    upgradeWeapon() {
        this.weaponLevel = Math.min(3, this.weaponLevel + 1);
    }
    
    draw(ctx) {
        // Different colors for each player
        if (this.isPlayer2) {
            // Player 2 - Cyan color
            ctx.fillStyle = '#00ffff';
        } else {
            // Player 1 - Blue color
            ctx.fillStyle = '#0088ff';
        }
        
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Draw ship details
        if (this.isPlayer2) {
            ctx.fillStyle = '#0088aa';
        } else {
            ctx.fillStyle = '#004488';
        }
        ctx.fillRect(this.x + 5, this.y + 5, this.width - 10, this.height - 10);
        
        // Draw cockpit
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(this.x + this.width/2 - 5, this.y + 8, 10, 8);
        
        // Draw player label
        ctx.fillStyle = this.isPlayer2 ? '#00ffff' : '#0088ff';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(this.isPlayer2 ? 'P2' : 'P1', this.x + this.width/2, this.y - 5);
    }
}

// Enemy class
class Enemy {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 30;
        this.height = 25;
        this.speed = 120 + Math.random() * 60; // pixels per second - increased for normal movement
        this.shootCooldown = 2000 + Math.random() * 1000; // 2-3 seconds between shots
        this.lastShot = Date.now();
    }
    
    update(deltaTime) {
        this.y += this.speed * (deltaTime / 1000); // Convert to pixels per second
    }
    
    canShoot() {
        return Date.now() - this.lastShot > this.shootCooldown;
    }
    
    shootAt(player) {
        if (!player) return null;
        this.lastShot = Date.now();
        console.log('Enemy shooting straight down');
        // Shoot straight down
        return new Bullet(this.x + this.width/2 - 2, this.y + this.height, 0, 250, true); // 250 pixels per second - increased from 200
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
        this.speed = 100 + Math.random() * 40; // pixels per second - increased for normal movement
        this.shootCooldown = 2500 + Math.random() * 1500; // 2.5-4 seconds between shots
        this.lastShot = Date.now();
        this.shootDirection = Math.random() < 0.5 ? 'left' : 'right'; // Random initial direction
    }
    
    update(deltaTime) {
        this.y += this.speed * (deltaTime / 1000); // Convert to pixels per second
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
        bullets.push(new Bullet(this.x, this.y + this.height/2, -250, 0, true)); // Left bullet, 250 pixels per second
        bullets.push(new Bullet(this.x + this.width, this.y + this.height/2, 250, 0, true)); // Right bullet, 250 pixels per second
        
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

// Boss class - Epic boss battles!
class Boss {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 120;
        this.height = 80;
        this.health = 50;
        this.maxHealth = 50;
        this.speed = 60;
        this.shootCooldown = 1000;
        this.lastShot = Date.now();
        this.phase = 1;
        this.phaseTimer = 0;
        this.movementPattern = 'sine';
        this.originalX = x;
        this.angle = 0;
        
        // Different attack patterns
        this.attackPatterns = [
            'spread',    // Spread shot
            'circle',    // Circle of bullets
            'laser',     // Laser beam
            'missile'    // Homing missiles
        ];
        this.currentPattern = 0;
    }
    
    update(deltaTime) {
        this.phaseTimer += deltaTime;
        
        // Movement patterns
        switch (this.movementPattern) {
            case 'sine':
                this.angle += 0.02;
                this.x = this.originalX + Math.sin(this.angle) * 200;
                break;
            case 'zigzag':
                this.x += Math.sin(this.phaseTimer * 0.005) * 2;
                break;
            case 'charge':
                this.y += this.speed * (deltaTime / 1000);
                if (this.y > 100) this.y = 100;
                break;
        }
        
        // Phase transitions
        if (this.health < this.maxHealth * 0.7 && this.phase === 1) {
            this.phase = 2;
            this.shootCooldown = 800;
            this.movementPattern = 'zigzag';
        }
        if (this.health < this.maxHealth * 0.3 && this.phase === 2) {
            this.phase = 3;
            this.shootCooldown = 600;
            this.movementPattern = 'charge';
        }
        
        // Keep boss on screen
        this.x = Math.max(0, Math.min(this.canvas.width - this.width, this.x));
    }
    
    canShoot() {
        return Date.now() - this.lastShot > this.shootCooldown;
    }
    
    shootAt(player) {
        if (!player) return null;
        this.lastShot = Date.now();
        
        const bullets = [];
        const pattern = this.attackPatterns[this.currentPattern];
        
        switch (pattern) {
            case 'spread':
                // Spread shot - multiple bullets in a fan
                for (let i = -3; i <= 3; i++) {
                    const angle = (Math.PI / 2) + (i * 0.3);
                    bullets.push(new Bullet(
                        this.x + this.width/2,
                        this.y + this.height,
                        Math.cos(angle) * 200,
                        Math.sin(angle) * 200,
                        true
                    ));
                }
                break;
                
            case 'circle':
                // Circle of bullets
                for (let i = 0; i < 8; i++) {
                    const angle = (Math.PI * 2 * i) / 8;
                    bullets.push(new Bullet(
                        this.x + this.width/2,
                        this.y + this.height/2,
                        Math.cos(angle) * 150,
                        Math.sin(angle) * 150,
                        true
                    ));
                }
                break;
                
            case 'laser':
                // Laser beam - straight down
                bullets.push(new Bullet(
                    this.x + this.width/2 - 1,
                    this.y + this.height,
                    0, 300, true
                ));
                bullets.push(new Bullet(
                    this.x + this.width/2 + 1,
                    this.y + this.height,
                    0, 300, true
                ));
                break;
                
            case 'missile':
                // Homing missiles
                if (player) {
                    const dx = player.x - this.x;
                    const dy = player.y - this.y;
                    const angle = Math.atan2(dy, dx);
                    bullets.push(new Bullet(
                        this.x + this.width/2,
                        this.y + this.height/2,
                        Math.cos(angle) * 180,
                        Math.sin(angle) * 180,
                        true
                    ));
                }
                break;
        }
        
        // Cycle through patterns
        this.currentPattern = (this.currentPattern + 1) % this.attackPatterns.length;
        
        return bullets;
    }
    
    takeDamage(damage) {
        this.health -= damage;
        return this.health <= 0;
    }
    
    draw(ctx) {
        // Draw boss ship (large and menacing)
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Draw boss details
        ctx.fillStyle = '#880000';
        ctx.fillRect(this.x + 10, this.y + 10, this.width - 20, this.height - 20);
        
        // Draw boss cockpit
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(this.x + this.width/2 - 10, this.y + 15, 20, 15);
        
        // Draw health bar
        const barWidth = this.width;
        const barHeight = 8;
        const healthPercent = this.health / this.maxHealth;
        
        ctx.fillStyle = '#333333';
        ctx.fillRect(this.x, this.y - 15, barWidth, barHeight);
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(this.x, this.y - 15, barWidth * healthPercent, barHeight);
        
        // Draw boss label
        ctx.fillStyle = '#ffffff';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('BOSS', this.x + this.width/2, this.y - 20);
    }
}

// PowerUp class for temporary power-ups
class PowerUp {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.width = 32;
        this.height = 32;
        this.speed = 50;
        this.animation = 0;
        
        this.types = {
            invincibility: { emoji: '✨', color: '#ffff00', duration: 10000 },
            speedBoost: { emoji: '🏃', color: '#00ff00', duration: 8000 },
            spreadShot: { emoji: '🔫', color: '#ff00ff', duration: 12000 },
            rapidFire: { emoji: '⚡', color: '#00ffff', duration: 15000 },
            bomb: { emoji: '💣', color: '#ff8800', duration: 0 }
        };
    }
    
    update(deltaTime) {
        this.y += this.speed * (deltaTime / 1000);
        this.animation += deltaTime * 0.01;
    }
    
    draw(ctx) {
        const type = this.types[this.type];
        if (!type) return;
        
        // Animated glow effect
        const glow = Math.sin(this.animation) * 0.3 + 0.7;
        ctx.globalAlpha = glow;
        
        // Draw power-up
        ctx.font = '28px serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(type.emoji, this.x + this.width/2, this.y + this.height/2);
        
        ctx.globalAlpha = 1;
    }
}

// Asteroid class for environmental obstacles
class Asteroid {
    constructor(x, y, size = 'large') {
        this.x = x;
        this.y = y;
        this.size = size;
        this.sizes = {
            large: { width: 40, height: 40, speed: 30, health: 3 },
            medium: { width: 25, height: 25, speed: 40, health: 2 },
            small: { width: 15, height: 15, speed: 50, health: 1 }
        };
        const props = this.sizes[size];
        this.width = props.width;
        this.height = props.height;
        this.speed = props.speed;
        this.health = props.health;
        this.rotation = 0;
        this.rotationSpeed = (Math.random() - 0.5) * 0.1;
    }
    
    update(deltaTime) {
        this.y += this.speed * (deltaTime / 1000);
        this.rotation += this.rotationSpeed;
    }
    
    takeDamage() {
        this.health--;
        return this.health <= 0;
    }
    
    draw(ctx) {
        ctx.save();
        ctx.translate(this.x + this.width/2, this.y + this.height/2);
        ctx.rotate(this.rotation);
        
        // Draw asteroid
        ctx.fillStyle = '#888888';
        ctx.fillRect(-this.width/2, -this.height/2, this.width, this.height);
        
        // Draw asteroid details
        ctx.fillStyle = '#666666';
        ctx.fillRect(-this.width/2 + 2, -this.height/2 + 2, this.width - 4, this.height - 4);
        
        ctx.restore();
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
        this.x += this.vx * (deltaTime / 1000); // Convert to pixels per second
        this.y += this.vy * (deltaTime / 1000); // Convert to pixels per second
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
        this.x += this.vx * (deltaTime / 1000); // Convert to pixels per second
        this.y += this.vy * (deltaTime / 1000); // Convert to pixels per second
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
        this.emoji = type === 'weapon' ? '🚀' : type === 'health' ? '❤️' : '💰';
        this.speed = 80; // pixels per second - increased for normal movement
    }
    update(deltaTime) {
        this.y += this.speed * (deltaTime / 1000); // Convert to pixels per second
    }
    draw(ctx) {
        ctx.font = '28px serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.emoji, this.x + this.width/2, this.y + this.height/2);
    }
}

// Initialize game when page loads
let game;
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded event fired');
    console.log('Game class exists:', typeof Game !== 'undefined');
    
    try {
        game = new Game();
        console.log('Game object created successfully');
        
        // Initialize top score display
        game.initializeTopScoreDisplay();
        console.log('Top score display initialized');
        
        // Start the game loop
        game.gameLoop();
        console.log('Game loop started');
    } catch (error) {
        console.error('Error initializing game:', error);
    }
}); 