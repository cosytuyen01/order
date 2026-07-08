import { APP_LOGO, HOME_BG } from '../../utils/branding'

interface AuthLayoutProps {
  title: string
  subtitle: string
  children: React.ReactNode
  footer: React.ReactNode
}

export default function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: AuthLayoutProps) {
  return (
    <div className="relative isolate flex min-h-[100dvh] flex-col overflow-hidden bg-page">
      <div
        className="pointer-events-none absolute inset-0 bg-cover bg-top bg-no-repeat"
        style={{ backgroundImage: `url(${HOME_BG})` }}
        aria-hidden
      />

      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-[#fdf8f3]/40 to-transparent"
        aria-hidden
      />

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-5 py-10">
        <div className="mb-6 text-center">
          <div className="mx-auto w-fit rounded-full p-1 shadow-[0_0_0_4px_rgba(255,255,255,0.35),0_8px_32px_rgba(37,99,235,0.25)]">
            <img
              src={APP_LOGO}
              alt="OrderQR logo"
              className="h-24 w-24 rounded-full object-cover ring-2 ring-white/80"
            />
          </div>
          <h1 className="mt-5 text-[1.75rem] font-bold tracking-tight text-brown">
            {title}
          </h1>
          <p className="mt-2 max-w-xs text-sm leading-relaxed text-brown-light">
            {subtitle}
          </p>
        </div>

        <div className="w-full max-w-[22rem] rounded-2xl bg-white p-6 shadow-[0_16px_48px_rgba(61,35,20,0.1)]">
          {children}
        </div>

        <div className="mt-6 text-center text-sm text-slate-600">{footer}</div>
      </div>
    </div>
  )
}
