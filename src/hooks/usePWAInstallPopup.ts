import { useState, useEffect, useCallback } from 'react';

interface PWAInstallPopupState {
  isPopupOpen: boolean;
  canInstall: boolean;
  showPopup: () => void;
  hidePopup: () => void;
  triggerInstall: () => void;
  forceShowPopup: () => void; // For testing
}

const usePWAInstallPopup = (): PWAInstallPopupState => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [canInstall, setCanInstall] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  // Check if already dismissed or installed
  const isDismissed = localStorage.getItem('pwa-install-dismissed') === 'true';

  useEffect(() => {
    // Check if app is already installed
    const checkIfInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isInWebAppChrome = (window.navigator as any).standalone === true;
      setIsInstalled(isStandalone || isInWebAppChrome);
    };

    checkIfInstalled();

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstall(true);
    };

    // Listen for appinstalled event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setCanInstall(false);
      setDeferredPrompt(null);
      setIsPopupOpen(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Auto-show popup logic  
  useEffect(() => {
    console.log('PWA Popup State:', { canInstall, isInstalled, isDismissed, isPopupOpen });
    
    if (!isInstalled && !isDismissed && !isPopupOpen) {
      // Show popup after a short delay regardless of canInstall for better UX
      const visitCount = parseInt(localStorage.getItem('pwa-visit-count') || '0');
      const newVisitCount = visitCount + 1;
      localStorage.setItem('pwa-visit-count', newVisitCount.toString());

      console.log('PWA Visit count:', newVisitCount);

      // Fast appearance for testing: ~1s regardless of visit count
      const delay = 1000;

      console.log('PWA Popup will show in:', delay / 1000, 'seconds');

      const timer = setTimeout(() => {
        if (!isInstalled && !isDismissed) {
          console.log('Showing PWA popup');
          setIsPopupOpen(true);
        }
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [isInstalled, isDismissed, isPopupOpen, canInstall]);

  const showPopup = useCallback(() => {
    if (!isInstalled && !isDismissed) {
      setIsPopupOpen(true);
    }
  }, [isInstalled, isDismissed]);

  const hidePopup = useCallback(() => {
    setIsPopupOpen(false);
  }, []);

  const triggerInstall = useCallback(async () => {
    if (deferredPrompt) {
      try {
        const result = await deferredPrompt.prompt();
        console.log('PWA install prompt result:', result);
        
        if (result.outcome === 'accepted') {
          console.log('User accepted the install prompt');
        } else {
          console.log('User dismissed the install prompt');
        }
        
        setDeferredPrompt(null);
        setCanInstall(false);
      } catch (error) {
        console.error('Error showing install prompt:', error);
      }
    }
  }, [deferredPrompt]);

  const forceShowPopup = useCallback(() => {
    setIsPopupOpen(true);
  }, []);

  return {
    isPopupOpen,
    canInstall,
    showPopup,
    hidePopup,
    triggerInstall,
    forceShowPopup
  };
};

export default usePWAInstallPopup;
