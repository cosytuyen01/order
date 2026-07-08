import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  ChevronRight,
  Clock3,
  Minus,
  Plus,
  Share2,
  ShoppingCart,
  UtensilsCrossed,
} from 'lucide-react'
import ProductThumb from '../components/ProductThumb'
import StoreLogo from '../components/StoreLogo'
import LoadingScreen from '../components/LoadingScreen'
import Modal from '../components/Modal'
import { CartProvider, useCart } from '../context/CartContext'
import { useStoreById } from '../hooks/useStore'
import { useTableById } from '../hooks/useTables'
import { useCategories } from '../hooks/useCategories'
import { useProducts } from '../hooks/useProducts'
import { createOrder } from '../hooks/useOrders'
import { clearTableCart, useSyncTableCart } from '../hooks/useTableCarts'
import { logStoreEvent } from '../hooks/useStoreEvents'
import { formatVnd } from '../utils/money'
import { HOME_BG } from '../utils/branding'
import { getTableMenuUrl } from '../utils/qr'

interface LocalPlacedOrder {
  id: string
  createdAt: string
  items: Array<{
    productName: string
    quantity: number
  }>
  total: number
}

function CustomerMenuContent() {
  const { storeId = '', tableId = '' } = useParams()
  const { store, loading: storeLoading } = useStoreById(storeId)
  const { table, loading: tableLoading } = useTableById(tableId)
  const { categories, loading: categoriesLoading } = useCategories(storeId)
  const { products, loading: productsLoading } = useProducts(storeId)
  const { items, totalItems, totalPrice, addItem, updateQuantity, clearCart } =
    useCart()

  const [showCart, setShowCart] = useState(false)
  const [customerNote, setCustomerNote] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [orderSuccess, setOrderSuccess] = useState(false)
  const [placedOrders, setPlacedOrders] = useState<LocalPlacedOrder[]>([])

  const loading =
    storeLoading || tableLoading || categoriesLoading || productsLoading

  useSyncTableCart(
    store?.id,
    table?.id,
    table?.name,
    items,
    customerNote,
    totalPrice,
  )

  useEffect(() => {
    if (!store || !table) return

    const qrKey = `qr_scan_${store.id}_${table.id}`
    if (sessionStorage.getItem(qrKey)) return

    sessionStorage.setItem(qrKey, '1')
    void logStoreEvent({
      storeId: store.id,
      tableId: table.id,
      tableName: table.name,
      type: 'qr_scan',
      title: `${table.name} vừa quét QR`,
      body: 'Khách đang xem menu',
    })
  }, [store, table])

  useEffect(() => {
    if (!store || !table || totalItems === 0) return

    const cartKey = `cart_notify_${store.id}_${table.id}`
    if (sessionStorage.getItem(cartKey)) return

    const timer = window.setTimeout(() => {
      const summary = items
        .map((item) => `${item.product.name} ×${item.quantity}`)
        .join(', ')

      sessionStorage.setItem(cartKey, '1')
      void logStoreEvent({
        storeId: store.id,
        tableId: table.id,
        tableName: table.name,
        type: 'cart_update',
        title: `${table.name} đang chọn món`,
        body: summary,
        itemCount: totalItems,
      })
    }, 1000)

    return () => window.clearTimeout(timer)
  }, [store, table, totalItems, items])

  useEffect(() => {
    if (!store || !table) return
    const historyKey = `placed_orders_${store.id}_${table.id}`
    try {
      const raw = sessionStorage.getItem(historyKey)
      if (!raw) {
        setPlacedOrders([])
        return
      }
      const parsed = JSON.parse(raw) as LocalPlacedOrder[]
      setPlacedOrders(Array.isArray(parsed) ? parsed : [])
    } catch {
      setPlacedOrders([])
    }
  }, [store, table])

  if (loading) return <LoadingScreen message="Đang tải menu..." />

  if (!store || !table) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6 text-center">
        <p className="text-text-muted">Không tìm thấy cửa hàng hoặc bàn.</p>
      </div>
    )
  }

  const activeCategories = categories.filter((c) => c.status === 'active')
  const activeProducts = products.filter((p) => p.status === 'active')

  const handleSubmitOrder = async () => {
    if (items.length === 0 || submitting) return
    setSubmitting(true)
    try {
      await createOrder({
        storeId: store.id,
        tableId: table.id,
        tableName: table.name,
        items: items.map((i) => ({
          productId: i.product.id,
          productName: i.product.name,
          price: i.product.price,
          quantity: i.quantity,
        })),
        customerNote,
        total: totalPrice,
      })
      const nextPlacedOrder: LocalPlacedOrder = {
        id: `local_${Date.now()}`,
        createdAt: new Date().toISOString(),
        items: items.map((i) => ({
          productName: i.product.name,
          quantity: i.quantity,
        })),
        total: totalPrice,
      }
      const nextHistory = [nextPlacedOrder, ...placedOrders].slice(0, 10)
      setPlacedOrders(nextHistory)
      sessionStorage.setItem(
        `placed_orders_${store.id}_${table.id}`,
        JSON.stringify(nextHistory),
      )
      await clearTableCart(table.id)
      clearCart()
      setCustomerNote('')
      setShowCart(false)
      setOrderSuccess(true)
      setTimeout(() => setOrderSuccess(false), 4000)
    } finally {
      setSubmitting(false)
    }
  }

  const handleShare = async () => {
    const shareUrl = getTableMenuUrl(store.id, table.id)
    const shareText = `Menu ${store.name} - ${table.name}`
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${store.name} - Đặt món`,
          text: shareText,
          url: shareUrl,
        })
        return
      }
      await navigator.clipboard.writeText(shareUrl)
      alert('Đã sao chép link đặt món.')
    } catch {
      // User canceled share or browser denied clipboard.
    }
  }

  return (
    <div className="relative min-h-screen pb-28">
      <div
        className="pointer-events-none absolute inset-0 bg-cover bg-top bg-no-repeat"
        style={{ backgroundImage: `url(${HOME_BG})` }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#fdf8f3]/30 via-transparent to-transparent"
        aria-hidden
      />

      <header className="relative z-10 px-4 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <div
          className="overflow-hidden rounded-3xl border border-border/70 bg-white px-3.5 py-3 text-brown shadow-[var(--shadow-card)]"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2.5">
              <StoreLogo
                logoUrl={store.logoUrl}
                name={store.name}
                size="sm"
              />
              <div className="min-w-0 flex-1">
                <h1 className="truncate text-xl font-bold text-brown">{store.name}</h1>
                <p className="truncate text-xs text-text-muted">
                  {store.address || 'Chưa có địa chỉ'}
                </p>
                <div className="mt-2 inline-flex items-center gap-1 rounded-lg bg-warning-bg px-2 py-1 text-xs font-semibold text-brown">
                  <UtensilsCrossed className="h-3.5 w-3.5 text-primary" />
                  Bàn: {table.name}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={handleShare}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border/70 bg-white text-brown shadow-sm"
              aria-label="Chia sẻ link đặt món"
            >
              <Share2 className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>
      </header>

      {orderSuccess && (
        <div className="mx-4 mt-4 rounded-2xl bg-emerald-50 px-4 py-3 text-center text-sm font-semibold text-emerald-700">
          Đã gửi đơn! Nhân viên sẽ xác nhận sớm.
        </div>
      )}

      <main className="relative z-10 space-y-5 px-4 py-4">
        {placedOrders.length > 0 && (
          <section className="card-modern overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-warning-bg text-primary">
                  <ShoppingCart className="h-4 w-4" />
                </div>
                <h2 className="text-sm font-bold text-brown">Món đã đặt của bàn này</h2>
              </div>
              <span className="inline-flex items-center gap-1 text-xs text-text-muted">
                {placedOrders.length} đơn gần nhất
                <ChevronRight className="h-3.5 w-3.5" />
              </span>
            </div>
            <div className="border-t border-border/60 px-4 py-3">
              {placedOrders.slice(0, 1).map((order) => (
                <div key={order.id} className="rounded-xl bg-input-beige px-3 py-2.5">
                  <div className="flex items-start gap-3">
                    <div className="flex items-center gap-1 text-sm text-brown-light">
                      <Clock3 className="h-4 w-4" />
                      {new Date(order.createdAt).toLocaleTimeString('vi-VN')}
                    </div>
                    <div className="min-w-0 flex-1 border-l border-border/80 pl-3">
                      <p className="text-sm text-brown">
                        {order.items
                          .map((item) => `${item.productName} x ${item.quantity}`)
                          .join(', ')}
                      </p>
                      <p className="mt-1 text-xl font-bold text-primary">
                        {formatVnd(order.total)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {activeCategories.length === 0 ? (
          <p className="text-center text-sm text-text-muted">
            Cửa hàng chưa có menu.
          </p>
        ) : (
          activeCategories.map((cat) => {
            const catProducts = activeProducts.filter(
              (p) => p.categoryId === cat.id,
            )
            if (catProducts.length === 0) return null
            return (
              <section key={cat.id}>
                <div className="mb-3 flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border border-border/70 bg-white text-primary">
                    <UtensilsCrossed className="h-4 w-4" />
                  </div>
              <h2 className="text-xl font-bold text-brown">{cat.name}</h2>
                </div>
                <div className="space-y-3">
                  {catProducts.map((product) => (
                    <div key={product.id} className="card-modern flex items-center gap-3 px-3 py-2">
                      <ProductThumb
                        imageUrl={product.imageUrl}
                        name={product.name}
                        size="sm"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-brown">{product.name}</p>
                        {product.description && (
                          <p className="mt-0.5 text-xs text-text-muted">
                            {product.description}
                          </p>
                        )}
                        <p className="mt-0.5 text-base font-bold text-primary">
                          {formatVnd(product.price)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => addItem(product)}
                        className="flex h-10 w-10 shrink-0 items-center justify-center self-center rounded-xl bg-primary text-white shadow-[0_4px_12px_rgba(211,112,45,0.3)]"
                      >
                        <Plus className="h-4.5 w-4.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )
          })
        )}
      </main>

      {totalItems > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-[480px] p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowCart(true)}
              className="flex flex-1 items-center justify-between rounded-2xl bg-primary px-4 py-3.5 text-white shadow-[var(--shadow-float)]"
            >
              <span className="flex items-center gap-2 text-lg font-semibold">
                <ShoppingCart className="h-4.5 w-4.5" />
                Giỏ hàng ({totalItems})
              </span>
              <span className="text-lg font-bold">{formatVnd(totalPrice)}</span>
            </button>
            <button
              type="button"
              onClick={() => setShowCart(true)}
              className="shrink-0 rounded-2xl border border-primary bg-white px-4 py-3.5 text-sm font-bold text-primary shadow-[var(--shadow-float)]"
            >
              Đặt món
            </button>
          </div>
        </div>
      )}

      <Modal
        open={showCart}
        onClose={() => setShowCart(false)}
        title="Giỏ hàng"
      >
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.product.id}
              className="flex items-center justify-between gap-3"
            >
              <div className="min-w-0">
                <p className="font-medium text-text">{item.product.name}</p>
                <p className="text-sm text-primary">
                  {formatVnd(item.product.price)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    updateQuantity(item.product.id, item.quantity - 1)
                  }
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-input-beige"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-6 text-center font-semibold">
                  {item.quantity}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    updateQuantity(item.product.id, item.quantity + 1)
                  }
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <textarea
          className="mt-4 w-full rounded-2xl border border-border/60 bg-input-blue px-4 py-3 text-sm"
          rows={2}
          value={customerNote}
          onChange={(e) => setCustomerNote(e.target.value)}
          placeholder="Ghi chú cho cửa hàng (tuỳ chọn)"
        />

        <div className="mt-4 flex items-center justify-between">
          <span className="text-lg font-bold">Tổng</span>
          <span className="text-lg font-bold text-primary">
            {formatVnd(totalPrice)}
          </span>
        </div>

        <button
          type="button"
          disabled={submitting}
          onClick={handleSubmitOrder}
          className="btn-primary mt-4 w-full disabled:opacity-60"
        >
          {submitting ? 'Đang gửi...' : 'Xác nhận đặt món'}
        </button>
      </Modal>
    </div>
  )
}

export default function CustomerMenuPage() {
  return (
    <CartProvider>
      <CustomerMenuContent />
    </CartProvider>
  )
}
