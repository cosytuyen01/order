import { Link } from 'react-router-dom'
import UserAvatar from './UserAvatar'
import SectionHeader from './SectionHeader'
import type { MemberSummary } from '../hooks/useMembers'

interface MemberListSectionProps {
  members: MemberSummary[]
  loading: boolean
}

export default function MemberListSection({ members, loading }: MemberListSectionProps) {
  if (loading) {
    return (
      <section>
        <SectionHeader title="Thành viên CLB" />
        <div className="section-scroll">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-[120px] w-[110px] shrink-0 animate-pulse rounded-3xl bg-white/70"
            />
          ))}
        </div>
      </section>
    )
  }

  if (members.length === 0) {
    return (
      <section>
        <SectionHeader title="Thành viên CLB" />
        <div className="card-modern p-6 text-center text-sm text-text-muted">
          Chưa có thành viên khác trong CLB.
        </div>
      </section>
    )
  }

  return (
    <section>
      <SectionHeader
        title="Thành viên CLB"
        subtitle="Xem profile, nhật ký và chế độ"
      />

      <div className="section-scroll">
        {members.map((member) => (
          <Link
            key={member.id}
            to={`/thanh-vien/${member.id}`}
            className="card-modern flex w-[110px] shrink-0 flex-col items-center px-3 py-4 transition hover:shadow-lg active:scale-[0.98]"
          >
            <UserAvatar
              avatarUrl={member.avatarUrl}
              alt={member.displayName}
              size="list"
              className="ring-2 ring-primary/10"
            />
            <p className="mt-2.5 w-full truncate text-center text-sm font-bold text-text">
              {member.displayName}
            </p>
            <p className="mt-0.5 text-[11px] text-text-muted">
              {member.birdCount} chim
            </p>
          </Link>
        ))}
      </div>
    </section>
  )
}
