/**
 * UltimateSystem - Manages ultimate abilities and charge meter
 */

export class UltimateSystem {
  constructor() {
    this.charge = 0;
    this.maxCharge = 100;
    this.chargeRate = 1; // Charge gained per kill
    this.ultimateActive = false;
    this.ultimateType = null;
    this.ultimateDuration = 0;
    this.ultimateStartTime = 0;
    this.cooldown = 0;
    this.cooldownDuration = 5000; // 5 seconds cooldown after use
  }

  /**
   * Add charge from kills or damage
   */
  addCharge(amount) {
    if (this.charge < this.maxCharge) {
      this.charge = Math.min(this.charge + amount, this.maxCharge);
      return true;
    }
    return false;
  }

  /**
   * Check if ultimate is ready
   */
  isReady() {
    return this.charge >= this.maxCharge && this.cooldown <= 0 && !this.ultimateActive;
  }

  /**
   * Activate ultimate ability
   */
  activateUltimate(character, game) {
    if (!this.isReady()) return false;

    this.ultimateActive = true;
    this.charge = 0;
    this.ultimateStartTime = Date.now();

    switch (character) {
      case 'kaden':
        this.activatePhoenixStrike(game);
        this.ultimateType = 'phoenix_strike';
        this.ultimateDuration = 2000;
        break;

      case 'adelynn':
        this.activateTacticalStrike(game);
        this.ultimateType = 'tactical_strike';
        this.ultimateDuration = 5000;
        break;

      default:
        this.activateScreenClear(game);
        this.ultimateType = 'screen_clear';
        this.ultimateDuration = 1000;
    }

    // Deactivate after duration
    setTimeout(() => {
      this.deactivateUltimate(game);
    }, this.ultimateDuration);

    return true;
  }

  /**
   * Kaden's Ultimate: Phoenix Strike - Screen clearing explosion
   */
  activatePhoenixStrike(game) {
    const canvas = game.canvas || { width: 800, height: 700 };

    // Create massive explosion effect
    for (let i = 0; i < 100; i++) {
      game.particles.push({
        x: canvas.width / 2,
        y: canvas.height / 2,
        vx: (Math.random() - 0.5) * 20,
        vy: (Math.random() - 0.5) * 20,
        life: 50,
        maxLife: 50,
        size: 8 + Math.random() * 8,
        color: ['#ff4400', '#ff8800', '#ffaa00', '#ff0000'][Math.floor(Math.random() * 4)]
      });
    }

    // Destroy all enemies on screen
    game.enemies.forEach(enemy => {
      // Create explosion particles
      for (let i = 0; i < 10; i++) {
        game.particles.push({
          x: enemy.x + enemy.width / 2,
          y: enemy.y + enemy.height / 2,
          vx: (Math.random() - 0.5) * 8,
          vy: (Math.random() - 0.5) * 8,
          life: 30,
          maxLife: 30,
          size: 4,
          color: enemy.color
        });
      }

      // Add score
      game.score += 150;
    });

    // Clear all enemies and enemy bullets
    game.enemies = [];
    game.enemyBullets = [];

    // Screen shake
    game.screenShakeX = 15;
    game.screenShakeY = 15;

    // Create expanding ring effect
    this.createExpandingRing(game, canvas.width / 2, canvas.height / 2, '#ff4400');
  }

  /**
   * Adelynn's Ultimate: Tactical Strike - Time slow + auto-aim
   */
  activateTacticalStrike(game) {
    // Slow down time
    game.gameSpeed = 0.3;
    game.tacticalStrikeActive = true;

    // Auto-aim at all enemies
    const autoAimInterval = setInterval(() => {
      if (!this.ultimateActive || this.ultimateType !== 'tactical_strike') {
        clearInterval(autoAimInterval);
        return;
      }

      // Fire homing shots at all visible enemies
      game.enemies.forEach(enemy => {
        if (game.bullets.length < 50) {
          const dx = enemy.x + enemy.width / 2 - (game.player.x + game.player.width / 2);
          const dy = enemy.y + enemy.height / 2 - game.player.y;
          const angle = Math.atan2(dy, dx);

          game.bullets.push({
            x: game.player.x + game.player.width / 2,
            y: game.player.y,
            width: 6,
            height: 12,
            vx: Math.cos(angle) * 10,
            vy: Math.sin(angle) * 10,
            speed: 10,
            color: '#00ffff',
            weapon: 'homing',
            damage: 25,
            isHoming: true,
            targetId: enemy
          });
        }
      });
    }, 100);

    // Visual effect - blue tint
    game.tacticalTint = true;
  }

  /**
   * Generic screen clear ultimate
   */
  activateScreenClear(game) {
    const canvas = game.canvas || { width: 800, height: 700 };

    // Create particles
    for (let i = 0; i < 50; i++) {
      game.particles.push({
        x: canvas.width / 2,
        y: canvas.height / 2,
        vx: (Math.random() - 0.5) * 15,
        vy: (Math.random() - 0.5) * 15,
        life: 40,
        maxLife: 40,
        size: 6,
        color: '#ffffff'
      });
    }

    // Clear enemies
    game.enemies.forEach(enemy => {
      game.score += 100;
    });
    game.enemies = [];
    game.enemyBullets = [];
  }

  /**
   * Deactivate ultimate
   */
  deactivateUltimate(game) {
    // Restore normal game speed
    if (game.gameSpeed !== 1) {
      game.gameSpeed = 1;
    }

    if (game.tacticalStrikeActive) {
      game.tacticalStrikeActive = false;
    }

    if (game.tacticalTint) {
      game.tacticalTint = false;
    }

    this.ultimateActive = false;
    this.ultimateType = null;
    this.cooldown = this.cooldownDuration;
  }

  /**
   * Update system
   */
  update(deltaTime) {
    // Update cooldown
    if (this.cooldown > 0) {
      this.cooldown = Math.max(0, this.cooldown - deltaTime);
    }

    // Update ultimate duration effects
    if (this.ultimateActive) {
      const elapsed = Date.now() - this.ultimateStartTime;
      if (elapsed >= this.ultimateDuration) {
        // Will be handled by timeout, but this is a safety check
      }
    }
  }

  /**
   * Create expanding ring effect
   */
  createExpandingRing(game, x, y, color) {
    const ring = {
      x: x,
      y: y,
      radius: 0,
      maxRadius: 400,
      color: color,
      alpha: 1,
      lineWidth: 5
    };

    const expandRing = () => {
      ring.radius += 15;
      ring.alpha -= 0.05;

      if (ring.radius < ring.maxRadius && ring.alpha > 0) {
        requestAnimationFrame(expandRing);
      }
    };

    game.ultimateRing = ring;
    expandRing();

    setTimeout(() => {
      game.ultimateRing = null;
    }, 1000);
  }

  /**
   * Render charge meter
   */
  renderChargeMeter(ctx, canvas) {
    const meterWidth = 200;
    const meterHeight = 20;
    const x = canvas.width - meterWidth - 20;
    const y = 70;

    // Background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(x, y, meterWidth, meterHeight);

    // Charge fill
    const fillWidth = (this.charge / this.maxCharge) * meterWidth;
    const gradient = ctx.createLinearGradient(x, y, x + meterWidth, y);
    
    if (this.isReady()) {
      gradient.addColorStop(0, '#00ff00');
      gradient.addColorStop(1, '#00ffff');
      
      // Pulse effect when ready
      const pulse = 0.8 + Math.sin(Date.now() / 200) * 0.2;
      ctx.globalAlpha = pulse;
    } else {
      gradient.addColorStop(0, '#0088ff');
      gradient.addColorStop(1, '#00ffff');
    }

    ctx.fillStyle = gradient;
    ctx.fillRect(x, y, fillWidth, meterHeight);
    ctx.globalAlpha = 1;

    // Border
    ctx.strokeStyle = this.isReady() ? '#00ff00' : '#ffffff';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, meterWidth, meterHeight);

    // Label
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('ULTIMATE', x, y - 5);

    // Charge percentage
    ctx.textAlign = 'center';
    const chargePercent = Math.floor((this.charge / this.maxCharge) * 100);
    ctx.fillText(`${chargePercent}%`, x + meterWidth / 2, y + 14);

    // Ready indicator
    if (this.isReady()) {
      ctx.fillStyle = '#00ff00';
      ctx.font = 'bold 14px Arial';
      ctx.fillText('READY!', x + meterWidth / 2, y + meterHeight + 15);
    }

    // Cooldown indicator
    if (this.cooldown > 0) {
      const cooldownPercent = (this.cooldown / this.cooldownDuration) * 100;
      ctx.fillStyle = '#ffff00';
      ctx.font = '12px Arial';
      ctx.fillText(`Cooldown: ${Math.ceil(this.cooldown / 1000)}s`, x + meterWidth / 2, y + meterHeight + 15);
    }
  }

  /**
   * Render active ultimate effects
   */
  renderUltimateEffects(ctx, canvas, game) {
    if (!this.ultimateActive) return;

    // Render ultimate ring
    if (game.ultimateRing) {
      const ring = game.ultimateRing;
      ctx.save();
      ctx.globalAlpha = ring.alpha;
      ctx.strokeStyle = ring.color;
      ctx.lineWidth = ring.lineWidth;
      ctx.beginPath();
      ctx.arc(ring.x, ring.y, ring.radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // Tactical strike tint
    if (game.tacticalTint) {
      ctx.save();
      ctx.fillStyle = 'rgba(0, 100, 200, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.restore();
    }

    // Ultimate active indicator
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(canvas.width / 2 - 150, 10, 300, 40);

    ctx.strokeStyle = '#ffff00';
    ctx.lineWidth = 2;
    ctx.strokeRect(canvas.width / 2 - 150, 10, 300, 40);

    ctx.fillStyle = '#ffff00';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    const name = this.getUltimateName();
    ctx.fillText(name, canvas.width / 2, 35);

    const remaining = Math.ceil((this.ultimateDuration - (Date.now() - this.ultimateStartTime)) / 1000);
    ctx.font = '14px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`${remaining}s`, canvas.width / 2, 50);

    ctx.restore();
  }

  /**
   * Get ultimate name
   */
  getUltimateName() {
    switch (this.ultimateType) {
      case 'phoenix_strike': return '🔥 PHOENIX STRIKE 🔥';
      case 'tactical_strike': return '🎯 TACTICAL STRIKE 🎯';
      case 'screen_clear': return '💥 ULTIMATE POWER 💥';
      default: return 'ULTIMATE ACTIVE';
    }
  }

  /**
   * Reset system
   */
  reset() {
    this.charge = 0;
    this.ultimateActive = false;
    this.ultimateType = null;
    this.cooldown = 0;
  }

  /**
   * Get ultimate info for character
   */
  getUltimateInfo(character) {
    const info = {
      kaden: {
        name: 'Phoenix Strike',
        description: 'Devastating screen-clearing explosion that destroys all enemies',
        icon: '🔥',
        duration: 2000
      },
      adelynn: {
        name: 'Tactical Strike',
        description: 'Slows time and auto-targets all enemies with homing missiles',
        icon: '🎯',
        duration: 5000
      }
    };

    return info[character] || info.kaden;
  }
}

export const ultimateSystem = new UltimateSystem();

