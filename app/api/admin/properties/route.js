import { supabaseAdmin } from '../../../lib/supabase-admin'

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'threshold2024'

function checkAuth(request) {
  const auth = request.headers.get('x-admin-password')
  return auth === ADMIN_PASSWORD
}

export async function GET(request) {
  if (!checkAuth(request)) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  
  const { data, error } = await supabaseAdmin
    .from('properties')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data)
}

export async function POST(request) {
  if (!checkAuth(request)) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  
  const body = await request.json()
  
  // Generate ID from name if not provided
  if (!body.id && body.name) {
    body.id = body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  }
  
  body.updated_at = new Date().toISOString()
  
  const { data, error } = await supabaseAdmin
    .from('properties')
    .insert(body)
    .select()
    .single()
  
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data)
}

export async function PUT(request) {
  if (!checkAuth(request)) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  
  const body = await request.json()
  const { id, ...updates } = body
  updates.updated_at = new Date().toISOString()
  
  const { data, error } = await supabaseAdmin
    .from('properties')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data)
}

export async function DELETE(request) {
  if (!checkAuth(request)) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  
  const { error } = await supabaseAdmin
    .from('properties')
    .delete()
    .eq('id', id)
  
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ success: true })
}