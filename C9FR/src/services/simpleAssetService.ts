import { Alert } from 'react-native';

export interface AssetSuggestion {
  name: string;
  symbol?: string;
  type: 'stock' | 'crypto' | 'gold' | 'silver' | 'commodity' | 'etf' | 'bond';
  exchange?: string;
  currentPrice?: number;
  country?: string;
}

class SimpleAssetService {
  private cache: Map<string, AssetSuggestion[]> = new Map();
  private cacheExpiry: Map<string, number> = new Map();
  private readonly CACHE_DURATION = 10 * 60 * 1000; // 10 minutes cache
  private lastRequestTime = 0;
  private readonly MIN_REQUEST_INTERVAL = 1000; // 1 second between requests

  // Comprehensive static asset database for instant search
  private staticAssets: AssetSuggestion[] = [
    // Popular Indian Stocks
    { name: 'Reliance Industries', symbol: 'RELIANCE', type: 'stock', exchange: 'NSE', country: 'India' },
    { name: 'Tata Consultancy Services', symbol: 'TCS', type: 'stock', exchange: 'NSE', country: 'India' },
    { name: 'HDFC Bank', symbol: 'HDFCBANK', type: 'stock', exchange: 'NSE', country: 'India' },
    { name: 'Infosys', symbol: 'INFY', type: 'stock', exchange: 'NSE', country: 'India' },
    { name: 'ICICI Bank', symbol: 'ICICIBANK', type: 'stock', exchange: 'NSE', country: 'India' },
    { name: 'State Bank of India', symbol: 'SBIN', type: 'stock', exchange: 'NSE', country: 'India' },
    { name: 'Bharti Airtel', symbol: 'BHARTIARTL', type: 'stock', exchange: 'NSE', country: 'India' },
    { name: 'ITC Limited', symbol: 'ITC', type: 'stock', exchange: 'NSE', country: 'India' },
    { name: 'Hindustan Unilever', symbol: 'HINDUNILVR', type: 'stock', exchange: 'NSE', country: 'India' },
    { name: 'Larsen & Toubro', symbol: 'LT', type: 'stock', exchange: 'NSE', country: 'India' },
    { name: 'Asian Paints', symbol: 'ASIANPAINT', type: 'stock', exchange: 'NSE', country: 'India' },
    { name: 'Maruti Suzuki', symbol: 'MARUTI', type: 'stock', exchange: 'NSE', country: 'India' },
    { name: 'Bajaj Finance', symbol: 'BAJFINANCE', type: 'stock', exchange: 'NSE', country: 'India' },
    { name: 'Wipro', symbol: 'WIPRO', type: 'stock', exchange: 'NSE', country: 'India' },
    { name: 'Titan Company', symbol: 'TITAN', type: 'stock', exchange: 'NSE', country: 'India' },

    // Popular US Stocks
    { name: 'Apple Inc.', symbol: 'AAPL', type: 'stock', exchange: 'NASDAQ', country: 'USA' },
    { name: 'Microsoft Corporation', symbol: 'MSFT', type: 'stock', exchange: 'NASDAQ', country: 'USA' },
    { name: 'Amazon.com Inc.', symbol: 'AMZN', type: 'stock', exchange: 'NASDAQ', country: 'USA' },
    { name: 'Alphabet Inc.', symbol: 'GOOGL', type: 'stock', exchange: 'NASDAQ', country: 'USA' },
    { name: 'Tesla Inc.', symbol: 'TSLA', type: 'stock', exchange: 'NASDAQ', country: 'USA' },
    { name: 'Meta Platforms', symbol: 'META', type: 'stock', exchange: 'NASDAQ', country: 'USA' },
    { name: 'NVIDIA Corporation', symbol: 'NVDA', type: 'stock', exchange: 'NASDAQ', country: 'USA' },
    { name: 'Netflix Inc.', symbol: 'NFLX', type: 'stock', exchange: 'NASDAQ', country: 'USA' },
    { name: 'PayPal Holdings', symbol: 'PYPL', type: 'stock', exchange: 'NASDAQ', country: 'USA' },
    { name: 'Adobe Inc.', symbol: 'ADBE', type: 'stock', exchange: 'NASDAQ', country: 'USA' },

    // Popular Cryptocurrencies
    { name: 'Bitcoin', symbol: 'BTC', type: 'crypto', country: 'Global' },
    { name: 'Ethereum', symbol: 'ETH', type: 'crypto', country: 'Global' },
    { name: 'Binance Coin', symbol: 'BNB', type: 'crypto', country: 'Global' },
    { name: 'Cardano', symbol: 'ADA', type: 'crypto', country: 'Global' },
    { name: 'Solana', symbol: 'SOL', type: 'crypto', country: 'Global' },
    { name: 'Polkadot', symbol: 'DOT', type: 'crypto', country: 'Global' },
    { name: 'Dogecoin', symbol: 'DOGE', type: 'crypto', country: 'Global' },
    { name: 'Avalanche', symbol: 'AVAX', type: 'crypto', country: 'Global' },

    // Precious Metals & Commodities
    { name: 'Gold', symbol: 'GOLD', type: 'gold', country: 'Global' },
    { name: 'Silver', symbol: 'SILVER', type: 'silver', country: 'Global' },
    { name: 'Platinum', symbol: 'PLATINUM', type: 'commodity', country: 'Global' },
    { name: 'Crude Oil', symbol: 'CRUDE', type: 'commodity', country: 'Global' },
    { name: 'Natural Gas', symbol: 'NATGAS', type: 'commodity', country: 'Global' },

    // Popular ETFs
    { name: 'Nifty 50 ETF', symbol: 'NIFTYBEES', type: 'etf', exchange: 'NSE', country: 'India' },
    { name: 'Bank Nifty ETF', symbol: 'BANKBEES', type: 'etf', exchange: 'NSE', country: 'India' },
    { name: 'Gold ETF', symbol: 'GOLDBEES', type: 'etf', exchange: 'NSE', country: 'India' },
    { name: 'SPDR S&P 500 ETF', symbol: 'SPY', type: 'etf', exchange: 'NYSE', country: 'USA' },
    { name: 'Invesco QQQ Trust', symbol: 'QQQ', type: 'etf', exchange: 'NASDAQ', country: 'USA' },
  ];

  /**
   * Main search method - uses static data for instant results
   */
  async getAssetSuggestions(query: string): Promise<AssetSuggestion[]> {
    if (query.length < 2) return [];

    // Check cache first
    const cached = this.getCachedSuggestions(query);
    if (cached) return cached;

    // Search static database instantly
    const staticResults = this.searchStaticAssets(query);

    // Cache the results
    this.setCachedSuggestions(query, staticResults);

    return staticResults;
  }

  /**
   * Fast static asset search with intelligent matching
   */
  private searchStaticAssets(query: string): AssetSuggestion[] {
    const q = query.toLowerCase().trim();
    const results: { asset: AssetSuggestion; score: number }[] = [];

    for (const asset of this.staticAssets) {
      const score = this.calculateMatchScore(asset, q);
      if (score > 0) {
        results.push({ asset, score });
      }
    }

    // Sort by relevance score and return top 8 results
    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
      .map(r => r.asset);
  }

  /**
   * Calculate match score for intelligent ranking
   */
  private calculateMatchScore(asset: AssetSuggestion, query: string): number {
    const name = asset.name.toLowerCase();
    const symbol = asset.symbol?.toLowerCase() || '';

    // Exact matches get highest score
    if (symbol === query) return 100;
    if (name === query) return 95;

    // Starts with matches
    if (symbol.startsWith(query)) return 90;
    if (name.startsWith(query)) return 85;

    // Contains matches
    if (symbol.includes(query)) return 70;
    if (name.includes(query)) return 65;

    // Word boundary matches (e.g., "apple" matches "Apple Inc.")
    const words = name.split(' ');
    for (const word of words) {
      if (word.startsWith(query)) return 60;
      if (word.includes(query)) return 50;
    }

    return 0;
  }

  /**
   * Get current price (optional, only when user selects an asset)
   */
  async getCurrentPrice(symbol: string): Promise<number | null> {
    // Rate limiting
    const now = Date.now();
    if (now - this.lastRequestTime < this.MIN_REQUEST_INTERVAL) {
      return null;
    }
    this.lastRequestTime = now;

    try {
      // Use free Yahoo Finance API for price data
      const response = await fetch(
        `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`,
        {
          method: 'GET',
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; FinanceApp/1.0)',
          }
        }
      );

      if (!response.ok) return null;

      const data = await response.json();
      const result = data.chart?.result?.[0];
      const price = result?.meta?.regularMarketPrice || result?.meta?.previousClose;

      return price ? parseFloat(price.toString()) : null;
    } catch (error) {
      console.log('Price fetch failed (using fallback):', error);
      return null;
    }
  }

  /**
   * Cache management for better performance
   */
  private getCachedSuggestions(query: string): AssetSuggestion[] | null {
    const cached = this.cache.get(query.toLowerCase());
    const expiry = this.cacheExpiry.get(query.toLowerCase());

    if (cached && expiry && Date.now() < expiry) {
      return cached;
    }

    return null;
  }

  private setCachedSuggestions(query: string, suggestions: AssetSuggestion[]): void {
    this.cache.set(query.toLowerCase(), suggestions);
    this.cacheExpiry.set(query.toLowerCase(), Date.now() + this.CACHE_DURATION);
  }

  /**
   * Clear cache (useful for memory management)
   */
  clearCache(): void {
    this.cache.clear();
    this.cacheExpiry.clear();
  }
}

// Export singleton instance
export const simpleAssetService = new SimpleAssetService();
export default SimpleAssetService;