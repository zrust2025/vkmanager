'use client'

import { useState } from 'react'
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

export default function NewEmployeePage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    employee_number: '',
    position: '',
    department: '',
    work_group: 'office',
    contract_type: 'HPP',
    hire_date: '',
    base_salary: '',
    hourly_rate: '',
    vacation_days_budget: '20',
    home_office_days_budget: '0',
    monthly_hours_capacity: '160',
    is_active: true,
    notes: '',
  })

  const set = (field: string, value: any) =>
    setForm(prev => ({ ...prev, [field]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.from('employees').insert({
      ...form,
      base_salary: form.base_salary ? parseFloat(form.base_salary) : 0,
      hourly_rate: form.hourly_rate ? parseFloat(form.hourly_rate) : 0,
      vacation_days_budget: parseInt(form.vacation_days_budget) || 20,
      home_office_days_budget: parseInt(form.home_office_days_budget) || 0,
      monthly_hours_capacity: parseInt(form.monthly_hours_capacity) || 160,
      hire_date: form.hire_date || null,
    })

    if (!error) router.push('/dashboard/hr')
    else { alert('Chyba: ' + error.message); setLoading(false) }
  }

  return (
    <div className="p-6 max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/hr" className="text-gray-400 hover:text-gray-600">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-semibold text-gray-900">Nový zaměstnanec</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardContent className="p-6 space-y-4">
            <h2 className="font-medium text-gray-900">Osobní informace</h2>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Jméno a příjmení *</Label>
                <Input value={form.full_name} onChange={e => set('full_name', e.target.value)} placeholder="Jan Novák" required />
              </div>
              <div className="space-y-2">
                <Label>Osobní číslo</Label>
                <Input value={form.employee_number} onChange={e => set('employee_number', e.target.value)} placeholder="EMP-001" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="jan@firma.cz" />
              </div>
              <div className="space-y-2">
                <Label>Telefon</Label>
                <Input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+420 123 456 789" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 space-y-4">
            <h2 className="font-medium text-gray-900">Pracovní zařazení</h2>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Pozice</Label>
                <Input value={form.position} onChange={e => set('position', e.target.value)} placeholder="Správce budov" />
              </div>
              <div className="space-y-2">
                <Label>Oddělení</Label>
                <Input value={form.department} onChange={e => set('department', e.target.value)} placeholder="Facility Management" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Pracovní skupina</Label>
                <Select value={form.work_group} onValueChange={v => set('work_group', v)}>
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
                <Select value={form.contract_type} onValueChange={v => set('contract_type', v)}>
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
              <Input type="date" value={form.hire_date} onChange={e => set('hire_date', e.target.value)} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 space-y-4">
            <h2 className="font-medium text-gray-900">Mzda a kapacita</h2>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Základní mzda (Kč)</Label>
                <Input type="number" value={form.base_salary} onChange={e => set('base_salary', e.target.value)} placeholder="40000" />
              </div>
              <div className="space-y-2">
                <Label>Hodinová sazba (Kč)</Label>
                <Input type="number" value={form.hourly_rate} onChange={e => set('hourly_rate', e.target.value)} placeholder="250" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Dovolená (dny)</Label>
                <Input type="number" value={form.vacation_days_budget} onChange={e => set('vacation_days_budget', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Home office (dny)</Label>
                <Input type="number" value={form.home_office_days_budget} onChange={e => set('home_office_days_budget', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Hod. kapacita/měs.</Label>
                <Input type="number" value={form.monthly_hours_capacity} onChange={e => set('monthly_hours_capacity', e.target.value)} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <Label>Aktivní zaměstnanec</Label>
              <Switch checked={form.is_active} onCheckedChange={v => set('is_active', v)} />
            </div>
            <div className="space-y-2">
              <Label>Poznámky</Label>
              <Textarea value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Interní poznámky..." rows={3} />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="submit" disabled={loading} className="flex-1">
            {loading ? 'Ukládám...' : 'Uložit zaměstnance'}
          </Button>
          <Link href="/dashboard/hr">
            <Button type="button" variant="outline">Zrušit</Button>
          </Link>
        </div>
      </form>
    </div>
  )
}