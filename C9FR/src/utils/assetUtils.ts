import { Asset, AssetType, TradableAsset, PhysicalAsset } from '../types';

// Type guards for safe property access
export const isTradableAsset = (asset: Asset): asset is TradableAsset => {
    return ['stock', 'etf', 'bond', 'crypto'].includes(asset.assetType);
};

export const isPhysicalAsset = (asset: Asset): asset is PhysicalAsset => {
    return ['gold', 'silver', 'commodity'].includes(asset.assetType);
};

// Asset type detection utilities
export const assetTypeUtils = {
    isTradeable: (asset: Asset): boolean => {
        return ['stock', 'etf', 'bond', 'crypto'].includes(asset.assetType);
    },

    isPhysical: (asset: Asset): boolean => {
        return ['gold', 'silver', 'commodity'].includes(asset.assetType);
    },

    requiresSymbol: (asset: Asset): boolean => {
        return ['stock', 'etf', 'bond', 'crypto'].includes(asset.assetType);
    },

    supportsChartData: (asset: Asset): boolean => {
        return ['stock', 'etf', 'crypto'].includes(asset.assetType);
    },

    getDisplayUnit: (asset: Asset): string => {
        if (['stock', 'etf'].includes(asset.assetType)) {
            return 'shares';
        } else if (asset.assetType === 'crypto') {
            return 'coins';
        } else if (['gold', 'silver'].includes(asset.assetType)) {
            return isPhysicalAsset(asset) ? asset.unit : 'grams';
        } else {
            return isPhysicalAsset(asset) ? asset.unit : 'units';
        }
    },

    getSymbolOrAbbreviation: (asset: Asset): string => {
        if (isTradableAsset(asset) && asset.symbol) {
            return asset.symbol;
        }
        const words = asset.name.split(' ');
        if (words.length >= 2) {
            return words.slice(0, 2).map(word => word.charAt(0)).join('').toUpperCase();
        }
        return asset.name.substring(0, 2).toUpperCase();
    }
};

// Data formatting utilities
export const assetFormatters = {
    formatCurrency: (amount: number, currency?: string): string => {
        if (currency === 'USD') {
            return `$${amount.toFixed(2)}`;
        }
        return `₹${amount.toFixed(2)}`;
    },

    formatPerformanceChange: (change: number, changePercent: number): string => {
        const isNegative = change < 0;
        const arrow = isNegative ? '↓' : '↑';
        return `${arrow} ${Math.abs(changePercent).toFixed(2)}%`;
    },

    formatVolume: (asset: Asset): string => {
        if (isTradableAsset(asset) && asset.volume) {
            return asset.volume;
        }
        const baseVolume = Math.floor(asset.totalValue / 1000);
        return `${(baseVolume / 1000).toFixed(1)}K`;
    },

    formatMarketCap: (asset: Asset): string => {
        if (isTradableAsset(asset) && asset.marketCap) {
            return `${(asset.marketCap / 1000000).toFixed(1)}M`;
        }
        const baseCap = asset.totalValue * (isPhysicalAsset(asset) ? 50 : 100);
        if (baseCap > 1000000000) {
            return `${(baseCap / 1000000000).toFixed(1)}B`;
        }
        return `${(baseCap / 1000000).toFixed(1)}M`;
    },

    formatPERatio: (asset: Asset): string => {
        if (isTradableAsset(asset) && asset.peRatio) {
            return asset.peRatio.toFixed(2);
        }
        return (Math.random() * 50 + 10).toFixed(2);
    },

    formatGrowthRate: (asset: Asset): string | null => {
        if (isTradableAsset(asset) && asset.growthRate !== undefined) {
            return `${asset.growthRate.toFixed(1)}%`;
        }
        return null;
    }
};

// Chart data processing utilities
export const chartDataProcessor = {
    generateChartData: (asset: Asset): number[] => {
        const basePrice = getCurrentPrice(asset);
        const isPositive = asset.totalGainLoss >= 0;
        const data: number[] = [];
        let currentPrice = basePrice * 1.2;

        for (let i = 0; i < 12; i++) {
            data.push(currentPrice);
            const change = isPositive
                ? (Math.random() - 0.3) * (basePrice * 0.02)
                : (Math.random() - 0.7) * (basePrice * 0.02);
            currentPrice += change;
        }
        data[data.length - 1] = basePrice;
        return data;
    },

    calculateChartBounds: (data: number[]): { min: number; max: number } => {
        const min = Math.min(...data);
        const max = Math.max(...data);
        return { min, max };
    },

    getYAxisLabels: (bounds: { min: number; max: number }): string[] => {
        const { min, max } = bounds;
        const range = max - min;
        return [
            Math.round(max).toString(),
            Math.round(min + range * 0.67).toString(),
            Math.round(min + range * 0.33).toString()
        ];
    }
};

// Additional utility functions
export const getCurrentPrice = (asset: Asset): number => {
    if (isTradableAsset(asset)) {
        return asset.currentPrice || asset.totalValue;
    }
    if (isPhysicalAsset(asset)) {
        return asset.currentMarketPrice || asset.purchasePrice || 0;
    }
    return asset.totalValue;
};

export const getChangeValues = (asset: Asset): { change: number; changePercent: number } => {
    const change = asset.totalGainLoss || 0;
    const changePercent = asset.totalGainLossPercent || 0;
    return { change, changePercent };
};

export const getPerformanceColor = (value: number, theme: any): string => {
    if (value > 0) return theme.profit;
    if (value < 0) return theme.loss;
    return theme.textMuted;
};

// Legacy investment object support
export interface LegacyInvestment {
    id: string;
    name: string;
    symbol: string;
    price: number;
    change: number;
    changePercent: number;
    volume: string;
    marketCap: string;
    peRatio: number;
    growthRate?: number;
    chartData: number[];
    insight: string;
    time: string;
}

export const legacyInvestmentAdapter = {
    convertToAsset: (investment: LegacyInvestment): TradableAsset => {
        return {
            id: investment.id,
            name: investment.name,
            assetType: 'stock' as AssetType,
            totalValue: investment.price,
            totalGainLoss: investment.change,
            totalGainLossPercent: investment.changePercent,
            aiAnalysis: investment.insight,
            riskLevel: 'medium',
            recommendation: 'hold',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            lastUpdated: new Date().toISOString(),
            symbol: investment.symbol,
            currency: 'USD',
            quantity: 1,
            currentPrice: investment.price,
            averagePurchasePrice: investment.price,
            dailyChange: investment.change,
            dailyChangePercent: investment.changePercent,
            chartData: investment.chartData.map((price, index) => ({
                date: new Date(Date.now() - (investment.chartData.length - index) * 24 * 60 * 60 * 1000).toISOString(),
                open: price,
                high: price * 1.02,
                low: price * 0.98,
                close: price,
                volume: parseFloat(investment.volume.replace(/[^0-9.]/g, '')) || 0,
                timestamp: Date.now() - (investment.chartData.length - index) * 24 * 60 * 60 * 1000
            })),
            exchange: 'NASDAQ',
            volume: investment.volume,
            marketCap: parseFloat(investment.marketCap.replace(/[^0-9.]/g, '')) * 1000000,
            peRatio: investment.peRatio,
            growthRate: investment.growthRate
        };
    },

    isLegacyInvestment: (obj: any): obj is LegacyInvestment => {
        return obj && typeof obj === 'object' &&
            'price' in obj && 'changePercent' in obj && 'insight' in obj;
    }
};

// Enhanced chart data processing utilities - optimized for UnifiedAssetCard
export const enhancedChartProcessor = {
  generateChartData: (asset: Asset): number[] => {
    const basePrice = getCurrentPrice(asset);
    const isPositive = asset.totalGainLoss >= 0;
    const data: number[] = [];
    let currentPrice = basePrice * 1.2; // Start higher for downward trend

    for (let i = 0; i < 12; i++) {
      data.push(currentPrice);
      // Create a general trend with some variation
      const change = isPositive
        ? (Math.random() - 0.3) * (basePrice * 0.02) // Slight upward bias for positive
        : (Math.random() - 0.7) * (basePrice * 0.02); // Downward bias for negative
      currentPrice += change;
    }

    // Ensure the last point matches the current price
    data[data.length - 1] = basePrice;
    return data;
  },

  calculateChartBounds: (data: number[]): { min: number; max: number } => {
    if (!data || data.length === 0) {
      return { min: 0, max: 100 };
    }
    
    const validData = data.filter(point => typeof point === 'number' && isFinite(point));
    if (validData.length === 0) {
      return { min: 0, max: 100 };
    }
    
    const min = Math.min(...validData);
    const max = Math.max(...validData);
    return { min, max };
  },

  getYAxisLabels: (data: number[]): string[] => {
    const bounds = enhancedChartProcessor.calculateChartBounds(data);
    const { min, max } = bounds;
    const range = max - min || 1;
    
    return [
      Math.round(max).toString(),
      Math.round(min + range * 0.67).toString(),
      Math.round(min + range * 0.33).toString()
    ];
  },

  // Validate chart data for rendering
  validateChartData: (data: number[]): boolean => {
    return Array.isArray(data) && 
           data.length > 1 && 
           data.every(point => typeof point === 'number' && isFinite(point));
  },

  // Generate fallback chart data
  generateFallbackChartData: (): number[] => {
    return [100, 105, 102, 108, 103, 110, 107, 112, 109, 115, 111, 110];
  }
};

// Performance optimization utilities
export const assetPerformanceUtils = {
  // Memoization cache for expensive calculations
  memoCache: new Map<string, any>(),

  // Memoize expensive asset calculations
  memoize: <T>(key: string, fn: () => T): T => {
    if (assetPerformanceUtils.memoCache.has(key)) {
      return assetPerformanceUtils.memoCache.get(key);
    }
    const result = fn();
    assetPerformanceUtils.memoCache.set(key, result);
    return result;
  },

  // Clear memoization cache
  clearCache: (): void => {
    assetPerformanceUtils.memoCache.clear();
  },

  // Generate cache key for asset
  generateCacheKey: (asset: Asset, operation: string): string => {
    return `${asset.id}_${operation}_${asset.updatedAt}`;
  },

  // Debounce function for rapid interactions
  debounce: <T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): ((...args: Parameters<T>) => void) => {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }
};

// Enhanced error handling utilities
export const assetErrorHandling = {
  // Validate asset data
  validateAsset: (asset: any): asset is Asset => {
    return asset &&
           typeof asset === 'object' &&
           typeof asset.id === 'string' &&
           typeof asset.name === 'string' &&
           typeof asset.assetType === 'string' &&
           typeof asset.totalValue === 'number' &&
           isFinite(asset.totalValue);
  },

  // Get safe numeric value
  getSafeNumber: (value: any, fallback: number = 0): number => {
    if (typeof value === 'number' && isFinite(value)) {
      return value;
    }
    return fallback;
  },

  // Get safe string value
  getSafeString: (value: any, fallback: string = 'N/A'): string => {
    if (typeof value === 'string' && value.trim().length > 0) {
      return value;
    }
    return fallback;
  },

  // Handle division by zero
  safeDivide: (numerator: number, denominator: number, fallback: number = 0): number => {
    if (denominator === 0 || !isFinite(denominator) || !isFinite(numerator)) {
      return fallback;
    }
    const result = numerator / denominator;
    return isFinite(result) ? result : fallback;
  }
};