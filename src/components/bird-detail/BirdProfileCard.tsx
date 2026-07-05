import { Heart, Medal, NotebookPen, Trophy } from '../icons'
import { DEFAULT_BIRD_IMAGE, formatSeasons } from '../../utils/bird'
import type { Bird } from '../../types'

interface BirdProfileCardProps {
  bird: Bird
  stats: {
    matches: number
    awards: number
    journals: number
    likes: number
  }
}

const STAT_ITEMS = [
  { key: 'matches' as const, label: 'Trận đấu', icon: Trophy },
  { key: 'awards' as const, label: 'Giải thưởng', icon: Medal },
  { key: 'journals' as const, label: 'Nhật ký', icon: NotebookPen },
  { key: 'likes' as const, label: 'Yêu thích', icon: Heart },
]

export default function BirdProfileCard({ bird, stats }: BirdProfileCardProps) {
  const seasonLabel = formatSeasons(bird.seasons)

  return (
    <div className="card-modern -mt-12 p-4">
      <div className="flex items-center gap-3.5">
        <div className="h-[72px] w-[72px] shrink-0 overflow-hidden rounded-full bg-gradient-to-br from-sky-100 to-blue-50 ring-4 ring-white">
          <img
            src={DEFAULT_BIRD_IMAGE}
            alt={bird.name}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-xl font-bold text-text">{bird.name}</h2>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            <span className="badge-pill">{seasonLabel}</span>
            {bird.pellets.trim() && (
              <span className="inline-block rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700">
                {bird.pellets}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-4 gap-2 border-t border-border/60 pt-4">
        {STAT_ITEMS.map(({ key, label, icon: Icon }) => (
          <div key={key} className="text-center">
            <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Icon className="h-4 w-4" strokeWidth={2} />
            </div>
            <p className="mt-1.5 text-base font-bold text-text">{stats[key]}</p>
            <p className="text-[10px] leading-tight text-text-muted">{label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
