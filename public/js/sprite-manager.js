// Sprite Manager for Kaden & Adelynn Adventures
class SpriteManager {
    constructor() {
        this.sprites = {};
        this.loadedSprites = 0;
        this.totalSprites = 0;
        this.onAllSpritesLoaded = null;
    }

    // Load all sprites for the game
    loadSprites() {
        const spriteList = {
            // Player ships (using emoji as fallback)
            'player-fighter': '🚀',
            'player-interceptor': '🛸',
            'player-destroyer': '🛰️',
            
            // Enemy ships (using emoji as fallback)
            'enemy-basic': '👾',
            'enemy-fast': '🤖',
            'enemy-tank': '🦾',
            'enemy-boss': '👹',
            
            // Weapons (using emoji as fallback)
            'weapon-laser': '⚡',
            'weapon-missile': '🚀',
            'weapon-plasma': '💫',
            
            // Effects (using emoji as fallback)
            'effect-explosion': '💥',
            'effect-shield': '🛡️',
            'effect-powerup': '⭐'
        };

        this.totalSprites = Object.keys(spriteList).length;
        
        for (const [name, emoji] of Object.entries(spriteList)) {
            this.loadEmojiSprite(name, emoji);
        }
    }

    // Load emoji as sprite
    loadEmojiSprite(name, emoji) {
        // Create a canvas to convert emoji to image
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 64;
        canvas.height = 64;
        
        // Set font and draw emoji
        ctx.font = '48px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(emoji, 32, 32);
        
        // Convert to image
        const img = new Image();
        img.onload = () => {
            this.loadedSprites++;
            console.log(`✅ Loaded emoji sprite: ${name} (${emoji}) (${this.loadedSprites}/${this.totalSprites})`);
            
            if (this.loadedSprites === this.totalSprites) {
                console.log('🎯 All sprites loaded successfully!');
                if (this.onAllSpritesLoaded) {
                    this.onAllSpritesLoaded();
                }
            }
        };
        
        img.onerror = () => {
            console.warn(`⚠️ Failed to load emoji sprite: ${name}`);
            this.loadedSprites++;
        };
        
        img.src = canvas.toDataURL();
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

    // Draw sprite with fallback
    drawSprite(ctx, name, x, y, width, height) {
        const sprite = this.getSprite(name);
        if (sprite && this.isSpriteLoaded(name)) {
            ctx.drawImage(sprite, x, y, width, height);
            return true;
        }
        return false;
    }
}
