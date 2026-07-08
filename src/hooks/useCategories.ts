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
import type { Category } from '../types/store'

export function useCategories(storeId: string | undefined) {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!storeId) {
      setCategories([])
      setLoading(false)
      return
    }

    const q = query(
      collection(db, 'categories'),
      where('storeId', '==', storeId),
    )

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
              imageUrl: item.imageUrl,
              sortOrder: item.sortOrder ?? 0,
              status: item.status ?? 'active',
              createdAt:
                item.createdAt?.toDate?.()?.toISOString() ?? '',
            } as Category
          })
          .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name))
        setCategories(data)
        setLoading(false)
      },
      () => setLoading(false),
    )

    return unsubscribe
  }, [storeId])

  const addCategory = async (name: string, sortOrder = 0) => {
    if (!storeId) return
    await addDoc(collection(db, 'categories'), {
      storeId,
      name: name.trim(),
      sortOrder,
      status: 'active',
      createdAt: serverTimestamp(),
    })
  }

  const updateCategory = async (
    id: string,
    data: Partial<Pick<Category, 'name' | 'sortOrder' | 'status' | 'imageUrl'>>,
  ) => {
    const payload: Record<string, unknown> = {}
    if (data.name !== undefined) payload.name = data.name.trim()
    if (data.sortOrder !== undefined) payload.sortOrder = data.sortOrder
    if (data.status !== undefined) payload.status = data.status
    if (data.imageUrl !== undefined) payload.imageUrl = data.imageUrl
    await updateDoc(doc(db, 'categories', id), payload)
  }

  const removeCategory = async (id: string) => {
    await deleteDoc(doc(db, 'categories', id))
  }

  return { categories, loading, addCategory, updateCategory, removeCategory }
}
