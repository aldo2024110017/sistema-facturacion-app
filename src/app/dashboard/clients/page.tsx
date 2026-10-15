'use client'

import { FormEvent, useEffect, useState } from 'react'
import { createClient, getClients } from '@/actions/clients'

type Client = {
  id: string
  name: string
  email: string
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')

  useEffect(() => {
    void fetchClients()
  }, [])

  async function fetchClients() {
    setLoading(true)

    try {
      const data = await getClients()
      setClients(data as Client[])
    } catch (error) {
      console.error('Error cargando clientes:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleAddClient(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (!name.trim() || !email.trim()) return

    try {
      await createClient(name, email)

      setName('')
      setEmail('')

      await fetchClients()
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Error desconocido'

      alert('Error guardando cliente: ' + message)
    }
  }

  return (
    <div className="mx-auto min-h-screen max-w-4xl bg-white p-6 text-black">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">
        Gestión de Clientes
      </h1>

      <form onSubmit={handleAddClient} className="mb-8 flex gap-4">
        <input
          type="text"
          placeholder="Nombre del cliente"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1 rounded border border-gray-300 bg-white p-2 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />

        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 rounded border border-gray-300 bg-white p-2 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />

        <button
          type="submit"
          className="rounded bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700"
        >
          Agregar
        </button>
      </form>

      {loading ? (
        <p className="text-gray-600">Cargando clientes...</p>
      ) : (
        <table className="w-full border-collapse border border-gray-200 bg-white">
          <thead>
            <tr className="bg-gray-100 text-gray-900">
              <th className="border border-gray-200 p-2 text-left font-semibold">
                ID
              </th>
              <th className="border border-gray-200 p-2 text-left font-semibold">
                Nombre
              </th>
              <th className="border border-gray-200 p-2 text-left font-semibold">
                Email
              </th>
            </tr>
          </thead>

          <tbody>
            {clients.map((client) => (
              <tr
                key={client.id}
                className="text-gray-800 hover:bg-gray-50"
              >
                <td className="border border-gray-200 p-2 font-mono text-xs">
                  {client.id}
                </td>

                <td className="border border-gray-200 p-2">
                  {client.name}
                </td>

                <td className="border border-gray-200 p-2">
                  {client.email}
                </td>
              </tr>
            ))}

            {clients.length === 0 && (
              <tr>
                <td
                  colSpan={3}
                  className="p-4 text-center text-gray-500"
                >
                  No hay clientes registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  )
}