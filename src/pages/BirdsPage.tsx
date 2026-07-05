import { useNavigate } from 'react-router-dom'
import { Bird } from '../components/icons'
import { useAuth } from '../context/AuthContext'
import BirdCard from '../components/BirdCard'
import FloatButton from '../components/FloatButton'
import { useBirds } from '../hooks/useBirds'

export default function BirdsPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { birds, loading, removeBird } = useBirds(user?.uid)

  const handleDelete = async (id: string) => {
    if (!confirm('Xóa Chiến binh này?')) return
    await removeBird(id)
  }

  return (
    <div className="pb-4">
      <p className="mb-4 text-sm font-medium text-text-muted">
        {birds.length} chiến binh
      </p>

      {loading ? (
        <div className="grid grid-cols-2 gap-3.5">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="aspect-[3/4] animate-pulse rounded-3xl bg-white/70"
            />
          ))}
        </div>
      ) : birds.length === 0 ? (
        <div className="card-modern p-10 text-center">
          <Bird className="mx-auto h-14 w-14 text-primary/40" strokeWidth={1.5} />
          <p className="mt-3 font-bold text-text">Chưa có Chiến binh nào</p>
          <p className="mt-1 text-sm text-text-muted">
            Nhấn nút + góc dưới để thêm chiến binh
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3.5">
          {birds.map((bird) => (
            <BirdCard key={bird.id} bird={bird} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {!loading && (
        <FloatButton
          onClick={() => navigate('/birds/new')}
          label="Thêm chiến binh"
        />
      )}
    </div>
  )
}
