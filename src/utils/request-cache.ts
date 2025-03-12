/**
 * A simple in-memory cache for API responses
 * Supports TTL (time-to-live) for cache entries
 */
export class RequestCache {
  private static instance: RequestCache;
  private cache: Map<string, { data: any; timestamp: number; ttl: number }>;
  private pendingRequests: Map<string, Promise<any>>;
  
  private constructor() {
    this.cache = new Map();
    this.pendingRequests = new Map();
  }
  
  public static getInstance(): RequestCache {
    if (!RequestCache.instance) {
      RequestCache.instance = new RequestCache();
    }
    return RequestCache.instance;
  }
  
  /**
   * Get a value from the cache
   * @param key Cache key
   * @returns Cached value or undefined if not found or expired
   */
  public get<T>(key: string): T | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;
    
    // Check if entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return undefined;
    }
    
    return entry.data as T;
  }
  
  /**
   * Set a value in the cache
   * @param key Cache key
   * @param data Data to cache
   * @param ttl Time to live in milliseconds (default: 5 minutes)
   */
  public set<T>(key: string, data: T, ttl = 5 * 60 * 1000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }
  
  /**
   * Check if a key exists in the cache and hasn't expired
   * @param key Cache key
   * @returns True if the key exists and hasn't expired
   */
  public has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    
    // Check if entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }
  
  /**
   * Delete a key from the cache
   * @param key Cache key
   */
  public delete(key: string): void {
    this.cache.delete(key);
  }
  
  /**
   * Clear all entries from the cache
   */
  public clear(): void {
    this.cache.clear();
  }
  
  /**
   * Deduplicate a request - if an identical request is in progress, return its promise
   * If no identical request is in progress, execute the request and cache the promise
   * @param key Request key
   * @param requestFn Function that returns a promise with the request
   * @returns Promise with the request result
   */
  public async deduplicate<T>(key: string, requestFn: () => Promise<T>): Promise<T> {
    // If there's already a pending request with this key, return it
    if (this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key) as Promise<T>;
    }
    
    // Otherwise, execute the request and store its promise
    const requestPromise = requestFn()
      .then(result => {
        // Remove from pending requests when done
        this.pendingRequests.delete(key);
        return result;
      })
      .catch(error => {
        // Remove from pending requests on error too
        this.pendingRequests.delete(key);
        throw error;
      });
    
    this.pendingRequests.set(key, requestPromise);
    return requestPromise;
  }
}

// Export a singleton instance
export const requestCache = RequestCache.getInstance();
