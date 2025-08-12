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
  const particlesRef = useRef([]);
  const collectiblesRef = useRef([]);
  const keysRef = useRef({});
  const lastShotRef = useRef(0);

  // Default triangle ship designs
  const defaultShips = {
    player: {
      name: 'Fighter Jet',
      shapes: [
        { type: 'triangle', x: 30, y: 22.5, width: 60, height: 45, color: '#4ecdc4', rotation: 0 },
        { type: 'triangle', x: 30, y: 33.75, width: 30, height: 22.5, color: '#3498db', rotation: 0 },
        { type: 'triangle', x: 30, y: 45, width: 20, height: 15, color: '#f39c12', rotation: 0 }
      ]
    },
    enemyFighter: {
      name: 'Enemy Fighter',
      shapes: [
        { type: 'triangle', x: 25, y: 20, width: 50, height: 40, color: '#e74c3c', rotation: 180 },
        { type: 'triangle', x: 25, y: 30, width: 25, height: 20, color: '#8e44ad', rotation: 180 },
        { type: 'triangle', x: 25, y: 40, width: 15, height: 12, color: '#ff6b6b', rotation: 180 }
      ]
    },
    enemyBomber: {
      name: 'Enemy Bomber',
      shapes: [
        { type: 'triangle', x: 40, y: 30, width: 80, height: 60, color: '#8e44ad', rotation: 180 },
        { type: 'triangle', x: 40, y: 45, width: 40, height: 30, color: '#9b59b6', rotation: 180 },
        { type: 'triangle', x: 40, y: 60, width: 25, height: 20, color: '#e67e22', rotation: 180 }
      ]
    }
  };

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
      
      updateGame();
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

  const updateGame = () => {
    const canvas = canvasRef.current;
    const player = playerRef.current;
    
    // Update player position
    if (keysRef.current['ArrowLeft'] || keysRef.current['KeyA']) {
      player.x = Math.max(0, player.x - player.speed);
    }
    if (keysRef.current['ArrowRight'] || keysRef.current['KeyD']) {
      player.x = Math.min(canvas.width - player.width, player.x + player.speed);
    }
    if (keysRef.current['ArrowUp'] || keysRef.current['KeyW']) {
      player.y = Math.max(0, player.y - player.speed);
    }
    if (keysRef.current['ArrowDown'] || keysRef.current['KeyS']) {
      player.y = Math.min(canvas.height - player.height, player.y + player.speed);
    }

    // Auto-shoot with spacebar
    if (keysRef.current['Space']) {
      shoot();
    }

    // Update bullets
    bulletsRef.current = bulletsRef.current
      .map(bullet => ({ ...bullet, y: bullet.y - bullet.speed }))
      .filter(bullet => bullet.y > -bullet.height);

    // Spawn enemies
    if (Math.random() < 0.02) {
      const enemyType = Math.random() < 0.2 ? 'enemyBomber' : 'enemyFighter';
      const enemy = {
        x: Math.random() * (canvas.width - 60),
        y: -60,
        width: 60,
        height: 50,
        speed: 2 + Math.random() * 2,
        health: enemyType === 'enemyBomber' ? 150 : 100,
        type: enemyType,
        isBoss: enemyType === 'enemyBomber'
      };
      
      enemiesRef.current.push(enemy);
      
      if (enemyType === 'enemyBomber') {
        setBossActive(true);
      }
    }

    // Update enemies
    enemiesRef.current = enemiesRef.current
      .map(enemy => ({ ...enemy, y: enemy.y + enemy.speed }))
      .filter(enemy => enemy.y < canvas.height);

    // Update particles
    particlesRef.current = particlesRef.current
      .map(particle => ({
        ...particle,
        x: particle.x + particle.vx,
        y: particle.y + particle.vy,
        life: particle.life - 1
      }))
      .filter(particle => particle.life > 0);

    // Check collisions
    checkCollisions();
  };

  const shoot = () => {
    const now = Date.now();
    const player = playerRef.current;
    
    if (weaponType === 'laser') {
      if (now - lastShotRef.current < 150) return;
      lastShotRef.current = now;
      
      bulletsRef.current.push({
        x: player.x + player.width / 2 - 2,
        y: player.y,
        width: 4,
        height: 15,
        speed: 10,
        damage: 25,
        type: 'laser',
        color: '#00ffff'
      });
    }
  };

  const checkCollisions = () => {
    const player = playerRef.current;
    
    // Player bullets vs enemies
    bulletsRef.current.forEach((bullet, bulletIndex) => {
      enemiesRef.current.forEach((enemy, enemyIndex) => {
        if (isColliding(bullet, enemy)) {
          bulletsRef.current.splice(bulletIndex, 1);
          enemy.health -= bullet.damage;
          
          if (enemy.health <= 0) {
            enemiesRef.current.splice(enemyIndex, 1);
            setScore(prev => prev + (enemy.isBoss ? 500 : 100));
            
            if (enemy.isBoss) {
              setBossActive(false);
            }
            
            // Create explosion particles
            for (let i = 0; i < 15; i++) {
              particlesRef.current.push({
                x: enemy.x + enemy.width / 2,
                y: enemy.y + enemy.height / 2,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8,
                life: 40,
                color: `hsl(${Math.random() * 60 + 15}, 100%, 50%)`
              });
            }
          }
        }
      });
    });
  };

  const isColliding = (rect1, rect2) => {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
  };

  const drawShipFromDesign = (ctx, shipDesign, x, y, scale = 1) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    
    shipDesign.shapes.forEach(shape => {
      if (shape.type === 'triangle') {
        ctx.save();
        ctx.translate(shape.x, shape.y);
        ctx.rotate((shape.rotation * Math.PI) / 180);
        
        ctx.beginPath();
        ctx.moveTo(0, -shape.height / 2);
        ctx.lineTo(-shape.width / 2, shape.height / 2);
        ctx.lineTo(shape.width / 2, shape.height / 2);
        ctx.closePath();
        
        ctx.fillStyle = shape.color;
        ctx.fill();
        
        ctx.restore();
      }
    });
    
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

    // Draw particles
    particlesRef.current.forEach(particle => {
      ctx.fillStyle = particle.color;
      ctx.globalAlpha = particle.life / 40;
      ctx.fillRect(particle.x, particle.y, 4, 4);
    });
    ctx.globalAlpha = 1;

    // Draw player using default ship design
    drawShipFromDesign(ctx, defaultShips.player, playerRef.current.x, playerRef.current.y);

    // Draw bullets
    bulletsRef.current.forEach(bullet => {
      ctx.fillStyle = bullet.color;
      ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
      
      // Bullet glow effect
      ctx.shadowColor = bullet.color;
      ctx.shadowBlur = 5;
      ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
      ctx.shadowBlur = 0;
    });

    // Draw enemies using default ship designs
    enemiesRef.current.forEach(enemy => {
      let shipDesign;
      if (enemy.type === 'enemyBomber') {
        shipDesign = defaultShips.enemyBomber;
      } else {
        shipDesign = defaultShips.enemyFighter;
      }
      
      const scale = enemy.isBoss ? 1.5 : 1;
      drawShipFromDesign(ctx, shipDesign, enemy.x, enemy.y, scale);
    });
  };

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setLives(3);
    setLevel(1);
    setShields(100);
    setBossActive(false);
    bulletsRef.current = [];
    enemiesRef.current = [];
    particlesRef.current = [];
    
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
            🎨 Design Spaceship
          </button>
          
          <div style={{ 
            fontSize: '0.9rem', 
            marginTop: '1rem', 
            textAlign: 'center',
            opacity: 0.7
          }}>
            <div>🎮 WASD/Arrows to move, Space to shoot</div>
            <div>🔫 1=Laser, 2=Missile, 3=Plasma</div>
            <div>🔺 Triangle-based jet fighter designs</div>
          </div>
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

      {/* Boss Warning */}
      {bossActive && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: '#ff0000',
          fontSize: '2rem',
          fontWeight: 'bold',
          textShadow: '0 0 20px #ff0000',
          zIndex: 20,
          animation: 'bossWarning 1s ease-in-out infinite alternate'
        }}>
          ⚠️ BOSS INCOMING! ⚠️
        </div>
      )}

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

      <style>{`
        @keyframes bossWarning {
          0% { opacity: 0.5; transform: translate(-50%, -50%) scale(1); }
          100% { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
        }
      `}</style>
    </div>
  );
}

export default App;
