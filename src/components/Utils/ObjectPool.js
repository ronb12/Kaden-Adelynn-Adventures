/**
 * ObjectPool - Efficient memory management for game objects
 * Reduces garbage collection by reusing objects instead of creating new ones
 */
export class ObjectPool {
  constructor(createFn, resetFn = null, initialSize = 10) {
    this.createFn = createFn;
    this.resetFn = resetFn;
    this.pool = [];
    this.activeObjects = new Set();
    
    // Pre-populate pool
    for (let i = 0; i < initialSize; i++) {
      this.pool.push(this.createFn());
    }
  }
  
  /**
   * Acquire an object from the pool
   * @returns {Object} Reused or new object
   */
  acquire() {
    let obj;
    
    if (this.pool.length > 0) {
      obj = this.pool.pop();
    } else {
      obj = this.createFn();
    }
    
    this.activeObjects.add(obj);
    return obj;
  }
  
  /**
   * Release an object back to the pool
   * @param {Object} obj - Object to release
   */
  release(obj) {
    if (!this.activeObjects.has(obj)) {
      console.warn('Attempting to release object not managed by this pool');
      return;
    }
    
    this.activeObjects.delete(obj);
    
    // Reset object if reset function provided
    if (this.resetFn) {
      this.resetFn(obj);
    }
    
    this.pool.push(obj);
  }
  
  /**
   * Release all active objects back to pool
   */
  releaseAll() {
    this.activeObjects.forEach(obj => {
      if (this.resetFn) {
        this.resetFn(obj);
      }
      this.pool.push(obj);
    });
    this.activeObjects.clear();
  }
  
  /**
   * Get pool statistics
   * @returns {Object} Pool stats
   */
  getStats() {
    return {
      poolSize: this.pool.length,
      activeCount: this.activeObjects.size,
      totalCreated: this.pool.length + this.activeObjects.size
    };
  }
  
  /**
   * Clear the entire pool
   */
  clear() {
    this.pool.length = 0;
    this.activeObjects.clear();
  }
}

/**
 * Bullet object for pooling
 */
export class PooledBullet {
  constructor() {
    this.reset();
  }
  
  init(x, y, width, height, speed, color, weapon, damage = 10, vx = 0, vy = 0) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.speed = speed;
    this.color = color;
    this.weapon = weapon;
    this.damage = damage;
    this.vx = vx;
    this.vy = vy;
    this.active = true;
    return this;
  }
  
  update() {
    if (this.vx !== 0 || this.vy !== 0) {
      // Spread weapons with directional velocity
      this.x += this.vx;
      this.y += this.vy;
    } else {
      // Standard upward movement
      this.y -= this.speed;
    }
  }
  
  isOffScreen(canvasWidth, canvasHeight) {
    return (
      this.y < -this.height ||
      this.x < -this.width ||
      this.x > canvasWidth + this.width ||
      this.y > canvasHeight + this.height
    );
  }
  
  reset() {
    this.x = 0;
    this.y = 0;
    this.width = 0;
    this.height = 0;
    this.speed = 0;
    this.color = '#ffffff';
    this.weapon = 'laser';
    this.damage = 10;
    this.vx = 0;
    this.vy = 0;
    this.active = false;
  }
}

/**
 * Particle object for pooling
 */
export class PooledParticle {
  constructor() {
    this.reset();
  }
  
  init(x, y, vx, vy, life, color) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.life = life;
    this.maxLife = life;
    this.color = color;
    this.active = true;
    return this;
  }
  
  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.life--;
  }
  
  isAlive() {
    return this.life > 0;
  }
  
  getAlpha() {
    return this.life / this.maxLife;
  }
  
  getSize() {
    return (this.life / this.maxLife) * 4 + 1;
  }
  
  reset() {
    this.x = 0;
    this.y = 0;
    this.vx = 0;
    this.vy = 0;
    this.life = 0;
    this.maxLife = 0;
    this.color = '#ffffff';
    this.active = false;
  }
}

/**
 * Enemy object for pooling
 */
export class PooledEnemy {
  constructor() {
    this.reset();
  }
  
  init(x, y, width, height, speed, type, color, behavior = null) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.speed = speed;
    this.type = type;
    this.color = color;
    this.behavior = behavior;
    this.lastShot = 0;
    this.health = type === 'boss' ? 100 : 1;
    this.maxHealth = this.health;
    this.active = true;
    
    // Behavior-specific properties
    if (behavior === 'zigzag') {
      this.zigzagOffset = Math.random() * Math.PI * 2;
      this.originalX = x;
    }
    
    return this;
  }
  
  update(currentTime, canvasWidth, playerX, playerY) {
    switch (this.behavior) {
      case 'boss':
        this.updateBossMovement(currentTime, canvasWidth);
        break;
      case 'zigzag':
        this.updateZigzagMovement(currentTime);
        break;
      case 'kamikaze':
        this.updateKamikazeMovement(playerX, playerY);
        break;
      default:
        this.y += this.speed;
        break;
    }
  }
  
  updateBossMovement(currentTime, canvasWidth) {
    // Boss-specific movement logic would go here
    this.y += this.speed * 0.5; // Slower movement
  }
  
  updateZigzagMovement(currentTime) {
    this.y += this.speed;
    this.x = this.originalX + Math.sin(this.zigzagOffset + currentTime * 0.003) * 50;
    this.zigzagOffset += 0.1;
  }
  
  updateKamikazeMovement(playerX, playerY) {
    const dx = playerX - this.x;
    const dy = playerY - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance > 0) {
      this.x += (dx / distance) * this.speed * 0.7;
      this.y += (dy / distance) * this.speed * 0.7;
    } else {
      this.y += this.speed;
    }
  }
  
  isOffScreen(canvasHeight) {
    return this.y > canvasHeight + this.height;
  }
  
  takeDamage(damage) {
    this.health -= damage;
    return this.health <= 0;
  }
  
  reset() {
    this.x = 0;
    this.y = 0;
    this.width = 0;
    this.height = 0;
    this.speed = 0;
    this.type = 'normal';
    this.color = '#ff0000';
    this.behavior = null;
    this.lastShot = 0;
    this.health = 1;
    this.maxHealth = 1;
    this.active = false;
    this.zigzagOffset = 0;
    this.originalX = 0;
  }
}

/**
 * Pool Manager - Manages multiple object pools
 */
export class PoolManager {
  constructor() {
    this.pools = new Map();
    this.initializePools();
  }
  
  initializePools() {
    // Bullet pool
    this.pools.set('bullets', new ObjectPool(
      () => new PooledBullet(),
      (bullet) => bullet.reset(),
      50
    ));
    
    // Particle pool
    this.pools.set('particles', new ObjectPool(
      () => new PooledParticle(),
      (particle) => particle.reset(),
      100
    ));
    
    // Enemy pool
    this.pools.set('enemies', new ObjectPool(
      () => new PooledEnemy(),
      (enemy) => enemy.reset(),
      20
    ));
  }
  
  getPool(type) {
    return this.pools.get(type);
  }
  
  acquireObject(type) {
    const pool = this.pools.get(type);
    if (!pool) {
      console.error(`Pool type '${type}' not found`);
      return null;
    }
    return pool.acquire();
  }
  
  releaseObject(type, obj) {
    const pool = this.pools.get(type);
    if (!pool) {
      console.error(`Pool type '${type}' not found`);
      return;
    }
    pool.release(obj);
  }
  
  releaseAll() {
    this.pools.forEach(pool => pool.releaseAll());
  }
  
  getStats() {
    const stats = {};
    this.pools.forEach((pool, type) => {
      stats[type] = pool.getStats();
    });
    return stats;
  }
  
  clear() {
    this.pools.forEach(pool => pool.clear());
  }
}

// Export singleton instance
export const poolManager = new PoolManager();
