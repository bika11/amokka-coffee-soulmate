
import { ChatCompletionRequestMessage } from "./types.ts";

/**
 * Service for caching AI responses to reduce API calls and improve performance
 */
export class CacheService {
  private cache: Map<string, { data: any, timestamp: number }>;
  private readonly cacheTTL: number;

  constructor(cacheTTL = 5 * 60 * 1000) { // 5 minutes default TTL
    this.cache = new Map();
    this.cacheTTL = cacheTTL;
  }

  /**
   * Get cached response if available and not expired
   */
  get(key: string): any | null {
    const cachedItem = this.cache.get(key);
    
    if (!cachedItem) {
      console.log(`Cache miss for key: ${key}`);
      return null;
    }
    
    // Check if cache has expired
    if (Date.now() - cachedItem.timestamp >= this.cacheTTL) {
      this.cache.delete(key);
      return null;
    }
    
    console.log(`Cache hit for key: ${key}`);
    return cachedItem.data;
  }

  /**
   * Store response in cache
   */
  set(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
    console.log(`Cached response for key: ${key}`);
    
    // Cleanup old cache entries occasionally to prevent memory leaks
    if (Math.random() < 0.05) { // 5% chance on each cache set
      this.cleanup();
    }
  }

  /**
   * Generate a deterministic cache key for messages
   */
  generateCacheKey(messages: ChatCompletionRequestMessage[], model: string, promptId: string): string {
    // Create a deterministic string representation of the messages
    const messagesStr = JSON.stringify(messages.map(m => ({
      role: m.role,
      content: m.content
    })));
    
    // Generate a hash for the messages
    let hash = 0;
    for (let i = 0; i < messagesStr.length; i++) {
      const char = messagesStr.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    
    return `${model}:${promptId}:${Math.abs(hash)}`;
  }

  /**
   * Clean up expired cache entries
   */
  private cleanup(): void {
    let removedCount = 0;
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp >= this.cacheTTL) {
        this.cache.delete(key);
        removedCount++;
      }
    }
    console.log(`Removed ${removedCount} expired entries from cache`);
  }
}
