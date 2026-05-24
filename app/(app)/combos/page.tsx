import { createClient } from '@/lib/supabase'
import CombosList from '@/components/contrato/CombosList'

export default async function CombosPage() {
  const supabase = createClient()
  const { data: combos } = await supabase
    .from('combos')
    .select('*')
    .order('tipo')
    .order('precio')

  return <CombosList combos={combos ?? []} />
}
