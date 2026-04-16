import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface RouteContext {
  params: Promise<{ id: string }>
}

// GET /api/alerts/[id]
export async function GET(_req: Request, { params }: RouteContext) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: alert, error } = await supabase
    .from('alerts')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !alert) return NextResponse.json({ error: 'Alert not found' }, { status: 404 })
  if (alert.user_id !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { data: notifications } = await supabase
    .from('notifications')
    .select('*')
    .eq('alert_id', id)
    .order('sent_at', { ascending: false })
    .limit(20)

  return NextResponse.json({ alert, notifications: notifications || [] })
}

// PATCH /api/alerts/[id] — update status or condition
export async function PATCH(req: Request, { params }: RouteContext) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const allowed = ['status', 'min_price', 'max_price', 'product_name']
  const updateData: Record<string, unknown> = {}

  for (const key of allowed) {
    if (key in body) updateData[key] = body[key]
  }

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('alerts')
    .update(updateData)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ alert: data })
}

// DELETE /api/alerts/[id]
export async function DELETE(_req: Request, { params }: RouteContext) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { error } = await supabase
    .from('alerts')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
