import { getMissingFirebaseEnv } from '../env'

export default function ConfigError() {
  const missing = getMissingFirebaseEnv()

  return (
    <div className="flex min-h-screen items-center justify-center bg-page p-6">
      <div className="w-full max-w-md rounded-2xl border border-border bg-white p-6 shadow-sm">
        <h1 className="text-lg font-bold text-text">Thiếu cấu hình Firebase</h1>
        <p className="mt-2 text-sm text-text-muted">
          Ứng dụng chưa chạy được vì thiếu biến môi trường trên Vercel (hoặc file
          `.env` khi chạy local).
        </p>
        <ul className="mt-4 space-y-1 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {missing.map((key) => (
            <li key={key} className="font-mono text-xs">
              {key}
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm text-text-muted">
          Vào <strong>Vercel → Project → Settings → Environment Variables</strong>,
          thêm các biến trên (copy từ `.env` local), rồi <strong>Redeploy</strong>.
        </p>
        <p className="mt-2 text-sm text-text-muted">
          Trên Firebase Console, thêm domain <strong>chaomao.vercel.app</strong> vào
          Authentication → Settings → Authorized domains.
        </p>
      </div>
    </div>
  )
}
