// app/api/draws/publish/route.js
// This makes a draw result visible to users.
// Admin runs the draw first (status = pending),
// reviews it, then publishes (status = published).

import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { NextResponse } from 'next/server'

export async function POST(req) {
  try {
    const { drawId, adminId } = await req.json()

    // Verify admin
    const { data: adminProfile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', adminId)
      .single()

    if (adminProfile?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Update draw status to published
    const { error } = await supabaseAdmin
      .from('draws')
      .update({ status: 'published' })
      .eq('id', drawId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })

  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}