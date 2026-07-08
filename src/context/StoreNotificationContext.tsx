import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from 'react'
import type { StoreEventType } from '../types/store'

export interface ActiveStoreNotification {
  id: string
  title: string
  body: string
  type: StoreEventType | 'new_order'
}

interface StoreNotificationContextValue {
  active: ActiveStoreNotification | null
  unreadCount: number
  show: (notification: ActiveStoreNotification) => void
  dismiss: () => void
  clearUnread: () => void
}

const StoreNotificationContext =
  createContext<StoreNotificationContextValue | null>(null)

export function StoreNotificationProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState<ActiveStoreNotification | null>(null)
  const [unreadCount, setUnreadCount] = useState(0)

  const show = useCallback((notification: ActiveStoreNotification) => {
    setActive(notification)
    setUnreadCount((count) => count + 1)
  }, [])

  const dismiss = useCallback(() => setActive(null), [])

  const clearUnread = useCallback(() => setUnreadCount(0), [])

  return (
    <StoreNotificationContext.Provider
      value={{ active, unreadCount, show, dismiss, clearUnread }}
    >
      {children}
    </StoreNotificationContext.Provider>
  )
}

export function useStoreNotificationBanner() {
  const context = useContext(StoreNotificationContext)
  if (!context) {
    throw new Error(
      'useStoreNotificationBanner must be used within StoreNotificationProvider',
    )
  }
  return context
}
