import Link from 'next/link'
import Cover from '@/components/Cover'
import MaterialCard from '@/components/MaterialCard'
import { getPublished, getCategories, getFavIds, getRecentIds, getMe } from '@/lib/data'

export default async function Home() {
  const [mats, cats, favIds, recentIds, me] = await Promise.all([
    getPublished(), getCategories(), getFavIds(), getRecentIds(), getMe()
  ])
  const favs = mats.filter((m) => favIds.has(m.id))
  const newest = mats.slice(0, 4)
  const recent = recentIds.map((id) => mats.find((m) => m.id === id)).filter(Boolean) as typeof mats
  const cont = recent[0]

  return (
    <>
      <header className="top"><h1>Моя библиотека</h1><p>Знания, заметки и разборы в одном месте</p></header>
      <form action="/library">
        <label className="glass search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="11" cy="11" r="6.5" /><path d="M16 16l4 4" /></svg>
          <input name="q" type="search" placeholder="Найти конспект, тему или тег" />
        </label>
      </form>
      {cats.length > 0 && (
        <div className="chips">
          {cats.map((c) => (
            <Link key={c.id} href={`/library?cat=${c.id}`} className="chip" style={{ ['--c' as any]: c.color }}>{c.name}</Link>
          ))}
        </div>
      )}

      {mats.length === 0 && (
        <div className="glass" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 26, marginBottom: 8 }}>Пока здесь пусто</h3>
          <p style={{ margin: 0, color: 'var(--ink2)' }}>
            {me?.role === 'admin' ? 'Откройте профиль и админ-панель, чтобы добавить первый материал.' : 'Опубликованные материалы появятся здесь.'}
          </p>
        </div>
      )}

      {cont && (
        <>
          <div className="sh"><h2>Продолжить изучение</h2></div>
          <Link href={`/material/${cont.id}`} className="cont glass">
            <Cover m={cont} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <h3>{cont.title}</h3>
              <p style={{ margin: 0 }}>{cont.source ?? cont.category?.name}</p>
            </div>
          </Link>
        </>
      )}

      {favs.length > 0 && (
        <>
          <div className="sh"><h2>Избранное</h2><Link href="/library" style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink2)', textDecoration: 'underline' }}>Все материалы</Link></div>
          <div className="rail">{favs.map((m) => <MaterialCard key={m.id} m={m} fav />)}</div>
        </>
      )}

      {newest.length > 0 && (
        <>
          <div className="sh"><h2>Недавно добавлено</h2></div>
          <div className="grid">{newest.map((m) => <MaterialCard key={m.id} m={m} fav={favIds.has(m.id)} />)}</div>
        </>
      )}

      {recent.length > 1 && (
        <>
          <div className="sh"><h2>Недавно просмотрено</h2></div>
          <div className="rail">{recent.map((m) => <MaterialCard key={m.id} m={m} fav={favIds.has(m.id)} />)}</div>
        </>
      )}
    </>
  )
}
