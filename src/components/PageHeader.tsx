import { useEffect, useState } from 'react'
import { Link, matchPath, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Bell, ChevronLeft } from './icons'

const HOME_SCROLL_THRESHOLD = 40

const PAGE_META: { path: string; title: string; subtitle: string }[] = [
  { path: '/', title: 'Trang chủ', subtitle: 'Quản lý sinh hoạt CLB' },
  { path: '/birds/new', title: 'Thêm chào mào', subtitle: 'Thêm chiến binh mới' },
  { path: '/birds', title: 'Chiến binh của tôi', subtitle: 'Danh sách chiến binh' },
  { path: '/birds/:birdId', title: 'Chi tiết Chiến binh', subtitle: 'Thông tin chiến binh' },
  {
    path: '/che-do-di/tham-khao/:birdId',
    title: 'Tham khảo Chế độ',
    subtitle: 'Chế độ của thành viên khác',
  },
  { path: '/che-do-di', title: 'Chế độ', subtitle: 'Chăm sóc 7 ngày trong tuần' },
  { path: '/records', title: 'Nhật ký', subtitle: 'Ghi chép đi dợt & đi thi' },
  { path: '/thanh-vien/:userId', title: 'Thành viên', subtitle: 'Profile thành viên CLB' },
  {
    path: '/thanh-vien/:userId/chim/:birdId/nhat-ky',
    title: 'Nhật ký Chiến binh',
    subtitle: 'Nhật ký của thành viên khác',
  },
  { path: '/settings', title: 'Cài đặt', subtitle: 'Tài khoản & thông báo' },
]

const BACK_PATHS = [
  '/birds/new',
  '/birds/:birdId',
  '/che-do-di/tham-khao/:birdId',
  '/thanh-vien/:userId',
  '/thanh-vien/:userId/chim/:birdId/nhat-ky',
]

function getPageMeta(pathname: string) {
  for (const meta of PAGE_META) {
    if (matchPath(meta.path, pathname)) return meta
  }
  return PAGE_META[0]
}

function shouldShowBack(pathname: string) {
  return BACK_PATHS.some((path) => matchPath(path, pathname))
}

export default function PageHeader() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const meta = getPageMeta(pathname)
  const showBack = shouldShowBack(pathname)
  const isHome = pathname === '/'
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    if (!isHome) {
      setScrolled(false)
      return
    }

    const onScroll = () => setScrolled(window.scrollY > HOME_SCROLL_THRESHOLD)

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [isHome, pathname])

  const homeScrolled = isHome && scrolled

  return (
    <div
      className={[
        'relative overflow-hidden px-5 transition-all duration-300',
        isHome
          ? homeScrolled
            ? 'border-b border-white/60 bg-white/92 pb-4 pt-[max(0.75rem,env(safe-area-inset-top))] shadow-[var(--shadow-card)] backdrop-blur-xl'
            : 'bg-transparent pb-16 pt-6'
          : 'bg-gradient-to-br from-primary via-primary to-primary-dark pb-5 pt-5',
      ].join(' ')}
    >
      {!isHome && (
        <>
          <div
            className="pointer-events-none absolute inset-0 bg-cover bg-right-top opacity-90"
            style={{ backgroundImage: "url('/bgpage.png')" }}
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-b from-primary/10 via-primary/40 to-primary"
            aria-hidden
          />
        </>
      )}

      <div
        className={[
          'relative flex justify-between gap-3',
          homeScrolled ? 'items-center' : 'items-start',
        ].join(' ')}
      >
        <div
          className={[
            'flex min-w-0 gap-1',
            homeScrolled ? 'items-center' : 'items-start',
          ].join(' ')}
        >
          {showBack && (
            <button
              type="button"
              onClick={() => navigate(-1)}
              aria-label="Quay lại"
              className="-ml-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white transition hover:bg-white/15"
            >
              <ChevronLeft className="h-7 w-7" strokeWidth={2} />
            </button>
          )}
          <div className={['min-w-0', isHome && !homeScrolled ? 'mb-8' : ''].join(' ')}>
            {isHome ? (
              homeScrolled ? (
                <h1 className="truncate text-lg font-bold leading-none tracking-tight text-text">
                  Xin chào, {user?.displayName ?? 'Chiến binh'}
                </h1>
              ) : (
                <>
                  <p className="text-sm font-medium text-white/90 drop-shadow-sm">Xin chào,</p>
                  <h1 className="text-2xl font-extrabold tracking-tight text-white drop-shadow-md">
                    {user?.displayName ?? 'Chiến binh'}
                  </h1>
                  <p className="mt-1 text-sm text-white/85 drop-shadow-sm">Chào mào của tôi</p>
                </>
              )
            ) : (
              <>
                <h1 className="text-2xl font-bold tracking-tight text-white">
                  {meta.title}
                </h1>
                <p className="mt-1 text-sm text-white/85">{meta.subtitle}</p>
              </>
            )}
          </div>
        </div>
        {!showBack && (
          <Link
            to="/settings"
            className={[
              'flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl shadow-sm transition',
              homeScrolled
                ? 'bg-primary/10 text-primary hover:bg-primary/15'
                : 'bg-white/20 text-white backdrop-blur-md hover:bg-white/30',
            ].join(' ')}
          >
            <Bell className="h-5 w-5" strokeWidth={2} />
          </Link>
        )}
      </div>
    </div>
  )
}
