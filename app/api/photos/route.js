import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET() {
  const { data } = await supabaseAdmin
    .from('properties')
    .select('hero_photo, photos')
    .eq('published', true)
  if (!data) return Response.json([])
  const urls = []
  for (const p of data) {
    if (p.hero_photo) urls.push(p.hero_photo)
    if (p.photos?.length) urls.push(...p.photos.slice(0, 3))
  }
  return Response.json([...new Set(urls)])
}
