import { chromium } from '@playwright/test'

const browser = await chromium.launch({ headless: true })
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  acceptDownloads: true,
})
const page = await context.newPage()
const errors = []
const checks = {}

page.on('console', (message) => {
  if (message.type() === 'error') errors.push(`console: ${message.text()}`)
})
page.on('pageerror', (error) => errors.push(`page: ${error.message}`))

await page.goto('http://127.0.0.1:4173/', { waitUntil: 'networkidle' })

await page.getByRole('button', { name: 'Siswa', exact: true }).click()
await page.getByRole('button', { name: 'Tambah', exact: true }).click()
await page.getByLabel('Nama Lengkap').fill('Siti Aisyah')
await page.getByRole('button', { name: 'Simpan', exact: true }).click()
checks.studentCreated = await page.getByText('Siti Aisyah', { exact: true }).isVisible()

await page.getByRole('button', { name: 'Akademis', exact: true }).click()
await page.getByPlaceholder('Contoh: Matematika').fill('Matematika')
await page.locator('article').filter({ hasText: 'Daftar Mapel' }).getByRole('button').click()
checks.subjectCreated = await page.locator('article').filter({ hasText: 'Daftar Mapel' }).getByText('Matematika', { exact: true }).isVisible()
await page.getByRole('combobox').first().selectOption({ label: 'Matematika' })
const scoreInput = page.locator('input[type="number"]').first()
checks.scoreInputAvailable = await scoreInput.count() > 0
if (checks.scoreInputAvailable) {
  await scoreInput.fill('88')
  await page.getByRole('button', { name: 'Simpan Nilai' }).click()
  checks.scoreSaved = await page.getByRole('cell', { name: '88', exact: true }).isVisible()
}

await page.getByRole('button', { name: 'Siswa', exact: true }).click()
await page.getByRole('button', { name: /Siti Aisyah/ }).click()
await page.getByRole('button', { name: 'Potensi', exact: true }).click()
await page.getByRole('button', { name: /Matematika/ }).click()
checks.potentialSaved = (await page.getByRole('button', { name: /Matematika/ }).getAttribute('class'))?.includes('border-primary') ?? false
await page.getByRole('button', { name: 'Catatan', exact: true }).click()
await page.getByPlaceholder('Tulis catatan perkembangan siswa...').fill('Aktif berdiskusi dan cepat memahami pola angka.')
await page.getByRole('button', { name: 'Tambah Catatan' }).click()
checks.noteSaved = await page.getByText('Aktif berdiskusi dan cepat memahami pola angka.', { exact: true }).isVisible()

await page.getByRole('button', { name: 'Laporan', exact: true }).click()
checks.reportShowsScore = await page.getByRole('cell', { name: '88', exact: true }).isVisible()
checks.reportShowsPotential = await page.getByText('Matematika', { exact: true }).count() >= 2
checks.reportShowsNote = await page.getByText(/Aktif berdiskusi dan cepat memahami pola angka/).isVisible()
const pdfPromise = page.waitForEvent('download')
await page.getByRole('button', { name: 'Download PDF' }).click()
const pdfDownload = await pdfPromise
checks.pdfDownloaded = (await pdfDownload.suggestedFilename()).endsWith('.pdf')

await page.getByRole('button', { name: 'Pengaturan', exact: true }).click()
await page.getByLabel('Nama Kelas').fill('Kelas 4B')
await page.getByLabel('Nama Wali Kelas').fill('Ibu Rani')
await page.getByLabel('Nama Sekolah').fill('SD Harapan')
await page.getByRole('button', { name: 'Simpan Profil' }).click()
checks.profileSaved = await page.getByText('Pengaturan kelas disimpan.').isVisible()
await page.getByRole('button', { name: 'Mode Gelap' }).click()
checks.darkModeEnabled = await page.locator('html').evaluate((element) => element.classList.contains('dark'))
const backupPromise = page.waitForEvent('download')
await page.getByRole('button', { name: 'Export JSON' }).click()
const backupDownload = await backupPromise
checks.backupDownloaded = (await backupDownload.suggestedFilename()).endsWith('.json')
const backupPath = `${process.cwd()}/wali-kelas-test-backup.json`
await backupDownload.saveAs(backupPath)

await page.getByRole('button', { name: 'Reset Data' }).click()
checks.resetConfirmationVisible = await page.getByRole('heading', { name: 'Hapus semua data?' }).isVisible()
await page.getByRole('button', { name: 'Ya, Hapus' }).click()
checks.resetCompleted = await page.getByText('Semua data sudah dihapus.').isVisible()
await page.locator('input[type="file"]').setInputFiles(backupPath)
const importMessage = page.getByText('Data berhasil diimport. Muat ulang halaman jika perlu.')
await importMessage.waitFor()
checks.importCompleted = await importMessage.isVisible()
await page.getByRole('button', { name: 'Siswa', exact: true }).click()
checks.importRestoredStudent = await page.getByText('Siti Aisyah', { exact: true }).isVisible()

await page.setViewportSize({ width: 390, height: 844 })
await page.getByRole('button', { name: 'Dashboard', exact: true }).click()
await page.screenshot({ path: 'wali-kelas-verified-mobile.png', fullPage: true })
checks.mobileNoHorizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)

console.log(JSON.stringify({ checks, errors }, null, 2))
await browser.close()
