'use client'

import { createBrowserClient } from '@supabase/ssr'
import { useState } from 'react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    setSent(true)
    setLoading(false)
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#0A0A0A]">
      <div className="w-full max-w-sm p-8 bg-white rounded-xl shadow-2xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#0A0A0A] tracking-tight">
            Manantial
          </h1>
          <p className="text-sm text-gray-400 mt-1">Gestión de contratos</p>
        </div>

        {sent ? (
          <div className="py-4">
            <p className="font-medium text-[#0A0A0A]">Revisá tu correo</p>
            <p className="text-sm text-gray-500 mt-1">
              Te enviamos el link para ingresar a{' '}
              <span className="font-medium">{email}</span>
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C8A951] focus:border-transparent"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-[#C8A951] text-white text-sm font-semibold rounded-lg hover:bg-[#b8952f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Enviando...' : 'Ingresar'}
            </button>
          </form>
        )}
      </div>
    </main>
  )
}
