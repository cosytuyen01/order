import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import ConfigError from './components/ConfigError.tsx'
import { isFirebaseConfigured } from './env.ts'

const root = document.getElementById('root')
if (!root) {
  throw new Error('Root element #root not found')
}

if (isFirebaseConfigured()) {
  void import('./bootstrap.tsx')
} else {
  createRoot(root).render(
    <StrictMode>
      <ConfigError />
    </StrictMode>,
  )
}
