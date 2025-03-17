
/**
 * Simple rate limiter that works in both browser and server environments
 */
export class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private readonly windowMs: number;
  private readonly maxRequests: number;
  private readonly ipExemptList: Set<string>;

  constructor(options: {
    windowMs?: number;
    maxRequests?: number;
    ipExemptList?: string[];
  } = {}) {
    this.windowMs = options.windowMs || 60000; // Default: 1 minute
    this.maxRequests = options.maxRequests || 10; // Default: 10 requests per minute
    this.ipExemptList = new Set(options.ipExemptList || ['127.0.0.1', 'localhost', '::1']);
  }

  /**
   * Check if request should be rate limited
   * @param clientId Identifier for the client (IP address or user ID)
   * @returns Promise resolving to void if allowed, rejecting with error if rate limited
   */
  async checkRateLimit(clientId: string): Promise<void> {
    // Skip rate limiting for exempt clients
    if (this.ipExemptList.has(clientId)) {
      return;
    }
    
    const now = Date.now();
    const requestTimes = this.requests.get(clientId) || [];
    
    // Remove old requests
    const validRequests = requestTimes.filter(time => now - time < this.windowMs);
    
    if (validRequests.length >= this.maxRequests) {
      const oldestRequest = Math.min(...validRequests);
      const resetTime = oldestRequest + this.windowMs - now;
      const resetSeconds = Math.ceil(resetTime / 1000);
      
      throw new Error(`Too many requests. Rate limit exceeded. Please try again in ${resetSeconds} seconds.`);
    }
    
    validRequests.push(now);
    this.requests.set(clientId, validRequests);
    
    // Cleanup old entries occasionally to prevent memory leaks
    if (Math.random() < 0.01) { // 1% chance on each request
      this.cleanup();
    }
  }
  
  /**
   * Clean up expired rate limit data
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [id, times] of this.requests.entries()) {
      const validTimes = times.filter(time => now - time < this.windowMs);
      if (validTimes.length === 0) {
        this.requests.delete(id);
      } else {
        this.requests.set(id, validTimes);
      }
    }
  }
}
