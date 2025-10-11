/**
 * Mock Data Index
 * 
 * Central export point for all mock data.
 * Only loaded when __DEV__ is true.
 */

export {
  mockAssets,
  mockTradableAssets,
  mockPhysicalAssets,
  getAssetMocks,
} from './assets';

export { mockInvestments, getInvestmentMocks } from './investments';

export { mockGoals, getGoalMocks } from './goals';

/**
 * Check if mock data should be used
 */
export const shouldUseMockData = (): boolean => {
  return __DEV__ && process.env.USE_MOCK_DATA !== 'false';
};

/**
 * Get all mock data
 */
export const getAllMocks = () => {
  if (!shouldUseMockData()) {
    return {
      assets: [],
      investments: [],
      goals: [],
    };
  }

  const { getAssetMocks } = require('./assets');
  const { getInvestmentMocks } = require('./investments');
  const { getGoalMocks } = require('./goals');

  return {
    assets: getAssetMocks(),
    investments: getInvestmentMocks(),
    goals: getGoalMocks(),
  };
};
