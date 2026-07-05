import { useEffect, useState } from 'react'
import { collection, doc, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase/config'
import { formatPhoneDisplay } from '../utils/phone'
import { resolveOwnerName } from '../utils/user'

export interface MemberSummary {
  id: string
  displayName: string
  phone: string
  avatarUrl: string
  birdCount: number
}

export interface MemberProfile {
  id: string
  displayName: string
  phone: string
  avatarUrl: string
}

function mapMemberProfile(id: string, data: Record<string, unknown>): MemberProfile {
  const phone = (data.phone as string) ?? ''
  return {
    id,
    displayName: resolveOwnerName({
      displayName: data.displayName as string | undefined,
      phone,
    }),
    phone: phone ? formatPhoneDisplay(phone) : '',
    avatarUrl: (data.avatarUrl as string) ?? '',
  }
}

export function useMembers(currentUserId: string | undefined) {
  const [members, setMembers] = useState<MemberSummary[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!currentUserId) {
      setMembers([])
      setLoading(false)
      return
    }

    setLoading(true)
    const profiles = new Map<string, MemberProfile>()
    const birdCounts = new Map<string, number>()

    const rebuild = () => {
      const next = [...profiles.values()]
        .filter((member) => member.id !== currentUserId)
        .map((member) => ({
          ...member,
          birdCount: birdCounts.get(member.id) ?? 0,
        }))
        .sort((a, b) => a.displayName.localeCompare(b.displayName, 'vi'))
      setMembers(next)
      setLoading(false)
    }

    const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      profiles.clear()
      for (const userDoc of snapshot.docs) {
        profiles.set(userDoc.id, mapMemberProfile(userDoc.id, userDoc.data()))
      }
      rebuild()
    })

    const unsubBirds = onSnapshot(collection(db, 'birds'), (snapshot) => {
      birdCounts.clear()
      for (const birdDoc of snapshot.docs) {
        const ownerId = birdDoc.data().ownerId as string
        if (!ownerId) continue
        birdCounts.set(ownerId, (birdCounts.get(ownerId) ?? 0) + 1)
      }
      rebuild()
    })

    return () => {
      unsubUsers()
      unsubBirds()
    }
  }, [currentUserId])

  return { members, loading }
}

export function useMemberProfile(userId: string | undefined) {
  const [member, setMember] = useState<MemberProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!userId) {
      setMember(null)
      setLoading(false)
      setNotFound(false)
      return
    }

    setLoading(true)
    return onSnapshot(doc(db, 'users', userId), (snap) => {
      if (!snap.exists()) {
        setMember(null)
        setNotFound(true)
      } else {
        setMember(mapMemberProfile(snap.id, snap.data()))
        setNotFound(false)
      }
      setLoading(false)
    })
  }, [userId])

  return { member, loading, notFound }
}
