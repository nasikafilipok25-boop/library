import Link from 'next/link'
import Cover from '@/components/Cover'
import DeleteMaterial from '@/components/admin/DeleteMaterial'
import { createClient } from '@/lib/supabase/server'

const one = (x: any) => (Array.isArray(x) ? x[0] ?? null : x ?? null)

export default async function AdminHome() {
  const supabase = createClient()
  const { data } = await supabase.from('materials')
    .select('id,title,status,updated_at,cover_path,category:categories(name,color)')
    .order('updated_at', { ascending: false })
  const rows = (data ?? []).map((r: any) => ({ ...r, category: one(r.category) }))
  const fmt = (s: string) => new Date(s).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })

  return (
    <>
      <header className="top"><h1>Админ-панель</h1><p>Материалов: {rows.length}</p></header>
      <div className="actions" style={{ marginTop: 0 }}>
        <Link href="/admin/materials/new" className="btn">+ Добавить материал</Link>
      </div>
      {rows.length === 0 && (
        <div className="glass" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 26, marginBottom: 6 }}>Материалов пока нет</h3>
          <p style={{ margin: 0, color: 'var(--ink2)' }}>Нажмите «Добавить материал», чтобы создать первый конспект.</p>
        </div>
      )}
      {rows.map((m: any) => (
        <div className="arow glass" key={m.id}>
          <Cover m={m} />
          <div className="main">
            <b>{m.title}</b>
            <small>{m.status === 'published' ? 'Опубликован' : 'Черновик'} · {m.category?.name ?? 'без категории'} · изменён {fmt(m.updated_at)}</small>
          </div>
          <div className="acts">
            <Link href={`/admin/materials/${m.id}`} className="btn">Редактировать</Link>
            <Link href={`/material/${m.id}`} className="btn soft">Открыть</Link>
            <DeleteMaterial id={m.id} title={m.title} />
          </div>
        </div>
      ))}
    </>
  )
}
