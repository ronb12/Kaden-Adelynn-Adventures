import React, { useState, useEffect, useRef } from 'react';
import SpaceshipDesigner from './SpaceshipDesigner';

function App() {
  const [gameState, setGameState] = useState('menu');
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [level, setLevel] = useState(1);
  const [highScore, setHighScore] = useState(0);
  const [weaponType, setWeaponType] = useState('laser');
  const [shields, setShields] = useState(100);
  const [bossActive, setBossActive] = useState(false);
  const [showDesigner, setShowDesigner] = useState(false);
  
  const canvasRef = useRef(null);
  const gameLoopRef = useRef(null);
  const lastTimeRef = useRef(0);
  
  // Game objects
  const playerRef = useRef({ x: 0, y: 0, width: 60, height: 45, speed: 6, health: 100 });
  const bulletsRef = useRef([]);
  const enemiesRef = useRef([]);
  const asteroidsRef = useRef([]);
  const particlesRef = useRef([]);
  const collectiblesRef = useRef([]);
  const keysRef = useRef({});
  const lastShotRef = useRef(0);
  const lastAsteroidSpawnRef = useRef(0);
  const lastCollectibleSpawnRef = useRef(0);

  // Emoji collectibles
  const emojiTypes = ['🚀', '💎', '⭐', '🔥', '⚡', '🛡️', '💊', '🎯', '🌟', '��'];

  // Initialize game
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      playerRef.current.x = canvas.width / 2 - playerRef.current.width / 2;
      playerRef.current.y = canvas.height - 100;
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Keyboard controls
    const handleKeyDown = (e) => {
      keysRef.current[e.code] = true;
      if (e.code === 'Space') e.preventDefault();
      if (e.code === 'Digit1') setWeaponType('laser');
      if (e.code === 'Digit2') setWeaponType('missile');
      if (e.code === 'Digit3') setWeaponType('plasma');
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
  }, [gameState]);

  // Game loop
  useEffect(() => {
    if (gameState !== 'playing') return;

    const gameLoop = (currentTime) => {
      if (gameState !== 'playing') return;
      
      const deltaTime = currentTime - lastTimeRef.current;
      lastTimeRef.current = currentTime;
      
      renderGame();
      
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };
    
    gameLoopRef.current = requestAnimationFrame(gameLoop);
    
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameState]);

  const drawTriangleShip = (ctx, x, y, width, height, isPlayer = true) => {
    const centerX = x + width / 2;
    const centerY = y + height / 2;
    
    ctx.save();
    ctx.translate(centerX, centerY);
    
    if (isPlayer) {
      // Player ship - triangle design
      ctx.fillStyle = '#4ecdc4';
      ctx.beginPath();
      ctx.moveTo(0, -height / 2);
      ctx.lineTo(-width / 2, height / 2);
      ctx.lineTo(width / 2, height / 2);
      ctx.closePath();
      ctx.fill();
      
      // Cockpit
      ctx.fillStyle = '#3498db';
      ctx.beginPath();
      ctx.moveTo(0, -height / 4);
      ctx.lineTo(-width / 4, height / 4);
      ctx.lineTo(width / 4, height / 4);
      ctx.closePath();
      ctx.fill();
      
      // Engine glow
      ctx.fillStyle = '#f39c12';
      ctx.shadowColor = '#f39c12';
      ctx.shadowBlur = 15;
      ctx.fillRect(-width / 3, height / 2, width / 1.5, 8);
      ctx.shadowBlur = 0;
      
    } else {
      // Enemy ship - inverted triangle design
      ctx.fillStyle = '#e74c3c';
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(-width / 2, -height / 2);
      ctx.lineTo(width / 2, -height / 2);
      ctx.closePath();
      ctx.fill();
      
      // Enemy cockpit
      ctx.fillStyle = '#8e44ad';
      ctx.beginPath();
      ctx.moveTo(0, height / 4);
      ctx.lineTo(-width / 4, -height / 4);
      ctx.lineTo(width / 4, -height / 4);
      ctx.closePath();
      ctx.fill();
      
      // Enemy engine
      ctx.fillStyle = '#ff6b6b';
      ctx.fillRect(-width / 3, -height / 2 - 8, width / 1.5, 6);
    }
    
    ctx.restore();
  };

  const renderGame = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw animated background stars
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    for (let i = 0; i < 150; i++) {
      const x = (Date.now() * 0.03 + i * 40) % canvas.width;
      const y = (i * 15) % canvas.height;
      const size = Math.sin(Date.now() * 0.002 + i) * 2 + 1;
      ctx.fillRect(x, y, size, size);
    }

    // Draw player
    drawTriangleShip(ctx, playerRef.current.x, playerRef.current.y, 
                     playerRef.current.width, playerRef.current.height, true);
  };

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setLives(3);
    setLevel(1);
    setShields(100);
    setBossActive(false);
    
    const canvas = canvasRef.current;
    if (canvas) {
      playerRef.current.x = canvas.width / 2 - playerRef.current.width / 2;
      playerRef.current.y = canvas.height - 100;
    }
  };

  const handleSaveShip = (shipData) => {
    console.log('Saved ship:', shipData);
    setShowDesigner(false);
  };

  // Menu Screen
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
        color: 'white',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <h1 style={{ 
          fontSize: 'clamp(2rem, 8vw, 4rem)', 
          marginBottom: '2rem', 
          textAlign: 'center',
          textShadow: '0 0 20px rgba(78, 205, 196, 0.8)',
          animation: 'glow 2s ease-in-out infinite alternate'
        }}>
          🚀 Kaden & Adelynn Adventures
        </h1>
        
        <p style={{ 
          fontSize: 'clamp(1rem, 4vw, 1.5rem)', 
          marginBottom: '3rem', 
          textAlign: 'center',
          opacity: 0.9
        }}>
          Epic Triangle Jet Fighter Combat - Defend the Galaxy!
        </p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
          <button
            onClick={startGame}
            style={{
              background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              borderRadius: '50px',
              color: 'white',
              fontSize: 'clamp(1rem, 4vw, 1.5rem)',
              fontWeight: 'bold',
              padding: '1rem 2rem',
              cursor: 'pointer',
              minWidth: '200px',
              boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)',
              transition: 'all 0.3s ease',
              transform: 'translateY(0)'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-3px)';
              e.target.style.boxShadow = '0 12px 35px rgba(102, 126, 234, 0.6)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.4)';
            }}
          >
            🚀 Start Mission
          </button>
          
          <button
            onClick={() => setShowDesigner(true)}
            style={{
              background: 'linear-gradient(45deg, #2ecc71 0%, #27ae60 100%)',
              border: 'none',
              borderRadius: '50px',
              color: 'white',
              fontSize: 'clamp(0.9rem, 3vw, 1.2rem)',
              fontWeight: 'bold',
              padding: '0.8rem 1.5rem',
              cursor: 'pointer',
              minWidth: '180px',
              boxShadow: '0 6px 20px rgba(46, 204, 113, 0.4)'
            }}
          >
            �� Design Spaceship
          </button>
        </div>

        <style>{`
          @keyframes glow {
            0% { text-shadow: 0 0 20px rgba(78, 205, 196, 0.8); }
            100% { text-shadow: 0 0 30px rgba(78, 205, 196, 1), 0 0 40px rgba(78, 205, 196, 0.6); }
          }
        `}</style>
      </div>
    );
  }

  // Game Screen
  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          cursor: 'none'
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
        zIndex: 10,
        textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
      }}>
        <div style={{ marginBottom: '5px' }}>🚀 Score: {score}</div>
        <div style={{ marginBottom: '5px' }}>❤️ Lives: {lives}</div>
        <div style={{ marginBottom: '5px' }}>⭐ Level: {level}</div>
        <div style={{ marginBottom: '5px' }}>🛡️ Shields: {Math.max(0, Math.floor(shields))}%</div>
        <div>🔫 Weapon: {weaponType.toUpperCase()}</div>
      </div>

      {/* Back to Menu Button */}
      <button
        onClick={() => setGameState('menu')}
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
          zIndex: 10,
          backdropFilter: 'blur(10px)'
        }}
      >
        🏠
      </button>

      {/* Spaceship Designer */}
      {showDesigner && (
        <SpaceshipDesigner
          onSave={handleSaveShip}
          onClose={() => setShowDesigner(false)}
        />
      )}
    </div>
  );
}

export default App;
