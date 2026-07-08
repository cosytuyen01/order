import { NavLink } from 'react-router-dom'
import { NAV_ITEMS } from './icons'

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-1/2 z-50 w-full max-w-[480px] -translate-x-1/2 px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] md:max-w-[768px]">
      <div className="flex items-center justify-around rounded-2xl border border-border/60 bg-white px-1 py-2 shadow-[0_-4px_24px_rgba(61,35,20,0.08)]">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              [
                'flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-xl px-1 py-2 text-[10px] font-semibold transition md:text-[11px]',
                isActive
                  ? 'bg-warning-bg text-primary'
                  : 'text-text-muted hover:text-primary',
              ].join(' ')
            }
          >
            {({ isActive }) => (
              <>
                <item.icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 2} />
                <span className="truncate">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
