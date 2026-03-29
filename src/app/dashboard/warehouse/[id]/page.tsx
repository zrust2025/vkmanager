import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { ArrowLeft, Edit, Package, MapPin } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

const statusColors: Record<string, string> = {
  dostupne: 'bg-green-100 text-green-700',
  prideleno: 'bg-blue-100 text-blue-700',
  zapujceno: 'bg-amber-100 text-amber-700',
  v_servisu: 'bg-orange-100 text-orange-700',
  vyrazeno: 'bg-gray-100 text-gray-500',
}

const statusLabels: Record<string, string> = {
  dostupne: 'Dostupné',
  prideleno: 'Přiděleno',
  zapujceno: 'Zapůjčeno',
  v_servisu: 'V servisu',
  vyrazeno: 'Vyřazeno',
}

export default async function AssetDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: asset } = await supabase
    .from('assets')
    .select('*, asset_categories(name), buildings:location_building_id(name)')
    .eq('id', id)
    .single()

  if (!asset) notFound()

  const { data: assignments } = await supabase
    .from('asset_assignments')
    .select('*')
    .eq('asset_id', id)
    .order('assigned_date', { ascending: false })

  const { data: serviceRecords } = await supabase
    .from('asset_service_records')
    .select('*')
    .eq('asset_id', id)
    .order('service_date', { ascending: false })

  const activeAssignment = assignments?.find(a => !a.is_returned)

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/warehouse" className="text-gray-400 hover:text-gray-600">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">{asset.name}</h1>
            {asset.internal_code && (
              <p className="text-sm font-mono text-gray-400 mt-0.5">{asset.internal_code}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-sm px-3 py-1 rounded-full font-medium ${statusColors[asset.status] ?? 'bg-gray-100'}`}>
            {statusLabels[asset.status] ?? asset.status}
          </span>
          <Link
            href={`/dashboard/warehouse/${id}/edit`}
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
            {asset.asset_categories && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Kategorie</span>
                <span className="text-sm font-medium text-gray-900">{(asset.asset_categories as any).name}</span>
              </div>
            )}
            {asset.manufacturer && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Výrobce</span>
                <span className="text-sm font-medium text-gray-900">{asset.manufacturer}</span>
              </div>
            )}
            {asset.model && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Model</span>
                <span className="text-sm font-medium text-gray-900">{asset.model}</span>
              </div>
            )}
            {asset.serial_number && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Sériové číslo</span>
                <span className="text-sm font-medium text-gray-900">{asset.serial_number}</span>
              </div>
            )}
            {asset.purchase_date && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Datum pořízení</span>
                <span className="text-sm font-medium text-gray-900">
                  {new Date(asset.purchase_date).toLocaleDateString('cs-CZ')}
                </span>
              </div>
            )}
            {asset.purchase_price && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Pořizovací cena</span>
                <span className="text-sm font-medium text-gray-900">
                  {Number(asset.purchase_price).toLocaleString('cs-CZ')} Kč
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Umístění a přiřazení</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {asset.buildings && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Budova</span>
                <span className="text-sm font-medium text-gray-900">{(asset.buildings as any).name}</span>
              </div>
            )}
            {asset.location && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Umístění</span>
                <span className="text-sm font-medium text-gray-900">{asset.location}</span>
              </div>
            )}
            {activeAssignment ? (
              <div className="pt-2 border-t border-gray-100">
                <p className="text-xs text-gray-400 mb-2">Aktuální přiřazení</p>
                <p className="text-sm font-medium text-gray-900">{activeAssignment.assigned_to_name}</p>
                <p className="text-xs text-gray-500">{activeAssignment.assignment_type === 'trvale' ? 'Trvalé' : 'Výpůjčka'}</p>
                <p className="text-xs text-gray-400">
                  Od: {new Date(activeAssignment.assigned_date).toLocaleDateString('cs-CZ')}
                </p>
              </div>
            ) : (
              <p className="text-sm text-gray-400">Nepřiřazeno</p>
            )}
          </CardContent>
        </Card>
      </div>

      {asset.notes && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Poznámky</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{asset.notes}</p>
          </CardContent>
        </Card>
      )}

      {assignments && assignments.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Historie přiřazení</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {assignments.map(a => (
                <div key={a.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{a.assigned_to_name}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(a.assigned_date).toLocaleDateString('cs-CZ')}
                      {a.actual_return_date && ` — ${new Date(a.actual_return_date).toLocaleDateString('cs-CZ')}`}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${a.is_returned ? 'bg-gray-100 text-gray-500' : 'bg-blue-100 text-blue-700'}`}>
                    {a.is_returned ? 'Vráceno' : 'Aktivní'}
                  </span>
                </div>
              ))}
            </div>
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
    </div>
  )
}