import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function usePWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  const getInstallState = () => {
    const standalone = (window.navigator as any).standalone === true;
    const displayModeStandalone = window.matchMedia('(display-mode: standalone)').matches;
    return standalone || displayModeStandalone;
  };

  useEffect(() => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIOSDevice);

    const updateInstallState = () => {
      setIsInstalled(getInstallState());
    };

    updateInstallState();

    const handleBeforeInstallPrompt = (e: any) => {
      console.log('📱 beforeinstallprompt event triggered');
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };

    const handleAppInstalled = () => {
      console.log('✅ App installed successfully');
      setIsInstalled(true);
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        updateInstallState();
      }
    };

    const handleWindowFocus = () => {
      updateInstallState();
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('focus', handleWindowFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('focus', handleWindowFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const installApp = async () => {
    if (!deferredPrompt) {
      console.warn('Install prompt not available. Use the browser menu to add to Home Screen.');
      alert('Install not available. Use your browser menu and choose "Add to Home Screen".');
      return;
    }

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`User response to install prompt: ${outcome}`);

      setDeferredPrompt(null);
      setShowInstallPrompt(false);

      if (outcome === 'accepted') {
        setIsInstalled(true);
      }
    } catch (error) {
      console.error('Error during app installation:', error);
    }
  };

  const dismissInstallPrompt = () => {
    setShowInstallPrompt(false);
    setDeferredPrompt(null);
  };

  return {
    showInstallPrompt: showInstallPrompt && !isInstalled && !isIOS,
    isInstalled,
    isIOS,
    installApp,
    dismissInstallPrompt,
  };
}
