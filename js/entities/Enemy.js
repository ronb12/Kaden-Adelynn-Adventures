// Enemy.js - Enemy entity with AI behavior and state management
class Enemy {
    constructor(type = 'scout', x = 0, y = 0) {
        this.type = type;
        this.x = x;
        this.y = y;
        this.width = 40;
        this.height = 40;
        this.speed = 2;
        this.health = 1;
        this.maxHealth = 1;
        this.damage = 1;
        this.score = 10;
        
        // AI behavior
        this.behavior = 'patrol';
        this.targetX = 0;
        this.targetY = 0;
        this.behaviorTimer = 0;
        this.behaviorDuration = 3000;
        this.aggressionLevel = 0.5;
        
        // Movement patterns
        this.movementPattern = 'linear';
        this.movementTimer = 0;
        this.movementPhase = 0;
        this.originalX = x;
        this.originalY = y;
        
        // Combat
        this.canShoot = false;
        this.lastShotTime = 0;
        this.shotDelay = 1000;
        this.bulletSpeed = 3;
        this.bulletDamage = 1;
        
        // Visual effects
        this.alpha = 1;
        this.flashTimer = 0;
        this.isFlashing = false;
        
        // State
        this.isAlive = true;
        this.isActive = false;
        this.lastUpdate = Date.now();
        
        this.init();
    }
    
    init() {
        this.applyEnemyType();
        this.validatePosition();
        this.setInitialBehavior();
        console.log(`Enemy ${this.type} initialized`);
    }
    
    applyEnemyType() {
        const enemyConfigs = {
            scout: {
                width: 30, height: 30, speed: 3, health: 1, damage: 1, score: 10,
                behavior: 'patrol', movementPattern: 'zigzag', canShoot: false
            },
            fighter: {
                width: 40, height: 40, speed: 2, health: 2, damage: 1, score: 20,
                behavior: 'aggressive', movementPattern: 'linear', canShoot: true,
                shotDelay: 800, bulletSpeed: 4
            },
            destroyer: {
                width: 50, height: 50, speed: 1.5, health: 4, damage: 2, score: 40,
                behavior: 'tank', movementPattern: 'slow', canShoot: true,
                shotDelay: 1200, bulletSpeed: 3, bulletDamage: 2
            },
            battleship: {
                width: 80, height: 60, speed: 1, health: 8, damage: 3, score: 80,
                behavior: 'boss', movementPattern: 'complex', canShoot: true,
                shotDelay: 2000, bulletSpeed: 2, bulletDamage: 3
            },
            kamikaze: {
                width: 35, height: 35, speed: 4, health: 1, damage: 3, score: 30,
                behavior: 'suicide', movementPattern: 'direct', canShoot: false
            },
            shielded: {
                width: 45, height: 45, speed: 1.5, health: 6, damage: 1, score: 50,
                behavior: 'defensive', movementPattern: 'linear', canShoot: true,
                shotDelay: 1500, bulletSpeed: 3, hasShield: true
            },
            splitter: {
                width: 40, height: 40, speed: 2, health: 3, damage: 1, score: 25,
                behavior: 'split', movementPattern: 'random', canShoot: false,
                splitsInto: 2
            },
            teleporter: {
                width: 35, height: 35, speed: 2.5, health: 2, damage: 1, score: 35,
                behavior: 'teleport', movementPattern: 'teleport', canShoot: true,
                shotDelay: 1000, teleportDelay: 3000
            }
        };
        
        const config = enemyConfigs[this.type] || enemyConfigs.scout;
        
        Object.assign(this, config);
        this.maxHealth = this.health;
    }
    
    update(deltaTime) {
        if (!this.isAlive || !this.isActive) return;
        
        try {
            this.updateBehavior(deltaTime);
            this.updateMovement(deltaTime);
            this.updateCombat(deltaTime);
            this.updateVisualEffects(deltaTime);
            this.validatePosition();
            
            this.lastUpdate = Date.now();
        } catch (error) {
            console.error('Enemy update error:', error);
            this.resetToSafeState();
        }
    }
    
    updateBehavior(deltaTime) {
        this.behaviorTimer += deltaTime;
        
        if (this.behaviorTimer >= this.behaviorDuration) {
            this.changeBehavior();
            this.behaviorTimer = 0;
        }
        
        // Update behavior based on type
        switch (this.behavior) {
            case 'patrol':
                this.updatePatrolBehavior(deltaTime);
                break;
            case 'aggressive':
                this.updateAggressiveBehavior(deltaTime);
                break;
            case 'tank':
                this.updateTankBehavior(deltaTime);
                break;
            case 'boss':
                this.updateBossBehavior(deltaTime);
                break;
            case 'suicide':
                this.updateSuicideBehavior(deltaTime);
                break;
            case 'defensive':
                this.updateDefensiveBehavior(deltaTime);
                break;
            case 'split':
                this.updateSplitBehavior(deltaTime);
                break;
            case 'teleport':
                this.updateTeleportBehavior(deltaTime);
                break;
        }
    }
    
    updateMovement(deltaTime) {
        switch (this.movementPattern) {
            case 'linear':
                this.updateLinearMovement(deltaTime);
                break;
            case 'zigzag':
                this.updateZigzagMovement(deltaTime);
                break;
            case 'slow':
                this.updateSlowMovement(deltaTime);
                break;
            case 'complex':
                this.updateComplexMovement(deltaTime);
                break;
            case 'direct':
                this.updateDirectMovement(deltaTime);
                break;
            case 'random':
                this.updateRandomMovement(deltaTime);
                break;
            case 'teleport':
                this.updateTeleportMovement(deltaTime);
                break;
        }
    }
    
    updateCombat(deltaTime) {
        if (!this.canShoot) return;
        
        const now = Date.now();
        if (now - this.lastShotTime >= this.shotDelay) {
            this.shoot();
            this.lastShotTime = now;
        }
    }
    
    updateVisualEffects(deltaTime) {
        if (this.isFlashing) {
            this.flashTimer -= deltaTime;
            this.alpha = 0.5 + 0.5 * Math.sin(this.flashTimer / 100);
            
            if (this.flashTimer <= 0) {
                this.isFlashing = false;
                this.alpha = 1;
            }
        }
    }
    
    // Behavior update methods
    updatePatrolBehavior(deltaTime) {
        // Simple patrol pattern
        this.movementPhase += deltaTime / 1000;
        this.y += Math.sin(this.movementPhase) * this.speed * deltaTime / 1000;
    }
    
    updateAggressiveBehavior(deltaTime) {
        // Move towards player
        if (window.player) {
            const dx = window.player.x - this.x;
            const dy = window.player.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 0) {
                this.x += (dx / distance) * this.speed * deltaTime / 1000;
                this.y += (dy / distance) * this.speed * deltaTime / 1000;
            }
        }
    }
    
    updateTankBehavior(deltaTime) {
        // Slow but steady movement
        this.y += this.speed * 0.5 * deltaTime / 1000;
    }
    
    updateBossBehavior(deltaTime) {
        // Complex boss movement
        this.movementPhase += deltaTime / 1000;
        this.x = this.originalX + Math.sin(this.movementPhase * 0.5) * 100;
        this.y += this.speed * 0.3 * deltaTime / 1000;
    }
    
    updateSuicideBehavior(deltaTime) {
        // Move directly towards player
        if (window.player) {
            const dx = window.player.x - this.x;
            const dy = window.player.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 0) {
                this.x += (dx / distance) * this.speed * 1.5 * deltaTime / 1000;
                this.y += (dy / distance) * this.speed * 1.5 * deltaTime / 1000;
            }
        }
    }
    
    updateDefensiveBehavior(deltaTime) {
        // Defensive movement with shield
        this.y += this.speed * 0.3 * deltaTime / 1000;
    }
    
    updateSplitBehavior(deltaTime) {
        // Random movement before splitting
        this.x += (Math.random() - 0.5) * this.speed * deltaTime / 1000;
        this.y += this.speed * deltaTime / 1000;
    }
    
    updateTeleportBehavior(deltaTime) {
        // Teleport periodically
        if (this.behaviorTimer % this.teleportDelay < deltaTime) {
            this.teleport();
        }
    }
    
    // Movement pattern methods - Gradius-style (enemies move leftward)
    updateLinearMovement(deltaTime) {
        this.x -= this.speed * deltaTime / 1000; // Move leftward
    }
    
    updateZigzagMovement(deltaTime) {
        this.movementPhase += deltaTime / 1000;
        this.x -= this.speed * deltaTime / 1000; // Base leftward movement
        this.y = this.originalY + Math.sin(this.movementPhase * 2) * 50; // Zigzag vertically
    }
    
    updateSlowMovement(deltaTime) {
        this.x -= this.speed * 0.5 * deltaTime / 1000; // Slow leftward movement
    }
    
    updateComplexMovement(deltaTime) {
        this.movementPhase += deltaTime / 1000;
        this.x -= this.speed * 0.3 * deltaTime / 1000; // Slow leftward movement
        this.y = this.originalY + Math.sin(this.movementPhase) * 80; // Complex vertical pattern
    }
    
    updateDirectMovement(deltaTime) {
        if (window.player) {
            // Move toward player but maintain leftward direction
            const dx = window.player.x - this.x;
            const dy = window.player.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 0) {
                // Move leftward with slight vertical adjustment toward player
                this.x -= this.speed * deltaTime / 1000;
                this.y += (dy / distance) * this.speed * 0.5 * deltaTime / 1000;
            } else {
                this.x -= this.speed * deltaTime / 1000;
            }
        } else {
            this.x -= this.speed * deltaTime / 1000;
        }
    }
    
    updateRandomMovement(deltaTime) {
        this.x -= this.speed * deltaTime / 1000; // Base leftward movement
        this.y += (Math.random() - 0.5) * this.speed * 0.5 * deltaTime / 1000; // Random vertical movement
    }
    
    updateTeleportMovement(deltaTime) {
        // Normal leftward movement between teleports
        this.x -= this.speed * deltaTime / 1000;
    }
    
    changeBehavior() {
        const behaviors = ['patrol', 'aggressive', 'defensive'];
        this.behavior = behaviors[Math.floor(Math.random() * behaviors.length)];
        this.behaviorDuration = 2000 + Math.random() * 3000;
    }
    
    shoot() {
        if (!this.canShoot) return null;
        
        const bullet = {
            x: this.x + this.width / 2,
            y: this.y + this.height,
            width: 4,
            height: 8,
            speed: this.bulletSpeed,
            damage: this.bulletDamage,
            type: 'enemy',
            angle: Math.PI / 2, // Downward (Gradius-style)
            direction: 'down' // Explicit direction for Gradius-style movement
        };
        
        return bullet;
    }
    
    takeDamage(damage) {
        this.health = Math.max(0, this.health - damage);
        
        // Visual feedback
        this.isFlashing = true;
        this.flashTimer = 200;
        
        if (this.health <= 0) {
            this.die();
        }
        
        return this.health <= 0;
    }
    
    die() {
        this.isAlive = false;
        
        // Handle special death behaviors
        if (this.type === 'splitter' && this.splitsInto > 0) {
            this.split();
        }
        
        console.log(`Enemy ${this.type} destroyed`);
    }
    
    split() {
        // Create smaller enemies when destroyed
        for (let i = 0; i < this.splitsInto; i++) {
            const splitEnemy = new Enemy('scout', this.x + (i - 0.5) * 20, this.y);
            splitEnemy.health = 1;
            splitEnemy.maxHealth = 1;
            splitEnemy.score = Math.floor(this.score / 2);
            
            if (window.gameEngine && window.gameEngine.gameObjects.enemies) {
                window.gameEngine.gameObjects.enemies.push(splitEnemy);
            }
        }
    }
    
    teleport() {
        // Teleport to random position
        this.x = Math.random() * (window.innerWidth - this.width);
        this.y = Math.random() * (window.innerHeight / 2);
        this.originalX = this.x;
        this.originalY = this.y;
    }
    
    activate() {
        this.isActive = true;
    }
    
    deactivate() {
        this.isActive = false;
    }
    
    // Position validation (Gradius-style - enemies can move off left side)
    validatePosition() {
        // Keep enemy within vertical bounds, allow horizontal movement off screen
        this.y = Math.max(-this.height, Math.min(window.innerHeight, this.y));
        // Don't constrain X position - enemies can move off the left side
    }
    
    // Safe state reset (Gradius-style)
    resetToSafeState() {
        // Only constrain Y position, allow X to go off screen
        this.y = Math.max(-this.height, Math.min(window.innerHeight, this.y));
        this.health = Math.max(1, this.health);
        this.isFlashing = false;
        this.alpha = 1;
    }
    
    // Check if enemy is off screen (Gradius-style - enemies move leftward)
    isOffScreen() {
        return this.x < -this.width; // Enemy is off screen when it moves past the left edge
    }
    
    // Get enemy state
    getState() {
        return {
            type: this.type,
            position: { x: this.x, y: this.y },
            health: this.health,
            maxHealth: this.maxHealth,
            behavior: this.behavior,
            isAlive: this.isAlive,
            isActive: this.isActive,
            alpha: this.alpha
        };
    }
    
    // Reset enemy for reuse
    reset() {
        this.health = this.maxHealth;
        this.isAlive = true;
        this.isActive = false;
        this.isFlashing = false;
        this.alpha = 1;
        this.behaviorTimer = 0;
        this.movementPhase = 0;
        this.lastShotTime = 0;
        this.flashTimer = 0;
    }
    
    // Draw method for rendering the enemy
    draw(ctx) {
        if (!this.isAlive || !this.isActive) return;
        
        ctx.save();
        
        // Apply alpha for flashing effect
        ctx.globalAlpha = this.alpha;
        
        // Draw enemy ship based on type
        const colors = {
            scout: '#ff4444',
            fighter: '#ff8844',
            destroyer: '#ff4444',
            battleship: '#884444',
            kamikaze: '#ff0044',
            shielded: '#44ff44',
            splitter: '#ff44ff',
            teleporter: '#44ffff'
        };
        
        ctx.fillStyle = colors[this.type] || '#ff4444';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Draw enemy details
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(this.x + this.width/4, this.y + this.height/4, this.width/2, this.height/2);
        
        // Draw health bar
        if (this.health < this.maxHealth) {
            const healthPercent = this.health / this.maxHealth;
            const barWidth = this.width;
            const barHeight = 4;
            
            // Background
            ctx.fillStyle = '#444444';
            ctx.fillRect(this.x, this.y - 8, barWidth, barHeight);
            
            // Health
            ctx.fillStyle = healthPercent > 0.5 ? '#44ff44' : healthPercent > 0.25 ? '#ffff44' : '#ff4444';
            ctx.fillRect(this.x, this.y - 8, barWidth * healthPercent, barHeight);
        }
        
        // Draw shield indicator for shielded enemies
        if (this.type === 'shielded') {
            ctx.strokeStyle = '#44ff44';
            ctx.lineWidth = 2;
            ctx.globalAlpha = 0.7;
            ctx.strokeRect(this.x - 3, this.y - 3, this.width + 6, this.height + 6);
        }
        
        // Draw special effects
        if (this.type === 'teleporter' && this.behaviorTimer % 1000 < 500) {
            ctx.fillStyle = '#44ffff';
            ctx.globalAlpha = 0.5;
            ctx.fillRect(this.x - 5, this.y - 5, this.width + 10, this.height + 10);
        }
        
        ctx.restore();
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Enemy;
} 