import React, { useState, useEffect, useRef } from 'react';

const WorkingGame = () => {
  const [gameState, setGameState] = useState('menu');
  const [player, setPlayer] = useState({ x: 400, y: 300, coins: 0 });
  const [keys, setKeys] = useState({});
  const [currentArea, setCurrentArea] = useState('meadow');
  
  const canvasRef = useRef(null);
  const gameLoopRef = useRef(null);

  const areas = {
    meadow: {
      name: 'Sunny Meadow',
      color: '#90EE90',
      collectibles: [
        { x: 200, y: 150, color: '#FF69B4', value: 5 },
        { x: 600, y: 200, color: '#FFD700', value: 10 }
      ],
      portals: [{ x: 750, y: 300, target: 'forest', name: 'Forest' }]
    },
    forest: {
      name: 'Enchanted Forest',
      color: '#228B22',
      collectibles: [
        { x: 150, y: 200, color: '#8B4513', value: 8 }
      ],
      portals: [{ x: 50, y: 300, target: 'meadow', name: 'Meadow' }]
    }
  };

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
        const speed = 3;

        if (keys['w'] || keys['arrowup']) newY -= speed;
        if (keys['s'] || keys['arrowdown']) newY += speed;
        if (keys['a'] || keys['arrowleft']) newX -= speed;
        if (keys['d'] || keys['arrowright']) newX += speed;

        newX = Math.max(25, Math.min(775, newX));
        newY = Math.max(25, Math.min(575, newY));

        return { ...prev, x: newX, y: newY };
      });

      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameState, keys]);

  useEffect(() => {
    if (gameState === 'playing') {
      renderGame();
    }
  }, [gameState, player, currentArea]);

  const renderGame = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const currentAreaData = areas[currentArea];

    // Clear canvas
    ctx.clearRect(0, 0, 800, 600);

    // Draw background
    ctx.fillStyle = currentAreaData.color;
    ctx.fillRect(0, 0, 800, 600);

    // Draw collectibles
    currentAreaData.collectibles.forEach(item => {
      ctx.fillStyle = item.color;
      ctx.beginPath();
      ctx.arc(item.x, item.y, 15, 0, Math.PI * 2);
      ctx.fill();
      
      // Add sparkle
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(item.x - 2, item.y - 2, 4, 4);
    });

    // Draw portals
    currentAreaData.portals.forEach(portal => {
      ctx.fillStyle = '#9B59B6';
      ctx.beginPath();
      ctx.arc(portal.x, portal.y, 25, 0, Math.PI * 2);
      ctx.fill();
      
      // Portal label
      ctx.fillStyle = '#FFF';
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(portal.name, portal.x, portal.y + 40);
    });

    // Draw player
    ctx.fillStyle = '#3498DB';
    ctx.beginPath();
    ctx.arc(player.x, player.y, 25, 0, Math.PI * 2);
    ctx.fill();
    
    // Player details
    ctx.fillStyle = '#FFF';
    ctx.fillRect(player.x - 8, player.y - 12, 16, 6); // Eyes
    ctx.fillStyle = '#FF69B4';
    ctx.fillRect(player.x - 6, player.y + 8, 12, 3);  // Mouth
  };

  const changeArea = (newArea) => {
    setCurrentArea(newArea);
    setPlayer(prev => ({ ...prev, x: 100, y: 300 }));
  };

  const startGame = () => {
    setGameState('playing');
    setPlayer({ x: 400, y: 300, coins: 0 });
    setCurrentArea('meadow');
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

export default WorkingGame;
