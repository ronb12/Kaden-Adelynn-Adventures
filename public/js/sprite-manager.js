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
            // Player ships (Gradius-style Vic Viper ships) - Base64 encoded as fallback
            'player-fighter': this.generateGradiusSpriteData('#00ffff'),
            'player-interceptor': this.generateGradiusSpriteData('#00ff00'),
            'player-destroyer': this.generateGradiusSpriteData('#ff00ff'),
            
            // Enemy ships (Base64 encoded as fallback)
            'enemy-basic': this.generateEnemySpriteData('#ff0000', 'basic'),
            'enemy-fast': this.generateEnemySpriteData('#ff6600', 'fast'),
            'enemy-tank': this.generateEnemySpriteData('#660066', 'tank'),
            'enemy-boss': this.generateEnemySpriteData('#ff0066', 'boss'),
            
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
        
        for (const [name, data] of Object.entries(spriteList)) {
            if (typeof data === 'string' && data.startsWith('data:image')) {
                this.loadBase64Sprite(name, data);
            } else if (typeof data === 'string' && !data.startsWith('data:')) {
                this.loadEmojiSprite(name, data);
            } else {
                this.loadImageSprite(name, data);
            }
        }
    }

    // Generate Gradius-style sprite as base64 data
    generateGradiusSpriteData(color = '#00ffff') {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 64;
        canvas.height = 64;
        
        // Gradius Vic Viper ship design
        const shipColor = color;
        const accentColor = '#ffffff';
        const cockpitColor = '#87ceeb';
        const engineColor = '#ff6600';
        const cockpitDetailColor = '#000080';
        
        // Main body - nose cone
        ctx.fillStyle = shipColor;
        ctx.beginPath();
        ctx.moveTo(32, 8);
        ctx.lineTo(28, 16);
        ctx.lineTo(36, 16);
        ctx.closePath();
        ctx.fill();
        
        // Main body - fuselage
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
        
        // Wings
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
        
        // Engine details
        ctx.fillStyle = engineColor;
        ctx.fillRect(26, 44, 3, 8);
        ctx.fillRect(35, 44, 3, 8);
        
        // Cockpit
        ctx.fillStyle = cockpitColor;
        ctx.beginPath();
        ctx.ellipse(32, 28, 6, 4, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Cockpit details
        ctx.fillStyle = cockpitDetailColor;
        ctx.beginPath();
        ctx.ellipse(32, 28, 3, 2, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Ship details
        ctx.fillStyle = accentColor;
        ctx.fillRect(31, 10, 2, 4);
        
        ctx.beginPath();
        ctx.moveTo(32, 16);
        ctx.lineTo(32, 48);
        ctx.strokeStyle = accentColor;
        ctx.lineWidth = 1;
        ctx.stroke();
        
        ctx.fillStyle = accentColor;
        ctx.fillRect(30, 36, 4, 2);
        ctx.fillRect(30, 42, 4, 2);
        
        return canvas.toDataURL();
    }

    // Generate enemy sprite as base64 data
    generateEnemySpriteData(color, type) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 64;
        canvas.height = 64;
        
        ctx.fillStyle = color;
        ctx.beginPath();
        
        switch(type) {
            case 'basic':
                ctx.moveTo(32, 56);
                ctx.lineTo(44, 16);
                ctx.lineTo(40, 16);
                ctx.lineTo(32, 48);
                ctx.lineTo(24, 48);
                ctx.lineTo(20, 16);
                ctx.lineTo(16, 16);
                ctx.closePath();
                break;
            case 'fast':
                ctx.moveTo(32, 56);
                ctx.lineTo(40, 16);
                ctx.lineTo(36, 16);
                ctx.lineTo(32, 48);
                ctx.lineTo(28, 48);
                ctx.lineTo(24, 16);
                ctx.lineTo(20, 16);
                ctx.closePath();
                break;
            case 'tank':
                ctx.moveTo(32, 56);
                ctx.lineTo(48, 16);
                ctx.lineTo(44, 16);
                ctx.lineTo(36, 48);
                ctx.lineTo(28, 48);
                ctx.lineTo(20, 16);
                ctx.lineTo(16, 16);
                ctx.closePath();
                break;
            case 'boss':
                ctx.moveTo(32, 56);
                ctx.lineTo(56, 16);
                ctx.lineTo(52, 16);
                ctx.lineTo(40, 48);
                ctx.lineTo(24, 48);
                ctx.lineTo(12, 16);
                ctx.lineTo(8, 16);
                ctx.closePath();
                break;
        }
        
        ctx.fill();
        
        // Enemy cockpit
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.ellipse(32, 32, 3, 2, 0, 0, Math.PI * 2);
        ctx.fill();
        
        return canvas.toDataURL();
    }

    // Load base64 sprite
    loadBase64Sprite(name, base64Data) {
        const img = new Image();
        img.onload = () => {
            this.loadedSprites++;
            console.log(`✅ Loaded base64 sprite: ${name} (${this.loadedSprites}/${this.totalSprites})`);
            
            if (this.loadedSprites === this.totalSprites) {
                console.log('🎯 All sprites loaded successfully!');
                if (this.onAllSpritesLoaded) {
                    this.onAllSpritesLoaded();
                }
            }
        };
        
        img.onerror = () => {
            console.warn(`⚠️ Failed to load base64 sprite: ${name}`);
            this.loadedSprites++;
        };
        
        img.src = base64Data;
        this.sprites[name] = img;
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
