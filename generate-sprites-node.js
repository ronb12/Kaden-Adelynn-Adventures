const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

// Create canvas
const canvas = createCanvas(64, 64);
const ctx = canvas.getContext('2d');

// Ensure directories exist
const spritesDir = path.join(__dirname, 'public', 'assets', 'sprites');
const playerDir = path.join(spritesDir, 'player');
const enemiesDir = path.join(spritesDir, 'enemies');

[spritesDir, playerDir, enemiesDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

function drawGradiusShip(ctx, color = '#00ffff') {
    // Clear canvas
    ctx.clearRect(0, 0, 64, 64);
    
    // Gradius Vic Viper ship design
    const shipColor = color;
    const accentColor = '#ffffff';
    const cockpitColor = '#87ceeb';
    const engineColor = '#ff6600';
    const cockpitDetailColor = '#000080';
    
    // Main body - nose cone
    ctx.fillStyle = shipColor;
    ctx.beginPath();
    ctx.moveTo(32, 8);
    ctx.lineTo(28, 16);
    ctx.lineTo(36, 16);
    ctx.closePath();
    ctx.fill();
    
    // Main body - fuselage
    ctx.beginPath();
    ctx.moveTo(28, 16);
    ctx.lineTo(24, 32);
    ctx.lineTo(22, 40);
    ctx.lineTo(20, 48);
    ctx.lineTo(18, 56);
    ctx.lineTo(46, 56);
    ctx.lineTo(44, 48);
    ctx.lineTo(42, 40);
    ctx.lineTo(40, 32);
    ctx.lineTo(36, 16);
    ctx.closePath();
    ctx.fill();
    
    // Wings
    ctx.fillStyle = shipColor;
    // Left wing
    ctx.beginPath();
    ctx.moveTo(24, 32);
    ctx.lineTo(16, 40);
    ctx.lineTo(14, 48);
    ctx.lineTo(20, 48);
    ctx.lineTo(22, 40);
    ctx.closePath();
    ctx.fill();
    
    // Right wing
    ctx.beginPath();
    ctx.moveTo(40, 32);
    ctx.lineTo(48, 40);
    ctx.lineTo(50, 48);
    ctx.lineTo(44, 48);
    ctx.lineTo(42, 40);
    ctx.closePath();
    ctx.fill();
    
    // Engine details (orange thrusters)
    ctx.fillStyle = engineColor;
    ctx.fillRect(26, 44, 3, 8);
    ctx.fillRect(35, 44, 3, 8);
    
    // Cockpit
    ctx.fillStyle = cockpitColor;
    ctx.beginPath();
    ctx.ellipse(32, 28, 6, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Cockpit details
    ctx.fillStyle = cockpitDetailColor;
    ctx.beginPath();
    ctx.ellipse(32, 28, 3, 2, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Ship details
    ctx.fillStyle = accentColor;
    // Nose detail
    ctx.fillRect(31, 10, 2, 4);
    
    // Body line
    ctx.beginPath();
    ctx.moveTo(32, 16);
    ctx.lineTo(32, 48);
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // Wing details
    ctx.fillStyle = accentColor;
    ctx.fillRect(30, 36, 4, 2);
    ctx.fillRect(30, 42, 4, 2);
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

function saveSprite(canvas, filename) {
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(filename, buffer);
    console.log(`✅ Generated: ${filename}`);
}

// Generate player sprites (Gradius style)
console.log('🎮 Generating Gradius-style player sprites...');
const playerSprites = [
    { name: 'fighter-01', color: '#00ffff' },
    { name: 'fighter-02', color: '#00ff00' },
    { name: 'fighter-03', color: '#ff00ff' }
];

playerSprites.forEach(sprite => {
    drawGradiusShip(ctx, sprite.color);
    const filepath = path.join(playerDir, sprite.name + '.png');
    saveSprite(canvas, filepath);
});

// Generate enemy sprites
console.log('👾 Generating enemy sprites...');
const enemySprites = [
    { name: 'basic-enemy', color: '#ff0000', type: 'basic' },
    { name: 'fast-enemy', color: '#ff6600', type: 'fast' },
    { name: 'tank-enemy', color: '#660066', type: 'tank' },
    { name: 'boss-enemy', color: '#ff0066', type: 'boss' }
];

enemySprites.forEach(sprite => {
    canvas.width = 64;
    canvas.height = 64;
    ctx.clearRect(0, 0, 64, 64);
    drawEnemyShip(ctx, sprite.color, sprite.type);
    const filepath = path.join(enemiesDir, sprite.name + '.png');
    saveSprite(canvas, filepath);
});

console.log('🎯 All sprites generated successfully!');
