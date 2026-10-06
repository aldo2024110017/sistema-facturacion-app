import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://tlcdfczkypotnamifft.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1Ni...' // Pega aquí la clave pública anon completa que empieza por ey...

export const supabase = createClient(supabaseUrl, supabaseAnonKey)