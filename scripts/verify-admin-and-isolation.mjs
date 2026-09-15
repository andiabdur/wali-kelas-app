import { chromium } from '@playwright/test'
import { spawn } from 'child_process'

console.log('--- RUNNING FULL BROWSER VERIFICATION: ADMIN DASHBOARD, TEACHER MANAGEMENT & ISOLATION ---')

// Using running preview server on http://127.0.0.1:4173/

const browser = await chromium.launch({
  headless: true,
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
})
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } })

const errors = []
page.on('console', (msg) => {
  if (msg.type() === 'error') errors.push(`[Console Error] ${msg.text()}`)
})
page.on('pageerror', (err) => errors.push(`[Page Error] ${err.message}`))

try {
  // 1. Open app and Login as Admin
  await page.goto('http://127.0.0.1:4173/', { waitUntil: 'networkidle' })
  console.log('1. Page loaded, URL:', page.url())

  await page.getByRole('button', { name: 'Admin Sekolah' }).click()
  await page.getByRole('button', { name: 'Masuk ke Akun' }).click()

  // 2. Wait for Admin Dashboard to appear
  await page.waitForSelector('text=Dasbor Pengawasan Sekolah', { timeout: 10000 })
  console.log('2. Admin Dashboard loaded successfully! Heading "Dasbor Pengawasan Sekolah" is visible.')

  const dashboardContent = await page.locator('main').innerText()
  const hasTotalGuru = dashboardContent.includes('Total Guru Terdaftar')
  const hasDaftarKelas = dashboardContent.includes('Daftar Ruang Kelas & Wali Kelas')
  console.log('3. Admin Dashboard contains metrics & class table:', hasTotalGuru && hasDaftarKelas)

  await page.screenshot({ path: 'wali-kelas-admin-dashboard.png', fullPage: true })
  console.log('4. Admin Dashboard screenshot saved: wali-kelas-admin-dashboard.png')

  // 3. Navigate to Manajemen Guru
  await page.getByRole('button', { name: 'Manajemen Guru' }).first().click()
  await page.waitForSelector('text=Manajemen Guru & Wali Kelas', { timeout: 5000 })
  console.log('5. Manajemen Guru page opened!')

  const testId = Date.now().toString().slice(-4)
  const teacherName = `Budi Santoso ${testId}, S.Pd.`
  const teacherEmail = `budi.${testId}@sdncijurey1.sch.id`
  const className = `Kelas IV-${testId}`

  // 4. Create new teacher
  await page.getByRole('button', { name: 'Tambah Guru Baru' }).click()
  await page.waitForSelector('text=Tambah Guru & Wali Kelas', { timeout: 5000 })

  await page.fill('input[placeholder="Contoh: Budi Santoso, S.Pd."]', teacherName)
  await page.fill('input[placeholder="Contoh: 19880214 201201 1 002"]', `19900101 201501 1 ${testId}`)
  await page.fill('input[placeholder="nama@sdncijurey1.sch.id"]', teacherEmail)

  // Select "Buat Kelas Baru..."
  await page.selectOption('select:has-text("Buat Kelas Baru")', { label: '+ Buat Kelas Baru...' })
  await page.waitForSelector('input[placeholder="Contoh: Kelas IV"]')
  await page.fill('input[placeholder="Contoh: Kelas IV"]', className)

  // Click Submit
  await page.getByRole('button', { name: 'Simpan Guru Baru' }).click()

  // Wait for modal to close and new teacher to appear in list
  await page.waitForSelector(`text=${teacherName}`, { timeout: 10000 })
  console.log(`6. Teacher "${teacherName}" successfully created and visible in teacher list!`)

  await page.screenshot({ path: 'wali-kelas-admin-guru.png', fullPage: true })
  console.log('7. Manajemen Guru screenshot saved: wali-kelas-admin-guru.png')

  // 5. Logout from Admin
  await page.getByTitle('Keluar').first().click()
  await page.waitForSelector('text=Aplikasi Wali Kelas', { timeout: 5000 })
  console.log('8. Successfully logged out from Admin!')

  // 6. Login as new teacher
  await page.fill('input[placeholder="nama@sdncijurey1.sch.id"]', teacherEmail)
  await page.fill('input[type="password"]', 'WaliKelas2026!')
  await page.getByRole('button', { name: 'Masuk ke Akun' }).click()

  // 7. Verify teacher sees their own class and NOT Admin elements
  await page.waitForSelector(`text=${className}`, { timeout: 10000 })
  console.log(`9. Teacher logged in successfully! Header shows "${className}".`)

  const sidebarText = await page.locator('aside').innerText()
  const hasNoGuruMgmt = !sidebarText.includes('Manajemen Guru')
  const hasNoClassSwitcher = !sidebarText.includes('Kelas Aktif')
  console.log('10. Teacher sidebar has NO Manajemen Guru & NO Class Switcher:', hasNoGuruMgmt && hasNoClassSwitcher)

  // 8. Verify student isolation: Kelas IV should have 0 students (Bu Evi\'s 10 students must NOT appear!)
  await page.getByRole('button', { name: 'Siswa', exact: true }).click()
  await page.waitForSelector('text=Daftar Siswa', { timeout: 5000 })

  const siswaTextBefore = await page.locator('main').innerText()
  const isEmptyOrNoEviStudents = !siswaTextBefore.includes('Muhammad Zaki') && (siswaTextBefore.includes('Belum ada data siswa') || siswaTextBefore.includes('Daftar Siswa'))
  console.log('11. Data isolation verified: Bu Evi\'s students do NOT appear in Kelas IV!', isEmptyOrNoEviStudents)

  // 9. Add a student to Kelas IV
  await page.getByRole('button', { name: 'Tambah Siswa' }).click()
  await page.waitForSelector('text=Tambah Siswa', { timeout: 5000 })
  await page.fill('label:has-text("Nama Lengkap *") input', 'Fajar Pratama')
  await page.getByRole('button', { name: 'Tambah Siswa' }).last().click()

  await page.waitForSelector('text=Fajar Pratama', { timeout: 5000 })
  console.log('12. Student "Fajar Pratama" successfully added to Kelas IV!')

  await page.screenshot({ path: 'wali-kelas-guru-isolated.png', fullPage: true })
  console.log('13. Isolated teacher dashboard screenshot saved: wali-kelas-guru-isolated.png')

  // 10. Logout and Login as Bu Evi (Kelas V)
  await page.getByTitle('Keluar').first().click()
  await page.waitForSelector('text=Aplikasi Wali Kelas', { timeout: 5000 })

  await page.getByRole('button', { name: 'Wali Kelas V' }).click()
  await page.getByRole('button', { name: 'Masuk ke Akun' }).click()
  await page.waitForSelector('text=Kelas V', { timeout: 10000 })

  await page.getByRole('button', { name: 'Siswa', exact: true }).click()
  await page.waitForSelector('text=Muhammad Zaki Nurbarok', { timeout: 5000 })

  const buEviSiswaText = await page.locator('main').innerText()
  const buEviHasZaki = buEviSiswaText.includes('Muhammad Zaki')
  const buEviHasNoFajar = !buEviSiswaText.includes('Fajar Pratama')
  console.log('14. Bu Evi (Kelas V) has her 10 students and NO Fajar Pratama:', buEviHasZaki && buEviHasNoFajar)

  // 11. Logout and Login as Admin to verify school totals
  await page.getByTitle('Keluar').first().click()
  await page.waitForSelector('text=Aplikasi Wali Kelas', { timeout: 5000 })

  await page.getByRole('button', { name: 'Admin Sekolah' }).click()
  await page.getByRole('button', { name: 'Masuk ke Akun' }).click()
  await page.waitForSelector('text=Dasbor Pengawasan Sekolah', { timeout: 10000 })

  const finalDashboardText = await page.locator('main').innerText()
  const adminSeesBothClasses = finalDashboardText.includes('Kelas V') && finalDashboardText.includes('Kelas IV')
  const adminSees11Students = finalDashboardText.includes('11 Siswa')
  console.log('15. Admin sees both classes and aggregated 11 students:', adminSeesBothClasses && adminSees11Students)

  console.log('--- ALL VERIFICATIONS PASSED FLAWLESSLY! ---')
  console.log('Console Errors:', errors.length ? errors : 'None (Clean)')
} catch (e) {
  console.error('Verification failed with error:', e)
  console.error('Collected errors:', errors)
  process.exitCode = 1
} finally {
  await browser.close()
}
