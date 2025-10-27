#!/usr/bin/env node

// Auto-build feature implementation script
// This script adds missing features to Game.jsx automatically

const fs = require('fs');

const GameFile = 'src/components/Game.jsx';

console.log('🚀 Auto-Implementing Features...\n');

// Read the current game file
let gameContent = fs.readFileSync(GameFile, 'utf8');

// Feature 1: Add asteroids to game state
if (!gameContent.includes('asteroids: []')) {
    console.log('✅ Adding asteroid system...');
    
    // Add asteroids to gameState
    gameContent = gameContent.replace(
        /enemyBullets: \[\],[\s\S]*?lastFrameTime: 0,/,
        `enemyBullets: [],
    asteroids: [],
    lastAsteroidSpawn: 0,
    lastFrameTime: 0,`
    );
    
    // Add asteroid update function after updatePlasmaBeams
    const asteroidCode = `
  const updateAsteroids = (state) => {
    const timeScale = Math.min(state.deltaTime / 16.67, 2)
    state.asteroids = state.asteroids.filter(asteroid => {
      asteroid.x += asteroid.vx * timeScale
      asteroid.y += asteroid.vy * timeScale
      asteroid.rotation += 0.02 * timeScale
      
      // Wrap around screen
      if (asteroid.x < -50) asteroid.x = canvasRef.current.width + 50
      if (asteroid.x > canvasRef.current.width + 50) asteroid.x = -50
      if (asteroid.y < -50) asteroid.y = canvasRef.current.height + 50
      if (asteroid.y > canvasRef.current.height + 50) asteroid.y = -50
      
      return true
    })
  }

  const spawnAsteroids = (state) => {
    if (state.enemies.length === 0 && Math.random() < 0.01) {
      const asteroid = {
        x: Math.random() * canvasRef.current.width,
        y: Math.random() * canvasRef.current.height,
        size: 20 + Math.random() * 30,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        rotation: Math.random() * Math.PI * 2,
        health: 2
      }
      state.asteroids.push(asteroid)
    }
  }`;

    // Insert asteroid functions after updatePlasmaBeams
    const insertPos = gameContent.indexOf('const spawnPowerUps = (state) =>');
    gameContent = gameContent.slice(0, insertPos) + asteroidCode + '\n\n  ' + gameContent.slice(insertPos);
    
    // Add asteroid updates to game loop
    gameContent = gameContent.replace(
        'updatePlasmaBeams(state)',
        'updatePlasmaBeams(state)\n    updateAsteroids(state)\n    spawnAsteroids(state)'
    );
    
    // Add asteroid drawing
    const drawAsteroidCode = `
  const drawAsteroids = (ctx, state) => {
    state.asteroids.forEach(asteroid => {
      ctx.save()
      ctx.translate(asteroid.x, asteroid.y)
      ctx.rotate(asteroid.rotation)
      ctx.fillStyle = '#8B4513'
      ctx.beginPath()
      ctx.moveTo(0, -asteroid.size)
      ctx.lineTo(asteroid.size * 0.7, -asteroid.size * 0.5)
      ctx.lineTo(asteroid.size * 0.8, asteroid.size * 0.5)
      ctx.lineTo(0, asteroid.size)
      ctx.lineTo(-asteroid.size * 0.8, asteroid.size * 0.5)
      ctx.lineTo(-asteroid.size * 0.7, -asteroid.size * 0.5)
      ctx.closePath()
      ctx.fill()
      ctx.strokeStyle = '#654321'
      ctx.lineWidth = 2
      ctx.stroke()
      ctx.restore()
    })
  }`;

    const drawInsertPos = gameContent.indexOf('const drawBoss = (ctx, state) =>');
    gameContent = gameContent.slice(0, drawInsertPos) + drawAsteroidCode + '\n\n  ' + gameContent.slice(drawInsertPos);
    
    gameContent = gameContent.replace(
        'drawBackgroundElements(ctx, state)',
        'drawBackgroundElements(ctx, state)\n    drawAsteroids(ctx, state)'
    );
}

// Feature 2: Enhanced formation patterns
if (!gameContent.includes('formation: "v"')) {
    console.log('✅ Adding formation patterns...');
    
    // Update spawnEnemies to include formations
    gameContent = gameContent.replace(
        /pattern: Math\.random\(\) > 0\.7 \? 'zigzag' : 'normal',/,
        `pattern: Math.random() > 0.3 ? 'normal' : Math.random() > 0.5 ? 'zigzag' : 'formation',
    formation: Math.random() > 0.5 ? 'v' : 'line',`
    );
    
    // Update enemy movement to support formations
    const formationUpdate = `
    if (enemy.pattern === 'formation') {
      const formationOffset = state.enemiesSpawned % 5 * 40
      enemy.x = Math.sin((enemy.y + formationOffset) / 30) * 50 + canvasRef.current.width / 2
    }`;
    
    gameContent = gameContent.replace(
        /if \(enemy\.pattern === 'zigzag'\) enemy\.x \+= Math\.sin\(enemy\.y \/ 10\) \* 2 \* timeScale/,
        `if (enemy.pattern === 'zigzag') enemy.x += Math.sin(enemy.y / 10) * 2 * timeScale${formationUpdate}`
    );
}

// Feature 3: Game modes
if (!gameContent.includes('gameMode: "classic"')) {
    console.log('✅ Adding game mode system...');
    
    gameContent = gameContent.replace(
        /isBossFight: false,/,
        `isBossFight: false,
    gameMode: 'classic',  // classic, arcade, survival, bossRush`
    );
    
    const gameModeCode = `
  const processGameMode = (state) => {
    if (state.gameMode === 'arcade') {
      // Faster spawns in arcade mode
      state.lastEnemySpawn = Math.max(0, state.lastEnemySpawn - 200)
    } else if (state.gameMode === 'survival') {
      // Endless mode - increase difficulty over time
      if (state.enemiesSpawned % 20 === 0) {
        state.scoreMultiplier += 0.1
      }
    } else if (state.gameMode === 'bossRush') {
      // Spawn bosses more frequently
      if (state.enemiesSpawned % 30 === 0 && !state.isBossFight) {
        state.isBossFight = true
        state.boss = spawnBoss('asteroid', canvasRef.current.width / 2, 100)
      }
    }
  }`;

    const modeInsertPos = gameContent.indexOf('const checkLevelProgression = (state) =>');
    gameContent = gameContent.slice(0, modeInsertPos) + gameModeCode + '\n\n  ' + gameContent.slice(modeInsertPos);
    
    gameContent = gameContent.replace(
        'checkLevelProgression(state)',
        'checkLevelProgression(state)\n    processGameMode(state)'
    );
}

// Write back to file
fs.writeFileSync(GameFile, gameContent, 'utf8');

console.log('\n✅ Features implemented successfully!');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
console.log('Next steps:');
console.log('1. Run: npm run build');
console.log('2. Test: npm run dev');
console.log('3. Deploy: firebase deploy --only hosting\n');

