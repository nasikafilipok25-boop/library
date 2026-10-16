import TagsManager from '@/components/admin/TagsManager'
import { createClient } from '@/lib/supabase/server'

export default async function TagsPage() {
  const { data } = await createClient().from('tags').select('id,name,material_tags(count)').order('name')
  const rows = (data ?? []).map((t: any) => ({ id: t.id, name: t.name, count: t.material_tags?.[0]?.count ?? 0 }))
  return (
    <>
      <header className="top"><h1>Теги</h1><p>Метки для быстрого поиска материалов</p></header>
      <TagsManager initial={rows} />
    </>
  )
}
