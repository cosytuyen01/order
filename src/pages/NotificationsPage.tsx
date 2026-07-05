import { useEffect, useState } from 'react'
import { doc, onSnapshot, setDoc } from 'firebase/firestore'
import { db } from '../firebase/config'
import { useAuth } from '../context/AuthContext'
import { useReminderBanner } from '../context/ReminderContext'
import { useBirds } from '../hooks/useBirds'
import { useAllBirdSchedules } from '../hooks/useAllBirdSchedules'
import {
  getTodayRemindersPreview,
  requestNotificationPermission,
  sendTestNotification,
} from '../hooks/useScheduleReminders'
import { useSchedule } from '../hooks/useSchedule'
import type { NotificationSettings } from '../types'
import { DAY_LABELS, type DayKey } from '../types'
import { DAY_INDEX_TO_KEY } from '../utils/schedule'
import {
  isIos,
  isMobileDevice,
  isStandalonePwa,
} from '../utils/notifications'

const cardClass = 'rounded-2xl bg-surface p-5 shadow-sm'

export default function NotificationsPage({ embedded }: { embedded?: boolean }) {
  const { user } = useAuth()
  const { birds } = useBirds(user?.uid)
  const { entries } = useAllBirdSchedules(birds)
  const { today, birdName } = useSchedule()
  const { showInApp } = useReminderBanner()
  const [settings, setSettings] = useState<NotificationSettings>({
    enabled: false,
    userId: user?.uid ?? '',
  })
  const [permission, setPermission] = useState<NotificationPermission>(
    'Notification' in window ? Notification.permission : 'denied',
  )
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const reminders = getTodayRemindersPreview(entries)
  const mobile = isMobileDevice()
  const ios = isIos()
  const standalone = isStandalonePwa()

  useEffect(() => {
    if (!user) return
    const unsubSettings = onSnapshot(
      doc(db, 'notificationSettings', user.uid),
      (snap) => {
        if (snap.exists()) {
          const data = snap.data() as NotificationSettings & { time?: string }
          setSettings({
            enabled: data.enabled ?? false,
            userId: user.uid,
          })
        }
      },
    )
    return unsubSettings
  }, [user])

  const handleEnable = async () => {
    const granted = await requestNotificationPermission()
    setPermission(Notification.permission)
    if (granted) {
      setSettings((s) => ({ ...s, enabled: true }))
    }
  }

  const handleSave = async () => {
    if (!user) return
    setSaving(true)
    try {
      await setDoc(doc(db, 'notificationSettings', user.uid), {
        ...settings,
        userId: user.uid,
      })
      setMessage('Đã lưu cài đặt thông báo!')
      setTimeout(() => setMessage(''), 3000)
    } finally {
      setSaving(false)
    }
  }

  const todayLabel = DAY_LABELS[DAY_INDEX_TO_KEY[new Date().getDay()] as DayKey]

  return (
    <div>
      {!embedded && (
        <div className="mb-6">
          <h2 className="text-xl font-bold text-text">Thông báo theo chế độ đi</h2>
          <p className="mt-1 text-sm text-text-muted">
            Nhắc đúng giờ phơi nắng và tắm theo chế độ từng chim.
          </p>
        </div>
      )}

      {mobile && (
        <div className="mb-4 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-text">
          <p className="font-medium text-primary">Hướng dẫn trên điện thoại</p>
          <ul className="mt-2 list-disc space-y-1 pl-4 text-text-muted">
            <li>Bật thông báo và lưu cài đặt bên dưới.</li>
            <li>
              {ios && !standalone
                ? 'iPhone: Safari → Chia sẻ → Thêm vào Màn hình chính, rồi mở app từ icon.'
                : 'Thêm trang vào Màn hình chính để nhận thông báo tốt hơn.'}
            </li>
            <li>Giữ app mở hoặc ở nền — sẽ có banner + rung khi đến giờ.</li>
          </ul>
        </div>
      )}

      <div className={`${cardClass} ${embedded ? '' : 'mb-4'}`}>
        <h3 className="mb-3 font-semibold text-text">Nhắc hôm nay</h3>
        {reminders.length > 0 ? (
          <ul className="space-y-2">
            {reminders.map((r) => (
              <li
                key={r.id}
                className="flex items-center justify-between rounded-xl bg-primary/5 px-3 py-2 text-sm"
              >
                <span className="font-medium text-text">{r.title}</span>
                <span className="text-primary">{r.time}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-text-muted">
            Chưa có giờ phơi nắng/tắm hôm nay. Hãy điền giờ trong tab Chế độ đi.
          </p>
        )}
      </div>

      <div className={`${cardClass} flex flex-col gap-4`}>
        <h3 className="font-semibold text-text">Cài đặt</h3>

        {permission === 'denied' && (
          <div className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Trình duyệt đã chặn thông báo. Vào Cài đặt trình duyệt → cho phép thông
            báo cho trang này.
          </div>
        )}

        {permission !== 'granted' && permission !== 'denied' && (
          <button
            type="button"
            onClick={handleEnable}
            className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-white"
          >
            Cho phép thông báo
          </button>
        )}

        {permission === 'granted' && (
          <>
            <label className="flex cursor-pointer items-center gap-3 text-sm font-medium text-text">
              <input
                type="checkbox"
                checked={settings.enabled}
                onChange={(e) =>
                  setSettings({ ...settings, enabled: e.target.checked })
                }
                className="h-[18px] w-[18px] accent-primary"
              />
              <span>Bật nhắc theo chế độ đi (phơi nắng, tắm)</span>
            </label>

            <p className="text-sm leading-relaxed text-text-muted">
              Nhắc tự động trên mọi trang khi đã bật ({todayLabel}). Trên điện thoại
              sẽ kèm banner trong app và rung máy.
            </p>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
              >
                {saving ? 'Đang lưu...' : 'Lưu cài đặt'}
              </button>
              {today && (
                <button
                  type="button"
                  onClick={() => sendTestNotification(today, birdName, showInApp)}
                  className="rounded-xl border border-border bg-bg px-5 py-2.5 text-sm font-semibold text-text"
                >
                  Gửi thử
                </button>
              )}
            </div>
          </>
        )}

        {message && (
          <p className="rounded-xl bg-success/10 px-3 py-2 text-sm text-success">
            {message}
          </p>
        )}
      </div>
    </div>
  )
}
