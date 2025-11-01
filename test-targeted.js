#!/usr/bin/env node
import puppeteer from 'puppeteer';
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function run() {
  console.log('🎯 Running targeted checks (pause, resume, touch)...');
  const browser = await puppeteer.launch({ headless: false, args: ['--no-sandbox'] });
  const page = await browser.newPage();

  await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });

  // Start from menu
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button'))
      .find(b => b.textContent && b.textContent.toLowerCase().includes('start'));
    if (btn) btn.click();
  });
  await sleep(500);

  // Advance story overlay
  for (let i = 0; i < 6; i++) {
    await page.evaluate(() => {
      const overlay = document.querySelector('.story-overlay');
      if (overlay) overlay.click();
    });
    await sleep(300);
  }

  // Wait for canvas
  await page.waitForSelector('.game-canvas, canvas', { timeout: 10000 });

  // Pause with P and verify overlay
  await page.keyboard.press('KeyP');
  await sleep(300);
  const pausedVisible = await page.evaluate(() => !!document.querySelector('.pause-overlay'));
  console.log(pausedVisible ? '✅ Pause overlay visible' : '❌ Pause overlay not found');

  // Resume
  await page.keyboard.press('KeyP');
  await sleep(300);
  const pausedHidden = await page.evaluate(() => !document.querySelector('.pause-overlay'));
  console.log(pausedHidden ? '✅ Resume hides overlay' : '❌ Pause overlay persisted');

  // Simulate touch events
  await page.evaluate(() => {
    const canvas = document.querySelector('.game-canvas') || document.querySelector('canvas');
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const mkTouch = (x, y) => new Touch({ identifier: 1, target: canvas, clientX: x, clientY: y });
    const ts = new TouchEvent('touchstart', { touches: [mkTouch(cx, cy)] });
    canvas.dispatchEvent(ts);
    const tm = new TouchEvent('touchmove', { touches: [mkTouch(cx + 20, cy + 20)] });
    canvas.dispatchEvent(tm);
    const te = new TouchEvent('touchend', { touches: [] });
    canvas.dispatchEvent(te);
  });
  console.log('✅ Touch events dispatched');

  await browser.close();
  console.log('🎉 Targeted checks complete');
}

run().catch(e => { console.error('❌ Targeted checks failed:', e); process.exit(1); });



