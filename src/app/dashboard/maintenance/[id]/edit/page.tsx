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

export default function EditMaintenanceRequestPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [buildings, setBuildings] = useState<any[]>([])
  const [form, setForm] = useState<any>(null)

  useEffect(() => {
    supabase.from('buildings').select('id, name').order('name')
      .then(({ data }) => setBuildings(data ?? []))
    supabase.from('maintenance_requests').select('*').eq('id', id).single()
      .then(({ data }) => setForm(data))
  }, [id])

  const set = (field: string, value: string) =>
    setForm((prev: any) => ({ ...prev, [field]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase
      .from('maintenance_requests')
      .update({
        title: form.title,
        description: form.description,
        type: form.type,
        priority: form.priority,
        status: form.status,
        building_id: form.building_id || null,
        due_date: form.due_date || null,
        estimated_cost: form.estimated_cost ? parseFloat(form.estimated_cost) : null,
        actual_cost: form.actual_cost ? parseFloat(form.actual_cost) : null,
        estimated_hours: form.estimated_hours ? parseFloat(form.estimated_hours) : null,
        actual_hours: form.actual_hours ? parseFloat(form.actual_hours) : null,
        resolution_notes: form.resolution_notes,
        assigned_to_email: form.assigned_to_email,
      })
      .eq('id', id)
    if (!error) router.push(`/dashboard/maintenance/${id}`)
    else { alert('Chyba: ' + error.message); setLoading(false) }
  }

  const handleDelete = async () => {
    if (!confirm('Opravdu smazat tento požadavek?')) return
    setDeleting(true)
    const { error } = await supabase.from('maintenance_requests').delete().eq('id', id)
    if (!error) router.push('/dashboard/maintenance')
    else { alert('Chyba: ' + error.message); setDeleting(false) }
  }

  if (!form) return <div className="p-6 text-gray-400">Načítám...</div>

  return (
    <div className="p-6 max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href={`/dashboard/maintenance/${id}`} className="text-gray-400 hover:text-gray-600">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-semibold text-gray-900">Upravit požadavek</h1>
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
              <Input value={form.title} onChange={e => set('title', e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label>Popis</Label>
              <Textarea value={form.description ?? ''} onChange={e => set('description', e.target.value)} rows={4} />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Typ</Label>
                <Select value={form.type} onValueChange={v => set('type', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="oprava">Oprava</SelectItem>
                    <SelectItem value="revize">Revize</SelectItem>
                    <SelectItem value="kontrola">Kontrola</SelectItem>
                    <SelectItem value="instalace">Instalace</SelectItem>
                    <SelectItem value="jine">Jiné</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Priorita</Label>
                <Select value={form.priority} onValueChange={v => set('priority', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nizka">Nízká</SelectItem>
                    <SelectItem value="stredni">Střední</SelectItem>
                    <SelectItem value="vysoka">Vysoká</SelectItem>
                    <SelectItem value="kriticka">Kritická</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Stav</Label>
                <Select value={form.status} onValueChange={v => set('status', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="novy">Nový</SelectItem>
                    <SelectItem value="prirazen">Přiřazen</SelectItem>
                    <SelectItem value="v_reseni">V řešení</SelectItem>
                    <SelectItem value="ceka_na_material">Čeká na materiál</SelectItem>
                    <SelectItem value="ceka_na_schvaleni">Čeká na schválení</SelectItem>
                    <SelectItem value="dokoncen">Dokončen</SelectItem>
                    <SelectItem value="zrusen">Zrušen</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Budova</Label>
                <Select value={form.building_id ?? ''} onValueChange={v => set('building_id', v)}>
                  <SelectTrigger><SelectValue placeholder="Vyber budovu..." /></SelectTrigger>
                  <SelectContent>
                    {buildings.map(b => (
                      <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Termín</Label>
                <Input type="date" value={form.due_date?.slice(0, 10) ?? ''} onChange={e => set('due_date', e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Odh. náklady (Kč)</Label>
                <Input type="number" value={form.estimated_cost ?? ''} onChange={e => set('estimated_cost', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Skutečné náklady (Kč)</Label>
                <Input type="number" value={form.actual_cost ?? ''} onChange={e => set('actual_cost', e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Odh. hodiny</Label>
                <Input type="number" value={form.estimated_hours ?? ''} onChange={e => set('estimated_hours', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Skutečné hodiny</Label>
                <Input type="number" value={form.actual_hours ?? ''} onChange={e => set('actual_hours', e.target.value)} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Přiřazeno (email)</Label>
              <Input type="email" value={form.assigned_to_email ?? ''} onChange={e => set('assigned_to_email', e.target.value)} placeholder="technik@firma.cz" />
            </div>

            <div className="space-y-2">
              <Label>Poznámky k řešení</Label>
              <Textarea value={form.resolution_notes ?? ''} onChange={e => set('resolution_notes', e.target.value)} rows={3} placeholder="Jak byl problém vyřešen..." />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="submit" disabled={loading} className="flex-1">
            {loading ? 'Ukládám...' : 'Uložit změny'}
          </Button>
          <Link href={`/dashboard/maintenance/${id}`}>
            <Button type="button" variant="outline">Zrušit</Button>
          </Link>
        </div>
      </form>
    </div>
  )
}