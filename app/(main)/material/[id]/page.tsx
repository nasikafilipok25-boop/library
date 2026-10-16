import Link from 'next/link'
import { notFound } from 'next/navigation'
import Cover from '@/components/Cover'
import FavButton from '@/components/FavButton'
import ViewTracker from '@/components/ViewTracker'
import { Blocks, mediaUrl } from '@/lib/blocks'
import { createClient } from '@/lib/supabase/server'
import { MAT_FIELDS, normalize } from '@/lib/data'

export default async function MaterialPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data } = await supabase.from('materials')
    .select(MAT_FIELDS + ',body,transcript,audio_path,status').eq('id', params.id).maybeSingle()
  if (!data) notFound()
  const m: any = { ...normalize(data), body: (data as any).body, transcript: (data as any).transcript, audio_path: (data as any).audio_path, status: (data as any).status }
  const { data: fav } = await supabase.from('favorites').select('material_id').eq('material_id', m.id).maybeSingle()
  const date = m.material_date ? new Date(m.material_date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }) : null

  return (
    <>
      <Link href="/library" className="back"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 5l-7 7 7 7" /></svg> Библиотека</Link>
      <div className="m-wrap">
        <div className="side hero">
          <Cover m={m} />
          <h1 className="m-title">{m.title}</h1>
          {m.description && <p className="m-lead">{m.description}</p>}
          <div className="pills">
            {m.status === 'draft' && <span className="pill t">Черновик</span>}
            {m.category && <span className="pill" style={{ ['--c' as any]: m.category.color }}>{m.category.name}</span>}
            {m.tags.map((t: string) => <Link key={t} href={`/library?tag=${encodeURIComponent(t)}`} className="pill t">#{t}</Link>)}
          </div>
          {(m.source || date) && (
            <div className="info">
              <div><small>Источник</small><b>{m.source ?? '—'}</b></div>
              <div><small>Дата</small><b>{date ?? '—'}</b></div>
            </div>
          )}
          {m.audio_path && <audio controls src={mediaUrl(m.audio_path)} style={{ width: '100%', marginBottom: 18 }} />}
          <FavButton id={m.id} initial={!!fav} big />
        </div>
        <div>
          <div className="prose"><Blocks blocks={m.body} /></div>
          {m.transcript && (
            <details className="glass" style={{ padding: '14px 18px', marginTop: 24 }}>
              <summary style={{ cursor: 'pointer', fontWeight: 600 }}>Исходная расшифровка</summary>
              <p className="raw" style={{ marginTop: 12 }}>{m.transcript}</p>
            </details>
          )}
        </div>
      </div>
      <ViewTracker id={m.id} />
    </>
  )
}
