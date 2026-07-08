import { useMemo, useState } from 'react'
import { Check,
  Clock,
  MessageSquare,
} from 'lucide-react'
import DetailHero from '../components/detail/DetailHero'
import ProductThumb from '../components/ProductThumb'
import { useOwnerStore } from '../hooks/useOwnerStore'
import { useOrders } from '../hooks/useOrders'
import { formatVnd } from '../utils/money'
import {
  ORDER_STATUS_COLORS,
  ORDER_STATUS_LABELS,
  type Order,
  type OrderStatus,
} from '../types/store'

const FILTERS: { id: 'all' | OrderStatus; label: string }[] = [
  { id: 'all', label: 'Tất cả' },
  { id: 'pending', label: 'Chờ xử lý' },
  { id: 'confirmed', label: 'Đã nhận' },
  { id: 'preparing', label: 'Đang làm' },
  { id: 'done', label: 'Hoàn thành' },
  { id: 'paid', label: 'Đã thanh toán' },
]

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  pending: 'confirmed',
  confirmed: 'preparing',
  preparing: 'done',
  done: 'paid',
}

function formatOrderCode(index: number) {
  return `#${String(index + 1).padStart(3, '0')}`
}

function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${ORDER_STATUS_COLORS[status]}`}
    >
      {status === 'pending' && <Clock className="h-3 w-3" />}
      {status === 'paid' && <Check className="h-3 w-3" />}
      {ORDER_STATUS_LABELS[status]}
    </span>
  )
}

function OrderCard({
  order,
  orderCode,
  onAdvance,
  onCancel,
}: {
  order: Order
  orderCode: string
  onAdvance: () => void
  onCancel: () => void
}) {
  const next = NEXT_STATUS[order.status]
  const isPaid = order.status === 'paid'
  const created = new Date(order.createdAt)

  return (
    <article className="card-modern overflow-hidden">
      <div className="flex items-start justify-between gap-2 p-4 pb-3">
        <div className="flex items-start gap-2">
          <span className="rounded-lg bg-warning-bg px-2 py-1 text-xs font-bold text-primary">
            {orderCode}
          </span>
          <div>
            <p className="font-semibold text-brown">{order.tableName}</p>
            <p className="text-xs text-text-muted">
              {created.toLocaleTimeString('vi-VN')} • {created.toLocaleDateString('vi-VN')}
            </p>
          </div>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className="space-y-3 px-4 pb-3">
        {order.items.map((item) => (
          <div key={`${order.id}-${item.productId}`} className="flex gap-3">
            <ProductThumb name={item.productName} size="md" />
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-brown">
                {item.productName}{' '}
                <span className="font-normal text-text-muted">x {item.quantity}</span>
              </p>
              <p className="text-sm text-text-muted">
                {formatVnd(item.price)} / món
              </p>
            </div>
          </div>
        ))}
      </div>

      {order.customerNote && (
        <div className="mx-4 mb-3 flex items-start gap-2 rounded-xl bg-success-bg px-3 py-2.5 text-sm text-success">
          <MessageSquare className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2} />
          <span>
            <span className="font-semibold">Ghi chú:</span> {order.customerNote}
          </span>
        </div>
      )}

      <div className="border-t border-border/60 p-4">
        <div className="mb-3 flex items-end justify-between">
          <span className="text-sm text-text-muted">Tổng tiền</span>
          <span
            className={`text-xl font-bold ${isPaid ? 'text-success' : 'text-primary'}`}
          >
            {formatVnd(order.total)}
          </span>
        </div>

        <div className="flex gap-2">
          {order.status !== 'cancelled' && order.status !== 'paid' && (
            <button type="button" onClick={onCancel} className="btn-outline flex-1">
              Hủy đơn
            </button>
          )}
          {next && (
            <button
              type="button"
              onClick={onAdvance}
              className="btn-primary flex flex-1 items-center justify-center gap-1.5"
            >
              <Check className="h-4 w-4" />
              {ORDER_STATUS_LABELS[next]}
            </button>
          )}
        </div>
      </div>
    </article>
  )
}

export default function OrdersPage() {
  const { store } = useOwnerStore()
  const { orders, loading, updateOrderStatus } = useOrders(store?.id)
  const [filter, setFilter] = useState<'all' | OrderStatus>('all')

  const orderIndexMap = useMemo(() => {
    const sorted = [...orders].sort((a, b) =>
      a.createdAt.localeCompare(b.createdAt),
    )
    return new Map(sorted.map((order, index) => [order.id, index]))
  }, [orders])

  const filtered = useMemo(
    () =>
      filter === 'all' ? orders : orders.filter((o) => o.status === filter),
    [orders, filter],
  )

  return (
    <div>
      <DetailHero
        imageAlt="Đơn hàng"
        title="Đơn hàng"
        subtitle={store?.name ?? ''}
        showBack={false}
        footer={
          <div className="section-scroll">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilter(f.id)}
                className={[
                  'filter-pill',
                  filter === f.id ? 'filter-pill-active' : '',
                ].join(' ')}
              >
                {f.label}
              </button>
            ))}
          </div>
        }
      />

      <div className="space-y-4 px-4 pb-2 pt-3">
        {loading ? (
          <div className="h-32 animate-pulse rounded-2xl bg-white/70" />
        ) : filtered.length === 0 ? (
          <div className="card-modern p-8 text-center text-sm text-text-muted">
            Không có đơn hàng
          </div>
        ) : (
          filtered.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              orderCode={formatOrderCode(orderIndexMap.get(order.id) ?? 0)}
              onAdvance={() => {
                const next = NEXT_STATUS[order.status]
                if (next) updateOrderStatus(order.id, next)
              }}
              onCancel={() => updateOrderStatus(order.id, 'cancelled')}
            />
          ))
        )}
      </div>
    </div>
  )
}
