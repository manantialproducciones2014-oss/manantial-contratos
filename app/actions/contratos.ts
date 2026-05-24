'use server'

import { createClient } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

type ContratoInput = {
  tipo_evento: string
  combo_snapshot: Record<string, unknown> | null
  adicionales_snapshot: Record<string, unknown>[]
  total: number
  metodo_pago: string
  fecha: string
  cliente_nombre: string
  cliente_dni: string
  cliente_telefono: string
  cliente_email: string
  cliente_direccion: string
  cliente_localidad: string
  cliente_cp: string
  evento_nombre: string
  evento_fecha: string
  evento_lugar: string
  evento_direccion: string
  evento_duracion: string
  evento_invitados: string
  evento_horario_desde: string
  evento_horario_hasta: string
}

async function generarNumero(): Promise<string> {
  const year = new Date().getFullYear()
  const supabase = createClient()
  const { data } = await supabase
    .from('contratos')
    .select('numero')
    .like('numero', `${year}-%`)
    .order('numero', { ascending: false })
    .limit(1)

  if (!data || data.length === 0) return `${year}-001`
  const lastNum = parseInt(data[0].numero.split('-')[1])
  return `${year}-${String(lastNum + 1).padStart(3, '0')}`
}

export async function crearContrato(input: ContratoInput) {
  const supabase = createClient()
  const numero = await generarNumero()

  const { data, error } = await supabase
    .from('contratos')
    .insert({ numero, ...input })
    .select('id')
    .single()

  if (error) throw new Error(error.message)

  revalidatePath('/')
  redirect(`/contratos/${data.id}`)
}
