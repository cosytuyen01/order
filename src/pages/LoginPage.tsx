import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { ArrowRight, ChevronRight } from 'lucide-react'
import {
  browserLocalPersistence,
  browserSessionPersistence,
  setPersistence,
} from 'firebase/auth'
import { useAuth } from '../context/AuthContext'
import { auth } from '../firebase/config'
import LoadingScreen from '../components/LoadingScreen'
import AuthField from '../components/auth/AuthField'
import AuthLayout from '../components/auth/AuthLayout'
import { isValidVietnamesePhone } from '../utils/phone'

export default function LoginPage() {
  const { user, login, loading } = useAuth()
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (loading) return <LoadingScreen />

  if (user) return <Navigate to="/" replace />

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!isValidVietnamesePhone(phone)) {
      setError('Số điện thoại không hợp lệ. Nhập số VN 10 chữ số (VD: 0901234567).')
      return
    }

    setSubmitting(true)
    try {
      await setPersistence(
        auth,
        remember ? browserLocalPersistence : browserSessionPersistence,
      )
      await login(phone, password)
    } catch {
      setError('Số điện thoại hoặc mật khẩu không đúng.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout
      title="OrderQR"
      subtitle="Quản lý menu & đặt món qua QR"
      footer={
        <span className="inline-flex items-center gap-1">
          Chưa có tài khoản?{' '}
          <Link
            to="/register"
            className="inline-flex items-center gap-0.5 font-semibold text-primary hover:underline"
          >
            Đăng ký ngay
            <ChevronRight className="h-4 w-4" strokeWidth={2.5} />
          </Link>
        </span>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
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
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
        />

        <div className="flex items-center justify-between gap-3 text-sm">
          <label className="flex cursor-pointer items-center gap-2 text-text-muted">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="h-4 w-4 rounded border-primary/30 accent-primary"
            />
            Ghi nhớ đăng nhập
          </label>
          {/* <button
            type="button"
            onClick={handleForgotPassword}
            className="font-medium text-primary transition hover:text-primary-dark"
          >
            Quên mật khẩu?
          </button> */}
        </div>

        {error && (
          <p className="rounded-2xl bg-primary/8 px-4 py-2.5 text-sm text-primary">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-base font-semibold text-white shadow-[0_6px_20px_rgba(37,99,235,0.4)] transition hover:bg-primary-dark active:scale-[0.98] disabled:opacity-60"
        >
          {submitting ? 'Đang đăng nhập...' : (
            <>
              Đăng nhập
              <ArrowRight className="h-5 w-5" strokeWidth={2.25} />
            </>
          )}
        </button>
      </form>
    </AuthLayout>
  )
}
