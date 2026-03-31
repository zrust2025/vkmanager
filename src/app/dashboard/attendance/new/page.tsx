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
import { Switch } from '@/components/ui/switch'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function NewAttendancePage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [employees, setEmployees] = useState<any[]>([])
  const [form, setForm] = useState({
    employee_id: '',
    date: new Date().toISOString().slice(0, 10),
    type: 'prace',
    hours_worked: '',
    start_time: '',
    end_time: '',
    is_approved: false,
    notes: '',
  })

  useEffect(() => {
    supabase.from('employees').select('id, full_name')
      .eq('is_active', true).order('full_name')
      .then(({ data }) => setEmployees(data ?? []))
  }, [])

  const set = (field: string, value: any) =>
    setForm(prev => ({ ...prev, [field]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.from('attendance').insert({
      ...form,
      employee_id: form.employee_id || null,
      hours_worked: form.hours_worked ? parseFloat(form.hours_worked) : null,
      start_time: form.start_time || null,
      end_time: form.end_time || null,
    })
    if (!error) router.push('/dashboard/attendance')
    else { alert('Chyba: ' + error.message); setLoading(false) }
  }

  return (
    <div className="p-6 max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/attendance" className="text-gray-400 hover:text-gray-600">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-semibold text-gray-900">Nový záznam docházky</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2">
              <Label>Zaměstnanec *</Label>
              <Select value={form.employee_id} onValueChange={v => set('employee_id', v)}>
                <SelectTrigger><SelectValue placeholder="Vyber zaměstnance..." /></SelectTrigger>
                <SelectContent>
                  {employees.map(e => (
                    <SelectItem key={e.id} value={e.id}>{e.full_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Datum *</Label>
                <Input type="date" value={form.date} onChange={e => set('date', e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Typ</Label>
                <Select value={form.type} onValueChange={v => set('type', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="prace">Práce</SelectItem>
                    <SelectItem value="dovolena">Dovolená</SelectItem>
                    <SelectItem value="nemoc">Nemoc</SelectItem>
                    <SelectItem value="sluzebni_cesta">Služební cesta</SelectItem>
                    <SelectItem value="skoleni">Školení</SelectItem>
                    <SelectItem value="home_office">Home office</SelectItem>
                    <SelectItem value="jine">Jiné</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Odpracované hodiny</Label>
                <Input type="number" step="0.5" value={form.hours_worked} onChange={e => set('hours_worked', e.target.value)} placeholder="8" />
              </div>
              <div className="space-y-2">
                <Label>Příchod</Label>
                <Input type="time" value={form.start_time} onChange={e => set('start_time', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Odchod</Label>
                <Input type="time" value={form.end_time} onChange={e => set('end_time', e.target.value)} />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label>Schváleno</Label>
              <Switch checked={form.is_approved} onCheckedChange={v => set('is_approved', v)} />
            </div>

            <div className="space-y-2">
              <Label>Poznámky</Label>
              <Textarea value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Interní poznámky..." rows={3} />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="submit" disabled={loading} className="flex-1">
            {loading ? 'Ukládám...' : 'Uložit záznam'}
          </Button>
          <Link href="/dashboard/attendance">
            <Button type="button" variant="outline">Zrušit</Button>
          </Link>
        </div>
      </form>
    </div>
  )
}