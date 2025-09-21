const originalFetch = window.fetch;

const interceptedFetch = async (url: RequestInfo | URL, options?: RequestInit): Promise<Response> => {
  // Call the original fetch
  const response = await originalFetch(url, options);
  
  // Check if this is a request to our API and if it's a 401 response
  const urlString = typeof url === 'string' ? url : url.toString();
  const isApiRequest = urlString.startsWith(import.meta.env.VITE_API_URL || '');
  
  if (isApiRequest && response.status === 401) {
    // Check if we're not already on the auth page to prevent infinite redirects
    const currentPath = window.location.pathname;
    if (currentPath !== '/auth') {
      // Get current path and query parameters
      const currentPathWithQuery = window.location.pathname + window.location.search;
      // Redirect to auth page with next parameter
      window.location.href = `/auth?next=${encodeURIComponent(currentPathWithQuery)}`;
    }
  }
  
  return response;
};

// Override the global fetch
window.fetch = interceptedFetch;

export { interceptedFetch as fetch };
