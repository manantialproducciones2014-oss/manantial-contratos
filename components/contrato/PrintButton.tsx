'use client'

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="px-4 py-2 bg-[#C8A951] text-white text-sm font-semibold rounded-lg hover:bg-[#b8952f] transition-colors"
    >
      Imprimir
    </button>
  )
}
