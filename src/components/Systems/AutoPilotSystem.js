/**
 * AutoPilotSystem - AI that plays the game and monitors for improvements
 * Provides gameplay analytics and balance recommendations
 */

export class AutoPilotSystem {
  constructor() {
    this.enabled = false;
    this.difficulty = 'medium'; // easy, medium, hard
    this.playStyle = 'balanced'; // aggressive, defensive, balanced
    
    // AI Decision Making
    this.targetEnemy = null;
    this.avoidanceMode = false;
    this.lastDecision = Date.now();
    this.decisionInterval = 100; // Make decisions every 100ms
    
    // Gameplay Monitoring & Analytics
    this.analytics = {
      sessionStartTime: 0,
      survivalTime: 0,
      totalDamageDealt: 0,
      totalDamageTaken: 0,
      enemiesKilled: 0,
      bossesDefeated: 0,
      powerUpsCollected: 0,
      ultimatesUsed: 0,
      deathCount: 0,
      perfectDodges: 0,
      closeCalls: 0, // Health < 20
      combosTriggered: 0,
      highestCombo: 0,
      wavesCompleted: 0,
      accuracyShots: 0,
      accuracyHits: 0,
      creditsEarned: 0
    };
    
    // Balance Analysis
    this.balanceMetrics = {
      enemyThreatLevels: {},
      weaponEffectiveness: {},
      powerUpValue: {},
      bossDifficulty: {},
      waveProgression: [],
      hazardImpact: {},
      difficultyRating: 0
    };
    
    // Recommendations
    this.recommendations = [];
    this.issues = [];
    
    // Real-time stats
    this.currentStats = {
      dps: 0, // Damage per second
      survivalRate: 0,
      threatLevel: 0,
      efficiency: 0
    };
  }

  /**
   * Start autopilot
   */
  start(game) {
    this.enabled = true;
    this.analytics.sessionStartTime = Date.now();
    this.log('🤖 AutoPilot ENGAGED - Monitoring gameplay for improvements...');
    this.log(`   Play Style: ${this.playStyle}, Difficulty: ${this.difficulty}`);
  }

  /**
   * Stop autopilot
   */
  stop() {
    this.enabled = false;
    this.generateReport();
    this.log('🤖 AutoPilot DISENGAGED');
  }

  /**
   * Toggle autopilot
   */
  toggle(game) {
    if (this.enabled) {
      this.stop();
    } else {
      this.start(game);
    }
    return this.enabled;
  }

  /**
   * Main update loop - AI plays the game
   */
  update(deltaTime, game, keys) {
    if (!this.enabled || !game.player) return;

    const now = Date.now();
    this.analytics.survivalTime = now - this.analytics.sessionStartTime;

    // Update real-time stats
    this.updateRealTimeStats(game);

    // Make AI decisions
    if (now - this.lastDecision >= this.decisionInterval) {
      this.makeDecisions(game, keys);
      this.lastDecision = now;
    }

    // Monitor gameplay
    this.monitorGameplay(game);

    // Analyze balance
    this.analyzeBalance(game);

    // Execute actions
    this.executeActions(game, keys);
  }

  /**
   * AI decision making
   */
  makeDecisions(game, keys) {
    const player = game.player;
    
    // Threat assessment
    const threats = this.assessThreats(game);
    this.currentStats.threatLevel = threats.level;

    // Decide on avoidance mode
    if (player.health < 30 || threats.level > 0.7) {
      this.avoidanceMode = true;
    } else if (player.health > 50 && threats.level < 0.3) {
      this.avoidanceMode = false;
    }

    // Target selection
    this.selectTarget(game);

    // Ultimate usage
    if (game.ultimateSystem?.isReady() && threats.level > 0.6) {
      this.useUltimate(game);
    }

    // Power-up collection priority
    this.evaluatePowerUps(game);
  }

  /**
   * Assess threats from enemies and hazards
   */
  assessThreats(game) {
    const player = game.player;
    let threatLevel = 0;
    const threats = [];

    // Enemy threats
    game.enemies?.forEach(enemy => {
      const distance = this.getDistance(player, enemy);
      const threat = {
        type: 'enemy',
        distance: distance,
        danger: enemy.type === 'kamikaze' ? 0.8 : 0.5,
        object: enemy
      };
      
      if (distance < 150) {
        threatLevel += threat.danger * (1 - distance / 150);
        threats.push(threat);
      }
    });

    // Enemy bullet threats
    game.enemyBullets?.forEach(bullet => {
      const distance = this.getDistance(player, bullet);
      if (distance < 100) {
        threatLevel += 0.3 * (1 - distance / 100);
        threats.push({ type: 'bullet', distance, danger: 0.3, object: bullet });
      }
    });

    // Hazard threats
    if (game.environmentSystem) {
      game.environmentSystem.asteroids?.forEach(asteroid => {
        const distance = this.getDistance(player, asteroid);
        if (distance < 120) {
          threatLevel += 0.4 * (1 - distance / 120);
        }
      });
    }

    // Boss threat
    if (game.bossActive && game.bossSystem?.getBoss()) {
      threatLevel += 0.5;
    }

    return {
      level: Math.min(threatLevel, 1),
      threats: threats.sort((a, b) => a.distance - b.distance)
    };
  }

  /**
   * Select best target to attack
   */
  selectTarget(game) {
    const player = game.player;
    let bestTarget = null;
    let bestScore = -1;

    // Boss priority
    if (game.bossActive && game.bossSystem?.getBoss()) {
      this.targetEnemy = game.bossSystem.getBoss();
      return;
    }

    // Find best enemy target
    game.enemies?.forEach(enemy => {
      const distance = this.getDistance(player, enemy);
      const healthFactor = enemy.health || 1;
      
      // Scoring: closer is better, low health is better, dangerous enemies priority
      let score = 100 - distance;
      score += (1 / healthFactor) * 20;
      if (enemy.type === 'kamikaze') score += 30;
      if (enemy.type === 'shooter') score += 20;
      
      if (score > bestScore && distance < 300) {
        bestScore = score;
        bestTarget = enemy;
      }
    });

    this.targetEnemy = bestTarget;
  }

  /**
   * Execute AI actions
   */
  executeActions(game, keys) {
    const player = game.player;
    const canvas = game.canvas || { width: 800, height: 700 };

    // Clear all keys first
    Object.keys(keys).forEach(key => keys[key] = false);

    if (this.avoidanceMode) {
      // Defensive movement - avoid threats
      this.performEvasiveManeuvers(game, keys, canvas);
    } else {
      // Offensive movement - pursue targets
      this.performOffensiveManeuvers(game, keys, canvas);
    }

    // Always shoot if target is in front
    if (this.targetEnemy) {
      const isInFront = this.targetEnemy.y > player.y;
      const isAligned = Math.abs((this.targetEnemy.x + this.targetEnemy.width / 2) - 
                                  (player.x + player.width / 2)) < 100;
      
      if (isInFront && isAligned) {
        keys.shoot = true;
        this.analytics.accuracyShots++;
      }
    } else {
      // Shoot forward if no specific target
      keys.shoot = true;
      this.analytics.accuracyShots++;
    }
  }

  /**
   * Evasive maneuvers
   */
  performEvasiveManeuvers(game, keys, canvas) {
    const player = game.player;
    const threats = this.assessThreats(game);

    if (threats.threats.length === 0) {
      // Move to safe center
      if (player.x < canvas.width / 2 - 50) keys.right = true;
      if (player.x > canvas.width / 2 + 50) keys.left = true;
      if (player.y > canvas.height * 0.7) keys.up = true;
      if (player.y < canvas.height * 0.3) keys.down = true;
      return;
    }

    // Move away from closest threat
    const closestThreat = threats.threats[0].object;
    
    if (player.x < closestThreat.x) {
      keys.left = true;
    } else {
      keys.right = true;
    }

    if (player.y < closestThreat.y) {
      keys.up = true;
    } else {
      keys.down = true;
    }

    // Stay in bounds
    if (player.x < 50) keys.right = true;
    if (player.x > canvas.width - 50) keys.left = true;
    if (player.y < 50) keys.down = true;
    if (player.y > canvas.height - 50) keys.up = true;
  }

  /**
   * Offensive maneuvers
   */
  performOffensiveManeuvers(game, keys, canvas) {
    const player = game.player;

    if (!this.targetEnemy) {
      // Patrol pattern
      const patrolY = canvas.height * 0.6;
      if (player.y < patrolY - 20) keys.down = true;
      if (player.y > patrolY + 20) keys.up = true;
      
      // Weave left and right
      const time = Date.now() / 1000;
      if (Math.sin(time * 2) > 0) keys.right = true;
      else keys.left = true;
      
      return;
    }

    // Move to align with target
    const targetCenterX = this.targetEnemy.x + this.targetEnemy.width / 2;
    const playerCenterX = player.x + player.width / 2;

    if (playerCenterX < targetCenterX - 20) {
      keys.right = true;
    } else if (playerCenterX > targetCenterX + 20) {
      keys.left = true;
    }

    // Maintain optimal distance
    const optimalY = canvas.height * 0.7;
    if (player.y < optimalY - 30) {
      keys.down = true;
    } else if (player.y > optimalY + 30) {
      keys.up = true;
    }

    // Bounds check
    if (player.x < 30) keys.right = true;
    if (player.x > canvas.width - 30) keys.left = true;
    if (player.y < 30) keys.down = true;
    if (player.y > canvas.height - 30) keys.up = true;
  }

  /**
   * Use ultimate ability
   */
  useUltimate(game) {
    if (game.ultimateSystem?.isReady()) {
      const character = game.selectedCharacter || 'kaden';
      game.ultimateSystem.activateUltimate(character, game);
      this.analytics.ultimatesUsed++;
      this.log('   ⚡ Ultimate activated!');
    }
  }

  /**
   * Monitor gameplay for analytics
   */
  monitorGameplay(game) {
    const player = game.player;

    // Track close calls
    if (player.health < 20 && player.health > 0) {
      this.analytics.closeCalls++;
    }

    // Track combo
    if (game.combo > this.analytics.highestCombo) {
      this.analytics.highestCombo = game.combo;
    }

    // Track wave completion
    if (game.waveSystem?.waveComplete) {
      this.analytics.wavesCompleted++;
    }

    // Track combos
    if (game.powerUpComboSystem?.activeCombos.length > 0) {
      this.analytics.combosTriggered++;
    }
  }

  /**
   * Analyze game balance
   */
  analyzeBalance(game) {
    // Enemy threat levels
    game.enemies?.forEach(enemy => {
      const type = enemy.type;
      if (!this.balanceMetrics.enemyThreatLevels[type]) {
        this.balanceMetrics.enemyThreatLevels[type] = {
          encountered: 0,
          damageDealt: 0,
          killed: 0
        };
      }
      this.balanceMetrics.enemyThreatLevels[type].encountered++;
    });

    // Wave difficulty progression
    if (game.waveSystem?.currentWave) {
      const wave = game.waveSystem.currentWave;
      const difficulty = this.calculateWaveDifficulty(game);
      
      if (!this.balanceMetrics.waveProgression[wave]) {
        this.balanceMetrics.waveProgression[wave] = {
          difficulty: difficulty,
          survivalTime: this.analytics.survivalTime,
          healthRemaining: game.player.health
        };
      }
    }

    // Overall difficulty rating
    this.balanceMetrics.difficultyRating = this.calculateOverallDifficulty(game);
  }

  /**
   * Calculate wave difficulty
   */
  calculateWaveDifficulty(game) {
    let difficulty = 0;
    
    difficulty += game.enemies?.length * 0.1 || 0;
    difficulty += game.enemyBullets?.length * 0.05 || 0;
    difficulty += game.bossActive ? 0.5 : 0;
    difficulty += (game.environmentSystem?.asteroids?.length || 0) * 0.02;
    difficulty += (game.environmentSystem?.blackHoles?.length || 0) * 0.1;
    
    return Math.min(difficulty, 1);
  }

  /**
   * Calculate overall difficulty
   */
  calculateOverallDifficulty(game) {
    const player = game.player;
    const survivalMinutes = this.analytics.survivalTime / 60000;
    
    let difficulty = 0;
    
    // Damage taken rate
    const damageTakenRate = this.analytics.totalDamageTaken / Math.max(survivalMinutes, 1);
    difficulty += Math.min(damageTakenRate / 50, 0.3);
    
    // Death rate
    const deathRate = this.analytics.deathCount / Math.max(survivalMinutes, 1);
    difficulty += Math.min(deathRate / 2, 0.3);
    
    // Enemy density
    const enemyDensity = (game.enemies?.length || 0) / 10;
    difficulty += Math.min(enemyDensity, 0.2);
    
    // Boss presence
    if (game.bossActive) difficulty += 0.2;
    
    return Math.min(difficulty, 1);
  }

  /**
   * Generate improvement recommendations
   */
  generateRecommendations() {
    this.recommendations = [];
    this.issues = [];

    const survivalMinutes = this.analytics.survivalTime / 60000;
    const accuracy = this.analytics.accuracyHits / Math.max(this.analytics.accuracyShots, 1);

    // Difficulty recommendations
    if (this.balanceMetrics.difficultyRating > 0.8) {
      this.issues.push({
        severity: 'high',
        category: 'balance',
        issue: 'Game is too difficult',
        recommendation: 'Reduce enemy spawn rate or increase player health'
      });
    } else if (this.balanceMetrics.difficultyRating < 0.3) {
      this.issues.push({
        severity: 'medium',
        category: 'balance',
        issue: 'Game might be too easy',
        recommendation: 'Increase enemy variety or add more hazards'
      });
    }

    // Close calls analysis
    if (this.analytics.closeCalls > 10) {
      this.recommendations.push({
        type: 'balance',
        priority: 'medium',
        message: 'Many close calls detected - consider adding more health pickups'
      });
    }

    // Death rate analysis
    if (this.analytics.deathCount > 5 && survivalMinutes < 5) {
      this.issues.push({
        severity: 'high',
        category: 'difficulty',
        issue: 'High death rate in early game',
        recommendation: 'Add tutorial or easier starting difficulty'
      });
    }

    // Wave progression
    if (this.analytics.wavesCompleted < 3 && survivalMinutes > 5) {
      this.recommendations.push({
        type: 'pacing',
        priority: 'medium',
        message: 'Wave progression is too slow - consider faster wave completion'
      });
    }

    // Ultimate usage
    if (this.analytics.ultimatesUsed === 0 && survivalMinutes > 3) {
      this.recommendations.push({
        type: 'mechanics',
        priority: 'low',
        message: 'Ultimate not used - consider making it charge faster or more obvious'
      });
    }

    // Accuracy
    if (accuracy < 0.3) {
      this.recommendations.push({
        type: 'gameplay',
        priority: 'low',
        message: 'Low accuracy - enemies might be too fast or small'
      });
    }

    // Boss difficulty
    if (this.analytics.bossesDefeated === 0 && this.analytics.deathCount > 3) {
      this.issues.push({
        severity: 'medium',
        category: 'boss',
        issue: 'No bosses defeated',
        recommendation: 'Boss might be too difficult for first encounter'
      });
    }

    // Combo usage
    if (this.analytics.combosTriggered === 0 && this.analytics.powerUpsCollected > 5) {
      this.recommendations.push({
        type: 'feature',
        priority: 'medium',
        message: 'No combos triggered - players might not understand the system'
      });
    }
  }

  /**
   * Update real-time stats
   */
  updateRealTimeStats(game) {
    const survivalSeconds = this.analytics.survivalTime / 1000;
    
    // DPS calculation
    this.currentStats.dps = this.analytics.totalDamageDealt / Math.max(survivalSeconds, 1);
    
    // Survival rate
    const healthPercent = (game.player.health / game.player.maxHealth) * 100;
    this.currentStats.survivalRate = healthPercent;
    
    // Efficiency (kills per minute)
    this.currentStats.efficiency = (this.analytics.enemiesKilled / Math.max(survivalSeconds, 1)) * 60;
  }

  /**
   * Generate comprehensive report
   */
  generateReport() {
    const survivalMinutes = (this.analytics.survivalTime / 60000).toFixed(2);
    const accuracy = ((this.analytics.accuracyHits / Math.max(this.analytics.accuracyShots, 1)) * 100).toFixed(1);
    
    this.generateRecommendations();

    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║         AUTOPILOT GAMEPLAY ANALYSIS REPORT                ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    console.log('📊 GAMEPLAY STATISTICS:');
    console.log(`   Survival Time: ${survivalMinutes} minutes`);
    console.log(`   Enemies Killed: ${this.analytics.enemiesKilled}`);
    console.log(`   Bosses Defeated: ${this.analytics.bossesDefeated}`);
    console.log(`   Waves Completed: ${this.analytics.wavesCompleted}`);
    console.log(`   Deaths: ${this.analytics.deathCount}`);
    console.log(`   Accuracy: ${accuracy}%`);
    console.log(`   Highest Combo: ${this.analytics.highestCombo}x`);
    console.log(`   Ultimates Used: ${this.analytics.ultimatesUsed}`);
    console.log(`   Combos Triggered: ${this.analytics.combosTriggered}`);
    console.log(`   Close Calls: ${this.analytics.closeCalls}\n`);

    console.log('⚡ PERFORMANCE METRICS:');
    console.log(`   DPS: ${this.currentStats.dps.toFixed(1)}`);
    console.log(`   Efficiency: ${this.currentStats.efficiency.toFixed(1)} kills/min`);
    console.log(`   Damage Dealt: ${this.analytics.totalDamageDealt}`);
    console.log(`   Damage Taken: ${this.analytics.totalDamageTaken}\n`);

    console.log('⚖️ BALANCE ANALYSIS:');
    console.log(`   Overall Difficulty: ${(this.balanceMetrics.difficultyRating * 100).toFixed(1)}%`);
    console.log(`   Rating: ${this.getDifficultyLabel(this.balanceMetrics.difficultyRating)}\n`);

    if (this.issues.length > 0) {
      console.log('🚨 ISSUES DETECTED:');
      this.issues.forEach((issue, i) => {
        console.log(`   ${i + 1}. [${issue.severity.toUpperCase()}] ${issue.issue}`);
        console.log(`      → ${issue.recommendation}\n`);
      });
    }

    if (this.recommendations.length > 0) {
      console.log('💡 RECOMMENDATIONS:');
      this.recommendations.forEach((rec, i) => {
        console.log(`   ${i + 1}. [${rec.priority.toUpperCase()}] ${rec.message}\n`);
      });
    }

    if (this.issues.length === 0 && this.recommendations.length === 0) {
      console.log('✅ EXCELLENT! Game balance is good!\n');
    }

    console.log('═══════════════════════════════════════════════════════════\n');
  }

  /**
   * Get difficulty label
   */
  getDifficultyLabel(rating) {
    if (rating < 0.2) return 'Very Easy';
    if (rating < 0.4) return 'Easy';
    if (rating < 0.6) return 'Balanced';
    if (rating < 0.8) return 'Hard';
    return 'Very Hard';
  }

  /**
   * Get distance between two objects
   */
  getDistance(obj1, obj2) {
    const dx = (obj1.x + obj1.width / 2) - (obj2.x + obj2.width / 2);
    const dy = (obj1.y + obj1.height / 2) - (obj2.y + obj2.height / 2);
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Evaluate power-ups
   */
  evaluatePowerUps(game) {
    // Implementation for power-up collection priority
    // Can be expanded based on current game state
  }

  /**
   * Register events for monitoring
   */
  onEnemyKilled(enemy) {
    this.analytics.enemiesKilled++;
    this.analytics.accuracyHits++;
    
    const type = enemy.type;
    if (this.balanceMetrics.enemyThreatLevels[type]) {
      this.balanceMetrics.enemyThreatLevels[type].killed++;
    }
  }

  onBossDefeated(boss) {
    this.analytics.bossesDefeated++;
    this.log(`   🎯 Boss defeated: ${boss.name}`);
  }

  onPlayerDeath() {
    this.analytics.deathCount++;
    this.log(`   ☠️ Death #${this.analytics.deathCount}`);
  }

  onPowerUpCollected(type) {
    this.analytics.powerUpsCollected++;
  }

  onDamageTaken(amount) {
    this.analytics.totalDamageTaken += amount;
  }

  onDamageDealt(amount) {
    this.analytics.totalDamageDealt += amount;
  }

  /**
   * Render autopilot UI
   */
  render(ctx, canvas) {
    if (!this.enabled) return;

    ctx.save();

    // Autopilot indicator
    ctx.fillStyle = 'rgba(0, 255, 0, 0.8)';
    ctx.fillRect(10, 10, 220, 40);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.strokeRect(10, 10, 220, 40);

    ctx.fillStyle = '#000000';
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('🤖 AUTOPILOT ACTIVE', 20, 33);

    // Real-time stats panel
    const panelX = 10;
    const panelY = 60;
    const panelWidth = 220;
    const panelHeight = 220;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
    ctx.fillRect(panelX, panelY, panelWidth, panelHeight);

    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 2;
    ctx.strokeRect(panelX, panelY, panelWidth, panelHeight);

    ctx.fillStyle = '#00ff00';
    ctx.font = 'bold 14px Arial';
    ctx.fillText('📊 MONITORING', panelX + 10, panelY + 20);

    ctx.font = '12px monospace';
    ctx.fillStyle = '#ffffff';
    const stats = [
      `Time: ${(this.analytics.survivalTime / 1000).toFixed(0)}s`,
      `Kills: ${this.analytics.enemiesKilled}`,
      `DPS: ${this.currentStats.dps.toFixed(1)}`,
      `Efficiency: ${this.currentStats.efficiency.toFixed(1)}/min`,
      `Threat: ${(this.currentStats.threatLevel * 100).toFixed(0)}%`,
      `Mode: ${this.avoidanceMode ? 'EVASIVE' : 'OFFENSIVE'}`,
      `Accuracy: ${((this.analytics.accuracyHits / Math.max(this.analytics.accuracyShots, 1)) * 100).toFixed(0)}%`,
      `Deaths: ${this.analytics.deathCount}`,
      `Combos: ${this.analytics.combosTriggered}`,
      `Bosses: ${this.analytics.bossesDefeated}`,
      `Close Calls: ${this.analytics.closeCalls}`,
      `Difficulty: ${this.getDifficultyLabel(this.balanceMetrics.difficultyRating)}`
    ];

    stats.forEach((stat, i) => {
      ctx.fillText(stat, panelX + 10, panelY + 45 + i * 15);
    });

    // Target indicator
    if (this.targetEnemy) {
      ctx.strokeStyle = '#ff0000';
      ctx.lineWidth = 3;
      ctx.strokeRect(
        this.targetEnemy.x - 5,
        this.targetEnemy.y - 5,
        this.targetEnemy.width + 10,
        this.targetEnemy.height + 10
      );

      // Target line
      ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      const player = ctx.canvas.game?.player;
      if (player) {
        ctx.moveTo(player.x + player.width / 2, player.y);
        ctx.lineTo(
          this.targetEnemy.x + this.targetEnemy.width / 2,
          this.targetEnemy.y + this.targetEnemy.height / 2
        );
      }
      ctx.stroke();
      ctx.setLineDash([]);
    }

    ctx.restore();
  }

  /**
   * Log message
   */
  log(message) {
    const timestamp = new Date().toLocaleTimeString();
    console.log(`[${timestamp}] [AutoPilot] ${message}`);
  }

  /**
   * Reset system
   */
  reset() {
    this.enabled = false;
    this.targetEnemy = null;
    this.analytics = {
      sessionStartTime: 0,
      survivalTime: 0,
      totalDamageDealt: 0,
      totalDamageTaken: 0,
      enemiesKilled: 0,
      bossesDefeated: 0,
      powerUpsCollected: 0,
      ultimatesUsed: 0,
      deathCount: 0,
      perfectDodges: 0,
      closeCalls: 0,
      combosTriggered: 0,
      highestCombo: 0,
      wavesCompleted: 0,
      accuracyShots: 0,
      accuracyHits: 0,
      creditsEarned: 0
    };
  }
}

export const autoPilotSystem = new AutoPilotSystem();

