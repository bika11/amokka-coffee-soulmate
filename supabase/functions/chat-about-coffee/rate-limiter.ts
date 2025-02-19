
class RateLimiter {
  private requests: Map<string, { count: number; timestamp: number }> = new Map();
  private readonly limit: number;
  private readonly windowMs: number;

  constructor(limit = 20, windowMs = 60000) {
    this.limit = limit;
    this.windowMs = windowMs;
    this.cleanup();
  }

  private cleanup() {
    const now = Date.now();
    for (const [key, value] of this.requests.entries()) {
      if (now - value.timestamp > this.windowMs) {
        this.requests.delete(key);
      }
    }
    // Run cleanup every minute
    setTimeout(() => this.cleanup(), 60000);
  }

  isRateLimited(ip: string): boolean {
    const now = Date.now();
    const requestData = this.requests.get(ip) || { count: 0, timestamp: now };

    // Reset if window has passed
    if (now - requestData.timestamp > this.windowMs) {
      requestData.count = 1;
      requestData.timestamp = now;
    } else {
      requestData.count++;
    }

    this.requests.set(ip, requestData);
    return requestData.count > this.limit;
  }
}

export const rateLimiter = new RateLimiter();
