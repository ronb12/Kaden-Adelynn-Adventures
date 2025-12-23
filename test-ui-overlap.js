import puppeteer from 'puppeteer'

const URL = 'https://kaden---adelynn-adventures.web.app'

async function testUIOverlap() {
  console.log('🧪 Testing weapon/accuracy overlap on mobile viewport...\n')
  
  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  })
  
  try {
    const page = await browser.newPage()
    
    // Set mobile viewport (iPhone 12 Pro dimensions)
    await page.setViewport({
      width: 390,
      height: 844,
      deviceScaleFactor: 3,
      isMobile: true,
      hasTouch: true
    })
    
    console.log('📱 Mobile viewport set: 390x844 (iPhone 12 Pro)')
    console.log('🌐 Navigating to:', URL)
    
    await page.goto(URL, { waitUntil: 'networkidle2', timeout: 30000 })
    console.log('✅ Page loaded')
    
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    // Click Start Game
    console.log('🎮 Clicking Start Game...')
    const startButtons = await page.$$('button')
    for (const btn of startButtons) {
      const text = await page.evaluate(el => el.textContent, btn)
      if (text && (text.includes('Start') || text.includes('Game') || text.includes('🎮'))) {
        await btn.click()
        console.log(`✅ Clicked: "${text}"`)
        break
      }
    }
    
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Skip story
    console.log('📖 Skipping story...')
    try {
      const skipButton = await page.$('button:has-text("Skip")')
      if (skipButton) {
        await skipButton.click()
        console.log('✅ Clicked Skip')
        await new Promise(resolve => setTimeout(resolve, 2000))
      }
    } catch (e) {
      console.log('⚠️  No skip button found, waiting for game to start...')
      await new Promise(resolve => setTimeout(resolve, 3000))
    }
    
    // Wait for game canvas
    console.log('🎮 Waiting for game to start...')
    await page.waitForSelector('canvas', { timeout: 10000 })
    console.log('✅ Game canvas found')
    
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Take screenshot
    await page.screenshot({ path: 'game-ui-test.png', fullPage: false })
    console.log('📸 Screenshot saved: game-ui-test.png')
    
    // Check UI text positions by reading canvas
    const uiInfo = await page.evaluate(() => {
      const canvas = document.querySelector('canvas')
      if (!canvas) return { error: 'Canvas not found' }
      
      const ctx = canvas.getContext('2d')
      const imageData = ctx.getImageData(0, 0, canvas.width, 76) // Top 76px is UI bar
      
      // Try to detect text positions (this is approximate)
      return {
        canvasWidth: canvas.width,
        canvasHeight: canvas.height,
        uiBarHeight: 76,
        isMobile: canvas.width < 520
      }
    })
    
    console.log('\n📊 Canvas Info:')
    console.log('  Width:', uiInfo.canvasWidth)
    console.log('  Height:', uiInfo.canvasHeight)
    console.log('  UI Bar Height:', uiInfo.uiBarHeight)
    console.log('  Is Mobile:', uiInfo.isMobile)
    
    // Check if we can see the UI elements
    console.log('\n✅ Test completed - check screenshot for overlap')
    console.log('   Look for "ACC: X%" and "⚔️ WEAPON" text')
    console.log('   They should be on different rows on mobile')
    
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    await browser.close()
    process.exit(0)
    
  } catch (error) {
    console.error('\n❌ Test error:', error.message)
    await browser.close()
    process.exit(1)
  }
}

testUIOverlap()


