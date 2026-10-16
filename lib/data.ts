import { createClient } from '@/lib/supabase/server'

export type Category = { id: string; name: string; color: string }
export type Mat = {
  id: string; title: string; description: string | null; cover_path: string | null
  source: string | null; material_date: string | null; published_at: string | null
  category: Category | null; tags: string[]
}

const one = (x: any) => (Array.isArray(x) ? x[0] ?? null : x ?? null)

export function normalize(r: any): Mat {
  return {
    ...r,
    category: one(r.category),
    tags: (r.material_tags ?? []).map((x: any) => one(x.tags)?.name).filter(Boolean)
  }
}

export const MAT_FIELDS =
  'id,title,description,cover_path,source,material_date,published_at,category:categories(id,name,color),material_tags(tags(name))'

export async function getPublished(): Promise<Mat[]> {
  const supabase = createClient()
  const { data } = await supabase.from('materials').select(MAT_FIELDS)
    .eq('status', 'published').order('published_at', { ascending: false })
  return (data ?? []).map(normalize)
}

export async function getCategories(): Promise<Category[]> {
  const supabase = createClient()
  const { data } = await supabase.from('categories').select('id,name,color').order('sort_order')
  return data ?? []
}

export async function getFavIds(): Promise<Set<string>> {
  const supabase = createClient()
  const { data } = await supabase.from('favorites').select('material_id')
  return new Set((data ?? []).map((r: any) => r.material_id))
}

export async function getRecentIds(limit = 6): Promise<string[]> {
  const supabase = createClient()
  const { data } = await supabase.from('views').select('material_id')
    .order('viewed_at', { ascending: false }).limit(limit)
  return (data ?? []).map((r: any) => r.material_id)
}

export async function getMe() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data } = await supabase.from('profiles').select('role,display_name').eq('id', user.id).maybeSingle()
  return { id: user.id, email: user.email ?? '', role: (data?.role ?? 'user') as string, name: (data?.display_name ?? '') as string }
}

export function blocksToText(body: any): string {
  return (Array.isArray(body) ? body : [])
    .map((b: any) => [b.text, ...(b.items ?? []), b.caption].filter(Boolean).join(' '))
    .join(' ')
}

// Опубликованные материалы + плоский текст конспекта (для поиска по содержимому)
export async function getPublishedWithText(): Promise<(Mat & { text: string })[]> {
  const supabase = createClient()
  const { data } = await supabase.from('materials').select(MAT_FIELDS + ',body')
    .eq('status', 'published').order('published_at', { ascending: false })
  return (data ?? []).map((r: any) => ({ ...normalize(r), text: blocksToText(r.body) }))
}
