import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'

export interface ActiveReminder {
  id: string
  title: string
  body: string
  time: string
}

interface ReminderContextValue {
  active: ActiveReminder | null
  showInApp: (reminder: ActiveReminder) => void
  dismiss: () => void
}

const ReminderContext = createContext<ReminderContextValue | null>(null)

export function ReminderProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState<ActiveReminder | null>(null)

  const showInApp = useCallback((reminder: ActiveReminder) => {
    setActive(reminder)
  }, [])

  const dismiss = useCallback(() => {
    setActive(null)
  }, [])

  return (
    <ReminderContext.Provider value={{ active, showInApp, dismiss }}>
      {children}
    </ReminderContext.Provider>
  )
}

export function useReminderBanner() {
  const context = useContext(ReminderContext)
  if (!context) {
    throw new Error('useReminderBanner must be used within ReminderProvider')
  }
  return context
}
