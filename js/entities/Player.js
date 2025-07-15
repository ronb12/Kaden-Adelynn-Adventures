// Player.js - Gradius-style player ship
class Player {
    constructor(x = 100, y = 400) {
        this.x = x;
        this.y = y;
        this.width = 40;
        this.height = 30;
        this.speed = 3;
        this.maxSpeed = 5;
        
        // Gradius-style health system
        this.health = 1; // Gradius has 1-hit kills
        this.maxHealth = 1;
        this.invulnerable = false;
        this.invulnerabilityTime = 0;
        this.invulnerabilityDuration = 2000;
        
        // Gradius-style weapon system
        this.weaponType = 'normal'; // normal, missile, double, laser
        this.lastShotTime = 0;
        this.shotDelay = 200;
        
        // Gradius-style options (drones)
        this.options = [];
        this.maxOptions = 2;
        
        // Gradius-style power-ups
        this.hasSpeed = false;
        this.hasMissile = false;
        this.hasDouble = false;
        this.hasLaser = false;
        this.hasShield = false;
        
        // State tracking
        this.isAlive = true;
        this.lastUpdate = Date.now();
        
        // Input state
        this.inputState = {
            moveLeft: false,
            moveRight: false,
            moveUp: false,
            moveDown: false,
            shoot: false
        };
        
        this.init();
    }
    
    init() {
        this.validatePosition();
        console.log('Gradius-style player initialized');
    }
    
    update(deltaTime) {
        if (!this.isAlive) return;
        
        try {
            this.updateMovement(deltaTime);
            this.updateInvulnerability(deltaTime);
            this.updateOptions(deltaTime);
            this.validatePosition();
            
            this.lastUpdate = Date.now();
        } catch (error) {
            console.error('Player update error:', error);
            this.resetToSafeState();
        }
    }
    
    updateMovement(deltaTime) {
        const moveSpeed = this.hasSpeed ? this.speed * 1.5 : this.speed;
        
        // Calculate movement based on input
        let deltaX = 0;
        let deltaY = 0;
        
        if (this.inputState.moveLeft) deltaX -= moveSpeed;
        if (this.inputState.moveRight) deltaX += moveSpeed;
        if (this.inputState.moveUp) deltaY -= moveSpeed;
        if (this.inputState.moveDown) deltaY += moveSpeed;
        
        // Apply movement with boundary checking
        const newX = this.x + deltaX;
        const newY = this.y + deltaY;
        
        this.x = this.clampPosition(newX, 'x');
        this.y = this.clampPosition(newY, 'y');
    }
    
    updateInvulnerability(deltaTime) {
        if (this.invulnerable) {
            this.invulnerabilityTime -= deltaTime;
            if (this.invulnerabilityTime <= 0) {
                this.invulnerable = false;
            }
        }
    }
    
    updateOptions(deltaTime) {
        // Update option positions (drones)
        this.options.forEach((option, index) => {
            const offsetX = (index + 1) * 30;
            option.x = this.x + offsetX;
            option.y = this.y;
        });
    }
    
    setInputState(input) {
        this.inputState = { ...this.inputState, ...input };
    }
    
    canShoot() {
        const now = Date.now();
        return now - this.lastShotTime >= this.shotDelay && this.isAlive;
    }
    
    shoot() {
        if (!this.canShoot()) return null;
        
        this.lastShotTime = Date.now();
        
        const bullets = [];
        
        switch(this.weaponType) {
            case 'missile':
                // Missile weapon
                bullets.push({
                    x: this.x + this.width/2,
                    y: this.y,
                    width: 4,
                    height: 8,
                    speed: 8,
                    damage: 2,
                    type: 'missile',
                    angle: 0
                });
                break;
                
            case 'double':
                // Double shot
                bullets.push({
                    x: this.x + this.width/4,
                    y: this.y,
                    width: 6,
                    height: 6,
                    speed: 6,
                    damage: 1,
                    type: 'double',
                    angle: 0
                });
                bullets.push({
                    x: this.x + this.width * 3/4,
                    y: this.y,
                    width: 6,
                    height: 6,
                    speed: 6,
                    damage: 1,
                    type: 'double',
                    angle: 0
                });
                break;
                
            case 'laser':
                // Laser weapon
                bullets.push({
                    x: this.x + this.width/2,
                    y: this.y,
                    width: 2,
                    height: 16,
                    speed: 10,
                    damage: 1,
                    type: 'laser',
                    angle: 0
                });
                break;
                
            default:
                // Normal shot
                bullets.push({
                    x: this.x + this.width/2,
                    y: this.y,
                    width: 4,
                    height: 8,
                    speed: 8,
                    damage: 1,
                    type: 'normal',
                    angle: 0
                });
                break;
        }
        
        // Add option shots if available
        this.options.forEach(option => {
            bullets.push({
                x: option.x + this.width/2,
                y: option.y,
                width: 4,
                height: 8,
                speed: 8,
                damage: 1,
                type: 'normal',
                angle: 0
            });
        });
        
        return bullets;
    }
    
    takeDamage(damage) {
        if (this.invulnerable || this.hasShield) return false;
        
        this.health = Math.max(0, this.health - damage);
        
        if (this.health <= 0) {
            this.die();
        } else {
            this.makeInvulnerable();
        }
        
        return this.health <= 0;
    }
    
    die() {
        this.isAlive = false;
        console.log('Player destroyed');
    }
    
    respawn() {
        this.x = 100;
        this.y = 400;
        this.health = this.maxHealth;
        this.isAlive = true;
        this.invulnerable = false;
        this.options = [];
        this.resetWeapons();
    }
    
    makeInvulnerable() {
        this.invulnerable = true;
        this.invulnerabilityTime = this.invulnerabilityDuration;
    }
    
    resetWeapons() {
        this.weaponType = 'normal';
        this.hasSpeed = false;
        this.hasMissile = false;
        this.hasDouble = false;
        this.hasLaser = false;
        this.hasShield = false;
    }
    
    addOption() {
        if (this.options.length < this.maxOptions) {
            this.options.push({ x: this.x + 30, y: this.y });
        }
    }
    
    validatePosition() {
        this.x = this.clampPosition(this.x, 'x');
        this.y = this.clampPosition(this.y, 'y');
    }
    
    clampPosition(value, axis) {
        const margin = 20;
        const maxValue = axis === 'x' ? window.innerWidth - this.width - margin : window.innerHeight - this.height - margin;
        const minValue = margin;
        
        return Math.max(minValue, Math.min(maxValue, value));
    }
    
    resetToSafeState() {
        this.x = 100;
        this.y = 400;
        this.health = Math.max(1, this.health);
        this.invulnerable = false;
        this.options = [];
    }
    
    // Draw method for rendering the player
    draw(ctx) {
        if (!this.isAlive) return;
        
        ctx.save();
        
        // Apply invulnerability flash effect
        if (this.invulnerable) {
            const flashAlpha = 0.5 + 0.5 * Math.sin(Date.now() / 100);
            ctx.globalAlpha = flashAlpha;
        }
        
        // Draw player ship (Gradius-style)
        ctx.fillStyle = '#44aaff';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Draw ship details
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(this.x + 5, this.y + 5, this.width - 10, this.height - 10);
        
        // Draw shield if active
        if (this.hasShield) {
            ctx.strokeStyle = '#44ff44';
            ctx.lineWidth = 2;
            ctx.strokeRect(this.x - 5, this.y - 5, this.width + 10, this.height + 10);
        }
        
        // Draw options (drones)
        this.options.forEach(option => {
            ctx.fillStyle = '#ffaa44';
            ctx.fillRect(option.x, option.y, this.width/2, this.height/2);
        });
        
        ctx.restore();
    }
    
    getState() {
        return {
            position: { x: this.x, y: this.y },
            health: this.health,
            weaponType: this.weaponType,
            isAlive: this.isAlive,
            invulnerable: this.invulnerable,
            options: this.options.length,
            hasSpeed: this.hasSpeed,
            hasMissile: this.hasMissile,
            hasDouble: this.hasDouble,
            hasLaser: this.hasLaser,
            hasShield: this.hasShield
        };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Player;
} 