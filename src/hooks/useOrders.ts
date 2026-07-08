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
import type { Order, OrderItem, OrderStatus } from '../types/store'

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

  return { orders, loading, updateOrderStatus }
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
