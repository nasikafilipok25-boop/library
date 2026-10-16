'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const P = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' } as const
const ITEMS = [
  { href: '/', label: 'Главная', icon: <svg viewBox="0 0 24 24" {...P}><path d="M4 11l8-7 8 7v9a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z" /></svg> },
  { href: '/library', label: 'Библиотека', icon: <svg viewBox="0 0 24 24" {...P}><rect x="4" y="4" width="7" height="7" rx="2" /><rect x="13" y="4" width="7" height="7" rx="2" /><rect x="4" y="13" width="7" height="7" rx="2" /><rect x="13" y="13" width="7" height="7" rx="2" /></svg> },
  { href: '/ask', label: 'Спросить', icon: <svg viewBox="0 0 24 24" {...P}><path d="M5 5h14a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1h-8l-5 4v-4H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z" /></svg> },
  { href: '/people', label: 'Люди', icon: <svg viewBox="0 0 24 24" {...P}><circle cx="9" cy="8" r="3.2" /><path d="M3.5 19c.5-3.2 2.7-5 5.5-5s5 1.8 5.5 5" /><circle cx="17" cy="9" r="2.4" /><path d="M16.5 14c2.4.1 3.6 1.7 4 4" /></svg> },
  { href: '/profile', label: 'Профиль', icon: <svg viewBox="0 0 24 24" {...P}><circle cx="12" cy="8.5" r="3.6" /><path d="M5 20c.7-3.8 3.4-6 7-6s6.3 2.2 7 6" /></svg> }
]

export default function Nav() {
  const path = usePathname()
  const active = (href: string) =>
    href === '/' ? path === '/' : path.startsWith(href) || (href === '/library' && path.startsWith('/material'))
  return (
    <nav className="nav" aria-label="Основная навигация">
      <div className="brand">Библиотека</div>
      {ITEMS.map((i) => (
        <Link key={i.href} href={i.href} className={active(i.href) ? 'on' : ''}>{i.icon}{i.label}</Link>
      ))}
    </nav>
  )
}
