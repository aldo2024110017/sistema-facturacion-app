'use client'

import { FormEvent, useCallback, useEffect, useState } from 'react'
import { createClient, getClients } from '@/actions/clients'

type Client = {
  id: string
  name: string
  tax_id: string
  email: string | null
  phone: string | null
  address: string | null
  created_at: string
  user_id: string | null
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const [name, setName] = useState('')
  const [taxId, setTaxId] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')

  const fetchClients = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const data = await getClients()
      setClients(data)
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Error desconocido al cargar clientes.'

      setError(message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchClients()
  }, [fetchClients])

  async function handleAddClient(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault()

    setError('')
    setMessage('')

    if (!name.trim() || !taxId.trim()) {
      setError(
        'Nombre y RFC / identificación fiscal son obligatorios.'
      )
      return
    }

    setSaving(true)

    try {
      await createClient(
        name,
        taxId,
        email,
        phone,
        address
      )

      setName('')
      setTaxId('')
      setEmail('')
      setPhone('')
      setAddress('')

      setMessage('Cliente registrado correctamente.')

      await fetchClients()
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Error desconocido al guardar el cliente.'

      setError(message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="mx-auto max-w-6xl p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">
          Gestión de Clientes
        </h2>

        <p className="mt-1 text-sm text-gray-600">
          Registra y consulta los clientes de tu cuenta.
        </p>
      </div>

      <section className="mb-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="mb-5 text-lg font-semibold text-gray-900">
          Nuevo cliente
        </h3>

        <form
          onSubmit={handleAddClient}
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
              placeholder="Nombre del cliente"
              required
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
          </div>

          <div>
            <label
              htmlFor="taxId"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              RFC / Identificación fiscal *
            </label>

            <input
              id="taxId"
              type="text"
              value={taxId}
              onChange={(event) =>
                setTaxId(event.target.value.toUpperCase())
              }
              placeholder="RFC o identificación fiscal"
              required
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Correo electrónico
            </label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="cliente@ejemplo.com"
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
          </div>

          <div>
            <label
              htmlFor="phone"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Teléfono
            </label>

            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="Teléfono del cliente"
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
          </div>

          <div className="md:col-span-2">
            <label
              htmlFor="address"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Dirección
            </label>

            <textarea
              id="address"
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              placeholder="Dirección del cliente"
              rows={3}
              className="w-full resize-none rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
          </div>

          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-blue-600 px-5 py-2 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? 'Guardando...' : 'Agregar cliente'}
            </button>
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
            Clientes registrados
          </h3>
        </div>

        {loading ? (
          <div className="p-6">
            <p className="text-gray-600">
              Cargando clientes...
            </p>
          </div>
        ) : clients.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">
              No hay clientes registrados.
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
                    RFC
                  </th>

                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Correo
                  </th>

                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Teléfono
                  </th>

                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Dirección
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {clients.map((client) => (
                  <tr
                    key={client.id}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {client.name}
                    </td>

                    <td className="px-4 py-3 text-sm text-gray-700">
                      {client.tax_id}
                    </td>

                    <td className="px-4 py-3 text-sm text-gray-700">
                      {client.email || '—'}
                    </td>

                    <td className="px-4 py-3 text-sm text-gray-700">
                      {client.phone || '—'}
                    </td>

                    <td className="px-4 py-3 text-sm text-gray-700">
                      {client.address || '—'}
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