import { chromium } from '@playwright/test'

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 390, height: 844 } })
const errors = []
page.on('console', message => {
  if (message.type() === 'error') errors.push(`console: ${message.text()}`)
})
page.on('pageerror', error => errors.push(`page: ${error.message}`))

await page.goto('http://127.0.0.1:4173/', { waitUntil: 'networkidle' })
await page.screenshot({ path: 'wali-kelas-mobile.png', fullPage: true })
const dashboardTitle = await page.getByRole('heading', { name: 'Kelas SD' }).isVisible()

await page.getByRole('button', { name: 'Siswa', exact: true }).click()
await page.getByRole('button', { name: 'Tambah', exact: true }).click()
await page.getByLabel('Nama Lengkap').fill('Siti Aisyah')
await page.getByRole('button', { name: 'Simpan', exact: true }).click()
await page.waitForTimeout(100)
const matchingStudentTexts = await page.getByText('Siti Aisyah', { exact: true }).count()
const pageTextAfterSave = await page.locator('main').innerText()
const studentVisible = matchingStudentTexts > 0 && pageTextAfterSave.includes('Siti Aisyah')

await page.getByRole('button', { name: 'Absensi', exact: true }).click()
await page.getByRole('button', { name: 'Tandai Semua Hadir' }).click()
await page.getByRole('button', { name: 'Simpan', exact: true }).click()
const attendanceFilled = await page.getByText('Terisi 1/1 siswa').isVisible()

await page.setViewportSize({ width: 1440, height: 900 })
await page.goto('http://127.0.0.1:4173/', { waitUntil: 'networkidle' })
await page.screenshot({ path: 'wali-kelas-desktop.png', fullPage: true })

console.log(JSON.stringify({ dashboardTitle, studentVisible, matchingStudentTexts, pageTextAfterSave, attendanceFilled, errors }, null, 2))
await browser.close()
