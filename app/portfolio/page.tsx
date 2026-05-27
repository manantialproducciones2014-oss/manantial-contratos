import Link from 'next/link'
import { Playfair_Display } from 'next/font/google'
import { obtenerGaleriaActiva } from '@/app/actions/galeria'
import PortfolioClient from './PortfolioClient'

const playfair = Playfair_Display({ subsets: ['latin'], display: 'swap' })

export default async function Portfolio() {
  const galeria = await obtenerGaleriaActiva()

  return (
    <div style={{ backgroundColor: '#F5F0E8', minHeight: '100vh', color: '#0A0A0A' }}>
      {/* Header */}
      <header style={{
        background: 'linear-gradient(135deg, #0A0A0A 0%, #1a1a1a 100%)',
        color: '#C8A951',
        padding: '32px 20px',
        textAlign: 'center',
        borderBottom: '2px solid #C8A951',
      }}>
        <h1 className={playfair.className} style={{ fontSize: '2.2em', marginBottom: '8px', letterSpacing: '0.08em' }}>
          ✦ MANANTIAL PRODUCCIONES ✦
        </h1>
        <p style={{ fontSize: '0.95em', color: '#C8A951', letterSpacing: '0.2em', textTransform: 'uppercase', opacity: 0.85 }}>
          Producción de Eventos Premium · Rosario
        </p>
        <div style={{ marginTop: '20px', display: 'flex', gap: '24px', justifyContent: 'center' }}>
          <a
            href="https://manantial-web.manantialproducciones2014.workers.dev/"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#C8A951', textDecoration: 'none', fontSize: '0.85em', letterSpacing: '0.05em' }}
          >
            🌐 Sitio Web
          </a>
          <Link
            href="/"
            style={{ color: '#C8A951', textDecoration: 'none', fontSize: '0.85em', letterSpacing: '0.05em' }}
          >
            ← App
          </Link>
        </div>
      </header>

      {/* Hero */}
      <div
        style={{
          background: 'linear-gradient(160deg, #0A0A0A 0%, #1c1711 60%, #0A0A0A 100%)',
          color: '#C8A951',
          padding: '100px 20px',
          textAlign: 'center',
          borderBottom: '1px solid #2a2a2a',
        }}
      >
        <p style={{ fontSize: '0.8em', letterSpacing: '0.35em', textTransform: 'uppercase', color: '#C8A951', opacity: 0.7, marginBottom: '24px' }}>
          FOTOGRAFÍA · VIDEO · PRODUCCIÓN
        </p>
        <h2 className={playfair.className} style={{ fontSize: 'clamp(2em, 6vw, 4em)', fontStyle: 'italic', lineHeight: 1.2, color: '#C8A951' }}>
          Tus Eventos, Nuestro Arte
        </h2>
        <div style={{ width: '60px', height: '2px', background: '#C8A951', margin: '32px auto 0', opacity: 0.6 }} />
      </div>

      {/* Gallery Section */}
      <PortfolioClient initialItems={galeria} playfairClass={playfair.className} />

      {/* CTA */}
      <div
        style={{
          background: '#0A0A0A',
          color: '#C8A951',
          padding: '80px 20px',
          textAlign: 'center',
          borderTop: '1px solid #222',
        }}
      >
        <p style={{ fontSize: '0.75em', letterSpacing: '0.3em', textTransform: 'uppercase', opacity: 0.6, marginBottom: '20px' }}>
          EMPECEMOS JUNTOS
        </p>
        <h2 className={playfair.className} style={{ fontSize: 'clamp(1.6em, 4vw, 2.8em)', marginBottom: '20px', fontStyle: 'italic' }}>
          ¿Tu Evento Merece Manantial?
        </h2>
        <p style={{ fontSize: '1em', marginBottom: '40px', color: '#F5F0E8', opacity: 0.75, maxWidth: '500px', margin: '0 auto 40px', lineHeight: 1.7 }}>
          XV Años, Bodas y Eventos Empresariales. Llevamos tu visión al siguiente nivel.
        </p>
        <a
          href="https://wa.me/543413125437?text=Hola%2C%20me%20interesa%20solicitar%20un%20presupuesto%20para%20mi%20evento."
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-block',
            padding: '18px 56px',
            fontSize: '0.95em',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            background: '#C8A951',
            color: '#0A0A0A',
            borderRadius: '3px',
            textDecoration: 'none',
            fontWeight: '700',
          }}
        >
          Solicitar Presupuesto
        </a>
      </div>

      {/* Footer */}
      <footer
        style={{
          background: '#111',
          color: '#C8A951',
          padding: '48px 20px',
          textAlign: 'center',
          borderTop: '2px solid #C8A951',
        }}
      >
        <h3 className={playfair.className} style={{ fontSize: '1.3em', letterSpacing: '0.12em', marginBottom: '24px' }}>
          MANANTIAL PRODUCCIONES
        </h3>
        <div style={{ fontSize: '0.88em', color: '#F5F0E8', opacity: 0.75, lineHeight: 2 }}>
          <p>📞 341 3125437</p>
          <p>📧 manantialproducciones@hotmail.com</p>
          <p>📍 Rosario, Santa Fe, Argentina</p>
          <p style={{ marginTop: '16px', fontSize: '0.8em', opacity: 0.5 }}>
            Responsable: Andrés Zapata | DNI: 36010684
          </p>
        </div>
      </footer>
    </div>
  )
}
