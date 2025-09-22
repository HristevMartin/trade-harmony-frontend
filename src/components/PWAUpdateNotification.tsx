import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { RefreshCw, Wifi, WifiOff } from 'lucide-react';
// @ts-ignore
import { useRegisterSW } from 'virtual:pwa-register/react';

const PWAUpdateNotification = () => {
  const [offlineReady, setOfflineReady] = useState(false);
  const [needRefresh, setNeedRefresh] = useState(false);

  const {
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(swUrl, r) {
      console.log(`Service worker registered at: ${swUrl}`);
    },
    onRegisterError(error) {
      console.log('Service worker registration error', error);
    },
    onOfflineReady() {
      setOfflineReady(true);
      toast.success('App ready to work offline!', {
        description: 'You can now use the app without an internet connection',
        icon: <WifiOff className="h-4 w-4" />,
      });
    },
    onNeedRefresh() {
      setNeedRefresh(true);
      toast('New update available!', {
        description: 'Click to reload and get the latest features',
        action: {
          label: 'Update Now',
          onClick: () => updateServiceWorker(true),
        },
        duration: 0, // Don't auto-dismiss
        icon: <RefreshCw className="h-4 w-4" />,
      });
    },
  });

  return null;
};

export default PWAUpdateNotification;