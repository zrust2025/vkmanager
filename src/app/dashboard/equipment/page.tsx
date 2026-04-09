import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Cog, Plus } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'

export default async function EquipmentPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: equipment } = await supabase
    .from('equipment')
    .select('*, buildings(name), equipment_categories(name)')
    .order('name')

  const { data: categories } = await supabase
    .from('equipment_categories')
    .select('id, name')
    .order('name')

  const statusColors: Record<string, string> = {
    aktivni: 'bg-green-100 text-green-700',
    v_servisu: 'bg-amber-100 text-amber-700',
    mimo_provoz: 'bg-red-100 text-red-700',
    vyrazeno: 'bg-gray-100 text-gray-500',
  }

  const grouped = categories?.map(cat => ({
    ...cat,
    items: equipment?.filter(e => e.category_id === cat.id) ?? []
  })) ?? []

  const uncategorized = equipment?.filter(e => !e.category_id) ?? []

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Technické zařízení</h1>
          <p className="text-sm text-gray-500 mt-1">{equipment?.length ?? 0} zařízení celkem</p>
        </div>
        <Link
          href="/dashboard/equipment/new"
          className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Přidat zařízení
        </Link>
      </div>

      {!equipment || equipment.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Cog className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium">Zatím žádné zařízení</p>
          <p className="text-xs mt-1">Přidej první zařízení kliknutím na tlačítko výše</p>
        </div>
      ) : (
        <div className="space-y-6">
          {grouped.filter(g => g.items.length > 0).map(group => (
            <div key={group.id}>
              <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
                {group.name} ({group.items.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {group.items.map(eq => (
                  <Link key={eq.id} href={`/dashboard/equipment/${eq.id}`}>
                    <Card className="hover:shadow-sm transition-shadow cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">{eq.name}</p>
                            {(eq.manufacturer || eq.model) && (
                              <p className="text-xs text-gray-500 mt-0.5 truncate">
                                {[eq.manufacturer, eq.model].filter(Boolean).join(' · ')}
                              </p>
                            )}
                            {eq.buildings && (
                              <p className="text-xs text-gray-400 mt-1 truncate">{(eq.buildings as any).name}</p>
                            )}
                          </div>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${statusColors[eq.status] ?? 'bg-gray-100 text-gray-600'}`}>
                            {eq.status}
                          </span>
                        </div>
                        {eq.next_service_date && (
                          <div className="mt-2 pt-2 border-t border-gray-100">
                            <p className="text-xs text-gray-400">
                              Příští servis: {new Date(eq.next_service_date).toLocaleDateString('cs-CZ')}
                            </p>
                          </div>
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
                {uncategorized.map(eq => (
                  <Link key={eq.id} href={`/dashboard/equipment/${eq.id}`}>
                    <Card className="hover:shadow-sm transition-shadow cursor-pointer">
                      <CardContent className="p-4">
                        <p className="font-medium text-gray-900 truncate">{eq.name}</p>
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
