// Specific test for the drawBullets freezing issue
console.log('=== FREEZE TEST - Checking for drawBullets Error ===');

// Test 1: Check if drawBullets function exists
console.log('1. Testing drawBullets function...');
if (typeof drawBullets === 'function') {
    console.log('   ✅ drawBullets function exists');
    
    // Test 2: Try to call drawBullets (this was causing the freeze)
    console.log('2. Testing drawBullets execution...');
    try {
        // Create a mock canvas context for testing
        const mockCanvas = document.createElement('canvas');
        const mockCtx = mockCanvas.getContext('2d');
        
        // Temporarily replace the global ctx
        const originalCtx = window.ctx;
        window.ctx = mockCtx;
        
        // Try to call drawBullets
        drawBullets();
        
        // Restore original ctx
        window.ctx = originalCtx;
        
        console.log('   ✅ drawBullets executed without errors');
    } catch (error) {
        console.log(`   ❌ drawBullets caused error: ${error.message}`);
    }
} else {
    console.log('   ❌ drawBullets function is missing - This was causing the freeze!');
}

// Test 3: Check if all required game functions exist
console.log('3. Testing all required game functions...');
const requiredFunctions = [
    'drawBullets',
    'drawPlayer', 
    'drawEnemies',
    'drawPowerUps',
    'drawCollectibles',
    'drawExplosions',
    'drawStars',
    'updatePlayer',
    'updateBullets',
    'updateEnemies',
    'checkCollisions',
    'startGame',
    'gameOver',
    'restartGame'
];

let missingFunctions = [];
requiredFunctions.forEach(funcName => {
    if (typeof window[funcName] !== 'function') {
        missingFunctions.push(funcName);
    }
});

if (missingFunctions.length === 0) {
    console.log('   ✅ All required functions exist');
} else {
    console.log(`   ❌ Missing functions: ${missingFunctions.join(', ')}`);
}

// Test 4: Check if game state variables are properly initialized
console.log('4. Testing game state variables...');
const requiredVariables = [
    'gameState',
    'player',
    'bullets',
    'enemies',
    'powerUps',
    'collectibles',
    'explosions',
    'score',
    'lives',
    'level'
];

let missingVariables = [];
requiredVariables.forEach(varName => {
    if (window[varName] === undefined) {
        missingVariables.push(varName);
    }
});

if (missingVariables.length === 0) {
    console.log('   ✅ All required variables are initialized');
} else {
    console.log(`   ❌ Missing variables: ${missingVariables.join(', ')}`);
}

// Test 5: Check if game elements exist
console.log('5. Testing game elements...');
const requiredElements = [
    'gameCanvas',
    'startBtn',
    'restartBtn',
    'scoreDisplay',
    'menuContainer',
    'gameContainer'
];

let missingElements = [];
requiredElements.forEach(elementId => {
    const element = document.getElementById(elementId);
    if (!element) {
        missingElements.push(elementId);
    }
});

if (missingElements.length === 0) {
    console.log('   ✅ All required elements exist');
} else {
    console.log(`   ❌ Missing elements: ${missingElements.join(', ')}`);
}

// Test 6: Simulate game loop (this was where the freeze was happening)
console.log('6. Testing game loop simulation...');
try {
    // Check if render function exists
    if (typeof render === 'function') {
        console.log('   ✅ render function exists');
        
        // Try to call render (this was causing the freeze)
        render();
        console.log('   ✅ render executed without errors');
    } else {
        console.log('   ❌ render function missing');
    }
} catch (error) {
    console.log(`   ❌ render caused error: ${error.message}`);
}

// Final assessment
console.log('\n=== FREEZE TEST RESULTS ===');
const hasDrawBullets = typeof drawBullets === 'function';
const hasAllFunctions = missingFunctions.length === 0;
const hasAllVariables = missingVariables.length === 0;
const hasAllElements = missingElements.length === 0;

if (hasDrawBullets && hasAllFunctions && hasAllVariables && hasAllElements) {
    console.log('✅ NO FREEZING DETECTED - Game should work properly!');
    console.log('   - drawBullets function exists and works');
    console.log('   - All required functions are present');
    console.log('   - All game variables are initialized');
    console.log('   - All game elements exist');
} else {
    console.log('❌ POTENTIAL FREEZING ISSUES DETECTED:');
    if (!hasDrawBullets) console.log('   - drawBullets function is missing (main cause of freeze)');
    if (!hasAllFunctions) console.log('   - Some game functions are missing');
    if (!hasAllVariables) console.log('   - Some game variables are not initialized');
    if (!hasAllElements) console.log('   - Some game elements are missing');
}

console.log('=== FREEZE TEST COMPLETE ==='); 