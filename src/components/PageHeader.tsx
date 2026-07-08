import { useEffect, useState } from 'react'
import { Link, matchPath, useLocation, useNavigate } from 'react-router-dom'
import { useOwnerStore } from '../hooks/useOwnerStore'
import { useStoreNotificationBanner } from '../context/StoreNotificationContext'
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
  { path: '/', title: 'Tổng quan', subtitle: 'Dashboard cửa hàng' },
  { path: '/menu-management', title: 'Menu', subtitle: 'Danh mục & món ăn' },
  { path: '/tables', title: 'Bàn', subtitle: 'Quản lý bàn & mã QR' },
  { path: '/orders', title: 'Đơn hàng', subtitle: 'Theo dõi đơn đặt món' },
  { path: '/settings', title: 'Tài khoản', subtitle: 'Thông tin cửa hàng' },
]

const BACK_PATHS: string[] = []

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
  const { store } = useOwnerStore()
  const { unreadCount, clearUnread } = useStoreNotificationBanner()
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

  const storeName = store?.name ?? 'Cửa hàng'
  const storeAddress = store?.address || 'Chưa có địa chỉ'

  return (
    <div
      className={[
        'relative overflow-hidden px-5',
        isHome
          ? 'will-change-[padding,background]'
          : 'pb-5 pt-5',
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
              boxShadow:
                homeScrollProgress > 0.05
                  ? `0 4px 24px -4px rgb(61 35 20 / ${homeScrollProgress * 0.06})`
                  : 'none',
              borderBottom:
                homeScrollProgress > 0.1
                  ? `1px solid rgba(234, 217, 200, ${homeScrollProgress * 0.8})`
                  : '1px solid transparent',
            }
          : undefined
      }
    >
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
                <h1 className="text-2xl font-extrabold tracking-tight text-brown drop-shadow-sm">
                  {storeName}
                </h1>
                <p className="mt-1 text-sm text-brown-light">{storeAddress}</p>
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
                <h1 className="truncate text-lg font-bold leading-tight tracking-tight text-brown">
                  {storeName}
                </h1>
              </div>
            </div>
          ) : (
            <div className="min-w-0">
              <h1 className="text-2xl font-bold tracking-tight text-brown">
                {meta.title}
              </h1>
              <p className="mt-1 text-sm text-brown-light">{meta.subtitle}</p>
            </div>
          )}
        </div>
        {!showBack && (
          <Link
            to="/orders"
            onClick={clearUnread}
            className={[
              'relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl shadow-sm',
              !isHome && 'border border-border/60 bg-white text-brown transition hover:bg-input-beige',
            ]
              .filter(Boolean)
              .join(' ')}
            style={
              isHome
                ? {
                    backgroundColor:
                      homeScrollProgress > 0.5
                        ? 'rgba(211, 112, 45, 0.1)'
                        : 'rgba(255, 255, 255, 0.75)',
                    color:
                      homeScrollProgress > 0.5 ? 'rgb(211 112 45)' : 'rgb(61 35 20)',
                    border:
                      homeScrollProgress < 0.5
                        ? '1px solid rgba(234, 217, 200, 0.8)'
                        : 'none',
                  }
                : undefined
            }
          >
            <Bell className="h-5 w-5" strokeWidth={2} />
            {unreadCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Link>
        )}
      </div>
    </div>
  )
}
