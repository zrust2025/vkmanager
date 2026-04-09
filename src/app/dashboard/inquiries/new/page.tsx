'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function NewInquiryPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [form, setForm] = useState({
    title: '',
    description: '',
    contact_email: '',
    contact_phone: '',
    notes: '',
  })

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
  }, [])

  const set = (field: string, value: string) =>
    setForm(prev => ({ ...prev, [field]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.from('inquiries_extended').insert({
      ...form,
      status: 'nova',
      assigned_to_email: user?.email,
    })
    if (!error) router.push('/dashboard/inquiries')
    else { alert('Chyba: ' + error.message); setLoading(false) }
  }

  return (
    <div className="p-6 max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/inquiries" className="text-gray-400 hover:text-gray-600">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-semibold text-gray-900">Nová poptávka</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2">
              <Label>Název *</Label>
              <Input value={form.title} onChange={e => set('title', e.target.value)} placeholder="např. Oprava střechy haly B" required />
            </div>
            <div className="space-y-2">
              <Label>Popis</Label>
              <Textarea value={form.description} onChange={e => set('description', e.target.value)} placeholder="Popis poptávky..." rows={4} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Kontaktní email</Label>
                <Input type="email" value={form.contact_email} onChange={e => set('contact_email', e.target.value)} placeholder="klient@firma.cz" />
              </div>
              <div className="space-y-2">
                <Label>Kontaktní telefon</Label>
                <Input value={form.contact_phone} onChange={e => set('contact_phone', e.target.value)} placeholder="+420 123 456 789" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Poznámky</Label>
              <Textarea value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Interní poznámky..." rows={3} />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="submit" disabled={loading} className="flex-1">
            {loading ? 'Ukládám...' : 'Vytvořit poptávku'}
          </Button>
          <Link href="/dashboard/inquiries">
            <Button type="button" variant="outline">Zrušit</Button>
          </Link>
        </div>
      </form>
    </div>
  )
}
