import Link from 'next/link'
import { getMe } from '@/lib/data'
import { ThemeButton, SignOutButton } from '@/components/ProfileButtons'

export default async function Profile() {
  const me = await getMe()
  const admin = me?.role === 'admin'
  return (
    <>
      <header className="top"><h1>Профиль</h1><p>{me?.name || me?.email}</p></header>
      <div className="glass" style={{ overflow: 'hidden' }}>
        <div className="row2"><div><b>Почта</b><small>{me?.email}</small></div></div>
        <div className="row2"><div><b>Роль</b><small>{admin ? 'Администратор' : 'Читатель'}</small></div></div>
        {admin && (
          <div className="row2">
            <div><b>Админ-панель</b><small>Материалы, категории, теги</small></div>
            <Link href="/admin" className="btn soft">Открыть</Link>
          </div>
        )}
        <div className="row2"><div><b>Тёмная тема</b><small>Для вечернего чтения</small></div><ThemeButton /></div>
        <div className="row2"><div><b>Аккаунт</b><small>Выйти из приложения</small></div><SignOutButton /></div>
      </div>
    </>
  )
}
