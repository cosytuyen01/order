import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Wheat } from '../components/icons'
import BirdDetailHero from '../components/bird-detail/BirdDetailHero'
import BirdProfileCard from '../components/bird-detail/BirdProfileCard'
import BirdRecordsTab from '../components/bird-detail/BirdRecordsTab'
import BirdScheduleTab from '../components/bird-detail/BirdScheduleTab'
import DetailTabs, { type DetailTab } from '../components/bird-detail/DetailTabs'
import { useBirdRecords } from '../hooks/useBirdRecords'
import { useBirds } from '../hooks/useBirds'
import { DEFAULT_BIRD_IMAGE } from '../utils/bird'

const labelClass = 'flex flex-col gap-2 text-sm font-medium text-text-muted'
const inputClass =
  'rounded-2xl border border-border/60 bg-input-blue px-4 py-3 text-base text-text focus:ring-3 focus:ring-primary/15 focus:outline-none'

const TAB_PARAM_MAP: Record<string, DetailTab> = {
  info: 'info',
  'thong-tin': 'info',
  schedule: 'schedule',
  'che-do': 'schedule',
  records: 'records',
  'nhat-ky': 'records',
}

function parseTabParam(value: string | null): DetailTab {
  if (!value) return 'info'
  return TAB_PARAM_MAP[value] ?? 'info'
}

export default function BirdDetailPage() {
  const { birdId } = useParams<{ birdId: string }>()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { user } = useAuth()
  const { birds, loading, updateBird, removeBird } = useBirds(user?.uid)
  const { records } = useBirdRecords(user?.uid, birdId)

  const bird = birds.find((b) => b.id === birdId)
  const [activeTab, setActiveTab] = useState<DetailTab>(() =>
    parseTabParam(searchParams.get('tab')),
  )

  const [name, setName] = useState('')
  const [seasons, setSeasons] = useState('0')
  const [pellets, setPellets] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const stats = useMemo(
    () => ({
      matches: records.filter((r) => r.type === 'di-thi').length,
      awards: records.filter((r) => r.type === 'di-thi' && r.notes.trim()).length,
      journals: records.length,
      likes: 0,
    }),
    [records],
  )

  useEffect(() => {
    if (!bird) return
    setName(bird.name)
    setSeasons(String(bird.seasons))
    setPellets(bird.pellets)
  }, [bird])

  useEffect(() => {
    const nextTab = parseTabParam(searchParams.get('tab'))
    setActiveTab(nextTab)
  }, [searchParams])

  const handleTabChange = (tab: DetailTab) => {
    setActiveTab(tab)
    setSearchParams(tab === 'info' ? {} : { tab }, { replace: true })
  }

  if (loading) {
    return (
      <div className="px-4 py-12 text-center text-text-muted">Đang tải...</div>
    )
  }

  if (!bird || !birdId) {
    return (
      <div className="mx-4 mt-8 rounded-3xl bg-surface p-8 text-center shadow-sm">
        <p className="font-medium text-text">Không tìm thấy Chiến binh</p>
        <Link to="/birds" className="mt-4 inline-block text-sm text-primary">
          ← Quay lại
        </Link>
      </div>
    )
  }

  const seasonsNum = Number(seasons)
  const seasonHint =
    seasons === '' || Number.isNaN(seasonsNum)
      ? ''
      : seasonsNum === 0
        ? '→ Bổi rừng'
        : `→ ${seasonsNum} mùa`

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setMessage('')

    if (!name.trim()) {
      setError('Vui lòng nhập tên Chiến binh.')
      return
    }
    if (Number.isNaN(seasonsNum) || seasonsNum < 0) {
      setError('Số mùa phải là số từ 0 trở lên.')
      return
    }

    setSaving(true)
    try {
      await updateBird(bird.id, {
        name: name.trim(),
        seasons: seasonsNum,
        pellets: pellets.trim(),
      })
      setMessage('Đã lưu thông tin Chiến binh!')
      setTimeout(() => setMessage(''), 3000)
    } catch {
      setError('Không thể lưu. Vui lòng thử lại.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm(`Xóa ${bird.name}?`)) return
    await removeBird(bird.id)
    navigate('/birds')
  }

  const displayName = name.trim() || bird.name

  return (
    <div className="bg-page">
      <BirdDetailHero
        imageUrl={DEFAULT_BIRD_IMAGE}
        birdName={displayName}
        activeTab={activeTab}
      />

      <div className="relative z-10 space-y-4 px-4 pb-2">
        <BirdProfileCard bird={{ ...bird, name: displayName }} stats={stats} />

        <DetailTabs active={activeTab} onChange={handleTabChange} />

        {activeTab === 'info' && (
          <form onSubmit={handleSave} className="card-modern space-y-4 p-5">
            <h3 className="text-lg font-bold text-text">Chỉnh sửa thông tin</h3>

            <label className={labelClass}>
              Tên Chiến binh
              <input
                type="text"
                className={inputClass}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="VD: Bổi Mặn, Bổi Chay,.."
                required
              />
            </label>

            <label className={labelClass}>
              Số mùa
              <input
                type="number"
                min={0}
                className="rounded-2xl border border-border/60 bg-input-beige px-4 py-3 text-base text-text focus:ring-3 focus:ring-primary/15 focus:outline-none"
                value={seasons}
                onChange={(e) => setSeasons(e.target.value)}
              />
              <span className="text-xs font-normal text-primary">{seasonHint}</span>
            </label>

            <label className={labelClass}>
              <span className="inline-flex items-center gap-1.5">
                <Wheat className="h-4 w-4 text-primary" strokeWidth={2} />
                Cám đang dùng
              </span>
              <input
                type="text"
                className={inputClass}
                value={pellets}
                onChange={(e) => setPellets(e.target.value)}
                placeholder="VD: Thiên Điểu Ca, Hiển Long..."
              />
            </label>

            {error && (
              <p className="rounded-xl bg-primary/8 px-3 py-2 text-sm text-primary">
                {error}
              </p>
            )}
            {message && (
              <p className="rounded-xl bg-success/10 px-3 py-2 text-sm text-success">
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={saving}
              className="btn-primary w-full disabled:opacity-60"
            >
              {saving ? 'Đang lưu...' : 'Lưu thông tin'}
            </button>

            <button
              type="button"
              onClick={handleDelete}
              className="w-full rounded-2xl py-3 text-sm font-medium text-primary/80 transition hover:bg-primary/5"
            >
              Xóa Chiến binh
            </button>
          </form>
        )}

        {activeTab === 'schedule' && (
          <BirdScheduleTab birdId={birdId} birdName={displayName} />
        )}

        {activeTab === 'records' && (
          <BirdRecordsTab birdId={birdId} birdName={displayName} />
        )}
      </div>
    </div>
  )
}
