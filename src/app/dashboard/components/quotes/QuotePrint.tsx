'use client'

import { Button } from '@/components/ui/button'
import { Printer } from 'lucide-react'

export default function QuotePrint({ quote }: { quote: any }) {
  const handlePrint = async () => {
    const { default: jsPDF } = await import('jspdf')
    const { default: autoTable } = await import('jspdf-autotable')

    const doc = new jsPDF()
    const items = quote.items ?? []

    // Hlavička
    doc.setFontSize(20)
    doc.setFont('helvetica', 'bold')
    doc.text('Cenova nabidka', 14, 20)

    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(100)
    doc.text(`Cislo: ${quote.quote_number}`, 14, 30)
    doc.text(`Datum: ${new Date(quote.created_at).toLocaleDateString('cs-CZ')}`, 14, 37)
    if (quote.valid_until) {
      doc.text(`Platnost do: ${new Date(quote.valid_until).toLocaleDateString('cs-CZ')}`, 14, 44)
    }

    // Nájemník
    if (quote.tenants) {
      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(0)
      doc.text('Klient:', 120, 30)
      doc.setFont('helvetica', 'normal')
      doc.text(quote.tenants.company || quote.tenants.full_name, 120, 37)
      if (quote.tenants.address) {
        doc.text(quote.tenants.address, 120, 44)
      }
      if (quote.tenants.ico) {
        doc.text(`ICO: ${quote.tenants.ico}`, 120, 51)
      }
    }

    // Popis
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(0)
    doc.text(quote.description || 'Cenova nabidka', 14, 60)

    // Oddělovač
    doc.setDrawColor(200)
    doc.line(14, 64, 196, 64)

    // Tabulka položek
    if (items.length > 0) {
      autoTable(doc, {
        startY: 70,
        head: [['Popis', 'Mnozstvi', 'Jednotka', 'Cena/j (Kc)', 'Celkem (Kc)']],
        body: items.map((item: any) => [
          item.description,
          item.quantity,
          item.unit,
          Number(item.unit_price).toLocaleString('cs-CZ'),
          Number(item.total).toLocaleString('cs-CZ'),
        ]),
        styles: { fontSize: 10, cellPadding: 3 },
        headStyles: { fillColor: [40, 40, 40], textColor: 255 },
        columnStyles: {
          0: { cellWidth: 80 },
          1: { halign: 'right', cellWidth: 25 },
          2: { halign: 'center', cellWidth: 25 },
          3: { halign: 'right', cellWidth: 30 },
          4: { halign: 'right', cellWidth: 30 },
        },
      })
    }

    const finalY = (doc as any).lastAutoTable?.finalY ?? 80

    // Finanční souhrn
    let y = finalY + 10
    doc.setDrawColor(200)
    doc.line(120, y, 196, y)
    y += 6

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(80)

    if (quote.subtotal > 0) {
      doc.text('Mezisoucet:', 120, y)
      doc.text(`${Number(quote.subtotal).toLocaleString('cs-CZ')} Kc`, 196, y, { align: 'right' })
      y += 6
    }

    if (quote.management_fee_amount > 0) {
      doc.text(`Management fee (${quote.management_fee_percentage}%):`, 120, y)
      doc.text(`${Number(quote.management_fee_amount).toLocaleString('cs-CZ')} Kc`, 196, y, { align: 'right' })
      y += 6
    }

    if (quote.vat_amount > 0) {
      doc.text(`DPH (${quote.vat_rate}%):`, 120, y)
      doc.text(`${Number(quote.vat_amount).toLocaleString('cs-CZ')} Kc`, 196, y, { align: 'right' })
      y += 6
    }

    doc.setDrawColor(200)
    doc.line(120, y, 196, y)
    y += 6

    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(0)
    doc.text('Celkem s DPH:', 120, y)
    doc.text(`${Number(quote.total_with_vat).toLocaleString('cs-CZ')} Kc`, 196, y, { align: 'right' })

    // Patička
    if (quote.footer_note) {
      y += 20
      doc.setFontSize(9)
      doc.setFont('helvetica', 'italic')
      doc.setTextColor(120)
      const lines = doc.splitTextToSize(quote.footer_note, 170)
      doc.text(lines, 14, y)
    }

    // Poznámky
    if (quote.notes) {
      y += 15
      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(80)
      doc.text('Poznamky:', 14, y)
      y += 5
      const lines = doc.splitTextToSize(quote.notes, 170)
      doc.text(lines, 14, y)
    }

    doc.save(`nabidka-${quote.quote_number}.pdf`)
  }

  return (
    <Button variant="outline" size="sm" onClick={handlePrint}>
      <Printer className="w-4 h-4 mr-2" />
      Tisk PDF
    </Button>
  )
}
