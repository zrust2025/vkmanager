'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function NewSupplierPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    ico: '',
    dic: '',
    address: '',
    contact_person: '',
    specialization: '',
    notes: '',
    is_active: true,
  })

  const set = (field: string, value: any) =>
    setForm(prev => ({ ...prev, [field]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.from('suppliers').insert(form)
    if (!error) router.push('/dashboard/suppliers')
    else { alert('Chyba: ' + error.message); setLoading(false) }
  }

  return (
    <div className="p-6 max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/suppliers" className="text-gray-400 hover:text-gray-600">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-semibold text-gray-900">Nový dodavatel</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardContent className="p-6 space-y-4">
            <h2 className="font-medium text-gray-900">Základní informace</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Název *</Label>
                <Input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Název dodavatele" required />
              </div>
              <div className="space-y-2">
                <Label>Firma</Label>
                <Input value={form.company} onChange={e => set('company', e.target.value)} placeholder="Firma s.r.o." />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="info@firma.cz" />
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
              <Input value={form.address} onChange={e => set('address', e.target.value)} placeholder="Ulice, město" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Kontaktní osoba</Label>
                <Input value={form.contact_person} onChange={e => set('contact_person', e.target.value)} placeholder="Jan Novák" />
              </div>
              <div className="space-y-2">
                <Label>Specializace</Label>
                <Input value={form.specialization} onChange={e => set('specialization', e.target.value)} placeholder="Elektro, HVAC..." />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Poznámky</Label>
              <Textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={3} />
            </div>
            <div className="flex items-center justify-between">
              <Label>Aktivní</Label>
              <Switch checked={form.is_active} onCheckedChange={v => set('is_active', v)} />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="submit" disabled={loading} className="flex-1">
            {loading ? 'Ukládám...' : 'Uložit dodavatele'}
          </Button>
          <Link href="/dashboard/suppliers">
            <Button type="button" variant="outline">Zrušit</Button>
          </Link>
        </div>
      </form>
    </div>
  )
}
