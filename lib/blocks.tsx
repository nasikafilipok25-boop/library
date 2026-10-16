import { ReactNode } from 'react'

// Формат блоков конспекта (хранится в materials.body)
export type Block = {
  id: string
  type: 'h2' | 'h3' | 'p' | 'quote' | 'ul' | 'ol' | 'image' | 'divider'
  text?: string       // **жирный** и *курсив*
  items?: string[]    // для списков
  path?: string       // для изображений: путь в Storage
  caption?: string
}

export function mediaUrl(path: string) {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/material-media/${path}`
}

function inline(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).map((s, i) => {
    if (s.length > 4 && s.startsWith('**') && s.endsWith('**')) return <strong key={i}>{s.slice(2, -2)}</strong>
    if (s.length > 2 && s.startsWith('*') && s.endsWith('*')) return <em key={i}>{s.slice(1, -1)}</em>
    return s
  })
}

export function Blocks({ blocks }: { blocks: Block[] }) {
  return (
    <>
      {(blocks ?? []).map((b) => {
        switch (b.type) {
          case 'h2': return <h2 key={b.id}>{inline(b.text ?? '')}</h2>
          case 'h3': return <h3 key={b.id}>{inline(b.text ?? '')}</h3>
          case 'p': return <p key={b.id}>{inline(b.text ?? '')}</p>
          case 'quote': return <blockquote key={b.id}>{inline(b.text ?? '')}</blockquote>
          case 'ul': return <ul key={b.id}>{(b.items ?? []).map((t, i) => <li key={i}>{inline(t)}</li>)}</ul>
          case 'ol': return <ol key={b.id}>{(b.items ?? []).map((t, i) => <li key={i}>{inline(t)}</li>)}</ol>
          case 'divider': return <hr key={b.id} />
          case 'image': return b.path ? (
            <figure className="figure" key={b.id}>
              <img src={mediaUrl(b.path)} alt={b.caption ?? ''} style={{ width: '100%', borderRadius: 22, display: 'block' }} />
              {b.caption && <figcaption>{b.caption}</figcaption>}
            </figure>
          ) : null
          default: return null
        }
      })}
    </>
  )
}
