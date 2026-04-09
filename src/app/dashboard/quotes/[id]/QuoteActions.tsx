'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowRight, CheckCircle2, XCircle, Wrench } from 'lucide-react'

export default function QuoteActions({
  quoteId,
  requestId,
  currentStatus,
}: {
  quoteId: string
  requestId: string | null
  currentStatus: string
}) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState<string | null>(null)

  const changeStatus = async (newStatus: string) => {
    setLoading(newStatus)
    const { error } = await supabase
      .from('quotes')
      .update({ status: newStatus })
      .eq('id', quoteId)
    if (!error) {
      if (requestId) {
        await supabase
          .from('maintenance_requests')
          .update({ status: newStatus === 'schvalena' ? 'schvaleno' : newStatus === 'zamitnuta' ? 'novy' : 'nabidka' })
          .eq('id', requestId)
      }
      router.refresh()
    } else alert('Chyba: ' + error.message)
    setLoading(null)
  }

  const createWorkOrder = async () => {
    setLoading('work_order')
    const orderNumber = `WO-${Date.now().toString().slice(-6)}`
    const { data: quote } = await supabase
      .from('quotes')
      .select('description, tenant_id, tenant_name, total_with_vat')
      .eq('id', quoteId)
      .single()

    const { error } = await supabase.from('work_orders').insert({
      order_number: orderNumber,
      maintenance_request_id: requestId,
      work_description: quote?.description,
      tenant_id: quote?.tenant_id,
      status: 'otevreny',
      invoice_total_with_vat: quote?.total_with_vat,
    })

    if (!error) {
      await supabase.from('quotes').update({ status: 'schvalena' }).eq('id', quoteId)
      if (requestId) {
        await supabase
          .from('maintenance_requests')
          .update({ status: 'v_reseni' })
          .eq('id', requestId)
      }
      router.refresh()
    } else alert('Chyba: ' + error.message)
    setLoading(null)
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
          <ArrowRight className="w-4 h-4" />
          Akce nabídky
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {currentStatus === 'koncept' && (
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => changeStatus('odeslana')} disabled={!!loading}>
              {loading === 'odeslana' ? 'Odesílám...' : 'Odeslat klientovi'}
            </Button>
          </div>
        )}

        {currentStatus === 'odeslana' && (
          <div className="space-y-2">
            <p className="text-xs text-gray-500">Nabídka odeslána klientovi. Čeká na schválení.</p>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => changeStatus('schvalena')} disabled={!!loading}
                className="bg-green-600 hover:bg-green-700 text-white">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                {loading === 'schvalena' ? 'Schvaluji...' : 'Schválit'}
              </Button>
              <Button size="sm" variant="outline" onClick={() => changeStatus('zamitnuta')} disabled={!!loading}
                className="text-red-500 border-red-200 hover:bg-red-50">
                <XCircle className="w-3.5 h-3.5 mr-1.5" />
                {loading === 'zamitnuta' ? 'Zamítám...' : 'Zamítnout'}
              </Button>
            </div>
          </div>
        )}

        {currentStatus === 'schvalena' && (
          <div className="space-y-2">
            <p className="text-xs text-gray-500">Nabídka schválena. Vytvoř zakázku.</p>
            <Button size="sm" onClick={createWorkOrder} disabled={!!loading}>
              <Wrench className="w-3.5 h-3.5 mr-1.5" />
              {loading === 'work_order' ? 'Vytvářím...' : 'Vytvořit zakázku'}
            </Button>
          </div>
        )}

        {currentStatus === 'zamitnuta' && (
          <div className="flex gap-2">
            <p className="text-xs text-gray-500 mr-2">Nabídka zamítnuta.</p>
            <Button size="sm" variant="outline" onClick={() => changeStatus('koncept')} disabled={!!loading}>
              Vrátit do konceptu
            </Button>
          </div>
        )}

        {currentStatus === 'vyprela' && (
          <div className="flex gap-2">
            <p className="text-xs text-gray-500 mr-2">Nabídka vypršela.</p>
            <Button size="sm" variant="outline" onClick={() => changeStatus('koncept')} disabled={!!loading}>
              Obnovit jako koncept
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
