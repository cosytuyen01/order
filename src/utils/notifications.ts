import { APP_LOGO_PATH } from './branding'

export function isMobileDevice(): boolean {
  if (typeof navigator === 'undefined') return false
  return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)
}

export function isIos(): boolean {
  if (typeof navigator === 'undefined') return false
  return /iPhone|iPad|iPod/i.test(navigator.userAgent)
}

export function isStandalonePwa(): boolean {
  if (typeof window === 'undefined') return false
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  )
}

export function canUseSystemNotifications(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window
}

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) return null
  try {
    return await navigator.serviceWorker.register('/sw.js', { scope: '/' })
  } catch {
    return null
  }
}

export interface SystemNotificationPayload {
  title: string
  body: string
  tag: string
}

export async function showSystemNotification(
  payload: SystemNotificationPayload,
): Promise<boolean> {
  if (!canUseSystemNotifications() || Notification.permission !== 'granted') {
    return false
  }

  const options: NotificationOptions & { vibrate?: number[] } = {
    body: payload.body,
    icon: APP_LOGO_PATH,
    badge: APP_LOGO_PATH,
    tag: payload.tag,
    vibrate: [200, 100, 200],
  }

  try {
    const registration = await navigator.serviceWorker?.ready
    if (registration?.showNotification) {
      await registration.showNotification(payload.title, options)
      return true
    }
  } catch {
    // fall through to Notification API
  }

  try {
    new Notification(payload.title, options)
    return true
  } catch {
    return false
  }
}

export function vibrateDevice(): void {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    navigator.vibrate([200, 100, 200])
  }
}
