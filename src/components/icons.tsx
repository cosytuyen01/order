import type { LucideIcon } from 'lucide-react'
import {
  Bell,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Home,
  LayoutGrid,
  Plus,
  UtensilsCrossed,
  User,
  X,
} from 'lucide-react'

export {
  Bell,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Home,
  Plus,
  User,
  X,
}

export const ICON_SIZE = {
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
} as const

export const NAV_ITEMS: { to: string; label: string; icon: LucideIcon }[] = [
  { to: '/', label: 'Tổng quan', icon: Home },
  { to: '/menu-management', label: 'Menu', icon: UtensilsCrossed },
  { to: '/tables', label: 'Bàn', icon: LayoutGrid },
  { to: '/orders', label: 'Đơn hàng', icon: ClipboardList },
  { to: '/settings', label: 'Tài khoản', icon: User },
]
