'use client'

import { useState, useEffect } from 'react'
import {
  obtenerGaleriasPrivadas,
  crearGaleriaPrivada,
  toggleGaleriaPrivada,
  eliminarGaleriaPrivada,
  type GaleriaPrivada,
} from '@/app/actions/galerias-privadas'

const WEB_URL = 'https://manantial-web.manantialproducciones2014.workers.dev'

const inputClass = 'w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C8A951]'
const labelClass = 'block text-sm font-medium text-gray-700 mb-1'

const TIPOS = ['XV Años', 'Boda', 'Empresarial', 'Sesiones', 'Videografía', 'Espejo Mágico', 'Plataforma 360°']

export default function GaleriaPrivadaPage() {
  const [items, setItems] = useState<GaleriaPrivada[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const [form, setForm] = useState({
    titulo: '',
    tipo: 'XV Años',
    fecha: '',
    codigo: '',
    folderUrl: '',
  })

  useEffect(() => { loadItems() }, [])

  async function loadItems() {
    try {
      setLoading(true)
      setItems(await obtenerGaleriasPrivadas())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar')
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!form.titulo.trim()) return setError('El título es requerido')
    if (!form.codigo.trim()) return setError('El código es requerido')
    if (!form.folderUrl.trim()) return setError('El link de carpeta es requerido')
    if (!form.fecha.trim()) return setError('La fecha es requerida')

    setCreating(true)
    const result = await crearGaleriaPrivada(form)
    setCreating(false)

    if (!result.ok) {
      setError(result.error)
      return
    }

    setSuccess(`Galería creada. Código: ${form.codigo.toUpperCase()}`)
    setForm({ titulo: '', tipo: 'XV Años', fecha: '', codigo: '', folderUrl: '' })
    await loadItems()
  }

  async function handleToggle(id: string, activo: boolean) {
    try {
      await toggleGaleriaPrivada(id, !activo)
      await loadItems()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error')
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar esta galería? El cliente perderá acceso.')) return
    try {
      await eliminarGaleriaPrivada(id)
      setSuccess('Galería eliminada')
      await loadItems()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error')
    }
  }

  function copyLink(codigo: string, id: string) {
    const link = `${WEB_URL}/galeria-cliente.html?codigo=${codigo}`
    navigator.clipboard.writeText(link)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  if (loading) return <div className="p-6 text-center">Cargando...</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#0A0A0A]">Galerías Privadas</h1>
        <a href="/galeria" className="text-sm text-gray-500 hover:text-[#C8A951]">← Galería pública</a>
      </div>

      {error && <p className="text-sm text-red-500 bg-red-50 px-4 py-3 rounded-lg">{error}</p>}
      {success && <p className="text-sm text-green-600 bg-green-50 px-4 py-3 rounded-lg">{success}</p>}

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="bg-amber-50 rounded-xl p-6 border-2 border-amber-200 space-y-4">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-amber-700">
          Nueva galería privada
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className={labelClass}>Link de carpeta Google Drive *</label>
            <input
              type="url"
              value={form.folderUrl}
              onChange={(e) => setForm({ ...form, folderUrl: e.target.value })}
              className={inputClass}
              placeholder="https://drive.google.com/drive/folders/..."
            />
          </div>

          <div className="sm:col-span-2">
            <label className={labelClass}>Nombre del cliente *</label>
            <input
              type="text"
              value={form.titulo}
              onChange={(e) => setForm({ ...form, titulo: e.target.value })}
              className={inputClass}
              placeholder="ej: Sofía García"
            />
          </div>

          <div>
            <label className={labelClass}>Tipo de evento *</label>
            <select
              value={form.tipo}
              onChange={(e) => setForm({ ...form, tipo: e.target.value })}
              className={inputClass}
            >
              {TIPOS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div>
            <label className={labelClass}>Fecha *</label>
            <input
              type="text"
              value={form.fecha}
              onChange={(e) => setForm({ ...form, fecha: e.target.value })}
              className={inputClass}
              placeholder="ej: Mayo 2026"
            />
          </div>

          <div className="sm:col-span-2">
            <label className={labelClass}>Código de acceso *</label>
            <input
              type="text"
              value={form.codigo}
              onChange={(e) => setForm({ ...form, codigo: e.target.value.toUpperCase() })}
              className={inputClass}
              placeholder="ej: SOFIA2026"
            />
            <p className="text-xs text-gray-400 mt-1">Solo letras y números, sin espacios. Se convierte automáticamente a mayúsculas.</p>
          </div>
        </div>

        <button
          type="submit"
          disabled={creating}
          className="w-full py-2 bg-[#C8A951] text-white font-semibold rounded-lg hover:bg-[#b8952f] transition-colors disabled:opacity-50"
        >
          {creating ? 'Importando fotos...' : 'Crear galería privada'}
        </button>
      </form>

      {/* Lista */}
      <div className="bg-white rounded-xl p-6 border border-gray-100 space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
          Galerías ({items.length})
        </h2>

        {items.length === 0 ? (
          <p className="text-sm text-gray-500">No hay galerías privadas todavía.</p>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className={`flex items-center justify-between p-4 border rounded-lg transition-colors ${
                item.activo ? 'border-gray-200' : 'border-gray-100 opacity-50'
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="font-semibold text-sm text-[#0A0A0A]">{item.titulo}</span>
                  <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">{item.tipo}</span>
                  <span className="text-xs px-2 py-0.5 bg-[#C8A951]/10 text-[#C8A951] rounded font-mono font-bold">{item.codigo}</span>
                </div>
                <p className="text-xs text-gray-500">{item.fecha} · {item.fotos.length} fotos</p>
              </div>

              <div className="flex gap-2 ml-3 flex-shrink-0">
                <button
                  onClick={() => copyLink(item.codigo, item.id)}
                  className="px-3 py-1.5 bg-[#C8A951]/10 hover:bg-[#C8A951]/20 text-[#C8A951] rounded text-xs font-medium transition-colors"
                >
                  {copiedId === item.id ? '✓ Copiado' : 'Copiar link'}
                </button>
                <button
                  onClick={() => handleToggle(item.id, item.activo)}
                  className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                    item.activo ? 'bg-green-50 hover:bg-green-100 text-green-700' : 'bg-gray-100 hover:bg-gray-200 text-gray-500'
                  }`}
                >
                  {item.activo ? 'Activo' : 'Inactivo'}
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded text-xs font-medium transition-colors"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
