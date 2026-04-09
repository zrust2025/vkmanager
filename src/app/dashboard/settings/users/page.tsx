import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Users, Plus } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'

const roleLabels: Record<string, string> = {
  admin: 'Admin',
  spravce: 'Správce',
  dispecink: 'Dispečink',
  projekt_manazer: 'Projekt manažer',
  coordinator: 'Koordinátor',
  udrzbar: 'Údržbář',
  najemnik: 'Nájemník',
  viewer: 'Viewer',
}

const roleColors: Record<string, string> = {
  admin: 'bg-red-100 text-red-700',
  spravce: 'bg-purple-100 text-purple-700',
  dispecink: 'bg-blue-100 text-blue-700',
  projekt_manazer: 'bg-indigo-100 text-indigo-700',
  coordinator: 'bg-teal-100 text-teal-700',
  udrzbar: 'bg-amber-100 text-amber-700',
  najemnik: 'bg-green-100 text-green-700',
  viewer: 'bg-gray-100 text-gray-600',
}

export default async function UsersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .order('display_name')

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Uživatelé</h1>
          <p className="text-sm text-gray-500 mt-1">{profiles?.length ?? 0} uživatelů celkem</p>
        </div>
      </div>

      {!profiles || profiles.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium">Zatím žádní uživatelé</p>
        </div>
      ) : (
        <div className="space-y-2">
          {profiles.map(p => (
            <Link key={p.id} href={`/dashboard/settings/users/${p.id}`}>
              <Card className="hover:shadow-sm transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-medium text-gray-600">
                          {(p.display_name || p.email)?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{p.display_name || p.email}</p>
                        <p className="text-xs text-gray-500">{p.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {p.position && (
                        <span className="text-xs text-gray-400">{p.position}</span>
                      )}
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${roleColors[p.user_role] ?? 'bg-gray-100 text-gray-600'}`}>
                        {roleLabels[p.user_role] ?? p.user_role}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${p.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {p.is_active ? 'Aktivní' : 'Neaktivní'}
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
