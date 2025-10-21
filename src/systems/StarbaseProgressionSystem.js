/**
 * Starbase Visual Progression System
 * Tracks upgrades and visual improvements to the starbase
 */

export class StarbaseProgressionSystem {
  constructor() {
    this.upgrades = {
      // Hangar upgrades
      hangar_capacity: { level: 0, maxLevel: 5, cost: 1000, multiplier: 1.5 },
      hangar_lighting: { level: 0, maxLevel: 3, cost: 500, multiplier: 2 },
      hangar_automation: { level: 0, maxLevel: 5, cost: 2000, multiplier: 1.8 },
      
      // Operations upgrades
      ops_scanners: { level: 0, maxLevel: 5, cost: 800, multiplier: 1.6 },
      ops_computers: { level: 0, maxLevel: 5, cost: 1200, multiplier: 1.7 },
      ops_communications: { level: 0, maxLevel: 3, cost: 1500, multiplier: 2 },
      
      // Command upgrades
      command_displays: { level: 0, maxLevel: 3, cost: 1000, multiplier: 2 },
      command_officers: { level: 0, maxLevel: 5, cost: 1500, multiplier: 1.5 },
      
      // Tech Lab upgrades
      lab_equipment: { level: 0, maxLevel: 5, cost: 2000, multiplier: 1.6 },
      lab_research: { level: 0, maxLevel: 10, cost: 3000, multiplier: 1.4 },
      
      // General base upgrades
      base_power: { level: 0, maxLevel: 5, cost: 5000, multiplier: 1.5 },
      base_shields: { level: 0, maxLevel: 5, cost: 4000, multiplier: 1.6 },
      base_aesthetics: { level: 0, maxLevel: 3, cost: 2500, multiplier: 2 }
    };
    
    this.achievements = [];
    this.stats = {
      totalUpgrades: 0,
      creditsSpent: 0,
      baseAge: Date.now()
    };
    
    this.loadProgress();
  }
  
  /**
   * Get upgrade info
   */
  getUpgrade(upgradeId) {
    return this.upgrades[upgradeId];
  }
  
  /**
   * Get current cost for an upgrade
   */
  getUpgradeCost(upgradeId) {
    const upgrade = this.upgrades[upgradeId];
    if (!upgrade) return 0;
    
    return Math.floor(upgrade.cost * Math.pow(upgrade.multiplier, upgrade.level));
  }
  
  /**
   * Check if upgrade can be purchased
   */
  canUpgrade(upgradeId, credits) {
    const upgrade = this.upgrades[upgradeId];
    if (!upgrade) return false;
    
    if (upgrade.level >= upgrade.maxLevel) return false;
    
    const cost = this.getUpgradeCost(upgradeId);
    return credits >= cost;
  }
  
  /**
   * Purchase an upgrade
   */
  purchaseUpgrade(upgradeId, credits) {
    const upgrade = this.upgrades[upgradeId];
    if (!upgrade) return { success: false, message: 'Upgrade not found' };
    
    if (upgrade.level >= upgrade.maxLevel) {
      return { success: false, message: 'Max level reached' };
    }
    
    const cost = this.getUpgradeCost(upgradeId);
    
    if (credits < cost) {
      return { success: false, message: 'Insufficient credits' };
    }
    
    // Apply upgrade
    upgrade.level++;
    this.stats.totalUpgrades++;
    this.stats.creditsSpent += cost;
    
    // Check for achievements
    this.checkAchievements();
    
    this.saveProgress();
    
    return {
      success: true,
      newLevel: upgrade.level,
      creditsSpent: cost,
      remainingCredits: credits - cost
    };
  }
  
  /**
   * Get all upgrades for a specific room
   */
  getRoomUpgrades(room) {
    const prefix = room.toLowerCase() + '_';
    return Object.entries(this.upgrades)
      .filter(([id]) => id.startsWith(prefix))
      .map(([id, upgrade]) => ({
        id,
        ...upgrade,
        currentCost: this.getUpgradeCost(id)
      }));
  }
  
  /**
   * Get visual effects for current upgrades
   */
  getVisualEffects(room) {
    const effects = {
      brightness: 1.0,
      particleDensity: 1.0,
      npcCount: 1.0,
      detailLevel: 1,
      animations: []
    };
    
    // Calculate effects based on upgrades
    switch (room) {
      case 'hangar':
        effects.brightness += this.upgrades.hangar_lighting.level * 0.2;
        effects.particleDensity += this.upgrades.hangar_automation.level * 0.3;
        effects.npcCount += this.upgrades.hangar_capacity.level * 0.2;
        break;
        
      case 'operations':
        effects.brightness += this.upgrades.ops_computers.level * 0.15;
        effects.detailLevel += this.upgrades.ops_scanners.level;
        effects.animations.push('holographic_displays');
        break;
        
      case 'command':
        effects.brightness += this.upgrades.command_displays.level * 0.25;
        effects.npcCount += this.upgrades.command_officers.level * 0.15;
        effects.detailLevel += this.upgrades.command_displays.level;
        break;
        
      case 'techlab':
        effects.brightness += this.upgrades.lab_equipment.level * 0.2;
        effects.particleDensity += this.upgrades.lab_research.level * 0.2;
        effects.animations.push('research_effects');
        break;
        
      default:
        break;
    }
    
    // Apply general base upgrades
    effects.brightness += this.upgrades.base_aesthetics.level * 0.3;
    effects.brightness = Math.min(effects.brightness, 2.0); // Cap at 2x
    
    return effects;
  }
  
  /**
   * Get total upgrade progress percentage
   */
  getOverallProgress() {
    let totalLevels = 0;
    let maxLevels = 0;
    
    Object.values(this.upgrades).forEach(upgrade => {
      totalLevels += upgrade.level;
      maxLevels += upgrade.maxLevel;
    });
    
    return maxLevels > 0 ? (totalLevels / maxLevels) * 100 : 0;
  }
  
  /**
   * Check for achievements
   */
  checkAchievements() {
    const achievements = [
      {
        id: 'first_upgrade',
        name: 'First Upgrade',
        description: 'Purchase your first starbase upgrade',
        condition: () => this.stats.totalUpgrades >= 1
      },
      {
        id: 'spender',
        name: 'Big Spender',
        description: 'Spend 10,000 credits on upgrades',
        condition: () => this.stats.creditsSpent >= 10000
      },
      {
        id: 'maxed_out',
        name: 'Maxed Out',
        description: 'Max out any upgrade',
        condition: () => Object.values(this.upgrades).some(u => u.level === u.maxLevel)
      },
      {
        id: 'halfway',
        name: 'Halfway There',
        description: 'Reach 50% overall upgrade progress',
        condition: () => this.getOverallProgress() >= 50
      },
      {
        id: 'perfect_base',
        name: 'Perfect Base',
        description: 'Max out all upgrades',
        condition: () => this.getOverallProgress() >= 100
      }
    ];
    
    achievements.forEach(achievement => {
      if (!this.achievements.includes(achievement.id) && achievement.condition()) {
        this.achievements.push(achievement.id);
        console.log(`🏆 Achievement Unlocked: ${achievement.name}!`);
      }
    });
  }
  
  /**
   * Get upgrade recommendations
   */
  getRecommendations(credits, currentRoom) {
    const roomUpgrades = this.getRoomUpgrades(currentRoom);
    const affordable = roomUpgrades.filter(u => 
      u.currentCost <= credits && u.level < u.maxLevel
    );
    
    // Sort by cost (cheapest first)
    affordable.sort((a, b) => a.currentCost - b.currentCost);
    
    return affordable.slice(0, 3); // Return top 3 recommendations
  }
  
  /**
   * Save progress
   */
  saveProgress() {
    try {
      const data = {
        upgrades: this.upgrades,
        achievements: this.achievements,
        stats: this.stats
      };
      localStorage.setItem('starbase_progression', JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save progression:', e);
    }
  }
  
  /**
   * Load progress
   */
  loadProgress() {
    try {
      const saved = localStorage.getItem('starbase_progression');
      if (saved) {
        const data = JSON.parse(saved);
        
        // Merge saved upgrades with defaults (in case new upgrades were added)
        if (data.upgrades) {
          Object.keys(data.upgrades).forEach(key => {
            if (this.upgrades[key]) {
              this.upgrades[key].level = data.upgrades[key].level || 0;
            }
          });
        }
        
        this.achievements = data.achievements || [];
        this.stats = data.stats || this.stats;
      }
    } catch (e) {
      console.error('Failed to load progression:', e);
    }
  }
  
  /**
   * Reset progress
   */
  reset() {
    Object.values(this.upgrades).forEach(upgrade => {
      upgrade.level = 0;
    });
    this.achievements = [];
    this.stats = {
      totalUpgrades: 0,
      creditsSpent: 0,
      baseAge: Date.now()
    };
    this.saveProgress();
  }
}

export default StarbaseProgressionSystem;

