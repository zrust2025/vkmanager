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

export default function NewMaintenanceRequestPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [buildings, setBuildings] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)
  const [form, setForm] = useState({
    title: '',
    description: '',
    type: 'oprava',
    priority: 'stredni',
    status: 'novy',
    building_id: '',
  })

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    supabase.from('buildings').select('id, name').order('name').then(({ data }) => setBuildings(data ?? []))
  }, [])

  const set = (field: string, value: string) =>
    setForm(prev => ({ ...prev, [field]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.from('maintenance_requests').insert({
      ...form,
      building_id: form.building_id || null,
      requestor_email: user?.email,
      requestor_name: user?.email,
    })
    if (!error) router.push('/dashboard/maintenance')
    else { alert('Chyba: ' + error.message); setLoading(false) }
  }

  return (
    <div className="p-6 max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard/maintenance" className="text-gray-400 hover:text-gray-600">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-semibold text-gray-900">Nový požadavek</h1>
      </div>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Název *</Label>
              <Input
                value={form.title}
                onChange={e => set('title', e.target.value)}
                placeholder="např. Prasklá trubka v kotelně"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Popis</Label>
              <Textarea
                value={form.description}
                onChange={e => set('description', e.target.value)}
                placeholder="Podrobný popis problému..."
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
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
            </div>

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

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? 'Ukládám...' : 'Vytvořit požadavek'}
              </Button>
              <Link href="/dashboard/maintenance">
                <Button type="button" variant="outline">Zrušit</Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}