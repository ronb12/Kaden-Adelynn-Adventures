import { useEffect, useRef, useState, useCallback } from 'react'
import './Game.css'

function Game({
  onPause,
  onGameOver,
  difficulty,
  selectedShip,
  selectedCharacter,
  playerName,
  isPaused,
}) {
  const canvasRef = useRef(null)
  const gameLoopRef = useRef(null)

  // Canvas ready callback
  const setCanvasRef = useCallback((node) => {
    canvasRef.current = node
  }, [])

  // Game loop
  const gameLoop = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.fillStyle = '#0a0e27'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw text
    ctx.fillStyle = '#fff'
    ctx.font = '20px Arial'
    ctx.fillText('Game Running', 50, 50)

    if (!isPaused) {
      gameLoopRef.current = requestAnimationFrame(gameLoop)
    }
  }, [isPaused])

  // Initialize game
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    if (!isPaused) {
      gameLoopRef.current = requestAnimationFrame(gameLoop)
    }

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current)
      }
    }
  }, [isPaused, gameLoop])

  return (
    <div className="game-container">
      <canvas ref={setCanvasRef} className="game-canvas" />
      {!isPaused && (
        <button
          onClick={onPause}
          aria-label="Pause Game"
          className="pause-button"
          style={{
            position: 'fixed',
            top: 14,
            right: 14,
            zIndex: 100,
            background: 'rgba(0,0,0,0.6)',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.25)',
            borderRadius: 10,
            padding: '8px 12px',
            cursor: 'pointer',
            backdropFilter: 'blur(4px)'
          }}
        >
          ⏸️ Pause
        </button>
      )}
      {isPaused && (
        <div className="pause-overlay">
          <h2>Game Paused</h2>
          <p>Press 'P' or click Resume</p>
          <button
            onClick={onPause}
            aria-label="Resume Game"
            style={{
              marginTop: 12,
              background: 'rgba(0,0,0,0.6)',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.25)',
              borderRadius: 10,
              padding: '8px 16px',
              cursor: 'pointer'
            }}
          >
            ▶️ Resume
          </button>
        </div>
      )}
    </div>
  )
}

export default Game
