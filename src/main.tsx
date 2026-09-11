import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import './index.css'
import App from './App.tsx'
import { updateSyncTimestamp } from './services/DataService'

// Load verification tools in both dev and production
import('./debug/SyncVerification');

// Expose debug functions to window for console access
if (import.meta.env.DEV) {
  (window as any).updateSyncTimestamp = updateSyncTimestamp;
  console.log('🔧 Debug tools available: window.updateSyncTimestamp()');
}

// ─── Persistent Storage Protection ───────────────────────────────────────────
// Elevate IndexedDB from "Best-Effort" to "Persistent" so Chrome will not
// auto-evict song data under low disk pressure. Chrome grants silently when:
//   • The PWA is installed to the home screen, OR
//   • The user visits frequently (high engagement), OR
//   • The site has notification permission granted.
// No browser popup is shown to the user.
async function requestPersistentStorage(): Promise<void> {
  if (!navigator.storage) return;
  try {
    // Check if already persistent (subsequent visits)
    const alreadyPersistent = await navigator.storage.persisted();
    if (alreadyPersistent) {
      console.log('✅ Storage: PERSISTENT — IndexedDB data is protected from auto-eviction.');
      return;
    }
    // Request persistence for the first time
    if (navigator.storage.persist) {
      const granted = await navigator.storage.persist();
      if (granted) {
        console.log('🚀 Storage: PERSISTENT granted — Chrome will not auto-delete song data!');
      } else {
        console.warn('⚠️ Storage: BEST-EFFORT — data may be evicted under low disk space. Install the PWA to lock it down.');
      }
    }
  } catch (e) {
    console.warn('⚠️ Could not request persistent storage:', e);
  }
}
requestPersistentStorage();

// Unregister service worker ONLY during local development to make hot reloading easier
if (import.meta.env.DEV && 'serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (const registration of registrations) {
      registration.unregister();
      console.log('⚡ Dev Mode: Service worker unregistered');
    }
  });
}

// Register service worker in production/app mode
if (import.meta.env.PROD) {
  registerSW({
    onNeedRefresh() {
      console.log('🔄 New app update available. Refresh recommended.');
    },
    onOfflineReady() {
      console.log('⭐ App is ready to work offline.');
    }
  })
}

console.log('?? App starting...');
console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('VITE_SUPABASE_ANON_KEY length:', import.meta.env.VITE_SUPABASE_ANON_KEY?.length);
console.log('Is key present?', !!import.meta.env.VITE_SUPABASE_ANON_KEY);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
