import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Users, Plus, Phone, Mail, Briefcase } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'

const workGroupLabels: Record<string, string> = {
  management: 'Management',
  office: 'Administrativa',
  maintenance: 'Údržba',
  maintenance_external: 'Údržba ext.',
  other: 'Jiné',
}

const workGroupColors: Record<string, string> = {
  management: 'bg-purple-100 text-purple-700',
  office: 'bg-blue-100 text-blue-700',
  maintenance: 'bg-amber-100 text-amber-700',
  maintenance_external: 'bg-orange-100 text-orange-700',
  other: 'bg-gray-100 text-gray-600',
}

export default async function HRPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: employees } = await supabase
    .from('employees')
    .select('*')
    .order('full_name')

  const active = employees?.filter(e => e.is_active) ?? []
  const inactive = employees?.filter(e => !e.is_active) ?? []

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">HR & Zaměstnanci</h1>
          <p className="text-sm text-gray-500 mt-1">{active.length} aktivních zaměstnanců</p>
        </div>
        <Link
          href="/dashboard/hr/new"
          className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Přidat zaměstnance
        </Link>
      </div>

      {!employees || employees.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium">Zatím žádní zaměstnanci</p>
          <p className="text-xs mt-1">Přidej prvního zaměstnance kliknutím na tlačítko výše</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {active.map((emp) => (
              <Link key={emp.id} href={`/dashboard/hr/${emp.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <p className="font-medium text-gray-900">{emp.full_name}</p>
                        {emp.position && (
                          <p className="text-xs text-gray-500 mt-0.5">{emp.position}</p>
                        )}
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${workGroupColors[emp.work_group] ?? 'bg-gray-100 text-gray-600'}`}>
                        {workGroupLabels[emp.work_group] ?? emp.work_group}
                      </span>
                    </div>

                    <div className="space-y-1 mt-3">
                      {emp.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-500 truncate">{emp.email}</span>
                        </div>
                      )}
                      {emp.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-500">{emp.phone}</span>
                        </div>
                      )}
                      {emp.contract_type && (
                        <div className="flex items-center gap-2">
                          <Briefcase className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-500">{emp.contract_type}</span>
                        </div>
                      )}
                    </div>

                    {emp.department && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <span className="text-xs text-gray-400">{emp.department}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {inactive.length > 0 && (
            <div>
              <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-3">
                Neaktivní ({inactive.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {inactive.map((emp) => (
                  <Link key={emp.id} href={`/dashboard/hr/${emp.id}`}>
                    <Card className="hover:shadow-sm transition-shadow cursor-pointer opacity-60">
                      <CardContent className="p-4">
                        <p className="font-medium text-gray-700">{emp.full_name}</p>
                        {emp.position && (
                          <p className="text-xs text-gray-400 mt-0.5">{emp.position}</p>
                        )}
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