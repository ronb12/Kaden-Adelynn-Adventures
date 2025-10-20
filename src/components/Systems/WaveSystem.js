/**
 * WaveSystem - Manages wave-based progression with formations and bonuses
 */

export class WaveSystem {
  constructor() {
    this.currentWave = 0;
    this.waveActive = false;
    this.waveComplete = false;
    this.waveTimer = 0;
    this.waveDuration = 30000; // 30 seconds per wave
    this.enemiesKilled = 0;
    this.enemiesRequired = 0;
    this.waveBonus = 0;
    this.showWaveComplete = false;
    this.betweenWaves = false;
    this.betweenWaveTimer = 0;
    this.betweenWaveDuration = 5000; // 5 seconds between waves
    this.formations = [];
    this.nextFormationTime = 0;
  }

  /**
   * Start a new wave
   */
  startWave(waveNumber = null) {
    if (waveNumber !== null) {
      this.currentWave = waveNumber;
    } else {
      this.currentWave++;
    }

    this.waveActive = true;
    this.waveComplete = false;
    this.waveTimer = 0;
    this.enemiesKilled = 0;
    this.enemiesRequired = 10 + (this.currentWave * 5); // Increasing enemies per wave
    this.betweenWaves = false;
    this.formations = this.generateFormations();
    this.nextFormationTime = 2000; // First formation after 2 seconds

    return {
      waveNumber: this.currentWave,
      enemiesRequired: this.enemiesRequired,
      waveType: this.getWaveType()
    };
  }

  /**
   * Update wave state
   */
  update(deltaTime, game) {
    if (this.betweenWaves) {
      this.betweenWaveTimer += deltaTime;
      if (this.betweenWaveTimer >= this.betweenWaveDuration) {
        this.startWave();
      }
      return;
    }

    if (!this.waveActive) return;

    this.waveTimer += deltaTime;

    // Spawn formations
    if (this.waveTimer >= this.nextFormationTime && this.formations.length > 0) {
      const formation = this.formations.shift();
      this.spawnFormation(formation, game);
      this.nextFormationTime = this.waveTimer + 3000 + Math.random() * 2000;
    }

    // Check wave completion
    if (this.enemiesKilled >= this.enemiesRequired) {
      this.completeWave(game);
    }
  }

  /**
   * Generate enemy formations for this wave
   */
  generateFormations() {
    const formations = [];
    const formationCount = 3 + Math.floor(this.currentWave / 3);

    for (let i = 0; i < formationCount; i++) {
      const type = this.getRandomFormationType();
      formations.push({
        type: type,
        enemyType: this.getWaveEnemyType(),
        count: this.getFormationSize(type)
      });
    }

    return formations;
  }

  /**
   * Get random formation type
   */
  getRandomFormationType() {
    const types = ['line', 'v-formation', 'circle', 'wave', 'pincer', 'wall', 'diagonal'];
    
    // Unlock more complex formations at higher waves
    if (this.currentWave < 3) {
      return types[Math.floor(Math.random() * 3)]; // Only basic formations
    } else if (this.currentWave < 7) {
      return types[Math.floor(Math.random() * 5)];
    }
    
    return types[Math.floor(Math.random() * types.length)];
  }

  /**
   * Get formation size
   */
  getFormationSize(type) {
    switch (type) {
      case 'line': return 5 + this.currentWave;
      case 'v-formation': return 7;
      case 'circle': return 8;
      case 'wave': return 6 + Math.floor(this.currentWave / 2);
      case 'pincer': return 10;
      case 'wall': return 12 + this.currentWave;
      case 'diagonal': return 6;
      default: return 5;
    }
  }

  /**
   * Get enemy type for this wave
   */
  getWaveEnemyType() {
    const rand = Math.random();
    const wave = this.currentWave;

    if (wave < 3) {
      return rand < 0.7 ? 'normal' : 'fast';
    } else if (wave < 6) {
      if (rand < 0.4) return 'normal';
      if (rand < 0.7) return 'fast';
      return 'strong';
    } else if (wave < 10) {
      if (rand < 0.3) return 'normal';
      if (rand < 0.5) return 'fast';
      if (rand < 0.7) return 'strong';
      return 'zigzag';
    } else {
      const types = ['normal', 'fast', 'strong', 'zigzag', 'kamikaze', 'shooter'];
      return types[Math.floor(Math.random() * types.length)];
    }
  }

  /**
   * Spawn formation of enemies
   */
  spawnFormation(formation, game) {
    const canvas = game.canvas || { width: 800, height: 700 };
    const { type, enemyType, count } = formation;

    const enemies = [];
    const enemySize = this.getEnemySizeForType(enemyType);
    const enemySpeed = this.getEnemySpeedForType(enemyType) * (1 + this.currentWave * 0.05);
    const enemyColor = this.getEnemyColorForType(enemyType);

    switch (type) {
      case 'line':
        for (let i = 0; i < count; i++) {
          enemies.push({
            x: (canvas.width / (count + 1)) * (i + 1) - enemySize / 2,
            y: -enemySize - i * 30,
            width: enemySize,
            height: enemySize,
            speed: enemySpeed,
            type: enemyType,
            color: enemyColor,
            lastShot: 0,
            behavior: this.getBehaviorForType(enemyType),
            zigzagOffset: Math.random() * Math.PI * 2,
            originalX: (canvas.width / (count + 1)) * (i + 1) - enemySize / 2
          });
        }
        break;

      case 'v-formation':
        const vCenter = canvas.width / 2;
        for (let i = 0; i < count; i++) {
          const side = i % 2 === 0 ? 1 : -1;
          const offset = Math.floor(i / 2) * 40;
          enemies.push({
            x: vCenter + (side * offset) - enemySize / 2,
            y: -enemySize - Math.floor(i / 2) * 35,
            width: enemySize,
            height: enemySize,
            speed: enemySpeed,
            type: enemyType,
            color: enemyColor,
            lastShot: 0,
            behavior: this.getBehaviorForType(enemyType),
            zigzagOffset: Math.random() * Math.PI * 2,
            originalX: vCenter + (side * offset) - enemySize / 2
          });
        }
        break;

      case 'circle':
        const circleRadius = 80;
        const circleCenterX = canvas.width / 2;
        const circleCenterY = -100;
        for (let i = 0; i < count; i++) {
          const angle = (Math.PI * 2 / count) * i;
          const x = circleCenterX + Math.cos(angle) * circleRadius;
          const y = circleCenterY + Math.sin(angle) * circleRadius;
          enemies.push({
            x: x - enemySize / 2,
            y: y,
            width: enemySize,
            height: enemySize,
            speed: enemySpeed,
            type: enemyType,
            color: enemyColor,
            lastShot: 0,
            behavior: this.getBehaviorForType(enemyType),
            zigzagOffset: angle,
            originalX: x - enemySize / 2
          });
        }
        break;

      case 'wave':
        for (let i = 0; i < count; i++) {
          const waveOffset = Math.sin((i / count) * Math.PI * 2) * 50;
          enemies.push({
            x: (canvas.width / (count + 1)) * (i + 1) - enemySize / 2,
            y: -enemySize + waveOffset - i * 25,
            width: enemySize,
            height: enemySize,
            speed: enemySpeed,
            type: enemyType,
            color: enemyColor,
            lastShot: 0,
            behavior: this.getBehaviorForType(enemyType),
            zigzagOffset: (i / count) * Math.PI * 2,
            originalX: (canvas.width / (count + 1)) * (i + 1) - enemySize / 2
          });
        }
        break;

      case 'pincer':
        const halfCount = Math.floor(count / 2);
        for (let i = 0; i < halfCount; i++) {
          // Left side
          enemies.push({
            x: i * 40,
            y: -enemySize - i * 30,
            width: enemySize,
            height: enemySize,
            speed: enemySpeed,
            type: enemyType,
            color: enemyColor,
            lastShot: 0,
            behavior: this.getBehaviorForType(enemyType),
            zigzagOffset: Math.random() * Math.PI * 2,
            originalX: i * 40
          });
          // Right side
          enemies.push({
            x: canvas.width - (i + 1) * 40,
            y: -enemySize - i * 30,
            width: enemySize,
            height: enemySize,
            speed: enemySpeed,
            type: enemyType,
            color: enemyColor,
            lastShot: 0,
            behavior: this.getBehaviorForType(enemyType),
            zigzagOffset: Math.random() * Math.PI * 2,
            originalX: canvas.width - (i + 1) * 40
          });
        }
        break;

      case 'wall':
        const rows = 2;
        const cols = Math.ceil(count / rows);
        for (let row = 0; row < rows; row++) {
          for (let col = 0; col < cols && row * cols + col < count; col++) {
            enemies.push({
              x: (canvas.width / (cols + 1)) * (col + 1) - enemySize / 2,
              y: -enemySize - row * 45,
              width: enemySize,
              height: enemySize,
              speed: enemySpeed,
              type: enemyType,
              color: enemyColor,
              lastShot: 0,
              behavior: this.getBehaviorForType(enemyType),
              zigzagOffset: Math.random() * Math.PI * 2,
              originalX: (canvas.width / (cols + 1)) * (col + 1) - enemySize / 2
            });
          }
        }
        break;

      case 'diagonal':
        for (let i = 0; i < count; i++) {
          enemies.push({
            x: i * 60,
            y: -enemySize - i * 50,
            width: enemySize,
            height: enemySize,
            speed: enemySpeed,
            type: enemyType,
            color: enemyColor,
            lastShot: 0,
            behavior: this.getBehaviorForType(enemyType),
            zigzagOffset: Math.random() * Math.PI * 2,
            originalX: i * 60
          });
        }
        break;
    }

    // Add enemies to game
    enemies.forEach(enemy => {
      game.enemies.push(enemy);
    });
  }

  /**
   * Get enemy size for type
   */
  getEnemySizeForType(type) {
    const sizes = {
      normal: 30,
      fast: 25,
      strong: 40,
      zigzag: 28,
      kamikaze: 22,
      shooter: 32
    };
    return sizes[type] || 30;
  }

  /**
   * Get enemy speed for type
   */
  getEnemySpeedForType(type) {
    const speeds = {
      normal: 1.5,
      fast: 3,
      strong: 1,
      zigzag: 2,
      kamikaze: 4,
      shooter: 1.2
    };
    return speeds[type] || 1.5;
  }

  /**
   * Get enemy color for type
   */
  getEnemyColorForType(type) {
    const colors = {
      normal: '#ff0000',
      fast: '#ff6600',
      strong: '#cc0000',
      zigzag: '#ff00ff',
      kamikaze: '#ffff00',
      shooter: '#00ff00'
    };
    return colors[type] || '#ff0000';
  }

  /**
   * Get behavior for enemy type
   */
  getBehaviorForType(type) {
    const behaviors = {
      zigzag: 'zigzag',
      kamikaze: 'kamikaze',
      shooter: 'shooter'
    };
    return behaviors[type] || null;
  }

  /**
   * Register enemy kill
   */
  registerKill() {
    if (this.waveActive) {
      this.enemiesKilled++;
    }
  }

  /**
   * Complete current wave
   */
  completeWave(game) {
    this.waveActive = false;
    this.waveComplete = true;
    this.showWaveComplete = true;

    // Calculate wave bonus
    this.waveBonus = 500 + (this.currentWave * 200);
    game.score += this.waveBonus;

    // Grant wave completion rewards
    this.grantWaveRewards(game);

    // Hide wave complete message after 3 seconds
    setTimeout(() => {
      this.showWaveComplete = false;
      this.betweenWaves = true;
      this.betweenWaveTimer = 0;
    }, 3000);

    // Boss wave every 5 waves
    if (this.currentWave % 5 === 0) {
      return { bossWave: true, waveNumber: this.currentWave };
    }

    return { waveComplete: true, waveNumber: this.currentWave, bonus: this.waveBonus };
  }

  /**
   * Grant rewards for completing wave
   */
  grantWaveRewards(game) {
    // Restore some health
    if (game.player && game.player.health < game.player.maxHealth) {
      game.player.health = Math.min(
        game.player.health + 25,
        game.player.maxHealth
      );
    }

    // Grant power-up every 3 waves
    if (this.currentWave % 3 === 0) {
      const canvas = game.canvas || { width: 800 };
      game.powerUps.push({
        x: canvas.width / 2,
        y: 100,
        width: 30,
        height: 30,
        type: 'multiShot',
        color: '#ff00ff',
        symbol: '⚡'
      });
    }
  }

  /**
   * Get wave type description
   */
  getWaveType() {
    if (this.currentWave % 5 === 0) return 'BOSS WAVE';
    if (this.currentWave % 3 === 0) return 'ELITE WAVE';
    if (this.currentWave < 3) return 'STANDARD';
    if (this.currentWave < 7) return 'ADVANCED';
    if (this.currentWave < 10) return 'EXPERT';
    return 'MASTER';
  }

  /**
   * Render wave UI
   */
  render(ctx, canvas) {
    // Wave number display
    if (this.waveActive || this.betweenWaves) {
      ctx.save();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(10, 50, 200, 80);

      ctx.strokeStyle = '#00ffff';
      ctx.lineWidth = 2;
      ctx.strokeRect(10, 50, 200, 80);

      ctx.fillStyle = '#00ffff';
      ctx.font = 'bold 20px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(`Wave ${this.currentWave}`, 20, 75);

      ctx.font = '14px Arial';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(`Type: ${this.getWaveType()}`, 20, 95);
      
      if (this.waveActive) {
        ctx.fillText(
          `Enemies: ${this.enemiesKilled}/${this.enemiesRequired}`,
          20,
          115
        );
      } else if (this.betweenWaves) {
        const timeLeft = Math.ceil((this.betweenWaveDuration - this.betweenWaveTimer) / 1000);
        ctx.fillStyle = '#ffff00';
        ctx.fillText(`Next wave in: ${timeLeft}s`, 20, 115);
      }

      ctx.restore();
    }

    // Wave complete notification
    if (this.showWaveComplete) {
      ctx.save();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.fillRect(canvas.width / 2 - 200, canvas.height / 2 - 100, 400, 200);

      ctx.strokeStyle = '#00ff00';
      ctx.lineWidth = 3;
      ctx.strokeRect(canvas.width / 2 - 200, canvas.height / 2 - 100, 400, 200);

      ctx.fillStyle = '#00ff00';
      ctx.font = 'bold 36px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('WAVE COMPLETE!', canvas.width / 2, canvas.height / 2 - 40);

      ctx.fillStyle = '#ffff00';
      ctx.font = 'bold 24px Arial';
      ctx.fillText(`Bonus: +${this.waveBonus}`, canvas.width / 2, canvas.height / 2);

      ctx.fillStyle = '#ffffff';
      ctx.font = '18px Arial';
      ctx.fillText(`Wave ${this.currentWave} Cleared`, canvas.width / 2, canvas.height / 2 + 40);

      ctx.restore();
    }
  }

  /**
   * Reset wave system
   */
  reset() {
    this.currentWave = 0;
    this.waveActive = false;
    this.waveComplete = false;
    this.waveTimer = 0;
    this.enemiesKilled = 0;
    this.enemiesRequired = 0;
    this.waveBonus = 0;
    this.showWaveComplete = false;
    this.betweenWaves = false;
    this.betweenWaveTimer = 0;
    this.formations = [];
    this.nextFormationTime = 0;
  }

  /**
   * Get wave statistics
   */
  getStats() {
    return {
      currentWave: this.currentWave,
      waveActive: this.waveActive,
      enemiesKilled: this.enemiesKilled,
      enemiesRequired: this.enemiesRequired,
      waveType: this.getWaveType(),
      progress: this.waveActive ? (this.enemiesKilled / this.enemiesRequired) : 0
    };
  }
}

export const waveSystem = new WaveSystem();

