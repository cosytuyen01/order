import { useEffect, useState } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { useAuth } from '../context/AuthContext'
import { useReminderBanner } from '../context/ReminderContext'
import { useAllBirdSchedules } from '../hooks/useAllBirdSchedules'
import { useScheduleReminders } from '../hooks/useScheduleReminders'
import { useBirds } from '../hooks/useBirds'
import { db } from '../firebase/config'

export default function ScheduleReminderWatcher() {
  const { user } = useAuth()
  const { birds } = useBirds(user?.uid)
  const { entries } = useAllBirdSchedules(birds)
  const { showInApp } = useReminderBanner()
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    if (!user) {
      setEnabled(false)
      return
    }

    return onSnapshot(doc(db, 'notificationSettings', user.uid), (snap) => {
      setEnabled(snap.exists() ? Boolean(snap.data().enabled) : false)
    })
  }, [user])

  useScheduleReminders(enabled, entries, showInApp)

  return null
}
