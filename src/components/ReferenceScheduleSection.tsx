import { Link } from 'react-router-dom'
import { Lightbulb, Bird, Calendar } from './icons'
import SectionHeader from './SectionHeader'
import type { ReferenceScheduleEntry } from '../hooks/useReferenceSchedules'
import { formatSeasons } from '../utils/bird'
import { getTodaySchedule } from '../utils/schedule'
import { getCareDisplayValue, hasCareContent } from '../utils/care'

interface ReferenceScheduleSectionProps {
  entries: ReferenceScheduleEntry[]
  loading: boolean
}

export default function ReferenceScheduleSection({
  entries,
  loading,
}: ReferenceScheduleSectionProps) {
  if (loading) {
    return (
      <section>
        <SectionHeader title="Tham khảo chế độ" />
        <div className="section-scroll">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-40 w-[220px] shrink-0 animate-pulse rounded-3xl bg-white/70"
            />
          ))}
        </div>
      </section>
    )
  }

  return (
    <section>
      <SectionHeader
        title="Tham khảo chế độ"
        subtitle="Xem chế độ của chiến binh từ thành viên khác"
      />

      <div className="mb-4 rounded-3xl bg-gradient-to-br from-primary/10 via-primary/5 to-blue-50 p-4">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary">
            <Lightbulb className="h-5 w-5" strokeWidth={2} />
          </span>
          <div>
            <p className="font-bold text-text">Khám phá chế độ hay</p>
            <p className="mt-0.5 text-sm text-text-muted">
              Học hỏi cách chăm sóc từ các thành viên khác trong CLB.
            </p>
          </div>
        </div>
      </div>

      {entries.length === 0 ? (
        <div className="card-modern p-6 text-center text-sm text-text-muted">
          Chưa có chế độ tham khảo từ thành viên khác.
        </div>
      ) : (
        <div className="section-scroll">
          {entries.map((entry) => {
            const today = getTodaySchedule(entry.days)
            const todayCare = today?.care
            const todayPreview =
              todayCare && hasCareContent(todayCare)
                ? getCareDisplayValue(todayCare, 'sunbathing') ||
                  getCareDisplayValue(todayCare, 'fruit') ||
                  getCareDisplayValue(todayCare, 'liveFood') ||
                  'Có chế độ hôm nay'
                : 'Xem chi tiết 7 ngày'

            return (
              <Link
                key={entry.birdId}
                to={`/che-do-di/tham-khao/${entry.birdId}`}
                className="card-modern flex w-[220px] shrink-0 flex-col overflow-hidden transition hover:shadow-lg active:scale-[0.98]"
              >
                <div className="flex items-center gap-3 bg-primary/8 px-4 py-3.5">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                    <Bird className="h-5 w-5" strokeWidth={2} />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-bold text-text">{entry.birdName}</p>
                    <p className="truncate text-xs text-text-muted">
                      {entry.ownerName ? `Chủ: ${entry.ownerName}` : '\u00A0'}
                    </p>
                  </div>
                </div>
                <div className="space-y-2 p-4">
                  <span className="badge-pill">{formatSeasons(entry.seasons)}</span>
                  <p className="line-clamp-2 text-sm text-text-muted">
                    <Calendar
                      className="mr-1 inline h-3.5 w-3.5 -translate-y-px text-primary"
                      strokeWidth={2}
                    />
                    {today?.label}: {todayPreview}
                  </p>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </section>
  )
}
