/**
 * ObjectPool.test.js - Tests for object pooling system
 */
import { ObjectPool, PooledBullet, PooledParticle, PooledEnemy, PoolManager, poolManager } from '../../components/Utils/ObjectPool.js';

describe('ObjectPool', () => {
  let pool;
  
  beforeEach(() => {
    pool = new ObjectPool(
      () => ({ id: Math.random(), reset: jest.fn() }),
      (obj) => obj.reset(),
      5
    );
  });

  afterEach(() => {
    pool.clear();
  });

  test('should create pool with initial size', () => {
    const stats = pool.getStats();
    expect(stats.poolSize).toBe(5);
    expect(stats.activeCount).toBe(0);
    expect(stats.totalCreated).toBe(5);
  });

  test('should acquire objects from pool', () => {
    const obj1 = pool.acquire();
    const obj2 = pool.acquire();
    
    expect(obj1).toBeDefined();
    expect(obj2).toBeDefined();
    expect(obj1).not.toBe(obj2);
    
    const stats = pool.getStats();
    expect(stats.activeCount).toBe(2);
    expect(stats.poolSize).toBe(3);
  });

  test('should release objects back to pool', () => {
    const obj = pool.acquire();
    pool.release(obj);
    
    const stats = pool.getStats();
    expect(stats.activeCount).toBe(0);
    expect(stats.poolSize).toBe(5);
    expect(obj.reset).toHaveBeenCalled();
  });

  test('should create new objects when pool is empty', () => {
    // Acquire all objects
    const objects = [];
    for (let i = 0; i < 10; i++) {
      objects.push(pool.acquire());
    }
    
    const stats = pool.getStats();
    expect(stats.totalCreated).toBe(10);
    expect(stats.activeCount).toBe(10);
    expect(stats.poolSize).toBe(0);
  });

  test('should release all active objects', () => {
    const obj1 = pool.acquire();
    const obj2 = pool.acquire();
    
    pool.releaseAll();
    
    const stats = pool.getStats();
    expect(stats.activeCount).toBe(0);
    expect(stats.poolSize).toBe(5);
    expect(obj1.reset).toHaveBeenCalled();
    expect(obj2.reset).toHaveBeenCalled();
  });

  test('should warn when releasing unmanaged object', () => {
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
    const obj = { id: 'unmanaged' };
    
    pool.release(obj);
    
    expect(consoleSpy).toHaveBeenCalledWith('Attempting to release object not managed by this pool');
    consoleSpy.mockRestore();
  });
});

describe('PooledBullet', () => {
  let bullet;
  
  beforeEach(() => {
    bullet = new PooledBullet();
  });

  test('should initialize with default values', () => {
    expect(bullet.x).toBe(0);
    expect(bullet.y).toBe(0);
    expect(bullet.active).toBe(false);
    expect(bullet.weapon).toBe('laser');
  });

  test('should initialize with provided values', () => {
    bullet.init(10, 20, 5, 10, 8, '#ff0000', 'plasma', 15, 2, -5);
    
    expect(bullet.x).toBe(10);
    expect(bullet.y).toBe(20);
    expect(bullet.width).toBe(5);
    expect(bullet.height).toBe(10);
    expect(bullet.speed).toBe(8);
    expect(bullet.color).toBe('#ff0000');
    expect(bullet.weapon).toBe('plasma');
    expect(bullet.damage).toBe(15);
    expect(bullet.vx).toBe(2);
    expect(bullet.vy).toBe(-5);
    expect(bullet.active).toBe(true);
  });

  test('should update position correctly', () => {
    bullet.init(10, 20, 5, 10, 8, '#ff0000', 'laser');
    bullet.update();
    
    expect(bullet.y).toBe(12); // 20 - 8
  });

  test('should update position with directional velocity', () => {
    bullet.init(10, 20, 5, 10, 8, '#ff0000', 'spread', 10, 2, -5);
    bullet.update();
    
    expect(bullet.x).toBe(12); // 10 + 2
    expect(bullet.y).toBe(15); // 20 + (-5)
  });

  test('should detect off-screen bullets', () => {
    bullet.init(-10, -10, 5, 10, 8, '#ff0000', 'laser');
    expect(bullet.isOffScreen(800, 600)).toBe(true);
    
    bullet.init(400, 300, 5, 10, 8, '#ff0000', 'laser');
    expect(bullet.isOffScreen(800, 600)).toBe(false);
    
    bullet.init(900, 700, 5, 10, 8, '#ff0000', 'laser');
    expect(bullet.isOffScreen(800, 600)).toBe(true);
  });

  test('should reset to default values', () => {
    bullet.init(10, 20, 5, 10, 8, '#ff0000', 'plasma', 15);
    bullet.reset();
    
    expect(bullet.x).toBe(0);
    expect(bullet.y).toBe(0);
    expect(bullet.active).toBe(false);
    expect(bullet.weapon).toBe('laser');
  });
});

describe('PooledParticle', () => {
  let particle;
  
  beforeEach(() => {
    particle = new PooledParticle();
  });

  test('should initialize with provided values', () => {
    particle.init(10, 20, 2, -3, 30, '#ff8800');
    
    expect(particle.x).toBe(10);
    expect(particle.y).toBe(20);
    expect(particle.vx).toBe(2);
    expect(particle.vy).toBe(-3);
    expect(particle.life).toBe(30);
    expect(particle.maxLife).toBe(30);
    expect(particle.color).toBe('#ff8800');
    expect(particle.active).toBe(true);
  });

  test('should update position and life', () => {
    particle.init(10, 20, 2, -3, 30, '#ff8800');
    particle.update();
    
    expect(particle.x).toBe(12); // 10 + 2
    expect(particle.y).toBe(17); // 20 + (-3)
    expect(particle.life).toBe(29); // 30 - 1
  });

  test('should calculate alpha correctly', () => {
    particle.init(10, 20, 2, -3, 30, '#ff8800');
    expect(particle.getAlpha()).toBe(1); // 30/30
    
    particle.life = 15;
    expect(particle.getAlpha()).toBe(0.5); // 15/30
  });

  test('should calculate size correctly', () => {
    particle.init(10, 20, 2, -3, 30, '#ff8800');
    expect(particle.getSize()).toBe(5); // (30/30) * 4 + 1
    
    particle.life = 15;
    expect(particle.getSize()).toBe(3); // (15/30) * 4 + 1
  });

  test('should detect when particle is alive', () => {
    particle.init(10, 20, 2, -3, 30, '#ff8800');
    expect(particle.isAlive()).toBe(true);
    
    particle.life = 0;
    expect(particle.isAlive()).toBe(false);
  });
});

describe('PooledEnemy', () => {
  let enemy;
  
  beforeEach(() => {
    enemy = new PooledEnemy();
  });

  test('should initialize with provided values', () => {
    enemy.init(50, 0, 30, 30, 2, 'fast', '#ff6600', 'zigzag');
    
    expect(enemy.x).toBe(50);
    expect(enemy.y).toBe(0);
    expect(enemy.width).toBe(30);
    expect(enemy.height).toBe(30);
    expect(enemy.speed).toBe(2);
    expect(enemy.type).toBe('fast');
    expect(enemy.color).toBe('#ff6600');
    expect(enemy.behavior).toBe('zigzag');
    expect(enemy.health).toBe(1);
    expect(enemy.active).toBe(true);
  });

  test('should initialize boss with more health', () => {
    enemy.init(50, 0, 100, 80, 1, 'boss', '#ff00ff', 'boss');
    
    expect(enemy.health).toBe(100);
    expect(enemy.maxHealth).toBe(100);
  });

  test('should update normal movement', () => {
    enemy.init(50, 0, 30, 30, 2, 'normal', '#ff0000');
    enemy.update(0, 800, 400, 500);
    
    expect(enemy.y).toBe(2); // 0 + speed
  });

  test('should update kamikaze movement', () => {
    enemy.init(50, 0, 30, 30, 2, 'kamikaze', '#ffff00', 'kamikaze');
    enemy.update(0, 800, 400, 500);
    
    // Should move toward player position
    expect(enemy.x).toBeGreaterThan(50);
    expect(enemy.y).toBeGreaterThan(0);
  });

  test('should detect off-screen enemies', () => {
    enemy.init(50, 700, 30, 30, 2, 'normal', '#ff0000');
    expect(enemy.isOffScreen(600)).toBe(true);
    
    enemy.init(50, 300, 30, 30, 2, 'normal', '#ff0000');
    expect(enemy.isOffScreen(600)).toBe(false);
  });

  test('should take damage correctly', () => {
    enemy.init(50, 0, 30, 30, 2, 'normal', '#ff0000');
    
    const destroyed = enemy.takeDamage(1);
    expect(destroyed).toBe(true);
    expect(enemy.health).toBe(0);
  });

  test('should handle boss damage correctly', () => {
    enemy.init(50, 0, 100, 80, 1, 'boss', '#ff00ff', 'boss');
    
    let destroyed = enemy.takeDamage(50);
    expect(destroyed).toBe(false);
    expect(enemy.health).toBe(50);
    
    destroyed = enemy.takeDamage(50);
    expect(destroyed).toBe(true);
    expect(enemy.health).toBe(0);
  });
});

describe('PoolManager', () => {
  test('should initialize with default pools', () => {
    const stats = poolManager.getStats();
    
    expect(stats.bullets).toBeDefined();
    expect(stats.particles).toBeDefined();
    expect(stats.enemies).toBeDefined();
    
    expect(stats.bullets.poolSize).toBe(50);
    expect(stats.particles.poolSize).toBe(100);
    expect(stats.enemies.poolSize).toBe(20);
  });

  test('should acquire and release objects', () => {
    const bullet = poolManager.acquireObject('bullets');
    expect(bullet).toBeInstanceOf(PooledBullet);
    
    const initialStats = poolManager.getStats();
    expect(initialStats.bullets.activeCount).toBe(1);
    
    poolManager.releaseObject('bullets', bullet);
    
    const finalStats = poolManager.getStats();
    expect(finalStats.bullets.activeCount).toBe(0);
  });

  test('should handle invalid pool types', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    
    const result = poolManager.acquireObject('invalid');
    expect(result).toBeNull();
    expect(consoleSpy).toHaveBeenCalledWith("Pool type 'invalid' not found");
    
    poolManager.releaseObject('invalid', {});
    expect(consoleSpy).toHaveBeenCalledWith("Pool type 'invalid' not found");
    
    consoleSpy.mockRestore();
  });

  test('should release all objects from all pools', () => {
    const bullet = poolManager.acquireObject('bullets');
    const particle = poolManager.acquireObject('particles');
    const enemy = poolManager.acquireObject('enemies');
    
    poolManager.releaseAll();
    
    const stats = poolManager.getStats();
    expect(stats.bullets.activeCount).toBe(0);
    expect(stats.particles.activeCount).toBe(0);
    expect(stats.enemies.activeCount).toBe(0);
  });
});
