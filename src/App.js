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
  const [isPaused, setIsPaused] = useState(false);
  const [customShipDesign, setCustomShipDesign] = useState(null);
  const [rapidFireActive, setRapidFireActive] = useState(false);
  const [rapidFireTimer, setRapidFireTimer] = useState(0);
  const [activePowerUps, setActivePowerUps] = useState([]);
  const [comboCount, setComboCount] = useState(0);
  const [comboTimer, setComboTimer] = useState(0);
  const [ultimateCharge, setUltimateCharge] = useState(0);
  
  const canvasRef = useRef(null);
  const gameLoopRef = useRef(null);
  const audioContextRef = useRef(null);
  const lastShotTimeRef = useRef(0);
  
  // Game objects
  const playerRef = useRef({ x: 0, y: 0, width: 60, height: 45, speed: 6, health: 100 });
  const bulletsRef = useRef([]);
  const enemiesRef = useRef([]);
  const particlesRef = useRef([]);
  const collectiblesRef = useRef([]);
  const keysRef = useRef({});

  // Enhanced emoji collectibles with effects
  const emojiCollectibles = [
    { emoji: '🚀', effect: 'speed', value: 100, color: '#4ecdc4', description: 'Speed Boost', duration: 10000 },
    { emoji: '💎', effect: 'score', value: 200, color: '#9b59b6', description: 'Bonus Points', duration: 0 },
    { emoji: '⭐', effect: 'shield', value: 50, color: '#f1c40f', description: 'Shield Repair', duration: 0 },
    { emoji: '🔥', effect: 'firepower', value: 150, color: '#e74c3c', description: 'Firepower Up', duration: 15000 },
    { emoji: '⚡', effect: 'rapid', value: 120, color: '#f39c12', description: 'Rapid Fire 4x', duration: 12000 },
    { emoji: '🛡️', effect: 'invincible', value: 300, color: '#3498db', description: 'Invincibility', duration: 8000 },
    { emoji: '💊', effect: 'health', value: 80, color: '#2ecc71', description: 'Health Pack', duration: 0 },
    { emoji: '🎯', effect: 'accuracy', value: 90, color: '#e67e22', description: 'Accuracy Boost', duration: 10000 },
    { emoji: '🌟', effect: 'multishot', value: 250, color: '#ff6b6b', description: 'Multi Shot', duration: 10000 },
    { emoji: '💫', effect: 'time', value: 180, color: '#1abc9c', description: 'Time Slow', duration: 8000 },
    { emoji: '🎪', effect: 'bomb', value: 400, color: '#8e44ad', description: 'Screen Clear', duration: 0 },
    { emoji: '🎭', effect: 'stealth', value: 220, color: '#34495e', description: 'Stealth Mode', duration: 6000 },
    { emoji: '🎨', effect: 'rainbow', value: 350, color: '#e91e63', description: 'Rainbow Mode', duration: 12000 },
    { emoji: '🎪', effect: 'shield', value: 75, color: '#00bcd4', description: 'Mega Shield', duration: 0 },
    { emoji: '🎯', effect: 'homing', value: 280, color: '#ff9800', description: 'Homing Missiles', duration: 15000 }
  ];

  // Default ship designs
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

  // Initialize audio context
  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

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
      if (e.code === 'KeyP') togglePause();
      if (e.code === 'Escape') togglePause();
      if (e.code === 'KeyU') {
        if (ultimateCharge >= 100) {
          activateUltimate();
        }
      }
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
  }, [gameState, ultimateCharge]);

  // Game loop
  useEffect(() => {
    if (gameState !== 'playing' || isPaused) return;

    const gameLoop = (currentTime) => {
      if (gameState !== 'playing' || isPaused) return;
      
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
  }, [gameState, isPaused]);

  const togglePause = () => {
    if (gameState === 'playing') {
      setIsPaused(!isPaused);
    }
  };

  // Sound effects
  const playSound = (frequency, duration, type = 'sine') => {
    if (!audioContextRef.current) return;
    
    const oscillator = audioContextRef.current.createOscillator();
    const gainNode = audioContextRef.current.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContextRef.current.destination);
    
    oscillator.frequency.setValueAtTime(frequency, audioContextRef.current.currentTime);
    oscillator.type = type;
    
    gainNode.gain.setValueAtTime(0.1, audioContextRef.current.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + duration);
    
    oscillator.start(audioContextRef.current.currentTime);
    oscillator.stop(audioContextRef.current.currentTime + duration);
  };

  const playMissileSound = () => {
    playSound(200, 0.1, 'square');
    setTimeout(() => playSound(150, 0.1, 'square'), 50);
    setTimeout(() => playSound(100, 0.1, 'square'), 100);
  };

  const playExplosionSound = () => {
    playSound(80, 0.3, 'sawtooth');
    setTimeout(() => playSound(60, 0.2, 'sawtooth'), 100);
    setTimeout(() => playSound(40, 0.1, 'sawtooth'), 200);
  };

  const updateGame = () => {
    const canvas = canvasRef.current;
    const player = playerRef.current;
    
    // Update rapid fire timer
    if (rapidFireActive) {
      setRapidFireTimer(prev => {
        if (prev <= 0) {
          setRapidFireActive(false);
          return 0;
        }
        return prev - 16; // 60 FPS
      });
    }
    
    // Update combo timer
    if (comboTimer > 0) {
      setComboTimer(prev => prev - 16);
      if (comboTimer <= 0) {
        setComboCount(0);
      }
    }
    
    // Update power-up timers
    setActivePowerUps(prev => prev.filter(powerUp => {
      if (powerUp.duration > 0) {
        powerUp.duration -= 16;
        return powerUp.duration > 0;
      }
      return true;
    }));
    
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

    // Spawn enemies with progressive difficulty
    const spawnRate = 0.02 + (level * 0.005);
    if (Math.random() < spawnRate) {
      const enemyType = Math.random() < (0.15 + level * 0.02) ? 'enemyBomber' : 'enemyFighter';
      const enemy = {
        x: Math.random() * (canvas.width - 60),
        y: -60,
        width: 60,
        height: 50,
        speed: (2 + Math.random() * 2) + (level * 0.3),
        health: enemyType === 'enemyBomber' ? (150 + level * 20) : (100 + level * 15),
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

    // Spawn collectibles
    if (Math.random() < 0.015) {
      const collectible = emojiCollectibles[Math.floor(Math.random() * emojiCollectibles.length)];
      collectiblesRef.current.push({
        x: Math.random() * (canvas.width - 30),
        y: -30,
        width: 30,
        height: 30,
        speed: 2,
        ...collectible
      });
    }

    // Update collectibles
    collectiblesRef.current.forEach((collectible, index) => {
      collectible.y += collectible.speed;
      
      // Check if player collected it
      if (isColliding(collectible, player)) {
        applyCollectibleEffect(collectible);
        collectiblesRef.current.splice(index, 1);
        
        // Create collection effect
        for (let i = 0; i < 12; i++) {
          particlesRef.current.push({
            x: collectible.x + collectible.width / 2,
            y: collectible.y + collectible.height / 2,
            vx: (Math.random() - 0.5) * 8,
            vy: (Math.random() - 0.5) * 8,
            life: 30,
            color: collectible.color,
            size: Math.random() * 4 + 2
          });
        }
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

  const applyCollectibleEffect = (collectible) => {
    setScore(prev => prev + collectible.value);
    
    switch (collectible.effect) {
      case 'speed':
        playerRef.current.speed = Math.min(12, playerRef.current.speed + 1);
        addPowerUp('Speed Boost', collectible.duration);
        setTimeout(() => {
          playerRef.current.speed = Math.max(6, playerRef.current.speed - 1);
        }, collectible.duration);
        break;
      case 'shield':
        setShields(prev => Math.min(100, prev + collectible.value));
        break;
      case 'health':
        setLives(prev => Math.min(5, prev + 1));
        break;
      case 'rapid':
        setRapidFireActive(true);
        setRapidFireTimer(collectible.duration);
        addPowerUp('Rapid Fire 4x', collectible.duration);
        break;
      case 'firepower':
        addPowerUp('Firepower Up', collectible.duration);
        break;
      case 'bomb':
        enemiesRef.current = [];
        setBossActive(false);
        break;
      case 'rainbow':
        addPowerUp('Rainbow Mode', collectible.duration);
        break;
      default:
        break;
    }
  };

  const addPowerUp = (name, duration) => {
    setActivePowerUps(prev => [...prev, { name, duration, startTime: Date.now() }]);
  };

  const activateUltimate = () => {
    if (ultimateCharge >= 100) {
      // Screen clear ultimate
      enemiesRef.current = [];
      setBossActive(false);
      setUltimateCharge(0);
      
      // Create ultimate effect particles
      for (let i = 0; i < 50; i++) {
        particlesRef.current.push({
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          vx: (Math.random() - 0.5) * 15,
          vy: (Math.random() - 0.5) * 15,
          life: 80,
          color: `hsl(${Math.random() * 360}, 100%, 50%)`,
          size: Math.random() * 8 + 4
        });
      }
    }
  };

  const shoot = () => {
    const now = Date.now();
    const player = playerRef.current;
    
    // Base fire rate
    let fireRate = 150;
    if (weaponType === 'missile') fireRate = 800;
    if (weaponType === 'plasma') fireRate = 300;
    
    // Rapid fire 4x effect - FIXED
    if (rapidFireActive) {
      fireRate = Math.floor(fireRate / 4);
    }
    
    if (now - lastShotTimeRef.current < fireRate) return;
    lastShotTimeRef.current = now;
    
    if (weaponType === 'laser') {
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
      playMissileSound();
      
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

  const checkCollisions = () => {
    const player = playerRef.current;
    
    // Player bullets vs enemies
    bulletsRef.current.forEach((bullet, bulletIndex) => {
      enemiesRef.current.forEach((enemy, enemyIndex) => {
        if (isColliding(bullet, enemy)) {
          bulletsRef.current.splice(bulletIndex, 1);
          enemy.health -= bullet.damage;
          
          // Increase combo
          setComboCount(prev => prev + 1);
          setComboTimer(2000); // 2 seconds to maintain combo
          
          // Increase ultimate charge
          setUltimateCharge(prev => Math.min(100, prev + 2));
          
          if (enemy.health <= 0) {
            enemiesRef.current.splice(enemyIndex, 1);
            setScore(prev => prev + (enemy.isBoss ? 500 : 100));
            
            if (enemy.isBoss) {
              setBossActive(false);
            }
            
            playExplosionSound();
            
            // Create explosion particles
            for (let i = 0; i < 20; i++) {
              particlesRef.current.push({
                x: enemy.x + enemy.width / 2,
                y: enemy.y + enemy.height / 2,
                vx: (Math.random() - 0.5) * 10,
                vy: (Math.random() - 0.5) * 10,
                life: 50,
                color: `hsl(${Math.random() * 60 + 15}, 100%, 50%)`,
                size: Math.random() * 6 + 3
              });
            }
          }
        }
      });
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
      ctx.globalAlpha = particle.life / 50;
      ctx.fillRect(particle.x, particle.y, particle.size || 4, particle.size || 4);
    });
    ctx.globalAlpha = 1;

    // Draw player using custom or default ship design
    const playerShip = customShipDesign || defaultShips.player;
    drawShipFromDesign(ctx, playerShip, playerRef.current.x, playerRef.current.y);

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

    // Draw collectibles
    collectiblesRef.current.forEach(collectible => {
      ctx.save();
      ctx.font = '24px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Add glow effect
      ctx.shadowColor = collectible.color;
      ctx.shadowBlur = 15;
      ctx.fillText(collectible.emoji, collectible.x + collectible.width / 2, collectible.y + collectible.height / 2);
      ctx.shadowBlur = 0;
      
      // Draw description
      ctx.font = '10px Arial';
      ctx.fillStyle = collectible.color;
      ctx.fillText(collectible.description, collectible.x + collectible.width / 2, collectible.y + collectible.height + 15);
      
      ctx.restore();
    });

    // Draw rapid fire indicator
    if (rapidFireActive) {
      ctx.save();
      ctx.fillStyle = '#f39c12';
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(`⚡ RAPID FIRE 4x - ${Math.ceil(rapidFireTimer / 1000)}s`, canvas.width / 2, 80);
      ctx.restore();
    }

    // Draw combo counter
    if (comboCount > 1) {
      ctx.save();
      ctx.fillStyle = '#ffd700';
      ctx.font = '18px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(`🔥 COMBO x${comboCount}`, canvas.width / 2, 110);
      ctx.restore();
    }
  };

  const startGame = () => {
    setGameState('playing');
    setIsPaused(false);
    setScore(0);
    setLives(3);
    setLevel(1);
    setShields(100);
    setBossActive(false);
    setRapidFireActive(false);
    setRapidFireTimer(0);
    setActivePowerUps([]);
    setComboCount(0);
    setComboTimer(0);
    setUltimateCharge(0);
    bulletsRef.current = [];
    enemiesRef.current = [];
    particlesRef.current = [];
    collectiblesRef.current = [];
    lastShotTimeRef.current = 0;
    
    const canvas = canvasRef.current;
    if (canvas) {
      playerRef.current.x = canvas.width / 2 - playerRef.current.width / 2;
      playerRef.current.y = canvas.height - 100;
    }
  };

  const gameOver = () => {
    setGameState('gameOver');
    setIsPaused(false);
    if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current);
    }
    
    if (score > highScore) {
      setHighScore(score);
    }
  };

  const handleSaveShip = (shipData) => {
    console.log('Saved ship:', shipData);
    setCustomShipDesign(shipData);
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
            <div>⏸️ P/Escape to pause</div>
            <div>💎 Collect emojis for power-ups!</div>
            <div>⚡ Rapid Fire 4x power-up available</div>
            <div>🔥 U key for Ultimate (when charged)</div>
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
        <div style={{ marginTop: '10px', fontSize: '0.9rem', opacity: 0.8 }}>
          <div>🔥 Combo: x{comboCount}</div>
          <div>⚡ Ultimate: {Math.floor(ultimateCharge)}%</div>
        </div>
      </div>

      {/* Power-up Bar */}
      {activePowerUps.length > 0 && (
        <div style={{
          position: 'absolute',
          top: '20px',
          right: '120px',
          background: 'rgba(0, 0, 0, 0.7)',
          padding: '10px',
          borderRadius: '10px',
          zIndex: 10,
          maxWidth: '200px'
        }}>
          <div style={{ color: 'white', fontSize: '0.8rem', marginBottom: '5px' }}>Active Power-ups:</div>
          {activePowerUps.map((powerUp, index) => (
            <div key={index} style={{ 
              color: '#4ecdc4', 
              fontSize: '0.7rem',
              marginBottom: '2px'
            }}>
              {powerUp.name} - {Math.ceil(powerUp.duration / 1000)}s
            </div>
          ))}
        </div>
      )}

      {/* Pause/Resume Button */}
      <button
        onClick={togglePause}
        style={{
          position: 'absolute',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: isPaused ? 'rgba(46, 204, 113, 0.8)' : 'rgba(255, 193, 7, 0.8)',
          border: '2px solid rgba(255, 255, 255, 0.3)',
          borderRadius: '50px',
          color: 'white',
          fontSize: '1rem',
          fontWeight: 'bold',
          padding: '0.5rem 1rem',
          cursor: 'pointer',
          zIndex: 10,
          backdropFilter: 'blur(10px)',
          minWidth: '120px'
        }}
      >
        {isPaused ? '▶️ Resume' : '⏸️ Pause'}
      </button>

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

      {/* Pause Overlay */}
      {isPaused && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 15
        }}>
          <div style={{
            background: 'rgba(0, 0, 0, 0.9)',
            padding: '2rem',
            borderRadius: '20px',
            textAlign: 'center',
            color: 'white',
            border: '2px solid rgba(255, 255, 255, 0.3)'
          }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏸️ Game Paused</h2>
            <p style={{ marginBottom: '1rem' }}>Press P or Escape to resume</p>
            <button
              onClick={togglePause}
              style={{
                background: 'linear-gradient(45deg, #2ecc71 0%, #27ae60 100%)',
                border: 'none',
                borderRadius: '25px',
                color: 'white',
                fontSize: '1rem',
                fontWeight: 'bold',
                padding: '0.5rem 1rem',
                cursor: 'pointer',
                minWidth: '100px'
              }}
            >
              ▶️ Resume
            </button>
          </div>
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
