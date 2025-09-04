/**
 * WeaponSystem - Manages weapon types, bullet creation, and firing logic
 */
import { WEAPON_TYPES, GAME_CONFIG } from '../../constants/GameConstants.js';
import { poolManager } from '../Utils/ObjectPool.js';

export class WeaponSystem {
  constructor() {
    this.weaponTypes = WEAPON_TYPES;
    this.currentWeapon = 'laser';
    this.lastShotTime = 0;
  }

  /**
   * Set current weapon type
   * @param {string} weaponType - Weapon type key
   */
  setWeapon(weaponType) {
    if (this.weaponTypes[weaponType]) {
      this.currentWeapon = weaponType;
    } else {
      console.warn(`Weapon type '${weaponType}' not found`);
    }
  }

  /**
   * Get current weapon configuration
   * @returns {Object} Current weapon config
   */
  getCurrentWeapon() {
    return this.weaponTypes[this.currentWeapon] || this.weaponTypes.laser;
  }

  /**
   * Check if weapon can fire based on fire rate
   * @param {Object} powerUps - Current power-up status
   * @param {boolean} isMobile - Is mobile device
   * @returns {boolean} Can fire
   */
  canFire(powerUps = {}, isMobile = false) {
    const now = Date.now();
    const weapon = this.getCurrentWeapon();
    
    let fireRate = weapon.fireRate;
    if (powerUps.rapidFire > 0) {
      fireRate *= GAME_CONFIG.WEAPONS.FIRE_RATE_MULTIPLIER.RAPID_FIRE;
    }
    
    // Mobile minimum fire rate
    if (isMobile) {
      fireRate = Math.max(fireRate, GAME_CONFIG.WEAPONS.FIRE_RATE_MULTIPLIER.MOBILE_MIN);
    }
    
    return !this.lastShotTime || now - this.lastShotTime > fireRate;
  }

  /**
   * Create bullets based on weapon type and power-ups
   * @param {Object} playerPos - Player position {x, y, width, height}
   * @param {Object} powerUps - Current power-up status
   * @returns {Array} Array of bullet objects
   */
  createBullets(playerPos, powerUps = {}) {
    if (!this.canFire(powerUps)) {
      return [];
    }

    this.lastShotTime = Date.now();
    const weapon = this.getCurrentWeapon();
    const bullets = [];
    
    const centerX = playerPos.x + playerPos.width / 2;
    const centerY = playerPos.y;

    if (powerUps.multiShot > 0) {
      // Multi-shot: 4 bullets side by side
      const spacing = Math.max(weapon.size[0] + 2, 8);
      const positions = [
        centerX - spacing * 1.5,
        centerX - spacing * 0.5,
        centerX + spacing * 0.5,
        centerX + spacing * 1.5
      ];

      positions.forEach(x => {
        const bullet = this.createSingleBullet(weapon, x, centerY);
        if (bullet) bullets.push(bullet);
      });
    } else if (weapon.spread > 0) {
      // Spread weapons fire multiple bullets in different directions
      const spreadCount = weapon.spread;
      const angleStep = GAME_CONFIG.WEAPONS.SPREAD_ANGLE_STEP;
      const startAngle = -(spreadCount - 1) * angleStep / 2;
      
      for (let i = 0; i < spreadCount; i++) {
        const angle = startAngle + i * angleStep;
        const bullet = this.createSpreadBullet(weapon, centerX, centerY, angle);
        if (bullet) bullets.push(bullet);
      }
    } else {
      // Single shot
      const bullet = this.createSingleBullet(weapon, centerX - weapon.size[0] / 2, centerY);
      if (bullet) bullets.push(bullet);
    }

    return bullets;
  }

  /**
   * Create a single bullet
   * @param {Object} weapon - Weapon configuration
   * @param {number} x - X position
   * @param {number} y - Y position
   * @returns {Object|null} Bullet object
   */
  createSingleBullet(weapon, x, y) {
    const bullet = poolManager.acquireObject('bullets');
    if (!bullet) return null;

    return bullet.init(
      x,
      y,
      weapon.size[0],
      weapon.size[1],
      weapon.speed,
      weapon.color,
      this.currentWeapon,
      weapon.damage
    );
  }

  /**
   * Create a spread bullet with directional velocity
   * @param {Object} weapon - Weapon configuration
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {number} angle - Spread angle
   * @returns {Object|null} Bullet object
   */
  createSpreadBullet(weapon, x, y, angle) {
    const bullet = poolManager.acquireObject('bullets');
    if (!bullet) return null;

    const vx = Math.sin(angle) * weapon.speed * 0.3;
    const vy = -Math.cos(angle) * weapon.speed;

    return bullet.init(
      x,
      y,
      weapon.size[0],
      weapon.size[1],
      weapon.speed,
      weapon.color,
      this.currentWeapon,
      weapon.damage,
      vx,
      vy
    );
  }

  /**
   * Create bullets for option drones
   * @param {Object} optionPos - Option position {x, y, width, height}
   * @param {number} lastShotTime - Last shot time for this option
   * @returns {Array} Array of bullet objects
   */
  createOptionBullets(optionPos, lastShotTime = 0) {
    const now = Date.now();
    const weapon = this.getCurrentWeapon();
    const optionFireRate = Math.max(weapon.fireRate * 0.8, 200);
    
    if (now - lastShotTime < optionFireRate) {
      return [];
    }

    const bullets = [];
    const centerX = optionPos.x + optionPos.width / 2;
    const centerY = optionPos.y;

    if (weapon.spread > 0) {
      // Limited spread for options
      const spreadCount = Math.min(weapon.spread, 3);
      const angleStep = Math.PI / 16;
      const startAngle = -(spreadCount - 1) * angleStep / 2;
      
      for (let i = 0; i < spreadCount; i++) {
        const angle = startAngle + i * angleStep;
        const bullet = this.createOptionSpreadBullet(weapon, centerX, centerY, angle);
        if (bullet) bullets.push(bullet);
      }
    } else {
      // Single shot for options
      const bullet = this.createOptionSingleBullet(weapon, centerX - weapon.size[0] / 2, centerY);
      if (bullet) bullets.push(bullet);
    }

    return bullets;
  }

  /**
   * Create a single bullet for option drone
   * @param {Object} weapon - Weapon configuration
   * @param {number} x - X position
   * @param {number} y - Y position
   * @returns {Object|null} Bullet object
   */
  createOptionSingleBullet(weapon, x, y) {
    const bullet = poolManager.acquireObject('bullets');
    if (!bullet) return null;

    return bullet.init(
      x,
      y,
      weapon.size[0],
      weapon.size[1],
      weapon.speed,
      weapon.color,
      this.currentWeapon,
      weapon.damage * 0.8 // Slightly less damage than player
    );
  }

  /**
   * Create a spread bullet for option drone
   * @param {Object} weapon - Weapon configuration
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {number} angle - Spread angle
   * @returns {Object|null} Bullet object
   */
  createOptionSpreadBullet(weapon, x, y, angle) {
    const bullet = poolManager.acquireObject('bullets');
    if (!bullet) return null;

    const vx = Math.sin(angle) * weapon.speed * 0.2;
    const vy = -Math.cos(angle) * weapon.speed;

    return bullet.init(
      x,
      y,
      weapon.size[0],
      weapon.size[1],
      weapon.speed,
      weapon.color,
      this.currentWeapon,
      weapon.damage * 0.8,
      vx,
      vy
    );
  }

  /**
   * Get weapon display information
   * @returns {Object} Weapon display info
   */
  getWeaponDisplayInfo() {
    const weapon = this.getCurrentWeapon();
    return {
      name: weapon.name,
      type: this.currentWeapon,
      damage: weapon.damage,
      speed: weapon.speed,
      fireRate: weapon.fireRate,
      spread: weapon.spread,
      color: weapon.color
    };
  }

  /**
   * Get all available weapons
   * @returns {Object} All weapon types
   */
  getAllWeapons() {
    return { ...this.weaponTypes };
  }

  /**
   * Check if weapon type exists
   * @param {string} weaponType - Weapon type to check
   * @returns {boolean} Weapon exists
   */
  hasWeapon(weaponType) {
    return !!this.weaponTypes[weaponType];
  }

  /**
   * Get weapon by emoji (for collectibles)
   * @param {string} emoji - Weapon emoji
   * @returns {string|null} Weapon type
   */
  getWeaponByEmoji(emoji) {
    const emojiToWeapon = {
      '🔫': 'laser',
      '⚡': 'plasma',
      '💥': 'missile',
      '🔮': 'beam',
      '🎯': 'spread',
      '🎪': 'homing'
    };
    
    return emojiToWeapon[emoji] || null;
  }

  /**
   * Reset weapon system
   */
  reset() {
    this.currentWeapon = 'laser';
    this.lastShotTime = 0;
  }

  /**
   * Get weapon system status
   * @returns {Object} System status
   */
  getStatus() {
    return {
      currentWeapon: this.currentWeapon,
      weaponConfig: this.getCurrentWeapon(),
      lastShotTime: this.lastShotTime,
      availableWeapons: Object.keys(this.weaponTypes).length
    };
  }
}

// Export singleton instance
export const weaponSystem = new WeaponSystem();
