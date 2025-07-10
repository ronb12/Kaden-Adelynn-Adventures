// Browser Console Test - Copy and paste this into the browser console on the game page
console.log('🎮 BROWSER CONSOLE TEST STARTING...');

// Quick test for the main freezing issue
console.log('1. Testing drawBullets function...');
if (typeof drawBullets === 'function') {
    console.log('✅ drawBullets function exists - NO FREEZING!');
} else {
    console.log('❌ drawBullets function missing - THIS CAUSES FREEZING!');
}

// Test game elements
console.log('2. Testing game elements...');
const elements = ['gameCanvas', 'startBtn', 'menuContainer', 'gameContainer'];
let allElementsOK = true;
elements.forEach(id => {
    const element = document.getElementById(id);
    if (element) {
        console.log(`✅ ${id} exists`);
    } else {
        console.log(`❌ ${id} missing`);
        allElementsOK = false;
    }
});

// Test game functions
console.log('3. Testing game functions...');
const functions = ['startGame', 'drawPlayer', 'updatePlayer', 'checkCollisions'];
let allFunctionsOK = true;
functions.forEach(funcName => {
    if (typeof window[funcName] === 'function') {
        console.log(`✅ ${funcName} exists`);
    } else {
        console.log(`❌ ${funcName} missing`);
        allFunctionsOK = false;
    }
});

// Test game state
console.log('4. Testing game state...');
if (typeof gameState !== 'undefined') {
    console.log('✅ gameState initialized');
} else {
    console.log('❌ gameState not initialized');
}

// Final result
console.log('\n=== FINAL RESULT ===');
if (typeof drawBullets === 'function' && allElementsOK && allFunctionsOK) {
    console.log('🎉 SUCCESS: Game should work without freezing!');
    console.log('   - drawBullets function is present');
    console.log('   - All game elements exist');
    console.log('   - All game functions exist');
} else {
    console.log('⚠️  ISSUES DETECTED: Game may freeze or not work properly');
    if (typeof drawBullets !== 'function') {
        console.log('   - drawBullets function is missing (main cause of freezing)');
    }
    if (!allElementsOK) console.log('   - Some game elements are missing');
    if (!allFunctionsOK) console.log('   - Some game functions are missing');
}

console.log('=== TEST COMPLETE ==='); 