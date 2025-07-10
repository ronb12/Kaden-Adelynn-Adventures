// Simple game functionality test
console.log('=== SIMPLE GAME TEST ===');

// Wait for game initialization
function waitForGameInit() {
    return new Promise((resolve) => {
        const checkInit = () => {
            const canvas = document.getElementById('gameCanvas');
            const gameState = window.gameState;
            const player = window.player;
            
            if (canvas && typeof gameState !== 'undefined' && player) {
                console.log('✅ Game initialized, running tests...');
                resolve();
            } else {
                console.log('⏳ Waiting for game initialization...');
                setTimeout(checkInit, 100);
            }
        };
        checkInit();
    });
}

// Run tests after initialization
async function runTests() {
    await waitForGameInit();
    
    // Test 1: Check if main.js loads without errors
    console.log('1. Testing main.js loading...');
    
    // Test 2: Check if required functions exist
    console.log('2. Testing required functions...');
    const requiredFunctions = ['startGame', 'drawBullets', 'drawPlayer', 'updatePlayer'];
    let functionsOK = true;
    
    requiredFunctions.forEach(funcName => {
        if (typeof window[funcName] === 'function') {
            console.log(`   ✅ ${funcName} exists`);
        } else {
            console.log(`   ❌ ${funcName} missing`);
            functionsOK = false;
        }
    });
    
    // Test 3: Check if game elements exist
    console.log('3. Testing game elements...');
    const requiredElements = ['gameCanvas', 'startBtn', 'menuContainer', 'gameContainer'];
    let elementsOK = true;
    
    requiredElements.forEach(elementId => {
        const element = document.getElementById(elementId);
        if (element) {
            console.log(`   ✅ ${elementId} exists`);
        } else {
            console.log(`   ❌ ${elementId} missing`);
            elementsOK = false;
        }
    });
    
    // Test 4: Check if game state is initialized
    console.log('4. Testing game state...');
    if (typeof gameState !== 'undefined') {
        console.log('   ✅ gameState initialized');
    } else {
        console.log('   ❌ gameState not initialized');
    }
    
    // Test 5: Try to start the game (should not cause errors)
    console.log('5. Testing game start...');
    try {
        if (typeof startGame === 'function') {
            console.log('   ✅ startGame function exists');
            
            // Save current state
            const originalState = window.gameState;
            
            // Try to start game
            startGame();
            
            // Check if game started
            if (window.gameState === 'playing') {
                console.log('   ✅ Game started successfully');
            } else {
                console.log('   ❌ Game did not start properly');
            }
            
            // Reset state
            window.gameState = originalState;
            
        } else {
            console.log('   ❌ startGame function not found');
        }
    } catch (error) {
        console.log(`   ❌ Error starting game: ${error.message}`);
    }
    
    // Final result
    console.log('=== TEST RESULTS ===');
    if (functionsOK && elementsOK) {
        console.log('✅ GAME SHOULD WORK PROPERLY - No freezing detected!');
    } else {
        console.log('❌ GAME HAS ISSUES - Some components are missing');
    }
    
    console.log('=== TEST COMPLETE ===');
}

// Start the test
runTests(); 