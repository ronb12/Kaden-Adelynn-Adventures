/**
 * BossSystem - Manages boss battles with multi-phase mechanics and special abilities
 */
import { BOSS_TYPES, BOSS_ATTACK_PATTERNS, BOSS_SPECIAL_ABILITIES } from '../../constants/BossTypes.js';

export class BossSystem {
  constructor() {
    this.currentBoss = null;
    this.bossPhase = 1;
    this.lastAbilityTime = 0;
    this.abilityActive = false;
    this.abilityType = null;
    this.spawnedDrones = [];
    this.teleportCooldown = 0;
    this.phaseTransitionActive = false;
  }

  /**
   * Spawn a boss based on score
   */
  spawnBoss(score, canvas) {
    let bossKey = 'VOID_SCOUT_COMMANDER';
    
    if (score >= 15000) {
      bossKey = 'ANCIENT_GUARDIAN';
    } else if (score >= 10000) {
      bossKey = 'VOID_EMPEROR';
    } else if (score >= 7500) {
      bossKey = 'FEDERATION_TRAITOR';
    } else if (score >= 5000) {
      bossKey = 'SHADOW_FLEET_ADMIRAL';
    }

    const bossData = BOSS_TYPES[bossKey];
    
    this.currentBoss = {
      ...bossData,
      x: canvas.width / 2 - bossData.width / 2,
      y: -bossData.height,
      targetY: 50,
      vx: 0,
      vy: 0,
      health: bossData.health,
      maxHealth: bossData.maxHealth,
      phase: 1,
      lastShot: 0,
      lastMove: 0,
      direction: 1,
      activeAbilities: [],
      isInvulnerable: false,
      alpha: 1
    };

    this.bossPhase = 1;
    this.lastAbilityTime = 0;
    this.spawnedDrones = [];
    
    return this.currentBoss;
  }

  /**
   * Update boss behavior and abilities
   */
  update(deltaTime, canvas, game) {
    if (!this.currentBoss) return;

    const boss = this.currentBoss;

    // Entry animation
    if (boss.y < boss.targetY) {
      boss.y += 2;
      return;
    }

    // Check for phase transitions
    this.checkPhaseTransition(game);

    // Update movement based on attack pattern
    this.updateMovement(deltaTime, canvas);

    // Update special abilities
    this.updateAbilities(deltaTime, game);

    // Boss shooting
    this.updateShooting(deltaTime, game, canvas);

    // Update teleport cooldown
    if (this.teleportCooldown > 0) {
      this.teleportCooldown -= deltaTime;
    }
  }

  /**
   * Check and handle phase transitions
   */
  checkPhaseTransition(game) {
    const boss = this.currentBoss;
    const healthPercent = boss.health / boss.maxHealth;
    
    let newPhase = boss.phase;
    
    if (healthPercent <= 0.8 && boss.phase < 2) newPhase = 2;
    else if (healthPercent <= 0.6 && boss.phase < 3) newPhase = 3;
    else if (healthPercent <= 0.4 && boss.phase < 4) newPhase = 4;
    else if (healthPercent <= 0.2 && boss.phase < 5) newPhase = 5;
    else if (healthPercent <= 0.1 && boss.phase < 6) newPhase = 6;

    if (newPhase !== boss.phase) {
      boss.phase = newPhase;
      this.bossPhase = newPhase;
      this.triggerPhaseTransition(game);
    }
  }

  /**
   * Trigger phase transition effects
   */
  triggerPhaseTransition(game) {
    const boss = this.currentBoss;
    
    // Visual effect - screen shake
    game.screenShakeX = Math.random() * 10 - 5;
    game.screenShakeY = Math.random() * 10 - 5;

    // Make boss temporarily invulnerable
    boss.isInvulnerable = true;
    this.phaseTransitionActive = true;
    
    setTimeout(() => {
      boss.isInvulnerable = false;
      this.phaseTransitionActive = false;
    }, 1000);

    // Activate new ability
    this.activateRandomAbility(game);

    // Create particles
    for (let i = 0; i < 20; i++) {
      game.particles.push({
        x: boss.x + boss.width / 2,
        y: boss.y + boss.height / 2,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8,
        life: 30,
        maxLife: 30,
        size: 4,
        color: boss.color
      });
    }
  }

  /**
   * Update boss movement
   */
  updateMovement(deltaTime, canvas) {
    const boss = this.currentBoss;
    const pattern = BOSS_ATTACK_PATTERNS[boss.attackPattern];

    switch (pattern?.movementPattern) {
      case 'zigzag':
        boss.x += boss.direction * boss.speed;
        if (boss.x <= 0 || boss.x >= canvas.width - boss.width) {
          boss.direction *= -1;
        }
        break;

      case 'spiral':
        const spiralTime = Date.now() / 1000;
        boss.x = canvas.width / 2 + Math.cos(spiralTime) * 100 - boss.width / 2;
        boss.y = boss.targetY + Math.sin(spiralTime * 2) * 30;
        break;

      case 'chaos':
        if (Date.now() - boss.lastMove > 2000) {
          boss.vx = (Math.random() - 0.5) * 4;
          boss.vy = (Math.random() - 0.5) * 2;
          boss.lastMove = Date.now();
        }
        boss.x += boss.vx;
        boss.y += boss.vy;
        boss.x = Math.max(0, Math.min(canvas.width - boss.width, boss.x));
        boss.y = Math.max(0, Math.min(150, boss.y));
        break;

      case 'tactical':
        // Move towards player but stay at top
        if (Date.now() - boss.lastMove > 1000) {
          boss.direction = Math.random() > 0.5 ? 1 : -1;
          boss.lastMove = Date.now();
        }
        boss.x += boss.direction * boss.speed * 1.5;
        boss.x = Math.max(0, Math.min(canvas.width - boss.width, boss.x));
        break;

      case 'guardian':
        // Slow circular movement
        const guardianTime = Date.now() / 2000;
        boss.x = canvas.width / 2 + Math.sin(guardianTime) * 80 - boss.width / 2;
        break;

      default:
        // Simple horizontal movement
        boss.x += boss.direction * boss.speed;
        if (boss.x <= 0 || boss.x >= canvas.width - boss.width) {
          boss.direction *= -1;
        }
    }
  }

  /**
   * Update special abilities
   */
  updateAbilities(deltaTime, game) {
    const now = Date.now();
    
    // Activate ability every 5 seconds
    if (now - this.lastAbilityTime > 5000 && !this.abilityActive) {
      this.activateRandomAbility(game);
      this.lastAbilityTime = now;
    }
  }

  /**
   * Activate random special ability
   */
  activateRandomAbility(game) {
    const boss = this.currentBoss;
    if (!boss || !boss.specialAbilities) return;

    const ability = boss.specialAbilities[Math.floor(Math.random() * boss.specialAbilities.length)];
    const abilityData = BOSS_SPECIAL_ABILITIES[ability];

    if (!abilityData) return;

    this.abilityActive = true;
    this.abilityType = ability;

    // Execute ability effect
    switch (ability) {
      case 'rapid_fire':
        boss.lastShot = 0; // Reset shot timer for rapid fire
        break;

      case 'shield_burst':
        this.createShieldBurst(game);
        break;

      case 'teleport':
        if (this.teleportCooldown <= 0) {
          this.teleportBoss(game);
          this.teleportCooldown = 3000;
        }
        break;

      case 'summon_drones':
        this.summonDrones(game);
        break;

      case 'energy_wave':
        this.createEnergyWave(game);
        break;

      case 'phase_shift':
        boss.isInvulnerable = true;
        setTimeout(() => {
          boss.isInvulnerable = false;
        }, abilityData.duration);
        break;

      case 'summon_army':
        this.summonArmy(game);
        break;

      default:
        break;
    }

    // Deactivate after duration
    setTimeout(() => {
      this.abilityActive = false;
      this.abilityType = null;
    }, abilityData?.duration || 2000);
  }

  /**
   * Boss shooting logic
   */
  updateShooting(deltaTime, game, canvas) {
    const boss = this.currentBoss;
    const now = Date.now();
    const pattern = BOSS_ATTACK_PATTERNS[boss.attackPattern];

    let fireRate = pattern?.fireRate || 500;
    
    // Rapid fire ability
    if (this.abilityType === 'rapid_fire') {
      fireRate *= 0.3;
    }

    // Increase fire rate per phase
    fireRate *= Math.max(0.5, 1 - (boss.phase - 1) * 0.1);

    if (now - boss.lastShot > fireRate && game.enemyBullets.length < 30) {
      const bulletCount = pattern?.bulletCount || 3;
      const bulletSpeed = pattern?.bulletSpeed || 4;

      for (let i = 0; i < bulletCount; i++) {
        const angle = (Math.PI / (bulletCount + 1)) * (i + 1);
        const vx = Math.sin(angle) * bulletSpeed - bulletSpeed / 2;
        const vy = Math.cos(angle) * bulletSpeed + 2;

        game.enemyBullets.push({
          x: boss.x + boss.width / 2,
          y: boss.y + boss.height,
          width: 6,
          height: 12,
          vx: vx,
          vy: vy,
          color: boss.color
        });
      }

      boss.lastShot = now;
    }
  }

  /**
   * Create shield burst effect
   */
  createShieldBurst(game) {
    const boss = this.currentBoss;
    
    for (let i = 0; i < 360; i += 15) {
      const angle = (i * Math.PI) / 180;
      game.enemyBullets.push({
        x: boss.x + boss.width / 2,
        y: boss.y + boss.height / 2,
        width: 8,
        height: 8,
        vx: Math.cos(angle) * 3,
        vy: Math.sin(angle) * 3,
        color: '#00ffff'
      });
    }
  }

  /**
   * Teleport boss to random position
   */
  teleportBoss(game) {
    const boss = this.currentBoss;
    const canvas = game.canvas || { width: 800, height: 700 };
    
    // Particle effect at old position
    for (let i = 0; i < 15; i++) {
      game.particles.push({
        x: boss.x + boss.width / 2,
        y: boss.y + boss.height / 2,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        life: 20,
        maxLife: 20,
        size: 3,
        color: '#8b00ff'
      });
    }

    // Teleport
    boss.x = Math.random() * (canvas.width - boss.width);
    boss.y = 30 + Math.random() * 80;

    // Particle effect at new position
    for (let i = 0; i < 15; i++) {
      game.particles.push({
        x: boss.x + boss.width / 2,
        y: boss.y + boss.height / 2,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        life: 20,
        maxLife: 20,
        size: 3,
        color: '#8b00ff'
      });
    }
  }

  /**
   * Summon attack drones
   */
  summonDrones(game) {
    const boss = this.currentBoss;
    const droneCount = 3 + Math.floor(Math.random() * 3);

    for (let i = 0; i < droneCount; i++) {
      game.enemies.push({
        x: boss.x + (boss.width / droneCount) * i,
        y: boss.y + boss.height + 20,
        width: 25,
        height: 25,
        speed: 2,
        type: 'fast',
        color: '#ff00ff',
        behavior: 'shooter',
        lastShot: 0,
        isDrone: true
      });
    }
  }

  /**
   * Create energy wave attack
   */
  createEnergyWave(game) {
    const boss = this.currentBoss;
    const canvas = game.canvas || { width: 800 };

    // Create horizontal wave
    for (let x = 0; x < canvas.width; x += 20) {
      game.enemyBullets.push({
        x: x,
        y: boss.y + boss.height + 20,
        width: 18,
        height: 10,
        vx: 0,
        vy: 4,
        color: '#ffff00'
      });
    }
  }

  /**
   * Summon army of enemies
   */
  summonArmy(game) {
    const boss = this.currentBoss;
    const canvas = game.canvas || { width: 800 };

    for (let i = 0; i < 8; i++) {
      game.enemies.push({
        x: (canvas.width / 9) * (i + 1),
        y: boss.y + boss.height + 30,
        width: 28,
        height: 28,
        speed: 1.5,
        type: 'normal',
        color: '#ff0000',
        behavior: null,
        lastShot: 0
      });
    }
  }

  /**
   * Deal damage to boss
   */
  damage(amount) {
    if (!this.currentBoss || this.currentBoss.isInvulnerable) return false;
    
    this.currentBoss.health -= amount;
    return this.currentBoss.health <= 0;
  }

  /**
   * Render boss
   */
  render(ctx) {
    if (!this.currentBoss) return;

    const boss = this.currentBoss;

    ctx.save();

    // Phase transition flash
    if (this.phaseTransitionActive) {
      boss.alpha = 0.5 + Math.sin(Date.now() / 100) * 0.5;
    } else {
      boss.alpha = 1;
    }

    ctx.globalAlpha = boss.alpha;

    // Invulnerability shield
    if (boss.isInvulnerable) {
      ctx.strokeStyle = '#00ffff';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(
        boss.x + boss.width / 2,
        boss.y + boss.height / 2,
        boss.width / 2 + 10,
        0,
        Math.PI * 2
      );
      ctx.stroke();
    }

    // Boss body
    ctx.fillStyle = boss.color;
    ctx.beginPath();
    ctx.moveTo(boss.x + boss.width / 2, boss.y);
    ctx.lineTo(boss.x + boss.width, boss.y + boss.height);
    ctx.lineTo(boss.x, boss.y + boss.height);
    ctx.closePath();
    ctx.fill();

    // Boss glow effect
    const gradient = ctx.createRadialGradient(
      boss.x + boss.width / 2,
      boss.y + boss.height / 2,
      0,
      boss.x + boss.width / 2,
      boss.y + boss.height / 2,
      boss.width
    );
    gradient.addColorStop(0, boss.color);
    gradient.addColorStop(1, 'transparent');
    ctx.fillStyle = gradient;
    ctx.fillRect(boss.x - 20, boss.y - 20, boss.width + 40, boss.height + 40);

    // Boss name
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(boss.name, boss.x + boss.width / 2, boss.y - 10);

    // Health bar
    this.renderHealthBar(ctx);

    ctx.restore();
  }

  /**
   * Render boss health bar
   */
  renderHealthBar(ctx) {
    const boss = this.currentBoss;
    const barWidth = 200;
    const barHeight = 20;
    const x = boss.x + boss.width / 2 - barWidth / 2;
    const y = boss.y - 40;

    // Background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(x, y, barWidth, barHeight);

    // Health
    const healthPercent = boss.health / boss.maxHealth;
    const healthWidth = barWidth * healthPercent;
    
    let healthColor = '#00ff00';
    if (healthPercent < 0.3) healthColor = '#ff0000';
    else if (healthPercent < 0.6) healthColor = '#ffff00';

    ctx.fillStyle = healthColor;
    ctx.fillRect(x, y, healthWidth, barHeight);

    // Border
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, barWidth, barHeight);

    // Phase indicators
    for (let i = 1; i < boss.maxPhase; i++) {
      const phaseX = x + (barWidth / boss.maxPhase) * i;
      ctx.strokeStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(phaseX, y);
      ctx.lineTo(phaseX, y + barHeight);
      ctx.stroke();
    }

    // Health text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(
      `${Math.ceil(boss.health)}/${boss.maxHealth}`,
      x + barWidth / 2,
      y + barHeight / 2 + 4
    );
  }

  /**
   * Reset boss system
   */
  reset() {
    this.currentBoss = null;
    this.bossPhase = 1;
    this.lastAbilityTime = 0;
    this.abilityActive = false;
    this.abilityType = null;
    this.spawnedDrones = [];
    this.teleportCooldown = 0;
    this.phaseTransitionActive = false;
  }

  /**
   * Get boss data
   */
  getBoss() {
    return this.currentBoss;
  }

  /**
   * Check if boss is active
   */
  isActive() {
    return this.currentBoss !== null;
  }
}

export const bossSystem = new BossSystem();

