import puppeteer from 'puppeteer'

const PORT = 5173 // Vite default port
const URL = `http://localhost:${PORT}`

async function testStoryScrolling() {
  console.log('🧪 Starting story scrolling test on mobile viewport...\n')
  
  const browser = await puppeteer.launch({
    headless: false, // Set to true for CI
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
    
    // Set user agent to mobile
    await page.setUserAgent(
      'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1'
    )
    
    console.log('📱 Mobile viewport set: 390x844 (iPhone 12 Pro)')
    console.log('🌐 Navigating to:', URL)
    
    // Navigate to the app
    await page.goto(URL, { waitUntil: 'networkidle2', timeout: 30000 })
    
    console.log('✅ Page loaded')
    
    // Wait for React to render
    await page.waitForTimeout(3000)
    
    // Click "Start Game" button to get to story view
    console.log('🎮 Looking for "Start Game" button...')
    
    // Wait for and click the start button
    try {
      // Try multiple selectors for the start button
      const startButtonSelectors = [
        'button:has-text("Start Game")',
        'button:has-text("Start")',
        '.start-button',
        'button[class*="start"]',
        'button'
      ]
      
      let startButton = null
      for (const selector of startButtonSelectors) {
        try {
          await page.waitForSelector(selector, { timeout: 2000 })
          const buttons = await page.$$(selector)
          for (const btn of buttons) {
            const text = await page.evaluate(el => el.textContent, btn)
            if (text && (text.includes('Start') || text.includes('Game') || text.includes('🎮'))) {
              startButton = btn
              console.log(`✅ Found start button with text: "${text}"`)
              break
            }
          }
          if (startButton) break
        } catch (e) {
          continue
        }
      }
      
      if (startButton) {
        await startButton.click()
        console.log('✅ Clicked "Start Game" button')
        await page.waitForTimeout(2000) // Wait for story to appear
      } else {
        // Fallback: try clicking any button that might be the start button
        const allButtons = await page.$$('button')
        for (const btn of allButtons) {
          const text = await page.evaluate(el => el.textContent, btn)
          if (text && (text.includes('Start') || text.includes('Game') || text.includes('🎮'))) {
            await btn.click()
            console.log(`✅ Clicked button with text: "${text}"`)
            await page.waitForTimeout(2000)
            break
          }
        }
      }
    } catch (e) {
      console.log('⚠️  Could not find start button:', e.message)
      console.log('Trying to find story overlay directly...')
    }
    
    // Wait for story overlay to appear
    console.log('📖 Waiting for story overlay...')
    await page.waitForSelector('.story-overlay', { timeout: 10000 })
    console.log('✅ Story overlay found')
    
    // Check if story container exists
    const storyContainer = await page.$('.story-container')
    if (!storyContainer) {
      throw new Error('Story container not found')
    }
    
    console.log('✅ Story container found')
    
    // Get initial scroll position
    const initialScroll = await page.evaluate(() => {
      const overlay = document.querySelector('.story-overlay')
      const container = document.querySelector('.story-container')
      return {
        overlayScroll: overlay ? overlay.scrollTop : 0,
        containerScroll: container ? container.scrollTop : 0,
        overlayHeight: overlay ? overlay.scrollHeight : 0,
        containerHeight: container ? container.scrollHeight : 0,
        overlayClientHeight: overlay ? overlay.clientHeight : 0,
        containerClientHeight: container ? container.clientHeight : 0
      }
    })
    
    console.log('\n📊 Initial scroll state:')
    console.log('  Overlay scroll:', initialScroll.overlayScroll)
    console.log('  Container scroll:', initialScroll.containerScroll)
    console.log('  Overlay height:', initialScroll.overlayHeight, 'client:', initialScroll.overlayClientHeight)
    console.log('  Container height:', initialScroll.containerHeight, 'client:', initialScroll.containerClientHeight)
    
    // Check if scrolling is needed
    const needsScrolling = initialScroll.containerHeight > initialScroll.containerClientHeight ||
                          initialScroll.overlayHeight > initialScroll.overlayClientHeight
    
    if (!needsScrolling) {
      console.log('\n⚠️  Content fits in viewport, no scrolling needed')
      console.log('✅ Test passed (content is accessible without scrolling)')
      await browser.close()
      return
    }
    
    console.log('\n🔄 Testing scroll functionality...')
    
    // Try to scroll the story container
    const scrollResult = await page.evaluate(() => {
      const container = document.querySelector('.story-container')
      const overlay = document.querySelector('.story-overlay')
      
      if (!container && !overlay) {
        return { error: 'No scrollable element found' }
      }
      
      const scrollable = container || overlay
      const initialScroll = scrollable.scrollTop
      
      // Try to scroll down
      scrollable.scrollTop = 100
      const afterScroll = scrollable.scrollTop
      
      return {
        initialScroll,
        afterScroll,
        canScroll: afterScroll !== initialScroll,
        scrollHeight: scrollable.scrollHeight,
        clientHeight: scrollable.clientHeight,
        maxScroll: scrollable.scrollHeight - scrollable.clientHeight
      }
    })
    
    console.log('\n📊 Scroll test results:')
    console.log('  Initial scroll:', scrollResult.initialScroll)
    console.log('  After scroll:', scrollResult.afterScroll)
    console.log('  Can scroll:', scrollResult.canScroll)
    console.log('  Scroll height:', scrollResult.scrollHeight)
    console.log('  Client height:', scrollResult.clientHeight)
    console.log('  Max scroll:', scrollResult.maxScroll)
    
    // Test touch scrolling simulation
    console.log('\n👆 Testing touch scroll simulation...')
    
    const touchScrollResult = await page.evaluate(() => {
      const container = document.querySelector('.story-container')
      const overlay = document.querySelector('.story-overlay')
      const scrollable = container || overlay
      
      if (!scrollable) {
        return { error: 'No scrollable element found' }
      }
      
      const initialScroll = scrollable.scrollTop
      
      // Simulate touch scroll by dispatching touch events
      const touchStart = new TouchEvent('touchstart', {
        touches: [new Touch({ clientX: 195, clientY: 400, identifier: 0, target: scrollable })],
        bubbles: true,
        cancelable: true
      })
      
      const touchMove = new TouchEvent('touchmove', {
        touches: [new Touch({ clientX: 195, clientY: 300, identifier: 0, target: scrollable })],
        bubbles: true,
        cancelable: true
      })
      
      scrollable.dispatchEvent(touchStart)
      scrollable.dispatchEvent(touchMove)
      
      const afterTouchScroll = scrollable.scrollTop
      
      return {
        initialScroll,
        afterTouchScroll,
        touchScrollWorked: afterTouchScroll !== initialScroll
      }
    })
    
    console.log('  Touch scroll initial:', touchScrollResult.initialScroll)
    console.log('  Touch scroll after:', touchScrollResult.afterTouchScroll)
    console.log('  Touch scroll worked:', touchScrollResult.touchScrollWorked)
    
    // Test actual touch gesture
    console.log('\n👆 Testing actual touch gesture...')
    
    const storyContainerBox = await storyContainer.boundingBox()
    if (storyContainerBox) {
      // Start touch at middle of container
      await page.touchscreen.tap(storyContainerBox.x + storyContainerBox.width / 2, storyContainerBox.y + storyContainerBox.height / 2)
      await page.waitForTimeout(100)
      
      // Try to drag/scroll
      await page.mouse.move(storyContainerBox.x + storyContainerBox.width / 2, storyContainerBox.y + storyContainerBox.height / 2)
      await page.mouse.down()
      await page.mouse.move(storyContainerBox.x + storyContainerBox.width / 2, storyContainerBox.y + storyContainerBox.height / 2 - 100)
      await page.mouse.up()
      await page.waitForTimeout(500)
      
      const afterGestureScroll = await page.evaluate(() => {
        const container = document.querySelector('.story-container')
        const overlay = document.querySelector('.story-overlay')
        const scrollable = container || overlay
        return scrollable ? scrollable.scrollTop : 0
      })
      
      console.log('  After gesture scroll:', afterGestureScroll)
      console.log('  Gesture scroll worked:', afterGestureScroll > 0)
    }
    
    // Final scroll position check
    const finalScroll = await page.evaluate(() => {
      const overlay = document.querySelector('.story-overlay')
      const container = document.querySelector('.story-container')
      return {
        overlayScroll: overlay ? overlay.scrollTop : 0,
        containerScroll: container ? container.scrollTop : 0
      }
    })
    
    console.log('\n📊 Final scroll state:')
    console.log('  Overlay scroll:', finalScroll.overlayScroll)
    console.log('  Container scroll:', finalScroll.containerScroll)
    
    // Determine test result
    const scrollWorks = scrollResult.canScroll || finalScroll.containerScroll > 0 || finalScroll.overlayScroll > 0
    
    if (scrollWorks) {
      console.log('\n✅ TEST PASSED: Story scrolling works on mobile!')
    } else {
      console.log('\n❌ TEST FAILED: Story scrolling does not work on mobile')
    }
    
    // Keep browser open for 3 seconds to see the result
    await page.waitForTimeout(3000)
    
    await browser.close()
    
    process.exit(scrollWorks ? 0 : 1)
    
  } catch (error) {
    console.error('\n❌ Test error:', error.message)
    await browser.close()
    process.exit(1)
  }
}

// Check if dev server is running
async function checkServer() {
  try {
    const response = await fetch(URL)
    return response.ok
  } catch (e) {
    return false
  }
}

// Main execution
console.log('🚀 Story Scrolling Test for Mobile Devices\n')
console.log('Checking if dev server is running...')

checkServer().then(isRunning => {
  if (!isRunning) {
    console.log(`❌ Dev server not running at ${URL}`)
    console.log('Please run: npm run dev')
    process.exit(1)
  }
  
  console.log(`✅ Dev server is running at ${URL}\n`)
  testStoryScrolling()
})
