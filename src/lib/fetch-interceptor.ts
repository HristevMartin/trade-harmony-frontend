// Add a flag to track recent login
let justLoggedIn = false;
let loginTimestamp = 0;

export const markRecentLogin = () => {
  justLoggedIn = true;
  loginTimestamp = Date.now();
  setTimeout(() => { 
    justLoggedIn = false; 
  }, 8000);
};

const originalFetch = window.fetch;

const interceptedFetch = async (url: RequestInfo | URL, options?: RequestInit): Promise<Response> => {
  const urlString = typeof url === 'string' ? url : url.toString();
  const apiBase = import.meta.env.VITE_API_URL as string | undefined;
  const isApiRequest = apiBase ? urlString.startsWith(apiBase) : urlString.startsWith('/');
  
  const enhancedOptions: RequestInit = {
    ...options,
    credentials: isApiRequest ? 'include' : (options?.credentials || 'same-origin')
  };

  // Call the original fetch with enhanced options
  const response = await originalFetch(url, enhancedOptions);
  
  if (isApiRequest && response.status === 401) {
    const timeSinceLogin = Date.now() - loginTimestamp;
    const hasCookies = document.cookie.includes('session') || document.cookie.length > 0;
    
    console.log('🔴 401 Response:', {
      url: urlString,
      justLoggedIn,
      timeSinceLogin,
      hasCookies,
      cookieCount: document.cookie.split(';').filter(c => c.trim()).length,
      currentPath: window.location.pathname
    });
    
    if (justLoggedIn || timeSinceLogin < 8000) {
      console.log('⏳ Skipping redirect - recent login');
      return response;
    }
    
    try {
      if (apiBase) {
        const sessionCheck = await originalFetch(`${apiBase}/travel/auth/session`, {
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          cache: 'no-store'
        });
        if (sessionCheck.ok) {
          const sessionData = await sessionCheck.json();
          if (sessionData && sessionData.authenticated) {
            console.log('✅ Session valid after 401. Suppressing redirect.');
            return response;
          }
        }
      }
    } catch (e) {
      console.log('⚠️ Session re-check failed, proceeding to redirect');
    }
    
    const currentPath = window.location.pathname;
    if (currentPath !== '/auth') {
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const currentPathWithQuery = window.location.pathname + window.location.search;
      
      console.log('🔄 Redirecting to auth with next:', currentPathWithQuery);
      
      window.location.href = `/auth?next=${encodeURIComponent(currentPathWithQuery)}`;
    }
  }
  
  return response;
};

// Override the global fetch
window.fetch = interceptedFetch;

export { interceptedFetch as fetch };