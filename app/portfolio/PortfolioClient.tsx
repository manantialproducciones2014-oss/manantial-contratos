'use client'

import { useState, useMemo } from 'react'
import { GaleriaItem } from '@/app/actions/galeria'
import { getMonthYear, getAvailableMonths, filterGaleriaByMonthAndCategory } from '@/lib/galeria-helpers'

interface PortfolioClientProps {
  initialItems: GaleriaItem[]
}

export default function PortfolioClient({ initialItems }: PortfolioClientProps) {
  const [activeCategory, setActiveCategory] = useState('all')
  const [activeMonth, setActiveMonth] = useState<string | null>(null)
  const [selectedItem, setSelectedItem] = useState<GaleriaItem | null>(null)
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0)

  const availableMonths = useMemo(() => {
    return getAvailableMonths(initialItems, activeCategory === 'all' ? undefined : activeCategory)
  }, [activeCategory, initialItems])

  const filteredItems = useMemo(() => {
    return filterGaleriaByMonthAndCategory(initialItems, activeCategory, activeMonth ?? undefined)
  }, [activeCategory, activeMonth, initialItems])

  const getThumbnail = (item: GaleriaItem): string => {
    return item.fotos[0] || ''
  }

  const categoriaLabel = {
    xv: 'XV Años',
    boda: 'Bodas',
    empresarial: 'Empresariales',
  }

  const handlePrevPhoto = () => {
    if (selectedItem) {
      setSelectedPhotoIndex(
        selectedPhotoIndex === 0 ? selectedItem.fotos.length - 1 : selectedPhotoIndex - 1
      )
    }
  }

  const handleNextPhoto = () => {
    if (selectedItem) {
      setSelectedPhotoIndex(
        selectedPhotoIndex === selectedItem.fotos.length - 1 ? 0 : selectedPhotoIndex + 1
      )
    }
  }

  // Group items by month for display
  const groupedByMonth = useMemo(() => {
    const groups: Record<string, GaleriaItem[]> = {}

    filteredItems.forEach((item) => {
      const { key } = getMonthYear(item.fecha)
      if (!groups[key]) {
        groups[key] = []
      }
      groups[key].push(item)
    })

    // Sort months by key (newest first)
    return Object.entries(groups).sort(([keyA], [keyB]) => keyB.localeCompare(keyA))
  }, [filteredItems])

  return (
    <>
      {/* Categories */}
      <div style={{ padding: '60px 20px', textAlign: 'center', maxWidth: '1200px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '2em', marginBottom: '40px', color: '#0A0A0A' }}>Nuestros Trabajos</h2>

        {/* Category filter buttons */}
        <div
          style={{
            display: 'flex',
            gap: '20px',
            justifyContent: 'center',
            flexWrap: 'wrap',
            marginBottom: '40px',
          }}
        >
          {[
            { value: 'all', label: 'Todos' },
            { value: 'xv', label: 'XV Años' },
            { value: 'boda', label: 'Bodas' },
            { value: 'empresarial', label: 'Empresariales' },
          ].map((cat) => (
            <button
              key={cat.value}
              onClick={() => {
                setActiveCategory(cat.value)
                setActiveMonth(null)
              }}
              style={{
                padding: '15px 30px',
                fontSize: '1.1em',
                border: `2px solid #C8A951`,
                background: activeCategory === cat.value ? '#C8A951' : '#F5F0E8',
                color: activeCategory === cat.value ? '#F5F0E8' : '#0A0A0A',
                cursor: 'pointer',
                borderRadius: '5px',
                fontWeight: '600',
                transition: 'all 0.3s',
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Month filter pills */}
        {availableMonths.length > 0 && (
          <div
            style={{
              display: 'flex',
              gap: '10px',
              justifyContent: 'center',
              flexWrap: 'wrap',
              marginBottom: '40px',
            }}
          >
            <button
              onClick={() => setActiveMonth(null)}
              style={{
                padding: '8px 16px',
                fontSize: '0.95em',
                border: `1px solid #C8A951`,
                background: activeMonth === null ? '#C8A951' : 'transparent',
                color: activeMonth === null ? '#F5F0E8' : '#C8A951',
                cursor: 'pointer',
                borderRadius: '20px',
                fontWeight: '500',
                transition: 'all 0.3s',
              }}
            >
              Todos los meses
            </button>

            {availableMonths.map(({ label, key }) => (
              <button
                key={key}
                onClick={() => setActiveMonth(key)}
                style={{
                  padding: '8px 16px',
                  fontSize: '0.95em',
                  border: `1px solid #C8A951`,
                  background: activeMonth === key ? '#C8A951' : 'transparent',
                  color: activeMonth === key ? '#F5F0E8' : '#C8A951',
                  cursor: 'pointer',
                  borderRadius: '20px',
                  fontWeight: '500',
                  transition: 'all 0.3s',
                }}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        {/* Gallery grouped by month */}
        {groupedByMonth.length === 0 ? (
          <p style={{ color: '#999', fontSize: '1.1em' }}>
            No hay contenido en esta categoría{activeMonth ? ' y mes' : ''}
          </p>
        ) : (
          <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '60px' }}>
            {groupedByMonth.map(([monthKey, items]) => {
              const { label: monthLabel } = getMonthYear(items[0].fecha)

              return (
                <div key={monthKey}>
                  {/* Month header */}
                  <h3
                    style={{
                      fontSize: '1.5em',
                      fontWeight: 'bold',
                      color: '#0A0A0A',
                      marginTop: '50px',
                      marginBottom: '30px',
                      paddingTop: '30px',
                      borderTop: '2px solid #E0D8D0',
                    }}
                  >
                    📅 {monthLabel}
                  </h3>

                  {/* Grid for this month */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                      gap: '30px',
                      marginBottom: '60px',
                    }}
                  >
                    {items.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => {
                          setSelectedItem(item)
                          setSelectedPhotoIndex(0)
                        }}
                        style={{
                          position: 'relative',
                          overflow: 'hidden',
                          borderRadius: '10px',
                          boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                          cursor: 'pointer',
                          transition: 'transform 0.3s',
                        }}
                        onMouseEnter={(e) => {
                          ;(e.currentTarget as HTMLDivElement).style.transform = 'translateY(-10px)'
                        }}
                        onMouseLeave={(e) => {
                          ;(e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'
                        }}
                      >
                        <div
                          style={{
                            width: '100%',
                            height: '300px',
                            background: '#ddd',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            position: 'relative',
                            backgroundImage: `url(${getThumbnail(item)})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                          }}
                        >
                          {item.fotos.length > 1 && (
                            <div
                              style={{
                                position: 'absolute',
                                top: '10px',
                                right: '10px',
                                background: 'rgba(0,0,0,0.7)',
                                color: '#C8A951',
                                padding: '5px 12px',
                                borderRadius: '20px',
                                fontSize: '0.9em',
                                fontWeight: '600',
                              }}
                            >
                              {item.fotos.length} fotos
                            </div>
                          )}
                        </div>

                        <div
                          style={{
                            position: 'absolute',
                            bottom: '0',
                            left: '0',
                            right: '0',
                            background: 'rgba(0,0,0,0.8)',
                            color: '#C8A951',
                            padding: '20px',
                          }}
                        >
                          <h3 style={{ fontSize: '1.2em', marginBottom: '5px' }}>{item.titulo}</h3>
                          <p style={{ fontSize: '0.9em', color: '#F5F0E8' }}>
                            {item.fecha} — {categoriaLabel[item.categoria]}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Modal */}
      {selectedItem && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
          onClick={() => setSelectedItem(null)}
        >
          <div
            style={{
              background: '#F5F0E8',
              borderRadius: '10px',
              maxWidth: '900px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto',
              position: 'relative',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedItem(null)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: '#0A0A0A',
                color: '#C8A951',
                border: 'none',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                fontSize: '1.5em',
                cursor: 'pointer',
                zIndex: 1001,
              }}
            >
              ✕
            </button>

            {/* Photo viewer */}
            <div style={{ position: 'relative', background: '#000' }}>
              <img
                src={selectedItem.fotos[selectedPhotoIndex]}
                alt={`${selectedItem.titulo} ${selectedPhotoIndex + 1}`}
                style={{ width: '100%', display: 'block', maxHeight: '60vh', objectFit: 'contain' }}
              />

              {/* Navigation buttons */}
              {selectedItem.fotos.length > 1 && (
                <>
                  <button
                    onClick={handlePrevPhoto}
                    style={{
                      position: 'absolute',
                      left: '20px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'rgba(200, 169, 81, 0.8)',
                      border: 'none',
                      color: '#0A0A0A',
                      fontSize: '2em',
                      width: '50px',
                      height: '50px',
                      borderRadius: '50%',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold',
                      transition: 'background 0.3s',
                    }}
                    onMouseEnter={(e) => {
                      ;(e.currentTarget as HTMLButtonElement).style.background =
                        'rgba(200, 169, 81, 1)'
                    }}
                    onMouseLeave={(e) => {
                      ;(e.currentTarget as HTMLButtonElement).style.background =
                        'rgba(200, 169, 81, 0.8)'
                    }}
                  >
                    ‹
                  </button>

                  <button
                    onClick={handleNextPhoto}
                    style={{
                      position: 'absolute',
                      right: '20px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'rgba(200, 169, 81, 0.8)',
                      border: 'none',
                      color: '#0A0A0A',
                      fontSize: '2em',
                      width: '50px',
                      height: '50px',
                      borderRadius: '50%',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold',
                      transition: 'background 0.3s',
                    }}
                    onMouseEnter={(e) => {
                      ;(e.currentTarget as HTMLButtonElement).style.background =
                        'rgba(200, 169, 81, 1)'
                    }}
                    onMouseLeave={(e) => {
                      ;(e.currentTarget as HTMLButtonElement).style.background =
                        'rgba(200, 169, 81, 0.8)'
                    }}
                  >
                    ›
                  </button>

                  {/* Photo counter */}
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '20px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      background: 'rgba(0,0,0,0.7)',
                      color: '#C8A951',
                      padding: '10px 20px',
                      borderRadius: '20px',
                      fontSize: '0.9em',
                      fontWeight: '600',
                    }}
                  >
                    {selectedPhotoIndex + 1} / {selectedItem.fotos.length}
                  </div>
                </>
              )}
            </div>

            {/* Info section */}
            <div style={{ padding: '30px' }}>
              <h2 style={{ color: '#0A0A0A', marginBottom: '10px', fontSize: '1.5em' }}>
                {selectedItem.titulo}
              </h2>
              <p style={{ color: '#666', marginBottom: '15px', fontSize: '0.95em' }}>
                {selectedItem.fecha} — {categoriaLabel[selectedItem.categoria]}
              </p>
              {selectedItem.descripcion && (
                <p style={{ color: '#666', marginTop: '15px', lineHeight: '1.6' }}>
                  {selectedItem.descripcion}
                </p>
              )}

              {/* Photo grid for navigation */}
              {selectedItem.fotos.length > 1 && (
                <div style={{ marginTop: '30px' }}>
                  <p style={{ color: '#0A0A0A', fontSize: '0.9em', marginBottom: '15px', fontWeight: '600' }}>
                    Ver todas las fotos:
                  </p>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
                      gap: '10px',
                    }}
                  >
                    {selectedItem.fotos.map((foto, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedPhotoIndex(idx)}
                        style={{
                          border:
                            idx === selectedPhotoIndex ? '3px solid #C8A951' : '2px solid #ccc',
                          borderRadius: '5px',
                          overflow: 'hidden',
                          cursor: 'pointer',
                          aspectRatio: '1',
                          backgroundImage: `url(${foto})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          transition: 'transform 0.2s',
                        }}
                        onMouseEnter={(e) => {
                          if (idx !== selectedPhotoIndex) {
                            ;(e.currentTarget as HTMLButtonElement).style.transform =
                              'scale(1.05)'
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (idx !== selectedPhotoIndex) {
                            ;(e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'
                          }
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
