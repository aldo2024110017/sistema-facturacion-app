'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'

type InvoiceItemInput = {
  productId: string
  quantity: number
}

export async function getInvoices() {
  const supabase = await createServerSupabaseClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error('Debes iniciar sesión para consultar facturas.')
  }

  const { data, error } = await supabase
    .from('invoices')
    .select(`
      id,
      created_at,
      invoice_number,
      client_id,
      subtotal,
      tax_total,
      total,
      status,
      user_id,
      clients (
        id,
        name,
        tax_id
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Error cargando facturas: ${error.message}`)
  }

  return data ?? []
}

export async function getInvoiceFormData() {
  const supabase = await createServerSupabaseClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error(
      'Debes iniciar sesión para consultar clientes y productos.'
    )
  }

  const { data: clients, error: clientsError } = await supabase
    .from('clients')
    .select('id, name, tax_id')
    .eq('user_id', user.id)
    .order('name', { ascending: true })

  if (clientsError) {
    throw new Error(
      `Error cargando clientes: ${clientsError.message}`
    )
  }

  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('id, name, description, price, tax_rate')
    .eq('user_id', user.id)
    .order('name', { ascending: true })

  if (productsError) {
    throw new Error(
      `Error cargando productos: ${productsError.message}`
    )
  }

  return {
    clients: clients ?? [],
    products: products ?? [],
  }
}

export async function createInvoice(
  clientId: string,
  items: InvoiceItemInput[]
) {
  if (!clientId.trim()) {
    throw new Error('Debes seleccionar un cliente.')
  }

  if (!items.length) {
    throw new Error(
      'Debes agregar al menos un producto a la factura.'
    )
  }

  for (const item of items) {
    if (!item.productId.trim()) {
      throw new Error(
        'Todos los productos de la factura deben ser válidos.'
      )
    }

    if (
      !Number.isFinite(item.quantity) ||
      item.quantity <= 0
    ) {
      throw new Error(
        'La cantidad de cada producto debe ser mayor a 0.'
      )
    }
  }

  const supabase = await createServerSupabaseClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error('Debes iniciar sesión para crear facturas.')
  }

  const { data: client, error: clientError } = await supabase
    .from('clients')
    .select('id')
    .eq('id', clientId)
    .eq('user_id', user.id)
    .single()

  if (clientError || !client) {
    throw new Error(
      'El cliente seleccionado no existe o no pertenece a tu cuenta.'
    )
  }

  const productIds = [
    ...new Set(items.map((item) => item.productId)),
  ]

  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('id, name, price, tax_rate')
    .in('id', productIds)
    .eq('user_id', user.id)

  if (productsError) {
    throw new Error(
      `Error consultando productos: ${productsError.message}`
    )
  }

  if (!products || products.length !== productIds.length) {
    throw new Error(
      'Uno o más productos no existen o no pertenecen a tu cuenta.'
    )
  }

  const productMap = new Map(
    products.map((product) => [
      product.id,
      product,
    ])
  )

  let subtotal = 0
  let taxTotal = 0

  const calculatedItems = items.map((item) => {
    const product = productMap.get(item.productId)

    if (!product) {
      throw new Error(
        'No se encontró uno de los productos seleccionados.'
      )
    }

    const unitPrice = Number(product.price)
    const taxRate = Number(product.tax_rate)

    const itemSubtotal = Number(
      (unitPrice * item.quantity).toFixed(2)
    )

    const itemTax = Number(
      (itemSubtotal * (taxRate / 100)).toFixed(2)
    )

    subtotal += itemSubtotal
    taxTotal += itemTax

    return {
      product_id: product.id,
      quantity: item.quantity,
      unit_price: unitPrice,
      subtotal: itemSubtotal,
    }
  })

  subtotal = Number(subtotal.toFixed(2))
  taxTotal = Number(taxTotal.toFixed(2))

  const total = Number(
    (subtotal + taxTotal).toFixed(2)
  )

  const now = new Date()

  const datePart = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ].join('')

  const timePart = [
    String(now.getHours()).padStart(2, '0'),
    String(now.getMinutes()).padStart(2, '0'),
    String(now.getSeconds()).padStart(2, '0'),
  ].join('')

  const randomPart = crypto
    .randomUUID()
    .slice(0, 4)
    .toUpperCase()

  const invoiceNumber =
    `FAC-${datePart}-${timePart}-${randomPart}`

  const { data: invoice, error: invoiceError } = await supabase
    .from('invoices')
    .insert({
      invoice_number: invoiceNumber,
      client_id: clientId,
      subtotal,
      tax_total: taxTotal,
      total,
      status: 'draft',
      user_id: user.id,
    })
    .select()
    .single()

  if (invoiceError || !invoice) {
    throw new Error(
      `Error creando factura: ${
        invoiceError?.message ?? 'No se pudo crear la factura.'
      }`
    )
  }

  const invoiceItems = calculatedItems.map((item) => ({
    invoice_id: invoice.id,
    product_id: item.product_id,
    quantity: item.quantity,
    unit_price: item.unit_price,
    subtotal: item.subtotal,
  }))

  const { error: itemsError } = await supabase
    .from('invoice_items')
    .insert(invoiceItems)

  if (itemsError) {
    const { error: rollbackError } = await supabase
      .from('invoices')
      .delete()
      .eq('id', invoice.id)
      .eq('user_id', user.id)

    if (rollbackError) {
      throw new Error(
        `Error guardando los productos de la factura: ${itemsError.message}. Además, no fue posible revertir la factura creada: ${rollbackError.message}`
      )
    }

    throw new Error(
      `Error guardando los productos de la factura: ${itemsError.message}`
    )
  }

  return {
    id: invoice.id,
    invoiceNumber: invoice.invoice_number,
    subtotal,
    taxTotal,
    total,
  }
}

export async function getInvoiceById(id: string) {
  if (!id.trim()) {
    throw new Error(
      'El identificador de la factura es obligatorio.'
    )
  }

  const supabase = await createServerSupabaseClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error(
      'Debes iniciar sesión para consultar la factura.'
    )
  }

  const { data: invoice, error: invoiceError } = await supabase
    .from('invoices')
    .select(`
      id,
      created_at,
      invoice_number,
      client_id,
      subtotal,
      tax_total,
      total,
      status,
      user_id,
      clients (
        id,
        name,
        tax_id,
        email,
        phone,
        address
      )
    `)
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (invoiceError || !invoice) {
    throw new Error(
      'La factura no existe o no pertenece a tu cuenta.'
    )
  }

  const { data: items, error: itemsError } = await supabase
    .from('invoice_items')
    .select(`
      id,
      created_at,
      quantity,
      unit_price,
      subtotal,
      product_id,
      products (
        id,
        name,
        description,
        tax_rate
      )
    `)
    .eq('invoice_id', invoice.id)
    .order('created_at', { ascending: true })

  if (itemsError) {
    throw new Error(
      `Error cargando los productos de la factura: ${itemsError.message}`
    )
  }

  return {
    ...invoice,
    items: items ?? [],
  }
}