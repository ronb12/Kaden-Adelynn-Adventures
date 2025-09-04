/**
 * useGameState.test.js - Tests for game state hook
 */
import { renderHook, act } from '@testing-library/react';
import { useGameState } from '../../hooks/useGameState.js';

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
});

describe('useGameState', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
  });

  test('should initialize with default values', () => {
    const { result } = renderHook(() => useGameState());
    
    expect(result.current.gameState).toBe('menu');
    expect(result.current.difficulty).toBe('medium');
    expect(result.current.currentWeapon).toBe('laser');
    expect(result.current.playerLevel).toBe(1);
    expect(result.current.playerXP).toBe(0);
    expect(result.current.totalKills).toBe(0);
    expect(result.current.highScores).toEqual([]);
    expect(result.current.achievements).toEqual([]);
  });

  test('should load saved high scores', () => {
    const savedScores = [
      { name: 'Player', score: 1000, date: '1/1/2024', difficulty: 'medium' }
    ];
    mockLocalStorage.getItem.mockImplementation((key) => {
      if (key === 'kadenAdelynnHighScores') {
        return JSON.stringify(savedScores);
      }
      return null;
    });

    const { result } = renderHook(() => useGameState());
    
    expect(result.current.highScores).toEqual(savedScores);
  });

  test('should load saved achievements', () => {
    const savedAchievements = [
      { id: 'first_kill', title: 'First Kill', description: 'Killed first enemy', date: '1/1/2024' }
    ];
    mockLocalStorage.getItem.mockImplementation((key) => {
      if (key === 'kadenAdelynnAchievements') {
        return JSON.stringify(savedAchievements);
      }
      return null;
    });

    const { result } = renderHook(() => useGameState());
    
    expect(result.current.achievements).toEqual(savedAchievements);
  });

  test('should load saved difficulty', () => {
    mockLocalStorage.getItem.mockImplementation((key) => {
      if (key === 'kadenAdelynnDifficulty') {
        return 'hard';
      }
      return null;
    });

    const { result } = renderHook(() => useGameState());
    
    expect(result.current.difficulty).toBe('hard');
  });

  test('should load saved progress', () => {
    const savedProgress = {
      level: 5,
      xp: 250,
      totalKills: 100,
      maxCombo: 15,
      maxKillStreak: 25
    };
    mockLocalStorage.getItem.mockImplementation((key) => {
      if (key === 'kadenAdelynnProgress') {
        return JSON.stringify(savedProgress);
      }
      return null;
    });

    const { result } = renderHook(() => useGameState());
    
    expect(result.current.playerLevel).toBe(5);
    expect(result.current.playerXP).toBe(250);
    expect(result.current.totalKills).toBe(100);
    expect(result.current.maxCombo).toBe(15);
    expect(result.current.maxKillStreak).toBe(25);
  });

  test('should handle localStorage errors gracefully', () => {
    mockLocalStorage.getItem.mockImplementation(() => {
      throw new Error('localStorage error');
    });
    
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

    const { result } = renderHook(() => useGameState());
    
    // Should still initialize with defaults
    expect(result.current.gameState).toBe('menu');
    expect(consoleSpy).toHaveBeenCalledWith('Error loading saved data:', expect.any(Error));
    
    consoleSpy.mockRestore();
  });

  test('should get difficulty settings', () => {
    const { result } = renderHook(() => useGameState());
    
    const settings = result.current.getDifficultySettings();
    expect(settings.enemySpeedMultiplier).toBe(1.2); // Medium difficulty
    expect(settings.playerSpeed).toBe(5);
  });

  test('should start game correctly', () => {
    const { result } = renderHook(() => useGameState());
    
    act(() => {
      result.current.startGame();
    });
    
    expect(result.current.gameState).toBe('playing');
    expect(result.current.playerPowerUps).toEqual({
      multiShot: 0,
      rapidFire: 0,
      shield: 0,
      speed: 0
    });
    expect(result.current.gameRef.current.score).toBe(0);
    expect(result.current.gameRef.current.player.health).toBe(100);
    expect(result.current.gameRef.current.player.lives).toBe(25);
  });

  test('should pause and resume game', () => {
    const { result } = renderHook(() => useGameState());
    
    // Start game first
    act(() => {
      result.current.startGame();
    });
    
    // Pause game
    act(() => {
      result.current.pauseGame();
    });
    expect(result.current.gameState).toBe('paused');
    
    // Resume game
    act(() => {
      result.current.resumeGame();
    });
    expect(result.current.gameState).toBe('playing');
  });

  test('should end game and save score', () => {
    const { result } = renderHook(() => useGameState());
    
    // Set a score
    result.current.gameRef.current.score = 1500;
    
    act(() => {
      result.current.endGame();
    });
    
    expect(result.current.gameState).toBe('gameOver');
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'kadenAdelynnHighScores',
      expect.stringContaining('1500')
    );
  });

  test('should save high score correctly', () => {
    const { result } = renderHook(() => useGameState());
    
    result.current.gameRef.current.score = 2000;
    
    act(() => {
      result.current.saveHighScore();
    });
    
    expect(result.current.highScores).toHaveLength(1);
    expect(result.current.highScores[0].score).toBe(2000);
    expect(result.current.highScores[0].difficulty).toBe('medium');
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'kadenAdelynnHighScores',
      expect.any(String)
    );
  });

  test('should check achievements correctly', () => {
    const { result } = renderHook(() => useGameState());
    
    act(() => {
      result.current.checkAchievement('test_achievement', 'Test Achievement', 'Test description');
    });
    
    expect(result.current.achievements).toHaveLength(1);
    expect(result.current.achievements[0].id).toBe('test_achievement');
    expect(result.current.achievements[0].title).toBe('Test Achievement');
    expect(result.current.showAchievement).toBeDefined();
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'kadenAdelynnAchievements',
      expect.any(String)
    );
  });

  test('should not duplicate achievements', () => {
    const { result } = renderHook(() => useGameState());
    
    // Add same achievement twice in separate acts
    act(() => {
      result.current.checkAchievement('test_achievement', 'Test Achievement', 'Test description');
    });
    
    act(() => {
      result.current.checkAchievement('test_achievement', 'Test Achievement', 'Test description');
    });
    
    expect(result.current.achievements).toHaveLength(1);
  });

  test('should save progress periodically', () => {
    jest.useFakeTimers();
    
    const { result } = renderHook(() => useGameState());
    
    // Change some values
    act(() => {
      result.current.setPlayerLevel(3);
      result.current.setPlayerXP(150);
      result.current.setTotalKills(50);
    });
    
    // Fast-forward time
    act(() => {
      jest.advanceTimersByTime(30000); // 30 seconds
    });
    
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'kadenAdelynnProgress',
      expect.stringContaining('"level":3')
    );
    
    jest.useRealTimers();
  });

  test('should update state values correctly', () => {
    const { result } = renderHook(() => useGameState());
    
    act(() => {
      result.current.setGameState('playing');
      result.current.setDifficulty('hard');
      result.current.setCurrentWeapon('plasma');
      result.current.setPlayerLevel(3);
      result.current.setPlayerXP(200);
      result.current.setTotalKills(75);
    });
    
    expect(result.current.gameState).toBe('playing');
    expect(result.current.difficulty).toBe('hard');
    expect(result.current.currentWeapon).toBe('plasma');
    expect(result.current.playerLevel).toBe(3);
    expect(result.current.playerXP).toBe(200);
    expect(result.current.totalKills).toBe(75);
  });

  test('should update power-ups correctly', () => {
    const { result } = renderHook(() => useGameState());
    
    const newPowerUps = {
      multiShot: 2,
      rapidFire: 1,
      shield: 3,
      speed: 1
    };
    
    act(() => {
      result.current.setPlayerPowerUps(newPowerUps);
    });
    
    expect(result.current.playerPowerUps).toEqual(newPowerUps);
  });

  test('should update touch controls correctly', () => {
    const { result } = renderHook(() => useGameState());
    
    const touchState = {
      touchStartX: 100,
      touchStartY: 200,
      touchCurrentX: 150,
      touchCurrentY: 250,
      isTouching: true,
      multiTouch: false,
      touchSensitivity: 2.0
    };
    
    act(() => {
      result.current.setTouchControls(touchState);
    });
    
    expect(result.current.touchControls).toEqual(touchState);
  });
});
