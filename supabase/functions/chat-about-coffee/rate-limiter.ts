
export class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private readonly windowMs = 60000; // 1 minute
  private readonly maxRequests = 10; // Increased from 5 to 10 requests per minute
  private readonly ipExemptList = new Set(['127.0.0.1', 'localhost', '::1']); // Added ::1 for IPv6 localhost

  async checkRateLimit(clientIp: string): Promise<void> {
    // Skip rate limiting for local development
    if (this.ipExemptList.has(clientIp)) {
      return;
    }
    
    const now = Date.now();
    const requestTimes = this.requests.get(clientIp) || [];
    
    // Remove old requests
    const validRequests = requestTimes.filter(time => now - time < this.windowMs);
    
    if (validRequests.length >= this.maxRequests) {
      const oldestRequest = Math.min(...validRequests);
      const resetTime = oldestRequest + this.windowMs - now;
      const resetSeconds = Math.ceil(resetTime / 1000);
      
      throw new Error(`Too many requests. Rate limit exceeded. Please try again in ${resetSeconds} seconds.`);
    }
    
    validRequests.push(now);
    this.requests.set(clientIp, validRequests);
    
    // Cleanup old IPs occasionally to prevent memory leaks
    if (Math.random() < 0.01) { // 1% chance on each request
      this.cleanup();
    }
  }
  
  private cleanup(): void {
    const now = Date.now();
    for (const [ip, times] of this.requests.entries()) {
      const validTimes = times.filter(time => now - time < this.windowMs);
      if (validTimes.length === 0) {
        this.requests.delete(ip);
      } else {
        this.requests.set(ip, validTimes);
      }
    }
  }
}
