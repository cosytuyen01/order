import { useEffect } from 'react'
import { Bell, X } from './icons'
import { useReminderBanner } from '../context/ReminderContext'

const AUTO_DISMISS_MS = 4000

export default function ReminderBanner() {
  const { active, dismiss } = useReminderBanner()

  useEffect(() => {
    if (!active) return
    const timer = window.setTimeout(dismiss, AUTO_DISMISS_MS)
    return () => window.clearTimeout(timer)
  }, [active, dismiss])

  if (!active) return null

  return (
    <div className="fixed inset-x-0 top-0 z-[60] mx-auto w-full max-w-[480px] px-3 pt-[max(0.5rem,env(safe-area-inset-top))] md:max-w-[768px]">
      <div
        role="alert"
        className="flex items-start gap-3 rounded-2xl border border-primary/20 bg-white p-4 shadow-lg"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Bell className="h-5 w-5" strokeWidth={2} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-text">{active.title}</p>
          <p className="mt-0.5 text-sm text-text-muted">{active.body}</p>
          <p className="mt-1 text-xs font-medium text-primary">{active.time}</p>
        </div>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Đóng"
          className="shrink-0 rounded-full p-1 text-text-muted hover:bg-primary/10 hover:text-primary"
        >
          <X className="h-5 w-5" strokeWidth={2} />
        </button>
      </div>
    </div>
  )
}
