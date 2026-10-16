import Link from 'next/link'
import Cover from './Cover'
import FavButton from './FavButton'
import type { Mat } from '@/lib/data'

export default function MaterialCard({ m, fav }: { m: Mat; fav: boolean }) {
  return (
    <div className="card glass">
      <Link href={`/material/${m.id}`} className="open" style={{ display: 'block' }}>
        <Cover m={m} />
        <h3>{m.title}</h3>
        {m.description && <p className="meta">{m.description}</p>}
        {m.tags.length > 0 && <p className="tags">{m.tags.map((t) => '#' + t).join(' ')}</p>}
      </Link>
      <FavButton id={m.id} initial={fav} />
    </div>
  )
}
