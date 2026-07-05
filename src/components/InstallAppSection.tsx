import { useState } from 'react'
import { Download, Smartphone } from 'lucide-react'
import { APP_LOGO } from '../utils/branding'
import { usePwaInstall } from '../hooks/usePwaInstall'

const cardClass = 'rounded-2xl bg-surface p-5 shadow-sm'

export default function InstallAppSection() {
  const { canInstall, isInstalled, isIos, installing, promptInstall } =
    usePwaInstall()
  const [message, setMessage] = useState('')
  const [showIosGuide, setShowIosGuide] = useState(false)

  const handleInstall = async () => {
    setMessage('')

    if (isInstalled) {
      setMessage('App đã được cài trên máy.')
      return
    }

    if (canInstall) {
      const accepted = await promptInstall()
      setMessage(
        accepted
          ? 'Đã cài app thành công!'
          : 'Bạn có thể cài lại bất cứ lúc nào.',
      )
      return
    }

    if (isIos) {
      setShowIosGuide(true)
      return
    }

    setMessage(
      'Mở menu trình duyệt (⋮) → Cài đặt ứng dụng / Thêm vào Màn hình chính.',
    )
  }

  return (
    <section className={cardClass}>
      <div className="flex items-center gap-3">
        <img
          src={APP_LOGO}
          alt="Chào Mào"
          className="h-12 w-12 rounded-xl object-cover shadow-sm"
        />
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-text">Tải app về máy</h3>
          <p className="text-sm text-text-muted">
            Cài bản web để mở nhanh và nhận thông báo tốt hơn.
          </p>
        </div>
      </div>

      {isInstalled ? (
        <p className="mt-4 rounded-xl bg-success/10 px-3 py-2 text-sm text-success">
          App đã được cài trên máy. Mở từ icon trên Màn hình chính.
        </p>
      ) : (
        <button
          type="button"
          onClick={handleInstall}
          disabled={installing}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:opacity-60"
        >
          <Download className="h-4 w-4" strokeWidth={2} />
          {installing ? 'Đang cài...' : 'Tải app'}
        </button>
      )}

      {showIosGuide && !isInstalled && (
        <div className="mt-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-text-muted">
          <p className="font-medium text-primary">
            <Smartphone className="mr-1 inline h-4 w-4 -translate-y-px" />
            Hướng dẫn iPhone
          </p>
          <ol className="mt-2 list-decimal space-y-1 pl-4">
            <li>Mở Safari, vào trang app</li>
            <li>Nhấn nút Chia sẻ (hình vuông + mũi tên)</li>
            <li>Chọn <strong>Thêm vào Màn hình chính</strong></li>
            <li>Nhấn <strong>Thêm</strong></li>
          </ol>
        </div>
      )}

      {message && !isInstalled && (
        <p className="mt-3 rounded-xl bg-primary/8 px-3 py-2 text-sm text-primary">
          {message}
        </p>
      )}
    </section>
  )
}
