// Add a flag to track recent login
let justLoggedIn = false;
let loginTimestamp = 0;

export const markRecentLogin = () => {
  justLoggedIn = true;
  loginTimestamp = Date.now();
  console.log('🟢 markRecentLogin called at', new Date().toISOString());
  setTimeout(() => { 
    justLoggedIn = false;
    console.log('⏰ justLoggedIn flag cleared after 15s');
  }, 15000);
};

const originalFetch = window.fetch;

const interceptedFetch = async (url: RequestInfo | URL, options?: RequestInit): Promise<Response> => {
  const urlString = typeof url === 'string' ? url : url.toString();
  const apiBase = import.meta.env.VITE_API_URL as string | undefined;
  const isApiRequest = apiBase ? urlString.startsWith(apiBase) : urlString.startsWith('/');
  
  // Log API requests
  if (isApiRequest) {
    console.log('🌐 API Request:', {
      url: urlString,
      method: options?.method || 'GET',
      credentials: options?.credentials,
      hasBody: !!options?.body
    });
  }
  
  const enhancedOptions: RequestInit = {
    ...options,
    credentials: isApiRequest ? 'include' : (options?.credentials || 'same-origin')
  };

  // Call the original fetch with enhanced options
  const response = await originalFetch(url, enhancedOptions);
  
  // Log response
  if (isApiRequest) {
    console.log('📥 API Response:', {
      url: urlString,
      status: response.status,
      statusText: response.statusText,
      headers: {
        'set-cookie': response.headers.get('set-cookie'),
        'content-type': response.headers.get('content-type')
      }
    });
  }
  
  if (isApiRequest && response.status === 401) {
    const authEndpoints = [
      '/auth/google',
      '/api/auth/google',
      '/travel/auth/google',
      '/travel/login',
      '/travel/register'
    ];
    // Skip interceptor logic for Google auth endpoint
    if (authEndpoints.some(endpoint => urlString.includes(endpoint))) {
      console.log('⏭️ Skipping interceptor for Google auth endpoint');
      return response;
    }
    
    const timeSinceLogin = Date.now() - loginTimestamp;
    const allCookies = document.cookie;
    
    console.log('🔴 401 Response Detected:', {
      url: urlString,
      justLoggedIn,
      timeSinceLogin,
      allCookies,
      cookiesList: allCookies.split(';').map(c => c.trim()),
      currentPath: window.location.pathname
    });
    
    if (justLoggedIn || timeSinceLogin < 15000) {
      console.log('⏳ Skipping redirect - recent login (time since login:', timeSinceLogin, 'ms)');
      return response;
    }
    
    try {
      if (apiBase) {
        console.log('🔍 Checking session validity...');
        const sessionCheck = await originalFetch(`${apiBase}/travel/auth/session`, {
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          cache: 'no-store'
        });
        
        console.log('📊 Session check response:', sessionCheck.status);
        
        if (sessionCheck.ok) {
          const sessionData = await sessionCheck.json();
          console.log('📊 Session data:', sessionData);
          
          if (sessionData && sessionData.authenticated) {
            console.log('✅ Session valid after 401. Suppressing redirect.');
            return response;
          }
        }
      }
    } catch (e) {
      console.log('⚠️ Session re-check failed:', e);
    }
    
    const currentPath = window.location.pathname;
    if (currentPath !== '/auth') {
      console.log('⏱️ Waiting 200ms before redirect...');
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Clear auth data from localStorage before redirecting
      console.log('🗑️ Clearing auth_user from localStorage');
      localStorage.removeItem('auth_user');
      
      const currentPathWithQuery = window.location.pathname + window.location.search;
      
      console.log('🔄 Redirecting to auth with next:', currentPathWithQuery);
      
      window.location.href = `/auth?next=${encodeURIComponent(currentPathWithQuery)}`;
    }
  }
  
  return response;
};

// Override the global fetch
window.fetch = interceptedFetch;

console.log('🔧 Fetch interceptor installed. API Base:', import.meta.env.VITE_API_URL);

export { interceptedFetch as fetch };