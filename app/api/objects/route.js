import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('objects')
    .select('id, name, designer, image, category')
    .order('created_at', { ascending: false })
  if (error) return Response.json([], { status: 200 })
  return Response.json(data || [])
}
