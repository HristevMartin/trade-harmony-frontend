import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface InstallAppButtonProps {
  className?: string;
  children?: React.ReactNode;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  showIcon?: boolean;
  /**
   * For local development only: if true, shows a fake install prompt after 3s
   * when the real beforeinstallprompt event is not fired.
   * Defaults to false. Never enable in preview/production.
   */
  devFallback?: boolean;
}

const InstallAppButton: React.FC<InstallAppButtonProps> = ({
  className,
  children,
  variant = 'default',
  size = 'default',
  showIcon = true,
  devFallback = false,
}) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    const checkIfInstalled = () => {
      console.log('[PWA Install] Checking if app is installed...');
      
      // Check for standalone mode (PWA installed)
      if (window.matchMedia('(display-mode: standalone)').matches) {
        console.log('[PWA Install] App is installed (standalone mode)');
        setIsInstalled(true);
        return;
      }
      
      // Check for iOS Safari standalone
      if ((window.navigator as any).standalone === true) {
        console.log('[PWA Install] App is installed (iOS standalone)');
        setIsInstalled(true);
        return;
      }
      
      console.log('[PWA Install] App is not installed');
    };

    checkIfInstalled();

    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      console.log('[PWA Install] beforeinstallprompt event fired');
      
      // Prevent the mini-infobar from appearing
      e.preventDefault();
      
      // Stash the event so it can be triggered later
      setDeferredPrompt(e);
      setIsVisible(true);
      
      console.log('[PWA Install] Install button is now visible');
    };

    const handleAppInstalled = () => {
      console.log('[PWA Install] App was installed');
      setIsInstalled(true);
      setIsVisible(false);
      setDeferredPrompt(null);
    };

    // Listen for the beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
    
    // Listen for the appinstalled event
    window.addEventListener('appinstalled', handleAppInstalled);

    // Development fallback: only if explicitly enabled and in dev
    const fallbackTimer = (import.meta.env.DEV && devFallback)
      ? setTimeout(() => {
          if (!deferredPrompt && !isInstalled) {
            console.log('[PWA Install] No beforeinstallprompt event received, showing fallback button for testing');
            const fakeEvent = {
              preventDefault: () => {},
              prompt: async () => {
                console.log('[PWA Install] Fake install prompt triggered');
                alert('This is a test install prompt. In a real PWA environment, the actual install dialog would appear.');
              },
              userChoice: Promise.resolve({ outcome: 'dismissed', platform: 'web' })
            } as BeforeInstallPromptEvent;
            setDeferredPrompt(fakeEvent);
            setIsVisible(true);
          }
        }, 3000)
      : undefined as unknown as number;

    return () => {
      if (fallbackTimer) clearTimeout(fallbackTimer);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [deferredPrompt, isInstalled]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      // Show the install prompt
      await deferredPrompt.prompt();

      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
        setIsVisible(false);
      } else {
        console.log('User dismissed the install prompt');
      }

      // Clear the deferredPrompt so it can be garbage collected
      setDeferredPrompt(null);
    } catch (error) {
      console.error('Error during install prompt:', error);
    }
  };

  // Debug logging
  console.log('[PWA Install] Render state:', { 
    isInstalled, 
    isVisible, 
    hasDeferredPrompt: !!deferredPrompt,
    shouldRender: !(isInstalled || !isVisible || !deferredPrompt)
  });

  // Don't render if already installed or not available
  if (isInstalled || !isVisible || !deferredPrompt) {
    return null;
  }

  return (
    <Button
      onClick={handleInstallClick}
      variant={variant}
      size={size}
      className={className}
    >
      {showIcon && <Download className="w-4 h-4 mr-2" />}
      {children || 'Install App'}
    </Button>
  );
};

export default InstallAppButton;
