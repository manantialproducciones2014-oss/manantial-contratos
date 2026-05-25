'use server'

import { createClient } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'
import { google } from 'googleapis'

export type GaleriaItem = {
  id: string
  titulo: string
  categoria: 'xv' | 'boda' | 'empresarial'
  fotos: string[]
  fecha: string
  descripcion: string | null
  orden: number
  activo: boolean
  created_at: string
}

type CreateGaleriaInput = {
  titulo: string
  categoria: 'xv' | 'boda' | 'empresarial'
  fotos: string[]
  fecha: string
  descripcion?: string
}

function extractFolderId(url: string): string {
  const match = url.match(/\/folders\/([a-zA-Z0-9-_]+)/)
  if (match) return match[1]
  return url
}

async function listFilesFromFolder(folderId: string) {
  const serviceAccountJson = process.env.GOOGLE_DRIVE_SERVICE_ACCOUNT
  if (!serviceAccountJson) {
    throw new Error('Credenciales de Google Drive no configuradas')
  }

  const serviceAccount = JSON.parse(serviceAccountJson)

  const auth = new google.auth.GoogleAuth({
    credentials: serviceAccount,
    scopes: ['https://www.googleapis.com/auth/drive'],
  })

  const drive = google.drive({ version: 'v3', auth })

  const response = await drive.files.list({
    q: `'${folderId}' in parents and (mimeType='image/jpeg' or mimeType='image/png' or mimeType='image/webp' or mimeType='video/mp4') and trashed=false`,
    spaces: 'drive',
    fields: 'files(id, name, mimeType)',
    pageSize: 100,
  })

  const files = response.data.files || []

  return files.map((file) => ({
    id: file.id || '',
    nombre: file.name || '',
    tipo: file.mimeType?.startsWith('image') ? 'imagen' : 'video',
  }))
}

export async function crearGaleriaItem(input: CreateGaleriaInput) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('galeria')
    .insert({
      titulo: input.titulo,
      categoria: input.categoria,
      fotos: input.fotos,
      fecha: input.fecha,
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

export async function obtenerArchivosGoogle(): Promise<
  Array<{ id: string; nombre: string; tipo: string; url: string }>
> {
  try {
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID
    if (!folderId) {
      throw new Error('Carpeta de Google Drive no configurada')
    }

    const archivos = await listFilesFromFolder(folderId)

    return archivos.map(
      (file) => ({
        id: file.id,
        nombre: file.nombre,
        tipo: file.tipo === 'imagen' ? 'imagen' : 'video',
        url: `/api/galeria/preview/${file.id}`,
      })
    )
  } catch (error) {
    throw new Error(
      `Error al obtener archivos de Google Drive: ${error instanceof Error ? error.message : 'Error desconocido'}`
    )
  }
}

export async function importarCarpetaGoogle(input: {
  folderUrl: string
  titulo: string
  categoria: 'xv' | 'boda' | 'empresarial'
  fecha: string
}): Promise<void> {
  try {
    const folderId = extractFolderId(input.folderUrl)
    const archivos = await listFilesFromFolder(folderId)

    if (archivos.length === 0) {
      throw new Error('La carpeta no contiene archivos válidos')
    }

    const fotos = archivos.map(
      (file) => `/api/galeria/preview/${file.id}`
    )

    await crearGaleriaItem({
      titulo: input.titulo,
      categoria: input.categoria,
      fotos: fotos,
      fecha: input.fecha,
      descripcion: '',
    })

    revalidatePath('/portfolio')
    revalidatePath('/(app)/galeria')
  } catch (error) {
    throw new Error(
      `Error al importar carpeta: ${error instanceof Error ? error.message : 'Error desconocido'}`
    )
  }
}
