import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useBirdRecords } from '../hooks/useBirdRecords'
import ReferenceScheduleSection from '../components/ReferenceScheduleSection'
import MemberListSection from '../components/MemberListSection'
import TodayScheduleSlider from '../components/TodayScheduleSlider'
import BirdCard from '../components/BirdCard'
import SectionHeader from '../components/SectionHeader'
import { useBirds } from '../hooks/useBirds'
import { useAllBirdSchedules } from '../hooks/useAllBirdSchedules'
import { useReferenceSchedules } from '../hooks/useReferenceSchedules'
import { useMembers } from '../hooks/useMembers'
import { getTodaySchedule } from '../utils/schedule'
import type { LucideIcon } from 'lucide-react'
import { Plus, RECORD_ICONS } from '../components/icons'
import type { RecordType } from '../types'

const RECORD_META: Record<RecordType, { label: string; icon: LucideIcon }> = {
  'di-dot': { label: 'Đi dợt', icon: RECORD_ICONS['di-dot'] },
  'di-thi': { label: 'Đi thi', icon: RECORD_ICONS['di-thi'] },
}

export default function HomePage() {
  const { user } = useAuth()
  const { birds, loading: birdsLoading } = useBirds(user?.uid)
  const { entries: scheduleEntries, loading: schedulesLoading } =
    useAllBirdSchedules(birds)
  const { entries: referenceEntries, loading: referenceLoading } =
    useReferenceSchedules(user?.uid)
  const { members, loading: membersLoading } = useMembers(user?.uid)
  const { records: recentRecords } = useBirdRecords(user?.uid)

  const scheduleSlides = scheduleEntries.map((entry) => ({
    birdId: entry.birdId,
    birdName: entry.birdName,
    today: getTodaySchedule(entry.days),
  }))

  const scheduleLoading = birdsLoading || schedulesLoading

  return (
    <div className="space-y-7">
      {scheduleLoading ? (
        <div className="h-52 animate-pulse rounded-3xl bg-white/60" />
      ) : (
        <TodayScheduleSlider slides={scheduleSlides} />
      )}

      <section>
        <SectionHeader title="Chiến binh của tôi" linkTo="/birds" />

        <div className="section-scroll">
          {birdsLoading ? (
            <>
              <div className="h-[176px] w-[128px] shrink-0 animate-pulse rounded-3xl bg-white/70" />
              <div className="h-[176px] w-[128px] shrink-0 animate-pulse rounded-3xl bg-white/70" />
            </>
          ) : (
            <>
              {birds.slice(0, 5).map((bird) => (
                <BirdCard key={bird.id} bird={bird} compact />
              ))}
              <Link
                to="/birds/new"
                className="flex h-[176px] w-[128px] shrink-0 flex-col items-center justify-center gap-2 rounded-3xl border-2 border-dashed border-primary/25 bg-white/60 text-primary transition hover:border-primary/40 hover:bg-primary/5"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
                  <Plus className="h-6 w-6" strokeWidth={2} />
                </span>
                <span className="text-xs font-semibold">Thêm chiến binh</span>
              </Link>
            </>
          )}
        </div>
      </section>

      <MemberListSection members={members} loading={membersLoading} />

      <ReferenceScheduleSection
        entries={referenceEntries}
        loading={referenceLoading}
      />

      <section>
        <SectionHeader title="Nhật ký gần đây" linkTo="/records" />

        {recentRecords.slice(0, 3).length === 0 ? (
          <div className="card-modern p-6 text-center text-sm text-text-muted">
            Chưa có nhật ký nào.
          </div>
        ) : (
          <div className="space-y-3">
            {recentRecords.slice(0, 3).map((record) => {
              const meta = RECORD_META[record.type]
              const RecordIcon = meta.icon
              return (
                <div
                  key={record.id}
                  className="card-modern flex items-center gap-3.5 p-3.5"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <RecordIcon className="h-5 w-5" strokeWidth={2} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-text">
                      {meta.label} · {record.birdName}
                    </p>
                    <p className="truncate text-sm text-text-muted">
                      {record.title}
                      {record.videoUrl ? ' · Có video' : ''}
                    </p>
                    <p className="mt-0.5 text-xs text-text-muted">
                      {new Date(record.date).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                  {record.notes && (
                    <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                      {record.notes.slice(0, 12)}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
