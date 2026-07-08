import { getFirestore } from 'firebase-admin/firestore'
import { getMessaging } from 'firebase-admin/messaging'
import { logger } from 'firebase-functions/v2'

interface NotifyPayload {
  storeId: string
  title: string
  body: string
  type: string
}

export async function notifyStoreOwner(payload: NotifyPayload) {
  const db = getFirestore()
  const storeSnap = await db.collection('stores').doc(payload.storeId).get()
  if (!storeSnap.exists) return

  const ownerId = storeSnap.data()?.ownerId as string | undefined
  if (!ownerId) return

  const tokensSnap = await db
    .collection('users')
    .doc(ownerId)
    .collection('fcmTokens')
    .get()

  const tokens = tokensSnap.docs
    .map((doc) => doc.data().token as string | undefined)
    .filter((token): token is string => Boolean(token))

  if (tokens.length === 0) {
    logger.info('No FCM tokens for store owner', payload.storeId)
    return
  }

  const messaging = getMessaging()
  const response = await messaging.sendEachForMulticast({
    tokens,
    notification: {
      title: payload.title,
      body: payload.body,
    },
    data: {
      title: payload.title,
      body: payload.body,
      type: payload.type,
      tag: `${payload.type}-${payload.storeId}`,
    },
    webpush: {
      fcmOptions: {
        link: '/orders',
      },
    },
  })

  logger.info('FCM sent', {
    storeId: payload.storeId,
    success: response.successCount,
    failure: response.failureCount,
  })
}
