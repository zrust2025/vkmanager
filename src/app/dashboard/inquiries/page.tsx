import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { FileSearch, Plus } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'

const statusColors: Record<string, string> = {
  nova: 'bg-blue-100 text-blue-700',
  probihajici: 'bg-amber-100 text-amber-700',
  pripravena: 'bg-teal-100 text-teal-700',
  zamitnuta: 'bg-red-100 text-red-700',
  dokoncena: 'bg-green-100 text-green-700',
}

const statusLabels: Record<string, string> = {
  nova: 'Nová',
  probihajici: 'Probíhající',
  pripravena: 'Připravena k nabídce',
  zamitnuta: 'Zamítnuta',
  dokoncena: 'Dokončena',
}

export default async function InquiriesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: inquiries } = await supabase
    .from('inquiries_extended')
    .select('*, maintenance_requests(title), profiles!assigned_to_id(display_name)')
    .order('created_at', { ascending: false })

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Poptávky</h1>
          <p className="text-sm text-gray-500 mt-1">{inquiries?.length ?? 0} poptávek celkem</p>
        </div>
        <Link
          href="/dashboard/inquiries/new"
          className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nová poptávka
        </Link>
      </div>

      {!inquiries || inquiries.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <FileSearch className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium">Zatím žádné poptávky</p>
          <p className="text-xs mt-1">Poptávky vznikají z požadavků na údržbu nebo je lze vytvořit ručně</p>
        </div>
      ) : (
        <div className="space-y-2">
          {inquiries.map(inq => (
            <Link key={inq.id} href={`/dashboard/inquiries/${inq.id}`}>
              <Card className="hover:shadow-sm transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{inq.title}</p>
                      <div className="flex items-center gap-3 mt-1">
                        {inq.maintenance_requests && (
                          <span className="text-xs text-gray-400 truncate">
                            Z požadavku: {(inq.maintenance_requests as any).title}
                          </span>
                        )}
                        {inq.profiles && (
                          <span className="text-xs text-gray-500">
                            {(inq.profiles as any).display_name}
                          </span>
                        )}
                        <span className="text-xs text-gray-400">
                          {new Date(inq.created_at).toLocaleDateString('cs-CZ')}
                        </span>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${statusColors[inq.status] ?? 'bg-gray-100 text-gray-600'}`}>
                      {statusLabels[inq.status] ?? inq.status}
                    </span>
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
