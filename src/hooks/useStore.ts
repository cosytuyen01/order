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
import type { Store } from '../types/store'

function mapStore(id: string, data: Record<string, unknown>): Store {
  return {
    id,
    ownerId: String(data.ownerId ?? ''),
    name: String(data.name ?? ''),
    phone: String(data.phone ?? ''),
    address: String(data.address ?? ''),
    logoUrl: data.logoUrl ? String(data.logoUrl) : undefined,
    status: (data.status as Store['status']) ?? 'active',
    createdAt:
      (data.createdAt as { toDate?: () => Date })?.toDate?.()?.toISOString() ??
      String(data.createdAt ?? ''),
  }
}

export function useStore(ownerId: string | undefined) {
  const [store, setStore] = useState<Store | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!ownerId) {
      setStore(null)
      setLoading(false)
      return
    }

    const q = query(collection(db, 'stores'), where('ownerId', '==', ownerId))

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const docSnap = snapshot.docs[0]
        setStore(docSnap ? mapStore(docSnap.id, docSnap.data()) : null)
        setLoading(false)
      },
      () => setLoading(false),
    )

    return unsubscribe
  }, [ownerId])

  const createStore = async (
    ownerId: string,
    data: Pick<Store, 'name' | 'phone' | 'address'>,
  ) => {
    const ref = await addDoc(collection(db, 'stores'), {
      ownerId,
      name: data.name.trim(),
      phone: data.phone.trim(),
      address: data.address.trim(),
      status: 'active',
      createdAt: serverTimestamp(),
    })
    return ref.id
  }

  const updateStore = async (
    id: string,
    data: Partial<Pick<Store, 'name' | 'phone' | 'address' | 'logoUrl' | 'status'>>,
  ) => {
    const payload: Record<string, unknown> = {}
    if (data.name !== undefined) payload.name = data.name.trim()
    if (data.phone !== undefined) payload.phone = data.phone.trim()
    if (data.address !== undefined) payload.address = data.address.trim()
    if (data.logoUrl !== undefined) payload.logoUrl = data.logoUrl
    if (data.status !== undefined) payload.status = data.status
    await updateDoc(doc(db, 'stores', id), payload)
  }

  return { store, loading, createStore, updateStore }
}

export function useStoreById(storeId: string | undefined) {
  const [store, setStore] = useState<Store | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!storeId) {
      setStore(null)
      setLoading(false)
      return
    }

    const unsubscribe = onSnapshot(
      doc(db, 'stores', storeId),
      (docSnap) => {
        setStore(
          docSnap.exists() ? mapStore(docSnap.id, docSnap.data()) : null,
        )
        setLoading(false)
      },
      () => setLoading(false),
    )

    return unsubscribe
  }, [storeId])

  return { store, loading }
}
