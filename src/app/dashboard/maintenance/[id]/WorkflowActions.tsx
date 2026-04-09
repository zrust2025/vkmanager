'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowRight, ClipboardCheck, FileText, ShoppingCart, Wrench, AlertCircle } from 'lucide-react'

const statusLabels: Record<string, string> = {
  novy: 'Nový',
  prirazen: 'Přiřazen',
  k_posouzeni: 'K posouzení',
  v_reseni: 'V řešení',
  posouzeno: 'Posouzeno',
  poptavka: 'Poptávka',
  nabidka: 'Nabídka',
  schvaleno: 'Schváleno',
  ceka_na_material: 'Čeká na materiál',
  ceka_na_schvaleni: 'Čeká na schválení',
  dokoncen: 'Dokončen',
  zrusen: 'Zrušen',
}

export default function WorkflowActions({
  requestId,
  currentStatus,
  userEmail,
}: {
  requestId: string
  currentStatus: string
  userEmail: string
}) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState<string | null>(null)
  const [showAssessment, setShowAssessment] = useState(false)
  const [assessment, setAssessment] = useState({
    estimated_cost: '',
    estimated_hours: '',
    recommended_action: '',
    result_type: 'interni',
    result_notes: '',
  })

  const changeStatus = async (newStatus: string) => {
    setLoading(newStatus)
    const { error } = await supabase
      .from('maintenance_requests')
      .update({ status: newStatus })
      .eq('id', requestId)
    if (!error) router.refresh()
    else alert('Chyba: ' + error.message)
    setLoading(null)
  }

  const submitAssessment = async () => {
    setLoading('assessment')
    const { error: assessError } = await supabase
      .from('maintenance_assessments')
      .insert({
        request_id: requestId,
        assessor_email: userEmail,
        estimated_cost: assessment.estimated_cost ? parseFloat(assessment.estimated_cost) : null,
        estimated_hours: assessment.estimated_hours ? parseFloat(assessment.estimated_hours) : null,
        recommended_action: assessment.recommended_action,
        result_type: assessment.result_type,
        result_notes: assessment.result_notes,
      })

    if (assessError) { alert('Chyba: ' + assessError.message); setLoading(null); return }

    await supabase
      .from('maintenance_requests')
      .update({
        status: 'posouzeno',
        estimated_cost: assessment.estimated_cost ? parseFloat(assessment.estimated_cost) : null,
        estimated_hours: assessment.estimated_hours ? parseFloat(assessment.estimated_hours) : null,
      })
      .eq('id', requestId)

    setShowAssessment(false)
    router.refresh()
    setLoading(null)
  }

  const createWorkOrder = async () => {
    setLoading('work_order')
    const orderNumber = `WO-${Date.now().toString().slice(-6)}`
    const { data: request } = await supabase
      .from('maintenance_requests')
      .select('title, building_id, tenant_id, tenant_name')
      .eq('id', requestId)
      .single()

    const { error } = await supabase.from('work_orders').insert({
      order_number: orderNumber,
      maintenance_request_id: requestId,
      request_title: request?.title,
      tenant_id: request?.tenant_id,
      tenant_name: request?.tenant_name,
      status: 'otevreny',
      work_description: request?.title,
    })

    if (!error) {
      await supabase
        .from('maintenance_requests')
        .update({ status: 'v_reseni' })
        .eq('id', requestId)
      router.refresh()
    } else alert('Chyba: ' + error.message)
    setLoading(null)
  }

  const createInquiry = async () => {
    setLoading('inquiry')
    const { data: request } = await supabase
      .from('maintenance_requests')
      .select('title, description')
      .eq('id', requestId)
      .single()

    const { error } = await supabase.from('inquiries_extended').insert({
      request_id: requestId,
      title: request?.title ?? 'Nová poptávka',
      description: request?.description,
      status: 'nova',
      assigned_to_email: userEmail,
    })

    if (!error) {
      await supabase
        .from('maintenance_requests')
        .update({ status: 'poptavka' })
        .eq('id', requestId)
      router.refresh()
    } else alert('Chyba: ' + error.message)
    setLoading(null)
  }

  const createCustomerOrder = async () => {
    setLoading('customer_order')
    const orderNumber = `CO-${Date.now().toString().slice(-6)}`
    const { data: request } = await supabase
      .from('maintenance_requests')
      .select('title, tenant_id')
      .eq('id', requestId)
      .single()

    const { error } = await supabase.from('customer_orders').insert({
      order_number: orderNumber,
      tenant_id: request?.tenant_id,
      description: request?.title ?? 'Zákaznická objednávka',
      status: 'draft',
    })

    if (!error) {
      await supabase
        .from('maintenance_requests')
        .update({ status: 'v_reseni' })
        .eq('id', requestId)
      router.refresh()
    } else alert('Chyba: ' + error.message)
    setLoading(null)
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
          <ArrowRight className="w-4 h-4" />
          Workflow akce
          <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
            {statusLabels[currentStatus] ?? currentStatus}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">

        {/* Nový → k posouzení nebo přímé akce */}
        {(currentStatus === 'novy' || currentStatus === 'prirazen') && (
          <div className="space-y-2">
            <p className="text-xs text-gray-500">Co chceš s požadavkem dělat?</p>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={() => changeStatus('k_posouzeni')} disabled={!!loading}>
                <ClipboardCheck className="w-3.5 h-3.5 mr-1.5" />
                {loading === 'k_posouzeni' ? 'Odesílám...' : 'Poslat ke koordinátorovi'}
              </Button>
              <Button size="sm" variant="outline" onClick={createWorkOrder} disabled={!!loading}>
                <Wrench className="w-3.5 h-3.5 mr-1.5" />
                {loading === 'work_order' ? 'Vytvářím...' : 'Vytvořit zakázku rovnou'}
              </Button>
              <Button size="sm" variant="outline" onClick={createInquiry} disabled={!!loading}>
                <FileText className="w-3.5 h-3.5 mr-1.5" />
                {loading === 'inquiry' ? 'Vytvářím...' : 'Vytvořit poptávku'}
              </Button>
            </div>
          </div>
        )}

        {/* K posouzení → formulář posouzení */}
        {currentStatus === 'k_posouzeni' && (
          <div className="space-y-3">
            <p className="text-xs text-gray-500">Požadavek čeká na posouzení koordinátora.</p>
            {!showAssessment ? (
              <Button size="sm" onClick={() => setShowAssessment(true)}>
                <ClipboardCheck className="w-3.5 h-3.5 mr-1.5" />
                Zadat posouzení
              </Button>
            ) : (
              <div className="space-y-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-xs font-medium text-gray-700">Formulář posouzení</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Odhadovaná cena (Kč)</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={assessment.estimated_cost}
                      onChange={e => setAssessment(p => ({ ...p, estimated_cost: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Odhadovaný čas (hod)</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={assessment.estimated_hours}
                      onChange={e => setAssessment(p => ({ ...p, estimated_hours: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Doporučený postup</Label>
                  <Textarea
                    placeholder="Popis doporučeného řešení..."
                    rows={2}
                    value={assessment.recommended_action}
                    onChange={e => setAssessment(p => ({ ...p, recommended_action: e.target.value }))}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Výsledek posouzení</Label>
                  <Select value={assessment.result_type} onValueChange={v => setAssessment(p => ({ ...p, result_type: v }))}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="interni">Interní zakázka</SelectItem>
                      <SelectItem value="zakaznicka">Zákaznická objednávka</SelectItem>
                      <SelectItem value="poptavka">Potřebuje poptávku</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Poznámky k posouzení</Label>
                  <Textarea
                    placeholder="Doplňující poznámky..."
                    rows={2}
                    value={assessment.result_notes}
                    onChange={e => setAssessment(p => ({ ...p, result_notes: e.target.value }))}
                  />
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={submitAssessment} disabled={!!loading}>
                    {loading === 'assessment' ? 'Ukládám...' : 'Uložit posouzení'}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setShowAssessment(false)}>Zrušit</Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Posouzeno → akce dle výsledku */}
        {currentStatus === 'posouzeno' && (
          <div className="space-y-2">
            <p className="text-xs text-gray-500">Posouzení dokončeno. Zvol další krok:</p>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={createWorkOrder} disabled={!!loading}>
                <Wrench className="w-3.5 h-3.5 mr-1.5" />
                {loading === 'work_order' ? 'Vytvářím...' : 'Interní zakázka'}
              </Button>
              <Button size="sm" variant="outline" onClick={createCustomerOrder} disabled={!!loading}>
                <ShoppingCart className="w-3.5 h-3.5 mr-1.5" />
                {loading === 'customer_order' ? 'Vytvářím...' : 'Zákaznická objednávka'}
              </Button>
              <Button size="sm" variant="outline" onClick={createInquiry} disabled={!!loading}>
                <FileText className="w-3.5 h-3.5 mr-1.5" />
                {loading === 'inquiry' ? 'Vytvářím...' : 'Vytvořit poptávku'}
              </Button>
            </div>
          </div>
        )}

        {/* Poptávka */}
        {currentStatus === 'poptavka' && (
          <div className="space-y-2">
            <p className="text-xs text-gray-500">Probíhá sběr dat pro poptávku.</p>
            <Button size="sm" variant="outline" onClick={() => changeStatus('nabidka')} disabled={!!loading}>
              <FileText className="w-3.5 h-3.5 mr-1.5" />
              {loading === 'nabidka' ? 'Přesouvám...' : 'Přesunout na nabídku'}
            </Button>
          </div>
        )}

        {/* Nabídka */}
        {currentStatus === 'nabidka' && (
          <div className="space-y-2">
            <p className="text-xs text-gray-500">Cenová nabídka připravena, čeká na schválení.</p>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => changeStatus('schvaleno')} disabled={!!loading}
                className="bg-green-600 hover:bg-green-700 text-white">
                {loading === 'schvaleno' ? 'Schvaluji...' : 'Schválit nabídku'}
              </Button>
              <Button size="sm" variant="outline" onClick={() => changeStatus('poptavka')} disabled={!!loading}>
                Vrátit do poptávky
              </Button>
            </div>
          </div>
        )}

        {/* Schváleno → work order */}
        {currentStatus === 'schvaleno' && (
          <div className="space-y-2">
            <p className="text-xs text-gray-500">Nabídka schválena. Vytvoř zakázku.</p>
            <Button size="sm" onClick={createWorkOrder} disabled={!!loading}>
              <Wrench className="w-3.5 h-3.5 mr-1.5" />
              {loading === 'work_order' ? 'Vytvářím...' : 'Vytvořit zakázku'}
            </Button>
          </div>
        )}

        {/* Dokončeno / Zrušeno */}
        {(currentStatus === 'dokoncen' || currentStatus === 'zrusen') && (
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <AlertCircle className="w-4 h-4" />
            Požadavek je uzavřen
          </div>
        )}

        {/* V řešení */}
        {currentStatus === 'v_reseni' && (
          <div className="space-y-2">
            <p className="text-xs text-gray-500">Zakázka byla vytvořena, probíhají práce.</p>
            <Button size="sm" variant="outline" onClick={() => changeStatus('dokoncen')} disabled={!!loading}>
              {loading === 'dokoncen' ? 'Uzavírám...' : 'Označit jako dokončen'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
