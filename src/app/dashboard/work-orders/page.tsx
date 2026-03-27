import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ClipboardList, Plus } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'

const statusLabels: Record<string, string> = {
  otevreny: 'Otevřený',
  prirazen: 'Přiřazen',
  v_procesu: 'V procesu',
  ceka: 'Čeká',
  dokoncen: 'Dokončen',
  zrusen: 'Zrušen',
  fakturovano: 'Fakturováno',
}

const statusColors: Record<string, string> = {
  otevreny: 'bg-blue-100 text-blue-700',
  prirazen: 'bg-purple-100 text-purple-700',
  v_procesu: 'bg-amber-100 text-amber-700',
  ceka: 'bg-orange-100 text-orange-700',
  dokoncen: 'bg-green-100 text-green-700',
  zrusen: 'bg-gray-100 text-gray-500',
  fakturovano: 'bg-teal-100 text-teal-700',
}

export default async function WorkOrdersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: workOrders } = await supabase
    .from('work_orders')
    .select('*, tenants(full_name, company)')
    .order('created_at', { ascending: false })

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Pracovní příkazy</h1>
          <p className="text-sm text-gray-500 mt-1">{workOrders?.length ?? 0} příkazů celkem</p>
        </div>
        <Link
          href="/dashboard/work-orders/new"
          className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nový příkaz
        </Link>
      </div>

      {!workOrders || workOrders.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium">Zatím žádné pracovní příkazy</p>
          <p className="text-xs mt-1">Přidej první příkaz kliknutím na tlačítko výše</p>
        </div>
      ) : (
        <div className="space-y-2">
          {workOrders.map((wo) => (
            <Link key={wo.id} href={`/dashboard/work-orders/${wo.id}`}>
              <Card className="hover:shadow-sm transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-gray-400">{wo.order_number}</span>
                      </div>
                      <p className="font-medium text-gray-900 truncate mt-0.5">
                        {wo.work_description || 'Bez popisu'}
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        {wo.tenants && (
                          <span className="text-xs text-gray-500">
                            {(wo.tenants as any).company || (wo.tenants as any).full_name}
                          </span>
                        )}
                        <span className="text-xs text-gray-400">
                          {new Date(wo.created_at).toLocaleDateString('cs-CZ')}
                        </span>
                        {wo.total_cost > 0 && (
                          <span className="text-xs font-medium text-gray-700">
                            {wo.total_cost.toLocaleString('cs-CZ')} Kč
                          </span>
                        )}
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${statusColors[wo.status] ?? 'bg-gray-100 text-gray-600'}`}>
                      {statusLabels[wo.status] ?? wo.status}
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