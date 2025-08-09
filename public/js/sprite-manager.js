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
            // Player ships (Gradius-style Vic Viper ships)
            'player-fighter': 'assets/sprites/player/fighter-01.png',
            'player-interceptor': 'assets/sprites/player/fighter-02.png',
            'player-destroyer': 'assets/sprites/player/fighter-03.png',
            
            // Enemy ships (actual sprite images)
            'enemy-basic': 'assets/sprites/enemies/basic-enemy.png',
            'enemy-fast': 'assets/sprites/enemies/fast-enemy.png',
            'enemy-tank': 'assets/sprites/enemies/tank-enemy.png',
            'enemy-boss': 'assets/sprites/enemies/boss-enemy.png',
            
            // Weapons (using emoji as fallback)
            'weapon-laser': '⚡',
            'weapon-missile': '🚀',
            'weapon-plasma': '💫',
            'weapon-spread': '🎯',
            
            // Effects (using emoji as fallback)
            'effect-explosion': '💥',
            'effect-shield': '🛡️',
            'effect-powerup': '⭐'
        };

        this.totalSprites = Object.keys(spriteList).length;
        
        for (const [name, path] of Object.entries(spriteList)) {
            if (path.startsWith('assets/')) {
                this.loadImageSprite(name, path);
            } else {
                this.loadEmojiSprite(name, path);
            }
        }
    }

    // Load image sprite
    loadImageSprite(name, path) {
        const img = new Image();
        img.onload = () => {
            this.loadedSprites++;
            console.log(`✅ Loaded image sprite: ${name} (${this.loadedSprites}/${this.totalSprites})`);
            
            if (this.loadedSprites === this.totalSprites) {
                console.log('🎯 All sprites loaded successfully!');
                if (this.onAllSpritesLoaded) {
                    this.onAllSpritesLoaded();
                }
            }
        };
        
        img.onerror = () => {
            console.warn(`⚠️ Failed to load image sprite: ${name}, using fallback`);
            this.loadEmojiSprite(name, this.getEmojiFallback(name));
        };
        
        img.src = path;
        this.sprites[name] = img;
    }

    // Load emoji as sprite
    loadEmojiSprite(name, emoji) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 64;
        canvas.height = 64;
        
        ctx.font = '48px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(emoji, 32, 32);
        
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

    // Get emoji fallback for sprites
    getEmojiFallback(name) {
        const fallbacks = {
            'player-fighter': '🛸', // Flying saucer for Gradius-like ship
            'player-interceptor': '🚀', // Rocket for interceptor
            'player-destroyer': '🛰️', // Satellite for destroyer
            'enemy-basic': '👾',
            'enemy-fast': '🤖',
            'enemy-tank': '🦾',
            'enemy-boss': '👹'
        };
        return fallbacks[name] || '⭐';
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
