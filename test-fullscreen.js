import puppeteer from 'puppeteer';

async function testFullscreenGameplay() {
  console.log('🚀 Starting fullscreen gameplay test...');
  
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: ['--start-maximized', '--disable-web-security']
  });
  
  const page = await browser.newPage();
  
  // Monitor console errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.error('❌ Console Error:', msg.text());
    } else if (msg.type() === 'warn') {
      console.warn('⚠️ Console Warning:', msg.text());
    } else {
      console.log('📝 Console:', msg.text());
    }
  });
  
  // Monitor page errors
  page.on('pageerror', error => {
    console.error('💥 Page Error:', error.message);
  });
  
  try {
    console.log('🌐 Navigating to local server...');
    await page.goto('https://kaden---adelynn-adventures.web.app', { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    
    console.log('✅ Page loaded successfully');
    
    // Check what elements are available
    const availableElements = await page.evaluate(() => {
      const elements = document.querySelectorAll('*');
      return Array.from(elements).map(el => ({
        tagName: el.tagName,
        className: el.className,
        id: el.id
      })).filter(el => el.className || el.id);
    });
    
    console.log('📋 Available elements:', availableElements.slice(0, 10));
    
    // Wait for game to load - try different selectors
    let canvasFound = false;
    const selectors = ['canvas', '.game-canvas', '#game-canvas', '[class*="canvas"]'];
    
    for (const selector of selectors) {
      try {
        await page.waitForSelector(selector, { timeout: 2000 });
        console.log(`✅ Found canvas with selector: ${selector}`);
        canvasFound = true;
        break;
      } catch (e) {
        console.log(`❌ Selector ${selector} not found`);
      }
    }
    
    if (!canvasFound) {
      throw new Error('No canvas element found');
    }
    
    // Test mobile viewport simulation
    console.log('📱 Testing mobile viewport (375x667)...');
    await page.setViewport({ width: 375, height: 667, isMobile: true });
    
    // Get canvas dimensions
    const canvasDimensions = await page.evaluate(() => {
      const canvas = document.querySelector('.game-canvas');
      const container = document.querySelector('.game-container');
      
      if (!canvas || !container) return null;
      
      const canvasRect = canvas.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      
      return {
        canvas: {
          width: canvasRect.width,
          height: canvasRect.height,
          styleWidth: canvas.style.width,
          styleHeight: canvas.style.height
        },
        container: {
          width: containerRect.width,
          height: containerRect.height,
          styleWidth: container.style.width,
          styleHeight: container.style.height
        },
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        }
      };
    });
    
    console.log('📊 Canvas Dimensions:', JSON.stringify(canvasDimensions, null, 2));
    
    // Check if canvas is fullscreen
    const isFullscreen = canvasDimensions && 
      canvasDimensions.canvas.width >= canvasDimensions.viewport.width * 0.95 &&
      canvasDimensions.canvas.height >= canvasDimensions.viewport.height * 0.95;
    
    console.log(isFullscreen ? '✅ Canvas appears to be fullscreen' : '❌ Canvas is NOT fullscreen');
    
    // Test game interaction
    console.log('🎮 Testing game interaction...');
    
    // Click to start game
    await page.click('.game-canvas');
    await page.waitForTimeout(1000);
    
    // Simulate touch events for mobile
    console.log('👆 Simulating touch events...');
    await page.evaluate(() => {
      const canvas = document.querySelector('.game-canvas');
      if (canvas) {
        // Simulate touch start
        const touchStartEvent = new TouchEvent('touchstart', {
          touches: [new Touch({
            identifier: 1,
            target: canvas,
            clientX: 187, // center of 375px width
            clientY: 333  // center of 667px height
          })]
        });
        canvas.dispatchEvent(touchStartEvent);
        
        // Simulate touch move
        setTimeout(() => {
          const touchMoveEvent = new TouchEvent('touchmove', {
            touches: [new Touch({
              identifier: 1,
              target: canvas,
              clientX: 200,
              clientY: 350
            })]
          });
          canvas.dispatchEvent(touchMoveEvent);
        }, 100);
        
        // Simulate touch end
        setTimeout(() => {
          const touchEndEvent = new TouchEvent('touchend', {
            touches: []
          });
          canvas.dispatchEvent(touchEndEvent);
        }, 500);
      }
    });
    
    await page.waitForTimeout(2000);
    
    // Test desktop viewport
    console.log('🖥️ Testing desktop viewport (1920x1080)...');
    await page.setViewport({ width: 1920, height: 1080, isMobile: false });
    
    const desktopDimensions = await page.evaluate(() => {
      const canvas = document.querySelector('.game-canvas');
      const container = document.querySelector('.game-container');
      
      if (!canvas || !container) return null;
      
      const canvasRect = canvas.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      
      return {
        canvas: {
          width: canvasRect.width,
          height: canvasRect.height
        },
        container: {
          width: containerRect.width,
          height: containerRect.height
        },
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        }
      };
    });
    
    console.log('📊 Desktop Canvas Dimensions:', JSON.stringify(desktopDimensions, null, 2));
    
    // Check for any remaining console errors
    console.log('🔍 Final console check...');
    await page.waitForTimeout(1000);
    
    console.log('✅ Test completed successfully');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    console.log('🔚 Closing browser...');
    await browser.close();
  }
}

// Run the test
testFullscreenGameplay().catch(console.error);
