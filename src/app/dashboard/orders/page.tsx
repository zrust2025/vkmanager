import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ShoppingCart, Plus } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
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

export default async function OrdersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Objednávky</h1>
          <p className="text-sm text-gray-500 mt-1">{orders?.length ?? 0} objednávek celkem</p>
        </div>
        <Link
          href="/dashboard/orders/new"
          className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nová objednávka
        </Link>
      </div>

      {!orders || orders.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium">Zatím žádné objednávky</p>
          <p className="text-xs mt-1">Přidej první objednávku kliknutím na tlačítko výše</p>
        </div>
      ) : (
        <div className="space-y-2">
          {orders.map((o) => (
            <Link key={o.id} href={`/dashboard/orders/${o.id}`}>
              <Card className="hover:shadow-sm transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {o.order_number && (
                          <span className="text-xs font-mono text-gray-400">{o.order_number}</span>
                        )}
                      </div>
                      <p className="font-medium text-gray-900 truncate mt-0.5">{o.description}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-gray-400">
                          {new Date(o.created_at).toLocaleDateString('cs-CZ')}
                        </span>
                        {o.total_amount > 0 && (
                          <span className="text-xs font-medium text-gray-700">
                            {Number(o.total_amount).toLocaleString('cs-CZ')} Kč
                          </span>
                        )}
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${statusColors[o.status] ?? 'bg-gray-100 text-gray-600'}`}>
                      {statusLabels[o.status] ?? o.status}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}