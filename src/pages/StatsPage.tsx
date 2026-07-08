import { useMemo } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  type ChartOptions,
} from 'chart.js'
import { Bar, Doughnut } from 'react-chartjs-2'
import {
  ClipboardList,
  ShoppingBag,
  UtensilsCrossed,
  TrendingUp,
  PieChart,
  Trophy,
} from 'lucide-react'
import DetailHero from '../components/detail/DetailHero'
import { useOwnerStore } from '../hooks/useOwnerStore'
import { useOrders } from '../hooks/useOrders'
import { useCategories } from '../hooks/useCategories'
import { useProducts } from '../hooks/useProducts'
import { useTables } from '../hooks/useTables'
import { HOME_BG } from '../utils/branding'
import { formatVnd } from '../utils/money'
import { ORDER_STATUS_LABELS, type OrderStatus } from '../types/store'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
)

const PRIMARY = '#d3702d'
const BROWN = '#3d2314'
const MUTED = '#9c8878'

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: '#f0a860',
  confirmed: '#e07b39',
  preparing: '#d3702d',
  done: '#5b9e6f',
  paid: '#3f8f5c',
  cancelled: '#d16060',
}

const STAT_TONES = {
  primary: { chip: 'bg-primary/12 text-primary', value: 'text-brown' },
  green: { chip: 'bg-emerald-100 text-emerald-700', value: 'text-emerald-700' },
  amber: { chip: 'bg-amber-100 text-amber-700', value: 'text-brown' },
} as const

function StatItem({
  label,
  value,
  icon: Icon,
  tone = 'primary',
}: {
  label: string
  value: string
  icon: typeof ShoppingBag
  tone?: keyof typeof STAT_TONES
}) {
  const t = STAT_TONES[tone]
  return (
    <div className="card-modern flex items-center gap-3 p-4">
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${t.chip}`}
      >
        <Icon className="h-5 w-5" strokeWidth={2} />
      </div>
      <div className="min-w-0">
        <p className="truncate text-xs font-medium text-text-muted">{label}</p>
        <p className={`mt-0.5 truncate text-lg font-bold leading-tight ${t.value}`}>
          {value}
        </p>
      </div>
    </div>
  )
}

function ChartCard({
  title,
  icon: Icon,
  children,
}: {
  title: string
  icon: typeof TrendingUp
  children: React.ReactNode
}) {
  return (
    <div className="card-modern p-5">
      <div className="mb-4 flex items-center gap-2 text-brown">
        <Icon className="h-4 w-4 text-primary" strokeWidth={2} />
        <h2 className="text-sm font-bold">{title}</h2>
      </div>
      {children}
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

  const revenueByDay = useMemo(() => {
    const days: { label: string; key: string }[] = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const key = d.toISOString().split('T')[0]
      const label = d.toLocaleDateString('vi-VN', {
        weekday: 'short',
      })
      days.push({ label, key })
    }
    const totals = days.map((day) =>
      orders
        .filter(
          (o) => o.status !== 'cancelled' && o.createdAt.startsWith(day.key),
        )
        .reduce((sum, o) => sum + o.total, 0),
    )
    return { labels: days.map((d) => d.label), totals }
  }, [orders])

  const statusBreakdown = useMemo(() => {
    const counts = new Map<OrderStatus, number>()
    for (const o of orders) {
      counts.set(o.status, (counts.get(o.status) ?? 0) + 1)
    }
    const entries = Array.from(counts.entries()).filter(([, n]) => n > 0)
    return {
      labels: entries.map(([s]) => ORDER_STATUS_LABELS[s]),
      data: entries.map(([, n]) => n),
      colors: entries.map(([s]) => STATUS_COLORS[s]),
    }
  }, [orders])

  const topProducts = useMemo(() => {
    const map = new Map<string, number>()
    for (const o of orders) {
      if (o.status === 'cancelled') continue
      for (const item of o.items) {
        map.set(item.productName, (map.get(item.productName) ?? 0) + item.quantity)
      }
    }
    const sorted = Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
    return {
      labels: sorted.map(([name]) => name),
      data: sorted.map(([, qty]) => qty),
    }
  }, [orders])

  const hasOrders = orders.length > 0

  return (
    <div className="space-y-4">
      <DetailHero
        imageUrl={HOME_BG}
        imageAlt="Thống kê"
        title="Thống kê"
        subtitle={store?.name ?? 'Cửa hàng'}
        compact
      />

      <div className="grid grid-cols-2 gap-3 px-4">
        <StatItem
          label="Đơn hôm nay"
          value={String(stats.todayOrders)}
          icon={ClipboardList}
        />
        <StatItem
          label="Doanh thu hôm nay"
          value={formatVnd(stats.todayRevenue)}
          icon={ShoppingBag}
          tone="green"
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
          tone="green"
        />
        <StatItem
          label="Chờ xử lý"
          value={String(stats.pendingCount)}
          icon={ClipboardList}
          tone="amber"
        />
        <StatItem
          label="Bàn / Món"
          value={`${tables.length} / ${products.length}`}
          icon={UtensilsCrossed}
        />
      </div>

      <div className="space-y-4 px-4 pb-4">
        {!hasOrders ? (
          <div className="card-modern p-6 text-center text-sm text-text-muted">
            Chưa có dữ liệu đơn hàng để hiển thị biểu đồ.
          </div>
        ) : (
          <>
            <ChartCard title="Doanh thu 7 ngày qua" icon={TrendingUp}>
              <div className="h-52">
                <Bar
                  data={{
                    labels: revenueByDay.labels,
                    datasets: [
                      {
                        label: 'Doanh thu',
                        data: revenueByDay.totals,
                        backgroundColor: PRIMARY,
                        borderRadius: 8,
                        maxBarThickness: 34,
                      },
                    ],
                  }}
                  options={revenueOptions}
                />
              </div>
            </ChartCard>

            <div className="grid gap-4">
              <ChartCard title="Trạng thái đơn hàng" icon={PieChart}>
                <div className="mx-auto h-56 max-w-xs">
                  <Doughnut
                    data={{
                      labels: statusBreakdown.labels,
                      datasets: [
                        {
                          data: statusBreakdown.data,
                          backgroundColor: statusBreakdown.colors,
                          borderColor: '#fff',
                          borderWidth: 2,
                        },
                      ],
                    }}
                    options={doughnutOptions}
                  />
                </div>
              </ChartCard>

              {topProducts.labels.length > 0 && (
                <ChartCard title="Món bán chạy" icon={Trophy}>
                  <div
                    className="h-52"
                    style={{ height: `${Math.max(topProducts.labels.length * 44, 120)}px` }}
                  >
                    <Bar
                      data={{
                        labels: topProducts.labels,
                        datasets: [
                          {
                            label: 'Số lượng',
                            data: topProducts.data,
                            backgroundColor: PRIMARY,
                            borderRadius: 8,
                            maxBarThickness: 26,
                          },
                        ],
                      }}
                      options={topProductsOptions}
                    />
                  </div>
                </ChartCard>
              )}
            </div>
          </>
        )}

        <p className="text-center text-xs text-text-muted">
          {categories.length} danh mục
        </p>
      </div>
    </div>
  )
}

const revenueOptions: ChartOptions<'bar'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: (ctx) => formatVnd(Number(ctx.raw)),
      },
    },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { color: MUTED, font: { size: 11 } },
    },
    y: {
      grid: { color: 'rgba(61,35,20,0.06)' },
      ticks: {
        color: MUTED,
        font: { size: 10 },
        callback: (value) => {
          const n = Number(value)
          return n >= 1000 ? `${n / 1000}k` : String(n)
        },
      },
    },
  },
}

const doughnutOptions: ChartOptions<'doughnut'> = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '62%',
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        color: BROWN,
        font: { size: 11 },
        padding: 12,
        usePointStyle: true,
        pointStyle: 'circle',
      },
    },
  },
}

const topProductsOptions: ChartOptions<'bar'> = {
  indexAxis: 'y',
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: (ctx) => `${ctx.raw} phần`,
      },
    },
  },
  scales: {
    x: {
      grid: { color: 'rgba(61,35,20,0.06)' },
      ticks: { color: MUTED, font: { size: 10 }, precision: 0 },
    },
    y: {
      grid: { display: false },
      ticks: { color: BROWN, font: { size: 11 } },
    },
  },
}
