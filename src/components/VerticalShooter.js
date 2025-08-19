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
  const [keys, setKeys] = useState({});
  const [rapidFire, setRapidFire] = useState(false);
  const [rapidFireTimer, setRapidFireTimer] = useState(0);
  const [gameStats, setGameStats] = useState({
    enemiesDestroyed: 0,
    powerUpsCollected: 0,
    shotsFired: 0,
    accuracy: 0
  });
  
  const canvasRef = useRef(null);
  const animationRef = useRef(0);
  const lastShotRef = useRef(0);
  const enemyShotTimerRef = useRef(0);
  const rapidFireIntervalRef = useRef(null);

  const PLAYER_SPEED = 6;
  const BULLET_SPEED = 10;
  const ENEMY_SPEED = 3;
  const ENEMY_BULLET_SPEED = 4;
  const RAPID_FIRE_DELAY = 50; // Much faster firing when rapid fire is active

  useEffect(() => {
    const savedHighScore = localStorage.getItem('kadenAdelynnSpaceAdventuresHighScore');
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore));
    }
  }, []);

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
        shoot();
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

        return { ...prev, x: newX, y: newY };
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

      if (Math.random() < 0.03) {
        spawnEnemy();
      }

      if (Math.random() < 0.008) {
        spawnPowerUp();
      }

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
      drawTriangle(ctx, enemy.x, enemy.y, 20, '#E74C3C', '#C0392B');
    });

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

    drawTriangle(ctx, player.x, player.y, 25, '#3498DB', '#BDC3C7');

    drawProfessionalUI(ctx);

  }, [gameState, player, bullets, enemies, powerUps, score, level, highScore, gameStats]);

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
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(10, 10, 780, 80);
    ctx.strokeStyle = '#00FFFF';
    ctx.lineWidth = 2;
    ctx.strokeRect(10, 10, 780, 80);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`SCORE: ${score.toLocaleString()}`, 20, 35);
    ctx.fillText(`LEVEL: ${level}`, 20, 60);
    
    ctx.fillStyle = '#FFD700';
    ctx.fillText(`HIGH SCORE: ${highScore.toLocaleString()}`, 300, 35);
    
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

    // Lives display
    ctx.fillStyle = '#FF69B4';
    ctx.font = 'bold 16px Arial';
    ctx.fillText(`LIVES: ${player.lives}`, 20, 35);
    
    // Rapid fire status
    if (rapidFire) {
      ctx.fillStyle = '#FF00FF';
      ctx.font = 'bold 14px Arial';
      ctx.fillText(`RAPID FIRE: ${rapidFireTimer}s`, 20, 55);
    }

    ctx.fillStyle = '#00FFFF';
    ctx.font = 'bold 12px Arial';
    ctx.fillText(`ENEMIES DESTROYED: ${gameStats.enemiesDestroyed}`, 20, 85);
    ctx.fillText(`POWER-UPS: ${gameStats.powerUpsCollected}`, 200, 85);
    ctx.fillText(`ACCURACY: ${gameStats.accuracy}%`, 380, 85);
  };

  const shoot = () => {
    const now = Date.now();
    if (now - lastShotRef.current < 150) return;
    
    lastShotRef.current = now;
    
    const newBullets = [];
    
    if (player.power === 1) {
      newBullets.push({
        x: player.x,
        y: player.y - 25,
        vy: -BULLET_SPEED,
        type: 'player'
      });
    }
    else if (player.power === 2) {
      newBullets.push(
        { x: player.x - 10, y: player.y - 25, vy: -BULLET_SPEED, type: 'player' },
        { x: player.x + 10, y: player.y - 25, vy: -BULLET_SPEED, type: 'player' }
      );
    }
    else if (player.power === 3) {
      newBullets.push(
        { x: player.x, y: player.y - 25, vy: -BULLET_SPEED, type: 'player' },
        { x: player.x - 15, y: player.y - 20, vy: -BULLET_SPEED, type: 'player' },
        { x: player.x + 15, y: player.y - 20, vy: -BULLET_SPEED, type: 'player' }
      );
    }
    
    setBullets(prev => [...prev, ...newBullets]);
    setGameStats(prev => ({ ...prev, shotsFired: prev.shotsFired + newBullets.length }));
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

  const spawnEnemy = () => {
    const enemy = {
      x: Math.random() * 700 + 50,
      y: -30,
      vy: ENEMY_SPEED + Math.random() * 2,
      health: 1,
      lastShot: 0
    };
    setEnemies(prev => [...prev, enemy]);
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
          setScore(prev => prev + 100);
          setGameStats(prev => ({ ...prev, enemiesDestroyed: prev.enemiesDestroyed + 1 }));
        }
      });
    });

    bullets.forEach((bullet, bulletIndex) => {
      if (bullet.type !== 'enemy') return;
      
      const distance = Math.sqrt(
        Math.pow(bullet.x - player.x, 2) + Math.pow(bullet.y - player.y, 2)
      );
      
      if (distance < 30) {
        setBullets(prev => prev.filter((_, i) => i !== bulletIndex));
        setPlayer(prev => ({ ...prev, health: Math.max(0, prev.health - 15) }));
        
        if (player.health <= 15) {
          loseLife();
        }
      }
    });

    enemies.forEach(enemy => {
      const distance = Math.sqrt(
        Math.pow(player.x - enemy.x, 2) + Math.pow(player.y - enemy.y, 2)
      );
      
      if (distance < 45) {
        setPlayer(prev => ({ ...prev, health: Math.max(0, prev.health - 25) }));
        setEnemies(prev => prev.filter(e => e !== enemy));
        
        if (player.health <= 25) {
          loseLife();
        }
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
          setRapidFireTimer(3); // 3 seconds of rapid fire
        }
        
        setPowerUps(prev => prev.filter((_, i) => i !== index));
        setGameStats(prev => ({ ...prev, powerUpsCollected: prev.powerUpsCollected + 1 }));
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
    setPlayer(prev => ({ ...prev, lives: prev.lives - 1, health: 100 }));
    
    if (player.lives <= 1) {
      gameOver();
    }
  };

  const gameOver = () => {
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('kadenAdelynnSpaceAdventuresHighScore', score.toString());
    }
    setGameState('gameOver');
  };

  const startGame = () => {
    setGameState('playing');
    setPlayer({ x: 400, y: 500, health: 100, power: 1, lives: 25 });
    setBullets([]);
    setEnemies([]);
    setPowerUps([]);
    setScore(0);
    setLevel(1);
    setGameStats({
      enemiesDestroyed: 0,
      powerUpsCollected: 0,
      shotsFired: 0,
      accuracy: 0
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
            Epic space adventure with triangle ships and power-ups!
          </p>
          <div style={{ marginBottom: '20px', color: '#FFD700' }}>
            <p style={{ fontSize: '18px' }}>🏆 High Score: {highScore.toLocaleString()}</p>
            <p style={{ fontSize: '16px', color: '#FF69B4' }}>💖 You have 25 lives to complete your mission!</p>
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
