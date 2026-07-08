import { useEffect, useState } from 'react'
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore'
import { db } from '../firebase/config'
import type { OrderItem, TableCart } from '../types/store'

function mapTableCart(id: string, data: Record<string, unknown>): TableCart {
  return {
    tableId: id,
    storeId: String(data.storeId ?? ''),
    tableName: String(data.tableName ?? ''),
    items: (data.items as OrderItem[]) ?? [],
    customerNote: String(data.customerNote ?? ''),
    total: Number(data.total ?? 0),
    itemCount: Number(data.itemCount ?? 0),
    updatedAt:
      (data.updatedAt as { toDate?: () => Date })?.toDate?.()?.toISOString() ??
      String(data.updatedAt ?? ''),
  }
}

export function useTableCarts(storeId: string | undefined) {
  const [carts, setCarts] = useState<TableCart[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!storeId) {
      setCarts([])
      setLoading(false)
      return
    }

    const q = query(
      collection(db, 'tableCarts'),
      where('storeId', '==', storeId),
    )

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs
          .map((d) => mapTableCart(d.id, d.data()))
          .filter((cart) => cart.itemCount > 0)
        setCarts(data)
        setLoading(false)
      },
      () => setLoading(false),
    )

    return unsubscribe
  }, [storeId])

  const cartsByTableId = new Map(carts.map((cart) => [cart.tableId, cart]))

  return { carts, cartsByTableId, loading }
}

export function useSyncTableCart(
  storeId: string | undefined,
  tableId: string | undefined,
  tableName: string | undefined,
  items: { product: { id: string; name: string; price: number }; quantity: number }[],
  customerNote: string,
  totalPrice: number,
) {
  useEffect(() => {
    if (!storeId || !tableId || !tableName) return

    const timer = window.setTimeout(() => {
      const ref = doc(db, 'tableCarts', tableId)

      if (items.length === 0) {
        void deleteDoc(ref).catch(() => {})
        return
      }

      void setDoc(ref, {
        storeId,
        tableId,
        tableName,
        items: items.map((item) => ({
          productId: item.product.id,
          productName: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
        })),
        customerNote: customerNote.trim(),
        total: totalPrice,
        itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
        updatedAt: serverTimestamp(),
      })
    }, 600)

    return () => window.clearTimeout(timer)
  }, [storeId, tableId, tableName, items, customerNote, totalPrice])
}

export async function clearTableCart(tableId: string) {
  await deleteDoc(doc(db, 'tableCarts', tableId))
}
