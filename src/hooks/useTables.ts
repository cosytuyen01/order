import { useEffect, useState } from 'react'
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore'
import { db } from '../firebase/config'
import type { Table } from '../types/store'

export function useTables(storeId: string | undefined) {
  const [tables, setTables] = useState<Table[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!storeId) {
      setTables([])
      setLoading(false)
      return
    }

    const q = query(collection(db, 'tables'), where('storeId', '==', storeId))

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs
          .map((d) => {
            const item = d.data()
            return {
              id: d.id,
              storeId: item.storeId,
              name: item.name,
              status: item.status ?? 'available',
              createdAt:
                item.createdAt?.toDate?.()?.toISOString() ?? '',
            } as Table
          })
          .sort((a, b) => a.name.localeCompare(b.name, 'vi'))
        setTables(data)
        setLoading(false)
      },
      () => setLoading(false),
    )

    return unsubscribe
  }, [storeId])

  const addTable = async (name: string) => {
    if (!storeId) return
    await addDoc(collection(db, 'tables'), {
      storeId,
      name: name.trim(),
      status: 'available',
      createdAt: serverTimestamp(),
    })
  }

  const updateTable = async (
    id: string,
    data: Partial<Pick<Table, 'name' | 'status'>>,
  ) => {
    const payload: Record<string, unknown> = {}
    if (data.name !== undefined) payload.name = data.name.trim()
    if (data.status !== undefined) payload.status = data.status
    await updateDoc(doc(db, 'tables', id), payload)
  }

  const removeTable = async (id: string) => {
    await deleteDoc(doc(db, 'tables', id))
  }

  return { tables, loading, addTable, updateTable, removeTable }
}

export function useTableById(tableId: string | undefined) {
  const [table, setTable] = useState<Table | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!tableId) {
      setTable(null)
      setLoading(false)
      return
    }

    const unsubscribe = onSnapshot(
      doc(db, 'tables', tableId),
      (docSnap) => {
        if (!docSnap.exists()) {
          setTable(null)
        } else {
          const item = docSnap.data()
          setTable({
            id: docSnap.id,
            storeId: item.storeId,
            name: item.name,
            status: item.status ?? 'available',
            createdAt:
              item.createdAt?.toDate?.()?.toISOString() ?? '',
          })
        }
        setLoading(false)
      },
      () => setLoading(false),
    )

    return unsubscribe
  }, [tableId])

  return { table, loading }
}
