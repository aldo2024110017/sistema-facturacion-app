'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { getInvoices } from '@/actions/invoices'

type Invoice = {
  id: string
  created_at: string
  invoice_number: string
  client_id: string
  subtotal: number
  tax_total: number
  total: number
  status: string
  user_id: string | null
  clients: {
    id: string
    name: string
    tax_id: string
  } | null
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchInvoices = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const data = await getInvoices()
      setInvoices(data)
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Error desconocido al cargar facturas.'

      setError(message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchInvoices()
  }, [fetchInvoices])

  function formatCurrency(value: number) {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(value)
  }

  function formatDate(value: string) {
    return new Intl.DateTimeFormat('es-MX', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
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

  function getStatusClasses(status: string) {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-700'

      case 'issued':
        return 'bg-blue-100 text-blue-700'

      case 'paid':
        return 'bg-green-100 text-green-700'

      case 'cancelled':
        return 'bg-red-100 text-red-700'

      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <main className="mx-auto max-w-7xl p-6">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Gestión de Facturas
          </h2>

          <p className="mt-1 text-sm text-gray-600">
            Consulta y administra las facturas de tu cuenta.
          </p>
        </div>

        <Link
          href="/dashboard/invoices/new"
          className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white transition hover:bg-blue-700"
        >
          Nueva factura
        </Link>
      </div>

      {error && (
        <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-6 py-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Facturas registradas
          </h3>
        </div>

        {loading ? (
          <div className="p-6">
            <p className="text-gray-600">
              Cargando facturas...
            </p>
          </div>
        ) : invoices.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-gray-500">
              No hay facturas registradas.
            </p>

            <Link
              href="/dashboard/invoices/new"
              className="mt-4 inline-block font-medium text-blue-600 hover:text-blue-700"
            >
              Crear primera factura
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Factura
                  </th>

                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Cliente
                  </th>

                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    RFC
                  </th>

                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Estado
                  </th>

                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                    Subtotal
                  </th>

                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                    Impuestos
                  </th>

                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                    Total
                  </th>

                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Fecha
                  </th>

                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Acciones
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {invoices.map((invoice) => (
                  <tr
                    key={invoice.id}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                      {invoice.invoice_number}
                    </td>

                    <td className="px-4 py-3 text-sm text-gray-700">
                      {invoice.clients?.name ?? '—'}
                    </td>

                    <td className="px-4 py-3 text-sm text-gray-700">
                      {invoice.clients?.tax_id ?? '—'}
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusClasses(
                          invoice.status
                        )}`}
                      >
                        {getStatusLabel(invoice.status)}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-right text-sm text-gray-700">
                      {formatCurrency(invoice.subtotal)}
                    </td>

                    <td className="px-4 py-3 text-right text-sm text-gray-700">
                      {formatCurrency(invoice.tax_total)}
                    </td>

                    <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                      {formatCurrency(invoice.total)}
                    </td>

                    <td className="px-4 py-3 text-sm text-gray-700">
                      {formatDate(invoice.created_at)}
                    </td>

                    <td className="px-4 py-3">
                      <Link
                        href={`/dashboard/invoices/${invoice.id}`}
                        className="rounded-lg bg-gray-900 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-gray-700"
                      >
                        Ver detalle
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  )
}