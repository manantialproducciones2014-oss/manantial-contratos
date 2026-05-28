'use server'

import { createClient } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'
import { google } from 'googleapis'

export type GaleriaPrivada = {
  id: string
  titulo: string
  tipo: string
  fecha: string
  codigo: string
  fotos: string[]
  activo: boolean
  created_at: string
}

async function listFilesFromFolder(folderId: string) {
  const serviceAccountJson = process.env.GOOGLE_DRIVE_SERVICE_ACCOUNT
  if (!serviceAccountJson) throw new Error('Credenciales de Google Drive no configuradas en Vercel')

  let credentials
  try {
    const clean = serviceAccountJson.startsWith("'") ? serviceAccountJson.slice(1, -1) : serviceAccountJson
    credentials = JSON.parse(clean)
  } catch {
    throw new Error('El formato de las credenciales de Google Drive es inválido. Verificá la variable GOOGLE_DRIVE_SERVICE_ACCOUNT en Vercel.')
  }

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/drive'],
  })

  const drive = google.drive({ version: 'v3', auth })

  const response = await drive.files.list({
    q: `'${folderId}' in parents and (mimeType='image/jpeg' or mimeType='image/png' or mimeType='image/webp') and trashed=false`,
    spaces: 'drive',
    fields: 'files(id, name)',
    pageSize: 500,
  })

  return (response.data.files || []).map((f) => `/api/galeria/preview/${f.id}`)
}

function extractFolderId(url: string): string {
  const match = url.match(/\/folders\/([a-zA-Z0-9-_]+)/)
  return match ? match[1] : url
}

export async function obtenerGaleriasPrivadas(): Promise<GaleriaPrivada[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('galerias_privadas')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data || []
}

export async function crearGaleriaPrivada(input: {
  titulo: string
  tipo: string
  fecha: string
  codigo: string
  folderUrl: string
}): Promise<void> {
  try {
    const folderId = extractFolderId(input.folderUrl)
    const fotos = await listFilesFromFolder(folderId)

    if (fotos.length === 0) throw new Error('La carpeta no contiene imágenes válidas')

    const supabase = createClient()
    const { error } = await supabase.from('galerias_privadas').insert({
      titulo: input.titulo,
      tipo: input.tipo,
      fecha: input.fecha,
      codigo: input.codigo.toUpperCase().trim(),
      fotos,
      activo: true,
    })

    if (error) {
      if (error.code === '23505') throw new Error('Ese código ya existe, elegí otro')
      throw new Error(error.message)
    }

    revalidatePath('/(app)/galeria/privada')
  } catch (err) {
    throw new Error(err instanceof Error ? err.message : 'Error al crear la galería privada')
  }
}

export async function toggleGaleriaPrivada(id: string, activo: boolean): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase
    .from('galerias_privadas')
    .update({ activo })
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/(app)/galeria/privada')
}

export async function eliminarGaleriaPrivada(id: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from('galerias_privadas').delete().eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/(app)/galeria/privada')
}
