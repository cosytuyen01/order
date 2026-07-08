import {
  addDoc,
  collection,
  onSnapshot,
  query,
  serverTimestamp,
  where,
} from 'firebase/firestore'
import { db } from '../firebase/config'
import type { StoreEvent, StoreEventType } from '../types/store'

export async function logStoreEvent(data: {
  storeId: string
  tableId: string
  tableName: string
  type: StoreEventType
  title: string
  body: string
  itemCount?: number
}) {
  await addDoc(collection(db, 'storeEvents'), {
    storeId: data.storeId,
    tableId: data.tableId,
    tableName: data.tableName,
    type: data.type,
    title: data.title,
    body: data.body,
    itemCount: data.itemCount ?? 0,
    createdAt: serverTimestamp(),
  })
}

function mapStoreEvent(id: string, data: Record<string, unknown>): StoreEvent {
  return {
    id,
    storeId: String(data.storeId ?? ''),
    tableId: String(data.tableId ?? ''),
    tableName: String(data.tableName ?? ''),
    type: data.type as StoreEventType,
    title: String(data.title ?? ''),
    body: String(data.body ?? ''),
    itemCount: Number(data.itemCount ?? 0),
    createdAt:
      (data.createdAt as { toDate?: () => Date })?.toDate?.()?.toISOString() ??
      String(data.createdAt ?? ''),
  }
}

export function subscribeStoreEvents(
  storeId: string,
  onEvents: (events: StoreEvent[]) => void,
  onError?: () => void,
) {
  const q = query(
    collection(db, 'storeEvents'),
    where('storeId', '==', storeId),
  )

  return onSnapshot(
    q,
    (snapshot) => {
      const events = snapshot.docs
        .map((d) => mapStoreEvent(d.id, d.data()))
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      onEvents(events)
    },
    () => onError?.(),
  )
}
