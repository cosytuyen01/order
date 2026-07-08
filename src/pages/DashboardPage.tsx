import { Link } from 'react-router-dom'
import { ClipboardList, ShoppingBag, UtensilsCrossed } from 'lucide-react'
import SectionHeader from '../components/SectionHeader'
import { useOwnerStore } from '../hooks/useOwnerStore'
import { useOrders } from '../hooks/useOrders'
import { useCategories } from '../hooks/useCategories'
import { useProducts } from '../hooks/useProducts'
import { useTables } from '../hooks/useTables'
import { formatVnd } from '../utils/money'
import {
  ORDER_STATUS_COLORS,
  ORDER_STATUS_LABELS,
  type Order,
} from '../types/store'

function StatCard({
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
      <p className="text-xl font-bold text-text">{value}</p>
    </div>
  )
}

function OrderCard({
  order,
  onConfirm,
}: {
  order: Order
  onConfirm: (id: string) => void
}) {
  return (
    <div className="card-modern p-4">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-text">{order.tableName}</p>
          <p className="text-xs text-text-muted">
            {new Date(order.createdAt).toLocaleString('vi-VN')}
          </p>
        </div>
        <span
          className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${ORDER_STATUS_COLORS[order.status]}`}
        >
          {ORDER_STATUS_LABELS[order.status]}
        </span>
      </div>

      <ul className="mb-3 space-y-1 text-sm text-text-muted">
        {order.items.map((item) => (
          <li key={item.productId}>
            {item.productName} × {item.quantity}
          </li>
        ))}
      </ul>

      <div className="flex items-center justify-between">
        <span className="font-bold text-primary">{formatVnd(order.total)}</span>
        {order.status === 'pending' && (
          <button
            type="button"
            onClick={() => onConfirm(order.id)}
            className="rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-white"
          >
            Nhận đơn
          </button>
        )}
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { store, loading: storeLoading } = useOwnerStore()
  const { orders, loading: ordersLoading, updateOrderStatus } = useOrders(
    store?.id,
  )
  const { categories } = useCategories(store?.id)
  const { products } = useProducts(store?.id)
  const { tables } = useTables(store?.id)

  const today = new Date().toISOString().split('T')[0]
  const todayOrders = orders.filter((o) => o.createdAt.startsWith(today))
  const todayRevenue = todayOrders
    .filter((o) => o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.total, 0)
  const pendingOrders = orders.filter((o) => o.status === 'pending')

  if (storeLoading) {
    return <div className="h-40 animate-pulse rounded-3xl bg-white/70" />
  }

  if (!store) {
    return (
      <div className="card-modern p-6 text-center">
        <p className="text-text-muted">Chưa tìm thấy cửa hàng.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          label="Đơn hôm nay"
          value={String(todayOrders.length)}
          icon={ClipboardList}
        />
        <StatCard
          label="Doanh thu hôm nay"
          value={formatVnd(todayRevenue)}
          icon={ShoppingBag}
        />
        <StatCard
          label="Danh mục / Món"
          value={`${categories.length} / ${products.length}`}
          icon={UtensilsCrossed}
        />
        <StatCard
          label="Số bàn"
          value={String(tables.length)}
          icon={UtensilsCrossed}
        />
      </div>

      <section>
        <SectionHeader
          title="Đơn mới"
          linkTo="/orders"
          linkLabel="Xem tất cả"
        />

        {ordersLoading ? (
          <div className="h-32 animate-pulse rounded-3xl bg-white/70" />
        ) : pendingOrders.length === 0 ? (
          <div className="card-modern p-6 text-center text-sm text-text-muted">
            Chưa có đơn mới
          </div>
        ) : (
          <div className="space-y-3">
            {pendingOrders.slice(0, 5).map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onConfirm={(id) => updateOrderStatus(id, 'confirmed')}
              />
            ))}
          </div>
        )}
      </section>

      <div className="grid grid-cols-2 gap-3">
        <Link to="/menu-management" className="card-modern p-4 text-center text-sm font-semibold text-primary">
          Quản lý menu →
        </Link>
        <Link to="/tables" className="card-modern p-4 text-center text-sm font-semibold text-primary">
          Quản lý bàn →
        </Link>
      </div>
    </div>
  )
}
