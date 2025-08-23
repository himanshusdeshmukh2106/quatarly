import { Asset, TradableAsset, PhysicalAsset } from '../types';
import {
  isTradableAsset,
  isPhysicalAsset,
  getCurrentPrice,
  getChangeValues,
  assetFormatters
} from '../utils/assetUtils';

export interface AssetDisplayData {
  // Header data
  symbol: string;
  name: string;
  price: number;
  currency?: string;
  change: number;
  changePercent: number;
  changeColor: string;

  // Chart data
  chartData: number[];
  yAxisLabels: string[];
  time: string;

  // Stats data (4-row structure matching placeholder cards)
  stats: AssetStatItem[];

  // Insights
  aiAnalysis: string;
}

export interface AssetStatItem {
  label: string;
  value: string;
  color?: string;
}

export class AssetDataProcessor {
  /**
   * Process any asset type into display data for the unified card
   * Includes comprehensive error handling and validation
   */
  static processAssetForDisplay(asset: Asset, theme: any): AssetDisplayData {
    try {
      // Validate input parameters
      if (!asset) {
        throw new Error('Asset is null or undefined');
      }

      if (!theme) {
        console.warn('Theme is null or undefined, using default colors');
      }

      // Validate and sanitize asset data
      const validatedAsset = this.validateAndSanitizeAsset(asset);

      const currentPrice = this.safeGetCurrentPrice(validatedAsset);
      const { change, changePercent } = this.safeGetChangeValues(validatedAsset);
      const symbol = this.getSymbolOrAbbreviation(validatedAsset);
      const chartData = this.generateChartDataSafe(validatedAsset);
      const yAxisLabels = this.getYAxisLabels(chartData);
      const stats = this.getStatsForAssetSafe(validatedAsset);
      const changeColor = this.getPerformanceColor(change, theme);

      return {
        symbol,
        name: validatedAsset.name,
        price: currentPrice,
        currency: isTradableAsset(validatedAsset) ? validatedAsset.currency : undefined,
        change,
        changePercent,
        changeColor,
        chartData,
        yAxisLabels,
        time: this.getCurrentTimeDisplay(),
        stats,
        aiAnalysis: validatedAsset.aiAnalysis || this.generateInsight(validatedAsset),
      };
    } catch (error) {
      console.error('Error processing asset for display:', error);
      return this.getFallbackDisplayData(asset);
    }
  }

  /**
   * Validate and sanitize asset data to prevent runtime errors
   */
  private static validateAndSanitizeAsset(asset: Asset): Asset {
    const sanitized = { ...asset };

    // Validate required fields
    if (!sanitized.name || typeof sanitized.name !== 'string') {
      sanitized.name = 'Unknown Asset';
    }

    if (!sanitized.assetType || typeof sanitized.assetType !== 'string') {
      sanitized.assetType = 'stock';
    }

    // Validate and sanitize numeric fields
    sanitized.totalValue = this.validateNumber(sanitized.totalValue, 0);
    sanitized.totalGainLoss = this.validateNumber(sanitized.totalGainLoss, 0);
    sanitized.totalGainLossPercent = this.validateNumber(sanitized.totalGainLossPercent, 0);

    // Validate tradable asset specific fields
    if (isTradableAsset(sanitized)) {
      sanitized.currentPrice = this.validateNumber(sanitized.currentPrice, sanitized.totalValue);
      sanitized.quantity = this.validateNumber(sanitized.quantity, 1);
      sanitized.averagePurchasePrice = this.validateNumber(sanitized.averagePurchasePrice, sanitized.currentPrice);
      sanitized.dailyChange = this.validateNumber(sanitized.dailyChange, 0);
      sanitized.dailyChangePercent = this.validateNumber(sanitized.dailyChangePercent, 0);

      if (!sanitized.symbol || typeof sanitized.symbol !== 'string') {
        sanitized.symbol = this.generateSymbolFromName(sanitized.name);
      }

      if (!sanitized.currency || typeof sanitized.currency !== 'string') {
        sanitized.currency = 'INR';
      }
    }

    // Validate physical asset specific fields
    if (isPhysicalAsset(sanitized)) {
      sanitized.quantity = this.validateNumber(sanitized.quantity, 1);
      sanitized.purchasePrice = this.validateNumber(sanitized.purchasePrice, sanitized.totalValue);

      if (!sanitized.unit || typeof sanitized.unit !== 'string') {
        sanitized.unit = 'units';
      }
    }

    return sanitized;
  }

  /**
   * Validate a number and return a safe fallback if invalid
   */
  private static validateNumber(value: any, fallback: number = 0): number {
    if (typeof value === 'number' && isFinite(value) && !isNaN(value)) {
      return value;
    }

    if (typeof value === 'string') {
      const parsed = parseFloat(value);
      if (isFinite(parsed) && !isNaN(parsed)) {
        return parsed;
      }
    }

    return fallback;
  }

  /**
   * Generate a symbol from asset name as fallback
   */
  private static generateSymbolFromName(name: string): string {
    if (!name || typeof name !== 'string') {
      return 'N/A';
    }

    const words = name.trim().split(' ').filter(word => word.length > 0);
    if (words.length >= 2) {
      return words.slice(0, 2).map(word => word.charAt(0)).join('').toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  /**
   * Safe version of getCurrentPrice with error handling
   */
  private static safeGetCurrentPrice(asset: Asset): number {
    try {
      const price = getCurrentPrice(asset);
      return this.validateNumber(price, asset.totalValue || 0);
    } catch (error) {
      console.warn('Error getting current price:', error);
      return this.validateNumber(asset.totalValue, 0);
    }
  }

  /**
   * Safe version of getChangeValues with error handling
   */
  private static safeGetChangeValues(asset: Asset): { change: number; changePercent: number } {
    try {
      const values = getChangeValues(asset);
      return {
        change: this.validateNumber(values.change, 0),
        changePercent: this.validateNumber(values.changePercent, 0),
      };
    } catch (error) {
      console.warn('Error getting change values:', error);
      return {
        change: this.validateNumber(asset.totalGainLoss, 0),
        changePercent: this.validateNumber(asset.totalGainLossPercent, 0),
      };
    }
  }

  /**
   * Generate fallback display data when processing fails
   */
  private static getFallbackDisplayData(asset: any): AssetDisplayData {
    const safeName = (asset?.name && typeof asset.name === 'string') ? asset.name : 'Unknown Asset';
    const safeValue = this.validateNumber(asset?.totalValue, 0);
    const safeChange = this.validateNumber(asset?.totalGainLoss, 0);
    const safeChangePercent = this.validateNumber(asset?.totalGainLossPercent, 0);

    return {
      symbol: this.generateSymbolFromName(safeName),
      name: safeName,
      price: safeValue,
      currency: undefined,
      change: safeChange,
      changePercent: safeChangePercent,
      changeColor: '#6B7280', // Neutral gray for fallback
      chartData: this.getFallbackChartData(),
      yAxisLabels: ['100', '100', '100'],
      time: this.getCurrentTimeDisplay(),
      stats: this.getFallbackStats(),
      aiAnalysis: 'Asset data is currently unavailable. Please check your connection and try again.',
    };
  }

  /**
   * Generate fallback chart data that maintains visual consistency
   */
  private static getFallbackChartData(): number[] {
    // Generate a flat line at 100 to maintain visual consistency
    return Array(12).fill(100);
  }

  /**
   * Generate fallback stats that maintain the 4-row structure
   */
  private static getFallbackStats(): AssetStatItem[] {
    return [
      { label: 'Volume', value: 'N/A' },
      { label: 'Market Cap', value: 'N/A' },
      { label: 'P/E Ratio', value: 'N/A' },
      { label: 'Growth Rate', value: 'N/A' },
    ];
  }

  /**
   * Generate chart data for any asset type with appropriate range for Y-axis labels
   */
  static generateChartData(asset: Asset): number[] {
    const basePrice = getCurrentPrice(asset);
    const isPositive = asset.totalGainLoss >= 0;
    const data: number[] = [];

    // Create a reasonable price range (10-20% variation from base price)
    const variation = basePrice * 0.15; // 15% variation
    const minPrice = basePrice - variation;
    const maxPrice = basePrice + variation;

    // Start from a point that creates a good trend
    let currentPrice = isPositive ? minPrice + variation * 0.3 : maxPrice - variation * 0.3;

    for (let i = 0; i < 12; i++) {
      // Ensure price stays within reasonable bounds
      currentPrice = Math.max(minPrice, Math.min(maxPrice, currentPrice));
      data.push(currentPrice);

      // Create trend with some randomness
      const trendDirection = isPositive ? 1 : -1;
      const randomFactor = (Math.random() - 0.5) * 0.4; // Random component
      const trendFactor = trendDirection * 0.6; // Trend component

      const change = (trendFactor + randomFactor) * (basePrice * 0.01);
      currentPrice += change;
    }

    // Ensure the last point matches the current price exactly
    data[data.length - 1] = basePrice;

    return data;
  }

  /**
   * Safe version of generateChartData with comprehensive error handling
   */
  private static generateChartDataSafe(asset: Asset): number[] {
    try {
      const basePrice = this.safeGetCurrentPrice(asset);

      // If base price is 0 or invalid, return fallback data
      if (basePrice <= 0) {
        return this.getFallbackChartData();
      }

      const isPositive = this.validateNumber(asset.totalGainLoss, 0) >= 0;
      const data: number[] = [];

      // Create a reasonable price range (10-20% variation from base price)
      const variation = Math.max(basePrice * 0.15, 1); // Ensure minimum variation
      const minPrice = Math.max(basePrice - variation, 0.01); // Ensure positive prices
      const maxPrice = basePrice + variation;

      // Start from a point that creates a good trend
      let currentPrice = isPositive ? minPrice + variation * 0.3 : maxPrice - variation * 0.3;

      for (let i = 0; i < 12; i++) {
        // Ensure price stays within reasonable bounds and is positive
        currentPrice = Math.max(0.01, Math.max(minPrice, Math.min(maxPrice, currentPrice)));

        // Validate the price before adding
        if (isFinite(currentPrice) && !isNaN(currentPrice)) {
          data.push(currentPrice);
        } else {
          data.push(basePrice); // Fallback to base price
        }

        // Create trend with some randomness
        const trendDirection = isPositive ? 1 : -1;
        const randomFactor = (Math.random() - 0.5) * 0.4; // Random component
        const trendFactor = trendDirection * 0.6; // Trend component

        const change = (trendFactor + randomFactor) * (basePrice * 0.01);
        currentPrice += change;
      }

      // Ensure the last point matches the current price exactly
      if (data.length > 0) {
        data[data.length - 1] = basePrice;
      }

      // Validate all data points
      const validatedData = data.map(point => this.validateNumber(point, basePrice));

      return validatedData.length === 12 ? validatedData : this.getFallbackChartData();
    } catch (error) {
      console.warn('Error generating chart data:', error);
      return this.getFallbackChartData();
    }
  }

  /**
   * Get Y-axis labels for chart - matching placeholder card format
   * Returns 3 labels: max, middle, min values properly formatted
   */
  static getYAxisLabels(chartData: number[]): string[] {
    const minPrice = Math.min(...chartData);
    const maxPrice = Math.max(...chartData);
    const range = maxPrice - minPrice;

    // If all values are the same, return the same value for all labels
    if (range === 0) {
      const value = Math.round(maxPrice).toString();
      return [value, value, value];
    }

    // Create 3 evenly spaced labels like placeholder cards
    const maxLabel = Math.round(maxPrice);
    const minLabel = Math.round(minPrice);
    const midLabel = Math.round(minPrice + range * 0.5);

    return [
      maxLabel.toString(),
      midLabel.toString(),
      minLabel.toString()
    ];
  }

  /**
   * Get statistics for asset based on type
   */
  static getStatsForAsset(asset: Asset): AssetStatItem[] {
    if (isTradableAsset(asset)) {
      return this.getTradableAssetStats(asset);
    } else if (isPhysicalAsset(asset)) {
      return this.getPhysicalAssetStats(asset);
    } else {
      return this.getGenericAssetStats(asset);
    }
  }

  /**
   * Safe version of getStatsForAsset with error handling
   */
  private static getStatsForAssetSafe(asset: Asset): AssetStatItem[] {
    try {
      if (isTradableAsset(asset)) {
        return this.getTradableAssetStatsSafe(asset);
      } else if (isPhysicalAsset(asset)) {
        return this.getPhysicalAssetStatsSafe(asset);
      } else {
        return this.getGenericAssetStatsSafe(asset);
      }
    } catch (error) {
      console.warn('Error getting asset stats:', error);
      return this.getFallbackStats();
    }
  }

  /**
   * Get statistics for tradable assets (stocks, ETFs, crypto, bonds)
   * Matches placeholder card 4-row structure: Volume, Market Cap, P/E Ratio, Growth Rate
   */
  private static getTradableAssetStats(asset: TradableAsset): AssetStatItem[] {
    return [
      {
        label: 'Volume',
        value: this.formatVolume(asset.volume, asset.totalValue),
      },
      {
        label: 'Market Cap',
        value: this.formatMarketCap(asset.marketCap, asset.totalValue),
      },
      {
        label: 'P/E Ratio',
        value: this.formatPERatio(asset.peRatio),
      },
      {
        label: 'Growth Rate',
        value: this.formatGrowthRate(asset.growthRate),
      },
    ];
  }

  /**
   * Safe version of getTradableAssetStats with error handling
   */
  private static getTradableAssetStatsSafe(asset: TradableAsset): AssetStatItem[] {
    try {
      return [
        {
          label: 'Volume',
          value: this.formatVolumeSafe(asset.volume, asset.totalValue),
        },
        {
          label: 'Market Cap',
          value: this.formatMarketCapSafe(asset.marketCap, asset.totalValue),
        },
        {
          label: 'P/E Ratio',
          value: this.formatPERatioSafe(asset.peRatio),
        },
        {
          label: 'Growth Rate',
          value: this.formatGrowthRateSafe(asset.growthRate),
        },
      ];
    } catch (error) {
      console.warn('Error getting tradable asset stats:', error);
      return this.getFallbackStats();
    }
  }

  /**
   * Get statistics for physical assets (gold, silver, commodities)
   * Adapts to 4-row structure while showing relevant physical asset data
   */
  private static getPhysicalAssetStats(asset: PhysicalAsset): AssetStatItem[] {
    return [
      {
        label: 'Volume',
        value: this.formatVolume(null, asset.totalValue),
      },
      {
        label: 'Market Cap',
        value: this.formatMarketCap(null, asset.totalValue, true),
      },
      {
        label: 'Purchase Price',
        value: this.formatCurrency(asset.purchasePrice),
      },
      {
        label: 'Quantity',
        value: `${asset.quantity} ${asset.unit}`,
      },
    ];
  }

  /**
   * Safe version of getPhysicalAssetStats with error handling
   */
  private static getPhysicalAssetStatsSafe(asset: PhysicalAsset): AssetStatItem[] {
    try {
      const safeQuantity = this.validateNumber(asset.quantity, 1);
      const safePurchasePrice = this.validateNumber(asset.purchasePrice, 0);
      const safeUnit = (asset.unit && typeof asset.unit === 'string') ? asset.unit : 'units';

      return [
        {
          label: 'Volume',
          value: this.formatVolumeSafe(null, asset.totalValue),
        },
        {
          label: 'Market Cap',
          value: this.formatMarketCapSafe(null, asset.totalValue, true),
        },
        {
          label: 'Purchase Price',
          value: this.formatCurrencySafe(safePurchasePrice),
        },
        {
          label: 'Quantity',
          value: `${safeQuantity} ${safeUnit}`,
        },
      ];
    } catch (error) {
      console.warn('Error getting physical asset stats:', error);
      return this.getFallbackStats();
    }
  }

  /**
   * Get generic statistics for other asset types
   * Maintains 4-row structure with relevant generic data
   */
  private static getGenericAssetStats(asset: Asset): AssetStatItem[] {
    return [
      {
        label: 'Volume',
        value: this.formatVolume(null, asset.totalValue),
      },
      {
        label: 'Market Cap',
        value: this.formatMarketCap(null, asset.totalValue),
      },
      {
        label: 'Total Value',
        value: this.formatCurrency(asset.totalValue),
      },
      {
        label: 'Asset Type',
        value: this.formatAssetType(asset.assetType),
      },
    ];
  }

  /**
   * Safe version of getGenericAssetStats with error handling
   */
  private static getGenericAssetStatsSafe(asset: Asset): AssetStatItem[] {
    try {
      const safeTotalValue = this.validateNumber(asset.totalValue, 0);
      const safeAssetType = (asset.assetType && typeof asset.assetType === 'string') ? asset.assetType : 'unknown';

      return [
        {
          label: 'Volume',
          value: this.formatVolumeSafe(null, safeTotalValue),
        },
        {
          label: 'Market Cap',
          value: this.formatMarketCapSafe(null, safeTotalValue),
        },
        {
          label: 'Total Value',
          value: this.formatCurrencySafe(safeTotalValue),
        },
        {
          label: 'Asset Type',
          value: this.formatAssetTypeSafe(safeAssetType),
        },
      ];
    } catch (error) {
      console.warn('Error getting generic asset stats:', error);
      return this.getFallbackStats();
    }
  }

  /**
   * Generate symbol or abbreviation for assets without symbols
   */
  static getSymbolOrAbbreviation(asset: Asset): string {
    if (isTradableAsset(asset) && asset.symbol) {
      return asset.symbol;
    }

    // Generate symbol from name
    const words = asset.name.split(' ');
    if (words.length >= 2) {
      return words.slice(0, 2).map(word => word.charAt(0)).join('').toUpperCase();
    }
    return asset.name.substring(0, 2).toUpperCase();
  }

  /**
   * Generate contextual AI insight based on asset type and performance
   */
  static generateInsight(asset: Asset): string {
    const isPositive = asset.totalGainLoss >= 0;
    const assetTypeText = this.getAssetTypeText(asset);

    if (isPositive) {
      return `${asset.name} ${assetTypeText} showed positive performance with strong fundamentals and favorable market conditions supporting continued growth potential in the current economic environment.`;
    } else {
      return `${asset.name} ${assetTypeText} experienced some volatility due to market conditions and sector-specific factors, but maintains solid underlying value with potential for recovery in the medium term.`;
    }
  }

  /**
   * Get appropriate asset type text for insights
   */
  private static getAssetTypeText(asset: Asset): string {
    switch (asset.assetType) {
      case 'stock':
        return 'shares';
      case 'crypto':
        return 'cryptocurrency';
      case 'gold':
        return 'gold holdings';
      case 'silver':
        return 'silver holdings';
      case 'etf':
        return 'ETF position';
      case 'bond':
        return 'bond position';
      case 'commodity':
        return 'commodity holdings';
      default:
        return `${asset.assetType} position`;
    }
  }

  /**
   * Get performance color based on value
   */
  static getPerformanceColor(value: number, theme: any): string {
    if (value > 0) return '#22c55e'; // Green for positive
    if (value < 0) return '#ef4444'; // Red for negative
    return '#6B7280'; // Gray for neutral
  }

  /**
   * Format volume data to match placeholder card format
   */
  private static formatVolume(volume: string | null | undefined, totalValue: number): string {
    if (volume) {
      return volume;
    }

    // Generate realistic volume based on total value
    const baseVolume = Math.floor(totalValue / 100) * (Math.random() * 2 + 0.5);

    if (baseVolume >= 1000000) {
      return `${(baseVolume / 1000000).toFixed(2)}M`;
    } else if (baseVolume >= 1000) {
      return `${(baseVolume / 1000).toFixed(2)}K`;
    }
    return `${baseVolume.toFixed(2)}K`;
  }

  /**
   * Format market cap data to match placeholder card format
   */
  private static formatMarketCap(marketCap: number | null | undefined, totalValue: number, isPhysical = false): string {
    if (marketCap) {
      if (marketCap >= 1000000000000) {
        return `${(marketCap / 1000000000000).toFixed(1)}T`;
      } else if (marketCap >= 1000000000) {
        return `${(marketCap / 1000000000).toFixed(1)}B`;
      } else if (marketCap >= 1000000) {
        return `${(marketCap / 1000000).toFixed(1)}M`;
      }
      return marketCap.toString();
    }

    // Generate realistic market cap based on total value
    const multiplier = isPhysical ? 50 : 200;
    const baseCap = totalValue * multiplier * (Math.random() * 2 + 0.5);

    if (baseCap >= 1000000000000) {
      return `${(baseCap / 1000000000000).toFixed(1)}T`;
    } else if (baseCap >= 1000000000) {
      return `${(baseCap / 1000000000).toFixed(1)}B`;
    } else if (baseCap >= 1000000) {
      return `${(baseCap / 1000000).toFixed(1)}M`;
    }
    return `${(baseCap / 1000).toFixed(1)}K`;
  }

  /**
   * Format P/E ratio to match placeholder card format
   */
  private static formatPERatio(peRatio: number | null | undefined): string {
    if (peRatio !== null && peRatio !== undefined) {
      return peRatio.toFixed(2);
    }

    // Generate realistic P/E ratio
    const ratio = Math.random() * 80 + 5; // 5-85 range
    return ratio.toFixed(2);
  }

  /**
   * Format growth rate to match placeholder card format
   */
  private static formatGrowthRate(growthRate: number | null | undefined): string {
    if (growthRate !== null && growthRate !== undefined) {
      return `${growthRate.toFixed(2)}%`;
    }

    // Some assets don't have growth rate data
    if (Math.random() > 0.6) {
      return 'N/A';
    }

    // Generate realistic growth rate
    const rate = (Math.random() - 0.5) * 20; // -10% to +10% range
    return `${rate.toFixed(2)}%`;
  }

  /**
   * Format currency values consistently
   */
  private static formatCurrency(amount: number, currency?: string): string {
    if (currency && currency !== 'INR') {
      // Handle other currencies
      const symbol = this.getCurrencySymbol(currency);
      return `${symbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }

    // Default to INR formatting
    return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  /**
   * Get currency symbol for different currencies
   */
  private static getCurrencySymbol(currency: string): string {
    const symbols: Record<string, string> = {
      'USD': '$',
      'EUR': '€',
      'GBP': '£',
      'JPY': '¥',
      'INR': '₹',
      'BTC': '₿',
      'ETH': 'Ξ',
    };
    return symbols[currency] || currency + ' ';
  }

  /**
   * Format asset type for display
   */
  private static formatAssetType(assetType: string): string {
    const typeMap: Record<string, string> = {
      'stock': 'STOCK',
      'etf': 'ETF',
      'crypto': 'CRYPTO',
      'bond': 'BOND',
      'gold': 'GOLD',
      'silver': 'SILVER',
      'commodity': 'COMMODITY',
      'mutual_fund': 'MUTUAL FUND',
    };
    return typeMap[assetType] || assetType.toUpperCase();
  }

  /**
   * Get current time display for chart
   */
  private static getCurrentTimeDisplay(): string {
    try {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours % 12 || 12;
      const displayMinutes = minutes.toString().padStart(2, '0');
      return `${displayHours}:${displayMinutes} ${ampm}`;
    } catch (error) {
      console.warn('Error getting current time:', error);
      return '12:00 PM'; // Fallback time
    }
  }

  // Safe formatting methods with comprehensive error handling

  /**
   * Safe version of formatVolume with error handling
   */
  private static formatVolumeSafe(volume: string | null | undefined, totalValue: number): string {
    try {
      return this.formatVolume(volume, this.validateNumber(totalValue, 0));
    } catch (error) {
      console.warn('Error formatting volume:', error);
      return 'N/A';
    }
  }

  /**
   * Safe version of formatMarketCap with error handling
   */
  private static formatMarketCapSafe(marketCap: number | null | undefined, totalValue: number, isPhysical = false): string {
    try {
      return this.formatMarketCap(
        this.validateNumber(marketCap, null),
        this.validateNumber(totalValue, 0),
        isPhysical
      );
    } catch (error) {
      console.warn('Error formatting market cap:', error);
      return 'N/A';
    }
  }

  /**
   * Safe version of formatPERatio with error handling
   */
  private static formatPERatioSafe(peRatio: number | null | undefined): string {
    try {
      return this.formatPERatio(this.validateNumber(peRatio, null));
    } catch (error) {
      console.warn('Error formatting P/E ratio:', error);
      return 'N/A';
    }
  }

  /**
   * Safe version of formatGrowthRate with error handling
   */
  private static formatGrowthRateSafe(growthRate: number | null | undefined): string {
    try {
      return this.formatGrowthRate(this.validateNumber(growthRate, null));
    } catch (error) {
      console.warn('Error formatting growth rate:', error);
      return 'N/A';
    }
  }

  /**
   * Safe version of formatCurrency with error handling
   */
  private static formatCurrencySafe(amount: number, currency?: string): string {
    try {
      const safeAmount = this.validateNumber(amount, 0);
      return this.formatCurrency(safeAmount, currency);
    } catch (error) {
      console.warn('Error formatting currency:', error);
      return 'N/A';
    }
  }

  /**
   * Safe version of formatAssetType with error handling
   */
  private static formatAssetTypeSafe(assetType: string): string {
    try {
      return this.formatAssetType(assetType);
    } catch (error) {
      console.warn('Error formatting asset type:', error);
      return 'UNKNOWN';
    }
  }
}

export default AssetDataProcessor;