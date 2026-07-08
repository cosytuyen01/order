import { Link } from 'react-router-dom'
import { Bell, X } from 'lucide-react'
import { useStoreNotificationBanner } from '../context/StoreNotificationContext'
import { STORE_EVENT_LABELS } from '../types/store'

export default function NotificationBanner() {
  const { active, dismiss } = useStoreNotificationBanner()

  if (!active) return null

  const label =
    active.type in STORE_EVENT_LABELS
      ? STORE_EVENT_LABELS[active.type as keyof typeof STORE_EVENT_LABELS]
      : 'Thông báo'

  return (
    <div className="pointer-events-none fixed inset-x-0 top-[calc(0.5rem+env(safe-area-inset-top))] z-[90] mx-auto max-w-[480px] px-4 md:max-w-[768px]">
      <div className="pointer-events-auto flex items-start gap-3 rounded-2xl border border-primary/15 bg-white p-4 shadow-[0_12px_40px_rgba(37,99,235,0.18)]">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Bell className="h-5 w-5" strokeWidth={2.25} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-primary">
            {label}
          </p>
          <p className="font-bold text-text">{active.title}</p>
          <p className="mt-0.5 text-sm text-text-muted">{active.body}</p>
          {active.type === 'new_order' && (
            <Link
              to="/orders"
              onClick={dismiss}
              className="mt-2 inline-block text-sm font-semibold text-primary"
            >
              Xem đơn hàng →
            </Link>
          )}
        </div>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Đóng"
          className="shrink-0 rounded-lg p-1 text-text-muted hover:bg-slate-100"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
}
