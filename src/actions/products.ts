'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function getProducts() {
  const supabase = await createServerSupabaseClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error('Debes iniciar sesión para consultar productos.')
  }

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Error cargando productos: ${error.message}`)
  }

  return data ?? []
}

export async function createProduct(
  name: string,
  description: string,
  price: number,
  taxRate: number
) {
  if (!name.trim()) {
    throw new Error('El nombre del producto es obligatorio.')
  }

  if (!Number.isFinite(price) || price < 0) {
    throw new Error('El precio debe ser un número mayor o igual a 0.')
  }

  if (!Number.isFinite(taxRate) || taxRate < 0) {
    throw new Error(
      'El porcentaje de impuesto debe ser un número mayor o igual a 0.'
    )
  }

  const supabase = await createServerSupabaseClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error('Debes iniciar sesión para registrar productos.')
  }

  const { data, error } = await supabase
    .from('products')
    .insert({
      name: name.trim(),
      description: description.trim() || null,
      price,
      tax_rate: taxRate,
      user_id: user.id,
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Error guardando producto: ${error.message}`)
  }

  return data
}

export async function updateProduct(
  id: string,
  name: string,
  description: string,
  price: number,
  taxRate: number
) {
  if (!id.trim()) {
    throw new Error('El identificador del producto es obligatorio.')
  }

  if (!name.trim()) {
    throw new Error('El nombre del producto es obligatorio.')
  }

  if (!Number.isFinite(price) || price < 0) {
    throw new Error('El precio debe ser un número mayor o igual a 0.')
  }

  if (!Number.isFinite(taxRate) || taxRate < 0) {
    throw new Error(
      'El porcentaje de impuesto debe ser un número mayor o igual a 0.'
    )
  }

  const supabase = await createServerSupabaseClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error('Debes iniciar sesión para editar productos.')
  }

  const { data, error } = await supabase
    .from('products')
    .update({
      name: name.trim(),
      description: description.trim() || null,
      price,
      tax_rate: taxRate,
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    throw new Error(`Error actualizando producto: ${error.message}`)
  }

  return data
}

export async function deleteProduct(id: string) {
  if (!id.trim()) {
    throw new Error('El identificador del producto es obligatorio.')
  }

  const supabase = await createServerSupabaseClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error('Debes iniciar sesión para eliminar productos.')
  }

  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    throw new Error(`Error eliminando producto: ${error.message}`)
  }

  return {
    success: true,
  }
}