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
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function NewEquipmentPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<any[]>([])
  const [buildings, setBuildings] = useState<any[]>([])
  const [form, setForm] = useState({
    name: '',
    category_id: '',
    manufacturer: '',
    model: '',
    serial_number: '',
    inventory_number: '',
    year_installed: '',
    last_service_date: '',
    next_service_date: '',
    warranty_until: '',
    status: 'aktivni',
    location: '',
    building_id: '',
    description: '',
  })

  useEffect(() => {
    supabase.from('equipment_categories').select('id, name').order('name')
      .then(({ data }) => setCategories(data ?? []))
    supabase.from('buildings').select('id, name').order('name')
      .then(({ data }) => setBuildings(data ?? []))
  }, [])

  const set = (field: string, value: any) =>
    setForm(prev => ({ ...prev, [field]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.from('equipment').insert({
      ...form,
      category_id: form.category_id || null,
      building_id: form.building_id || null,
      year_installed: form.year_installed ? parseInt(form.year_installed) : null,
      last_service_date: form.last_service_date || null,
      next_service_date: form.next_service_date || null,
      warranty_until: form.warranty_until || null,
    })
    if (!error) router.push('/dashboard/equipment')
    else { alert('Chyba: ' + error.message); setLoading(false) }
  }

  return (
    <div className="p-6 max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/equipment" className="text-gray-400 hover:text-gray-600">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-semibold text-gray-900">Nové zařízení</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardContent className="p-6 space-y-4">
            <h2 className="font-medium text-gray-900">Základní informace</h2>
            <div className="space-y-2">
              <Label>Název *</Label>
              <Input value={form.name} onChange={e => set('name', e.target.value)} placeholder="např. Výtah č. 1" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Kategorie</Label>
                <Select value={form.category_id} onValueChange={v => set('category_id', v)}>
                  <SelectTrigger><SelectValue placeholder="Vyber kategorii..." /></SelectTrigger>
                  <SelectContent>
                    {categories.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Stav</Label>
                <Select value={form.status} onValueChange={v => set('status', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="aktivni">Aktivní</SelectItem>
                    <SelectItem value="v_servisu">V servisu</SelectItem>
                    <SelectItem value="mimo_provoz">Mimo provoz</SelectItem>
                    <SelectItem value="vyrazeno">Vyřazeno</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Výrobce</Label>
                <Input value={form.manufacturer} onChange={e => set('manufacturer', e.target.value)} placeholder="Otis, Schindler..." />
              </div>
              <div className="space-y-2">
                <Label>Model</Label>
                <Input value={form.model} onChange={e => set('model', e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Sériové číslo</Label>
                <Input value={form.serial_number} onChange={e => set('serial_number', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Inventární číslo</Label>
                <Input value={form.inventory_number} onChange={e => set('inventory_number', e.target.value)} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 space-y-4">
            <h2 className="font-medium text-gray-900">Umístění</h2>
            <div className="space-y-2">
              <Label>Budova</Label>
              <Select value={form.building_id} onValueChange={v => set('building_id', v)}>
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
              <Input value={form.location} onChange={e => set('location', e.target.value)} placeholder="Suterén, strojovna..." />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 space-y-4">
            <h2 className="font-medium text-gray-900">Servisní informace</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Rok instalace</Label>
                <Input type="number" value={form.year_installed} onChange={e => set('year_installed', e.target.value)} placeholder="2020" />
              </div>
              <div className="space-y-2">
                <Label>Záruka do</Label>
                <Input type="date" value={form.warranty_until} onChange={e => set('warranty_until', e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Poslední servis</Label>
                <Input type="date" value={form.last_service_date} onChange={e => set('last_service_date', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Příští servis</Label>
                <Input type="date" value={form.next_service_date} onChange={e => set('next_service_date', e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Popis</Label>
              <Textarea value={form.description} onChange={e => set('description', e.target.value)} rows={3} />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="submit" disabled={loading} className="flex-1">
            {loading ? 'Ukládám...' : 'Uložit zařízení'}
          </Button>
          <Link href="/dashboard/equipment">
            <Button type="button" variant="outline">Zrušit</Button>
          </Link>
        </div>
      </form>
    </div>
  )
}

