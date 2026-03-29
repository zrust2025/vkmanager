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
import { Switch } from '@/components/ui/switch'
import { ArrowLeft, Trash2 } from 'lucide-react'
import Link from 'next/link'

export default function EditEmployeePage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [form, setForm] = useState<any>(null)

  useEffect(() => {
    supabase.from('employees').select('*').eq('id', id).single()
      .then(({ data }) => setForm(data))
  }, [id])

  const set = (field: string, value: any) =>
    setForm((prev: any) => ({ ...prev, [field]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase
      .from('employees')
      .update({
        full_name: form.full_name,
        email: form.email,
        phone: form.phone,
        employee_number: form.employee_number,
        position: form.position,
        department: form.department,
        work_group: form.work_group,
        contract_type: form.contract_type,
        hire_date: form.hire_date || null,
        base_salary: form.base_salary ? parseFloat(form.base_salary) : 0,
        hourly_rate: form.hourly_rate ? parseFloat(form.hourly_rate) : 0,
        vacation_days_budget: parseInt(form.vacation_days_budget) || 20,
        home_office_days_budget: parseInt(form.home_office_days_budget) || 0,
        monthly_hours_capacity: parseInt(form.monthly_hours_capacity) || 160,
        is_active: form.is_active,
        notes: form.notes,
      })
      .eq('id', id)
    if (!error) router.push(`/dashboard/hr/${id}`)
    else { alert('Chyba: ' + error.message); setLoading(false) }
  }

  const handleDelete = async () => {
    if (!confirm('Opravdu smazat tohoto zaměstnance?')) return
    setDeleting(true)
    const { error } = await supabase.from('employees').delete().eq('id', id)
    if (!error) router.push('/dashboard/hr')
    else { alert('Chyba: ' + error.message); setDeleting(false) }
  }

  if (!form) return <div className="p-6 text-gray-400">Načítám...</div>

  return (
    <div className="p-6 max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href={`/dashboard/hr/${id}`} className="text-gray-400 hover:text-gray-600">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-semibold text-gray-900">Upravit zaměstnance</h1>
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
            <h2 className="font-medium text-gray-900">Osobní informace</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Jméno *</Label>
                <Input value={form.full_name ?? ''} onChange={e => set('full_name', e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Osobní číslo</Label>
                <Input value={form.employee_number ?? ''} onChange={e => set('employee_number', e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={form.email ?? ''} onChange={e => set('email', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Telefon</Label>
                <Input value={form.phone ?? ''} onChange={e => set('phone', e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Pozice</Label>
                <Input value={form.position ?? ''} onChange={e => set('position', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Oddělení</Label>
                <Input value={form.department ?? ''} onChange={e => set('department', e.target.value)} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 space-y-4">
            <h2 className="font-medium text-gray-900">Pracovní podmínky</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Pracovní skupina</Label>
                <Select value={form.work_group ?? 'office'} onValueChange={v => set('work_group', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="management">Management</SelectItem>
                    <SelectItem value="office">Administrativa</SelectItem>
                    <SelectItem value="maintenance">Údržba — interní</SelectItem>
                    <SelectItem value="maintenance_external">Údržba — externí</SelectItem>
                    <SelectItem value="other">Jiné</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Typ smlouvy</Label>
                <Select value={form.contract_type ?? 'HPP'} onValueChange={v => set('contract_type', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HPP">HPP</SelectItem>
                    <SelectItem value="DPP">DPP</SelectItem>
                    <SelectItem value="DPC">DPČ</SelectItem>
                    <SelectItem value="OSVČ">OSVČ</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Datum nástupu</Label>
              <Input type="date" value={form.hire_date?.slice(0, 10) ?? ''} onChange={e => set('hire_date', e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Základní mzda (Kč)</Label>
                <Input type="number" value={form.base_salary ?? ''} onChange={e => set('base_salary', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Hodinová sazba (Kč)</Label>
                <Input type="number" value={form.hourly_rate ?? ''} onChange={e => set('hourly_rate', e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Dovolená (dny)</Label>
                <Input type="number" value={form.vacation_days_budget ?? 20} onChange={e => set('vacation_days_budget', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Home office (dny)</Label>
                <Input type="number" value={form.home_office_days_budget ?? 0} onChange={e => set('home_office_days_budget', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Kapacita/měsíc</Label>
                <Input type="number" value={form.monthly_hours_capacity ?? 160} onChange={e => set('monthly_hours_capacity', e.target.value)} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <Label>Aktivní zaměstnanec</Label>
              <Switch checked={form.is_active ?? true} onCheckedChange={v => set('is_active', v)} />
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
          <Link href={`/dashboard/hr/${id}`}>
            <Button type="button" variant="outline">Zrušit</Button>
          </Link>
        </div>
      </form>
    </div>
  )
}