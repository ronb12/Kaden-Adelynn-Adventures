import React, { useState, useEffect, useRef } from 'react';

function App() {
  const [gameState, setGameState] = useState('menu');
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [level, setLevel] = useState(1);
  const [highScore, setHighScore] = useState(0);
  const [weaponType, setWeaponType] = useState('laser');
  const [shields, setShields] = useState(100);
  const [bossActive, setBossActive] = useState(false);
  
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
  const emojiTypes = ['🚀', '💎', '⭐', '🔥', '⚡', '🛡️', '💊', '🎯', '🌟', '💫'];

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

    // Touch controls for mobile
    const handleTouchMove = (e) => {
      e.preventDefault();
      const touchX = e.touches[0].clientX;
      const touchY = e.touches[0].clientY;
      
      const player = playerRef.current;
      const canvas = canvasRef.current;
      
      player.x = Math.max(0, Math.min(canvas.width - player.width, touchX - player.width / 2));
      player.y = Math.max(0, Math.min(canvas.height - player.height, touchY - player.height / 2));
    };
    
    const handleTouchEnd = () => {
      if (gameState === 'playing') {
        shoot();
      }
    };

    canvas.addEventListener('touchmove', handleTouchMove);
    canvas.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
    };
  }, [gameState]);

  // Game loop
  useEffect(() => {
    if (gameState !== 'playing') return;

    const gameLoop = (currentTime) => {
      if (gameState !== 'playing') return;
      
      const deltaTime = currentTime - lastTimeRef.current;
      lastTimeRef.current = currentTime;
      
      updateGame(deltaTime);
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

  const spawnCollectible = () => {
    const canvas = canvasRef.current;
    const now = Date.now();
    
    if (now - lastCollectibleSpawnRef.current < 3000) return;
    lastCollectibleSpawnRef.current = now;
    
    const emoji = emojiTypes[Math.floor(Math.random() * emojiTypes.length)];
    const type = emoji === '🚀' ? 'speed' : 
                 emoji === '💎' ? 'points' : 
                 emoji === '⭐' ? 'score' : 
                 emoji === '🔥' ? 'firepower' : 
                 emoji === '⚡' ? 'rapidfire' : 
                 emoji === '��️' ? 'shield' : 
                 emoji === '💊' ? 'health' : 
                 emoji === '🎯' ? 'homing' : 
                 emoji === '🌟' ? 'multiplier' : 'bonus';
    
    collectiblesRef.current.push({
      x: Math.random() * (canvas.width - 30),
      y: -30,
      width: 30,
      height: 30,
      speed: 2,
      emoji: emoji,
      type: type,
      value: Math.floor(Math.random() * 100) + 50
    });
  };

  const collectPowerUp = (collectible) => {
    switch (collectible.type) {
      case 'speed':
        playerRef.current.speed = Math.min(10, playerRef.current.speed + 1);
        break;
      case 'points':
        setScore(prev => prev + collectible.value);
        break;
      case 'score':
        setScore(prev => prev + collectible.value * 2);
        break;
      case 'shield':
        setShields(prev => Math.min(100, prev + 30));
        break;
      case 'health':
        setLives(prev => Math.min(5, prev + 1));
        break;
      default:
        setScore(prev => prev + collectible.value);
    }
    
    // Create collection effect
    for (let i = 0; i < 8; i++) {
      particlesRef.current.push({
        x: collectible.x + collectible.width / 2,
        y: collectible.y + collectible.height / 2,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        life: 25,
        color: '#ffd700'
      });
    }
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
    } else if (weaponType === 'missile') {
      if (now - lastShotRef.current < 800) return;
      lastShotRef.current = now;
      
      bulletsRef.current.push({
        x: player.x + player.width / 2 - 3,
        y: player.y,
        width: 6,
        height: 20,
        speed: 8,
        damage: 50,
        type: 'missile',
        color: '#ff6b6b'
      });
    } else if (weaponType === 'plasma') {
      if (now - lastShotRef.current < 300) return;
      lastShotRef.current = now;
      
      bulletsRef.current.push({
        x: player.x + player.width / 2 - 4,
        y: player.y,
        width: 8,
        height: 18,
        speed: 12,
        damage: 75,
        type: 'plasma',
        color: '#ff00ff'
      });
    }
  };

  const spawnAsteroid = () => {
    const canvas = canvasRef.current;
    const now = Date.now();
    
    if (now - lastAsteroidSpawnRef.current < 2000) return;
    lastAsteroidSpawnRef.current = now;
    
    const size = 20 + Math.random() * 40;
    asteroidsRef.current.push({
      x: Math.random() * (canvas.width - size),
      y: -size,
      width: size,
      height: size,
      speed: 1 + Math.random() * 3,
      rotation: 0,
      rotationSpeed: (Math.random() - 0.5) * 0.1,
      health: size / 10
    });
  };

  const updateGame = (deltaTime) => {
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
    if (Math.random() < 0.02 + (level * 0.003)) {
      const enemyType = Math.random() < 0.1 ? 'boss' : 'fighter';
      const enemy = {
        x: Math.random() * (canvas.width - 60),
        y: -60,
        width: enemyType === 'boss' ? 80 : 50,
        height: enemyType === 'boss' ? 60 : 40,
        speed: enemyType === 'boss' ? 1 : 2 + Math.random() * 2,
        health: enemyType === 'boss' ? 200 : 50 + Math.floor(level / 2),
        type: enemyType,
        lastShot: 0,
        shotInterval: enemyType === 'boss' ? 1000 : 2000 + Math.random() * 1000
      };
      
      enemiesRef.current.push(enemy);
      
      if (enemyType === 'boss') {
        setBossActive(true);
      }
    }

    // Update enemies
    enemiesRef.current = enemiesRef.current
      .map(enemy => ({ ...enemy, y: enemy.y + enemy.speed }))
      .filter(enemy => enemy.y < canvas.height);

    // Enemy shooting
    enemiesRef.current.forEach(enemy => {
      const now = Date.now();
      if (now - enemy.lastShot > enemy.shotInterval) {
        enemy.lastShot = now;
        
        bulletsRef.current.push({
          x: enemy.x + enemy.width / 2 - 2,
          y: enemy.y + enemy.height,
          width: 4,
          height: 10,
          speed: -5,
          damage: 20,
          type: 'enemy',
          color: '#ff0000'
        });
      }
    });

    // Spawn asteroids
    spawnAsteroid();

    // Update asteroids
    asteroidsRef.current = asteroidsRef.current
      .map(asteroid => ({
        ...asteroid,
        y: asteroid.y + asteroid.speed,
        rotation: asteroid.rotation + asteroid.rotationSpeed
      }))
      .filter(asteroid => asteroid.y < canvas.height);

    // Spawn collectibles
    spawnCollectible();

    // Update collectibles
    collectiblesRef.current.forEach((collectible, index) => {
      collectible.y += collectible.speed;
      
      // Check if player collected it
      if (isColliding(collectible, player)) {
        collectPowerUp(collectible);
        collectiblesRef.current.splice(index, 1);
      }
    });

    // Remove collectibles that went off screen
    collectiblesRef.current = collectiblesRef.current.filter(collectible => collectible.y < canvas.height);

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
    
    // Check level progression
    if (score > level * 1500) {
      setLevel(prev => prev + 1);
      setLives(prev => Math.min(prev + 1, 5));
    }
  };

  const checkCollisions = () => {
    const player = playerRef.current;
    
    // Player bullets vs enemies
    bulletsRef.current.forEach((bullet, bulletIndex) => {
      if (bullet.type === 'enemy') return;
      
      enemiesRef.current.forEach((enemy, enemyIndex) => {
        if (isColliding(bullet, enemy)) {
          bulletsRef.current.splice(bulletIndex, 1);
          enemy.health -= bullet.damage;
          
          if (enemy.health <= 0) {
            enemiesRef.current.splice(enemyIndex, 1);
            setScore(prev => prev + (enemy.type === 'boss' ? 500 : 100));
            
            if (enemy.type === 'boss') {
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

    // Player bullets vs asteroids
    bulletsRef.current.forEach((bullet, bulletIndex) => {
      if (bullet.type === 'enemy') return;
      
      asteroidsRef.current.forEach((asteroid, asteroidIndex) => {
        if (isColliding(bullet, asteroid)) {
          bulletsRef.current.splice(bulletIndex, 1);
          asteroid.health -= bullet.damage;
          
          if (asteroid.health <= 0) {
            asteroidsRef.current.splice(asteroidIndex, 1);
            setScore(prev => prev + 50);
            
            // Create asteroid explosion particles
            for (let i = 0; i < 10; i++) {
              particlesRef.current.push({
                x: asteroid.x + asteroid.width / 2,
                y: asteroid.y + asteroid.height / 2,
                vx: (Math.random() - 0.5) * 6,
                vy: (Math.random() - 0.5) * 6,
                life: 35,
                color: '#8b4513'
              });
            }
          }
        }
      });
    });

    // Enemy bullets vs player
    bulletsRef.current.forEach(bullet => {
      if (bullet.type === 'enemy' && isColliding(bullet, player)) {
        if (shields > 0) {
          setShields(prev => Math.max(0, prev - bullet.damage));
        } else {
          setLives(prev => prev - 1);
        }
        
        // Create player hit particles
        for (let i = 0; i < 8; i++) {
          particlesRef.current.push({
            x: player.x + player.width / 2,
            y: player.y + player.height / 2,
            vx: (Math.random() - 0.5) * 4,
            vy: (Math.random() - 0.5) * 4,
            life: 30,
            color: '#4ecdc4'
          });
        }
        
        if (lives <= 1) {
          gameOver();
        }
      }
    });

    // Enemies vs player
    enemiesRef.current.forEach(enemy => {
      if (isColliding(enemy, player)) {
        if (shields > 0) {
          setShields(prev => Math.max(0, prev - 30));
        } else {
          setLives(prev => prev - 1);
        }
        
        if (lives <= 1) {
          gameOver();
        }
      }
    });

    // Asteroids vs player
    asteroidsRef.current.forEach(asteroid => {
      if (isColliding(asteroid, player)) {
        if (shields > 0) {
          setShields(prev => Math.max(0, prev - 20));
        } else {
          setLives(prev => prev - 1);
        }
        
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

  const drawJetFighter = (ctx, x, y, width, height, isPlayer = true) => {
    const centerX = x + width / 2;
    const centerY = y + height / 2;
    
    ctx.save();
    ctx.translate(centerX, centerY);
    
    if (isPlayer) {
      // Player jet fighter - F-22 Raptor style
      ctx.fillStyle = '#4ecdc4';
      
      // Main body
      ctx.fillRect(-width/2, -height/2 + 5, width, height - 10);
      
      // Nose cone
      ctx.fillStyle = '#2c3e50';
      ctx.fillRect(-width/2, -height/2, width/3, height/2);
      
      // Cockpit
      ctx.fillStyle = '#3498db';
      ctx.fillRect(-width/2 + 8, -height/2 + 8, width/2, height/3);
      
      // Wings
      ctx.fillStyle = '#e74c3c';
      ctx.fillRect(-width/2 - 8, -height/2 + 15, 12, height/2);
      ctx.fillRect(width/2 - 4, -height/2 + 15, 12, height/2);
      
      // Tail fins
      ctx.fillStyle = '#e74c3c';
      ctx.fillRect(-width/2 + 5, height/2 - 8, 8, 12);
      ctx.fillRect(width/2 - 13, height/2 - 8, 8, 12);
      
      // Engine exhaust
      ctx.fillStyle = '#f39c12';
      ctx.fillRect(-width/2 + 15, height/2, 30, 8);
      
      // Engine glow effect
      ctx.shadowColor = '#f39c12';
      ctx.shadowBlur = 15;
      ctx.fillRect(-width/2 + 15, height/2, 30, 8);
      ctx.shadowBlur = 0;
      
    } else {
      // Enemy jet fighter - MiG-29 style
      ctx.fillStyle = '#e74c3c';
      
      // Main body
      ctx.fillRect(-width/2, -height/2 + 5, width, height - 10);
      
      // Nose cone
      ctx.fillStyle = '#c0392b';
      ctx.fillRect(-width/2, -height/2, width/3, height/2);
      
      // Cockpit
      ctx.fillStyle = '#8e44ad';
      ctx.fillRect(-width/2 + 8, -height/2 + 8, width/2, height/3);
      
      // Wings
      ctx.fillStyle = '#c0392b';
      ctx.fillRect(-width/2 - 6, -height/2 + 12, 10, height/2);
      ctx.fillRect(width/2 - 4, -height/2 + 12, 10, height/2);
      
      // Tail fins
      ctx.fillStyle = '#c0392b';
      ctx.fillRect(-width/2 + 3, height/2 - 6, 6, 10);
      ctx.fillRect(width/2 - 9, height/2 - 6, 6, 10);
      
      // Engine exhaust
      ctx.fillStyle = '#ff6b6b';
      ctx.fillRect(-width/2 + 10, height/2, 20, 6);
    }
    
    ctx.restore();
  };

  const drawAsteroid = (ctx, asteroid) => {
    ctx.save();
    ctx.translate(asteroid.x + asteroid.width / 2, asteroid.y + asteroid.height / 2);
    ctx.rotate(asteroid.rotation);
    
    ctx.fillStyle = '#8b4513';
    ctx.fillRect(-asteroid.width / 2, -asteroid.height / 2, asteroid.width, asteroid.height);
    
    // Asteroid texture
    ctx.fillStyle = '#654321';
    for (let i = 0; i < 5; i++) {
      const x = (Math.random() - 0.5) * asteroid.width;
      const y = (Math.random() - 0.5) * asteroid.height;
      ctx.fillRect(x, y, 3, 3);
    }
    
    ctx.restore();
  };

  const drawCollectible = (ctx, collectible) => {
    ctx.save();
    ctx.font = '24px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Add glow effect
    ctx.shadowColor = '#ffd700';
    ctx.shadowBlur = 10;
    ctx.fillText(collectible.emoji, collectible.x + collectible.width / 2, collectible.y + collectible.height / 2);
    ctx.shadowBlur = 0;
    
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

    // Draw player
    drawJetFighter(ctx, playerRef.current.x, playerRef.current.y, 
                   playerRef.current.width, playerRef.current.height, true);

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

    // Draw enemies
    enemiesRef.current.forEach(enemy => {
      drawJetFighter(ctx, enemy.x, enemy.y, enemy.width, enemy.height, false);
    });

    // Draw asteroids
    asteroidsRef.current.forEach(asteroid => {
      drawAsteroid(ctx, asteroid);
    });

    // Draw collectibles
    collectiblesRef.current.forEach(collectible => {
      drawCollectible(ctx, collectible);
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
    asteroidsRef.current = [];
    particlesRef.current = [];
    collectiblesRef.current = [];
    
    const canvas = canvasRef.current;
    if (canvas) {
      playerRef.current.x = canvas.width / 2 - playerRef.current.width / 2;
      playerRef.current.y = canvas.height - 100;
    }
  };

  const gameOver = () => {
    setGameState('gameOver');
    if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current);
    }
    
    if (score > highScore) {
      setHighScore(score);
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
        {/* Animated background stars */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none'
        }}>
          {[...Array(80)].map((_, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: `${(i * 15) % 100}%`,
                top: `${(i * 12) % 100}%`,
                width: '2px',
                height: '2px',
                background: 'white',
                animation: `twinkle ${2 + i % 3}s infinite`
              }}
            />
          ))}
        </div>

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
          Epic Jet Fighter Combat - Defend the Galaxy!
        </p>
        
        {highScore > 0 && (
          <p style={{ 
            fontSize: '1.2rem', 
            marginBottom: '2rem', 
            color: '#4ecdc4',
            textAlign: 'center'
          }}>
            🏆 High Score: {highScore}
          </p>
        )}
        
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
          
          <div style={{ 
            fontSize: '0.9rem', 
            marginTop: '1rem', 
            textAlign: 'center',
            opacity: 0.7
          }}>
            <div>🎮 WASD/Arrows to move, Space to shoot</div>
            <div>🔫 1=Laser, 2=Missile, 3=Plasma</div>
            <div>💎 Collect emojis for power-ups!</div>
          </div>
        </div>

        <style>{`
          @keyframes twinkle {
            0%, 100% { opacity: 0.3; }
            50% { opacity: 1; }
          }
          @keyframes glow {
            0% { text-shadow: 0 0 20px rgba(78, 205, 196, 0.8); }
            100% { text-shadow: 0 0 30px rgba(78, 205, 196, 1), 0 0 40px rgba(78, 205, 196, 0.6); }
          }
        `}</style>
      </div>
    );
  }

  // Game Over Screen
  if (gameState === 'gameOver') {
    return (
      <div style={{
        width: '100vw',
        height: '100vh',
        background: 'rgba(0, 0, 0, 0.9)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        color: 'white'
      }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '2rem', color: '#ff6b6b' }}>
          Mission Failed
        </h1>
        
        <div style={{ fontSize: '2rem', marginBottom: '1rem', color: '#4ecdc4' }}>
          Final Score: {score}
        </div>
        
        {score > highScore && (
          <div style={{ fontSize: '1.5rem', marginBottom: '2rem', color: '#ffd700' }}>
            🎉 New High Score! 🎉
          </div>
        )}
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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
          
          <button
            onClick={startGame}
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
            🔄 Try Again
          </button>
        </div>
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
          zIndex: 10,
          backdropFilter: 'blur(10px)'
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
            color: 'white',
            backdropFilter: 'blur(20px)'
          }}>
            <h1 style={{ fontSize: '2rem', marginBottom: '2rem', color: '#4ecdc4' }}>
              ⏸️ Mission Paused
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
                ▶️ Resume Mission
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
