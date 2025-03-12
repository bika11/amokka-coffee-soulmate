
import { onCLS, onFID, onLCP, onFCP, onTTFB, Metric } from 'web-vitals';

const reportMetric = (metric: Metric) => {
  // Log to console in development
  if (import.meta.env.DEV) {
    console.log(metric);
  }
  
  // In production, you could send to an analytics service
  // Example: sendToAnalytics(metric);
};

export const reportWebVitals = () => {
  onCLS(reportMetric);
  onFID(reportMetric);
  onLCP(reportMetric);
  onFCP(reportMetric);
  onTTFB(reportMetric);
};

// Helper to measure component render time
export const measureRenderTime = (componentName: string) => {
  const startTime = performance.now();
  
  return () => {
    const endTime = performance.now();
    console.log(`[Performance] ${componentName} rendered in ${endTime - startTime}ms`);
  };
};

// Helper to record interaction timing
export const recordInteraction = (interactionName: string) => {
  const startTime = performance.now();
  
  // Return a function that calculates and logs the duration when called
  return () => {
    const endTime = performance.now();
    console.log(`[Performance] ${interactionName} took ${endTime - startTime}ms`);
    // Return void explicitly to make the type clearer
    return;
  };
};

// Cache management helpers
type CacheItem<T> = {
  data: T;
  timestamp: number;
  ttl: number;
};

const memoryCache = new Map<string, CacheItem<any>>();

export const cacheData = <T>(key: string, data: T, ttlMs: number = 60000): T => {
  memoryCache.set(key, {
    data,
    timestamp: Date.now(),
    ttl: ttlMs
  });
  return data;
};

export const getCachedData = <T>(key: string): T | null => {
  const item = memoryCache.get(key);
  
  if (!item) return null;
  
  // Check if cache item is expired
  if (Date.now() - item.timestamp > item.ttl) {
    memoryCache.delete(key);
    return null;
  }
  
  return item.data as T;
};

export const clearCache = (keyPrefix?: string): void => {
  if (keyPrefix) {
    // Delete only keys with the provided prefix
    for (const key of memoryCache.keys()) {
      if (key.startsWith(keyPrefix)) {
        memoryCache.delete(key);
      }
    }
  } else {
    // Clear entire cache
    memoryCache.clear();
  }
};

// Database query performance monitoring
export const measureQueryPerformance = (queryName: string) => {
  const startTime = performance.now();
  
  return () => {
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    // Log queryName and duration
    console.log(`[DB Query] ${queryName} took ${duration}ms`);
    
    // Alert for slow queries in development
    if (import.meta.env.DEV && duration > 500) {
      console.warn(`[Performance Warning] Slow query detected: ${queryName} (${duration}ms)`);
    }
    
    return duration;
  };
};
