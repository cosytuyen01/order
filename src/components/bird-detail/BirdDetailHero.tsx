import { useNavigate } from 'react-router-dom'
import { ChevronLeft } from '../icons'
import type { DetailTab } from './DetailTabs'

const TAB_SUBTITLES: Record<DetailTab, string> = {
  info: 'Thông tin chiến binh',
  schedule: 'Chế độ chiến binh',
  records: 'Nhật ký chiến binh',
}

interface BirdDetailHeroProps {
  imageUrl: string
  birdName: string
  activeTab: DetailTab
}

export default function BirdDetailHero({
  imageUrl,
  birdName,
  activeTab,
}: BirdDetailHeroProps) {
  const navigate = useNavigate()

  return (
    <div className="relative h-52 overflow-hidden">
      <img
        src={imageUrl}
        alt={birdName}
        className="absolute inset-0 h-full w-full object-cover object-top"
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/45 via-black/20 to-black/55"
        aria-hidden
      />

      <div className="relative flex h-full flex-col justify-between px-4 pb-14 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="Quay lại"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md transition hover:bg-white/30"
        >
          <ChevronLeft className="h-6 w-6" strokeWidth={2} />
        </button>

        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white drop-shadow-md">
            Chi tiết chiến binh
          </h1>
          <p className="mt-0.5 text-sm text-white/85 drop-shadow-sm">
            {TAB_SUBTITLES[activeTab]}
          </p>
        </div>
      </div>
    </div>
  )
}
