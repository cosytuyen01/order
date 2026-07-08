import { useMemo, useState } from 'react'
import { FolderOpen } from 'lucide-react'
import DetailHero from '../components/detail/DetailHero'
import FloatButton from '../components/FloatButton'
import Modal from '../components/Modal'
import ProductThumb from '../components/ProductThumb'
import SectionHeader from '../components/SectionHeader'
import { useOwnerStore } from '../hooks/useOwnerStore'
import { HOME_BG } from '../utils/branding'
import { useCategories } from '../hooks/useCategories'
import { useProducts } from '../hooks/useProducts'
import { formatVnd, parseVndInput } from '../utils/money'
import type { Category, Product } from '../types/store'

const inputClass =
  'w-full rounded-2xl border border-border/60 bg-input-blue px-4 py-3 text-base text-text transition focus:ring-3 focus:ring-primary/15 focus:outline-none'

type Tab = 'categories' | 'products'

export default function MenuManagementPage() {
  const { store } = useOwnerStore()
  const {
    categories,
    loading: categoriesLoading,
    addCategory,
    updateCategory,
    removeCategory,
  } = useCategories(store?.id)
  const {
    products,
    loading: productsLoading,
    addProduct,
    updateProduct,
    removeProduct,
  } = useProducts(store?.id)

  const [tab, setTab] = useState<Tab>('categories')
  const [showForm, setShowForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  const [categoryName, setCategoryName] = useState('')
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    categoryId: '',
  })

  const productsByCategory = useMemo(() => {
    const map = new Map<string, Product[]>()
    for (const cat of categories) map.set(cat.id, [])
    for (const p of products) {
      const list = map.get(p.categoryId) ?? []
      list.push(p)
      map.set(p.categoryId, list)
    }
    return map
  }, [categories, products])

  const openAddCategory = () => {
    setEditingCategory(null)
    setCategoryName('')
    setShowForm(true)
    setTab('categories')
  }

  const openAddProduct = () => {
    setEditingProduct(null)
    setProductForm({
      name: '',
      description: '',
      price: '',
      categoryId: categories[0]?.id ?? '',
    })
    setShowForm(true)
    setTab('products')
  }

  const handleSaveCategory = async () => {
    if (!categoryName.trim()) return
    if (editingCategory) {
      await updateCategory(editingCategory.id, { name: categoryName })
    } else {
      await addCategory(categoryName, categories.length)
    }
    setShowForm(false)
    setCategoryName('')
  }

  const handleSaveProduct = async () => {
    const price = parseVndInput(productForm.price)
    if (!productForm.name.trim() || !productForm.categoryId || price <= 0) return

    if (editingProduct) {
      await updateProduct(editingProduct.id, {
        name: productForm.name,
        description: productForm.description,
        price,
        categoryId: productForm.categoryId,
      })
    } else {
      await addProduct({
        name: productForm.name,
        description: productForm.description,
        price,
        categoryId: productForm.categoryId,
      })
    }
    setShowForm(false)
  }

  return (
    <div>
      <DetailHero
        imageUrl={HOME_BG}
        imageAlt="Menu"
        title="Quản lý menu"
        subtitle={store?.name ?? ''}
        compact
        footer={
          <div className="flex gap-2 rounded-2xl bg-white p-1 shadow-sm">
            {(['categories', 'products'] as Tab[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={[
                  'flex-1 rounded-xl py-2.5 text-sm font-semibold transition',
                  tab === t ? 'bg-primary text-white' : 'text-text-muted',
                ].join(' ')}
              >
                {t === 'categories' ? 'Danh mục' : 'Món ăn'}
              </button>
            ))}
          </div>
        }
      />

      <div className="space-y-3 px-4 pb-2 pt-3">
      {tab === 'categories' && (
        <section className="space-y-3">
          {categoriesLoading ? (
            <div className="h-24 animate-pulse rounded-3xl bg-white/70" />
          ) : categories.length === 0 ? (
            <div className="card-modern p-6 text-center text-sm text-text-muted">
              Chưa có danh mục. Nhấn + để thêm.
            </div>
          ) : (
            categories.map((cat) => (
              <div key={cat.id} className="card-modern flex items-center gap-3 p-4">
                <div
                  className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-warning-bg text-primary"
                  aria-hidden
                >
                  <FolderOpen className="h-6 w-6" strokeWidth={2} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-lg font-bold text-brown">{cat.name}</p>
                  <p className="text-sm text-text-muted">
                    {(productsByCategory.get(cat.id) ?? []).length} món
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingCategory(cat)
                      setCategoryName(cat.name)
                      setShowForm(true)
                    }}
                    className="rounded-xl bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary"
                  >
                    Sửa
                  </button>
                  <button
                    type="button"
                    onClick={() => removeCategory(cat.id)}
                    className="rounded-xl bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600"
                  >
                    Xóa
                  </button>
                </div>
              </div>
            ))
          )}
        </section>
      )}

      {tab === 'products' && (
        <section className="space-y-5">
          {productsLoading ? (
            <div className="h-24 animate-pulse rounded-3xl bg-white/70" />
          ) : categories.length === 0 ? (
            <div className="card-modern p-6 text-center text-sm text-text-muted">
              Tạo danh mục trước khi thêm món.
            </div>
          ) : (
            categories.map((cat) => {
              const items = productsByCategory.get(cat.id) ?? []
              if (items.length === 0) return null
              return (
                <div key={cat.id}>
                  <SectionHeader title={cat.name} className="!mb-2" />
                  <div className="space-y-2">
                    {items.map((p) => (
                      <div key={p.id} className="card-modern flex items-center gap-3 p-4">
                        <ProductThumb
                          imageUrl={p.imageUrl}
                          name={p.name}
                          size="md"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-brown">{p.name}</p>
                          {p.description && (
                            <p className="truncate text-xs text-text-muted">{p.description}</p>
                          )}
                          <p className="mt-1 text-sm font-bold text-primary">
                            {formatVnd(p.price)}
                          </p>
                        </div>
                        <div className="flex shrink-0 gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingProduct(p)
                              setProductForm({
                                name: p.name,
                                description: p.description,
                                price: String(p.price),
                                categoryId: p.categoryId,
                              })
                              setShowForm(true)
                            }}
                            className="rounded-xl bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary"
                          >
                            Sửa
                          </button>
                          <button
                            type="button"
                            onClick={() => removeProduct(p.id)}
                            className="rounded-xl bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600"
                          >
                            Xóa
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })
          )}
        </section>
      )}
      </div>

      <FloatButton
        onClick={tab === 'categories' ? openAddCategory : openAddProduct}
        label={tab === 'categories' ? 'Thêm danh mục' : 'Thêm món'}
      />

      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title={
          tab === 'categories'
            ? editingCategory
              ? 'Sửa danh mục'
              : 'Thêm danh mục'
            : editingProduct
              ? 'Sửa món'
              : 'Thêm món'
        }
      >
        {tab === 'categories' ? (
          <div className="space-y-4">
            <input
              className={inputClass}
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              placeholder="Tên danh mục (VD: Cafe)"
            />
            <button
              type="button"
              onClick={handleSaveCategory}
              className="btn-primary w-full"
            >
              Lưu
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <input
              className={inputClass}
              value={productForm.name}
              onChange={(e) =>
                setProductForm((f) => ({ ...f, name: e.target.value }))
              }
              placeholder="Tên món"
            />
            <textarea
              className={inputClass}
              rows={2}
              value={productForm.description}
              onChange={(e) =>
                setProductForm((f) => ({ ...f, description: e.target.value }))
              }
              placeholder="Mô tả"
            />
            <input
              className={inputClass}
              value={productForm.price}
              onChange={(e) =>
                setProductForm((f) => ({ ...f, price: e.target.value }))
              }
              placeholder="Giá (VD: 35000)"
              inputMode="numeric"
            />
            <select
              className={inputClass}
              value={productForm.categoryId}
              onChange={(e) =>
                setProductForm((f) => ({ ...f, categoryId: e.target.value }))
              }
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleSaveProduct}
              className="btn-primary w-full"
            >
              Lưu
            </button>
          </div>
        )}
      </Modal>
    </div>
  )
}
