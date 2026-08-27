import puppeteer from 'puppeteer'
import path from 'path'

const OUT_DIR = path.resolve('public/screenshots')

async function capture() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  })
  
  const page = await browser.newPage()
  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 2 })

  await page.goto('http://127.0.0.1:8000', { waitUntil: 'networkidle0' })
  await new Promise(r => setTimeout(r, 1000))

  // Click on the first card to open modal
  const cards = await page.$$('div.cursor-pointer')
  if (cards.length > 0) {
    await cards[0].click()
    await new Promise(r => setTimeout(r, 1000))
    await page.screenshot({ path: path.join(OUT_DIR, '03_paper_modal_detail.png') })
    console.log('Captured 03_paper_modal_detail.png')
  }

  // Go to prompt studio tab and select paper
  const promptTab = await page.evaluateHandle(() => {
    const btns = Array.from(document.querySelectorAll('nav button'))
    return btns.find(b => b.textContent && b.textContent.includes('Prompt Studio'))
  })
  if (promptTab && promptTab.asElement()) {
    await promptTab.asElement().click()
    await new Promise(r => setTimeout(r, 1200))
    
    // Select first paper in Prompt Studio selector if present
    const paperCheckbox = await page.$('input[type="checkbox"]')
    if (paperCheckbox) {
      await paperCheckbox.click()
      await new Promise(r => setTimeout(r, 1000))
    }
    await page.screenshot({ path: path.join(OUT_DIR, '04_prompt_studio_compiled.png') })
    console.log('Captured 04_prompt_studio_compiled.png')
  }

  await browser.close()
}

capture().catch(err => {
  console.error('Detail capture failed:', err)
  process.exit(1)
})
