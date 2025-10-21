/**
 * Daily Mission System
 * Procedurally generated daily challenges with rewards
 */

export class DailyMission {
  constructor(id, name, description, type, target, reward, difficulty = 'normal') {
    this.id = id;
    this.name = name;
    this.description = description;
    this.type = type;
    this.target = target;
    this.progress = 0;
    this.reward = reward;
    this.difficulty = difficulty;
    this.completed = false;
    this.claimed = false;
  }

  updateProgress(amount) {
    if (this.completed) return;
    this.progress += amount;
    if (this.progress >= this.target) {
      this.completed = true;
    }
  }

  getProgressPercent() {
    return Math.min(100, (this.progress / this.target) * 100);
  }

  claimReward() {
    if (this.completed && !this.claimed) {
      this.claimed = true;
      return this.reward;
    }
    return null;
  }
}

export class DailyMissionSystem {
  constructor() {
    this.missions = [];
    this.currentDate = this.getDateString();
    this.initializeMissions();
  }

  /**
   * Get current date string for mission rotation
   */
  getDateString() {
    const now = new Date();
    return `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
  }

  /**
   * Seed-based random number generator for consistent daily missions
   */
  seededRandom(seed) {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  }

  /**
   * Get seed from date string
   */
  getSeedFromDate(dateString) {
    return dateString.split('-').reduce((acc, val) => acc + parseInt(val), 0);
  }

  /**
   * Initialize daily missions
   */
  initializeMissions() {
    // Check if missions need to be rotated
    const savedDate = localStorage.getItem('dailyMissionDate');
    
    if (savedDate !== this.currentDate) {
      // New day, generate new missions
      this.generateDailyMissions();
      localStorage.setItem('dailyMissionDate', this.currentDate);
      this.saveMissions();
    } else {
      // Load saved missions
      this.loadMissions();
    }
  }

  /**
   * Generate procedural daily missions based on date seed
   */
  generateDailyMissions() {
    this.missions = [];
    const seed = this.getSeedFromDate(this.currentDate);

    // Mission templates
    const missionTemplates = [
      // Kill-based missions
      {
        type: 'kills',
        name: 'Exterminator',
        description: 'Destroy {target} enemies',
        targets: [30, 50, 75, 100, 150],
        rewards: { xp: 200, credits: 100 },
        difficulty: 'easy'
      },
      {
        type: 'kills_specific',
        name: 'Hunter',
        description: 'Destroy {target} {enemyType} enemies',
        targets: [20, 30, 40],
        enemyTypes: ['fast', 'strong', 'zigzag', 'shooter', 'kamikaze'],
        rewards: { xp: 300, credits: 150 },
        difficulty: 'normal'
      },
      
      // Score-based missions
      {
        type: 'score',
        name: 'High Scorer',
        description: 'Reach a score of {target}',
        targets: [5000, 10000, 15000, 20000, 30000],
        rewards: { xp: 250, credits: 125 },
        difficulty: 'normal'
      },
      {
        type: 'score_single_life',
        name: 'Perfect Run',
        description: 'Score {target} points in a single life',
        targets: [2000, 3000, 5000],
        rewards: { xp: 400, credits: 200 },
        difficulty: 'hard'
      },
      
      // Survival missions
      {
        type: 'survive',
        name: 'Survivor',
        description: 'Survive for {target} seconds',
        targets: [120, 180, 240, 300, 420],
        rewards: { xp: 250, credits: 125 },
        difficulty: 'normal'
      },
      
      // Combo missions
      {
        type: 'combo',
        name: 'Combo Master',
        description: 'Achieve a {target}x combo',
        targets: [10, 15, 20, 25, 30],
        rewards: { xp: 300, credits: 150 },
        difficulty: 'normal'
      },
      
      // Accuracy missions
      {
        type: 'accuracy',
        name: 'Sharpshooter',
        description: 'Achieve {target}% accuracy with at least 100 shots',
        targets: [60, 70, 75, 80, 85],
        rewards: { xp: 350, credits: 175 },
        difficulty: 'hard'
      },
      
      // Power-up missions
      {
        type: 'powerups',
        name: 'Collector',
        description: 'Collect {target} power-ups',
        targets: [10, 15, 20, 25],
        rewards: { xp: 200, credits: 100 },
        difficulty: 'easy'
      },
      
      // Weapon missions
      {
        type: 'weapon_kills',
        name: 'Specialist',
        description: 'Get {target} kills with {weapon}',
        targets: [20, 30, 40],
        weapons: ['laser', 'plasma', 'missile', 'beam', 'spread', 'homing'],
        rewards: { xp: 300, credits: 150 },
        difficulty: 'normal'
      },
      
      // Boss missions
      {
        type: 'boss',
        name: 'Boss Hunter',
        description: 'Defeat {target} bosses',
        targets: [1, 2, 3],
        rewards: { xp: 500, credits: 250 },
        difficulty: 'hard'
      },
      
      // No damage missions
      {
        type: 'no_damage',
        name: 'Untouchable',
        description: 'Destroy {target} enemies without taking damage',
        targets: [15, 20, 25, 30],
        rewards: { xp: 400, credits: 200 },
        difficulty: 'hard'
      },
      
      // Speed missions
      {
        type: 'speed_kills',
        name: 'Quick Draw',
        description: 'Get {target} kills in {time} seconds',
        targets: [20, 30, 40],
        times: [30, 45, 60],
        rewards: { xp: 350, credits: 175 },
        difficulty: 'normal'
      }
    ];

    // Generate 3 daily missions using seed
    const selectedMissions = [];
    for (let i = 0; i < 3; i++) {
      const templateIndex = Math.floor(this.seededRandom(seed + i) * missionTemplates.length);
      const template = missionTemplates[templateIndex];
      
      const targetIndex = Math.floor(this.seededRandom(seed + i + 100) * template.targets.length);
      const target = template.targets[targetIndex];
      
      let description = template.description.replace('{target}', target);
      
      // Handle special replacements
      if (template.enemyTypes) {
        const enemyIndex = Math.floor(this.seededRandom(seed + i + 200) * template.enemyTypes.length);
        description = description.replace('{enemyType}', template.enemyTypes[enemyIndex]);
      }
      
      if (template.weapons) {
        const weaponIndex = Math.floor(this.seededRandom(seed + i + 300) * template.weapons.length);
        description = description.replace('{weapon}', template.weapons[weaponIndex]);
      }
      
      if (template.times) {
        const timeIndex = Math.floor(this.seededRandom(seed + i + 400) * template.times.length);
        description = description.replace('{time}', template.times[timeIndex]);
      }
      
      const mission = new DailyMission(
        `daily_${this.currentDate}_${i}`,
        template.name,
        description,
        template.type,
        target,
        template.rewards,
        template.difficulty
      );
      
      selectedMissions.push(mission);
    }
    
    this.missions = selectedMissions;
  }

  /**
   * Save missions to localStorage
   */
  saveMissions() {
    const missionsData = this.missions.map(m => ({
      id: m.id,
      name: m.name,
      description: m.description,
      type: m.type,
      target: m.target,
      progress: m.progress,
      reward: m.reward,
      difficulty: m.difficulty,
      completed: m.completed,
      claimed: m.claimed
    }));
    
    localStorage.setItem('dailyMissions', JSON.stringify(missionsData));
  }

  /**
   * Load missions from localStorage
   */
  loadMissions() {
    const savedData = localStorage.getItem('dailyMissions');
    
    if (savedData) {
      const missionsData = JSON.parse(savedData);
      this.missions = missionsData.map(data => {
        const mission = new DailyMission(
          data.id,
          data.name,
          data.description,
          data.type,
          data.target,
          data.reward,
          data.difficulty
        );
        mission.progress = data.progress;
        mission.completed = data.completed;
        mission.claimed = data.claimed;
        return mission;
      });
    } else {
      this.generateDailyMissions();
    }
  }

  /**
   * Update mission progress
   */
  updateProgress(type, amount = 1, metadata = {}) {
    this.missions.forEach(mission => {
      if (mission.type === type && !mission.completed) {
        mission.updateProgress(amount);
      }
      
      // Handle specific mission types with metadata
      if (type === 'kills_specific' && metadata.enemyType) {
        if (mission.description.toLowerCase().includes(metadata.enemyType.toLowerCase())) {
          mission.updateProgress(amount);
        }
      }
      
      if (type === 'weapon_kills' && metadata.weapon) {
        if (mission.description.toLowerCase().includes(metadata.weapon.toLowerCase())) {
          mission.updateProgress(amount);
        }
      }
    });
    
    this.saveMissions();
  }

  /**
   * Get all missions
   */
  getMissions() {
    return this.missions;
  }

  /**
   * Get active (unclaimed) missions
   */
  getActiveMissions() {
    return this.missions.filter(m => !m.claimed);
  }

  /**
   * Get completed missions
   */
  getCompletedMissions() {
    return this.missions.filter(m => m.completed);
  }

  /**
   * Claim mission reward
   */
  claimReward(missionId) {
    const mission = this.missions.find(m => m.id === missionId);
    if (mission) {
      const reward = mission.claimReward();
      this.saveMissions();
      return reward;
    }
    return null;
  }

  /**
   * Get time until next mission rotation
   */
  getTimeUntilReset() {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const diff = tomorrow - now;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return { hours, minutes, milliseconds: diff };
  }

  /**
   * Force reset (for testing)
   */
  forceReset() {
    this.currentDate = this.getDateString();
    this.generateDailyMissions();
    localStorage.setItem('dailyMissionDate', this.currentDate);
    this.saveMissions();
  }
}

export default DailyMissionSystem;

