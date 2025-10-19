// src/hooks/usePageTracking.tsx
import { useEffect } from 'react';

const usePageTracking = (pageName = 'home') => {
  useEffect(() => {
    const trackPageVisit = async () => {
      // Check if API URL is configured
      const apiUrl = import.meta.env.VITE_API_URL;
      
      if (!apiUrl) {
        console.warn('VITE_API_URL not configured, skipping page tracking');
        return;
      }

      try {
        console.log(`Tracking page visit: ${pageName}`);
        
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
          console.log('Tracking successful:', result);
        } else {
          console.warn('Tracking failed:', response.status);
        }
      } catch (error) {
        // Silent fail - tracking should never break the app
        console.error('Tracking error (non-critical):', error);
      }
    };

    trackPageVisit();
  }, [pageName]);
};

export default usePageTracking;