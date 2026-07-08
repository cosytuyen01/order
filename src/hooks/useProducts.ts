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
import type { Product } from '../types/store'

export function useProducts(storeId: string | undefined) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!storeId) {
      setProducts([])
      setLoading(false)
      return
    }

    const q = query(
      collection(db, 'products'),
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
              categoryId: item.categoryId,
              name: item.name,
              description: item.description ?? '',
              imageUrl: item.imageUrl,
              price: item.price ?? 0,
              status: item.status ?? 'active',
              createdAt:
                item.createdAt?.toDate?.()?.toISOString() ?? '',
            } as Product
          })
          .sort((a, b) => a.name.localeCompare(b.name))
        setProducts(data)
        setLoading(false)
      },
      () => setLoading(false),
    )

    return unsubscribe
  }, [storeId])

  const addProduct = async (
    data: Pick<Product, 'categoryId' | 'name' | 'description' | 'price'>,
  ) => {
    if (!storeId) return
    await addDoc(collection(db, 'products'), {
      storeId,
      categoryId: data.categoryId,
      name: data.name.trim(),
      description: data.description.trim(),
      price: data.price,
      status: 'active',
      createdAt: serverTimestamp(),
    })
  }

  const updateProduct = async (
    id: string,
    data: Partial<
      Pick<Product, 'categoryId' | 'name' | 'description' | 'price' | 'status' | 'imageUrl'>
    >,
  ) => {
    const payload: Record<string, unknown> = {}
    if (data.categoryId !== undefined) payload.categoryId = data.categoryId
    if (data.name !== undefined) payload.name = data.name.trim()
    if (data.description !== undefined) payload.description = data.description.trim()
    if (data.price !== undefined) payload.price = data.price
    if (data.status !== undefined) payload.status = data.status
    if (data.imageUrl !== undefined) payload.imageUrl = data.imageUrl
    await updateDoc(doc(db, 'products', id), payload)
  }

  const removeProduct = async (id: string) => {
    await deleteDoc(doc(db, 'products', id))
  }

  return { products, loading, addProduct, updateProduct, removeProduct }
}
