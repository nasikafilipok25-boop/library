import Link from 'next/link'
import MaterialCard from '@/components/MaterialCard'
import { getPublishedWithText, getCategories, getFavIds } from '@/lib/data'

export default async function Library({ searchParams }: { searchParams: { q?: string; cat?: string; tag?: string } }) {
  const [all, cats, favIds] = await Promise.all([getPublishedWithText(), getCategories(), getFavIds()])
  const qRaw = (searchParams.q ?? '').trim()
  const q = qRaw.toLowerCase()
  const cat = searchParams.cat ?? 'all'
  const tag = searchParams.tag ?? ''

  const list = all.filter((m) =>
    (cat === 'all' || m.category?.id === cat) &&
    (!tag || m.tags.includes(tag)) &&
    (!q || [m.title, m.description ?? '', m.source ?? '', m.category?.name ?? '', ...m.tags, m.text].join(' ').toLowerCase().includes(q))
  )
  const allTags = Array.from(new Set(all.flatMap((m) => m.tags))).sort((a, b) => a.localeCompare(b, 'ru'))

  const href = (p: { cat?: string; tag?: string }) => {
    const u = new URLSearchParams()
    const c = p.cat ?? cat, t = p.tag ?? tag
    if (c && c !== 'all') u.set('cat', c)
    if (t) u.set('tag', t)
    if (qRaw) u.set('q', qRaw)
    const s = u.toString()
    return '/library' + (s ? '?' + s : '')
  }

  return (
    <>
      <header className="top"><h1>Библиотека</h1><p>Материалов: {all.length}</p></header>
      <form action="/library">
        <label className="glass search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="11" cy="11" r="6.5" /><path d="M16 16l4 4" /></svg>
          <input name="q" type="search" defaultValue={qRaw} placeholder="Поиск по названию и тексту" />
          {cat !== 'all' && <input type="hidden" name="cat" value={cat} />}
          {tag && <input type="hidden" name="tag" value={tag} />}
        </label>
      </form>
      <div className="chips">
        <Link href={href({ cat: 'all' })} className={`chip all ${cat === 'all' ? 'sel' : ''}`}>Все</Link>
        {cats.map((c) => (
          <Link key={c.id} href={href({ cat: c.id })} className={`chip ${cat === c.id ? 'sel' : ''}`} style={{ ['--c' as any]: c.color }}>{c.name}</Link>
        ))}
      </div>
      {allTags.length > 0 && (
        <div className="chips" style={{ marginTop: -10 }}>
          {tag && <Link href={href({ tag: '' })} className="chip all">Сбросить тег</Link>}
          {allTags.map((t) => (
            <Link key={t} href={href({ tag: t })} className={`chip all ${tag === t ? 'sel' : ''}`}>#{t}</Link>
          ))}
        </div>
      )}
      {list.length > 0 ? (
        <div className="grid">{list.map((m) => <MaterialCard key={m.id} m={m} fav={favIds.has(m.id)} />)}</div>
      ) : (
        <div className="glass" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 26, marginBottom: 6 }}>{all.length === 0 ? 'Пока нет материалов' : 'Ничего не найдено'}</h3>
          <p style={{ margin: 0, color: 'var(--ink2)' }}>{all.length === 0 ? 'Опубликованные материалы появятся здесь.' : 'Попробуйте другое слово, категорию или тег.'}</p>
        </div>
      )}
    </>
  )
}
