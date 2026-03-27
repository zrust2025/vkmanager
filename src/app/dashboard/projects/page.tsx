import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { FolderKanban, Plus, Calendar, Users } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'

const statusColors: Record<string, string> = {
  planovany: 'bg-gray-100 text-gray-600',
  aktivni: 'bg-green-100 text-green-700',
  pozastaven: 'bg-amber-100 text-amber-700',
  dokoncen: 'bg-blue-100 text-blue-700',
  zrusen: 'bg-red-100 text-red-700',
}

const statusLabels: Record<string, string> = {
  planovany: 'Plánovaný',
  aktivni: 'Aktivní',
  pozastaven: 'Pozastaven',
  dokoncen: 'Dokončen',
  zrusen: 'Zrušen',
}

const priorityColors: Record<string, string> = {
  nizka: 'bg-gray-100 text-gray-600',
  stredni: 'bg-blue-100 text-blue-700',
  vysoka: 'bg-orange-100 text-orange-700',
  kriticka: 'bg-red-100 text-red-700',
}

export default async function ProjectsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Projekty</h1>
          <p className="text-sm text-gray-500 mt-1">{projects?.length ?? 0} projektů celkem</p>
        </div>
        <Link
          href="/dashboard/projects/new"
          className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nový projekt
        </Link>
      </div>

      {!projects || projects.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <FolderKanban className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium">Zatím žádné projekty</p>
          <p className="text-xs mt-1">Přidej první projekt kliknutím na tlačítko výše</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {projects.map((p) => {
            const progress = p.budget > 0
              ? Math.min(100, Math.round(((p.budget - (p.budget * 0.3)) / p.budget) * 100))
              : 0
            return (
              <Link key={p.id} href={`/dashboard/projects/${p.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <p className="font-medium text-gray-900 truncate flex-1">{p.name}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${statusColors[p.status] ?? 'bg-gray-100 text-gray-600'}`}>
                        {statusLabels[p.status] ?? p.status}
                      </span>
                    </div>

                    {p.description && (
                      <p className="text-xs text-gray-500 line-clamp-2 mb-3">{p.description}</p>
                    )}

                    <div className="space-y-2">
                      {(p.start_date || p.end_date) && (
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-500">
                            {p.start_date && new Date(p.start_date).toLocaleDateString('cs-CZ')}
                            {p.start_date && p.end_date && ' — '}
                            {p.end_date && new Date(p.end_date).toLocaleDateString('cs-CZ')}
                          </span>
                        </div>
                      )}
                      {p.manager_name && (
                        <div className="flex items-center gap-2">
                          <Users className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-500">{p.manager_name}</span>
                        </div>
                      )}
                    </div>

                    {p.budget > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>Rozpočet</span>
                          <span className="font-medium text-gray-700">{Number(p.budget).toLocaleString('cs-CZ')} Kč</span>
                        </div>
                      </div>
                    )}

                    <div className="mt-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${priorityColors[p.priority] ?? 'bg-gray-100 text-gray-600'}`}>
                        {p.priority}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}