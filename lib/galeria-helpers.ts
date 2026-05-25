import { GaleriaItem } from '@/app/actions/galeria'

const MESES_ES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
]

export interface MonthYear {
  month: number
  year: number
  label: string
  key: string
}

export function getMonthYear(dateStr: string): MonthYear {
  const date = new Date(dateStr + 'T00:00:00')
  const month = date.getMonth() + 1
  const year = date.getFullYear()
  const label = `${MESES_ES[date.getMonth()]} ${year}`
  const key = `${year}-${String(month).padStart(2, '0')}`

  return { month, year, label, key }
}

export function groupGaleriaByCategoryAndDate(
  items: GaleriaItem[]
): Record<string, Record<string, GaleriaItem[]>> {
  const grouped: Record<string, Record<string, GaleriaItem[]>> = {}

  // Initialize all categories
  ;(['xv', 'boda', 'empresarial'] as const).forEach((cat) => {
    grouped[cat] = {}
  })

  // Group by category, then by month
  items.forEach((item) => {
    const { key } = getMonthYear(item.fecha)

    if (!grouped[item.categoria]) {
      grouped[item.categoria] = {}
    }

    if (!grouped[item.categoria][key]) {
      grouped[item.categoria][key] = []
    }

    grouped[item.categoria][key].push(item)
  })

  return grouped
}

export function getAvailableMonths(
  items: GaleriaItem[],
  categoria?: string
): Array<{ label: string; key: string }> {
  const filtered =
    categoria && categoria !== 'all' ? items.filter((i) => i.categoria === categoria) : items

  const months = new Set<string>()
  filtered.forEach((item) => {
    const { label, key } = getMonthYear(item.fecha)
    months.add(JSON.stringify({ label, key }))
  })

  const result = Array.from(months)
    .map((m) => JSON.parse(m))
    .sort((a, b) => b.key.localeCompare(a.key)) // Newest first

  return result
}

export function filterGaleriaByMonthAndCategory(
  items: GaleriaItem[],
  categoria: string,
  month?: string
): GaleriaItem[] {
  let filtered = items

  // Filter by category
  if (categoria && categoria !== 'all') {
    filtered = filtered.filter((i) => i.categoria === categoria)
  }

  // Filter by month
  if (month) {
    filtered = filtered.filter((i) => getMonthYear(i.fecha).key === month)
  }

  return filtered
}
