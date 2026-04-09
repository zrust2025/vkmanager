import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { ArrowLeft, Edit, MapPin, Calendar, Wrench } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

const statusColors: Record<string, string> = {
  aktivni: 'bg-green-100 text-green-700',
  v_servisu: 'bg-amber-100 text-amber-700',
  mimo_provoz: 'bg-red-100 text-red-700',
  vyrazeno: 'bg-gray-100 text-gray-500',
}

const statusLabels: Record<string, string> = {
  aktivni: 'Aktivní',
  v_servisu: 'V servisu',
  mimo_provoz: 'Mimo provoz',
  vyrazeno: 'Vyřazeno',
}

export default async function EquipmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: eq } = await supabase
    .from('equipment')
    .select('*, buildings(name), equipment_categories(name)')
    .eq('id', id)
    .single()

  if (!eq) notFound()

  const { data: serviceRecords } = await supabase
    .from('service_records')
    .select('*')
    .eq('equipment_id', id)
    .order('service_date', { ascending: false })
    .limit(5)

  const { data: maintenanceRequests } = await supabase
    .from('maintenance_requests')
    .select('id, title, status, priority, created_at')
    .eq('equipment_id', id)
    .order('created_at', { ascending: false })
    .limit(5)

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

  const isWarrantyExpired = eq.warranty_until && new Date(eq.warranty_until) < new Date()
  const isServiceOverdue = eq.next_service_date && new Date(eq.next_service_date) < new Date()

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/equipment" className="text-gray-400 hover:text-gray-600">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">{eq.name}</h1>
            {eq.equipment_categories && (
              <p className="text-sm text-gray-500 mt-0.5">{(eq.equipment_categories as any).name}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-sm px-3 py-1 rounded-full font-medium ${statusColors[eq.status] ?? 'bg-gray-100'}`}>
            {statusLabels[eq.status] ?? eq.status}
          </span>
          <Link
            href={`/dashboard/equipment/${id}/edit`}
            className="flex items-center gap-2 border border-gray-200 px-3 py-1.5 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <Edit className="w-3.5 h-3.5" />
            Upravit
          </Link>
        </div>
      </div>

      {(isWarrantyExpired || isServiceOverdue) && (
        <div className="flex gap-3">
          {isServiceOverdue && (
            <div className="flex-1 bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm font-medium text-red-700">Servis po termínu!</p>
              <p className="text-xs text-red-500 mt-0.5">
                Měl proběhnout {new Date(eq.next_service_date).toLocaleDateString('cs-CZ')}
              </p>
            </div>
          )}
          {isWarrantyExpired && (
            <div className="flex-1 bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p className="text-sm font-medium text-amber-700">Záruka vypršela</p>
              <p className="text-xs text-amber-500 mt-0.5">
                Vypršela {new Date(eq.warranty_until).toLocaleDateString('cs-CZ')}
              </p>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Technické informace</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {eq.manufacturer && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Výrobce</span>
                <span className="text-sm font-medium text-gray-900">{eq.manufacturer}</span>
              </div>
            )}
            {eq.model && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Model</span>
                <span className="text-sm font-medium text-gray-900">{eq.model}</span>
              </div>
            )}
            {eq.serial_number && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Sériové číslo</span>
                <span className="text-sm font-medium text-gray-900">{eq.serial_number}</span>
              </div>
            )}
            {eq.inventory_number && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Inventární číslo</span>
                <span className="text-sm font-medium text-gray-900">{eq.inventory_number}</span>
              </div>
            )}
            {eq.year_installed && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Rok instalace</span>
                <span className="text-sm font-medium text-gray-900">{eq.year_installed}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Umístění a servis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {eq.buildings && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Budova</span>
                <span className="text-sm font-medium text-gray-900">{(eq.buildings as any).name}</span>
              </div>
            )}
            {eq.location && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Umístění</span>
                <span className="text-sm font-medium text-gray-900">{eq.location}</span>
              </div>
            )}
            {eq.last_service_date && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Poslední servis</span>
                <span className="text-sm font-medium text-gray-900">
                  {new Date(eq.last_service_date).toLocaleDateString('cs-CZ')}
                </span>
              </div>
            )}
            {eq.next_service_date && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Příští servis</span>
                <span className={`text-sm font-medium ${isServiceOverdue ? 'text-red-600' : 'text-gray-900'}`}>
                  {new Date(eq.next_service_date).toLocaleDateString('cs-CZ')}
                </span>
              </div>
            )}
            {eq.warranty_until && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Záruka do</span>
                <span className={`text-sm font-medium ${isWarrantyExpired ? 'text-amber-600' : 'text-gray-900'}`}>
                  {new Date(eq.warranty_until).toLocaleDateString('cs-CZ')}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {eq.description && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Popis</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{eq.description}</p>
          </CardContent>
        </Card>
      )}

      {serviceRecords && serviceRecords.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Servisní záznamy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {serviceRecords.map(s => (
                <div key={s.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{s.description}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(s.service_date).toLocaleDateString('cs-CZ')}
                      {s.technician && ` · ${s.technician}`}
                    </p>
                  </div>
                  {s.cost && (
                    <span className="text-sm font-medium text-gray-700">
                      {Number(s.cost).toLocaleString('cs-CZ')} Kč
                    </span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {maintenanceRequests && maintenanceRequests.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Požadavky na údržbu</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {maintenanceRequests.map(req => (
                <Link key={req.id} href={`/dashboard/maintenance/${req.id}`}>
                  <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0 hover:bg-gray-50 rounded px-1 transition-colors">
                    <p className="text-sm text-gray-900 truncate flex-1">{req.title}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ml-2 ${reqStatusColors[req.status] ?? 'bg-gray-100'}`}>
                      {reqStatusLabels[req.status] ?? req.status}
                    </span>
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

