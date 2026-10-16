'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { authError } from '@/lib/authErrors'

export default function LoginForm({ notice }: { notice?: string }) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true); setError('')
    const { error } = await createClient().auth.signInWithPassword({ email: email.trim(), password })
    if (error) { setError(authError(error.message)); setBusy(false); return }
    router.replace('/')
    router.refresh()
  }

  return (
    <form className="glass" style={{ padding: 22 }} onSubmit={submit}>
      {notice && <p className="okmsg" style={{ marginTop: 0 }} role="status">{notice}</p>}
      <label htmlFor="em" style={{ marginTop: 0 }}>Почта</label>
      <input id="em" className="field" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <label htmlFor="pw">Пароль</label>
      <input id="pw" className="field" type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
      {error && <p className="err" role="alert">{error}</p>}
      <button className="btn" style={{ width: '100%', marginTop: 20 }} disabled={busy}>{busy ? 'Входим…' : 'Войти'}</button>
      <p style={{ textAlign: 'center', margin: '18px 0 0', color: 'var(--ink2)', fontSize: 15 }}>
        Нет аккаунта? <Link href="/register" style={{ fontWeight: 700, color: 'var(--ink)', textDecoration: 'underline', textUnderlineOffset: 3 }}>Зарегистрироваться</Link>
      </p>
    </form>
  )
}
