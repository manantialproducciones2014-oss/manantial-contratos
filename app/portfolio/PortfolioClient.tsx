'use client'

import { useState } from 'react'
import { GaleriaItem } from '@/app/actions/galeria'

interface PortfolioClientProps {
  initialItems: GaleriaItem[]
}

export default function PortfolioClient({ initialItems }: PortfolioClientProps) {
  const [activeCategory, setActiveCategory] = useState('all')
  const [selectedItem, setSelectedItem] = useState<GaleriaItem | null>(null)

  const filteredItems =
    activeCategory === 'all'
      ? initialItems
      : initialItems.filter((item) => item.categoria === activeCategory)

  const getThumbnail = (item: GaleriaItem): string => {
    if (item.tipo_contenido === 'foto') {
      return item.contenido_url
    }

    if (item.tipo_contenido === 'resumen') {
      if (item.contenido_url.includes('youtube.com') || item.contenido_url.includes('youtu.be')) {
        const videoId = extractYouTubeId(item.contenido_url)
        return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
      }
      return getDriveImageUrl(item.contenido_url)
    }

    if (item.tipo_contenido === 'plataforma360') {
      if (item.contenido_url.includes('youtube.com') || item.contenido_url.includes('youtu.be')) {
        const videoId = extractYouTubeId(item.contenido_url)
        return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
      }
      return getDriveImageUrl(item.contenido_url)
    }

    return ''
  }

  const extractYouTubeId = (url: string): string => {
    const match =
      url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/) ||
      url.match(/youtube\.com\/embed\/([^"&?\s]+)/)
    return match ? match[1] : ''
  }

  const getDriveImageUrl = (url: string): string => {
    const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/)
    if (match) {
      return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w500`
    }
    return url
  }

  const getEmbedUrl = (item: GaleriaItem): string => {
    if (item.contenido_url.includes('youtube.com') || item.contenido_url.includes('youtu.be')) {
      const videoId = extractYouTubeId(item.contenido_url)
      return `https://www.youtube.com/embed/${videoId}`
    }

    if (item.contenido_url.includes('drive.google.com')) {
      const match = item.contenido_url.match(/\/d\/([a-zA-Z0-9-_]+)/)
      if (match) {
        return `https://drive.google.com/file/d/${match[1]}/preview`
      }
    }

    return item.contenido_url
  }

  const tipoIcon = {
    foto: '📸',
    resumen: '▶',
    plataforma360: '360°',
  }

  const categoriaLabel = {
    xv: 'XV Años',
    boda: 'Bodas',
    empresarial: 'Empresariales',
  }

  return (
    <>
      {/* Categories */}
      <div style={{ padding: '60px 20px', textAlign: 'center', maxWidth: '1200px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '2em', marginBottom: '40px', color: '#0A0A0A' }}>Nuestros Trabajos</h2>

        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '60px' }}>
          {[
            { value: 'all', label: 'Todos' },
            { value: 'xv', label: 'XV Años' },
            { value: 'boda', label: 'Bodas' },
            { value: 'empresarial', label: 'Empresariales' },
          ].map((cat) => (
            <button
              key={cat.value}
              onClick={() => setActiveCategory(cat.value)}
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

        {/* Gallery */}
        {filteredItems.length === 0 ? (
          <p style={{ color: '#999', fontSize: '1.1em' }}>No hay contenido en esta categoría</p>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '30px',
              maxWidth: '1200px',
              margin: '0 auto',
              padding: '0 0 60px 0',
            }}
          >
            {filteredItems.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedItem(item)}
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
                  {item.tipo_contenido !== 'foto' && (
                    <div
                      style={{
                        position: 'absolute',
                        fontSize: '3em',
                        opacity: 0.9,
                        filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.5))',
                      }}
                    >
                      {tipoIcon[item.tipo_contenido]}
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

            {selectedItem.tipo_contenido === 'foto' && (
              <img
                src={selectedItem.contenido_url}
                alt={selectedItem.titulo}
                style={{ width: '100%', display: 'block' }}
              />
            )}

            {(selectedItem.tipo_contenido === 'resumen' || selectedItem.tipo_contenido === 'plataforma360') && (
              <div style={{ padding: '20px' }}>
                <iframe
                  width="100%"
                  height="500px"
                  src={getEmbedUrl(selectedItem)}
                  title={selectedItem.titulo}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />

                <div style={{ marginTop: '20px' }}>
                  <h2 style={{ color: '#0A0A0A', marginBottom: '10px' }}>{selectedItem.titulo}</h2>
                  <p style={{ color: '#666', marginBottom: '10px' }}>
                    {selectedItem.fecha} — {categoriaLabel[selectedItem.categoria]}
                  </p>
                  {selectedItem.descripcion && (
                    <p style={{ color: '#666', marginTop: '15px' }}>{selectedItem.descripcion}</p>
                  )}

                  {selectedItem.tipo_contenido === 'plataforma360' && (
                    <a
                      href={selectedItem.contenido_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-block',
                        marginTop: '20px',
                        padding: '12px 30px',
                        background: '#C8A951',
                        color: '#0A0A0A',
                        textDecoration: 'none',
                        borderRadius: '5px',
                        fontWeight: '600',
                        transition: 'background 0.3s',
                      }}
                      onMouseEnter={(e) => {
                        ;(e.currentTarget as HTMLAnchorElement).style.background = '#B8952F'
                      }}
                      onMouseLeave={(e) => {
                        ;(e.currentTarget as HTMLAnchorElement).style.background = '#C8A951'
                      }}
                    >
                      Ver en tamaño completo →
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
