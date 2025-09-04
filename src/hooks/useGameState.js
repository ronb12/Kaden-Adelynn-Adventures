/**
 * useGameState - Custom hook for managing game state with persistence
 */
import { useState, useCallback, useEffect, useRef } from 'react';
import { GAME_CONFIG, DIFFICULTY_SETTINGS } from '../constants/GameConstants.js';

export const useGameState = () => {
  // Core game state
  const [gameState, setGameState] = useState('menu'); // 'menu', 'playing', 'paused', 'gameOver'
  const [difficulty, setDifficulty] = useState('medium');
  const [currentWeapon, setCurrentWeapon] = useState('laser');
  
  // UI state
  const [showSettings, setShowSettings] = useState(false);
  const [showHighScores, setShowHighScores] = useState(false);
  const [showAchievement, setShowAchievement] = useState(null);
  
  // Game progress
  const [highScores, setHighScores] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [playerLevel, setPlayerLevel] = useState(1);
  const [playerXP, setPlayerXP] = useState(0);
  const [totalKills, setTotalKills] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [maxKillStreak, setMaxKillStreak] = useState(0);
  
  // Power-ups and abilities
  const [playerPowerUps, setPlayerPowerUps] = useState({
    multiShot: 0,
    rapidFire: 0,
    shield: 0,
    speed: 0
  });
  
  // Daily challenges
  const [dailyChallenge, setDailyChallenge] = useState(null);
  const [challengeProgress, setChallengeProgress] = useState(0);
  
  // Touch controls
  const [touchControls, setTouchControls] = useState({
    touchStartX: 0,
    touchStartY: 0,
    touchCurrentX: 0,
    touchCurrentY: 0,
    isTouching: false,
    multiTouch: false,
    touchSensitivity: 1.5
  });

  // Game data ref for performance-critical updates
  const gameRef = useRef({
    player: { 
      x: 0, 
      y: 0, 
      width: GAME_CONFIG.PLAYER.WIDTH, 
      height: GAME_CONFIG.PLAYER.HEIGHT, 
      speed: GAME_CONFIG.PLAYER.SPEED, 
      health: GAME_CONFIG.PLAYER.MAX_HEALTH, 
      maxHealth: GAME_CONFIG.PLAYER.MAX_HEALTH,
      lives: GAME_CONFIG.PLAYER.MAX_LIVES,
      maxLives: GAME_CONFIG.PLAYER.MAX_LIVES
    },
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
    survivalTime: 0,
    bossActive: false,
    bossHealth: 0,
    bossMaxHealth: 0,
    bossPhase: 1,
    bossLastShot: 0,
    bossLastMove: 0,
    bossDirection: 1,
    weaponSpawnTimer: 0,
    respawnInvincible: 0
  });

  // Load saved data on mount
  useEffect(() => {
    loadSavedData();
  }, []);

  const loadSavedData = useCallback(() => {
    try {
      // Load high scores
      const savedScores = localStorage.getItem('kadenAdelynnHighScores');
      if (savedScores) {
        setHighScores(JSON.parse(savedScores));
      }

      // Load achievements
      const savedAchievements = localStorage.getItem('kadenAdelynnAchievements');
      if (savedAchievements) {
        setAchievements(JSON.parse(savedAchievements));
      }

      // Load difficulty preference
      const savedDifficulty = localStorage.getItem('kadenAdelynnDifficulty');
      if (savedDifficulty && ['easy', 'medium', 'hard'].includes(savedDifficulty)) {
        setDifficulty(savedDifficulty);
      }

      // Load player progress
      const savedProgress = localStorage.getItem('kadenAdelynnProgress');
      if (savedProgress) {
        const progress = JSON.parse(savedProgress);
        setPlayerLevel(progress.level || 1);
        setPlayerXP(progress.xp || 0);
        setTotalKills(progress.totalKills || 0);
        setMaxCombo(progress.maxCombo || 0);
        setMaxKillStreak(progress.maxKillStreak || 0);
      }
    } catch (error) {
      console.warn('Error loading saved data:', error);
    }
  }, []);

  const saveProgress = useCallback(() => {
    try {
      const progress = {
        level: playerLevel,
        xp: playerXP,
        totalKills,
        maxCombo,
        maxKillStreak,
        lastSaved: Date.now()
      };
      localStorage.setItem('kadenAdelynnProgress', JSON.stringify(progress));
    } catch (error) {
      console.warn('Error saving progress:', error);
    }
  }, [playerLevel, playerXP, totalKills, maxCombo, maxKillStreak]);

  const getDifficultySettings = useCallback(() => {
    return DIFFICULTY_SETTINGS[difficulty] || DIFFICULTY_SETTINGS.medium;
  }, [difficulty]);

  const saveHighScore = useCallback(() => {
    try {
      const newScore = { 
        name: 'Player', 
        score: gameRef.current.score, 
        date: new Date().toLocaleDateString(), 
        difficulty: difficulty 
      };
      
      const updatedScores = [...highScores, newScore]
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);
      
      setHighScores(updatedScores);
      localStorage.setItem('kadenAdelynnHighScores', JSON.stringify(updatedScores));
    } catch (error) {
      console.warn('Error saving high score:', error);
    }
  }, [highScores, difficulty]);

  const checkAchievement = useCallback((id, title, description) => {
    if (!achievements.find(a => a.id === id)) {
      const newAchievement = { 
        id, 
        title, 
        description, 
        date: new Date().toLocaleDateString() 
      };
      
      setAchievements(prev => [...prev, newAchievement]);
      setShowAchievement(newAchievement);
      
      // Save to localStorage
      try {
        const savedAchievements = JSON.parse(localStorage.getItem('kadenAdelynnAchievements') || '[]');
        savedAchievements.push(newAchievement);
        localStorage.setItem('kadenAdelynnAchievements', JSON.stringify(savedAchievements));
      } catch (error) {
        console.warn('Error saving achievement:', error);
      }
      
      // Hide achievement after 3 seconds
      setTimeout(() => setShowAchievement(null), GAME_CONFIG.UI.ACHIEVEMENT_DISPLAY_TIME);
    }
  }, [achievements]);

  const startGame = useCallback(() => {
    setGameState('playing');
    setPlayerPowerUps({
      multiShot: 0,
      rapidFire: 0,
      shield: 0,
      speed: 0
    });

    // Reset game data
    gameRef.current = {
      ...gameRef.current,
      player: { 
        x: 0, 
        y: 0, 
        width: GAME_CONFIG.PLAYER.WIDTH, 
        height: GAME_CONFIG.PLAYER.HEIGHT, 
        speed: GAME_CONFIG.PLAYER.SPEED, 
        health: GAME_CONFIG.PLAYER.MAX_HEALTH, 
        maxHealth: GAME_CONFIG.PLAYER.MAX_HEALTH,
        lives: GAME_CONFIG.PLAYER.MAX_LIVES,
        maxLives: GAME_CONFIG.PLAYER.MAX_LIVES
      },
      bullets: [],
      enemies: [],
      enemyBullets: [],
      particles: [],
      powerUps: [],
      emojiCollectibles: [],
      keys: {},
      score: 0,
      combo: 0,
      comboMultiplier: 1,
      killStreak: 0,
      sessionKills: 0,
      survivalTime: 0,
      bossActive: false,
      specialEvents: [],
      options: [],
      shieldActive: false,
      shieldEnergy: 0,
      powerUpCapsules: [],
      respawnInvincible: 0
    };
  }, []);

  const pauseGame = useCallback(() => {
    if (gameState === 'playing') {
      setGameState('paused');
    }
  }, [gameState]);

  const resumeGame = useCallback(() => {
    if (gameState === 'paused') {
      setGameState('playing');
    }
  }, [gameState]);

  const endGame = useCallback(() => {
    setGameState('gameOver');
    saveHighScore();
    saveProgress();
  }, [saveHighScore, saveProgress]);

  // Auto-save progress periodically
  useEffect(() => {
    const interval = setInterval(saveProgress, 30000); // Save every 30 seconds
    return () => clearInterval(interval);
  }, [saveProgress]);

  return {
    // State
    gameState,
    difficulty,
    currentWeapon,
    showSettings,
    showHighScores,
    showAchievement,
    highScores,
    achievements,
    playerLevel,
    playerXP,
    totalKills,
    maxCombo,
    maxKillStreak,
    playerPowerUps,
    dailyChallenge,
    challengeProgress,
    touchControls,
    gameRef,

    // Actions
    setGameState,
    setDifficulty,
    setCurrentWeapon,
    setShowSettings,
    setShowHighScores,
    setShowAchievement,
    setHighScores,
    setAchievements,
    setPlayerLevel,
    setPlayerXP,
    setTotalKills,
    setMaxCombo,
    setMaxKillStreak,
    setPlayerPowerUps,
    setDailyChallenge,
    setChallengeProgress,
    setTouchControls,

    // Methods
    getDifficultySettings,
    saveHighScore,
    checkAchievement,
    startGame,
    pauseGame,
    resumeGame,
    endGame,
    loadSavedData,
    saveProgress
  };
};
