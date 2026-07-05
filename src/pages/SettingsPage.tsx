import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import InstallAppSection from '../components/InstallAppSection'
import UserAvatar from '../components/UserAvatar'
import { useMemberProfile } from '../hooks/useMembers'
import { formatPhoneFromAuthEmail } from '../utils/phone'
import NotificationsPage from './NotificationsPage'

export default function SettingsPage() {
  const { user, logout } = useAuth()
  const { member } = useMemberProfile(user?.uid)
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <UserAvatar
            avatarUrl={member?.avatarUrl}
            alt={user?.displayName ?? 'Avatar'}
            size="md"
          />
          <div>
            <p className="font-semibold text-text">{user?.displayName}</p>
            <p className="text-sm text-text-muted">
              {formatPhoneFromAuthEmail(user?.email)}
            </p>
          </div>
        </div>
      </div>

      <InstallAppSection />

      <NotificationsPage embedded />

      <button
        type="button"
        onClick={handleLogout}
        className="w-full rounded-xl border border-primary/20 bg-surface py-3.5 text-sm font-semibold text-primary transition hover:bg-primary/5"
      >
        Đăng xuất
      </button>
    </div>
  )
}
