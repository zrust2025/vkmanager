import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { ArrowLeft, Edit, Calendar, Users, DollarSign, CheckCircle2, Circle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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

const priorityLabels: Record<string, string> = {
  nizka: 'Nízká',
  stredni: 'Střední',
  vysoka: 'Vysoká',
  kriticka: 'Kritická',
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: project } = await supabase
    .from('projects')
    .select('*, buildings(name)')
    .eq('id', id)
    .single()

  if (!project) notFound()

  const { data: tasks } = await supabase
    .from('project_tasks')
    .select('*')
    .eq('project_id', id)
    .order('order', { ascending: true })

  const { data: expenses } = await supabase
    .from('project_expenses')
    .select('*')
    .eq('project_id', id)
    .order('created_at', { ascending: false })

  const { data: requests } = await supabase
    .from('maintenance_requests')
    .select('id, title, status, priority, created_at')
    .eq('project_id', id)
    .order('created_at', { ascending: false })
    .limit(5)

  const totalExpenses = expenses?.reduce((s, e) => s + (e.amount || 0), 0) ?? 0
  const completedTasks = tasks?.filter(t => t.status === 'dokonceno').length ?? 0
  const totalTasks = tasks?.length ?? 0

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/projects" className="text-gray-400 hover:text-gray-600">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">{project.name}</h1>
            {project.description && (
              <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">{project.description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-sm px-3 py-1 rounded-full font-medium ${priorityColors[project.priority] ?? 'bg-gray-100'}`}>
            {priorityLabels[project.priority] ?? project.priority}
          </span>
          <span className={`text-sm px-3 py-1 rounded-full font-medium ${statusColors[project.status] ?? 'bg-gray-100'}`}>
            {statusLabels[project.status] ?? project.status}
          </span>
          <Link
            href={`/dashboard/projects/${id}/edit`}
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
            <p className="text-2xl font-semibold text-gray-900">{completedTasks}/{totalTasks}</p>
            <p className="text-xs text-gray-500 mt-1">Úkoly</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-semibold text-gray-900">
              {project.budget > 0 ? `${Math.round((totalExpenses / project.budget) * 100)}%` : '—'}
            </p>
            <p className="text-xs text-gray-500 mt-1">Čerpání rozpočtu</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-semibold text-gray-900">
              {Number(totalExpenses).toLocaleString('cs-CZ')}
            </p>
            <p className="text-xs text-gray-500 mt-1">Výdaje (Kč)</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-semibold text-gray-900">
              {project.budget > 0 ? Number(project.budget).toLocaleString('cs-CZ') : '—'}
            </p>
            <p className="text-xs text-gray-500 mt-1">Rozpočet (Kč)</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Informace o projektu</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {project.manager_name && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Manažer</span>
                <span className="text-sm font-medium text-gray-900">{project.manager_name}</span>
              </div>
            )}
            {project.buildings && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Budova</span>
                <span className="text-sm font-medium text-gray-900">{(project.buildings as any).name}</span>
              </div>
            )}
            {project.start_date && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Zahájení</span>
                <span className="text-sm font-medium text-gray-900">
                  {new Date(project.start_date).toLocaleDateString('cs-CZ')}
                </span>
              </div>
            )}
            {project.end_date && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Dokončení</span>
                <span className="text-sm font-medium text-gray-900">
                  {new Date(project.end_date).toLocaleDateString('cs-CZ')}
                </span>
              </div>
            )}
            {project.hours_budget > 0 && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Hodinový rozpočet</span>
                <span className="text-sm font-medium text-gray-900">{project.hours_budget} hod</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-500">Úkoly</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {!tasks || tasks.length === 0 ? (
              <p className="text-sm text-gray-400 py-2">Žádné úkoly</p>
            ) : (
              <div className="space-y-2">
                {tasks.map(task => (
                  <div key={task.id} className="flex items-center gap-2 py-1">
                    {task.status === 'dokonceno' ? (
                      <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                    ) : (
                      <Circle className="w-4 h-4 text-gray-300 flex-shrink-0" />
                    )}
                    <span className={`text-sm ${task.status === 'dokonceno' ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                      {task.title}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {expenses && expenses.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Výdaje</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {expenses.map(exp => (
                <div key={exp.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="text-sm text-gray-900">{exp.description}</p>
                    {exp.date && (
                      <p className="text-xs text-gray-400">{new Date(exp.date).toLocaleDateString('cs-CZ')}</p>
                    )}
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {Number(exp.amount).toLocaleString('cs-CZ')} Kč
                  </span>
                </div>
              ))}
              <div className="flex justify-between pt-2 border-t border-gray-200">
                <span className="text-sm font-medium text-gray-700">Celkem</span>
                <span className="text-sm font-semibold text-gray-900">{Number(totalExpenses).toLocaleString('cs-CZ')} Kč</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {requests && requests.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Požadavky na údržbu</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {requests.map(req => (
                <Link key={req.id} href={`/dashboard/maintenance/${req.id}`}>
                  <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0 hover:bg-gray-50 rounded px-1 transition-colors">
                    <p className="text-sm text-gray-900 truncate flex-1">{req.title}</p>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 ml-2">
                      {req.status}
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