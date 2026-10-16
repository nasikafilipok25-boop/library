import LoginForm from '@/components/LoginForm'

export default function Login({ searchParams }: { searchParams: { notice?: string } }) {
  const notice =
    searchParams.notice === 'confirmed' ? 'Почта подтверждена. Теперь войдите.' :
    searchParams.notice === 'expired' ? 'Ссылка недействительна или устарела. Войдите или зарегистрируйтесь снова.' : ''
  return (
    <main className="app" style={{ maxWidth: 460, marginLeft: 'auto' }}>
      <header className="top" style={{ marginTop: 40 }}>
        <h1>Моя библиотека</h1>
        <p>Знания, заметки и разборы в одном месте</p>
      </header>
      <LoginForm notice={notice} />
    </main>
  )
}
