import { useEffect, useState } from 'react'
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore'
import { db } from '../firebase/config'
import {
  ACTIVE_TABLE_ORDER_STATUSES,
  type Order,
  type OrderItem,
  type OrderStatus,
} from '../types/store'

function mapOrder(id: string, data: Record<string, unknown>): Order {
  return {
    id,
    storeId: String(data.storeId ?? ''),
    tableId: String(data.tableId ?? ''),
    tableName: String(data.tableName ?? ''),
    items: (data.items as OrderItem[]) ?? [],
    customerNote: String(data.customerNote ?? ''),
    status: (data.status as OrderStatus) ?? 'pending',
    total: Number(data.total ?? 0),
    createdAt:
      (data.createdAt as { toDate?: () => Date })?.toDate?.()?.toISOString() ??
      String(data.createdAt ?? ''),
  }
}

export function useOrders(storeId: string | undefined) {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!storeId) {
      setOrders([])
      setLoading(false)
      return
    }

    const q = query(
      collection(db, 'orders'),
      where('storeId', '==', storeId),
    )

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs
          .map((d) => mapOrder(d.id, d.data()))
          .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        setOrders(data)
        setLoading(false)
      },
      () => setLoading(false),
    )

    return unsubscribe
  }, [storeId])

  const updateOrderStatus = async (id: string, status: OrderStatus) => {
    await updateDoc(doc(db, 'orders', id), { status })
  }

  const clearTable = async (tableId: string) => {
    const active = orders.filter(
      (o) =>
        o.tableId === tableId &&
        ACTIVE_TABLE_ORDER_STATUSES.includes(o.status),
    )
    await Promise.all(
      active.map((o) => updateDoc(doc(db, 'orders', o.id), { status: 'paid' })),
    )
  }

  return { orders, loading, updateOrderStatus, clearTable }
}

export function useTableOrders(
  storeId: string | undefined,
  tableId: string | undefined,
) {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!storeId || !tableId) {
      setOrders([])
      setLoading(false)
      return
    }

    const q = query(
      collection(db, 'orders'),
      where('storeId', '==', storeId),
      where('tableId', '==', tableId),
    )

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs
          .map((d) => mapOrder(d.id, d.data()))
          .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        setOrders(data)
        setLoading(false)
      },
      () => setLoading(false),
    )

    return unsubscribe
  }, [storeId, tableId])

  return { orders, loading }
}

export async function createOrder(data: {
  storeId: string
  tableId: string
  tableName: string
  items: OrderItem[]
  customerNote: string
  total: number
}) {
  await addDoc(collection(db, 'orders'), {
    storeId: data.storeId,
    tableId: data.tableId,
    tableName: data.tableName,
    items: data.items,
    customerNote: data.customerNote.trim(),
    status: 'pending',
    total: data.total,
    createdAt: serverTimestamp(),
  })
}
