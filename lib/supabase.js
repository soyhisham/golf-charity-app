// lib/supabase.js
// This is our single connection point to the database.
// Think of it like a phone line — we create it once here
// and import it wherever we need to talk to the database.

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)