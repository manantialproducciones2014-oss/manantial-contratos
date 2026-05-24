import { createClient } from '@/lib/supabase'
import { formatMoney, formatDate } from '@/lib/utils'
import Link from 'next/link'

export default async function HomePage() {
  const supabase = createClient()
  const { data: contratos } = await supabase
    .from('contratos')
    .select('id, numero, cliente_nombre, tipo_evento, evento_fecha, total')
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-[#0A0A0A]">Contratos</h1>
        <Link
          href="/nuevo"
          className="px-4 py-2 bg-[#C8A951] text-white text-sm font-semibold rounded-lg hover:bg-[#b8952f] transition-colors"
        >
          + Nuevo contrato
        </Link>
      </div>

      {contratos && contratos.length > 0 ? (
        <div className="space-y-2">
          {contratos.map((c) => (
            <Link
              key={c.id}
              href={`/contratos/${c.id}`}
              className="block bg-white rounded-xl p-5 border border-gray-100 hover:border-[#C8A951]/40 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-sm font-semibold text-[#C8A951]">
                      {c.numero}
                    </span>
                    <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">
                      {c.tipo_evento}
                    </span>
                  </div>
                  <p className="font-semibold text-[#0A0A0A]">{c.cliente_nombre}</p>
                  {c.evento_fecha && (
                    <p className="text-sm text-gray-400 mt-0.5">{formatDate(c.evento_fecha)}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-bold text-[#C8A951]">{formatMoney(c.total)}</p>
                  <p className="text-xs text-gray-400 mt-1">Ver detalle →</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-gray-400 text-sm mb-4">No hay contratos todavía</p>
          <Link
            href="/nuevo"
            className="px-6 py-3 bg-[#C8A951] text-white text-sm font-semibold rounded-lg hover:bg-[#b8952f] transition-colors"
          >
            Crear el primer contrato
          </Link>
        </div>
      )}
    </div>
  )
}
