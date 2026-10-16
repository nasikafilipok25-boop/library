'use client'
import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function ViewTracker({ id }: { id: string }) {
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) supabase.from('views').upsert({ user_id: user.id, material_id: id, viewed_at: new Date().toISOString() })
    })
  }, [id])
  return null
}
