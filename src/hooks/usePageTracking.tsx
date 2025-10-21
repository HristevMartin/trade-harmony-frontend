// src/hooks/usePageTracking.tsx
import { useEffect } from 'react';

const usePageTracking = (pageName = 'home') => {
  useEffect(() => {
    const trackPageVisit = async () => {
      // Check if API URL is configured
      const apiUrl = import.meta.env.VITE_API_URL;
      
      if (!apiUrl) {
        if (import.meta.env.DEV) {
          console.warn('[Page Tracking] VITE_API_URL not configured, skipping page tracking');
        }
        return;
      }

      try {
        if (import.meta.env.DEV) {
          console.log(`[Page Tracking] Tracking page visit: ${pageName} to ${apiUrl}/travel/track-visit`);
        }
        
        const response = await fetch(`${apiUrl}/travel/track-visit`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            page: pageName,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href,
          }),
        });

        if (response.ok) {
          const result = await response.json();
          if (import.meta.env.DEV) {
            console.log('[Page Tracking] Tracking successful:', result);
          }
        } else {
          if (import.meta.env.DEV) {
            console.warn('[Page Tracking] Tracking failed:', response.status, response.statusText);
          }
        }
      } catch (error) {
        // Silent fail - tracking should never break the app
        if (import.meta.env.DEV) {
          console.error('[Page Tracking] Error (non-critical):', error);
        }
      }
    };

    trackPageVisit();
  }, [pageName]);
};

export default usePageTracking;