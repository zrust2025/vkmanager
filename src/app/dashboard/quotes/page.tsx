import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { FileText, Plus } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'

const statusColors: Record<string, string> = {
  koncept: 'bg-gray-100 text-gray-600',
  odeslana: 'bg-blue-100 text-blue-700',
  schvalena: 'bg-green-100 text-green-700',
  zamitnuta: 'bg-red-100 text-red-700',
  vyprela: 'bg-amber-100 text-amber-700',
}

const statusLabels: Record<string, string> = {
  koncept: 'Koncept',
  odeslana: 'Odeslaná',
  schvalena: 'Schválená',
  zamitnuta: 'Zamítnutá',
  vyprela: 'Vypršela',
}

export default async function QuotesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: quotes } = await supabase
    .from('quotes')
    .select('*, tenants(full_name, company)')
    .order('created_at', { ascending: false })

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Cenové nabídky</h1>
          <p className="text-sm text-gray-500 mt-1">{quotes?.length ?? 0} nabídek celkem</p>
        </div>
        <Link
          href="/dashboard/quotes/new"
          className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nová nabídka
        </Link>
      </div>

      {!quotes || quotes.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium">Zatím žádné nabídky</p>
          <p className="text-xs mt-1">Nabídky vznikají z poptávek nebo je lze vytvořit ručně</p>
        </div>
      ) : (
        <div className="space-y-2">
          {quotes.map(q => (
            <Link key={q.id} href={`/dashboard/quotes/${q.id}`}>
              <Card className="hover:shadow-sm transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-gray-400">{q.quote_number}</span>
                      </div>
                      <p className="font-medium text-gray-900 truncate mt-0.5">
                        {q.description || 'Cenová nabídka'}
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        {q.tenants && (
                          <span className="text-xs text-gray-500">
                            {(q.tenants as any).company || (q.tenants as any).full_name}
                          </span>
                        )}
                        <span className="text-xs text-gray-400">
                          {new Date(q.created_at).toLocaleDateString('cs-CZ')}
                        </span>
                        {q.valid_until && (
                          <span className="text-xs text-gray-400">
                            Platná do: {new Date(q.valid_until).toLocaleDateString('cs-CZ')}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      {q.total_with_vat > 0 && (
                        <span className="text-sm font-semibold text-gray-900">
                          {Number(q.total_with_vat).toLocaleString('cs-CZ')} Kč
                        </span>
                      )}
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[q.status] ?? 'bg-gray-100 text-gray-600'}`}>
                        {statusLabels[q.status] ?? q.status}
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
