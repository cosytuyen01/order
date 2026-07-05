import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { saveBirdSchedules, useBirdSchedule } from '../../hooks/useBirdSchedule'
import CopyDayCareSelect from '../CopyDayCareSelect'
import TimedCareFields from '../TimedCareFields'
import { CARE_ICONS } from '../icons'
import {
  EMPTY_SCHEDULE,
  SIMPLE_CARE_ITEMS,
  type DayCare,
  type DayKey,
  type DaySchedule,
} from '../../types'

const labelClass = 'flex flex-col gap-1.5 text-sm font-medium text-text-muted'
const inputClass =
  'rounded-2xl border border-border/60 bg-input-blue px-3 py-2.5 text-base text-text transition focus:ring-3 focus:ring-primary/15 focus:outline-none'

interface BirdScheduleTabProps {
  birdId: string
  birdName: string
}

export default function BirdScheduleTab({ birdId, birdName }: BirdScheduleTabProps) {
  const { user } = useAuth()
  const { schedule: loadedSchedule, loading: birdScheduleLoading } =
    useBirdSchedule(birdId)
  const [schedule, setSchedule] = useState<DaySchedule[]>(EMPTY_SCHEDULE)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!birdScheduleLoading) {
      setSchedule(loadedSchedule)
    }
  }, [loadedSchedule, birdScheduleLoading])

  const updateCare = (dayKey: string, field: keyof DayCare, value: string) => {
    setSchedule((prev) =>
      prev.map((day) =>
        day.day === dayKey
          ? { ...day, care: { ...day.care, [field]: value } }
          : day,
      ),
    )
  }

  const copyCareFromDay = (targetDay: DayKey, sourceDay: DayKey) => {
    setSchedule((prev) => {
      const source = prev.find((d) => d.day === sourceDay)?.care
      if (!source) return prev
      return prev.map((day) =>
        day.day === targetDay ? { ...day, care: { ...source } } : day,
      )
    })
  }

  const handleSave = async () => {
    if (!user) return

    setSaving(true)
    setMessage('')

    try {
      await saveBirdSchedules(
        [birdId],
        schedule,
        user.uid,
        user.displayName ?? undefined,
      )
      setMessage(`Đã lưu chế độ cho ${birdName}!`)
      setTimeout(() => setMessage(''), 3000)
    } catch {
      setMessage('Lỗi khi lưu. Vui lòng thử lại.')
    } finally {
      setSaving(false)
    }
  }

  if (birdScheduleLoading) {
    return <p className="py-12 text-center text-text-muted">Đang tải chế độ...</p>
  }

  return (
    <div>
      <p className="mb-4 text-sm text-text-muted">
        Chế độ chăm sóc 7 ngày cho <strong>{birdName}</strong>
      </p>

      <div className="space-y-4">
        {schedule.map((day) => (
          <div
            key={day.day}
            className="card-modern overflow-hidden"
          >
            <div className="flex items-center justify-between gap-2 bg-primary px-4 py-2.5">
              <span className="font-semibold text-white">{day.label}</span>
              <CopyDayCareSelect
                currentDay={day.day}
                options={schedule.map((d) => ({ day: d.day, label: d.label }))}
                onCopyFrom={(source) => copyCareFromDay(day.day, source)}
              />
            </div>
            <div className="grid grid-cols-1 gap-3 p-4">
              {SIMPLE_CARE_ITEMS.map((item) => {
                const Icon = CARE_ICONS[item.key]
                return (
                  <label key={item.key} className={labelClass}>
                    <span className="inline-flex items-center gap-1.5">
                      <Icon className="h-4 w-4 text-primary" strokeWidth={2} />
                      {item.label}
                    </span>
                    <input
                      type="text"
                      className={inputClass}
                      placeholder={`Nhập ${item.label.toLowerCase()}...`}
                      value={day.care[item.key]}
                      onChange={(e) =>
                        updateCare(day.day, item.key, e.target.value)
                      }
                    />
                  </label>
                )
              })}
              <TimedCareFields
                care={day.care}
                onChange={(field, value) => updateCare(day.day, field, value)}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 space-y-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="btn-primary w-full disabled:opacity-60"
        >
          {saving ? 'Đang lưu...' : 'Lưu chế độ'}
        </button>
        {message && (
          <p className="rounded-xl bg-success/10 px-3 py-2 text-center text-sm text-success">
            {message}
          </p>
        )}
      </div>
    </div>
  )
}
