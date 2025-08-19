import React, { useState, useEffect, useRef } from 'react';

const VerticalShooter = () => {
  const [gameState, setGameState] = useState('menu');
  const [player, setPlayer] = useState({ x: 400, y: 500, health: 100, power: 1, lives: 25 });
  const [bullets, setBullets] = useState([]);
  const [enemies, setEnemies] = useState([]);
  const [powerUps, setPowerUps] = useState([]);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [highScore, setHighScore] = useState(0);
  const [medals, setMedals] = useState({
    bronze: 0,
    silver: 0,
    gold: 0
  });
  const [scoreHistory, setScoreHistory] = useState([]);
  const [keys, setKeys] = useState({});
  const [rapidFire, setRapidFire] = useState(false);
  const [rapidFireTimer, setRapidFireTimer] = useState(0);
  const [asteroids, setAsteroids] = useState([]);
  const [gameTime, setGameTime] = useState(0);
  const [challenges, setChallenges] = useState([]);
  const [currentChallenge, setCurrentChallenge] = useState(null);
  const [touchControls, setTouchControls] = useState(false);
  const [touchStart, setTouchStart] = useState({ x: 0, y: 0 });
  const [invincible, setInvincible] = useState(false);
  const [gameStats, setGameStats] = useState({
    enemiesDestroyed: 0,
    powerUpsCollected: 0,
    shotsFired: 0,
    accuracy: 0,
    asteroidsDestroyed: 0,
    challengesCompleted: 0,
    combo: 0,
    maxCombo: 0,
    streak: 0,
    maxStreak: 0
  });
  
  const canvasRef = useRef(null);
  const animationRef = useRef(0);
  const lastShotRef = useRef(0);
  const enemyShotTimerRef = useRef(0);
  const rapidFireIntervalRef = useRef(null);
  const playerRef = useRef({ x: 400, y: 500, health: 100, power: 1, lives: 25 });

  const PLAYER_SPEED = 6;
  const BULLET_SPEED = 10;
  const ENEMY_SPEED = 3;
  const ENEMY_BULLET_SPEED = 4;
  const RAPID_FIRE_DELAY = 50; // Much faster firing when rapid fire is active
  
  // Dynamic difficulty and combo system
  const [difficulty, setDifficulty] = useState(1);
  const [comboMultiplier, setComboMultiplier] = useState(1);
  const [comboTimer, setComboTimer] = useState(0);
  const [screenShake, setScreenShake] = useState(0);
  const [particles, setParticles] = useState([]);
  const [boss, setBoss] = useState(null);
  const [bossHealth, setBossHealth] = useState(0);
  const [specialEvents, setSpecialEvents] = useState([]);

  useEffect(() => {
    const savedHighScore = localStorage.getItem('kadenAdelynnSpaceAdventuresHighScore');
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore));
    }
  }, []);

  // Touch controls for mobile devices
  useEffect(() => {
    const handleTouchStart = (e) => {
      if (gameState === 'playing') {
        const touch = e.touches[0];
        const rect = e.target.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        
        setTouchStart({ x, y });
        setTouchControls(true);
        
        // Shoot on touch
        shoot();
      }
    };

    const handleTouchMove = (e) => {
      if (gameState === 'playing' && touchControls) {
        e.preventDefault();
        const touch = e.touches[0];
        const rect = e.target.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        
        // Move player to touch position
        const newX = Math.max(25, Math.min(775, x));
        const newY = Math.max(25, Math.min(575, y));
        
        setPlayer(prev => ({ ...prev, x: newX, y: newY }));
        playerRef.current = { ...playerRef.current, x: newX, y: newY };
      }
    };

    const handleTouchEnd = () => {
      setTouchControls(false);
    };

    const canvas = canvasRef.current;
    if (canvas) {
      canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
      canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
      canvas.addEventListener('touchend', handleTouchEnd);
    }

    return () => {
      if (canvas) {
        canvas.removeEventListener('touchstart', handleTouchStart);
        canvas.removeEventListener('touchmove', handleTouchMove);
        canvas.removeEventListener('touchend', handleTouchEnd);
      }
    };
  }, [gameState, touchControls]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      setKeys(prev => ({ ...prev, [e.key.toLowerCase()]: true }));
      
      if (e.code === 'Space' && gameState === 'playing') {
        e.preventDefault();
        shoot();
      }
    };

    const handleKeyUp = (e) => {
      setKeys(prev => ({ ...prev, [e.key.toLowerCase()]: false }));
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState]);

  // Rapid fire effect
  useEffect(() => {
    if (rapidFire && gameState === 'playing') {
      rapidFireIntervalRef.current = setInterval(() => {
        // Use a ref to get the current player position without state updates
        if (playerRef.current) {
          shootFromPosition(playerRef.current.x, playerRef.current.y);
        }
      }, RAPID_FIRE_DELAY);
    } else {
      if (rapidFireIntervalRef.current) {
        clearInterval(rapidFireIntervalRef.current);
        rapidFireIntervalRef.current = null;
      }
    }

    return () => {
      if (rapidFireIntervalRef.current) {
        clearInterval(rapidFireIntervalRef.current);
      }
    };
  }, [rapidFire, gameState]);

  // Rapid fire timer countdown
  useEffect(() => {
    if (rapidFire && rapidFireTimer > 0) {
      const timer = setInterval(() => {
        setRapidFireTimer(prev => {
          if (prev <= 1) {
            setRapidFire(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [rapidFire, rapidFireTimer]);

  // Combo timer system
  useEffect(() => {
    if (comboTimer > 0) {
      const timer = setInterval(() => {
        setComboTimer(prev => {
          if (prev <= 1) {
            // Reset combo when timer expires
            setComboMultiplier(1);
            setGameStats(prev => ({ ...prev, combo: 0 }));
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [comboTimer]);

  // Screen shake effect
  useEffect(() => {
    if (screenShake > 0) {
      const timer = setInterval(() => {
        setScreenShake(prev => Math.max(0, prev - 1));
      }, 50);
      
      return () => clearInterval(timer);
    }
  }, [screenShake]);

  useEffect(() => {
    if (gameState !== 'playing') return;

    const gameLoop = () => {
      setPlayer(prev => {
        let newX = prev.x;
        let newY = prev.y;

        if (keys['w'] || keys['arrowup']) newY -= PLAYER_SPEED;
        if (keys['s'] || keys['arrowdown']) newY += PLAYER_SPEED;
        if (keys['a'] || keys['arrowleft']) newX -= PLAYER_SPEED;
        if (keys['d'] || keys['arrowright']) newX += PLAYER_SPEED;

        newX = Math.max(25, Math.min(775, newX));
        newY = Math.max(25, Math.min(575, newY));

        const newPlayer = { ...prev, x: newX, y: newY };
        // Update the ref with current position for rapid fire
        playerRef.current = newPlayer;
        return newPlayer;
      });

      setBullets(prev => 
        prev.filter(bullet => bullet.y > -10 && bullet.y < 610)
          .map(bullet => ({
            ...bullet,
            y: bullet.y + bullet.vy
          }))
      );

      setEnemies(prev => 
        prev.filter(enemy => enemy.y < 610)
          .map(enemy => ({
            ...enemy,
            y: enemy.y + ENEMY_SPEED,
            x: enemy.x + Math.sin(enemy.y * 0.02) * 0.8,
            lastShot: enemy.lastShot || 0
          }))
      );

      const now = Date.now();
      if (now - enemyShotTimerRef.current > 800) {
        enemies.forEach(enemy => {
          if (Math.random() < 0.3) {
            spawnEnemyBullet(enemy.x, enemy.y);
          }
        });
        enemyShotTimerRef.current = now;
      }

      setPowerUps(prev => 
        prev.filter(powerUp => powerUp.y < 610)
          .map(powerUp => ({
            ...powerUp,
            y: powerUp.y + 2
          }))
      );

      setAsteroids(prev => 
        prev.filter(asteroid => asteroid.y < 610)
          .map(asteroid => ({
            ...asteroid,
            y: asteroid.y + asteroid.speed,
            rotation: asteroid.rotation + asteroid.rotationSpeed
          }))
      );

      // Update particles
      setParticles(prev => 
        prev.filter(particle => particle.life > 0)
          .map(particle => ({
            ...particle,
            x: particle.x + particle.vx,
            y: particle.y + particle.vy,
            life: particle.life - 1,
            size: particle.size * 0.98
          }))
      );

      // Update boss movement and behavior
      if (boss) {
        setBoss(prev => {
          if (!prev) return null;
          
          let newX = prev.x;
          let newY = prev.y;
          const time = gameTime * 0.1;
          
          // Different movement patterns
          switch (prev.pattern) {
            case 'circle':
              newX = 400 + Math.cos(time) * 100;
              newY = 100 + Math.sin(time) * 50;
              break;
            case 'zigzag':
              newX = 400 + Math.sin(time * 2) * 150;
              newY = 100 + Math.abs(Math.sin(time)) * 30;
              break;
            case 'spiral':
              newX = 400 + Math.cos(time) * (50 + time * 10);
              newY = 100 + Math.sin(time) * (30 + time * 5);
              break;
          }
          
          // Boss shooting
          if (gameTime - prev.lastShot > 500) {
            spawnBossBullet(prev.x, prev.y);
            prev.lastShot = gameTime;
          }
          
          return { ...prev, x: newX, y: newY, lastShot: prev.lastShot };
        });
      }

      // Dynamic difficulty scaling
      const currentDifficulty = Math.max(1, Math.floor(score / 1000) + 1);
      if (currentDifficulty !== difficulty) {
        setDifficulty(currentDifficulty);
      }

      // Dynamic enemy spawning based on difficulty (reduced rates + max limits)
      const enemySpawnRate = 0.02 + (difficulty * 0.005); // Reduced from 0.01 to 0.005
      if (Math.random() < enemySpawnRate && enemies.length < 8) { // Max 8 enemies on screen
        spawnEnemy();
      }

      // Dynamic power-up spawning
      const powerUpSpawnRate = 0.005 + (difficulty * 0.001); // Reduced from 0.002 to 0.001
      if (Math.random() < powerUpSpawnRate && powerUps.length < 3) { // Max 3 power-ups on screen
        spawnPowerUp();
      }

      // Dynamic asteroid spawning (reduced rates + max limits)
      const asteroidSpawnRate = 0.01 + (difficulty * 0.002); // Reduced from 0.005 to 0.002
      if (Math.random() < asteroidSpawnRate && asteroids.length < 5) { // Max 5 asteroids on screen
        spawnAsteroid();
      }

      // Generate new challenge if none exists
      if (!currentChallenge && Math.random() < 0.005) {
        generateChallenge();
      }

      // Boss spawning every 5000 points
      if (!boss && score > 0 && score % 5000 === 0) {
        spawnBoss();
      }

      // Update game time for survival challenges
      setGameTime(prev => {
        const newTime = prev + 1;
        
        // Check survival challenge
        if (currentChallenge && currentChallenge.type === 'survive') {
          if (newTime >= currentChallenge.target) {
            setScore(prev => prev + currentChallenge.reward);
            setGameStats(prev => ({ ...prev, challengesCompleted: prev.challengesCompleted + 1 }));
            setCurrentChallenge(null);
          }
        }
        
        return newTime;
      });

      checkCollisions();

      animationRef.current = requestAnimationFrame(gameLoop);
    };

    animationRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gameState, keys, enemies]);

  useEffect(() => {
    if (gameState !== 'playing') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, 800, 600);

    drawStarfield(ctx);

    powerUps.forEach(powerUp => {
      ctx.font = '30px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(powerUp.emoji, powerUp.x, powerUp.y);
    });

    enemies.forEach(enemy => {
      drawEnemyShip(ctx, enemy);
      
      // Draw health bar for enemies with multiple health
      if (enemy.maxHealth > 1) {
        const healthBarWidth = 30;
        const healthBarHeight = 4;
        const healthPercentage = enemy.health / enemy.maxHealth;
        
        ctx.fillStyle = '#333';
        ctx.fillRect(enemy.x - healthBarWidth/2, enemy.y - 35, healthBarWidth, healthBarHeight);
        ctx.fillStyle = '#00FF00';
        ctx.fillRect(enemy.x - healthBarWidth/2, enemy.y - 35, healthBarWidth * healthPercentage, healthBarHeight);
      }
    });

    asteroids.forEach(asteroid => {
      drawAsteroid(ctx, asteroid.x, asteroid.y, asteroid.size, asteroid.rotation);
    });

    // Draw boss
    if (boss) {
      drawBoss(ctx, boss);
    }

    bullets.forEach(bullet => {
      if (bullet.type === 'player') {
        ctx.fillStyle = '#00FFFF';
        ctx.beginPath();
        ctx.arc(bullet.x, bullet.y, 4, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = 'rgba(0, 255, 255, 0.6)';
        ctx.beginPath();
        ctx.arc(bullet.x, bullet.y + 8, 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = '#FF0000';
        ctx.beginPath();
        ctx.arc(bullet.x, bullet.y, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // Apply screen shake
    if (screenShake > 0) {
      const shakeX = (Math.random() - 0.5) * screenShake * 2;
      const shakeY = (Math.random() - 0.5) * screenShake * 2;
      ctx.save();
      ctx.translate(shakeX, shakeY);
    }

    drawTriangle(ctx, player.x, player.y, 25, '#3498DB', '#BDC3C7');

    // Draw particles
    particles.forEach(particle => {
      const alpha = particle.life / particle.maxLife;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = particle.color;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;

    if (screenShake > 0) {
      ctx.restore();
    }

    drawProfessionalUI(ctx);

  }, [gameState, player, bullets, enemies, powerUps, score, level, highScore, gameStats]);

  const drawEnemyShip = (ctx, enemy) => {
    const x = enemy.x;
    const y = enemy.y;
    const size = 20;
    
    ctx.save();
    
    // Different ship designs based on type
    switch (enemy.type) {
      case 'basic':
        // Sleek fighter design
        ctx.fillStyle = enemy.color || '#E74C3C';
        ctx.strokeStyle = '#C0392B';
        ctx.lineWidth = 2;
        
        // Main body
        ctx.beginPath();
        ctx.moveTo(x, y - size);
        ctx.lineTo(x - size * 0.6, y + size * 0.4);
        ctx.lineTo(x - size * 0.3, y + size * 0.6);
        ctx.lineTo(x + size * 0.3, y + size * 0.6);
        ctx.lineTo(x + size * 0.6, y + size * 0.4);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        // Cockpit
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(x, y - size * 0.3, size * 0.2, 0, Math.PI * 2);
        ctx.fill();
        break;
        
      case 'fast':
        // Speed-focused interceptor
        ctx.fillStyle = enemy.color || '#FF6B6B';
        ctx.strokeStyle = '#DC143C';
        ctx.lineWidth = 2;
        
        // Pointed body
        ctx.beginPath();
        ctx.moveTo(x, y - size);
        ctx.lineTo(x - size * 0.4, y + size * 0.2);
        ctx.lineTo(x - size * 0.2, y + size * 0.6);
        ctx.lineTo(x + size * 0.2, y + size * 0.6);
        ctx.lineTo(x + size * 0.4, y + size * 0.2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        // Engine glow
        ctx.fillStyle = '#00FFFF';
        ctx.beginPath();
        ctx.arc(x, y + size * 0.4, size * 0.15, 0, Math.PI * 2);
        ctx.fill();
        break;
        
      case 'tank':
        // Heavy armored ship
        ctx.fillStyle = enemy.color || '#8B0000';
        ctx.strokeStyle = '#4B0082';
        ctx.lineWidth = 3;
        
        // Wide armored body
        ctx.beginPath();
        ctx.moveTo(x, y - size);
        ctx.lineTo(x - size * 0.8, y - size * 0.2);
        ctx.lineTo(x - size * 0.9, y + size * 0.3);
        ctx.lineTo(x - size * 0.7, y + size * 0.6);
        ctx.lineTo(x + size * 0.7, y + size * 0.6);
        ctx.lineTo(x + size * 0.9, y + size * 0.3);
        ctx.lineTo(x + size * 0.8, y - size * 0.2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        // Armor plates
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x - size * 0.5, y - size * 0.5);
        ctx.lineTo(x + size * 0.5, y - size * 0.5);
        ctx.moveTo(x - size * 0.3, y);
        ctx.lineTo(x + size * 0.3, y);
        ctx.stroke();
        break;
        
      case 'shooter':
        // Artillery ship with weapon pods
        ctx.fillStyle = enemy.color || '#DC143C';
        ctx.strokeStyle = '#8B0000';
        ctx.lineWidth = 2;
        
        // Central body
        ctx.beginPath();
        ctx.moveTo(x, y - size);
        ctx.lineTo(x - size * 0.5, y + size * 0.6);
        ctx.lineTo(x + size * 0.5, y + size * 0.6);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        // Weapon pods
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(x - size * 0.4, y - size * 0.2, size * 0.25, 0, Math.PI * 2);
        ctx.arc(x + size * 0.4, y - size * 0.2, size * 0.25, 0, Math.PI * 2);
        ctx.fill();
        break;
        
      default:
        // Fallback to basic design
        ctx.fillStyle = enemy.color || '#E74C3C';
        ctx.strokeStyle = '#C0392B';
        ctx.lineWidth = 2;
        
        ctx.beginPath();
        ctx.moveTo(x, y - size);
        ctx.lineTo(x - size * 0.8, y + size * 0.6);
        ctx.lineTo(x + size * 0.8, y + size * 0.6);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }
    
    ctx.restore();
  };

  const drawTriangle = (ctx, x, y, size, fillColor, strokeColor) => {
    ctx.fillStyle = fillColor;
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 2;
    
    ctx.beginPath();
    ctx.moveTo(x, y - size);
    ctx.lineTo(x - size * 0.8, y + size * 0.6);
    ctx.lineTo(x + size * 0.8, y + size * 0.6);
    ctx.closePath();
    
    ctx.fill();
    ctx.stroke();
  };

  const drawBoss = (ctx, boss) => {
    // Draw boss body
    ctx.fillStyle = boss.color;
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 3;
    
    ctx.beginPath();
    ctx.arc(boss.x, boss.y, boss.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    // Draw boss name
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(boss.name, boss.x, boss.y - boss.size - 10);
    
    // Draw boss health bar
    const healthBarWidth = boss.size * 2;
    const healthBarHeight = 8;
    const healthPercentage = boss.health / boss.maxHealth;
    
    ctx.fillStyle = '#333';
    ctx.fillRect(boss.x - healthBarWidth/2, boss.y - boss.size - 25, healthBarWidth, healthBarHeight);
    ctx.fillStyle = '#00FF00';
    ctx.fillRect(boss.x - healthBarWidth/2, boss.y - boss.size - 25, healthBarWidth * healthPercentage, healthBarHeight);
    
    // Draw boss phase indicator
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 12px Arial';
    ctx.fillText(`PHASE ${boss.phase + 1}`, boss.x, boss.y + boss.size + 15);
  };

  const drawAsteroid = (ctx, x, y, size, rotation) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    
    ctx.fillStyle = '#8B4513';
    ctx.strokeStyle = '#654321';
    ctx.lineWidth = 2;
    
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const radius = size * (0.7 + Math.sin(i * 0.5) * 0.3);
      const px = Math.cos(angle) * radius;
      const py = Math.sin(angle) * radius;
      
      if (i === 0) {
        ctx.moveTo(px, py);
      } else {
        ctx.lineTo(px, py);
      }
    }
    ctx.closePath();
    
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  };

  const drawStarfield = (ctx) => {
    ctx.fillStyle = '#000033';
    ctx.fillRect(0, 0, 800, 600);
    
    const time = Date.now() * 0.001;
    ctx.fillStyle = '#FFFFFF';
    for (let i = 0; i < 150; i++) {
      const x = (i * 37) % 800;
      const y = (i * 73 + time * 20) % 600;
      const size = (i % 3) + 1;
      const alpha = 0.3 + 0.7 * Math.sin(time + i);
      ctx.globalAlpha = alpha;
      ctx.fillRect(x, y, size, size);
    }
    ctx.globalAlpha = 1;
  };

  const drawProfessionalUI = (ctx) => {
    // Main UI background - increased height for better organization
    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.fillRect(10, 10, 780, 200);
    ctx.strokeStyle = '#00FFFF';
    ctx.lineWidth = 2;
    ctx.strokeRect(10, 10, 780, 200);

    // TOP ROW - Score and High Score
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`SCORE: ${score.toLocaleString()}`, 20, 35);
    
    ctx.fillStyle = '#FFD700';
    ctx.fillText(`HIGH SCORE: ${highScore.toLocaleString()}`, 300, 35);
    
    // SECOND ROW - Level and Difficulty
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 20px Arial';
    ctx.fillText(`LEVEL: ${level}`, 20, 60);
    
    ctx.fillStyle = '#FF6B6B';
    ctx.font = 'bold 18px Arial';
    ctx.fillText(`DIFFICULTY: ${difficulty}`, 300, 60);
    
    // THIRD ROW - Lives and Status
    ctx.fillStyle = '#FF69B4';
    ctx.font = 'bold 18px Arial';
    ctx.fillText(`LIVES: ${player.lives}`, 20, 85);
    
    // Status indicators
    if (rapidFire) {
      ctx.fillStyle = '#FF00FF';
      ctx.font = 'bold 16px Arial';
      ctx.fillText(`RAPID FIRE: ${rapidFireTimer}s`, 200, 85);
    }
    
    if (invincible) {
      ctx.fillStyle = '#00FF00';
      ctx.font = 'bold 16px Arial';
      ctx.fillText(`INVINCIBLE!`, 400, 85);
    }
    
    // RIGHT SIDE - Health and Power bars
    ctx.fillStyle = '#333';
    ctx.fillRect(500, 20, 200, 20);
    ctx.fillStyle = '#E74C3C';
    ctx.fillRect(500, 20, (player.health / 100) * 200, 20);
    ctx.fillStyle = '#FFF';
    ctx.font = 'bold 16px Arial';
    ctx.fillText(`HEALTH: ${player.health}%`, 500, 35);
    
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(500, 50, 200, 15);
    ctx.fillStyle = '#FFA500';
    ctx.fillRect(500, 50, (player.power / 3) * 200, 15);
    ctx.fillStyle = '#FFF';
    ctx.font = 'bold 14px Arial';
    ctx.fillText(`POWER: ${player.power}/3`, 500, 62);
    
    // FOURTH ROW - Game Statistics
    ctx.fillStyle = '#00FFFF';
    ctx.font = 'bold 14px Arial';
    ctx.fillText(`ENEMIES: ${gameStats.enemiesDestroyed}`, 20, 110);
    ctx.fillText(`ASTEROIDS: ${gameStats.asteroidsDestroyed}`, 150, 110);
    ctx.fillText(`POWER-UPS: ${gameStats.powerUpsCollected}`, 280, 110);
    ctx.fillText(`ACCURACY: ${gameStats.accuracy}%`, 420, 110);
    
    // FIFTH ROW - Medals and Combo
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 16px Arial';
    ctx.fillText(`🥉 ${medals.bronze} 🥈 ${medals.silver} 🥇 ${medals.gold}`, 20, 135);
    
    // Combo system display
    if (gameStats.combo > 0) {
      ctx.fillStyle = '#FF00FF';
      ctx.font = 'bold 18px Arial';
      ctx.fillText(`COMBO: ${gameStats.combo}x${comboMultiplier}`, 400, 135);
      ctx.fillStyle = '#FFD700';
      ctx.font = 'bold 14px Arial';
      ctx.fillText(`TIMER: ${comboTimer}s`, 600, 135);
    }
    
    // SIXTH ROW - Streak and Challenge
    if (gameStats.streak > 0) {
      ctx.fillStyle = '#00FF00';
      ctx.font = 'bold 16px Arial';
      ctx.fillText(`STREAK: ${gameStats.streak}`, 20, 160);
    }
    
    // Display current challenge
    if (currentChallenge) {
      ctx.fillStyle = '#FFD700';
      ctx.font = 'bold 14px Arial';
      ctx.fillText(`CHALLENGE: ${currentChallenge.description}`, 200, 160);
      ctx.fillText(`PROGRESS: ${currentChallenge.progress}/${currentChallenge.target}`, 200, 180);
    }
    
    // SEVENTH ROW - Boss indicator (if boss exists)
    if (boss) {
      ctx.fillStyle = '#FF0000';
      ctx.font = 'bold 20px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`BOSS: ${boss.name}`, 400, 160);
      ctx.fillText(`HEALTH: ${boss.health}/${boss.maxHealth}`, 400, 180);
      ctx.textAlign = 'left';
    }
  };

  const shootFromPosition = (x, y) => {
    const newBullets = [];
    
    if (player.power === 1) {
      newBullets.push({
        x: x,
        y: y - 25,
        vy: -BULLET_SPEED,
        type: 'player'
      });
    }
    else if (player.power === 2) {
      newBullets.push(
        { x: x - 10, y: y - 25, vy: -BULLET_SPEED, type: 'player' },
        { x: x + 10, y: y - 25, vy: -BULLET_SPEED, type: 'player' }
      );
    }
    else if (player.power === 3) {
      newBullets.push(
        { x: x, y: y - 25, vy: -BULLET_SPEED, type: 'player' },
        { x: x - 15, y: y - 20, vy: -BULLET_SPEED, type: 'player' },
        { x: x + 15, y: y - 20, vy: -BULLET_SPEED, type: 'player' }
      );
    }
    
    setBullets(prev => [...prev, ...newBullets]);
    setGameStats(prev => ({ ...prev, shotsFired: prev.shotsFired + newBullets.length }));
  };

  const shoot = () => {
    const now = Date.now();
    if (now - lastShotRef.current < 150) return;
    
    lastShotRef.current = now;
    
    // Use current player position for accurate bullet placement
    shootFromPosition(playerRef.current.x, playerRef.current.y);
  };

  const spawnEnemyBullet = (x, y) => {
    const enemyBullet = {
      x: x,
      y: y + 20,
      vy: ENEMY_BULLET_SPEED,
      type: 'enemy'
    };
    setBullets(prev => [...prev, enemyBullet]);
  };

  const spawnBossBullet = (x, y) => {
    const bossBullets = [];
    for (let i = 0; i < 3; i++) {
      const angle = (i - 1) * Math.PI / 4;
      bossBullets.push({
        x: x,
        y: y + 30,
        vx: Math.sin(angle) * 3,
        vy: Math.cos(angle) * 3,
        type: 'boss'
      });
    }
    setBullets(prev => [...prev, ...bossBullets]);
  };

  const spawnEnemy = () => {
    const enemyTypes = [
      { type: 'basic', health: 1, speed: ENEMY_SPEED, points: 100, color: '#E74C3C' },
      { type: 'fast', health: 1, speed: ENEMY_SPEED * 1.5, points: 150, color: '#FF6B6B' },
      { type: 'tank', health: 3, speed: ENEMY_SPEED * 0.7, points: 300, color: '#8B0000' },
      { type: 'shooter', health: 2, speed: ENEMY_SPEED, points: 200, color: '#DC143C' }
    ];
    
    // Higher difficulty unlocks more enemy types
    const availableTypes = enemyTypes.slice(0, Math.min(difficulty, enemyTypes.length));
    const selectedType = availableTypes[Math.floor(Math.random() * availableTypes.length)];
    
    const enemy = {
      x: Math.random() * 700 + 50,
      y: -30,
      vy: selectedType.speed + Math.random() * 2,
      health: selectedType.health,
      maxHealth: selectedType.health,
      type: selectedType.type,
      points: selectedType.points,
      color: selectedType.color,
      lastShot: 0
    };
    setEnemies(prev => [...prev, enemy]);
  };

  const spawnAsteroid = () => {
    const asteroid = {
      x: Math.random() * 700 + 50,
      y: -40,
      size: Math.random() * 30 + 20,
      speed: Math.random() * 2 + 1,
      rotation: 0,
      rotationSpeed: (Math.random() - 0.5) * 0.1
    };
    setAsteroids(prev => [...prev, asteroid]);
  };

  const generateChallenge = () => {
    const challengeTypes = [
      { type: 'destroy', target: 10, description: 'Destroy 10 enemies', reward: 500 },
      { type: 'survive', target: 30, description: 'Survive 30 seconds', reward: 300 },
      { type: 'accuracy', target: 80, description: 'Achieve 80% accuracy', reward: 400 },
      { type: 'asteroids', target: 5, description: 'Destroy 5 asteroids', reward: 600 }
    ];
    
    const challenge = challengeTypes[Math.floor(Math.random() * challengeTypes.length)];
    setCurrentChallenge({
      ...challenge,
      progress: 0,
      completed: false
    });
  };

  const spawnBoss = () => {
    const bossTypes = [
      { name: 'Destroyer', health: 20, size: 40, color: '#8B0000', pattern: 'circle' },
      { name: 'Annihilator', health: 30, size: 50, color: '#4B0082', pattern: 'zigzag' },
      { name: 'Titan', health: 40, size: 60, color: '#800000', pattern: 'spiral' }
    ];
    
    const selectedBoss = bossTypes[Math.floor(Math.random() * bossTypes.length)];
    const bossLevel = Math.floor(score / 5000);
    
    const newBoss = {
      ...selectedBoss,
      x: 400,
      y: 100,
      health: selectedBoss.health + (bossLevel * 5),
      maxHealth: selectedBoss.health + (bossLevel * 5),
      pattern: selectedBoss.pattern,
      phase: 0,
      lastShot: 0
    };
    
    setBoss(newBoss);
    setBossHealth(newBoss.health);
    
    // Create dramatic entrance effect
    setScreenShake(5);
    createExplosion(400, 100, '#FFD700');
  };

  const createExplosion = (x, y, color) => {
    const newParticles = [];
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const speed = 2 + Math.random() * 3;
      newParticles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 30,
        maxLife: 30,
        color: color || '#FF0000',
        size: 3 + Math.random() * 3
      });
    }
    setParticles(prev => [...prev, ...newParticles]);
  };

  const spawnPowerUp = () => {
    const types = [
      { type: 'gem', emoji: '💎', effect: 'score' },
      { type: 'star', emoji: '⭐', effect: 'power' },
      { type: 'heart', emoji: '❤️', effect: 'health' },
      { type: 'bolt', emoji: '⚡', effect: 'rapid' },
      { type: 'shield', emoji: '🛡️', effect: 'shield' }
    ];
    
    const powerUp = types[Math.floor(Math.random() * types.length)];
    
    const newPowerUp = {
      x: Math.random() * 700 + 50,
      y: -30,
      type: powerUp.type,
      emoji: powerUp.emoji,
      effect: powerUp.effect
    };
    setPowerUps(prev => [...prev, newPowerUp]);
  };

  const checkCollisions = () => {
    bullets.forEach((bullet, bulletIndex) => {
      if (bullet.type !== 'player') return;
      
      enemies.forEach((enemy, enemyIndex) => {
        const distance = Math.sqrt(
          Math.pow(bullet.x - enemy.x, 2) + Math.pow(bullet.y - enemy.y, 2)
        );
        
        if (distance < 25) {
          setBullets(prev => prev.filter((_, i) => i !== bulletIndex));
          setEnemies(prev => prev.filter((_, i) => i !== enemyIndex));
          
          // Combo system
          const newCombo = gameStats.combo + 1;
          let newMultiplier = comboMultiplier;
          
          // Increase multiplier based on combo
          if (newCombo >= 10) newMultiplier = 5;
          else if (newCombo >= 5) newMultiplier = 3;
          else if (newCombo >= 3) newMultiplier = 2;
          
          setComboMultiplier(newMultiplier);
          setComboTimer(5); // Reset combo timer
          
          // Calculate score with combo multiplier
          const basePoints = enemy.points || 100;
          const comboPoints = basePoints * newMultiplier;
          setScore(prev => prev + comboPoints);
          
          // Add screen shake for satisfying feedback
          setScreenShake(3);
          
          // Create explosion particles
          createExplosion(enemy.x, enemy.y, enemy.color);
          
          setGameStats(prev => ({ 
            ...prev, 
            enemiesDestroyed: prev.enemiesDestroyed + 1,
            combo: newCombo,
            maxCombo: Math.max(prev.maxCombo, newCombo),
            streak: prev.streak + 1,
            maxStreak: Math.max(prev.maxStreak, prev.streak + 1)
          }));
          
          // Update challenge progress
          if (currentChallenge && currentChallenge.type === 'destroy') {
            const newProgress = currentChallenge.progress + 1;
            if (newProgress >= currentChallenge.target) {
              setScore(prev => prev + currentChallenge.reward);
              setGameStats(prev => ({ ...prev, challengesCompleted: prev.challengesCompleted + 1 }));
              setCurrentChallenge(null);
            } else {
              setCurrentChallenge(prev => ({ ...prev, progress: newProgress }));
            }
          }
        }
      });
    });

    bullets.forEach((bullet, bulletIndex) => {
      if (bullet.type !== 'enemy') return;
      
      const distance = Math.sqrt(
        Math.pow(bullet.x - player.x, 2) + Math.pow(bullet.y - player.y, 2)
      );
      
      if (distance < 30 && !invincible) {
        setBullets(prev => prev.filter((_, i) => i !== bulletIndex));
        setPlayer(prev => ({ ...prev, health: Math.max(0, prev.health - 15) }));
        
        if (player.health <= 15) {
          loseLife();
        }
        
        // Reset streak when hit
        setGameStats(prev => ({ ...prev, streak: 0 }));
      }
    });

    enemies.forEach(enemy => {
      const distance = Math.sqrt(
        Math.pow(player.x - enemy.x, 2) + Math.pow(player.y - enemy.y, 2)
      );
      
      if (distance < 45 && !invincible) {
        setPlayer(prev => ({ ...prev, health: Math.max(0, prev.health - 25) }));
        setEnemies(prev => prev.filter(e => e !== enemy));
        
        if (player.health <= 25) {
          loseLife();
        }
        
        // Reset streak when hit
        setGameStats(prev => ({ ...prev, streak: 0 }));
      }
    });

    powerUps.forEach((powerUp, index) => {
      const distance = Math.sqrt(
        Math.pow(player.x - powerUp.x, 2) + Math.pow(player.y - powerUp.y, 2)
      );
      
      if (distance < 40) {
        if (powerUp.effect === 'score') {
          setScore(prev => prev + 500);
        } else if (powerUp.effect === 'power') {
          setPlayer(prev => ({ ...prev, power: Math.min(3, prev.power + 1) }));
        } else if (powerUp.effect === 'health') {
          setPlayer(prev => ({ ...prev, health: Math.min(100, prev.health + 40) }));
        } else if (powerUp.effect === 'rapid') {
          setRapidFire(true);
          setRapidFireTimer(8); // 8 seconds of rapid fire
        }
        
        setPowerUps(prev => prev.filter((_, i) => i !== index));
        setGameStats(prev => ({ ...prev, powerUpsCollected: prev.powerUpsCollected + 1 }));
      }
    });

    // Check bullet collisions with asteroids
    bullets.forEach((bullet, bulletIndex) => {
      if (bullet.type !== 'player') return;
      
      asteroids.forEach((asteroid, asteroidIndex) => {
        const distance = Math.sqrt(
          Math.pow(bullet.x - asteroid.x, 2) + Math.pow(bullet.y - asteroid.y, 2)
        );
        
        if (distance < asteroid.size / 2 + 4) {
          setBullets(prev => prev.filter((_, i) => i !== bulletIndex));
          setAsteroids(prev => prev.filter((_, i) => i !== asteroidIndex));
          setScore(prev => prev + 200);
          setGameStats(prev => ({ ...prev, asteroidsDestroyed: prev.asteroidsDestroyed + 1 }));
          
          // Update challenge progress
          if (currentChallenge && currentChallenge.type === 'asteroids') {
            const newProgress = currentChallenge.progress + 1;
            if (newProgress >= currentChallenge.target) {
              setScore(prev => prev + currentChallenge.reward);
              setGameStats(prev => ({ ...prev, challengesCompleted: prev.challengesCompleted + 1 }));
              setCurrentChallenge(null);
            } else {
              setCurrentChallenge(prev => ({ ...prev, progress: newProgress }));
            }
          }
        }
      });
    });

    // Check bullet collisions with boss
    if (boss) {
      bullets.forEach((bullet, bulletIndex) => {
        if (bullet.type !== 'player') return;
        
        const distance = Math.sqrt(
          Math.pow(bullet.x - boss.x, 2) + Math.pow(bullet.y - boss.y, 2)
        );
        
        if (distance < boss.size / 2 + 4) {
          setBullets(prev => prev.filter((_, i) => i !== bulletIndex));
          
          // Boss takes damage
          const newBossHealth = boss.health - 1;
          setBossHealth(newBossHealth);
          
          if (newBossHealth <= 0) {
            // Boss defeated!
            setScore(prev => prev + 1000 * difficulty);
            setBoss(null);
            setBossHealth(0);
            createExplosion(boss.x, boss.y, '#FFD700');
            setScreenShake(8);
            
            // Massive combo bonus
            setComboMultiplier(10);
            setComboTimer(10);
            setGameStats(prev => ({ ...prev, combo: prev.combo + 5 }));
          } else {
            setBoss(prev => ({ ...prev, health: newBossHealth }));
            createExplosion(boss.x, boss.y, boss.color);
            setScreenShake(3);
          }
        }
      });
    }

    // Check player collision with asteroids
    asteroids.forEach((asteroid, index) => {
      const distance = Math.sqrt(
        Math.pow(player.x - asteroid.x, 2) + Math.pow(player.y - asteroid.y, 2)
      );
      
      if (distance < asteroid.size / 2 + 25 && !invincible) {
        setAsteroids(prev => prev.filter((_, i) => i !== index));
        setPlayer(prev => ({ ...prev, health: Math.max(0, prev.health - 20) }));
        
        if (player.health <= 20) {
          loseLife();
        }
        
        // Reset streak when hit
        setGameStats(prev => ({ ...prev, streak: 0 }));
      }
    });

    const totalShots = gameStats.shotsFired;
    const hits = gameStats.enemiesDestroyed;
    if (totalShots > 0) {
      const accuracy = Math.round((hits / totalShots) * 100);
      setGameStats(prev => ({ ...prev, accuracy }));
    }
  };

  const loseLife = () => {
    setPlayer(prev => {
      const newLives = prev.lives - 1;
      const newPlayer = { ...prev, lives: newLives, health: 100 };
      
      // Check if this was the last life
      if (newLives <= 0) {
        gameOver();
      }
      
      return newPlayer;
    });
    
    // Add brief invincibility period
    setInvincible(true);
    setTimeout(() => setInvincible(false), 2000); // 2 seconds of invincibility
  };

  const calculateMedal = (score) => {
    if (score >= 10000) return 'gold';
    if (score >= 5000) return 'silver';
    if (score >= 2000) return 'bronze';
    return null;
  };

  const awardMedal = (medalType) => {
    if (medalType) {
      setMedals(prev => ({
        ...prev,
        [medalType]: prev[medalType] + 1
      }));
      localStorage.setItem(`kadenAdelynnSpaceAdventuresMedal_${medalType}`, 
        (medals[medalType] + 1).toString());
    }
  };

  const gameOver = () => {
    // Update high score and history
    const newScoreHistory = [...scoreHistory, { score, date: new Date().toISOString() }]
      .sort((a, b) => b.score - a.score)
      .slice(0, 10); // Keep top 10 scores
    
    setScoreHistory(newScoreHistory);
    localStorage.setItem('kadenAdelynnSpaceAdventuresScoreHistory', JSON.stringify(newScoreHistory));
    
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('kadenAdelynnSpaceAdventuresHighScore', score.toString());
    }
    
    // Award medal
    const medal = calculateMedal(score);
    awardMedal(medal);
    
    setGameState('gameOver');
  };

  const startGame = () => {
    setGameState('playing');
    const initialPlayer = { x: 400, y: 500, health: 100, power: 1, lives: 25 };
    setPlayer(initialPlayer);
    playerRef.current = initialPlayer;
    setBullets([]);
    setEnemies([]);
    setPowerUps([]);
    setAsteroids([]);
    setCurrentChallenge(null);
    setScore(0);
    setLevel(1);
    setGameTime(0);
    setInvincible(false);
    setDifficulty(1);
    setComboMultiplier(1);
    setComboTimer(0);
    setScreenShake(0);
    setParticles([]);
    setBoss(null);
    setBossHealth(0);
    setGameStats({
      enemiesDestroyed: 0,
      powerUpsCollected: 0,
      shotsFired: 0,
      accuracy: 0,
      asteroidsDestroyed: 0,
      challengesCompleted: 0,
      combo: 0,
      maxCombo: 0,
      streak: 0,
      maxStreak: 0
    });
  };

  if (gameState === 'menu') {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #000033 0%, #000066 100%)',
        fontFamily: 'Arial, sans-serif'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          padding: '40px',
          borderRadius: '25px',
          textAlign: 'center',
          boxShadow: '0 16px 48px rgba(0, 0, 0, 0.5)',
          maxWidth: '600px',
          border: '2px solid rgba(255, 255, 255, 0.2)'
        }}>
          <h1 style={{ color: '#00FFFF', fontSize: '48px', textShadow: '0 0 20px #00FFFF' }}>
            🚀 Kaden & Adelynn Space Adventures 🚀
          </h1>
          <p style={{ fontSize: '20px', color: '#FFF', marginBottom: '30px' }}>
            Epic space adventure with asteroids, challenges, and medals!
          </p>
          <div style={{ marginBottom: '20px', color: '#FFD700' }}>
            <p style={{ fontSize: '18px' }}>🏆 High Score: {highScore.toLocaleString()}</p>
            <p style={{ fontSize: '16px', color: '#FF69B4' }}>💖 You have 25 lives to complete your mission!</p>
            <p style={{ fontSize: '14px', color: '#FFD700' }}>🥉 Bronze: 2000+ 🥈 Silver: 5000+ 🥇 Gold: 10000+</p>
          </div>
          <button 
            onClick={startGame}
            style={{
              background: 'linear-gradient(45deg, #00FFFF, #FF00FF)',
              color: 'white',
              border: 'none',
              padding: '20px 40px',
              fontSize: '24px',
              borderRadius: '50px',
              cursor: 'pointer',
              boxShadow: '0 8px 24px rgba(0, 255, 255, 0.5)',
              textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)'
            }}
          >
            🚀 Launch Mission!
          </button>
          <div style={{ marginTop: '30px', color: '#FFF' }}>
            <h3>🎯 Controls:</h3>
            <p><strong>WASD</strong> or <strong>Arrow Keys</strong> - Move ship</p>
            <p><strong>SPACEBAR</strong> - Fire weapons</p>
            <p>💎 Collect emojis for power-ups!</p>
            <p>⚡ Rapid Fire power-up gives you super-fast shooting!</p>
            <p>🌌 Destroy asteroids for bonus points!</p>
            <p>🎯 Complete challenges for rewards!</p>
            <p>📱 Touch controls work on mobile devices!</p>
            <p>⚠️ Watch out for enemy bullets!</p>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'gameOver') {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #330000 0%, #660000 100%)',
        fontFamily: 'Arial, sans-serif'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          padding: '40px',
          borderRadius: '25px',
          textAlign: 'center',
          boxShadow: '0 16px 48px rgba(0, 0, 0, 0.5)',
          maxWidth: '600px',
          border: '2px solid rgba(255, 0, 0, 0.3)'
        }}>
          <h1 style={{ color: '#FF0000', fontSize: '48px', textShadow: '0 0 20px #FF0000' }}>
            💥 Space Mission Failed 💥
          </h1>
          <div style={{ color: '#FFF', marginBottom: '30px' }}>
            <p style={{ fontSize: '24px', marginBottom: '10px' }}>Final Score: {score.toLocaleString()}</p>
            <p style={{ fontSize: '18px', marginBottom: '10px' }}>Level Reached: {level}</p>
            <p style={{ fontSize: '16px', marginBottom: '10px' }}>Lives Remaining: {player.lives}</p>
            <p style={{ fontSize: '16px', marginBottom: '10px' }}>Enemies Destroyed: {gameStats.enemiesDestroyed}</p>
            <p style={{ fontSize: '16px', marginBottom: '10px' }}>Asteroids Destroyed: {gameStats.asteroidsDestroyed}</p>
            <p style={{ fontSize: '16px', marginBottom: '10px' }}>Challenges Completed: {gameStats.challengesCompleted}</p>
            <p style={{ fontSize: '16px', marginBottom: '10px' }}>Power-ups Collected: {gameStats.powerUpsCollected}</p>
            <p style={{ fontSize: '16px', marginBottom: '10px' }}>Accuracy: {gameStats.accuracy}%</p>
            {score > highScore && (
              <p style={{ color: '#FFD700', fontSize: '20px', fontWeight: 'bold' }}>🏆 NEW HIGH SCORE! 🏆</p>
            )}
          </div>
          <button 
            onClick={startGame}
            style={{
              background: 'linear-gradient(45deg, #FF0000, #FF6600)',
              color: 'white',
              border: 'none',
              padding: '20px 40px',
              fontSize: '24px',
              borderRadius: '50px',
              cursor: 'pointer',
              boxShadow: '0 8px 24px rgba(255, 0, 0, 0.5)',
              marginRight: '10px'
            }}
          >
            🚀 Try Again
          </button>
          <button 
            onClick={() => setGameState('menu')}
            style={{
              background: 'linear-gradient(45deg, #666, #999)',
              color: 'white',
              border: 'none',
              padding: '20px 40px',
              fontSize: '24px',
              borderRadius: '50px',
              cursor: 'pointer',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)'
            }}
          >
            🏠 Mission Control
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      background: 'linear-gradient(135deg, #000033 0%, #000066 100%)',
      minHeight: '100vh',
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        style={{
          border: '4px solid #00FFFF',
          borderRadius: '15px',
          boxShadow: '0 8px 32px rgba(0, 255, 255, 0.5)',
          marginBottom: '20px'
        }}
      />
      
      <div style={{
        width: '800px',
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '15px',
        padding: '15px',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
        border: '2px solid rgba(255, 255, 255, 0.2)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <button 
            onClick={() => setGameState('menu')}
            style={{
              background: 'linear-gradient(45deg, #00FFFF, #FF00FF)',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '20px',
              cursor: 'pointer',
              fontSize: '16px',
              boxShadow: '0 4px 16px rgba(0, 255, 255, 0.3)'
            }}
          >
            🏠 Mission Control
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerticalShooter;
