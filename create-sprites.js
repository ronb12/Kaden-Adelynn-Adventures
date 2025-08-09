const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

// Create canvas
const canvas = createCanvas(64, 64);
const ctx = canvas.getContext('2d');

// Ensure sprites directory exists
const spritesDir = path.join(__dirname, 'public', 'assets', 'sprites');
const playerDir = path.join(spritesDir, 'player');
const enemiesDir = path.join(spritesDir, 'enemies');

[spritesDir, playerDir, enemiesDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

function drawFighterShip(ctx, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(32, 8);
    ctx.lineTo(20, 48);
    ctx.lineTo(28, 48);
    ctx.lineTo(28, 56);
    ctx.lineTo(36, 56);
    ctx.lineTo(36, 48);
    ctx.lineTo(44, 48);
    ctx.closePath();
    ctx.fill();
    
    // Cockpit
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(32, 32, 4, 2, 0, 0, Math.PI * 2);
    ctx.fill();
}

function drawInterceptorShip(ctx, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(32, 8);
    ctx.lineTo(24, 48);
    ctx.lineTo(28, 48);
    ctx.lineTo(28, 56);
    ctx.lineTo(36, 56);
    ctx.lineTo(36, 48);
    ctx.lineTo(40, 48);
    ctx.closePath();
    ctx.fill();
    
    // Cockpit
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(32, 32, 3, 2, 0, 0, Math.PI * 2);
    ctx.fill();
}

function drawDestroyerShip(ctx, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(32, 8);
    ctx.lineTo(16, 48);
    ctx.lineTo(24, 48);
    ctx.lineTo(24, 56);
    ctx.lineTo(40, 56);
    ctx.lineTo(40, 48);
    ctx.lineTo(48, 48);
    ctx.closePath();
    ctx.fill();
    
    // Cockpit
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(32, 32, 5, 3, 0, 0, Math.PI * 2);
    ctx.fill();
}

function drawEnemyShip(ctx, color, type) {
    ctx.fillStyle = color;
    ctx.beginPath();
    
    switch(type) {
        case 'basic':
            ctx.moveTo(32, 56);
            ctx.lineTo(44, 16);
            ctx.lineTo(40, 16);
            ctx.lineTo(32, 48);
            ctx.lineTo(24, 48);
            ctx.lineTo(20, 16);
            ctx.lineTo(16, 16);
            ctx.closePath();
            break;
        case 'fast':
            ctx.moveTo(32, 56);
            ctx.lineTo(40, 16);
            ctx.lineTo(36, 16);
            ctx.lineTo(32, 48);
            ctx.lineTo(28, 48);
            ctx.lineTo(24, 16);
            ctx.lineTo(20, 16);
            ctx.closePath();
            break;
        case 'tank':
            ctx.moveTo(32, 56);
            ctx.lineTo(48, 16);
            ctx.lineTo(44, 16);
            ctx.lineTo(36, 48);
            ctx.lineTo(28, 48);
            ctx.lineTo(20, 16);
            ctx.lineTo(16, 16);
            ctx.closePath();
            break;
        case 'boss':
            ctx.moveTo(32, 56);
            ctx.lineTo(56, 16);
            ctx.lineTo(52, 16);
            ctx.lineTo(40, 48);
            ctx.lineTo(24, 48);
            ctx.lineTo(12, 16);
            ctx.lineTo(8, 16);
            ctx.closePath();
            break;
    }
    
    ctx.fill();
    
    // Enemy cockpit
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(32, 32, 3, 2, 0, 0, Math.PI * 2);
    ctx.fill();
}

function generateSprite(spriteData, type, outputDir) {
    canvas.width = 64;
    canvas.height = 64;
    ctx.clearRect(0, 0, 64, 64);
    
    if (type === 'player') {
        switch(spriteData.shape) {
            case 'fighter':
                drawFighterShip(ctx, spriteData.color);
                break;
            case 'interceptor':
                drawInterceptorShip(ctx, spriteData.color);
                break;
            case 'destroyer':
                drawDestroyerShip(ctx, spriteData.color);
                break;
        }
    } else {
        drawEnemyShip(ctx, spriteData.color, spriteData.shape);
    }
    
    const buffer = canvas.toBuffer('image/png');
    const filePath = path.join(outputDir, spriteData.name + '.png');
    fs.writeFileSync(filePath, buffer);
    console.log(`Generated: ${filePath}`);
}

// Player sprites
const playerSprites = [
    { name: 'fighter-01', color: '#00ffff', shape: 'fighter' },
    { name: 'fighter-02', color: '#00ff00', shape: 'interceptor' },
    { name: 'fighter-03', color: '#ff00ff', shape: 'destroyer' }
];

// Enemy sprites
const enemySprites = [
    { name: 'basic-enemy', color: '#ff0000', shape: 'basic' },
    { name: 'fast-enemy', color: '#ff6600', shape: 'fast' },
    { name: 'tank-enemy', color: '#660066', shape: 'tank' },
    { name: 'boss-enemy', color: '#ff0066', shape: 'boss' }
];

// Generate sprites
playerSprites.forEach(sprite => {
    generateSprite(sprite, 'player', playerDir);
});

enemySprites.forEach(sprite => {
    generateSprite(sprite, 'enemy', enemiesDir);
});

console.log('All sprites generated successfully!');
