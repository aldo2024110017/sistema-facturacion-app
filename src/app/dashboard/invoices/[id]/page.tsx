import Link from 'next/link'
import { getInvoiceById } from '@/actions/invoices'

type InvoiceDetailPageProps = {
  params: Promise<{
    id: string
  }>
}

export default async function InvoiceDetailPage({
  params,
}: InvoiceDetailPageProps) {
  const { id } = await params
  const invoice = await getInvoiceById(id)

  function formatCurrency(value: number) {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(value)
  }

  function formatDate(value: string) {
    return new Intl.DateTimeFormat('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(value))
  }

  function getStatusLabel(status: string) {
    switch (status) {
      case 'draft':
        return 'Borrador'

      case 'issued':
        return 'Emitida'

      case 'paid':
        return 'Pagada'

      case 'cancelled':
        return 'Cancelada'

      default:
        return status
    }
  }

  return (
    <main className="mx-auto max-w-6xl p-6">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-medium text-blue-600">
            Factura
          </p>

          <h2 className="mt-1 text-2xl font-bold text-gray-900">
            {invoice.invoice_number}
          </h2>

          <p className="mt-2 text-sm text-gray-600">
            Creada el {formatDate(invoice.created_at)}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="rounded-full bg-gray-100 px-3 py-1.5 text-sm font-semibold text-gray-700">
            {getStatusLabel(invoice.status)}
          </span>

          <Link
            href="/dashboard/invoices"
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            Volver a facturas
          </Link>
        </div>
      </div>

      <section className="mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="mb-5 text-lg font-semibold text-gray-900">
          Información del cliente
        </h3>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="text-sm text-gray-500">
              Nombre
            </p>

            <p className="mt-1 font-medium text-gray-900">
              {invoice.clients?.name ?? '—'}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">
              RFC
            </p>

            <p className="mt-1 font-medium text-gray-900">
              {invoice.clients?.tax_id ?? '—'}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">
              Email
            </p>

            <p className="mt-1 font-medium text-gray-900">
              {invoice.clients?.email ?? '—'}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">
              Teléfono
            </p>

            <p className="mt-1 font-medium text-gray-900">
              {invoice.clients?.phone ?? '—'}
            </p>
          </div>

          <div className="sm:col-span-2">
            <p className="text-sm text-gray-500">
              Dirección
            </p>

            <p className="mt-1 font-medium text-gray-900">
              {invoice.clients?.address ?? '—'}
            </p>
          </div>
        </div>
      </section>

      <section className="mb-6 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-6 py-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Productos facturados
          </h3>
        </div>

        {invoice.items.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            Esta factura no tiene productos registrados.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Producto
                  </th>

                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                    Precio unitario
                  </th>

                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                    Cantidad
                  </th>

                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                    Subtotal
                  </th>

                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                    IVA
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {invoice.items.map((item) => {
                  const taxRate = Number(
                    item.products?.tax_rate ?? 0
                  )

                  const itemTax =
                    Number(item.subtotal) *
                    (taxRate / 100)

                  return (
                    <tr key={item.id}>
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-gray-900">
                          {item.products?.name ??
                            'Producto eliminado'}
                        </p>

                        {item.products?.description && (
                          <p className="mt-1 text-xs text-gray-500">
                            {item.products.description}
                          </p>
                        )}
                      </td>

                      <td className="px-4 py-3 text-right text-sm text-gray-700">
                        {formatCurrency(
                          Number(item.unit_price)
                        )}
                      </td>

                      <td className="px-4 py-3 text-center text-sm text-gray-700">
                        {item.quantity}
                      </td>

                      <td className="px-4 py-3 text-right text-sm text-gray-700">
                        {formatCurrency(
                          Number(item.subtotal)
                        )}
                      </td>

                      <td className="px-4 py-3 text-right text-sm text-gray-700">
                        {formatCurrency(itemTax)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <div className="flex justify-end">
        <section className="w-full max-w-sm rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">
            Resumen
          </h3>

          <div className="space-y-3">
            <div className="flex justify-between text-gray-700">
              <span>Subtotal</span>

              <span>
                {formatCurrency(
                  Number(invoice.subtotal)
                )}
              </span>
            </div>

            <div className="flex justify-between text-gray-700">
              <span>Impuestos</span>

              <span>
                {formatCurrency(
                  Number(invoice.tax_total)
                )}
              </span>
            </div>

            <div className="border-t border-gray-200 pt-3">
              <div className="flex justify-between text-lg font-bold text-gray-900">
                <span>Total</span>

                <span>
                  {formatCurrency(
                    Number(invoice.total)
                  )}
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}