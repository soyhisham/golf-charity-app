// lib/supabaseAdmin.js
// This version has admin/full access to the database.
// NEVER import this in frontend pages — only in /api/ routes.
// It's like a master key — only the kitchen (backend) holds it,
// not the customers (frontend).

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey)