'use client'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function ThemeButton() {
  function toggle() {
    const d = document.documentElement
    const dark = d.dataset.theme === 'dark' || (!d.dataset.theme && window.matchMedia('(prefers-color-scheme: dark)').matches)
    const next = dark ? 'light' : 'dark'
    d.dataset.theme = next
    try { localStorage.setItem('theme', next) } catch {}
  }
  return <button className="btn soft" onClick={toggle}>Переключить</button>
}

export function SignOutButton() {
  const router = useRouter()
  async function out() {
    await createClient().auth.signOut()
    router.replace('/login')
    router.refresh()
  }
  return <button className="btn soft" onClick={out}>Выйти</button>
}
