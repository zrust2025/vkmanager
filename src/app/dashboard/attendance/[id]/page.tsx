import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { ArrowLeft, Edit, CheckCircle2, XCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

const typeLabels: Record<string, string> = {
  prace: 'Práce',
  dovolena: 'Dovolená',
  nemoc: 'Nemoc',
  sluzebni_cesta: 'Služební cesta',
  skoleni: 'Školení',
  home_office: 'Home office',
  jine: 'Jiné',
}

const typeColors: Record<string, string> = {
  prace: 'bg-green-100 text-green-700',
  dovolena: 'bg-blue-100 text-blue-700',
  nemoc: 'bg-red-100 text-red-700',
  sluzebni_cesta: 'bg-purple-100 text-purple-700',
  skoleni: 'bg-amber-100 text-amber-700',
  home_office: 'bg-teal-100 text-teal-700',
  jine: 'bg-gray-100 text-gray-600',
}

export default async function AttendanceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: record } = await supabase
    .from('attendance')
    .select('*, employees(full_name, position, department)')
    .eq('id', id)
    .single()

  if (!record) notFound()

  return (
    <div className="p-6 space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/attendance" className="text-gray-400 hover:text-gray-600">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              {record.employees?.full_name ?? record.user_email ?? 'Neznámý'}
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {new Date(record.date).toLocaleDateString('cs-CZ', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-sm px-3 py-1 rounded-full font-medium ${typeColors[record.type] ?? 'bg-gray-100'}`}>
            {typeLabels[record.type] ?? record.type}
          </span>
          <Link
            href={`/dashboard/attendance/${id}/edit`}
            className="flex items-center gap-2 border border-gray-200 px-3 py-1.5 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <Edit className="w-3.5 h-3.5" />
            Upravit
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-500">Detail záznamu</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {record.employees && (
            <>
              {record.employees.position && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Pozice</span>
                  <span className="text-sm font-medium text-gray-900">{record.employees.position}</span>
                </div>
              )}
              {record.employees.department && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Oddělení</span>
                  <span className="text-sm font-medium text-gray-900">{record.employees.department}</span>
                </div>
              )}
            </>
          )}
          {record.hours_worked && (
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Odpracováno</span>
              <span className="text-sm font-semibold text-gray-900">{record.hours_worked} hodin</span>
            </div>
          )}
          {record.start_time && (
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Příchod</span>
              <span className="text-sm font-medium text-gray-900">{record.start_time}</span>
            </div>
          )}
          {record.end_time && (
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Odchod</span>
              <span className="text-sm font-medium text-gray-900">{record.end_time}</span>
            </div>
          )}
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Schváleno</span>
            <div className="flex items-center gap-1">
              {record.is_approved ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-medium text-green-700">Ano</span>
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-500">Ne</span>
                </>
              )}
            </div>
          </div>
          {record.approved_at && (
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Datum schválení</span>
              <span className="text-sm font-medium text-gray-900">
                {new Date(record.approved_at).toLocaleDateString('cs-CZ')}
              </span>
            </div>
          )}
          {record.notes && (
            <div className="pt-2 border-t border-gray-100">
              <p className="text-xs text-gray-400 mb-1">Poznámky</p>
              <p className="text-sm text-gray-700">{record.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}