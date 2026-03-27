import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Wrench, Plus } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'

const statusLabels: Record<string, string> = {
  novy: 'Nový',
  prirazen: 'Přiřazen',
  v_reseni: 'V řešení',
  ceka_na_material: 'Čeká na materiál',
  ceka_na_schvaleni: 'Čeká na schválení',
  dokoncen: 'Dokončen',
  zrusen: 'Zrušen',
}

const statusColors: Record<string, string> = {
  novy: 'bg-blue-100 text-blue-700',
  prirazen: 'bg-purple-100 text-purple-700',
  v_reseni: 'bg-amber-100 text-amber-700',
  ceka_na_material: 'bg-orange-100 text-orange-700',
  ceka_na_schvaleni: 'bg-yellow-100 text-yellow-700',
  dokoncen: 'bg-green-100 text-green-700',
  zrusen: 'bg-gray-100 text-gray-500',
}

const priorityColors: Record<string, string> = {
  nizka: 'bg-gray-100 text-gray-600',
  stredni: 'bg-blue-100 text-blue-700',
  vysoka: 'bg-orange-100 text-orange-700',
  kriticka: 'bg-red-100 text-red-700',
}

const priorityLabels: Record<string, string> = {
  nizka: 'Nízká',
  stredni: 'Střední',
  vysoka: 'Vysoká',
  kriticka: 'Kritická',
}

export default async function MaintenancePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: requests } = await supabase
    .from('maintenance_requests')
    .select('*, buildings(name), profiles!requestor_id(display_name)')
    .order('created_at', { ascending: false })

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Požadavky na údržbu</h1>
          <p className="text-sm text-gray-500 mt-1">{requests?.length ?? 0} požadavků celkem</p>
        </div>
        <Link
          href="/dashboard/maintenance/new"
          className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nový požadavek
        </Link>
      </div>

      {!requests || requests.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Wrench className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium">Zatím žádné požadavky</p>
          <p className="text-xs mt-1">Přidej první požadavek kliknutím na tlačítko výše</p>
        </div>
      ) : (
        <div className="space-y-2">
          {requests.map((req) => (
            <Link key={req.id} href={`/dashboard/maintenance/${req.id}`}>
              <Card className="hover:shadow-sm transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{req.title}</p>
                      <div className="flex items-center gap-3 mt-1">
                        {req.buildings && (
                          <span className="text-xs text-gray-500">{(req.buildings as any).name}</span>
                        )}
                        <span className="text-xs text-gray-400">
                          {new Date(req.created_at).toLocaleDateString('cs-CZ')}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityColors[req.priority] ?? 'bg-gray-100 text-gray-600'}`}>
                        {priorityLabels[req.priority] ?? req.priority}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[req.status] ?? 'bg-gray-100 text-gray-600'}`}>
                        {statusLabels[req.status] ?? req.status}
                      </span>
                    </div>
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