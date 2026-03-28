import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { ArrowLeft, Edit, Building2, User, Calendar, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

const statusColors: Record<string, string> = {
  novy: 'bg-blue-100 text-blue-700',
  prirazen: 'bg-purple-100 text-purple-700',
  v_reseni: 'bg-amber-100 text-amber-700',
  ceka_na_material: 'bg-orange-100 text-orange-700',
  ceka_na_schvaleni: 'bg-yellow-100 text-yellow-700',
  dokoncen: 'bg-green-100 text-green-700',
  zrusen: 'bg-gray-100 text-gray-500',
}

const statusLabels: Record<string, string> = {
  novy: 'Nový',
  prirazen: 'Přiřazen',
  v_reseni: 'V řešení',
  ceka_na_material: 'Čeká na materiál',
  ceka_na_schvaleni: 'Čeká na schválení',
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

const typeLabels: Record<string, string> = {
  oprava: 'Oprava',
  revize: 'Revize',
  kontrola: 'Kontrola',
  instalace: 'Instalace',
  jine: 'Jiné',
}

export default async function MaintenanceRequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: request } = await supabase
    .from('maintenance_requests')
    .select('*, buildings(name), floors(name), units(name), rooms(name), tenants(full_name, company)')
    .eq('id', id)
    .single()

  if (!request) notFound()

  const { data: comments } = await supabase
    .from('maintenance_request_comments')
    .select('*')
    .eq('request_id', id)
    .order('created_at', { ascending: true })

  const { data: workOrders } = await supabase
    .from('work_orders')
    .select('id, order_number, work_description, status, total_cost')
    .eq('maintenance_request_id', id)

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/maintenance" className="text-gray-400 hover:text-gray-600">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">{request.title}</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {new Date(request.created_at).toLocaleDateString('cs-CZ')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-sm px-3 py-1 rounded-full font-medium ${priorityColors[request.priority] ?? 'bg-gray-100'}`}>
            {priorityLabels[request.priority] ?? request.priority}
          </span>
          <span className={`text-sm px-3 py-1 rounded-full font-medium ${statusColors[request.status] ?? 'bg-gray-100'}`}>
            {statusLabels[request.status] ?? request.status}
          </span>
          <Link
            href={`/dashboard/maintenance/${id}/edit`}
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
            <CardTitle className="text-sm font-medium text-gray-500">Detail požadavku</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Typ</span>
              <span className="text-sm font-medium text-gray-900">{typeLabels[request.type] ?? request.type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Kategorie</span>
              <span className="text-sm font-medium text-gray-900">{request.category ?? '—'}</span>
            </div>
            {request.due_date && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Termín</span>
                <span className="text-sm font-medium text-gray-900">
                  {new Date(request.due_date).toLocaleDateString('cs-CZ')}
                </span>
              </div>
            )}
            {request.estimated_cost && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Odh. náklady</span>
                <span className="text-sm font-medium text-gray-900">
                  {Number(request.estimated_cost).toLocaleString('cs-CZ')} Kč
                </span>
              </div>
            )}
            {request.actual_cost && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Skutečné náklady</span>
                <span className="text-sm font-medium text-gray-900">
                  {Number(request.actual_cost).toLocaleString('cs-CZ')} Kč
                </span>
              </div>
            )}
            {request.estimated_hours && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Odh. hodiny</span>
                <span className="text-sm font-medium text-gray-900">{request.estimated_hours} hod</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Lokace a osoby</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {request.buildings && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Budova</span>
                <span className="text-sm font-medium text-gray-900">{(request.buildings as any).name}</span>
              </div>
            )}
            {request.floors && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Podlaží</span>
                <span className="text-sm font-medium text-gray-900">{(request.floors as any).name}</span>
              </div>
            )}
            {request.units && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Jednotka</span>
                <span className="text-sm font-medium text-gray-900">{(request.units as any).name}</span>
              </div>
            )}
            {request.tenants && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Nájemník</span>
                <span className="text-sm font-medium text-gray-900">
                  {(request.tenants as any).company || (request.tenants as any).full_name}
                </span>
              </div>
            )}
            {request.requestor_name && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Zadal</span>
                <span className="text-sm font-medium text-gray-900">{request.requestor_name}</span>
              </div>
            )}
            {request.assigned_to_email && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Přiřazeno</span>
                <span className="text-sm font-medium text-gray-900">{request.assigned_to_email}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {request.description && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Popis</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{request.description}</p>
          </CardContent>
        </Card>
      )}

      {request.resolution_notes && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Poznámky k řešení</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{request.resolution_notes}</p>
          </CardContent>
        </Card>
      )}

      {workOrders && workOrders.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Pracovní příkazy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {workOrders.map(wo => (
                <Link key={wo.id} href={`/dashboard/work-orders/${wo.id}`}>
                  <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0 hover:bg-gray-50 rounded px-1 transition-colors">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-gray-400">{wo.order_number}</span>
                      <span className="text-sm text-gray-900">{wo.work_description}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {wo.total_cost > 0 && (
                        <span className="text-xs text-gray-500">{Number(wo.total_cost).toLocaleString('cs-CZ')} Kč</span>
                      )}
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{wo.status}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-500">Komentáře ({comments?.length ?? 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {!comments || comments.length === 0 ? (
            <p className="text-sm text-gray-400 py-2">Zatím žádné komentáře</p>
          ) : (
            <div className="space-y-3">
              {comments.map(comment => (
                <div key={comment.id} className="flex gap-3">
                  <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-medium text-gray-600">
                      {comment.author_name?.charAt(0).toUpperCase() ?? '?'}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-gray-900">{comment.author_name}</span>
                      <span className="text-xs text-gray-400">
                        {new Date(comment.created_at).toLocaleDateString('cs-CZ')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mt-0.5">{comment.content}</p>
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