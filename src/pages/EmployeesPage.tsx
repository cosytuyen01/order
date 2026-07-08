import { useState } from 'react'
import { PenSquare, Trash2, UserPlus, Users } from 'lucide-react'
import DetailHero from '../components/detail/DetailHero'
import { useAuth } from '../context/AuthContext'
import { useEmployees } from '../hooks/useEmployees'
import { useOwnerStore } from '../hooks/useOwnerStore'
import { HOME_BG } from '../utils/branding'
import { formatPhoneDisplay, isValidVietnamesePhone } from '../utils/phone'

const inputClass =
  'w-full rounded-2xl border border-border/60 bg-input-blue px-4 py-3 text-base text-text transition focus:ring-3 focus:ring-primary/15 focus:outline-none'

export default function EmployeesPage() {
  const { createEmployee } = useAuth()
  const { store, isOwner } = useOwnerStore()
  const {
    employees,
    loading: employeesLoading,
    updateEmployeeName,
    deactivateEmployee,
  } = useEmployees(isOwner ? store?.id : undefined)

  const [tab, setTab] = useState<'list' | 'add'>('list')
  const [message, setMessage] = useState('')
  const [creating, setCreating] = useState(false)
  const [editingEmployeeId, setEditingEmployeeId] = useState<string | null>(null)
  const [editingEmployeeName, setEditingEmployeeName] = useState('')
  const [employeeForm, setEmployeeForm] = useState({
    displayName: '',
    phone: '',
    password: '',
  })

  const handleCreateEmployee = async () => {
    if (!store || !isOwner) return

    if (!employeeForm.displayName.trim()) {
      setMessage('Vui lòng nhập tên nhân viên.')
      return
    }
    if (!isValidVietnamesePhone(employeeForm.phone)) {
      setMessage('Số điện thoại nhân viên không hợp lệ.')
      return
    }
    if (employeeForm.password.length < 6) {
      setMessage('Mật khẩu nhân viên tối thiểu 6 ký tự.')
      return
    }

    setCreating(true)
    setMessage('')
    try {
      await createEmployee({
        storeId: store.id,
        displayName: employeeForm.displayName,
        phone: employeeForm.phone,
        password: employeeForm.password,
      })
      setEmployeeForm({ displayName: '', phone: '', password: '' })
      setMessage('Đã thêm nhân viên mới.')
      setTab('list')
    } catch {
      setMessage('Không thêm được. Số điện thoại có thể đã tồn tại.')
    } finally {
      setCreating(false)
    }
  }

  const handleSaveEmployeeName = async () => {
    if (!editingEmployeeId || !editingEmployeeName.trim()) return
    try {
      await updateEmployeeName(editingEmployeeId, editingEmployeeName)
      setMessage('Đã cập nhật tên nhân viên.')
      setEditingEmployeeId(null)
      setEditingEmployeeName('')
    } catch {
      setMessage('Không thể cập nhật nhân viên.')
    }
  }

  const handleDeleteEmployee = async (id: string) => {
    try {
      await deactivateEmployee(id)
      setMessage('Đã xóa nhân viên khỏi cửa hàng.')
    } catch {
      setMessage('Không thể xóa nhân viên.')
    }
  }

  if (!isOwner) {
    return (
      <div className="space-y-4">
        <DetailHero
          imageUrl={HOME_BG}
          imageAlt="Nhân viên"
          title="Nhân viên"
          subtitle={store?.name ?? 'Cửa hàng'}
        />
        <div className="px-4">
          <div className="card-modern p-5 text-sm text-brown-light">
            Chỉ chủ cửa hàng mới có quyền quản lý nhân viên.
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <DetailHero
        imageUrl={HOME_BG}
        imageAlt="Nhân viên"
        title="Nhân viên"
        subtitle={`${employees.length} nhân viên`}
        compact
      />

      <div className="px-4">
        <div className="card-modern space-y-4 p-5">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <h2 className="font-bold text-brown">Quản lý nhân viên</h2>
          </div>

          <div className="flex gap-2 rounded-2xl bg-input-beige p-1">
            <button
              type="button"
              onClick={() => setTab('list')}
              className={[
                'flex-1 rounded-xl py-2 text-sm font-semibold transition',
                tab === 'list' ? 'bg-white text-brown shadow-sm' : 'text-text-muted',
              ].join(' ')}
            >
              Danh sách
            </button>
            <button
              type="button"
              onClick={() => setTab('add')}
              className={[
                'flex-1 rounded-xl py-2 text-sm font-semibold transition',
                tab === 'add' ? 'bg-white text-brown shadow-sm' : 'text-text-muted',
              ].join(' ')}
            >
              Thêm mới
            </button>
          </div>

          {tab === 'list' ? (
            <div className="space-y-2">
              {employeesLoading ? (
                <div className="h-14 animate-pulse rounded-2xl bg-white/70" />
              ) : employees.length === 0 ? (
                <p className="rounded-xl bg-input-beige px-3 py-2 text-sm text-text-muted">
                  Chưa có nhân viên.
                </p>
              ) : (
                employees.map((employee) => (
                  <div
                    key={employee.id}
                    className="rounded-2xl border border-border/60 bg-white px-3 py-3"
                  >
                    {editingEmployeeId === employee.id ? (
                      <div className="space-y-2">
                        <input
                          className={inputClass}
                          value={editingEmployeeName}
                          onChange={(e) => setEditingEmployeeName(e.target.value)}
                          placeholder="Tên nhân viên"
                        />
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingEmployeeId(null)
                              setEditingEmployeeName('')
                            }}
                            className="btn-outline flex-1"
                          >
                            Hủy
                          </button>
                          <button
                            type="button"
                            onClick={handleSaveEmployeeName}
                            className="btn-primary flex-1"
                          >
                            Lưu
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold text-brown">
                            {employee.displayName || 'Nhân viên'}
                          </p>
                          <p className="text-sm text-text-muted">
                            {formatPhoneDisplay(employee.phone)}
                          </p>
                        </div>
                        <div className="flex gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingEmployeeId(employee.id)
                              setEditingEmployeeName(employee.displayName)
                              setMessage('')
                            }}
                            className="rounded-lg bg-warning-bg p-2 text-primary"
                          >
                            <PenSquare className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteEmployee(employee.id)}
                            className="rounded-lg bg-red-50 p-2 text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="grid gap-2">
              <input
                className={inputClass}
                value={employeeForm.displayName}
                onChange={(e) =>
                  setEmployeeForm((f) => ({ ...f, displayName: e.target.value }))
                }
                placeholder="Tên nhân viên"
              />
              <input
                className={inputClass}
                value={employeeForm.phone}
                onChange={(e) =>
                  setEmployeeForm((f) => ({ ...f, phone: e.target.value }))
                }
                placeholder="Số điện thoại (VD: 0901234567)"
              />
              <input
                className={inputClass}
                value={employeeForm.password}
                onChange={(e) =>
                  setEmployeeForm((f) => ({ ...f, password: e.target.value }))
                }
                placeholder="Mật khẩu đăng nhập"
                type="password"
              />
              <button
                type="button"
                onClick={handleCreateEmployee}
                disabled={creating}
                className="btn-primary inline-flex items-center justify-center gap-2 disabled:opacity-60"
              >
                <UserPlus className="h-4 w-4" />
                {creating ? 'Đang tạo...' : 'Thêm nhân viên'}
              </button>
            </div>
          )}

          {message && <p className="text-sm text-primary">{message}</p>}
          <div className="rounded-2xl bg-warning-bg px-3 py-2 text-xs text-brown-light">
            Quyền nhân viên: xác nhận món, chỉnh sửa/thêm bàn, thêm món, thêm danh mục.
            Không được sửa thông tin cửa hàng.
          </div>
        </div>
      </div>
    </div>
  )
}
