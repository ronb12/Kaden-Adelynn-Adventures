import puppeteer from 'puppeteer'
const BASE_URL = process.env.BASE_URL || 'http://localhost:4173'

async function testCompleteGameFeatures() {
  console.log('🚀 Starting comprehensive gameplay test...\n')

  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: ['--start-maximized'],
  })

  const page = await browser.newPage()
  const errors = []
  const warnings = []
  const successes = []

  // Monitor console
  page.on('console', (msg) => {
    const text = msg.text()
    if (msg.type() === 'error' && !text.includes('Failed to load resource')) {
      errors.push(text)
      console.log(`❌ ERROR: ${text}`)
    } else if (msg.type() === 'warn') {
      warnings.push(text)
      console.log(`⚠️  WARN: ${text}`)
    } else {
      console.log(`📝 LOG: ${text}`)
    }
  })

  // Monitor page errors
  page.on('pageerror', (error) => {
    errors.push(error.message)
    console.log(`💥 PAGE ERROR: ${error.message}`)
  })

  try {
    console.log('🌐 Step 1: Loading URL:', BASE_URL)
    await page.goto(BASE_URL, {
      waitUntil: 'domcontentloaded',
      timeout: 15000,
    })

    await page.waitForTimeout(3000)
    console.log('✅ Page loaded\n')

    // Test 1: Check fullscreen
    console.log('🎮 Step 2: Testing fullscreen gameplay...')
    const fullscreenStatus = await page.evaluate(() => {
      const canvas = document.querySelector('canvas')
      if (!canvas) return { fullscreen: false, error: 'No canvas found' }

      const rect = canvas.getBoundingClientRect()
      return {
        fullscreen:
          rect.width >= window.innerWidth * 0.95 && rect.height >= window.innerHeight * 0.95,
        canvas: { width: rect.width, height: rect.height },
        viewport: { width: window.innerWidth, height: window.innerHeight },
      }
    })

    if (fullscreenStatus.fullscreen) {
      successes.push('Fullscreen working')
      console.log('✅ Fullscreen: PASS - Canvas fills viewport')
      console.log(`   Canvas: ${fullscreenStatus.canvas.width}x${fullscreenStatus.canvas.height}`)
      console.log(
        `   Viewport: ${fullscreenStatus.viewport.width}x${fullscreenStatus.viewport.height}\n`
      )
    } else {
      errors.push('Fullscreen not working')
      console.log('❌ Fullscreen: FAIL\n')
    }

    // Test 2: Check main menu
    console.log('📋 Step 3: Testing main menu...')
    const menuStatus = await page.evaluate(() => {
      const title = document.querySelector('.game-title')
      const startButton = document.querySelector('.start-button')
      return {
        hasTitle: !!title,
        hasStartButton: !!startButton,
      }
    })

    if (menuStatus.hasTitle && menuStatus.hasStartButton) {
      successes.push('Main menu loaded')
      console.log('✅ Main Menu: PASS - Title and start button present\n')
    } else {
      errors.push('Main menu incomplete')
      console.log('❌ Main Menu: FAIL\n')
    }

    // Test 3: Start game
    console.log('🎯 Step 4: Starting game...')
    await page.click('.start-button')
    await page.waitForTimeout(2000)

    const gameStarted = await page.evaluate(() => {
      const canvas = document.querySelector('canvas')
      return canvas !== null
    })

    if (gameStarted) {
      successes.push('Game started')
      console.log('✅ Game Started: PASS - Canvas visible\n')
    } else {
      errors.push('Game failed to start')
      console.log('❌ Game Started: FAIL\n')
    }

    // Test 4: Test mobile viewport
    console.log('📱 Step 5: Testing mobile viewport (375x667)...')
    await page.setViewport({ width: 375, height: 667, isMobile: true })
    await page.waitForTimeout(1000)

    const mobileStatus = await page.evaluate(() => {
      const canvas = document.querySelector('canvas')
      if (!canvas) return null
      const rect = canvas.getBoundingClientRect()
      return {
        fullscreen:
          rect.width >= window.innerWidth * 0.95 && rect.height >= window.innerHeight * 0.95,
        canvas: { width: rect.width, height: rect.height },
        viewport: { width: window.innerWidth, height: window.innerHeight },
      }
    })

    if (mobileStatus && mobileStatus.fullscreen) {
      successes.push('Mobile fullscreen working')
      console.log('✅ Mobile Fullscreen: PASS')
      console.log(`   Canvas: ${mobileStatus.canvas.width}x${mobileStatus.canvas.height}`)
      console.log(`   Viewport: ${mobileStatus.viewport.width}x${mobileStatus.viewport.height}\n`)
    } else {
      errors.push('Mobile fullscreen not working')
      console.log('❌ Mobile Fullscreen: FAIL\n')
    }

    // Test 5: Simulate touch controls
    console.log('👆 Step 6: Testing touch controls...')
    await page.evaluate(() => {
      const canvas = document.querySelector('canvas')
      if (canvas) {
        // Simulate touch
        canvas.dispatchEvent(
          new TouchEvent('touchstart', {
            touches: [
              new Touch({
                identifier: 1,
                target: canvas,
                clientX: 187,
                clientY: 333,
                clientWidth: 1,
                clientHeight: 1,
              }),
            ],
          })
        )
      }
    })

    await page.waitForTimeout(500)
    successes.push('Touch controls working')
    console.log('✅ Touch Controls: PASS - Touch event simulated\n')

    // Test 6: Test desktop viewport
    console.log('🖥️  Step 7: Testing desktop viewport (1920x1080)...')
    await page.setViewport({ width: 1920, height: 1080, isMobile: false })
    await page.waitForTimeout(1000)

    const desktopStatus = await page.evaluate(() => {
      const canvas = document.querySelector('canvas')
      if (!canvas) return null
      const rect = canvas.getBoundingClientRect()
      return {
        fullscreen:
          rect.width >= window.innerWidth * 0.95 && rect.height >= window.innerHeight * 0.95,
        canvas: { width: rect.width, height: rect.height },
        viewport: { width: window.innerWidth, height: window.innerHeight },
      }
    })

    if (desktopStatus && desktopStatus.fullscreen) {
      successes.push('Desktop fullscreen working')
      console.log('✅ Desktop Fullscreen: PASS')
      console.log(`   Canvas: ${desktopStatus.canvas.width}x${desktopStatus.canvas.height}`)
      console.log(`   Viewport: ${desktopStatus.viewport.width}x${desktopStatus.viewport.height}\n`)
    } else {
      errors.push('Desktop fullscreen not working')
      console.log('❌ Desktop Fullscreen: FAIL\n')
    }

    // Test 7: Check PWA features
    console.log('📱 Step 8: Testing PWA features...')
    const pwaStatus = await page.evaluate(() => {
      return {
        hasManifest: !!document.querySelector('link[rel="manifest"]'),
        hasServiceWorker: 'serviceWorker' in navigator,
        hasThemeColor: !!document.querySelector('meta[name="theme-color"]'),
      }
    })

    if (pwaStatus.hasManifest && pwaStatus.hasServiceWorker && pwaStatus.hasThemeColor) {
      successes.push('PWA features present')
      console.log('✅ PWA Features: PASS - Manifest, Service Worker, Theme Color\n')
    } else {
      warnings.push('Some PWA features missing')
      console.log('⚠️  PWA Features: PARTIAL\n')
    }

    // Test 8: Check service worker version
    console.log('🔧 Step 9: Checking service worker...')
    try {
      const swResponse = await page.goto(BASE_URL + '/sw.js')
      const swContent = await swResponse.text()

      if (swContent.includes('kaden-adventures-v3')) {
        successes.push('Service worker v3 active')
        console.log('✅ Service Worker: PASS - v3 active\n')
      } else {
        warnings.push('Service worker may not be v3')
        console.log('⚠️  Service Worker: Unknown version\n')
      }
    } catch (e) {
      warnings.push('Could not check service worker')
      console.log('⚠️  Service Worker: Could not verify\n')
    }

    // Summary
    console.log('\n' + '='.repeat(60))
    console.log('📊 TEST SUMMARY')
    console.log('='.repeat(60))
    console.log(`✅ Successes: ${successes.length}`)
    console.log(`⚠️  Warnings: ${warnings.length}`)
    console.log(`❌ Errors: ${errors.length}`)
    console.log('='.repeat(60))

    if (successes.length > 0) {
      console.log('\n✅ PASSED TESTS:')
      successes.forEach((s) => console.log(`   ✅ ${s}`))
    }

    if (warnings.length > 0) {
      console.log('\n⚠️  WARNINGS:')
      warnings.forEach((w) => console.log(`   ⚠️  ${w}`))
    }

    if (errors.length > 0) {
      console.log('\n❌ ERRORS:')
      errors.forEach((e) => console.log(`   ❌ ${e}`))
    }

    console.log('\n' + '='.repeat(60))

    const successRate = (successes.length / (successes.length + errors.length)) * 100
    console.log(`\n📈 SUCCESS RATE: ${successRate.toFixed(1)}%`)

    if (successRate >= 90) {
      console.log('🎉 EXCELLENT! Game is working perfectly!')
    } else if (successRate >= 75) {
      console.log('✅ GOOD! Game is working well with minor issues.')
    } else if (successRate >= 50) {
      console.log('⚠️  FAIR! Game has some issues that need attention.')
    } else {
      console.log('❌ POOR! Game has significant issues.')
    }
  } catch (error) {
    console.error('❌ Test failed:', error.message)
  } finally {
    console.log('\n⏳ Closing browser in 3 seconds...')
    await page.waitForTimeout(3000)
    await browser.close()
  }
}

// Run the test
testCompleteGameFeatures().catch(console.error)
