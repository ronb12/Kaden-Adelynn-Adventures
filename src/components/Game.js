import React, { useState, useEffect, useRef } from 'react';
import '../Game.css';
import { WeaponSystem } from './Systems/WeaponSystem.js';
import StoryModal from './Story/StoryModal.js';
import StoryNotification from './Story/StoryNotification.js';
import { storyEventSystem } from './Story/StoryEventSystem.js';

// Audio context for sound effects and music
let audioContext = null;
let backgroundMusicOscillator = null;
// let backgroundMusicGain = null; // Removed unused variable
let isMusicPlaying = false;

// Initialize audio context
const initAudio = () => {
  try {
    if (!audioContext) {
      // Check if AudioContext is available
      if (!window.AudioContext && !window.webkitAudioContext) {
        console.warn('AudioContext not supported');
        return null;
      }
      
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      // Handle audio context state
      if (audioContext.state === 'suspended') {
        audioContext.resume().catch(err => {
          console.warn('Failed to resume audio context:', err);
        });
      }
    }
    return audioContext;
  } catch (error) {
    console.warn('Audio initialization failed:', error);
    return null;
  }
};

// Background music system
const startBackgroundMusic = () => {
  try {
    const ctx = initAudio();
    if (!ctx || isMusicPlaying) return;
    
    // Create a more complex background music with multiple oscillators
    const createMusicLayer = (frequency, type, volume, detune = 0) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
      oscillator.type = type;
      oscillator.detune.setValueAtTime(detune, ctx.currentTime);
      
      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + 1);
      
      return { oscillator, gainNode };
    };
    
    // Create layered background music
    const layers = [
      createMusicLayer(220, 'sine', 0.02, 0), // Bass
      createMusicLayer(330, 'triangle', 0.015, 5), // Mid
      createMusicLayer(440, 'sine', 0.01, -5), // High
    ];
    
    // Start all layers
    layers.forEach(layer => {
      layer.oscillator.start(ctx.currentTime);
    });
    
    // Create a simple melody pattern
    const playMelody = () => {
      if (!isMusicPlaying) return;
      
      const melody = [440, 494, 523, 587, 659, 698, 784, 880];
      let noteIndex = 0;
      
      const playNote = () => {
        if (!isMusicPlaying) return;
        
        const note = melody[noteIndex % melody.length];
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        oscillator.frequency.setValueAtTime(note, ctx.currentTime);
        oscillator.type = 'triangle';
        
        gainNode.gain.setValueAtTime(0, ctx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.03, ctx.currentTime + 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
        
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.5);
        
        noteIndex++;
        setTimeout(playNote, 600);
      };
      
      playNote();
    };
    
    // Start melody after a delay
    setTimeout(playMelody, 2000);
    
    isMusicPlaying = true;
    
    // Store references for cleanup
    backgroundMusicOscillator = layers;
    
  } catch (error) {
    console.warn('Background music failed:', error);
  }
};

const stopBackgroundMusic = () => {
  try {
    if (backgroundMusicOscillator) {
      backgroundMusicOscillator.forEach(layer => {
        layer.oscillator.stop();
      });
      backgroundMusicOscillator = null;
    }
    isMusicPlaying = false;
  } catch (error) {
    console.warn('Failed to stop background music:', error);
  }
};

// Sound effect functions
const playSound = (frequency, duration, type = 'sine', volume = 0.1) => {
  try {
    const ctx = initAudio();
    if (!ctx) return; // Exit if audio context failed to initialize
    
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
    oscillator.type = type;
    
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  } catch (error) {
    console.warn('Sound playback failed:', error);
  }
};

const playShootSound = () => playSound(800, 0.1, 'square', 0.05);
const playExplosionSound = () => playSound(150, 0.3, 'sawtooth', 0.1);
const playPowerUpSound = () => playSound(600, 0.2, 'sine', 0.08);
const playGameOverSound = () => playSound(200, 0.5, 'triangle', 0.15);

const Game = () => {
  const canvasRef = useRef(null);
  const weaponSystemRef = useRef(new WeaponSystem());
  const [gameState, setGameState] = useState('menu'); // 'menu', 'playing', 'paused', 'gameOver'
  // Score is now tracked in gameRef.current.score
  const [highScores, setHighScores] = useState([]);
  const [showSettings, setShowSettings] = useState(false);
  const [showHighScores, setShowHighScores] = useState(false);
  const [difficulty, setDifficulty] = useState('medium'); // 'easy', 'medium', 'hard'
  // Screen shake disabled for better gameplay experience
  const [, setPowerUps] = useState([]);
  const [playerPowerUps, setPlayerPowerUps] = useState({
    multiShot: 0,
    rapidFire: 0,
    shield: 0,
    speed: 0
  });
  const [currentWeapon, setCurrentWeapon] = useState('laser');
  const [selectedCharacter, setSelectedCharacter] = useState(() => {
    return localStorage.getItem('kadenAdelynnCharacter') || 'kaden';
  }); // 'kaden' or 'adelynn'
  
  // Story system state
  const [showStoryModal, setShowStoryModal] = useState(false);
  const [currentStoryChapter, setCurrentStoryChapter] = useState('PROLOGUE');
  const [storyNotification, setStoryNotification] = useState(null);
  const [storyStats, setStoryStats] = useState({
    enemiesKilled: 0,
    weaponsCollected: 0,
    powerUpsCollected: 0,
    bossesDefeated: 0
  });
  
  // Comprehensive weapon system with 50+ weapons
  const weaponTypes = {
    // Basic Energy Weapons (1-10)
    laser: { name: 'Laser', color: '#ffff00', damage: 10, speed: 8, size: [4, 10], fireRate: 150, spread: 0 },
    plasma: { name: 'Plasma', color: '#00ffff', damage: 12, speed: 7, size: [6, 12], fireRate: 180, spread: 0 },
    photon: { name: 'Photon', color: '#ff00ff', damage: 15, speed: 10, size: [3, 12], fireRate: 120, spread: 0 },
    ion: { name: 'Ion Beam', color: '#8800ff', damage: 8, speed: 12, size: [2, 15], fireRate: 100, spread: 0 },
    pulse: { name: 'Pulse', color: '#ff8800', damage: 14, speed: 6, size: [8, 8], fireRate: 200, spread: 0 },
    beam: { name: 'Energy Beam', color: '#ff00ff', damage: 20, speed: 10, size: [16, 20], fireRate: 300, spread: 0 },
    disruptor: { name: 'Disruptor', color: '#ff4400', damage: 18, speed: 9, size: [5, 14], fireRate: 160, spread: 0 },
    phaser: { name: 'Phaser', color: '#00ff88', damage: 16, speed: 11, size: [4, 16], fireRate: 140, spread: 0 },
    neutron: { name: 'Neutron', color: '#4488ff', damage: 22, speed: 7, size: [6, 18], fireRate: 250, spread: 0 },
    quantum: { name: 'Quantum', color: '#ff88ff', damage: 25, speed: 8, size: [7, 20], fireRate: 280, spread: 0 },
    
    // Projectile Weapons (11-20)
    missile: { name: 'Missile', color: '#ff4400', damage: 30, speed: 5, size: [8, 15], fireRate: 400, spread: 0 },
    rocket: { name: 'Rocket', color: '#ff6600', damage: 35, speed: 4, size: [10, 18], fireRate: 450, spread: 0 },
    torpedo: { name: 'Torpedo', color: '#ff2200', damage: 40, speed: 3, size: [12, 20], fireRate: 500, spread: 0 },
    grenade: { name: 'Grenade', color: '#88ff00', damage: 28, speed: 6, size: [6, 12], fireRate: 350, spread: 0 },
    bomb: { name: 'Bomb', color: '#ff0088', damage: 50, speed: 2, size: [15, 25], fireRate: 600, spread: 0 },
    mine: { name: 'Mine', color: '#ffaa00', damage: 45, speed: 1, size: [20, 20], fireRate: 800, spread: 0 },
    flak: { name: 'Flak', color: '#ff8844', damage: 20, speed: 7, size: [8, 12], fireRate: 200, spread: 15 },
    shell: { name: 'Shell', color: '#ffcc00', damage: 32, speed: 6, size: [9, 16], fireRate: 380, spread: 0 },
    cannon: { name: 'Cannon', color: '#ff6644', damage: 38, speed: 5, size: [12, 22], fireRate: 420, spread: 0 },
    mortar: { name: 'Mortar', color: '#aa4400', damage: 42, speed: 4, size: [14, 18], fireRate: 480, spread: 0 },
    
    // Spread Weapons (21-30)
    spread: { name: 'Spread', color: '#ffff00', damage: 8, speed: 8, size: [4, 10], fireRate: 200, spread: 3 },
    shotgun: { name: 'Shotgun', color: '#ff4488', damage: 6, speed: 9, size: [3, 8], fireRate: 250, spread: 5 },
    scatter: { name: 'Scatter', color: '#88ff44', damage: 7, speed: 10, size: [2, 6], fireRate: 180, spread: 7 },
    burst: { name: 'Burst', color: '#4488ff', damage: 9, speed: 8, size: [4, 8], fireRate: 120, spread: 4 },
    spray: { name: 'Spray', color: '#ff8888', damage: 5, speed: 12, size: [2, 5], fireRate: 80, spread: 8 },
    fan: { name: 'Fan', color: '#88ffff', damage: 10, speed: 7, size: [3, 9], fireRate: 160, spread: 6 },
    arc: { name: 'Arc', color: '#ffaa88', damage: 12, speed: 6, size: [5, 12], fireRate: 220, spread: 4 },
    wave: { name: 'Wave', color: '#aa88ff', damage: 11, speed: 9, size: [4, 11], fireRate: 190, spread: 5 },
    cone: { name: 'Cone', color: '#ff88aa', damage: 8, speed: 11, size: [3, 7], fireRate: 140, spread: 9 },
    radial: { name: 'Radial', color: '#88aaff', damage: 6, speed: 8, size: [2, 6], fireRate: 100, spread: 12 },
    
    // Special Weapons (31-40)
    homing: { name: 'Homing', color: '#00ff00', damage: 18, speed: 4, size: [6, 12], fireRate: 300, spread: 0 },
    seeking: { name: 'Seeking', color: '#44ff44', damage: 20, speed: 3, size: [5, 14], fireRate: 350, spread: 0 },
    tracking: { name: 'Tracking', color: '#88ff88', damage: 22, speed: 5, size: [4, 16], fireRate: 280, spread: 0 },
    guided: { name: 'Guided', color: '#00ff88', damage: 24, speed: 6, size: [7, 18], fireRate: 320, spread: 0 },
    smart: { name: 'Smart', color: '#44ffaa', damage: 26, speed: 4, size: [6, 20], fireRate: 380, spread: 0 },
    chain: { name: 'Chain', color: '#ffff88', damage: 15, speed: 8, size: [3, 12], fireRate: 200, spread: 0 },
    lightning: { name: 'Lightning', color: '#8888ff', damage: 28, speed: 15, size: [2, 25], fireRate: 250, spread: 0 },
    electric: { name: 'Electric', color: '#aaaaff', damage: 24, speed: 12, size: [3, 20], fireRate: 220, spread: 0 },
    magnetic: { name: 'Magnetic', color: '#ff44ff', damage: 20, speed: 7, size: [5, 15], fireRate: 280, spread: 0 },
    gravity: { name: 'Gravity', color: '#8844ff', damage: 32, speed: 3, size: [8, 8], fireRate: 400, spread: 0 },
    
    // Exotic Weapons (41-50)
    antimatter: { name: 'Antimatter', color: '#ffffff', damage: 60, speed: 2, size: [10, 30], fireRate: 800, spread: 0 },
    dark: { name: 'Dark Energy', color: '#440044', damage: 45, speed: 6, size: [6, 25], fireRate: 500, spread: 0 },
    void: { name: 'Void', color: '#220022', damage: 55, speed: 4, size: [8, 28], fireRate: 600, spread: 0 },
    cosmic: { name: 'Cosmic', color: '#4444aa', damage: 50, speed: 5, size: [9, 24], fireRate: 550, spread: 0 },
    stellar: { name: 'Stellar', color: '#ffaa44', damage: 48, speed: 7, size: [7, 22], fireRate: 480, spread: 0 },
    nova: { name: 'Nova', color: '#ffcc88', damage: 65, speed: 3, size: [12, 35], fireRate: 900, spread: 0 },
    singularity: { name: 'Singularity', color: '#000088', damage: 80, speed: 1, size: [15, 40], fireRate: 1200, spread: 0 },
    warp: { name: 'Warp', color: '#8800aa', damage: 35, speed: 15, size: [4, 18], fireRate: 300, spread: 0 },
    temporal: { name: 'Temporal', color: '#aa0088', damage: 40, speed: 8, size: [6, 20], fireRate: 400, spread: 0 },
    dimensional: { name: 'Dimensional', color: '#0088aa', damage: 42, speed: 9, size: [5, 22], fireRate: 350, spread: 0 },
    
    // Bonus Weapons (51-55)
    rainbow: { name: 'Rainbow', color: '#ff0088', damage: 25, speed: 10, size: [5, 15], fireRate: 150, spread: 2 },
    prism: { name: 'Prism', color: '#88ff00', damage: 30, speed: 8, size: [6, 18], fireRate: 200, spread: 3 },
    crystal: { name: 'Crystal', color: '#00ff88', damage: 35, speed: 6, size: [8, 20], fireRate: 250, spread: 0 },
    diamond: { name: 'Diamond', color: '#ffffff', damage: 45, speed: 4, size: [10, 25], fireRate: 400, spread: 0 },
    ultimate: { name: 'Ultimate', color: '#ff00ff', damage: 100, speed: 12, size: [8, 30], fireRate: 100, spread: 1 }
  }; // 'laser', 'plasma', 'missile', 'beam', 'spread', 'homing'
  const [achievements, setAchievements] = useState([]);
  const [showAchievement, setShowAchievement] = useState(null);
  const [maxCombo, setMaxCombo] = useState(0);
  const [maxKillStreak, setMaxKillStreak] = useState(0);
  const [powerUpLevel, setPowerUpLevel] = useState(0);
  const [options, setOptions] = useState([]);
  const [shieldActive, setShieldActive] = useState(false);
  const [shieldEnergy, setShieldEnergy] = useState(0);
  const [playerLevel, setPlayerLevel] = useState(1);
  const [playerXP, setPlayerXP] = useState(0);
  const [totalKills, setTotalKills] = useState(0);
  const [dailyChallenge, setDailyChallenge] = useState(null);
  const [challengeProgress, setChallengeProgress] = useState(0);
  const [touchControls, setTouchControls] = useState({
    touchStartX: 0,
    touchStartY: 0,
    touchCurrentX: 0,
    touchCurrentY: 0,
    isTouching: false,
    multiTouch: false,
    touchSensitivity: 1.5
  });

  // Game variables
  const gameRef = useRef({
    player: { x: 0, y: 0, width: 40, height: 40, speed: 5, health: 100, maxHealth: 100, lives: 25, maxLives: 25 },
    bullets: [],
    enemies: [],
    enemyBullets: [],
    particles: [],
    powerUps: [],
    emojiCollectibles: [],
    keys: {},
    lastTime: 0,
    enemySpawnTimer: 0,
    powerUpSpawnTimer: 0,
    emojiSpawnTimer: 0,
    gameSpeed: 1.2, // Increased from 1 to 1.2 (20% faster)
    lastShot: 0,
    screenShakeX: 0,
    screenShakeY: 0,
    score: 0
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Set canvas size
    const resizeCanvas = () => {
      const container = canvas.parentElement;
      const maxWidth = Math.min(800, container.clientWidth - 40);
      const maxHeight = Math.min(700, window.innerHeight - 200);
      
      canvas.width = maxWidth;
      canvas.height = maxHeight;
      
      // Center player
      gameRef.current.player.x = canvas.width / 2 - gameRef.current.player.width / 2;
      gameRef.current.player.y = canvas.height - gameRef.current.player.height - 20;
    };
    
    // Load achievements on startup
    const savedAchievements = JSON.parse(localStorage.getItem('kadenAdelynnAchievements') || '[]');
    setAchievements(savedAchievements);

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Load high scores from localStorage
    const savedScores = localStorage.getItem('kadenAdelynnHighScores');
    if (savedScores) {
      setHighScores(JSON.parse(savedScores));
    }
    
    // Load saved difficulty preference
    const savedDifficulty = localStorage.getItem('kadenAdelynnDifficulty');
    if (savedDifficulty && ['easy', 'medium', 'hard'].includes(savedDifficulty)) {
      setDifficulty(savedDifficulty);
    }

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  const startGame = () => {
    setGameState('playing');
    // Score is reset in gameRef.current.score = 0 above
    // Screen shake disabled
    setPowerUps([]);
    setPlayerPowerUps({
      multiShot: 0,
      rapidFire: 0,
      shield: 0,
      speed: 0
    });
    
    // Daily challenge system
    const generateDailyChallenge = () => {
      const challenges = [
        { id: 'kills_50', name: 'Exterminator', description: 'Kill 50 enemies in one session', target: 50, type: 'kills' },
        { id: 'survive_300', name: 'Survivor', description: 'Survive for 5 minutes', target: 300, type: 'time' },
        { id: 'combo_15', name: 'Combo Master', description: 'Achieve a 15x combo', target: 15, type: 'combo' },
        { id: 'score_5000', name: 'High Scorer', description: 'Score 5000 points in one game', target: 5000, type: 'score' }
      ];
      
      const today = new Date().toDateString();
      const savedChallenge = localStorage.getItem('dailyChallenge');
      const savedDate = localStorage.getItem('challengeDate');
      
      if (savedDate === today && savedChallenge) {
        const challenge = JSON.parse(savedChallenge);
        setDailyChallenge(challenge);
        setChallengeProgress(challenge.progress || 0);
      } else {
        const randomChallenge = challenges[Math.floor(Math.random() * challenges.length)];
        randomChallenge.progress = 0;
        randomChallenge.completed = false;
        setDailyChallenge(randomChallenge);
        setChallengeProgress(0);
        localStorage.setItem('dailyChallenge', JSON.stringify(randomChallenge));
        localStorage.setItem('challengeDate', today);
      }
    };
    
    generateDailyChallenge();

    // Reset story system
    storyEventSystem.reset();
    setStoryStats({
      enemiesKilled: 0,
      weaponsCollected: 0,
      powerUpsCollected: 0,
      bossesDefeated: 0
    });

    // Start background music
    startBackgroundMusic();
    gameRef.current = {
      player: { x: 0, y: 0, width: 40, height: 40, speed: 5, health: 100, maxHealth: 100, lives: 25, maxLives: 25 },
      bullets: [],
      enemies: [],
      enemyBullets: [],
      particles: [],
      powerUps: [],
      emojiCollectibles: [],
      keys: {},
      lastTime: 0,
      enemySpawnTimer: 0,
      powerUpSpawnTimer: 0,
      emojiSpawnTimer: 0,
      gameSpeed: 1,
      lastShot: 0,
      screenShakeX: 0,
      screenShakeY: 0,
      score: 0,
      fps: 0,
      frameCount: 0,
      lastFpsUpdate: 0,
      combo: 0,
      comboMultiplier: 1,
      lastKillTime: 0,
      killStreak: 0,
      specialEvents: [],
      specialEventTimer: 0,
      scoreMultiplier: 1,
      rapidFireBoost: false,
      shieldBoost: false,
      speedBoost: false,
      powerUpLevel: 0,
      options: [],
      shieldActive: false,
      shieldEnergy: 0,
      powerUpCapsules: [],
      powerUpCapsuleTimer: 0,
      playerLevel: 1,
      playerXP: 0,
      totalKills: 0,
      sessionKills: 0,
      perfectWaves: 0,
      survivalTime: 0
    };
    
    const canvas = canvasRef.current;
    if (canvas) {
      gameRef.current.player.x = canvas.width / 2 - gameRef.current.player.width / 2;
      gameRef.current.player.y = canvas.height - gameRef.current.player.height - 20;
    }
  };

  const getDifficultySettings = React.useCallback(() => {
    switch (difficulty) {
      case 'easy':
        return {
          enemySpeedMultiplier: 0.8, // Increased from 0.6
          enemySpawnRate: 2200, // Faster spawn (2.2 seconds, was 2.5)
          powerUpSpawnRate: 10000, // More frequent power-ups (was 12000)
          emojiSpawnRate: 2200, // More frequent emojis (was 2500)
          enemyShootRate: 2800, // Slightly faster enemy shooting (was 3000)
          playerSpeed: 6 // Faster player
        };
      case 'hard':
        return {
          enemySpeedMultiplier: 1.8, // Increased from 1.4
          enemySpawnRate: 1000, // Faster spawn (1.0 seconds, was 1.2)
          powerUpSpawnRate: 12000, // Less frequent power-ups (was 15000)
          emojiSpawnRate: 3500, // Less frequent emojis (was 4000)
          enemyShootRate: 800, // Faster enemy shooting (was 1000)
          playerSpeed: 4 // Slower player
        };
      default: // medium
        return {
          enemySpeedMultiplier: 1.2, // Increased from 1.0
          enemySpawnRate: 1500, // Faster spawn (1.5 seconds, was 1.8)
          powerUpSpawnRate: 8000, // More frequent power-ups (was 10000)
          emojiSpawnRate: 2500, // More frequent emojis (was 3000)
          enemyShootRate: 1700, // Faster enemy shooting (was 2000)
          playerSpeed: 5 // Balanced player speed
        };
    }
  }, [difficulty]);

  const saveHighScore = React.useCallback(() => {
    const newScore = { name: 'Player', score: gameRef.current.score, date: new Date().toLocaleDateString(), difficulty: difficulty };
    const updatedScores = [...highScores, newScore]
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
    setHighScores(updatedScores);
    localStorage.setItem('kadenAdelynnHighScores', JSON.stringify(updatedScores));
  }, [highScores, difficulty]);

  const pauseGame = React.useCallback(() => {
    if (gameState === 'playing') {
      setGameState('paused');
      stopBackgroundMusic();
    }
  }, [gameState]);

  const resumeGame = React.useCallback(() => {
    if (gameState === 'paused') {
      setGameState('playing');
      startBackgroundMusic();
      // The gameLoop will be restarted by the useEffect when gameState changes to 'playing'
    }
  }, [gameState]);

  const checkAchievement = React.useCallback((id, title, description) => {
    if (!achievements.find(a => a.id === id)) {
      const newAchievement = { id, title, description, date: new Date().toLocaleDateString() };
      setAchievements(prev => [...prev, newAchievement]);
      setShowAchievement(newAchievement);
      
      // Save to localStorage
      const savedAchievements = JSON.parse(localStorage.getItem('kadenAdelynnAchievements') || '[]');
      savedAchievements.push(newAchievement);
      localStorage.setItem('kadenAdelynnAchievements', JSON.stringify(savedAchievements));
      
      // Hide achievement after 3 seconds
      setTimeout(() => setShowAchievement(null), 3000);
    }
  }, [achievements]);

  const gameLoop = React.useCallback((currentTime) => {
    if (gameState !== 'playing') return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const game = gameRef.current;
    
    // Frame rate limiting to 60fps
    const targetFrameTime = 1000 / 60; // 16.67ms per frame
    const deltaTime = currentTime - game.lastTime;
    
    if (deltaTime < targetFrameTime) {
      requestAnimationFrame(gameLoop);
      return;
    }
    
    game.lastTime = currentTime;
    
    // Cap deltaTime to prevent large jumps
    const cappedDeltaTime = Math.min(deltaTime, targetFrameTime);

    // Screen shake disabled - no shaking effects
    game.screenShakeX = 0;
    game.screenShakeY = 0;

    // Apply screen shake to canvas
    ctx.save();
    ctx.translate(game.screenShakeX, game.screenShakeY);

    // Clear canvas
    ctx.fillStyle = '#000011';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw optimized animated stars background
    const time = currentTime * 0.001;
    
    // Simplified starfield for better performance
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = '#ffffff';
    ctx.shadowBlur = 2;
    
    for (let i = 0; i < 30; i++) {
      const x = (i * 47) % canvas.width;
      const y = (i * 31 + currentTime * 0.01) % canvas.height;
      
      // Simple twinkling effect
      const twinkle = Math.sin(time * 2 + i) * 0.3 + 0.7;
      ctx.globalAlpha = twinkle;
      
      ctx.fillRect(x, y, 1, 1);
    }
    
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;

    // Handle input (keyboard + touch)
    const difficultySettings = getDifficultySettings();
    const basePlayerSpeed = difficultySettings.playerSpeed + (playerPowerUps.speed * 2);
    const playerSpeed = basePlayerSpeed * (cappedDeltaTime / 16.67); // Frame-rate independent movement
    
    // Pause/Resume with P key
    if (game.keys['p'] || game.keys['P']) {
      if (gameState === 'playing') {
        pauseGame();
      } else if (gameState === 'paused') {
        resumeGame();
      }
      // Clear the key to prevent rapid toggling
      game.keys['p'] = false;
      game.keys['P'] = false;
    }

    // Weapon switching
    if (game.keys['1']) setCurrentWeapon('laser');
    if (game.keys['2']) setCurrentWeapon('plasma');
    if (game.keys['3']) setCurrentWeapon('missile');
    if (game.keys['4']) setCurrentWeapon('beam');
    if (game.keys['5']) setCurrentWeapon('spread');
    if (game.keys['6']) setCurrentWeapon('homing');
    
    // Enhanced mobile touch controls - direct position tracking
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                     ('ontouchstart' in window) || 
                     (navigator.maxTouchPoints > 0);
    
    // Debug logging for mobile touch
    if (isMobile) {
      console.log('Mobile device detected, touch state:', {
        isTouching: touchControls.isTouching,
        touchX: touchControls.touchCurrentX,
        touchY: touchControls.touchCurrentY,
        playerX: game.player.x,
        playerY: game.player.y,
        gameState: gameState
      });
    }
    
    if (touchControls.isTouching && isMobile) {
      console.log('Processing touch movement...');
      // Direct touch position control for mobile
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      
      // Convert touch position to canvas coordinates
      const targetX = touchControls.touchCurrentX * scaleX - game.player.width / 2;
      const targetY = touchControls.touchCurrentY * scaleY - game.player.height / 2;
      
      console.log('Touch coordinates:', {
        touchX: touchControls.touchCurrentX,
        touchY: touchControls.touchCurrentY,
        targetX: targetX,
        targetY: targetY,
        playerX: game.player.x,
        playerY: game.player.y
      });
      
      // Direct position setting for more responsive control
      game.player.x = Math.max(0, Math.min(canvas.width - game.player.width, targetX));
      game.player.y = Math.max(0, Math.min(canvas.height - game.player.height - 20, targetY));
      
      console.log('New player position:', game.player.x, game.player.y);
    } else {
      // Desktop keyboard controls
      if (game.keys['ArrowLeft'] || game.keys['a'] || game.keys['A']) {
      game.player.x = Math.max(0, game.player.x - playerSpeed);
    }
      if (game.keys['ArrowRight'] || game.keys['d'] || game.keys['D']) {
      game.player.x = Math.min(canvas.width - game.player.width, game.player.x + playerSpeed);
    }
      if (game.keys['ArrowUp'] || game.keys['w'] || game.keys['W']) {
      game.player.y = Math.max(0, game.player.y - playerSpeed);
    }
      if (game.keys['ArrowDown'] || game.keys['s'] || game.keys['S']) {
        game.player.y = Math.min(canvas.height - game.player.height - 20, game.player.y + playerSpeed);
      }
    }

    // Enhanced shooting system for all weapons
    const shouldShoot = (game.keys[' '] || game.keys['Spacebar'] || (isMobile && gameState === 'playing'));
    
    if (shouldShoot) {
      const now = Date.now();
      const weapon = weaponTypes[currentWeapon] || weaponTypes.laser;
      const fireRate = playerPowerUps.rapidFire > 0 ? weapon.fireRate * 0.5 : weapon.fireRate;
      const adjustedFireRate = isMobile ? Math.max(fireRate, 120) : fireRate;
      
      if (!game.lastShot || now - game.lastShot > adjustedFireRate) {
        playShootSound();
        
        // Create bullets with weapon-specific properties
        const createBullet = (x, y, offsetX = 0, offsetY = 0) => ({
          x: x + offsetX,
          y: y + offsetY,
          width: weapon.size[0],
          height: weapon.size[1],
          speed: weapon.speed,
          color: weapon.color,
          damage: weapon.damage,
          weapon: currentWeapon,
          type: weapon.spread > 0 ? 'spread' : 'normal'
        });

        // Universal weapon system - works for all 50+ weapons
        const centerX = game.player.x + game.player.width / 2;
        const centerY = game.player.y;
        
        if (playerPowerUps.multiShot > 0) {
          // Multi-shot: 4 bullets side by side for any weapon
          const spacing = Math.max(weapon.size[0] + 2, 8);
          game.bullets.push(
            createBullet(centerX - spacing * 1.5, centerY),
            createBullet(centerX - spacing * 0.5, centerY),
            createBullet(centerX + spacing * 0.5, centerY),
            createBullet(centerX + spacing * 1.5, centerY)
          );
        } else if (weapon.spread > 0) {
          // Spread weapons fire multiple bullets in different directions
          const spreadCount = weapon.spread;
          const angleStep = Math.PI / 12; // 15 degrees between bullets
          const startAngle = -(spreadCount - 1) * angleStep / 2;
          
          for (let i = 0; i < spreadCount; i++) {
            const angle = startAngle + i * angleStep;
            const bullet = createBullet(centerX, centerY);
            bullet.vx = Math.sin(angle) * weapon.speed * 0.3;
            bullet.vy = -Math.cos(angle) * weapon.speed;
            game.bullets.push(bullet);
          }
        } else {
          // Single shot for most weapons
          game.bullets.push(createBullet(centerX - weapon.size[0] / 2, centerY));
        }
        game.lastShot = now;
      }
    }

    // Update Options (drones) position
    game.options.forEach((option, index) => {
      let targetX, targetY;
      
      if (game.options.length === 1) {
        // Single option: position to the left
        targetX = game.player.x - 60;
        targetY = game.player.y;
      } else if (game.options.length === 2) {
        // Two options: one on each side
        if (index === 0) {
          targetX = game.player.x - 60; // Left side
          targetY = game.player.y;
        } else {
          targetX = game.player.x + game.player.width + 40; // Right side
          targetY = game.player.y;
        }
      }
      
      // Smooth movement towards target
      option.x += (targetX - option.x) * 0.1;
      option.y += (targetY - option.y) * 0.1;
      
      // Keep options on screen
      option.x = Math.max(0, Math.min(canvas.width - option.width, option.x));
      option.y = Math.max(0, Math.min(canvas.height - option.height, option.y));
    });
    

    // Options (drones) shooting with same weapon as player
    game.options.forEach((option) => {
      const now = Date.now();
      const weapon = weaponTypes[currentWeapon] || weaponTypes.laser;
      const optionFireRate = Math.max(weapon.fireRate * 0.8, 200); // Slightly slower than player
      
      if (now - (option.lastShot || 0) > optionFireRate) {
        option.lastShot = now;
        
        // Create bullet from option with same weapon properties
        const bullet = {
          x: option.x + option.width / 2 - weapon.size[0] / 2,
          y: option.y,
          width: weapon.size[0],
          height: weapon.size[1],
          speed: weapon.speed,
          color: weapon.color,
          damage: weapon.damage * 0.8, // Slightly less damage than player
          weapon: currentWeapon,
          type: 'option'
        };
        
        // Handle spread weapons for options too
        if (weapon.spread > 0) {
          const spreadCount = Math.min(weapon.spread, 3); // Limit options spread
          const angleStep = Math.PI / 16;
          const startAngle = -(spreadCount - 1) * angleStep / 2;
          
          for (let i = 0; i < spreadCount; i++) {
            const angle = startAngle + i * angleStep;
            const spreadBullet = { ...bullet };
            spreadBullet.vx = Math.sin(angle) * weapon.speed * 0.2;
            spreadBullet.vy = -Math.cos(angle) * weapon.speed;
            game.bullets.push(spreadBullet);
          }
        } else {
          game.bullets.push(bullet);
        }
      }
    });

    // Update bullets with enhanced movement for spread weapons
    game.bullets = game.bullets.filter(bullet => {
      // Handle spread weapons with directional velocity
      if (bullet.vx !== undefined && bullet.vy !== undefined) {
        bullet.x += bullet.vx;
        bullet.y += bullet.vy;
      } else {
        bullet.y -= bullet.speed;
      }
      
      // Remove bullets that go off screen
      return bullet.y > -bullet.height && 
             bullet.x > -bullet.width && 
             bullet.x < canvas.width + bullet.width;
    });

    // Boss spawning logic
    if (game.score > 0 && game.score % 1000 === 0 && game.enemies.length === 0 && !game.bossActive) {
      // Spawn boss every 1000 points
      game.bossActive = true;
      game.bossHealth = 100;
      game.bossMaxHealth = 100;
      game.bossPhase = 1;
      game.bossLastShot = 0;
      game.bossLastMove = 0;
      game.bossDirection = 1;
      
      game.enemies.push({
        x: canvas.width / 2 - 50,
        y: -100,
        width: 100,
        height: 80,
        speed: 1,
        type: 'boss',
        color: '#ff00ff',
        lastShot: 0,
        behavior: 'boss',
        health: 100,
        maxHealth: 100,
        phase: 1
      });
    }

    // Spawn enemies with different types (with limit)
    game.enemySpawnTimer += cappedDeltaTime;
    const maxEnemies = difficulty === 'easy' ? 8 : difficulty === 'hard' ? 12 : 10;
    if (game.enemySpawnTimer > difficultySettings.enemySpawnRate / game.gameSpeed && game.enemies.length < maxEnemies && !game.bossActive) {
      const enemyTypes = ['normal', 'fast', 'strong', 'zigzag', 'kamikaze', 'shooter'];
      const randomType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
      
      let baseEnemySpeed = 1 + Math.random() * 1;
      let enemySize = 30;
      let enemyColor = '#ff0000';
      let specialBehavior = null;
      
      switch (randomType) {
        case 'fast':
          baseEnemySpeed = 2.5 + Math.random() * 1;
        enemySize = 25;
          enemyColor = '#ff6600';
          break;
        case 'strong':
        baseEnemySpeed = 0.8 + Math.random() * 0.5;
          enemySize = 40;
          enemyColor = '#cc0000';
          break;
        case 'zigzag':
          baseEnemySpeed = 1.5 + Math.random() * 0.8;
          enemySize = 28;
          enemyColor = '#ff00ff';
          specialBehavior = 'zigzag';
          break;
        case 'kamikaze':
          baseEnemySpeed = 3 + Math.random() * 1.5;
          enemySize = 22;
          enemyColor = '#ffff00';
          specialBehavior = 'kamikaze';
          break;
        case 'shooter':
          baseEnemySpeed = 1 + Math.random() * 0.5;
          enemySize = 32;
          enemyColor = '#00ff00';
          specialBehavior = 'shooter';
          break;
        default: // normal
          enemyColor = '#ff0000';
      }
      
      const enemySpeed = baseEnemySpeed * difficultySettings.enemySpeedMultiplier;
      
      const spawnX = Math.random() * (canvas.width - enemySize);
      
      game.enemies.push({
        x: spawnX,
        y: -enemySize,
        width: enemySize,
        height: enemySize,
        speed: enemySpeed,
        type: randomType,
        color: enemyColor,
        lastShot: 0,
        behavior: specialBehavior,
        zigzagOffset: Math.random() * Math.PI * 2,
        originalX: spawnX
      });
      game.enemySpawnTimer = 0;
    }

    // Spawn power-ups
    game.powerUpSpawnTimer += cappedDeltaTime;
    if (game.powerUpSpawnTimer > difficultySettings.powerUpSpawnRate) {
      const powerUpTypes = ['multiShot', 'rapidFire', 'shield', 'speed', 'weapon', 'life'];
      const randomType = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
      game.powerUps.push({
        x: Math.random() * (canvas.width - 20),
        y: -20,
        width: 20,
        height: 20,
        speed: 1,
        type: randomType,
        life: 300 // 5 seconds at 60fps
      });
      game.powerUpSpawnTimer = 0;
    }

    // Spawn emoji collectibles
    game.emojiSpawnTimer += cappedDeltaTime;
    if (game.emojiSpawnTimer > difficultySettings.emojiSpawnRate) {
      const emojis = ['⭐', '🌟', '💎', '🎯', '🚀', '💫', '🔥', '💖'];
      const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
      
      game.emojiCollectibles.push({
        x: Math.random() * (canvas.width - 30),
        y: -30,
        width: 30,
        height: 30,
        speed: 1.5,
        emoji: randomEmoji,
        points: randomEmoji === '💎' ? 50 : randomEmoji === '🌟' ? 30 : 10,
        life: 400 // 6.7 seconds at 60fps
      });
      game.emojiSpawnTimer = 0;
    }

    // Special events system
    if (!game.specialEventTimer) game.specialEventTimer = 0;
    game.specialEventTimer += cappedDeltaTime;
    if (game.specialEventTimer > 30000) { // Every 30 seconds
      const events = ['doubleScore', 'rapidFire', 'shieldBoost', 'speedBoost'];
      const randomEvent = events[Math.floor(Math.random() * events.length)];
      game.specialEvents.push({
        type: randomEvent,
        duration: 10000, // 10 seconds
        startTime: Date.now()
      });
      game.specialEventTimer = 0;
    }

    // Process special events
    game.specialEvents = game.specialEvents.filter(event => {
      const elapsed = Date.now() - event.startTime;
      if (elapsed < event.duration) {
        // Apply event effects
        switch (event.type) {
          case 'doubleScore':
            game.scoreMultiplier = 2;
            break;
          case 'rapidFire':
            game.rapidFireBoost = true;
            break;
          case 'shieldBoost':
            game.shieldBoost = true;
            break;
          case 'speedBoost':
            game.speedBoost = true;
            break;
          default:
            break;
        }
        return true;
      } else {
        // Remove expired events
        game.scoreMultiplier = 1;
        game.rapidFireBoost = false;
        game.shieldBoost = false;
        game.speedBoost = false;
        return false;
      }
    });

    // Spawn Gradius-style power-up capsules
    if (!game.powerUpCapsuleTimer) game.powerUpCapsuleTimer = 0;
    game.powerUpCapsuleTimer += cappedDeltaTime;
    if (game.powerUpCapsuleTimer > 8000) { // Every 8 seconds
      const capsuleTypes = ['speed', 'missile', 'double', 'laser', 'option', 'shield'];
      const capsuleType = capsuleTypes[Math.floor(Math.random() * capsuleTypes.length)];
      
      game.powerUpCapsules.push({
        x: Math.random() * (canvas.width - 30),
        y: -30,
        width: 30,
        height: 30,
        speed: 1.5,
        type: capsuleType,
        life: 400,
        collected: false
      });
      game.powerUpCapsuleTimer = 0;
    }

    // Spawn weapon collectibles (rare special items)
    if (!game.weaponSpawnTimer) game.weaponSpawnTimer = 0;
    game.weaponSpawnTimer += cappedDeltaTime;
    if (game.weaponSpawnTimer > 12000) { // Every 12 seconds (more frequent)
      const weaponEmojis = ['🔫', '⚡', '💥', '🔮', '🎯', '🎪']; // Laser, Plasma, Missile, Beam, Spread, Homing
      const randomWeaponEmoji = weaponEmojis[Math.floor(Math.random() * weaponEmojis.length)];
      
      let weaponType = 'laser';
      if (randomWeaponEmoji === '🔫') weaponType = 'laser';
      else if (randomWeaponEmoji === '⚡') weaponType = 'plasma';
      else if (randomWeaponEmoji === '💥') weaponType = 'missile';
      else if (randomWeaponEmoji === '🔮') weaponType = 'beam';
      else if (randomWeaponEmoji === '🎯') weaponType = 'spread';
      else if (randomWeaponEmoji === '🎪') weaponType = 'homing';
      
      game.emojiCollectibles.push({
        x: Math.random() * (canvas.width - 40),
        y: -40,
        width: 40,
        height: 40,
        speed: 1.2,
        emoji: randomWeaponEmoji,
        points: 150, // Higher value for weapon collectibles
        life: 600, // Longer life
        isWeapon: true,
        weaponType: weaponType
      });
      game.weaponSpawnTimer = 0;
    }

    // Update enemies and make them shoot
    game.enemies = game.enemies.filter(enemy => {
      // Apply special movement behaviors
      if (enemy.behavior === 'boss') {
        // Boss movement - moves side to side and down slowly
        enemy.x += enemy.speed * game.bossDirection;
        if (enemy.x <= 0 || enemy.x >= canvas.width - enemy.width) {
          game.bossDirection *= -1;
        }
        if (currentTime - game.bossLastMove > 2000) {
          enemy.y += 20;
          game.bossLastMove = currentTime;
        }
      } else if (enemy.behavior === 'zigzag') {
      enemy.y += enemy.speed;
        enemy.x = enemy.originalX + Math.sin(enemy.zigzagOffset + currentTime * 0.003) * 50;
        enemy.zigzagOffset += 0.1;
      } else if (enemy.behavior === 'kamikaze') {
        // Kamikaze enemies move directly toward player
        const dx = game.player.x + game.player.width/2 - (enemy.x + enemy.width/2);
        const dy = game.player.y + game.player.height/2 - (enemy.y + enemy.height/2);
        const distance = Math.sqrt(dx*dx + dy*dy);
        if (distance > 0) {
          enemy.x += (dx / distance) * enemy.speed * 0.7;
          enemy.y += (dy / distance) * enemy.speed * 0.7;
        } else {
          enemy.y += enemy.speed;
        }
      } else {
        // Normal movement
        enemy.y += enemy.speed;
      }
      
      // Make enemies shoot missiles
      const now = Date.now();
      let baseShootInterval = 2000; // Default
      if (enemy.type === 'boss') baseShootInterval = 500; // Boss shoots very frequently
      else if (enemy.type === 'fast') baseShootInterval = 1500;
      else if (enemy.type === 'strong') baseShootInterval = 800;
      else if (enemy.type === 'shooter') baseShootInterval = 1000; // Shooter enemies shoot more frequently
      
      const shootInterval = baseShootInterval * (difficultySettings.enemyShootRate / 2000);
      
      if (!enemy.lastShot || now - enemy.lastShot > shootInterval) {
        // Boss shooting patterns
        if (enemy.type === 'boss') {
          // Boss shoots multiple bullets in different patterns
          const bossCenterX = enemy.x + enemy.width / 2;
          const bossCenterY = enemy.y + enemy.height;
          
          // Pattern 1: Spread shot
          for (let i = -2; i <= 2; i++) {
            game.enemyBullets.push({
              x: bossCenterX + i * 15,
              y: bossCenterY,
              width: 6,
              height: 12,
              speed: 3 + Math.random() * 2,
              color: '#ff00ff'
            });
          }
          
          // Pattern 2: Targeted shot at player
          const dx = game.player.x + game.player.width/2 - bossCenterX;
          const dy = game.player.y + game.player.height/2 - bossCenterY;
          const distance = Math.sqrt(dx*dx + dy*dy);
          if (distance > 0) {
            game.enemyBullets.push({
              x: bossCenterX,
              y: bossCenterY,
              width: 8,
              height: 15,
              speed: 4,
              color: '#ff0000',
              vx: (dx / distance) * 4,
              vy: (dy / distance) * 4
            });
          }
        } else if (game.enemyBullets.length < 15) {
          // Regular enemy shooting
          game.enemyBullets.push({
            x: enemy.x + enemy.width / 2 - 2,
            y: enemy.y + enemy.height,
            width: 4,
            height: 10,
            speed: 3 + Math.random() * 2
          });
          enemy.lastShot = now;
        }
      }
      
      return enemy.y < canvas.height + enemy.height;
    });

    // Update enemy bullets
    game.enemyBullets = game.enemyBullets.filter(bullet => {
      bullet.y += bullet.speed;
      return bullet.y < canvas.height + bullet.height;
    });

    // Update power-ups
    game.powerUps = game.powerUps.filter(powerUp => {
      powerUp.y += powerUp.speed;
      powerUp.life--;
      return powerUp.y < canvas.height + powerUp.height && powerUp.life > 0;
    });

    // Update power-up capsules
    game.powerUpCapsules = game.powerUpCapsules.filter(capsule => {
      capsule.y += capsule.speed;
      capsule.life--;
      return capsule.life > 0 && capsule.y < canvas.height + capsule.height;
    });

    // Update emoji collectibles
    game.emojiCollectibles = game.emojiCollectibles.filter(emoji => {
      emoji.y += emoji.speed;
      emoji.life--;
      return emoji.life > 0 && emoji.y < canvas.height + emoji.height;
    });

    // Check bullet-enemy collisions
    game.bullets.forEach((bullet, bulletIndex) => {
      game.enemies.forEach((enemy, enemyIndex) => {
        if (bullet.x < enemy.x + enemy.width &&
            bullet.x + bullet.width > enemy.x &&
            bullet.y < enemy.y + enemy.height &&
            bullet.y + bullet.height > enemy.y) {
          // Collision detected
          game.bullets.splice(bulletIndex, 1);
          
          if (enemy.type === 'boss') {
            // Boss takes damage but doesn't die immediately
            enemy.health = (enemy.health || 100) - 5;
            gameRef.current.score += 25; // More points for hitting boss
            
            if (enemy.health <= 0) {
          game.enemies.splice(enemyIndex, 1);
              game.bossActive = false;
              gameRef.current.score += 500; // Big bonus for defeating boss
          playExplosionSound();
              
              // Check for boss defeat achievement
              checkAchievement('boss_defeated', 'Boss Slayer', 'Defeated your first boss!');
              
              // Story event: boss defeated
              setStoryStats(prev => ({ ...prev, bossesDefeated: prev.bossesDefeated + 1 }));
              const bossEvent = storyEventSystem.checkTrigger('boss_killed', { 
                count: storyStats.bossesDefeated + 1 
              });
              if (bossEvent) {
                setStoryNotification(bossEvent);
              }
            }
          } else {
            // Regular enemy dies immediately
          game.enemies.splice(enemyIndex, 1);
          
          // Story event: enemy killed
          setStoryStats(prev => ({ ...prev, enemiesKilled: prev.enemiesKilled + 1 }));
          const storyEvent = storyEventSystem.checkTrigger('enemy_killed', { 
            count: storyStats.enemiesKilled + 1 
          });
          if (storyEvent) {
            setStoryNotification(storyEvent);
          }
          
          // Combo system
          const currentTime = Date.now();
          if (currentTime - game.lastKillTime < 2000) { // 2 second combo window
            game.combo++;
            game.killStreak++;
          } else {
            game.combo = 1;
            game.killStreak = 1;
          }
          game.lastKillTime = currentTime;
          
          // Update combo multiplier
          game.comboMultiplier = Math.min(1 + Math.floor(game.combo / 5), 5); // Max 5x multiplier
          
          // Update max combo and streak
          setMaxCombo(prev => Math.max(prev, game.combo));
          setMaxKillStreak(prev => Math.max(prev, game.killStreak));
          
          // Score with combo multiplier
          const baseScore = 10;
          const comboBonus = game.combo > 1 ? Math.floor(game.combo / 2) : 0;
          const streakBonus = game.killStreak > 5 ? Math.floor(game.killStreak / 5) : 0;
          const totalScore = (baseScore + comboBonus + streakBonus) * game.comboMultiplier * (game.scoreMultiplier || 1);
          
          gameRef.current.score += totalScore;
          
          // Story event: score milestone
          const scoreEvent = storyEventSystem.checkTrigger('score_milestone', { 
            score: gameRef.current.score 
          });
          if (scoreEvent) {
            setStoryNotification(scoreEvent);
          }
          
          // Add XP and level progression
          const xpGain = Math.floor(totalScore / 10) + 1;
          game.playerXP += xpGain;
          game.totalKills++;
          game.sessionKills++;
          
          // Level up check
          const xpNeeded = game.playerLevel * 100;
          if (game.playerXP >= xpNeeded) {
            game.playerXP -= xpNeeded;
            game.playerLevel++;
            setPlayerLevel(game.playerLevel);
            setPlayerXP(game.playerXP);
            
            // Level up rewards
            if (game.playerLevel % 5 === 0) {
              // Every 5 levels, increase max health
              game.player.maxHealth += 5;
              game.player.health = game.player.maxHealth;
            }
            if (game.playerLevel % 3 === 0) {
              // Every 3 levels, slight speed boost
              game.player.speed = Math.min(game.player.speed + 0.2, 8);
            }
            
            // Show level up achievement
            checkAchievement('levelUp', `Reached Level ${game.playerLevel}!`);
          } else {
            setPlayerXP(game.playerXP);
          }
          
          setTotalKills(game.totalKills);
          
          // Update daily challenge progress
          if (dailyChallenge && !dailyChallenge.completed) {
            let progress = challengeProgress;
            if (dailyChallenge.type === 'kills') {
              progress = game.sessionKills;
            } else if (dailyChallenge.type === 'combo' && game.combo > progress) {
              progress = game.combo;
            } else if (dailyChallenge.type === 'score') {
              progress = gameRef.current.score;
            }
            
            if (progress >= dailyChallenge.target && !dailyChallenge.completed) {
              dailyChallenge.completed = true;
              dailyChallenge.progress = progress;
              localStorage.setItem('dailyChallenge', JSON.stringify(dailyChallenge));
              checkAchievement('dailyComplete', `Daily Challenge Complete!`, `${dailyChallenge.name} - Reward: 500 XP`);
              game.playerXP += 500; // Bonus XP for completing daily challenge
            } else {
              dailyChallenge.progress = progress;
              setChallengeProgress(progress);
              localStorage.setItem('dailyChallenge', JSON.stringify(dailyChallenge));
            }
          }
          
          playExplosionSound();
            
            // Check for score achievements
            if (gameRef.current.score >= 1000 && !achievements.find(a => a.id === 'score_1000')) {
              checkAchievement('score_1000', 'Score Master', 'Reached 1000 points!');
            }
            if (gameRef.current.score >= 5000 && !achievements.find(a => a.id === 'score_5000')) {
              checkAchievement('score_5000', 'High Scorer', 'Reached 5000 points!');
            }
          }
          
          // Optimized explosion particles
          for (let i = 0; i < 5; i++) {
            game.particles.push({
              x: enemy.x + enemy.width / 2,
              y: enemy.y + enemy.height / 2,
              vx: (Math.random() - 0.5) * 6,
              vy: (Math.random() - 0.5) * 6,
              life: 30,
              color: Math.random() > 0.5 ? '#ff8800' : '#ff4400'
            });
          }
        }
      });
    });

    // Check player-power-up collisions
    game.powerUps.forEach((powerUp, powerUpIndex) => {
      if (game.player.x < powerUp.x + powerUp.width &&
          game.player.x + game.player.width > powerUp.x &&
          game.player.y < powerUp.y + powerUp.height &&
          game.player.y + game.player.height > powerUp.y) {
        // Power-up collected
        game.powerUps.splice(powerUpIndex, 1);
        playPowerUpSound();
        // Screen shake disabled
        
        // Apply power-up effect
        if (powerUp.type === 'weapon') {
          // Cycle through weapon types
          const weapons = ['laser', 'plasma', 'missile'];
          const currentIndex = weapons.indexOf(currentWeapon);
          const nextIndex = (currentIndex + 1) % weapons.length;
          setCurrentWeapon(weapons[nextIndex]);
        } else if (powerUp.type === 'life') {
          // Give extra life
          game.player.lives = Math.min(game.player.lives + 1, game.player.maxLives);
          checkAchievement('extra_life', 'Extra Life', 'Collected an extra life power-up!');
        } else {
          setPlayerPowerUps(prev => ({
            ...prev,
            [powerUp.type]: Math.min(prev[powerUp.type] + 1, 3) // Max 3 stacks
          }));
        }
        
        // Add collection particles
        for (let i = 0; i < 6; i++) {
          game.particles.push({
            x: powerUp.x + powerUp.width / 2,
            y: powerUp.y + powerUp.height / 2,
            vx: (Math.random() - 0.5) * 4,
            vy: (Math.random() - 0.5) * 4,
            life: 30,
            color: '#00ff88'
          });
        }
      }
    });

    // Check player-power-up capsule collisions
    game.powerUpCapsules.forEach((capsule, capsuleIndex) => {
      if (game.player.x < capsule.x + capsule.width &&
          game.player.x + game.player.width > capsule.x &&
          game.player.y < capsule.y + capsule.height &&
          game.player.y + game.player.height > capsule.y) {
        // Collect capsule
        game.powerUpCapsules.splice(capsuleIndex, 1);
        playPowerUpSound();
        
        // Apply Gradius-style power-up effects
        switch (capsule.type) {
          case 'speed':
            game.player.speed = Math.min(game.player.speed + 1, 8);
            break;
          case 'missile':
            setCurrentWeapon('missile');
            break;
          case 'double':
            setCurrentWeapon('spread');
            break;
          case 'laser':
            setCurrentWeapon('laser');
            break;
          case 'option':
            // Add option (drone)
            if (game.options.length < 2) {
              game.options.push({
                x: game.player.x - 50,
                y: game.player.y,
                width: 20,
                height: 20,
                offset: game.options.length * 50,
                lastShot: 0
              });
            }
            break;
          case 'shield':
            game.shieldActive = true;
            game.shieldEnergy = 100;
            break;
        }
        
        // Collection particles
        for (let i = 0; i < 5; i++) {
          game.particles.push({
            x: capsule.x + capsule.width / 2,
            y: capsule.y + capsule.height / 2,
            vx: (Math.random() - 0.5) * 4,
            vy: (Math.random() - 0.5) * 4,
            life: 30,
            color: '#00ffff'
          });
        }
      }
    });

    // Check player-emoji collectible collisions
    game.emojiCollectibles.forEach((emoji, emojiIndex) => {
      if (game.player.x < emoji.x + emoji.width &&
          game.player.x + game.player.width > emoji.x &&
          game.player.y < emoji.y + emoji.height &&
          game.player.y + game.player.height > emoji.y) {
        // Collect emoji
        game.emojiCollectibles.splice(emojiIndex, 1);
        gameRef.current.score += emoji.points; // Add points based on emoji type
        // Screen shake disabled
        playPowerUpSound(); // Use power-up sound for collection
        
        // Handle weapon collectibles
        if (emoji.isWeapon && emoji.weaponType) {
          setCurrentWeapon(emoji.weaponType);
          weaponSystemRef.current.setWeapon(emoji.weaponType);
          
          // Story event: weapon collected
          setStoryStats(prev => ({ ...prev, weaponsCollected: prev.weaponsCollected + 1 }));
          const storyEvent = storyEventSystem.checkTrigger('weapon_collected', { 
            count: storyStats.weaponsCollected + 1 
          });
          if (storyEvent) {
            setStoryNotification(storyEvent);
          }
        }
        
        // Optimized collection particles
        for (let i = 0; i < 3; i++) {
          game.particles.push({
            x: emoji.x + emoji.width / 2,
            y: emoji.y + emoji.height / 2,
            vx: (Math.random() - 0.5) * 3,
            vy: (Math.random() - 0.5) * 3,
            life: 20,
            color: '#ffff00'
          });
        }
      }
    });

    // Check player collision with enemies
    const isInvincible = game.respawnInvincible && Date.now() < game.respawnInvincible;
    if (playerPowerUps.shield === 0 && !game.shieldActive && !isInvincible) { // Only take damage if no shield and not invincible
      game.enemies.forEach((enemy, enemyIndex) => {
        if (game.player.x < enemy.x + enemy.width &&
            game.player.x + game.player.width > enemy.x &&
            game.player.y < enemy.y + enemy.height &&
            game.player.y + game.player.height > enemy.y) {
          // Take damage
          gameRef.current.player.health--;
          // Reset combo and streak on damage
          game.combo = 0;
          game.killStreak = 0;
          game.comboMultiplier = 1;
          // Screen shake disabled
          playGameOverSound();
          
          if (gameRef.current.player.health <= 0) {
            gameRef.current.player.lives -= 1;
            
            if (gameRef.current.player.lives > 0) {
              // Respawn with full health
              gameRef.current.player.health = gameRef.current.player.maxHealth;
              gameRef.current.player.x = canvas.width / 2 - gameRef.current.player.width / 2;
              gameRef.current.player.y = canvas.height - gameRef.current.player.height - 50;
              
              // Brief invincibility after respawn
              gameRef.current.respawnInvincible = Date.now() + 2000; // 2 seconds of invincibility
              
              // Add respawn particles
              for (let i = 0; i < 15; i++) {
                gameRef.current.particles.push({
                  x: gameRef.current.player.x + gameRef.current.player.width / 2,
                  y: gameRef.current.player.y + gameRef.current.player.height / 2,
                  vx: (Math.random() - 0.5) * 8,
                  vy: (Math.random() - 0.5) * 8,
                  life: 30,
                  color: '#00ffff'
                });
              }
              
              // Check for achievements
              checkAchievement('first_death', 'Lost a Life', 'Your first death in the game!');
            } else {
              // Game over - no lives left
            setGameState('gameOver');
              stopBackgroundMusic();
            saveHighScore();
              
              // Check for achievements
              checkAchievement('game_over', 'Game Over', 'Used all 25 lives!');
              if (gameRef.current.score > 1000) checkAchievement('high_scorer', 'High Scorer', 'Scored over 1000 points!');
            }
          }
        }
      });

      // Check player collision with enemy bullets
      game.enemyBullets.forEach((bullet, bulletIndex) => {
        if (game.player.x < bullet.x + bullet.width &&
            game.player.x + game.player.width > bullet.x &&
            game.player.y < bullet.y + bullet.height &&
            game.player.y + game.player.height > bullet.y) {
          // Take damage from enemy bullet
          game.enemyBullets.splice(bulletIndex, 1);
          
          // Shield or invincibility absorbs damage
          if (game.shieldActive && game.shieldEnergy > 0) {
            game.shieldEnergy -= 20;
            if (game.shieldEnergy <= 0) {
              game.shieldActive = false;
              game.shieldEnergy = 0;
            }
          } else if (!isInvincible) {
          gameRef.current.player.health--;
            // Reset combo and streak on damage
            game.combo = 0;
            game.killStreak = 0;
            game.comboMultiplier = 1;
          // Screen shake disabled
          playGameOverSound();
          }
          
          if (gameRef.current.player.health <= 0) {
            gameRef.current.player.lives -= 1;
            
            if (gameRef.current.player.lives > 0) {
              // Respawn with full health
              gameRef.current.player.health = gameRef.current.player.maxHealth;
              gameRef.current.player.x = canvas.width / 2 - gameRef.current.player.width / 2;
              gameRef.current.player.y = canvas.height - gameRef.current.player.height - 50;
              
              // Brief invincibility after respawn
              gameRef.current.respawnInvincible = Date.now() + 2000; // 2 seconds of invincibility
              
              // Add respawn particles
              for (let i = 0; i < 15; i++) {
                gameRef.current.particles.push({
                  x: gameRef.current.player.x + gameRef.current.player.width / 2,
                  y: gameRef.current.player.y + gameRef.current.player.height / 2,
                  vx: (Math.random() - 0.5) * 8,
                  vy: (Math.random() - 0.5) * 8,
                  life: 30,
                  color: '#00ffff'
                });
              }
              
              // Check for achievements
              checkAchievement('first_death', 'Lost a Life', 'Your first death in the game!');
            } else {
              // Game over - no lives left
            setGameState('gameOver');
              stopBackgroundMusic();
            saveHighScore();
              
              // Check for achievements
              checkAchievement('game_over', 'Game Over', 'Used all 25 lives!');
              if (gameRef.current.score > 1000) checkAchievement('high_scorer', 'High Scorer', 'Scored over 1000 points!');
            }
          }
        }
      });
    }

    // Update particles
    game.particles = game.particles.filter(particle => {
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.life--;
      return particle.life > 0;
    });

    // Draw enhanced player ship with shield effect
    if (playerPowerUps.shield > 0) {
      // Animated shield effect
      const shieldPulse = Math.sin(currentTime * 0.01) * 0.3 + 0.7;
      const shieldColor = selectedCharacter === 'adelynn' ? '#ff69b4' : '#00ffff';
      ctx.strokeStyle = `rgba(${selectedCharacter === 'adelynn' ? '255, 105, 180' : '0, 255, 255'}, ${shieldPulse})`;
      ctx.lineWidth = 4;
      ctx.shadowColor = shieldColor;
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.moveTo(game.player.x + game.player.width/2, game.player.y - 8);
      ctx.lineTo(game.player.x - 8, game.player.y + game.player.height + 8);
      ctx.lineTo(game.player.x + game.player.width + 8, game.player.y + game.player.height + 8);
      ctx.closePath();
      ctx.stroke();
      ctx.shadowBlur = 0;
    }
    
    // Draw enhanced triangular player ship with character-based colors
    const shipCenterX = game.player.x + game.player.width/2;
    
    // Main ship body with gradient effect based on selected character
    const gradient = ctx.createLinearGradient(shipCenterX, game.player.y, shipCenterX, game.player.y + game.player.height);
    
    if (selectedCharacter === 'adelynn') {
      // Pink gradient for Adelynn
      gradient.addColorStop(0, '#ff69b4');
      gradient.addColorStop(0.5, '#ff1493');
      gradient.addColorStop(1, '#c71585');
    } else {
      // Blue gradient for Kaden
    gradient.addColorStop(0, '#00ffff');
    gradient.addColorStop(0.5, '#0088ff');
    gradient.addColorStop(1, '#0044aa');
    }
    
    ctx.fillStyle = gradient;
    ctx.shadowColor = selectedCharacter === 'adelynn' ? '#ff69b4' : '#00ffff';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.moveTo(shipCenterX, game.player.y);
    ctx.lineTo(game.player.x, game.player.y + game.player.height);
    ctx.lineTo(game.player.x + game.player.width, game.player.y + game.player.height);
    ctx.closePath();
    ctx.fill();
    
    // Add ship details
    ctx.fillStyle = '#ffffff';
    ctx.shadowBlur = 5;
    ctx.beginPath();
    ctx.moveTo(shipCenterX, game.player.y + 5);
    ctx.lineTo(shipCenterX - 8, game.player.y + game.player.height - 5);
    ctx.lineTo(shipCenterX + 8, game.player.y + game.player.height - 5);
    ctx.closePath();
    ctx.fill();
    
    ctx.shadowBlur = 0;

    // Draw enhanced player missiles with different weapon types
    game.bullets.forEach(bullet => {
      const weapon = bullet.weapon || 'laser';
      let primaryColor, secondaryColor, glowColor;
      
      if (weapon === 'plasma') {
        primaryColor = '#00ffff';
        secondaryColor = '#0088ff';
        glowColor = '#00ffff';
      } else if (weapon === 'missile') {
        primaryColor = '#ff4400';
        secondaryColor = '#ff8800';
        glowColor = '#ff4400';
      } else {
        primaryColor = '#ffff00';
        secondaryColor = '#ffaa00';
        glowColor = '#ffff00';
      }
      
      // Missile trail effect
      const trailGradient = ctx.createLinearGradient(bullet.x + bullet.width/2, bullet.y, bullet.x + bullet.width/2, bullet.y + bullet.height);
      trailGradient.addColorStop(0, primaryColor);
      trailGradient.addColorStop(0.5, secondaryColor);
      trailGradient.addColorStop(1, weapon === 'missile' ? '#ff6600' : secondaryColor);
      
      ctx.fillStyle = trailGradient;
      ctx.shadowColor = glowColor;
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.moveTo(bullet.x + bullet.width/2, bullet.y);
      ctx.lineTo(bullet.x, bullet.y + bullet.height);
      ctx.lineTo(bullet.x + bullet.width, bullet.y + bullet.height);
      ctx.closePath();
      ctx.fill();
      
      // Add missile core
      ctx.fillStyle = '#ffffff';
      ctx.shadowBlur = 5;
      ctx.beginPath();
      ctx.moveTo(bullet.x + bullet.width/2, bullet.y + 2);
      ctx.lineTo(bullet.x + 2, bullet.y + bullet.height - 2);
      ctx.lineTo(bullet.x + bullet.width - 2, bullet.y + bullet.height - 2);
      ctx.closePath();
      ctx.fill();
      
      ctx.shadowBlur = 0;
    });

    // Draw enhanced enemy ships with better graphics
    game.enemies.forEach(enemy => {
      const enemyCenterX = enemy.x + enemy.width/2;
      
      // Use the enemy's assigned color
      const primaryColor = enemy.color || '#ff0000';
      const secondaryColor = enemy.color || '#ff0000';
      const glowColor = enemy.color || '#ff0000';
      
      // Main enemy ship body with gradient
      const gradient = ctx.createLinearGradient(enemyCenterX, enemy.y, enemyCenterX, enemy.y + enemy.height);
      gradient.addColorStop(0, primaryColor);
      gradient.addColorStop(0.5, secondaryColor);
      gradient.addColorStop(1, primaryColor);
      
      ctx.fillStyle = gradient;
      ctx.shadowColor = glowColor;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(enemyCenterX, enemy.y + enemy.height);
      ctx.lineTo(enemy.x, enemy.y);
      ctx.lineTo(enemy.x + enemy.width, enemy.y);
      ctx.closePath();
      ctx.fill();
      
      // Add enemy ship details
      ctx.fillStyle = '#ffffff';
      ctx.shadowBlur = 3;
      ctx.beginPath();
      ctx.moveTo(enemyCenterX, enemy.y + enemy.height - 5);
      ctx.lineTo(enemyCenterX - 6, enemy.y + 5);
      ctx.lineTo(enemyCenterX + 6, enemy.y + 5);
      ctx.closePath();
      ctx.fill();
      
      ctx.shadowBlur = 0;
    });

    // Draw enhanced enemy missiles with trail effect
    game.enemyBullets.forEach(bullet => {
      // Enemy missile trail effect
      const trailGradient = ctx.createLinearGradient(bullet.x + bullet.width/2, bullet.y + bullet.height, bullet.x + bullet.width/2, bullet.y);
      trailGradient.addColorStop(0, '#ff0000');
      trailGradient.addColorStop(0.5, '#ff4400');
      trailGradient.addColorStop(1, '#ff8800');
      
      ctx.fillStyle = trailGradient;
      ctx.shadowColor = '#ff0000';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(bullet.x + bullet.width/2, bullet.y + bullet.height);
      ctx.lineTo(bullet.x, bullet.y);
      ctx.lineTo(bullet.x + bullet.width, bullet.y);
      ctx.closePath();
      ctx.fill();
      
      // Add missile core
      ctx.fillStyle = '#ffffff';
      ctx.shadowBlur = 4;
      ctx.beginPath();
      ctx.moveTo(bullet.x + bullet.width/2, bullet.y + bullet.height - 2);
      ctx.lineTo(bullet.x + 2, bullet.y + 2);
      ctx.lineTo(bullet.x + bullet.width - 2, bullet.y + 2);
      ctx.closePath();
      ctx.fill();
      
      ctx.shadowBlur = 0;
    });

    // Draw power-up capsules
    game.powerUpCapsules.forEach(capsule => {
      const pulse = Math.sin(currentTime * 0.01 + capsule.x * 0.02) * 0.2 + 0.8;
      const scale = pulse;
      
      ctx.save();
      ctx.translate(capsule.x + capsule.width/2, capsule.y + capsule.height/2);
      ctx.scale(scale, scale);
      
      // Capsule color based on type
      let color = '#00ffff';
      let symbol = '●';
      switch (capsule.type) {
        case 'speed': color = '#ffff00'; symbol = 'S'; break;
        case 'missile': color = '#ff4400'; symbol = 'M'; break;
        case 'double': color = '#ff00ff'; symbol = 'D'; break;
        case 'laser': color = '#00ff00'; symbol = 'L'; break;
        case 'option': color = '#ff8800'; symbol = 'O'; break;
        case 'shield': color = '#0088ff'; symbol = 'H'; break;
      }
      
      ctx.fillStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = 15;
      ctx.font = 'bold 20px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(symbol, 0, 0);
      ctx.restore();
    });

    // Draw Options (drones) - identical to main player ship with character-based colors
    game.options.forEach((option, index) => {
      ctx.save();
      
      // Draw enhanced triangular wing fighter ship with character-based colors
      const shipCenterX = option.x + option.width/2;
      
      // Main ship body with gradient effect based on selected character
      const gradient = ctx.createLinearGradient(shipCenterX - 15, option.y, shipCenterX + 15, option.y + option.height);
      
      if (selectedCharacter === 'adelynn') {
        // Pink gradient for Adelynn's clone ships
        gradient.addColorStop(0, '#ff69b4');
        gradient.addColorStop(0.5, '#ff1493');
        gradient.addColorStop(1, '#c71585');
      } else {
        // Blue gradient for Kaden's clone ships
      gradient.addColorStop(0, '#00ffff');
      gradient.addColorStop(0.5, '#0088ff');
      gradient.addColorStop(1, '#004488');
      }
      
      ctx.fillStyle = gradient;
      ctx.shadowColor = selectedCharacter === 'adelynn' ? '#ff69b4' : '#00ffff';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.moveTo(shipCenterX, option.y); // Top point
      ctx.lineTo(option.x + 5, option.y + option.height - 8); // Bottom left
      ctx.lineTo(option.x + option.width - 5, option.y + option.height - 8); // Bottom right
      ctx.closePath();
      ctx.fill();
      
      // Add ship details (same as main player)
      ctx.fillStyle = '#ffffff';
      ctx.shadowBlur = 5;
      ctx.beginPath();
      ctx.moveTo(shipCenterX, option.y + 5);
      ctx.lineTo(shipCenterX - 3, option.y + 15);
      ctx.lineTo(shipCenterX + 3, option.y + 15);
      ctx.closePath();
      ctx.fill();
      
      ctx.restore();
    });

    // Draw shield
    if (game.shieldActive && game.shieldEnergy > 0) {
      ctx.save();
      const shieldAlpha = game.shieldEnergy / 100;
      ctx.strokeStyle = `rgba(0, 136, 255, ${shieldAlpha})`;
      ctx.lineWidth = 3;
      ctx.shadowColor = '#0088ff';
      ctx.shadowBlur = 20;
      ctx.beginPath();
      ctx.arc(game.player.x + game.player.width/2, game.player.y + game.player.height/2, 30, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // Draw enhanced emoji collectibles with pulsing effect
    game.emojiCollectibles.forEach(emoji => {
      const pulse = Math.sin(currentTime * 0.005 + emoji.x * 0.01) * 0.3 + 0.7;
      const scale = pulse;
      
      ctx.save();
      ctx.translate(emoji.x + emoji.width/2, emoji.y + emoji.height/2);
      ctx.scale(scale, scale);
      
      // Special effects for weapon collectibles
      if (emoji.isWeapon) {
        // Weapon collectibles have special glow
        const weaponGlow = Math.sin(currentTime * 0.01) * 0.5 + 0.5;
        ctx.shadowColor = emoji.weaponType === 'laser' ? '#ffff00' : emoji.weaponType === 'plasma' ? '#00ffff' : '#ff4400';
        ctx.shadowBlur = 30 * weaponGlow;
        ctx.font = '32px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(emoji.emoji, 0, 10);
        
        // Add rotating sparkles for weapon collectibles
        const sparkleRotation = currentTime * 0.005;
        ctx.shadowColor = '#ffffff';
        ctx.shadowBlur = 15;
        ctx.font = '16px Arial';
        ctx.save();
        ctx.rotate(sparkleRotation);
        ctx.fillText('✨', -20, -15);
        ctx.fillText('✨', 20, -15);
        ctx.fillText('✨', -20, 20);
        ctx.fillText('✨', 20, 20);
        ctx.restore();
      } else {
        // Regular emoji glow effect
        ctx.shadowColor = '#ffff00';
        ctx.shadowBlur = 20 * pulse;
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(emoji.emoji, 0, 8);
        
        // Add sparkle effect for rare emojis
        if (emoji.points >= 30) {
          ctx.shadowColor = '#ffffff';
          ctx.shadowBlur = 10;
          ctx.font = '12px Arial';
          ctx.fillText('✨', -15, -10);
          ctx.fillText('✨', 15, -10);
          ctx.fillText('✨', -15, 15);
          ctx.fillText('✨', 15, 15);
        }
      }
      
      ctx.restore();
    });

    // Draw enhanced power-ups with better graphics
    game.powerUps.forEach(powerUp => {
      const centerX = powerUp.x + powerUp.width/2;
      const centerY = powerUp.y + powerUp.height/2;
      
      let primaryColor, secondaryColor, symbol;
      switch (powerUp.type) {
        case 'multiShot': 
          primaryColor = '#ff00ff'; 
          secondaryColor = '#ff44ff';
          symbol = '⚡';
          break;
        case 'rapidFire': 
          primaryColor = '#ffff00'; 
          secondaryColor = '#ffff44';
          symbol = '🔥';
          break;
        case 'shield': 
          primaryColor = '#00ffff'; 
          secondaryColor = '#44ffff';
          symbol = '🛡️';
          break;
        case 'speed': 
          primaryColor = '#ff8800'; 
          secondaryColor = '#ffaa44';
          symbol = '💨';
          break;
        case 'weapon': 
          primaryColor = '#ff00ff'; 
          secondaryColor = '#ff44ff';
          symbol = '🔫';
          break;
        case 'life': 
          primaryColor = '#ffd700'; 
          secondaryColor = '#ffed4e';
          symbol = '👤';
          break;
        default: 
          primaryColor = '#00ff00'; 
          secondaryColor = '#44ff44';
          symbol = '⭐';
          break;
      }
      
      // Pulsing effect
      const pulse = Math.sin(currentTime * 0.008 + powerUp.x * 0.01) * 0.2 + 0.8;
      
      // Outer glow
      ctx.shadowColor = primaryColor;
      ctx.shadowBlur = 15 * pulse;
      ctx.fillStyle = primaryColor;
      ctx.fillRect(powerUp.x - 2, powerUp.y - 2, powerUp.width + 4, powerUp.height + 4);
      
      // Inner gradient
      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, powerUp.width/2);
      gradient.addColorStop(0, secondaryColor);
      gradient.addColorStop(1, primaryColor);
      
      ctx.fillStyle = gradient;
      ctx.shadowBlur = 8;
      ctx.fillRect(powerUp.x, powerUp.y, powerUp.width, powerUp.height);
      
      // Symbol
      ctx.fillStyle = '#ffffff';
      ctx.shadowBlur = 5;
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(symbol, centerX, centerY + 5);
      
      ctx.shadowBlur = 0;
    });

    // Draw enhanced particles with better effects
    game.particles.forEach(particle => {
      const alpha = particle.life / 40;
      const size = (particle.life / 40) * 4 + 1;
      
      ctx.globalAlpha = alpha;
      ctx.fillStyle = particle.color || '#ff8800';
      ctx.shadowColor = particle.color || '#ff8800';
      ctx.shadowBlur = 8;
      
      // Draw particle with glow
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, size, 0, Math.PI * 2);
      ctx.fill();
      
      // Add inner bright core
      ctx.globalAlpha = alpha * 0.5;
      ctx.fillStyle = '#ffffff';
      ctx.shadowBlur = 3;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, size * 0.5, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.shadowBlur = 0;
    });
    ctx.globalAlpha = 1;

    // Restore canvas transform
    ctx.restore();

    requestAnimationFrame(gameLoop);
  }, [gameState, saveHighScore, playerPowerUps, touchControls, getDifficultySettings, difficulty, currentWeapon, achievements, checkAchievement, pauseGame, resumeGame]);

  const handleKeyDown = (e) => {
    gameRef.current.keys[e.key] = true;
    e.preventDefault();
  };

  const handleKeyUp = (e) => {
    gameRef.current.keys[e.key] = false;
    e.preventDefault();
  };

  // Touch control handlers
  const handleTouchStart = React.useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Touch start detected!', e.touches.length);
    
    if (!e.touches || e.touches.length === 0) {
      console.log('No touches found in touchstart event');
      return;
    }
    
    const touch = e.touches[0];
    const canvas = canvasRef.current;
    if (!canvas) {
      console.log('Canvas not found');
      return;
    }
    
    const rect = canvas.getBoundingClientRect();
    
    // Enhanced haptic feedback for iOS and mobile devices
    if (navigator.vibrate) {
      navigator.vibrate(10); // Short vibration on touch start
    }
    
    // iOS-specific haptic feedback (if available)
    if (window.DeviceMotionEvent && typeof DeviceMotionEvent.requestPermission === 'function') {
      // iOS 13+ haptic feedback
      try {
        if (navigator.vibrate) {
          navigator.vibrate([10]);
        }
      } catch (e) {
        console.log('Haptic feedback not available');
      }
    }
    
    const newTouchControls = {
      touchStartX: touch.clientX - rect.left,
      touchStartY: touch.clientY - rect.top,
      touchCurrentX: touch.clientX - rect.left,
      touchCurrentY: touch.clientY - rect.top,
      isTouching: true,
      multiTouch: e.touches.length > 1,
      touchSensitivity: 1.5
    };
    
    console.log('Setting touch controls:', newTouchControls);
    setTouchControls(newTouchControls);
    
    // Direct test - move ship immediately on touch start
    if (gameRef.current && gameRef.current.player) {
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const targetX = newTouchControls.touchCurrentX * scaleX - gameRef.current.player.width / 2;
      const targetY = newTouchControls.touchCurrentY * scaleY - gameRef.current.player.height / 2;
      
      gameRef.current.player.x = Math.max(0, Math.min(canvas.width - gameRef.current.player.width, targetX));
      gameRef.current.player.y = Math.max(0, Math.min(canvas.height - gameRef.current.player.height - 20, targetY));
      
      console.log('Direct touch test - moved ship to:', gameRef.current.player.x, gameRef.current.player.y);
    }
  }, []);

  const handleTouchMove = React.useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Touch move detected!', e.touches.length);
    
    if (!e.touches || e.touches.length === 0) {
      console.log('No touches found in touchmove event');
      return;
    }
    
    setTouchControls(prev => {
      if (!prev.isTouching) {
        console.log('Not touching, ignoring move');
        return prev;
      }
      
      const touch = e.touches[0];
      const canvas = canvasRef.current;
      if (!canvas) {
        console.log('Canvas not found in touchmove');
        return prev;
      }
      
      const rect = canvas.getBoundingClientRect();
      
      // Calculate touch velocity for better control
      const deltaX = (touch.clientX - rect.left) - prev.touchCurrentX;
      const deltaY = (touch.clientY - rect.top) - prev.touchCurrentY;
      const velocity = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      
      // Adjust sensitivity based on velocity
      const dynamicSensitivity = Math.min(1.5 + (velocity * 0.02), 3.0);
      
      const newControls = {
        ...prev,
        touchCurrentX: touch.clientX - rect.left,
        touchCurrentY: touch.clientY - rect.top,
        touchSensitivity: dynamicSensitivity,
        multiTouch: e.touches.length > 1
      };
      
      console.log('Touch move - new position:', newControls.touchCurrentX, newControls.touchCurrentY);
      
      // Direct test - move ship immediately on touch move
      if (gameRef.current && gameRef.current.player) {
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const targetX = newControls.touchCurrentX * scaleX - gameRef.current.player.width / 2;
        const targetY = newControls.touchCurrentY * scaleY - gameRef.current.player.height / 2;
        
        gameRef.current.player.x = Math.max(0, Math.min(canvas.width - gameRef.current.player.width, targetX));
        gameRef.current.player.y = Math.max(0, Math.min(canvas.height - gameRef.current.player.height - 20, targetY));
        
        console.log('Direct touch move - moved ship to:', gameRef.current.player.x, gameRef.current.player.y);
      }
      
      return newControls;
    });
  }, []);

  const handleTouchEnd = React.useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Touch end detected!');
    setTouchControls(prev => ({
      ...prev,
      isTouching: false
    }));
  }, []);

  useEffect(() => {
    if (gameState === 'playing') {
      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('keyup', handleKeyUp);
      requestAnimationFrame(gameLoop);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState, gameLoop]);

  // Touch event listeners with enhanced iOS support
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      // Standard touch events with iOS optimizations
      canvas.addEventListener('touchstart', handleTouchStart, { passive: false, capture: true });
      canvas.addEventListener('touchmove', handleTouchMove, { passive: false, capture: true });
      canvas.addEventListener('touchend', handleTouchEnd, { passive: false, capture: true });
      canvas.addEventListener('touchcancel', handleTouchEnd, { passive: false, capture: true });
      
      // iOS specific events
      canvas.addEventListener('gesturestart', (e) => e.preventDefault(), { passive: false });
      canvas.addEventListener('gesturechange', (e) => e.preventDefault(), { passive: false });
      canvas.addEventListener('gestureend', (e) => e.preventDefault(), { passive: false });
      
      // Additional iOS touch event support
      canvas.addEventListener('touchforcechange', (e) => e.preventDefault(), { passive: false });
      
      // Prevent iOS Safari from scrolling
      canvas.addEventListener('touchmove', (e) => {
        if (e.touches.length > 1) {
          e.preventDefault();
        }
      }, { passive: false });
    }

    return () => {
      if (canvas) {
        canvas.removeEventListener('touchstart', handleTouchStart);
        canvas.removeEventListener('touchmove', handleTouchMove);
        canvas.removeEventListener('touchend', handleTouchEnd);
        canvas.removeEventListener('touchcancel', handleTouchEnd);
        canvas.removeEventListener('gesturestart', (e) => e.preventDefault());
        canvas.removeEventListener('gesturechange', (e) => e.preventDefault());
        canvas.removeEventListener('gestureend', (e) => e.preventDefault());
      }
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return (
    <div className="vertical-shooter">
      <div className="game-container">
        <canvas
          ref={canvasRef}
          className="game-canvas"
          tabIndex="0"
        />
        
        {gameState === 'playing' && (
          <div className="game-ui">
            <div className="game-stats">
              <div className="stat-item">
                <span>Score: {gameRef.current?.score || 0}</span>
              </div>
              <div className="stat-item">
                <span>Lives: {gameRef.current?.player?.lives || 25}</span>
              </div>
              <div className="stat-item">
                <span>Health: {Math.round(((gameRef.current?.player?.health || 0) / (gameRef.current?.player?.maxHealth || 100)) * 100)}%</span>
              </div>
              <div className="stat-item level-display">
                <span>LVL: {playerLevel} | XP: {playerXP}/{playerLevel * 100}</span>
              </div>
              <div className="stat-item">
                <span>Weapon: {currentWeapon.toUpperCase()}</span>
              </div>
              {gameRef.current?.combo > 0 && (
                <div className="stat-item combo-display">
                  <span>COMBO: {gameRef.current?.combo || 0}x{gameRef.current?.comboMultiplier || 1}</span>
                </div>
              )}
              {gameRef.current?.killStreak > 0 && (
                <div className="stat-item streak-display">
                  <span>STREAK: {gameRef.current?.killStreak || 0}</span>
                </div>
              )}
              {gameRef.current?.specialEvents?.length > 0 && (
                <div className="stat-item special-event-display">
                  <span>EVENT: {gameRef.current?.specialEvents[0]?.type?.toUpperCase()}</span>
                </div>
              )}
              {gameRef.current?.options?.length > 0 && (
                <div className="stat-item options-display">
                  <span>OPTIONS: {gameRef.current?.options?.length || 0}</span>
                </div>
              )}
              {gameRef.current?.shieldActive && (
                <div className="stat-item shield-display">
                  <span>SHIELD: {Math.round(gameRef.current?.shieldEnergy || 0)}%</span>
                </div>
              )}
              {gameRef.current?.bossActive && (
              <div className="stat-item">
                  <span>BOSS HEALTH: {gameRef.current?.bossHealth || 0}/100</span>
              </div>
              )}
              {dailyChallenge && !dailyChallenge.completed && (
                <div className="stat-item challenge-display">
                  <span>DAILY: {dailyChallenge.name} ({challengeProgress}/{dailyChallenge.target})</span>
                </div>
              )}
            </div>
            <div className="power-up-display">
              {playerPowerUps.multiShot > 0 && (
                <div className="power-up-item" style={{color: '#ff00ff'}}>
                  Multi-Shot: {playerPowerUps.multiShot}
                </div>
              )}
              {playerPowerUps.rapidFire > 0 && (
                <div className="power-up-item" style={{color: '#ffff00'}}>
                  Rapid Fire: {playerPowerUps.rapidFire}
                </div>
              )}
              {playerPowerUps.shield > 0 && (
                <div className="power-up-item" style={{color: '#00ffff'}}>
                  Shield: {playerPowerUps.shield}
                </div>
              )}
              {playerPowerUps.speed > 0 && (
                <div className="power-up-item" style={{color: '#ff8800'}}>
                  Speed: {playerPowerUps.speed}
                </div>
              )}
            </div>
          </div>
        )}

        {gameState === 'menu' && (
          <div className="game-menu">
            <div className="menu-header">
              <h1 className="menu-title">🚀 Kaden & Adelynn Space Adventures 🚀</h1>
              <div className="menu-subtitle-container">
                <p className="menu-subtitle">🌟 Epic space shooter game with power-ups and fun! 🌟</p>
                <div className="menu-characters">
                  <span 
                    className={`character kaden ${selectedCharacter === 'kaden' ? 'selected' : ''}`}
                    onClick={() => {
                      setSelectedCharacter('kaden');
                      localStorage.setItem('kadenAdelynnCharacter', 'kaden');
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    👨‍🚀 Kaden
                  </span>
                  <span 
                    className={`character adelynn ${selectedCharacter === 'adelynn' ? 'selected' : ''}`}
                    onClick={() => {
                      setSelectedCharacter('adelynn');
                      localStorage.setItem('kadenAdelynnCharacter', 'adelynn');
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    👩‍🚀 Adelynn
                  </span>
                </div>
              </div>
            </div>
            
            <div className="difficulty-selection">
              <h3>Choose Difficulty:</h3>
              <div className="difficulty-buttons">
                <button 
                  className={`difficulty-button ${difficulty === 'easy' ? 'selected' : ''}`}
                  onClick={() => {
                    setDifficulty('easy');
                    localStorage.setItem('kadenAdelynnDifficulty', 'easy');
                  }}
                >
                  🌟 Easy
                </button>
                <button 
                  className={`difficulty-button ${difficulty === 'medium' ? 'selected' : ''}`}
                  onClick={() => {
                    setDifficulty('medium');
                    localStorage.setItem('kadenAdelynnDifficulty', 'medium');
                  }}
                >
                  ⚡ Medium
                </button>
                <button 
                  className={`difficulty-button ${difficulty === 'hard' ? 'selected' : ''}`}
                  onClick={() => {
                    setDifficulty('hard');
                    localStorage.setItem('kadenAdelynnDifficulty', 'hard');
                  }}
                >
                  🔥 Hard
                </button>
              </div>
            </div>
            
            <div className="menu-buttons">
              <button className="menu-button primary" onClick={startGame}>
                🎮 Start Adventure!
              </button>
                          <button className="menu-button secondary" onClick={() => setShowHighScores(true)}>
              🏆 High Scores
            </button>
            <button className="menu-button secondary" onClick={() => setShowStoryModal(true)}>
              📖 Story
            </button>
              <button className="menu-button secondary" onClick={() => setShowSettings(true)}>
                ⚙️ How to Play
              </button>
            </div>
            
            <div className="menu-features">
              <div className="feature-item">
                <span className="feature-emoji">⚡</span>
                <span>Power-ups</span>
              </div>
              <div className="feature-item">
                <span className="feature-emoji">🎵</span>
                <span>Sound Effects</span>
              </div>
              <div className="feature-item">
                <span className="feature-emoji">📱</span>
                <span>Mobile Friendly</span>
              </div>
              <div className="feature-item">
                <span className="feature-emoji">🌟</span>
                <span>Fun for Kids</span>
              </div>
            </div>
          </div>
        )}

        {gameState === 'paused' && (
          <div className="game-paused">
            <h2>Game Paused</h2>
            <div className="score-display">
              <p>Current Score: {gameRef.current?.score || 0}</p>
            </div>
            <div className="menu-buttons">
              <button className="menu-button primary" onClick={resumeGame}>
                Resume Game
              </button>
              <button className="menu-button secondary" onClick={() => setGameState('menu')}>
                Main Menu
              </button>
            </div>
          </div>
        )}

        {gameState === 'gameOver' && (
          <div className="game-over">
            <h2>Game Over!</h2>
            <div className="score-display">
              <p>Final Score: {gameRef.current?.score || 0}</p>
            </div>
            <div className="menu-buttons">
              <button className="menu-button primary" onClick={startGame}>
                Play Again
              </button>
              <button className="menu-button secondary" onClick={() => setGameState('menu')}>
                Main Menu
              </button>
            </div>
          </div>
        )}
        
        {/* Achievement Notification */}
        {showAchievement && (
          <div className="achievement-notification">
            <div className="achievement-content">
              <h3>🏆 Achievement Unlocked!</h3>
              <h4>{showAchievement.title}</h4>
              <p>{showAchievement.description}</p>
            </div>
          </div>
        )}
      </div>

      {showHighScores && (
        <div className="modal-overlay" onClick={() => setShowHighScores(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>High Scores</h2>
              <button className="modal-close" onClick={() => setShowHighScores(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="high-scores-list">
                {highScores.length === 0 ? (
                  <p>No scores yet. Play the game to set a high score!</p>
                ) : (
                  highScores.map((score, index) => (
                    <div key={index} className="high-score-item">
                      <span className="score-rank">#{index + 1}</span>
                      <span className="score-name">{score.name}</span>
                      <span className="score-value">{score.score}</span>
                      <span className="score-date">{score.date}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {showSettings && (
        <div className="modal-overlay" onClick={() => setShowSettings(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Settings</h2>
              <button className="modal-close" onClick={() => setShowSettings(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="control-section">
                <h3>Controls</h3>
                <p>Use <span className="key">WASD</span> or <span className="key">Arrow Keys</span> to move</p>
                <p>Press <span className="key">SPACE</span> to shoot</p>
                <p>Press <span className="key">1-6</span> to switch weapons</p>
                <p>Press <span className="key">P</span> to pause/resume</p>
                <p><strong>Mobile:</strong> Touch and drag to move, tap to shoot</p>
              </div>
              <div className="control-section">
                <h3>Weapons</h3>
                <p><span style={{color: '#ffff00'}}>1 - Laser:</span> Standard yellow laser</p>
                <p><span style={{color: '#00ffff'}}>2 - Plasma:</span> Fast cyan plasma bolt</p>
                <p><span style={{color: '#ff4400'}}>3 - Missile:</span> Slow but powerful red missile</p>
                <p><span style={{color: '#ff00ff'}}>4 - Beam:</span> Wide purple energy beam</p>
                <p><span style={{color: '#ffff00'}}>5 - Spread:</span> 3-bullet spread pattern</p>
                <p><span style={{color: '#00ff00'}}>6 - Homing:</span> Green tracking bullets</p>
                <p><strong>Weapon Collectibles:</strong> 🔫⚡💥🔮🎯🎪 (spawn every 12 seconds)</p>
              </div>
              <div className="control-section">
                <h3>Power-ups</h3>
                <p><span style={{color: '#ff00ff'}}>Pink:</span> Multi-Shot (4 bullets)</p>
                <p><span style={{color: '#ffff00'}}>Yellow:</span> Rapid Fire (faster shooting)</p>
                <p><span style={{color: '#00ffff'}}>Cyan:</span> Shield (invincibility)</p>
                <p><span style={{color: '#ff8800'}}>Orange:</span> Speed Boost</p>
              </div>
              <div className="control-section">
                <h3>Game Info</h3>
                <p>Destroy red enemies to score points!</p>
                <p>Collect power-ups to gain abilities!</p>
                <p>You have 25 health points - avoid enemies!</p>
                <p>Good luck, space adventurers!</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Story System UI */}
      {storyNotification && (
        <StoryNotification
          event={storyNotification}
          onClose={() => setStoryNotification(null)}
        />
      )}
      
      <StoryModal
        isOpen={showStoryModal}
        onClose={() => setShowStoryModal(false)}
        chapterId={currentStoryChapter}
        characterId={selectedCharacter}
        onCharacterSelect={(character) => {
          setSelectedCharacter(character);
          localStorage.setItem('kadenAdelynnCharacter', character);
        }}
      />
    </div>
  );
};

export default Game;
