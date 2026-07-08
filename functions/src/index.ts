import { initializeApp } from 'firebase-admin/app'
import { onDocumentCreated } from 'firebase-functions/v2/firestore'
import { logger } from 'firebase-functions/v2'
import { notifyStoreOwner } from './notifications.js'

initializeApp()

export const onStoreEventCreated = onDocumentCreated(
  {
    document: 'storeEvents/{eventId}',
    region: 'asia-southeast1',
  },
  async (event) => {
    const data = event.data?.data()
    if (!data) return

    try {
      await notifyStoreOwner({
        storeId: String(data.storeId),
        title: String(data.title ?? 'Thông báo cửa hàng'),
        body: String(data.body ?? ''),
        type: String(data.type ?? 'store_event'),
      })
    } catch (error) {
      logger.error('onStoreEventCreated failed', error)
    }
  },
)

export const onOrderCreated = onDocumentCreated(
  {
    document: 'orders/{orderId}',
    region: 'asia-southeast1',
  },
  async (event) => {
    const data = event.data?.data()
    if (!data) return

    const items = (data.items as { productName: string; quantity: number }[]) ?? []
    const summary =
      items.map((item) => `${item.productName} ×${item.quantity}`).join(', ') ||
      'Khách vừa đặt món'

    try {
      await notifyStoreOwner({
        storeId: String(data.storeId),
        title: `Đơn mới — ${data.tableName ?? 'Bàn'}`,
        body: summary,
        type: 'new_order',
      })
    } catch (error) {
      logger.error('onOrderCreated failed', error)
    }
  },
)
