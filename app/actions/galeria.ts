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

export async function obtenerArchivosGoogle(): Promise<
  Array<{ id: string; nombre: string; tipo: string; url: string }>
> {
  try {
    const { google } = require('googleapis')

    const serviceAccountJson = process.env.GOOGLE_DRIVE_SERVICE_ACCOUNT
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID

    if (!serviceAccountJson || !folderId) {
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
      fields: 'files(id, name, mimeType, webContentLink)',
      pageSize: 100,
    })

    const files = response.data.files || []

    return files.map((file) => ({
      id: file.id || '',
      nombre: file.name || '',
      tipo: file.mimeType?.startsWith('image') ? 'imagen' : 'video',
      url: `https://drive.google.com/file/d/${file.id}/preview`,
    }))
  } catch (error) {
    throw new Error(
      `Error al obtener archivos de Google Drive: ${error instanceof Error ? error.message : 'Error desconocido'}`
    )
  }
}

function extractFolderId(url: string): string {
  const match = url.match(/\/folders\/([a-zA-Z0-9-_]+)/)
  if (match) return match[1]
  return url
}

async function listFilesFromFolder(
  folderId: string
): Promise<Array<{ id: string; nombre: string; tipo: string }>> {
  const { google } = require('googleapis')

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
    tipo: file.mimeType?.startsWith('image') ? 'foto' : 'resumen',
  }))
}

export async function importarCarpetaGoogle(input: {
  folderUrl: string
  titulo: string
  categoria: 'xv' | 'boda' | 'empresarial'
  tipoContenido: 'foto' | 'resumen' | 'plataforma360'
  fecha: string
}): Promise<{ creadas: number; errores: number }> {
  try {
    const folderId = extractFolderId(input.folderUrl)
    const archivos = await listFilesFromFolder(folderId)

    let creadas = 0
    let errores = 0

    for (const archivo of archivos) {
      try {
        await crearGaleriaItem({
          titulo: `${input.titulo} - ${archivo.nombre}`,
          categoria: input.categoria,
          tipo_contenido: input.tipoContenido,
          contenido_url: `https://drive.google.com/file/d/${archivo.id}/preview`,
          fecha: input.fecha,
          descripcion: '',
        })
        creadas++
      } catch (err) {
        errores++
      }
    }

    revalidatePath('/portfolio')
    revalidatePath('/(app)/galeria')

    return { creadas, errores }
  } catch (error) {
    throw new Error(
      `Error al importar carpeta: ${error instanceof Error ? error.message : 'Error desconocido'}`
    )
  }
}
