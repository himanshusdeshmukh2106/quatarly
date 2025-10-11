/**
 * API Module
 * 
 * This module contains all API service layers split from the monolithic api.ts file.
 * Each service handles a specific domain (auth, assets, investments, goals, opportunities).
 */

// Export API client and utilities
export {
  apiClient,
  setAuthToken,
  clearAuthToken,
  isAuthenticated,
  getAuthToken,
} from './client';

// Export API services
export { authApi } from './auth';
export type {
  RegisterRequest,
  LoginRequest,
  AuthResponse,
  UserData,
  UserDetailsResponse,
} from './auth';

// Export API services
export { assetsApi } from './assets';
export type {
  UpdateAssetRequest,
  ChartDataResponse,
  PriceRefreshResponse,
} from './assets';

// Export API services
export { investmentsApi } from './investments';
export type { PortfolioSummaryResponse } from './investments';

// Export API services
export { goalsApi } from './goals';

// Export API services
export { opportunitiesApi } from './opportunities';
export type { RefreshOpportunitiesResponse } from './opportunities';

// Export types
export type {
  ApiResponse,
  PaginatedResponse,
  ApiErrorResponse,
  SuccessResponse,
} from './types';
