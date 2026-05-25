'use server'

import { createClient } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'

export type GaleriaItem = {
  id: string
  titulo: string
  categoria: 'xv' | 'boda' | 'empresarial'
  tipo_contenido: 'foto' | 'resumen' | 'plataforma360'
  fecha: string
  contenido_url: string
  descripcion: string | null
  orden: number
  activo: boolean
  created_at: string
}

type CreateGaleriaInput = {
  titulo: string
  categoria: 'xv' | 'boda' | 'empresarial'
  tipo_contenido: 'foto' | 'resumen' | 'plataforma360'
  contenido_url: string
  fecha: string
  descripcion?: string
}

export async function crearGaleriaItem(input: CreateGaleriaInput) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('galeria')
    .insert({
      titulo: input.titulo,
      categoria: input.categoria,
      tipo_contenido: input.tipo_contenido,
      fecha: input.fecha,
      contenido_url: input.contenido_url,
      descripcion: input.descripcion || null,
      activo: true,
    })
    .select('id')
    .single()

  if (error) throw new Error(error.message)

  revalidatePath('/portfolio')
  revalidatePath('/(app)/galeria')
  return data
}

export async function obtenerGaleriaActiva(categoria?: string): Promise<GaleriaItem[]> {
  const supabase = createClient()

  let query = supabase
    .from('galeria')
    .select('*')
    .eq('activo', true)
    .order('orden', { ascending: true })
    .order('created_at', { ascending: false })

  if (categoria) {
    query = query.eq('categoria', categoria)
  }

  const { data, error } = await query

  if (error) throw new Error(error.message)

  return data || []
}

export async function actualizarGaleriaItem(
  id: string,
  updates: Partial<CreateGaleriaInput> & { orden?: number; activo?: boolean }
) {
  const supabase = createClient()

  const { error } = await supabase.from('galeria').update(updates).eq('id', id)

  if (error) throw new Error(error.message)

  revalidatePath('/portfolio')
  revalidatePath('/(app)/galeria')
}

export async function eliminarGaleriaItem(id: string) {
  const supabase = createClient()

  const { error } = await supabase.from('galeria').delete().eq('id', id)

  if (error) throw new Error(error.message)

  revalidatePath('/portfolio')
  revalidatePath('/(app)/galeria')
}

export async function obtenerTodasLasGalerias(): Promise<GaleriaItem[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('galeria')
    .select('*')
    .order('orden', { ascending: true })
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)

  return data || []
}
