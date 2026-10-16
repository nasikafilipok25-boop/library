'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import ConfirmDelete from './ConfirmDelete'

type Cat = { id: string; name: string; color: string; sort_order: number }
const errText = (e: any) => (e?.code === '23505' ? 'Категория с таким названием уже есть' : 'Не получилось сохранить. Попробуйте ещё раз.')

function Row({ c, first, last, onMove }: { c: Cat; first: boolean; last: boolean; onMove: (d: -1 | 1) => void }) {
  const sb = createClient(); const router = useRouter()
  const [name, setName] = useState(c.name)
  const [color, setColor] = useState(c.color)
  const [msg, setMsg] = useState('')
  useEffect(() => { setName(c.name); setColor(c.color) }, [c.name, c.color])

  async function save() {
    if (!name.trim()) { setMsg('Название не может быть пустым'); return }
    const { error } = await sb.from('categories').update({ name: name.trim(), color }).eq('id', c.id)
    if (error) setMsg(errText(error)); else { setMsg('Сохранено'); router.refresh() }
  }
  async function del() {
    const { error } = await sb.from('categories').delete().eq('id', c.id)
    if (error) throw new Error('Не получилось удалить категорию')
    router.refresh()
  }
  return (
    <div className="glass fsec" style={{ padding: 14 }}>
      <div className="row-edit">
        <input type="color" className="swatch" value={color} onChange={(e) => setColor(e.target.value)} aria-label="Цвет" />
        <input className="field" value={name} onChange={(e) => { setName(e.target.value); setMsg('') }} aria-label="Название категории" />
        <button className="ib" disabled={first} onClick={() => onMove(-1)} aria-label="Выше">↑</button>
        <button className="ib" disabled={last} onClick={() => onMove(1)} aria-label="Ниже">↓</button>
      </div>
      <div className="row-edit" style={{ marginBottom: 0 }}>
        <button className="btn" onClick={save}>Сохранить</button>
        <ConfirmDelete message={`Категория «${c.name}» будет удалена. Материалы из неё не удаляются, они останутся без категории.`} onConfirm={del} />
        {msg && <span className="okmsg">{msg}</span>}
      </div>
    </div>
  )
}

export default function CategoriesManager({ initial }: { initial: Cat[] }) {
  const sb = createClient(); const router = useRouter()
  const [name, setName] = useState('')
  const [color, setColor] = useState('#C5DCE8')
  const [msg, setMsg] = useState('')

  async function add() {
    if (!name.trim()) { setMsg('Введите название'); return }
    const next = initial.reduce((m, r) => Math.max(m, r.sort_order), 0) + 1
    const { error } = await sb.from('categories').insert({ name: name.trim(), color, sort_order: next })
    if (error) setMsg(errText(error)); else { setName(''); setMsg(''); router.refresh() }
  }
  async function move(i: number, d: -1 | 1) {
    const a = initial[i], b = initial[i + d]
    if (!a || !b) return
    await sb.from('categories').update({ sort_order: b.sort_order }).eq('id', a.id)
    await sb.from('categories').update({ sort_order: a.sort_order }).eq('id', b.id)
    router.refresh()
  }
  return (
    <>
      <div className="glass fsec">
        <h3>Новая категория</h3>
        <div className="row-edit" style={{ marginTop: 12 }}>
          <input type="color" className="swatch" value={color} onChange={(e) => setColor(e.target.value)} aria-label="Цвет" />
          <input className="field" placeholder="Название, например «Практики»" value={name} onChange={(e) => setName(e.target.value)} />
          <button className="btn" onClick={add}>Добавить</button>
        </div>
        {msg && <p className="err" style={{ marginTop: 0 }}>{msg}</p>}
      </div>
      {initial.map((c, i) => <Row key={c.id} c={c} first={i === 0} last={i === initial.length - 1} onMove={(d) => move(i, d)} />)}
    </>
  )
}
