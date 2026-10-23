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

export async function updateClient(
  id: string,
  name: string,
  taxId: string,
  email?: string,
  phone?: string,
  address?: string
) {
  if (!id.trim()) {
    throw new Error('El identificador del cliente es obligatorio.')
  }

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
    throw new Error('Debes iniciar sesión para editar clientes.')
  }

  const { data, error } = await supabase
    .from('clients')
    .update({
      name: name.trim(),
      tax_id: taxId.trim(),
      email: email?.trim() || null,
      phone: phone?.trim() || null,
      address: address?.trim() || null,
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    throw new Error(`Error actualizando cliente: ${error.message}`)
  }

  return data
}

export async function deleteClient(id: string) {
  if (!id.trim()) {
    throw new Error('El identificador del cliente es obligatorio.')
  }

  const supabase = await createServerSupabaseClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error('Debes iniciar sesión para eliminar clientes.')
  }

  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    throw new Error(`Error eliminando cliente: ${error.message}`)
  }

  return {
    success: true,
  }
}