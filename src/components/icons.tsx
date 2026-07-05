import type { LucideIcon } from 'lucide-react'
import {
  Apple,
  Bath,
  Bell,
  Bike,
  Bird,
  Bug,
  Calendar,
  Cat,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Clock,
  Heart,
  Home,
  Info,
  Lightbulb,
  Link2,
  Medal,
  NotebookPen,
  PenLine,
  Pill,
  Plus,
  Save,
  Settings,
  Sun,
  Trophy,
  Wheat,
  X,
} from 'lucide-react'

export {
  Apple,
  Bath,
  Bell,
  Bike,
  Bird,
  Bug,
  Calendar,
  Cat,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Clock,
  Heart,
  Home,
  Info,
  Lightbulb,
  Link2,
  Medal,
  NotebookPen,
  PenLine,
  Pill,
  Plus,
  Save,
  Settings,
  Sun,
  Trophy,
  Wheat,
  X,
}

export const ICON_SIZE = {
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
} as const

export const NAV_ITEMS: { to: string; label: string; icon: LucideIcon }[] = [
  { to: '/', label: 'Trang chủ', icon: Home },
  { to: '/birds', label: 'Chiến binh', icon: Bird },
  { to: '/che-do-di', label: 'Chế độ', icon: Calendar },
  { to: '/records', label: 'Nhật ký', icon: NotebookPen },
  { to: '/settings', label: 'Cài đặt', icon: Settings },
]

export const CARE_ICONS: Record<string, LucideIcon> = {
  fruit: Apple,
  liveFood: Bug,
  pellets: Wheat,
  vitamin: Pill,
  sunbathing: Sun,
  bathing: Bath,
}

export const RECORD_ICONS: Record<string, LucideIcon> = {
  'di-dot': Bike,
  'di-thi': ClipboardList,
}
