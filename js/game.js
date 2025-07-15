// Simple Space Shooter Game
class SpaceShooter {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gameRunning = false;
        this.score = 0;
        this.topScore = localStorage.getItem('topScore') || 0;
        this.level = 1;
        
        // Initialize touch controls first
        this.setupTouchControls();
        
        // Set up responsive canvas
        this.setupResponsiveCanvas();
        
        // Load sprites
        this.sprites = {};
        this.loadSprites();
        
        // Player
        this.player = {
            x: 50,
            y: 300,
            width: 40,
            height: 30,
            speed: 5,
            health: 100,
            maxHealth: 100,
            weapon: 'basic',
            fireRate: 200,
            lastShot: 0,
            rapidFire: false,
            rapidFireTimer: 0
        };
        
        // Ensure player is visible on screen
        if (this.isMobileDevice()) {
            this.player.x = 80;
            this.player.y = this.canvas.height / 2;
        }
        
        // Game objects
        this.enemies = [];
        this.bullets = [];
        this.collectibles = [];
        this.particles = [];
        this.groundMissiles = [];
        this.soldiers = [];
        
        // Input
        this.keys = {};
        this.setupInput();
        
        // Game state
        this.enemySpawnTimer = 0;
        this.collectibleSpawnTimer = 0;
        this.levelTimer = 0;
        this.soldierShootTimer = 0;
        
        // Audio context for sounds
        this.audioContext = null;
        this.initAudio();
        
        // Initialize ground elements
        this.initGround();
        
        // In constructor, add a money property
        this.money = 0;
        
        this.init();
    }
    
    setupResponsiveCanvas() {
        // Set canvas size based on device
        if (this.isMobileDevice()) {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        } else {
            this.canvas.width = 800;
            this.canvas.height = 600;
        }
        
        // Handle window resize
        window.addEventListener('resize', () => {
            if (this.isMobileDevice()) {
                this.canvas.width = window.innerWidth;
                this.canvas.height = window.innerHeight;
                
                // Update touch control positions
                this.updateTouchControlPositions();
            }
        });
    }
    
    updateTouchControlPositions() {
        if (this.touchControls) {
            this.touchControls.joystick.y = this.canvas.height - 80;
            this.touchControls.shootButton.x = this.canvas.width - 80;
            this.touchControls.shootButton.y = this.canvas.height - 80;
        }
    }
    
    loadSprites() {
        const spriteFiles = {
            player: 'assets/images/player_ship.png',
            enemy1: 'assets/images/enemy_ship1.png',
            enemy2: 'assets/images/enemy_ship2.png',
            enemy3: 'assets/images/enemy_ship3.png',
            soldier: 'assets/images/soldier.png',
            missile: 'assets/images/missile.png',
            health: 'assets/images/health.png',
            weapon: 'assets/images/weapon.png',
            rapidFire: 'assets/images/rapid_fire.png'
        };
        
        let loadedCount = 0;
        const totalSprites = Object.keys(spriteFiles).length;
        
        Object.entries(spriteFiles).forEach(([key, src]) => {
            const img = new Image();
            img.onload = () => {
                loadedCount++;
                if (loadedCount === totalSprites) {
                    console.log('All sprites loaded successfully!');
                }
            };
            img.onerror = () => {
                console.warn(`Failed to load sprite: ${src}`);
                // Still count as loaded to avoid blocking
                loadedCount++;
            };
            img.src = src;
            this.sprites[key] = img;
        });
    }
    
    initGround() {
        // Create mountains
        this.mountains = [];
        for (let i = 0; i < 8; i++) {
            this.mountains.push({
                x: i * 120,
                y: this.canvas.height - 80,
                width: 100,
                height: 60 + Math.random() * 40
            });
        }
        
        // Create soldiers
        this.soldiers = [];
        for (let i = 0; i < 5; i++) {
            this.soldiers.push({
                x: 50 + i * 150,
                y: this.canvas.height - 30,
                width: 20,
                height: 30,
                shootTimer: Math.random() * 2000
            });
        }
    }
    
    initAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.log('Web Audio API not supported');
        }
    }
    
    playSound(frequency, duration, type = 'square', volume = 0.1) {
        if (!this.audioContext) return;
        
        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
            oscillator.type = type;
            
            gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + duration);
        } catch (e) {
            console.log('Error playing sound:', e);
        }
    }
    
    playShootSound() {
        this.playSound(800, 0.1, 'square', 0.15);
    }
    
    playMissileSound() {
        this.playSound(600, 0.15, 'sawtooth', 0.2);
    }
    
    playLaserSound() {
        this.playSound(1200, 0.2, 'sine', 0.25);
    }
    
    playCollectSound() {
        this.playSound(400, 0.2, 'triangle', 0.2);
    }
    
    playGroundMissileSound() {
        this.playSound(300, 0.3, 'sawtooth', 0.1);
    }
    
    playExplosionSound() {
        this.playSound(200, 0.4, 'square', 0.3);
    }
    
    init() {
        this.setupEventListeners();
        
        // Display top score on startup
        document.getElementById('startTopScore').textContent = this.topScore;
        document.getElementById('finalTopScore').textContent = this.topScore;
        
        this.gameLoop();
    }
    
    setupInput() {
        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            if (e.code === 'Space') {
                e.preventDefault();
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
        
        // Mobile touch controls
        this.setupTouchControls();
    }
    
    setupTouchControls() {
        this.touchControls = {
            joystick: {
                x: 80,
                y: this.canvas.height - 80,
                radius: 40,
                active: false,
                startX: 0,
                startY: 0,
                currentX: 0,
                currentY: 0
            },
            shootButton: {
                x: this.canvas.width - 80,
                y: this.canvas.height - 80,
                radius: 40,
                active: false
            },
            touchShooting: false
        };
        
        // Update positions based on canvas size
        this.updateTouchControlPositions();
        
        // Touch event listeners
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const rect = this.canvas.getBoundingClientRect();
            const x = touch.clientX - rect.left;
            const y = touch.clientY - rect.top;
            
            // Check if touch is on joystick
            const joystickDist = Math.sqrt(
                Math.pow(x - this.touchControls.joystick.x, 2) + 
                Math.pow(y - this.touchControls.joystick.y, 2)
            );
            
            if (joystickDist <= this.touchControls.joystick.radius) {
                this.touchControls.joystick.active = true;
                this.touchControls.joystick.startX = x;
                this.touchControls.joystick.startY = y;
                this.touchControls.joystick.currentX = x;
                this.touchControls.joystick.currentY = y;
            }
            
            // Check if touch is on shoot button
            const shootDist = Math.sqrt(
                Math.pow(x - this.touchControls.shootButton.x, 2) + 
                Math.pow(y - this.touchControls.shootButton.y, 2)
            );
            
            if (shootDist <= this.touchControls.shootButton.radius) {
                this.touchControls.shootButton.active = true;
                this.touchControls.touchShooting = true;
            }
        });
        
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const rect = this.canvas.getBoundingClientRect();
            const x = touch.clientX - rect.left;
            const y = touch.clientY - rect.top;
            
            if (this.touchControls.joystick.active) {
                this.touchControls.joystick.currentX = x;
                this.touchControls.joystick.currentY = y;
            }
        });
        
        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.touchControls.joystick.active = false;
            this.touchControls.shootButton.active = false;
            this.touchControls.touchShooting = false;
        });
        
        // Mouse controls for desktop testing
        this.canvas.addEventListener('mousedown', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Check if click is on joystick
            const joystickDist = Math.sqrt(
                Math.pow(x - this.touchControls.joystick.x, 2) + 
                Math.pow(y - this.touchControls.joystick.y, 2)
            );
            
            if (joystickDist <= this.touchControls.joystick.radius) {
                this.touchControls.joystick.active = true;
                this.touchControls.joystick.startX = x;
                this.touchControls.joystick.startY = y;
                this.touchControls.joystick.currentX = x;
                this.touchControls.joystick.currentY = y;
            }
            
            // Check if click is on shoot button
            const shootDist = Math.sqrt(
                Math.pow(x - this.touchControls.shootButton.x, 2) + 
                Math.pow(y - this.touchControls.shootButton.y, 2)
            );
            
            if (shootDist <= this.touchControls.shootButton.radius) {
                this.touchControls.shootButton.active = true;
                this.touchControls.touchShooting = true;
            }
        });
        
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            if (this.touchControls.joystick.active) {
                this.touchControls.joystick.currentX = x;
                this.touchControls.joystick.currentY = y;
            }
        });
        
        this.canvas.addEventListener('mouseup', (e) => {
            this.touchControls.joystick.active = false;
            this.touchControls.shootButton.active = false;
            this.touchControls.touchShooting = false;
        });
    }
    
    setupEventListeners() {
        document.getElementById('startBtn').addEventListener('click', () => {
            this.startGame();
        });
        
        document.getElementById('restartBtn').addEventListener('click', () => {
            this.restartGame();
        });
    }
    
    startGame() {
        this.gameRunning = true;
        this.score = 0;
        this.level = 1;
        this.player.health = 100;
        this.player.weapon = 'basic';
        this.player.rapidFire = false;
        
        this.enemies = [];
        this.bullets = [];
        this.collectibles = [];
        this.particles = [];
        this.groundMissiles = [];
        this.initGround();
        
        // Update top score displays
        document.getElementById('startTopScore').textContent = this.topScore;
        document.getElementById('finalTopScore').textContent = this.topScore;
        
        document.getElementById('startScreen').classList.add('hidden');
        document.getElementById('gameOverScreen').classList.add('hidden');
    }
    
    restartGame() {
        this.startGame();
    }
    
    update(deltaTime) {
        if (!this.gameRunning) return;
        
        this.updatePlayer(deltaTime);
        this.updateEnemies(deltaTime);
        this.updateBullets(deltaTime);
        this.updateCollectibles(deltaTime);
        this.updateParticles(deltaTime);
        this.updateGroundMissiles(deltaTime);
        this.updateSoldiers(deltaTime);
        this.spawnEnemies(deltaTime);
        this.spawnCollectibles(deltaTime);
        this.checkCollisions();
        this.updateLevel(deltaTime);
    }
    
    updatePlayer(deltaTime) {
        // Handle keyboard input
        if (this.keys['ArrowUp'] || this.keys['KeyW']) {
            this.player.y -= this.player.speed;
        }
        if (this.keys['ArrowDown'] || this.keys['KeyS']) {
            this.player.y += this.player.speed;
        }
        if (this.keys['ArrowLeft'] || this.keys['KeyA']) {
            this.player.x -= this.player.speed;
        }
        if (this.keys['ArrowRight'] || this.keys['KeyD']) {
            this.player.x += this.player.speed;
        }
        
        // Handle touch controls
        if (this.touchControls.joystick.active) {
            const dx = this.touchControls.joystick.currentX - this.touchControls.joystick.startX;
            const dy = this.touchControls.joystick.currentY - this.touchControls.joystick.startY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 5) { // Dead zone
                const maxDistance = this.touchControls.joystick.radius;
                const normalizedDistance = Math.min(distance, maxDistance) / maxDistance;
                
                this.player.x += (dx / distance) * this.player.speed * normalizedDistance;
                this.player.y += (dy / distance) * this.player.speed * normalizedDistance;
            }
        }
        
        // Handle touch shooting
        if (this.touchControls.touchShooting) {
            this.shoot();
        }
        
        // Handle keyboard shooting
        if (this.keys['Space']) {
            this.shoot();
        }
        
        // Keep player in bounds
        this.player.x = Math.max(0, Math.min(this.canvas.width - this.player.width, this.player.x));
        this.player.y = Math.max(0, Math.min(this.canvas.height - this.player.height, this.player.y));
        
        // Update rapid fire timer
        if (this.player.rapidFire) {
            this.player.rapidFireTimer -= deltaTime;
            if (this.player.rapidFireTimer <= 0) {
                this.player.rapidFire = false;
            }
        }
    }
    
    shoot() {
        const now = Date.now();
        const fireRate = this.player.rapidFire ? 50 : this.player.fireRate;
        
        if (now - this.player.lastShot >= fireRate) {
            this.player.lastShot = now;
            
            let bullets = [];
            
            switch(this.player.weapon) {
                case 'basic':
                    bullets.push({ x: this.player.x + this.player.width, y: this.player.y + this.player.height/2, vx: 8, vy: 0, damage: 10, width: 6, height: 6 });
                    this.playShootSound();
                    break;
                case 'double':
                    bullets.push(
                        { x: this.player.x + this.player.width, y: this.player.y + 5, vx: 8, vy: -2, damage: 15, width: 6, height: 6 },
                        { x: this.player.x + this.player.width, y: this.player.y + this.player.height - 5, vx: 8, vy: 2, damage: 15, width: 6, height: 6 }
                    );
                    this.playShootSound();
                    break;
                case 'spread':
                    bullets.push(
                        { x: this.player.x + this.player.width, y: this.player.y + this.player.height/2, vx: 8, vy: 0, damage: 20, width: 6, height: 6 },
                        { x: this.player.x + this.player.width, y: this.player.y + 5, vx: 6, vy: -3, damage: 15, width: 6, height: 6 },
                        { x: this.player.x + this.player.width, y: this.player.y + this.player.height - 5, vx: 6, vy: 3, damage: 15, width: 6, height: 6 }
                    );
                    this.playMissileSound();
                    break;
                case 'laser':
                    bullets.push({ x: this.player.x + this.player.width, y: this.player.y + this.player.height/2, vx: 12, vy: 0, damage: 30, width: 6, height: 6 });
                    this.playLaserSound();
                    break;
            }
            
            this.bullets.push(...bullets);
        }
    }
    
    updateEnemies(deltaTime) {
        this.enemies.forEach(enemy => {
            enemy.x -= enemy.speed;
            
            // Remove off-screen enemies
            if (enemy.x < -enemy.width) {
                const index = this.enemies.indexOf(enemy);
                if (index > -1) {
                    this.enemies.splice(index, 1);
                }
            }
        });
    }
    
    updateBullets(deltaTime) {
        this.bullets.forEach(bullet => {
            bullet.x += bullet.vx;
            bullet.y += bullet.vy;
            
            // Remove off-screen bullets
            if (bullet.x > this.canvas.width || bullet.x < 0 || bullet.y < 0 || bullet.y > this.canvas.height) {
                const index = this.bullets.indexOf(bullet);
                if (index > -1) {
                    this.bullets.splice(index, 1);
                }
            }
        });
    }
    
    updateCollectibles(deltaTime) {
        this.collectibles.forEach(collectible => {
            collectible.animationTimer += deltaTime;
        });
    }
    
    updateParticles(deltaTime) {
        this.particles.forEach(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life -= deltaTime;
            
            if (particle.life <= 0) {
                const index = this.particles.indexOf(particle);
                if (index > -1) {
                    this.particles.splice(index, 1);
                }
            }
        });
    }
    
    spawnEnemies(deltaTime) {
        this.enemySpawnTimer += deltaTime;
        
        if (this.enemySpawnTimer >= 2000 - this.level * 100) {
            const enemy = {
                x: this.canvas.width,
                y: Math.random() * (this.canvas.height - 100),
                width: 40,
                height: 30,
                speed: 2 + this.level * 0.5,
                health: 20 + this.level * 5,
                type: Math.floor(Math.random() * 3) + 1 // Random enemy type 1-3
            };
            
            this.enemies.push(enemy);
            this.enemySpawnTimer = 0;
        }
    }
    
    spawnCollectibles(deltaTime) {
        this.collectibleSpawnTimer += deltaTime;
        
        if (this.collectibleSpawnTimer >= 3000) {
            let typeRand = Math.random();
            let type;
            if (typeRand < 0.5) type = 'health';
            else if (typeRand < 0.8) type = 'weapon';
            else type = 'money';
            const collectible = {
                x: this.canvas.width,
                y: Math.random() * (this.canvas.height - 20),
                width: 20,
                height: 20,
                type: type,
                weaponType: type === 'weapon' ? this.getRandomWeapon() : null,
                animationTimer: 0
            };
            
            this.collectibles.push(collectible);
            this.collectibleSpawnTimer = 0;
        }
    }
    
    getRandomWeapon() {
        const weapons = ['double', 'spread', 'laser'];
        return weapons[Math.floor(Math.random() * weapons.length)];
    }
    
    checkCollisions() {
        // Player bullets vs enemies
        this.bullets.forEach(bullet => {
            this.enemies.forEach(enemy => {
                if (this.checkCollision(bullet, enemy)) {
                    enemy.health -= bullet.damage;
                    bullet.x = -100; // Remove bullet
                    
                    if (enemy.health <= 0) {
                        this.score += 10;
                        this.createExplosion(enemy.x + enemy.width/2, enemy.y + enemy.height/2);
                        const index = this.enemies.indexOf(enemy);
                        if (index > -1) {
                            this.enemies.splice(index, 1);
                        }
                    }
                }
            });
            
            // Player bullets vs ground missiles
            for (let i = this.groundMissiles.length - 1; i >= 0; i--) {
                const missile = this.groundMissiles[i];
                if (this.checkCollision(bullet, missile)) {
                    this.createExplosion(missile.x, missile.y);
                    this.groundMissiles.splice(i, 1);
                    bullet.x = -100; // Remove bullet
                    this.score += 5; // Bonus points for shooting missiles
                }
            }
        });
        
        // Enemies vs player
        this.enemies.forEach(enemy => {
            if (this.checkCollision(this.player, enemy)) {
                this.player.health -= 20;
                this.createExplosion(enemy.x + enemy.width/2, enemy.y + enemy.height/2);
                const index = this.enemies.indexOf(enemy);
                if (index > -1) {
                    this.enemies.splice(index, 1);
                }
                
                if (this.player.health <= 0) {
                    this.gameOver();
                }
            }
        });
        
        // Ground missiles vs player
        for (let i = this.groundMissiles.length - 1; i >= 0; i--) {
            const missile = this.groundMissiles[i];
            if (this.checkCollision(this.player, missile)) {
                this.player.health -= 15;
                this.createExplosion(missile.x, missile.y);
                this.groundMissiles.splice(i, 1);
                
                if (this.player.health <= 0) {
                    this.gameOver();
                }
            }
        }
        
        // Collectibles vs player
        this.collectibles.forEach(collectible => {
            if (this.checkCollision(this.player, collectible)) {
                if (collectible.type === 'health') {
                    this.player.health = Math.min(this.player.maxHealth, this.player.health + 30);
                } else if (collectible.type === 'weapon') {
                    this.player.weapon = collectible.weaponType;
                    this.player.rapidFire = true;
                    this.player.rapidFireTimer = 5000; // 5 seconds
                } else if (collectible.type === 'money') {
                    this.money += 10; // Or any value you want
                    this.showAchievementPopup('💰 +10 Money!');
                }
                
                this.playCollectSound();
                
                const index = this.collectibles.indexOf(collectible);
                if (index > -1) {
                    this.collectibles.splice(index, 1);
                }
            }
        });
    }
    
    checkCollision(obj1, obj2) {
        return obj1.x < obj2.x + obj2.width &&
               obj1.x + obj1.width > obj2.x &&
               obj1.y < obj2.y + obj2.height &&
               obj1.y + obj1.height > obj2.y;
    }
    
    createExplosion(x, y) {
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * 3,
                vy: Math.sin(angle) * 3,
                life: 1000,
                color: '#ff4444'
            });
        }
    }
    
    updateLevel(deltaTime) {
        this.levelTimer += deltaTime;
        
        if (this.levelTimer >= 30000) { // 30 seconds per level
            this.level++;
            this.levelTimer = 0;
        }
    }
    
    updateSoldiers(deltaTime) {
        // Soldiers shoot missiles at intervals
        this.soldiers.forEach(soldier => {
            soldier.x -= 1; // Move soldiers to the left
            soldier.shootTimer -= deltaTime;
            if (soldier.shootTimer <= 0) {
                this.groundMissiles.push({
                    x: soldier.x + soldier.width / 2 - 2,
                    y: soldier.y,
                    width: 4,
                    height: 12,
                    speed: 5
                });
                this.playGroundMissileSound();
                soldier.shootTimer = 2000 + Math.random() * 2000;
            }
        });
    }

    updateGroundMissiles(deltaTime) {
        // Move ground missiles upward
        for (let i = this.groundMissiles.length - 1; i >= 0; i--) {
            const missile = this.groundMissiles[i];
            missile.y -= missile.speed;
            if (missile.y < 0) {
                this.groundMissiles.splice(i, 1);
            }
        }
    }

    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw stars background
        this.drawStars();
        
        // Draw mountains and ground
        this.drawMountains();
        this.drawSoldiers();
        this.drawGroundMissiles();
        
        // Always draw player (even when game isn't running)
        this.drawPlayer();
        
        // Only draw game objects when game is running
        if (this.gameRunning) {
            this.drawEnemies();
            this.drawBullets();
            this.drawCollectibles();
            this.drawParticles();
        }

        // Draw touch controls
        this.drawTouchControls();
        
        // Update HUD
        this.updateHUD();
    }
    
    drawStars() {
        this.ctx.fillStyle = '#fff';
        for (let i = 0; i < 50; i++) {
            const x = (i * 37) % this.canvas.width;
            const y = (i * 73 + Date.now() / 50) % this.canvas.height;
            this.ctx.fillRect(x, y, 1, 1);
        }
    }
    
    drawMountains() {
        this.mountains.forEach(mountain => {
            this.ctx.fillStyle = '#444';
            this.ctx.beginPath();
            this.ctx.moveTo(mountain.x, this.canvas.height);
            this.ctx.lineTo(mountain.x + mountain.width / 2, mountain.y);
            this.ctx.lineTo(mountain.x + mountain.width, this.canvas.height);
            this.ctx.closePath();
            this.ctx.fill();
        });
        // Draw ground
        this.ctx.fillStyle = '#222';
        this.ctx.fillRect(0, this.canvas.height - 20, this.canvas.width, 20);
    }

    drawSoldiers() {
        this.soldiers.forEach(soldier => {
            if (this.sprites.soldier && this.sprites.soldier.complete) {
                this.ctx.drawImage(this.sprites.soldier, soldier.x, soldier.y - soldier.height, soldier.width, soldier.height);
            } else {
                // Fallback to original drawing
                // Draw soldier body
                this.ctx.fillStyle = '#1976d2';
                this.ctx.fillRect(soldier.x, soldier.y - soldier.height, soldier.width, soldier.height);
                // Draw head
                this.ctx.beginPath();
                this.ctx.arc(soldier.x + soldier.width / 2, soldier.y - soldier.height, 8, 0, Math.PI * 2);
                this.ctx.fillStyle = '#ffe082';
                this.ctx.fill();
                // Draw gun
                this.ctx.fillStyle = '#888';
                this.ctx.fillRect(soldier.x + soldier.width / 2 - 2, soldier.y - soldier.height / 2, 4, 12);
            }
        });
    }
    
    drawPlayer() {
        // Always draw the player ship, regardless of sprite loading
        if (this.sprites.player && this.sprites.player.complete) {
            this.ctx.drawImage(this.sprites.player, this.player.x, this.player.y, this.player.width, this.player.height);
        } else {
            // Fallback to original drawing if sprite not loaded
            this.ctx.fillStyle = '#0f0';
            this.ctx.beginPath();
            this.ctx.moveTo(this.player.x + this.player.width, this.player.y + this.player.height/2);
            this.ctx.lineTo(this.player.x, this.player.y);
            this.ctx.lineTo(this.player.x, this.player.y + this.player.height);
            this.ctx.closePath();
            this.ctx.fill();
            
            // Draw cockpit
            this.ctx.fillStyle = '#fff';
            this.ctx.fillRect(this.player.x + this.player.width * 0.7, this.player.y + this.player.height * 0.3, 8, 12);
            
            // Draw engine glow
            this.ctx.fillStyle = '#ff4444';
            this.ctx.fillRect(this.player.x, this.player.y + this.player.height * 0.4, 3, 8);
        }
    }
    
    drawEnemies() {
        this.enemies.forEach(enemy => {
            const enemySprite = this.sprites[`enemy${enemy.type || 1}`];
            if (enemySprite && enemySprite.complete) {
                this.ctx.drawImage(enemySprite, enemy.x, enemy.y, enemy.width, enemy.height);
            } else {
                // Fallback to original drawing
                this.ctx.fillStyle = '#ff4444';
                this.ctx.beginPath();
                this.ctx.moveTo(enemy.x, enemy.y + enemy.height/2);
                this.ctx.lineTo(enemy.x + enemy.width, enemy.y);
                this.ctx.lineTo(enemy.x + enemy.width, enemy.y + enemy.height);
                this.ctx.closePath();
                this.ctx.fill();
            }
            
            // Draw health bar
            const healthPercent = enemy.health / (20 + this.level * 5);
            this.ctx.fillStyle = '#ff0000';
            this.ctx.fillRect(enemy.x, enemy.y - 5, enemy.width, 3);
            this.ctx.fillStyle = '#00ff00';
            this.ctx.fillRect(enemy.x, enemy.y - 5, enemy.width * healthPercent, 3);
        });
    }
    
    drawBullets() {
        this.bullets.forEach(bullet => {
            this.ctx.fillStyle = '#ffff00';
            this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        });
    }

    drawGroundMissiles() {
        this.groundMissiles.forEach(missile => {
            if (this.sprites.missile && this.sprites.missile.complete) {
                this.ctx.drawImage(this.sprites.missile, missile.x, missile.y, missile.width, missile.height);
            } else {
                // Fallback to original drawing
                this.ctx.fillStyle = '#ff9800';
                this.ctx.fillRect(missile.x, missile.y, missile.width, missile.height);
                // Draw missile tip
                this.ctx.fillStyle = '#fff';
                this.ctx.fillRect(missile.x, missile.y, missile.width, 3);
            }
        });
    }
    
    drawCollectibles() {
        this.collectibles.forEach(collectible => {
            this.ctx.save();
            // Animate collectible with pulsing effect
            const pulse = 0.5 + 0.5 * Math.sin(collectible.animationTimer / 200);
            this.ctx.globalAlpha = pulse;
            
            let sprite = null;
            if (collectible.type === 'health') {
                sprite = this.sprites.health;
            } else if (collectible.type === 'weapon') {
                if (collectible.weaponType === 'rapid') {
                    sprite = this.sprites.rapidFire;
                } else {
                    sprite = this.sprites.weapon;
                }
            } else if (collectible.type === 'money') {
                // No sprite, use emoji
            }
            
            if (sprite && sprite.complete) {
                this.ctx.drawImage(sprite, collectible.x, collectible.y, collectible.width, collectible.height);
            } else {
                let emoji = '';
                if (collectible.type === 'health') {
                    emoji = '❤️';
                } else if (collectible.type === 'weapon') {
                    if (collectible.weaponType === 'double') emoji = '🔫';
                    else if (collectible.weaponType === 'spread') emoji = '💥';
                    else if (collectible.weaponType === 'laser') emoji = '🔷';
                    else emoji = '✨';
                } else if (collectible.type === 'money') {
                    emoji = '💰';
                }
                this.ctx.font = '24px serif';
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                this.ctx.fillText(emoji, collectible.x + collectible.width / 2, collectible.y + collectible.height / 2);
            }
            
            this.ctx.restore();
        });
    }
    
    drawParticles() {
        this.particles.forEach(particle => {
            this.ctx.fillStyle = particle.color;
            this.ctx.fillRect(particle.x, particle.y, 2, 2);
        });
    }

    drawTouchControls() {
        // Only draw on mobile devices or when touch is detected
        if (!this.isMobileDevice() && !this.touchControls.joystick.active && !this.touchControls.shootButton.active) {
            return;
        }
        
        // Draw joystick
        this.ctx.save();
        this.ctx.globalAlpha = 0.7;
        
        // Joystick background
        this.ctx.beginPath();
        this.ctx.arc(this.touchControls.joystick.x, this.touchControls.joystick.y, this.touchControls.joystick.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fill();
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        
        // Joystick handle
        if (this.touchControls.joystick.active) {
            const dx = this.touchControls.joystick.currentX - this.touchControls.joystick.startX;
            const dy = this.touchControls.joystick.currentY - this.touchControls.joystick.startY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const maxDistance = this.touchControls.joystick.radius - 10;
            const normalizedDistance = Math.min(distance, maxDistance);
            
            const handleX = this.touchControls.joystick.startX + (dx / distance) * normalizedDistance;
            const handleY = this.touchControls.joystick.startY + (dy / distance) * normalizedDistance;
            
            this.ctx.beginPath();
            this.ctx.arc(handleX, handleY, 15, 0, Math.PI * 2);
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            this.ctx.fill();
        } else {
            this.ctx.beginPath();
            this.ctx.arc(this.touchControls.joystick.x, this.touchControls.joystick.y, 15, 0, Math.PI * 2);
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            this.ctx.fill();
        }
        
        // Draw shoot button
        this.ctx.beginPath();
        this.ctx.arc(this.touchControls.shootButton.x, this.touchControls.shootButton.y, this.touchControls.shootButton.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = this.touchControls.shootButton.active ? 'rgba(255, 100, 100, 0.8)' : 'rgba(255, 0, 0, 0.6)';
        this.ctx.fill();
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        
        // Shoot button text
        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 16px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('FIRE', this.touchControls.shootButton.x, this.touchControls.shootButton.y + 5);
        
        this.ctx.restore();
    }
    
    isMobileDevice() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }
    
    updateHUD() {
        // Always update HUD elements, even when game isn't running
        const scoreElement = document.getElementById('score');
        const healthElement = document.getElementById('health');
        const weaponElement = document.getElementById('weapon');
        const levelElement = document.getElementById('level');
        const topScoreElement = document.getElementById('topScore');
        const moneyElement = document.getElementById('moneyAmount');
        
        if (scoreElement) scoreElement.textContent = `Score: ${this.score}`;
        if (healthElement) healthElement.textContent = `Health: ${this.player.health}`;
        if (weaponElement) weaponElement.textContent = `Weapon: ${this.player.weapon.toUpperCase()}`;
        if (levelElement) levelElement.textContent = `Level: ${this.level}`;
        if (topScoreElement) topScoreElement.textContent = `Top Score: ${this.topScore}`;
        if (moneyElement) moneyElement.textContent = this.money;
    }
    
    gameOver() {
        this.gameRunning = false;
        
        // Update top score
        if (this.score > this.topScore) {
            this.topScore = this.score;
            localStorage.setItem('topScore', this.topScore);
        }
        
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('finalTopScore').textContent = this.topScore;
        document.getElementById('gameOverScreen').classList.remove('hidden');
    }
    
    gameLoop(currentTime = 0) {
        const deltaTime = currentTime - (this.lastTime || currentTime);
        this.lastTime = currentTime;
        
        this.update(deltaTime);
        this.draw();
        
        requestAnimationFrame((time) => this.gameLoop(time));
    }

    showAchievementPopup(message) {
        let popup = document.createElement('div');
        popup.className = 'achievement-popup';
        popup.textContent = message;
        popup.style.position = 'fixed';
        popup.style.top = '20%';
        popup.style.left = '50%';
        popup.style.transform = 'translate(-50%, 0)';
        popup.style.background = 'rgba(0,0,0,0.85)';
        popup.style.color = '#ffd700';
        popup.style.fontSize = '2em';
        popup.style.padding = '18px 36px';
        popup.style.borderRadius = '12px';
        popup.style.zIndex = 9999;
        popup.style.boxShadow = '0 0 20px #ffd700';
        document.body.appendChild(popup);
        setTimeout(() => { popup.style.opacity = '0'; }, 1200);
        setTimeout(() => { popup.remove(); }, 1800);
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new SpaceShooter();
}); 