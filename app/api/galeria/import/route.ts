import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'

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
    tipo: file.mimeType?.startsWith('image') ? 'foto' : 'resumen',
  }))
}

export async function POST(request: NextRequest) {
  try {
    const { folderUrl } = await request.json()

    if (!folderUrl) {
      return NextResponse.json({ error: 'folderUrl requerido' }, { status: 400 })
    }

    const folderId = extractFolderId(folderUrl)
    const archivos = await listFilesFromFolder(folderId)

    return NextResponse.json({ archivos })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error desconocido' },
      { status: 500 }
    )
  }
}
