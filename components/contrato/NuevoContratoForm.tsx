'use client'

import { useState, useTransition } from 'react'
import { crearContrato } from '@/app/actions/contratos'
import { formatMoney } from '@/lib/utils'

type Combo = {
  id: string
  nombre: string
  tipo: string
  precio: number
  cuotas_cantidad: number
  cuotas_monto: number
  servicios: string[]
  activo: boolean
}

type Fields = {
  fecha: string
  cliente_nombre: string
  cliente_dni: string
  cliente_telefono: string
  cliente_email: string
  cliente_direccion: string
  cliente_localidad: string
  cliente_cp: string
  evento_nombre: string
  evento_fecha: string
  evento_lugar: string
  evento_direccion: string
  evento_duracion: string
  evento_invitados: string
  evento_horario_desde: string
  evento_horario_hasta: string
  total_manual: string
}

const TIPOS_EVENTO = ['XV Años', 'Boda', 'Servicio', 'Empresarial']

const inputClass =
  'w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C8A951]'
const labelClass = 'block text-sm font-medium text-gray-700 mb-1'

export default function NuevoContratoForm({ combos }: { combos: Combo[] }) {
  const [tipoEvento, setTipoEvento] = useState('')
  const [comboId, setComboId] = useState('')
  const [adicionalesIds, setAdicionalesIds] = useState<string[]>([])
  const [metodoPago, setMetodoPago] = useState<'efectivo' | 'transferencia'>('efectivo')
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const [fields, setFields] = useState<Fields>({
    fecha: new Date().toISOString().split('T')[0],
    cliente_nombre: '',
    cliente_dni: '',
    cliente_telefono: '',
    cliente_email: '',
    cliente_direccion: '',
    cliente_localidad: '',
    cliente_cp: '',
    evento_nombre: '',
    evento_fecha: '',
    evento_lugar: '',
    evento_direccion: '',
    evento_duracion: '',
    evento_invitados: '',
    evento_horario_desde: '',
    evento_horario_hasta: '',
    total_manual: '',
  })

  function set(key: keyof Fields, value: string) {
    setFields((prev) => ({ ...prev, [key]: value }))
  }

  function handleTipoChange(tipo: string) {
    setTipoEvento(tipo)
    setComboId('')
    setAdicionalesIds([])
  }

  function toggleAdicional(id: string) {
    setAdicionalesIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  const combosForTipo = combos.filter((c) => c.tipo === tipoEvento)
  const adicionales = combos.filter((c) => c.tipo === 'Adicional')
  const selectedCombo = combos.find((c) => c.id === comboId)
  const selectedAdicionales = combos.filter((c) => adicionalesIds.includes(c.id))

  const total =
    tipoEvento === 'Empresarial'
      ? (Number(fields.total_manual) || 0) +
        selectedAdicionales.reduce((s, a) => s + a.precio, 0)
      : (selectedCombo?.precio ?? 0) +
        selectedAdicionales.reduce((s, a) => s + a.precio, 0)

  const noCombo = tipoEvento === 'Empresarial'
  const showRest = tipoEvento && (noCombo || comboId)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!tipoEvento) return setError('Seleccioná el tipo de evento')
    if (!noCombo && !comboId) return setError('Seleccioná un combo')

    startTransition(async () => {
      try {
        await crearContrato({
          tipo_evento: tipoEvento,
          combo_snapshot: selectedCombo ?? null,
          adicionales_snapshot: selectedAdicionales,
          total,
          metodo_pago: metodoPago,
          fecha: fields.fecha,
          cliente_nombre: fields.cliente_nombre,
          cliente_dni: fields.cliente_dni,
          cliente_telefono: fields.cliente_telefono,
          cliente_email: fields.cliente_email,
          cliente_direccion: fields.cliente_direccion,
          cliente_localidad: fields.cliente_localidad,
          cliente_cp: fields.cliente_cp,
          evento_nombre: fields.evento_nombre,
          evento_fecha: fields.evento_fecha,
          evento_lugar: fields.evento_lugar,
          evento_direccion: fields.evento_direccion,
          evento_duracion: fields.evento_duracion,
          evento_invitados: fields.evento_invitados,
          evento_horario_desde: fields.evento_horario_desde,
          evento_horario_hasta: fields.evento_horario_hasta,
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al crear el contrato')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h1 className="text-2xl font-bold text-[#0A0A0A]">Nuevo contrato</h1>

      {/* Tipo de evento */}
      <div className="bg-white rounded-xl p-6 border border-gray-100">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
          Tipo de evento
        </h2>
        <div className="flex gap-3 flex-wrap">
          {TIPOS_EVENTO.map((tipo) => (
            <button
              key={tipo}
              type="button"
              onClick={() => handleTipoChange(tipo)}
              className={`px-5 py-2.5 rounded-lg text-sm font-medium border transition-colors ${
                tipoEvento === tipo
                  ? 'bg-[#0A0A0A] text-white border-[#0A0A0A]'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
              }`}
            >
              {tipo}
            </button>
          ))}
        </div>
      </div>

      {/* Selección de combo */}
      {tipoEvento && !noCombo && (
        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
            Combo
          </h2>
          {combosForTipo.length === 0 ? (
            <p className="text-sm text-gray-400">No hay combos activos para {tipoEvento}</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {combosForTipo.map((combo) => (
                <div
                  key={combo.id}
                  onClick={() => setComboId(combo.id)}
                  className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    comboId === combo.id
                      ? 'border-[#C8A951] bg-[#C8A951]/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-semibold text-sm text-[#0A0A0A]">{combo.nombre}</span>
                    <span className="font-bold text-[#C8A951] text-sm">
                      {formatMoney(combo.precio)}
                    </span>
                  </div>
                  {combo.cuotas_cantidad > 1 && (
                    <p className="text-xs text-gray-400 mb-2">
                      {combo.cuotas_cantidad} cuotas de {formatMoney(combo.cuotas_monto)}
                    </p>
                  )}
                  <ul className="space-y-0.5">
                    {combo.servicios.map((s, i) => (
                      <li key={i} className="text-xs text-gray-500 flex gap-1.5">
                        <span className="text-[#C8A951] shrink-0">·</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Adicionales */}
      {(comboId || noCombo) && adicionales.length > 0 && (
        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
            Adicionales
          </h2>
          <div className="space-y-1">
            {adicionales.map((a) => (
              <label
                key={a.id}
                className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={adicionalesIds.includes(a.id)}
                    onChange={() => toggleAdicional(a.id)}
                    className="w-4 h-4 accent-[#C8A951]"
                  />
                  <span className="text-sm text-gray-700">{a.nombre}</span>
                </div>
                <span className="text-sm font-medium text-[#C8A951]">
                  {formatMoney(a.precio)}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {showRest && (
        <>
          {/* Datos del cliente */}
          <div className="bg-white rounded-xl p-6 border border-gray-100">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
              Datos del cliente
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className={labelClass}>Nombre completo *</label>
                <input
                  type="text"
                  required
                  value={fields.cliente_nombre}
                  onChange={(e) => set('cliente_nombre', e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>DNI *</label>
                <input
                  type="text"
                  required
                  value={fields.cliente_dni}
                  onChange={(e) => set('cliente_dni', e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Teléfono *</label>
                <input
                  type="text"
                  required
                  value={fields.cliente_telefono}
                  onChange={(e) => set('cliente_telefono', e.target.value)}
                  className={inputClass}
                />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>Email</label>
                <input
                  type="email"
                  value={fields.cliente_email}
                  onChange={(e) => set('cliente_email', e.target.value)}
                  className={inputClass}
                />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>Dirección</label>
                <input
                  type="text"
                  value={fields.cliente_direccion}
                  onChange={(e) => set('cliente_direccion', e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Localidad</label>
                <input
                  type="text"
                  value={fields.cliente_localidad}
                  onChange={(e) => set('cliente_localidad', e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Código postal</label>
                <input
                  type="text"
                  value={fields.cliente_cp}
                  onChange={(e) => set('cliente_cp', e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          {/* Datos del evento */}
          <div className="bg-white rounded-xl p-6 border border-gray-100">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
              Datos del evento
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className={labelClass}>Nombre de la festejada / evento</label>
                <input
                  type="text"
                  value={fields.evento_nombre}
                  onChange={(e) => set('evento_nombre', e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Fecha del evento</label>
                <input
                  type="date"
                  value={fields.evento_fecha}
                  onChange={(e) => set('evento_fecha', e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Fecha del contrato</label>
                <input
                  type="date"
                  value={fields.fecha}
                  onChange={(e) => set('fecha', e.target.value)}
                  className={inputClass}
                />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>Lugar del evento</label>
                <input
                  type="text"
                  value={fields.evento_lugar}
                  onChange={(e) => set('evento_lugar', e.target.value)}
                  className={inputClass}
                />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>Dirección del lugar</label>
                <input
                  type="text"
                  value={fields.evento_direccion}
                  onChange={(e) => set('evento_direccion', e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Horario desde</label>
                <input
                  type="time"
                  value={fields.evento_horario_desde}
                  onChange={(e) => set('evento_horario_desde', e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Horario hasta</label>
                <input
                  type="time"
                  value={fields.evento_horario_hasta}
                  onChange={(e) => set('evento_horario_hasta', e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Duración</label>
                <input
                  type="text"
                  placeholder="ej: 6 horas"
                  value={fields.evento_duracion}
                  onChange={(e) => set('evento_duracion', e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Cantidad de invitados</label>
                <input
                  type="text"
                  value={fields.evento_invitados}
                  onChange={(e) => set('evento_invitados', e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          {/* Pago y total */}
          <div className="bg-white rounded-xl p-6 border border-gray-100">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
              Pago
            </h2>
            <div className="flex gap-3 mb-6">
              {(['efectivo', 'transferencia'] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMetodoPago(m)}
                  className={`px-5 py-2.5 rounded-lg text-sm font-medium border transition-colors capitalize ${
                    metodoPago === m
                      ? 'bg-[#0A0A0A] text-white border-[#0A0A0A]'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>

            {noCombo && (
              <div className="mb-4">
                <label className={labelClass}>Monto del servicio</label>
                <input
                  type="number"
                  min="0"
                  value={fields.total_manual}
                  onChange={(e) => set('total_manual', e.target.value)}
                  className={inputClass}
                  placeholder="0"
                />
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <span className="text-sm font-medium text-gray-600">Total del contrato</span>
              <span className="text-2xl font-bold text-[#C8A951]">{formatMoney(total)}</span>
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-500 bg-red-50 px-4 py-3 rounded-lg">{error}</p>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full py-3 bg-[#C8A951] text-white font-semibold rounded-xl hover:bg-[#b8952f] transition-colors disabled:opacity-50 text-base"
          >
            {isPending ? 'Creando contrato...' : 'Crear contrato →'}
          </button>
        </>
      )}
    </form>
  )
}
