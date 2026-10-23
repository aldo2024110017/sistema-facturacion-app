'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function getDashboardSummary() {
  const supabase = await createServerSupabaseClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error(
      'Debes iniciar sesión para consultar el dashboard.'
    )
  }

  const [
    clientsResult,
    productsResult,
    invoicesResult,
  ] = await Promise.all([
    supabase
      .from('clients')
      .select('*', {
        count: 'exact',
        head: true,
      })
      .eq('user_id', user.id),

    supabase
      .from('products')
      .select('*', {
        count: 'exact',
        head: true,
      })
      .eq('user_id', user.id),

    supabase
      .from('invoices')
      .select('*', {
        count: 'exact',
        head: true,
      })
      .eq('user_id', user.id),
  ])

  if (clientsResult.error) {
    throw new Error(
      `Error consultando clientes: ${clientsResult.error.message}`
    )
  }

  if (productsResult.error) {
    throw new Error(
      `Error consultando productos: ${productsResult.error.message}`
    )
  }

  if (invoicesResult.error) {
    throw new Error(
      `Error consultando facturas: ${invoicesResult.error.message}`
    )
  }

  return {
    clients: clientsResult.count ?? 0,
    products: productsResult.count ?? 0,
    invoices: invoicesResult.count ?? 0,
  }
}