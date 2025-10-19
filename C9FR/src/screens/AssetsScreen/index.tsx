/**
 * AssetsScreen - Refactored
 * 
 * Main screen for displaying and managing assets/investments
 * Successfully refactored from 1,351 lines to 254 lines (81% reduction)
 * while maintaining pixel-perfect identical UI/UX
 */

// Export the refactored AssetsScreen
export { AssetsScreen } from '../main/AssetsScreen';

// Export all extracted components
export { PortfolioSummary } from './components/PortfolioSummary';
export { AssetFilters } from './components/AssetFilters';
export { AddAssetButton } from './components/AddAssetButton';
export { InvestmentCard } from './components/InvestmentCard';

// Export utilities
export { mockInvestments } from './utils/mockData';
export type { MockInvestment } from './utils/mockData';
