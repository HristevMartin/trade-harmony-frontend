
// src/hooks/usePageTracking.js
import { useEffect } from 'react';

const usePageTracking = (pageName = 'home') => {
  useEffect(() => {
    const trackPageVisit = async () => {
      try {
        console.log(`Tracking page visit: ${pageName}`);
        
        const response = await fetch(`${import.meta.env.VITE_API_URL}/travel/track-visit`, {
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
        console.error('Tracking error:', error);
      }
    };

    trackPageVisit();
  }, [pageName]);
};

export default usePageTracking;