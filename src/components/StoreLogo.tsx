import { Store } from 'lucide-react'

interface StoreLogoProps {
  logoUrl?: string
  name: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const SIZES = {
  sm: 'h-12 w-12',
  md: 'h-16 w-16',
  lg: 'h-20 w-20',
  xl: 'h-24 w-24',
} as const

const ICON_SIZES = {
  sm: 'h-5 w-5',
  md: 'h-7 w-7',
  lg: 'h-9 w-9',
  xl: 'h-10 w-10',
} as const

export default function StoreLogo({
  logoUrl,
  name,
  size = 'md',
  className = '',
}: StoreLogoProps) {
  const sizeClass = SIZES[size]

  if (logoUrl) {
    return (
      <img
        src={logoUrl}
        alt={name}
        className={`${sizeClass} shrink-0 rounded-2xl border border-border/60 object-cover shadow-sm ${className}`}
      />
    )
  }

  return (
    <div
      className={`${sizeClass} flex shrink-0 items-center justify-center rounded-2xl border border-border/60 bg-warning-bg text-primary shadow-sm ${className}`}
      aria-hidden
    >
      <Store className={ICON_SIZES[size]} strokeWidth={2} />
    </div>
  )
}
