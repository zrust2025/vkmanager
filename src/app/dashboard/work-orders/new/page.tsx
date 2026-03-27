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

export default function NewWorkOrderPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [tenants, setTenants] = useState<any[]>([])
  const [form, setForm] = useState({
    order_number: '',
    status: 'otevreny',
    tenant_id: '',
    work_description: '',
    notes: '',
    work_start_date: '',
    work_end_date: '',
  })
  const [workItems, setWorkItems] = useState<any[]>([])
  const [materialItems, setMaterialItems] = useState<any[]>([])

  useEffect(() => {
    supabase.from('tenants').select('id, full_name, company').order('full_name')
      .then(({ data }) => setTenants(data ?? []))
    const num = `WO-${Date.now().toString().slice(-6)}`
    setForm(prev => ({ ...prev, order_number: num }))
  }, [])

  const set = (field: string, value: string) =>
    setForm(prev => ({ ...prev, [field]: value }))

  const addWorkItem = () =>
    setWorkItems(prev => [...prev, { description: '', quantity: 1, unit: 'hod', unit_price: 0, total_price: 0 }])

  const updateWorkItem = (i: number, field: string, value: any) => {
    setWorkItems(prev => {
      const items = [...prev]
      items[i] = { ...items[i], [field]: value }
      if (field === 'quantity' || field === 'unit_price') {
        items[i].total_price = (items[i].quantity || 0) * (items[i].unit_price || 0)
      }
      return items
    })
  }

  const addMaterialItem = () =>
    setMaterialItems(prev => [...prev, { description: '', quantity: 1, unit: 'ks', unit_price: 0, total_price: 0 }])

  const updateMaterialItem = (i: number, field: string, value: any) => {
    setMaterialItems(prev => {
      const items = [...prev]
      items[i] = { ...items[i], [field]: value }
      if (field === 'quantity' || field === 'unit_price') {
        items[i].total_price = (items[i].quantity || 0) * (items[i].unit_price || 0)
      }
      return items
    })
  }

  const workItemsTotal = workItems.reduce((s, i) => s + (i.total_price || 0), 0)
  const materialTotal = materialItems.reduce((s, i) => s + (i.total_price || 0), 0)
  const totalCost = workItemsTotal + materialTotal

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const tenant = tenants.find(t => t.id === form.tenant_id)
    const { error } = await supabase.from('work_orders').insert({
      ...form,
      tenant_id: form.tenant_id || null,
      tenant_name: tenant?.full_name || null,
      tenant_company: tenant?.company || null,
      work_start_date: form.work_start_date || null,
      work_end_date: form.work_end_date || null,
      work_items: workItems,
      material_items: materialItems,
      work_items_cost: workItemsTotal,
      material_cost: materialTotal,
      total_cost: totalCost,
    })

    if (!error) router.push('/dashboard/work-orders')
    else { alert('Chyba: ' + error.message); setLoading(false) }
  }

  return (
    <div className="p-6 max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/work-orders" className="text-gray-400 hover:text-gray-600">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-semibold text-gray-900">Nový pracovní příkaz</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Číslo příkazu</Label>
                <Input value={form.order_number} onChange={e => set('order_number', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Stav</Label>
                <Select value={form.status} onValueChange={v => set('status', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="otevreny">Otevřený</SelectItem>
                    <SelectItem value="prirazen">Přiřazen</SelectItem>
                    <SelectItem value="v_procesu">V procesu</SelectItem>
                    <SelectItem value="ceka">Čeká</SelectItem>
                    <SelectItem value="dokoncen">Dokončen</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

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
              <Label>Popis práce *</Label>
              <Textarea
                value={form.work_description}
                onChange={e => set('work_description', e.target.value)}
                placeholder="Popis prováděných prací..."
                rows={3}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Datum zahájení</Label>
                <Input type="datetime-local" value={form.work_start_date} onChange={e => set('work_start_date', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Datum dokončení</Label>
                <Input type="datetime-local" value={form.work_end_date} onChange={e => set('work_end_date', e.target.value)} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-medium text-gray-900">Práce</h2>
              <Button type="button" variant="outline" size="sm" onClick={addWorkItem}>
                <Plus className="w-3 h-3 mr-1" /> Přidat
              </Button>
            </div>
            {workItems.map((item, i) => (
              <div key={i} className="grid grid-cols-12 gap-2 items-center">
                <div className="col-span-5">
                  <Input placeholder="Popis" value={item.description} onChange={e => updateWorkItem(i, 'description', e.target.value)} />
                </div>
                <div className="col-span-2">
                  <Input type="number" placeholder="Množství" value={item.quantity} onChange={e => updateWorkItem(i, 'quantity', parseFloat(e.target.value))} />
                </div>
                <div className="col-span-2">
                  <Input placeholder="Jednotka" value={item.unit} onChange={e => updateWorkItem(i, 'unit', e.target.value)} />
                </div>
                <div className="col-span-2">
                  <Input type="number" placeholder="Cena/j" value={item.unit_price} onChange={e => updateWorkItem(i, 'unit_price', parseFloat(e.target.value))} />
                </div>
                <div className="col-span-1 flex justify-end">
                  <Button type="button" variant="ghost" size="sm" onClick={() => setWorkItems(prev => prev.filter((_, idx) => idx !== i))}>
                    <Trash2 className="w-3 h-3 text-red-400" />
                  </Button>
                </div>
              </div>
            ))}
            {workItems.length > 0 && (
              <div className="text-right text-sm font-medium text-gray-700 pt-1">
                Celkem práce: {workItemsTotal.toLocaleString('cs-CZ')} Kč
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-medium text-gray-900">Materiál</h2>
              <Button type="button" variant="outline" size="sm" onClick={addMaterialItem}>
                <Plus className="w-3 h-3 mr-1" /> Přidat
              </Button>
            </div>
            {materialItems.map((item, i) => (
              <div key={i} className="grid grid-cols-12 gap-2 items-center">
                <div className="col-span-5">
                  <Input placeholder="Popis" value={item.description} onChange={e => updateMaterialItem(i, 'description', e.target.value)} />
                </div>
                <div className="col-span-2">
                  <Input type="number" placeholder="Množství" value={item.quantity} onChange={e => updateMaterialItem(i, 'quantity', parseFloat(e.target.value))} />
                </div>
                <div className="col-span-2">
                  <Input placeholder="Jednotka" value={item.unit} onChange={e => updateMaterialItem(i, 'unit', e.target.value)} />
                </div>
                <div className="col-span-2">
                  <Input type="number" placeholder="Cena/j" value={item.unit_price} onChange={e => updateMaterialItem(i, 'unit_price', parseFloat(e.target.value))} />
                </div>
                <div className="col-span-1 flex justify-end">
                  <Button type="button" variant="ghost" size="sm" onClick={() => setMaterialItems(prev => prev.filter((_, idx) => idx !== i))}>
                    <Trash2 className="w-3 h-3 text-red-400" />
                  </Button>
                </div>
              </div>
            ))}
            {materialItems.length > 0 && (
              <div className="text-right text-sm font-medium text-gray-700 pt-1">
                Celkem materiál: {materialTotal.toLocaleString('cs-CZ')} Kč
              </div>
            )}
          </CardContent>
        </Card>

        {totalCost > 0 && (
          <div className="text-right text-lg font-semibold text-gray-900">
            Celková cena: {totalCost.toLocaleString('cs-CZ')} Kč
          </div>
        )}

        <div className="flex gap-3">
          <Button type="submit" disabled={loading} className="flex-1">
            {loading ? 'Ukládám...' : 'Vytvořit příkaz'}
          </Button>
          <Link href="/dashboard/work-orders">
            <Button type="button" variant="outline">Zrušit</Button>
          </Link>
        </div>
      </form>
    </div>
  )
}