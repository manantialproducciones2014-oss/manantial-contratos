'use client'

export default function QuickAccess() {
  // Set cookie and redirect on mount
  if (typeof window !== 'undefined') {
    document.cookie = 'dev-code=manantial2026; path=/; max-age=604800; SameSite=Lax'
    window.location.href = '/'
  }

  return (
    <div style={{ padding: '20px', textAlign: 'center', fontFamily: 'sans-serif' }}>
      <h1>Entrando...</h1>
      <p>Redirigiendo a la app...</p>
    </div>
  )
}
