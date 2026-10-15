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

export async function createClient(name: string, email: string) {
  if (!name.trim() || !email.trim()) {
    throw new Error('Nombre y correo electrónico son obligatorios')
  }

  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase
    .from('clients')
    .insert([
      {
        name: name.trim(),
        email: email.trim(),
      },
    ])
    .select()
    .single()

  if (error) {
    throw new Error(`Error guardando cliente: ${error.message}`)
  }

  return data
}