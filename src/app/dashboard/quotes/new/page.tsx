'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'
import Link from 'next/link'

export default function NewQuotePage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [tenants, setTenants] = useState<any[]>([])
  const [items, setItems] = useState<any[]>([])
  const [form, setForm] = useState({
    description: '',
    tenant_id: '',
    vat_rate: '21',
    management_fee_percentage: '0',
    valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    notes: '',
    footer_note: 'Uvedené ceny jsou orientační a budou účtovány dle skutečnosti.',
  })

  useEffect(() => {
    supabase.from('tenants').select('id, full_name, company').order('full_name')
      .then(({ data }) => setTenants(data ?? []))
  }, [])

  const set = (field: string, value: string) =>
    setForm(prev => ({ ...prev, [field]: value }))

  const addItem = () =>
    setItems(prev => [...prev, { description: '', quantity: 1, unit: 'hod', unit_price: 0, total: 0 }])

  const updateItem = (i: number, field: string, value: any) => {
    setItems(prev => {
      const updated = [...prev]
      updated[i] = { ...updated[i], [field]: value }
      if (field === 'quantity' || field === 'unit_price') {
        updated[i].total = (updated[i].quantity || 0) * (updated[i].unit_price || 0)
      }
      return updated
    })
  }

  const subtotal = items.reduce((s, i) => s + (i.total || 0), 0)
  const managementFee = subtotal * (parseFloat(form.management_fee_percentage) / 100)
  const beforeVat = subtotal + managementFee
  const vatAmount = beforeVat * (parseFloat(form.vat_rate) / 100)
  const totalWithVat = beforeVat + vatAmount

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const quoteNumber = `NAB-${Date.now().toString().slice(-6)}`
    const { error } = await supabase.from('quotes').insert({
      quote_number: quoteNumber,
      description: form.description,
      tenant_id: form.tenant_id || null,
      items,
      vat_rate: parseFloat(form.vat_rate),
      management_fee_percentage: parseFloat(form.management_fee_percentage),
      management_fee_amount: managementFee,
      subtotal,
      vat_amount: vatAmount,
      total_with_vat: totalWithVat,
      valid_until: form.valid_until,
      notes: form.notes,
      footer_note: form.footer_note,
      status: 'koncept',
    })
    if (!error) router.push('/dashboard/quotes')
    else { alert('Chyba: ' + error.message); setLoading(false) }
  }

  return (
    <div className="p-6 max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/quotes" className="text-gray-400 hover:text-gray-600">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-semibold text-gray-900">Nová cenová nabídka</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardContent className="p-6 space-y-4">
            <h2 className="font-medium text-gray-900">Základní informace</h2>
            <div className="space-y-2">
              <Label>Popis *</Label>
              <Input value={form.description} onChange={e => set('description', e.target.value)} placeholder="Popis nabídky..." required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nájemník</Label>
                <Select value={form.tenant_id} onValueChange={v => set('tenant_id', v)}>
                  <SelectTrigger><SelectValue placeholder="Vyber nájemníka..." /></SelectTrigger>
                  <SelectContent>
                    {tenants.map(t => (
                      <SelectItem key={t.id} value={t.id}>{t.company || t.full_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Platná do</Label>
                <Input type="date" value={form.valid_until} onChange={e => set('valid_until', e.target.value)} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-medium text-gray-900">Položky</h2>
              <Button type="button" variant="outline" size="sm" onClick={addItem}>
                <Plus className="w-3 h-3 mr-1" /> Přidat
              </Button>
            </div>
            {items.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">Zatím žádné položky</p>
            )}
            {items.map((item, i) => (
              <div key={i} className="grid grid-cols-12 gap-2 items-center">
                <div className="col-span-4">
                  <Input placeholder="Popis" value={item.description} onChange={e => updateItem(i, 'description', e.target.value)} />
                </div>
                <div className="col-span-2">
                  <Input type="number" placeholder="Mn." value={item.quantity} onChange={e => updateItem(i, 'quantity', parseFloat(e.target.value))} />
                </div>
                <div className="col-span-2">
                  <Input placeholder="Jedn." value={item.unit} onChange={e => updateItem(i, 'unit', e.target.value)} />
                </div>
                <div className="col-span-3">
                  <Input type="number" placeholder="Cena/j" value={item.unit_price} onChange={e => updateItem(i, 'unit_price', parseFloat(e.target.value))} />
                </div>
                <div className="col-span-1 flex justify-end">
                  <Button type="button" variant="ghost" size="sm"
                    onClick={() => setItems(prev => prev.filter((_, idx) => idx !== i))}>
                    <Trash2 className="w-3 h-3 text-red-400" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 space-y-4">
            <h2 className="font-medium text-gray-900">Kalkulace</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Management fee (%)</Label>
                <Input type="number" value={form.management_fee_percentage} onChange={e => set('management_fee_percentage', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>DPH (%)</Label>
                <Input type="number" value={form.vat_rate} onChange={e => set('vat_rate', e.target.value)} />
              </div>
            </div>
            {subtotal > 0 && (
              <div className="space-y-1 pt-2 border-t border-gray-100">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Mezisoučet</span>
                  <span>{subtotal.toLocaleString('cs-CZ')} Kč</span>
                </div>
                {managementFee > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Management fee ({form.management_fee_percentage}%)</span>
                    <span>{managementFee.toLocaleString('cs-CZ')} Kč</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">DPH ({form.vat_rate}%)</span>
                  <span>{vatAmount.toLocaleString('cs-CZ')} Kč</span>
                </div>
                <div className="flex justify-between text-base font-semibold pt-1 border-t border-gray-100">
                  <span>Celkem s DPH</span>
                  <span>{totalWithVat.toLocaleString('cs-CZ')} Kč</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 space-y-4">
            <h2 className="font-medium text-gray-900">Poznámky</h2>
            <div className="space-y-2">
              <Label>Interní poznámky</Label>
              <Textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={2} />
            </div>
            <div className="space-y-2">
              <Label>Patička nabídky</Label>
              <Textarea value={form.footer_note} onChange={e => set('footer_note', e.target.value)} rows={2} />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="submit" disabled={loading} className="flex-1">
            {loading ? 'Ukládám...' : 'Vytvořit nabídku'}
          </Button>
          <Link href="/dashboard/quotes">
            <Button type="button" variant="outline">Zrušit</Button>
          </Link>
        </div>
      </form>
    </div>
  )
}
