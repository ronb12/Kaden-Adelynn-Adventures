/**
 * CollisionSystem - Optimized collision detection and handling
 */
import { poolManager } from '../Utils/ObjectPool.js';
import { GAME_CONFIG } from '../../constants/GameConstants.js';

export class CollisionSystem {
  constructor() {
    this.collisions = [];
  }

  /**
   * Basic AABB (Axis-Aligned Bounding Box) collision detection
   * @param {Object} rect1 - First rectangle {x, y, width, height}
   * @param {Object} rect2 - Second rectangle {x, y, width, height}
   * @returns {boolean} Collision detected
   */
  checkAABB(rect1, rect2) {
    return (
      rect1.x < rect2.x + rect2.width &&
      rect1.x + rect1.width > rect2.x &&
      rect1.y < rect2.y + rect2.height &&
      rect1.y + rect1.height > rect2.y
    );
  }

  /**
   * Circle collision detection (more accurate for round objects)
   * @param {Object} circle1 - First circle {x, y, radius}
   * @param {Object} circle2 - Second circle {x, y, radius}
   * @returns {boolean} Collision detected
   */
  checkCircle(circle1, circle2) {
    const dx = circle1.x - circle2.x;
    const dy = circle1.y - circle2.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < (circle1.radius + circle2.radius);
  }

  /**
   * Convert rectangle to circle for collision detection
   * @param {Object} rect - Rectangle {x, y, width, height}
   * @returns {Object} Circle {x, y, radius}
   */
  rectToCircle(rect) {
    return {
      x: rect.x + rect.width / 2,
      y: rect.y + rect.height / 2,
      radius: Math.min(rect.width, rect.height) / 2
    };
  }

  /**
   * Check bullet-enemy collisions
   * @param {Array} bullets - Array of bullet objects
   * @param {Array} enemies - Array of enemy objects
   * @param {Function} onHit - Callback for hit events
   * @returns {Object} Collision results
   */
  checkBulletEnemyCollisions(bullets, enemies, onHit) {
    const results = {
      bulletsToRemove: [],
      enemiesToRemove: [],
      hits: []
    };

    for (let i = bullets.length - 1; i >= 0; i--) {
      const bullet = bullets[i];
      if (!bullet.active) continue;

      for (let j = enemies.length - 1; j >= 0; j--) {
        const enemy = enemies[j];
        if (!enemy.active) continue;

        if (this.checkAABB(bullet, enemy)) {
          // Collision detected
          const hit = {
            bullet,
            enemy,
            damage: bullet.damage || 10,
            position: {
              x: enemy.x + enemy.width / 2,
              y: enemy.y + enemy.height / 2
            }
          };

          results.hits.push(hit);
          results.bulletsToRemove.push(i);

          // Handle enemy damage
          const enemyDestroyed = enemy.takeDamage ? enemy.takeDamage(hit.damage) : true;
          
          if (enemyDestroyed) {
            results.enemiesToRemove.push(j);
          }

          // Call hit callback
          if (onHit) {
            onHit(hit);
          }

          break; // Bullet can only hit one enemy
        }
      }
    }

    return results;
  }

  /**
   * Check player-enemy collisions
   * @param {Object} player - Player object
   * @param {Array} enemies - Array of enemy objects
   * @param {Function} onHit - Callback for hit events
   * @returns {Array} Collision results
   */
  checkPlayerEnemyCollisions(player, enemies, onHit) {
    const results = [];

    for (let i = 0; i < enemies.length; i++) {
      const enemy = enemies[i];
      if (!enemy.active) continue;

      if (this.checkAABB(player, enemy)) {
        const hit = {
          player,
          enemy,
          damage: 1, // Standard collision damage
          position: {
            x: player.x + player.width / 2,
            y: player.y + player.height / 2
          }
        };

        results.push(hit);

        // Call hit callback
        if (onHit) {
          onHit(hit);
        }
      }
    }

    return results;
  }

  /**
   * Check player-bullet collisions (enemy bullets)
   * @param {Object} player - Player object
   * @param {Array} bullets - Array of enemy bullet objects
   * @param {Function} onHit - Callback for hit events
   * @returns {Object} Collision results
   */
  checkPlayerBulletCollisions(player, bullets, onHit) {
    const results = {
      bulletsToRemove: [],
      hits: []
    };

    for (let i = bullets.length - 1; i >= 0; i--) {
      const bullet = bullets[i];
      if (!bullet.active) continue;

      if (this.checkAABB(player, bullet)) {
        const hit = {
          player,
          bullet,
          damage: bullet.damage || 1,
          position: {
            x: player.x + player.width / 2,
            y: player.y + player.height / 2
          }
        };

        results.hits.push(hit);
        results.bulletsToRemove.push(i);

        // Call hit callback
        if (onHit) {
          onHit(hit);
        }
      }
    }

    return results;
  }

  /**
   * Check player-collectible collisions
   * @param {Object} player - Player object
   * @param {Array} collectibles - Array of collectible objects
   * @param {Function} onCollect - Callback for collection events
   * @returns {Object} Collision results
   */
  checkPlayerCollectibleCollisions(player, collectibles, onCollect) {
    const results = {
      collectiblesToRemove: [],
      collections: []
    };

    for (let i = collectibles.length - 1; i >= 0; i--) {
      const collectible = collectibles[i];
      if (!collectible.active && collectible.active !== undefined) continue;

      if (this.checkAABB(player, collectible)) {
        const collection = {
          player,
          collectible,
          type: collectible.type || 'unknown',
          value: collectible.points || collectible.value || 0,
          position: {
            x: collectible.x + collectible.width / 2,
            y: collectible.y + collectible.height / 2
          }
        };

        results.collections.push(collection);
        results.collectiblesToRemove.push(i);

        // Call collection callback
        if (onCollect) {
          onCollect(collection);
        }
      }
    }

    return results;
  }

  /**
   * Create explosion particles at collision point
   * @param {Object} position - Position {x, y}
   * @param {string} color - Particle color
   * @param {number} count - Number of particles
   * @returns {Array} Created particles
   */
  createCollisionParticles(position, color = '#ff8800', count = 5) {
    const particles = [];

    for (let i = 0; i < count; i++) {
      const particle = poolManager.acquireObject('particles');
      if (particle) {
        particle.init(
          position.x,
          position.y,
          (Math.random() - 0.5) * 6, // vx
          (Math.random() - 0.5) * 6, // vy
          30, // life
          color
        );
        particles.push(particle);
      }
    }

    return particles;
  }

  /**
   * Optimized collision detection using spatial partitioning
   * @param {Array} objects1 - First set of objects
   * @param {Array} objects2 - Second set of objects
   * @param {number} cellSize - Grid cell size
   * @returns {Array} Potential collision pairs
   */
  spatialPartitionCollisions(objects1, objects2, cellSize = 64) {
    const grid = new Map();
    const pairs = [];

    // Helper function to get grid cell
    const getCell = (x, y) => {
      const cellX = Math.floor(x / cellSize);
      const cellY = Math.floor(y / cellSize);
      return `${cellX},${cellY}`;
    };

    // Insert objects1 into grid
    objects1.forEach((obj, index) => {
      if (!obj.active && obj.active !== undefined) return;
      
      const cell = getCell(obj.x + obj.width / 2, obj.y + obj.height / 2);
      if (!grid.has(cell)) {
        grid.set(cell, { set1: [], set2: [] });
      }
      grid.get(cell).set1.push({ obj, index });
    });

    // Check objects2 against grid
    objects2.forEach((obj, index) => {
      if (!obj.active && obj.active !== undefined) return;
      
      const cell = getCell(obj.x + obj.width / 2, obj.y + obj.height / 2);
      if (grid.has(cell)) {
        const cellData = grid.get(cell);
        cellData.set1.forEach(item1 => {
          if (this.checkAABB(item1.obj, obj)) {
            pairs.push({
              obj1: item1.obj,
              obj2: obj,
              index1: item1.index,
              index2: index
            });
          }
        });
      }
    });

    return pairs;
  }

  /**
   * Batch process collision results
   * @param {Array} bullets - Bullets array
   * @param {Array} enemies - Enemies array
   * @param {Array} bulletsToRemove - Indices to remove
   * @param {Array} enemiesToRemove - Indices to remove
   */
  processBatchRemovals(bullets, enemies, bulletsToRemove, enemiesToRemove) {
    // Remove bullets (reverse order to maintain indices)
    bulletsToRemove.sort((a, b) => b - a).forEach(index => {
      const bullet = bullets[index];
      if (bullet) {
        poolManager.releaseObject('bullets', bullet);
        bullets.splice(index, 1);
      }
    });

    // Remove enemies (reverse order to maintain indices)
    enemiesToRemove.sort((a, b) => b - a).forEach(index => {
      const enemy = enemies[index];
      if (enemy) {
        poolManager.releaseObject('enemies', enemy);
        enemies.splice(index, 1);
      }
    });
  }

  /**
   * Check if object is off screen
   * @param {Object} obj - Object to check
   * @param {number} canvasWidth - Canvas width
   * @param {number} canvasHeight - Canvas height
   * @param {number} margin - Off-screen margin
   * @returns {boolean} Object is off screen
   */
  isOffScreen(obj, canvasWidth, canvasHeight, margin = 50) {
    return (
      obj.x < -margin ||
      obj.y < -margin ||
      obj.x > canvasWidth + margin ||
      obj.y > canvasHeight + margin
    );
  }

  /**
   * Get collision system statistics
   * @returns {Object} System statistics
   */
  getStats() {
    return {
      totalCollisions: this.collisions.length,
      poolStats: poolManager.getStats()
    };
  }

  /**
   * Reset collision system
   */
  reset() {
    this.collisions = [];
  }
}

// Export singleton instance
export const collisionSystem = new CollisionSystem();
