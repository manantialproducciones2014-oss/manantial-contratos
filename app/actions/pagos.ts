'use server'

import { createClient } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'

export async function agregarPago(data: {
  contrato_id: string
  fecha: string
  monto: number
  metodo: string
  anotacion: string
}) {
  const supabase = createClient()
  const { error } = await supabase.from('pagos').insert(data)
  if (error) throw new Error(error.message)
  revalidatePath(`/contratos/${data.contrato_id}`)
}

export async function eliminarPago(id: string, contrato_id: string) {
  const supabase = createClient()
  const { error } = await supabase.from('pagos').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath(`/contratos/${contrato_id}`)
}
