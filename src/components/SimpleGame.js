import React, { useState, useEffect, useRef } from 'react';

const SimpleGame = () => {
  const [gameState, setGameState] = useState('menu');
  const [player, setPlayer] = useState({ x: 400, y: 300, coins: 0, health: 100 });
  const [keys, setKeys] = useState({});
  const [currentArea, setCurrentArea] = useState('meadow');
  const [particles, setParticles] = useState([]);
  
  const canvasRef = useRef(null);
  const imagesRef = useRef({});
  const animationRef = useRef(0);

  const areas = {
    meadow: {
      name: '🌻 Sunny Meadow',
      background: '/assets/backgrounds/meadow.png',
      color: '#90EE90',
      collectibles: [
        { x: 200, y: 150, type: 'gem', value: 10, sprite: '/assets/sprites/gem.png' },
        { x: 600, y: 200, type: 'star', value: 15, sprite: '/assets/sprites/star.png' },
        { x: 300, y: 400, type: 'heart', value: 20, sprite: '/assets/sprites/heart.png' }
      ],
      portals: [{ x: 750, y: 300, target: 'forest', sprite: '/assets/sprites/portal.png' }],
      enemies: [{ x: 500, y: 100, type: 'enemy', sprite: '/assets/sprites/enemy.png' }]
    },
    forest: {
      name: '🌲 Enchanted Forest',
      background: '/assets/backgrounds/forest.png',
      color: '#228B22',
      collectibles: [
        { x: 150, y: 200, type: 'gem', value: 12, sprite: '/assets/sprites/gem.png' },
        { x: 500, y: 100, type: 'star', value: 18, sprite: '/assets/sprites/star.png' }
      ],
      portals: [
        { x: 50, y: 300, target: 'meadow', sprite: '/assets/sprites/portal.png' },
        { x: 750, y: 300, target: 'cave', sprite: '/assets/sprites/portal.png' }
      ],
      enemies: [
        { x: 300, y: 200, type: 'enemy', sprite: '/assets/sprites/enemy.png' },
        { x: 600, y: 400, type: 'enemy', sprite: '/assets/sprites/enemy.png' }
      ]
    },
    cave: {
      name: '🕳️ Sparkly Cave',
      background: '/assets/backgrounds/forest.png',
      color: '#696969',
      collectibles: [
        { x: 200, y: 150, type: 'gem', value: 25, sprite: '/assets/sprites/gem.png' },
        { x: 500, y: 300, type: 'star', value: 30, sprite: '/assets/sprites/star.png' }
      ],
      portals: [{ x: 50, y: 300, target: 'forest', sprite: '/assets/sprites/portal.png' }],
      enemies: [{ x: 400, y: 250, type: 'enemy', sprite: '/assets/sprites/enemy.png' }]
    }
  };

  useEffect(() => {
    const loadImage = (src) => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
      });
    };

    const loadAllImages = async () => {
      try {
        const imagePromises = [
          loadImage('/assets/sprites/player_ship.png'),
          loadImage('/assets/sprites/gem.png'),
          loadImage('/assets/sprites/star.png'),
          loadImage('/assets/sprites/heart.png'),
          loadImage('/assets/sprites/enemy.png'),
          loadImage('/assets/sprites/portal.png'),
          loadImage('/assets/backgrounds/meadow.png'),
          loadImage('/assets/backgrounds/forest.png')
        ];

        const [
          playerImg, gemImg, starImg, heartImg, 
          enemyImg, portalImg, meadowBg, forestBg
        ] = await Promise.all(imagePromises);

        imagesRef.current = {
          player: playerImg,
          gem: gemImg,
          star: starImg,
          heart: heartImg,
          enemy: enemyImg,
          portal: portalImg,
          meadow: meadowBg,
          forest: forestBg
        };
      } catch (error) {
        console.log('Some images failed to load, using fallbacks');
      }
    };

    loadAllImages();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      setKeys(prev => ({ ...prev, [e.key.toLowerCase()]: true }));
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
  }, []);

  useEffect(() => {
    if (gameState !== 'playing') return;

    const gameLoop = () => {
      setPlayer(prev => {
        let newX = prev.x;
        let newY = prev.y;
        const speed = 4;

        if (keys['w'] || keys['arrowup']) newY -= speed;
        if (keys['s'] || keys['arrowdown']) newY += speed;
        if (keys['a'] || keys['arrowleft']) newX -= speed;
        if (keys['d'] || keys['arrowright']) newX += speed;

        newX = Math.max(25, Math.min(775, newX));
        newY = Math.max(25, Math.min(575, newY));

        return { ...prev, x: newX, y: newY };
      });

      setParticles(prev => 
        prev.filter(particle => particle.life > 0)
          .map(particle => ({
            ...particle,
            x: particle.x + particle.vx,
            y: particle.y + particle.vy,
            life: particle.life - 1,
            alpha: particle.life / particle.maxLife
          }))
      );

      animationRef.current = requestAnimationFrame(gameLoop);
    };

    animationRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gameState, keys]);

  useEffect(() => {
    if (gameState !== 'playing') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const currentAreaData = areas[currentArea];

    ctx.clearRect(0, 0, 800, 600);

    if (imagesRef.current[currentArea] && currentAreaData.background.includes(currentArea)) {
      ctx.drawImage(imagesRef.current[currentArea], 0, 0, 800, 600);
    } else {
      ctx.fillStyle = currentAreaData.color;
      ctx.fillRect(0, 0, 800, 600);
    }

    currentAreaData.collectibles.forEach(item => {
      if (imagesRef.current[item.type]) {
        ctx.drawImage(imagesRef.current[item.type], item.x - 15, item.y - 15, 30, 30);
      } else {
        ctx.fillStyle = item.type === 'gem' ? '#FF69B4' : item.type === 'star' ? '#FFD700' : '#FF6347';
        ctx.beginPath();
        ctx.arc(item.x, item.y, 15, 0, Math.PI * 2);
        ctx.fill();
      }
      
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(item.x - 2, item.y - 2, 4, 4);
    });

    currentAreaData.portals.forEach(portal => {
      if (imagesRef.current.portal) {
        ctx.drawImage(imagesRef.current.portal, portal.x - 20, portal.y - 20, 40, 40);
      } else {
        ctx.fillStyle = '#9B59B6';
        ctx.beginPath();
        ctx.arc(portal.x, portal.y, 20, 0, Math.PI * 2);
        ctx.fill();
      }
      
      ctx.shadowColor = '#9B59B6';
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.arc(portal.x, portal.y, 25, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    currentAreaData.enemies.forEach(enemy => {
      if (imagesRef.current.enemy) {
        ctx.drawImage(imagesRef.current.enemy, enemy.x - 20, enemy.y - 20, 40, 40);
      } else {
        ctx.fillStyle = '#E74C3C';
        ctx.beginPath();
        ctx.arc(enemy.x, enemy.y, 20, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    if (imagesRef.current.player) {
      ctx.drawImage(imagesRef.current.player, player.x - 25, player.y - 25, 50, 50);
    } else {
      ctx.fillStyle = '#3498DB';
      ctx.beginPath();
      ctx.arc(player.x, player.y, 25, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = '#FFF';
      ctx.fillRect(player.x - 8, player.y - 12, 16, 6);
      ctx.fillStyle = '#FF69B4';
      ctx.fillRect(player.x - 6, player.y + 8, 12, 3);
    }
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.arc(player.x + 2, player.y + 2, 25, 0, Math.PI * 2);
    ctx.fill();

    particles.forEach(particle => {
      ctx.save();
      ctx.globalAlpha = particle.alpha;
      ctx.fillStyle = particle.color;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

  }, [gameState, player, particles, currentArea]);

  useEffect(() => {
    if (gameState !== 'playing') return;

    const currentAreaData = areas[currentArea];
    
    currentAreaData.collectibles.forEach((item, index) => {
      const distance = Math.sqrt(
        Math.pow(player.x - item.x, 2) + Math.pow(player.y - item.y, 2)
      );
      
      if (distance < 40) {
        setPlayer(prev => ({ ...prev, coins: prev.coins + item.value }));
        
        setParticles(prev => [
          ...prev,
          ...Array.from({ length: 8 }, (_, i) => ({
            x: item.x,
            y: item.y,
            vx: (Math.random() - 0.5) * 4,
            vy: (Math.random() - 0.5) * 4,
            size: Math.random() * 3 + 2,
            color: item.type === 'gem' ? '#FF69B4' : item.type === 'star' ? '#FFD700' : '#FF6347',
            life: 30,
            maxLife: 30
          }))
        ]);
        
        const newCollectibles = [...currentAreaData.collectibles];
        newCollectibles.splice(index, 1);
        currentAreaData.collectibles = newCollectibles;
      }
    });

    currentAreaData.portals.forEach(portal => {
      const distance = Math.sqrt(
        Math.pow(player.x - portal.x, 2) + Math.pow(player.y - portal.y, 2)
      );
      
      if (distance < 50) {
        changeArea(portal.target);
      }
    });

    currentAreaData.enemies.forEach(enemy => {
      const distance = Math.sqrt(
        Math.pow(player.x - enemy.x, 2) + Math.pow(player.y - enemy.y, 2)
      );
      
      if (distance < 45) {
        setPlayer(prev => ({ ...prev, health: Math.max(0, prev.health - 10) }));
        
        setParticles(prev => [
          ...prev,
          ...Array.from({ length: 5 }, (_, i) => ({
            x: player.x,
            y: player.y,
            vx: (Math.random() - 0.5) * 6,
            vy: (Math.random() - 0.5) * 6,
            size: Math.random() * 4 + 3,
            color: '#E74C3C',
            life: 20,
            maxLife: 20
          }))
        ]);
      }
    });
  }, [player, currentArea, gameState]);

  const changeArea = (newArea) => {
    setCurrentArea(newArea);
    setPlayer(prev => ({ ...prev, x: 100, y: 300 }));
    
    setParticles(prev => [
      ...prev,
      ...Array.from({ length: 15 }, (_, i) => ({
        x: player.x,
        y: player.y,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8,
        size: Math.random() * 5 + 3,
        color: '#9B59B6',
        life: 40,
        maxLife: 40
      }))
    ]);
  };

  const startGame = () => {
    setGameState('playing');
    setPlayer({ x: 400, y: 300, coins: 0, health: 100 });
    setCurrentArea('meadow');
    setParticles([]);
  };

  if (gameState === 'menu') {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        fontFamily: 'Arial, sans-serif'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          padding: '40px',
          borderRadius: '25px',
          textAlign: 'center',
          boxShadow: '0 16px 48px rgba(0, 0, 0, 0.3)',
          maxWidth: '600px'
        }}>
          <h1 style={{ color: '#2E86AB', fontSize: '48px' }}>🌟 Kids Adventure World 🌟</h1>
          <p style={{ fontSize: '20px', color: '#555' }}>Explore magical lands and collect treasures!</p>
          <button 
            onClick={startGame}
            style={{
              background: 'linear-gradient(45deg, #FF6B6B, #4ECDC4)',
              color: 'white',
              border: 'none',
              padding: '20px 40px',
              fontSize: '24px',
              borderRadius: '50px',
              cursor: 'pointer',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)'
            }}
          >
            🚀 Start Adventure!
          </button>
          <div style={{ marginTop: '30px' }}>
            <h3>🎯 Controls:</h3>
            <p><strong>WASD</strong> or <strong>Arrow Keys</strong> - Move around</p>
            <p>Collect colorful gems and explore new areas!</p>
            <p>Avoid red enemies and find portals to new worlds!</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh',
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        style={{
          border: '4px solid #FFD700',
          borderRadius: '15px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          marginBottom: '20px'
        }}
      />
      
      <div style={{
        width: '800px',
        background: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '15px',
        padding: '15px',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '15px'
        }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2E86AB' }}>
            {areas[currentArea].name}
          </div>
          <div style={{ display: 'flex', gap: '20px', fontSize: '18px' }}>
            <span style={{
              background: 'linear-gradient(45deg, #FF6B6B, #4ECDC4)',
              color: 'white',
              padding: '8px 12px',
              borderRadius: '20px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
            }}>
              💰 {player.coins}
            </span>
            <span style={{
              background: 'linear-gradient(45deg, #E74C3C, #FF6B6B)',
              color: 'white',
              padding: '8px 12px',
              borderRadius: '20px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
            }}>
              ❤️ {player.health}
            </span>
          </div>
        </div>
        
        <div style={{ textAlign: 'center' }}>
          <button 
            onClick={() => setGameState('menu')}
            style={{
              background: 'linear-gradient(45deg, #FF6B6B, #4ECDC4)',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '20px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            🏠 Main Menu
          </button>
        </div>
      </div>
    </div>
  );
};

export default SimpleGame;
