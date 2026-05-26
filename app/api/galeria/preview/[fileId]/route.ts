import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'

export async function GET(
  request: NextRequest,
  { params }: { params: { fileId: string } }
) {
  try {
    const fileId = params.fileId

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

    const file = await drive.files.get(
      { fileId, alt: 'media' },
      { responseType: 'stream' }
    )

    const mimeType = file.headers['content-type'] || 'application/octet-stream'

    return new NextResponse(file.data as any, {
      headers: {
        'Content-Type': mimeType,
        'Cache-Control': 'public, max-age=86400', // Cache por 24 horas
      },
    })
  } catch (error) {
    console.error('Error fetching file:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error desconocido' },
      { status: 500 }
    )
  }
}
