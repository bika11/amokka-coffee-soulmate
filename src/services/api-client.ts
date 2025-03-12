
import { requestCache } from "@/utils/request-cache";
import { handleError, ApiError } from "@/utils/error-handler";

export interface ApiRequestOptions extends RequestInit {
  // Cache options
  cache?: boolean;
  cacheTtl?: number; // Time to live in milliseconds
  deduplicate?: boolean;
  
  // Error handling options
  errorMessage?: string;
  showErrorToast?: boolean;
  
  // Request customization
  baseUrl?: string;
  params?: Record<string, string | number | boolean | undefined>;
}

export interface ApiResponse<T> {
  data: T | null;
  error: ApiError | null;
  status: number;
}

/**
 * Helper to build API query parameters from an object
 */
function buildQueryParams(params?: Record<string, string | number | boolean | undefined>): string {
  if (!params) return '';
  
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.append(key, String(value));
    }
  });
  
  const queryString = queryParams.toString();
  return queryString ? `?${queryString}` : '';
}

/**
 * A wrapper around fetch that provides consistent error handling, caching,
 * and request deduplication.
 */
export async function apiRequest<T = any>(
  url: string, 
  options: ApiRequestOptions = {}
): Promise<ApiResponse<T>> {
  // Extract options with defaults
  const {
    cache = false,
    cacheTtl = 5 * 60 * 1000, // 5 minutes default
    deduplicate = true,
    errorMessage = "Failed to fetch data",
    showErrorToast = true,
    baseUrl = '',
    params,
    ...fetchOptions
  } = options;
  
  // Ensure headers object exists
  const headers = new Headers(fetchOptions.headers || {});
  
  // Set default content type for non-GET requests with a body
  if (
    fetchOptions.method && 
    fetchOptions.method !== 'GET' && 
    fetchOptions.body &&
    !headers.has('Content-Type')
  ) {
    headers.set('Content-Type', 'application/json');
  }
  
  // Build the complete URL
  const queryString = buildQueryParams(params);
  const fullUrl = `${baseUrl}${url}${queryString}`;
  
  // Generate a cache key based on URL and request options
  const cacheKey = `${fetchOptions.method || 'GET'}:${fullUrl}:${JSON.stringify(fetchOptions.body || {})}`;
  
  // Check cache first if enabled
  if (cache && fetchOptions.method === 'GET') {
    const cachedResponse = requestCache.get<ApiResponse<T>>(cacheKey);
    if (cachedResponse) {
      return cachedResponse;
    }
  }
  
  // Deduplicate identical in-flight requests if enabled
  const fetchFn = async (): Promise<ApiResponse<T>> => {
    try {
      const response = await fetch(fullUrl, {
        ...fetchOptions,
        headers
      });
      
      // Parse response based on content type
      let data = null;
      const contentType = response.headers.get('content-type');
      
      if (contentType?.includes('application/json')) {
        data = await response.json();
      } else if (contentType?.includes('text/')) {
        data = await response.text();
      } else {
        // Handle other content types or return raw response
        data = await response.blob();
      }
      
      // Create the response object
      const apiResponse: ApiResponse<T> = {
        data: response.ok ? (data as T) : null,
        status: response.status,
        error: null
      };
      
      // Handle unsuccessful responses
      if (!response.ok) {
        const error = new Error(
          data?.message || data?.error || `Error: ${response.status} ${response.statusText}`
        ) as ApiError;
        error.status = response.status;
        apiResponse.error = error;
        
        // Handle the error through our central error handler
        handleError(error, errorMessage, {
          showToast: showErrorToast,
          severity: 'error'
        });
      }
      
      // Cache successful GET responses if enabled
      if (cache && fetchOptions.method === 'GET' && response.ok) {
        requestCache.set(cacheKey, apiResponse, cacheTtl);
      }
      
      return apiResponse;
    } catch (error) {
      // Handle network/fetch errors
      const apiResponse: ApiResponse<T> = {
        data: null,
        status: 0, // Network error
        error: error as ApiError
      };
      
      // Handle the error through our central error handler
      handleError(error, errorMessage, {
        showToast: showErrorToast,
        severity: 'error'
      });
      
      return apiResponse;
    }
  };
  
  // Execute the fetch, with deduplication if enabled
  return deduplicate ? 
    requestCache.deduplicate<ApiResponse<T>>(cacheKey, fetchFn) : 
    fetchFn();
}

// Helper methods for common HTTP methods
export const apiClient = {
  /**
   * Make a GET request
   */
  async get<T>(url: string, options: ApiRequestOptions = {}): Promise<ApiResponse<T>> {
    return apiRequest<T>(url, { ...options, method: 'GET' });
  },
  
  /**
   * Make a POST request
   */
  async post<T>(url: string, data: any, options: ApiRequestOptions = {}): Promise<ApiResponse<T>> {
    return apiRequest<T>(url, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data)
    });
  },
  
  /**
   * Make a PUT request
   */
  async put<T>(url: string, data: any, options: ApiRequestOptions = {}): Promise<ApiResponse<T>> {
    return apiRequest<T>(url, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },
  
  /**
   * Make a PATCH request
   */
  async patch<T>(url: string, data: any, options: ApiRequestOptions = {}): Promise<ApiResponse<T>> {
    return apiRequest<T>(url, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  },
  
  /**
   * Make a DELETE request
   */
  async delete<T>(url: string, options: ApiRequestOptions = {}): Promise<ApiResponse<T>> {
    return apiRequest<T>(url, { ...options, method: 'DELETE' });
  },
  
  /**
   * Make batch requests and return all responses
   * @param requests Array of request functions that return a promise
   * @returns Array of responses in the same order as the requests
   */
  async batch<T>(requests: Array<() => Promise<ApiResponse<any>>>): Promise<ApiResponse<T>[]> {
    try {
      return await Promise.all(requests);
    } catch (error) {
      handleError(error, "Failed to execute batch requests");
      throw error;
    }
  }
};
