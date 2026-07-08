import BottomNav from './BottomNav'
import PageHeader from './PageHeader'
import NotificationBanner from './NotificationBanner'
import PushNotificationSetup from './PushNotificationSetup'
import StoreNotificationWatcher from './StoreNotificationWatcher'
import { useLocation } from 'react-router-dom'
import { HOME_BG } from '../utils/branding'

export default function Layout({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation()
  const isHome = pathname === '/'
  const isFullBleedDetail =
    pathname === '/menu-management' ||
    pathname === '/tables' ||
    pathname === '/orders' ||
    pathname === '/settings' ||
    pathname === '/employees' ||
    pathname === '/stats'

  return (
    <div className="relative flex min-h-screen flex-col pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))]">
      <div
        className="pointer-events-none absolute inset-0 z-0 bg-cover bg-top bg-no-repeat"
        style={{ backgroundImage: `url(${HOME_BG})` }}
        aria-hidden
      />

      <StoreNotificationWatcher />
      <PushNotificationSetup />
      <NotificationBanner />

      {!isFullBleedDetail && (
        <div className="sticky top-0 z-40">
          <PageHeader />
        </div>
      )}

      <main
        className={[
          'relative z-10 min-h-[calc(100vh-10rem)] flex-1',
          isFullBleedDetail
            ? 'pb-5 pt-0'
            : isHome
              ? '-mt-2 px-4 py-5 md:px-6'
              : 'px-4 py-5 md:px-6',
        ].join(' ')}
      >
        {children}
      </main>

      <BottomNav />
    </div>
  )
}
