import { createClient } from '@/lib/supabase'
import { formatMoney, formatDate } from '@/lib/utils'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import PagosSection from '@/components/contrato/PagosSection'

type ComboSnapshot = {
  nombre: string
  precio: number
  cuotas_cantidad: number
  cuotas_monto: number
  servicios: string[]
}

type AdicionalSnapshot = {
  nombre: string
  precio: number
}

export default async function ContratoPage({ params }: { params: { id: string } }) {
  const supabase = createClient()

  const [{ data: contrato }, { data: pagos }] = await Promise.all([
    supabase.from('contratos').select('*').eq('id', params.id).single(),
    supabase.from('pagos').select('*').eq('contrato_id', params.id).order('fecha'),
  ])

  if (!contrato) notFound()

  const combo = contrato.combo_snapshot as ComboSnapshot | null
  const adicionales = (contrato.adicionales_snapshot ?? []) as AdicionalSnapshot[]

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <Link href="/" className="text-sm text-gray-400 hover:text-gray-600 mb-2 block">
            ← Contratos
          </Link>
          <h1 className="text-2xl font-bold text-[#0A0A0A]">{contrato.cliente_nombre}</h1>
          <p className="text-[#C8A951] font-mono font-semibold">{contrato.numero}</p>
        </div>
        <Link
          href={`/contratos/${contrato.id}/pdf`}
          className="px-4 py-2 border border-gray-200 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Imprimir PDF
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-5 border border-gray-100">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
            Resumen
          </h2>
          <dl className="space-y-2.5">
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">Tipo de evento</dt>
              <dd className="text-sm font-medium text-[#0A0A0A]">{contrato.tipo_evento}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">Fecha contrato</dt>
              <dd className="text-sm font-medium text-[#0A0A0A]">{formatDate(contrato.fecha)}</dd>
            </div>
            {contrato.evento_fecha && (
              <div className="flex justify-between">
                <dt className="text-sm text-gray-500">Fecha evento</dt>
                <dd className="text-sm font-medium text-[#0A0A0A]">
                  {formatDate(contrato.evento_fecha)}
                </dd>
              </div>
            )}
            {contrato.evento_lugar && (
              <div className="flex justify-between">
                <dt className="text-sm text-gray-500">Lugar</dt>
                <dd className="text-sm font-medium text-[#0A0A0A]">{contrato.evento_lugar}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">Método de pago</dt>
              <dd className="text-sm font-medium text-[#0A0A0A] capitalize">
                {contrato.metodo_pago}
              </dd>
            </div>
            <div className="flex justify-between pt-2 border-t border-gray-100">
              <dt className="text-sm font-semibold text-[#0A0A0A]">Total</dt>
              <dd className="text-lg font-bold text-[#C8A951]">{formatMoney(contrato.total)}</dd>
            </div>
          </dl>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-100">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
            Cliente
          </h2>
          <dl className="space-y-2.5">
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">DNI</dt>
              <dd className="text-sm font-medium text-[#0A0A0A]">{contrato.cliente_dni}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">Teléfono</dt>
              <dd className="text-sm font-medium text-[#0A0A0A]">{contrato.cliente_telefono}</dd>
            </div>
            {contrato.cliente_email && (
              <div className="flex justify-between">
                <dt className="text-sm text-gray-500">Email</dt>
                <dd className="text-sm font-medium text-[#0A0A0A]">{contrato.cliente_email}</dd>
              </div>
            )}
            {contrato.cliente_localidad && (
              <div className="flex justify-between">
                <dt className="text-sm text-gray-500">Localidad</dt>
                <dd className="text-sm font-medium text-[#0A0A0A]">
                  {contrato.cliente_localidad}
                </dd>
              </div>
            )}
          </dl>
        </div>
      </div>

      {combo && (
        <div className="bg-white rounded-xl p-5 border border-gray-100">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
            Combo contratado
          </h2>
          <div className="flex items-center justify-between mb-3">
            <span className="font-semibold text-[#0A0A0A]">{combo.nombre}</span>
            <span className="font-bold text-[#C8A951]">{formatMoney(combo.precio)}</span>
          </div>
          <ul className="space-y-1">
            {combo.servicios.map((s, i) => (
              <li key={i} className="text-sm text-gray-600 flex gap-2">
                <span className="text-[#C8A951] shrink-0">·</span>
                {s}
              </li>
            ))}
          </ul>
          {adicionales.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
                Adicionales
              </p>
              <ul className="space-y-1.5">
                {adicionales.map((a, i) => (
                  <li key={i} className="flex justify-between text-sm">
                    <span className="text-gray-600 flex gap-2">
                      <span className="text-[#C8A951]">·</span>
                      {a.nombre}
                    </span>
                    <span className="font-medium text-[#C8A951]">{formatMoney(a.precio)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <PagosSection
        contratoId={contrato.id}
        total={contrato.total}
        pagos={pagos ?? []}
      />
    </div>
  )
}
