import { redirect } from 'next/navigation'
import { getMe } from '@/lib/data'

export default async function Admin() {
  const me = await getMe()
  if (me?.role !== 'admin') redirect('/profile')
  return (
    <>
      <header className="top"><h1>Админ-панель</h1><p>Доступна только администратору</p></header>
      <div className="glass" style={{ padding: 24 }}>
        <h3 style={{ fontSize: 26, marginBottom: 8 }}>Вход выполнен</h3>
        <p style={{ margin: 0, color: 'var(--ink2)' }}>Защита работает: сюда попадает только администратор. Редактор конспектов, категории и теги появятся на следующем этапе.</p>
      </div>
    </>
  )
}
