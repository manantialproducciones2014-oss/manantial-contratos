'use client'

import { useState, useTransition } from 'react'
import { agregarPago, eliminarPago } from '@/app/actions/pagos'
import { formatMoney, formatDate } from '@/lib/utils'

type Pago = {
  id: string
  fecha: string
  monto: number
  metodo: string
  anotacion: string | null
}

const inputClass =
  'w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C8A951]'
const labelClass = 'block text-sm font-medium text-gray-700 mb-1'

export default function PagosSection({
  contratoId,
  total,
  pagos,
}: {
  contratoId: string
  total: number
  pagos: Pago[]
}) {
  const [showForm, setShowForm] = useState(false)
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0])
  const [monto, setMonto] = useState('')
  const [metodo, setMetodo] = useState<'efectivo' | 'transferencia'>('efectivo')
  const [anotacion, setAnotacion] = useState('')
  const [isPending, startTransition] = useTransition()

  const totalPagado = pagos.reduce((s, p) => s + p.monto, 0)
  const saldo = total - totalPagado

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      await agregarPago({
        contrato_id: contratoId,
        fecha,
        monto: Number(monto),
        metodo,
        anotacion,
      })
      setMonto('')
      setAnotacion('')
      setShowForm(false)
    })
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      await eliminarPago(id, contratoId)
    })
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100">
      {/* Resumen de saldo */}
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400">Pagos</h2>
          <button
            onClick={() => setShowForm((v) => !v)}
            className="px-3 py-1.5 text-xs font-semibold bg-[#C8A951] text-white rounded-lg hover:bg-[#b8952f] transition-colors"
          >
            + Registrar pago
          </button>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Total</p>
            <p className="font-bold text-[#0A0A0A]">{formatMoney(total)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Pagado</p>
            <p className="font-bold text-green-600">{formatMoney(totalPagado)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Saldo</p>
            <p className={`font-bold ${saldo > 0 ? 'text-red-500' : 'text-green-600'}`}>
              {formatMoney(saldo)}
            </p>
          </div>
        </div>
      </div>

      {/* Formulario */}
      {showForm && (
        <form onSubmit={handleSubmit} className="p-5 border-b border-gray-100 bg-gray-50/50">
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className={labelClass}>Fecha</label>
              <input
                type="date"
                required
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Monto</label>
              <input
                type="number"
                required
                min="1"
                placeholder="0"
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>
          <div className="mb-3">
            <label className={labelClass}>Método</label>
            <div className="flex gap-2">
              {(['efectivo', 'transferencia'] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMetodo(m)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors capitalize ${
                    metodo === m
                      ? 'bg-[#0A0A0A] text-white border-[#0A0A0A]'
                      : 'bg-white text-gray-600 border-gray-200'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
          <div className="mb-3">
            <label className={labelClass}>Anotación (opcional)</label>
            <input
              type="text"
              placeholder="ej: Seña inicial"
              value={anotacion}
              onChange={(e) => setAnotacion(e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="flex-1 py-2 border border-gray-200 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 py-2 bg-[#C8A951] text-white text-sm font-semibold rounded-lg hover:bg-[#b8952f] disabled:opacity-50"
            >
              {isPending ? 'Guardando...' : 'Guardar pago'}
            </button>
          </div>
        </form>
      )}

      {/* Lista de pagos */}
      <div className="p-5">
        {pagos.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">
            Sin pagos registrados todavía
          </p>
        ) : (
          <div className="space-y-2">
            {pagos.map((pago) => (
              <div
                key={pago.id}
                className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-[#0A0A0A]">
                      {formatMoney(pago.monto)}
                    </span>
                    <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full capitalize">
                      {pago.metodo}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {formatDate(pago.fecha)}
                    {pago.anotacion && ` · ${pago.anotacion}`}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(pago.id)}
                  disabled={isPending}
                  className="text-gray-300 hover:text-red-400 transition-colors text-lg leading-none px-2"
                  title="Eliminar pago"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
