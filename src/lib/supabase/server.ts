import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'

export function createServerSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Faltan las variables de entorno de Supabase')
  }

  return createClient<Database>(
    supabaseUrl,
    supabaseAnonKey
  )
}