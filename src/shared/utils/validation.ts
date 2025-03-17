
/**
 * Common validation functions that work across environments
 */

/**
 * Validates if a string is a valid email address
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Sanitizes a string by removing potentially dangerous characters
 */
export const sanitizeString = (input: string): string => {
  if (!input) return '';
  return input
    .replace(/[<>&'"]/g, (char) => {
      switch (char) {
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '&': return '&amp;';
        case '"': return '&quot;';
        case "'": return '&#x27;';
        default: return char;
      }
    });
};

/**
 * Validates if a URL is well-formed and contains only allowed protocols
 */
export const isValidUrl = (url: string, allowedProtocols: string[] = ['http:', 'https:']): boolean => {
  try {
    const parsedUrl = new URL(url);
    return allowedProtocols.includes(parsedUrl.protocol);
  } catch (error) {
    return false;
  }
};

/**
 * Creates a deterministic cache key from an object
 */
export const createCacheKey = (data: Record<string, any>, prefix: string = ''): string => {
  // Create a deterministic string representation
  const str = JSON.stringify(data, Object.keys(data).sort());
  
  // Create a hash
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  return `${prefix}:${Math.abs(hash)}`;
};
