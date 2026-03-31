import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import AttendanceClient from './AttendanceClient'

export default async function AttendancePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: attendance } = await supabase
    .from('attendance')
    .select('*, employees(full_name)')
    .order('date', { ascending: false })
    .limit(100)

  const { data: employees } = await supabase
    .from('employees')
    .select('id, full_name')
    .eq('is_active', true)
    .order('full_name')

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Docházka</h1>
          <p className="text-sm text-gray-500 mt-1">Evidence pracovní doby zaměstnanců</p>
        </div>
        <Link
          href="/dashboard/attendance/new"
          className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Přidat záznam
        </Link>
      </div>
      <AttendanceClient
        attendance={attendance ?? []}
        employees={employees ?? []}
        userEmail={user.email ?? ''}
      />
    </div>
  )
}