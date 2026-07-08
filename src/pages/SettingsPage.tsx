import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BarChart3,
  BadgeCheck,
  Bell,
  BookOpen,
  ChevronRight,
  Clock3,
  Mail,
  MapPin,
  LogOut,
  Phone,
  Star,
  Store,
  Users,
} from 'lucide-react'
import StoreLogo from '../components/StoreLogo'
import { useAuth } from '../context/AuthContext'
import { useOwnerStore } from '../hooks/useOwnerStore'
import { useEmployees } from '../hooks/useEmployees'
import { registerPushToken } from '../firebase/messaging'
import { uploadStoreLogo } from '../firebase/storage'
import { canUseSystemNotifications } from '../utils/notifications'
import {
  formatPhoneDisplay,
  formatPhoneFromAuthEmail,
} from '../utils/phone'

const inputClass =
  'w-full rounded-2xl border border-border/60 bg-input-blue px-4 py-3 text-base text-text transition focus:ring-3 focus:ring-primary/15 focus:outline-none'

function ActionRow({
  icon: Icon,
  label,
  subtitle,
  onClick,
  danger = false,
  rightBadge,
}: {
  icon: typeof Users
  label: string
  subtitle?: string
  onClick: () => void
  danger?: boolean
  rightBadge?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-between px-4 py-4"
    >
      <div className="flex min-w-0 items-center gap-3">
        <div
          className={[
            'flex h-11 w-11 items-center justify-center rounded-2xl',
            danger ? 'bg-red-50 text-red-600' : 'bg-input-beige text-primary',
          ].join(' ')}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 text-left">
          <p className={['text-md font-bold leading-tight', danger ? 'text-red-600' : 'text-brown'].join(' ')}>
            {label}
          </p>
          {subtitle && <p className="mt-0.5 text-xs text-text-muted">{subtitle}</p>}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {rightBadge && (
          <span className="rounded-full bg-warning-bg px-2.5 py-0.5 text-sm font-semibold text-primary">
            {rightBadge}
          </span>
        )}
        <ChevronRight className={['h-5 w-5', danger ? 'text-red-400' : 'text-text-muted'].join(' ')} />
      </div>
    </button>
  )
}

export default function SettingsPage() {
  const { user, logout } = useAuth()
  const { store, updateStore, isOwner, profile } = useOwnerStore()
  const { employees } = useEmployees(isOwner ? store?.id : undefined)
  const navigate = useNavigate()
  const logoInputRef = useRef<HTMLInputElement>(null)

  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({
    name: '',
    address: '',
    phone: '',
    logoUrl: '',
  })
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [notifStatus, setNotifStatus] = useState('')
  const [notifPermission, setNotifPermission] = useState(
    canUseSystemNotifications() ? Notification.permission : 'unsupported',
  )

  const phone =
    store?.phone || formatPhoneFromAuthEmail(user?.email) || ''

  useEffect(() => {
    if (store) {
      setForm({
        name: store.name,
        address: store.address,
        phone: store.phone,
        logoUrl: store.logoUrl ?? '',
      })
    }
  }, [store])

  useEffect(() => {
    return () => {
      if (logoPreview) URL.revokeObjectURL(logoPreview)
    }
  }, [logoPreview])

  const resetEditForm = () => {
    if (!store) return
    setForm({
      name: store.name,
      address: store.address,
      phone: store.phone,
      logoUrl: store.logoUrl ?? '',
    })
    setLogoFile(null)
    if (logoPreview) URL.revokeObjectURL(logoPreview)
    setLogoPreview('')
  }

  const handleCancelEdit = () => {
    resetEditForm()
    setEditing(false)
    setMessage('')
  }

  const handleLogoSelect = (file: File | null) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setMessage('Vui lòng chọn file ảnh.')
      return
    }
    if (logoPreview) URL.revokeObjectURL(logoPreview)
    setLogoFile(file)
    setLogoPreview(URL.createObjectURL(file))
    setMessage('')
  }

  const handleSave = async () => {
    if (!store || !isOwner) return
    setSaving(true)
    setMessage('')
    try {
      let logoUrl = form.logoUrl
      if (logoFile) {
        logoUrl = await uploadStoreLogo(store.id, logoFile)
      }

      await updateStore(store.id, {
        name: form.name,
        address: form.address,
        phone: form.phone,
        logoUrl: logoUrl || undefined,
      })

      setLogoFile(null)
      if (logoPreview) URL.revokeObjectURL(logoPreview)
      setLogoPreview('')
      setEditing(false)
      setMessage('Đã lưu thông tin cửa hàng!')
      setTimeout(() => setMessage(''), 2500)
    } catch {
      setMessage('Không lưu được. Kiểm tra kết nối hoặc quyền upload logo.')
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const handleEnableNotifications = async () => {
    if (!user || !canUseSystemNotifications()) {
      setNotifStatus('Trình duyệt không hỗ trợ thông báo.')
      return
    }

    setNotifStatus('')
    const permission = await Notification.requestPermission()
    setNotifPermission(permission)

    if (permission !== 'granted') {
      setNotifStatus('Bạn đã từ chối thông báo. Hãy bật lại trong cài đặt trình duyệt.')
      return
    }

    const token = await registerPushToken(user.uid)
    setNotifStatus(
      token
        ? 'Đã bật thông báo! Bạn sẽ nhận alert khi khách quét QR hoặc đặt món.'
        : 'Đã bật thông báo trong app. Thêm VAPID key để nhận push khi đóng tab.',
    )
  }

  const displayLogoUrl = logoPreview || store?.logoUrl
  const displayEmail =
    user?.email && !user.email.includes('@phone.order.app')
      ? user.email
      : 'Chưa cập nhật email'

  return (
    <div className="min-h-screen">
      <div className="px-4 pb-2 pt-[max(1rem,env(safe-area-inset-top))]">
        <div
          className="relative overflow-hidden rounded-3xl p-5 text-white shadow-[0_18px_44px_-20px_rgba(61,35,20,0.75)]"
          style={{
            backgroundImage: `linear-gradient(150deg, rgba(61,35,20,0.94), rgba(61,35,20,0.55)), url('/bg_profile.png')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="flex flex-col items-center text-center">
            <StoreLogo
              logoUrl={store?.logoUrl}
              name={store?.name ?? 'Cửa hàng'}
              size="xl"
              className="border-white/50 bg-white/15 text-white shadow-none ring-4 ring-white/10"
            />

            <div className="mt-3 flex items-center justify-center gap-1.5">
              <p className="max-w-[16rem] truncate text-2xl font-bold leading-tight">
                {store?.name ?? 'Cửa hàng'}
              </p>
              <BadgeCheck className="h-5 w-5 shrink-0 text-amber-300" />
            </div>

            <p className="mt-1.5 flex items-center justify-center gap-1 text-sm text-amber-50/90">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{store?.address || 'Chưa có địa chỉ'}</span>
            </p>
          </div>

          {isOwner && (
            <button
              type="button"
              onClick={() => setEditing((v) => !v)}
              className="absolute right-4 top-4 rounded-full bg-white/95 px-3.5 py-1.5 text-xs font-semibold text-brown shadow-sm"
            >
              {editing ? 'Đóng' : 'Chỉnh sửa'}
            </button>
          )}

          <div className="mt-4 flex items-stretch rounded-2xl border border-white/20 bg-white/10 backdrop-blur-sm">
            <div className="flex flex-1 flex-col items-center gap-0.5 px-3 py-2.5">
              <span className="flex items-center gap-1 text-sm font-bold text-amber-50">
                <Star className="h-4 w-4 text-amber-300" />
                4.9
              </span>
              <span className="text-[11px] text-amber-50/70">128 đánh giá</span>
            </div>
            <div className="my-2 w-px bg-white/20" />
            <div className="flex flex-1 flex-col items-center gap-0.5 px-3 py-2.5">
              <span className="flex items-center gap-1 text-sm font-bold text-amber-50">
                <Clock3 className="h-4 w-4 text-amber-300" />
                07:00 - 22:00
              </span>
              <span className="text-[11px] text-amber-50/70">Giờ mở cửa</span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4 px-4 pb-2 pt-4">
        {editing && isOwner && store && (
          <div className="card-modern space-y-4 p-5">
            <h2 className="font-bold text-brown">Chỉnh sửa cửa hàng</h2>
            <div className="flex flex-col items-center">
              <StoreLogo
                logoUrl={displayLogoUrl}
                name={form.name || store.name}
                size="xl"
              />
              <input
                ref={logoInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleLogoSelect(e.target.files?.[0] ?? null)}
              />
              <button
                type="button"
                onClick={() => logoInputRef.current?.click()}
                className="mt-3 text-sm font-semibold text-primary"
              >
                Đổi logo
              </button>
            </div>

            <input
              className={inputClass}
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Tên cửa hàng"
            />
            <input
              className={inputClass}
              value={form.address}
              onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
              placeholder="Địa chỉ"
            />
            <input
              className={inputClass}
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              placeholder="Số điện thoại"
            />

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleCancelEdit}
                className="btn-outline flex-1"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="btn-primary flex-1 disabled:opacity-60"
              >
                {saving ? 'Đang lưu...' : 'Lưu'}
              </button>
            </div>
            {message && <p className="text-center text-sm text-primary">{message}</p>}
          </div>
        )}

        {!isOwner && (
          <div className="card-modern p-4 text-sm text-brown-light">
            Tài khoản nhân viên: bạn không có quyền sửa thông tin cửa hàng.
          </div>
        )}

        {store && (
          <div className="card-modern overflow-hidden p-5">
            <div className="flex items-center gap-2 text-brown">
              <Store className="h-4 w-4 text-primary" />
              <h2 className="text-lg font-bold">Thông tin cửa hàng</h2>
            </div>
            <div className="mt-3 space-y-2 text-xs">
              <p className="flex items-start gap-2 text-text-muted">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>{store.name} - {store.address || 'Chưa có địa chỉ'}</span>
              </p>
              <p className="flex items-center gap-2 text-text-muted">
                <Phone className="h-4 w-4 shrink-0 text-primary" />
                <span>{store.phone || phone}</span>
              </p>
              <p className="flex items-center gap-2 text-text-muted">
                <Mail className="h-4 w-4 shrink-0 text-primary" />
                <span>{displayEmail}</span>
              </p>
            </div>
          </div>
        )}

        <div className="card-modern overflow-hidden border border-border/70">
          {store && isOwner && (
            <ActionRow
              icon={Users}
              label="Nhân viên"
              subtitle="Quản lý danh sách nhân viên"
              onClick={() => navigate('/employees')}
              rightBadge={String(employees.length)}
            />
          )}
          {store && isOwner && <div className="mx-4 border-t border-border/70" />}
          <ActionRow
            icon={BarChart3}
            label="Thống kê"
            subtitle="Xem doanh thu và hiệu suất bán hàng"
            onClick={() => navigate('/stats')}
          />
        </div>

        <div className="card-modern p-5">
          <p className="text-sm text-text-muted">
            {isOwner ? 'Chủ cửa hàng' : 'Tài khoản nhân viên'}
          </p>
          <div className="mt-3 flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-warning-bg text-primary">
                <Users className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-lg font-bold text-brown">
                  {profile?.displayName || user?.displayName || '—'}
                </p>
                <p className="mt-0.5 text-sm text-text-muted">
                  {profile?.phone ? formatPhoneDisplay(profile.phone) : phone}
                </p>
              </div>
            </div>
            {isOwner && (
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="shrink-0 rounded-xl border border-border bg-white px-3 py-1.5 text-xs font-semibold text-primary"
              >
                Đổi thông tin
              </button>
            )}
          </div>
        </div>

        {store && (
          <div className="card-modern overflow-hidden">
            <div className="flex items-start justify-between gap-3 px-4 py-4">
              <div className="flex min-w-0 items-start gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-input-beige text-primary">
                  <Bell className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-brown">Thông báo cửa hàng</h2>
                  <p className="mt-1 text-xs text-text-muted">
                    Nhận thông báo khi khách quét QR bàn, chọn món và đặt hàng.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleEnableNotifications}
                className={[
                  'relative mt-1 h-7 w-12 rounded-full transition',
                  notifPermission === 'granted' ? 'bg-primary' : 'bg-border',
                ].join(' ')}
                aria-label="Bật thông báo"
              >
                <span
                  className={[
                    'absolute top-1 h-5 w-5 rounded-full bg-white transition',
                    notifPermission === 'granted' ? 'right-1' : 'left-1',
                  ].join(' ')}
                />
              </button>
            </div>
            <div className="mx-4 border-t border-border/60" />
            <ActionRow
              icon={BookOpen}
              label="Xem lịch sử thông báo"
              onClick={() => navigate('/orders')}
            />
            {notifStatus && (
              <p className="px-4 pb-4 text-sm text-primary">{notifStatus}</p>
            )}
          </div>
        )}

        <div className="card-modern overflow-hidden">
          <ActionRow
            icon={LogOut}
            label="Đăng xuất"
            onClick={handleLogout}
            danger
          />
        </div>
      </div>
    </div>
  )
}
