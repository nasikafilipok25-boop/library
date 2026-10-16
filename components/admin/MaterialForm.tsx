'use client'
import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { mediaUrl, type Block } from '@/lib/blocks'
import DeleteMaterial from './DeleteMaterial'

type Cat = { id: string; name: string; color: string }
export type Init = {
  id: string; isNew: boolean; title: string; description: string; category_id: string
  cover_path: string | null; source: string; material_date: string; body: Block[]
  status: 'draft' | 'published'; published_at: string | null; created_at: string | null; updated_at: string | null
}

const LABELS: Record<Block['type'], string> = {
  h2: 'Заголовок', h3: 'Подзаголовок', p: 'Текст', quote: 'Цитата',
  ul: 'Маркированный список', ol: 'Нумерованный список', image: 'Изображение', divider: 'Разделитель'
}
const ADD: Block['type'][] = ['h2', 'h3', 'p', 'ul', 'ol', 'quote', 'image', 'divider']
const uid = () => crypto.randomUUID()
function newBlock(type: Block['type']): Block {
  if (type === 'ul' || type === 'ol') return { id: uid(), type, items: [''] }
  if (type === 'image' || type === 'divider') return { id: uid(), type }
  return { id: uid(), type, text: '' }
}
const fmtDate = (s: string | null) => (s ? new Date(s).toLocaleString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—')

export default function MaterialForm({ init, categories, allTags, selectedTags }: {
  init: Init; categories: Cat[]; allTags: string[]; selectedTags: string[]
}) {
  const router = useRouter()
  const sb = useMemo(() => createClient(), [])
  const id = init.id
  const [title, setTitle] = useState(init.title)
  const [description, setDescription] = useState(init.description)
  const [categoryId, setCategoryId] = useState(init.category_id)
  const [source, setSource] = useState(init.source)
  const [date, setDate] = useState(init.material_date)
  const [cover, setCover] = useState<string | null>(init.cover_path)
  const [blocks, setBlocks] = useState<Block[]>(init.body)
  const [tags, setTags] = useState<string[]>(selectedTags)
  const [known, setKnown] = useState<string[]>(allTags)
  const [newTag, setNewTag] = useState('')
  const [removed, setRemoved] = useState<string[]>([])
  const [focusId, setFocusId] = useState<string | null>(null)
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)
  const [uploading, setUploading] = useState(false)

  /* ---------- файлы ---------- */
  async function upload(file: File): Promise<string | null> {
    if (!file.type.startsWith('image/')) { setMsg('Выберите файл с изображением'); return null }
    if (file.size > 8 * 1024 * 1024) { setMsg('Файл больше 8 МБ. Уменьшите изображение и попробуйте снова.'); return null }
    const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg'
    const path = `materials/${id}/${uid()}.${ext}`
    setUploading(true); setMsg('')
    const { error } = await sb.storage.from('material-media').upload(path, file, { contentType: file.type })
    setUploading(false)
    if (error) { setMsg('Не удалось загрузить изображение. Попробуйте ещё раз.'); return null }
    return path
  }
  async function onCover(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; e.target.value = ''
    if (!f) return
    const p = await upload(f)
    if (p) { if (cover) setRemoved((r) => [...r, cover]); setCover(p) }
  }
  async function onBlockImage(b: Block, e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; e.target.value = ''
    if (!f) return
    const p = await upload(f)
    if (p) { if (b.path) setRemoved((r) => [...r, b.path!]); patch(b.id, { path: p }) }
  }

  /* ---------- блоки ---------- */
  const patch = (bid: string, p: Partial<Block>) => setBlocks((bs) => bs.map((b) => (b.id === bid ? { ...b, ...p } : b)))
  function setText(b: Block, value: string) {
    if (b.type === 'ul' || b.type === 'ol') patch(b.id, { items: value.split('\n') })
    else patch(b.id, { text: value })
  }
  function move(i: number, d: -1 | 1) {
    setBlocks((bs) => { const a = [...bs]; const j = i + d; if (j < 0 || j >= a.length) return bs; [a[i], a[j]] = [a[j], a[i]]; return a })
  }
  function removeBlock(b: Block) {
    if (b.path) setRemoved((r) => [...r, b.path!])
    setBlocks((bs) => bs.filter((x) => x.id !== b.id))
  }
  function wrap(mark: string) {
    if (!focusId) return
    const el = document.getElementById('b-' + focusId) as HTMLTextAreaElement | null
    const b = blocks.find((x) => x.id === focusId)
    if (!el || !b) return
    const { selectionStart: s, selectionEnd: e, value } = el
    if (s === e) { setMsg('Сначала выделите слово или фразу в тексте'); return }
    setMsg('')
    setText(b, value.slice(0, s) + mark + value.slice(s, e) + mark + value.slice(e))
  }

  /* ---------- теги ---------- */
  const toggleTag = (t: string) => setTags((ts) => (ts.includes(t) ? ts.filter((x) => x !== t) : [...ts, t]))
  function addTag() {
    const n = newTag.trim().replace(/^#+/, '').trim()
    if (!n) return
    const exists = known.find((k) => k.toLowerCase() === n.toLowerCase()) ?? n
    if (!known.includes(exists)) setKnown((k) => [...k, exists])
    setTags((ts) => (ts.includes(exists) ? ts : [...ts, exists]))
    setNewTag('')
  }

  /* ---------- сохранение ---------- */
  async function save(status: 'draft' | 'published') {
    if (!title.trim()) { setMsg('Введите название материала'); return }
    setBusy(true); setMsg('')
    const clean = blocks
      .map((b) => (b.type === 'ul' || b.type === 'ol' ? { ...b, items: (b.items ?? []).map((s) => s.trim()).filter(Boolean) } : b))
      .filter((b) => b.type === 'divider' || (b.type === 'image' ? !!b.path : b.type === 'ul' || b.type === 'ol' ? (b.items?.length ?? 0) > 0 : !!(b.text ?? '').trim()))

    const { error } = await sb.from('materials').upsert({
      id, title: title.trim(), description: description.trim() || null, category_id: categoryId || null,
      cover_path: cover, source: source.trim() || null, material_date: date || null, body: clean, status,
      published_at: status === 'published' ? init.published_at ?? new Date().toISOString() : init.published_at
    })
    if (error) { setMsg('Не удалось сохранить: ' + error.message); setBusy(false); return }

    // теги: создаём недостающие и заменяем набор у материала
    let tagRows: { id: string; name: string }[] = []
    if (tags.length) {
      const r = await sb.from('tags').upsert(tags.map((name) => ({ name })), { onConflict: 'name' }).select('id,name')
      if (r.error) { setMsg('Материал сохранён, но теги не удалось сохранить.'); setBusy(false); return }
      tagRows = r.data ?? []
    }
    await sb.from('material_tags').delete().eq('material_id', id)
    if (tagRows.length) await sb.from('material_tags').insert(tagRows.map((t) => ({ material_id: id, tag_id: t.id })))

    // удаляем из хранилища файлы, которые больше не используются
    const used = new Set<string>([...(cover ? [cover] : []), ...clean.filter((b) => b.path).map((b) => b.path!)])
    const trash = removed.filter((p) => !used.has(p))
    if (trash.length) await sb.storage.from('material-media').remove(trash)

    router.push('/admin')
    router.refresh()
  }

  const published = init.status === 'published'
  return (
    <>
      <Link href="/admin" className="back">← Все материалы</Link>
      <header className="top" style={{ marginTop: 0 }}>
        <h1>{init.isNew ? 'Новый материал' : 'Редактирование'}</h1>
        {!init.isNew && <p>{published ? 'Опубликован' : 'Черновик'} · изменён {fmtDate(init.updated_at)}</p>}
      </header>

      <section className="glass fsec">
        <h3>Основное</h3>
        <label htmlFor="t">Название</label>
        <input id="t" className="field" value={title} onChange={(e) => setTitle(e.target.value)} />
        <label htmlFor="d">Краткое описание</label>
        <textarea id="d" className="field area" style={{ minHeight: 70 }} value={description} onChange={(e) => setDescription(e.target.value)} />
        <label htmlFor="c">Категория</label>
        <select id="c" className="field" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
          <option value="">Без категории</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <label htmlFor="s">Источник (эфир, номер или ссылка)</label>
        <input id="s" className="field" value={source} onChange={(e) => setSource(e.target.value)} placeholder="Например: Эфир №4" />
        <label htmlFor="dt">Дата</label>
        <input id="dt" className="field" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        {!init.isNew && <p className="hint" style={{ marginTop: 14 }}>Создан: {fmtDate(init.created_at)}</p>}
      </section>

      <section className="glass fsec">
        <h3>Обложка</h3>
        <p className="hint">Если обложки нет, карточка будет с мягким градиентом цвета категории.</p>
        {cover && <img src={mediaUrl(cover)} alt="" style={{ width: '100%', maxWidth: 360, borderRadius: 18, display: 'block', margin: '10px 0' }} />}
        <div className="row-edit" style={{ marginBottom: 0 }}>
          <label className="btn soft" style={{ margin: 0 }}>{cover ? 'Заменить' : 'Загрузить обложку'}
            <input type="file" accept="image/*" hidden onChange={onCover} />
          </label>
          {cover && <button type="button" className="btn soft" onClick={() => { setRemoved((r) => [...r, cover]); setCover(null) }}>Убрать</button>}
        </div>
      </section>

      <section className="glass fsec">
        <h3>Теги</h3>
        <div className="row-edit" style={{ marginTop: 10 }}>
          {known.length === 0 && <span className="hint" style={{ margin: 0 }}>Тегов пока нет, добавьте первый ниже.</span>}
          {known.map((t) => <button type="button" key={t} className={`tagbtn ${tags.includes(t) ? 'on' : ''}`} aria-pressed={tags.includes(t)} onClick={() => toggleTag(t)}>#{t}</button>)}
        </div>
        <div className="row-edit" style={{ marginBottom: 0 }}>
          <input className="field" value={newTag} placeholder="Новый тег" onChange={(e) => setNewTag(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag() } }} />
          <button type="button" className="btn soft" onClick={addTag}>Добавить тег</button>
        </div>
      </section>

      <section className="glass fsec">
        <h3>Текст конспекта</h3>
        <p className="hint">Добавляйте блоки по порядку: заголовки, текст, изображения. Блоки можно двигать стрелками. Чтобы выделить слово жирным или курсивом, выделите его в тексте и нажмите Ж или К.</p>
        <div className="row-edit" style={{ marginTop: 10 }}>
          <button type="button" className="ib" onMouseDown={(e) => e.preventDefault()} onClick={() => wrap('**')} aria-label="Жирный">Ж</button>
          <button type="button" className="ib" style={{ fontStyle: 'italic' }} onMouseDown={(e) => e.preventDefault()} onClick={() => wrap('*')} aria-label="Курсив">К</button>
        </div>

        {blocks.map((b, i) => (
          <div className="glass brow" key={b.id}>
            <div className="bh">
              <span>{LABELS[b.type]}</span>
              <div style={{ display: 'flex', gap: 6 }}>
                <button type="button" className="ib" disabled={i === 0} onClick={() => move(i, -1)} aria-label="Выше">↑</button>
                <button type="button" className="ib" disabled={i === blocks.length - 1} onClick={() => move(i, 1)} aria-label="Ниже">↓</button>
                <button type="button" className="ib" onClick={() => removeBlock(b)} aria-label="Удалить блок">✕</button>
              </div>
            </div>
            {b.type === 'divider' && <hr style={{ border: 0, borderTop: '1px solid var(--line)', margin: '8px 0' }} />}
            {b.type === 'image' && (
              <>
                {b.path && <img src={mediaUrl(b.path)} alt="" style={{ width: '100%', maxWidth: 420, borderRadius: 16, display: 'block', marginBottom: 10 }} />}
                <label className="btn soft" style={{ margin: '0 0 10px' }}>{b.path ? 'Заменить изображение' : 'Загрузить изображение'}
                  <input type="file" accept="image/*" hidden onChange={(e) => onBlockImage(b, e)} />
                </label>
                <input className="field" placeholder="Подпись (необязательно)" value={b.caption ?? ''} onChange={(e) => patch(b.id, { caption: e.target.value })} />
              </>
            )}
            {b.type !== 'divider' && b.type !== 'image' && (
              <>
                <textarea id={'b-' + b.id} className="field area" onFocus={() => setFocusId(b.id)}
                  style={{ fontSize: b.type === 'h2' ? 20 : 16, fontWeight: b.type === 'h2' || b.type === 'h3' ? 700 : 400 }}
                  rows={b.type === 'h2' || b.type === 'h3' ? 2 : 5}
                  placeholder={b.type === 'ul' || b.type === 'ol' ? 'Каждый пункт с новой строки' : ''}
                  value={b.type === 'ul' || b.type === 'ol' ? (b.items ?? []).join('\n') : b.text ?? ''}
                  onChange={(e) => setText(b, e.target.value)} />
              </>
            )}
          </div>
        ))}
        <div className="addbar">
          {ADD.map((t) => <button type="button" key={t} className="tagbtn" onClick={() => setBlocks((bs) => [...bs, newBlock(t)])}>+ {LABELS[t]}</button>)}
        </div>
      </section>

      {msg && <p className="err" role="alert">{msg}</p>}
      <div className="actions">
        {published ? (
          <>
            <button className="btn" disabled={busy || uploading} onClick={() => save('published')}>{busy ? 'Сохраняем…' : 'Сохранить'}</button>
            <button className="btn soft" disabled={busy || uploading} onClick={() => save('draft')}>Снять с публикации</button>
          </>
        ) : (
          <>
            <button className="btn" disabled={busy || uploading} onClick={() => save('published')}>{busy ? 'Сохраняем…' : 'Опубликовать'}</button>
            <button className="btn soft" disabled={busy || uploading} onClick={() => save('draft')}>Сохранить черновик</button>
          </>
        )}
        {!init.isNew && <Link href={`/material/${id}`} className="btn soft">Открыть материал</Link>}
        {!init.isNew && <DeleteMaterial id={id} title={title} redirectTo="/admin" />}
      </div>
      {uploading && <p className="okmsg">Загружаем изображение…</p>}
    </>
  )
}
