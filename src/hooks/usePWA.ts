import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

let globalDeferredPrompt: BeforeInstallPromptEvent | null = null;
let globalIsInstalled = false;
const listeners = new Set<() => void>();

function notifyListeners() {
  listeners.forEach((l) => l());
}

const checkIsInstalled = () => {
  if (typeof window === 'undefined') return false;
  const standalone = (window.navigator as any).standalone === true;
  const displayModeStandalone = window.matchMedia('(display-mode: standalone)').matches;
  return standalone || displayModeStandalone;
};

if (typeof window !== 'undefined') {
  globalIsInstalled = checkIsInstalled();

  window.addEventListener('beforeinstallprompt', (e: any) => {
    console.log('📱 global beforeinstallprompt event captured');
    e.preventDefault();
    globalDeferredPrompt = e;
    notifyListeners();
  });

  window.addEventListener('appinstalled', () => {
    console.log('✅ App installed globally');
    globalIsInstalled = true;
    globalDeferredPrompt = null;
    notifyListeners();
  });

  const updateState = () => {
    const installed = checkIsInstalled();
    if (installed !== globalIsInstalled) {
      globalIsInstalled = installed;
      notifyListeners();
    }
  };

  window.addEventListener('focus', updateState);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') updateState();
  });
}

export function usePWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(globalDeferredPrompt);
  const [isInstalled, setIsInstalled] = useState<boolean>(globalIsInstalled);
  const [isIOS, setIsIOS] = useState(false);
  const [showInstallPrompt, setShowInstallPrompt] = useState(true);
  const [showInstallInstructions, setShowInstallInstructions] = useState(false);

  useEffect(() => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIOSDevice);

    const handleChange = () => {
      setDeferredPrompt(globalDeferredPrompt);
      setIsInstalled(globalIsInstalled);
    };

    listeners.add(handleChange);
    handleChange();

    return () => {
      listeners.delete(handleChange);
    };
  }, []);

  const installApp = async () => {
    if (globalDeferredPrompt) {
      try {
        await globalDeferredPrompt.prompt();
        const { outcome } = await globalDeferredPrompt.userChoice;
        console.log(`User response to install prompt: ${outcome}`);

        if (outcome === 'accepted') {
          globalIsInstalled = true;
          globalDeferredPrompt = null;
          notifyListeners();
        }
        return true;
      } catch (error) {
        console.error('Error during app installation:', error);
      }
    }

    // If no native prompt available (iOS / browser without prompt / event already used), show instructions modal
    setShowInstallInstructions(true);
    return false;
  };

  const dismissInstallPrompt = () => {
    setShowInstallPrompt(false);
  };

  return {
    canInstall: !!deferredPrompt,
    showInstallPrompt: showInstallPrompt && !isInstalled && !isIOS && !!deferredPrompt,
    isInstalled,
    isIOS,
    showInstallInstructions,
    setShowInstallInstructions,
    installApp,
    dismissInstallPrompt,
  };
}
