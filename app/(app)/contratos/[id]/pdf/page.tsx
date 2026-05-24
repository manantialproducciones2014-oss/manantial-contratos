import { createClient } from '@/lib/supabase'
import { formatMoney, formatDate } from '@/lib/utils'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import DownloadPdfButton from '@/components/contrato/DownloadPdfButton'

type ComboSnapshot = {
  nombre: string
  precio: number
  cuotas_cantidad: number
  cuotas_monto: number
  servicios: string[]
}

type AdicionalSnapshot = {
  nombre: string
  precio: number
}

type Pago = {
  id: string
  fecha: string
  monto: number
  metodo: string
  anotacion: string | null
}

export default async function PdfPage({ params }: { params: { id: string } }) {
  const supabase = createClient()

  const [{ data: contrato }, { data: pagos }] = await Promise.all([
    supabase.from('contratos').select('*').eq('id', params.id).single(),
    supabase.from('pagos').select('*').eq('contrato_id', params.id).order('fecha'),
  ])

  if (!contrato) notFound()

  const combo = contrato.combo_snapshot as ComboSnapshot | null
  const adicionales = (contrato.adicionales_snapshot ?? []) as AdicionalSnapshot[]
  const pagosList = (pagos ?? []) as Pago[]
  const totalPagado = pagosList.reduce((s, p) => s + p.monto, 0)
  const saldo = contrato.total - totalPagado

  const meses = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre']
  const fechaObj = new Date(contrato.fecha + 'T00:00:00')
  const fechaLarga = `${fechaObj.getDate()} de ${meses[fechaObj.getMonth()]} de ${fechaObj.getFullYear()}`

  return (
    <>
      <style>{`
        @media print { .no-print { display: none !important; } body { background: white !important; } .doc { box-shadow: none !important; border: none !important; } }
        @page { size: A4; margin: 1.5cm; }
        #contract-doc * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      `}</style>

      {/* Toolbar */}
      <div className="no-print flex items-center gap-3 mb-6">
        <Link href={`/contratos/${contrato.id}`} className="px-4 py-2 border border-gray-200 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-50 transition-colors">
          ← Volver
        </Link>
        <DownloadPdfButton filename={`Contrato-${contrato.numero}-${contrato.cliente_nombre}`} />
      </div>

      {/* Documento */}
      <div id="contract-doc" className="doc bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden text-[#0A0A0A]">

        {/* Banda superior */}
        <div className="h-2 bg-[#C8A951]" />

        <div className="px-12 py-10">

          {/* Encabezado */}
          <div className="flex items-start justify-between mb-8">
            <div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/manantial fotos videos con sombrita.png"
                alt="Manantial Producciones"
                className="h-36 w-auto object-contain"
              />
            </div>
            <div className="text-right">
              <div className="inline-block border-2 border-[#1E3558] px-6 py-3 text-right">
                <p className="text-xs font-bold text-[#1E3558] uppercase tracking-widest">
                  Contrato {contrato.numero}
                </p>
                <p className="text-sm text-gray-500 mt-1">{fechaLarga}</p>
              </div>
            </div>
          </div>

          {/* Divisor */}
          <div className="flex items-center gap-3 mb-8">
            <div className="h-px flex-1 bg-gray-200" />
            <div className="h-1 w-10 bg-[#C8A951] rounded-full" />
            <div className="h-px flex-1 bg-gray-200" />
          </div>

          {/* Cliente y evento */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <div className="bg-[#1E3558] px-4 py-2 rounded-t-lg">
                <h2 className="text-xs font-bold uppercase tracking-widest text-white">
                  Datos del Cliente
                </h2>
              </div>
              <div className="border border-t-0 border-gray-200 rounded-b-lg p-4">
                <table className="w-full">
                  <tbody>
                    {[
                      ['Nombre', contrato.cliente_nombre],
                      ['DNI', contrato.cliente_dni],
                      ['Teléfono', contrato.cliente_telefono],
                      contrato.cliente_email ? ['Email', contrato.cliente_email] : null,
                      contrato.cliente_direccion ? ['Dirección', contrato.cliente_direccion] : null,
                      contrato.cliente_localidad ? ['Localidad', `${contrato.cliente_localidad}${contrato.cliente_cp ? ` (${contrato.cliente_cp})` : ''}`] : null,
                    ].filter((x) => x !== null).map(([label, value], i) => (
                      <tr key={i}>
                        <td className="text-xs text-gray-400 py-1 pr-3 align-top w-20">{label}</td>
                        <td className="text-sm font-medium py-1">{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <div className="bg-[#1E3558] px-4 py-2 rounded-t-lg">
                <h2 className="text-xs font-bold uppercase tracking-widest text-white">
                  Datos del Evento
                </h2>
              </div>
              <div className="border border-t-0 border-gray-200 rounded-b-lg p-4">
                <table className="w-full">
                  <tbody>
                    {[
                      ['Tipo', contrato.tipo_evento],
                      contrato.evento_nombre ? ['Festejada', contrato.evento_nombre] : null,
                      contrato.evento_fecha ? ['Fecha', formatDate(contrato.evento_fecha)] : null,
                      contrato.evento_lugar ? ['Lugar', contrato.evento_lugar] : null,
                      contrato.evento_direccion ? ['Dirección', contrato.evento_direccion] : null,
                      contrato.evento_horario_desde ? ['Horario', `${contrato.evento_horario_desde} a ${contrato.evento_horario_hasta}`] : null,
                      contrato.evento_invitados ? ['Invitados', contrato.evento_invitados] : null,
                    ].filter((x) => x !== null).map(([label, value], i) => (
                      <tr key={i}>
                        <td className="text-xs text-gray-400 py-1 pr-3 align-top w-20">{label}</td>
                        <td className="text-sm font-medium py-1">{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Servicios */}
          <div className="mb-8">
            <div className="bg-[#1E3558] px-4 py-2 rounded-t-lg">
              <h2 className="text-xs font-bold uppercase tracking-widest text-white">
                Servicios Contratados
              </h2>
            </div>
            <div className="border border-t-0 border-gray-200 rounded-b-lg overflow-hidden">
              {combo && (
                <div className="p-5 bg-gray-50/40">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-bold text-[#0A0A0A] text-base">{combo.nombre}</span>
                    <span className="font-bold text-[#C8A951] text-xl">{formatMoney(combo.precio)}</span>
                  </div>
                  {combo.cuotas_cantidad > 1 && (
                    <p className="text-xs text-gray-400 mb-3">
                      {combo.cuotas_cantidad} cuotas de {formatMoney(combo.cuotas_monto)}
                    </p>
                  )}
                  <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                    {combo.servicios.map((s, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm text-gray-600">
                        <span className="text-[#C8A951] shrink-0 mt-0.5">✓</span>
                        {s}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {adicionales.length > 0 && (
                <div className="border-t border-gray-200 px-5 py-3">
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Adicionales</p>
                  <div className="space-y-1">
                    {adicionales.map((a, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span className="text-gray-700 flex gap-2"><span className="text-[#C8A951]">·</span>{a.nombre}</span>
                        <span className="font-semibold text-[#C8A951]">{formatMoney(a.precio)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Total */}
              <div className="bg-[#1E3558] px-5 py-3 flex items-center justify-between">
                <div>
                  <span className="text-white font-semibold text-sm">Total del Contrato</span>
                  <span className="text-blue-300 text-xs ml-3 capitalize">
                    · {contrato.metodo_pago}
                  </span>
                </div>
                <span className="text-[#C8A951] font-bold text-2xl">{formatMoney(contrato.total)}</span>
              </div>
            </div>
          </div>

          {/* Pagos */}
          {pagosList.length > 0 && (
            <div className="mb-8">
              <div className="bg-[#1E3558] px-4 py-2 rounded-t-lg">
                <h2 className="text-xs font-bold uppercase tracking-widest text-white">
                  Pagos Registrados
                </h2>
              </div>
              <div className="border border-t-0 border-gray-200 rounded-b-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      {['Fecha','Método','Detalle','Monto'].map(h => (
                        <th key={h} className="text-left text-xs text-gray-400 font-medium px-4 py-2">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {pagosList.map((p, i) => (
                      <tr key={p.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'}>
                        <td className="px-4 py-2">{formatDate(p.fecha)}</td>
                        <td className="px-4 py-2 capitalize">{p.metodo}</td>
                        <td className="px-4 py-2 text-gray-500">{p.anotacion ?? '—'}</td>
                        <td className="px-4 py-2 font-semibold text-green-700">{formatMoney(p.monto)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="border-t border-gray-200 bg-gray-50">
                    <tr>
                      <td colSpan={3} className="px-4 py-2 text-sm font-semibold text-right text-gray-600">Saldo pendiente</td>
                      <td className={`px-4 py-2 font-bold text-base ${saldo > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {formatMoney(saldo)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {/* Responsable del evento */}
          <div className="mb-8">
            <div className="bg-[#1E3558] px-4 py-2 rounded-t-lg">
              <h2 className="text-xs font-bold uppercase tracking-widest text-white">
                Responsable del Evento
              </h2>
            </div>
            <table className="w-full border border-t-0 border-gray-300 rounded-b-lg overflow-hidden text-sm">
              <tbody>
                <tr className="border-b border-gray-200">
                  <td className="px-4 py-2 border-r border-gray-200 w-24 text-xs text-gray-500">Nombre</td>
                  <td className="px-4 py-2 border-r border-gray-200 font-medium w-1/3">Andrés Zapata</td>
                  <td className="px-4 py-2 border-r border-gray-200 w-20 text-xs text-gray-500">DNI</td>
                  <td className="px-4 py-2 font-medium">36010684</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 border-r border-gray-200 text-xs text-gray-500">Teléfono</td>
                  <td className="px-4 py-2 border-r border-gray-200 font-medium">0341 3125437</td>
                  <td className="px-4 py-2 border-r border-gray-200 text-xs text-gray-500">Empresa</td>
                  <td className="px-4 py-2 font-medium">Manantial Producciones</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Términos */}
          <div className="mb-10">
            <div className="bg-[#C8A951] px-4 py-2 rounded-t-lg">
              <h2 className="text-xs font-bold uppercase tracking-widest text-white">
                Términos y Condiciones
              </h2>
            </div>
            <div className="border border-t-0 border-gray-200 rounded-b-lg p-4">
              <p className="text-xs text-gray-500 leading-relaxed">
                El Cliente reconoce y acuerda que la Empresa se reserva el derecho de utilizar dichas imágenes y video
                en cualquier momento y cualquier ocasión. El pago del anticipo es reembolsable (I) en un 80% cuando el
                presente Contrato sea cancelado con 6 (seis) meses de anticipación a la fecha del Evento, (ii) en un
                50% cuando el presente Contrato sea cancelado con 3 (tres) meses de anticipación, posterior a esta
                fecha de Evento, no tendrán reembolso alguno.
              </p>
            </div>
          </div>

          {/* Firmas */}
          <div className="grid grid-cols-2 gap-16 mt-2">
            <div>
              <div className="border-t-2 border-[#C8A951] pt-4">
                <p className="font-bold text-sm">{contrato.cliente_nombre}</p>
                <p className="text-xs text-gray-500 mt-0.5">DNI {contrato.cliente_dni}</p>
                <p className="text-xs text-gray-400 mt-3">Firma del cliente</p>
              </div>
            </div>
            <div>
              <div className="border-t-2 border-[#C8A951] pt-4">
                <p className="font-bold text-sm">Andrés Zapata</p>
                <p className="text-xs text-gray-500 mt-0.5">Manantial Producciones</p>
                <p className="text-xs text-gray-400 mt-3">Firma del responsable</p>
              </div>
            </div>
          </div>

        </div>

        {/* Banda inferior */}
        <div className="h-2 bg-[#C8A951]" />
      </div>
    </>
  )
}
