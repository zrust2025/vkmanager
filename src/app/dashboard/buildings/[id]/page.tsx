import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { ArrowLeft, Building2, MapPin, Calendar, Ruler, Edit } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

const typeLabels: Record<string, string> = {
  budova: 'Budova',
  skladovaci_plocha: 'Skladovací plocha',
  parkovaci_plocha: 'Parkovací plocha',
  komunikace: 'Komunikace',
  zelen: 'Zeleň',
  ostatni: 'Ostatní',
}

const statusColors: Record<string, string> = {
  aktivni: 'bg-green-100 text-green-700',
  volna: 'bg-blue-100 text-blue-700',
  pronajata: 'bg-purple-100 text-purple-700',
  rezervovana: 'bg-amber-100 text-amber-700',
  rekonstrukce: 'bg-orange-100 text-orange-700',
  interni: 'bg-gray-100 text-gray-600',
}

const statusLabels: Record<string, string> = {
  aktivni: 'Aktivní',
  volna: 'Volná',
  pronajata: 'Pronajatá',
  rezervovana: 'Rezervovaná',
  rekonstrukce: 'Rekonstrukce',
  interni: 'Interní',
}

export default async function BuildingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: building } = await supabase
    .from('buildings')
    .select('*, sites(name)')
    .eq('id', id)
    .single()

  if (!building) notFound()

  const { data: maintenanceRequests } = await supabase
    .from('maintenance_requests')
    .select('id, title, status, priority, created_at')
    .eq('building_id', id)
    .order('created_at', { ascending: false })
    .limit(5)

  const { data: workOrders } = await supabase
    .from('work_orders')
    .select('id, order_number, work_description, status, created_at')
    .eq('building_id', id)
    .order('created_at', { ascending: false })
    .limit(5)

  const statusPriorityColors: Record<string, string> = {
    nizka: 'bg-gray-100 text-gray-600',
    stredni: 'bg-blue-100 text-blue-700',
    vysoka: 'bg-orange-100 text-orange-700',
    kriticka: 'bg-red-100 text-red-700',
  }

  const reqStatusColors: Record<string, string> = {
    novy: 'bg-blue-100 text-blue-700',
    prirazen: 'bg-purple-100 text-purple-700',
    v_reseni: 'bg-amber-100 text-amber-700',
    dokoncen: 'bg-green-100 text-green-700',
    zrusen: 'bg-gray-100 text-gray-500',
  }

  const reqStatusLabels: Record<string, string> = {
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
          <Link href="/dashboard/buildings" className="text-gray-400 hover:text-gray-600">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">{building.name}</h1>
            {building.sites && (
              <div className="flex items-center gap-1 mt-1">
                <MapPin className="w-3 h-3 text-gray-400" />
                <span className="text-sm text-gray-500">{(building.sites as any).name}</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-sm px-3 py-1 rounded-full font-medium ${statusColors[building.status] ?? 'bg-gray-100 text-gray-600'}`}>
            {statusLabels[building.status] ?? building.status}
          </span>
          <Link
            href={`/dashboard/buildings/${id}/edit`}
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
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Typ</span>
              <span className="text-sm font-medium text-gray-900">{typeLabels[building.type] ?? building.type}</span>
            </div>
            {building.address && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Adresa</span>
                <span className="text-sm font-medium text-gray-900 text-right">{building.address}</span>
              </div>
            )}
            {building.total_area && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Plocha</span>
                <span className="text-sm font-medium text-gray-900">{building.total_area} m²</span>
              </div>
            )}
            {building.year_built && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Rok výstavby</span>
                <span className="text-sm font-medium text-gray-900">{building.year_built}</span>
              </div>
            )}
            {building.floors_count && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Počet pater</span>
                <span className="text-sm font-medium text-gray-900">{building.floors_count}</span>
              </div>
            )}
            {building.last_renovation && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Poslední renovace</span>
                <span className="text-sm font-medium text-gray-900">{building.last_renovation}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Nájemní informace</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {building.tenant_name ? (
              <>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Nájemník</span>
                  <span className="text-sm font-medium text-gray-900">{building.tenant_name}</span>
                </div>
                {building.custom_rental_price && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Nájem</span>
                    <span className="text-sm font-medium text-gray-900">
                      {Number(building.custom_rental_price).toLocaleString('cs-CZ')} Kč
                    </span>
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm text-gray-400">Bez nájemníka</p>
            )}
            {building.description && (
              <div className="pt-2 border-t border-gray-100">
                <p className="text-sm text-gray-500 mb-1">Popis</p>
                <p className="text-sm text-gray-700">{building.description}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-gray-500">Poslední požadavky na údržbu</CardTitle>
            <Link href={`/dashboard/maintenance?building_id=${id}`} className="text-xs text-blue-600 hover:underline">
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
                    <div className="flex items-center gap-2 ml-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusPriorityColors[req.priority] ?? 'bg-gray-100'}`}>
                        {req.priority}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${reqStatusColors[req.status] ?? 'bg-gray-100'}`}>
                        {reqStatusLabels[req.status] ?? req.status}
                      </span>
                    </div>
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
            <Link href={`/dashboard/work-orders?building_id=${id}`} className="text-xs text-blue-600 hover:underline">
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
                      <span className="text-sm text-gray-900 truncate">{wo.work_description}</span>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ml-2 ${statusColors[wo.status] ?? 'bg-gray-100 text-gray-600'}`}>
                      {wo.status}
                    </span>
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
