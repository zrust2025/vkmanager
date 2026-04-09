'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { ArrowLeft, Trash2 } from 'lucide-react'
import Link from 'next/link'

export default function EditSitePage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [form, setForm] = useState<any>(null)

  useEffect(() => {
    supabase.from('sites').select('*').eq('id', id).single()
      .then(({ data }) => setForm(data))
  }, [id])

  const set = (field: string, value: any) =>
    setForm((prev: any) => ({ ...prev, [field]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase
      .from('sites')
      .update({
        name: form.name,
        address: form.address,
        description: form.description,
        total_area: form.total_area ? parseFloat(form.total_area) : null,
        is_active: form.is_active,
      })
      .eq('id', id)
    if (!error) router.push(`/dashboard/sites/${id}`)
    else { alert('Chyba: ' + error.message); setLoading(false) }
  }

  const handleDelete = async () => {
    if (!confirm('Opravdu smazat tento areál?')) return
    setDeleting(true)
    const { error } = await supabase.from('sites').delete().eq('id', id)
    if (!error) router.push('/dashboard/sites')
    else { alert('Chyba: ' + error.message); setDeleting(false) }
  }

  if (!form) return <div className="p-6 text-gray-400">Načítám...</div>

  return (
    <div className="p-6 max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href={`/dashboard/sites/${id}`} className="text-gray-400 hover:text-gray-600">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-semibold text-gray-900">Upravit areál</h1>
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
              <Label>Adresa</Label>
              <Input value={form.address ?? ''} onChange={e => set('address', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Celková plocha (m²)</Label>
              <Input type="number" value={form.total_area ?? ''} onChange={e => set('total_area', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Popis</Label>
              <Textarea value={form.description ?? ''} onChange={e => set('description', e.target.value)} rows={3} />
            </div>
            <div className="flex items-center justify-between">
              <Label>Aktivní</Label>
              <Switch checked={form.is_active ?? true} onCheckedChange={v => set('is_active', v)} />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="submit" disabled={loading} className="flex-1">
            {loading ? 'Ukládám...' : 'Uložit změny'}
          </Button>
          <Link href={`/dashboard/sites/${id}`}>
            <Button type="button" variant="outline">Zrušit</Button>
          </Link>
        </div>
      </form>
    </div>
  )
}