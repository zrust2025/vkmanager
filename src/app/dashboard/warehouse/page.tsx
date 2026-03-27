import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Package, Plus } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
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

export default async function WarehousePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: assets } = await supabase
    .from('assets')
    .select('*, asset_categories(name)')
    .order('name')

  const { data: categories } = await supabase
    .from('asset_categories')
    .select('id, name')
    .order('name')

  const grouped = categories?.map(cat => ({
    ...cat,
    items: assets?.filter(a => a.category_id === cat.id) ?? []
  })) ?? []

  const uncategorized = assets?.filter(a => !a.category_id) ?? []

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Sklad & Majetek</h1>
          <p className="text-sm text-gray-500 mt-1">{assets?.length ?? 0} položek celkem</p>
        </div>
        <Link
          href="/dashboard/warehouse/new"
          className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Přidat položku
        </Link>
      </div>

      {!assets || assets.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium">Zatím žádný majetek</p>
          <p className="text-xs mt-1">Přidej první položku kliknutím na tlačítko výše</p>
        </div>
      ) : (
        <div className="space-y-6">
          {grouped.filter(g => g.items.length > 0).map(group => (
            <div key={group.id}>
              <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
                {group.name} ({group.items.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {group.items.map(asset => (
                  <Link key={asset.id} href={`/dashboard/warehouse/${asset.id}`}>
                    <Card className="hover:shadow-sm transition-shadow cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">{asset.name}</p>
                            {asset.internal_code && (
                              <p className="text-xs font-mono text-gray-400 mt-0.5">{asset.internal_code}</p>
                            )}
                            {(asset.manufacturer || asset.model) && (
                              <p className="text-xs text-gray-500 mt-1 truncate">
                                {[asset.manufacturer, asset.model].filter(Boolean).join(' · ')}
                              </p>
                            )}
                          </div>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${statusColors[asset.status] ?? 'bg-gray-100 text-gray-600'}`}>
                            {statusLabels[asset.status] ?? asset.status}
                          </span>
                        </div>
                        {asset.location && (
                          <p className="text-xs text-gray-400 mt-2 truncate">{asset.location}</p>
                        )}
                        {asset.purchase_price && (
                          <p className="text-xs text-gray-500 mt-1">
                            {Number(asset.purchase_price).toLocaleString('cs-CZ')} Kč
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          ))}
          {uncategorized.length > 0 && (
            <div>
              <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
                Bez kategorie ({uncategorized.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {uncategorized.map(asset => (
                  <Link key={asset.id} href={`/dashboard/warehouse/${asset.id}`}>
                    <Card className="hover:shadow-sm transition-shadow cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-medium text-gray-900 truncate">{asset.name}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${statusColors[asset.status] ?? 'bg-gray-100 text-gray-600'}`}>
                            {statusLabels[asset.status] ?? asset.status}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}