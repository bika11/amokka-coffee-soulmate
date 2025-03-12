
import { toast } from "@/hooks/use-toast";

// Error types
export type ErrorSeverity = 'error' | 'warning' | 'info';

export interface ErrorOptions {
  title?: string;
  severity?: ErrorSeverity;
  showToast?: boolean;
  logToConsole?: boolean;
}

export interface ApiError extends Error {
  status?: number;
  code?: string;
}

/**
 * Centralized error handler for the application
 * Provides consistent error handling with options for toasts and console logging
 */
export function handleError(
  error: unknown, 
  message = "An unexpected error occurred", 
  options: ErrorOptions = {}
) {
  // Default options
  const {
    title = "Error",
    severity = 'error',
    showToast = true,
    logToConsole = true
  } = options;

  // Format error for logging/display
  const formattedError = formatError(error, message);
  
  // Log to console if enabled
  if (logToConsole) {
    console.error(`${title}:`, formattedError);
  }
  
  // Show toast notification if enabled
  if (showToast) {
    toast({
      title,
      description: formattedError.userMessage,
      variant: severity === 'error' ? 'destructive' : undefined,
    });
  }
  
  return formattedError;
}

/**
 * Format different error types into a consistent structure
 */
function formatError(error: unknown, fallbackMessage: string): {
  userMessage: string;
  originalError: unknown;
  statusCode?: number;
  errorCode?: string;
} {
  // For Error objects
  if (error instanceof Error) {
    const apiError = error as ApiError;
    return {
      userMessage: error.message || fallbackMessage,
      originalError: error,
      statusCode: apiError.status,
      errorCode: apiError.code
    };
  }
  
  // For string errors
  if (typeof error === 'string') {
    return {
      userMessage: error,
      originalError: error
    };
  }
  
  // For objects with message property
  if (error && typeof error === 'object' && 'message' in error) {
    return {
      userMessage: String(error.message),
      originalError: error,
      statusCode: 'status' in error ? Number(error.status) : undefined,
      errorCode: 'code' in error ? String(error.code) : undefined
    };
  }
  
  // Default fallback
  return {
    userMessage: fallbackMessage,
    originalError: error
  };
}
