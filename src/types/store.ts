export interface Store {
  id: string
  ownerId: string
  name: string
  phone: string
  address: string
  logoUrl?: string
  status: 'active' | 'inactive'
  createdAt: string
}

export interface Category {
  id: string
  storeId: string
  name: string
  imageUrl?: string
  sortOrder: number
  status: 'active' | 'inactive'
  createdAt: string
}

export interface Product {
  id: string
  storeId: string
  categoryId: string
  name: string
  description: string
  imageUrl?: string
  price: number
  status: 'active' | 'inactive'
  createdAt: string
}

export interface Table {
  id: string
  storeId: string
  name: string
  status: 'available' | 'occupied' | 'inactive'
  createdAt: string
}

export interface TableCart {
  tableId: string
  storeId: string
  tableName: string
  items: OrderItem[]
  customerNote: string
  total: number
  itemCount: number
  updatedAt: string
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'done'
  | 'paid'
  | 'cancelled'

export interface OrderItem {
  productId: string
  productName: string
  price: number
  quantity: number
}

export const ACTIVE_TABLE_ORDER_STATUSES: OrderStatus[] = [
  'pending',
  'confirmed',
  'preparing',
  'done',
]

export interface Order {
  id: string
  storeId: string
  tableId: string
  tableName: string
  items: OrderItem[]
  customerNote: string
  status: OrderStatus
  total: number
  createdAt: string
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Chờ xử lý',
  confirmed: 'Đã nhận',
  preparing: 'Đang làm',
  done: 'Hoàn thành',
  paid: 'Đã thanh toán',
  cancelled: 'Đã hủy',
}

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  pending: 'bg-warning-bg text-primary',
  confirmed: 'bg-orange-100 text-orange-800',
  preparing: 'bg-amber-50 text-amber-800',
  done: 'bg-emerald-50 text-emerald-700',
  paid: 'bg-success-bg text-success',
  cancelled: 'bg-red-50 text-red-600',
}

export type StoreEventType = 'qr_scan' | 'cart_update' | 'new_order'

export interface StoreEvent {
  id: string
  storeId: string
  tableId: string
  tableName: string
  type: StoreEventType
  title: string
  body: string
  itemCount?: number
  createdAt: string
}

export const STORE_EVENT_LABELS: Record<StoreEventType, string> = {
  qr_scan: 'Khách quét QR',
  cart_update: 'Đang chọn món',
  new_order: 'Đơn mới',
}
