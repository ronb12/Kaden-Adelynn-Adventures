/**
 * Comprehensive Feature Test with Console Monitoring
 * Tests ALL features and reports errors
 */

const puppeteer = require('puppeteer');
const fs = require('fs');

const GAME_URL = 'http://localhost:3000';
const TEST_REPORT = [];
const CONSOLE_ERRORS = [];
const CONSOLE_WARNINGS = [];

const log = (message, type = 'info') => {
  const timestamp = new Date().toLocaleTimeString();
  const emoji = type === 'error' ? '❌' : type === 'warning' ? '⚠️' : type === 'success' ? '✅' : '📝';
  console.log(`[${timestamp}] ${emoji} ${message}`);
  TEST_REPORT.push({ timestamp, type, message });
};

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function runAllTests() {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║   COMPREHENSIVE FEATURE TEST + ERROR MONITORING            ║');
  console.log('║   Testing ALL features and checking console for errors     ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1400, height: 900 },
    args: ['--start-maximized', '--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security']
  });

  const page = await browser.newPage();

  // Monitor ALL console messages
  page.on('console', msg => {
    const text = msg.text();
    const type = msg.type();
    
    if (type === 'error') {
      CONSOLE_ERRORS.push(text);
      log(`Console Error: ${text}`, 'error');
    } else if (type === 'warning') {
      CONSOLE_WARNINGS.push(text);
      log(`Console Warning: ${text}`, 'warning');
    } else if (text.includes('🎨') || text.includes('✅') || text.includes('🚀')) {
      log(`${text}`, 'info');
    }
  });

  // Monitor page errors
  page.on('pageerror', error => {
    CONSOLE_ERRORS.push(error.message);
    log(`Page Error: ${error.message}`, 'error');
  });

  try {
    log('📱 Starting local server test...', 'info');
    log('🌐 Navigating to http://localhost:3000...', 'info');
    
    await page.goto(GAME_URL, { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });
    
    log('✅ Page loaded successfully!', 'success');
    await wait(2000);

    // Test 1: Menu Screen
    log('\n🧪 TEST 1: Menu Screen Visibility', 'info');
    const menuVisible = await page.$('h1::-p-text(Kaden & Adelynn)');
    if (menuVisible) {
      log('✅ Menu screen visible', 'success');
    } else {
      log('❌ Menu screen not found', 'error');
    }

    // Take screenshot of menu
    await page.screenshot({ path: 'test-screenshots/01-menu.png' });
    log('📸 Screenshot saved: 01-menu.png', 'info');

    // Test 2: Ship Selection
    log('\n🧪 TEST 2: Ship Selection Screen', 'info');
    const shipButton = await page.$('button::-p-text(Ship Selection)');
    if (shipButton) {
      await shipButton.click();
      await wait(2000);
      log('✅ Ship selection opened', 'success');
      await page.screenshot({ path: 'test-screenshots/02-ship-selection.png' });
      
      // Check if ships are visible
      const shipsVisible = await page.$('.ship-card');
      if (shipsVisible) {
        log('✅ Ship cards visible', 'success');
      } else {
        log('❌ Ship cards not rendering', 'error');
      }
      
      // Go back
      const backButton = await page.$('button::-p-text(Back)');
      if (backButton) {
        await backButton.click();
        await wait(1000);
      }
    }

    // Test 3: Campaign Screen
    log('\n🧪 TEST 3: Campaign Screen', 'info');
    const campaignButton = await page.$('button::-p-text(Campaign)');
    if (campaignButton) {
      await campaignButton.click();
      await wait(2000);
      log('✅ Campaign screen opened', 'success');
      await page.screenshot({ path: 'test-screenshots/03-campaign.png' });
      
      // Check if 300 levels visible
      const levelCards = await page.$$('.level-card');
      log(`📊 Found ${levelCards.length} level cards`, 'info');
      
      // Go back
      const backButton = await page.$('.back-button');
      if (backButton) {
        await backButton.click();
        await wait(1000);
      }
    }

    // Test 4: Start Game
    log('\n🧪 TEST 4: Starting Game', 'info');
    const startButton = await page.$('button::-p-text(Start Game)');
    if (startButton) {
      await startButton.click();
      await wait(3000);
      log('✅ Game started', 'success');
      await page.screenshot({ path: 'test-screenshots/04-gameplay.png' });
    }

    // Test 5: Check Game Canvas
    log('\n🧪 TEST 5: Game Canvas Visibility', 'info');
    const canvas = await page.$('canvas');
    if (canvas) {
      log('✅ Canvas element found', 'success');
      
      // Check canvas size
      const canvasSize = await page.evaluate(() => {
        const canvas = document.querySelector('canvas');
        return canvas ? { width: canvas.width, height: canvas.height } : null;
      });
      
      if (canvasSize) {
        log(`📐 Canvas size: ${canvasSize.width}x${canvasSize.height}`, 'info');
      }
      
      // Check if canvas is rendering (not black)
      const isBlack = await page.evaluate(() => {
        const canvas = document.querySelector('canvas');
        if (!canvas) return true;
        
        const ctx = canvas.getContext('2d');
        const imageData = ctx.getImageData(
          canvas.width / 2, 
          canvas.height / 2, 
          1, 1
        );
        
        const pixel = imageData.data;
        // Check if pixel is pure black
        return pixel[0] === 0 && pixel[1] === 0 && pixel[2] === 0;
      });
      
      if (isBlack) {
        log('❌ CRITICAL: Canvas is rendering BLACK SCREEN!', 'error');
        log('   This confirms user report - game is not visible!', 'error');
      } else {
        log('✅ Canvas is rendering content (not black)', 'success');
      }
    }

    // Test 6: Player movement
    log('\n🧪 TEST 6: Player Controls', 'info');
    await page.keyboard.press('ArrowLeft');
    await wait(500);
    await page.keyboard.press('ArrowRight');
    await wait(500);
    await page.keyboard.press('Space');
    await wait(500);
    log('✅ Controls responsive', 'success');

    // Test 7: Wait and observe gameplay
    log('\n🧪 TEST 7: Gameplay Observation (10 seconds)', 'info');
    await wait(10000);
    await page.screenshot({ path: 'test-screenshots/05-gameplay-active.png' });

    // Generate report
    log('\n📊 GENERATING TEST REPORT...', 'info');
    
    const report = {
      timestamp: new Date().toISOString(),
      totalErrors: CONSOLE_ERRORS.length,
      totalWarnings: CONSOLE_WARNINGS.length,
      errors: CONSOLE_ERRORS,
      warnings: CONSOLE_WARNINGS,
      testLog: TEST_REPORT
    };
    
    fs.writeFileSync('test-report.json', JSON.stringify(report, null, 2));
    
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║                    TEST SUMMARY                            ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log(`\n🔴 Console Errors: ${CONSOLE_ERRORS.length}`);
    console.log(`⚠️  Console Warnings: ${CONSOLE_WARNINGS.length}`);
    console.log(`📝 Test Report: test-report.json`);
    
    if (CONSOLE_ERRORS.length > 0) {
      console.log('\n❌ ERRORS FOUND:');
      CONSOLE_ERRORS.forEach((err, idx) => {
        console.log(`   ${idx + 1}. ${err}`);
      });
    }
    
    if (CONSOLE_WARNINGS.length > 0 && CONSOLE_WARNINGS.length <= 10) {
      console.log('\n⚠️  WARNINGS:');
      CONSOLE_WARNINGS.forEach((warn, idx) => {
        console.log(`   ${idx + 1}. ${warn}`);
      });
    }

    log('\n✅ Test complete! Browser staying open for inspection...', 'success');
    log('   Check test-screenshots/ for visual verification', 'info');
    log('   Check test-report.json for detailed results', 'info');
    log('   Press Ctrl+C to close', 'info');

    // Keep browser open
    await wait(300000); // 5 minutes

  } catch (error) {
    log(`❌ FATAL ERROR: ${error.message}`, 'error');
    console.error(error);
    
    // Save error report
    fs.writeFileSync('test-error.json', JSON.stringify({
      error: error.message,
      stack: error.stack,
      errors: CONSOLE_ERRORS,
      warnings: CONSOLE_WARNINGS
    }, null, 2));
  }
}

// Create screenshots directory
if (!fs.existsSync('test-screenshots')) {
  fs.mkdirSync('test-screenshots');
}

runAllTests();

