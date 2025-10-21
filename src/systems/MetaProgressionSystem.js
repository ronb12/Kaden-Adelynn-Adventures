/**
 * Meta-Progression System
 * Persistent player progression with skills, tech tree, and prestige
 */

export class PilotSkill {
  constructor(id, name, description, maxLevel, cost, effects, requirements = {}) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.maxLevel = maxLevel;
    this.currentLevel = 0;
    this.cost = cost; // Credits per level
    this.effects = effects; // { stat: value } per level
    this.requirements = requirements; // { level, skill, prestige }
    this.unlocked = false;
  }

  canUpgrade(playerData) {
    if (this.currentLevel >= this.maxLevel) return false;
    
    const nextLevelCost = this.cost * (this.currentLevel + 1);
    if (playerData.credits < nextLevelCost) return false;
    
    if (this.requirements.level && playerData.level < this.requirements.level) return false;
    if (this.requirements.prestige && playerData.prestige < this.requirements.prestige) return false;
    if (this.requirements.skill) {
      const reqSkill = playerData.skills.find(s => s.id === this.requirements.skill);
      if (!reqSkill || reqSkill.currentLevel < this.requirements.skillLevel) return false;
    }
    
    return true;
  }

  upgrade() {
    if (this.currentLevel < this.maxLevel) {
      this.currentLevel++;
      return true;
    }
    return false;
  }

  getNextLevelCost() {
    if (this.currentLevel >= this.maxLevel) return 0;
    return this.cost * (this.currentLevel + 1);
  }

  getCurrentBonus() {
    const bonus = {};
    Object.keys(this.effects).forEach(key => {
      bonus[key] = this.effects[key] * this.currentLevel;
    });
    return bonus;
  }
}

export class MetaProgressionSystem {
  constructor() {
    this.skills = this.initializeSkills();
    this.playerData = this.loadPlayerData();
    this.techTree = this.initializeTechTree();
  }

  /**
   * Initialize all pilot skills
   */
  initializeSkills() {
    return {
      // Combat Skills
      DAMAGE_BOOST: new PilotSkill(
        'damage_boost',
        'Weapons Mastery',
        '+2% damage per level',
        10,
        500,
        { damageMultiplier: 0.02 }
      ),

      FIRE_RATE: new PilotSkill(
        'fire_rate',
        'Rapid Reflexes',
        '+3% fire rate per level',
        10,
        600,
        { fireRateMultiplier: 0.03 }
      ),

      CRITICAL_CHANCE: new PilotSkill(
        'critical_chance',
        'Precision Strike',
        '+1% critical hit chance per level',
        5,
        1000,
        { critChance: 0.01 },
        { level: 10 }
      ),

      CRITICAL_DAMAGE: new PilotSkill(
        'critical_damage',
        'Devastating Blow',
        '+10% critical damage per level',
        5,
        1200,
        { critDamage: 0.1 },
        { skill: 'critical_chance', skillLevel: 3 }
      ),

      // Survival Skills
      MAX_HEALTH: new PilotSkill(
        'max_health',
        'Reinforced Hull',
        '+5% max health per level',
        10,
        400,
        { maxHealthMultiplier: 0.05 }
      ),

      HEALTH_REGEN: new PilotSkill(
        'health_regen',
        'Auto-Repair',
        '+1 health regen per second per level',
        5,
        800,
        { healthRegen: 1 },
        { level: 5 }
      ),

      SHIELD_CAPACITY: new PilotSkill(
        'shield_capacity',
        'Enhanced Shields',
        '+5% shield capacity per level',
        10,
        500,
        { shieldMultiplier: 0.05 }
      ),

      DAMAGE_REDUCTION: new PilotSkill(
        'damage_reduction',
        'Defensive Matrix',
        '+2% damage reduction per level',
        5,
        1500,
        { damageReduction: 0.02 },
        { level: 15 }
      ),

      // Mobility Skills
      MOVE_SPEED: new PilotSkill(
        'move_speed',
        'Thruster Upgrade',
        '+3% movement speed per level',
        10,
        450,
        { speedMultiplier: 0.03 }
      ),

      DODGE_CHANCE: new PilotSkill(
        'dodge_chance',
        'Evasive Maneuvers',
        '+1% dodge chance per level',
        5,
        1000,
        { dodgeChance: 0.01 },
        { level: 10 }
      ),

      // Economy Skills
      CREDIT_BOOST: new PilotSkill(
        'credit_boost',
        'Salvage Expert',
        '+5% credits earned per level',
        10,
        300,
        { creditMultiplier: 0.05 }
      ),

      XP_BOOST: new PilotSkill(
        'xp_boost',
        'Quick Learner',
        '+5% XP earned per level',
        10,
        400,
        { xpMultiplier: 0.05 }
      ),

      POWERUP_DURATION: new PilotSkill(
        'powerup_duration',
        'Extended Power',
        '+10% power-up duration per level',
        5,
        700,
        { powerupDuration: 0.1 },
        { level: 5 }
      ),

      // Advanced Skills
      MULTI_KILL_BONUS: new PilotSkill(
        'multi_kill_bonus',
        'Chain Reaction',
        '+5% bonus damage per enemy killed in 3s, stacks 5 times',
        5,
        2000,
        { multiKillBonus: 0.05 },
        { level: 20, prestige: 1 }
      ),

      LIFE_STEAL: new PilotSkill(
        'life_steal',
        'Energy Vampire',
        '+1% life steal per level',
        5,
        2500,
        { lifeSteal: 0.01 },
        { level: 25, prestige: 1 }
      ),

      ULTIMATE_COOLDOWN: new PilotSkill(
        'ultimate_cooldown',
        'Rapid Deployment',
        '-5% ultimate cooldown per level',
        5,
        3000,
        { ultimateCooldown: -0.05 },
        { level: 30, prestige: 2 }
      )
    };
  }

  /**
   * Initialize tech tree
   */
  initializeTechTree() {
    return {
      // Tier 1 - Basic Upgrades
      WEAPON_EFFICIENCY: {
        id: 'weapon_efficiency',
        name: 'Weapon Efficiency I',
        description: 'Weapons consume 10% less energy',
        cost: 5000,
        unlocked: false,
        effects: { weaponEnergyCost: -0.1 }
      },

      FASTER_RELOAD: {
        id: 'faster_reload',
        name: 'Quick Reload',
        description: 'Reload time reduced by 15%',
        cost: 6000,
        unlocked: false,
        effects: { reloadSpeed: -0.15 }
      },

      SHIELD_RECHARGE: {
        id: 'shield_recharge',
        name: 'Shield Recharge',
        description: 'Shields recharge 20% faster',
        cost: 7000,
        unlocked: false,
        effects: { shieldRechargeRate: 0.2 }
      },

      // Tier 2 - Advanced Upgrades
      PIERCING_SHOTS: {
        id: 'piercing_shots',
        name: 'Piercing Ammunition',
        description: '10% chance bullets pierce through enemies',
        cost: 15000,
        unlocked: false,
        requirements: { weapon_efficiency: true },
        effects: { pierceChance: 0.1 }
      },

      EXPLOSIVE_FINISH: {
        id: 'explosive_finish',
        name: 'Explosive Finish',
        description: 'Enemies explode on death, damaging nearby enemies',
        cost: 18000,
        unlocked: false,
        requirements: { faster_reload: true },
        effects: { deathExplosion: 0.3 }
      },

      MAGNETIC_FIELD: {
        id: 'magnetic_field',
        name: 'Magnetic Field',
        description: 'Power-ups are attracted to your ship',
        cost: 12000,
        unlocked: false,
        requirements: { shield_recharge: true },
        effects: { magneticRange: 100 }
      },

      // Tier 3 - Elite Upgrades
      DOUBLE_SHOT: {
        id: 'double_shot',
        name: 'Double Shot',
        description: '15% chance to fire two bullets for the price of one',
        cost: 30000,
        unlocked: false,
        requirements: { piercing_shots: true, explosive_finish: true },
        effects: { doubleShotChance: 0.15 }
      },

      OVERSHIELD: {
        id: 'overshield',
        name: 'Overshield',
        description: 'Shield can overcharge to 150% capacity',
        cost: 35000,
        unlocked: false,
        requirements: { magnetic_field: true, shield_recharge: true },
        effects: { maxShieldMultiplier: 1.5 }
      },

      TIME_DILATION: {
        id: 'time_dilation',
        name: 'Time Dilation Field',
        description: 'When shields break, time slows by 50% for 2 seconds',
        cost: 40000,
        unlocked: false,
        requirements: { overshield: true },
        effects: { timeSlowOnShieldBreak: 0.5 }
      },

      // Ultimate Upgrade
      PERFECT_HARMONY: {
        id: 'perfect_harmony',
        name: 'Perfect Harmony',
        description: 'All stats increased by 15%',
        cost: 100000,
        unlocked: false,
        requirements: { double_shot: true, time_dilation: true, prestige: 3 },
        effects: { allStats: 0.15 }
      }
    };
  }

  /**
   * Load player data
   */
  loadPlayerData() {
    const savedData = localStorage.getItem('metaProgression');
    
    if (savedData) {
      const data = JSON.parse(savedData);
      
      // Restore skill levels
      Object.keys(data.skills || {}).forEach(skillId => {
        if (this.skills[skillId.toUpperCase()]) {
          this.skills[skillId.toUpperCase()].currentLevel = data.skills[skillId];
        }
      });
      
      // Restore tech tree
      Object.keys(data.techTree || {}).forEach(techId => {
        if (this.techTree[techId.toUpperCase()]) {
          this.techTree[techId.toUpperCase()].unlocked = data.techTree[techId];
        }
      });
      
      return {
        level: data.level || 1,
        prestige: data.prestige || 0,
        credits: data.credits || 0,
        totalXP: data.totalXP || 0,
        skills: Object.values(this.skills),
        permanentBonuses: data.permanentBonuses || {}
      };
    }
    
    return {
      level: 1,
      prestige: 0,
      credits: 0,
      totalXP: 0,
      skills: Object.values(this.skills),
      permanentBonuses: {}
    };
  }

  /**
   * Save player data
   */
  savePlayerData() {
    const skillData = {};
    Object.keys(this.skills).forEach(key => {
      skillData[this.skills[key].id] = this.skills[key].currentLevel;
    });
    
    const techData = {};
    Object.keys(this.techTree).forEach(key => {
      techData[this.techTree[key].id] = this.techTree[key].unlocked;
    });
    
    const data = {
      level: this.playerData.level,
      prestige: this.playerData.prestige,
      credits: this.playerData.credits,
      totalXP: this.playerData.totalXP,
      skills: skillData,
      techTree: techData,
      permanentBonuses: this.playerData.permanentBonuses
    };
    
    localStorage.setItem('metaProgression', JSON.stringify(data));
  }

  /**
   * Upgrade a skill
   */
  upgradeSkill(skillId) {
    const skill = this.skills[skillId.toUpperCase()];
    if (!skill) return false;
    
    if (skill.canUpgrade(this.playerData)) {
      const cost = skill.getNextLevelCost();
      this.playerData.credits -= cost;
      skill.upgrade();
      this.savePlayerData();
      return true;
    }
    
    return false;
  }

  /**
   * Unlock tech
   */
  unlockTech(techId) {
    const tech = this.techTree[techId.toUpperCase()];
    if (!tech || tech.unlocked) return false;
    
    // Check requirements
    if (tech.requirements) {
      for (const reqId in tech.requirements) {
        if (reqId === 'prestige') {
          if (this.playerData.prestige < tech.requirements.prestige) return false;
        } else {
          const reqTech = this.techTree[reqId.toUpperCase()];
          if (!reqTech || !reqTech.unlocked) return false;
        }
      }
    }
    
    if (this.playerData.credits >= tech.cost) {
      this.playerData.credits -= tech.cost;
      tech.unlocked = true;
      this.savePlayerData();
      return true;
    }
    
    return false;
  }

  /**
   * Calculate total bonuses from skills and tech
   */
  getTotalBonuses() {
    const bonuses = {
      damageMultiplier: 1,
      fireRateMultiplier: 1,
      maxHealthMultiplier: 1,
      speedMultiplier: 1,
      shieldMultiplier: 1,
      creditMultiplier: 1,
      xpMultiplier: 1,
      critChance: 0,
      critDamage: 1.5,
      dodgeChance: 0,
      damageReduction: 0,
      healthRegen: 0,
      lifeSteal: 0,
      powerupDuration: 1
    };
    
    // Add skill bonuses
    Object.values(this.skills).forEach(skill => {
      const skillBonus = skill.getCurrentBonus();
      Object.keys(skillBonus).forEach(key => {
        if (bonuses[key] !== undefined) {
          if (key.includes('Multiplier')) {
            bonuses[key] += skillBonus[key];
          } else {
            bonuses[key] += skillBonus[key];
          }
        }
      });
    });
    
    // Add tech bonuses
    Object.values(this.techTree).forEach(tech => {
      if (tech.unlocked && tech.effects) {
        Object.keys(tech.effects).forEach(key => {
          if (key === 'allStats') {
            bonuses.damageMultiplier += tech.effects[key];
            bonuses.fireRateMultiplier += tech.effects[key];
            bonuses.maxHealthMultiplier += tech.effects[key];
            bonuses.speedMultiplier += tech.effects[key];
          } else if (bonuses[key] !== undefined) {
            bonuses[key] += tech.effects[key];
          }
        }
        );
      }
    });
    
    // Add prestige bonuses
    bonuses.damageMultiplier += this.playerData.prestige * 0.05;
    bonuses.xpMultiplier += this.playerData.prestige * 0.1;
    
    return bonuses;
  }

  /**
   * Prestige system
   */
  canPrestige() {
    return this.playerData.level >= 50;
  }

  prestige() {
    if (!this.canPrestige()) return false;
    
    this.playerData.prestige++;
    this.playerData.level = 1;
    this.playerData.totalXP = 0;
    
    // Keep credits and skills
    // Reset some progression but gain permanent bonuses
    
    this.savePlayerData();
    return true;
  }

  /**
   * Add credits
   */
  addCredits(amount) {
    const bonuses = this.getTotalBonuses();
    const finalAmount = Math.floor(amount * bonuses.creditMultiplier);
    this.playerData.credits += finalAmount;
    this.savePlayerData();
    return finalAmount;
  }

  /**
   * Add XP and level up
   */
  addXP(amount) {
    const bonuses = this.getTotalBonuses();
    const finalAmount = Math.floor(amount * bonuses.xpMultiplier);
    this.playerData.totalXP += finalAmount;
    
    // Check for level up
    const xpForNextLevel = this.getXPForLevel(this.playerData.level + 1);
    if (this.playerData.totalXP >= xpForNextLevel) {
      this.playerData.level++;
      this.savePlayerData();
      return { leveledUp: true, newLevel: this.playerData.level };
    }
    
    this.savePlayerData();
    return { leveledUp: false };
  }

  /**
   * Get XP required for level
   */
  getXPForLevel(level) {
    return Math.floor(100 * Math.pow(1.5, level - 1));
  }

  /**
   * Get progress to next level
   */
  getLevelProgress() {
    const currentLevelXP = this.getXPForLevel(this.playerData.level);
    const nextLevelXP = this.getXPForLevel(this.playerData.level + 1);
    const xpIntoCurrentLevel = this.playerData.totalXP - currentLevelXP;
    const xpNeededForLevel = nextLevelXP - currentLevelXP;
    
    return {
      current: xpIntoCurrentLevel,
      needed: xpNeededForLevel,
      percent: (xpIntoCurrentLevel / xpNeededForLevel) * 100
    };
  }
}

export default MetaProgressionSystem;

