import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { captureInstallPrompt, clearInstallPrompt } from './lib/pwa'

// Capture the browser's install prompt before React routes mount. Without this,
// navigating to Settings later misses the one-time `beforeinstallprompt` event
// and the download button can only show a fallback toast.
window.addEventListener('beforeinstallprompt', captureInstallPrompt)
window.addEventListener('appinstalled', clearInstallPrompt)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Register the PWA service worker for production builds only. In dev it would
// cache Vite's HMR assets and serve stale modules.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // PWA features are optional — the app still works without a worker.
    })
  })
}
