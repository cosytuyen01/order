import { Link } from 'react-router-dom'
import UserAvatar from './UserAvatar'
import type { MemberSummary } from '../hooks/useMembers'

interface MemberListSectionProps {
  members: MemberSummary[]
  loading: boolean
}

export default function MemberListSection({ members, loading }: MemberListSectionProps) {
  if (loading) {
    return (
      <section>
        <h2 className="mb-3 text-lg font-bold text-text">Thành viên CLB</h2>
        <div className="flex gap-3 overflow-x-auto pb-1">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-[108px] w-[120px] shrink-0 animate-pulse rounded-2xl bg-white"
            />
          ))}
        </div>
      </section>
    )
  }

  if (members.length === 0) {
    return (
      <section>
        <h2 className="mb-3 text-lg font-bold text-text">Thành viên CLB</h2>
        <div className="rounded-2xl bg-surface p-6 text-center text-sm text-text-muted shadow-sm">
          Chưa có thành viên khác trong CLB.
        </div>
      </section>
    )
  }

  return (
    <section>
      <div className="mb-3">
        <h2 className="text-lg font-bold text-text">Thành viên CLB</h2>
        <p className="mt-0.5 text-sm text-text-muted">
          Xem profile, nhật ký và chế độ của từng chiến binh
        </p>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-1">
        {members.map((member) => (
          <Link
            key={member.id}
            to={`/thanh-vien/${member.id}`}
            className="flex w-[120px] shrink-0 flex-col items-center rounded-2xl bg-white px-3 py-4 shadow-sm transition hover:shadow-md active:scale-[0.98]"
          >
            <UserAvatar
              avatarUrl={member.avatarUrl}
              alt={member.displayName}
              size="list"
              className="ring-0"
            />
            <p className="mt-2 w-full truncate text-center text-sm font-semibold text-text">
              {member.displayName}
            </p>
            <p className="mt-0.5 text-xs text-text-muted">
              {member.birdCount} Chiến binh
            </p>
          </Link>
        ))}
      </div>
    </section>
  )
}
