import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { ArrowLeft, Edit, FileText, Plus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import InquiryActions from './InquiryActions'

const statusColors: Record<string, string> = {
  nova: 'bg-blue-100 text-blue-700',
  probihajici: 'bg-amber-100 text-amber-700',
  pripravena: 'bg-teal-100 text-teal-700',
  zamitnuta: 'bg-red-100 text-red-700',
  dokoncena: 'bg-green-100 text-green-700',
}

const statusLabels: Record<string, string> = {
  nova: 'Nová',
  probihajici: 'Probíhající',
  pripravena: 'Připravena k nabídce',
  zamitnuta: 'Zamítnuta',
  dokoncena: 'Dokončena',
}

export default async function InquiryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: inquiry } = await supabase
    .from('inquiries_extended')
    .select('*, maintenance_requests(id, title, status), profiles!assigned_to_id(display_name, email)')
    .eq('id', id)
    .single()

  if (!inquiry) notFound()

  const { data: quotes } = await supabase
    .from('quotes')
    .select('id, quote_number, status, total_with_vat, created_at')
    .eq('maintenance_request_id', inquiry.request_id ?? '')
    .order('created_at', { ascending: false })

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/inquiries" className="text-gray-400 hover:text-gray-600">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">{inquiry.title}</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {new Date(inquiry.created_at).toLocaleDateString('cs-CZ')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-sm px-3 py-1 rounded-full font-medium ${statusColors[inquiry.status] ?? 'bg-gray-100'}`}>
            {statusLabels[inquiry.status] ?? inquiry.status}
          </span>
          <Link
            href={`/dashboard/inquiries/${id}/edit`}
            className="flex items-center gap-2 border border-gray-200 px-3 py-1.5 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <Edit className="w-3.5 h-3.5" />
            Upravit
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Informace o poptávce</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {inquiry.maintenance_requests && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Požadavek</span>
                <Link
                  href={`/dashboard/maintenance/${(inquiry.maintenance_requests as any).id}`}
                  className="text-sm font-medium text-blue-600 hover:underline truncate max-w-48"
                >
                  {(inquiry.maintenance_requests as any).title}
                </Link>
              </div>
            )}
            {inquiry.profiles && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Přiřazeno</span>
                <span className="text-sm font-medium text-gray-900">
                  {(inquiry.profiles as any).display_name ?? (inquiry.profiles as any).email}
                </span>
              </div>
            )}
            {inquiry.contact_email && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Kontaktní email</span>
                <span className="text-sm font-medium text-gray-900">{inquiry.contact_email}</span>
              </div>
            )}
            {inquiry.contact_phone && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Kontaktní telefon</span>
                <span className="text-sm font-medium text-gray-900">{inquiry.contact_phone}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Sebraná data</CardTitle>
          </CardHeader>
          <CardContent>
            {inquiry.collected_data && Object.keys(inquiry.collected_data).length > 0 ? (
              <div className="space-y-2">
                {Object.entries(inquiry.collected_data).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span className="text-sm text-gray-500">{key}</span>
                    <span className="text-sm font-medium text-gray-900">{String(value)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">Zatím žádná data</p>
            )}
          </CardContent>
        </Card>
      </div>

      {inquiry.description && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Popis</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{inquiry.description}</p>
          </CardContent>
        </Card>
      )}

      {inquiry.notes && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Poznámky</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{inquiry.notes}</p>
          </CardContent>
        </Card>
      )}

      {quotes && quotes.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Cenové nabídky</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {quotes.map(q => (
                <Link key={q.id} href={`/dashboard/quotes/${q.id}`}>
                  <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0 hover:bg-gray-50 rounded px-1 transition-colors">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-gray-400">{q.quote_number}</span>
                      <span className="text-xs text-gray-400">
                        {new Date(q.created_at).toLocaleDateString('cs-CZ')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {q.total_with_vat > 0 && (
                        <span className="text-sm font-medium text-gray-700">
                          {Number(q.total_with_vat).toLocaleString('cs-CZ')} Kč
                        </span>
                      )}
                      <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">{q.status}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <InquiryActions
        inquiryId={id}
        requestId={inquiry.request_id}
        currentStatus={inquiry.status}
        userEmail={user.email ?? ''}
      />
    </div>
  )
}
