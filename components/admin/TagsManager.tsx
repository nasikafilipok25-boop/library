'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import ConfirmDelete from './ConfirmDelete'

type Tag = { id: string; name: string; count: number }
const clean = (s: string) => s.trim().replace(/^#+/, '').trim()
const errText = (e: any) => (e?.code === '23505' ? 'Такой тег уже есть' : 'Не получилось сохранить. Попробуйте ещё раз.')

function Row({ t }: { t: Tag }) {
  const sb = createClient(); const router = useRouter()
  const [name, setName] = useState(t.name)
  const [msg, setMsg] = useState('')
  useEffect(() => setName(t.name), [t.name])

  async function save() {
    const n = clean(name)
    if (!n) { setMsg('Название не может быть пустым'); return }
    const { error } = await sb.from('tags').update({ name: n }).eq('id', t.id)
    if (error) setMsg(errText(error)); else { setMsg('Сохранено'); router.refresh() }
  }
  async function del() {
    const { error } = await sb.from('tags').delete().eq('id', t.id)
    if (error) throw new Error('Не получилось удалить тег')
    router.refresh()
  }
  return (
    <div className="glass fsec" style={{ padding: 14 }}>
      <div className="row-edit">
        <input className="field" value={name} onChange={(e) => { setName(e.target.value); setMsg('') }} aria-label="Название тега" />
        <span style={{ color: 'var(--ink2)', fontSize: 14 }}>Материалов: {t.count}</span>
      </div>
      <div className="row-edit" style={{ marginBottom: 0 }}>
        <button className="btn" onClick={save}>Сохранить</button>
        <ConfirmDelete message={`Тег «${t.name}» будет убран у всех материалов. Сами материалы останутся.`} onConfirm={del} />
        {msg && <span className="okmsg">{msg}</span>}
      </div>
    </div>
  )
}

export default function TagsManager({ initial }: { initial: Tag[] }) {
  const sb = createClient(); const router = useRouter()
  const [name, setName] = useState('')
  const [msg, setMsg] = useState('')
  async function add() {
    const n = clean(name)
    if (!n) { setMsg('Введите название'); return }
    const { error } = await sb.from('tags').insert({ name: n })
    if (error) setMsg(errText(error)); else { setName(''); setMsg(''); router.refresh() }
  }
  return (
    <>
      <div className="glass fsec">
        <h3>Новый тег</h3>
        <p className="hint">Теги можно также создавать прямо в форме материала.</p>
        <div className="row-edit">
          <input className="field" placeholder="Например: богини" value={name} onChange={(e) => setName(e.target.value)} />
          <button className="btn" onClick={add}>Добавить</button>
        </div>
        {msg && <p className="err" style={{ marginTop: 0 }}>{msg}</p>}
      </div>
      {initial.length === 0 && <p style={{ color: 'var(--ink2)' }}>Тегов пока нет.</p>}
      {initial.map((t) => <Row key={t.id} t={t} />)}
    </>
  )
}
