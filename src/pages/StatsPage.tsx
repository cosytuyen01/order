import { useMemo } from 'react'
import { ClipboardList, ShoppingBag, UtensilsCrossed } from 'lucide-react'
import DetailHero from '../components/detail/DetailHero'
import { useOwnerStore } from '../hooks/useOwnerStore'
import { useOrders } from '../hooks/useOrders'
import { useCategories } from '../hooks/useCategories'
import { useProducts } from '../hooks/useProducts'
import { useTables } from '../hooks/useTables'
import { HOME_BG } from '../utils/branding'
import { formatVnd } from '../utils/money'

function StatItem({
  label,
  value,
  icon: Icon,
}: {
  label: string
  value: string
  icon: typeof ShoppingBag
}) {
  return (
    <div className="card-modern flex flex-col gap-2 p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-text-muted">{label}</span>
        <Icon className="h-4 w-4 text-primary" strokeWidth={2} />
      </div>
      <p className="text-lg font-bold text-brown">{value}</p>
    </div>
  )
}

export default function StatsPage() {
  const { store } = useOwnerStore()
  const { orders } = useOrders(store?.id)
  const { categories } = useCategories(store?.id)
  const { products } = useProducts(store?.id)
  const { tables } = useTables(store?.id)

  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0]
    const todayOrders = orders.filter((o) => o.createdAt.startsWith(today))
    const paidOrders = orders.filter((o) => o.status === 'paid')
    const todayRevenue = todayOrders
      .filter((o) => o.status !== 'cancelled')
      .reduce((sum, o) => sum + o.total, 0)
    const totalRevenue = paidOrders.reduce((sum, o) => sum + o.total, 0)
    const pendingCount = orders.filter((o) => o.status === 'pending').length

    return {
      todayOrders: todayOrders.length,
      todayRevenue,
      totalOrders: orders.length,
      totalRevenue,
      pendingCount,
    }
  }, [orders])

  return (
    <div className="space-y-4">
      <DetailHero
        imageUrl={HOME_BG}
        imageAlt="Thống kê"
        title="Thống kê"
        subtitle={store?.name ?? 'Cửa hàng'}
      />

      <div className="grid grid-cols-2 gap-3 px-4 pb-2">
        <StatItem
          label="Đơn hôm nay"
          value={String(stats.todayOrders)}
          icon={ClipboardList}
        />
        <StatItem
          label="Doanh thu hôm nay"
          value={formatVnd(stats.todayRevenue)}
          icon={ShoppingBag}
        />
        <StatItem
          label="Tổng đơn"
          value={String(stats.totalOrders)}
          icon={ClipboardList}
        />
        <StatItem
          label="Đã thanh toán"
          value={formatVnd(stats.totalRevenue)}
          icon={ShoppingBag}
        />
        <StatItem
          label="Chờ xử lý"
          value={String(stats.pendingCount)}
          icon={ClipboardList}
        />
        <StatItem
          label="Bàn / Món"
          value={`${tables.length} / ${products.length}`}
          icon={UtensilsCrossed}
        />
      </div>
      <p className="-mt-2 px-4 pb-2 text-center text-xs text-text-muted">
        {categories.length} danh mục
      </p>
    </div>
  )
}
