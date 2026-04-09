'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowRight, FileText, XCircle } from 'lucide-react'

const statusLabels: Record<string, string> = {
  nova: 'Nová',
  probihajici: 'Probíhající',
  pripravena: 'Připravena k nabídce',
  zamitnuta: 'Zamítnuta',
  dokoncena: 'Dokončena',
}

export default function InquiryActions({
  inquiryId,
  requestId,
  currentStatus,
  userEmail,
}: {
  inquiryId: string
  requestId: string | null
  currentStatus: string
  userEmail: string
}) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState<string | null>(null)

  const changeStatus = async (newStatus: string) => {
    setLoading(newStatus)
    const { error } = await supabase
      .from('inquiries_extended')
      .update({ status: newStatus })
      .eq('id', inquiryId)
    if (!error) router.refresh()
    else alert('Chyba: ' + error.message)
    setLoading(null)
  }

  const createQuote = async () => {
    setLoading('quote')
    const quoteNumber = `NAB-${Date.now().toString().slice(-6)}`
    const { data: inq } = await supabase
      .from('inquiries_extended')
      .select('title')
      .eq('id', inquiryId)
      .single()

    const { data: quote, error } = await supabase
      .from('quotes')
      .insert({
        quote_number: quoteNumber,
        maintenance_request_id: requestId,
        description: inq?.title ?? 'Cenová nabídka',
        status: 'koncept',
        items: [],
        vat_rate: 21,
      })
      .select()
      .single()

    if (!error && quote) {
      await supabase
        .from('inquiries_extended')
        .update({ status: 'dokoncena' })
        .eq('id', inquiryId)

      if (requestId) {
        await supabase
          .from('maintenance_requests')
          .update({ status: 'nabidka' })
          .eq('id', requestId)
      }

      router.push(`/dashboard/quotes/${quote.id}`)
    } else {
      alert('Chyba: ' + error?.message)
    }
    setLoading(null)
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
          <ArrowRight className="w-4 h-4" />
          Akce
          <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
            {statusLabels[currentStatus] ?? currentStatus}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {currentStatus === 'nova' && (
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => changeStatus('probihajici')} disabled={!!loading}>
              {loading === 'probihajici' ? 'Měním...' : 'Zahájit sběr dat'}
            </Button>
            <Button size="sm" variant="outline" onClick={() => changeStatus('zamitnuta')} disabled={!!loading}
              className="text-red-500 border-red-200 hover:bg-red-50">
              <XCircle className="w-3.5 h-3.5 mr-1.5" />
              {loading === 'zamitnuta' ? 'Zamítám...' : 'Zamítnout'}
            </Button>
          </div>
        )}

        {currentStatus === 'probihajici' && (
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => changeStatus('pripravena')} disabled={!!loading}>
              {loading === 'pripravena' ? 'Měním...' : 'Data sebrána — připravit nabídku'}
            </Button>
            <Button size="sm" variant="outline" onClick={() => changeStatus('zamitnuta')} disabled={!!loading}
              className="text-red-500 border-red-200 hover:bg-red-50">
              <XCircle className="w-3.5 h-3.5 mr-1.5" />
              {loading === 'zamitnuta' ? 'Zamítám...' : 'Zamítnout'}
            </Button>
          </div>
        )}

        {currentStatus === 'pripravena' && (
          <div className="flex gap-2">
            <Button size="sm" onClick={createQuote} disabled={!!loading}>
              <FileText className="w-3.5 h-3.5 mr-1.5" />
              {loading === 'quote' ? 'Vytvářím...' : 'Vytvořit cenovou nabídku'}
            </Button>
            <Button size="sm" variant="outline" onClick={() => changeStatus('probihajici')} disabled={!!loading}>
              Vrátit do sběru dat
            </Button>
          </div>
        )}

        {(currentStatus === 'dokoncena' || currentStatus === 'zamitnuta') && (
          <p className="text-sm text-gray-400">Poptávka je uzavřena.</p>
        )}
      </CardContent>
    </Card>
  )
}
