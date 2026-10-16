import { mediaUrl } from '@/lib/blocks'

const TINTS = ['#DDD6E8', '#F3E6B0', '#F3C3CC', '#C5DCE8', '#EBCFD3']

function hash(s: string) {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return h
}

export default function Cover({ m }: { m: { id: string; cover_path: string | null; category: { color: string } | null } }) {
  if (m.cover_path) {
    return <div className="cover photo"><img src={mediaUrl(m.cover_path)} alt="" /></div>
  }
  const h = hash(m.id)
  const style = {
    '--a': m.category?.color ?? '#C5DCE8',
    '--b': '#F8F4EE',
    '--c': TINTS[h % TINTS.length],
    '--x': `${25 + (h % 50)}%`,
    '--y': `${25 + ((h >> 3) % 50)}%`
  } as React.CSSProperties
  return <div className="cover" style={style} />
}
