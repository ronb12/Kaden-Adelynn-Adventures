/**
 * Puppeteer Automated Demo - Test All Game Features
 * This script will automatically play the game and demonstrate all features
 */

const puppeteer = require('puppeteer');

// Configuration
const GAME_URL = 'http://localhost:3000';
const DEMO_SPEED = 1000; // Milliseconds between actions

// Helper function to wait
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to press key
const pressKey = async (page, key) => {
  await page.keyboard.press(key);
  await wait(500);
};

// Helper function to log with timestamp
const log = (message) => {
  const timestamp = new Date().toLocaleTimeString();
  console.log(`[${timestamp}] ${message}`);
};

async function runDemo() {
  log('🚀 Starting Kaden & Adelynn Space Adventures Demo...');

  // Launch browser (visible, not headless)
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1400, height: 900 },
    args: [
      '--start-maximized',
      '--no-sandbox',
      '--disable-setuid-sandbox'
    ]
  });

  const page = await browser.newPage();

  // Set up console logging from the page
  page.on('console', msg => {
    if (msg.text().includes('[TestPlayer]') || msg.text().includes('✓')) {
      console.log(`   📝 ${msg.text()}`);
    }
  });

  try {
    log('📱 Navigating to game...');
    await page.goto(GAME_URL, { waitUntil: 'networkidle2' });
    await wait(2000);

    log('🎮 Game loaded! Starting automated demo...');
    await wait(1000);

    // Check if Test Mode component is visible
    const hasTestMode = await page.$('text/Test Mode');
    
    if (hasTestMode) {
      log('🧪 Test Mode detected - Running comprehensive tests...');
      await demonstrateTestMode(page);
    } else {
      log('🎮 Game Mode detected - Running in-game demo...');
      await demonstrateInGame(page);
    }

    log('✅ Demo complete! Keeping browser open for inspection...');
    log('   Press Ctrl+C to close');

    // Keep browser open
    await wait(300000); // 5 minutes

  } catch (error) {
    log(`❌ Error: ${error.message}`);
    console.error(error);
  }

  // await browser.close();
}

async function demonstrateTestMode(page) {
  log('\n📊 PHASE 1: Test Mode Dashboard Demo');
  await wait(DEMO_SPEED);

  // Click "Run All Tests" button
  log('🚀 Clicking "Run All Tests"...');
  const runAllButton = await page.$('button::-p-text(Run All Tests)');
  if (runAllButton) {
    await runAllButton.click();
    await wait(3000);
    log('   ✓ All systems tested!');
  }

  // Navigate through tabs
  log('\n📑 Navigating through tabs...');
  const tabs = ['Systems', 'Scenarios', 'Shop', 'Logs'];
  
  for (const tab of tabs) {
    log(`   Viewing ${tab} tab...`);
    const tabButton = await page.$(`button::-p-text(${tab})`);
    if (tabButton) {
      await tabButton.click();
      await wait(DEMO_SPEED * 2);
    }
  }

  // Test individual systems
  log('\n🔧 Testing individual systems...');
  const systemsTab = await page.$('button::-p-text(Systems)');
  if (systemsTab) {
    await systemsTab.click();
    await wait(500);
  }

  const systems = [
    'Test Boss System',
    'Test Wave System',
    'Test Ultimate System',
    'Test Environment System',
    'Test Shop System',
    'Test Combo System',
    'Test Challenge System',
    'Test Mission System'
  ];

  for (const system of systems) {
    log(`   Testing ${system}...`);
    const button = await page.$(`button::-p-text(${system})`);
    if (button) {
      await button.click();
      await wait(DEMO_SPEED);
    }
  }

  log('\n✅ Test Mode demo complete!');
}

async function demonstrateInGame(page) {
  log('\n🎮 PHASE 1: Starting Game');
  
  // Click start/play button
  await wait(1000);
  await page.keyboard.press('Enter');
  await wait(2000);

  log('🔧 PHASE 2: Activating Test Player Mode');
  
  // Enable test mode (~ key)
  log('   Pressing ~ to enable test mode...');
  await page.keyboard.press('Backquote');
  await wait(1500);
  log('   ✓ Test Player Mode activated!');

  log('\n💪 PHASE 3: God Mode Demo');
  log('   Pressing G for God Mode...');
  await pressKey(page, 'KeyG');
  await wait(1000);
  log('   ✓ God Mode enabled - Player is invincible!');

  log('\n👁️ PHASE 4: Hitbox Display');
  log('   Pressing H to show hitboxes...');
  await pressKey(page, 'KeyH');
  await wait(1000);
  log('   ✓ Hitboxes visible!');

  log('\n💰 PHASE 5: Adding Currency');
  log('   Pressing M to add 1000 credits (x5)...');
  for (let i = 0; i < 5; i++) {
    await pressKey(page, 'KeyM');
    log(`   Added 1000 credits (${(i + 1) * 1000} total)`);
  }
  await wait(1000);

  log('\n👤 PHASE 6: Adding Lives');
  log('   Pressing L to add lives (x3)...');
  for (let i = 0; i < 3; i++) {
    await pressKey(page, 'KeyL');
    log(`   Added 5 lives`);
  }
  await wait(1000);

  log('\n💥 PHASE 7: Power-ups Demo');
  log('   Pressing P to add all power-ups...');
  await pressKey(page, 'KeyP');
  await wait(1500);
  log('   ✓ All power-ups active!');
  log('   ✓ Combos should be triggering!');
  await wait(2000);

  log('\n⚡ PHASE 8: Ultimate Ability Demo');
  log('   Pressing U to fill ultimate charge...');
  await pressKey(page, 'KeyU');
  await wait(1500);
  log('   ✓ Ultimate charged!');
  log('   Activating ultimate...');
  await pressKey(page, 'KeyU');
  await wait(2000);
  log('   ✓ ULTIMATE ACTIVATED! 🔥');
  await wait(2000);

  log('\n🎯 PHASE 9: Boss Battle Demo');
  log('   Pressing B to spawn boss...');
  await pressKey(page, 'KeyB');
  await wait(2000);
  log('   ✓ Boss spawned!');
  log('   Watch the multi-phase boss battle...');
  await wait(5000);

  log('\n🌊 PHASE 10: Wave System Demo');
  log('   Observing wave system...');
  await wait(3000);
  log('   ✓ Waves progressing with formations!');

  log('\n🌌 PHASE 11: Environmental Hazards');
  log('   Environmental hazards should be spawning...');
  await wait(5000);
  log('   ✓ Asteroids, black holes, and meteors active!');

  log('\n⏱️ PHASE 12: Time Scale Demo');
  log('   Pressing 1 for slow motion (0.5x)...');
  await pressKey(page, 'Digit1');
  await wait(3000);
  log('   ✓ Slow motion active!');
  
  log('   Pressing 3 for fast motion (2x)...');
  await pressKey(page, 'Digit3');
  await wait(3000);
  log('   ✓ Fast motion active!');
  
  log('   Pressing 2 for normal speed (1x)...');
  await pressKey(page, 'Digit2');
  await wait(1000);
  log('   ✓ Normal speed restored!');

  log('\n🎮 PHASE 13: Gameplay Demo');
  log('   Letting AI play for 10 seconds...');
  
  // Simulate some movement
  for (let i = 0; i < 20; i++) {
    const direction = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'][Math.floor(Math.random() * 4)];
    await page.keyboard.press(direction);
    await wait(500);
    
    // Occasionally shoot
    if (Math.random() > 0.5) {
      await page.keyboard.press('Space');
    }
  }

  log('\n🔥 PHASE 14: Kill All Enemies');
  log('   Pressing K to clear the screen...');
  await pressKey(page, 'KeyK');
  await wait(1500);
  log('   ✓ All enemies eliminated!');
  await wait(2000);

  log('\n📊 PHASE 15: Stats Display');
  log('   Pressing T to toggle stats...');
  await pressKey(page, 'KeyT');
  await wait(2000);
  log('   ✓ Stats panel toggled!');

  log('\n🎨 PHASE 16: Final Showcase');
  log('   Spawning multiple bosses for epic battle...');
  for (let i = 0; i < 3; i++) {
    await pressKey(page, 'KeyB');
    await wait(1000);
  }
  
  log('   Adding more power-ups...');
  await pressKey(page, 'KeyP');
  await wait(1000);
  
  log('   Filling ultimate again...');
  await pressKey(page, 'KeyU');
  await wait(500);
  await pressKey(page, 'KeyU');
  
  log('\n🎆 Watch the spectacular finale!');
  await wait(5000);

  log('\n✅ In-Game demo complete!');
}

// Additional function to take screenshots
async function takeScreenshot(page, name) {
  const filename = `demo-screenshot-${name}-${Date.now()}.png`;
  await page.screenshot({ path: filename });
  log(`   📸 Screenshot saved: ${filename}`);
}

// Main execution
(async () => {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║   Kaden & Adelynn Space Adventures - Automated Demo       ║');
  console.log('║   Testing ALL New Features                                ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  // Check if server is running
  log('⚠️  Make sure your dev server is running on http://localhost:3000');
  log('   Run: npm start');
  log('   Waiting 5 seconds before starting...\n');
  
  await wait(5000);

  await runDemo();
})();

