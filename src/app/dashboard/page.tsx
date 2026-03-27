import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import {
  Wrench, Building2, Package, Users,
  ClipboardList, FolderKanban, AlertTriangle, CheckCircle2
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [
    { count: buildingsCount },
    { count: openRequestsCount },
    { count: openWorkOrdersCount },
    { count: assetsCount },
    { count: projectsCount },
    { count: tenantsCount },
  ] = await Promise.all([
    supabase.from('buildings').select('*', { count: 'exact', head: true }),
    supabase.from('maintenance_requests').select('*', { count: 'exact', head: true }).in('status', ['novy', 'prirazen', 'v_reseni']),
    supabase.from('work_orders').select('*', { count: 'exact', head: true }).in('status', ['otevreny', 'prirazen', 'v_procesu']),
    supabase.from('assets').select('*', { count: 'exact', head: true }),
    supabase.from('projects').select('*', { count: 'exact', head: true }).eq('status', 'aktivni'),
    supabase.from('tenants').select('*', { count: 'exact', head: true }),
  ])

  const stats = [
    { label: 'Budovy', value: buildingsCount ?? 0, icon: Building2, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Otevřené požadavky', value: openRequestsCount ?? 0, icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Pracovní příkazy', value: openWorkOrdersCount ?? 0, icon: ClipboardList, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Majetek', value: assetsCount ?? 0, icon: Package, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Aktivní projekty', value: projectsCount ?? 0, icon: FolderKanban, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Nájemníci', value: tenantsCount ?? 0, icon: Users, color: 'text-rose-600', bg: 'bg-rose-50' },
  ]

  const { data: recentRequests } = await supabase
    .from('maintenance_requests')
    .select('id, title, status, priority, created_at')
    .order('created_at', { ascending: false })
    .limit(8)

  const statusLabels: Record<string, string> = {
    novy: 'Nový', prirazen: 'Přiřazen', v_reseni: 'V řešení',
    dokoncen: 'Dokončen', zrusen: 'Zrušen'
  }
  const statusColors: Record<string, string> = {
    novy: 'bg-blue-100 text-blue-700',
    prirazen: 'bg-purple-100 text-purple-700',
    v_reseni: 'bg-amber-100 text-amber-700',
    dokoncen: 'bg-green-100 text-green-700',
    zrusen: 'bg-gray-100 text-gray-500',
  }
  const priorityColors: Record<string, string> = {
    nizka: 'bg-gray-100 text-gray-600',
    stredni: 'bg-blue-100 text-blue-700',
    vysoka: 'bg-orange-100 text-orange-700',
    kriticka: 'bg-red-100 text-red-700',
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Přehled správy areálu</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${stat.bg}`}>
                    <Icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                    <p className="text-xs text-gray-500">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium">Poslední požadavky na údržbu</CardTitle>
        </CardHeader>
        <CardContent>
          {!recentRequests || recentRequests.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Wrench className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">Zatím žádné požadavky</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentRequests.map((req) => (
                <div key={req.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{req.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(req.created_at).toLocaleDateString('cs-CZ')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityColors[req.priority] ?? 'bg-gray-100 text-gray-600'}`}>
                      {req.priority}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[req.status] ?? 'bg-gray-100 text-gray-600'}`}>
                      {statusLabels[req.status] ?? req.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}