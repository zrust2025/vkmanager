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

export default function EditProjectPage() {
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
    supabase.from('projects').select('*').eq('id', id).single()
      .then(({ data }) => setForm(data))
  }, [id])

  const set = (field: string, value: any) =>
    setForm((prev: any) => ({ ...prev, [field]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const building = buildings.find(b => b.id === form.building_id)
    const { error } = await supabase
      .from('projects')
      .update({
        name: form.name,
        description: form.description,
        status: form.status,
        priority: form.priority,
        manager_name: form.manager_name,
        manager_email: form.manager_email,
        start_date: form.start_date || null,
        end_date: form.end_date || null,
        budget: form.budget ? parseFloat(form.budget) : 0,
        hours_budget: form.hours_budget ? parseFloat(form.hours_budget) : 0,
        building_id: form.building_id || null,
        building_name: building?.name || null,
      })
      .eq('id', id)
    if (!error) router.push(`/dashboard/projects/${id}`)
    else { alert('Chyba: ' + error.message); setLoading(false) }
  }

  const handleDelete = async () => {
    if (!confirm('Opravdu smazat tento projekt?')) return
    setDeleting(true)
    const { error } = await supabase.from('projects').delete().eq('id', id)
    if (!error) router.push('/dashboard/projects')
    else { alert('Chyba: ' + error.message); setDeleting(false) }
  }

  if (!form) return <div className="p-6 text-gray-400">Načítám...</div>

  return (
    <div className="p-6 max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href={`/dashboard/projects/${id}`} className="text-gray-400 hover:text-gray-600">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-semibold text-gray-900">Upravit projekt</h1>
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
              <Input value={form.name ?? ''} onChange={e => set('name', e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Popis</Label>
              <Textarea value={form.description ?? ''} onChange={e => set('description', e.target.value)} rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Stav</Label>
                <Select value={form.status} onValueChange={v => set('status', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planovany">Plánovaný</SelectItem>
                    <SelectItem value="aktivni">Aktivní</SelectItem>
                    <SelectItem value="pozastaven">Pozastaven</SelectItem>
                    <SelectItem value="dokoncen">Dokončen</SelectItem>
                    <SelectItem value="zrusen">Zrušen</SelectItem>
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
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Datum zahájení</Label>
                <Input type="date" value={form.start_date?.slice(0, 10) ?? ''} onChange={e => set('start_date', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Datum dokončení</Label>
                <Input type="date" value={form.end_date?.slice(0, 10) ?? ''} onChange={e => set('end_date', e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Rozpočet (Kč)</Label>
                <Input type="number" value={form.budget ?? ''} onChange={e => set('budget', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Hodinový rozpočet</Label>
                <Input type="number" value={form.hours_budget ?? ''} onChange={e => set('hours_budget', e.target.value)} />
              </div>
            </div>
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
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Jméno manažera</Label>
                <Input value={form.manager_name ?? ''} onChange={e => set('manager_name', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Email manažera</Label>
                <Input type="email" value={form.manager_email ?? ''} onChange={e => set('manager_email', e.target.value)} />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="submit" disabled={loading} className="flex-1">
            {loading ? 'Ukládám...' : 'Uložit změny'}
          </Button>
          <Link href={`/dashboard/projects/${id}`}>
            <Button type="button" variant="outline">Zrušit</Button>
          </Link>
        </div>
      </form>
    </div>
  )
}