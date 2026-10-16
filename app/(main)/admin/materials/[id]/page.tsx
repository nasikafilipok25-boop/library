import { notFound } from 'next/navigation'
import MaterialForm from '@/components/admin/MaterialForm'
import { createClient } from '@/lib/supabase/server'
import { getCategories } from '@/lib/data'

export default async function EditMaterial({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: m } = await supabase.from('materials').select('*').eq('id', params.id).maybeSingle()
  if (!m) notFound()
  const [cats, allTags, mine] = await Promise.all([
    getCategories(),
    supabase.from('tags').select('name').order('name'),
    supabase.from('material_tags').select('tags(name)').eq('material_id', params.id)
  ])
  const selected = (mine.data ?? []).map((r: any) => (Array.isArray(r.tags) ? r.tags[0]?.name : r.tags?.name)).filter(Boolean)
  return (
    <MaterialForm
      init={{ id: m.id, isNew: false, title: m.title, description: m.description ?? '', category_id: m.category_id ?? '',
        cover_path: m.cover_path, source: m.source ?? '', material_date: m.material_date ?? '', body: Array.isArray(m.body) ? m.body : [],
        status: m.status, published_at: m.published_at, created_at: m.created_at, updated_at: m.updated_at }}
      categories={cats} allTags={(allTags.data ?? []).map((t: any) => t.name)} selectedTags={selected}
    />
  )
}
