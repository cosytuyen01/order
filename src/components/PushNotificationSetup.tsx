import { useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { registerPushToken } from '../firebase/messaging'
import { canUseSystemNotifications } from '../utils/notifications'

export default function PushNotificationSetup() {
  const { user } = useAuth()

  useEffect(() => {
    if (!user?.uid || !canUseSystemNotifications()) return
    if (Notification.permission !== 'granted') return
    void registerPushToken(user.uid)
  }, [user?.uid])

  return null
}
