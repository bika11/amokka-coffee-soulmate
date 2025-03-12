
import { supabase } from "./client";
import { cacheData, getCachedData, measureQueryPerformance } from "@/utils/performance";

/**
 * A wrapper for Supabase queries to add caching and performance monitoring
 */
export const cachedQuery = async <T = any>(
  key: string,
  queryFn: () => Promise<{ data: T | null; error: any }>,
  options: { 
    ttl?: number;   // Time to live in milliseconds
    force?: boolean // Force refresh the cache
  } = {}
): Promise<{ data: T | null; error: any }> => {
  const { ttl = 60000, force = false } = options;
  
  // Check cache first (unless forcing refresh)
  if (!force) {
    const cachedResult = getCachedData<{ data: T | null; error: any }>(key);
    if (cachedResult) {
      return cachedResult;
    }
  }
  
  // Measure query performance
  const endMeasure = measureQueryPerformance(`cachedQuery:${key}`);
  
  try {
    // Execute the actual query
    const result = await queryFn();
    
    // Record performance
    endMeasure();
    
    // Cache the result if there's no error and we have data
    if (!result.error && result.data) {
      return cacheData(key, result, ttl);
    }
    
    return result;
  } catch (error) {
    // Record performance
    endMeasure();
    
    return { data: null, error };
  }
};

/**
 * Paginated query helper with caching
 */
export const paginatedQuery = async <T = any>(
  table: string,
  options: {
    page?: number;
    pageSize?: number;
    orderBy?: string;
    orderDirection?: 'asc' | 'desc';
    filters?: Record<string, any>;
    ttl?: number;
    force?: boolean;
  } = {}
): Promise<{
  data: T[] | null;
  count: number | null;
  error: any;
  hasMore: boolean;
}> => {
  const {
    page = 0,
    pageSize = 10,
    orderBy = 'created_at',
    orderDirection = 'desc',
    filters = {},
    ttl = 30000,
    force = false,
  } = options;
  
  // Create a cache key based on query parameters
  const filterString = JSON.stringify(filters);
  const cacheKey = `${table}:${page}:${pageSize}:${orderBy}:${orderDirection}:${filterString}`;
  
  // Check cache first
  if (!force) {
    const cachedResult = getCachedData<{
      data: T[] | null;
      count: number | null;
      error: any;
      hasMore: boolean;
    }>(cacheKey);
    
    if (cachedResult) {
      return cachedResult;
    }
  }
  
  // Measure query performance
  const endMeasure = measureQueryPerformance(`paginatedQuery:${table}`);
  
  // Calculate range start and end
  const from = page * pageSize;
  const to = from + pageSize - 1;
  
  try {
    // Create query builder
    let query = supabase
      .from(table)
      .select('*', { count: 'exact' })
      .order(orderBy, { ascending: orderDirection === 'asc' })
      .range(from, to);
    
    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          query = query.in(key, value);
        } else {
          query = query.eq(key, value);
        }
      }
    });
    
    // Execute query
    const { data, error, count } = await query;
    
    // Calculate if there are more results
    const hasMore = count ? from + pageSize < count : false;
    
    // Record performance
    endMeasure();
    
    const result = { data, count, error, hasMore };
    
    // Cache the result if there's no error
    if (!error) {
      return cacheData(cacheKey, result, ttl);
    }
    
    return result;
  } catch (error) {
    // Record performance
    endMeasure();
    
    return { data: null, count: null, error, hasMore: false };
  }
};

/**
 * Helper to invalidate cache for a specific table or query pattern
 */
export const invalidateQueryCache = (tableOrPattern: string): void => {
  // The pattern could be a table name or a more specific cache key pattern
  return cacheData(`${tableOrPattern}:`, null, 0);
};
