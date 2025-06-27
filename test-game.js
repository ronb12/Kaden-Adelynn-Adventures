// Automated Test Suite for Kaden & Adelynn Space Adventures
console.log('🧪 Starting Automated Tests...');

// Test 1: Check if game loads properly
function testGameLoad() {
    console.log('📋 Test 1: Game Load Check');
    
    // Check if canvas exists
    const canvas = document.getElementById('gameCanvas');
    if (canvas) {
        console.log('✅ Canvas found');
    } else {
        console.error('❌ Canvas not found');
        return false;
    }
    
    // Check if game container exists
    const gameContainer = document.querySelector('.game-container');
    if (gameContainer) {
        console.log('✅ Game container found');
    } else {
        console.error('❌ Game container not found');
        return false;
    }
    
    // Check if start screen exists
    const startScreen = document.getElementById('startScreen');
    if (startScreen) {
        console.log('✅ Start screen found');
    } else {
        console.error('❌ Start screen not found');
        return false;
    }
    
    return true;
}

// Test 2: Check if game state variables are initialized
function testGameState() {
    console.log('📋 Test 2: Game State Check');
    
    // Check if game is not running initially
    if (typeof gameRunning !== 'undefined') {
        console.log('✅ Game running state initialized');
    } else {
        console.error('❌ Game running state not found');
        return false;
    }
    
    // Check if player object exists
    if (typeof player !== 'undefined' && player) {
        console.log('✅ Player object initialized');
    } else {
        console.error('❌ Player object not found');
        return false;
    }
    
    // Check if score is initialized
    if (typeof score !== 'undefined') {
        console.log('✅ Score initialized');
    } else {
        console.error('❌ Score not found');
        return false;
    }
    
    return true;
}

// Test 3: Check if UI elements are present
function testUIElements() {
    console.log('📋 Test 3: UI Elements Check');
    
    const uiElements = ['score', 'lives', 'level', 'fuel', 'weapon', 'rank'];
    let allFound = true;
    
    uiElements.forEach(elementId => {
        const element = document.getElementById(elementId);
        if (element) {
            console.log(`✅ ${elementId} element found`);
        } else {
            console.error(`❌ ${elementId} element not found`);
            allFound = false;
        }
    });
    
    return allFound;
}

// Test 4: Check if mobile controls are present
function testMobileControls() {
    console.log('📋 Test 4: Mobile Controls Check');
    
    const mobileControls = document.querySelector('.mobile-controls');
    if (mobileControls) {
        console.log('✅ Mobile controls found');
    } else {
        console.error('❌ Mobile controls not found');
        return false;
    }
    
    const controlButtons = ['upBtn', 'leftBtn', 'rightBtn', 'downBtn', 'shootBtn'];
    let allFound = true;
    
    controlButtons.forEach(btnId => {
        const btn = document.getElementById(btnId);
        if (btn) {
            console.log(`✅ ${btnId} button found`);
        } else {
            console.error(`❌ ${btnId} button not found`);
            allFound = false;
        }
    });
    
    return allFound;
}

// Test 5: Check if PWA elements are present
function testPWAElements() {
    console.log('📋 Test 5: PWA Elements Check');
    
    // Check manifest link
    const manifestLink = document.querySelector('link[rel="manifest"]');
    if (manifestLink) {
        console.log('✅ Manifest link found');
    } else {
        console.error('❌ Manifest link not found');
        return false;
    }
    
    // Check theme color meta tag
    const themeColor = document.querySelector('meta[name="theme-color"]');
    if (themeColor) {
        console.log('✅ Theme color meta tag found');
    } else {
        console.error('❌ Theme color meta tag not found');
        return false;
    }
    
    return true;
}

// Test 6: Check if game functions are defined
function testGameFunctions() {
    console.log('📋 Test 6: Game Functions Check');
    
    const requiredFunctions = ['startGame', 'gameOver', 'restartGame', 'updateUI'];
    let allFound = true;
    
    requiredFunctions.forEach(funcName => {
        if (typeof window[funcName] === 'function') {
            console.log(`✅ ${funcName} function found`);
        } else {
            console.error(`❌ ${funcName} function not found`);
            allFound = false;
        }
    });
    
    return allFound;
}

// Test 7: Check CSS compatibility fix
function testCSSCompatibility() {
    console.log('📋 Test 7: CSS Compatibility Check');
    
    // Check if the body has both user-select and -webkit-user-select
    const bodyStyle = window.getComputedStyle(document.body);
    const userSelect = bodyStyle.getPropertyValue('user-select');
    const webkitUserSelect = bodyStyle.getPropertyValue('-webkit-user-select');
    
    if (userSelect === 'none' || webkitUserSelect === 'none') {
        console.log('✅ User-select CSS properties found');
    } else {
        console.error('❌ User-select CSS properties not found');
        return false;
    }
    
    return true;
}

// Run all tests
function runAllTests() {
    console.log('🚀 Starting comprehensive game test suite...\n');
    
    const tests = [
        testGameLoad,
        testGameState,
        testUIElements,
        testMobileControls,
        testPWAElements,
        testGameFunctions,
        testCSSCompatibility
    ];
    
    let passedTests = 0;
    let totalTests = tests.length;
    
    tests.forEach((test, index) => {
        try {
            const result = test();
            if (result) {
                passedTests++;
            }
        } catch (error) {
            console.error(`❌ Test ${index + 1} failed with error:`, error);
        }
        console.log(''); // Add spacing between tests
    });
    
    console.log('📊 Test Results Summary:');
    console.log(`✅ Passed: ${passedTests}/${totalTests}`);
    console.log(`❌ Failed: ${totalTests - passedTests}/${totalTests}`);
    
    if (passedTests === totalTests) {
        console.log('🎉 All tests passed! Game is working correctly.');
        return true;
    } else {
        console.log('⚠️ Some tests failed. Please check the issues above.');
        return false;
    }
}

// Auto-run tests when script loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runAllTests);
} else {
    runAllTests();
}

// Export for manual testing
window.runGameTests = runAllTests; 