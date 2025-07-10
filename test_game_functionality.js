// Automated test for game functionality
console.log('=== GAME FUNCTIONALITY TEST START ===');

// Wait for game to be properly initialized
function waitForGameInitialization() {
    return new Promise((resolve) => {
        const checkInitialization = () => {
            // Check if game is initialized by looking for key elements and variables
            const canvas = document.getElementById('gameCanvas');
            const gameState = window.gameState;
            const player = window.player;
            
            if (canvas && typeof gameState !== 'undefined' && player) {
                console.log('✅ Game initialization detected');
                resolve();
            } else {
                console.log('⏳ Waiting for game initialization...');
                setTimeout(checkInitialization, 100);
            }
        };
        checkInitialization();
    });
}

// Test 1: Check if all required elements exist
function testGameElements() {
    console.log('Testing game elements...');
    
    const requiredElements = [
        'gameCanvas',
        'startBtn', 
        'restartBtn',
        'scoreDisplay',
        'menuContainer',
        'gameContainer'
    ];
    
    let allElementsFound = true;
    
    for (let elementId of requiredElements) {
        const element = document.getElementById(elementId);
        if (element) {
            console.log(`✅ ${elementId} found`);
        } else {
            console.log(`❌ ${elementId} NOT found`);
            allElementsFound = false;
        }
    }
    
    return allElementsFound;
}

// Test 2: Check if game functions are defined
function testGameFunctions() {
    console.log('Testing game functions...');
    
    const requiredFunctions = [
        'startGame',
        'gameOver', 
        'restartGame',
        'shoot',
        'drawBullets',
        'drawPlayer',
        'drawEnemies',
        'updatePlayer',
        'updateBullets',
        'checkCollisions'
    ];
    
    let allFunctionsFound = true;
    
    requiredFunctions.forEach(funcName => {
        if (typeof window[funcName] === 'function') {
            console.log(`✅ ${funcName} function found`);
        } else {
            console.log(`❌ ${funcName} function NOT found`);
            allFunctionsFound = false;
        }
    });
    
    return allFunctionsFound;
}

// Test 3: Check if game state variables are initialized
function testGameState() {
    console.log('Testing game state...');
    
    const requiredVariables = [
        'gameState',
        'player',
        'bullets',
        'enemies',
        'score',
        'lives',
        'level'
    ];
    
    let allVariablesFound = true;
    
    requiredVariables.forEach(varName => {
        if (window[varName] !== undefined) {
            console.log(`✅ ${varName} variable found`);
        } else {
            console.log(`❌ ${varName} variable NOT found`);
            allVariablesFound = false;
        }
    });
    
    return allVariablesFound;
}

// Test 4: Simulate game start and check for errors
function testGameStart() {
    console.log('Testing game start functionality...');
    
    try {
        // Check if startGame function exists
        if (typeof startGame === 'function') {
            console.log('✅ startGame function exists');
            
            // Try to call startGame (this should not cause errors)
            const originalGameState = window.gameState;
            startGame();
            
            // Check if game state changed
            if (window.gameState === 'playing') {
                console.log('✅ Game state changed to playing');
            } else {
                console.log('❌ Game state did not change to playing');
            }
            
            // Reset state
            window.gameState = originalGameState;
            
        } else {
            console.log('❌ startGame function not found');
            return false;
        }
        
        return true;
    } catch (error) {
        console.log(`❌ Error during game start test: ${error.message}`);
        return false;
    }
}

// Test 5: Check for JavaScript errors
function testForErrors() {
    console.log('Checking for JavaScript errors...');
    
    // Override console.error to catch errors
    const originalError = console.error;
    let errorsFound = [];
    
    console.error = function(...args) {
        errorsFound.push(args.join(' '));
        originalError.apply(console, args);
    };
    
    // Wait a moment for any errors to appear
    setTimeout(() => {
        if (errorsFound.length === 0) {
            console.log('✅ No JavaScript errors detected');
        } else {
            console.log(`❌ ${errorsFound.length} JavaScript errors detected:`);
            errorsFound.forEach(error => console.log(`   - ${error}`));
        }
        
        // Restore original console.error
        console.error = originalError;
    }, 1000);
}

// Run all tests
async function runAllTests() {
    console.log('=== RUNNING AUTOMATED GAME TESTS ===');
    
    // Wait for game initialization
    await waitForGameInitialization();
    
    const testResults = {
        elements: testGameElements(),
        functions: testGameFunctions(),
        state: testGameState(),
        start: testGameStart()
    };
    
    testForErrors();
    
    // Summary
    console.log('\n=== TEST SUMMARY ===');
    const allPassed = Object.values(testResults).every(result => result);
    
    if (allPassed) {
        console.log('✅ ALL TESTS PASSED - Game should work properly!');
    } else {
        console.log('❌ SOME TESTS FAILED - Game may have issues');
        Object.entries(testResults).forEach(([test, passed]) => {
            console.log(`${passed ? '✅' : '❌'} ${test} test`);
        });
    }
    
    return allPassed;
}

// Run tests after waiting for initialization
runAllTests(); 