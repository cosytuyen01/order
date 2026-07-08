import { useMemo, useState } from 'react'
import { Download, QrCode, Table2 } from 'lucide-react'
import DetailHero from '../components/detail/DetailHero'
import FloatButton from '../components/FloatButton'
import Modal from '../components/Modal'
import { useOwnerStore } from '../hooks/useOwnerStore'
import { useOrders } from '../hooks/useOrders'
import { useTableCarts } from '../hooks/useTableCarts'
import { HOME_BG } from '../utils/branding'
import { useTables } from '../hooks/useTables'
import { getQrCodeUrl, getTableMenuUrl } from '../utils/qr'
import { formatVnd } from '../utils/money'
import {
  ACTIVE_TABLE_ORDER_STATUSES,
  ORDER_STATUS_COLORS,
  ORDER_STATUS_LABELS,
  type Order,
  type OrderItem,
  type TableCart,
} from '../types/store'

const inputClass =
  'w-full rounded-2xl border border-border/60 bg-input-blue px-4 py-3 text-base text-text transition focus:ring-3 focus:ring-primary/15 focus:outline-none'

function OrderItemsList({ items }: { items: OrderItem[] }) {
  return (
    <ul className="space-y-1 text-sm text-text-muted">
      {items.map((item) => (
        <li key={`${item.productId}-${item.quantity}`}>
          {item.productName} × {item.quantity}
        </li>
      ))}
    </ul>
  )
}

function TableActivity({
  order,
  cart,
}: {
  order?: Order
  cart?: TableCart
}) {
  if (order) {
    const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0)

    return (
      <div className="mt-3 space-y-2 border-t border-border/50 pt-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-medium text-text-muted">
            {itemCount} món · Đã đặt
          </span>
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${ORDER_STATUS_COLORS[order.status]}`}
          >
            {ORDER_STATUS_LABELS[order.status]}
          </span>
        </div>
        <OrderItemsList items={order.items} />
        {order.customerNote && (
          <p className="rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-800">
            Ghi chú: {order.customerNote}
          </p>
        )}
        <p className="text-base font-bold text-primary">{formatVnd(order.total)}</p>
      </div>
    )
  }

  if (cart) {
    return (
      <div className="mt-3 space-y-2 border-t border-border/50 pt-3">
        <span className="text-xs font-semibold text-orange-600">
          {cart.itemCount} món · Đang chọn
        </span>
        <OrderItemsList items={cart.items} />
        {cart.customerNote && (
          <p className="rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-800">
            Ghi chú: {cart.customerNote}
          </p>
        )}
        <p className="text-base font-bold text-primary">{formatVnd(cart.total)}</p>
      </div>
    )
  }

  return (
    <p className="text-sm text-text-muted">Trống</p>
  )
}

export default function TablesPage() {
  const { store } = useOwnerStore()
  const { tables, loading, addTable, removeTable } = useTables(store?.id)
  const { orders } = useOrders(store?.id)
  const { cartsByTableId } = useTableCarts(store?.id)

  const [showForm, setShowForm] = useState(false)
  const [tableName, setTableName] = useState('')
  const [qrTableId, setQrTableId] = useState<string | null>(null)

  const activeOrdersByTable = useMemo(() => {
    const map = new Map<string, Order>()
    for (const order of orders) {
      if (!ACTIVE_TABLE_ORDER_STATUSES.includes(order.status)) continue
      if (!map.has(order.tableId)) {
        map.set(order.tableId, order)
      }
    }
    return map
  }, [orders])

  const selectedTable = tables.find((t) => t.id === qrTableId)
  const menuUrl =
    store && selectedTable
      ? getTableMenuUrl(store.id, selectedTable.id)
      : ''

  const handleAdd = async () => {
    if (!tableName.trim()) return
    await addTable(tableName)
    setTableName('')
    setShowForm(false)
  }

  return (
    <div>
      <DetailHero
        imageUrl={HOME_BG}
        imageAlt="Bàn"
        title="Quản lý bàn"
        subtitle={`${tables.length} bàn`}
        compact
      />

      <div className="space-y-3 px-4 pb-2">
      {loading ? (
        <div className="h-32 animate-pulse rounded-3xl bg-white/70" />
      ) : tables.length === 0 ? (
        <div className="card-modern p-6 text-center text-sm text-text-muted">
          Chưa có bàn. Nhấn + để thêm bàn và tạo mã QR.
        </div>
      ) : (
        <div className="space-y-3">
          {tables.map((table) => {
            const activeOrder = activeOrdersByTable.get(table.id)
            const liveCart = activeOrder ? undefined : cartsByTableId.get(table.id)
            const isBusy = Boolean(activeOrder || liveCart)

            return (
              <div key={table.id} className="card-modern p-4">
                <div className="flex items-start gap-3">
                  <div
                    className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-warning-bg text-primary"
                    aria-hidden
                  >
                    <Table2 className="h-6 w-6" strokeWidth={2} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-lg font-bold text-brown">{table.name}</p>
                      {isBusy && (
                        <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-semibold text-orange-700">
                          Đang đặt
                        </span>
                      )}
                    </div>
                    <TableActivity order={activeOrder} cart={liveCart} />
                  </div>

                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      onClick={() => setQrTableId(table.id)}
                      className="flex items-center gap-1 rounded-xl bg-primary/10 px-3 py-2 text-xs font-semibold text-primary"
                    >
                      <QrCode className="h-4 w-4" />
                      QR
                    </button>
                    <button
                      type="button"
                      onClick={() => removeTable(table.id)}
                      className="rounded-xl bg-red-50 px-3 py-2 text-xs font-semibold text-red-600"
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
      </div>

      <FloatButton onClick={() => setShowForm(true)} label="Thêm bàn" />

      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title="Thêm bàn"
      >
        <input
          className={inputClass}
          value={tableName}
          onChange={(e) => setTableName(e.target.value)}
          placeholder="Tên bàn (VD: Bàn 01)"
        />
        <button
          type="button"
          onClick={handleAdd}
          className="btn-primary mt-4 w-full"
        >
          Tạo bàn
        </button>
      </Modal>

      <Modal
        open={Boolean(qrTableId && selectedTable && store)}
        onClose={() => setQrTableId(null)}
        title={selectedTable?.name ?? 'Mã QR'}
        maxWidthClass="max-w-[320px]"
      >
        {selectedTable && store && (
          <>
            <img
              src={getQrCodeUrl(menuUrl, 220)}
              alt={`QR ${selectedTable.name}`}
              className="mx-auto rounded-2xl"
            />

            <p className="mt-3 break-all text-center text-xs text-text-muted">
              {menuUrl}
            </p>

            <a
              href={getQrCodeUrl(menuUrl, 512)}
              download={`qr-${selectedTable.name}.png`}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white"
            >
              <Download className="h-4 w-4" />
              Tải QR
            </a>
          </>
        )}
      </Modal>
    </div>
  )
}
