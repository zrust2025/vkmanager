import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { ArrowLeft, Edit } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import QuoteActions from './QuoteActions'
import QuotePrint from '@/app/dashboard/components/quotes/QuotePrint'

const statusColors: Record<string, string> = {
  koncept: 'bg-gray-100 text-gray-600',
  odeslana: 'bg-blue-100 text-blue-700',
  schvalena: 'bg-green-100 text-green-700',
  zamitnuta: 'bg-red-100 text-red-700',
  vyprela: 'bg-amber-100 text-amber-700',
}

const statusLabels: Record<string, string> = {
  koncept: 'Koncept',
  odeslana: 'Odeslaná',
  schvalena: 'Schválená',
  zamitnuta: 'Zamítnutá',
  vyprela: 'Vypršela',
}

export default async function QuoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: quote } = await supabase
    .from('quotes')
    .select('*, tenants(full_name, company, address, ico, dic), maintenance_requests(id, title)')
    .eq('id', id)
    .single()

  if (!quote) notFound()

  const items = quote.items ?? []

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/quotes" className="text-gray-400 hover:text-gray-600">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-mono text-gray-400">{quote.quote_number}</span>
            </div>
            <h1 className="text-xl font-semibold text-gray-900 mt-0.5">
              {quote.description || 'Cenová nabídka'}
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-sm px-3 py-1 rounded-full font-medium ${statusColors[quote.status] ?? 'bg-gray-100'}`}>
            {statusLabels[quote.status] ?? quote.status}
          </span>
          <QuotePrint quote={{ ...quote, tenants: quote.tenants }} />
          <Link
            href={`/dashboard/quotes/${id}/edit`}
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
            <CardTitle className="text-sm font-medium text-gray-500">Informace o nabídce</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {quote.tenants && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Nájemník</span>
                <span className="text-sm font-medium text-gray-900">
                  {(quote.tenants as any).company || (quote.tenants as any).full_name}
                </span>
              </div>
            )}
            {quote.maintenance_requests && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Požadavek</span>
                <Link
                  href={`/dashboard/maintenance/${(quote.maintenance_requests as any).id}`}
                  className="text-sm font-medium text-blue-600 hover:underline truncate max-w-48"
                >
                  {(quote.maintenance_requests as any).title}
                </Link>
              </div>
            )}
            {quote.valid_until && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Platná do</span>
                <span className={`text-sm font-medium ${new Date(quote.valid_until) < new Date() ? 'text-red-600' : 'text-gray-900'}`}>
                  {new Date(quote.valid_until).toLocaleDateString('cs-CZ')}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Vytvořeno</span>
              <span className="text-sm font-medium text-gray-900">
                {new Date(quote.created_at).toLocaleDateString('cs-CZ')}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Finanční přehled</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {quote.subtotal > 0 && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Mezisoučet</span>
                <span className="text-sm font-medium text-gray-900">
                  {Number(quote.subtotal).toLocaleString('cs-CZ')} Kč
                </span>
              </div>
            )}
            {quote.management_fee_amount > 0 && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Management fee ({quote.management_fee_percentage}%)</span>
                <span className="text-sm font-medium text-gray-900">
                  {Number(quote.management_fee_amount).toLocaleString('cs-CZ')} Kč
                </span>
              </div>
            )}
            {quote.vat_amount > 0 && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">DPH ({quote.vat_rate}%)</span>
                <span className="text-sm font-medium text-gray-900">
                  {Number(quote.vat_amount).toLocaleString('cs-CZ')} Kč
                </span>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t border-gray-100">
              <span className="text-sm font-semibold text-gray-700">Celkem s DPH</span>
              <span className="text-base font-bold text-gray-900">
                {Number(quote.total_with_vat).toLocaleString('cs-CZ')} Kč
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {items.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Položky nabídky</CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-400 border-b border-gray-100">
                  <th className="pb-2">Popis</th>
                  <th className="pb-2 text-right">Množství</th>
                  <th className="pb-2 text-right">Jednotka</th>
                  <th className="pb-2 text-right">Cena/j</th>
                  <th className="pb-2 text-right">Celkem</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item: any, i: number) => (
                  <tr key={i} className="border-b border-gray-50">
                    <td className="py-2 text-gray-900">{item.description}</td>
                    <td className="py-2 text-right text-gray-600">{item.quantity}</td>
                    <td className="py-2 text-right text-gray-600">{item.unit}</td>
                    <td className="py-2 text-right text-gray-600">
                      {Number(item.unit_price).toLocaleString('cs-CZ')} Kč
                    </td>
                    <td className="py-2 text-right font-medium text-gray-900">
                      {Number(item.total).toLocaleString('cs-CZ')} Kč
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {quote.notes && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Poznámky</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{quote.notes}</p>
          </CardContent>
        </Card>
      )}

      {quote.footer_note && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Patička</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 italic">{quote.footer_note}</p>
          </CardContent>
        </Card>
      )}

      <QuoteActions
        quoteId={id}
        requestId={quote.maintenance_request_id}
        currentStatus={quote.status}
      />
    </div>
  )
}
