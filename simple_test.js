// Simple Game Display Test
// Copy and paste this into browser console on the game page

console.log('🎮 Starting Simple Game Display Test...');

function testGameDisplay() {
    const results = {
        passed: 0,
        failed: 0,
        details: []
    };
    
    // Test 1: Game Container
    const gameContainer = document.querySelector('.game-container');
    if (gameContainer) {
        const rect = gameContainer.getBoundingClientRect();
        const style = window.getComputedStyle(gameContainer);
        
        if (style.display !== 'none' && style.visibility !== 'hidden') {
            results.passed++;
            results.details.push('✅ Game container is visible');
        } else {
            results.failed++;
            results.details.push('❌ Game container is hidden');
        }
        
        // Check if container is on screen
        if (rect.left >= 0 && rect.right <= window.innerWidth) {
            results.passed++;
            results.details.push('✅ Game container is on screen horizontally');
        } else {
            results.failed++;
            results.details.push('❌ Game container is off screen horizontally');
        }
    } else {
        results.failed++;
        results.details.push('❌ Game container not found');
    }
    
    // Test 2: Start Screen
    const startScreen = document.getElementById('startScreen');
    if (startScreen) {
        const style = window.getComputedStyle(startScreen);
        if (style.display !== 'none' && style.visibility !== 'hidden') {
            results.passed++;
            results.details.push('✅ Start screen is visible');
        } else {
            results.failed++;
            results.details.push('❌ Start screen is hidden');
        }
    } else {
        results.failed++;
        results.details.push('❌ Start screen not found');
    }
    
    // Test 3: Game Canvas
    const gameCanvas = document.getElementById('gameCanvas');
    if (gameCanvas) {
        const style = window.getComputedStyle(gameCanvas);
        if (style.display === 'none' || style.visibility === 'hidden') {
            results.passed++;
            results.details.push('✅ Game canvas is hidden (correct for menu)');
        } else {
            results.failed++;
            results.details.push('❌ Game canvas should be hidden on menu');
        }
    } else {
        results.failed++;
        results.details.push('❌ Game canvas not found');
    }
    
    // Test 4: Mobile Tab Bar
    const mobileTabBar = document.querySelector('.mobile-tab-bar');
    if (mobileTabBar) {
        const style = window.getComputedStyle(mobileTabBar);
        if (style.display !== 'none') {
            results.passed++;
            results.details.push('✅ Mobile tab bar is visible');
        } else {
            results.failed++;
            results.details.push('❌ Mobile tab bar is hidden');
        }
    } else {
        results.failed++;
        results.details.push('❌ Mobile tab bar not found');
    }
    
    // Test 5: Game Title
    const gameTitle = document.querySelector('.game-title');
    if (gameTitle) {
        const style = window.getComputedStyle(gameTitle);
        if (style.display !== 'none' && style.visibility !== 'hidden') {
            results.passed++;
            results.details.push('✅ Game title is visible');
        } else {
            results.failed++;
            results.details.push('❌ Game title is hidden');
        }
    } else {
        results.failed++;
        results.details.push('❌ Game title not found');
    }
    
    // Test 6: Start Button
    const startButton = document.getElementById('startBtn');
    if (startButton) {
        const style = window.getComputedStyle(startButton);
        if (style.display !== 'none' && style.visibility !== 'hidden') {
            results.passed++;
            results.details.push('✅ Start button is visible');
        } else {
            results.failed++;
            results.details.push('❌ Start button is hidden');
        }
    } else {
        results.failed++;
        results.details.push('❌ Start button not found');
    }
    
    // Test 7: Body overflow
    const bodyStyle = window.getComputedStyle(document.body);
    if (bodyStyle.overflowX === 'hidden') {
        results.passed++;
        results.details.push('✅ Body overflow-x is hidden (prevents horizontal scroll)');
    } else {
        results.failed++;
        results.details.push('❌ Body overflow-x should be hidden');
    }
    
    // Test 8: Viewport size
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    results.details.push(`📱 Viewport size: ${viewportWidth}x${viewportHeight}`);
    
    // Calculate percentage
    const total = results.passed + results.failed;
    const percentage = total > 0 ? ((results.passed / total) * 100).toFixed(1) : 0;
    
    // Display results
    console.log('\n📊 Test Results:');
    console.log('='.repeat(50));
    console.log(`✅ Passed: ${results.passed}`);
    console.log(`❌ Failed: ${results.failed}`);
    console.log(`📈 Score: ${percentage}%`);
    console.log('\n📝 Details:');
    results.details.forEach(detail => console.log(detail));
    
    // Summary
    if (percentage >= 80) {
        console.log('\n🎉 EXCELLENT: Game display is working well!');
    } else if (percentage >= 60) {
        console.log('\n⚠️  GOOD: Game display has minor issues');
    } else {
        console.log('\n🚨 POOR: Game display has significant issues');
    }
    
    return results;
}

// Run the test
testGameDisplay(); 