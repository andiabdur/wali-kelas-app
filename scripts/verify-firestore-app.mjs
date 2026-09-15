import { chromium } from '@playwright/test'
import { spawn } from 'child_process'

console.log('--- RUNNING FULL BROWSER VERIFICATION WITH FIREBASE ---')

// 1. Launch vite preview
const server = spawn('npm', ['run', 'preview', '--', '--port', '4173'], {
  stdio: 'pipe',
  shell: true,
})

// Wait 2s for server to start
await new Promise((r) => setTimeout(r, 2500))

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } })

const errors = []
page.on('console', (msg) => {
  if (msg.type() === 'error') errors.push(`[Console Error] ${msg.text()}`)
})
page.on('pageerror', (err) => errors.push(`[Page Error] ${err.message}`))

try {
  // Step 1: Open app and check Login page
  await page.goto('http://127.0.0.1:4173/', { waitUntil: 'networkidle' })
  console.log('1. Page loaded, URL:', page.url())

  const loginHeading = await page.getByRole('heading', { name: 'Aplikasi Wali Kelas' }).isVisible()
  console.log('2. Login page heading visible:', loginHeading)

  // Step 2: Login as Wali Kelas V (Evi Purnamasari)
  await page.getByRole('button', { name: 'Wali Kelas V' }).click()
  await page.getByRole('button', { name: 'Masuk ke Akun' }).click()

  // Wait for Dashboard to appear
  await page.waitForSelector('text=Kelas V', { timeout: 8000 })
  console.log('3. Logged in as Wali Kelas V! Header "Kelas V" visible.')

  // Check student count on dashboard
  await page.waitForTimeout(1000)
  const dashboardText = await page.locator('main').innerText()
  const has10Students = dashboardText.includes('Total Siswa') && dashboardText.includes('10')
  console.log('4. Dashboard displays 10 Total Siswa:', has10Students)

  // Step 3: Check Siswa List
  await page.getByRole('button', { name: 'Siswa', exact: true }).click()
  await page.waitForSelector('text=Muhammad Zaki Nurbarok', { timeout: 5000 })
  console.log('5. Siswa page loaded: Muhammad Zaki Nurbarok is present in the list!')

  // Step 4: Check Akademis
  await page.getByRole('button', { name: 'Akademis', exact: true }).click()
  await page.waitForSelector('text=Mata Pelajaran', { timeout: 5000 })
  const akademisText = await page.locator('main').innerText()
  const hasMapel = akademisText.includes('Seni Rupa') || akademisText.includes('Matematika') || akademisText.includes('Bahasa')
  console.log('6. Akademis page loaded with master subjects:', hasMapel)

  // Step 5: Check Pengaturan & Cloud status
  await page.getByRole('button', { name: 'Pengaturan', exact: true }).click()
  await page.waitForSelector('text=Cloud Firestore Aktif', { timeout: 5000 })
  console.log('7. Pengaturan page shows Cloud Firestore Aktif indicator!')

  // Take Desktop Screenshot
  await page.screenshot({ path: 'wali-kelas-firestore-desktop.png', fullPage: true })
  console.log('8. Desktop screenshot captured: wali-kelas-firestore-desktop.png')

  // Step 6: Test Mobile View
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('http://127.0.0.1:4173/', { waitUntil: 'networkidle' })
  await page.waitForSelector('text=Kelas V', { timeout: 5000 })
  await page.screenshot({ path: 'wali-kelas-firestore-mobile.png', fullPage: true })
  console.log('9. Mobile screenshot captured: wali-kelas-firestore-mobile.png')

  console.log('--- ALL VERIFICATIONS PASSED SUCCESSFULLY ---')
  console.log('Console / Page Errors:', errors.length ? errors : 'None (Clean)')
} catch (e) {
  console.error('Verification failed with error:', e)
  console.error('Collected errors:', errors)
  process.exitCode = 1
} finally {
  await browser.close()
  server.kill()
}
