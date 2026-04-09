import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { ArrowLeft, Edit, MapPin, Building2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default async function SiteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: site } = await supabase
    .from('sites')
    .select('*')
    .eq('id', id)
    .single()

  if (!site) notFound()

  const { data: buildings } = await supabase
    .from('buildings')
    .select('id, name, type, status, total_area')
    .eq('site_id', id)
    .order('name')

  const { data: maintenanceRequests } = await supabase
    .from('maintenance_requests')
    .select('id, title, status, priority, created_at')
    .eq('site_id', id)
    .order('created_at', { ascending: false })
    .limit(5)

  const typeLabels: Record<string, string> = {
    budova: 'Budova',
    skladovaci_plocha: 'Sklad',
    parkovaci_plocha: 'Parkoviště',
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

  const totalArea = buildings?.reduce((s, b) => s + (b.total_area || 0), 0) ?? 0

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/sites" className="text-gray-400 hover:text-gray-600">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">{site.name}</h1>
            {site.address && (
              <div className="flex items-center gap-1 mt-1">
                <MapPin className="w-3 h-3 text-gray-400" />
                <span className="text-sm text-gray-500">{site.address}</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-sm px-3 py-1 rounded-full font-medium ${site.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
            {site.is_active ? 'Aktivní' : 'Neaktivní'}
          </span>
          <Link
            href={`/dashboard/sites/${id}/edit`}
            className="flex items-center gap-2 border border-gray-200 px-3 py-1.5 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <Edit className="w-3.5 h-3.5" />
            Upravit
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-semibold text-gray-900">{buildings?.length ?? 0}</p>
            <p className="text-xs text-gray-500 mt-1">Budov</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-semibold text-gray-900">
              {site.total_area ? Number(site.total_area).toLocaleString('cs-CZ') : '—'}
            </p>
            <p className="text-xs text-gray-500 mt-1">Celková plocha (m²)</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-semibold text-gray-900">
              {buildings?.filter(b => b.status === 'pronajata').length ?? 0}
            </p>
            <p className="text-xs text-gray-500 mt-1">Pronajato</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-semibold text-gray-900">
              {maintenanceRequests?.filter(r => r.status !== 'dokoncen' && r.status !== 'zrusen').length ?? 0}
            </p>
            <p className="text-xs text-gray-500 mt-1">Otevřené požadavky</p>
          </CardContent>
        </Card>
      </div>

      {site.description && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Popis</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-700">{site.description}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-gray-500">Budovy ({buildings?.length ?? 0})</CardTitle>
            <Link href={`/dashboard/buildings?site_id=${id}`} className="text-xs text-blue-600 hover:underline">
              Zobrazit vše
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {!buildings || buildings.length === 0 ? (
            <p className="text-sm text-gray-400 py-2">Žádné budovy</p>
          ) : (
            <div className="space-y-2">
              {buildings.map(b => (
                <Link key={b.id} href={`/dashboard/buildings/${b.id}`}>
                  <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0 hover:bg-gray-50 rounded px-1 transition-colors">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <Building2 className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <p className="text-sm text-gray-900 truncate">{b.name}</p>
                      <span className="text-xs text-gray-400">{typeLabels[b.type] ?? b.type}</span>
                    </div>
                    <div className="flex items-center gap-2 ml-2">
                      {b.total_area && (
                        <span className="text-xs text-gray-400">{b.total_area} m²</span>
                      )}
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[b.status] ?? 'bg-gray-100'}`}>
                        {b.status}
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
          <CardTitle className="text-sm font-medium text-gray-500">Poslední požadavky</CardTitle>
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
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ml-2 ${reqStatusColors[req.status] ?? 'bg-gray-100'}`}>
                      {reqStatusLabels[req.status] ?? req.status}
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
