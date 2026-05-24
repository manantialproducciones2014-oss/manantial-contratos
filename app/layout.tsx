import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Manantial Contratos',
  description: 'Gestión de contratos y pagos — Manantial Producciones',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
