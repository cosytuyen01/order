import { getMessaging, getToken, isSupported, onMessage } from 'firebase/messaging'
import { deleteDoc, doc, serverTimestamp, setDoc } from 'firebase/firestore'
import app, { db } from './config'
import { registerServiceWorker } from '../utils/notifications'

const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY as string | undefined

function tokenDocId(token: string): string {
  return token.replace(/[/.#$[\]]/g, '_').slice(0, 120)
}

export function isPushConfigured(): boolean {
  return Boolean(VAPID_KEY?.trim())
}

export async function saveFcmToken(userId: string, token: string): Promise<void> {
  await setDoc(
    doc(db, 'users', userId, 'fcmTokens', tokenDocId(token)),
    {
      token,
      updatedAt: serverTimestamp(),
      platform: navigator.userAgent,
    },
    { merge: true },
  )
}

export async function removeFcmToken(userId: string, token: string): Promise<void> {
  await deleteDoc(doc(db, 'users', userId, 'fcmTokens', tokenDocId(token)))
}

export async function registerPushToken(userId: string): Promise<string | null> {
  if (!isPushConfigured()) return null
  if (!(await isSupported())) return null
  if (Notification.permission !== 'granted') return null

  try {
    const registration = await registerServiceWorker()
    if (!registration) return null

    const messaging = getMessaging(app)
    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration,
    })

    if (!token) return null

    await saveFcmToken(userId, token)
    return token
  } catch (error) {
    console.error('registerPushToken:', error)
    return null
  }
}

export function listenForForegroundPush(
  onPayload: (title: string, body: string, tag: string) => void,
): () => void {
  let unsubscribe: (() => void) | undefined

  void isSupported().then((supported) => {
    if (!supported || !isPushConfigured()) return
    const messaging = getMessaging(app)
    unsubscribe = onMessage(messaging, (payload) => {
      const title = payload.notification?.title ?? payload.data?.title ?? 'OrderQR'
      const body = payload.notification?.body ?? payload.data?.body ?? ''
      const tag = payload.data?.tag ?? 'ccm-push'
      onPayload(title, body, tag)
    })
  })

  return () => {
    unsubscribe?.()
  }
}
