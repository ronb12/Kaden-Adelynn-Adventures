// AI Control Module
let game;
let aiMode = false;
let aiDifficulty = 'normal';

function enableAIMode() {
    aiMode = true;
    document.getElementById('aiControls').style.display = 'block';
    console.log('AI Mode enabled');
}

function disableAIMode() {
    aiMode = false;
    document.getElementById('aiControls').style.display = 'none';
    console.log('AI Mode disabled');
}

function aiControl() {
    if (!aiMode || !game || game.gameState !== 'playing') return;
    
    // Get current game state
    const player = game.player;
    const enemies = game.enemies;
    const bullets = game.bullets;
    const powerups = game.powerups;
    
    // Find closest enemy
    let closestEnemy = null;
    let closestDistance = Infinity;
    
    for (const enemy of enemies) {
        const distance = Math.sqrt(
            Math.pow(enemy.x - player.x, 2) + Math.pow(enemy.y - player.y, 2)
        );
        if (distance < closestDistance) {
            closestDistance = distance;
            closestEnemy = enemy;
        }
    }
    
    // Find dangerous enemies (close to player)
    const dangerousEnemies = enemies.filter(enemy => {
        const distance = Math.sqrt(
            Math.pow(enemy.x - player.x, 2) + Math.pow(enemy.y - player.y, 2)
        );
        return distance < 150;
    });
    
    // Find enemies on screen
    const enemiesOnScreen = enemies.filter(enemy => enemy.y > -40);
    
    // AI Movement Logic
    if (closestEnemy) {
        // Move towards or away from closest enemy based on situation
        const targetX = closestEnemy.x;
        const targetY = closestEnemy.y;
        
        // Calculate movement direction
        let moveX = 0;
        let moveY = 0;
        
        if (dangerousEnemies.length > 0) {
            // Evasive maneuvers when in danger
            const dangerCenterX = dangerousEnemies.reduce((sum, e) => sum + e.x, 0) / dangerousEnemies.length;
            const dangerCenterY = dangerousEnemies.reduce((sum, e) => sum + e.y, 0) / dangerousEnemies.length;
            
            // Move away from danger center
            moveX = player.x > dangerCenterX ? 1 : -1;
            moveY = player.y > dangerCenterY ? 1 : -1;
        } else if (closestEnemy.y < player.y - 100) {
            // Enemy is above, move towards it
            moveX = targetX > player.x ? 1 : -1;
            moveY = -1;
        } else {
            // Enemy is close, maintain distance
            const idealDistance = 200;
            const currentDistance = Math.sqrt(
                Math.pow(targetX - player.x, 2) + Math.pow(targetY - player.y, 2)
            );
            
            if (currentDistance < idealDistance) {
                // Too close, move away
                moveX = player.x > targetX ? 1 : -1;
                moveY = player.y > targetY ? 1 : -1;
            } else {
                // Too far, move closer
                moveX = targetX > player.x ? 1 : -1;
                moveY = targetY > player.y ? 1 : -1;
            }
        }
        
        // Apply movement
        if (moveX > 0 && player.x < game.canvas.width - player.width) {
            player.x += player.speed;
        } else if (moveX < 0 && player.x > 0) {
            player.x -= player.speed;
        }
        
        if (moveY > 0 && player.y < game.canvas.height - player.height) {
            player.y += player.speed;
        } else if (moveY < 0 && player.y > 0) {
            player.y -= player.speed;
        }
    }
    
    // AI Shooting Logic
    if (dangerousEnemies.length > 0) {
        // High priority shooting when in danger
        if (Math.random() < 0.95) { // 95% chance to shoot when in danger
            game.shoot();
        }
    } else if (enemiesOnScreen.length > 0) {
        // Normal engagement with enemies on screen
        if (Math.random() < 0.85) { // 85% chance to shoot when enemies are on screen
            game.shoot();
        }
    } else if (closestEnemy && closestEnemy.y > -40) {
        // Light engagement with approaching enemies
        if (Math.random() < 0.4) { // 40% chance to shoot at approaching enemies
            game.shoot();
        }
    }
    
    // AI Powerup Collection
    for (const powerup of powerups) {
        const distance = Math.sqrt(
            Math.pow(powerup.x - player.x, 2) + Math.pow(powerup.y - player.y, 2)
        );
        
        if (distance < 100) {
            // Move towards powerup
            const moveX = powerup.x > player.x ? 1 : -1;
            const moveY = powerup.y > player.y ? 1 : -1;
            
            if (moveX > 0 && player.x < game.canvas.width - player.width) {
                player.x += player.speed;
            } else if (moveX < 0 && player.x > 0) {
                player.x -= player.speed;
            }
            
            if (moveY > 0 && player.y < game.canvas.height - player.height) {
                player.y += player.speed;
            } else if (moveY < 0 && player.y > 0) {
                player.y -= player.speed;
            }
        }
    }
    
    // AI Weapon Selection
    if (enemies.length > 5) {
        // Many enemies, use spread weapon
        if (game.currentWeapon !== 'spread') {
            game.currentWeapon = 'spread';
        }
    } else if (dangerousEnemies.length > 0) {
        // Dangerous situation, use plasma or laser
        if (game.currentWeapon !== 'plasma' && game.currentWeapon !== 'laser') {
            game.currentWeapon = Math.random() < 0.5 ? 'plasma' : 'laser';
        }
    } else if (closestEnemy && closestEnemy.type === 'boss') {
        // Boss enemy, use missile if available
        if (game.currentWeapon !== 'missile' && player.missiles > 0) {
            game.currentWeapon = 'missile';
        }
    }
}

// Export functions for use in other modules
window.enableAIMode = enableAIMode;
window.disableAIMode = disableAIMode;
window.aiControl = aiControl;
