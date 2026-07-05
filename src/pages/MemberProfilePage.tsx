import { Link, useParams } from 'react-router-dom'
import { Calendar, NotebookPen } from '../components/icons'
import { useAuth } from '../context/AuthContext'
import { useBirds } from '../hooks/useBirds'
import { useMemberProfile } from '../hooks/useMembers'
import UserAvatar from '../components/UserAvatar'
import { DEFAULT_BIRD_IMAGE, formatSeasons } from '../utils/bird'

const cardClass = 'rounded-2xl bg-surface p-5 shadow-sm'

export default function MemberProfilePage() {
  const { userId } = useParams<{ userId: string }>()
  const { user } = useAuth()
  const { member, loading: memberLoading, notFound } = useMemberProfile(userId)
  const { birds, loading: birdsLoading } = useBirds(userId)

  if (memberLoading || birdsLoading) {
    return <p className="py-12 text-center text-text-muted">Đang tải...</p>
  }

  if (notFound || !member) {
    return (
      <div className={`${cardClass} text-center`}>
        <p className="font-medium text-text">Không tìm thấy thành viên</p>
        <Link to="/" className="mt-4 inline-block text-sm text-primary">
          ← Về trang chủ
        </Link>
      </div>
    )
  }

  const isSelf = user?.uid === userId

  return (
    <div className="space-y-5">
      <div className={`${cardClass} flex flex-col items-center text-center`}>
        <UserAvatar
          avatarUrl={member.avatarUrl}
          alt={member.displayName}
          size="lg"
        />
        <h2 className="mt-3 text-xl font-bold text-text">{member.displayName}</h2>
        {member.phone && (
          <p className="mt-1 text-sm text-text-muted">{member.phone}</p>
        )}
        <p className="mt-2 text-sm text-text-muted">
          {birds.length} chiến binh
          {isSelf ? ' · Đây là profile của bạn' : ''}
        </p>
      </div>

      <section>
        <h3 className="mb-3 text-lg font-bold text-text">Chiến binh</h3>

        {birds.length === 0 ? (
          <div className={`${cardClass} text-center text-sm text-text-muted`}>
            Thành viên chưa thêm chiến binh nào.
          </div>
        ) : (
          <div className="space-y-3">
            {birds.map((bird) => (
              <div
                key={bird.id}
                className="overflow-hidden rounded-2xl border border-border/80 bg-white shadow-sm"
              >
                <div className="flex items-center gap-3 p-3">
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                    <img
                      src={DEFAULT_BIRD_IMAGE}
                      alt={bird.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-text">{bird.name}</p>
                    <span className="mt-1 inline-block rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                      {formatSeasons(bird.seasons)}
                    </span>
                    {bird.pellets.trim() && (
                      <p className="mt-1 truncate text-xs text-text-muted">
                        Cám: {bird.pellets}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 border-t border-border/60">
                  <Link
                    to={`/che-do-di/tham-khao/${bird.id}`}
                    className="flex items-center justify-center gap-2 py-3 text-sm font-semibold text-primary transition hover:bg-primary/5"
                  >
                    <Calendar className="h-4 w-4" strokeWidth={2} />
                    Chế độ
                  </Link>
                  <Link
                    to={`/thanh-vien/${userId}/chim/${bird.id}/nhat-ky`}
                    className="flex items-center justify-center gap-2 border-l border-border/60 py-3 text-sm font-semibold text-primary transition hover:bg-primary/5"
                  >
                    <NotebookPen className="h-4 w-4" strokeWidth={2} />
                    Nhật ký
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
