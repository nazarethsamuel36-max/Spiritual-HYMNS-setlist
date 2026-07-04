import { useState, useEffect } from 'react';

export function ConnectionStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      console.log('🌐 Connection restored');
      setIsOnline(true);
    };

    const handleOffline = () => {
      console.log('📴 Connection lost');
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div
      className={`fixed bottom-2 right-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
        isOnline
          ? 'bg-emerald-100 text-emerald-700'
          : 'bg-orange-100 text-orange-700'
      }`}
    >
      {isOnline ? '🟢 Online' : '🔴 Offline'}
    </div>
  );
}
