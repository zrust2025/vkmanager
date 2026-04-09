import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import UserRoleEditor from './UserRoleEditor'

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

export default async function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single()

  if (!profile) notFound()

  return (
    <div className="p-6 space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/settings/users" className="text-gray-400 hover:text-gray-600">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            {profile.display_name || profile.email}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">{profile.email}</p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-500">Informace o uživateli</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {profile.full_name && (
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Celé jméno</span>
              <span className="text-sm font-medium text-gray-900">{profile.full_name}</span>
            </div>
          )}
          {profile.phone && (
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Telefon</span>
              <span className="text-sm font-medium text-gray-900">{profile.phone}</span>
            </div>
          )}
          {profile.position && (
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Pozice</span>
              <span className="text-sm font-medium text-gray-900">{profile.position}</span>
            </div>
          )}
          {profile.department && (
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Oddělení</span>
              <span className="text-sm font-medium text-gray-900">{profile.department}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Stav</span>
            <span className={`text-sm font-medium ${profile.is_active ? 'text-green-700' : 'text-gray-500'}`}>
              {profile.is_active ? 'Aktivní' : 'Neaktivní'}
            </span>
          </div>
          {profile.last_active_at && (
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Naposledy aktivní</span>
              <span className="text-sm font-medium text-gray-900">
                {new Date(profile.last_active_at).toLocaleDateString('cs-CZ')}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      <UserRoleEditor
        profileId={id}
        currentRole={profile.user_role}
        currentIsActive={profile.is_active}
        roleLabels={roleLabels}
        roleColors={roleColors}
      />
    </div>
  )
}
