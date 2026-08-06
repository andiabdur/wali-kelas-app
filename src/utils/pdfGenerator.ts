import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

export async function downloadElementAsPdf(element: HTMLElement, filename: string) {
  const canvas = await html2canvas(element, {
    scale: 2,
    backgroundColor: '#ffffff',
    useCORS: true,
  })
  const imgData = canvas.toDataURL('image/png')
  const pdf = new jsPDF('p', 'mm', 'a4')
  const width = pdf.internal.pageSize.getWidth()
  const height = (canvas.height * width) / canvas.width
  pdf.addImage(imgData, 'PNG', 0, 0, width, height)
  pdf.save(filename)
}
