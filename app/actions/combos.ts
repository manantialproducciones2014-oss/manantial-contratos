'use server'

import { createClient } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'

type ComboData = {
  nombre: string
  tipo: string
  precio: number
  cuotas_cantidad: number
  cuotas_monto: number
  servicios: string[]
}

export async function createCombo(data: ComboData) {
  const supabase = createClient()
  const { error } = await supabase.from('combos').insert(data)
  if (error) throw new Error(error.message)
  revalidatePath('/combos')
}

export async function updateCombo(id: string, data: ComboData) {
  const supabase = createClient()
  const { error } = await supabase.from('combos').update(data).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/combos')
}

export async function toggleCombo(id: string, activo: boolean) {
  const supabase = createClient()
  const { error } = await supabase.from('combos').update({ activo }).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/combos')
}
