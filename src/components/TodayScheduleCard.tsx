import { Link } from 'react-router-dom'
import { CARE_ITEMS, type DaySchedule } from '../types'
import { getCareDisplayValue, hasCareContent } from '../utils/care'
import { CARE_ICONS } from './icons'

interface TodayScheduleCardProps {
  today?: DaySchedule
  birdName?: string
}

export default function TodayScheduleCard({ today, birdName }: TodayScheduleCardProps) {
  const care = today?.care
  const hasCare = care && hasCareContent(care)

  return (
    <div className="glass-card overflow-hidden">
      <div className="bg-gradient-to-r from-primary to-primary-light px-5 py-4">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold text-white">Hôm nay</h2>
            <p className="text-xs font-medium text-white/80">
              {birdName ? `${birdName} · ` : ''}
              {today?.label ?? 'Chế độ hôm nay'}
            </p>
          </div>
          <span className="rounded-full bg-white/20 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
            Chế độ
          </span>
        </div>
      </div>

      <div className="space-y-3.5 p-5">
        {hasCare ? (
          CARE_ITEMS.map((item) => {
            const value = getCareDisplayValue(care, item.key)
            if (!value) return null
            const Icon = CARE_ICONS[item.key]
            return (
              <div key={item.key} className="flex items-center gap-3.5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-text-muted">
                    {item.label}
                  </p>
                  <p className="font-semibold text-text">{value}</p>
                </div>
              </div>
            )
          })
        ) : (
          <p className="py-2 text-sm text-text-muted">
            Chưa có chế độ cho hôm nay. Hãy cập nhật trong tab Chế độ.
          </p>
        )}

        <Link to="/che-do-di" className="btn-primary mt-1 block w-full">
          Xem chế độ 7 ngày
        </Link>
      </div>
    </div>
  )
}
