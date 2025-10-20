/**
 * PowerUpComboSystem - Manages power-up combinations and synergies
 */

export class PowerUpComboSystem {
  constructor() {
    this.activePowerUps = [];
    this.activeCombos = [];
    this.comboDefinitions = this.initializeCombos();
  }

  /**
   * Initialize combo definitions
   */
  initializeCombos() {
    return {
      bulletStorm: {
        name: 'Bullet Storm',
        icon: '🌪️',
        description: 'Rapid Fire + Multi-Shot = Devastating bullet spray',
        requires: ['rapidFire', 'multiShot'],
        effects: {
          fireRateBonus: 0.5,    // Additional 50% fire rate
          bulletCountBonus: 2,    // +2 extra bullets
          damageBonus: 0.2        // +20% damage
        },
        duration: 0 // Uses shortest power-up duration
      },

      afterburner: {
        name: 'Afterburner',
        icon: '💨',
        description: 'Shield + Speed = Invincible dash',
        requires: ['shield', 'speed'],
        effects: {
          speedBonus: 2,          // +2 extra speed
          invulnerable: true,     // Full invulnerability
          trailEffect: 'fire'     // Visual trail
        },
        duration: 0
      },

      smartSwarm: {
        name: 'Smart Swarm',
        icon: '🎯',
        description: 'Homing + Spread = Guided missile barrage',
        requires: ['homing', 'multiShot'],
        effects: {
          homingStrength: 2,      // Double homing strength
          spreadBonus: 3,         // +3 spread bullets
          damageBonus: 0.3        // +30% damage
        },
        duration: 0
      },

      titanShield: {
        name: 'Titan Shield',
        icon: '🛡️',
        description: 'Shield + Health = Regenerating fortress',
        requires: ['shield', 'life'],
        effects: {
          shieldStrength: 2,      // Double shield
          healthRegen: 1,         // +1 HP per second
          damageReduction: 0.5    // 50% damage reduction
        },
        duration: 0
      },

      voidRipper: {
        name: 'Void Ripper',
        icon: '⚫',
        description: 'Rapid Fire + Weapon Upgrade = Ultimate firepower',
        requires: ['rapidFire', 'weapon'],
        effects: {
          fireRateBonus: 0.7,     // +70% fire rate
          damageBonus: 0.5,       // +50% damage
          penetration: true       // Bullets pierce enemies
        },
        duration: 0
      },

      blitzkrieg: {
        name: 'Blitzkrieg',
        icon: '⚡',
        description: 'Speed + Rapid Fire = Lightning assault',
        requires: ['speed', 'rapidFire'],
        effects: {
          speedBonus: 1.5,        // +1.5 speed
          fireRateBonus: 0.6,     // +60% fire rate
          scoreMultiplier: 2      // 2x score
        },
        duration: 0
      },

      starfall: {
        name: 'Starfall',
        icon: '🌟',
        description: 'Multi-Shot + Weapon = Orbital bombardment',
        requires: ['multiShot', 'weapon'],
        effects: {
          bulletCountBonus: 4,    // +4 extra bullets
          damageBonus: 0.4,       // +40% damage
          areaEffect: true        // Bullets explode on impact
        },
        duration: 0
      },

      phoenixMode: {
        name: 'Phoenix Mode',
        icon: '🔥',
        description: 'Shield + Rapid Fire + Speed = Ultimate power',
        requires: ['shield', 'rapidFire', 'speed'],
        effects: {
          fireRateBonus: 0.8,     // +80% fire rate
          speedBonus: 2,          // +2 speed
          invulnerable: true,     // Full invulnerability
          scoreMultiplier: 3,     // 3x score
          damageBonus: 0.5        // +50% damage
        },
        duration: 0
      }
    };
  }

  /**
   * Add power-up to active list
   */
  addPowerUp(type, duration) {
    // Check if power-up already exists
    const existing = this.activePowerUps.find(p => p.type === type);
    if (existing) {
      // Refresh duration
      existing.duration = duration;
      existing.startTime = Date.now();
    } else {
      // Add new power-up
      this.activePowerUps.push({
        type: type,
        duration: duration,
        startTime: Date.now()
      });
    }

    // Check for combos
    this.checkCombos();
  }

  /**
   * Remove power-up
   */
  removePowerUp(type) {
    this.activePowerUps = this.activePowerUps.filter(p => p.type !== type);
    this.checkCombos();
  }

  /**
   * Check for active combos
   */
  checkCombos() {
    const activeTypes = this.activePowerUps.map(p => p.type);
    this.activeCombos = [];

    // Check each combo definition
    Object.entries(this.comboDefinitions).forEach(([key, combo]) => {
      const hasAllRequired = combo.requires.every(req => activeTypes.includes(req));
      
      if (hasAllRequired) {
        // Calculate combo duration (shortest power-up duration)
        const durations = combo.requires.map(req => {
          const powerUp = this.activePowerUps.find(p => p.type === req);
          if (!powerUp) return 0;
          const elapsed = Date.now() - powerUp.startTime;
          return Math.max(0, powerUp.duration - elapsed);
        });

        const comboDuration = Math.min(...durations);

        if (comboDuration > 0) {
          this.activeCombos.push({
            key: key,
            name: combo.name,
            icon: combo.icon,
            effects: combo.effects,
            duration: comboDuration,
            startTime: Date.now()
          });
        }
      }
    });
  }

  /**
   * Update power-ups and combos
   */
  update(deltaTime) {
    const now = Date.now();

    // Remove expired power-ups
    this.activePowerUps = this.activePowerUps.filter(powerUp => {
      const elapsed = now - powerUp.startTime;
      return elapsed < powerUp.duration;
    });

    // Refresh combos
    if (this.activePowerUps.length > 0) {
      this.checkCombos();
    } else {
      this.activeCombos = [];
    }
  }

  /**
   * Get all active effects
   */
  getActiveEffects() {
    const effects = {
      fireRateBonus: 0,
      bulletCountBonus: 0,
      damageBonus: 0,
      speedBonus: 0,
      scoreMultiplier: 1,
      invulnerable: false,
      penetration: false,
      areaEffect: false,
      healthRegen: 0,
      damageReduction: 0,
      homingStrength: 1,
      trailEffect: null
    };

    // Apply combo effects
    this.activeCombos.forEach(combo => {
      Object.entries(combo.effects).forEach(([key, value]) => {
        if (key === 'scoreMultiplier') {
          effects[key] = Math.max(effects[key], value);
        } else if (typeof value === 'boolean') {
          effects[key] = effects[key] || value;
        } else if (typeof value === 'string') {
          effects[key] = value;
        } else {
          effects[key] += value;
        }
      });
    });

    return effects;
  }

  /**
   * Check if specific combo is active
   */
  isComboActive(comboKey) {
    return this.activeCombos.some(c => c.key === comboKey);
  }

  /**
   * Get combo display info
   */
  getComboDisplayInfo() {
    return this.activeCombos.map(combo => ({
      name: combo.name,
      icon: combo.icon,
      duration: combo.duration,
      timeLeft: Math.max(0, combo.duration - (Date.now() - combo.startTime))
    }));
  }

  /**
   * Render power-up and combo indicators
   */
  render(ctx, canvas) {
    const startX = 20;
    let startY = canvas.height - 100;

    // Render active power-ups
    ctx.save();
    ctx.font = 'bold 12px Arial';
    
    this.activePowerUps.forEach((powerUp, index) => {
      const elapsed = Date.now() - powerUp.startTime;
      const remaining = Math.max(0, powerUp.duration - elapsed);
      const percent = remaining / powerUp.duration;

      if (remaining > 0) {
        // Background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(startX, startY - index * 25, 150, 20);

        // Progress bar
        ctx.fillStyle = this.getPowerUpColor(powerUp.type);
        ctx.fillRect(startX, startY - index * 25, 150 * percent, 20);

        // Border
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.strokeRect(startX, startY - index * 25, 150, 20);

        // Text
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'left';
        ctx.fillText(
          `${this.getPowerUpName(powerUp.type)} ${Math.ceil(remaining / 1000)}s`,
          startX + 5,
          startY - index * 25 + 14
        );
      }
    });

    // Render active combos
    if (this.activeCombos.length > 0) {
      const comboStartY = 150;
      
      this.activeCombos.forEach((combo, index) => {
        const elapsed = Date.now() - combo.startTime;
        const remaining = Math.max(0, combo.duration - elapsed);

        if (remaining > 0) {
          const comboX = canvas.width / 2 - 150;
          const comboY = comboStartY + index * 60;

          // Background
          ctx.fillStyle = 'rgba(255, 165, 0, 0.9)';
          ctx.fillRect(comboX, comboY, 300, 50);

          // Border with glow
          ctx.shadowColor = '#ff8800';
          ctx.shadowBlur = 10;
          ctx.strokeStyle = '#ffff00';
          ctx.lineWidth = 3;
          ctx.strokeRect(comboX, comboY, 300, 50);
          ctx.shadowBlur = 0;

          // Combo name
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 20px Arial';
          ctx.textAlign = 'center';
          ctx.fillText(
            `${combo.icon} ${combo.name} ${combo.icon}`,
            comboX + 150,
            comboY + 25
          );

          // Time remaining
          ctx.font = '14px Arial';
          ctx.fillText(
            `${Math.ceil(remaining / 1000)}s`,
            comboX + 150,
            comboY + 42
          );

          // Pulse effect
          if (remaining < 3000 && Math.floor(Date.now() / 250) % 2 === 0) {
            ctx.globalAlpha = 0.5;
            ctx.fillStyle = '#ff0000';
            ctx.fillRect(comboX, comboY, 300, 50);
            ctx.globalAlpha = 1;
          }
        }
      });
    }

    ctx.restore();
  }

  /**
   * Get power-up color
   */
  getPowerUpColor(type) {
    const colors = {
      rapidFire: '#ffff00',
      multiShot: '#ff00ff',
      shield: '#00ffff',
      speed: '#ff8800',
      weapon: '#00ff00',
      life: '#ffd700',
      homing: '#00ff88'
    };
    return colors[type] || '#ffffff';
  }

  /**
   * Get power-up name
   */
  getPowerUpName(type) {
    const names = {
      rapidFire: 'Rapid Fire',
      multiShot: 'Multi-Shot',
      shield: 'Shield',
      speed: 'Speed',
      weapon: 'Weapon',
      life: 'Extra Life',
      homing: 'Homing'
    };
    return names[type] || type;
  }

  /**
   * Get all possible combos (for reference/help screen)
   */
  getAllCombos() {
    return Object.entries(this.comboDefinitions).map(([key, combo]) => ({
      key: key,
      name: combo.name,
      icon: combo.icon,
      description: combo.description,
      requires: combo.requires
    }));
  }

  /**
   * Reset system
   */
  reset() {
    this.activePowerUps = [];
    this.activeCombos = [];
  }
}

export const powerUpComboSystem = new PowerUpComboSystem();

