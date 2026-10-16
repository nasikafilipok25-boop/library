'use client'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Block } from '@/lib/blocks'
import ConfirmDelete from './ConfirmDelete'

export default function DeleteMaterial({ id, title, redirectTo }: { id: string; title: string; redirectTo?: string }) {
  const router = useRouter()
  async function del() {
    const sb = createClient()
    const { data } = await sb.from('materials').select('cover_path,body').eq('id', id).maybeSingle()
    const paths = [data?.cover_path, ...(((data?.body as Block[] | null) ?? []).filter((b) => b.type === 'image').map((b) => b.path))].filter(Boolean) as string[]
    const { error } = await sb.from('materials').delete().eq('id', id)
    if (error) throw new Error('Не удалось удалить материал')
    if (paths.length) await sb.storage.from('material-media').remove(paths)
    if (redirectTo) router.push(redirectTo)
    router.refresh()
  }
  return <ConfirmDelete message={`Материал «${title}» будет удалён вместе с его изображениями. Это нельзя отменить.`} onConfirm={del} />
}
