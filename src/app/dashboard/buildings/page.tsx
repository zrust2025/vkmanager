import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Building2, Plus, MapPin } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

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

const statusLabels: Record<string, string> = {
  aktivni: 'Aktivní',
  volna: 'Volná',
  pronajata: 'Pronajatá',
  rezervovana: 'Rezervovaná',
  rekonstrukce: 'Rekonstrukce',
  interni: 'Interní',
}

export default async function BuildingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: buildings } = await supabase
    .from('buildings')
    .select('*, sites(name)')
    .order('name')

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Budovy</h1>
          <p className="text-sm text-gray-500 mt-1">Správa objektů areálu</p>
        </div>
        <Link
          href="/dashboard/buildings/new"
          className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Přidat budovu
        </Link>
      </div>

      {!buildings || buildings.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Building2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium">Zatím žádné budovy</p>
          <p className="text-xs mt-1">Přidej první budovu kliknutím na tlačítko výše</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {buildings.map((b) => (
            <Link key={b.id} href={`/dashboard/buildings/${b.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{b.name}</p>
                      {b.sites && (
                        <div className="flex items-center gap-1 mt-1">
                          <MapPin className="w-3 h-3 text-gray-400" />
                          <p className="text-xs text-gray-500 truncate">{(b.sites as any).name}</p>
                        </div>
                      )}
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${statusColors[b.status] ?? 'bg-gray-100 text-gray-600'}`}>
                      {statusLabels[b.status] ?? b.status}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs text-gray-500">{typeLabels[b.type] ?? b.type}</span>
                    {b.total_area && (
                      <span className="text-xs text-gray-500">{b.total_area} m²</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}