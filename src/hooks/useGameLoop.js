/**
 * useGameLoop - Custom hook for managing the game loop with proper cleanup
 */
import { useRef, useCallback, useEffect } from 'react';
import { GAME_CONFIG } from '../constants/GameConstants.js';

export const useGameLoop = (gameState, gameLoopCallback) => {
  const animationFrameRef = useRef();
  const lastTimeRef = useRef(0);
  const isRunningRef = useRef(false);

  const gameLoop = useCallback((currentTime) => {
    if (gameState !== 'playing' || !isRunningRef.current) {
      return;
    }

    // Frame rate limiting
    const deltaTime = currentTime - lastTimeRef.current;
    
    if (deltaTime < GAME_CONFIG.TARGET_FRAME_TIME) {
      animationFrameRef.current = requestAnimationFrame(gameLoop);
      return;
    }
    
    lastTimeRef.current = currentTime;
    
    // Cap deltaTime to prevent large jumps
    const cappedDeltaTime = Math.min(deltaTime, GAME_CONFIG.TARGET_FRAME_TIME);

    // Call the game loop callback
    if (gameLoopCallback) {
      gameLoopCallback(currentTime, cappedDeltaTime);
    }

    // Schedule next frame
    animationFrameRef.current = requestAnimationFrame(gameLoop);
  }, [gameState, gameLoopCallback]);

  const startLoop = useCallback(() => {
    if (!isRunningRef.current) {
      isRunningRef.current = true;
      lastTimeRef.current = performance.now();
      animationFrameRef.current = requestAnimationFrame(gameLoop);
    }
  }, [gameLoop]);

  const stopLoop = useCallback(() => {
    isRunningRef.current = false;
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, []);

  // Auto-start/stop based on game state
  useEffect(() => {
    if (gameState === 'playing') {
      startLoop();
    } else {
      stopLoop();
    }

    // Cleanup on unmount
    return () => {
      stopLoop();
    };
  }, [gameState, startLoop, stopLoop]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopLoop();
    };
  }, [stopLoop]);

  return {
    isRunning: isRunningRef.current,
    startLoop,
    stopLoop
  };
};
