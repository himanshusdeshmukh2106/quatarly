import { useMemo } from 'react';
import { useAssets } from '../../../../hooks/useAssets';
import { Asset } from '../../../../types';

// This is a placeholder for a more complex portfolio data hook.
// For now, it will expose the assets and loading/error states from useAssets.
// Calculations for portfolio value, returns, etc., would be added here.

export const usePortfolioData = () => {
  const { assets, loading, error, refreshAssets } = useAssets();

  // Memoized calculation of total portfolio value
  const portfolioValue = useMemo(() => {
    return assets.reduce((total: number, asset: Asset) => {
      // Use totalValue if available, otherwise calculate from quantity and price
      if (asset.totalValue) {
        return total + asset.totalValue;
      }
      return total;
    }, 0);
  }, [assets]);

  // Further calculations like total returns, today's change, etc., can be added here.

  return {
    assets,
    isLoading: loading,
    error,
    refetchAssets: refreshAssets,
    portfolioValue,
    // Add other calculated data points here
  };
};
