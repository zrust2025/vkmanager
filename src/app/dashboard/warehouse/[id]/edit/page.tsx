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
import { ArrowLeft, Trash2 } from 'lucide-react'
import Link from 'next/link'

export default function EditAssetPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [categories, setCategories] = useState<any[]>([])
  const [buildings, setBuildings] = useState<any[]>([])
  const [form, setForm] = useState<any>(null)

  useEffect(() => {
    supabase.from('asset_categories').select('id, name').order('name')
      .then(({ data }) => setCategories(data ?? []))
    supabase.from('buildings').select('id, name').order('name')
      .then(({ data }) => setBuildings(data ?? []))
    supabase.from('assets').select('*').eq('id', id).single()
      .then(({ data }) => setForm(data))
  }, [id])

  const set = (field: string, value: any) =>
    setForm((prev: any) => ({ ...prev, [field]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const building = buildings.find(b => b.id === form.location_building_id)
    const category = categories.find(c => c.id === form.category_id)
    const { error } = await supabase
      .from('assets')
      .update({
        name: form.name,
        internal_code: form.internal_code,
        category_id: form.category_id || null,
        category_name: category?.name || null,
        manufacturer: form.manufacturer,
        model: form.model,
        serial_number: form.serial_number,
        purchase_date: form.purchase_date || null,
        purchase_price: form.purchase_price ? parseFloat(form.purchase_price) : null,
        status: form.status,
        location: form.location,
        location_building_id: form.location_building_id || null,
        location_building_name: building?.name || null,
        notes: form.notes,
      })
      .eq('id', id)
    if (!error) router.push(`/dashboard/warehouse/${id}`)
    else { alert('Chyba: ' + error.message); setLoading(false) }
  }

  const handleDelete = async () => {
    if (!confirm('Opravdu smazat tuto položku?')) return
    setDeleting(true)
    const { error } = await supabase.from('assets').delete().eq('id', id)
    if (!error) router.push('/dashboard/warehouse')
    else { alert('Chyba: ' + error.message); setDeleting(false) }
  }

  if (!form) return <div className="p-6 text-gray-400">Načítám...</div>

  return (
    <div className="p-6 max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href={`/dashboard/warehouse/${id}`} className="text-gray-400 hover:text-gray-600">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-semibold text-gray-900">Upravit položku</h1>
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
            <h2 className="font-medium text-gray-900">Základní informace</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Název *</Label>
                <Input value={form.name ?? ''} onChange={e => set('name', e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Interní kód</Label>
                <Input value={form.internal_code ?? ''} onChange={e => set('internal_code', e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Kategorie</Label>
              <Select value={form.category_id ?? ''} onValueChange={v => set('category_id', v)}>
                <SelectTrigger><SelectValue placeholder="Vyber kategorii..." /></SelectTrigger>
                <SelectContent>
                  {categories.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Výrobce</Label>
                <Input value={form.manufacturer ?? ''} onChange={e => set('manufacturer', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Model</Label>
                <Input value={form.model ?? ''} onChange={e => set('model', e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Sériové číslo</Label>
              <Input value={form.serial_number ?? ''} onChange={e => set('serial_number', e.target.value)} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 space-y-4">
            <h2 className="font-medium text-gray-900">Stav a umístění</h2>
            <div className="space-y-2">
              <Label>Stav</Label>
              <Select value={form.status ?? 'dostupne'} onValueChange={v => set('status', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="dostupne">Dostupné</SelectItem>
                  <SelectItem value="prideleno">Přiděleno</SelectItem>
                  <SelectItem value="zapujceno">Zapůjčeno</SelectItem>
                  <SelectItem value="v_servisu">V servisu</SelectItem>
                  <SelectItem value="vyrazeno">Vyřazeno</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Budova</Label>
              <Select value={form.location_building_id ?? ''} onValueChange={v => set('location_building_id', v)}>
                <SelectTrigger><SelectValue placeholder="Vyber budovu..." /></SelectTrigger>
                <SelectContent>
                  {buildings.map(b => (
                    <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Přesné umístění</Label>
              <Input value={form.location ?? ''} onChange={e => set('location', e.target.value)} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 space-y-4">
            <h2 className="font-medium text-gray-900">Pořizovací informace</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Datum pořízení</Label>
                <Input type="date" value={form.purchase_date?.slice(0, 10) ?? ''} onChange={e => set('purchase_date', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Pořizovací cena (Kč)</Label>
                <Input type="number" value={form.purchase_price ?? ''} onChange={e => set('purchase_price', e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Poznámky</Label>
              <Textarea value={form.notes ?? ''} onChange={e => set('notes', e.target.value)} rows={3} />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="submit" disabled={loading} className="flex-1">
            {loading ? 'Ukládám...' : 'Uložit změny'}
          </Button>
          <Link href={`/dashboard/warehouse/${id}`}>
            <Button type="button" variant="outline">Zrušit</Button>
          </Link>
        </div>
      </form>
    </div>
  )
}