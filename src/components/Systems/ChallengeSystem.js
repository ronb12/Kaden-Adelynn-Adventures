/**
 * ChallengeSystem - Manages challenge modes and endless mode
 */

export class ChallengeSystem {
  constructor() {
    this.currentMode = 'normal'; // 'normal', 'endless', 'timeAttack', 'oneLife', 'weaponChallenge', 'perfectRun', 'pacifist'
    this.challengeStats = {
      startTime: 0,
      survivalTime: 0,
      damageTaken: 0,
      perfectRun: true,
      weaponUsed: null,
      enemiesAvoided: 0
    };
    this.endlessStats = {
      currentLevel: 1,
      difficultyMultiplier: 1,
      scoreMultiplier: 1,
      modifiers: []
    };
    this.leaderboards = this.loadLeaderboards();
  }

  /**
   * Start challenge mode
   */
  startChallenge(mode, options = {}) {
    this.currentMode = mode;
    this.challengeStats = {
      startTime: Date.now(),
      survivalTime: 0,
      damageTaken: 0,
      perfectRun: true,
      weaponUsed: options.weapon || null,
      enemiesAvoided: 0
    };

    if (mode === 'endless') {
      this.endlessStats = {
        currentLevel: 1,
        difficultyMultiplier: 1,
        scoreMultiplier: 1,
        modifiers: []
      };
    }

    return this.getChallengeConfig(mode);
  }

  /**
   * Get challenge configuration
   */
  getChallengeConfig(mode) {
    const configs = {
      normal: {
        name: 'Normal Mode',
        description: 'Standard gameplay experience',
        rules: [],
        rewards: { scoreMultiplier: 1, xpMultiplier: 1 }
      },

      endless: {
        name: 'Endless Mode',
        description: 'Survive infinite waves with increasing difficulty',
        rules: [
          'Enemies get stronger every level',
          'Random modifiers each level',
          'No continues',
          'Score multiplier increases'
        ],
        rewards: { scoreMultiplier: 1.5, xpMultiplier: 2 }
      },

      timeAttack: {
        name: 'Time Attack',
        description: 'Defeat the boss as fast as possible',
        rules: [
          'Timer starts on game start',
          'Boss spawns immediately',
          'Rank based on clear time',
          '3 lives only'
        ],
        rewards: { scoreMultiplier: 2, xpMultiplier: 1.5 }
      },

      oneLife: {
        name: 'One Life Mode',
        description: 'Single life, 100 health, no continues',
        rules: [
          'Only 1 life',
          '100 health',
          'No extra life power-ups',
          'High risk, high reward'
        ],
        rewards: { scoreMultiplier: 3, xpMultiplier: 2.5 }
      },

      weaponChallenge: {
        name: 'Weapon Challenge',
        description: 'Complete level with specific weapon only',
        rules: [
          'Locked to one weapon',
          'No weapon pickups',
          'Power-ups still available',
          'Weapon mastery bonus'
        ],
        rewards: { scoreMultiplier: 1.8, xpMultiplier: 1.5 }
      },

      perfectRun: {
        name: 'Perfect Run',
        description: 'Complete without taking any damage',
        rules: [
          'No damage allowed',
          'One hit = game over',
          'Shield power-ups disabled',
          'Ultimate precision required'
        ],
        rewards: { scoreMultiplier: 4, xpMultiplier: 3 }
      },

      pacifist: {
        name: 'Pacifist Challenge',
        description: 'Survive by dodging only, no shooting',
        rules: [
          'Shooting disabled',
          'Score by survival time',
          'Environmental hazards can help',
          'Master of evasion'
        ],
        rewards: { scoreMultiplier: 2.5, xpMultiplier: 2 }
      }
    };

    return configs[mode] || configs.normal;
  }

  /**
   * Update challenge progress
   */
  update(deltaTime, game) {
    this.challengeStats.survivalTime = Date.now() - this.challengeStats.startTime;

    // Update endless mode
    if (this.currentMode === 'endless') {
      this.updateEndlessMode(game);
    }

    // Track damage for perfect run
    if (game.player && game.player.health < game.player.maxHealth) {
      if (this.challengeStats.perfectRun) {
        this.challengeStats.damageTaken++;
        this.challengeStats.perfectRun = false;
      }
    }
  }

  /**
   * Update endless mode
   */
  updateEndlessMode(game) {
    // Check for level up
    const killsPerLevel = 50;
    const currentLevel = Math.floor(game.score / (killsPerLevel * 100)) + 1;

    if (currentLevel > this.endlessStats.currentLevel) {
      this.endlessStats.currentLevel = currentLevel;
      this.levelUpEndless(game);
    }

    // Apply difficulty multiplier
    this.endlessStats.difficultyMultiplier = 1 + (this.endlessStats.currentLevel - 1) * 0.15;
    this.endlessStats.scoreMultiplier = 1 + (this.endlessStats.currentLevel - 1) * 0.1;
  }

  /**
   * Level up in endless mode
   */
  levelUpEndless(game) {
    // Apply random modifier
    const modifier = this.getRandomModifier();
    this.endlessStats.modifiers.push(modifier);

    // Apply modifier effects
    this.applyModifier(modifier, game);

    // Grant small reward
    if (game.player) {
      game.player.health = Math.min(
        game.player.health + 25,
        game.player.maxHealth
      );
    }
  }

  /**
   * Get random modifier for endless mode
   */
  getRandomModifier() {
    const modifiers = [
      { id: 'speed_boost', name: '2x Speed', effect: 'playerSpeed', value: 2 },
      { id: 'half_health', name: 'Half Health Enemies', effect: 'enemyHealth', value: 0.5 },
      { id: 'double_enemies', name: 'Double Enemies', effect: 'enemySpawn', value: 2 },
      { id: 'rapid_fire', name: 'Permanent Rapid Fire', effect: 'fireRate', value: 0.5 },
      { id: 'bullet_hell', name: 'Bullet Hell', effect: 'enemyBullets', value: 2 },
      { id: 'glass_cannon', name: 'Glass Cannon', effect: 'damage', value: 2 },
      { id: 'regeneration', name: 'Health Regen', effect: 'healthRegen', value: 1 },
      { id: 'time_slow', name: 'Slow Motion', effect: 'gameSpeed', value: 0.7 }
    ];

    return modifiers[Math.floor(Math.random() * modifiers.length)];
  }

  /**
   * Apply modifier effects
   */
  applyModifier(modifier, game) {
    // Store modifier for reference
    console.log(`Endless Mode Level ${this.endlessStats.currentLevel}: ${modifier.name}`);
  }

  /**
   * Check challenge completion
   */
  checkCompletion(game) {
    switch (this.currentMode) {
      case 'timeAttack':
        return game.bossActive === false && game.bossHealth <= 0;

      case 'perfectRun':
        return !this.challengeStats.perfectRun ? 'failed' : 'ongoing';

      case 'pacifist':
        return game.bullets.length > 0 ? 'failed' : 'ongoing';

      default:
        return 'ongoing';
    }
  }

  /**
   * Complete challenge
   */
  completeChallenge(game) {
    const survivalTimeSeconds = Math.floor(this.challengeStats.survivalTime / 1000);
    const config = this.getChallengeConfig(this.currentMode);

    const result = {
      mode: this.currentMode,
      score: game.score,
      survivalTime: survivalTimeSeconds,
      modifiedScore: Math.floor(game.score * config.rewards.scoreMultiplier),
      xpEarned: Math.floor(game.score / 10 * config.rewards.xpMultiplier),
      perfect: this.challengeStats.perfectRun,
      stats: { ...this.challengeStats }
    };

    // Update leaderboard
    this.updateLeaderboard(this.currentMode, result);

    return result;
  }

  /**
   * Update leaderboard
   */
  updateLeaderboard(mode, result) {
    if (!this.leaderboards[mode]) {
      this.leaderboards[mode] = [];
    }

    this.leaderboards[mode].push({
      score: result.modifiedScore,
      survivalTime: result.survivalTime,
      date: new Date().toISOString(),
      perfect: result.perfect
    });

    // Keep top 10
    this.leaderboards[mode].sort((a, b) => b.score - a.score);
    this.leaderboards[mode] = this.leaderboards[mode].slice(0, 10);

    this.saveLeaderboards();
  }

  /**
   * Get leaderboard for mode
   */
  getLeaderboard(mode) {
    return this.leaderboards[mode] || [];
  }

  /**
   * Render challenge UI
   */
  render(ctx, canvas, game) {
    if (this.currentMode === 'normal') return;

    ctx.save();

    // Challenge mode indicator
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(canvas.width - 220, 10, 210, 60);

    ctx.strokeStyle = '#ff8800';
    ctx.lineWidth = 2;
    ctx.strokeRect(canvas.width - 220, 10, 210, 60);

    ctx.fillStyle = '#ff8800';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(this.getChallengeConfig(this.currentMode).name, canvas.width - 210, 30);

    ctx.font = '12px Arial';
    ctx.fillStyle = '#ffffff';

    // Mode-specific stats
    if (this.currentMode === 'endless') {
      ctx.fillText(`Level: ${this.endlessStats.currentLevel}`, canvas.width - 210, 48);
      ctx.fillText(`Multiplier: x${this.endlessStats.scoreMultiplier.toFixed(1)}`, canvas.width - 210, 62);
    } else if (this.currentMode === 'timeAttack') {
      const elapsedSeconds = Math.floor(this.challengeStats.survivalTime / 1000);
      const minutes = Math.floor(elapsedSeconds / 60);
      const seconds = elapsedSeconds % 60;
      ctx.fillText(`Time: ${minutes}:${seconds.toString().padStart(2, '0')}`, canvas.width - 210, 48);
    } else if (this.currentMode === 'perfectRun') {
      ctx.fillStyle = this.challengeStats.perfectRun ? '#00ff00' : '#ff0000';
      ctx.fillText(
        this.challengeStats.perfectRun ? 'PERFECT! ✓' : 'FAILED ✗',
        canvas.width - 210,
        48
      );
    }

    // Active modifiers (endless mode)
    if (this.currentMode === 'endless' && this.endlessStats.modifiers.length > 0) {
      let modY = 90;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(canvas.width - 220, 80, 210, 30 + this.endlessStats.modifiers.length * 20);

      ctx.strokeStyle = '#00ffff';
      ctx.lineWidth = 2;
      ctx.strokeRect(canvas.width - 220, 80, 210, 30 + this.endlessStats.modifiers.length * 20);

      ctx.fillStyle = '#00ffff';
      ctx.font = 'bold 12px Arial';
      ctx.fillText('Active Modifiers:', canvas.width - 210, 98);

      ctx.font = '11px Arial';
      ctx.fillStyle = '#ffffff';
      this.endlessStats.modifiers.slice(-3).forEach((mod, i) => {
        ctx.fillText(`• ${mod.name}`, canvas.width - 205, 98 + (i + 1) * 18);
      });
    }

    ctx.restore();
  }

  /**
   * Save leaderboards to localStorage
   */
  saveLeaderboards() {
    try {
      localStorage.setItem('kadenAdelynnLeaderboards', JSON.stringify(this.leaderboards));
    } catch (error) {
      console.warn('Failed to save leaderboards:', error);
    }
  }

  /**
   * Load leaderboards from localStorage
   */
  loadLeaderboards() {
    try {
      const saved = localStorage.getItem('kadenAdelynnLeaderboards');
      return saved ? JSON.parse(saved) : {};
    } catch (error) {
      console.warn('Failed to load leaderboards:', error);
      return {};
    }
  }

  /**
   * Get all challenge modes
   */
  getAllChallenges() {
    return [
      'normal',
      'endless',
      'timeAttack',
      'oneLife',
      'weaponChallenge',
      'perfectRun',
      'pacifist'
    ].map(mode => this.getChallengeConfig(mode));
  }

  /**
   * Reset challenge
   */
  reset() {
    this.currentMode = 'normal';
    this.challengeStats = {
      startTime: 0,
      survivalTime: 0,
      damageTaken: 0,
      perfectRun: true,
      weaponUsed: null,
      enemiesAvoided: 0
    };
    this.endlessStats = {
      currentLevel: 1,
      difficultyMultiplier: 1,
      scoreMultiplier: 1,
      modifiers: []
    };
  }
}

export const challengeSystem = new ChallengeSystem();

