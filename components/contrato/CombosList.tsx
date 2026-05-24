'use client'

import { useState, useTransition } from 'react'
import { createCombo, updateCombo, toggleCombo } from '@/app/actions/combos'
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

type FormData = {
  nombre: string
  tipo: string
  precio: string
  cuotas_cantidad: string
  cuotas_monto: string
  servicios: string[]
}

const TIPOS = ['XV Años', 'Boda', 'Servicio', 'Adicional']

const emptyForm: FormData = {
  nombre: '',
  tipo: 'XV Años',
  precio: '',
  cuotas_cantidad: '3',
  cuotas_monto: '',
  servicios: [''],
}

function comboToForm(c: Combo): FormData {
  return {
    nombre: c.nombre,
    tipo: c.tipo,
    precio: String(c.precio),
    cuotas_cantidad: String(c.cuotas_cantidad),
    cuotas_monto: String(c.cuotas_monto),
    servicios: c.servicios.length > 0 ? c.servicios : [''],
  }
}

export default function CombosList({ combos }: { combos: Combo[] }) {
  const [showModal, setShowModal] = useState(false)
  const [editingCombo, setEditingCombo] = useState<Combo | null>(null)
  const [form, setForm] = useState<FormData>(emptyForm)
  const [isPending, startTransition] = useTransition()

  function openCreate() {
    setEditingCombo(null)
    setForm(emptyForm)
    setShowModal(true)
  }

  function openEdit(combo: Combo) {
    setEditingCombo(combo)
    setForm(comboToForm(combo))
    setShowModal(true)
  }

  function closeModal() {
    setShowModal(false)
    setEditingCombo(null)
  }

  function updateField(field: keyof FormData, value: string) {
    setForm((prev) => {
      const updated = { ...prev, [field]: value }
      if (field === 'precio' || field === 'cuotas_cantidad') {
        const precio = Number(field === 'precio' ? value : prev.precio)
        const cuotas = Number(field === 'cuotas_cantidad' ? value : prev.cuotas_cantidad)
        if (precio > 0 && cuotas > 0) {
          updated.cuotas_monto = String(Math.round(precio / cuotas))
        }
      }
      return updated
    })
  }

  function addServicio() {
    setForm((prev) => ({ ...prev, servicios: [...prev.servicios, ''] }))
  }

  function removeServicio(index: number) {
    setForm((prev) => ({
      ...prev,
      servicios: prev.servicios.filter((_, i) => i !== index),
    }))
  }

  function updateServicio(index: number, value: string) {
    setForm((prev) => {
      const servicios = [...prev.servicios]
      servicios[index] = value
      return { ...prev, servicios }
    })
  }

  function handleToggle(combo: Combo) {
    startTransition(async () => {
      await toggleCombo(combo.id, !combo.activo)
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const data = {
      nombre: form.nombre,
      tipo: form.tipo,
      precio: Number(form.precio),
      cuotas_cantidad: Number(form.cuotas_cantidad),
      cuotas_monto: Number(form.cuotas_monto),
      servicios: form.servicios.filter((s) => s.trim() !== ''),
    }
    startTransition(async () => {
      if (editingCombo) {
        await updateCombo(editingCombo.id, data)
      } else {
        await createCombo(data)
      }
      closeModal()
    })
  }

  const grupos = TIPOS.map((tipo) => ({
    tipo,
    items: combos.filter((c) => c.tipo === tipo),
  })).filter((g) => g.items.length > 0)

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-[#0A0A0A]">Combos</h1>
        <button
          onClick={openCreate}
          className="px-4 py-2 bg-[#C8A951] text-white text-sm font-semibold rounded-lg hover:bg-[#b8952f] transition-colors"
        >
          + Nuevo combo
        </button>
      </div>

      <div className="space-y-8">
        {grupos.map(({ tipo, items }) => (
          <div key={tipo}>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
              {tipo}
            </h2>
            <div className="space-y-3">
              {items.map((combo) => (
                <div
                  key={combo.id}
                  className={`bg-white rounded-xl p-5 border ${
                    combo.activo ? 'border-gray-100' : 'border-gray-200 opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-[#0A0A0A]">{combo.nombre}</h3>
                        {!combo.activo && (
                          <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-400 rounded-full">
                            Inactivo
                          </span>
                        )}
                      </div>
                      <p className="text-lg font-bold text-[#C8A951]">
                        {formatMoney(combo.precio)}
                      </p>
                      {combo.cuotas_cantidad > 1 && (
                        <p className="text-sm text-gray-400">
                          {combo.cuotas_cantidad} cuotas de {formatMoney(combo.cuotas_monto)}
                        </p>
                      )}
                      {combo.servicios.length > 0 && (
                        <ul className="mt-3 space-y-1">
                          {combo.servicios.map((s, i) => (
                            <li key={i} className="text-sm text-gray-600 flex gap-2">
                              <span className="text-[#C8A951] shrink-0">·</span>
                              {s}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => openEdit(combo)}
                        className="px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleToggle(combo)}
                        disabled={isPending}
                        className="px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                      >
                        {combo.activo ? 'Desactivar' : 'Activar'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {combos.length === 0 && (
          <p className="text-sm text-gray-400">
            No hay combos todavía. Creá el primero con el botón de arriba.
          </p>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-lg font-bold text-[#0A0A0A] mb-6">
                {editingCombo ? 'Editar combo' : 'Nuevo combo'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre
                  </label>
                  <input
                    type="text"
                    required
                    value={form.nombre}
                    onChange={(e) => updateField('nombre', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C8A951]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de evento
                  </label>
                  <select
                    value={form.tipo}
                    onChange={(e) => updateField('tipo', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C8A951]"
                  >
                    {TIPOS.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Precio total
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={form.precio}
                      onChange={(e) => updateField('precio', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C8A951]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cuotas
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={form.cuotas_cantidad}
                      onChange={(e) => updateField('cuotas_cantidad', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C8A951]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Por cuota
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={form.cuotas_monto}
                      onChange={(e) => updateField('cuotas_monto', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C8A951]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Servicios incluidos
                  </label>
                  <div className="space-y-2">
                    {form.servicios.map((servicio, i) => (
                      <div key={i} className="flex gap-2">
                        <input
                          type="text"
                          value={servicio}
                          onChange={(e) => updateServicio(i, e.target.value)}
                          placeholder={`Servicio ${i + 1}`}
                          className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C8A951]"
                        />
                        {form.servicios.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeServicio(i)}
                            className="px-2 text-gray-300 hover:text-red-400 transition-colors text-lg leading-none"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addServicio}
                      className="text-sm text-[#C8A951] hover:underline"
                    >
                      + Agregar servicio
                    </button>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 py-2.5 border border-gray-200 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isPending}
                    className="flex-1 py-2.5 bg-[#C8A951] text-white text-sm font-semibold rounded-lg hover:bg-[#b8952f] transition-colors disabled:opacity-50"
                  >
                    {isPending ? 'Guardando...' : 'Guardar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
