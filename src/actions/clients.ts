'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function getClients() {
  const supabase = await createServerSupabaseClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error('Debes iniciar sesión para consultar clientes.')
  }

  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Error cargando clientes: ${error.message}`)
  }

  return data ?? []
}

export async function createClient(
  name: string,
  taxId: string,
  email?: string,
  phone?: string,
  address?: string
) {
  if (!name.trim() || !taxId.trim()) {
    throw new Error(
      'Nombre y RFC / identificación fiscal son obligatorios.'
    )
  }

  const supabase = await createServerSupabaseClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error('Debes iniciar sesión para registrar clientes.')
  }

  const { data, error } = await supabase
    .from('clients')
    .insert({
      name: name.trim(),
      tax_id: taxId.trim(),
      email: email?.trim() || null,
      phone: phone?.trim() || null,
      address: address?.trim() || null,
      user_id: user.id,
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Error guardando cliente: ${error.message}`)
  }

  return data
}