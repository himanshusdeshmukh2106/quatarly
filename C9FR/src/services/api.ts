import axios from 'axios';
import { QuestionnaireResponse, Goal, CreateGoalRequest, UpdateGoalRequest, Opportunity, Investment, CreateInvestmentRequest, UpdateInvestmentRequest, CandlestickData, PriceUpdate, Asset, TradableAsset, PhysicalAsset, CreateAssetRequest, ChartTimeframe } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';

// IMPORTANT: Replace with your computer's IP address
// For Android emulator, use 10.0.2.2
// For physical device or iOS simulator, use your computer's IP address
const API_BASE_URL = __DEV__
  ? 'http://192.168.1.5:8000/api'  // Change this to your computer's IP
  : 'http://192.168.1.5:8000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// We'll need a way to set the auth token.
// This is a placeholder for now.
export const setAuthToken = (token: string | null) => {
  if (token) {
    apiClient.defaults.headers.common['Authorization'] = `Token ${token}`;
  } else {
    delete apiClient.defaults.headers.common['Authorization'];
  }
};

export const registerUser = async (userData: any) => {
  const response = await apiClient.post('/auth/registration/', userData);
  return response.data;
};

export const loginUser = async (credentials: any) => {
  const response = await apiClient.post('/auth/login/', credentials);
  return response.data;
};

export const logoutUser = async () => {
  const response = await apiClient.post('/auth/logout/');
  return response.data;
}

export const getUserDetails = async () => {
  const response = await apiClient.get('/auth/user/');
  return response.data;
}

export const submitQuestionnaire = async (data: QuestionnaireResponse, token: string) => {
  const response = await apiClient.post('/questionnaire/submit/', data, {
    headers: {
      Authorization: `Token ${token}`,
    },
  });
  return response.data;
};

export const submitPersonalizationAnswer = async (questionId: number, answer: any) => {
  const response = await apiClient.post(`/personalization/answer/${questionId}/`, { answer });
  return response.data;
};

export const sendSmsMessage = async (sms: any) => {
  try {
    const hasHeader = Boolean(apiClient.defaults.headers.common['Authorization']);
    if (!hasHeader) {
      const stored = await AsyncStorage.getItem('authToken');
      if (stored) setAuthToken(stored);
    }
    const response = await apiClient.post('/sms/receive/', sms);
    return response.data;
  } catch (e) {
    console.error('Failed to send SMS:', e);
  }
};

export const sendUpiNotification = async (notificationData: any) => {
  try {
    const hasHeader = Boolean(apiClient.defaults.headers.common['Authorization']);
    if (!hasHeader) {
      const token = await AsyncStorage.getItem('authToken');
      if (token) setAuthToken(token);
    }
    const payload = {
      notification_type: 'upi_notification',
      app: notificationData.app,
      title: notificationData.title || notificationData.titleBig || '',
      text: notificationData.text || '',
      bigText: notificationData.bigText || '',
      time: notificationData.time || new Date().toISOString(),
    };
    await apiClient.post('/notifications/create/', payload);
  } catch (e) {
    console.error('Failed to send notification:', e);
  }
};

// ===== Financial Dashboards =====

/**
 * Placeholder: Fetches aggregated expense totals for the past N months so the
 * client can render a line-chart. The backend should eventually return data in
 * the shape:
 *   [ { month: '2024-01', total: 5000 }, ... ]
 */
export const fetchMonthlyExpenseTotals = async (token: string) => {
  const response = await apiClient.get('/expenses/monthly-totals/', {
    headers: { Authorization: `Token ${token}` },
  });
  return response.data;
};

/**
 * Placeholder: Fetches category-wise breakdown for a particular month so the
 * client can render a pie-chart & list. Expected response example:
 *   {
 *     month: '2024-01',
 *     by_category: [ { category: 'Food', amount: 1500 }, ... ]
 *   }
 */
export const fetchMonthlyExpenseBreakdown = async (
  monthIso: string, // e.g. '2024-01'
  token: string,
) => {
  const response = await apiClient.get(`/expenses/breakdown/${monthIso}/`, {
    headers: { Authorization: `Token ${token}` },
  });
  return response.data;
};

/**
 * Placeholder: Fetches the user’s net-worth summary.
 * Expected response shape:
 *   { assets: 2000000, liabilities: 500000, net_worth: 1500000 }
 */
export const fetchNetWorthSummary = async (token: string) => {
  const response = await apiClient.get('/networth/summary/', {
    headers: { Authorization: `Token ${token}` },
  });
  return response.data;
};

/**
 * Placeholder: Fetches net-worth history points for the line chart.
 * Expected response:
 *   [ { month: '2024-03', net_worth: 125000 }, ... ]
 */
export const fetchNetWorthHistory = async (token: string) => {
  const response = await apiClient.get('/networth/history/', {
    headers: { Authorization: `Token ${token}` },
  });
  return response.data;
};

/**
 * Fetches AI generated budget notes per category.
 * Expected response:
 *   {
 *     "Food & Dining": "You are close to exceeding your budget. Consider cutting back.",
 *     "Transportation": "All good!"
 *   }
 */
export const fetchBudgetNotes = async (token?: string) => {
  const headers: any = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Token ${token}`;
  const response = await apiClient.get('/budget/notes/', { headers });
  return response.data as Record<string, string>;
};

// ===== Goals API =====

/**
 * Fetches all goals for the authenticated user
 */
export const fetchGoals = async (token?: string) => {
  const headers: any = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Token ${token}`;
  } else {
    const hasHeader = Boolean(apiClient.defaults.headers.common['Authorization']);
    if (!hasHeader) {
      const stored = await AsyncStorage.getItem('authToken');
      if (stored) setAuthToken(stored);
    }
  }

  const response = await apiClient.get('/goals/', { headers });

  // Transform backend response to frontend format
  return response.data.map((goal: any) => ({
    id: goal.id.toString(),
    title: goal.title,
    currentAmount: parseFloat(goal.current_amount),
    targetAmount: parseFloat(goal.target_amount),
    description: goal.description,
    category: goal.category,
    image_url: goal.image_url || 'https://via.placeholder.com/600x240.png?text=Goal',
    logo: 'https://logo.clearbit.com/chase.com', // Default bank logo
    aiAnalysis: goal.ai_analysis || 'AI analysis will be generated for this goal.',
    createdAt: goal.created_at,
    updatedAt: goal.updated_at,
    progressPercentage: goal.progress_percentage || 0,
  })) as Goal[];
};

/**
 * Creates a new goal for the authenticated user
 */
export const createGoal = async (goalData: CreateGoalRequest, token?: string) => {
  const headers: any = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Token ${token}`;
  } else {
    const hasHeader = Boolean(apiClient.defaults.headers.common['Authorization']);
    if (!hasHeader) {
      const stored = await AsyncStorage.getItem('authToken');
      if (stored) setAuthToken(stored);
    }
  }

  const response = await apiClient.post('/goals/', goalData, { headers });

  // Transform backend response to frontend format
  const goal = response.data;
  return {
    id: goal.id.toString(),
    title: goal.title,
    currentAmount: parseFloat(goal.current_amount),
    targetAmount: parseFloat(goal.target_amount),
    description: goal.description,
    category: goal.category,
    image_url: goal.image_url || 'https://via.placeholder.com/600x240.png?text=Goal',
    logo: 'https://logo.clearbit.com/chase.com', // Default bank logo
    aiAnalysis: goal.ai_analysis || 'AI analysis will be generated for this goal.',
    createdAt: goal.created_at,
    updatedAt: goal.updated_at,
    progressPercentage: goal.progress_percentage || 0,
  } as Goal;
};

/**
 * Updates an existing goal
 */
export const updateGoal = async (goalId: string, goalData: UpdateGoalRequest, token?: string) => {
  const headers: any = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Token ${token}`;
  } else {
    const hasHeader = Boolean(apiClient.defaults.headers.common['Authorization']);
    if (!hasHeader) {
      const stored = await AsyncStorage.getItem('authToken');
      if (stored) setAuthToken(stored);
    }
  }

  const response = await apiClient.patch(`/goals/${goalId}/`, goalData, { headers });

  // Transform backend response to frontend format
  const goal = response.data;
  return {
    id: goal.id.toString(),
    title: goal.title,
    currentAmount: parseFloat(goal.current_amount),
    targetAmount: parseFloat(goal.target_amount),
    description: goal.description,
    category: goal.category,
    image_url: goal.image_url || 'https://via.placeholder.com/600x240.png?text=Goal',
    logo: 'https://logo.clearbit.com/chase.com', // Default bank logo
    aiAnalysis: goal.ai_analysis || 'AI analysis will be generated for this goal.',
    createdAt: goal.created_at,
    updatedAt: goal.updated_at,
    progressPercentage: goal.progress_percentage || 0,
  } as Goal;
};

/**
 * Deletes a goal
 */
export const deleteGoal = async (goalId: string, token?: string) => {
  const headers: any = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Token ${token}`;
  } else {
    const hasHeader = Boolean(apiClient.defaults.headers.common['Authorization']);
    if (!hasHeader) {
      const stored = await AsyncStorage.getItem('authToken');
      if (stored) setAuthToken(stored);
    }
  }

  const response = await apiClient.delete(`/goals/${goalId}/`, { headers });
  return response.data;
};

/**
 * Generates a new image for a goal
 */
export const generateGoalImage = async (goalId: string, token?: string) => {
  const headers: any = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Token ${token}`;
  } else {
    const hasHeader = Boolean(apiClient.defaults.headers.common['Authorization']);
    if (!hasHeader) {
      const stored = await AsyncStorage.getItem('authToken');
      if (stored) setAuthToken(stored);
    }
  }

  const response = await apiClient.post(`/goals/${goalId}/generate_image/`, {}, { headers });

  // Transform backend response to frontend format
  const goal = response.data;
  return {
    id: goal.id.toString(),
    title: goal.title,
    currentAmount: parseFloat(goal.current_amount),
    targetAmount: parseFloat(goal.target_amount),
    description: goal.description,
    category: goal.category,
    image_url: goal.image_url || 'https://via.placeholder.com/600x240.png?text=Goal',
    logo: 'https://logo.clearbit.com/chase.com', // Default bank logo
    aiAnalysis: goal.ai_analysis || 'AI analysis will be generated for this goal.',
    createdAt: goal.created_at,
    updatedAt: goal.updated_at,
    progressPercentage: goal.progress_percentage || 0,
  } as Goal;
};

// ===== Opportunities API =====

/**
 * Fetches all opportunities for the authenticated user
 */
export const fetchOpportunities = async (token?: string) => {
  const headers: any = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Token ${token}`;
  } else {
    const hasHeader = Boolean(apiClient.defaults.headers.common['Authorization']);
    if (!hasHeader) {
      const stored = await AsyncStorage.getItem('authToken');
      if (stored) setAuthToken(stored);
    }
  }

  const response = await apiClient.get('/opportunities/', { headers });

  // Transform backend response to frontend format
  return response.data.map((opportunity: any) => ({
    id: opportunity.id.toString(),
    title: opportunity.title,
    description: opportunity.description,
    category: opportunity.category,
    opportunityType: opportunity.category as 'investment' | 'goal_specific' | 'career' | 'financial_product' | 'market_timing' | 'education' | 'lifestyle',
    priority: opportunity.priority,
    aiInsights: opportunity.ai_insights || 'AI insights will be generated for this opportunity.',
    actionSteps: opportunity.action_steps || [],
    relevanceScore: parseFloat(opportunity.relevance_score) || 0.0,
    imageUrl: opportunity.image_url || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&h=240',
    logoUrl: opportunity.logo_url || 'https://logo.clearbit.com/example.com',
    offerDetails: opportunity.offer_details || {},
    isActive: true, // Default to active since backend doesn't have this field
    createdAt: opportunity.created_at,
    updatedAt: opportunity.updated_at,
  })) as Opportunity[];
};

/**
 * Refreshes/regenerates opportunities for the authenticated user (synchronous)
 */
export const refreshOpportunities = async (token?: string) => {
  const headers: any = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Token ${token}`;
  } else {
    const hasHeader = Boolean(apiClient.defaults.headers.common['Authorization']);
    if (!hasHeader) {
      const stored = await AsyncStorage.getItem('authToken');
      if (stored) setAuthToken(stored);
    }
  }

  const response = await apiClient.post('/opportunities/refresh/', {}, { headers });

  // Transform backend response to frontend format
  if (response.data && Array.isArray(response.data)) {
    return response.data.map((opportunity: any) => ({
      id: opportunity.id.toString(),
      title: opportunity.title,
      description: opportunity.description,
      category: opportunity.category,
      opportunityType: opportunity.category as 'investment' | 'goal_specific' | 'career' | 'financial_product' | 'market_timing' | 'education' | 'lifestyle',
      priority: opportunity.priority,
      aiInsights: opportunity.ai_insights || 'AI insights will be generated for this opportunity.',
      actionSteps: opportunity.action_steps || [],
      relevanceScore: parseFloat(opportunity.relevance_score) || 0.0,
      imageUrl: opportunity.image_url || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&h=240',
      logoUrl: opportunity.logo_url || 'https://logo.clearbit.com/example.com',
      offerDetails: opportunity.offer_details || {},
      isActive: true, // Default to active since backend doesn't have this field
      createdAt: opportunity.created_at,
      updatedAt: opportunity.updated_at,
    })) as Opportunity[];
  }

  return [];
};



/**
 * Fetches user questionnaire responses for profile generation
 */
export const fetchUserResponses = async (token?: string) => {
  const headers: any = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Token ${token}`;
  } else {
    const hasHeader = Boolean(apiClient.defaults.headers.common['Authorization']);
    if (!hasHeader) {
      const stored = await AsyncStorage.getItem('authToken');
      if (stored) setAuthToken(stored);
    }
  }

  const response = await apiClient.get('/questionnaire/responses/', { headers });
  return response.data;
};

// ===== Investments API =====

/**
 * Fetches all investments for the authenticated user
 */
export const fetchInvestments = async (token?: string) => {
  const headers: any = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Token ${token}`;
  } else {
    const hasHeader = Boolean(apiClient.defaults.headers.common['Authorization']);
    if (!hasHeader) {
      const stored = await AsyncStorage.getItem('authToken');
      if (stored) setAuthToken(stored);
    }
  }

  const response = await apiClient.get('/investments/', { headers });

  // Transform backend response to frontend format
  return response.data.map((investment: any) => ({
    id: investment.id.toString(),
    symbol: investment.symbol,
    name: investment.name,
    assetType: investment.asset_type,
    exchange: investment.exchange,
    currency: investment.currency,
    quantity: parseFloat(investment.quantity),
    averagePurchasePrice: parseFloat(investment.average_purchase_price),
    currentPrice: parseFloat(investment.current_price),
    totalValue: parseFloat(investment.total_value),
    dailyChange: parseFloat(investment.daily_change),
    dailyChangePercent: parseFloat(investment.daily_change_percent),
    totalGainLoss: parseFloat(investment.total_gain_loss),
    totalGainLossPercent: parseFloat(investment.total_gain_loss_percent),
    chartData: investment.chart_data || [],
    lastUpdated: investment.last_updated,
    aiAnalysis: investment.ai_analysis || 'AI analysis will be generated for this investment.',
    riskLevel: investment.risk_level || 'medium',
    recommendation: investment.recommendation || 'hold',
    logoUrl: investment.logo_url,
    sector: investment.sector,
    marketCap: investment.market_cap ? parseFloat(investment.market_cap) : undefined,
    dividendYield: investment.dividend_yield ? parseFloat(investment.dividend_yield) : undefined,
    createdAt: investment.created_at,
    updatedAt: investment.updated_at,
  })) as Investment[];
};

/**
 * Creates a new investment for the authenticated user
 */
export const createInvestment = async (investmentData: CreateInvestmentRequest, token?: string) => {
  const headers: any = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Token ${token}`;
  } else {
    const hasHeader = Boolean(apiClient.defaults.headers.common['Authorization']);
    if (!hasHeader) {
      const stored = await AsyncStorage.getItem('authToken');
      if (stored) setAuthToken(stored);
    }
  }

  const response = await apiClient.post('/investments/', investmentData, { headers });

  // Transform backend response to frontend format
  const investment = response.data;
  return {
    id: investment.id.toString(),
    symbol: investment.symbol,
    name: investment.name,
    assetType: investment.asset_type,
    exchange: investment.exchange,
    currency: investment.currency,
    quantity: parseFloat(investment.quantity),
    averagePurchasePrice: parseFloat(investment.average_purchase_price),
    currentPrice: parseFloat(investment.current_price),
    totalValue: parseFloat(investment.total_value),
    dailyChange: parseFloat(investment.daily_change),
    dailyChangePercent: parseFloat(investment.daily_change_percent),
    totalGainLoss: parseFloat(investment.total_gain_loss),
    totalGainLossPercent: parseFloat(investment.total_gain_loss_percent),
    chartData: investment.chart_data || [],
    lastUpdated: investment.last_updated,
    aiAnalysis: investment.ai_analysis || 'AI analysis will be generated for this investment.',
    riskLevel: investment.risk_level || 'medium',
    recommendation: investment.recommendation || 'hold',
    logoUrl: investment.logo_url,
    sector: investment.sector,
    marketCap: investment.market_cap ? parseFloat(investment.market_cap) : undefined,
    dividendYield: investment.dividend_yield ? parseFloat(investment.dividend_yield) : undefined,
    createdAt: investment.created_at,
    updatedAt: investment.updated_at,
  } as Investment;
};

/**
 * Updates an existing investment
 */
export const updateInvestment = async (investmentId: string, investmentData: UpdateInvestmentRequest, token?: string) => {
  const headers: any = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Token ${token}`;
  } else {
    const hasHeader = Boolean(apiClient.defaults.headers.common['Authorization']);
    if (!hasHeader) {
      const stored = await AsyncStorage.getItem('authToken');
      if (stored) setAuthToken(stored);
    }
  }

  const response = await apiClient.patch(`/investments/${investmentId}/`, investmentData, { headers });

  // Transform backend response to frontend format
  const investment = response.data;
  return {
    id: investment.id.toString(),
    symbol: investment.symbol,
    name: investment.name,
    assetType: investment.asset_type,
    exchange: investment.exchange,
    currency: investment.currency,
    quantity: parseFloat(investment.quantity),
    averagePurchasePrice: parseFloat(investment.average_purchase_price),
    currentPrice: parseFloat(investment.current_price),
    totalValue: parseFloat(investment.total_value),
    dailyChange: parseFloat(investment.daily_change),
    dailyChangePercent: parseFloat(investment.daily_change_percent),
    totalGainLoss: parseFloat(investment.total_gain_loss),
    totalGainLossPercent: parseFloat(investment.total_gain_loss_percent),
    chartData: investment.chart_data || [],
    lastUpdated: investment.last_updated,
    aiAnalysis: investment.ai_analysis || 'AI analysis will be generated for this investment.',
    riskLevel: investment.risk_level || 'medium',
    recommendation: investment.recommendation || 'hold',
    logoUrl: investment.logo_url,
    sector: investment.sector,
    marketCap: investment.market_cap ? parseFloat(investment.market_cap) : undefined,
    dividendYield: investment.dividend_yield ? parseFloat(investment.dividend_yield) : undefined,
    createdAt: investment.created_at,
    updatedAt: investment.updated_at,
  } as Investment;
};

/**
 * Deletes an investment
 */
export const deleteInvestment = async (investmentId: string, token?: string) => {
  const headers: any = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Token ${token}`;
  } else {
    const hasHeader = Boolean(apiClient.defaults.headers.common['Authorization']);
    if (!hasHeader) {
      const stored = await AsyncStorage.getItem('authToken');
      if (stored) setAuthToken(stored);
    }
  }

  const response = await apiClient.delete(`/investments/${investmentId}/`, { headers });
  return response.data;
};

/**
 * Fetches historical chart data for a specific investment
 */
export const fetchChartData = async (symbol: string, timeframe: 'daily' | 'weekly' | 'monthly' = 'daily', token?: string) => {
  const headers: any = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Token ${token}`;
  } else {
    const hasHeader = Boolean(apiClient.defaults.headers.common['Authorization']);
    if (!hasHeader) {
      const stored = await AsyncStorage.getItem('authToken');
      if (stored) setAuthToken(stored);
    }
  }

  const response = await apiClient.get(`/investments/chart-data/${symbol}/`, {
    headers,
    params: { timeframe }
  });

  return response.data as CandlestickData[];
};

/**
 * Fetches real-time prices for multiple symbols
 */
export const fetchRealTimePrices = async (symbols: string[], token?: string) => {
  const headers: any = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Token ${token}`;
  } else {
    const hasHeader = Boolean(apiClient.defaults.headers.common['Authorization']);
    if (!hasHeader) {
      const stored = await AsyncStorage.getItem('authToken');
      if (stored) setAuthToken(stored);
    }
  }

  const response = await apiClient.post('/investments/real-time-prices/', { symbols }, { headers });
  return response.data as PriceUpdate[];
};

/**
 * Refreshes all investment prices for the authenticated user
 */
export const refreshInvestmentPrices = async (token?: string) => {
  const headers: any = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Token ${token}`;
  } else {
    const hasHeader = Boolean(apiClient.defaults.headers.common['Authorization']);
    if (!hasHeader) {
      const stored = await AsyncStorage.getItem('authToken');
      if (stored) setAuthToken(stored);
    }
  }

  const response = await apiClient.post('/investments/refresh-prices/', {}, { headers });

  // Transform backend response to frontend format
  return response.data.map((investment: any) => ({
    id: investment.id.toString(),
    symbol: investment.symbol,
    name: investment.name,
    assetType: investment.asset_type,
    exchange: investment.exchange,
    currency: investment.currency,
    quantity: parseFloat(investment.quantity),
    averagePurchasePrice: parseFloat(investment.average_purchase_price),
    currentPrice: parseFloat(investment.current_price),
    totalValue: parseFloat(investment.total_value),
    dailyChange: parseFloat(investment.daily_change),
    dailyChangePercent: parseFloat(investment.daily_change_percent),
    totalGainLoss: parseFloat(investment.total_gain_loss),
    totalGainLossPercent: parseFloat(investment.total_gain_loss_percent),
    chartData: investment.chart_data || [],
    lastUpdated: investment.last_updated,
    aiAnalysis: investment.ai_analysis || 'AI analysis will be generated for this investment.',
    riskLevel: investment.risk_level || 'medium',
    recommendation: investment.recommendation || 'hold',
    logoUrl: investment.logo_url,
    sector: investment.sector,
    marketCap: investment.market_cap ? parseFloat(investment.market_cap) : undefined,
    dividendYield: investment.dividend_yield ? parseFloat(investment.dividend_yield) : undefined,
    createdAt: investment.created_at,
    updatedAt: investment.updated_at,
  })) as Investment[];
};

// ===== Assets API =====

/**
 * Fetches all assets for the authenticated user (comprehensive portfolio)
 */
export const fetchAssets = async (token?: string) => {
  const headers: any = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Token ${token}`;
  } else {
    const hasHeader = Boolean(apiClient.defaults.headers.common['Authorization']);
    if (!hasHeader) {
      const stored = await AsyncStorage.getItem('authToken');
      if (stored) setAuthToken(stored);
    }
  }

  const response = await apiClient.get('/assets/', { headers });

  // Transform backend response to frontend format
  return response.data.map((asset: any) => {
    const baseAsset = {
      id: asset.id.toString(),
      name: asset.name,
      assetType: asset.asset_type,
      totalValue: parseFloat(asset.total_value),
      totalGainLoss: parseFloat(asset.total_gain_loss),
      totalGainLossPercent: parseFloat(asset.total_gain_loss_percent),
      aiAnalysis: asset.ai_analysis || 'AI analysis will be generated for this asset.',
      riskLevel: asset.risk_level || 'medium',
      recommendation: asset.recommendation || 'hold',
      createdAt: asset.created_at,
      updatedAt: asset.updated_at,
      lastUpdated: asset.last_updated,
    };

    // Handle tradeable assets (stocks, ETFs, bonds, crypto)
    if (['stock', 'etf', 'bond', 'crypto'].includes(asset.asset_type)) {
      return {
        ...baseAsset,
        symbol: asset.symbol,
        exchange: asset.exchange,
        currency: asset.currency,
        quantity: parseFloat(asset.quantity),
        averagePurchasePrice: parseFloat(asset.average_purchase_price),
        currentPrice: parseFloat(asset.current_price),
        dailyChange: parseFloat(asset.daily_change),
        dailyChangePercent: parseFloat(asset.daily_change_percent),
        chartData: asset.chart_data || [],
        logoUrl: asset.logo_url,
        sector: asset.sector,
        marketCap: asset.market_cap ? parseFloat(asset.market_cap) : undefined,
        dividendYield: asset.dividend_yield ? parseFloat(asset.dividend_yield) : undefined,
        yieldToMaturity: asset.yield_to_maturity ? parseFloat(asset.yield_to_maturity) : undefined,
        maturityDate: asset.maturity_date,
      } as TradableAsset;
    }

    // Handle physical assets (gold, silver, commodities)
    return {
      ...baseAsset,
      quantity: parseFloat(asset.quantity),
      unit: asset.unit,
      purchasePrice: parseFloat(asset.purchase_price),
      currentMarketPrice: asset.current_market_price ? parseFloat(asset.current_market_price) : undefined,
      purity: asset.purity,
      storage: asset.storage,
      certificate: asset.certificate,
      manuallyUpdated: asset.manually_updated || false,
    } as PhysicalAsset;
  }) as (TradableAsset | PhysicalAsset)[];
};

/**
 * Creates a new asset for the authenticated user
 */
export const createAsset = async (assetData: CreateAssetRequest, token?: string) => {
  const headers: any = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Token ${token}`;
  } else {
    const hasHeader = Boolean(apiClient.defaults.headers.common['Authorization']);
    if (!hasHeader) {
      const stored = await AsyncStorage.getItem('authToken');
      if (stored) setAuthToken(stored);
    }
  }

  // Transform frontend request to backend format
  const backendData = {
    asset_type: assetData.assetType,
    name: assetData.name,
    symbol: assetData.symbol,
    exchange: assetData.exchange,
    currency: assetData.currency,
    quantity: assetData.quantity,
    purchase_price: assetData.purchasePrice,
    purchase_date: assetData.purchaseDate,
    unit: assetData.unit,
    purity: assetData.purity,
    storage: assetData.storage,
    certificate: assetData.certificate,
  };

  const response = await apiClient.post('/assets/', backendData, { headers });

  // Transform backend response to frontend format
  const asset = response.data;
  const baseAsset = {
    id: asset.id.toString(),
    name: asset.name,
    assetType: asset.asset_type,
    totalValue: parseFloat(asset.total_value),
    totalGainLoss: parseFloat(asset.total_gain_loss),
    totalGainLossPercent: parseFloat(asset.total_gain_loss_percent),
    aiAnalysis: asset.ai_analysis || 'AI analysis will be generated for this asset.',
    riskLevel: asset.risk_level || 'medium',
    recommendation: asset.recommendation || 'hold',
    createdAt: asset.created_at,
    updatedAt: asset.updated_at,
    lastUpdated: asset.last_updated,
  };

  // Handle tradeable assets
  if (['stock', 'etf', 'bond', 'crypto'].includes(asset.asset_type)) {
    return {
      ...baseAsset,
      symbol: asset.symbol,
      exchange: asset.exchange,
      currency: asset.currency,
      quantity: parseFloat(asset.quantity),
      averagePurchasePrice: parseFloat(asset.average_purchase_price),
      currentPrice: parseFloat(asset.current_price),
      dailyChange: parseFloat(asset.daily_change),
      dailyChangePercent: parseFloat(asset.daily_change_percent),
      chartData: asset.chart_data || [],
      logoUrl: asset.logo_url,
      sector: asset.sector,
      marketCap: asset.market_cap ? parseFloat(asset.market_cap) : undefined,
      dividendYield: asset.dividend_yield ? parseFloat(asset.dividend_yield) : undefined,
      yieldToMaturity: asset.yield_to_maturity ? parseFloat(asset.yield_to_maturity) : undefined,
      maturityDate: asset.maturity_date,
    } as TradableAsset;
  }

  // Handle physical assets
  return {
    ...baseAsset,
    quantity: parseFloat(asset.quantity),
    unit: asset.unit,
    purchasePrice: parseFloat(asset.purchase_price),
    currentMarketPrice: asset.current_market_price ? parseFloat(asset.current_market_price) : undefined,
    purity: asset.purity,
    storage: asset.storage,
    certificate: asset.certificate,
    manuallyUpdated: asset.manually_updated || false,
  } as PhysicalAsset;
};



/**
 * Deletes an asset
 */
export const deleteAsset = async (assetId: string, token?: string) => {
  const headers: any = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Token ${token}`;
  } else {
    const hasHeader = Boolean(apiClient.defaults.headers.common['Authorization']);
    if (!hasHeader) {
      const stored = await AsyncStorage.getItem('authToken');
      if (stored) setAuthToken(stored);
    }
  }

  const response = await apiClient.delete(`/assets/${assetId}/`, { headers });
  return response.data;
};

/**
 * Fetches historical chart data for a specific tradeable asset
 */
export const fetchAssetChartData = async (symbol: string, timeframe: ChartTimeframe = 'daily', token?: string) => {
  const headers: any = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Token ${token}`;
  } else {
    const hasHeader = Boolean(apiClient.defaults.headers.common['Authorization']);
    if (!hasHeader) {
      const stored = await AsyncStorage.getItem('authToken');
      if (stored) setAuthToken(stored);
    }
  }

  const response = await apiClient.get(`/assets/chart-data/${symbol}/`, {
    headers,
    params: { timeframe }
  });

  return response.data as CandlestickData[];
};

/**
 * Fetches daily prices for multiple tradeable assets
 */
export const fetchDailyPrices = async (symbols: string[], token?: string) => {
  const headers: any = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Token ${token}`;
  } else {
    const hasHeader = Boolean(apiClient.defaults.headers.common['Authorization']);
    if (!hasHeader) {
      const stored = await AsyncStorage.getItem('authToken');
      if (stored) setAuthToken(stored);
    }
  }

  const response = await apiClient.post('/assets/daily-prices/', { symbols }, { headers });
  return response.data as PriceUpdate[];
};

/**
 * Refreshes all asset prices for the authenticated user (bulk price refresh)
 */
export const refreshAssetPrices = async (token?: string) => {
  const headers: any = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Token ${token}`;
  } else {
    const hasHeader = Boolean(apiClient.defaults.headers.common['Authorization']);
    if (!hasHeader) {
      const stored = await AsyncStorage.getItem('authToken');
      if (stored) setAuthToken(stored);
    }
  }

  const response = await apiClient.post('/assets/refresh-prices/', {}, { headers });

  // Transform backend response to frontend format
  return response.data.map((asset: any) => {
    const baseAsset = {
      id: asset.id.toString(),
      name: asset.name,
      assetType: asset.asset_type,
      totalValue: parseFloat(asset.total_value),
      totalGainLoss: parseFloat(asset.total_gain_loss),
      totalGainLossPercent: parseFloat(asset.total_gain_loss_percent),
      aiAnalysis: asset.ai_analysis || 'AI analysis will be generated for this asset.',
      riskLevel: asset.risk_level || 'medium',
      recommendation: asset.recommendation || 'hold',
      createdAt: asset.created_at,
      updatedAt: asset.updated_at,
      lastUpdated: asset.last_updated,
    };

    // Handle tradeable assets
    if (['stock', 'etf', 'bond', 'crypto'].includes(asset.asset_type)) {
      return {
        ...baseAsset,
        symbol: asset.symbol,
        exchange: asset.exchange,
        currency: asset.currency,
        quantity: parseFloat(asset.quantity),
        averagePurchasePrice: parseFloat(asset.average_purchase_price),
        currentPrice: parseFloat(asset.current_price),
        dailyChange: parseFloat(asset.daily_change),
        dailyChangePercent: parseFloat(asset.daily_change_percent),
        chartData: asset.chart_data || [],
        logoUrl: asset.logo_url,
        sector: asset.sector,
        marketCap: asset.market_cap ? parseFloat(asset.market_cap) : undefined,
        dividendYield: asset.dividend_yield ? parseFloat(asset.dividend_yield) : undefined,
        yieldToMaturity: asset.yield_to_maturity ? parseFloat(asset.yield_to_maturity) : undefined,
        maturityDate: asset.maturity_date,
      } as TradableAsset;
    }

    // Handle physical assets
    return {
      ...baseAsset,
      quantity: parseFloat(asset.quantity),
      unit: asset.unit,
      purchasePrice: parseFloat(asset.purchase_price),
      currentMarketPrice: asset.current_market_price ? parseFloat(asset.current_market_price) : undefined,
      purity: asset.purity,
      storage: asset.storage,
      certificate: asset.certificate,
      manuallyUpdated: asset.manually_updated || false,
    } as PhysicalAsset;
  }) as (TradableAsset | PhysicalAsset)[];
};

/**
 * Updates an existing asset
 */
export const updateAsset = async (assetId: string, assetData: Partial<Asset>, token?: string) => {
  const headers: any = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Token ${token}`;
  } else {
    const hasHeader = Boolean(apiClient.defaults.headers.common['Authorization']);
    if (!hasHeader) {
      const stored = await AsyncStorage.getItem('authToken');
      if (stored) setAuthToken(stored);
    }
  }

  // Transform frontend data to backend format
  const backendData: any = {};

  if (assetData.name) backendData.name = assetData.name;
  if (assetData.totalValue) backendData.total_value = assetData.totalValue;

  // Handle tradeable asset fields
  if ('symbol' in assetData) backendData.symbol = (assetData as TradableAsset).symbol;
  if ('exchange' in assetData) backendData.exchange = (assetData as TradableAsset).exchange;
  if ('quantity' in assetData) backendData.quantity = (assetData as TradableAsset).quantity;
  if ('averagePurchasePrice' in assetData) backendData.average_purchase_price = (assetData as TradableAsset).averagePurchasePrice;
  if ('sector' in assetData) backendData.sector = (assetData as TradableAsset).sector;

  // Handle physical asset fields
  if ('unit' in assetData) backendData.unit = (assetData as PhysicalAsset).unit;
  if ('purchasePrice' in assetData) backendData.purchase_price = (assetData as PhysicalAsset).purchasePrice;
  if ('currentMarketPrice' in assetData) backendData.current_market_price = (assetData as PhysicalAsset).currentMarketPrice;
  if ('purity' in assetData) backendData.purity = (assetData as PhysicalAsset).purity;
  if ('storage' in assetData) backendData.storage = (assetData as PhysicalAsset).storage;
  if ('certificate' in assetData) backendData.certificate = (assetData as PhysicalAsset).certificate;

  const response = await apiClient.patch(`/assets/${assetId}/`, backendData, { headers });

  // Transform backend response to frontend format
  const asset = response.data;
  const baseAsset = {
    id: asset.id.toString(),
    name: asset.name,
    assetType: asset.asset_type,
    totalValue: parseFloat(asset.total_value),
    totalGainLoss: parseFloat(asset.total_gain_loss),
    totalGainLossPercent: parseFloat(asset.total_gain_loss_percent),
    aiAnalysis: asset.ai_analysis || 'AI analysis will be generated for this asset.',
    riskLevel: asset.risk_level || 'medium',
    recommendation: asset.recommendation || 'hold',
    createdAt: asset.created_at,
    updatedAt: asset.updated_at,
    lastUpdated: asset.last_updated,
  };

  // Handle tradeable assets
  if (['stock', 'etf', 'bond', 'crypto'].includes(asset.asset_type)) {
    return {
      ...baseAsset,
      symbol: asset.symbol,
      exchange: asset.exchange,
      currency: asset.currency,
      quantity: parseFloat(asset.quantity),
      averagePurchasePrice: parseFloat(asset.average_purchase_price),
      currentPrice: parseFloat(asset.current_price),
      dailyChange: parseFloat(asset.daily_change),
      dailyChangePercent: parseFloat(asset.daily_change_percent),
      chartData: asset.chart_data || [],
      logoUrl: asset.logo_url,
      sector: asset.sector,
      marketCap: asset.market_cap ? parseFloat(asset.market_cap) : undefined,
      dividendYield: asset.dividend_yield ? parseFloat(asset.dividend_yield) : undefined,
      yieldToMaturity: asset.yield_to_maturity ? parseFloat(asset.yield_to_maturity) : undefined,
      maturityDate: asset.maturity_date,
    } as TradableAsset;
  }

  // Handle physical assets
  return {
    ...baseAsset,
    quantity: parseFloat(asset.quantity),
    unit: asset.unit,
    purchasePrice: parseFloat(asset.purchase_price),
    currentMarketPrice: asset.current_market_price ? parseFloat(asset.current_market_price) : undefined,
    purity: asset.purity,
    storage: asset.storage,
    certificate: asset.certificate,
    manuallyUpdated: asset.manually_updated || false,
  } as PhysicalAsset;
};