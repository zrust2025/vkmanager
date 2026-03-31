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

export default function EditOrderPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [projects, setProjects] = useState<any[]>([])
  const [form, setForm] = useState<any>(null)
  const [items, setItems] = useState<any[]>([])

  useEffect(() => {
    supabase.from('projects').select('id, name').eq('status', 'aktivni').order('name')
      .then(({ data }) => setProjects(data ?? []))
    supabase.from('orders').select('*').eq('id', id).single()
      .then(({ data }) => {
        if (data) {
          setForm(data)
          setItems(data.items ?? [])
        }
      })
  }, [id])

  const set = (field: string, value: any) =>
    setForm((prev: any) => ({ ...prev, [field]: value }))

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

  const totalAmount = items.reduce((s, i) => s + (i.total || 0), 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const project = projects.find(p => p.id === form.project_id)
    const { error } = await supabase
      .from('orders')
      .update({
        description: form.description,
        status: form.status,
        project_id: form.project_id || null,
        project_name: project?.name || null,
        items,
        total_amount: totalAmount,
        notes: form.notes,
      })
      .eq('id', id)
    if (!error) router.push(`/dashboard/orders/${id}`)
    else { alert('Chyba: ' + error.message); setLoading(false) }
  }

  const handleDelete = async () => {
    if (!confirm('Opravdu smazat tuto objednávku?')) return
    setDeleting(true)
    const { error } = await supabase.from('orders').delete().eq('id', id)
    if (!error) router.push('/dashboard/orders')
    else { alert('Chyba: ' + error.message); setDeleting(false) }
  }

  if (!form) return <div className="p-6 text-gray-400">Načítám...</div>

  return (
    <div className="p-6 max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href={`/dashboard/orders/${id}`} className="text-gray-400 hover:text-gray-600">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-semibold text-gray-900">Upravit objednávku</h1>
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
            <div className="space-y-2">
              <Label>Popis *</Label>
              <Textarea
                value={form.description ?? ''}
                onChange={e => set('description', e.target.value)}
                rows={3}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Stav</Label>
                <Select value={form.status} onValueChange={v => set('status', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Koncept</SelectItem>
                    <SelectItem value="k_odeslani">K odeslání</SelectItem>
                    <SelectItem value="odeslana">Odeslaná</SelectItem>
                    <SelectItem value="potvrzena">Potvrzená</SelectItem>
                    <SelectItem value="vyrizena">Vyřízená</SelectItem>
                    <SelectItem value="zamitnuta">Zamítnutá</SelectItem>
                    <SelectItem value="zrusena">Zrušená</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Projekt</Label>
                <Select value={form.project_id ?? ''} onValueChange={v => set('project_id', v)}>
                  <SelectTrigger><SelectValue placeholder="Vyber projekt..." /></SelectTrigger>
                  <SelectContent>
                    {projects.map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-medium text-gray-900">Položky</h2>
              <Button type="button" variant="outline" size="sm"
                onClick={() => setItems(prev => [...prev, { name: '', quantity: 1, unit: 'ks', unit_price: 0, total: 0 }])}>
                <Plus className="w-3 h-3 mr-1" /> Přidat
              </Button>
            </div>
            {items.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">Zatím žádné položky</p>
            )}
            {items.map((item, i) => (
              <div key={i} className="grid grid-cols-12 gap-2 items-center">
                <div className="col-span-4">
                  <Input placeholder="Název" value={item.name} onChange={e => updateItem(i, 'name', e.target.value)} />
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
            {totalAmount > 0 && (
              <div className="text-right text-sm font-medium text-gray-700 pt-2 border-t border-gray-100">
                Celkem: {totalAmount.toLocaleString('cs-CZ')} Kč
              </div>
            )}
          </CardContent>
        </Card>

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
          <Link href={`/dashboard/orders/${id}`}>
            <Button type="button" variant="outline">Zrušit</Button>
          </Link>
        </div>
      </form>
    </div>
  )
}