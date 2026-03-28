import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { ArrowLeft, Edit, Mail, Phone, Briefcase, Calendar } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

const workGroupLabels: Record<string, string> = {
  management: 'Management',
  office: 'Administrativa',
  maintenance: 'Údržba — interní',
  maintenance_external: 'Údržba — externí',
  other: 'Jiné',
}

const contractLabels: Record<string, string> = {
  HPP: 'HPP — hlavní pracovní poměr',
  DPP: 'DPP — dohoda o provedení práce',
  DPC: 'DPČ — dohoda o pracovní činnosti',
  'OSVČ': 'OSVČ',
}

export default async function EmployeeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: employee } = await supabase
    .from('employees')
    .select('*')
    .eq('id', id)
    .single()

  if (!employee) notFound()

  const { data: trainings } = await supabase
    .from('employee_trainings')
    .select('*')
    .eq('employee_id', id)
    .order('completed_date', { ascending: false })

  const { data: attendance } = await supabase
    .from('attendance')
    .select('*')
    .eq('employee_id', id)
    .order('date', { ascending: false })
    .limit(10)

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/hr" className="text-gray-400 hover:text-gray-600">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">{employee.full_name}</h1>
            {employee.position && (
              <p className="text-sm text-gray-500 mt-0.5">{employee.position}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-sm px-3 py-1 rounded-full font-medium ${employee.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
            {employee.is_active ? 'Aktivní' : 'Neaktivní'}
          </span>
          <Link
            href={`/dashboard/hr/${id}/edit`}
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
            <CardTitle className="text-sm font-medium text-gray-500">Osobní informace</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {employee.email && (
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-900">{employee.email}</span>
              </div>
            )}
            {employee.phone && (
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-900">{employee.phone}</span>
              </div>
            )}
            {employee.employee_number && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Osobní číslo</span>
                <span className="text-sm font-medium text-gray-900">{employee.employee_number}</span>
              </div>
            )}
            {employee.hire_date && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Datum nástupu</span>
                <span className="text-sm font-medium text-gray-900">
                  {new Date(employee.hire_date).toLocaleDateString('cs-CZ')}
                </span>
              </div>
            )}
            {employee.department && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Oddělení</span>
                <span className="text-sm font-medium text-gray-900">{employee.department}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Pracovní podmínky</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Pracovní skupina</span>
              <span className="text-sm font-medium text-gray-900">
                {workGroupLabels[employee.work_group] ?? employee.work_group}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Typ smlouvy</span>
              <span className="text-sm font-medium text-gray-900">
                {contractLabels[employee.contract_type] ?? employee.contract_type}
              </span>
            </div>
            {employee.base_salary > 0 && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Základní mzda</span>
                <span className="text-sm font-medium text-gray-900">
                  {Number(employee.base_salary).toLocaleString('cs-CZ')} Kč
                </span>
              </div>
            )}
            {employee.hourly_rate > 0 && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Hodinová sazba</span>
                <span className="text-sm font-medium text-gray-900">
                  {Number(employee.hourly_rate).toLocaleString('cs-CZ')} Kč/hod
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Dovolená</span>
              <span className="text-sm font-medium text-gray-900">{employee.vacation_days_budget} dní</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Home office</span>
              <span className="text-sm font-medium text-gray-900">{employee.home_office_days_budget} dní</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Kapacita/měsíc</span>
              <span className="text-sm font-medium text-gray-900">{employee.monthly_hours_capacity} hod</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {trainings && trainings.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Školení a certifikáty</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {trainings.map(t => (
                <div key={t.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{t.training_name}</p>
                    {t.completed_date && (
                      <p className="text-xs text-gray-400">
                        Absolvováno: {new Date(t.completed_date).toLocaleDateString('cs-CZ')}
                      </p>
                    )}
                  </div>
                  {t.expiry_date && (
                    <span className={`text-xs px-2 py-0.5 rounded-full ${new Date(t.expiry_date) < new Date() ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                      Platnost do: {new Date(t.expiry_date).toLocaleDateString('cs-CZ')}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {attendance && attendance.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Poslední docházka</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {attendance.map(a => (
                <div key={a.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-900">
                      {new Date(a.date).toLocaleDateString('cs-CZ')}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{a.type}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {a.hours_worked && (
                      <span className="text-sm text-gray-600">{a.hours_worked} hod</span>
                    )}
                    <span className={`text-xs px-2 py-0.5 rounded-full ${a.is_approved ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                      {a.is_approved ? 'Schváleno' : 'Čeká'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {employee.notes && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Poznámky</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{employee.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}