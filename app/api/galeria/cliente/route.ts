import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET',
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS })
}

export async function GET(request: NextRequest) {
  const codigo = request.nextUrl.searchParams.get('codigo')

  if (!codigo) {
    return NextResponse.json({ success: false, error: 'Código requerido' }, { headers: CORS })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data, error } = await supabase
    .from('galerias_privadas')
    .select('titulo, tipo, fecha, fotos')
    .eq('codigo', codigo.toUpperCase().trim())
    .eq('activo', true)
    .single()

  if (error || !data) {
    return NextResponse.json({ success: false, error: 'Código incorrecto' }, { headers: CORS })
  }

  const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://manantial-contratos.vercel.app'

  const fotos = (data.fotos || []).map((url: string) =>
    url.startsWith('http') ? url : APP_URL + url
  )

  return NextResponse.json({
    success: true,
    data: {
      titulo: data.titulo,
      tipo: data.tipo,
      fecha: data.fecha,
      fotos,
    },
  }, { headers: CORS })
}
