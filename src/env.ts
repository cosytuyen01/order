const REQUIRED_ENV = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
] as const

export function getMissingFirebaseEnv(): string[] {
  return REQUIRED_ENV.filter((key) => !import.meta.env[key])
}

export function isFirebaseConfigured(): boolean {
  return getMissingFirebaseEnv().length === 0
}
