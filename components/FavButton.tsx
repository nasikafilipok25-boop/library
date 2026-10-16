'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function FavButton({ id, initial, big }: { id: string; initial: boolean; big?: boolean }) {
  const [on, setOn] = useState(initial)
  const router = useRouter()
  async function toggle() {
    const next = !on
    setOn(next)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    if (next) await supabase.from('favorites').insert({ user_id: user.id, material_id: id })
    else await supabase.from('favorites').delete().eq('material_id', id).eq('user_id', user.id)
    router.refresh()
  }
  if (big) {
    return <button className="btn soft" style={{ width: '100%' }} onClick={toggle} aria-pressed={on}>{on ? 'В избранном' : 'Добавить в избранное'}</button>
  }
  return (
    <button className="fav" onClick={toggle} aria-pressed={on} aria-label="В избранное">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" /></svg>
    </button>
  )
}
