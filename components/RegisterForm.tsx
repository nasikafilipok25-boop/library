'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { authError } from '@/lib/authErrors'

export default function RegisterForm() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [sent, setSent] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const n = name.trim()
    if (!n) { setError('Введите имя'); return }
    if (password.length < 8) { setError('Пароль должен быть не короче 8 символов'); return }
    if (password !== confirm) { setError('Пароли не совпадают'); return }
    setBusy(true)
    const { data, error } = await createClient().auth.signUp({
      email: email.trim(),
      password,
      options: { data: { name: n }, emailRedirectTo: `${window.location.origin}/auth/callback` }
    })
    if (error) { setError(authError(error.message)); setBusy(false); return }
    if (data.session) { router.replace('/'); router.refresh(); return }
    if (data.user && data.user.identities && data.user.identities.length === 0) {
      setError('Эта почта уже зарегистрирована. Попробуйте войти.'); setBusy(false); return
    }
    setSent(true); setBusy(false)
  }

  if (sent) {
    return (
      <div className="glass" style={{ padding: 22 }} role="status">
        <h3 style={{ fontSize: 28, marginBottom: 8 }}>Проверьте почту</h3>
        <p style={{ margin: '0 0 16px', color: 'var(--ink2)' }}>
          Мы отправили письмо на {email.trim()}. Перейдите по ссылке из письма, и вы попадёте в библиотеку. Если письма нет, загляните в «Спам».
        </p>
        <Link href="/login" className="btn soft">Перейти ко входу</Link>
      </div>
    )
  }

  return (
    <form className="glass" style={{ padding: 22 }} onSubmit={submit}>
      <label htmlFor="nm" style={{ marginTop: 0 }}>Имя</label>
      <input id="nm" className="field" required autoComplete="given-name" value={name} onChange={(e) => setName(e.target.value)} />
      <label htmlFor="em">Почта</label>
      <input id="em" className="field" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <label htmlFor="pw">Пароль</label>
      <input id="pw" className="field" type="password" required autoComplete="new-password" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} />
      <label htmlFor="pw2">Повторите пароль</label>
      <input id="pw2" className="field" type="password" required autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
      <p style={{ margin: '8px 0 0', color: 'var(--ink2)', fontSize: 13.5 }}>Не короче 8 символов.</p>
      {error && <p className="err" role="alert">{error}</p>}
      <button className="btn" style={{ width: '100%', marginTop: 20 }} disabled={busy}>{busy ? 'Создаём аккаунт…' : 'Зарегистрироваться'}</button>
      <p style={{ textAlign: 'center', margin: '18px 0 0', color: 'var(--ink2)', fontSize: 15 }}>
        Уже есть аккаунт? <Link href="/login" style={{ fontWeight: 700, color: 'var(--ink)', textDecoration: 'underline', textUnderlineOffset: 3 }}>Войти</Link>
      </p>
    </form>
  )
}
