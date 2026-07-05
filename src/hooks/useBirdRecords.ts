import { useEffect, useState } from 'react'
import {
  collection,
  onSnapshot,
  query,
  where,
} from 'firebase/firestore'
import { db } from '../firebase/config'
import type { ActivityRecord } from '../types'

function mapRecord(id: string, item: Record<string, unknown>): ActivityRecord {
  return {
    id,
    type: item.type as ActivityRecord['type'],
    title: item.title as string,
    date: item.date as string,
    time: (item.time as string) ?? '',
    videoUrl: (item.videoUrl as string) ?? (item.location as string) ?? '',
    notes: (item.notes as string) ?? '',
    birdId: (item.birdId as string) ?? '',
    birdName: (item.birdName as string) ?? '',
    ownerId: (item.ownerId as string) ?? '',
    createdBy: item.createdBy as string,
    createdByName: item.createdByName as string,
    createdAt:
      (item.createdAt as { toDate?: () => Date })?.toDate?.()?.toISOString() ?? '',
  }
}

export function useBirdRecords(ownerId: string | undefined, birdId?: string) {
  const [records, setRecords] = useState<ActivityRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!ownerId) {
      setRecords([])
      setLoading(false)
      setError(null)
      return
    }

    setLoading(true)
    const q = query(collection(db, 'records'), where('ownerId', '==', ownerId))

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs
          .map((d) => mapRecord(d.id, d.data()))
          .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
        setRecords(birdId ? data.filter((r) => r.birdId === birdId) : data)
        setLoading(false)
        setError(null)
      },
      (err) => {
        console.error('useBirdRecords:', err)
        setRecords([])
        setLoading(false)
        setError(err.message)
      },
    )

    return unsubscribe
  }, [ownerId, birdId])

  return { records, loading, error }
}
