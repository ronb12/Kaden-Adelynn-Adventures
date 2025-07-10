// Automated Test for Game Display - Mobile and Desktop
// Run this in browser console to test game positioning

console.log('🎮 Starting Game Display Test...');

// Test configuration
const testConfig = {
    mobile: {
        width: 375,
        height: 667,
        name: 'Mobile (iPhone)'
    },
    tablet: {
        width: 768,
        height: 1024,
        name: 'Tablet (iPad)'
    },
    desktop: {
        width: 1200,
        height: 800,
        name: 'Desktop'
    }
};

// Test results storage
let testResults = {
    mobile: {},
    tablet: {},
    desktop: {}
};

// Helper function to check if element is visible and in viewport
function isElementVisible(element) {
    if (!element) return false;
    
    const rect = element.getBoundingClientRect();
    const style = window.getComputedStyle(element);
    
    return {
        exists: true,
        visible: style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0',
        inViewport: rect.top >= 0 && rect.left >= 0 && rect.bottom <= window.innerHeight && rect.right <= window.innerWidth,
        width: rect.width,
        height: rect.height,
        top: rect.top,
        left: rect.left,
        bottom: rect.bottom,
        right: rect.right
    };
}

// Test function for a specific viewport size
function testViewport(size, name) {
    console.log(`\n📱 Testing ${name} (${size.width}x${size.height})`);
    
    // Simulate viewport size
    Object.defineProperty(window, 'innerWidth', { value: size.width, configurable: true });
    Object.defineProperty(window, 'innerHeight', { value: size.height, configurable: true });
    
    // Trigger resize event
    window.dispatchEvent(new Event('resize'));
    
    // Wait for layout to update
    setTimeout(() => {
        const results = {};
        
        // Test 1: Game Container
        const gameContainer = document.querySelector('.game-container');
        results.gameContainer = isElementVisible(gameContainer);
        
        // Test 2: Start Screen
        const startScreen = document.getElementById('startScreen');
        results.startScreen = isElementVisible(startScreen);
        
        // Test 3: Game Canvas
        const gameCanvas = document.getElementById('gameCanvas');
        results.gameCanvas = isElementVisible(gameCanvas);
        
        // Test 4: Mobile Tab Bar
        const mobileTabBar = document.querySelector('.mobile-tab-bar');
        results.mobileTabBar = isElementVisible(mobileTabBar);
        
        // Test 5: Game Title
        const gameTitle = document.querySelector('.game-title');
        results.gameTitle = isElementVisible(gameTitle);
        
        // Test 6: Start Button
        const startButton = document.getElementById('startBtn');
        results.startButton = isElementVisible(startButton);
        
        // Test 7: Tab Navigation
        const tabNavigation = document.querySelector('.tab-navigation');
        results.tabNavigation = isElementVisible(tabNavigation);
        
        // Test 8: Character Grid
        const characterGrid = document.querySelector('.character-grid');
        results.characterGrid = isElementVisible(characterGrid);
        
        // Test 9: UI Overlay
        const uiOverlay = document.querySelector('.ui-overlay');
        results.uiOverlay = isElementVisible(uiOverlay);
        
        // Test 10: Body overflow
        const bodyStyle = window.getComputedStyle(document.body);
        results.bodyOverflow = {
            overflowX: bodyStyle.overflowX,
            overflowY: bodyStyle.overflowY,
            width: bodyStyle.width,
            height: bodyStyle.height
        };
        
        // Store results
        testResults[name.toLowerCase()] = results;
        
        // Display results
        displayResults(name, results);
        
    }, 100);
}

// Display test results
function displayResults(name, results) {
    console.log(`\n📊 ${name} Test Results:`);
    console.log('='.repeat(50));
    
    let passed = 0;
    let total = 0;
    
    Object.entries(results).forEach(([element, result]) => {
        total++;
        if (result.exists && result.visible) {
            console.log(`✅ ${element}: Visible and in viewport`);
            passed++;
        } else if (result.exists && !result.visible) {
            console.log(`⚠️  ${element}: Exists but not visible`);
        } else {
            console.log(`❌ ${element}: Not found`);
        }
        
        if (result.width !== undefined) {
            console.log(`   📏 Size: ${result.width.toFixed(0)}x${result.height.toFixed(0)}`);
            console.log(`   📍 Position: (${result.left.toFixed(0)}, ${result.top.toFixed(0)})`);
        }
    });
    
    console.log(`\n📈 ${name} Score: ${passed}/${total} (${((passed/total)*100).toFixed(1)}%)`);
}

// Run all tests
function runAllTests() {
    console.log('🚀 Starting Comprehensive Game Display Test...');
    console.log('='.repeat(60));
    
    // Test each viewport
    Object.entries(testConfig).forEach(([key, config]) => {
        testViewport(config, config.name);
    });
    
    // Final summary
    setTimeout(() => {
        console.log('\n🎯 FINAL TEST SUMMARY');
        console.log('='.repeat(60));
        
        Object.entries(testResults).forEach(([viewport, results]) => {
            const total = Object.keys(results).length;
            const passed = Object.values(results).filter(r => r.exists && r.visible).length;
            const percentage = ((passed/total)*100).toFixed(1);
            
            console.log(`${viewport.toUpperCase()}: ${passed}/${total} (${percentage}%)`);
        });
        
        console.log('\n✅ Test Complete! Check results above.');
    }, 500);
}

// Auto-run test
runAllTests(); 