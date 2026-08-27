import puppeteer from 'puppeteer'
import path from 'path'
import fs from 'fs'

const OUT_DIR = path.resolve('public/screenshots')
if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true })
}

async function capture() {
  console.log('Launching browser to capture fully compiled Prompt Studio...')
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  })
  
  const page = await browser.newPage()
  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 2 })

  console.log('Navigating to http://127.0.0.1:8000...')
  await page.goto('http://127.0.0.1:8000', { waitUntil: 'networkidle0' })
  await new Promise(r => setTimeout(r, 1500))

  // Find and click the selection checkbox on the first paper card
  console.log('Selecting paper card...')
  const checkboxes = await page.$$('button[aria-label="Select paper"], button:has(svg), div.group button')
  
  // Alternatively click the first paper selection checkbox directly via DOM
  await page.evaluate(() => {
    // Look for checkbox inputs or selection buttons on paper cards
    const selectButtons = Array.from(document.querySelectorAll('div.group'))
    if (selectButtons.length > 0) {
      // Find the select button inside the first card (top-left button or checkbox)
      const btn = selectButtons[0].querySelector('button')
      if (btn) btn.click()
    }
  })
  await new Promise(r => setTimeout(r, 800))

  // Click the "Formulate Prompt" floating button or Prompt Studio nav tab
  console.log('Clicking Formulate AI Prompt / Prompt Studio tab...')
  await page.evaluate(() => {
    // Check floating action bar button
    const floatingBtn = Array.from(document.querySelectorAll('button')).find(
      b => b.textContent && (b.textContent.includes('Formulate') || b.textContent.includes('Generate') || b.textContent.includes('Prompt Studio'))
    )
    if (floatingBtn) {
      floatingBtn.click()
    } else {
      // Fallback to top nav tab
      const navBtn = Array.from(document.querySelectorAll('nav button')).find(
        b => b.textContent && b.textContent.includes('Prompt Studio')
      )
      if (navBtn) navBtn.click()
    }
  })

  // Wait for the prompt compiler API response and rendering
  console.log('Waiting for AI Prompt generation API response...')
  await new Promise(r => setTimeout(r, 2500))

  // If paper was not selected via card, select it from inside Prompt Studio
  await page.evaluate(() => {
    const listItems = Array.from(document.querySelectorAll('div.cursor-pointer, input[type="checkbox"]'))
    if (listItems.length > 0 && listItems[0] instanceof HTMLElement) {
      listItems[0].click()
    }
  })
  await new Promise(r => setTimeout(r, 2000))

  // Take the high-res screenshot
  const outPath = path.join(OUT_DIR, '04_prompt_studio_compiled.png')
  await page.screenshot({ path: outPath, fullPage: false })
  console.log('Successfully captured fully compiled Prompt Studio to:', outPath)

  await browser.close()
}

capture().catch(err => {
  console.error('Capture failed:', err)
  process.exit(1)
})
