import Link from 'next/link'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F5F0E8]">
      <nav className="bg-[#0A0A0A] px-6 py-4 print:hidden">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <span className="text-white font-bold tracking-tight">Manantial</span>
          <div className="flex gap-6">
            <a
              href="https://manantial-web.manantialproducciones2014.workers.dev/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-[#C8A951] text-sm transition-colors"
            >
              Web
            </a>
            <Link
              href="/"
              className="text-gray-400 hover:text-[#C8A951] text-sm transition-colors"
            >
              Contratos
            </Link>
            <Link
              href="/combos"
              className="text-gray-400 hover:text-[#C8A951] text-sm transition-colors"
            >
              Combos
            </Link>
            <Link
              href="/portfolio"
              className="text-gray-400 hover:text-[#C8A951] text-sm transition-colors"
            >
              Portfolio
            </Link>
            <Link
              href="/galeria"
              className="text-gray-400 hover:text-[#C8A951] text-sm transition-colors"
            >
              Galería
            </Link>
          </div>
        </div>
      </nav>
      <div className="max-w-4xl mx-auto px-6 py-8">{children}</div>
    </div>
  )
}
