import { Alert } from 'react-native';

export interface AssetSuggestion {
    name: string;
    symbol?: string;
    type: 'stock' | 'crypto' | 'gold' | 'silver' | 'commodity' | 'etf' | 'bond';
    exchange?: string;
    currentPrice?: number;
    country?: string;
    marketCap?: number;
    sector?: string;
    description?: string;
    confidence?: number; // AI confidence score
}

export interface AIAssetServiceConfig {
    geminiApiKey?: string;
    openaiApiKey?: string;
    alphaVantageApiKey?: string;
    polygonApiKey?: string;
    enabledProviders: ('gemini' | 'openai' | 'alphavantage' | 'polygon' | 'yahoo')[];
}

class AIAssetService {
    private config: AIAssetServiceConfig;
    private cache: Map<string, AssetSuggestion[]> = new Map();
    private cacheExpiry: Map<string, number> = new Map();
    private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

    constructor(config: AIAssetServiceConfig) {
        this.config = config;
    }

    /**
     * Main method to get AI-powered asset suggestions
     */
    async getAssetSuggestions(query: string): Promise<AssetSuggestion[]> {
        if (query.length < 2) return [];

        // Check cache first
        const cached = this.getCachedSuggestions(query);
        if (cached) return cached;

        try {
            const suggestions = await this.fetchSuggestionsFromProviders(query);
            this.setCachedSuggestions(query, suggestions);
            return suggestions;
        } catch (error) {
            console.error('Error fetching AI suggestions:', error);
            return this.getFallbackSuggestions(query);
        }
    }

    /**
     * Fetch suggestions from multiple providers and merge results
     */
    private async fetchSuggestionsFromProviders(query: string): Promise<AssetSuggestion[]> {
        const promises: Promise<AssetSuggestion[]>[] = [];

        // Add enabled providers
        if (this.config.enabledProviders.includes('gemini') && this.config.geminiApiKey) {
            promises.push(this.getGeminiSuggestions(query));
        }

        if (this.config.enabledProviders.includes('alphavantage') && this.config.alphaVantageApiKey) {
            promises.push(this.getAlphaVantageSuggestions(query));
        }

        if (this.config.enabledProviders.includes('polygon') && this.config.polygonApiKey) {
            promises.push(this.getPolygonSuggestions(query));
        }

        if (this.config.enabledProviders.includes('yahoo')) {
            promises.push(this.getYahooFinanceSuggestions(query));
        }

        // Execute all providers in parallel
        const results = await Promise.allSettled(promises);

        // Merge and deduplicate results
        const allSuggestions: AssetSuggestion[] = [];
        results.forEach(result => {
            if (result.status === 'fulfilled') {
                allSuggestions.push(...result.value);
            }
        });

        return this.deduplicateAndRank(allSuggestions, query);
    }

    /**
     * Google Gemini API for intelligent asset suggestions
     */
    private async getGeminiSuggestions(query: string): Promise<AssetSuggestion[]> {
        try {
            const prompt = `
        Given the search query "${query}", suggest relevant financial assets (stocks, ETFs, cryptocurrencies, commodities, bonds).
        
        For each suggestion, provide:
        - Full company/asset name
        - Trading symbol
        - Asset type (stock/etf/crypto/commodity/bond/gold/silver)
        - Primary exchange
        - Country
        - Brief description
        - Confidence score (0-1)
        
        Focus on:
        1. Popular and liquid assets
        2. Assets matching the query closely
        3. Mix of Indian and international assets
        4. Include both exact matches and related suggestions
        
        Return as JSON array with max 10 results.
        
        Example format:
        [
          {
            "name": "Apple Inc.",
            "symbol": "AAPL",
            "type": "stock",
            "exchange": "NASDAQ",
            "country": "USA",
            "description": "Technology company known for iPhone, iPad, Mac",
            "confidence": 0.95
          }
        ]
      `;

            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${this.config.geminiApiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: prompt
                        }]
                    }]
                })
            });

            const data = await response.json();
            const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

            if (textResponse) {
                // Extract JSON from the response
                const jsonMatch = textResponse.match(/\[[\s\S]*\]/);
                if (jsonMatch) {
                    const suggestions = JSON.parse(jsonMatch[0]);
                    return suggestions.map((s: any) => ({
                        ...s,
                        confidence: s.confidence || 0.8
                    }));
                }
            }

            return [];
        } catch (error) {
            console.error('Gemini API error:', error);
            return [];
        }
    }

    /**
     * Alpha Vantage API for real-time stock data
     */
    private async getAlphaVantageSuggestions(query: string): Promise<AssetSuggestion[]> {
        try {
            const response = await fetch(
                `https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${encodeURIComponent(query)}&apikey=${this.config.alphaVantageApiKey}`
            );

            const data = await response.json();
            const matches = data.bestMatches || [];

            return matches.slice(0, 5).map((match: any) => ({
                name: match['2. name'],
                symbol: match['1. symbol'],
                type: this.determineAssetType(match['3. type']),
                exchange: match['4. region'],
                country: match['4. region'] === 'United States' ? 'USA' : match['4. region'],
                confidence: parseFloat(match['9. matchScore']) || 0.7
            }));
        } catch (error) {
            console.error('Alpha Vantage API error:', error);
            return [];
        }
    }

    /**
     * Polygon.io API for comprehensive market data
     */
    private async getPolygonSuggestions(query: string): Promise<AssetSuggestion[]> {
        try {
            const response = await fetch(
                `https://api.polygon.io/v3/reference/tickers?search=${encodeURIComponent(query)}&limit=10&apikey=${this.config.polygonApiKey}`
            );

            const data = await response.json();
            const results = data.results || [];

            return results.map((ticker: any) => ({
                name: ticker.name,
                symbol: ticker.ticker,
                type: this.mapPolygonType(ticker.type),
                exchange: ticker.primary_exchange,
                country: ticker.locale === 'us' ? 'USA' : ticker.locale?.toUpperCase(),
                marketCap: ticker.market_cap,
                description: ticker.description,
                confidence: 0.8
            }));
        } catch (error) {
            console.error('Polygon API error:', error);
            return [];
        }
    }

    /**
     * Yahoo Finance API (free alternative)
     */
    private async getYahooFinanceSuggestions(query: string): Promise<AssetSuggestion[]> {
        try {
            // Using Yahoo Finance's search endpoint
            const response = await fetch(
                `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(query)}&quotesCount=10&newsCount=0`
            );

            const data = await response.json();
            const quotes = data.quotes || [];

            return quotes.map((quote: any) => ({
                name: quote.longname || quote.shortname,
                symbol: quote.symbol,
                type: this.mapYahooType(quote.quoteType),
                exchange: quote.exchange,
                country: this.getCountryFromExchange(quote.exchange),
                confidence: 0.75
            }));
        } catch (error) {
            console.error('Yahoo Finance API error:', error);
            return [];
        }
    }

    /**
     * Get current price for an asset
     */
    async getCurrentPrice(symbol: string, exchange?: string): Promise<number | null> {
        try {
            // Try multiple providers for price data
            if (this.config.alphaVantageApiKey) {
                return await this.getAlphaVantagePrice(symbol);
            }

            if (this.config.polygonApiKey) {
                return await this.getPolygonPrice(symbol);
            }

            // Fallback to Yahoo Finance
            return await this.getYahooPrice(symbol);
        } catch (error) {
            console.error('Error fetching current price:', error);
            return null;
        }
    }

    private async getAlphaVantagePrice(symbol: string): Promise<number | null> {
        try {
            const response = await fetch(
                `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${this.config.alphaVantageApiKey}`
            );
            const data = await response.json();
            const quote = data['Global Quote'];
            return parseFloat(quote['05. price']) || null;
        } catch {
            return null;
        }
    }

    private async getPolygonPrice(symbol: string): Promise<number | null> {
        try {
            const response = await fetch(
                `https://api.polygon.io/v2/aggs/ticker/${symbol}/prev?adjusted=true&apikey=${this.config.polygonApiKey}`
            );
            const data = await response.json();
            return data.results?.[0]?.c || null;
        } catch {
            return null;
        }
    }

    private async getYahooPrice(symbol: string): Promise<number | null> {
        try {
            const response = await fetch(
                `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`
            );
            const data = await response.json();
            const result = data.chart?.result?.[0];
            return result?.meta?.regularMarketPrice || null;
        } catch {
            return null;
        }
    }

    /**
     * Cache management
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
     * Deduplicate and rank suggestions
     */
    private deduplicateAndRank(suggestions: AssetSuggestion[], query: string): AssetSuggestion[] {
        const seen = new Set<string>();
        const unique: AssetSuggestion[] = [];

        // Sort by confidence and relevance
        suggestions.sort((a, b) => {
            const aRelevance = this.calculateRelevance(a, query);
            const bRelevance = this.calculateRelevance(b, query);
            return (b.confidence || 0) * bRelevance - (a.confidence || 0) * aRelevance;
        });

        for (const suggestion of suggestions) {
            const key = `${suggestion.symbol}-${suggestion.exchange}`;
            if (!seen.has(key) && suggestion.symbol) {
                seen.add(key);
                unique.push(suggestion);
                if (unique.length >= 8) break; // Limit results
            }
        }

        return unique;
    }

    private calculateRelevance(suggestion: AssetSuggestion, query: string): number {
        const q = query.toLowerCase();
        const name = suggestion.name.toLowerCase();
        const symbol = suggestion.symbol?.toLowerCase() || '';

        if (symbol === q) return 1.0;
        if (name === q) return 0.9;
        if (symbol.startsWith(q)) return 0.8;
        if (name.startsWith(q)) return 0.7;
        if (symbol.includes(q)) return 0.6;
        if (name.includes(q)) return 0.5;
        return 0.3;
    }

    /**
     * Fallback suggestions when APIs fail
     */
    private getFallbackSuggestions(query: string): AssetSuggestion[] {
        const fallbackData: AssetSuggestion[] = [
            // Indian Stocks
            { name: 'Reliance Industries', symbol: 'RELIANCE', type: 'stock', exchange: 'NSE', country: 'India' },
            { name: 'TCS', symbol: 'TCS', type: 'stock', exchange: 'NSE', country: 'India' },
            { name: 'HDFC Bank', symbol: 'HDFCBANK', type: 'stock', exchange: 'NSE', country: 'India' },
            { name: 'Infosys', symbol: 'INFY', type: 'stock', exchange: 'NSE', country: 'India' },

            // US Stocks
            { name: 'Apple Inc.', symbol: 'AAPL', type: 'stock', exchange: 'NASDAQ', country: 'USA' },
            { name: 'Microsoft', symbol: 'MSFT', type: 'stock', exchange: 'NASDAQ', country: 'USA' },
            { name: 'Tesla', symbol: 'TSLA', type: 'stock', exchange: 'NASDAQ', country: 'USA' },

            // Crypto
            { name: 'Bitcoin', symbol: 'BTC', type: 'crypto', country: 'Global' },
            { name: 'Ethereum', symbol: 'ETH', type: 'crypto', country: 'Global' },

            // Precious Metals
            { name: 'Gold', symbol: 'GOLD', type: 'gold', country: 'Global' },
            { name: 'Silver', symbol: 'SILVER', type: 'silver', country: 'Global' },
        ];

        return fallbackData.filter(asset =>
            asset.name.toLowerCase().includes(query.toLowerCase()) ||
            (asset.symbol && asset.symbol.toLowerCase().includes(query.toLowerCase()))
        ).slice(0, 5);
    }

    /**
     * Helper methods for type mapping
     */
    private determineAssetType(type: string): AssetSuggestion['type'] {
        const t = type.toLowerCase();
        if (t.includes('equity') || t.includes('stock')) return 'stock';
        if (t.includes('etf')) return 'etf';
        if (t.includes('crypto')) return 'crypto';
        if (t.includes('bond')) return 'bond';
        if (t.includes('commodity')) return 'commodity';
        return 'stock'; // default
    }

    private mapPolygonType(type: string): AssetSuggestion['type'] {
        switch (type) {
            case 'CS': return 'stock';
            case 'ETF': return 'etf';
            case 'CRYPTO': return 'crypto';
            default: return 'stock';
        }
    }

    private mapYahooType(type: string): AssetSuggestion['type'] {
        switch (type) {
            case 'EQUITY': return 'stock';
            case 'ETF': return 'etf';
            case 'CRYPTOCURRENCY': return 'crypto';
            case 'BOND': return 'bond';
            default: return 'stock';
        }
    }

    private getCountryFromExchange(exchange: string): string {
        const exchangeMap: Record<string, string> = {
            'NASDAQ': 'USA',
            'NYSE': 'USA',
            'NSE': 'India',
            'BSE': 'India',
            'LSE': 'UK',
            'TSE': 'Japan',
            'SSE': 'China',
        };
        return exchangeMap[exchange] || 'Unknown';
    }
}

import { AI_CONFIG } from '../config/aiConfig';

// Export singleton instance
export const aiAssetService = new AIAssetService({
    geminiApiKey: AI_CONFIG.GEMINI_API_KEY,
    alphaVantageApiKey: AI_CONFIG.ALPHA_VANTAGE_API_KEY,
    polygonApiKey: AI_CONFIG.POLYGON_API_KEY,
    openaiApiKey: AI_CONFIG.OPENAI_API_KEY,
    enabledProviders: AI_CONFIG.ENABLED_PROVIDERS as any
});

export default AIAssetService;