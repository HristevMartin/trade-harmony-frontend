/**
 * UK Postcode utilities
 * Format: AA9A 9AA (with optional space)
 */

/**
 * UK postcode regex - validates format only
 * Examples: SW1A 1AA, M1 1AE, B33 8TH, CR2 6XH, DN55 1PT
 */
const UK_POSTCODE_REGEX = /^[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}$/i;

/**
 * Check if a postcode matches the UK format
 */
export const isValidFormat = (postcode: string): boolean => {
  if (!postcode || typeof postcode !== 'string') return false;
  return UK_POSTCODE_REGEX.test(postcode.trim());
};

/**
 * Normalize a postcode to uppercase with single space
 * Example: "sw1a1aa" -> "SW1A 1AA"
 */
export const normalize = (postcode: string): string => {
  if (!postcode) return '';
  
  // Remove all spaces and uppercase
  const cleaned = postcode.replace(/\s/g, '').toUpperCase();
  
  // Insert space before last 3 characters
  if (cleaned.length >= 4) {
    return `${cleaned.slice(0, -3)} ${cleaned.slice(-3)}`;
  }
  
  return cleaned;
};

/**
 * Fetch postcode suggestions from postcodes.io
 */
export const fetchSuggestions = async (
  query: string,
  signal?: AbortSignal
): Promise<string[]> => {
  if (query.length < 3) return [];
  
  try {
    const response = await fetch(
      `https://api.postcodes.io/postcodes?q=${encodeURIComponent(query)}`,
      { signal }
    );
    
    if (!response.ok) return [];
    
    const data = await response.json();
    
    if (data.result && Array.isArray(data.result)) {
      return data.result
        .map((item: any) => item.postcode)
        .filter(Boolean)
        .slice(0, 20); // Get more from API, component will limit display
    }
    
    return [];
  } catch (error) {
    // Network errors, aborted requests, etc.
    if (error instanceof Error && error.name === 'AbortError') {
      return [];
    }
    console.warn('Postcode suggestions fetch failed:', error);
    return [];
  }
};

/**
 * Verify if a postcode exists via postcodes.io
 * Returns true if exists, false otherwise
 */
export const verifyPostcodeExists = async (
  postcode: string,
  signal?: AbortSignal
): Promise<boolean> => {
  if (!postcode || !isValidFormat(postcode)) return false;
  
  const normalized = normalize(postcode);
  
  try {
    const response = await fetch(
      `https://api.postcodes.io/postcodes/${encodeURIComponent(normalized)}`,
      { signal }
    );
    
    return response.ok && response.status === 200;
  } catch (error) {
    // Network errors, aborted requests
    if (error instanceof Error && error.name === 'AbortError') {
      return false;
    }
    console.warn('Postcode verification failed:', error);
    return false;
  }
};

