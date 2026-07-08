import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { ArrowRight, ChevronRight } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import LoadingScreen from '../components/LoadingScreen'
import AuthField from '../components/auth/AuthField'
import AuthLayout from '../components/auth/AuthLayout'
import { isValidVietnamesePhone } from '../utils/phone'

export default function RegisterPage() {
  const { user, register, loading } = useAuth()
  const [displayName, setDisplayName] = useState('')
  const [storeName, setStoreName] = useState('')
  const [address, setAddress] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (loading) return <LoadingScreen />

  if (user) return <Navigate to="/" replace />

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!storeName.trim()) {
      setError('Vui lòng nhập tên cửa hàng.')
      return
    }
    if (!isValidVietnamesePhone(phone)) {
      setError('Số điện thoại không hợp lệ. Nhập số VN 10 chữ số (VD: 0901234567).')
      return
    }
    if (password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự.')
      return
    }
    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.')
      return
    }

    setSubmitting(true)
    try {
      await register(phone, password, {
        displayName,
        storeName,
        address,
      })
    } catch {
      setError('Không thể đăng ký. Số điện thoại có thể đã được sử dụng.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout
      title="OrderQR"
      subtitle="Đăng ký cửa hàng mới"
      footer={
        <span className="inline-flex items-center gap-1">
          Đã có tài khoản?{' '}
          <Link
            to="/login"
            className="inline-flex items-center gap-0.5 font-semibold text-primary hover:underline"
          >
            Đăng nhập
            <ChevronRight className="h-4 w-4" strokeWidth={2.5} />
          </Link>
        </span>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <AuthField
          label="Họ tên chủ cửa hàng"
          icon="user"
          showClear
          type="text"
          autoComplete="name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Nguyễn Văn A"
          required
        />
        <AuthField
          label="Tên cửa hàng"
          icon="user"
          showClear
          type="text"
          value={storeName}
          onChange={(e) => setStoreName(e.target.value)}
          placeholder="Coffee ABC"
          required
        />
        <AuthField
          label="Địa chỉ"
          icon="user"
          showClear
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="123 Nguyễn Huệ, Q.1, TP.HCM"
        />
        <AuthField
          label="Số điện thoại"
          icon="phone"
          showClear
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="0901234567"
          required
        />
        <AuthField
          label="Mật khẩu"
          icon="lock"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Ít nhất 6 ký tự"
          required
        />
        <AuthField
          label="Xác nhận mật khẩu"
          icon="lock"
          type="password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Nhập lại mật khẩu"
          required
        />

        {error && (
          <p className="rounded-2xl bg-primary/8 px-4 py-2.5 text-sm text-primary">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="mt-1 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-base font-semibold text-white shadow-[0_6px_20px_rgba(37,99,235,0.4)] transition hover:bg-primary-dark active:scale-[0.98] disabled:opacity-60"
        >
          {submitting ? 'Đang đăng ký...' : (
            <>
              Tạo cửa hàng
              <ArrowRight className="h-5 w-5" strokeWidth={2.25} />
            </>
          )}
        </button>
      </form>
    </AuthLayout>
  )
}
