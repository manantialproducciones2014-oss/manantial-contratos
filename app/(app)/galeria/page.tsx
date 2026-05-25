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

const categoriaLabel = {
  xv: 'XV Años',
  boda: 'Boda',
  empresarial: 'Empresarial',
}

export default function GaleriaPage() {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [items, setItems] = useState<GaleriaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [editingItem, setEditingItem] = useState<GaleriaItem | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [archivosGoogle, setArchivosGoogle] = useState<
    Array<{ id: string; nombre: string; tipo: string; url: string }>
  >([])
  const [loadingGoogle, setLoadingGoogle] = useState(false)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  const [importForm, setImportForm] = useState({
    folderUrl: '',
    titulo: '',
    categoria: 'xv' as const,
    fecha: new Date().toISOString().split('T')[0],
  })
  const [importingFolder, setImportingFolder] = useState(false)

  const [form, setForm] = useState<{
    titulo: string
    categoria: 'xv' | 'boda' | 'empresarial'
    fotos: string[]
    fecha: string
    descripcion: string
  }>({
    titulo: '',
    categoria: 'xv',
    fotos: [],
    fecha: new Date().toISOString().split('T')[0],
    descripcion: '',
  })

  const [newPhotoUrl, setNewPhotoUrl] = useState('')

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

  function openEditModal(item: GaleriaItem) {
    setEditingItem(item)
    setForm({
      titulo: item.titulo,
      categoria: item.categoria,
      fotos: [...item.fotos],
      fecha: item.fecha,
      descripcion: item.descripcion || '',
    })
    setShowEditModal(true)
  }

  function closeEditModal() {
    setShowEditModal(false)
    setEditingItem(null)
    setForm({
      titulo: '',
      categoria: 'xv',
      fotos: [],
      fecha: new Date().toISOString().split('T')[0],
      descripcion: '',
    })
  }

  function handleDragStart(e: React.DragEvent, index: number) {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = 'move'
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  function handleDrop(e: React.DragEvent, targetIndex: number) {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === targetIndex) return

    const newFotos = [...form.fotos]
    const draggedFoto = newFotos[draggedIndex]
    newFotos.splice(draggedIndex, 1)
    newFotos.splice(targetIndex, 0, draggedFoto)

    setForm({ ...form, fotos: newFotos })
    setDraggedIndex(null)
  }

  function removePhoto(index: number) {
    setForm({
      ...form,
      fotos: form.fotos.filter((_, i) => i !== index),
    })
  }

  function addPhotoFromUrl() {
    if (newPhotoUrl.trim() && !form.fotos.includes(newPhotoUrl)) {
      setForm({
        ...form,
        fotos: [...form.fotos, newPhotoUrl],
      })
      setNewPhotoUrl('')
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!form.titulo.trim()) return setError('El título es requerido')
    if (form.fotos.length === 0) return setError('Debes agregar al menos una foto')

    startTransition(async () => {
      try {
        if (editingItem) {
          await actualizarGaleriaItem(editingItem.id, form)
          setSuccess('Galería actualizada')
          closeEditModal()
        } else {
          await crearGaleriaItem(form)
          setSuccess('Galería creada')
        }

        setForm({
          titulo: '',
          categoria: 'xv',
          fotos: [],
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

  async function handleImportFolder(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!importForm.folderUrl.trim()) return setError('El link de la carpeta es requerido')
    if (!importForm.titulo.trim()) return setError('El título es requerido')

    setImportingFolder(true)

    try {
      await importarCarpetaGoogle({
        folderUrl: importForm.folderUrl,
        titulo: importForm.titulo,
        categoria: importForm.categoria,
        fecha: importForm.fecha,
      })

      setSuccess('Carpeta importada exitosamente')

      setImportForm({
        folderUrl: '',
        titulo: '',
        categoria: 'xv',
        fecha: new Date().toISOString().split('T')[0],
      })

      await loadItems()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al importar carpeta')
    } finally {
      setImportingFolder(false)
    }
  }

  if (loading) return <div className="p-6 text-center">Cargando...</div>

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#0A0A0A]">Galería</h1>

      {error && <p className="text-sm text-red-500 bg-red-50 px-4 py-3 rounded-lg">{error}</p>}
      {success && <p className="text-sm text-green-600 bg-green-50 px-4 py-3 rounded-lg">{success}</p>}

      {/* Importar carpeta */}
      <form
        onSubmit={handleImportFolder}
        className="bg-blue-50 rounded-xl p-6 border-2 border-blue-200 space-y-4"
      >
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
            <label className={labelClass}>Nombre para la galería *</label>
            <input
              type="text"
              value={importForm.titulo}
              onChange={(e) => setImportForm({ ...importForm, titulo: e.target.value })}
              className={inputClass}
              placeholder="ej: Sofia Garcia - XV Años"
            />
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

      {/* Botón para agregar nueva */}
      <button
        onClick={() => {
          setEditingItem(null)
          setForm({
            titulo: '',
            categoria: 'xv',
            fotos: [],
            fecha: new Date().toISOString().split('T')[0],
            descripcion: '',
          })
          setShowEditModal(true)
        }}
        className="w-full py-2 bg-[#C8A951] text-white font-semibold rounded-lg hover:bg-[#b8952f] transition-colors"
      >
        + Agregar nueva galería
      </button>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-[#0A0A0A]">
                {editingItem ? 'Editar Galería' : 'Nueva Galería'}
              </h2>
              <button
                onClick={closeEditModal}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className={labelClass}>Título *</label>
                <input
                  type="text"
                  value={form.titulo}
                  onChange={(e) => handleChange('titulo', e.target.value)}
                  className={inputClass}
                  placeholder="ej: Sofia Garcia - XV Años"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Categoría *</label>
                  <select
                    value={form.categoria}
                    onChange={(e) =>
                      handleChange('categoria', e.target.value)
                    }
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
                  <label className={labelClass}>Fecha *</label>
                  <input
                    type="date"
                    value={form.fecha}
                    onChange={(e) => handleChange('fecha', e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>Descripción</label>
                <textarea
                  value={form.descripcion}
                  onChange={(e) => handleChange('descripcion', e.target.value)}
                  className={inputClass}
                  rows={2}
                  placeholder="Descripción opcional"
                />
              </div>

              {/* Photo Management */}
              <div className="border-t pt-4">
                <h3 className="font-semibold text-[#0A0A0A] mb-3">
                  📸 Fotos ({form.fotos.length})
                </h3>

                {/* Drag-drop area */}
                {form.fotos.length > 0 && (
                  <div className="space-y-2 mb-4">
                    <p className="text-xs text-gray-500">Arrastra para reordenar:</p>
                    {form.fotos.map((foto, idx) => (
                      <div
                        key={idx}
                        draggable
                        onDragStart={(e) => handleDragStart(e, idx)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, idx)}
                        className={`flex items-center gap-3 p-3 border-2 rounded-lg cursor-move transition-colors ${
                          draggedIndex === idx
                            ? 'border-[#C8A951] bg-[#C8A951]/5'
                            : 'border-gray-200 hover:border-[#C8A951]'
                        }`}
                      >
                        <span className="text-lg">☰</span>
                        <span className="flex-1 text-sm text-gray-600 truncate">
                          {idx + 1}. Foto
                        </span>
                        <button
                          type="button"
                          onClick={() => removePhoto(idx)}
                          className="text-red-500 hover:text-red-700 font-bold"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add photo */}
                <div className="flex gap-2 mb-4">
                  <input
                    type="url"
                    value={newPhotoUrl}
                    onChange={(e) => setNewPhotoUrl(e.target.value)}
                    placeholder="URL de foto"
                    className={inputClass}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addPhotoFromUrl()
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={addPhotoFromUrl}
                    className="px-4 py-2 bg-[#C8A951] text-white font-semibold rounded-lg hover:bg-[#b8952f] transition-colors text-sm whitespace-nowrap"
                  >
                    Agregar
                  </button>
                </div>

                {/* Drive files selector */}
                {loadingGoogle ? (
                  <p className="text-sm text-gray-400">Cargando archivos de Drive...</p>
                ) : archivosGoogle.length > 0 ? (
                  <div>
                    <p className="text-xs text-gray-500 mb-2">O selecciona de Google Drive:</p>
                    <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                      {archivosGoogle.map((archivo) => (
                        <button
                          key={archivo.id}
                          type="button"
                          onClick={() => {
                            const url = archivo.url
                            if (!form.fotos.includes(url)) {
                              setForm({ ...form, fotos: [...form.fotos, url] })
                            }
                          }}
                          className={`p-2 border-2 rounded text-xs transition-colors ${
                            form.fotos.includes(archivo.url)
                              ? 'border-[#C8A951] bg-[#C8A951]/5'
                              : 'border-gray-200 hover:border-[#C8A951]'
                          }`}
                        >
                          {archivo.tipo === 'imagen' ? '📸' : '▶'} {archivo.nombre}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 justify-end border-t pt-4">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="px-4 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-4 py-2 bg-[#C8A951] text-white font-semibold rounded-lg hover:bg-[#b8952f] transition-colors disabled:opacity-50"
                >
                  {isPending ? 'Guardando...' : editingItem ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Gallery List */}
      <div className="bg-white rounded-xl p-6 border border-gray-100 space-y-2">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
          Galerías ({items.length})
        </h2>

        {items.length === 0 ? (
          <p className="text-sm text-gray-500">No hay galerías. Crea una nueva o importa una carpeta.</p>
        ) : (
          <div className="space-y-2">
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
                      📸 {item.fotos.length} foto{item.fotos.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">{item.fecha}</p>
                  {item.descripcion && (
                    <p className="text-xs text-gray-400 mt-1">{item.descripcion}</p>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => openEditModal(item)}
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
        )}
      </div>
    </div>
  )
}
