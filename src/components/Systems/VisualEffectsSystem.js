/**
 * VisualEffectsSystem - Advanced visual effects for 100% completion
 */
export class VisualEffectsSystem {
  constructor() {
    this.effects = [];
    this.particleSystems = [];
    this.screenEffects = [];
    this.backgroundEffects = [];
  }

  /**
   * Create explosion effect
   */
  createExplosion(x, y, size = 1, color = '#ff4444') {
    const explosion = {
      type: 'explosion',
      x,
      y,
      size,
      color,
      life: 60,
      maxLife: 60,
      particles: []
    };

    // Create explosion particles
    for (let i = 0; i < 15 * size; i++) {
      explosion.particles.push({
        x: x + (Math.random() - 0.5) * 20 * size,
        y: y + (Math.random() - 0.5) * 20 * size,
        vx: (Math.random() - 0.5) * 8 * size,
        vy: (Math.random() - 0.5) * 8 * size,
        life: 30 + Math.random() * 30,
        maxLife: 30 + Math.random() * 30,
        size: Math.random() * 4 * size,
        color: color,
        alpha: 1
      });
    }

    this.effects.push(explosion);
  }

  /**
   * Create energy burst effect
   */
  createEnergyBurst(x, y, intensity = 1) {
    const burst = {
      type: 'energy_burst',
      x,
      y,
      intensity,
      life: 40,
      maxLife: 40,
      radius: 0,
      maxRadius: 50 * intensity,
      color: '#00ffff',
      alpha: 1
    };

    this.effects.push(burst);
  }

  /**
   * Create shield effect
   */
  createShieldEffect(x, y, width, height, energy = 1) {
    const shield = {
      type: 'shield',
      x,
      y,
      width,
      height,
      energy,
      life: 120,
      maxLife: 120,
      alpha: 0.7,
      pulse: 0
    };

    this.effects.push(shield);
  }

  /**
   * Create weapon trail effect
   */
  createWeaponTrail(x, y, vx, vy, weaponType) {
    const trail = {
      type: 'weapon_trail',
      x,
      y,
      vx,
      vy,
      weaponType,
      life: 20,
      maxLife: 20,
      segments: [],
      color: this.getWeaponColor(weaponType)
    };

    this.effects.push(trail);
  }

  /**
   * Create boss phase transition effect
   */
  createBossPhaseTransition(boss) {
    const transition = {
      type: 'boss_phase_transition',
      x: boss.x + boss.width / 2,
      y: boss.y + boss.height / 2,
      life: 120,
      maxLife: 120,
      phase: boss.phase,
      color: boss.color,
      particles: []
    };

    // Create phase transition particles
    for (let i = 0; i < 50; i++) {
      transition.particles.push({
        x: transition.x + (Math.random() - 0.5) * 100,
        y: transition.y + (Math.random() - 0.5) * 100,
        vx: (Math.random() - 0.5) * 10,
        vy: (Math.random() - 0.5) * 10,
        life: 60 + Math.random() * 60,
        maxLife: 60 + Math.random() * 60,
        size: Math.random() * 6,
        color: transition.color,
        alpha: 1
      });
    }

    this.effects.push(transition);
  }

  /**
   * Create screen shake effect
   */
  createScreenShake(intensity = 1, duration = 10) {
    const shake = {
      type: 'screen_shake',
      intensity,
      duration,
      life: duration,
      maxLife: duration,
      x: 0,
      y: 0
    };

    this.screenEffects.push(shake);
  }

  /**
   * Create background parallax effect
   */
  createBackgroundParallax(layers = 3) {
    this.backgroundEffects = [];
    
    for (let i = 0; i < layers; i++) {
      this.backgroundEffects.push({
        type: 'parallax_layer',
        depth: i + 1,
        speed: 0.5 + i * 0.3,
        stars: [],
        color: `rgba(255, 255, 255, ${0.3 - i * 0.1})`
      });
    }
  }

  /**
   * Create power-up collection effect
   */
  createPowerUpEffect(x, y, powerUpType) {
    const effect = {
      type: 'power_up_collection',
      x,
      y,
      powerUpType,
      life: 60,
      maxLife: 60,
      particles: [],
      color: this.getPowerUpColor(powerUpType)
    };

    // Create collection particles
    for (let i = 0; i < 20; i++) {
      effect.particles.push({
        x: x + (Math.random() - 0.5) * 30,
        y: y + (Math.random() - 0.5) * 30,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        life: 30 + Math.random() * 30,
        maxLife: 30 + Math.random() * 30,
        size: Math.random() * 3,
        color: effect.color,
        alpha: 1
      });
    }

    this.effects.push(effect);
  }

  /**
   * Create combo effect
   */
  createComboEffect(x, y, combo) {
    const effect = {
      type: 'combo_effect',
      x,
      y,
      combo,
      life: 90,
      maxLife: 90,
      size: 1 + combo * 0.1,
      color: this.getComboColor(combo),
      alpha: 1
    };

    this.effects.push(effect);
  }

  /**
   * Update all effects
   */
  update() {
    // Update main effects
    this.effects = this.effects.filter(effect => {
      effect.life--;
      
      if (effect.life <= 0) {
        return false;
      }

      this.updateEffect(effect);
      return true;
    });

    // Update screen effects
    this.screenEffects = this.screenEffects.filter(effect => {
      effect.life--;
      return effect.life > 0;
    });

    // Update background effects
    this.backgroundEffects.forEach(effect => {
      this.updateBackgroundEffect(effect);
    });
  }

  /**
   * Update individual effect
   */
  updateEffect(effect) {
    switch (effect.type) {
      case 'explosion':
        effect.particles.forEach(particle => {
          particle.x += particle.vx;
          particle.y += particle.vy;
          particle.vx *= 0.98;
          particle.vy *= 0.98;
          particle.life--;
          particle.alpha = particle.life / particle.maxLife;
        });
        break;

      case 'energy_burst':
        effect.radius = (effect.maxRadius * (effect.maxLife - effect.life)) / effect.maxLife;
        effect.alpha = effect.life / effect.maxLife;
        break;

      case 'shield':
        effect.pulse += 0.2;
        effect.alpha = 0.7 * (effect.life / effect.maxLife);
        break;

      case 'weapon_trail':
        effect.x += effect.vx;
        effect.y += effect.vy;
        effect.segments.push({ x: effect.x, y: effect.y, life: 10 });
        effect.segments = effect.segments.filter(segment => {
          segment.life--;
          return segment.life > 0;
        });
        break;

      case 'boss_phase_transition':
        effect.particles.forEach(particle => {
          particle.x += particle.vx;
          particle.y += particle.vy;
          particle.vx *= 0.95;
          particle.vy *= 0.95;
          particle.life--;
          particle.alpha = particle.life / particle.maxLife;
        });
        break;

      case 'power_up_collection':
        effect.particles.forEach(particle => {
          particle.x += particle.vx;
          particle.y += particle.vy;
          particle.vx *= 0.96;
          particle.vy *= 0.96;
          particle.life--;
          particle.alpha = particle.life / particle.maxLife;
        });
        break;

      case 'combo_effect':
        effect.alpha = effect.life / effect.maxLife;
        break;
    }
  }

  /**
   * Update background effect
   */
  updateBackgroundEffect(effect) {
    if (effect.type === 'parallax_layer') {
      effect.stars.forEach(star => {
        star.y += effect.speed;
        if (star.y > 700) {
          star.y = -10;
          star.x = Math.random() * 800;
        }
      });
    }
  }

  /**
   * Render all effects
   */
  render(ctx) {
    // Render background effects
    this.backgroundEffects.forEach(effect => {
      this.renderBackgroundEffect(ctx, effect);
    });

    // Render main effects
    this.effects.forEach(effect => {
      this.renderEffect(ctx, effect);
    });

    // Apply screen effects
    this.screenEffects.forEach(effect => {
      this.applyScreenEffect(ctx, effect);
    });
  }

  /**
   * Render individual effect
   */
  renderEffect(ctx, effect) {
    ctx.save();

    switch (effect.type) {
      case 'explosion':
        effect.particles.forEach(particle => {
          ctx.globalAlpha = particle.alpha;
          ctx.fillStyle = particle.color;
          ctx.fillRect(particle.x, particle.y, particle.size, particle.size);
        });
        break;

      case 'energy_burst':
        ctx.globalAlpha = effect.alpha;
        ctx.strokeStyle = effect.color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(effect.x, effect.y, effect.radius, 0, Math.PI * 2);
        ctx.stroke();
        break;

      case 'shield':
        ctx.globalAlpha = effect.alpha;
        ctx.strokeStyle = effect.color;
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(effect.x, effect.y, effect.width, effect.height);
        ctx.setLineDash([]);
        break;

      case 'weapon_trail':
        ctx.globalAlpha = 0.8;
        ctx.strokeStyle = effect.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        effect.segments.forEach((segment, index) => {
          if (index === 0) {
            ctx.moveTo(segment.x, segment.y);
          } else {
            ctx.lineTo(segment.x, segment.y);
          }
        });
        ctx.stroke();
        break;

      case 'boss_phase_transition':
        effect.particles.forEach(particle => {
          ctx.globalAlpha = particle.alpha;
          ctx.fillStyle = particle.color;
          ctx.fillRect(particle.x, particle.y, particle.size, particle.size);
        });
        break;

      case 'power_up_collection':
        effect.particles.forEach(particle => {
          ctx.globalAlpha = particle.alpha;
          ctx.fillStyle = particle.color;
          ctx.fillRect(particle.x, particle.y, particle.size, particle.size);
        });
        break;

      case 'combo_effect':
        ctx.globalAlpha = effect.alpha;
        ctx.fillStyle = effect.color;
        ctx.font = `bold ${20 * effect.size}px Arial`;
        ctx.textAlign = 'center';
        ctx.fillText(`COMBO x${effect.combo}`, effect.x, effect.y);
        break;
    }

    ctx.restore();
  }

  /**
   * Render background effect
   */
  renderBackgroundEffect(ctx, effect) {
    if (effect.type === 'parallax_layer') {
      ctx.fillStyle = effect.color;
      effect.stars.forEach(star => {
        ctx.fillRect(star.x, star.y, 1, 1);
      });
    }
  }

  /**
   * Apply screen effect
   */
  applyScreenEffect(ctx, effect) {
    if (effect.type === 'screen_shake') {
      const intensity = effect.intensity * (effect.life / effect.maxLife);
      effect.x = (Math.random() - 0.5) * intensity;
      effect.y = (Math.random() - 0.5) * intensity;
      ctx.translate(effect.x, effect.y);
    }
  }

  /**
   * Get weapon color
   */
  getWeaponColor(weaponType) {
    const colors = {
      laser: '#ffff00',
      plasma: '#ff00ff',
      missile: '#ff4444',
      beam: '#00ffff',
      spread: '#ff8800',
      homing: '#8800ff'
    };
    return colors[weaponType] || '#ffffff';
  }

  /**
   * Get power-up color
   */
  getPowerUpColor(powerUpType) {
    const colors = {
      health: '#ff4444',
      shield: '#00ffff',
      speed: '#ffff00',
      weapon: '#ff00ff',
      score: '#00ff00'
    };
    return colors[powerUpType] || '#ffffff';
  }

  /**
   * Get combo color
   */
  getComboColor(combo) {
    if (combo >= 10) return '#ff00ff';
    if (combo >= 5) return '#ffff00';
    return '#00ffff';
  }

  /**
   * Clear all effects
   */
  clear() {
    this.effects = [];
    this.particleSystems = [];
    this.screenEffects = [];
    this.backgroundEffects = [];
  }
}
