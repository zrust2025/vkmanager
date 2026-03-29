import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { ArrowLeft, Edit } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-600',
  k_odeslani: 'bg-blue-100 text-blue-700',
  odeslana: 'bg-purple-100 text-purple-700',
  potvrzena: 'bg-amber-100 text-amber-700',
  vyrizena: 'bg-green-100 text-green-700',
  zamitnuta: 'bg-red-100 text-red-700',
  zrusena: 'bg-gray-100 text-gray-400',
}

const statusLabels: Record<string, string> = {
  draft: 'Koncept',
  k_odeslani: 'K odeslání',
  odeslana: 'Odeslaná',
  potvrzena: 'Potvrzená',
  vyrizena: 'Vyřízená',
  zamitnuta: 'Zamítnutá',
  zrusena: 'Zrušená',
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: order } = await supabase
    .from('orders')
    .select('*, projects(name)')
    .eq('id', id)
    .single()

  if (!order) notFound()

  const items = order.items ?? []

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/orders" className="text-gray-400 hover:text-gray-600">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            {order.order_number && (
              <p className="text-sm font-mono text-gray-400">{order.order_number}</p>
            )}
            <h1 className="text-xl font-semibold text-gray-900 mt-0.5 line-clamp-2">
              {order.description}
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-sm px-3 py-1 rounded-full font-medium ${statusColors[order.status] ?? 'bg-gray-100'}`}>
            {statusLabels[order.status] ?? order.status}
          </span>
          <Link
            href={`/dashboard/orders/${id}/edit`}
            className="flex items-center gap-2 border border-gray-200 px-3 py-1.5 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <Edit className="w-3.5 h-3.5" />
            Upravit
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-500">Informace o objednávce</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Zadal</span>
            <span className="text-sm font-medium text-gray-900">{order.user_name || order.user_email}</span>
          </div>
          {order.projects && (
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Projekt</span>
              <span className="text-sm font-medium text-gray-900">{(order.projects as any).name}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Datum vytvoření</span>
            <span className="text-sm font-medium text-gray-900">
              {new Date(order.created_at).toLocaleDateString('cs-CZ')}
            </span>
          </div>
          {order.approved_at && (
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Datum schválení</span>
              <span className="text-sm font-medium text-gray-900">
                {new Date(order.approved_at).toLocaleDateString('cs-CZ')}
              </span>
            </div>
          )}
          {order.rejected_reason && (
            <div className="pt-2 border-t border-gray-100">
              <p className="text-xs text-gray-400 mb-1">Důvod zamítnutí</p>
              <p className="text-sm text-red-600">{order.rejected_reason}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {items.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Položky objednávky</CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-400 border-b border-gray-100">
                  <th className="pb-2">Název</th>
                  <th className="pb-2 text-right">Množství</th>
                  <th className="pb-2 text-right">Jednotka</th>
                  <th className="pb-2 text-right">Cena/j</th>
                  <th className="pb-2 text-right">Celkem</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item: any, i: number) => (
                  <tr key={i} className="border-b border-gray-50">
                    <td className="py-2 text-gray-900">{item.name}</td>
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
              <tfoot>
                <tr>
                  <td colSpan={4} className="pt-3 text-right text-sm font-medium text-gray-700">Celkem</td>
                  <td className="pt-3 text-right text-base font-bold text-gray-900">
                    {Number(order.total_amount).toLocaleString('cs-CZ')} Kč
                  </td>
                </tr>
              </tfoot>
            </table>
          </CardContent>
        </Card>
      )}

      {order.notes && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Poznámky</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{order.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}