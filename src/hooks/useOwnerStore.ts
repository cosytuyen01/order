import { useEffect, useState } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { useAuth } from '../context/AuthContext'
import { db } from '../firebase/config'
import { useStore, useStoreById } from '../hooks/useStore'

export type UserRole = 'owner' | 'employee'

export interface UserProfile {
  uid: string
  displayName: string
  phone: string
  role: UserRole
  storeId?: string
}

export function useOwnerStore() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [profileLoading, setProfileLoading] = useState(true)

  const {
    store: ownerStore,
    loading: ownerStoreLoading,
    createStore,
    updateStore,
  } = useStore(user?.uid)
  const { store: employeeStore, loading: employeeStoreLoading } = useStoreById(
    profile?.storeId,
  )

  useEffect(() => {
    if (!user?.uid) {
      setProfile(null)
      setProfileLoading(false)
      return
    }

    const unsubscribe = onSnapshot(
      doc(db, 'users', user.uid),
      (snap) => {
        if (!snap.exists()) {
          setProfile(null)
          setProfileLoading(false)
          return
        }

        const data = snap.data() as Record<string, unknown>
        setProfile({
          uid: user.uid,
          displayName: String(data.displayName ?? ''),
          phone: String(data.phone ?? ''),
          role: (data.role as UserRole) ?? 'owner',
          storeId: data.storeId ? String(data.storeId) : undefined,
        })
        setProfileLoading(false)
      },
      () => setProfileLoading(false),
    )

    return unsubscribe
  }, [user?.uid])

  const isEmployee = profile?.role === 'employee'
  const store = isEmployee ? employeeStore : ownerStore
  const loading =
    profileLoading || (isEmployee ? employeeStoreLoading : ownerStoreLoading)

  return {
    user,
    profile,
    isOwner: !isEmployee,
    isEmployee,
    store,
    loading,
    createStore,
    updateStore,
  }
}
