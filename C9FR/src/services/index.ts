/**
 * Barrel exports for services
 * Enables tree shaking and cleaner imports
 */

// API Client
export { default as apiClient } from './apiClient';

// Service Classes
export { AssetsService } from './assetsService';
export { InvestmentsService } from './investmentsService';
export { GoalsService } from './goalsService';
export { OpportunitiesService } from './opportunitiesService';
export { AuthService } from './authService';

// Individual function exports for backward compatibility
export * from './assetsService';
export * from './investmentsService';
export * from './goalsService';
export * from './opportunitiesService';
export * from './authService';

// Legacy API exports (for backward compatibility)
export * from './api';

// Other services
export { default as InvestmentCache } from './investmentCache';
export { default as PriceUpdateService } from './priceUpdateService';
export { PDFImportService } from './PDFImportService';
export { AIAssetService } from './aiAssetService';
export { SimpleAssetService } from './simpleAssetService';
export * from './expenseTracking';
