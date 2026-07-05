import { useEffect, useState } from 'react'
import { Link, matchPath, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Bell, ChevronLeft } from './icons'

const HOME_SCROLL_RANGE = 88
const HOME_EXPANDED_PB = 4
const HOME_COLLAPSED_PB = 0.5
const HOME_EXPANDED_PT = 1.5
const HOME_COLLAPSED_PT = 0.5

function smoothstep(value: number) {
  const t = Math.min(1, Math.max(0, value))
  return t * t * (3 - 2 * t)
}

const PAGE_META: { path: string; title: string; subtitle: string }[] = [
  { path: '/', title: 'Trang chủ', subtitle: 'Quản lý sinh hoạt CLB' },
  { path: '/birds/new', title: 'Thêm chiến binh', subtitle: 'Thêm chiến binh mới' },
  { path: '/birds', title: 'Chiến binh của tôi', subtitle: 'Danh sách chiến binh' },
  { path: '/birds/:birdId', title: 'Chi tiết Chiến binh', subtitle: 'Thông tin chiến binh' },
  {
    path: '/che-do-di/tham-khao/:birdId',
    title: 'Chi tiết chiến binh',
    subtitle: 'Chế độ & nhật ký chiến binh',
  },
  { path: '/che-do-di', title: 'Chế độ', subtitle: 'Chăm sóc 7 ngày trong tuần' },
  { path: '/chi-tieu', title: 'Chi tiêu', subtitle: 'Quản lý thu chi cá nhân' },
  { path: '/thanh-vien/:userId', title: 'Thành viên', subtitle: 'Profile thành viên CLB' },
  {
    path: '/thanh-vien/:userId/chim/:birdId/nhat-ky',
    title: 'Nhật ký Chiến binh',
    subtitle: 'Nhật ký của thành viên khác',
  },
  { path: '/settings', title: 'Tài khoản', subtitle: 'Quản lý tài khoản & thông báo' },
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
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    if (!isHome) {
      setScrollY(0)
      return
    }

    let ticking = false
    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        setScrollY(window.scrollY)
        ticking = false
      })
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [isHome, pathname])

  const homeScrollProgress = isHome
    ? smoothstep(scrollY / HOME_SCROLL_RANGE)
    : 0

  const displayName = user?.displayName ?? 'Chiến binh'

  return (
    <div
      className={[
        'relative overflow-hidden px-5',
        isHome
          ? 'will-change-[padding,background]'
          : 'bg-gradient-to-br from-primary via-primary to-primary-dark pb-5 pt-5',
      ].join(' ')}
      style={
        isHome
          ? {
              paddingTop: `calc(${
                HOME_COLLAPSED_PT +
                (1 - homeScrollProgress) * (HOME_EXPANDED_PT - HOME_COLLAPSED_PT)
              }rem + env(safe-area-inset-top))`,
              paddingBottom: `${
                HOME_EXPANDED_PB -
                homeScrollProgress * (HOME_EXPANDED_PB - HOME_COLLAPSED_PB)
              }rem`,
              backgroundColor: `rgba(255, 255, 255, ${homeScrollProgress * 0.92})`,
              backdropFilter: `blur(${homeScrollProgress * 16}px)`,
              WebkitBackdropFilter: `blur(${homeScrollProgress * 16}px)`,
              boxShadow:
                homeScrollProgress > 0.05
                  ? `0 4px 24px -4px rgb(37 99 235 / ${homeScrollProgress * 0.08}), 0 2px 8px -2px rgb(15 23 42 / ${homeScrollProgress * 0.04})`
                  : 'none',
              borderBottom:
                homeScrollProgress > 0.1
                  ? `1px solid rgba(255, 255, 255, ${homeScrollProgress * 0.6})`
                  : '1px solid transparent',
            }
          : undefined
      }
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
          isHome ? 'items-center' : 'items-start',
        ].join(' ')}
      >
        <div className="flex min-w-0 flex-1 items-start gap-1">
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
          {isHome ? (
            <div className="grid min-w-0 flex-1 [&>*]:col-start-1 [&>*]:row-start-1">
              <div
                style={{
                  maxHeight: `${(1 - homeScrollProgress) * 168}px`,
                  opacity: Math.min(1, 1 - homeScrollProgress * 1.15),
                  overflow: 'hidden',
                  pointerEvents: homeScrollProgress > 0.65 ? 'none' : 'auto',
                }}
                aria-hidden={homeScrollProgress > 0.9}
              >
                <p className="text-sm font-medium text-white/90 drop-shadow-sm">Xin chào,</p>
                <h1 className="text-2xl font-extrabold tracking-tight text-white drop-shadow-md">
                  {displayName}
                </h1>
                <p className="mt-1 text-sm text-white/85 drop-shadow-sm">Nơi chiến binh tỏa sáng</p>
              </div>
              <div
                className="flex items-center self-center"
                style={{
                  opacity: homeScrollProgress,
                  maxHeight: homeScrollProgress > 0.05 ? '2.75rem' : 0,
                  overflow: 'hidden',
                  pointerEvents: homeScrollProgress < 0.35 ? 'none' : 'auto',
                }}
                aria-hidden={homeScrollProgress < 0.35}
              >
                <h1 className="truncate text-lg font-bold leading-tight tracking-tight text-text">
                  Xin chào, {displayName}
                </h1>
              </div>
            </div>
          ) : (
            <div className="min-w-0">
              <h1 className="text-2xl font-bold tracking-tight text-white">
                {meta.title}
              </h1>
              <p className="mt-1 text-sm text-white/85">{meta.subtitle}</p>
            </div>
          )}
        </div>
        {!showBack && (
          <Link
            to="/settings"
            className={[
              'flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl shadow-sm',
              !isHome && 'bg-white/20 text-white backdrop-blur-md transition hover:bg-white/30',
            ]
              .filter(Boolean)
              .join(' ')}
            style={
              isHome
                ? {
                    backgroundColor: `rgba(37, 99, 235, ${homeScrollProgress * 0.1})`,
                    color:
                      homeScrollProgress > 0.5
                        ? 'rgb(37 99 235)'
                        : `rgba(255, 255, 255, ${1 - homeScrollProgress * 0.2})`,
                    backdropFilter: `blur(${(1 - homeScrollProgress) * 8}px)`,
                    WebkitBackdropFilter: `blur(${(1 - homeScrollProgress) * 8}px)`,
                    boxShadow:
                      homeScrollProgress < 0.5
                        ? 'inset 0 0 0 1px rgba(255,255,255,0.25)'
                        : 'none',
                  }
                : undefined
            }
          >
            <Bell className="h-5 w-5" strokeWidth={2} />
          </Link>
        )}
      </div>
    </div>
  )
}
