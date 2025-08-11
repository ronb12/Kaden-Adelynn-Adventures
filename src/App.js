import React, { useState, useEffect, useRef } from 'react';

function App() {
  const [gameState, setGameState] = useState('menu');
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(25);
  const [level, setLevel] = useState(1);
  const canvasRef = useRef(null);
  const gameLoopRef = useRef(null);
  const playerRef = useRef({ x: 0, y: 0, width: 40, height: 30 });
  const bulletsRef = useRef([]);
  const enemiesRef = useRef([]);
  const keysRef = useRef({});

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      playerRef.current.x = canvas.width / 2 - 20;
      playerRef.current.y = canvas.height - 100;
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const handleKeyDown = (e) => {
      keysRef.current[e.code] = true;
      if (e.code === 'Space') e.preventDefault();
    };

    const handleKeyUp = (e) => {
      keysRef.current[e.code] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setLives(25);
    setLevel(1);
    bulletsRef.current = [];
    enemiesRef.current = [];
    
    const gameLoop = () => {
      if (gameState !== 'playing') return;
      
      updateGame();
      renderGame();
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };
    
    gameLoop();
  };

  const updateGame = () => {
    const canvas = canvasRef.current;
    const player = playerRef.current;
    
    // Update player position
    if (keysRef.current['ArrowLeft'] || keysRef.current['KeyA']) {
      player.x = Math.max(0, player.x - 5);
    }
    if (keysRef.current['ArrowRight'] || keysRef.current['KeyD']) {
      player.x = Math.min(canvas.width - player.width, player.x + 5);
    }
    if (keysRef.current['ArrowUp'] || keysRef.current['KeyW']) {
      player.y = Math.max(0, player.y - 5);
    }
    if (keysRef.current['ArrowDown'] || keysRef.current['KeyS']) {
      player.y = Math.min(canvas.height - player.height, player.y + 5);
    }

    // Auto-shoot
    if (keysRef.current['Space']) {
      if (Date.now() % 10 === 0) {
        bulletsRef.current.push({
          x: player.x + player.width / 2,
          y: player.y,
          width: 4,
          height: 10,
          speed: 8
        });
      }
    }

    // Update bullets
    bulletsRef.current = bulletsRef.current
      .map(bullet => ({ ...bullet, y: bullet.y - bullet.speed }))
      .filter(bullet => bullet.y > -bullet.height);

    // Spawn enemies
    if (Math.random() < 0.02) {
      enemiesRef.current.push({
        x: Math.random() * (canvas.width - 40),
        y: -40,
        width: 40,
        height: 30,
        speed: 2 + Math.random() * 2
      });
    }

    // Update enemies
    enemiesRef.current = enemiesRef.current
      .map(enemy => ({ ...enemy, y: enemy.y + enemy.speed }))
      .filter(enemy => enemy.y < canvas.height);

    // Check collisions
    checkCollisions();
  };

  const checkCollisions = () => {
    const player = playerRef.current;
    
    // Player bullets vs enemies
    bulletsRef.current.forEach((bullet, bulletIndex) => {
      enemiesRef.current.forEach((enemy, enemyIndex) => {
        if (isColliding(bullet, enemy)) {
          bulletsRef.current.splice(bulletIndex, 1);
          enemiesRef.current.splice(enemyIndex, 1);
          setScore(prev => prev + 100);
        }
      });
    });

    // Enemies vs player
    enemiesRef.current.forEach(enemy => {
      if (isColliding(enemy, player)) {
        setLives(prev => prev - 1);
        if (lives <= 1) {
          gameOver();
        }
      }
    });
  };

  const isColliding = (rect1, rect2) => {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
  };

  const renderGame = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background stars
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    for (let i = 0; i < 50; i++) {
      const x = (Date.now() * 0.1 + i * 100) % canvas.width;
      const y = (i * 20) % canvas.height;
      ctx.fillRect(x, y, 2, 2);
    }

    // Draw player
    const player = playerRef.current;
    ctx.fillStyle = '#4ecdc4';
    ctx.fillRect(player.x, player.y, player.width, player.height);

    // Draw bullets
    ctx.fillStyle = '#ff6b6b';
    bulletsRef.current.forEach(bullet => {
      ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    });

    // Draw enemies
    ctx.fillStyle = '#ff4757';
    enemiesRef.current.forEach(enemy => {
      ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
    });
  };

  const gameOver = () => {
    setGameState('gameOver');
    if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current);
    }
  };

  const pauseGame = () => {
    setGameState('paused');
    if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current);
    }
  };

  const resumeGame = () => {
    setGameState('playing');
    const gameLoop = () => {
      if (gameState !== 'playing') return;
      updateGame();
      renderGame();
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };
    gameLoop();
  };

  if (gameState === 'menu') {
    return (
      <div style={{
        width: '100vw',
        height: '100vh',
        background: 'linear-gradient(135deg, #0c0c0c 0%, #1a1a2e 50%, #16213e 100%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        color: 'white'
      }}>
        <h1 style={{ fontSize: '4rem', marginBottom: '2rem', textAlign: 'center' }}>
          🚀 Kaden & Adelynn Adventures
        </h1>
        <p style={{ fontSize: '1.5rem', marginBottom: '3rem', textAlign: 'center' }}>
          Embark on an epic space journey!
        </p>
        <button
          onClick={startGame}
          style={{
            background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
            border: 'none',
            borderRadius: '50px',
            color: 'white',
            fontSize: '1.5rem',
            fontWeight: 'bold',
            padding: '1rem 2rem',
            cursor: 'pointer',
            minWidth: '200px'
          }}
        >
          🚀 Start Adventure
        </button>
      </div>
    );
  }

  if (gameState === 'gameOver') {
    return (
      <div style={{
        width: '100vw',
        height: '100vh',
        background: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        color: 'white'
      }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '2rem', color: '#ff6b6b' }}>
          Game Over
        </h1>
        <div style={{ fontSize: '2rem', marginBottom: '2rem', color: '#4ecdc4' }}>
          Final Score: {score}
        </div>
        <button
          onClick={() => setGameState('menu')}
          style={{
            background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
            border: 'none',
            borderRadius: '50px',
            color: 'white',
            fontSize: '1.2rem',
            fontWeight: 'bold',
            padding: '1rem 2rem',
            cursor: 'pointer',
            minWidth: '200px'
          }}
        >
          🏠 Main Menu
        </button>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative' }}>
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%'
        }}
      />
      
      {/* Game UI */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        color: 'white',
        fontSize: '1.2rem',
        fontWeight: 'bold',
        zIndex: 10
      }}>
        <div>Score: {score}</div>
        <div>Lives: {lives}</div>
        <div>Level: {level}</div>
      </div>

      {/* Pause Button */}
      <button
        onClick={pauseGame}
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          background: 'rgba(255, 255, 255, 0.2)',
          border: '2px solid rgba(255, 255, 255, 0.3)',
          borderRadius: '50%',
          width: '60px',
          height: '60px',
          color: 'white',
          fontSize: '24px',
          cursor: 'pointer',
          zIndex: 10
        }}
      >
        ⏸️
      </button>

      {/* Pause Menu */}
      {gameState === 'paused' && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 100
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            border: '2px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '30px',
            padding: '3rem',
            textAlign: 'center',
            color: 'white'
          }}>
            <h1 style={{ fontSize: '2rem', marginBottom: '2rem', color: '#4ecdc4' }}>
              ⏸️ Game Paused
            </h1>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <button
                onClick={resumeGame}
                style={{
                  background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  borderRadius: '50px',
                  color: 'white',
                  fontSize: '1.2rem',
                  fontWeight: 'bold',
                  padding: '1rem 2rem',
                  cursor: 'pointer',
                  minWidth: '200px'
                }}
              >
                ▶️ Resume Game
              </button>
              <button
                onClick={() => setGameState('menu')}
                style={{
                  background: 'linear-gradient(45deg, #ff6b6b 0%, #ee5a24 100%)',
                  border: 'none',
                  borderRadius: '50px',
                  color: 'white',
                  fontSize: '1.2rem',
                  fontWeight: 'bold',
                  padding: '1rem 2rem',
                  cursor: 'pointer',
                  minWidth: '200px'
                }}
              >
                🏠 Main Menu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
