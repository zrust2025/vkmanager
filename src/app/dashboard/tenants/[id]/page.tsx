import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { ArrowLeft, Edit, Mail, Phone, Building2, FileText } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

const statusColors: Record<string, string> = {
  aktivni: 'bg-green-100 text-green-700',
  ukoncena: 'bg-gray-100 text-gray-500',
  pozastavena: 'bg-amber-100 text-amber-700',
  rozpracovana: 'bg-blue-100 text-blue-700',
}

const statusLabels: Record<string, string> = {
  aktivni: 'Aktivní',
  ukoncena: 'Ukončená',
  pozastavena: 'Pozastavená',
  rozpracovana: 'Rozpracovaná',
}

export default async function TenantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: tenant } = await supabase
    .from('tenants')
    .select('*')
    .eq('id', id)
    .single()

  if (!tenant) notFound()

  const { data: workOrders } = await supabase
    .from('work_orders')
    .select('id, order_number, work_description, status, total_cost, created_at')
    .eq('tenant_id', id)
    .order('created_at', { ascending: false })
    .limit(5)

  const { data: maintenanceRequests } = await supabase
    .from('maintenance_requests')
    .select('id, title, status, priority, created_at')
    .eq('tenant_id', id)
    .order('created_at', { ascending: false })
    .limit(5)

  const statusColors2: Record<string, string> = {
    novy: 'bg-blue-100 text-blue-700',
    prirazen: 'bg-purple-100 text-purple-700',
    v_reseni: 'bg-amber-100 text-amber-700',
    dokoncen: 'bg-green-100 text-green-700',
    zrusen: 'bg-gray-100 text-gray-500',
  }

  const statusLabels2: Record<string, string> = {
    novy: 'Nový',
    prirazen: 'Přiřazen',
    v_reseni: 'V řešení',
    dokoncen: 'Dokončen',
    zrusen: 'Zrušen',
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/tenants" className="text-gray-400 hover:text-gray-600">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              {tenant.company || tenant.full_name}
            </h1>
            {tenant.company && (
              <p className="text-sm text-gray-500 mt-0.5">{tenant.full_name}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-sm px-3 py-1 rounded-full font-medium ${statusColors[tenant.lease_status] ?? 'bg-gray-100'}`}>
            {statusLabels[tenant.lease_status] ?? tenant.lease_status}
          </span>
          <Link
            href={`/dashboard/tenants/${id}/edit`}
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
            {tenant.email && (
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-900">{tenant.email}</span>
              </div>
            )}
            {tenant.phone && (
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-900">{tenant.phone}</span>
              </div>
            )}
            {tenant.address && (
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-900">{tenant.address}</span>
              </div>
            )}
            {tenant.ico && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">IČO</span>
                <span className="text-sm font-medium text-gray-900">{tenant.ico}</span>
              </div>
            )}
            {tenant.dic && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">DIČ</span>
                <span className="text-sm font-medium text-gray-900">{tenant.dic}</span>
              </div>
            )}
            {tenant.contact_person_name && (
              <div className="pt-2 border-t border-gray-100">
                <p className="text-xs text-gray-400 mb-1">Kontaktní osoba</p>
                <p className="text-sm font-medium text-gray-900">{tenant.contact_person_name}</p>
                {tenant.contact_person_email && (
                  <p className="text-xs text-gray-500">{tenant.contact_person_email}</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Nájemní smlouva</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {tenant.lease_monthly_rent && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Měsíční nájem</span>
                <span className="text-sm font-semibold text-gray-900">
                  {Number(tenant.lease_monthly_rent).toLocaleString('cs-CZ')} Kč
                </span>
              </div>
            )}
            {tenant.lease_deposit && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Kauce</span>
                <span className="text-sm font-medium text-gray-900">
                  {Number(tenant.lease_deposit).toLocaleString('cs-CZ')} Kč
                </span>
              </div>
            )}
            {tenant.lease_payment_day && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Den splatnosti</span>
                <span className="text-sm font-medium text-gray-900">{tenant.lease_payment_day}.</span>
              </div>
            )}
            {tenant.lease_start_date && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Začátek</span>
                <span className="text-sm font-medium text-gray-900">
                  {new Date(tenant.lease_start_date).toLocaleDateString('cs-CZ')}
                </span>
              </div>
            )}
            {tenant.lease_end_date && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Konec</span>
                <span className="text-sm font-medium text-gray-900">
                  {new Date(tenant.lease_end_date).toLocaleDateString('cs-CZ')}
                </span>
              </div>
            )}
            {tenant.notes && (
              <div className="pt-2 border-t border-gray-100">
                <p className="text-xs text-gray-400 mb-1">Poznámky</p>
                <p className="text-sm text-gray-700">{tenant.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-gray-500">Poslední požadavky na údržbu</CardTitle>
            <Link href={`/dashboard/maintenance?tenant_id=${id}`} className="text-xs text-blue-600 hover:underline">
              Zobrazit vše
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {!maintenanceRequests || maintenanceRequests.length === 0 ? (
            <p className="text-sm text-gray-400 py-2">Žádné požadavky</p>
          ) : (
            <div className="space-y-2">
              {maintenanceRequests.map(req => (
                <Link key={req.id} href={`/dashboard/maintenance/${req.id}`}>
                  <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0 hover:bg-gray-50 rounded px-1 transition-colors">
                    <p className="text-sm text-gray-900 truncate flex-1">{req.title}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ml-2 ${statusColors2[req.status] ?? 'bg-gray-100'}`}>
                      {statusLabels2[req.status] ?? req.status}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-gray-500">Poslední pracovní příkazy</CardTitle>
            <Link href={`/dashboard/work-orders?tenant_id=${id}`} className="text-xs text-blue-600 hover:underline">
              Zobrazit vše
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {!workOrders || workOrders.length === 0 ? (
            <p className="text-sm text-gray-400 py-2">Žádné pracovní příkazy</p>
          ) : (
            <div className="space-y-2">
              {workOrders.map(wo => (
                <Link key={wo.id} href={`/dashboard/work-orders/${wo.id}`}>
                  <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0 hover:bg-gray-50 rounded px-1 transition-colors">
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-mono text-gray-400 mr-2">{wo.order_number}</span>
                      <span className="text-sm text-gray-900">{wo.work_description}</span>
                    </div>
                    <div className="flex items-center gap-2 ml-2">
                      {wo.total_cost > 0 && (
                        <span className="text-xs text-gray-500">{Number(wo.total_cost).toLocaleString('cs-CZ')} Kč</span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}