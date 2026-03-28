import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Settings, Database, Users, Tag } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

const sections = [
  {
    title: 'Kategorie údržby',
    description: 'Správa kategorií požadavků na údržbu',
    href: '/dashboard/settings/maintenance-categories',
    icon: Tag,
  },
  {
    title: 'Typy work orderů',
    description: 'Správa typů pracovních příkazů',
    href: '/dashboard/settings/work-order-types',
    icon: Database,
  },
  {
    title: 'Kategorie majetku',
    description: 'Správa kategorií skladových položek',
    href: '/dashboard/settings/asset-categories',
    icon: Database,
  },
  {
    title: 'Uživatelé',
    description: 'Správa uživatelů a jejich rolí',
    href: '/dashboard/settings/users',
    icon: Users,
  },
  {
    title: 'Systémová nastavení',
    description: 'DPH, měna, název firmy',
    href: '/dashboard/settings/system',
    icon: Settings,
  },
]

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Nastavení</h1>
        <p className="text-sm text-gray-500 mt-1">Správa systému a číselníků</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {sections.map((s) => {
          const Icon = s.icon
          return (
            <Link key={s.href} href={s.href}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <Icon className="w-4 h-4 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{s.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{s.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}