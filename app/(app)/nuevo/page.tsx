import { createClient } from '@/lib/supabase'
import NuevoContratoForm from '@/components/contrato/NuevoContratoForm'

export default async function NuevoPage() {
  const supabase = createClient()
  const { data: combos } = await supabase
    .from('combos')
    .select('*')
    .eq('activo', true)
    .order('tipo')
    .order('precio')

  return <NuevoContratoForm combos={combos ?? []} />
}
