'use client'

import { useEffect } from 'react'

export default function QuickAccess() {
  useEffect(() => {
    // Set cookie and redirect
    document.cookie = 'dev-code=manantial2026; path=/; max-age=604800'
    window.location.href = '/'
  }, [])

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>Entrando...</h1>
      <p>Si esto toma mucho tiempo, <a href="/">haz click aquí</a></p>
    </div>
  )
}
