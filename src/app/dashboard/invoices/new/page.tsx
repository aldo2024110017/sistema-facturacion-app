'use client'

import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  createInvoice,
  getInvoiceFormData,
} from '@/actions/invoices'

type Client = {
  id: string
  name: string
  tax_id: string
}

type Product = {
  id: string
  name: string
  description: string | null
  price: number
  tax_rate: number
}

type InvoiceItem = {
  productId: string
  quantity: number
}

export default function NewInvoicePage() {
  const router = useRouter()

  const [clients, setClients] = useState<Client[]>([])
  const [products, setProducts] = useState<Product[]>([])

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [clientId, setClientId] = useState('')
  const [selectedProductId, setSelectedProductId] = useState('')
  const [quantity, setQuantity] = useState('1')

  const [items, setItems] = useState<InvoiceItem[]>([])

  const loadFormData = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const data = await getInvoiceFormData()

      setClients(data.clients)
      setProducts(data.products)
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Error desconocido al cargar los datos de la factura.'

      setError(message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadFormData()
  }, [loadFormData])

  const productMap = useMemo(() => {
    return new Map(
      products.map((product) => [
        product.id,
        product,
      ])
    )
  }, [products])

  const totals = useMemo(() => {
    let subtotal = 0
    let taxTotal = 0

    for (const item of items) {
      const product = productMap.get(item.productId)

      if (!product) {
        continue
      }

      const itemSubtotal =
        Number(product.price) * item.quantity

      const itemTax =
        itemSubtotal *
        (Number(product.tax_rate) / 100)

      subtotal += itemSubtotal
      taxTotal += itemTax
    }

    subtotal = Number(subtotal.toFixed(2))
    taxTotal = Number(taxTotal.toFixed(2))

    return {
      subtotal,
      taxTotal,
      total: Number(
        (subtotal + taxTotal).toFixed(2)
      ),
    }
  }, [items, productMap])

  function formatCurrency(value: number) {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(value)
  }

  function handleAddProduct() {
    setError('')

    if (!selectedProductId) {
      setError('Debes seleccionar un producto.')
      return
    }

    const numericQuantity = Number(quantity)

    if (
      !Number.isFinite(numericQuantity) ||
      numericQuantity <= 0
    ) {
      setError(
        'La cantidad del producto debe ser mayor a 0.'
      )
      return
    }

    const existingItem = items.find(
      (item) =>
        item.productId === selectedProductId
    )

    if (existingItem) {
      setItems((currentItems) =>
        currentItems.map((item) =>
          item.productId === selectedProductId
            ? {
                ...item,
                quantity:
                  item.quantity + numericQuantity,
              }
            : item
        )
      )
    } else {
      setItems((currentItems) => [
        ...currentItems,
        {
          productId: selectedProductId,
          quantity: numericQuantity,
        },
      ])
    }

    setSelectedProductId('')
    setQuantity('1')
  }

  function handleQuantityChange(
    productId: string,
    value: string
  ) {
    const numericQuantity = Number(value)

    if (
      !Number.isFinite(numericQuantity) ||
      numericQuantity <= 0
    ) {
      return
    }

    setItems((currentItems) =>
      currentItems.map((item) =>
        item.productId === productId
          ? {
              ...item,
              quantity: numericQuantity,
            }
          : item
      )
    )
  }

  function handleRemoveProduct(productId: string) {
    setItems((currentItems) =>
      currentItems.filter(
        (item) => item.productId !== productId
      )
    )
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault()

    setError('')

    if (!clientId) {
      setError('Debes seleccionar un cliente.')
      return
    }

    if (items.length === 0) {
      setError(
        'Debes agregar al menos un producto a la factura.'
      )
      return
    }

    setSaving(true)

    try {
      const result = await createInvoice(
        clientId,
        items
      )

      router.push(
        `/dashboard/invoices/${result.id}`
      )
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Error desconocido al crear la factura.'

      setError(message)
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-6xl p-6">
        <p className="text-gray-600">
          Cargando información de la factura...
        </p>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-6xl p-6">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Nueva factura
          </h2>

          <p className="mt-1 text-sm text-gray-600">
            Selecciona un cliente y agrega los productos
            que formarán parte de la factura.
          </p>
        </div>

        <Link
          href="/dashboard/invoices"
          className="font-medium text-blue-600 hover:text-blue-700"
        >
          Volver a facturas
        </Link>
      </div>

      {error && (
        <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {clients.length === 0 && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-5">
          <p className="font-medium text-amber-800">
            No tienes clientes registrados.
          </p>

          <p className="mt-1 text-sm text-amber-700">
            Debes registrar al menos un cliente antes
            de crear una factura.
          </p>

          <Link
            href="/dashboard/clients"
            className="mt-3 inline-block font-medium text-amber-800 underline"
          >
            Ir a Clientes
          </Link>
        </div>
      )}

      {products.length === 0 && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-5">
          <p className="font-medium text-amber-800">
            No tienes productos registrados.
          </p>

          <p className="mt-1 text-sm text-amber-700">
            Debes registrar al menos un producto antes
            de crear una factura.
          </p>

          <Link
            href="/dashboard/products"
            className="mt-3 inline-block font-medium text-amber-800 underline"
          >
            Ir a Productos
          </Link>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <section className="mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="mb-5 text-lg font-semibold text-gray-900">
            Cliente
          </h3>

          <label
            htmlFor="client"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Seleccionar cliente *
          </label>

          <select
            id="client"
            value={clientId}
            onChange={(event) =>
              setClientId(event.target.value)
            }
            disabled={clients.length === 0}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:bg-gray-100"
          >
            <option value="">
              Selecciona un cliente
            </option>

            {clients.map((client) => (
              <option
                key={client.id}
                value={client.id}
              >
                {client.name} — {client.tax_id}
              </option>
            ))}
          </select>
        </section>

        <section className="mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="mb-5 text-lg font-semibold text-gray-900">
            Productos
          </h3>

          <div className="grid gap-4 md:grid-cols-[1fr_160px_auto] md:items-end">
            <div>
              <label
                htmlFor="product"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Producto
              </label>

              <select
                id="product"
                value={selectedProductId}
                onChange={(event) =>
                  setSelectedProductId(
                    event.target.value
                  )
                }
                disabled={products.length === 0}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:bg-gray-100"
              >
                <option value="">
                  Selecciona un producto
                </option>

                {products.map((product) => (
                  <option
                    key={product.id}
                    value={product.id}
                  >
                    {product.name} —{' '}
                    {formatCurrency(
                      Number(product.price)
                    )}{' '}
                    — IVA {product.tax_rate}%
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="quantity"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Cantidad
              </label>

              <input
                id="quantity"
                type="number"
                min="0.01"
                step="0.01"
                value={quantity}
                onChange={(event) =>
                  setQuantity(event.target.value)
                }
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              />
            </div>

            <button
              type="button"
              onClick={handleAddProduct}
              disabled={products.length === 0}
              className="rounded-lg bg-gray-900 px-5 py-2 font-medium text-white transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Agregar
            </button>
          </div>
        </section>

        <section className="mb-6 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-6 py-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Detalle de la factura
            </h3>
          </div>

          {items.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No has agregado productos.
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
                      Precio
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

                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Acción
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200">
                  {items.map((item) => {
                    const product =
                      productMap.get(item.productId)

                    if (!product) {
                      return null
                    }

                    const itemSubtotal =
                      Number(product.price) *
                      item.quantity

                    const itemTax =
                      itemSubtotal *
                      (Number(product.tax_rate) / 100)

                    return (
                      <tr key={item.productId}>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {product.name}
                        </td>

                        <td className="px-4 py-3 text-right text-sm text-gray-700">
                          {formatCurrency(
                            Number(product.price)
                          )}
                        </td>

                        <td className="px-4 py-3">
                          <input
                            type="number"
                            min="0.01"
                            step="0.01"
                            value={item.quantity}
                            onChange={(event) =>
                              handleQuantityChange(
                                item.productId,
                                event.target.value
                              )
                            }
                            className="mx-auto block w-24 rounded-lg border border-gray-300 px-2 py-1.5 text-center text-gray-900"
                          />
                        </td>

                        <td className="px-4 py-3 text-right text-sm text-gray-700">
                          {formatCurrency(
                            itemSubtotal
                          )}
                        </td>

                        <td className="px-4 py-3 text-right text-sm text-gray-700">
                          {formatCurrency(itemTax)}
                        </td>

                        <td className="px-4 py-3">
                          <button
                            type="button"
                            onClick={() =>
                              handleRemoveProduct(
                                item.productId
                              )
                            }
                            className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-red-700"
                          >
                            Quitar
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="mb-6 flex justify-end">
          <div className="w-full max-w-sm rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              Resumen
            </h3>

            <div className="space-y-3">
              <div className="flex justify-between text-gray-700">
                <span>Subtotal</span>
                <span>
                  {formatCurrency(totals.subtotal)}
                </span>
              </div>

              <div className="flex justify-between text-gray-700">
                <span>Impuestos</span>
                <span>
                  {formatCurrency(totals.taxTotal)}
                </span>
              </div>

              <div className="border-t border-gray-200 pt-3">
                <div className="flex justify-between text-lg font-bold text-gray-900">
                  <span>Total</span>
                  <span>
                    {formatCurrency(totals.total)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Link
            href="/dashboard/invoices"
            className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-center font-medium text-gray-700 transition hover:bg-gray-50"
          >
            Cancelar
          </Link>

          <button
            type="submit"
            disabled={
              saving ||
              clients.length === 0 ||
              products.length === 0 ||
              items.length === 0
            }
            className="rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving
              ? 'Creando factura...'
              : 'Crear factura'}
          </button>
        </div>
      </form>
    </main>
  )
}