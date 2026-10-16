import { redirect } from 'next/navigation'
import Nav from '@/components/Nav'
import { getMe } from '@/lib/data'

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const me = await getMe()
  if (!me) redirect('/login')
  return (
    <>
      <Nav />
      <main className="app"><div className="screen on">{children}</div></main>
    </>
  )
}
