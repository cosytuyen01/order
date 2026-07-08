import { useEffect, useState } from 'react'
import { collection, doc, onSnapshot, query, updateDoc, where } from 'firebase/firestore'
import { db } from '../firebase/config'

export interface Employee {
  id: string
  displayName: string
  phone: string
  role: 'employee'
  storeId: string
  createdAt: string
}

export function useEmployees(storeId: string | undefined) {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!storeId) {
      setEmployees([])
      setLoading(false)
      return
    }

    const q = query(collection(db, 'users'), where('storeId', '==', storeId))

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setEmployees(
          snapshot.docs
            .map((docSnap) => {
              const data = docSnap.data() as Record<string, unknown>
              return {
                id: docSnap.id,
                displayName: String(data.displayName ?? ''),
                phone: String(data.phone ?? ''),
                role: (data.role as Employee['role']) ?? 'employee',
                storeId: String(data.storeId ?? ''),
                createdAt: String(data.createdAt ?? ''),
              }
            })
            .filter((item) => item.role === 'employee'),
        )
        setLoading(false)
      },
      () => setLoading(false),
    )

    return unsubscribe
  }, [storeId])

  const updateEmployeeName = async (id: string, displayName: string) => {
    await updateDoc(doc(db, 'users', id), { displayName: displayName.trim() })
  }

  const deactivateEmployee = async (id: string) => {
    await updateDoc(doc(db, 'users', id), {
      role: 'disabled',
      storeId: '',
    })
  }

  return { employees, loading, updateEmployeeName, deactivateEmployee }
}
