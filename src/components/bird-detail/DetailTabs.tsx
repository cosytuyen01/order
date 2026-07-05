import type { LucideIcon } from 'lucide-react'
import { Calendar, Info, NotebookPen } from '../icons'

type DetailTab = 'info' | 'schedule' | 'records'

const TABS: { id: DetailTab; label: string; icon: LucideIcon }[] = [
  { id: 'info', label: 'Thông tin', icon: Info },
  { id: 'schedule', label: 'Chế độ', icon: Calendar },
  { id: 'records', label: 'Nhật ký', icon: NotebookPen },
]

interface DetailTabsProps {
  active: DetailTab
  onChange: (tab: DetailTab) => void
}

export type { DetailTab }

export default function DetailTabs({ active, onChange }: DetailTabsProps) {
  return (
    <div className="grid grid-cols-3 gap-1 rounded-2xl bg-white p-1 shadow-[var(--shadow-card)]">
      {TABS.map((tab) => {
        const Icon = tab.icon
        const isActive = active === tab.id
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={[
              'inline-flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-semibold transition',
              isActive
                ? 'bg-primary text-white shadow-sm'
                : 'text-text-muted hover:text-primary',
            ].join(' ')}
          >
            {isActive && <Icon className="h-4 w-4 shrink-0" strokeWidth={2} />}
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
