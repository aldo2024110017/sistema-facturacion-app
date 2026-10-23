'use client'

import { FormEvent, useCallback, useEffect, useState } from 'react'
import {
  createProduct,
  deleteProduct,
  getProducts,
  updateProduct,
} from '@/actions/products'

type Product = {
  id: string
  name: string
  description: string | null
  price: number
  tax_rate: number
  created_at: string
  user_id: string | null
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const [editingId, setEditingId] = useState<string | null>(null)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [taxRate, setTaxRate] = useState('16')

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const data = await getProducts()
      setProducts(data)
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Error desconocido al cargar productos.'

      setError(message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchProducts()
  }, [fetchProducts])

  function clearForm() {
    setEditingId(null)
    setName('')
    setDescription('')
    setPrice('')
    setTaxRate('16')
  }

  function handleEdit(product: Product) {
    setError('')
    setMessage('')

    setEditingId(product.id)
    setName(product.name)
    setDescription(product.description ?? '')
    setPrice(String(product.price))
    setTaxRate(String(product.tax_rate))

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  function handleCancelEdit() {
    clearForm()
    setError('')
    setMessage('')
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault()

    setError('')
    setMessage('')

    if (!name.trim()) {
      setError('El nombre del producto es obligatorio.')
      return
    }

    if (price.trim() === '') {
      setError('El precio del producto es obligatorio.')
      return
    }

    const numericPrice = Number(price)
    const numericTaxRate = Number(taxRate)

    if (!Number.isFinite(numericPrice) || numericPrice < 0) {
      setError('El precio debe ser un número mayor o igual a 0.')
      return
    }

    if (!Number.isFinite(numericTaxRate) || numericTaxRate < 0) {
      setError(
        'El porcentaje de impuesto debe ser un número mayor o igual a 0.'
      )
      return
    }

    setSaving(true)

    try {
      if (editingId) {
        await updateProduct(
          editingId,
          name,
          description,
          numericPrice,
          numericTaxRate
        )

        clearForm()
        setMessage('Producto actualizado correctamente.')
      } else {
        await createProduct(
          name,
          description,
          numericPrice,
          numericTaxRate
        )

        clearForm()
        setMessage('Producto registrado correctamente.')
      }

      await fetchProducts()
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : editingId
            ? 'Error desconocido al actualizar el producto.'
            : 'Error desconocido al guardar el producto.'

      setError(message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(product: Product) {
    const confirmed = window.confirm(
      `¿Estás seguro de que deseas eliminar el producto "${product.name}"?`
    )

    if (!confirmed) {
      return
    }

    setError('')
    setMessage('')
    setDeletingId(product.id)

    try {
      await deleteProduct(product.id)

      if (editingId === product.id) {
        clearForm()
      }

      setMessage('Producto eliminado correctamente.')

      await fetchProducts()
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Error desconocido al eliminar el producto.'

      setError(message)
    } finally {
      setDeletingId(null)
    }
  }

  function formatCurrency(value: number) {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(value)
  }

  return (
    <main className="mx-auto max-w-6xl p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">
          Gestión de Productos
        </h2>

        <p className="mt-1 text-sm text-gray-600">
          Registra, consulta, edita y elimina los productos de tu cuenta.
        </p>
      </div>

      <section className="mb-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="mb-5 text-lg font-semibold text-gray-900">
          {editingId ? 'Editar producto' : 'Nuevo producto'}
        </h3>

        <form
          onSubmit={handleSubmit}
          className="grid gap-4 md:grid-cols-2"
        >
          <div>
            <label
              htmlFor="name"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Nombre *
            </label>

            <input
              id="name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Nombre del producto"
              required
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
          </div>

          <div>
            <label
              htmlFor="price"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Precio *
            </label>

            <input
              id="price"
              type="number"
              min="0"
              step="0.01"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              placeholder="0.00"
              required
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
          </div>

          <div>
            <label
              htmlFor="taxRate"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Impuesto (%)
            </label>

            <input
              id="taxRate"
              type="number"
              min="0"
              step="0.01"
              value={taxRate}
              onChange={(event) => setTaxRate(event.target.value)}
              placeholder="16"
              required
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
          </div>

          <div className="md:col-span-2">
            <label
              htmlFor="description"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Descripción
            </label>

            <textarea
              id="description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Descripción del producto"
              rows={3}
              className="w-full resize-none rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
          </div>

          <div className="flex gap-3 md:col-span-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-blue-600 px-5 py-2 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving
                ? 'Guardando...'
                : editingId
                  ? 'Guardar cambios'
                  : 'Agregar producto'}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                disabled={saving}
                className="rounded-lg border border-gray-300 bg-white px-5 py-2 font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancelar
              </button>
            )}
          </div>
        </form>

        {error && (
          <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {message && (
          <div className="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">
            {message}
          </div>
        )}
      </section>

      <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-6 py-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Productos registrados
          </h3>
        </div>

        {loading ? (
          <div className="p-6">
            <p className="text-gray-600">
              Cargando productos...
            </p>
          </div>
        ) : products.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">
              No hay productos registrados.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Nombre
                  </th>

                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Descripción
                  </th>

                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Precio
                  </th>

                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Impuesto
                  </th>

                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Acciones
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {products.map((product) => (
                  <tr
                    key={product.id}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {product.name}
                    </td>

                    <td className="px-4 py-3 text-sm text-gray-700">
                      {product.description || '—'}
                    </td>

                    <td className="px-4 py-3 text-sm text-gray-700">
                      {formatCurrency(product.price)}
                    </td>

                    <td className="px-4 py-3 text-sm text-gray-700">
                      {product.tax_rate}%
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleEdit(product)}
                          disabled={deletingId === product.id}
                          className="rounded-lg bg-amber-500 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Editar
                        </button>

                        <button
                          type="button"
                          onClick={() => void handleDelete(product)}
                          disabled={deletingId === product.id}
                          className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {deletingId === product.id
                            ? 'Eliminando...'
                            : 'Eliminar'}
                        </button>
                      </div>
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