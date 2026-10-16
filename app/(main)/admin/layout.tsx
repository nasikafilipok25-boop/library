import { redirect } from 'next/navigation'
import { getMe } from '@/lib/data'
import AdminTabs from '@/components/admin/AdminTabs'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const me = await getMe()
  if (me?.role !== 'admin') redirect('/profile')
  return (<><AdminTabs />{children}</>)
}
