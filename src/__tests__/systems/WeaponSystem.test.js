/**
 * WeaponSystem.test.js - Tests for weapon system
 */
import { WeaponSystem, weaponSystem } from '../../components/Systems/WeaponSystem.js';
import { poolManager } from '../../components/Utils/ObjectPool.js';

// Mock the pool manager
const mockBullet = {
  init: jest.fn().mockReturnThis()
};

jest.mock('../../components/Utils/ObjectPool.js', () => ({
  poolManager: {
    acquireObject: jest.fn(() => mockBullet)
  }
}));

// Mock Date.now for consistent testing
const mockNow = 1000000;
jest.spyOn(Date, 'now').mockReturnValue(mockNow);

describe('WeaponSystem', () => {
  let system;
  
  beforeEach(() => {
    system = new WeaponSystem();
    system.lastShotTime = 0; // Reset to allow firing
    jest.clearAllMocks();
    mockBullet.init.mockClear();
  });

  test('should initialize with default weapon', () => {
    expect(system.currentWeapon).toBe('laser');
    const weapon = system.getCurrentWeapon();
    expect(weapon.name).toBe('Laser');
    expect(weapon.color).toBe('#ffff00');
  });

  test('should set weapon type', () => {
    system.setWeapon('plasma');
    expect(system.currentWeapon).toBe('plasma');
    
    const weapon = system.getCurrentWeapon();
    expect(weapon.name).toBe('Plasma');
    expect(weapon.color).toBe('#00ffff');
  });

  test('should warn about invalid weapon type', () => {
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
    
    system.setWeapon('invalid');
    expect(system.currentWeapon).toBe('laser'); // Should remain unchanged
    expect(consoleSpy).toHaveBeenCalledWith("Weapon type 'invalid' not found");
    
    consoleSpy.mockRestore();
  });

  test('should check fire rate correctly', () => {
    system.setWeapon('laser');
    
    // Should be able to fire initially
    expect(system.canFire()).toBe(true);
    
    // Simulate firing - set to current time
    system.lastShotTime = mockNow;
    expect(system.canFire()).toBe(false);
    
    // Should be able to fire after enough time (laser has 150ms fire rate)
    system.lastShotTime = mockNow - 200; // 200ms ago
    expect(system.canFire()).toBe(true);
  });

  test('should respect rapid fire power-up', () => {
    system.setWeapon('laser');
    system.lastShotTime = mockNow - 100; // 100ms ago
    
    // Without rapid fire, should not be able to fire (150ms fire rate)
    expect(system.canFire()).toBe(false);
    
    // With rapid fire, should be able to fire (75ms fire rate)
    expect(system.canFire({ rapidFire: 1 })).toBe(true);
  });

  test('should enforce mobile minimum fire rate', () => {
    system.setWeapon('ion'); // Has 100ms fire rate
    system.lastShotTime = mockNow - 110; // 110ms ago
    
    // Desktop should be able to fire
    expect(system.canFire({}, false)).toBe(true);
    
    // Mobile should not be able to fire (120ms minimum)
    system.lastShotTime = mockNow - 110;
    expect(system.canFire({}, true)).toBe(false);
    
    // Mobile should be able to fire after 120ms
    system.lastShotTime = mockNow - 130;
    expect(system.canFire({}, true)).toBe(true);
  });

  test('should create single bullet', () => {
    const playerPos = { x: 100, y: 200, width: 40, height: 40 };
    const bullets = system.createBullets(playerPos);
    
    expect(bullets).toHaveLength(1);
    expect(poolManager.acquireObject).toHaveBeenCalledWith('bullets');
  });

  test('should create multi-shot bullets', () => {
    const playerPos = { x: 100, y: 200, width: 40, height: 40 };
    const bullets = system.createBullets(playerPos, { multiShot: 1 });
    
    expect(bullets).toHaveLength(4);
    expect(poolManager.acquireObject).toHaveBeenCalledTimes(4);
  });

  test('should create spread bullets', () => {
    system.setWeapon('spread'); // Has spread: 3
    const playerPos = { x: 100, y: 200, width: 40, height: 40 };
    const bullets = system.createBullets(playerPos);
    
    expect(bullets).toHaveLength(3);
    expect(poolManager.acquireObject).toHaveBeenCalledTimes(3);
  });

  test('should not create bullets if cannot fire', () => {
    system.lastShotTime = Date.now(); // Just fired
    const playerPos = { x: 100, y: 200, width: 40, height: 40 };
    const bullets = system.createBullets(playerPos);
    
    expect(bullets).toHaveLength(0);
    expect(poolManager.acquireObject).not.toHaveBeenCalled();
  });

  test('should create option bullets with reduced fire rate', () => {
    const optionPos = { x: 50, y: 150, width: 20, height: 20 };
    const bullets = system.createOptionBullets(optionPos, 0);
    
    expect(bullets).toHaveLength(1);
    expect(poolManager.acquireObject).toHaveBeenCalledWith('bullets');
  });

  test('should create spread option bullets with limited count', () => {
    system.setWeapon('spread'); // Has spread: 3
    const optionPos = { x: 50, y: 150, width: 20, height: 20 };
    const bullets = system.createOptionBullets(optionPos, 0);
    
    expect(bullets).toHaveLength(3); // Limited to 3 for options
    expect(poolManager.acquireObject).toHaveBeenCalledTimes(3);
  });

  test('should not create option bullets if fire rate not met', () => {
    const optionPos = { x: 50, y: 150, width: 20, height: 20 };
    const bullets = system.createOptionBullets(optionPos, Date.now());
    
    expect(bullets).toHaveLength(0);
    expect(poolManager.acquireObject).not.toHaveBeenCalled();
  });

  test('should get weapon display info', () => {
    system.setWeapon('plasma');
    const info = system.getWeaponDisplayInfo();
    
    expect(info.name).toBe('Plasma');
    expect(info.type).toBe('plasma');
    expect(info.damage).toBe(12);
    expect(info.color).toBe('#00ffff');
  });

  test('should check if weapon exists', () => {
    expect(system.hasWeapon('laser')).toBe(true);
    expect(system.hasWeapon('plasma')).toBe(true);
    expect(system.hasWeapon('invalid')).toBe(false);
  });

  test('should get weapon by emoji', () => {
    expect(system.getWeaponByEmoji('🔫')).toBe('laser');
    expect(system.getWeaponByEmoji('⚡')).toBe('plasma');
    expect(system.getWeaponByEmoji('💥')).toBe('missile');
    expect(system.getWeaponByEmoji('🔮')).toBe('beam');
    expect(system.getWeaponByEmoji('🎯')).toBe('spread');
    expect(system.getWeaponByEmoji('🎪')).toBe('homing');
    expect(system.getWeaponByEmoji('❓')).toBeNull();
  });

  test('should reset weapon system', () => {
    system.setWeapon('plasma');
    system.lastShotTime = Date.now();
    
    system.reset();
    
    expect(system.currentWeapon).toBe('laser');
    expect(system.lastShotTime).toBe(0);
  });

  test('should get system status', () => {
    system.setWeapon('missile');
    system.lastShotTime = 12345;
    
    const status = system.getStatus();
    
    expect(status.currentWeapon).toBe('missile');
    expect(status.weaponConfig.name).toBe('Missile');
    expect(status.lastShotTime).toBe(12345);
    expect(status.availableWeapons).toBeGreaterThan(50);
  });

  test('should get all weapons', () => {
    const weapons = system.getAllWeapons();
    
    expect(weapons).toHaveProperty('laser');
    expect(weapons).toHaveProperty('plasma');
    expect(weapons).toHaveProperty('missile');
    expect(weapons).toHaveProperty('ultimate');
    expect(Object.keys(weapons)).toHaveLength(55); // All weapon types
  });
});

describe('weaponSystem singleton', () => {
  test('should be properly initialized', () => {
    expect(weaponSystem).toBeInstanceOf(WeaponSystem);
    expect(weaponSystem.currentWeapon).toBe('laser');
  });

  test('should maintain state across calls', () => {
    weaponSystem.setWeapon('plasma');
    expect(weaponSystem.currentWeapon).toBe('plasma');
    
    const weapon = weaponSystem.getCurrentWeapon();
    expect(weapon.name).toBe('Plasma');
  });
});
