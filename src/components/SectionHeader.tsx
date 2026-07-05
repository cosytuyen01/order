import { Link } from 'react-router-dom'

interface SectionHeaderProps {
  title: string
  subtitle?: string
  linkTo?: string
  linkLabel?: string
}

export default function SectionHeader({
  title,
  subtitle,
  linkTo,
  linkLabel = 'Xem tất cả',
}: SectionHeaderProps) {
  return (
    <div className="mb-3 flex items-end justify-between gap-3">
      <div className="min-w-0">
        <h2 className="text-[17px] font-bold tracking-tight text-text">{title}</h2>
        {subtitle && (
          <p className="mt-0.5 text-xs text-text-muted">{subtitle}</p>
        )}
      </div>
      {linkTo && (
        <Link
          to={linkTo}
          className="shrink-0 text-sm font-semibold text-primary transition hover:text-primary-dark"
        >
          {linkLabel} &rsaquo;
        </Link>
      )}
    </div>
  )
}
