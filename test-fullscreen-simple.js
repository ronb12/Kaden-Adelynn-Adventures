import puppeteer from 'puppeteer';

async function testFullscreenGameplay() {
  console.log('🚀 Starting fullscreen gameplay test...');
  
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: ['--start-maximized']
  });
  
  const page = await browser.newPage();
  
  // Monitor console errors
  page.on('console', msg => {
    console.log(`📝 [${msg.type()}] ${msg.text()}`);
  });
  
  try {
    console.log('🌐 Navigating to Firebase URL...');
    await page.goto('https://kaden---adelynn-adventures.web.app', { 
      waitUntil: 'domcontentloaded',
      timeout: 15000 
    });
    
    console.log('✅ Page loaded successfully');
    
    // Wait a bit for React to load
    await page.waitForTimeout(3000);
    
    // Check if we're on main menu or game
    const currentState = await page.evaluate(() => {
      const body = document.body.innerHTML;
      return {
        hasCanvas: body.includes('canvas'),
        hasMainMenu: body.includes('main-menu') || body.includes('MainMenu'),
        bodyLength: body.length
      };
    });
    
    console.log('📊 Page state:', currentState);
    
    // If on main menu, click to start game
    if (currentState.hasMainMenu && !currentState.hasCanvas) {
      console.log('🎮 Clicking to start game...');
      await page.click('body');
      await page.waitForTimeout(2000);
    }
    
    // Test mobile viewport
    console.log('📱 Testing mobile viewport (375x667)...');
    await page.setViewport({ width: 375, height: 667, isMobile: true });
    
    await page.waitForTimeout(1000);
    
    // Get canvas dimensions
    const mobileDimensions = await page.evaluate(() => {
      const canvas = document.querySelector('canvas');
      if (!canvas) return null;
      
      const rect = canvas.getBoundingClientRect();
      return {
        canvas: {
          width: rect.width,
          height: rect.height,
          left: rect.left,
          top: rect.top
        },
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        },
        isFullscreen: rect.width >= window.innerWidth * 0.95 && rect.height >= window.innerHeight * 0.95
      };
    });
    
    console.log('📊 Mobile Dimensions:', JSON.stringify(mobileDimensions, null, 2));
    
    if (mobileDimensions) {
      console.log(mobileDimensions.isFullscreen ? '✅ Mobile: Canvas is fullscreen' : '❌ Mobile: Canvas is NOT fullscreen');
    }
    
    // Test desktop viewport
    console.log('🖥️ Testing desktop viewport (1920x1080)...');
    await page.setViewport({ width: 1920, height: 1080, isMobile: false });
    
    await page.waitForTimeout(1000);
    
    const desktopDimensions = await page.evaluate(() => {
      const canvas = document.querySelector('canvas');
      if (!canvas) return null;
      
      const rect = canvas.getBoundingClientRect();
      return {
        canvas: {
          width: rect.width,
          height: rect.height,
          left: rect.left,
          top: rect.top
        },
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        },
        isFullscreen: rect.width >= window.innerWidth * 0.95 && rect.height >= window.innerHeight * 0.95
      };
    });
    
    console.log('📊 Desktop Dimensions:', JSON.stringify(desktopDimensions, null, 2));
    
    if (desktopDimensions) {
      console.log(desktopDimensions.isFullscreen ? '✅ Desktop: Canvas is fullscreen' : '❌ Desktop: Canvas is NOT fullscreen');
    }
    
    console.log('✅ Test completed successfully');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    console.log('🔚 Closing browser in 5 seconds...');
    await page.waitForTimeout(5000);
    await browser.close();
  }
}

// Run the test
testFullscreenGameplay().catch(console.error);
