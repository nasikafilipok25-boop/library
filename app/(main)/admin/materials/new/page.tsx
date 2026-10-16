import { randomUUID } from 'crypto'
import MaterialForm from '@/components/admin/MaterialForm'
import { createClient } from '@/lib/supabase/server'
import { getCategories } from '@/lib/data'

export default async function NewMaterial() {
  const supabase = createClient()
  const [cats, tags] = await Promise.all([getCategories(), supabase.from('tags').select('name').order('name')])
  return (
    <MaterialForm
      init={{ id: randomUUID(), isNew: true, title: '', description: '', category_id: '', cover_path: null, source: '',
        material_date: new Date().toISOString().slice(0, 10), body: [], status: 'draft', published_at: null, created_at: null, updated_at: null }}
      categories={cats} allTags={(tags.data ?? []).map((t: any) => t.name)} selectedTags={[]}
    />
  )
}
