import BottomNav from './BottomNav'
import PageHeader from './PageHeader'
import ReminderBanner from './ReminderBanner'
import ScheduleReminderWatcher from './ScheduleReminderWatcher'
import PushNotificationSetup from './PushNotificationSetup'
import { matchPath, useLocation } from 'react-router-dom'
import { HOME_BG } from '../utils/branding'

export default function Layout({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation()
  const isHome = pathname === '/'
  const isBirdDetail = Boolean(matchPath('/birds/:birdId', pathname))

  return (
    <div className="relative flex min-h-screen flex-col bg-page pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))]">
      {isHome && (
        <>
          <div
            className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[min(80vh,700px)] bg-cover bg-top"
            style={{ backgroundImage: `url(${HOME_BG})` }}
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[min(80vh,700px)] bg-gradient-to-b from-black/15 via-black/0 to-page"
            aria-hidden
          />
        </>
      )}

      <ScheduleReminderWatcher />
      <PushNotificationSetup />
      <ReminderBanner />

      {!isBirdDetail && (
        <div className="sticky top-0 z-40">
          <PageHeader />
        </div>
      )}

      <main
        className={[
          'relative z-10 min-h-[calc(100vh-10rem)] flex-1',
          isBirdDetail
            ? 'pb-5 pt-0'
            : isHome
              ? '-mt-10 px-4 pb-5 pt-0 md:px-6'
              : 'bg-page px-4 py-5 md:px-6',
        ].join(' ')}
      >
        {children}
      </main>

      <BottomNav />
    </div>
  )
}
