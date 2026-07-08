import { UtensilsCrossed } from 'lucide-react'

interface ProductThumbProps {
  imageUrl?: string
  name: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const SIZES = {
  sm: 'h-12 w-12',
  md: 'h-14 w-14',
  lg: 'h-16 w-16',
} as const

const ICON_SIZES = {
  sm: 'h-5 w-5',
  md: 'h-6 w-6',
  lg: 'h-7 w-7',
} as const

export default function ProductThumb({
  imageUrl,
  name,
  size = 'md',
  className = '',
}: ProductThumbProps) {
  const sizeClass = SIZES[size]

  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={name}
        className={`${sizeClass} shrink-0 rounded-xl object-cover ${className}`}
      />
    )
  }

  return (
    <div
      className={`${sizeClass} flex shrink-0 items-center justify-center rounded-xl bg-warning-bg text-primary ${className}`}
      aria-hidden
    >
      <UtensilsCrossed className={ICON_SIZES[size]} strokeWidth={2} />
    </div>
  )
}
