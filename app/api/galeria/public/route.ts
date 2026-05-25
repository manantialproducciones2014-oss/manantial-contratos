import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const categoria = searchParams.get('categoria')
    const limitStr = searchParams.get('limit')
    const offsetStr = searchParams.get('offset')

    // Parse and validate query params
    let limit = Math.min(parseInt(limitStr || '50'), 100)
    if (isNaN(limit) || limit < 1) limit = 50

    let offset = Math.max(parseInt(offsetStr || '0'), 0)
    if (isNaN(offset)) offset = 0

    // Get Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Build query
    let query = supabase.from('galeria').select('*', { count: 'exact' }).eq('activo', true)

    // Filter by category if provided
    if (categoria && ['xv', 'boda', 'empresarial'].includes(categoria)) {
      query = query.eq('categoria', categoria)
    }

    // Order and paginate
    const { data, count, error } = await query
      .order('fecha', { ascending: false })
      .order('orden', { ascending: true })
      .range(offset, offset + limit - 1)

    if (error) throw error

    // Format response
    const items = (data || []).map((item) => ({
      id: item.id,
      titulo: item.titulo,
      categoria: item.categoria,
      fecha: item.fecha,
      descripcion: item.descripcion,
      fotos: item.fotos || [],
      previewUrl: item.fotos && item.fotos.length > 0 ? item.fotos[0] : null,
      photoCount: item.fotos ? item.fotos.length : 0,
      createdAt: item.created_at,
    }))

    return NextResponse.json({
      success: true,
      data: {
        items,
        total: count || 0,
        limit,
        offset,
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error('Error fetching gallery:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    )
  }
}
