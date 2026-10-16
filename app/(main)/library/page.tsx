import Link from 'next/link'
import MaterialCard from '@/components/MaterialCard'
import { getPublished, getCategories, getFavIds } from '@/lib/data'

export default async function Library({ searchParams }: { searchParams: { q?: string; cat?: string } }) {
  const [all, cats, favIds] = await Promise.all([getPublished(), getCategories(), getFavIds()])
  const q = (searchParams.q ?? '').trim().toLowerCase()
  const cat = searchParams.cat ?? 'all'
  const list = all.filter((m) =>
    (cat === 'all' || m.category?.id === cat) &&
    (!q || [m.title, m.description ?? '', m.source ?? '', m.category?.name ?? '', ...m.tags].join(' ').toLowerCase().includes(q))
  )
  return (
    <>
      <header className="top"><h1>Библиотека</h1><p>Материалов: {all.length}</p></header>
      <form action="/library">
        <label className="glass search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="11" cy="11" r="6.5" /><path d="M16 16l4 4" /></svg>
          <input name="q" type="search" defaultValue={searchParams.q ?? ''} placeholder="Поиск по библиотеке" />
          {cat !== 'all' && <input type="hidden" name="cat" value={cat} />}
        </label>
      </form>
      <div className="chips">
        <Link href="/library" className={`chip all ${cat === 'all' ? 'sel' : ''}`}>Все</Link>
        {cats.map((c) => (
          <Link key={c.id} href={`/library?cat=${c.id}`} className={`chip ${cat === c.id ? 'sel' : ''}`} style={{ ['--c' as any]: c.color }}>{c.name}</Link>
        ))}
      </div>
      {list.length > 0 ? (
        <div className="grid">{list.map((m) => <MaterialCard key={m.id} m={m} fav={favIds.has(m.id)} />)}</div>
      ) : (
        <div className="glass" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 26, marginBottom: 6 }}>Ничего не найдено</h3>
          <p style={{ margin: 0, color: 'var(--ink2)' }}>Попробуйте другое слово или другую категорию.</p>
        </div>
      )}
    </>
  )
}
