
export class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private readonly windowMs = 60000; // 1 minute
  private readonly maxRequests = 10; // 10 requests per minute

  async checkRateLimit(clientIp: string): Promise<void> {
    const now = Date.now();
    const requestTimes = this.requests.get(clientIp) || [];
    
    // Remove old requests
    const validRequests = requestTimes.filter(time => now - time < this.windowMs);
    
    if (validRequests.length >= this.maxRequests) {
      throw new Error('Too many requests, please try again later');
    }
    
    validRequests.push(now);
    this.requests.set(clientIp, validRequests);
  }
}
