'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function Portfolio() {
  const [activeCategory, setActiveCategory] = useState('all')

  const events = [
    { id: 1, category: 'xv', title: 'XV Años - Sofía', date: 'Octubre 2025', location: 'Rosario', color: '#FFB6C1' },
    { id: 2, category: 'xv', title: 'XV Años - Martina', date: 'Noviembre 2025', location: 'Rosario', color: '#FFD700' },
    { id: 3, category: 'boda', title: 'Boda - María & Juan', date: 'Septiembre 2025', location: 'Rosario', color: '#FFF0F5' },
    { id: 4, category: 'boda', title: 'Boda - Ceremonia Religiosa', date: 'Agosto 2025', location: 'Rosario', color: '#FFFACD' },
    { id: 5, category: 'empresarial', title: 'Lanzamiento de Producto', date: 'Julio 2025', location: 'Rosario', color: '#E6F0FF' },
    { id: 6, category: 'empresarial', title: 'Convención Anual', date: 'Junio 2025', location: 'Rosario', color: '#F0F0F0' },
  ]

  const filteredEvents = activeCategory === 'all' ? events : events.filter(e => e.category === activeCategory)

  return (
    <div style={{ backgroundColor: '#F5F0E8', minHeight: '100vh', color: '#0A0A0A' }}>
      {/* Header */}
      <header style={{
        background: 'linear-gradient(135deg, #0A0A0A 0%, #1a1a1a 100%)',
        color: '#C8A951',
        padding: '40px 20px',
        textAlign: 'center',
        borderBottom: '3px solid #C8A951',
      }}>
        <h1 style={{ fontSize: '2.5em', marginBottom: '10px' }}>✦ MANANTIAL PRODUCCIONES ✦</h1>
        <p style={{ fontSize: '1.1em', color: '#F5F0E8' }}>Producción de Eventos Premium</p>
        <div style={{ marginTop: '20px', display: 'flex', gap: '20px', justifyContent: 'center' }}>
          <a href="https://manantial-web.manantialproducciones2014.workers.dev/" target="_blank" rel="noopener noreferrer" style={{
            color: '#C8A951',
            textDecoration: 'none',
            fontSize: '0.95em',
            fontWeight: '600',
          }}>
            🌐 Ir a Web
          </a>
          <Link href="/" style={{
            color: '#C8A951',
            textDecoration: 'none',
            fontSize: '0.95em',
            fontWeight: '600',
          }}>
            ← Volver a la App
          </Link>
        </div>
      </header>

      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, #0A0A0A 0%, #1a1a1a 100%)',
        color: '#C8A951',
        padding: '80px 20px',
        textAlign: 'center',
        fontSize: '2em',
        fontStyle: 'italic',
      }}>
        Tus Eventos, Nuestro Arte
      </div>

      {/* Categories */}
      <div style={{ padding: '60px 20px', textAlign: 'center', maxWidth: '1200px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '2em', marginBottom: '40px', color: '#0A0A0A' }}>Nuestros Trabajos</h2>

        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '60px' }}>
          {[
            { value: 'all', label: 'Todos' },
            { value: 'xv', label: 'XV Años' },
            { value: 'boda', label: 'Bodas' },
            { value: 'empresarial', label: 'Empresariales' },
          ].map(cat => (
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
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '30px',
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 0 60px 0',
        }}>
          {filteredEvents.map(event => (
            <div
              key={event.id}
              style={{
                position: 'relative',
                overflow: 'hidden',
                borderRadius: '10px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                cursor: 'pointer',
                transition: 'transform 0.3s',
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-10px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{
                width: '100%',
                height: '300px',
                background: event.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2em',
                color: '#0A0A0A',
                fontWeight: 'bold',
              }}>
                {event.title.split('-')[0]}
              </div>
              <div style={{
                position: 'absolute',
                bottom: '0',
                left: '0',
                right: '0',
                background: 'rgba(0,0,0,0.8)',
                color: '#C8A951',
                padding: '20px',
              }}>
                <h3 style={{ fontSize: '1.2em', marginBottom: '5px' }}>{event.title}</h3>
                <p style={{ fontSize: '0.9em', color: '#F5F0E8' }}>{event.date} — {event.location}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{
        background: '#0A0A0A',
        color: '#C8A951',
        padding: '60px 20px',
        textAlign: 'center',
      }}>
        <h2 style={{ fontSize: '2em', marginBottom: '20px' }}>¿Tu Evento Merece Manantial?</h2>
        <p style={{ fontSize: '1.1em', marginBottom: '30px', color: '#F5F0E8' }}>
          Contamos con experiencia en los tres tipos de eventos. Llevamos tu visión al siguiente nivel.
        </p>
        <Link href="/nuevo" style={{
          display: 'inline-block',
          padding: '18px 50px',
          fontSize: '1.1em',
          background: '#C8A951',
          color: '#0A0A0A',
          borderRadius: '5px',
          textDecoration: 'none',
          fontWeight: '700',
          transition: 'all 0.3s',
        }}
          onMouseEnter={e => {
            e.currentTarget.style.background = '#E8C961'
            e.currentTarget.style.transform = 'scale(1.05)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = '#C8A951'
            e.currentTarget.style.transform = 'scale(1)'
          }}
        >
          Solicitar Presupuesto
        </Link>
      </div>

      {/* Footer */}
      <footer style={{
        background: '#1a1a1a',
        color: '#C8A951',
        padding: '40px 20px',
        textAlign: 'center',
        borderTop: '3px solid #C8A951',
      }}>
        <h3>MANANTIAL PRODUCCIONES</h3>
        <div style={{ marginTop: '20px', fontSize: '0.9em', color: '#F5F0E8' }}>
          <p>📞 341 3125437</p>
          <p>📧 manantialproducciones@hotmail.com</p>
          <p>📍 Rosario, Santa Fe, Argentina</p>
          <p style={{ marginTop: '20px', fontSize: '0.8em' }}>Responsable: Andrés Zapata | DNI: 36010684</p>
        </div>
      </footer>
    </div>
  )
}
