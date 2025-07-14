// Simple Space Shooter Game
class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = 800;
        this.canvas.height = 600;
        
        this.player = null;
        this.enemies = [];
        this.bullets = [];
        this.enemyBullets = [];
        this.particles = [];
        this.collectibles = [];
        
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.gameState = 'start'; // Add game state
        this.gameRunning = false;
        this.lastTime = 0;
        
        // Top score tracking
        this.topScore = this.loadTopScore();
        
        // Enemy spawning
        this.enemySpawnTimer = 0;
        this.enemySpawnInterval = 1200;
        
        // Shop system
        this.money = 0;
        this.shopOpen = false;
        this.weaponLevel = 1;
        this.shieldLevel = 0;
        this.specialAbilities = {
            rapidFire: false,
            homingMissiles: false,
            shield: false,
            multiShot: false
        };
        this.shipType = 'basic';
        this.scoreMultiplier = 1;
        this.specialWeapons = [];
        
        // Shop items
        this.shopItems = [
            { id: 'weapon_upgrade', name: 'Weapon Upgrade', cost: 50, emoji: '🔫', description: 'Upgrade weapon damage' },
            { id: 'shield', name: 'Shield', cost: 75, emoji: '🛡️', description: 'Block enemy bullets' },
            { id: 'rapid_fire', name: 'Rapid Fire', cost: 100, emoji: '⚡', description: 'Faster shooting' },
            { id: 'homing_missiles', name: 'Homing Missiles', cost: 150, emoji: '🎯', description: 'Auto-targeting missiles' },
            { id: 'multi_shot', name: 'Multi Shot', cost: 120, emoji: '🔫', description: 'Shoot multiple bullets' },
            { id: 'score_multiplier', name: 'Score Multiplier', cost: 80, emoji: '⭐', description: '2x score points' },
            { id: 'extra_life', name: 'Extra Life', cost: 200, emoji: '❤️', description: 'Gain 1 life' },
            { id: 'special_weapon', name: 'Special Weapon', cost: 300, emoji: '💥', description: 'One-time powerful weapon' }
        ];
        
        this.keys = {};
        this.setupInput();
        this.createShootSound = this.createShootSound();
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
            this.keys[e.key] = true;
            
            // Shop controls
            if (e.key === 'p' || e.key === 'P') {
                this.toggleShop();
            }
            
            // Special weapon activation
            if (e.key === 's' || e.key === 'S') {
                this.activateSpecialWeapon();
            }
            
            // Number keys for shop items
            if (this.shopOpen && e.key >= '1' && e.key <= '8') {
                this.buyShopItem(parseInt(e.key) - 1);
            }
            
            // Debug spacebar
            if (e.key === ' ') {
                console.log('Spacebar pressed!');
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
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
        this.lives = 3;
        this.level = 1;
        this.money = 0; // Reset money for new game
        this.enemies = [];
        this.bullets = [];
        this.particles = [];
        this.enemyBullets = [];
        this.collectibles = [];
        
        // Reset shop upgrades
        this.weaponLevel = 1;
        this.shieldLevel = 0;
        this.specialAbilities = {
            rapidFire: false,
            homingMissiles: false,
            shield: false,
            multiShot: false
        };
        this.scoreMultiplier = 1;
        this.specialWeapons = [];
        
        this.player = new Player(400, 500);
        this.player.setGame(this); // Set game reference
        
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
        
        document.getElementById('gameOverScreen').classList.remove('hidden');
    }
    
    update(deltaTime) {
        if (this.gameState !== 'playing') return;
        
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
                    this.shootSound();
                } else {
                    console.log('No bullets created (cooldown)');
                }
            }
        }
        
        // Dynamic enemy spawn rate
        this.enemySpawnTimer += deltaTime;
        // Decrease interval as score increases (min 400ms)
        this.enemySpawnInterval = Math.max(400, 1200 - Math.floor(this.score / 50) * 100);
        if (this.enemySpawnTimer > this.enemySpawnInterval) {
            this.spawnEnemy();
            this.enemySpawnTimer = 0;
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
            const speed = 100 + Math.random() * 100; // 100-200 pixels per second
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
        this.collectibles.forEach(c => c.draw(this.ctx));
        
        // Draw shop if open
        if (this.shopOpen) {
            this.drawShop();
        }
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
        const moveSpeed = this.speed * (deltaTime / 1000); // Convert to pixels per second
        
        if (keys['ArrowLeft']) this.x -= moveSpeed;
        if (keys['ArrowRight']) this.x += moveSpeed;
        if (keys['ArrowUp']) this.y -= moveSpeed;
        if (keys['ArrowDown']) this.y += moveSpeed;
        
        // Keep player on screen
        this.x = Math.max(0, Math.min(760, this.x));
        this.y = Math.max(0, Math.min(570, this.y));
    }
    
    shoot() {
        const now = Date.now();
        const cooldown = this.game && this.game.specialAbilities.rapidFire ? 100 : 200;
        
        if (now - this.lastShot >= cooldown) {
            this.lastShot = now;
            const bullets = [];
            
            // Always shoot at least one bullet
            bullets.push(new Bullet(this.x + this.width/2 - 2, this.y, 0, -300)); // 300 pixels per second
            
            // Multi shot ability
            if (this.game && this.game.specialAbilities.multiShot) {
                bullets.push(new Bullet(this.x + 8, this.y, 0, -300));
                bullets.push(new Bullet(this.x + this.width - 12, this.y, 0, -300));
            }
            
            // Weapon level 2+ (double shot) - only if not multi shot
            if (this.game && this.game.weaponLevel >= 2 && !this.game.specialAbilities.multiShot) {
                bullets.push(new Bullet(this.x + 8, this.y, 0, -300));
                bullets.push(new Bullet(this.x + this.width - 12, this.y, 0, -300));
            }
            
            // Weapon level 3+ (triple shot) - additional center bullet
            if (this.game && this.game.weaponLevel >= 3) {
                bullets.push(new Bullet(this.x + this.width/2 - 2, this.y, 0, -350)); // Center, faster
            }
            
            // Homing missiles
            if (this.game && this.game.specialAbilities.homingMissiles) {
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
            
            return bullets;
        }
        return null;
    }
    
    upgradeWeapon() {
        this.weaponLevel = Math.min(3, this.weaponLevel + 1);
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
        
        // Draw shield if active
        if (this.game && this.game.specialAbilities.shield) {
            ctx.strokeStyle = '#00ffff';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(this.x + this.width/2, this.y + this.height/2, 
                this.width/2 + 5, 0, Math.PI * 2);
            ctx.stroke();
        }
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
document.addEventListener('DOMContentLoaded', () => {
    const game = new Game();
    
    // Initialize top score display
    game.initializeTopScoreDisplay();
    
    // Add event listeners for buttons
    document.getElementById('startBtn').addEventListener('click', () => {
        game.startGame();
        game.gameLoop();
    });
    
    document.getElementById('restartBtn').addEventListener('click', () => {
        game.restartGame();
        game.gameLoop();
    });
}); 