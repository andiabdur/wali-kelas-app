export function formatDateIndonesian(dateString?: string): string {
  if (!dateString) return ''
  try {
    const [year, month, day] = dateString.split('-').map(Number)
    if (year && month && day) {
      const date = new Date(year, month - 1, day)
      return new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(date)
    }
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return dateString
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date)
  } catch {
    return dateString
  }
}

export function formatTTL(tempatLahir?: string, tanggalLahir?: string): string {
  const formattedDate = tanggalLahir ? formatDateIndonesian(tanggalLahir) : ''
  if (tempatLahir && formattedDate) {
    return `${tempatLahir}, ${formattedDate}`
  }
  if (tempatLahir) return tempatLahir
  if (formattedDate) return formattedDate
  return '-'
}
