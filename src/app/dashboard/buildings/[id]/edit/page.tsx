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

export default function EditBuildingPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [form, setForm] = useState<any>(null)

  useEffect(() => {
    supabase.from('buildings').select('*').eq('id', id).single()
      .then(({ data }) => setForm(data))
  }, [id])

  const set = (field: string, value: any) =>
    setForm((prev: any) => ({ ...prev, [field]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase
      .from('buildings')
      .update({
        name: form.name,
        type: form.type,
        status: form.status,
        address: form.address,
        description: form.description,
        total_area: form.total_area ? parseFloat(form.total_area) : null,
        year_built: form.year_built ? parseInt(form.year_built) : null,
        last_renovation: form.last_renovation ? parseInt(form.last_renovation) : null,
        floors_count: form.floors_count ? parseInt(form.floors_count) : 1,
        custom_rental_price: form.custom_rental_price ? parseFloat(form.custom_rental_price) : null,
      })
      .eq('id', id)
    if (!error) router.push(`/dashboard/buildings/${id}`)
    else { alert('Chyba: ' + error.message); setLoading(false) }
  }

  const handleDelete = async () => {
    if (!confirm('Opravdu smazat tuto budovu?')) return
    setDeleting(true)
    const { error } = await supabase.from('buildings').delete().eq('id', id)
    if (!error) router.push('/dashboard/buildings')
    else { alert('Chyba: ' + error.message); setDeleting(false) }
  }

  if (!form) return <div className="p-6 text-gray-400">Načítám...</div>

  return (
    <div className="p-6 max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href={`/dashboard/buildings/${id}`} className="text-gray-400 hover:text-gray-600">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-semibold text-gray-900">Upravit budovu</h1>
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
              <Label>Název *</Label>
              <Input value={form.name} onChange={e => set('name', e.target.value)} required />
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
              <Input value={form.address ?? ''} onChange={e => set('address', e.target.value)} />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Plocha (m²)</Label>
                <Input type="number" value={form.total_area ?? ''} onChange={e => set('total_area', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Rok výstavby</Label>
                <Input type="number" value={form.year_built ?? ''} onChange={e => set('year_built', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Počet pater</Label>
                <Input type="number" value={form.floors_count ?? 1} onChange={e => set('floors_count', e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Poslední renovace</Label>
                <Input type="number" value={form.last_renovation ?? ''} onChange={e => set('last_renovation', e.target.value)} placeholder="2020" />
              </div>
              <div className="space-y-2">
                <Label>Nájem (Kč/měs)</Label>
                <Input type="number" value={form.custom_rental_price ?? ''} onChange={e => set('custom_rental_price', e.target.value)} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Popis</Label>
              <Textarea value={form.description ?? ''} onChange={e => set('description', e.target.value)} rows={3} />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="submit" disabled={loading} className="flex-1">
            {loading ? 'Ukládám...' : 'Uložit změny'}
          </Button>
          <Link href={`/dashboard/buildings/${id}`}>
            <Button type="button" variant="outline">Zrušit</Button>
          </Link>
        </div>
      </form>
    </div>
  )
}