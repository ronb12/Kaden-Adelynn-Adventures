import puppeteer from 'puppeteer'
const BASE_URL = process.env.BASE_URL || 'http://localhost:4173'
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function testFullscreenGameplay() {
  console.log('🚀 Starting fullscreen gameplay test...')

  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: ['--start-maximized', '--disable-web-security'],
  })

  const page = await browser.newPage()

  // Monitor console errors
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      console.error('❌ Console Error:', msg.text())
    } else if (msg.type() === 'warn') {
      console.warn('⚠️ Console Warning:', msg.text())
    } else {
      console.log('📝 Console:', msg.text())
    }
  })

  // Monitor page errors
  page.on('pageerror', (error) => {
    console.error('💥 Page Error:', error.message)
  })

  try {
    console.log('🌐 Navigating to:', BASE_URL)
    await page.goto(BASE_URL, {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    })

    console.log('✅ Page loaded successfully')

    // Start game from menu
    console.log('🎮 Clicking Start in menu...')
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(
        (b) => b.textContent && b.textContent.toLowerCase().includes('start')
      )
      if (btn) btn.click()
    })
    await sleep(800)

    // Advance story overlay to reach gameplay
    console.log('📖 Advancing story overlay...')
    for (let i = 0; i < 6; i++) {
      await page.evaluate(() => {
        const overlay = document.querySelector('.story-overlay')
        if (overlay) overlay.click()
      })
      await sleep(500)
    }

    // Check what elements are available
    const availableElements = await page.evaluate(() => {
      const elements = document.querySelectorAll('*')
      return Array.from(elements)
        .map((el) => ({
          tagName: el.tagName,
          className: el.className,
          id: el.id,
        }))
        .filter((el) => el.className || el.id)
    })

    console.log('📋 Available elements:', availableElements.slice(0, 10))

    // Wait for game to load - try different selectors
    let canvasFound = false
    const selectors = ['canvas', '.game-canvas', '#game-canvas', '[class*="canvas"]']

    for (const selector of selectors) {
      try {
        await page.waitForSelector(selector, { timeout: 2000 })
        console.log(`✅ Found canvas with selector: ${selector}`)
        canvasFound = true
        break
      } catch (e) {
        console.log(`❌ Selector ${selector} not found`)
      }
    }

    if (!canvasFound) {
      throw new Error('No canvas element found')
    }

    // Test mobile viewport simulation
    console.log('📱 Testing mobile viewport (375x667)...')
    await page.setViewport({ width: 375, height: 667, isMobile: true })
    await page.waitForSelector('.game-canvas, canvas', { timeout: 5000 })

    // Get canvas dimensions
    const canvasDimensions = await page.evaluate(() => {
      const canvas = document.querySelector('.game-canvas') || document.querySelector('canvas')
      const container = document.querySelector('.game-container')

      if (!canvas || !container) return null

      const canvasRect = canvas.getBoundingClientRect()
      const containerRect = container.getBoundingClientRect()

      return {
        canvas: {
          width: canvasRect.width,
          height: canvasRect.height,
          styleWidth: canvas.style.width,
          styleHeight: canvas.style.height,
        },
        container: {
          width: containerRect.width,
          height: containerRect.height,
          styleWidth: container.style.width,
          styleHeight: container.style.height,
        },
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight,
        },
      }
    })

    console.log('📊 Canvas Dimensions:', JSON.stringify(canvasDimensions, null, 2))

    // Check if canvas is fullscreen
    const isFullscreen =
      canvasDimensions &&
      canvasDimensions.canvas.width >= canvasDimensions.viewport.width * 0.95 &&
      canvasDimensions.canvas.height >= canvasDimensions.viewport.height * 0.95

    console.log(isFullscreen ? '✅ Canvas appears to be fullscreen' : '❌ Canvas is NOT fullscreen')

    // Test game interaction
    console.log('🎮 Testing game interaction...')
    await page.waitForSelector('.game-canvas, canvas', { timeout: 5000 })
    const targetSelector = (await page.$('.game-canvas')) ? '.game-canvas' : 'canvas'
    // Click to focus canvas
    await page.click(targetSelector)
    await page.waitForTimeout(1000)

    // Simulate touch events for mobile
    console.log('👆 Simulating touch events...')
    await page.evaluate(() => {
      const canvas = document.querySelector('.game-canvas')
      if (canvas) {
        // Simulate touch start
        const touchStartEvent = new TouchEvent('touchstart', {
          touches: [
            new Touch({
              identifier: 1,
              target: canvas,
              clientX: 187, // center of 375px width
              clientY: 333, // center of 667px height
            }),
          ],
        })
        canvas.dispatchEvent(touchStartEvent)

        // Simulate touch move
        setTimeout(() => {
          const touchMoveEvent = new TouchEvent('touchmove', {
            touches: [
              new Touch({
                identifier: 1,
                target: canvas,
                clientX: 200,
                clientY: 350,
              }),
            ],
          })
          canvas.dispatchEvent(touchMoveEvent)
        }, 100)

        // Simulate touch end
        setTimeout(() => {
          const touchEndEvent = new TouchEvent('touchend', {
            touches: [],
          })
          canvas.dispatchEvent(touchEndEvent)
        }, 500)
      }
    })

    await page.waitForTimeout(2000)

    // Test desktop viewport
    console.log('🖥️ Testing desktop viewport (1920x1080)...')
    await page.setViewport({ width: 1920, height: 1080, isMobile: false })
    await page.waitForSelector('.game-canvas, canvas', { timeout: 5000 })

    const desktopDimensions = await page.evaluate(() => {
      const canvas = document.querySelector('.game-canvas') || document.querySelector('canvas')
      const container = document.querySelector('.game-container')

      if (!canvas || !container) return null

      const canvasRect = canvas.getBoundingClientRect()
      const containerRect = container.getBoundingClientRect()

      return {
        canvas: {
          width: canvasRect.width,
          height: canvasRect.height,
        },
        container: {
          width: containerRect.width,
          height: containerRect.height,
        },
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight,
        },
      }
    })

    console.log('📊 Desktop Canvas Dimensions:', JSON.stringify(desktopDimensions, null, 2))

    // Check for any remaining console errors
    console.log('🔍 Final console check...')
    await page.waitForTimeout(1000)

    console.log('✅ Test completed successfully')
  } catch (error) {
    console.error('❌ Test failed:', error.message)
  } finally {
    console.log('🔚 Closing browser...')
    await browser.close()
  }
}

// Run the test
testFullscreenGameplay().catch(console.error)
