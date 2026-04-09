import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { MapPin, Plus, Building2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'

export default async function SitesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: sites } = await supabase
    .from('sites')
    .select('*')
    .order('name')

  const { data: buildings } = await supabase
    .from('buildings')
    .select('site_id')

  const buildingCounts = buildings?.reduce((acc: Record<string, number>, b) => {
    if (b.site_id) acc[b.site_id] = (acc[b.site_id] ?? 0) + 1
    return acc
  }, {}) ?? {}

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Areály</h1>
          <p className="text-sm text-gray-500 mt-1">{sites?.length ?? 0} areálů celkem</p>
        </div>
        <Link
          href="/dashboard/sites/new"
          className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Přidat areál
        </Link>
      </div>

      {!sites || sites.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <MapPin className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium">Zatím žádné areály</p>
          <p className="text-xs mt-1">Přidej první areál kliknutím na tlačítko výše</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {sites.map(site => (
            <Link key={site.id} href={`/dashboard/sites/${site.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{site.name}</p>
                      {site.address && (
                        <div className="flex items-center gap-1 mt-1">
                          <MapPin className="w-3 h-3 text-gray-400" />
                          <p className="text-xs text-gray-500 truncate">{site.address}</p>
                        </div>
                      )}
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${site.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {site.is_active ? 'Aktivní' : 'Neaktivní'}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-xs text-gray-500">{buildingCounts[site.id] ?? 0} budov</span>
                    </div>
                    {site.total_area && (
                      <span className="text-xs text-gray-500">{Number(site.total_area).toLocaleString('cs-CZ')} m²</span>
                    )}
                  </div>

                  {site.description && (
                    <p className="text-xs text-gray-400 mt-2 line-clamp-2">{site.description}</p>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}