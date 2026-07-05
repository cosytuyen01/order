import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DetailHero from '../components/detail/DetailHero'
import SectionHeader from '../components/SectionHeader'
import { Wheat } from '../components/icons'
import { useAuth } from '../context/AuthContext'
import { useBirds } from '../hooks/useBirds'
import { HOME_BG } from '../utils/branding'

const labelClass = 'flex flex-col gap-1.5 text-sm font-medium text-text-muted'
const inputClass =
  'w-full rounded-2xl border border-border/60 bg-input-blue px-4 py-3 text-base text-text transition focus:ring-3 focus:ring-primary/15 focus:outline-none'

export default function AddBirdPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { addBird } = useBirds(user?.uid)

  const [name, setName] = useState('')
  const [seasons, setSeasons] = useState('0')
  const [pellets, setPellets] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const seasonsNum = Number(seasons)
  const seasonHint =
    seasons === '' || Number.isNaN(seasonsNum)
      ? ''
      : seasonsNum === 0
        ? '→ Hiển thị: Bổi rừng'
        : `→ Hiển thị: ${seasonsNum} mùa`

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!name.trim()) {
      setError('Vui lòng nhập tên Chiến binh.')
      return
    }

    if (Number.isNaN(seasonsNum) || seasonsNum < 0) {
      setError('Số mùa phải là số từ 0 trở lên.')
      return
    }

    if (!user) return

    setSubmitting(true)
    try {
      await addBird(name.trim(), seasonsNum, user.uid, pellets)
      navigate(-1)
    } catch {
      setError('Không thể thêm chiến binh. Vui lòng thử lại.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="bg-page">
      <DetailHero
        imageUrl={HOME_BG}
        imageAlt="Thêm chiến binh"
        title="Thêm chiến binh"
        subtitle="Thêm chiến binh mới"
      />

      <div className="relative z-10 px-4 pb-2">
        <form
          onSubmit={handleSubmit}
          className="card-modern -mt-30 flex flex-col gap-4 p-5 "
        >
          <SectionHeader title="Thông tin chiến binh" className="!mb-0" />

          <label className={labelClass}>
            Tên Chiến binh
            <input
              type="text"
              className={inputClass}
              placeholder="VD: Bổi Mặn, Bổi Chay,.."
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              required
            />
          </label>

          <label className={labelClass}>
            Số mùa
            <input
              type="number"
              min={0}
              className={inputClass}
              placeholder="0"
              value={seasons}
              onChange={(e) => setSeasons(e.target.value)}
            />
            {seasonHint && (
              <span className="text-xs font-normal text-primary">{seasonHint}</span>
            )}
          </label>

          <label className={labelClass}>
            <span className="inline-flex items-center gap-1.5 text-text-muted">
              <Wheat className="h-4 w-4 text-primary" strokeWidth={2} />
              Cám đang dùng
            </span>
            <input
              type="text"
              className={inputClass}
              placeholder="VD: Văn Toại 2N1, Thiên Điểu Ca..."
              value={pellets}
              onChange={(e) => setPellets(e.target.value)}
            />
          </label>

          <p className="text-xs text-text-muted">
            Nhập <strong>0</strong> nếu Chiến binh là <strong>bổi rừng</strong>.
          </p>

          {error && (
            <p className="rounded-2xl bg-primary/8 px-4 py-2.5 text-sm text-primary">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary w-full disabled:opacity-60"
          >
            {submitting ? 'Đang lưu...' : 'Thêm chiến binh'}
          </button>
        </form>
      </div>
    </div>
  )
}
