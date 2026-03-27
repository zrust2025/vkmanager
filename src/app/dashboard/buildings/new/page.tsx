'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function NewBuildingPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '',
    type: 'budova',
    status: 'aktivni',
    address: '',
    description: '',
    total_area: '',
    year_built: '',
    floors_count: '1',
  })

  const set = (field: string, value: string) =>
    setForm(prev => ({ ...prev, [field]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.from('buildings').insert({
      ...form,
      total_area: form.total_area ? parseFloat(form.total_area) : null,
      year_built: form.year_built ? parseInt(form.year_built) : null,
      floors_count: parseInt(form.floors_count) || 1,
    })
    if (!error) router.push('/dashboard/buildings')
    else { alert('Chyba: ' + error.message); setLoading(false) }
  }

  return (
    <div className="p-6 max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard/buildings" className="text-gray-400 hover:text-gray-600">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-semibold text-gray-900">Nová budova</h1>
      </div>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Název *</Label>
              <Input value={form.name} onChange={e => set('name', e.target.value)} placeholder="např. Hala A" required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Typ</Label>
                <Select value={form.type} onValueChange={v => set('type', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="budova">Budova</SelectItem>
                    <SelectItem value="skladovaci_plocha">Skladovací plocha</SelectItem>
                    <SelectItem value="parkovaci_plocha">Parkovací plocha</SelectItem>
                    <SelectItem value="komunikace">Komunikace</SelectItem>
                    <SelectItem value="zelen">Zeleň</SelectItem>
                    <SelectItem value="ostatni">Ostatní</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Stav</Label>
                <Select value={form.status} onValueChange={v => set('status', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="aktivni">Aktivní</SelectItem>
                    <SelectItem value="volna">Volná</SelectItem>
                    <SelectItem value="pronajata">Pronajatá</SelectItem>
                    <SelectItem value="rezervovana">Rezervovaná</SelectItem>
                    <SelectItem value="rekonstrukce">Rekonstrukce</SelectItem>
                    <SelectItem value="interni">Interní</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Adresa</Label>
              <Input value={form.address} onChange={e => set('address', e.target.value)} placeholder="Ulice, město" />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Plocha (m²)</Label>
                <Input type="number" value={form.total_area} onChange={e => set('total_area', e.target.value)} placeholder="0" />
              </div>
              <div className="space-y-2">
                <Label>Rok výstavby</Label>
                <Input type="number" value={form.year_built} onChange={e => set('year_built', e.target.value)} placeholder="2000" />
              </div>
              <div className="space-y-2">
                <Label>Počet pater</Label>
                <Input type="number" value={form.floors_count} onChange={e => set('floors_count', e.target.value)} placeholder="1" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Popis</Label>
              <Textarea value={form.description} onChange={e => set('description', e.target.value)} placeholder="Popis budovy..." rows={3} />
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? 'Ukládám...' : 'Uložit budovu'}
              </Button>
              <Link href="/dashboard/buildings">
                <Button type="button" variant="outline">Zrušit</Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}