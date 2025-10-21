/**
 * Application Constants
 * Centralized constants to avoid magic numbers and improve maintainability
 */

// Chart and financial calculation multipliers
export const FINANCIAL_MULTIPLIERS = {
  // Price range calculations
  YEAR_RANGE_LOW: 0.8,
  YEAR_RANGE_HIGH: 1.2,
  DAY_RANGE_LOW: 0.98,
  DAY_RANGE_HIGH: 1.02,
  
  // Asset value calculations
  AVERAGE_PURCHASE_MULTIPLIER: 0.9,
  DEFAULT_QUANTITY: 10,
  MARKET_CAP_MULTIPLIER: 1000,
  
  // Number formatting thresholds
  TRILLION: 1e12,
  BILLION: 1e9,
  CRORE: 1e7,
  LAKH: 1e5,
  THOUSAND: 1e3,
} as const;

// Default financial values
export const DEFAULT_FINANCIAL_VALUES = {
  PE_RATIO: 22.42,
  DIVIDEND_YIELD: 3.83,
  EPS: 136.21,
  VOLUME: '1.6M',
} as const;

// Timeframes for charts
export const TIMEFRAMES = ['1D', '5D', '1M', '6M', 'YTD', '1Y', '5Y', 'MAX'] as const;
export type TimeFrame = typeof TIMEFRAMES[number];

// Asset detail tabs
export const ASSET_DETAIL_TABS = ['Overview', 'Financials', 'Historical Data', 'Earnings'] as const;
export type AssetDetailTab = typeof ASSET_DETAIL_TABS[number];

// Refresh control constants
export const REFRESH_CONTROL = {
  COLORS: ['#20E3B2'],
  BACKGROUND_COLOR: '#191a1a',
  TITLE_COLOR: '#e8eaed',
} as const;
