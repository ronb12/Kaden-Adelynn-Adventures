/**
 * TestPlayerSystem - Dev tools for testing all game features
 */

export class TestPlayerSystem {
  constructor() {
    this.enabled = false;
    this.godMode = false;
    this.autoFire = false;
    this.showHitboxes = false;
    this.showStats = true;
    this.spawnRate = 1;
    this.timeScale = 1;
    this.testScenarios = this.initializeScenarios();
    this.quickCommands = this.initializeQuickCommands();
    this.logMessages = [];
    this.maxLogMessages = 10;
  }

  /**
   * Initialize test scenarios
   */
  initializeScenarios() {
    return {
      bossTest: {
        name: 'Boss Battle Test',
        description: 'Spawn boss immediately with full power-ups',
        action: (game) => {
          game.score = 1000;
          this.giveAllPowerUps(game);
          this.log('Boss battle scenario activated');
        }
      },

      waveTest: {
        name: 'Wave System Test',
        description: 'Start wave 5 with mixed enemies',
        action: (game) => {
          if (game.waveSystem) {
            game.waveSystem.startWave(5);
            this.log('Started wave 5');
          }
        }
      },

      ultimateTest: {
        name: 'Ultimate Ability Test',
        description: 'Fill ultimate charge',
        action: (game) => {
          if (game.ultimateSystem) {
            game.ultimateSystem.charge = game.ultimateSystem.maxCharge;
            this.log('Ultimate ready!');
          }
        }
      },

      hazardTest: {
        name: 'Environmental Hazards Test',
        description: 'Spawn all hazard types',
        action: (game) => {
          if (game.environmentSystem) {
            game.environmentSystem.spawnAsteroid(game.canvas);
            game.environmentSystem.spawnBlackHole(game.canvas);
            game.environmentSystem.startMeteorShower(game.canvas);
            this.log('Spawned all environmental hazards');
          }
        }
      },

      comboTest: {
        name: 'Power-up Combo Test',
        description: 'Activate all power-ups for combos',
        action: (game) => {
          this.giveAllPowerUps(game);
          this.log('All power-ups activated');
        }
      },

      shopTest: {
        name: 'Shop System Test',
        description: 'Add 10,000 credits',
        action: (game) => {
          if (game.shopSystem) {
            game.shopSystem.addCurrency(10000);
            this.log('Added 10,000 credits');
          }
        }
      },

      endlessTest: {
        name: 'Endless Mode Test',
        description: 'Start endless mode at level 10',
        action: (game) => {
          if (game.challengeSystem) {
            game.challengeSystem.startChallenge('endless');
            game.challengeSystem.endlessStats.currentLevel = 10;
            this.log('Endless mode level 10');
          }
        }
      },

      stressTest: {
        name: 'Performance Stress Test',
        description: 'Spawn 50 enemies',
        action: (game) => {
          for (let i = 0; i < 50; i++) {
            this.spawnTestEnemy(game);
          }
          this.log('Spawned 50 enemies');
        }
      }
    };
  }

  /**
   * Initialize quick commands
   */
  initializeQuickCommands() {
    return {
      // Key bindings for quick actions
      KeyG: { name: 'Toggle God Mode', action: () => this.toggleGodMode() },
      KeyH: { name: 'Toggle Hitboxes', action: () => this.toggleHitboxes() },
      KeyU: { name: 'Fill Ultimate', action: (game) => this.fillUltimate(game) },
      KeyB: { name: 'Spawn Boss', action: (game) => this.spawnBoss(game) },
      KeyP: { name: 'Add Power-ups', action: (game) => this.giveAllPowerUps(game) },
      KeyM: { name: 'Add 1000 Credits', action: (game) => this.addCredits(game, 1000) },
      KeyK: { name: 'Kill All Enemies', action: (game) => this.killAllEnemies(game) },
      KeyL: { name: 'Add Lives', action: (game) => this.addLives(game) },
      KeyT: { name: 'Toggle Stats', action: () => this.toggleStats() },
      Digit1: { name: 'Time Scale 0.5x', action: () => this.setTimeScale(0.5) },
      Digit2: { name: 'Time Scale 1x', action: () => this.setTimeScale(1) },
      Digit3: { name: 'Time Scale 2x', action: () => this.setTimeScale(2) }
    };
  }

  /**
   * Toggle test player mode
   */
  toggle() {
    this.enabled = !this.enabled;
    this.log(this.enabled ? 'Test Player Mode ENABLED' : 'Test Player Mode DISABLED');
    return this.enabled;
  }

  /**
   * Toggle god mode
   */
  toggleGodMode() {
    this.godMode = !this.godMode;
    this.log(`God Mode: ${this.godMode ? 'ON' : 'OFF'}`);
  }

  /**
   * Toggle hitbox display
   */
  toggleHitboxes() {
    this.showHitboxes = !this.showHitboxes;
    this.log(`Hitboxes: ${this.showHitboxes ? 'VISIBLE' : 'HIDDEN'}`);
  }

  /**
   * Toggle stats display
   */
  toggleStats() {
    this.showStats = !this.showStats;
    this.log(`Stats: ${this.showStats ? 'VISIBLE' : 'HIDDEN'}`);
  }

  /**
   * Set time scale
   */
  setTimeScale(scale) {
    this.timeScale = scale;
    this.log(`Time Scale: ${scale}x`);
  }

  /**
   * Fill ultimate charge
   */
  fillUltimate(game) {
    if (game.ultimateSystem) {
      game.ultimateSystem.charge = game.ultimateSystem.maxCharge;
      this.log('Ultimate charged!');
    }
  }

  /**
   * Spawn boss
   */
  spawnBoss(game) {
    if (game.bossSystem) {
      const boss = game.bossSystem.spawnBoss(game.score || 1000, game.canvas);
      game.bossActive = true;
      this.log(`Spawned boss: ${boss.name}`);
    }
  }

  /**
   * Give all power-ups
   */
  giveAllPowerUps(game) {
    if (game.powerUpComboSystem) {
      game.powerUpComboSystem.addPowerUp('rapidFire', 10000);
      game.powerUpComboSystem.addPowerUp('multiShot', 10000);
      game.powerUpComboSystem.addPowerUp('shield', 10000);
      game.powerUpComboSystem.addPowerUp('speed', 10000);
      this.log('Activated all power-ups');
    }
  }

  /**
   * Add credits
   */
  addCredits(game, amount) {
    if (game.shopSystem) {
      game.shopSystem.addCurrency(amount);
      this.log(`Added ${amount} credits`);
    }
  }

  /**
   * Kill all enemies
   */
  killAllEnemies(game) {
    const count = game.enemies.length;
    game.enemies.forEach(enemy => {
      for (let i = 0; i < 5; i++) {
        game.particles.push({
          x: enemy.x + enemy.width / 2,
          y: enemy.y + enemy.height / 2,
          vx: (Math.random() - 0.5) * 6,
          vy: (Math.random() - 0.5) * 6,
          life: 20,
          maxLife: 20,
          size: 3,
          color: enemy.color
        });
      }
    });
    game.enemies = [];
    game.enemyBullets = [];
    this.log(`Killed ${count} enemies`);
  }

  /**
   * Add lives
   */
  addLives(game) {
    if (game.player) {
      game.player.lives += 5;
      this.log('Added 5 lives');
    }
  }

  /**
   * Spawn test enemy
   */
  spawnTestEnemy(game) {
    const canvas = game.canvas || { width: 800, height: 700 };
    const types = ['normal', 'fast', 'strong', 'zigzag', 'kamikaze', 'shooter'];
    const type = types[Math.floor(Math.random() * types.length)];

    game.enemies.push({
      x: Math.random() * (canvas.width - 30),
      y: Math.random() * 200,
      width: 30,
      height: 30,
      speed: 2,
      type: type,
      color: '#ff0000',
      lastShot: 0,
      behavior: null,
      zigzagOffset: Math.random() * Math.PI * 2,
      originalX: Math.random() * (canvas.width - 30)
    });
  }

  /**
   * Run test scenario
   */
  runScenario(scenarioKey, game) {
    const scenario = this.testScenarios[scenarioKey];
    if (scenario) {
      scenario.action(game);
    }
  }

  /**
   * Handle keyboard input
   */
  handleKeyPress(event, game) {
    if (!this.enabled) return false;

    const command = this.quickCommands[event.code];
    if (command) {
      command.action(game);
      return true;
    }

    return false;
  }

  /**
   * Apply god mode effects
   */
  applyGodMode(game) {
    if (this.godMode && game.player) {
      game.player.health = game.player.maxHealth;
      game.respawnInvincible = 1000; // Always invincible
    }
  }

  /**
   * Apply time scale
   */
  applyTimeScale(game) {
    if (game.gameSpeed !== undefined) {
      game.gameSpeed = this.timeScale;
    }
  }

  /**
   * Log message
   */
  log(message) {
    const timestamp = new Date().toLocaleTimeString();
    this.logMessages.push({ time: timestamp, message: message });
    if (this.logMessages.length > this.maxLogMessages) {
      this.logMessages.shift();
    }
    console.log(`[TestPlayer] ${message}`);
  }

  /**
   * Render dev UI
   */
  render(ctx, canvas, game) {
    if (!this.enabled) return;

    ctx.save();

    // Test player indicator
    ctx.fillStyle = 'rgba(255, 0, 0, 0.8)';
    ctx.fillRect(10, 10, 200, 30);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.strokeRect(10, 10, 200, 30);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('🔧 TEST PLAYER MODE', 20, 30);

    // Stats panel
    if (this.showStats) {
      this.renderStatsPanel(ctx, canvas, game);
    }

    // Quick commands help
    this.renderQuickCommands(ctx, canvas);

    // Log messages
    this.renderLogMessages(ctx, canvas);

    // God mode indicator
    if (this.godMode) {
      ctx.fillStyle = 'rgba(255, 215, 0, 0.3)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.fillStyle = '#ffd700';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('⚡ GOD MODE ⚡', canvas.width / 2, 50);
    }

    // Hitboxes
    if (this.showHitboxes) {
      this.renderHitboxes(ctx, game);
    }

    // Time scale indicator
    if (this.timeScale !== 1) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(canvas.width / 2 - 100, canvas.height - 40, 200, 30);
      ctx.strokeStyle = '#00ffff';
      ctx.lineWidth = 2;
      ctx.strokeRect(canvas.width / 2 - 100, canvas.height - 40, 200, 30);
      ctx.fillStyle = '#00ffff';
      ctx.font = 'bold 18px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`Time: ${this.timeScale}x`, canvas.width / 2, canvas.height - 18);
    }

    ctx.restore();
  }

  /**
   * Render stats panel
   */
  renderStatsPanel(ctx, canvas, game) {
    const stats = [
      `FPS: ${game.fps || 0}`,
      `Enemies: ${game.enemies?.length || 0}`,
      `Bullets: ${game.bullets?.length || 0}`,
      `Particles: ${game.particles?.length || 0}`,
      `Score: ${game.score || 0}`,
      `Credits: ${game.shopSystem?.currency || 0}`,
      `Wave: ${game.waveSystem?.currentWave || 0}`,
      `Ult: ${game.ultimateSystem?.charge || 0}%`
    ];

    const panelWidth = 180;
    const panelHeight = 20 + stats.length * 18;
    const x = canvas.width - panelWidth - 10;
    const y = 50;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(x, y, panelWidth, panelHeight);

    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, panelWidth, panelHeight);

    ctx.fillStyle = '#00ff00';
    ctx.font = '12px monospace';
    ctx.textAlign = 'left';

    stats.forEach((stat, i) => {
      ctx.fillText(stat, x + 10, y + 18 + i * 18);
    });
  }

  /**
   * Render quick commands
   */
  renderQuickCommands(ctx, canvas) {
    const commands = [
      'G: God Mode',
      'H: Hitboxes',
      'U: Ultimate',
      'B: Boss',
      'P: Power-ups',
      'M: +1000 Credits',
      'K: Kill All',
      'L: +5 Lives',
      '1/2/3: Time Scale'
    ];

    const panelWidth = 150;
    const panelHeight = 20 + commands.length * 15;
    const x = 10;
    const y = 50;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(x, y, panelWidth, panelHeight);

    ctx.strokeStyle = '#ffff00';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, panelWidth, panelHeight);

    ctx.fillStyle = '#ffff00';
    ctx.font = 'bold 10px Arial';
    ctx.textAlign = 'left';

    commands.forEach((cmd, i) => {
      ctx.fillText(cmd, x + 8, y + 16 + i * 15);
    });
  }

  /**
   * Render log messages
   */
  renderLogMessages(ctx, canvas) {
    if (this.logMessages.length === 0) return;

    const panelWidth = 400;
    const panelHeight = 20 + this.logMessages.length * 18;
    const x = canvas.width / 2 - panelWidth / 2;
    const y = canvas.height - panelHeight - 10;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
    ctx.fillRect(x, y, panelWidth, panelHeight);

    ctx.strokeStyle = '#00ffff';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, panelWidth, panelHeight);

    ctx.fillStyle = '#00ffff';
    ctx.font = '11px monospace';
    ctx.textAlign = 'left';

    this.logMessages.forEach((log, i) => {
      ctx.fillText(`[${log.time}] ${log.message}`, x + 10, y + 16 + i * 18);
    });
  }

  /**
   * Render hitboxes
   */
  renderHitboxes(ctx, game) {
    ctx.save();
    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 2;

    // Player hitbox
    if (game.player) {
      ctx.strokeRect(game.player.x, game.player.y, game.player.width, game.player.height);
    }

    // Enemy hitboxes
    game.enemies?.forEach(enemy => {
      ctx.strokeStyle = '#ff0000';
      ctx.strokeRect(enemy.x, enemy.y, enemy.width, enemy.height);
    });

    // Bullet hitboxes
    game.bullets?.forEach(bullet => {
      ctx.strokeStyle = '#00ffff';
      ctx.strokeRect(bullet.x, bullet.y, bullet.width, bullet.height);
    });

    // Enemy bullet hitboxes
    game.enemyBullets?.forEach(bullet => {
      ctx.strokeStyle = '#ffff00';
      ctx.strokeRect(bullet.x, bullet.y, bullet.width, bullet.height);
    });

    ctx.restore();
  }

  /**
   * Get test scenarios list
   */
  getScenarios() {
    return Object.entries(this.testScenarios).map(([key, scenario]) => ({
      key: key,
      name: scenario.name,
      description: scenario.description
    }));
  }

  /**
   * Reset system
   */
  reset() {
    this.godMode = false;
    this.autoFire = false;
    this.showHitboxes = false;
    this.timeScale = 1;
    this.logMessages = [];
  }
}

export const testPlayerSystem = new TestPlayerSystem();

