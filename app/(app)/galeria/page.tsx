'use client'

import { useState, useTransition } from 'react'
import {
  crearGaleriaItem,
  obtenerTodasLasGalerias,
  actualizarGaleriaItem,
  eliminarGaleriaItem,
  obtenerArchivosGoogle,
  importarCarpetaGoogle,
  type GaleriaItem,
} from '@/app/actions/galeria'
import { useEffect } from 'react'

const inputClass =
  'w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C8A951]'
const labelClass = 'block text-sm font-medium text-gray-700 mb-1'

const CATEGORIAS = ['xv', 'boda', 'empresarial'] as const
const TIPOS_CONTENIDO = ['foto', 'resumen', 'plataforma360'] as const

export default function GaleriaPage() {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [items, setItems] = useState<GaleriaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [archivosGoogle, setArchivosGoogle] = useState<
    Array<{ id: string; nombre: string; tipo: string; url: string }>
  >([])
  const [loadingGoogle, setLoadingGoogle] = useState(false)

  const [importForm, setImportForm] = useState({
    folderUrl: '',
    titulo: '',
    categoria: 'xv' as const,
    tipoContenido: 'foto' as const,
    fecha: new Date().toISOString().split('T')[0],
  })
  const [importingFolder, setImportingFolder] = useState(false)

  const [form, setForm] = useState<{
    titulo: string
    categoria: 'xv' | 'boda' | 'empresarial'
    tipo_contenido: 'foto' | 'resumen' | 'plataforma360'
    contenido_url: string
    fecha: string
    descripcion: string
  }>({
    titulo: '',
    categoria: 'xv',
    tipo_contenido: 'foto',
    contenido_url: '',
    fecha: new Date().toISOString().split('T')[0],
    descripcion: '',
  })

  useEffect(() => {
    loadItems()
    loadArchivosGoogle()
  }, [])

  async function loadItems() {
    try {
      setLoading(true)
      const data = await obtenerTodasLasGalerias()
      setItems(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar galería')
    } finally {
      setLoading(false)
    }
  }

  async function loadArchivosGoogle() {
    try {
      setLoadingGoogle(true)
      const archivos = await obtenerArchivosGoogle()
      setArchivosGoogle(archivos)
    } catch (err) {
      console.error('Error cargando archivos de Google Drive:', err)
    } finally {
      setLoadingGoogle(false)
    }
  }

  function handleChange(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!form.titulo.trim()) return setError('El título es requerido')
    if (!form.contenido_url.trim()) return setError('La URL es requerida')

    startTransition(async () => {
      try {
        if (editingId) {
          await actualizarGaleriaItem(editingId, form)
          setSuccess('Galería actualizada')
          setEditingId(null)
        } else {
          await crearGaleriaItem(form)
          setSuccess('Galería creada')
        }

        setForm({
          titulo: '',
          categoria: 'xv' as const,
          tipo_contenido: 'foto' as const,
          contenido_url: '',
          fecha: new Date().toISOString().split('T')[0],
          descripcion: '',
        })

        await loadItems()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al guardar')
      }
    })
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Estás seguro de que querés eliminar esta galería?')) return

    try {
      await eliminarGaleriaItem(id)
      setSuccess('Galería eliminada')
      await loadItems()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar')
    }
  }

  function handleEdit(item: GaleriaItem) {
    setForm({
      titulo: item.titulo,
      categoria: item.categoria,
      tipo_contenido: item.tipo_contenido,
      contenido_url: item.contenido_url,
      fecha: item.fecha,
      descripcion: item.descripcion || '',
    })
    setEditingId(item.id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function handleImportFolder(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!importForm.folderUrl.trim()) return setError('El link de la carpeta es requerido')
    if (!importForm.titulo.trim()) return setError('El título es requerido')

    setImportingFolder(true)

    try {
      const result = await importarCarpetaGoogle({
        folderUrl: importForm.folderUrl,
        titulo: importForm.titulo,
        categoria: importForm.categoria,
        tipoContenido: importForm.tipoContenido,
        fecha: importForm.fecha,
      })

      setSuccess(
        `Importadas ${result.creadas} fotos${result.errores > 0 ? ` (${result.errores} con error)` : ''}`
      )

      setImportForm({
        folderUrl: '',
        titulo: '',
        categoria: 'xv',
        tipoContenido: 'foto',
        fecha: new Date().toISOString().split('T')[0],
      })

      await loadItems()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al importar carpeta')
    } finally {
      setImportingFolder(false)
    }
  }

  const tipoLabel = {
    foto: '📸 Foto',
    resumen: '▶ Resumen',
    plataforma360: '360° Plataforma',
  }

  const categoriaLabel = {
    xv: 'XV Años',
    boda: 'Boda',
    empresarial: 'Empresarial',
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#0A0A0A]">Galería</h1>

      {/* Importar carpeta */}
      <form onSubmit={handleImportFolder} className="bg-blue-50 rounded-xl p-6 border-2 border-blue-200 space-y-4">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-blue-600 mb-4">
          ⚡ Importar carpeta completa
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className={labelClass}>Link de carpeta Google Drive *</label>
            <input
              type="url"
              value={importForm.folderUrl}
              onChange={(e) => setImportForm({ ...importForm, folderUrl: e.target.value })}
              className={inputClass}
              placeholder="https://drive.google.com/drive/folders/..."
            />
            <p className="text-xs text-gray-400 mt-1">Pega el link completo de la carpeta</p>
          </div>

          <div className="sm:col-span-2">
            <label className={labelClass}>Nombre base para las fotos *</label>
            <input
              type="text"
              value={importForm.titulo}
              onChange={(e) => setImportForm({ ...importForm, titulo: e.target.value })}
              className={inputClass}
              placeholder="ej: Sofia Garcia - XV Años"
            />
            <p className="text-xs text-gray-400 mt-1">Se agregará el nombre de cada foto</p>
          </div>

          <div>
            <label className={labelClass}>Categoría *</label>
            <select
              value={importForm.categoria}
              onChange={(e) =>
                setImportForm({
                  ...importForm,
                  categoria: e.target.value as 'xv' | 'boda' | 'empresarial',
                })
              }
              className={inputClass}
            >
              {['xv', 'boda', 'empresarial'].map((cat) => (
                <option key={cat} value={cat}>
                  {categoriaLabel[cat as keyof typeof categoriaLabel]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>Tipo de contenido *</label>
            <select
              value={importForm.tipoContenido}
              onChange={(e) =>
                setImportForm({
                  ...importForm,
                  tipoContenido: e.target.value as 'foto' | 'resumen' | 'plataforma360',
                })
              }
              className={inputClass}
            >
              {['foto', 'resumen', 'plataforma360'].map((tipo) => (
                <option key={tipo} value={tipo}>
                  {tipoLabel[tipo as keyof typeof tipoLabel]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>Fecha *</label>
            <input
              type="date"
              value={importForm.fecha}
              onChange={(e) => setImportForm({ ...importForm, fecha: e.target.value })}
              className={inputClass}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={importingFolder}
          className="w-full py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm"
        >
          {importingFolder ? 'Importando...' : '⚡ Importar carpeta'}
        </button>
      </form>

      {/* Formulario individual */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 border border-gray-100 space-y-4">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
          {editingId ? 'Editar' : 'Agregar'} elemento
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className={labelClass}>Título *</label>
            <input
              type="text"
              value={form.titulo}
              onChange={(e) => handleChange('titulo', e.target.value)}
              className={inputClass}
              placeholder="ej: Sofia Garcia - XV Años"
            />
          </div>

          <div>
            <label className={labelClass}>Categoría *</label>
            <select
              value={form.categoria}
              onChange={(e) => handleChange('categoria', e.target.value)}
              className={inputClass}
            >
              {CATEGORIAS.map((cat) => (
                <option key={cat} value={cat}>
                  {categoriaLabel[cat]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>Tipo de contenido *</label>
            <select
              value={form.tipo_contenido}
              onChange={(e) => handleChange('tipo_contenido', e.target.value)}
              className={inputClass}
            >
              {TIPOS_CONTENIDO.map((tipo) => (
                <option key={tipo} value={tipo}>
                  {tipoLabel[tipo]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>Fecha *</label>
            <input
              type="date"
              value={form.fecha}
              onChange={(e) => handleChange('fecha', e.target.value)}
              className={inputClass}
            />
          </div>

          <div className="sm:col-span-2">
            <label className={labelClass}>Seleccionar de Google Drive</label>
            {loadingGoogle ? (
              <p className="text-sm text-gray-400">Cargando archivos...</p>
            ) : archivosGoogle.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                {archivosGoogle.map((archivo) => (
                  <button
                    key={archivo.id}
                    type="button"
                    onClick={() => {
                      handleChange('contenido_url', archivo.url)
                      handleChange('titulo', archivo.nombre)
                    }}
                    className={`p-3 border-2 rounded-lg text-left text-sm transition-colors ${
                      form.contenido_url === archivo.url
                        ? 'border-[#C8A951] bg-[#C8A951]/5'
                        : 'border-gray-200 hover:border-[#C8A951]'
                    }`}
                  >
                    <div className="font-medium text-[#0A0A0A] truncate">
                      {archivo.tipo === 'imagen' ? '📸' : '▶'} {archivo.nombre}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 mb-4">No hay archivos en la carpeta</p>
            )}
          </div>

          <div className="sm:col-span-2">
            <label className={labelClass}>O pegar URL (Google Drive o YouTube) *</label>
            <input
              type="url"
              value={form.contenido_url}
              onChange={(e) => handleChange('contenido_url', e.target.value)}
              className={inputClass}
              placeholder="https://drive.google.com/file/d/... o https://www.youtube.com/watch?v=..."
            />
            <p className="text-xs text-gray-400 mt-1">
              Pega el link compartido de Drive o YouTube si prefieres
            </p>
          </div>

          <div className="sm:col-span-2">
            <label className={labelClass}>Descripción</label>
            <textarea
              value={form.descripcion}
              onChange={(e) => handleChange('descripcion', e.target.value)}
              className={inputClass}
              rows={2}
              placeholder="Descripción opcional"
            />
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-500 bg-red-50 px-4 py-3 rounded-lg">{error}</p>
        )}

        {success && (
          <p className="text-sm text-green-600 bg-green-50 px-4 py-3 rounded-lg">{success}</p>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isPending}
            className="flex-1 py-2 bg-[#C8A951] text-white font-semibold rounded-lg hover:bg-[#b8952f] transition-colors disabled:opacity-50 text-sm"
          >
            {isPending ? 'Guardando...' : editingId ? 'Actualizar' : 'Crear'}
          </button>

          {editingId && (
            <button
              type="button"
              onClick={() => {
                setEditingId(null)
                setForm({
                  titulo: '',
                  categoria: 'xv' as const,
                  tipo_contenido: 'foto' as const,
                  contenido_url: '',
                  fecha: new Date().toISOString().split('T')[0],
                  descripcion: '',
                })
              }}
              className="flex-1 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors text-sm"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      {/* Lista de items */}
      {loading ? (
        <p className="text-center text-gray-500">Cargando...</p>
      ) : items.length === 0 ? (
        <p className="text-center text-gray-500">No hay galerías aún</p>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="p-6">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
              Galerías ({items.length})
            </h2>

            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-[#C8A951] transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm text-[#0A0A0A]">{item.titulo}</span>
                      <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                        {categoriaLabel[item.categoria]}
                      </span>
                      <span className="text-xs px-2 py-1 bg-[#C8A951]/10 text-[#C8A951] rounded">
                        {tipoLabel[item.tipo_contenido]}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">{item.fecha}</p>
                    {item.descripcion && (
                      <p className="text-xs text-gray-400 mt-1">{item.descripcion}</p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(item)}
                      className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-xs font-medium transition-colors"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded text-xs font-medium transition-colors"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
