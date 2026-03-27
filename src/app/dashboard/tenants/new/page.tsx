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
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function NewTenantPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    full_name: '',
    company: '',
    email: '',
    phone: '',
    ico: '',
    dic: '',
    address: '',
    contact_person_name: '',
    contact_person_email: '',
    lease_status: 'aktivni',
    lease_monthly_rent: '',
    lease_deposit: '',
    lease_start_date: '',
    lease_end_date: '',
    lease_payment_day: '',
    notes: '',
  })

  const set = (field: string, value: string) =>
    setForm(prev => ({ ...prev, [field]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.from('tenants').insert({
      ...form,
      lease_monthly_rent: form.lease_monthly_rent ? parseFloat(form.lease_monthly_rent) : null,
      lease_deposit: form.lease_deposit ? parseFloat(form.lease_deposit) : null,
      lease_payment_day: form.lease_payment_day ? parseInt(form.lease_payment_day) : null,
      lease_start_date: form.lease_start_date || null,
      lease_end_date: form.lease_end_date || null,
    })
    if (!error) router.push('/dashboard/tenants')
    else { alert('Chyba: ' + error.message); setLoading(false) }
  }

  return (
    <div className="p-6 max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/tenants" className="text-gray-400 hover:text-gray-600">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-semibold text-gray-900">Nový nájemník</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardContent className="p-6 space-y-4">
            <h2 className="font-medium text-gray-900">Základní informace</h2>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Jméno / kontakt *</Label>
                <Input value={form.full_name} onChange={e => set('full_name', e.target.value)} placeholder="Jan Novák" required />
              </div>
              <div className="space-y-2">
                <Label>Firma</Label>
                <Input value={form.company} onChange={e => set('company', e.target.value)} placeholder="Firma s.r.o." />
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>IČO</Label>
                <Input value={form.ico} onChange={e => set('ico', e.target.value)} placeholder="12345678" />
              </div>
              <div className="space-y-2">
                <Label>DIČ</Label>
                <Input value={form.dic} onChange={e => set('dic', e.target.value)} placeholder="CZ12345678" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Adresa</Label>
              <Input value={form.address} onChange={e => set('address', e.target.value)} placeholder="Ulice 123, Praha" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 space-y-4">
            <h2 className="font-medium text-gray-900">Kontaktní osoba</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Jméno</Label>
                <Input value={form.contact_person_name} onChange={e => set('contact_person_name', e.target.value)} placeholder="Jméno kontaktu" />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={form.contact_person_email} onChange={e => set('contact_person_email', e.target.value)} placeholder="kontakt@firma.cz" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 space-y-4">
            <h2 className="font-medium text-gray-900">Nájemní smlouva</h2>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Stav smlouvy</Label>
                <Select value={form.lease_status} onValueChange={v => set('lease_status', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="aktivni">Aktivní</SelectItem>
                    <SelectItem value="rozpracovana">Rozpracovaná</SelectItem>
                    <SelectItem value="pozastavena">Pozastavená</SelectItem>
                    <SelectItem value="ukoncena">Ukončená</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Den splatnosti</Label>
                <Input type="number" min="1" max="31" value={form.lease_payment_day} onChange={e => set('lease_payment_day', e.target.value)} placeholder="15" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Datum začátku</Label>
                <Input type="date" value={form.lease_start_date} onChange={e => set('lease_start_date', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Datum konce</Label>
                <Input type="date" value={form.lease_end_date} onChange={e => set('lease_end_date', e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Měsíční nájem (Kč)</Label>
                <Input type="number" value={form.lease_monthly_rent} onChange={e => set('lease_monthly_rent', e.target.value)} placeholder="50000" />
              </div>
              <div className="space-y-2">
                <Label>Kauce (Kč)</Label>
                <Input type="number" value={form.lease_deposit} onChange={e => set('lease_deposit', e.target.value)} placeholder="100000" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 space-y-4">
            <h2 className="font-medium text-gray-900">Poznámky</h2>
            <Textarea value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Interní poznámky..." rows={3} />
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="submit" disabled={loading} className="flex-1">
            {loading ? 'Ukládám...' : 'Uložit nájemníka'}
          </Button>
          <Link href="/dashboard/tenants">
            <Button type="button" variant="outline">Zrušit</Button>
          </Link>
        </div>
      </form>
    </div>
  )
}