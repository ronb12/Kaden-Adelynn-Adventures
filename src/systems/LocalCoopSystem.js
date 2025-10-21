/**
 * Local Co-op Multiplayer System
 * 2-player same-screen cooperative gameplay
 */

export class CoopPlayer {
  constructor(id, controls, ship, startX, startY) {
    this.id = id; // 'player1' or 'player2'
    this.controls = controls; // Key mappings
    this.ship = ship; // Ship type
    this.x = startX;
    this.y = startY;
    this.width = 40;
    this.height = 40;
    this.health = 100;
    this.maxHealth = 100;
    this.lives = 25;
    this.score = 0;
    this.speed = 5;
    this.weapon = 'laser';
    this.powerUps = {
      multiShot: 0,
      rapidFire: 0,
      shield: 0,
      speed: 0
    };
    this.bullets = [];
    this.invincible = false;
    this.invincibleTime = 0;
    this.lastFireTime = 0;
    this.kills = 0;
    this.combo = 0;
    this.active = true;
  }

  /**
   * Update player position based on keys pressed
   */
  updatePosition(keys, canvasWidth, canvasHeight, deltaTime = 1) {
    const moveSpeed = this.speed * deltaTime;
    
    // Player 1 or Player 2 movement
    if (keys[this.controls.up] && this.y > 0) {
      this.y -= moveSpeed;
    }
    if (keys[this.controls.down] && this.y < canvasHeight - this.height) {
      this.y += moveSpeed;
    }
    if (keys[this.controls.left] && this.x > 0) {
      this.x -= moveSpeed;
    }
    if (keys[this.controls.right] && this.x < canvasWidth - this.width) {
      this.x += moveSpeed;
    }
    
    // Update invincibility
    if (this.invincible) {
      this.invincibleTime--;
      if (this.invincibleTime <= 0) {
        this.invincible = false;
      }
    }
  }

  /**
   * Fire weapon
   */
  fire(currentTime, fireRate = 150) {
    if (currentTime - this.lastFireTime < fireRate) return null;
    
    this.lastFireTime = currentTime;
    
    const bullet = {
      x: this.x + this.width / 2,
      y: this.y,
      width: 4,
      height: 10,
      speed: 8,
      damage: 10,
      color: this.id === 'player1' ? '#00ff00' : '#ff00ff',
      playerId: this.id
    };
    
    this.bullets.push(bullet);
    return bullet;
  }

  /**
   * Take damage
   */
  takeDamage(amount) {
    if (this.invincible) return false;
    
    this.health -= amount;
    
    if (this.health <= 0) {
      this.lives--;
      if (this.lives > 0) {
        this.respawn();
      } else {
        this.active = false;
      }
      return true; // Died
    }
    
    return false;
  }

  /**
   * Respawn player
   */
  respawn() {
    this.health = this.maxHealth;
    this.invincible = true;
    this.invincibleTime = 120; // 2 seconds at 60 FPS
    this.combo = 0;
  }

  /**
   * Add score
   */
  addScore(points) {
    this.score += points;
  }

  /**
   * Add kill
   */
  addKill() {
    this.kills++;
    this.combo++;
  }

  /**
   * Reset combo
   */
  resetCombo() {
    this.combo = 0;
  }

  /**
   * Draw player
   */
  draw(ctx) {
    if (!this.active) return;
    
    ctx.save();
    
    // Flicker when invincible
    if (this.invincible && Math.floor(this.invincibleTime / 10) % 2 === 0) {
      ctx.globalAlpha = 0.5;
    }
    
    // Player ship color
    const color = this.id === 'player1' ? '#0088ff' : '#ff0088';
    const glowColor = this.id === 'player1' ? '#00ccff' : '#ff00ff';
    
    // Ship glow
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = 15;
    
    // Draw ship (triangle)
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(this.x + this.width / 2, this.y);
    ctx.lineTo(this.x, this.y + this.height);
    ctx.lineTo(this.x + this.width, this.y + this.height);
    ctx.closePath();
    ctx.fill();
    
    // Draw player indicator
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(this.id === 'player1' ? 'P1' : 'P2', this.x + this.width / 2, this.y - 10);
    
    // Draw health bar
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(this.x, this.y + this.height + 5, this.width, 4);
    
    const healthPercent = this.health / this.maxHealth;
    ctx.fillStyle = healthPercent > 0.5 ? '#00ff00' : healthPercent > 0.25 ? '#ffaa00' : '#ff0000';
    ctx.fillRect(this.x, this.y + this.height + 5, this.width * healthPercent, 4);
    
    ctx.restore();
  }
}

export class LocalCoopSystem {
  constructor() {
    this.enabled = false;
    this.players = {};
    this.sharedEnemies = [];
    this.sharedScore = 0;
    this.friendlyFire = false;
    this.reviveEnabled = true;
    this.reviveTime = 300; // 5 seconds at 60 FPS
  }

  /**
   * Initialize co-op mode
   */
  initialize(canvasWidth, canvasHeight) {
    this.enabled = true;
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    
    // Player 1 - Left side (WASD + Space)
    this.players.player1 = new CoopPlayer(
      'player1',
      {
        up: 'w',
        down: 's',
        left: 'a',
        right: 'd',
        fire: ' '
      },
      'phoenixWing',
      canvasWidth * 0.33,
      canvasHeight - 100
    );
    
    // Player 2 - Right side (Arrow Keys + Enter)
    this.players.player2 = new CoopPlayer(
      'player2',
      {
        up: 'ArrowUp',
        down: 'ArrowDown',
        left: 'ArrowLeft',
        right: 'ArrowRight',
        fire: 'Enter'
      },
      'stellarArrow',
      canvasWidth * 0.66,
      canvasHeight - 100
    );
  }

  /**
   * Update both players
   */
  update(keys, currentTime, deltaTime = 1) {
    if (!this.enabled) return;
    
    Object.values(this.players).forEach(player => {
      if (player.active) {
        player.updatePosition(keys, this.canvasWidth, this.canvasHeight, deltaTime);
        
        // Auto-fire or key-based fire
        if (keys[player.controls.fire]) {
          player.fire(currentTime);
        }
        
        // Update bullets
        player.bullets = player.bullets.filter(bullet => {
          bullet.y -= bullet.speed;
          return bullet.y > -bullet.height;
        });
      }
    });
    
    // Check for revive
    this.checkRevive();
  }

  /**
   * Check if one player can revive the other
   */
  checkRevive() {
    if (!this.reviveEnabled) return;
    
    const p1 = this.players.player1;
    const p2 = this.players.player2;
    
    // Check if players are close enough to revive
    if (!p1.active && p2.active) {
      const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
      if (dist < 60) {
        p1.reviveTimer = (p1.reviveTimer || 0) + 1;
        if (p1.reviveTimer >= this.reviveTime) {
          this.revivePlayer('player1');
        }
      } else {
        p1.reviveTimer = 0;
      }
    }
    
    if (!p2.active && p1.active) {
      const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
      if (dist < 60) {
        p2.reviveTimer = (p2.reviveTimer || 0) + 1;
        if (p2.reviveTimer >= this.reviveTime) {
          this.revivePlayer('player2');
        }
      } else {
        p2.reviveTimer = 0;
      }
    }
  }

  /**
   * Revive a player
   */
  revivePlayer(playerId) {
    const player = this.players[playerId];
    if (!player) return;
    
    player.active = true;
    player.lives = 1;
    player.health = player.maxHealth;
    player.invincible = true;
    player.invincibleTime = 180; // 3 seconds
    player.reviveTimer = 0;
  }

  /**
   * Draw both players
   */
  draw(ctx) {
    if (!this.enabled) return;
    
    Object.values(this.players).forEach(player => {
      player.draw(ctx);
      
      // Draw bullets
      player.bullets.forEach(bullet => {
        ctx.fillStyle = bullet.color;
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
      });
      
      // Draw revive indicator
      if (!player.active && player.reviveTimer > 0) {
        const revivePercent = player.reviveTimer / this.reviveTime;
        ctx.save();
        ctx.globalAlpha = 0.7;
        ctx.fillStyle = 'rgba(0, 255, 0, 0.3)';
        ctx.beginPath();
        ctx.arc(player.x + player.width / 2, player.y + player.height / 2, 50, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(
          player.x + player.width / 2,
          player.y + player.height / 2,
          50,
          -Math.PI / 2,
          -Math.PI / 2 + (Math.PI * 2 * revivePercent)
        );
        ctx.stroke();
        
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('REVIVING', player.x + player.width / 2, player.y + player.height / 2);
        ctx.restore();
      }
    });
  }

  /**
   * Draw co-op HUD
   */
  drawHUD(ctx) {
    if (!this.enabled) return;
    
    const p1 = this.players.player1;
    const p2 = this.players.player2;
    
    // Player 1 stats (left side)
    ctx.save();
    ctx.fillStyle = 'rgba(0, 136, 255, 0.8)';
    ctx.fillRect(10, 10, 200, 80);
    ctx.strokeStyle = '#00ccff';
    ctx.lineWidth = 2;
    ctx.strokeRect(10, 10, 200, 80);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('PLAYER 1', 20, 30);
    ctx.font = '14px Arial';
    ctx.fillText(`Score: ${p1.score}`, 20, 50);
    ctx.fillText(`Lives: ${p1.lives}`, 20, 68);
    ctx.fillText(`Combo: ${p1.combo}x`, 120, 50);
    
    // Health bar
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(20, 75, 180, 10);
    const p1HealthPercent = p1.health / p1.maxHealth;
    ctx.fillStyle = p1HealthPercent > 0.5 ? '#00ff00' : p1HealthPercent > 0.25 ? '#ffaa00' : '#ff0000';
    ctx.fillRect(20, 75, 180 * p1HealthPercent, 10);
    
    // Player 2 stats (right side)
    const rightX = ctx.canvas.width - 210;
    ctx.fillStyle = 'rgba(255, 0, 136, 0.8)';
    ctx.fillRect(rightX, 10, 200, 80);
    ctx.strokeStyle = '#ff00ff';
    ctx.lineWidth = 2;
    ctx.strokeRect(rightX, 10, 200, 80);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('PLAYER 2', rightX + 10, 30);
    ctx.font = '14px Arial';
    ctx.fillText(`Score: ${p2.score}`, rightX + 10, 50);
    ctx.fillText(`Lives: ${p2.lives}`, rightX + 10, 68);
    ctx.fillText(`Combo: ${p2.combo}x`, rightX + 110, 50);
    
    // Health bar
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(rightX + 10, 75, 180, 10);
    const p2HealthPercent = p2.health / p2.maxHealth;
    ctx.fillStyle = p2HealthPercent > 0.5 ? '#00ff00' : p2HealthPercent > 0.25 ? '#ffaa00' : '#ff0000';
    ctx.fillRect(rightX + 10, 75, 180 * p2HealthPercent, 10);
    
    // Combined score (center top)
    const combinedScore = p1.score + p2.score;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(ctx.canvas.width / 2 - 100, 10, 200, 40);
    ctx.strokeStyle = '#00ff88';
    ctx.lineWidth = 2;
    ctx.strokeRect(ctx.canvas.width / 2 - 100, 10, 200, 40);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('TEAM SCORE', ctx.canvas.width / 2, 28);
    ctx.font = 'bold 16px Arial';
    ctx.fillText(combinedScore.toLocaleString(), ctx.canvas.width / 2, 45);
    
    ctx.restore();
  }

  /**
   * Get all active bullets from both players
   */
  getAllBullets() {
    const allBullets = [];
    Object.values(this.players).forEach(player => {
      allBullets.push(...player.bullets);
    });
    return allBullets;
  }

  /**
   * Check if both players are dead
   */
  isGameOver() {
    return Object.values(this.players).every(p => !p.active);
  }

  /**
   * Get combined stats
   */
  getCombinedStats() {
    return {
      totalScore: this.players.player1.score + this.players.player2.score,
      totalKills: this.players.player1.kills + this.players.player2.kills,
      player1: {
        score: this.players.player1.score,
        kills: this.players.player1.kills,
        lives: this.players.player1.lives
      },
      player2: {
        score: this.players.player2.score,
        kills: this.players.player2.kills,
        lives: this.players.player2.lives
      }
    };
  }

  /**
   * Reset co-op session
   */
  reset() {
    this.initialize(this.canvasWidth, this.canvasHeight);
  }

  /**
   * Disable co-op mode
   */
  disable() {
    this.enabled = false;
    this.players = {};
  }
}

export default LocalCoopSystem;

