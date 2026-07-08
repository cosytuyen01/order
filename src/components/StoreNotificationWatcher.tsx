import { useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { useStoreNotificationBanner } from '../context/StoreNotificationContext'
import { subscribeStoreEvents } from '../hooks/useStoreEvents'
import { useOwnerStore } from '../hooks/useOwnerStore'
import { useOrders } from '../hooks/useOrders'
import {
  listenForForegroundPush,
  registerPushToken,
} from '../firebase/messaging'
import {
  showSystemNotification,
  vibrateDevice,
} from '../utils/notifications'
import type { Order } from '../types/store'

function notify(
  show: ReturnType<typeof useStoreNotificationBanner>['show'],
  payload: {
    id: string
    title: string
    body: string
    type: 'qr_scan' | 'cart_update' | 'new_order'
  },
) {
  show(payload)
  void showSystemNotification({
    title: payload.title,
    body: payload.body,
    tag: `${payload.type}-${payload.id}`,
  })
  vibrateDevice()
}

export default function StoreNotificationWatcher() {
  const { user } = useAuth()
  const { store } = useOwnerStore()
  const { show } = useStoreNotificationBanner()
  const { orders } = useOrders(store?.id)

  const eventsReady = useRef(false)
  const seenEventIds = useRef(new Set<string>())
  const ordersReady = useRef(false)
  const seenOrderIds = useRef(new Set<string>())

  useEffect(() => {
    if (!user?.uid) return
    void registerPushToken(user.uid)
  }, [user?.uid])

  useEffect(() => {
    if (!user?.uid) return
    return listenForForegroundPush((title, body, tag) => {
      show({
        id: tag,
        title,
        body,
        type: 'new_order',
      })
      vibrateDevice()
    })
  }, [user?.uid, show])

  useEffect(() => {
    if (!store?.id) {
      eventsReady.current = false
      seenEventIds.current.clear()
      return
    }

    const unsubscribe = subscribeStoreEvents(store.id, (events) => {
      if (!eventsReady.current) {
        for (const event of events) {
          seenEventIds.current.add(event.id)
        }
        eventsReady.current = true
        return
      }

      for (const event of events) {
        if (seenEventIds.current.has(event.id)) continue
        seenEventIds.current.add(event.id)
        notify(show, {
          id: event.id,
          title: event.title,
          body: event.body,
          type: event.type,
        })
      }
    })

    return () => {
      unsubscribe()
      eventsReady.current = false
      seenEventIds.current.clear()
    }
  }, [store?.id, show])

  useEffect(() => {
    if (!store?.id) {
      ordersReady.current = false
      seenOrderIds.current.clear()
      return
    }

    const handleOrders = (nextOrders: Order[]) => {
      const pending = nextOrders.filter((order) => order.status === 'pending')

      if (!ordersReady.current) {
        for (const order of pending) {
          seenOrderIds.current.add(order.id)
        }
        ordersReady.current = true
        return
      }

      for (const order of pending) {
        if (seenOrderIds.current.has(order.id)) continue
        seenOrderIds.current.add(order.id)

        const summary = order.items
          .map((item) => `${item.productName} ×${item.quantity}`)
          .join(', ')

        notify(show, {
          id: `order-${order.id}`,
          title: `Đơn mới — ${order.tableName}`,
          body: summary || 'Khách vừa đặt món',
          type: 'new_order',
        })
      }
    }

    handleOrders(orders)
  }, [orders, store?.id, show])

  return null
}
