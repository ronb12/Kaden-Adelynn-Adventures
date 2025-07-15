class EnemyManager {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.enemies = [];
        this.spawnTimer = 0;
        this.spawnInterval = 2000;
        this.maxEnemies = 10;
        this.level = 1;
        
        // Gradius-style enemy formations
        this.formationPatterns = {
            line: (x, y) => {
                for (let i = 0; i < 5; i++) {
                    this.spawnEnemy('scout', x + i * 60, y);
                }
            },
            v: (x, y) => {
                for (let i = 0; i < 3; i++) {
                    this.spawnEnemy('fighter', x + i * 40, y + i * 20);
                    this.spawnEnemy('fighter', x + i * 40, y - i * 20);
                }
            },
            circle: (x, y) => {
                for (let i = 0; i < 6; i++) {
                    const angle = (i * Math.PI * 2) / 6;
                    const enemyX = x + Math.cos(angle) * 50;
                    const enemyY = y + Math.sin(angle) * 50;
                    this.spawnEnemy('scout', enemyX, enemyY);
                }
            },
            wave: (x, y) => {
                for (let i = 0; i < 4; i++) {
                    this.spawnEnemy('fighter', x + i * 50, y + Math.sin(i) * 30);
                }
            }
        };
        
        this.currentFormation = 0;
        this.formationTimer = 0;
        this.formationInterval = 5000;
    }

    update(delta) {
        this.spawnTimer += delta;
        this.formationTimer += delta;
        
        // Spawn enemies based on timer
        if (this.spawnTimer >= this.spawnInterval) {
            this.spawnEnemyFormation();
            this.spawnTimer = 0;
        }
        
        // Update all enemies
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            enemy.update(delta);
            
            // Remove enemies that are off screen
            if (enemy.isOffScreen()) {
                this.enemies.splice(i, 1);
            }
        }
        
        // Check collisions with player
        this.checkCollisions();
    }

    spawnEnemyFormation() {
        if (this.enemies.length >= this.maxEnemies) return;
        
        const patterns = Object.keys(this.formationPatterns);
        const pattern = patterns[this.currentFormation % patterns.length];
        const formation = this.formationPatterns[pattern];
        
        // Spawn formation from right side of screen (Gradius-style)
        const x = this.canvas.width + 50; // Start off-screen to the right
        const y = Math.random() * (this.canvas.height - 100) + 50;
        
        formation(x, y);
        
        this.currentFormation++;
    }

    spawnEnemy(type = 'scout', x = 0, y = 0) {
        if (this.enemies.length >= this.maxEnemies) return null;
        
        const enemy = new Enemy(type, x, y);
        enemy.activate();
        this.enemies.push(enemy);
        
        return enemy;
    }

    checkCollisions() {
        if (!window.player || !window.player.isAlive) return;
        
        this.enemies.forEach(enemy => {
            if (enemy.isAlive && this.isColliding(window.player, enemy)) {
                // Player hit enemy
                enemy.takeDamage(1);
                if (!enemy.isAlive) {
                    // Add score
                    if (window.levelManager) {
                        window.levelManager.addScore(enemy.score);
                    }
                }
            }
        });
        
        // Check bullet collisions
        if (window.gameState.bullets) {
            for (let i = window.gameState.bullets.length - 1; i >= 0; i--) {
                const bullet = window.gameState.bullets[i];
                
                this.enemies.forEach(enemy => {
                    if (enemy.isAlive && this.isColliding(bullet, enemy)) {
                        // Bullet hit enemy
                        enemy.takeDamage(bullet.damage || 1);
                        window.gameState.bullets.splice(i, 1);
                        
                        if (!enemy.isAlive) {
                            // Add score
                            if (window.levelManager) {
                                window.levelManager.addScore(enemy.score);
                            }
                        }
                    }
                });
            }
        }
    }

    isColliding(obj1, obj2) {
        return obj1.x < obj2.x + obj2.width &&
               obj1.x + obj1.width > obj2.x &&
               obj1.y < obj2.y + obj2.height &&
               obj1.y + obj1.height > obj2.y;
    }

    clearAll() {
        this.enemies = [];
    }

    draw(ctx) {
        this.enemies.forEach(enemy => {
            if (enemy.isAlive) {
                enemy.draw(ctx);
            }
        });
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EnemyManager;
} 