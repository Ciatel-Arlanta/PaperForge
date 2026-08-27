import puppeteer from 'puppeteer'
import fs from 'fs'
import path from 'path'

const OUT_DIR = path.resolve('public/screenshots')
if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true })
}

async function capture() {
  console.log('Launching browser...')
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  })
  
  const page = await browser.newPage()
  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 2 })

  console.log('Navigating to PaperForge Papers page...')
  await page.goto('http://127.0.0.1:8000', { waitUntil: 'networkidle0' })
  await new Promise(r => setTimeout(r, 1500))

  // 1. Papers List (Dark Mode Full Overview)
  await page.screenshot({ path: path.join(OUT_DIR, '01_papers_grid.png'), fullPage: false })
  console.log('Captured 01_papers_grid.png')

  // 2. Filter "Has Code"
  try {
    const hasCodeBtn = await page.evaluateHandle(() => {
      const btns = Array.from(document.querySelectorAll('button'))
      return btns.find(b => b.textContent && b.textContent.includes('Has Code'))
    })
    if (hasCodeBtn && hasCodeBtn.asElement()) {
      await hasCodeBtn.asElement().click()
      await new Promise(r => setTimeout(r, 1000))
      await page.screenshot({ path: path.join(OUT_DIR, '02_has_code_filtered.png'), fullPage: false })
      console.log('Captured 02_has_code_filtered.png')
    }
  } catch (e) {
    console.error('Error filtering has code:', e)
  }

  // 3. Open Paper Modal (Click on first paper card)
  try {
    const firstCard = await page.$('div[class*="group cursor-pointer"]')
    if (firstCard) {
      await firstCard.click()
      await new Promise(r => setTimeout(r, 1200))
      await page.screenshot({ path: path.join(OUT_DIR, '03_paper_modal.png'), fullPage: false })
      console.log('Captured 03_paper_modal.png')
      
      // Close modal
      const closeBtn = await page.$('button[class*="rounded-lg text-zinc-400"]')
      if (closeBtn) await closeBtn.click()
      await new Promise(r => setTimeout(r, 500))
    }
  } catch (e) {
    console.error('Error opening paper modal:', e)
  }

  // 4. Prompt Studio Tab
  try {
    const promptTab = await page.evaluateHandle(() => {
      const btns = Array.from(document.querySelectorAll('nav button'))
      return btns.find(b => b.textContent && b.textContent.includes('Prompt Studio'))
    })
    if (promptTab && promptTab.asElement()) {
      await promptTab.asElement().click()
      await new Promise(r => setTimeout(r, 1200))
      await page.screenshot({ path: path.join(OUT_DIR, '04_prompt_studio.png'), fullPage: false })
      console.log('Captured 04_prompt_studio.png')
    }
  } catch (e) {
    console.error('Error opening prompt studio:', e)
  }

  // 5. Analytics Tab
  try {
    const analyticsTab = await page.evaluateHandle(() => {
      const btns = Array.from(document.querySelectorAll('nav button'))
      return btns.find(b => b.textContent && b.textContent.includes('Analytics'))
    })
    if (analyticsTab && analyticsTab.asElement()) {
      await analyticsTab.asElement().click()
      await new Promise(r => setTimeout(r, 1200))
      await page.screenshot({ path: path.join(OUT_DIR, '05_analytics_view.png'), fullPage: false })
      console.log('Captured 05_analytics_view.png')
    }
  } catch (e) {
    console.error('Error opening analytics:', e)
  }

  await browser.close()
  console.log('All screenshots captured successfully!')
}

capture().catch(err => {
  console.error('Capture failed:', err)
  process.exit(1)
})
