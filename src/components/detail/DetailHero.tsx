import { type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { Store } from 'lucide-react'
import { ChevronLeft } from '../icons'
import { HOME_BG } from '../../utils/branding'

interface DetailHeroProps {
  imageUrl?: string
  imageAlt: string
  title: string
  subtitle: string
  showBack?: boolean
  footer?: ReactNode
  compact?: boolean
}

export default function DetailHero({
  imageUrl = HOME_BG,
  imageAlt,
  title,
  subtitle,
  showBack = true,
  footer,
  compact = false,
}: DetailHeroProps) {
  const navigate = useNavigate()

  return (
    <div
      className={`relative overflow-hidden ${footer || compact ? '' : 'min-h-36'}`}
    >
      <img
        src={imageUrl}
        alt={imageAlt}
        className="absolute inset-0 h-full w-full object-cover object-top"
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#fdf8f3]/40 via-transparent to-transparent"
        aria-hidden
      />

      <div
        className={`relative flex flex-col px-4 pt-[max(0.75rem,env(safe-area-inset-top))] ${compact ? 'pb-1' : 'pb-3'}`}
      >
        <div className="flex items-start gap-3">
          {showBack && (
            <button
              type="button"
              onClick={() => navigate(-1)}
              aria-label="Quay lại"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border/60 bg-white text-brown shadow-sm transition hover:bg-input-beige"
            >
              <ChevronLeft className="h-6 w-6" strokeWidth={2} />
            </button>
          )}

          <div className="min-w-0 flex-1 pt-0.5">
            <h1 className="text-2xl font-bold tracking-tight text-brown">{title}</h1>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-brown-light">
              <Store className="h-4 w-4 shrink-0 text-primary" strokeWidth={2} />
              <span className="truncate">{subtitle}</span>
            </p>
          </div>
        </div>

        {footer && <div className="mt-3">{footer}</div>}
      </div>
    </div>
  )
}
