class PowerUpManager {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.powerUps = [];
        this.spawnTimer = 0;
        this.spawnRate = 5; // seconds between power-up spawns
        
        // Enhanced power-up types
        this.powerUpTypes = [
            'health', 'speed', 'weapon', 'shield', 'multiplier',
            'rapid_fire', 'spread_weapon', 'beam_weapon', 'charge_weapon',
            'coin', 'star', 'gem', 'mystery_box', 'shield_boost', 'heat_cool'
        ];
        
        // Power-up weights (rarity)
        this.powerUpWeights = {
            health: 15,
            speed: 12,
            weapon: 10,
            shield: 8,
            multiplier: 5,
            rapid_fire: 8,
            spread_weapon: 6,
            beam_weapon: 4,
            charge_weapon: 4,
            coin: 20,
            star: 15,
            gem: 10,
            mystery_box: 12,
            shield_boost: 8,
            heat_cool: 6
        };
    }
    
    update(dt) {
        // Spawn power-ups
        this.spawnTimer += dt;
        if (this.spawnTimer >= this.spawnRate) {
            this.spawnPowerUp();
            this.spawnTimer = 0;
        }
        
        // Update power-ups
        for (let i = this.powerUps.length - 1; i >= 0; i--) {
            const powerUp = this.powerUps[i];
            powerUp.x -= powerUp.speed * dt;
            
            // Add floating animation
            powerUp.y += Math.sin(Date.now() * 0.003 + powerUp.id) * 0.5;
            
            // Remove if off screen
            if (powerUp.x + powerUp.width < 0) {
                this.powerUps.splice(i, 1);
            }
        }
        
        // Check collision with player
        if (window.player) {
            for (let i = this.powerUps.length - 1; i >= 0; i--) {
                const powerUp = this.powerUps[i];
                if (this.checkCollision(window.player, powerUp)) {
                    this.applyPowerUp(powerUp);
                    this.powerUps.splice(i, 1);
                }
            }
        }
    }
    
    spawnPowerUp() {
        const type = this.getRandomPowerUpType();
        
        const powerUp = {
            id: Math.random(),
            x: this.canvas.width,
            y: Math.random() * (this.canvas.height - 40),
            width: 32,
            height: 32,
            speed: 100,
            type: type,
            duration: this.getPowerUpDuration(type),
            value: this.getPowerUpValue(type)
        };
        this.powerUps.push(powerUp);
    }
    
    getRandomPowerUpType() {
        const totalWeight = Object.values(this.powerUpWeights).reduce((sum, weight) => sum + weight, 0);
        let random = Math.random() * totalWeight;
        
        for (const [type, weight] of Object.entries(this.powerUpWeights)) {
            random -= weight;
            if (random <= 0) {
                return type;
            }
        }
        
        return 'health'; // fallback
    }
    
    getPowerUpDuration(type) {
        const durations = {
            speed: 10000,
            multiplier: 15000,
            rapid_fire: 10000,
            spread_weapon: 20000,
            beam_weapon: 15000,
            charge_weapon: 25000,
            shield_boost: 12000,
            heat_cool: 8000
        };
        
        return durations[type] || 0;
    }
    
    getPowerUpValue(type) {
        const values = {
            coin: 10,
            star: 25,
            gem: 50,
            mystery_box: 100
        };
        
        return values[type] || 0;
    }
    
    checkCollision(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }
    
    applyPowerUp(powerUp) {
        console.log(`Collected power-up: ${powerUp.type}`);
        
        switch(powerUp.type) {
            case 'health':
                if (window.gameState.lives < 5) {
                    window.gameState.lives++;
                }
                break;
                
            case 'speed':
                if (window.player) {
                    window.player.addPowerUp({
                        type: 'speed',
                        duration: powerUp.duration
                    });
                }
                break;
                
            case 'weapon':
                if (window.player) {
                    window.player.upgradeWeapon();
                }
                break;
                
            case 'shield':
                if (window.player) {
                    window.player.shield = window.player.maxShield;
                }
                break;
                
            case 'multiplier':
                if (window.player) {
                    window.player.addPowerUp({
                        type: 'multiplier',
                        duration: powerUp.duration
                    });
                }
                break;
                
            case 'rapid_fire':
                if (window.player) {
                    window.player.activateRapidFire(powerUp.duration);
                }
                break;
                
            case 'spread_weapon':
                if (window.player) {
                    window.player.addPowerUp({
                        type: 'spread_weapon',
                        duration: powerUp.duration
                    });
                }
                break;
                
            case 'beam_weapon':
                if (window.player) {
                    window.player.addPowerUp({
                        type: 'beam_weapon',
                        duration: powerUp.duration
                    });
                }
                break;
                
            case 'charge_weapon':
                if (window.player) {
                    window.player.addPowerUp({
                        type: 'charge_weapon',
                        duration: powerUp.duration
                    });
                }
                break;
                
            case 'coin':
                window.gameState.money += powerUp.value;
                this.updateMoneyHUD();
                break;
                
            case 'star':
                window.gameState.money += powerUp.value;
                this.updateMoneyHUD();
                break;
                
            case 'gem':
                window.gameState.money += powerUp.value;
                this.updateMoneyHUD();
                break;
                
            case 'mystery_box':
                // Random power-up effect
                const randomEffects = ['health', 'speed', 'weapon', 'shield', 'rapid_fire'];
                const randomEffect = randomEffects[Math.floor(Math.random() * randomEffects.length)];
                this.applyPowerUp({ type: randomEffect, duration: 10000 });
                window.gameState.score += powerUp.value;
                break;
                
            case 'shield_boost':
                if (window.player) {
                    window.player.shield = Math.min(window.player.maxShield * 1.5, window.player.shield + 50);
                }
                break;
                
            case 'heat_cool':
                if (window.player) {
                    window.player.weaponHeat = 0;
                }
                break;
        }
    }
    
    draw(ctx) {
        for (let powerUp of this.powerUps) {
            // Draw power-up with enhanced visuals
            this.drawPowerUp(ctx, powerUp);
        }
    }
    
    drawPowerUp(ctx, powerUp) {
        const x = powerUp.x;
        const y = powerUp.y;
        const size = powerUp.width;
        
        // Add glow effect
        ctx.shadowColor = this.getPowerUpColor(powerUp.type);
        ctx.shadowBlur = 10;
        
        // Draw background circle
        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.arc(x + size/2, y + size/2, size/2, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw power-up icon
        ctx.fillStyle = this.getPowerUpColor(powerUp.type);
        ctx.shadowBlur = 0;
        
        switch(powerUp.type) {
            case 'health':
                this.drawHeart(ctx, x, y, size);
                break;
            case 'speed':
                this.drawLightning(ctx, x, y, size);
                break;
            case 'weapon':
                this.drawWeapon(ctx, x, y, size);
                break;
            case 'shield':
                this.drawShield(ctx, x, y, size);
                break;
            case 'multiplier':
                this.drawStar(ctx, x, y, size);
                break;
            case 'rapid_fire':
                this.drawRapidFire(ctx, x, y, size);
                break;
            case 'spread_weapon':
                this.drawSpreadWeapon(ctx, x, y, size);
                break;
            case 'beam_weapon':
                this.drawBeamWeapon(ctx, x, y, size);
                break;
            case 'charge_weapon':
                this.drawChargeWeapon(ctx, x, y, size);
                break;
            case 'coin':
                this.drawCoin(ctx, x, y, size);
                break;
            case 'star':
                this.drawStar(ctx, x, y, size);
                break;
            case 'gem':
                this.drawGem(ctx, x, y, size);
                break;
            case 'mystery_box':
                this.drawMysteryBox(ctx, x, y, size);
                break;
            case 'shield_boost':
                this.drawShieldBoost(ctx, x, y, size);
                break;
            case 'heat_cool':
                this.drawHeatCool(ctx, x, y, size);
                break;
        }
        
        // Reset shadow
        ctx.shadowBlur = 0;
    }
    
    getPowerUpColor(type) {
        const colors = {
            health: '#ff4444',
            speed: '#44ff44',
            weapon: '#4444ff',
            shield: '#44ffff',
            multiplier: '#ffff44',
            rapid_fire: '#ff8844',
            spread_weapon: '#ff44ff',
            beam_weapon: '#44ff88',
            charge_weapon: '#8844ff',
            coin: '#ffdd44',
            star: '#ffaa44',
            gem: '#44aaff',
            mystery_box: '#ffaa88',
            shield_boost: '#44ffaa',
            heat_cool: '#aaff44'
        };
        
        return colors[type] || '#ffffff';
    }
    
    // Drawing methods for different power-up types
    drawHeart(ctx, x, y, size) {
        ctx.fillStyle = '#ff4444';
        ctx.beginPath();
        ctx.moveTo(x + size/2, y + size/3);
        ctx.bezierCurveTo(x + size/2, y + size/4, x + size/3, y + size/4, x + size/3, y + size/3);
        ctx.bezierCurveTo(x + size/3, y + size/2, x + size/2, y + size*2/3, x + size/2, y + size*2/3);
        ctx.bezierCurveTo(x + size/2, y + size*2/3, x + size*2/3, y + size/2, x + size*2/3, y + size/3);
        ctx.bezierCurveTo(x + size*2/3, y + size/4, x + size/2, y + size/4, x + size/2, y + size/3);
        ctx.fill();
    }
    
    drawLightning(ctx, x, y, size) {
        ctx.fillStyle = '#44ff44';
        ctx.beginPath();
        ctx.moveTo(x + size/2, y + size/4);
        ctx.lineTo(x + size/3, y + size/2);
        ctx.lineTo(x + size/2, y + size/2);
        ctx.lineTo(x + size*2/3, y + size*3/4);
        ctx.fill();
    }
    
    drawWeapon(ctx, x, y, size) {
        ctx.fillStyle = '#4444ff';
        ctx.fillRect(x + size/3, y + size/4, size/3, size/2);
        ctx.fillRect(x + size/4, y + size/3, size/2, size/6);
    }
    
    drawShield(ctx, x, y, size) {
        ctx.fillStyle = '#44ffff';
        ctx.beginPath();
        ctx.arc(x + size/2, y + size/2, size/3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.arc(x + size/2, y + size/2, size/6, 0, Math.PI * 2);
        ctx.fill();
    }
    
    drawStar(ctx, x, y, size) {
        ctx.fillStyle = '#ffff44';
        const centerX = x + size/2;
        const centerY = y + size/2;
        const radius = size/3;
        
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
            const x1 = centerX + radius * Math.cos(angle);
            const y1 = centerY + radius * Math.sin(angle);
            
            if (i === 0) {
                ctx.moveTo(x1, y1);
            } else {
                ctx.lineTo(x1, y1);
            }
            
            const innerAngle = angle + Math.PI / 5;
            const x2 = centerX + radius * 0.5 * Math.cos(innerAngle);
            const y2 = centerY + radius * 0.5 * Math.sin(innerAngle);
            ctx.lineTo(x2, y2);
        }
        ctx.closePath();
        ctx.fill();
    }
    
    drawRapidFire(ctx, x, y, size) {
        ctx.fillStyle = '#ff8844';
        for (let i = 0; i < 3; i++) {
            ctx.fillRect(x + size/4 + i * size/6, y + size/3, size/8, size/3);
        }
    }
    
    drawSpreadWeapon(ctx, x, y, size) {
        ctx.fillStyle = '#ff44ff';
        ctx.fillRect(x + size/2 - 1, y + size/4, 2, size/2);
        ctx.fillRect(x + size/3, y + size/3, 2, size/3);
        ctx.fillRect(x + size*2/3, y + size/3, 2, size/3);
    }
    
    drawBeamWeapon(ctx, x, y, size) {
        ctx.fillStyle = '#44ff88';
        ctx.fillRect(x + size/3, y + size/4, size/3, size/2);
    }
    
    drawChargeWeapon(ctx, x, y, size) {
        ctx.fillStyle = '#8844ff';
        ctx.beginPath();
        ctx.arc(x + size/2, y + size/2, size/4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.arc(x + size/2, y + size/2, size/8, 0, Math.PI * 2);
        ctx.fill();
    }
    
    drawCoin(ctx, x, y, size) {
        ctx.fillStyle = '#ffdd44';
        ctx.beginPath();
        ctx.arc(x + size/2, y + size/2, size/3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#333';
        ctx.fillText('$', x + size/2 - 3, y + size/2 + 3);
    }
    
    drawGem(ctx, x, y, size) {
        ctx.fillStyle = '#44aaff';
        ctx.beginPath();
        ctx.moveTo(x + size/2, y + size/4);
        ctx.lineTo(x + size*3/4, y + size/2);
        ctx.lineTo(x + size/2, y + size*3/4);
        ctx.lineTo(x + size/4, y + size/2);
        ctx.closePath();
        ctx.fill();
    }
    
    drawMysteryBox(ctx, x, y, size) {
        ctx.fillStyle = '#ffaa88';
        ctx.fillRect(x + size/4, y + size/4, size/2, size/2);
        ctx.fillStyle = '#333';
        ctx.fillText('?', x + size/2 - 3, y + size/2 + 3);
    }
    
    drawShieldBoost(ctx, x, y, size) {
        ctx.fillStyle = '#44ffaa';
        ctx.beginPath();
        ctx.arc(x + size/2, y + size/2, size/3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#333';
        ctx.fillText('+', x + size/2 - 3, y + size/2 + 3);
    }
    
    drawHeatCool(ctx, x, y, size) {
        ctx.fillStyle = '#aaff44';
        ctx.beginPath();
        ctx.arc(x + size/2, y + size/2, size/3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#333';
        ctx.fillText('C', x + size/2 - 3, y + size/2 + 3);
    }

    updateMoneyHUD() {
        const moneyElement = document.getElementById('moneyAmount');
        if (moneyElement) {
            moneyElement.textContent = `💰: ${window.gameState.money}`;
        }
    }
} 