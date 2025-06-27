#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🧪 Running CLI Tests for Kaden & Adelynn Space Adventures\n');

// Test 1: Check if main game file exists
function testGameFileExists() {
    console.log('📋 Test 1: Game File Existence');
    
    const gameFile = 'index.html';
    if (fs.existsSync(gameFile)) {
        console.log('✅ index.html exists');
        return true;
    } else {
        console.error('❌ index.html not found');
        return false;
    }
}

// Test 2: Check if game file is valid HTML
function testGameFileValid() {
    console.log('📋 Test 2: Game File Validation');
    
    try {
        const gameContent = fs.readFileSync('index.html', 'utf8');
        
        // Check for essential HTML elements
        const checks = [
            { name: 'DOCTYPE declaration', pattern: /<!DOCTYPE html>/i },
            { name: 'HTML tag', pattern: /<html/i },
            { name: 'Canvas element', pattern: /<canvas/i },
            { name: 'Game container', pattern: /game-container/i },
            { name: 'Start screen', pattern: /startScreen/i },
            { name: 'Game script', pattern: /gameLoop/i },
            { name: 'Version 4.2', pattern: /v4\.2/i }
        ];
        
        let allPassed = true;
        checks.forEach(check => {
            if (check.pattern.test(gameContent)) {
                console.log(`✅ ${check.name} found`);
            } else {
                console.error(`❌ ${check.name} not found`);
                allPassed = false;
            }
        });
        
        return allPassed;
    } catch (error) {
        console.error('❌ Error reading game file:', error.message);
        return false;
    }
}

// Test 3: Check if PWA files exist
function testPWAFiles() {
    console.log('📋 Test 3: PWA Files Check');
    
    const pwaFiles = ['manifest.json', 'sw.js'];
    let allExist = true;
    
    pwaFiles.forEach(file => {
        if (fs.existsSync(file)) {
            console.log(`✅ ${file} exists`);
        } else {
            console.error(`❌ ${file} not found`);
            allExist = false;
        }
    });
    
    return allExist;
}

// Test 4: Check if test files exist
function testTestFiles() {
    console.log('📋 Test 4: Test Files Check');
    
    const testFiles = ['test-game.js', 'run-tests.html'];
    let allExist = true;
    
    testFiles.forEach(file => {
        if (fs.existsSync(file)) {
            console.log(`✅ ${file} exists`);
        } else {
            console.error(`❌ ${file} not found`);
            allExist = false;
        }
    });
    
    return allExist;
}

// Test 5: Check CSS compatibility fix
function testCSSCompatibility() {
    console.log('📋 Test 5: CSS Compatibility Check');
    
    try {
        const gameContent = fs.readFileSync('index.html', 'utf8');
        
        // Check for both user-select and -webkit-user-select
        const hasUserSelect = /user-select:\s*none/i.test(gameContent);
        const hasWebkitUserSelect = /-webkit-user-select:\s*none/i.test(gameContent);
        
        if (hasUserSelect) {
            console.log('✅ Standard user-select property found');
        } else {
            console.error('❌ Standard user-select property not found');
        }
        
        if (hasWebkitUserSelect) {
            console.log('✅ Webkit user-select property found');
        } else {
            console.error('❌ Webkit user-select property not found');
        }
        
        return hasUserSelect && hasWebkitUserSelect;
    } catch (error) {
        console.error('❌ Error checking CSS compatibility:', error.message);
        return false;
    }
}

// Run all tests
function runAllTests() {
    const tests = [
        testGameFileExists,
        testGameFileValid,
        testPWAFiles,
        testTestFiles,
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
            console.error(`❌ Test ${index + 1} failed with error:`, error.message);
        }
        console.log(''); // Add spacing between tests
    });
    
    console.log('📊 CLI Test Results Summary:');
    console.log(`✅ Passed: ${passedTests}/${totalTests}`);
    console.log(`❌ Failed: ${totalTests - passedTests}/${totalTests}`);
    
    if (passedTests === totalTests) {
        console.log('🎉 All CLI tests passed! Game files are valid.');
        return true;
    } else {
        console.log('⚠️ Some CLI tests failed. Please check the issues above.');
        return false;
    }
}

// Run tests if this script is executed directly
if (require.main === module) {
    runAllTests();
}

module.exports = { runAllTests }; 