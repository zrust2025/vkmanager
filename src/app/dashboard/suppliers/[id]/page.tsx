import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { ArrowLeft, Edit, Mail, Phone, Building2, Wrench } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default async function SupplierDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: supplier } = await supabase
    .from('suppliers')
    .select('*')
    .eq('id', id)
    .single()

  if (!supplier) notFound()

  const { data: workOrders } = await supabase
    .from('work_orders')
    .select('id, order_number, work_description, status, total_cost, created_at')
    .eq('supplier_name', supplier.name)
    .order('created_at', { ascending: false })
    .limit(5)

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/suppliers" className="text-gray-400 hover:text-gray-600">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">{supplier.name}</h1>
            {supplier.company && supplier.company !== supplier.name && (
              <p className="text-sm text-gray-500 mt-0.5">{supplier.company}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-sm px-3 py-1 rounded-full font-medium ${supplier.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
            {supplier.is_active ? 'Aktivní' : 'Neaktivní'}
          </span>
          <Link
            href={`/dashboard/suppliers/${id}/edit`}
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
            <CardTitle className="text-sm font-medium text-gray-500">Kontaktní informace</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {supplier.email && (
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-900">{supplier.email}</span>
              </div>
            )}
            {supplier.phone && (
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-900">{supplier.phone}</span>
              </div>
            )}
            {supplier.address && (
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-900">{supplier.address}</span>
              </div>
            )}
            {supplier.contact_person && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Kontakt</span>
                <span className="text-sm font-medium text-gray-900">{supplier.contact_person}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Firemní údaje</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {supplier.ico && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">IČO</span>
                <span className="text-sm font-medium text-gray-900">{supplier.ico}</span>
              </div>
            )}
            {supplier.dic && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">DIČ</span>
                <span className="text-sm font-medium text-gray-900">{supplier.dic}</span>
              </div>
            )}
            {supplier.specialization && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Specializace</span>
                <span className="text-sm font-medium text-gray-900">{supplier.specialization}</span>
              </div>
            )}
            {supplier.notes && (
              <div className="pt-2 border-t border-gray-100">
                <p className="text-xs text-gray-400 mb-1">Poznámky</p>
                <p className="text-sm text-gray-700">{supplier.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {workOrders && workOrders.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Pracovní příkazy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {workOrders.map(wo => (
                <Link key={wo.id} href={`/dashboard/work-orders/${wo.id}`}>
                  <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0 hover:bg-gray-50 rounded px-1 transition-colors">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="text-xs font-mono text-gray-400">{wo.order_number}</span>
                      <span className="text-sm text-gray-900 truncate">{wo.work_description}</span>
                    </div>
                    <div className="flex items-center gap-2 ml-2">
                      {wo.total_cost > 0 && (
                        <span className="text-xs text-gray-500">{Number(wo.total_cost).toLocaleString('cs-CZ')} Kč</span>
                      )}
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{wo.status}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
