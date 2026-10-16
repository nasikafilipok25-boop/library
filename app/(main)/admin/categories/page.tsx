import CategoriesManager from '@/components/admin/CategoriesManager'
import { createClient } from '@/lib/supabase/server'

export default async function CategoriesPage() {
  const { data } = await createClient().from('categories').select('id,name,color,sort_order').order('sort_order')
  return (
    <>
      <header className="top"><h1>Категории</h1><p>Создавайте, переименовывайте и меняйте цвет</p></header>
      <CategoriesManager initial={data ?? []} />
    </>
  )
}
