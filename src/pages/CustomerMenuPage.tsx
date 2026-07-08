import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  BadgeCheck,
  BellRing,
  Clock3,
  MapPin,
  Minus,
  Plus,
  Share2,
  ShoppingCart,
  Star,
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
import { createOrder, useTableOrders } from '../hooks/useOrders'
import { clearTableCart, useSyncTableCart } from '../hooks/useTableCarts'
import { logStoreEvent } from '../hooks/useStoreEvents'
import { formatVnd } from '../utils/money'
import { HOME_BG } from '../utils/branding'
import { getTableMenuUrl } from '../utils/qr'
import {
  isOpenOrder,
  ORDER_STATUS_COLORS,
  ORDER_STATUS_LABELS,
  type OrderStatus,
} from '../types/store'

const STATUS_TOAST: Partial<Record<OrderStatus, string>> = {
  confirmed: 'Cửa hàng đã nhận đơn của bạn ✅',
  preparing: 'Cửa hàng đang chuẩn bị món của bạn 👨‍🍳',
  done: 'Món của bạn đã sẵn sàng, mời thưởng thức 🎉',
  paid: 'Cửa hàng đã ghi nhận thanh toán 💳',
}

const STAGE_ORDER: OrderStatus[] = ['pending', 'confirmed', 'preparing', 'done']

function showSystemNotification(title: string, body: string) {
  if (typeof Notification === 'undefined') return
  if (Notification.permission !== 'granted') return
  try {
    new Notification(title, { body })
  } catch {
    // Some browsers only allow notifications from a service worker.
  }
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
  const [statusToast, setStatusToast] = useState<string | null>(null)

  const { orders: tableOrders } = useTableOrders(storeId, tableId)

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

  const activeOrders = useMemo(
    () => tableOrders.filter(isOpenOrder),
    [tableOrders],
  )

  const orderedItemSummary = useMemo(() => {
    const map = new Map<string, number>()
    for (const order of activeOrders) {
      for (const item of order.items) {
        map.set(item.productName, (map.get(item.productName) ?? 0) + item.quantity)
      }
    }
    return Array.from(map.entries()).map(([name, quantity]) => ({ name, quantity }))
  }, [activeOrders])

  const orderedTotal = useMemo(
    () => activeOrders.reduce((sum, o) => sum + o.total, 0),
    [activeOrders],
  )

  const currentStatus = useMemo<OrderStatus | null>(() => {
    if (activeOrders.length === 0) return null
    let minStage = STAGE_ORDER.length
    for (const o of activeOrders) {
      const idx = STAGE_ORDER.indexOf(o.status)
      if (idx >= 0 && idx < minStage) minStage = idx
    }
    return minStage === STAGE_ORDER.length
      ? activeOrders[0].status
      : STAGE_ORDER[minStage]
  }, [activeOrders])

  const prevStatusRef = useRef<Map<string, OrderStatus>>(new Map())
  const hadActiveRef = useRef(false)
  const toastTimerRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    const prev = prevStatusRef.current
    const next = new Map<string, OrderStatus>()
    let message: string | null = null

    for (const o of tableOrders) {
      next.set(o.id, o.status)
      const before = prev.get(o.id)
      if (before && before !== o.status && STATUS_TOAST[o.status]) {
        message = STATUS_TOAST[o.status] ?? null
      }
    }

    const hasActive = tableOrders.some(isOpenOrder)

    if (prev.size > 0) {
      if (hadActiveRef.current && !hasActive) {
        message = 'Cảm ơn bạn đã ghé quán! Hẹn gặp lại 👋'
      }
      if (message) {
        setStatusToast(message)
        showSystemNotification(store?.name ?? 'Cửa hàng', message)
        window.clearTimeout(toastTimerRef.current)
        toastTimerRef.current = window.setTimeout(
          () => setStatusToast(null),
          6000,
        )
      }
    }

    prevStatusRef.current = next
    hadActiveRef.current = hasActive
  }, [tableOrders, store?.name])

  useEffect(() => {
    return () => window.clearTimeout(toastTimerRef.current)
  }, [])

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
      await clearTableCart(table.id)
      clearCart()
      setCustomerNote('')
      setShowCart(false)
      setOrderSuccess(true)
      setTimeout(() => setOrderSuccess(false), 4000)

      if (
        typeof Notification !== 'undefined' &&
        Notification.permission === 'default'
      ) {
        void Notification.requestPermission().catch(() => {})
      }
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

      <header className="relative z-10 px-4 pt-[max(1rem,env(safe-area-inset-top))]">
        <div
          className="relative overflow-hidden rounded-3xl p-5 text-white shadow-[0_18px_44px_-20px_rgba(61,35,20,0.75)]"
          style={{
            backgroundImage: `linear-gradient(150deg, rgba(61,35,20,0.94), rgba(61,35,20,0.55)), url('/bg_profile.png')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="flex flex-col items-center text-center">
            <StoreLogo
              logoUrl={store.logoUrl}
              name={store.name}
              size="xl"
              className="border-white/50 bg-white/15 text-white shadow-none ring-4 ring-white/10"
            />

            <div className="mt-3 flex items-center justify-center gap-1.5">
              <h1 className="max-w-[16rem] truncate text-2xl font-bold leading-tight">
                {store.name}
              </h1>
              <BadgeCheck className="h-5 w-5 shrink-0 text-amber-300" />
            </div>

            <p className="mt-1.5 flex items-center justify-center gap-1 text-sm text-amber-50/90">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{store.address || 'Chưa có địa chỉ'}</span>
            </p>

            <div className="mt-2 inline-flex items-center gap-1 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-semibold text-amber-50">
              <UtensilsCrossed className="h-3.5 w-3.5 text-amber-300" />
              Bàn: {table.name}
            </div>
          </div>

          <button
            type="button"
            onClick={handleShare}
            className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full bg-white/95 px-3.5 py-1.5 text-xs font-semibold text-brown shadow-sm"
            aria-label="Chia sẻ link đặt món"
          >
            <Share2 className="h-3.5 w-3.5" />
            Chia sẻ
          </button>

          <div className="mt-4 flex items-stretch rounded-2xl border border-white/20 bg-white/10 backdrop-blur-sm">
            <div className="flex flex-1 flex-col items-center gap-0.5 px-3 py-2.5">
              <span className="flex items-center gap-1 text-sm font-bold text-amber-50">
                <Star className="h-4 w-4 text-amber-300" />
                4.9
              </span>
              <span className="text-[11px] text-amber-50/70">128 đánh giá</span>
            </div>
            <div className="my-2 w-px bg-white/20" />
            <div className="flex flex-1 flex-col items-center gap-0.5 px-3 py-2.5">
              <span className="flex items-center gap-1 text-sm font-bold text-amber-50">
                <Clock3 className="h-4 w-4 text-amber-300" />
                07:00 - 22:00
              </span>
              <span className="text-[11px] text-amber-50/70">Giờ mở cửa</span>
            </div>
          </div>
        </div>
      </header>

      {orderSuccess && (
        <div className="mx-4 mt-4 rounded-2xl bg-emerald-50 px-4 py-3 text-center text-sm font-semibold text-emerald-700">
          Đã gửi đơn! Nhân viên sẽ xác nhận sớm.
        </div>
      )}

      {statusToast && (
        <div className="fixed inset-x-0 top-0 z-50 mx-auto max-w-[480px] px-4 pt-[max(0.75rem,env(safe-area-inset-top))]">
          <div className="flex items-center gap-2.5 rounded-2xl bg-brown px-4 py-3 text-sm font-semibold text-white shadow-[var(--shadow-float)]">
            <BellRing className="h-5 w-5 shrink-0 text-amber-300" />
            <span>{statusToast}</span>
          </div>
        </div>
      )}

      <main className="relative z-10 space-y-5 px-4 py-4">
        {activeOrders.length > 0 && (
          <section className="card-modern overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-warning-bg text-primary">
                  <ShoppingCart className="h-4 w-4" />
                </div>
                <h2 className="text-sm font-bold text-brown">Món đã đặt của bàn này</h2>
              </div>
              {currentStatus && (
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${ORDER_STATUS_COLORS[currentStatus]}`}
                >
                  {ORDER_STATUS_LABELS[currentStatus]}
                </span>
              )}
            </div>
            <div className="border-t border-border/60 px-4 py-3">
              <div className="rounded-xl bg-input-beige px-3 py-2.5">
                <div className="mb-2 flex items-center gap-1 text-sm text-brown-light">
                  <Clock3 className="h-4 w-4" />
                  Cập nhật: {new Date(activeOrders[0].createdAt).toLocaleTimeString('vi-VN')}
                </div>
                <div className="space-y-1 border-l border-border/80 pl-3">
                  {orderedItemSummary.map((item) => (
                    <p key={item.name} className="text-sm text-brown">
                      {item.name} x {item.quantity}
                    </p>
                  ))}
                  <p className="pt-1 text-xl font-bold text-primary">
                    {formatVnd(orderedTotal)}
                  </p>
                </div>
              </div>
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
