'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, Trash2, Plus, X } from 'lucide-react'
import Link from 'next/link'

export default function EditInquiryPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [form, setForm] = useState<any>(null)
  const [newDataKey, setNewDataKey] = useState('')
  const [newDataValue, setNewDataValue] = useState('')

  useEffect(() => {
    supabase.from('inquiries_extended').select('*').eq('id', id).single()
      .then(({ data }) => setForm(data))
  }, [id])

  const set = (field: string, value: any) =>
    setForm((prev: any) => ({ ...prev, [field]: value }))

  const addDataField = () => {
    if (!newDataKey.trim()) return
    const updated = { ...(form.collected_data ?? {}), [newDataKey]: newDataValue }
    set('collected_data', updated)
    setNewDataKey('')
    setNewDataValue('')
  }

  const removeDataField = (key: string) => {
    const updated = { ...(form.collected_data ?? {}) }
    delete updated[key]
    set('collected_data', updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase
      .from('inquiries_extended')
      .update({
        title: form.title,
        description: form.description,
        contact_email: form.contact_email,
        contact_phone: form.contact_phone,
        notes: form.notes,
        collected_data: form.collected_data ?? {},
      })
      .eq('id', id)
    if (!error) router.push(`/dashboard/inquiries/${id}`)
    else { alert('Chyba: ' + error.message); setLoading(false) }
  }

  const handleDelete = async () => {
    if (!confirm('Opravdu smazat tuto poptávku?')) return
    setDeleting(true)
    const { error } = await supabase.from('inquiries_extended').delete().eq('id', id)
    if (!error) router.push('/dashboard/inquiries')
    else { alert('Chyba: ' + error.message); setDeleting(false) }
  }

  if (!form) return <div className="p-6 text-gray-400">Načítám...</div>

  return (
    <div className="p-6 max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href={`/dashboard/inquiries/${id}`} className="text-gray-400 hover:text-gray-600">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-semibold text-gray-900">Upravit poptávku</h1>
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
              <Input value={form.title ?? ''} onChange={e => set('title', e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Popis</Label>
              <Textarea value={form.description ?? ''} onChange={e => set('description', e.target.value)} rows={4} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Kontaktní email</Label>
                <Input type="email" value={form.contact_email ?? ''} onChange={e => set('contact_email', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Kontaktní telefon</Label>
                <Input value={form.contact_phone ?? ''} onChange={e => set('contact_phone', e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Poznámky</Label>
              <Textarea value={form.notes ?? ''} onChange={e => set('notes', e.target.value)} rows={3} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 space-y-4">
            <h2 className="font-medium text-gray-900">Sebraná data</h2>
            <p className="text-xs text-gray-500">Přidej libovolné klíč–hodnota páry pro sběr podkladů k nabídce</p>

            {form.collected_data && Object.keys(form.collected_data).length > 0 && (
              <div className="space-y-2">
                {Object.entries(form.collected_data).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700 w-32 flex-shrink-0">{key}</span>
                    <Input
                      value={String(value)}
                      onChange={e => set('collected_data', { ...form.collected_data, [key]: e.target.value })}
                      className="flex-1"
                    />
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeDataField(key)}>
                      <X className="w-3.5 h-3.5 text-red-400" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <Input
                placeholder="Název pole (např. Rozměry)"
                value={newDataKey}
                onChange={e => setNewDataKey(e.target.value)}
                className="flex-1"
              />
              <Input
                placeholder="Hodnota"
                value={newDataValue}
                onChange={e => setNewDataValue(e.target.value)}
                className="flex-1"
              />
              <Button type="button" variant="outline" size="sm" onClick={addDataField}>
                <Plus className="w-3.5 h-3.5" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="submit" disabled={loading} className="flex-1">
            {loading ? 'Ukládám...' : 'Uložit změny'}
          </Button>
          <Link href={`/dashboard/inquiries/${id}`}>
            <Button type="button" variant="outline">Zrušit</Button>
          </Link>
        </div>
      </form>
    </div>
  )
}
