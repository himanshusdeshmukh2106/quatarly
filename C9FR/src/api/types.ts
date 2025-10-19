/**
 * API Types
 * 
 * Common types for API requests and responses
 */

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
}

/**
 * Paginated API response
 */
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

/**
 * API error response
 */
export interface ApiErrorResponse {
  code: string;
  message: string;
  details?: Record<string, string[]>;
}

/**
 * Success response with message
 */
export interface SuccessResponse {
  message: string;
  success: boolean;
}
