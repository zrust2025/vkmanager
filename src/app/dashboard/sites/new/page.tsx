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

export default function NewSitePage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '',
    address: '',
    description: '',
    total_area: '',
    is_active: true,
  })

  const set = (field: string, value: any) =>
    setForm(prev => ({ ...prev, [field]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.from('sites').insert({
      ...form,
      total_area: form.total_area ? parseFloat(form.total_area) : null,
    })
    if (!error) router.push('/dashboard/sites')
    else { alert('Chyba: ' + error.message); setLoading(false) }
  }

  return (
    <div className="p-6 max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/sites" className="text-gray-400 hover:text-gray-600">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-semibold text-gray-900">Nový areál</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2">
              <Label>Název *</Label>
              <Input value={form.name} onChange={e => set('name', e.target.value)} placeholder="např. Průmyslový areál Sever" required />
            </div>
            <div className="space-y-2">
              <Label>Adresa</Label>
              <Input value={form.address} onChange={e => set('address', e.target.value)} placeholder="Ulice, město" />
            </div>
            <div className="space-y-2">
              <Label>Celková plocha (m²)</Label>
              <Input type="number" value={form.total_area} onChange={e => set('total_area', e.target.value)} placeholder="50000" />
            </div>
            <div className="space-y-2">
              <Label>Popis</Label>
              <Textarea value={form.description} onChange={e => set('description', e.target.value)} placeholder="Popis areálu..." rows={3} />
            </div>
            <div className="flex items-center justify-between">
              <Label>Aktivní</Label>
              <Switch checked={form.is_active} onCheckedChange={v => set('is_active', v)} />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="submit" disabled={loading} className="flex-1">
            {loading ? 'Ukládám...' : 'Uložit areál'}
          </Button>
          <Link href="/dashboard/sites">
            <Button type="button" variant="outline">Zrušit</Button>
          </Link>
        </div>
      </form>
    </div>
  )
}