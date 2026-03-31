'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Clock, Search, CheckCircle2, XCircle } from 'lucide-react'
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

export default function AttendanceClient({
  attendance,
  employees,
  userEmail,
}: {
  attendance: any[]
  employees: any[]
  userEmail: string
}) {
  const [search, setSearch] = useState('')
  const [filterEmployee, setFilterEmployee] = useState('all')
  const [filterType, setFilterType] = useState('all')
  const [filterMonth, setFilterMonth] = useState('')

  const filtered = attendance.filter(a => {
    const emp = a.employees?.full_name ?? a.user_email ?? ''
    const matchSearch = !search || emp.toLowerCase().includes(search.toLowerCase())
    const matchEmployee = filterEmployee === 'all' || a.employee_id === filterEmployee
    const matchType = filterType === 'all' || a.type === filterType
    const matchMonth = !filterMonth || a.date?.startsWith(filterMonth)
    return matchSearch && matchEmployee && matchType && matchMonth
  })

  const totalHours = filtered
    .filter(a => a.type === 'prace')
    .reduce((s, a) => s + (a.hours_worked || 0), 0)

  const grouped = filtered.reduce((acc: Record<string, any[]>, a) => {
    const month = a.date?.slice(0, 7) ?? 'unknown'
    if (!acc[month]) acc[month] = []
    acc[month].push(a)
    return acc
  }, {})

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Hledat zaměstnance..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterEmployee} onValueChange={setFilterEmployee}>
          <SelectTrigger><SelectValue placeholder="Všichni zaměstnanci" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Všichni zaměstnanci</SelectItem>
            {employees.map(e => (
              <SelectItem key={e.id} value={e.id}>{e.full_name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger><SelectValue placeholder="Všechny typy" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Všechny typy</SelectItem>
            {Object.entries(typeLabels).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          type="month"
          value={filterMonth}
          onChange={e => setFilterMonth(e.target.value)}
        />
      </div>

      <div className="flex items-center gap-4 text-sm text-gray-500">
        <span>{filtered.length} záznamů</span>
        {(filterType === 'all' || filterType === 'prace') && (
          <span className="font-medium text-gray-900">{totalHours.toFixed(1)} odpracovaných hodin</span>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Clock className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium">Žádné záznamy</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped)
            .sort(([a], [b]) => b.localeCompare(a))
            .map(([month, records]) => (
              <div key={month}>
                <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
                  {new Date(month + '-01').toLocaleDateString('cs-CZ', { month: 'long', year: 'numeric' })}
                  {' '}({records.length} záznamů · {records.filter(r => r.type === 'prace').reduce((s, r) => s + (r.hours_worked || 0), 0).toFixed(1)} hod)
                </h2>
                <div className="space-y-2">
                  {records
                    .sort((a, b) => b.date.localeCompare(a.date))
                    .map(a => (
                      <Link key={a.id} href={`/dashboard/attendance/${a.id}`}>
                        <div className="bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-shadow cursor-pointer p-4">
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900">
                                {a.employees?.full_name ?? a.user_email ?? 'Neznámý'}
                              </p>
                              <div className="flex items-center gap-3 mt-1">
                                <span className="text-xs text-gray-500">
                                  {new Date(a.date).toLocaleDateString('cs-CZ', { weekday: 'short', day: 'numeric', month: 'numeric' })}
                                </span>
                                {a.hours_worked && (
                                  <span className="text-xs text-gray-500">{a.hours_worked} hod</span>
                                )}
                                {a.start_time && a.end_time && (
                                  <span className="text-xs text-gray-400">{a.start_time} — {a.end_time}</span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeColors[a.type] ?? 'bg-gray-100 text-gray-600'}`}>
                                {typeLabels[a.type] ?? a.type}
                              </span>
                              {a.is_approved ? (
                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                              ) : (
                                <XCircle className="w-4 h-4 text-gray-300" />
                              )}
                            </div>
                          </div>
                          {a.notes && (
                            <p className="text-xs text-gray-400 mt-2 truncate">{a.notes}</p>
                          )}
                        </div>
                      </Link>
                    ))}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  )
}