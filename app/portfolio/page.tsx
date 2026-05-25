import Link from 'next/link'
import { obtenerGaleriaActiva } from '@/app/actions/galeria'
import PortfolioClient from './PortfolioClient'

export default async function Portfolio() {
  const galeria = await obtenerGaleriaActiva()

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
          <a
            href="https://manantial-web.manantialproducciones2014.workers.dev/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: '#C8A951',
              textDecoration: 'none',
              fontSize: '0.95em',
              fontWeight: '600',
            }}
          >
            🌐 Ir a Web
          </a>
          <Link
            href="/"
            style={{
              color: '#C8A951',
              textDecoration: 'none',
              fontSize: '0.95em',
              fontWeight: '600',
            }}
          >
            ← Volver a la App
          </Link>
        </div>
      </header>

      {/* Hero */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0A0A0A 0%, #1a1a1a 100%)',
          color: '#C8A951',
          padding: '80px 20px',
          textAlign: 'center',
          fontSize: '2em',
          fontStyle: 'italic',
        }}
      >
        Tus Eventos, Nuestro Arte
      </div>

      {/* Gallery Section */}
      <PortfolioClient initialItems={galeria} />

      {/* CTA */}
      <div
        style={{
          background: '#0A0A0A',
          color: '#C8A951',
          padding: '60px 20px',
          textAlign: 'center',
        }}
      >
        <h2 style={{ fontSize: '2em', marginBottom: '20px' }}>¿Tu Evento Merece Manantial?</h2>
        <p style={{ fontSize: '1.1em', marginBottom: '30px', color: '#F5F0E8' }}>
          Contamos con experiencia en los tres tipos de eventos. Llevamos tu visión al siguiente nivel.
        </p>
        <Link
          href="/nuevo"
          style={{
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
        >
          Solicitar Presupuesto
        </Link>
      </div>

      {/* Footer */}
      <footer
        style={{
          background: '#1a1a1a',
          color: '#C8A951',
          padding: '40px 20px',
          textAlign: 'center',
          borderTop: '3px solid #C8A951',
        }}
      >
        <h3>MANANTIAL PRODUCCIONES</h3>
        <div style={{ marginTop: '20px', fontSize: '0.9em', color: '#F5F0E8' }}>
          <p>📞 341 3125437</p>
          <p>📧 manantialproducciones@hotmail.com</p>
          <p>📍 Rosario, Santa Fe, Argentina</p>
          <p style={{ marginTop: '20px', fontSize: '0.8em' }}>
            Responsable: Andrés Zapata | DNI: 36010684
          </p>
        </div>
      </footer>
    </div>
  )
}
