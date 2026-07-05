import { Link } from 'react-router-dom'
import type { Bird } from '../types'
import { DEFAULT_BIRD_IMAGE, formatSeasons } from '../utils/bird'
import { X } from './icons'

interface BirdCardProps {
  bird: Bird
  onDelete?: (id: string) => void
  compact?: boolean
}

export default function BirdCard({ bird, onDelete, compact }: BirdCardProps) {
  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onDelete?.(bird.id)
  }

  return (
    <Link
      to={`/birds/${bird.id}`}
      className={[
        'relative block shrink-0 overflow-hidden bg-page transition active:scale-[0.98]',
        compact
          ? 'flex min-h-[194px] h-full w-[128px] flex-col rounded-3xl shadow-[var(--shadow-card)] hover:shadow-lg'
          : 'w-full rounded-3xl shadow-[var(--shadow-card)] hover:shadow-lg',
      ].join(' ')}
    >
      {onDelete && (
        <button
          type="button"
          onClick={handleDelete}
          className={[
            'absolute right-2.5 top-2.5 z-10 flex items-center justify-center rounded-full text-white backdrop-blur-sm',
            compact ? 'h-7 w-7 bg-black/45' : 'h-8 w-8 bg-black/40',
          ].join(' ')}
        >
          <X className="h-3.5 w-3.5" strokeWidth={2.5} />
        </button>
      )}
      <div
        className={[
          'overflow-hidden',
          compact ? 'aspect-square bg-gradient-to-br from-sky-50 to-blue-100' : 'aspect-[4/3] bg-slate-100',
        ].join(' ')}
      >
        <img
          src={DEFAULT_BIRD_IMAGE}
          alt={bird.name}
          className="h-full w-full object-cover"
        />
      </div>
      <div className={compact ? 'p-3 text-center' : 'space-y-1.5 p-3.5'}>
        <p className="truncate font-bold text-text">{bird.name}</p>
        <span className="badge-pill">{formatSeasons(bird.seasons)}</span>
        {bird.pellets.trim() && !compact && (
          <p className="truncate text-xs text-text-muted">Cám: {bird.pellets}</p>
        )}
      </div>
    </Link>
  )
}
