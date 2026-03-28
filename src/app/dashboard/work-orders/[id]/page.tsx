import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { ArrowLeft, Edit } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

const statusColors: Record<string, string> = {
  otevreny: 'bg-blue-100 text-blue-700',
  prirazen: 'bg-purple-100 text-purple-700',
  v_procesu: 'bg-amber-100 text-amber-700',
  ceka: 'bg-orange-100 text-orange-700',
  dokoncen: 'bg-green-100 text-green-700',
  zrusen: 'bg-gray-100 text-gray-500',
  fakturovano: 'bg-teal-100 text-teal-700',
}

const statusLabels: Record<string, string> = {
  otevreny: 'Otevřený',
  prirazen: 'Přiřazen',
  v_procesu: 'V procesu',
  ceka: 'Čeká',
  dokoncen: 'Dokončen',
  zrusen: 'Zrušen',
  fakturovano: 'Fakturováno',
}

export default async function WorkOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: wo } = await supabase
    .from('work_orders')
    .select('*, tenants(full_name, company)')
    .eq('id', id)
    .single()

  if (!wo) notFound()

  const workItems = wo.work_items ?? []
  const materialItems = wo.material_items ?? []
  const laborItems = wo.labor_items ?? []
  const subcontracts = wo.subcontracts ?? []

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/work-orders" className="text-gray-400 hover:text-gray-600">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-mono text-gray-400">{wo.order_number}</span>
            </div>
            <h1 className="text-xl font-semibold text-gray-900 mt-0.5">
              {wo.work_description || 'Pracovní příkaz'}
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-sm px-3 py-1 rounded-full font-medium ${statusColors[wo.status] ?? 'bg-gray-100'}`}>
            {statusLabels[wo.status] ?? wo.status}
          </span>
          <Link
            href={`/dashboard/work-orders/${id}/edit`}
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
            <CardTitle className="text-sm font-medium text-gray-500">Základní informace</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {wo.tenants && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Nájemník</span>
                <span className="text-sm font-medium text-gray-900">
                  {(wo.tenants as any).company || (wo.tenants as any).full_name}
                </span>
              </div>
            )}
            {wo.work_order_type_name && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Typ</span>
                <span className="text-sm font-medium text-gray-900">{wo.work_order_type_name}</span>
              </div>
            )}
            {wo.work_start_date && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Zahájení</span>
                <span className="text-sm font-medium text-gray-900">
                  {new Date(wo.work_start_date).toLocaleDateString('cs-CZ')}
                </span>
              </div>
            )}
            {wo.work_end_date && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Dokončení</span>
                <span className="text-sm font-medium text-gray-900">
                  {new Date(wo.work_end_date).toLocaleDateString('cs-CZ')}
                </span>
              </div>
            )}
            {wo.executor_name && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Vykonavatel</span>
                <span className="text-sm font-medium text-gray-900">{wo.executor_name}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Finanční přehled</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {wo.work_items_cost > 0 && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Práce</span>
                <span className="text-sm font-medium text-gray-900">{Number(wo.work_items_cost).toLocaleString('cs-CZ')} Kč</span>
              </div>
            )}
            {wo.material_cost > 0 && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Materiál</span>
                <span className="text-sm font-medium text-gray-900">{Number(wo.material_cost).toLocaleString('cs-CZ')} Kč</span>
              </div>
            )}
            {wo.subcontract_cost > 0 && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Subdodávky</span>
                <span className="text-sm font-medium text-gray-900">{Number(wo.subcontract_cost).toLocaleString('cs-CZ')} Kč</span>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t border-gray-100">
              <span className="text-sm font-medium text-gray-700">Celkem bez DPH</span>
              <span className="text-sm font-semibold text-gray-900">{Number(wo.total_cost).toLocaleString('cs-CZ')} Kč</span>
            </div>
            {wo.vat_rate > 0 && (
              <>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">DPH ({wo.vat_rate}%)</span>
                  <span className="text-sm font-medium text-gray-900">{Number(wo.vat_amount).toLocaleString('cs-CZ')} Kč</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-100">
                  <span className="text-sm font-semibold text-gray-700">Celkem s DPH</span>
                  <span className="text-base font-bold text-gray-900">{Number(wo.invoice_total_with_vat).toLocaleString('cs-CZ')} Kč</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {workItems.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Položky práce</CardTitle>
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
                {workItems.map((item: any, i: number) => (
                  <tr key={i} className="border-b border-gray-50">
                    <td className="py-2 text-gray-900">{item.description}</td>
                    <td className="py-2 text-right text-gray-600">{item.quantity}</td>
                    <td className="py-2 text-right text-gray-600">{item.unit}</td>
                    <td className="py-2 text-right text-gray-600">{Number(item.unit_price).toLocaleString('cs-CZ')}</td>
                    <td className="py-2 text-right font-medium text-gray-900">{Number(item.total_price).toLocaleString('cs-CZ')} Kč</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {materialItems.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Materiál</CardTitle>
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
                {materialItems.map((item: any, i: number) => (
                  <tr key={i} className="border-b border-gray-50">
                    <td className="py-2 text-gray-900">{item.description}</td>
                    <td className="py-2 text-right text-gray-600">{item.quantity}</td>
                    <td className="py-2 text-right text-gray-600">{item.unit}</td>
                    <td className="py-2 text-right text-gray-600">{Number(item.unit_price).toLocaleString('cs-CZ')}</td>
                    <td className="py-2 text-right font-medium text-gray-900">{Number(item.total_price).toLocaleString('cs-CZ')} Kč</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {wo.notes && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Poznámky</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{wo.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}