import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/alerts — list user's alerts
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('alerts')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ alerts: data })
}

// POST /api/alerts — create a new alert
export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { url, site, alert_type, min_price, max_price, product_name } = body

  // Validate
  if (!url || !site || !alert_type) {
    return NextResponse.json({ error: 'Missing required fields: url, site, alert_type' }, { status: 400 })
  }

  if (!['stock', 'price'].includes(alert_type)) {
    return NextResponse.json({ error: 'alert_type must be stock or price' }, { status: 400 })
  }

  if (alert_type === 'price' && !min_price) {
    return NextResponse.json({ error: 'min_price is required for price alerts' }, { status: 400 })
  }

  try {
    new URL(url)
  } catch {
    return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('alerts')
    .insert({
      user_id: user.id,
      url,
      site,
      alert_type,
      min_price: min_price || null,
      max_price: max_price || null,
      product_name: product_name || null,
      status: 'active',
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ alert: data }, { status: 201 })
}
