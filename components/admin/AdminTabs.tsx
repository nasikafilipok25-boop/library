'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const TABS = [
  { href: '/admin', label: 'Материалы' },
  { href: '/admin/categories', label: 'Категории' },
  { href: '/admin/tags', label: 'Теги' }
]

export default function AdminTabs() {
  const path = usePathname()
  const on = (href: string) => (href === '/admin' ? path === '/admin' || path.startsWith('/admin/materials') : path.startsWith(href))
  return (
    <div className="atabs">
      {TABS.map((t) => <Link key={t.href} href={t.href} className={on(t.href) ? 'on' : ''}>{t.label}</Link>)}
    </div>
  )
}
