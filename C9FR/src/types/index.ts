export interface NewsArticle {
  id: string;
  title: string;
  content: string;
  author: string;
  image_url: string;
  video_url?: string;
  category: Category;
  tags: Tag[];
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  subcategories: string[];
}

export interface Tag {
  id: number;
  name: string;
}

export interface UserPreferences {
  categories: Category[];
  tags: Tag[];
}

export type QuestionType = 'TX' | 'NU' | 'SC' | 'MC';

export interface QuestionnaireQuestion {
  id: number;
  group: string;
  text: string;
  type: QuestionType;
  choices?: string[];
  prompt?: string;
}

export interface Answer {
  question_id: number;
  selected_choices: string[];
  custom_input: string | null;
}

export interface QuestionnaireResponse {
  responses: Answer[];
}

// Goals interfaces
export interface Goal {
  id: string;
  title: string;
  currentAmount: number;
  targetAmount: number;
  description?: string;
  category?: string;
  image_url: string; // URL
  logo: string; // bank logo URL
  aiAnalysis: string;
  createdAt: string;
  updatedAt: string;
  progressPercentage: number;
}

export interface CreateGoalRequest {
  title: string;
  target_amount: number;
  description?: string;
  category?: string;
}

export interface UpdateGoalRequest extends Partial<CreateGoalRequest> {
  current_amount?: number;
}

// Opportunities interfaces
export interface Opportunity {
  id: string;
  title: string;
  description: string;
  category: string;
  opportunityType: 'investment' | 'goal_specific' | 'career' | 'financial_product' | 'market_timing' | 'education' | 'lifestyle';
  priority: 'high' | 'medium' | 'low';
  aiInsights: string;
  actionSteps: string[];
  relevanceScore: number;
  imageUrl?: string;
  originalPrice?: number;
  discountedPrice?: number;
  discountPercentage?: number;
  expiresAt?: string;
  externalUrl?: string;
  provider?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OpportunityCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface UserProfile {
  demographics: {
    age: number;
    maritalStatus: string;
    hasKids: boolean;
    dependents: string[];
  };
  financial: {
    monthlyIncome: number;
    jobStability: string;
    debtSituation: string;
    emergencyFund: string;
    monthlyExpenses: number;
    expenseBreakdown: Record<string, number>;
    savingsRate: number;
  };
  goals: {
    shortTerm: string;
    longTerm: string;
    priorities: string[];
  };
  personality: {
    spendingStyle: string;
    investmentComfort: string;
    riskTolerance: string;
  };
  riskFactors: string[];
  opportunities: string[];
}

// Asset Management interfaces
export type AssetType = 'stock' | 'etf' | 'bond' | 'crypto' | 'gold' | 'silver' | 'commodity';
export type RiskLevel = 'low' | 'medium' | 'high';
export type AssetRecommendation = 'buy' | 'hold' | 'sell' | 'monitor';
export type MarketStatus = 'open' | 'closed' | 'pre-market' | 'after-hours';
export type ChartTimeframe = 'daily' | 'weekly' | 'monthly';

export interface CandlestickData {
  date: string; // ISO date string
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  timestamp: number;
}

export interface ChartTouchData {
  x: number;
  y: number;
  date: string;
  price: number;
  candlestick: CandlestickData;
}

// Base Asset Interface
export interface Asset {
  id: string;
  name: string;
  assetType: AssetType;
  totalValue: number;
  
  // Performance Metrics
  totalGainLoss: number;
  totalGainLossPercent: number;
  
  // AI Insights
  aiAnalysis: string;
  riskLevel: RiskLevel;
  recommendation: AssetRecommendation;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  lastUpdated: string;
}

// TradableAsset Interface (extends Asset)
export interface TradableAsset extends Asset {
  symbol: string; // e.g., "AAPL", "BTC-USD"
  exchange: string; // e.g., "NASDAQ", "NSE", "Binance"
  currency: string; // e.g., "USD", "INR"
  
  // Holdings Information
  quantity: number;
  averagePurchasePrice: number;
  currentPrice: number;
  
  // Performance Metrics
  dailyChange: number;
  dailyChangePercent: number;
  
  // Chart Data (for stocks, crypto)
  chartData: CandlestickData[];
  
  // Metadata
  logoUrl?: string;
  sector?: string;
  marketCap?: number;
  volume?: string; // trading volume (e.g., "1.2M", "500K")
  peRatio?: number; // price-to-earnings ratio
  growthRate?: number; // revenue growth rate (replaces dividendYield)
  yieldToMaturity?: number; // for bonds
  maturityDate?: string; // for bonds
}

// PhysicalAsset Interface (extends Asset)
export interface PhysicalAsset extends Asset {
  // Holdings Information
  quantity: number;
  unit: string; // e.g., "grams", "ounces", "kg"
  purchasePrice: number; // per unit
  currentMarketPrice?: number; // per unit (optional, manually updated)
  
  // Manual tracking
  manuallyUpdated: boolean;
}

// Asset Creation Request Interface
export interface CreateAssetRequest {
  assetType: AssetType;
  name: string;
  
  // For tradeable assets
  symbol?: string;
  exchange?: string;
  currency?: string;
  
  // Common fields
  quantity: number;
  purchasePrice: number;
  purchaseDate?: string;
  
  // For physical assets
  unit?: string;
}

// PDF Import Interfaces
export interface ParsedAssetData {
  symbol: string;
  name: string;
  quantity: number;
  averagePurchasePrice: number;
  currentValue?: number;
  assetType: 'stock' | 'etf' | 'bond' | 'crypto';
  confidence: number; // parsing confidence score
}

export interface PDFParsingResult {
  success: boolean;
  assets: ParsedAssetData[];
  errors: string[];
  warnings: string[];
  totalAssetsFound: number;
  parsingConfidence: number;
}

// Legacy Investment interfaces (for backward compatibility)
export interface Investment {
  id: string;
  symbol: string; // e.g., "AAPL", "RELIANCE.NS"
  name: string; // e.g., "Apple Inc.", "Reliance Industries"
  assetType: AssetType;
  exchange: string; // e.g., "NASDAQ", "NSE"
  currency: string; // e.g., "USD", "INR"
  
  // Holdings Information
  quantity: number;
  averagePurchasePrice: number;
  currentPrice: number;
  totalValue: number;
  
  // Performance Metrics
  dailyChange: number;
  dailyChangePercent: number;
  totalGainLoss: number;
  totalGainLossPercent: number;
  
  // Chart Data
  chartData: CandlestickData[];
  lastUpdated: string;
  
  // AI Insights
  aiAnalysis: string;
  riskLevel: RiskLevel;
  recommendation: AssetRecommendation;
  
  // Metadata
  logoUrl?: string;
  sector?: string;
  marketCap?: number;
  growthRate?: number; // revenue growth rate (replaces dividendYield)
  createdAt: string;
  updatedAt: string;
}

export interface CreateInvestmentRequest {
  symbol: string;
  quantity: number;
  purchase_price: number;
  purchase_date?: string;
}

export interface UpdateInvestmentRequest extends Partial<CreateInvestmentRequest> {
  id: string;
}

export interface PriceUpdate {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  timestamp: string;
} 