import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import './index.css'
import App from './App.tsx'

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
