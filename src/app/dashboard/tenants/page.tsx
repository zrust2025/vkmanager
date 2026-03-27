import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Users, Plus, Mail, Phone, Building2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'

const statusColors: Record<string, string> = {
  aktivni: 'bg-green-100 text-green-700',
  ukoncena: 'bg-gray-100 text-gray-500',
  pozastavena: 'bg-amber-100 text-amber-700',
  rozpracovana: 'bg-blue-100 text-blue-700',
}

const statusLabels: Record<string, string> = {
  aktivni: 'Aktivní',
  ukoncena: 'Ukončená',
  pozastavena: 'Pozastavená',
  rozpracovana: 'Rozpracovaná',
}

export default async function TenantsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: tenants } = await supabase
    .from('tenants')
    .select('*')
    .order('full_name')

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Nájemníci</h1>
          <p className="text-sm text-gray-500 mt-1">{tenants?.length ?? 0} nájemníků celkem</p>
        </div>
        <Link
          href="/dashboard/tenants/new"
          className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Přidat nájemníka
        </Link>
      </div>

      {!tenants || tenants.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium">Zatím žádní nájemníci</p>
          <p className="text-xs mt-1">Přidej prvního nájemníka kliknutím na tlačítko výše</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {tenants.map((t) => (
            <Link key={t.id} href={`/dashboard/tenants/${t.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{t.company || t.full_name}</p>
                      {t.company && (
                        <p className="text-xs text-gray-500 truncate">{t.full_name}</p>
                      )}
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${statusColors[t.lease_status] ?? 'bg-gray-100 text-gray-600'}`}>
                      {statusLabels[t.lease_status] ?? t.lease_status}
                    </span>
                  </div>
                  <div className="space-y-1">
                    {t.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-3 h-3 text-gray-400 flex-shrink-0" />
                        <span className="text-xs text-gray-500 truncate">{t.email}</span>
                      </div>
                    )}
                    {t.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-3 h-3 text-gray-400 flex-shrink-0" />
                        <span className="text-xs text-gray-500">{t.phone}</span>
                      </div>
                    )}
                    {t.ico && (
                      <div className="flex items-center gap-2">
                        <Building2 className="w-3 h-3 text-gray-400 flex-shrink-0" />
                        <span className="text-xs text-gray-500">IČO: {t.ico}</span>
                      </div>
                    )}
                  </div>
                  {t.lease_monthly_rent && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <span className="text-xs text-gray-500">Měsíční nájem: </span>
                      <span className="text-xs font-medium text-gray-700">
                        {Number(t.lease_monthly_rent).toLocaleString('cs-CZ')} Kč
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}