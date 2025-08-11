// 🚀 Sprite Integration Example for Kaden & Adelynn Adventures
// This file shows how to integrate free spaceship sprites into your game

class SpriteManager {
    constructor() {
        this.sprites = {};
        this.loadedSprites = 0;
        this.totalSprites = 0;
    }

    // Load all sprites for the game
    loadSprites() {
        const spriteList = {
            // Player ships
            'player-fighter': 'assets/sprites/player/fighter-01.png',
            'player-interceptor': 'assets/sprites/player/fighter-02.png',
            'player-destroyer': 'assets/sprites/player/fighter-03.png',
            
            // Enemy ships
            'enemy-basic': 'assets/sprites/enemies/basic-enemy.png',
            'enemy-fast': 'assets/sprites/enemies/fast-enemy.png',
            'enemy-tank': 'assets/sprites/enemies/tank-enemy.png',
            'enemy-boss': 'assets/sprites/enemies/boss-enemy.png',
            
            // Weapons
            'weapon-laser': 'assets/sprites/weapons/laser.png',
            'weapon-missile': 'assets/sprites/weapons/missile.png',
            'weapon-plasma': 'assets/sprites/weapons/plasma.png',
            
            // Effects
            'effect-explosion': 'assets/sprites/effects/explosion.png',
            'effect-shield': 'assets/sprites/effects/shield.png',
            'effect-powerup': 'assets/sprites/effects/powerup.png'
        };

        this.totalSprites = Object.keys(spriteList).length;
        
        for (const [name, path] of Object.entries(spriteList)) {
            this.loadSprite(name, path);
        }
    }

    // Load individual sprite
    loadSprite(name, path) {
        const img = new Image();
        img.onload = () => {
            this.loadedSprites++;
            console.log(`✅ Loaded sprite: ${name} (${this.loadedSprites}/${this.totalSprites})`);
            
            if (this.loadedSprites === this.totalSprites) {
                console.log('🎯 All sprites loaded successfully!');
                this.onAllSpritesLoaded();
            }
        };
        
        img.onerror = () => {
            console.warn(`⚠️ Failed to load sprite: ${name} from ${path}`);
            this.loadedSprites++;
        };
        
        img.src = path;
        this.sprites[name] = img;
    }

    // Get sprite by name
    getSprite(name) {
        return this.sprites[name] || null;
    }

    // Check if sprite is loaded
    isSpriteLoaded(name) {
        const sprite = this.sprites[name];
        return sprite && sprite.complete;
    }

    // Callback when all sprites are loaded
    onAllSpritesLoaded() {
        // Trigger game start or sprite-ready event
        if (window.game && window.game.onSpritesLoaded) {
            window.game.onSpritesLoaded();
        }
    }
}

// Enhanced Space Shooter with Sprite Support
class EnhancedSpaceShooterWithSprites extends EnhancedSpaceShooter {
    constructor() {
        super();
        this.spriteManager = new SpriteManager();
        this.useSprites = true;
        this.spriteScale = 1.0;
    }

    // Initialize sprites
    initSprites() {
        console.log('🎨 Initializing sprites...');
        this.spriteManager.loadSprites();
    }

    // Override player rendering to use sprites
    renderPlayer() {
        if (this.useSprites && this.spriteManager.isSpriteLoaded('player-fighter')) {
            this.renderPlayerSprite();
        } else {
            // Fallback to original geometric rendering
            super.renderPlayer();
        }
    }

    // Render player with sprite
    renderPlayerSprite() {
        const sprite = this.spriteManager.getSprite('player-fighter');
        if (sprite) {
            this.ctx.save();
            
            // Apply screen shake
            if (this.screenShake > 0) {
                const shakeX = (Math.random() - 0.5) * this.screenShake;
                const shakeY = (Math.random() - 0.5) * this.screenShake;
                this.ctx.translate(shakeX, shakeY);
            }

            // Draw sprite
            this.ctx.drawImage(
                sprite,
                this.player.x,
                this.player.y,
                this.player.width,
                this.player.height
            );

            // Draw shield effect if active
            if (this.player.shield > 0) {
                this.renderShieldEffect();
            }

            this.ctx.restore();
        }
    }

    // Override enemy rendering to use sprites
    renderEnemy(enemy) {
        if (this.useSprites) {
            const spriteName = this.getEnemySpriteName(enemy.type);
            if (this.spriteManager.isSpriteLoaded(spriteName)) {
                this.renderEnemySprite(enemy, spriteName);
            } else {
                // Fallback to original geometric rendering
                super.renderEnemy(enemy);
            }
        } else {
            super.renderEnemy(enemy);
        }
    }

    // Get enemy sprite name based on type
    getEnemySpriteName(enemyType) {
        const spriteMap = {
            'basic': 'enemy-basic',
            'fast': 'enemy-fast',
            'tank': 'enemy-tank',
            'boss': 'enemy-boss',
            'shooter': 'enemy-basic',
            'bomber': 'enemy-tank'
        };
        return spriteMap[enemyType] || 'enemy-basic';
    }

    // Render enemy with sprite
    renderEnemySprite(enemy, spriteName) {
        const sprite = this.spriteManager.getSprite(spriteName);
        if (sprite) {
            this.ctx.save();
            
            // Apply screen shake
            if (this.screenShake > 0) {
                const shakeX = (Math.random() - 0.5) * this.screenShake;
                const shakeY = (Math.random() - 0.5) * this.screenShake;
                this.ctx.translate(shakeX, shakeY);
            }

            // Draw sprite
            this.ctx.drawImage(
                sprite,
                enemy.x,
                enemy.y,
                enemy.width,
                enemy.height
            );

            this.ctx.restore();
        }
    }

    // Render weapon effects with sprites
    renderBullet(bullet) {
        if (this.useSprites && this.spriteManager.isSpriteLoaded('weapon-laser')) {
            this.renderBulletSprite(bullet);
        } else {
            super.renderBullet(bullet);
        }
    }

    // Render bullet with sprite
    renderBulletSprite(bullet) {
        const spriteName = this.getBulletSpriteName(bullet.type);
        const sprite = this.spriteManager.getSprite(spriteName);
        
        if (sprite) {
            this.ctx.save();
            
            // Apply screen shake
            if (this.screenShake > 0) {
                const shakeX = (Math.random() - 0.5) * this.screenShake;
                const shakeY = (Math.random() - 0.5) * this.screenShake;
                this.ctx.translate(shakeX, shakeY);
            }

            // Draw sprite
            this.ctx.drawImage(
                sprite,
                bullet.x,
                bullet.y,
                bullet.width,
                bullet.height
            );

            this.ctx.restore();
        }
    }

    // Get bullet sprite name based on type
    getBulletSpriteName(bulletType) {
        const spriteMap = {
            'basic': 'weapon-laser',
            'plasma': 'weapon-plasma',
            'missile': 'weapon-missile',
            'laser': 'weapon-laser',
            'spread': 'weapon-laser'
        };
        return spriteMap[bulletType] || 'weapon-laser';
    }

    // Render explosion with sprite
    renderExplosion(explosion) {
        if (this.useSprites && this.spriteManager.isSpriteLoaded('effect-explosion')) {
            this.renderExplosionSprite(explosion);
        } else {
            super.renderExplosion(explosion);
        }
    }

    // Render explosion with sprite
    renderExplosionSprite(explosion) {
        const sprite = this.spriteManager.getSprite('effect-explosion');
        if (sprite) {
            this.ctx.save();
            
            // Apply screen shake
            if (this.screenShake > 0) {
                const shakeX = (Math.random() - 0.5) * this.screenShake;
                const shakeY = (Math.random() - 0.5) * this.screenShake;
                this.ctx.translate(shakeX, shakeY);
            }

            // Scale explosion based on size
            const scale = explosion.size / 50;
            const scaledWidth = sprite.width * scale;
            const scaledHeight = sprite.height * scale;

            // Draw sprite
            this.ctx.drawImage(
                sprite,
                explosion.x - scaledWidth/2,
                explosion.y - scaledHeight/2,
                scaledWidth,
                scaledHeight
            );

            this.ctx.restore();
        }
    }

    // Toggle sprite usage
    toggleSprites() {
        this.useSprites = !this.useSprites;
        console.log(`🎨 Sprites ${this.useSprites ? 'enabled' : 'disabled'}`);
    }

    // Get sprite loading progress
    getSpriteLoadingProgress() {
        if (this.spriteManager.totalSprites === 0) return 1;
        return this.spriteManager.loadedSprites / this.spriteManager.totalSprites;
    }
}

// Usage example:
/*
// In your main game initialization:
const game = new EnhancedSpaceShooterWithSprites();

// Initialize sprites
game.initSprites();

// Check if sprites are loaded before starting game
if (game.getSpriteLoadingProgress() === 1) {
    game.startGame();
} else {
    // Show loading screen
    game.showLoadingScreen();
}

// Toggle sprites on/off (for debugging)
document.addEventListener('keydown', (e) => {
    if (e.code === 'KeyS') {
        game.toggleSprites();
    }
});
*/
