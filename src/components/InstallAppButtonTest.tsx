import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, Info } from 'lucide-react';
import InstallAppButton from './InstallAppButton';
import { usePWAInstall } from '@/hooks/usePWAInstall';

/**
 * Test component to verify PWA install functionality
 * This always shows install buttons for testing purposes
 */
const InstallAppButtonTest: React.FC = () => {
  const { canInstall, isInstalled, install, isInstalling } = usePWAInstall();

  const handleTestInstall = () => {
    if (canInstall) {
      install();
    } else {
      alert(`PWA install is not available in this browser/context. This could be because:

1. App is already installed
2. Browser doesn't support PWA installation
3. The beforeinstallprompt event hasn't fired yet
4. App doesn't meet PWA criteria`);
    }
  };

  return (
    <div className="p-6 bg-background border border-border rounded-lg space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <Info className="w-5 h-5" />
        PWA Install Test Panel
      </h3>
      
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <strong>Can Install:</strong> {canInstall ? '✅ Yes' : '❌ No'}
          </div>
          <div>
            <strong>Is Installed:</strong> {isInstalled ? '✅ Yes' : '❌ No'}
          </div>
          <div>
            <strong>Is Installing:</strong> {isInstalling ? '⏳ Yes' : '❌ No'}
          </div>
          <div>
            <strong>Standalone Mode:</strong> {window.matchMedia('(display-mode: standalone)').matches ? '✅ Yes' : '❌ No'}
          </div>
        </div>

        <div className="border-t pt-3">
          <p className="text-sm text-muted-foreground mb-3">
            Test buttons (the real InstallAppButton will only show when PWA install is available):
          </p>
          
          <div className="flex flex-wrap gap-2">
            {/* Always visible test button */}
            <Button
              onClick={handleTestInstall}
              variant="outline"
              size="sm"
              disabled={isInstalling}
            >
              <Download className="w-4 h-4 mr-2" />
              {isInstalling ? 'Installing...' : 'Test Install'}
            </Button>

            {/* Real InstallAppButton - will only show when available */}
            <InstallAppButton variant="default" size="sm">
              Real Install Button
            </InstallAppButton>

            {/* Force install prompt for testing */}
            <Button
              onClick={() => {
                // Dispatch a fake beforeinstallprompt event for testing
                const event = new Event('beforeinstallprompt') as any;
                event.prompt = async () => {
                  alert('Fake install prompt for testing');
                };
                event.userChoice = Promise.resolve({ outcome: 'dismissed', platform: 'test' });
                window.dispatchEvent(event);
              }}
              variant="secondary"
              size="sm"
            >
              Trigger Test Event
            </Button>
          </div>
        </div>

        <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded">
          <strong>Debug Info:</strong><br />
          Open browser console to see PWA install debug logs.<br />
          In Chrome: F12 → Console tab<br />
          Look for "[PWA Install]" messages.
        </div>
      </div>
    </div>
  );
};

export default InstallAppButtonTest;