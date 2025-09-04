/**
 * GameTypes.ts - TypeScript type definitions for the game
 */

// Basic geometric types
export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface Rectangle extends Position, Size {}

export interface Velocity {
  vx: number;
  vy: number;
}

// Game object types
export interface GameObject extends Rectangle {
  active?: boolean;
}

export interface MovableObject extends GameObject, Velocity {
  speed: number;
}

// Player types
export interface Player extends GameObject {
  speed: number;
  health: number;
  maxHealth: number;
  lives: number;
  maxLives: number;
}

export interface PlayerPowerUps {
  multiShot: number;
  rapidFire: number;
  shield: number;
  speed: number;
}

// Weapon types
export interface WeaponConfig {
  name: string;
  color: string;
  damage: number;
  speed: number;
  size: [number, number]; // [width, height]
  fireRate: number;
  spread: number;
}

export type WeaponType = 
  | 'laser' | 'plasma' | 'photon' | 'ion' | 'pulse' | 'beam' | 'disruptor' | 'phaser' | 'neutron' | 'quantum'
  | 'missile' | 'rocket' | 'torpedo' | 'grenade' | 'bomb' | 'mine' | 'flak' | 'shell' | 'cannon' | 'mortar'
  | 'spread' | 'shotgun' | 'scatter' | 'burst' | 'spray' | 'fan' | 'arc' | 'wave' | 'cone' | 'radial'
  | 'homing' | 'seeking' | 'tracking' | 'guided' | 'smart' | 'chain' | 'lightning' | 'electric' | 'magnetic' | 'gravity'
  | 'antimatter' | 'dark' | 'void' | 'cosmic' | 'stellar' | 'nova' | 'singularity' | 'warp' | 'temporal' | 'dimensional'
  | 'rainbow' | 'prism' | 'crystal' | 'diamond' | 'ultimate';

export interface Bullet extends MovableObject {
  color: string;
  weapon: WeaponType;
  damage: number;
  type?: string;
}

// Enemy types
export type EnemyType = 'normal' | 'fast' | 'strong' | 'zigzag' | 'kamikaze' | 'shooter' | 'boss';

export type EnemyBehavior = 'normal' | 'zigzag' | 'kamikaze' | 'shooter' | 'boss';

export interface Enemy extends MovableObject {
  type: EnemyType;
  color: string;
  behavior?: EnemyBehavior;
  lastShot: number;
  health: number;
  maxHealth: number;
  zigzagOffset?: number;
  originalX?: number;
}

// Particle types
export interface Particle extends Position, Velocity {
  life: number;
  maxLife: number;
  color: string;
  active?: boolean;
}

// Power-up types
export type PowerUpType = 'multiShot' | 'rapidFire' | 'shield' | 'speed' | 'weapon' | 'life';

export interface PowerUp extends GameObject {
  type: PowerUpType;
  speed: number;
  life: number;
}

export interface PowerUpCapsule extends GameObject {
  type: 'speed' | 'missile' | 'double' | 'laser' | 'option' | 'shield';
  speed: number;
  life: number;
  collected?: boolean;
}

// Collectible types
export interface EmojiCollectible extends GameObject {
  emoji: string;
  points: number;
  speed: number;
  life: number;
  isWeapon?: boolean;
  weaponType?: WeaponType;
}

// Option (drone) types
export interface Option extends GameObject {
  offset: number;
  lastShot: number;
}

// Special event types
export interface SpecialEvent {
  type: 'doubleScore' | 'rapidFire' | 'shieldBoost' | 'speedBoost';
  duration: number;
  startTime: number;
}

// Game state types
export type GameState = 'menu' | 'playing' | 'paused' | 'gameOver';

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface DifficultySettings {
  enemySpeedMultiplier: number;
  enemySpawnRate: number;
  powerUpSpawnRate: number;
  emojiSpawnRate: number;
  enemyShootRate: number;
  playerSpeed: number;
}

// Achievement types
export interface Achievement {
  id: string;
  title: string;
  description: string;
  date: string;
}

// High score types
export interface HighScore {
  name: string;
  score: number;
  date: string;
  difficulty: Difficulty;
}

// Daily challenge types
export interface DailyChallenge {
  id: string;
  name: string;
  description: string;
  target: number;
  type: 'kills' | 'time' | 'combo' | 'score';
  progress?: number;
  completed?: boolean;
}

// Touch control types
export interface TouchControls {
  touchStartX: number;
  touchStartY: number;
  touchCurrentX: number;
  touchCurrentY: number;
  isTouching: boolean;
  multiTouch: boolean;
  touchSensitivity: number;
}

// Game data types
export interface GameData {
  player: Player;
  bullets: Bullet[];
  enemies: Enemy[];
  enemyBullets: Bullet[];
  particles: Particle[];
  powerUps: PowerUp[];
  emojiCollectibles: EmojiCollectible[];
  keys: Record<string, boolean>;
  lastTime: number;
  enemySpawnTimer: number;
  powerUpSpawnTimer: number;
  emojiSpawnTimer: number;
  gameSpeed: number;
  lastShot: number;
  screenShakeX: number;
  screenShakeY: number;
  score: number;
  fps: number;
  frameCount: number;
  lastFpsUpdate: number;
  combo: number;
  comboMultiplier: number;
  lastKillTime: number;
  killStreak: number;
  specialEvents: SpecialEvent[];
  specialEventTimer: number;
  scoreMultiplier: number;
  rapidFireBoost: boolean;
  shieldBoost: boolean;
  speedBoost: boolean;
  powerUpLevel: number;
  options: Option[];
  shieldActive: boolean;
  shieldEnergy: number;
  powerUpCapsules: PowerUpCapsule[];
  powerUpCapsuleTimer: number;
  playerLevel: number;
  playerXP: number;
  totalKills: number;
  sessionKills: number;
  perfectWaves: number;
  survivalTime: number;
  bossActive: boolean;
  bossHealth: number;
  bossMaxHealth: number;
  bossPhase: number;
  bossLastShot: number;
  bossLastMove: number;
  bossDirection: number;
  weaponSpawnTimer: number;
  respawnInvincible: number;
}

// Audio types
export interface AudioLayer {
  oscillator: OscillatorNode;
  gainNode: GainNode;
}

export interface AudioConfig {
  frequency: number;
  type: OscillatorType;
  volume: number;
  detune?: number;
}

// Canvas types
export interface CanvasContext {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
}

// Collision types
export interface CollisionResult {
  bulletsToRemove: number[];
  enemiesToRemove: number[];
  hits: CollisionHit[];
}

export interface CollisionHit {
  bullet?: Bullet;
  enemy?: Enemy;
  player?: Player;
  damage: number;
  position: Position;
}

export interface CollectionResult {
  collectiblesToRemove: number[];
  collections: Collection[];
}

export interface Collection {
  player: Player;
  collectible: PowerUp | EmojiCollectible | PowerUpCapsule;
  type: string;
  value: number;
  position: Position;
}

// Object pool types
export interface PoolStats {
  poolSize: number;
  activeCount: number;
  totalCreated: number;
}

export interface ObjectPoolConfig<T> {
  createFn: () => T;
  resetFn?: (obj: T) => void;
  initialSize?: number;
}

// System status types
export interface SystemStatus {
  isInitialized: boolean;
  isActive: boolean;
  [key: string]: any;
}

// Accessibility types
export interface AccessibilityConfig {
  screenReader: boolean;
  highContrast: boolean;
  reducedMotion: boolean;
  colorBlindSupport: boolean;
  keyboardNavigation: boolean;
}

// Error types
export interface GameError extends Error {
  code?: string;
  context?: Record<string, any>;
}

// Event types
export interface GameEvent {
  type: string;
  data?: any;
  timestamp: number;
}

// Performance types
export interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  memoryUsage?: number;
  objectCounts: {
    bullets: number;
    enemies: number;
    particles: number;
  };
}

// Hook return types
export interface GameStateHookReturn {
  // State
  gameState: GameState;
  difficulty: Difficulty;
  currentWeapon: WeaponType;
  showSettings: boolean;
  showHighScores: boolean;
  showAchievement: Achievement | null;
  highScores: HighScore[];
  achievements: Achievement[];
  playerLevel: number;
  playerXP: number;
  totalKills: number;
  maxCombo: number;
  maxKillStreak: number;
  playerPowerUps: PlayerPowerUps;
  dailyChallenge: DailyChallenge | null;
  challengeProgress: number;
  touchControls: TouchControls;
  gameRef: React.MutableRefObject<GameData>;

  // Actions
  setGameState: (state: GameState) => void;
  setDifficulty: (difficulty: Difficulty) => void;
  setCurrentWeapon: (weapon: WeaponType) => void;
  setShowSettings: (show: boolean) => void;
  setShowHighScores: (show: boolean) => void;
  setShowAchievement: (achievement: Achievement | null) => void;
  setHighScores: (scores: HighScore[]) => void;
  setAchievements: (achievements: Achievement[]) => void;
  setPlayerLevel: (level: number) => void;
  setPlayerXP: (xp: number) => void;
  setTotalKills: (kills: number) => void;
  setMaxCombo: (combo: number) => void;
  setMaxKillStreak: (streak: number) => void;
  setPlayerPowerUps: (powerUps: PlayerPowerUps) => void;
  setDailyChallenge: (challenge: DailyChallenge | null) => void;
  setChallengeProgress: (progress: number) => void;
  setTouchControls: (controls: TouchControls) => void;

  // Methods
  getDifficultySettings: () => DifficultySettings;
  saveHighScore: () => void;
  checkAchievement: (id: string, title: string, description: string) => void;
  startGame: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  endGame: () => void;
  loadSavedData: () => void;
  saveProgress: () => void;
}

export interface GameLoopHookReturn {
  isRunning: boolean;
  startLoop: () => void;
  stopLoop: () => void;
}

// Component prop types
export interface GameCanvasProps {
  gameState: GameState;
  gameData: GameData;
  onCanvasReady?: (canvas: HTMLCanvasElement) => void;
}

export interface GameUIProps {
  gameState: GameState;
  gameData: GameData;
  playerPowerUps: PlayerPowerUps;
  currentWeapon: WeaponType;
  playerLevel: number;
  playerXP: number;
  dailyChallenge: DailyChallenge | null;
  challengeProgress: number;
  showAchievement: Achievement | null;
}

export interface GameMenuProps {
  difficulty: Difficulty;
  onDifficultyChange: (difficulty: Difficulty) => void;
  onStartGame: () => void;
  onShowSettings: () => void;
  onShowHighScores: () => void;
}

// Utility types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequiredKeys<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type OptionalKeys<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// Function types
export type GameLoopCallback = (currentTime: number, deltaTime: number) => void;

export type CollisionCallback = (hit: CollisionHit) => void;

export type CollectionCallback = (collection: Collection) => void;

export type EventHandler<T = any> = (event: GameEvent & { data: T }) => void;

export type SystemInitializer = () => Promise<void> | void;

export type SystemCleaner = () => Promise<void> | void;
