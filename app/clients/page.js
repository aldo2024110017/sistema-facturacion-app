'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

export default function ClientsPage() {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')

  useEffect(() => {
    fetchClients()
  }, [])

  async function fetchClients() {
    setLoading(true)
    const { data, error } = await supabase.from('clients').select('*')
    if (error) {
      console.error('Error cargando clientes:', error)
    } else {
      setClients(data || [])
    }
    setLoading(false)
  }

  async function handleAddClient(e) {
    e.preventDefault()
    if (!name || !email) return

    const { error } = await supabase.from('clients').insert([{ name, email }])
    if (error) {
      alert('Error guardando cliente: ' + (error.message || JSON.stringify(error)))
    } else {
      setName('')
      setEmail('')
      fetchClients()
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 text-black bg-white min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-gray-900">Gestión de Clientes</h1>

      <form onSubmit={handleAddClient} className="mb-8 flex gap-4">
        <input
          type="text"
          placeholder="Nombre del cliente"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border border-gray-300 p-2 rounded flex-1 text-black bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border border-gray-300 p-2 rounded flex-1 text-black bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 font-medium transition-colors"
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
              <th className="border border-gray-200 p-2 text-left font-semibold">ID</th>
              <th className="border border-gray-200 p-2 text-left font-semibold">Nombre</th>
              <th className="border border-gray-200 p-2 text-left font-semibold">Email</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client) => (
              <tr key={client.id} className="text-gray-800 hover:bg-gray-50">
                <td className="border border-gray-200 p-2 text-xs font-mono">{client.id}</td>
                <td className="border border-gray-200 p-2">{client.name}</td>
                <td className="border border-gray-200 p-2">{client.email}</td>
              </tr>
            ))}
            {clients.length === 0 && (
              <tr>
                <td colSpan="3" className="text-center p-4 text-gray-500">
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