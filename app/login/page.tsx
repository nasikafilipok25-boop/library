'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function Login() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true); setError('')
    const { error } = await createClient().auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message.includes('Invalid') ? 'Неверная почта или пароль' : 'Не получилось войти. Попробуйте ещё раз.')
      setBusy(false)
      return
    }
    router.replace('/')
    router.refresh()
  }

  return (
    <main className="app" style={{ maxWidth: 460, marginLeft: 'auto' }}>
      <header className="top" style={{ marginTop: 40 }}>
        <h1>Моя библиотека</h1>
        <p>Знания, заметки и разборы в одном месте</p>
      </header>
      <form className="glass" style={{ padding: 22 }} onSubmit={submit}>
        <label htmlFor="em" style={{ marginTop: 0 }}>Почта</label>
        <input id="em" className="field" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <label htmlFor="pw">Пароль</label>
        <input id="pw" className="field" type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
        {error && <p className="err" role="alert">{error}</p>}
        <button className="btn" style={{ width: '100%', marginTop: 20 }} disabled={busy}>{busy ? 'Входим…' : 'Войти'}</button>
      </form>
    </main>
  )
}
