'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import {
  LayoutDashboard, Building2, Wrench, ClipboardList, Package,
  Users, FolderKanban, FileText, Car, ShoppingCart, Calendar,
  MessageSquare, Settings, LogOut, ChevronRight, Clock
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/buildings', label: 'Budovy', icon: Building2 },
  { href: '/dashboard/maintenance', label: 'Údržba', icon: Wrench },
  { href: '/dashboard/work-orders', label: 'Pracovní příkazy', icon: ClipboardList },
  { href: '/dashboard/warehouse', label: 'Sklad', icon: Package },
  { href: '/dashboard/hr', label: 'HR & Docházka', icon: Users },
  { href: '/dashboard/projects', label: 'Projekty', icon: FolderKanban },
  { href: '/dashboard/tenants', label: 'Nájemníci', icon: FileText },
  { href: '/dashboard/orders', label: 'Objednávky', icon: ShoppingCart },
  { href: '/dashboard/vehicles', label: 'Vozidla', icon: Car },
  { href: '/dashboard/calendar', label: 'Kalendář', icon: Calendar },
  { href: '/dashboard/chat', label: 'Chat', icon: MessageSquare },
  { href: '/dashboard/settings', label: 'Nastavení', icon: Settings },
  { href: '/dashboard/attendance', label: 'Docházka', icon: Clock },

]

export default function Sidebar({ userEmail }: { userEmail: string }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen">
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-lg font-semibold text-gray-900">VK Manager</h1>
        <p className="text-xs text-gray-500 mt-0.5 truncate">{userEmail}</p>
      </div>

      <nav className="flex-1 overflow-y-auto py-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-2.5 text-sm transition-colors',
                isActive
                  ? 'bg-gray-100 text-gray-900 font-medium'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1">{item.label}</span>
              {isActive && <ChevronRight className="w-3 h-3" />}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-2 py-2 text-sm text-gray-600 hover:text-gray-900 w-full rounded-md hover:bg-gray-50 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Odhlásit se</span>
        </button>
      </div>
    </aside>
  )
}