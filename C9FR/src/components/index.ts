/**
 * Barrel exports for components
 * Enables tree shaking and cleaner imports
 */

// Core Components
export { default as AssetCard } from './AssetCard';
export { default as TradableAssetCard } from './TradableAssetCard';
export { default as PhysicalAssetCard } from './PhysicalAssetCard';
export { default as LazyAssetCard } from './LazyAssetCard';
export { default as VirtualizedAssetList } from './VirtualizedAssetList';

// UI Components
export { default as LoadingSpinner } from './LoadingSpinner';
export { default as ErrorBoundary } from './ErrorBoundary';
export { default as ProgressBar } from './ProgressBar';

// Premium UI Components
export { default as PremiumButton } from './PremiumButton';
export { default as PremiumInput } from './PremiumInput';
export { default as PremiumModal } from './PremiumModal';
export { default as PremiumCard } from './PremiumCard';
export { FinancialCard, GlassCard, InteractiveCard } from './PremiumCard';

// Chart Components
export { default as DonutChart } from './DonutChart';
export { default as PriceChart } from './PriceChart';
export { default as CandlestickChart } from './CandlestickChart';

// Card Components
export { default as InvestmentCard } from './InvestmentCard';
export { default as OpportunityCard } from './OpportunityCard';

// Selector Components
export { default as AssetTypeSelector } from './AssetTypeSelector';

// Import/Export Components
export { default as PDFImportComponent } from './PDFImportComponent';

// Modal Components
export { default as AddAssetModal } from './AddAssetModal';
export { default as EditAssetModal } from './EditAssetModal';
export { default as AddGoalModal } from './AddGoalModal';
export { default as AddInvestmentModal } from './AddInvestmentModal';
export { default as ProfileModal } from './ProfileModal';
export { default as SimpleProfileModal } from './SimpleProfileModal';

// Drawer Components
export { default as AssetInsightsDrawer } from './AssetInsightsDrawer';
export { default as InvestmentInsightsDrawer } from './InvestmentInsightsDrawer';
export { default as OpportunityInsightsDrawer } from './OpportunityInsightsDrawer';
export { default as AIInsightsDrawer } from './AIInsightsDrawer';

// Action Sheet Components
export { default as AssetActionSheet } from './AssetActionSheet';
