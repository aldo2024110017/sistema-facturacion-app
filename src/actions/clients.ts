'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function getClients() {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase
    .from('clients')
    .select('*')

  if (error) {
    throw new Error(`Error cargando clientes: ${error.message}`)
  }

  return data ?? []
}

export async function createClient(
  name: string,
  taxId: string,
  email?: string
) {
  if (!name.trim() || !taxId.trim()) {
    throw new Error('Nombre y RFC / identificación fiscal son obligatorios')
  }

  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase
    .from('clients')
    .insert([
      {
        name: name.trim(),
        tax_id: taxId.trim(),
        email: email?.trim() || null,
      },
    ])
    .select()
    .single()

  if (error) {
    throw new Error(`Error guardando cliente: ${error.message}`)
  }

  return data
}