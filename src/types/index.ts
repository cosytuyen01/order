export type DayKey =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday'

export interface DayCare {
  fruit: string
  liveFood: string
  vitamin: string
  sunbathingTime: string
  sunbathingDuration: string
  bathingTime: string
}

export interface DaySchedule {
  day: DayKey
  label: string
  activity: string
  description: string
  care: DayCare
}

export interface WeeklySchedule {
  days: DaySchedule[]
  updatedAt?: string
  updatedBy?: string
}

export type RecordType = 'di-dot' | 'di-thi'

export interface ActivityRecord {
  id: string
  type: RecordType
  title: string
  date: string
  time?: string
  videoUrl: string
  notes: string
  birdId: string
  birdName: string
  ownerId: string
  createdBy: string
  createdByName: string
  createdAt: string
}

export interface NotificationSettings {
  enabled: boolean
  userId: string
}

export interface Bird {
  id: string
  name: string
  seasons: number
  pellets: string
  ownerId: string
  createdAt: string
}

export const EMPTY_CARE: DayCare = {
  fruit: '',
  liveFood: '',
  vitamin: '',
  sunbathingTime: '',
  sunbathingDuration: '',
  bathingTime: '',
}

export const SIMPLE_CARE_ITEMS: {
  key: 'fruit' | 'liveFood' | 'vitamin'
  label: string
}[] = [
  { key: 'fruit', label: 'Hoa quả' },
  { key: 'liveFood', label: 'Mồi tươi' },
  { key: 'vitamin', label: 'Vitamin' },
]

export const TIMED_CARE_ITEMS: {
  timeKey: 'sunbathingTime' | 'bathingTime'
  durationKey?: 'sunbathingDuration'
  label: string
  iconKey: 'sunbathing' | 'bathing'
  hasDuration: boolean
}[] = [
  {
    timeKey: 'sunbathingTime',
    durationKey: 'sunbathingDuration',
    label: 'Phơi nắng',
    iconKey: 'sunbathing',
    hasDuration: true,
  },
  {
    timeKey: 'bathingTime',
    label: 'Tắm',
    iconKey: 'bathing',
    hasDuration: false,
  },
]

/** @deprecated use SIMPLE_CARE_ITEMS + TIMED_CARE_ITEMS */
export const CARE_ITEMS: { key: string; label: string }[] = [
  ...SIMPLE_CARE_ITEMS,
  ...TIMED_CARE_ITEMS.map((item) => ({ key: item.iconKey, label: item.label })),
]

export const DAY_LABELS: Record<DayKey, string> = {
  monday: 'Thứ 2',
  tuesday: 'Thứ 3',
  wednesday: 'Thứ 4',
  thursday: 'Thứ 5',
  friday: 'Thứ 6',
  saturday: 'Thứ 7',
  sunday: 'Chủ nhật',
}

export const DAY_KEYS: DayKey[] = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
]

export const EMPTY_SCHEDULE: DaySchedule[] = DAY_KEYS.map((day) => ({
  day,
  label: DAY_LABELS[day],
  activity: '',
  description: '',
  care: { ...EMPTY_CARE },
}))
