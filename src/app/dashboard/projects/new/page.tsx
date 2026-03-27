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

export default function NewProjectPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [buildings, setBuildings] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)
  const [form, setForm] = useState({
    name: '',
    description: '',
    status: 'planovany',
    priority: 'stredni',
    start_date: '',
    end_date: '',
    budget: '',
    hours_budget: '',
    building_id: '',
    building_name: '',
    manager_email: '',
    manager_name: '',
  })

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
      setForm(prev => ({ ...prev, manager_email: data.user?.email ?? '' }))
    })
    supabase.from('buildings').select('id, name').order('name')
      .then(({ data }) => setBuildings(data ?? []))
  }, [])

  const set = (field: string, value: string) =>
    setForm(prev => ({ ...prev, [field]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const building = buildings.find(b => b.id === form.building_id)

    const { error } = await supabase.from('projects').insert({
      ...form,
      building_id: form.building_id || null,
      building_name: building?.name || null,
      budget: form.budget ? parseFloat(form.budget) : 0,
      hours_budget: form.hours_budget ? parseFloat(form.hours_budget) : 0,
      start_date: form.start_date || null,
      end_date: form.end_date || null,
      team_members: [],
    })

    if (!error) router.push('/dashboard/projects')
    else { alert('Chyba: ' + error.message); setLoading(false) }
  }

  return (
    <div className="p-6 max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/projects" className="text-gray-400 hover:text-gray-600">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-semibold text-gray-900">Nový projekt</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardContent className="p-6 space-y-4">
            <h2 className="font-medium text-gray-900">Základní informace</h2>

            <div className="space-y-2">
              <Label>Název *</Label>
              <Input
                value={form.name}
                onChange={e => set('name', e.target.value)}
                placeholder="např. Rekonstrukce střechy haly A"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Popis</Label>
              <Textarea
                value={form.description}
                onChange={e => set('description', e.target.value)}
                placeholder="Popis projektu..."
                rows={3}
              />
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
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 space-y-4">
            <h2 className="font-medium text-gray-900">Termíny a rozpočet</h2>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Datum zahájení</Label>
                <Input type="date" value={form.start_date} onChange={e => set('start_date', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Datum dokončení</Label>
                <Input type="date" value={form.end_date} onChange={e => set('end_date', e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Rozpočet (Kč)</Label>
                <Input
                  type="number"
                  value={form.budget}
                  onChange={e => set('budget', e.target.value)}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label>Hodinový rozpočet</Label>
                <Input
                  type="number"
                  value={form.hours_budget}
                  onChange={e => set('hours_budget', e.target.value)}
                  placeholder="0"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 space-y-4">
            <h2 className="font-medium text-gray-900">Lokace a manažer</h2>

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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Jméno manažera</Label>
                <Input
                  value={form.manager_name}
                  onChange={e => set('manager_name', e.target.value)}
                  placeholder="Jan Novák"
                />
              </div>
              <div className="space-y-2">
                <Label>Email manažera</Label>
                <Input
                  type="email"
                  value={form.manager_email}
                  onChange={e => set('manager_email', e.target.value)}
                  placeholder="jan@firma.cz"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="submit" disabled={loading} className="flex-1">
            {loading ? 'Ukládám...' : 'Vytvořit projekt'}
          </Button>
          <Link href="/dashboard/projects">
            <Button type="button" variant="outline">Zrušit</Button>
          </Link>
        </div>
      </form>
    </div>
  )
}