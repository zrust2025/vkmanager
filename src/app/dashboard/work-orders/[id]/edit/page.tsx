'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, Trash2, Plus } from 'lucide-react'
import Link from 'next/link'

export default function EditWorkOrderPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [tenants, setTenants] = useState<any[]>([])
  const [form, setForm] = useState<any>(null)
  const [workItems, setWorkItems] = useState<any[]>([])
  const [materialItems, setMaterialItems] = useState<any[]>([])

  useEffect(() => {
    supabase.from('tenants').select('id, full_name, company').order('full_name')
      .then(({ data }) => setTenants(data ?? []))
    supabase.from('work_orders').select('*').eq('id', id).single()
      .then(({ data }) => {
        if (data) {
          setForm(data)
          setWorkItems(data.work_items ?? [])
          setMaterialItems(data.material_items ?? [])
        }
      })
  }, [id])

  const set = (field: string, value: any) =>
    setForm((prev: any) => ({ ...prev, [field]: value }))

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
    const { error } = await supabase
      .from('work_orders')
      .update({
        order_number: form.order_number,
        status: form.status,
        tenant_id: form.tenant_id || null,
        work_description: form.work_description,
        notes: form.notes,
        work_start_date: form.work_start_date || null,
        work_end_date: form.work_end_date || null,
        work_items: workItems,
        material_items: materialItems,
        work_items_cost: workItemsTotal,
        material_cost: materialTotal,
        total_cost: totalCost,
      })
      .eq('id', id)
    if (!error) router.push(`/dashboard/work-orders/${id}`)
    else { alert('Chyba: ' + error.message); setLoading(false) }
  }

  const handleDelete = async () => {
    if (!confirm('Opravdu smazat tento pracovní příkaz?')) return
    setDeleting(true)
    const { error } = await supabase.from('work_orders').delete().eq('id', id)
    if (!error) router.push('/dashboard/work-orders')
    else { alert('Chyba: ' + error.message); setDeleting(false) }
  }

  if (!form) return <div className="p-6 text-gray-400">Načítám...</div>

  return (
    <div className="p-6 max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href={`/dashboard/work-orders/${id}`} className="text-gray-400 hover:text-gray-600">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-semibold text-gray-900">Upravit pracovní příkaz</h1>
        </div>
        <Button variant="outline" size="sm" onClick={handleDelete} disabled={deleting}
          className="text-red-500 border-red-200 hover:bg-red-50">
          <Trash2 className="w-4 h-4 mr-1" />
          {deleting ? 'Mažu...' : 'Smazat'}
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Číslo příkazu</Label>
                <Input value={form.order_number ?? ''} onChange={e => set('order_number', e.target.value)} />
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
                    <SelectItem value="fakturovano">Fakturováno</SelectItem>
                    <SelectItem value="zrusen">Zrušen</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Nájemník</Label>
              <Select value={form.tenant_id ?? ''} onValueChange={v => set('tenant_id', v)}>
                <SelectTrigger><SelectValue placeholder="Vyber nájemníka..." /></SelectTrigger>
                <SelectContent>
                  {tenants.map(t => (
                    <SelectItem key={t.id} value={t.id}>{t.company || t.full_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Popis práce</Label>
              <Textarea value={form.work_description ?? ''} onChange={e => set('work_description', e.target.value)} rows={3} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Datum zahájení</Label>
                <Input type="datetime-local" value={form.work_start_date?.slice(0, 16) ?? ''} onChange={e => set('work_start_date', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Datum dokončení</Label>
                <Input type="datetime-local" value={form.work_end_date?.slice(0, 16) ?? ''} onChange={e => set('work_end_date', e.target.value)} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-medium text-gray-900">Práce</h2>
              <Button type="button" variant="outline" size="sm"
                onClick={() => setWorkItems(prev => [...prev, { description: '', quantity: 1, unit: 'hod', unit_price: 0, total_price: 0 }])}>
                <Plus className="w-3 h-3 mr-1" /> Přidat
              </Button>
            </div>
            {workItems.map((item, i) => (
              <div key={i} className="grid grid-cols-12 gap-2 items-center">
                <div className="col-span-5">
                  <Input placeholder="Popis" value={item.description} onChange={e => updateWorkItem(i, 'description', e.target.value)} />
                </div>
                <div className="col-span-2">
                  <Input type="number" value={item.quantity} onChange={e => updateWorkItem(i, 'quantity', parseFloat(e.target.value))} />
                </div>
                <div className="col-span-2">
                  <Input value={item.unit} onChange={e => updateWorkItem(i, 'unit', e.target.value)} />
                </div>
                <div className="col-span-2">
                  <Input type="number" value={item.unit_price} onChange={e => updateWorkItem(i, 'unit_price', parseFloat(e.target.value))} />
                </div>
                <div className="col-span-1 flex justify-end">
                  <Button type="button" variant="ghost" size="sm"
                    onClick={() => setWorkItems(prev => prev.filter((_, idx) => idx !== i))}>
                    <Trash2 className="w-3 h-3 text-red-400" />
                  </Button>
                </div>
              </div>
            ))}
            {workItemsTotal > 0 && (
              <div className="text-right text-sm font-medium text-gray-700">
                Celkem práce: {workItemsTotal.toLocaleString('cs-CZ')} Kč
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-medium text-gray-900">Materiál</h2>
              <Button type="button" variant="outline" size="sm"
                onClick={() => setMaterialItems(prev => [...prev, { description: '', quantity: 1, unit: 'ks', unit_price: 0, total_price: 0 }])}>
                <Plus className="w-3 h-3 mr-1" /> Přidat
              </Button>
            </div>
            {materialItems.map((item, i) => (
              <div key={i} className="grid grid-cols-12 gap-2 items-center">
                <div className="col-span-5">
                  <Input placeholder="Popis" value={item.description} onChange={e => updateMaterialItem(i, 'description', e.target.value)} />
                </div>
                <div className="col-span-2">
                  <Input type="number" value={item.quantity} onChange={e => updateMaterialItem(i, 'quantity', parseFloat(e.target.value))} />
                </div>
                <div className="col-span-2">
                  <Input value={item.unit} onChange={e => updateMaterialItem(i, 'unit', e.target.value)} />
                </div>
                <div className="col-span-2">
                  <Input type="number" value={item.unit_price} onChange={e => updateMaterialItem(i, 'unit_price', parseFloat(e.target.value))} />
                </div>
                <div className="col-span-1 flex justify-end">
                  <Button type="button" variant="ghost" size="sm"
                    onClick={() => setMaterialItems(prev => prev.filter((_, idx) => idx !== i))}>
                    <Trash2 className="w-3 h-3 text-red-400" />
                  </Button>
                </div>
              </div>
            ))}
            {materialTotal > 0 && (
              <div className="text-right text-sm font-medium text-gray-700">
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

        <Card>
          <CardContent className="p-6 space-y-2">
            <Label>Poznámky</Label>
            <Textarea value={form.notes ?? ''} onChange={e => set('notes', e.target.value)} rows={3} />
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="submit" disabled={loading} className="flex-1">
            {loading ? 'Ukládám...' : 'Uložit změny'}
          </Button>
          <Link href={`/dashboard/work-orders/${id}`}>
            <Button type="button" variant="outline">Zrušit</Button>
          </Link>
        </div>
      </form>
    </div>
  )
}