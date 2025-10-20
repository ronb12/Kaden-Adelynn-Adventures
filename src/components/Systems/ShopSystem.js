/**
 * ShopSystem - Manages currency, upgrades, and shop interface
 */

export class ShopSystem {
  constructor() {
    this.currency = 0;
    this.totalEarned = 0;
    this.upgrades = {
      maxHealth: 0,        // +20 health per level, max 5
      damage: 0,           // +10% damage per level, max 5
      fireRate: 0,         // -10% fire rate per level, max 5
      speed: 0,            // +1 speed per level, max 3
      startingLives: 0,    // +5 lives per level, max 3
      shieldCapacity: 0,   // +50 shield per level, max 3
      luckyCharm: 0,       // +10% better drops, max 3
      extraXP: 0          // +25% XP gain, max 3
    };
    this.ships = {
      phoenixWing: { owned: true, equipped: true },    // Kaden's default
      stellarArrow: { owned: true, equipped: false },   // Adelynn's default
      voidHunter: { owned: false, equipped: false },
      starDancer: { owned: false, equipped: false },
      cosmicDefender: { owned: false, equipped: false }
    };
    this.cosmetics = {
      shipColors: ['default'],
      trails: ['default'],
      effects: ['default']
    };
    this.loadFromStorage();
  }

  /**
   * Add currency
   */
  addCurrency(amount) {
    this.currency += amount;
    this.totalEarned += amount;
    this.saveToStorage();
  }

  /**
   * Spend currency
   */
  spendCurrency(amount) {
    if (this.currency >= amount) {
      this.currency -= amount;
      this.saveToStorage();
      return true;
    }
    return false;
  }

  /**
   * Get upgrade cost
   */
  getUpgradeCost(upgradeName) {
    const level = this.upgrades[upgradeName] || 0;
    const baseCosts = {
      maxHealth: 500,
      damage: 750,
      fireRate: 1000,
      speed: 1200,
      startingLives: 2000,
      shieldCapacity: 1500,
      luckyCharm: 800,
      extraXP: 600
    };

    const baseCost = baseCosts[upgradeName] || 500;
    return Math.floor(baseCost * Math.pow(1.5, level));
  }

  /**
   * Get max level for upgrade
   */
  getMaxLevel(upgradeName) {
    const maxLevels = {
      maxHealth: 5,
      damage: 5,
      fireRate: 5,
      speed: 3,
      startingLives: 3,
      shieldCapacity: 3,
      luckyCharm: 3,
      extraXP: 3
    };
    return maxLevels[upgradeName] || 3;
  }

  /**
   * Purchase upgrade
   */
  purchaseUpgrade(upgradeName) {
    const currentLevel = this.upgrades[upgradeName] || 0;
    const maxLevel = this.getMaxLevel(upgradeName);

    if (currentLevel >= maxLevel) {
      return { success: false, message: 'Max level reached!' };
    }

    const cost = this.getUpgradeCost(upgradeName);

    if (this.spendCurrency(cost)) {
      this.upgrades[upgradeName] = currentLevel + 1;
      this.saveToStorage();
      return { 
        success: true, 
        message: `Upgraded ${this.getUpgradeName(upgradeName)} to level ${currentLevel + 1}!`,
        newLevel: currentLevel + 1
      };
    }

    return { success: false, message: 'Not enough credits!' };
  }

  /**
   * Get ship cost
   */
  getShipCost(shipName) {
    const costs = {
      phoenixWing: 0,      // Default
      stellarArrow: 0,     // Default
      voidHunter: 5000,
      starDancer: 7500,
      cosmicDefender: 10000
    };
    return costs[shipName] || 0;
  }

  /**
   * Purchase ship
   */
  purchaseShip(shipName) {
    if (this.ships[shipName]?.owned) {
      return { success: false, message: 'Already owned!' };
    }

    const cost = this.getShipCost(shipName);

    if (this.spendCurrency(cost)) {
      this.ships[shipName] = { owned: true, equipped: false };
      this.saveToStorage();
      return { 
        success: true, 
        message: `Purchased ${this.getShipName(shipName)}!`
      };
    }

    return { success: false, message: 'Not enough credits!' };
  }

  /**
   * Equip ship
   */
  equipShip(shipName) {
    if (!this.ships[shipName]?.owned) {
      return { success: false, message: 'Ship not owned!' };
    }

    // Unequip all ships
    Object.keys(this.ships).forEach(key => {
      if (this.ships[key]) {
        this.ships[key].equipped = false;
      }
    });

    // Equip selected ship
    this.ships[shipName].equipped = true;
    this.saveToStorage();

    return { 
      success: true, 
      message: `Equipped ${this.getShipName(shipName)}!` 
    };
  }

  /**
   * Get equipped ship
   */
  getEquippedShip() {
    for (const [key, ship] of Object.entries(this.ships)) {
      if (ship.equipped) return key;
    }
    return 'phoenixWing'; // Default
  }

  /**
   * Get ship stats
   */
  getShipStats(shipName) {
    const stats = {
      phoenixWing: {
        name: 'Phoenix Wing',
        speed: 5,
        health: 100,
        damage: 1.0,
        special: 'Balanced stats, bonus damage on kills'
      },
      stellarArrow: {
        name: 'Stellar Arrow',
        speed: 6,
        health: 90,
        damage: 0.9,
        special: 'Fast movement, tactical bonuses'
      },
      voidHunter: {
        name: 'Void Hunter',
        speed: 3,
        health: 150,
        damage: 1.3,
        special: 'Heavy armor, high damage, slow'
      },
      starDancer: {
        name: 'Star Dancer',
        speed: 8,
        health: 70,
        damage: 0.8,
        special: 'Ultra-fast, low health, evasive'
      },
      cosmicDefender: {
        name: 'Cosmic Defender',
        speed: 4,
        health: 120,
        damage: 1.1,
        special: 'Tank build, shield recharge bonus'
      }
    };
    return stats[shipName] || stats.phoenixWing;
  }

  /**
   * Apply upgrades to player
   */
  applyUpgrades(player) {
    const upgradedStats = {
      maxHealth: 100 + (this.upgrades.maxHealth * 20),
      health: player.health,
      speed: 5 + this.upgrades.speed,
      damageMultiplier: 1 + (this.upgrades.damage * 0.1),
      fireRateMultiplier: 1 - (this.upgrades.fireRate * 0.1),
      lives: 25 + (this.upgrades.startingLives * 5),
      shieldCapacity: 100 + (this.upgrades.shieldCapacity * 50),
      dropRateMultiplier: 1 + (this.upgrades.luckyCharm * 0.1),
      xpMultiplier: 1 + (this.upgrades.extraXP * 0.25)
    };

    return upgradedStats;
  }

  /**
   * Get upgrade name for display
   */
  getUpgradeName(upgradeName) {
    const names = {
      maxHealth: 'Max Health',
      damage: 'Weapon Damage',
      fireRate: 'Fire Rate',
      speed: 'Movement Speed',
      startingLives: 'Starting Lives',
      shieldCapacity: 'Shield Capacity',
      luckyCharm: 'Lucky Charm',
      extraXP: 'XP Boost'
    };
    return names[upgradeName] || upgradeName;
  }

  /**
   * Get upgrade description
   */
  getUpgradeDescription(upgradeName) {
    const descriptions = {
      maxHealth: '+20 max health per level',
      damage: '+10% weapon damage per level',
      fireRate: '-10% fire rate cooldown per level',
      speed: '+1 movement speed per level',
      startingLives: '+5 starting lives per level',
      shieldCapacity: '+50 shield capacity per level',
      luckyCharm: '+10% better drop rates per level',
      extraXP: '+25% XP gain per level'
    };
    return descriptions[upgradeName] || 'Unknown upgrade';
  }

  /**
   * Get ship name for display
   */
  getShipName(shipName) {
    const names = {
      phoenixWing: 'Phoenix Wing',
      stellarArrow: 'Stellar Arrow',
      voidHunter: 'Void Hunter',
      starDancer: 'Star Dancer',
      cosmicDefender: 'Cosmic Defender'
    };
    return names[shipName] || shipName;
  }

  /**
   * Get all available upgrades for shop display
   */
  getAvailableUpgrades() {
    return Object.keys(this.upgrades).map(key => ({
      id: key,
      name: this.getUpgradeName(key),
      description: this.getUpgradeDescription(key),
      currentLevel: this.upgrades[key],
      maxLevel: this.getMaxLevel(key),
      cost: this.getUpgradeCost(key),
      canAfford: this.currency >= this.getUpgradeCost(key),
      maxed: this.upgrades[key] >= this.getMaxLevel(key)
    }));
  }

  /**
   * Get all available ships for shop display
   */
  getAvailableShips() {
    return Object.keys(this.ships).map(key => ({
      id: key,
      name: this.getShipName(key),
      stats: this.getShipStats(key),
      cost: this.getShipCost(key),
      owned: this.ships[key]?.owned || false,
      equipped: this.ships[key]?.equipped || false,
      canAfford: this.currency >= this.getShipCost(key)
    }));
  }

  /**
   * Convert score to currency at end of game
   */
  convertScoreToCurrency(score) {
    const currency = Math.floor(score / 10); // 10 points = 1 credit
    this.addCurrency(currency);
    return currency;
  }

  /**
   * Save to localStorage
   */
  saveToStorage() {
    try {
      const data = {
        currency: this.currency,
        totalEarned: this.totalEarned,
        upgrades: this.upgrades,
        ships: this.ships,
        cosmetics: this.cosmetics
      };
      localStorage.setItem('kadenAdelynnShop', JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save shop data:', error);
    }
  }

  /**
   * Load from localStorage
   */
  loadFromStorage() {
    try {
      const saved = localStorage.getItem('kadenAdelynnShop');
      if (saved) {
        const data = JSON.parse(saved);
        this.currency = data.currency || 0;
        this.totalEarned = data.totalEarned || 0;
        this.upgrades = { ...this.upgrades, ...data.upgrades };
        this.ships = { ...this.ships, ...data.ships };
        this.cosmetics = { ...this.cosmetics, ...data.cosmetics };
      }
    } catch (error) {
      console.warn('Failed to load shop data:', error);
    }
  }

  /**
   * Reset all purchases (for testing)
   */
  resetPurchases() {
    this.upgrades = {
      maxHealth: 0,
      damage: 0,
      fireRate: 0,
      speed: 0,
      startingLives: 0,
      shieldCapacity: 0,
      luckyCharm: 0,
      extraXP: 0
    };
    this.ships = {
      phoenixWing: { owned: true, equipped: true },
      stellarArrow: { owned: true, equipped: false },
      voidHunter: { owned: false, equipped: false },
      starDancer: { owned: false, equipped: false },
      cosmicDefender: { owned: false, equipped: false }
    };
    this.saveToStorage();
  }

  /**
   * Get shop statistics
   */
  getStats() {
    return {
      currency: this.currency,
      totalEarned: this.totalEarned,
      upgradesOwned: Object.values(this.upgrades).reduce((sum, level) => sum + level, 0),
      shipsOwned: Object.values(this.ships).filter(ship => ship.owned).length,
      totalShips: Object.keys(this.ships).length
    };
  }
}

export const shopSystem = new ShopSystem();

