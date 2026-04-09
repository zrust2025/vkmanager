'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'

export default function UserRoleEditor({
  profileId,
  currentRole,
  currentIsActive,
  roleLabels,
  roleColors,
}: {
  profileId: string
  currentRole: string
  currentIsActive: boolean
  roleLabels: Record<string, string>
  roleColors: Record<string, string>
}) {
  const router = useRouter()
  const supabase = createClient()
  const [role, setRole] = useState(currentRole)
  const [isActive, setIsActive] = useState(currentIsActive)
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = async () => {
    setLoading(true)
    const { error } = await supabase
      .from('profiles')
      .update({ user_role: role, is_active: isActive })
      .eq('id', profileId)

    if (!error) {
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
      router.refresh()
    } else {
      alert('Chyba: ' + error.message)
    }
    setLoading(false)
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-gray-500">Role a oprávnění</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Role uživatele</Label>
          <Select value={role} onValueChange={setRole}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.entries(roleLabels).map(([k, v]) => (
                <SelectItem key={k} value={k}>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${roleColors[k]}`}>{v}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-lg border border-gray-100 p-3 space-y-1">
          <p className="text-xs font-medium text-gray-700">Co tato role umí:</p>
          {role === 'admin' && <p className="text-xs text-gray-500">Plný přístup ke všemu — správa uživatelů, nastavení, všechny moduly</p>}
          {role === 'spravce' && <p className="text-xs text-gray-500">Správa budov, údržby, work orderů, nájemníků a projektů</p>}
          {role === 'dispecink' && <p className="text-xs text-gray-500">Přiřazování požadavků, work ordery, objednávky, přehled všeho</p>}
          {role === 'projekt_manazer' && <p className="text-xs text-gray-500">Správa projektů, schvalování objednávek</p>}
          {role === 'coordinator' && <p className="text-xs text-gray-500">Koordinace údržby, přehled požadavků a work orderů</p>}
          {role === 'udrzbar' && <p className="text-xs text-gray-500">Zobrazení a zadávání požadavků na údržbu, vlastní work ordery</p>}
          {role === 'najemnik' && <p className="text-xs text-gray-500">Zadávání požadavků na údržbu, přehled vlastních požadavků</p>}
          {role === 'viewer' && <p className="text-xs text-gray-500">Pouze čtení — žádné vytváření ani editace</p>}
        </div>

        <div className="flex items-center justify-between">
          <Label>Aktivní účet</Label>
          <Switch checked={isActive} onCheckedChange={setIsActive} />
        </div>

        <Button
          onClick={handleSave}
          disabled={loading || (role === currentRole && isActive === currentIsActive)}
          className="w-full"
        >
          {loading ? 'Ukládám...' : saved ? 'Uloženo!' : 'Uložit změny'}
        </Button>
      </CardContent>
    </Card>
  )
}
