import axios from 'axios';
import { QuestionnaireResponse, Goal, CreateGoalRequest, UpdateGoalRequest, Opportunity, Investment, CreateInvestmentRequest, UpdateInvestmentRequest, CandlestickData, PriceUpdate, Asset, TradableAsset, PhysicalAsset, CreateAssetRequest, ChartTimeframe } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';

// IMPORTANT: Replace with your computer's IP address
// For Android emulator, use 10.0.2.2
// For physical device or iOS simulator, use your computer's IP address
const API_BASE_URL = __DEV__
  ? 'http://10.0.2.2:8000/api'  // Android emulator
  : 'http://192.168.1.3:8000/api';

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
    apiClient.defaults.headers.common.Authorization = `Token ${token}`;
  } else {
    delete apiClient.defaults.headers.common.Authorization;
  }
};

export const registerUser = async (userData: any) => {
  try {
    const response = await apiClient.post('/auth/registration/', userData);
    return response.data;
  } catch (error: any) {
    console.error('Error registering user:', error);
    if (error.response?.status === 400) {
      throw new Error('Invalid registration data. Please check your input.');
    }
    throw error;
  }
};

export const loginUser = async (credentials: any) => {
  try {
    const response = await apiClient.post('/auth/login/', credentials);
    return response.data;
  } catch (error: any) {
    console.error('Error logging in user:', error);
    if (error.response?.status === 401) {
      throw new Error('Invalid credentials. Please check your username and password.');
    }
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    const response = await apiClient.post('/auth/logout/');
    return response.data;
  } catch (error: any) {
    console.error('Error logging out user:', error);
    // Don't throw error for logout - just log it
    return { success: false };
  }
};

export const getUserDetails = async () => {
  try {
    const response = await apiClient.get('/auth/user/');
    return response.data;
  } catch (error: any) {
    console.error('Error fetching user details:', error);
    if (error.response?.status === 401) {
      throw new Error('Authentication required. Please log in again.');
    }
    throw error;
  }
};

export const submitQuestionnaire = async (data: QuestionnaireResponse, token: string) => {
  try {
    const response = await apiClient.post('/questionnaire/submit/', data, {
      headers: {
        Authorization: `Token ${token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    console.error('Error submitting questionnaire:', error);
    if (error.response?.status === 400) {
      throw new Error('Invalid questionnaire data. Please check your responses.');
    }
    if (error.response?.status === 401) {
      throw new Error('Authentication required. Please log in again.');
    }
    throw error;
  }
};

export const submitPersonalizationAnswer = async (questionId: number, answer: any) => {
  try {
    const response = await apiClient.post(`/personalization/answer/${questionId}/`, { answer });
    return response.data;
  } catch (error: any) {
    console.error('Error submitting personalization answer:', error);
    if (error.response?.status === 404) {
      throw new Error(`Question with ID ${questionId} not found.`);
    }
    if (error.response?.status === 400) {
      throw new Error('Invalid answer format. Please check your response.');
    }
    throw error;
  }
};

export const sendSmsMessage = async (sms: any) => {
  try {
    const hasHeader = Boolean(apiClient.defaults.headers.common.Authorization);
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
    const hasHeader = Boolean(apiClient.defaults.headers.common.Authorization);
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
  try {
    const response = await apiClient.get('/expenses/monthly-totals/', {
      headers: { Authorization: `Token ${token}` },
    });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching monthly expense totals:', error);
    if (error.response?.status === 401) {
      throw new Error('Authentication required. Please log in again.');
    }
    throw error;
  }
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
  try {
    const response = await apiClient.get(`/expenses/breakdown/${monthIso}/`, {
      headers: { Authorization: `Token ${token}` },
    });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching monthly expense breakdown:', error);
    if (error.response?.status === 404) {
      throw new Error(`No expense data found for month: ${monthIso}`);
    }
    if (error.response?.status === 401) {
      throw new Error('Authentication required. Please log in again.');
    }
    throw error;
  }
};

/**
 * Placeholder: Fetches the user’s net-worth summary.
 * Expected response shape:
 *   { assets: 2000000, liabilities: 500000, net_worth: 1500000 }
 */
export const fetchNetWorthSummary = async (token: string) => {
  try {
    const response = await apiClient.get('/networth/summary/', {
      headers: { Authorization: `Token ${token}` },
    });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching net worth summary:', error);
    if (error.response?.status === 401) {
      throw new Error('Authentication required. Please log in again.');
    }
    throw error;
  }
};

/**
 * Placeholder: Fetches net-worth history points for the line chart.
 * Expected response:
 *   [ { month: '2024-03', net_worth: 125000 }, ... ]
 */
export const fetchNetWorthHistory = async (token: string) => {
  try {
    const response = await apiClient.get('/networth/history/', {
      headers: { Authorization: `Token ${token}` },
    });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching net worth history:', error);
    if (error.response?.status === 401) {
      throw new Error('Authentication required. Please log in again.');
    }
    throw error;
  }
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
  try {
    const headers: any = { 'Content-Type': 'application/json' };
    if (token) headers.Authorization = `Token ${token}`;
    const response = await apiClient.get('/budget/notes/', { headers });
    return response.data as Record<string, string>;
  } catch (error: any) {
    console.error('Error fetching budget notes:', error);
    if (error.response?.status === 401) {
      throw new Error('Authentication required. Please log in again.');
    }
    throw error;
  }
};

// ===== Goals API =====

/**
 * Fetches all goals for the authenticated user
 */
export const fetchGoals = async (token?: string) => {
  try {
    const headers: any = { 'Content-Type': 'application/json' };
    if (token) {
      headers.Authorization = `Token ${token}`;
    } else {
      const hasHeader = Boolean(apiClient.defaults.headers.common.Authorization);
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
  } catch (error: any) {
    console.error('Error fetching goals:', error);
    if (error.response?.status === 401) {
      throw new Error('Authentication required. Please log in again.');
    }
    throw error;
  }
};

/**
 * Creates a new goal for the authenticated user
 */
export const createGoal = async (goalData: CreateGoalRequest, token?: string) => {
  try {
    const headers: any = { 'Content-Type': 'application/json' };
    if (token) {
      headers.Authorization = `Token ${token}`;
    } else {
      const hasHeader = Boolean(apiClient.defaults.headers.common.Authorization);
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
  } catch (error: any) {
    console.error('Error creating goal:', error);
    if (error.response?.status === 400) {
      throw new Error('Invalid goal data. Please check your input.');
    }
    if (error.response?.status === 401) {
      throw new Error('Authentication required. Please log in again.');
    }
    throw error;
  }
};

/**
 * Updates an existing goal
 */
export const updateGoal = async (goalId: string, goalData: UpdateGoalRequest, token?: string) => {
  try {
    if (!goalId) {
      throw new Error('Goal ID is required for update');
    }

    const headers: any = { 'Content-Type': 'application/json' };
    if (token) {
      headers.Authorization = `Token ${token}`;
    } else {
      const hasHeader = Boolean(apiClient.defaults.headers.common.Authorization);
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
  } catch (error: any) {
    console.error('Error updating goal:', error);
    if (error.response?.status === 404) {
      throw new Error(`Goal with ID ${goalId} not found`);
    }
    if (error.response?.status === 400) {
      throw new Error('Invalid goal data. Please check your input.');
    }
    if (error.response?.status === 401) {
      throw new Error('Authentication required. Please log in again.');
    }
    throw error;
  }
};

/**
 * Deletes a goal
 */
export const deleteGoal = async (goalId: string, token?: string) => {
  try {
    if (!goalId) {
      throw new Error('Goal ID is required for deletion');
    }

    const headers: any = { 'Content-Type': 'application/json' };
    if (token) {
      headers.Authorization = `Token ${token}`;
    } else {
      const hasHeader = Boolean(apiClient.defaults.headers.common.Authorization);
      if (!hasHeader) {
        const stored = await AsyncStorage.getItem('authToken');
        if (stored) setAuthToken(stored);
      }
    }

    const response = await apiClient.delete(`/goals/${goalId}/`, { headers });
    return response.data;
  } catch (error: any) {
    console.error('Error deleting goal:', error);
    if (error.response?.status === 404) {
      throw new Error(`Goal with ID ${goalId} not found`);
    }
    if (error.response?.status === 401) {
      throw new Error('Authentication required. Please log in again.');
    }
    throw error;
  }
};

/**
 * Generates a new image for a goal
 */
export const generateGoalImage = async (goalId: string, token?: string) => {
  try {
    if (!goalId) {
      throw new Error('Goal ID is required for image generation');
    }

    const headers: any = { 'Content-Type': 'application/json' };
    if (token) {
      headers.Authorization = `Token ${token}`;
    } else {
      const hasHeader = Boolean(apiClient.defaults.headers.common.Authorization);
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
  } catch (error: any) {
    console.error('Error generating goal image:', error);
    if (error.response?.status === 404) {
      throw new Error(`Goal with ID ${goalId} not found`);
    }
    if (error.response?.status === 401) {
      throw new Error('Authentication required. Please log in again.');
    }
    throw error;
  }
};

// ===== Opportunities API =====

/**
 * Fetches all opportunities for the authenticated user
 */
export const fetchOpportunities = async (token?: string) => {
  try {
    const headers: any = { 'Content-Type': 'application/json' };
    if (token) {
      headers.Authorization = `Token ${token}`;
    } else {
      const hasHeader = Boolean(apiClient.defaults.headers.common.Authorization);
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
  } catch (error: any) {
    console.error('Error fetching opportunities:', error);
    if (error.response?.status === 401) {
      throw new Error('Authentication required. Please log in again.');
    }
    throw error;
  }
};

/**
 * Refreshes/regenerates opportunities for the authenticated user (synchronous)
 */
export const refreshOpportunities = async (token?: string) => {
  try {
    const headers: any = { 'Content-Type': 'application/json' };
    if (token) {
      headers.Authorization = `Token ${token}`;
    } else {
      const hasHeader = Boolean(apiClient.defaults.headers.common.Authorization);
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
  } catch (error: any) {
    console.error('Error refreshing opportunities:', error);
    if (error.response?.status === 401) {
      throw new Error('Authentication required. Please log in again.');
    }
    throw error;
  }
};



/**
 * Fetches user questionnaire responses for profile generation
 */
export const fetchUserResponses = async (token?: string) => {
  try {
    const headers: any = { 'Content-Type': 'application/json' };
    if (token) {
      headers.Authorization = `Token ${token}`;
    } else {
      const hasHeader = Boolean(apiClient.defaults.headers.common.Authorization);
      if (!hasHeader) {
        const stored = await AsyncStorage.getItem('authToken');
        if (stored) setAuthToken(stored);
      }
    }

    const response = await apiClient.get('/questionnaire/responses/', { headers });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching user responses:', error);
    if (error.response?.status === 401) {
      throw new Error('Authentication required. Please log in again.');
    }
    throw error;
  }
};

// ===== Investments API =====

/**
 * Fetches enhanced asset data for asset cards (market cap, P/E ratio, etc.)
 */
export const fetchEnhancedAssetData = async (symbol: string, assetType: string = 'stock', token?: string) => {
  try {
    const headers: any = { 'Content-Type': 'application/json' };
    if (token) {
      headers.Authorization = `Token ${token}`;
    } else {
      const hasHeader = Boolean(apiClient.defaults.headers.common.Authorization);
      if (!hasHeader) {
        const stored = await AsyncStorage.getItem('authToken');
        if (stored) setAuthToken(stored);
      }
    }

    const response = await apiClient.get(`/investments/enhanced_data/?symbol=${symbol}&asset_type=${assetType}`, { headers });
    
    // Return the enhanced data with proper formatting
    return {
      symbol: response.data.symbol,
      name: response.data.name,
      sector: response.data.sector,
      volume: response.data.volume,
      marketCap: response.data.market_cap, // In crores
      peRatio: response.data.pe_ratio,
      growthRate: response.data.growth_rate,
      currentPrice: response.data.current_price,
      exchange: response.data.exchange,
      currency: response.data.currency,
    };
  } catch (error: any) {
    console.error(`Error fetching enhanced data for ${symbol}:`, error);
    if (error.response?.status === 401) {
      throw new Error('Authentication required. Please log in again.');
    }
    if (error.response?.status === 404) {
      throw new Error(`No data available for symbol ${symbol}`);
    }
    throw error;
  }
};

/**
 * Fetches all investments for the authenticated user
 */
export const fetchInvestments = async (token?: string) => {
  try {
    const headers: any = { 'Content-Type': 'application/json' };
    if (token) {
      headers.Authorization = `Token ${token}`;
    } else {
      const hasHeader = Boolean(apiClient.defaults.headers.common.Authorization);
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
      growthRate: investment.growth_rate ? parseFloat(investment.growth_rate) : undefined,
      createdAt: investment.created_at,
      updatedAt: investment.updated_at,
    })) as Investment[];
  } catch (error: any) {
    console.error('Error fetching investments:', error);
    if (error.response?.status === 401) {
      throw new Error('Authentication required. Please log in again.');
    }
    throw error;
  }
};

/**
 * Creates a new investment for the authenticated user
 */
export const createInvestment = async (investmentData: CreateInvestmentRequest, token?: string) => {
  try {
    const headers: any = { 'Content-Type': 'application/json' };
    if (token) {
      headers.Authorization = `Token ${token}`;
    } else {
      const hasHeader = Boolean(apiClient.defaults.headers.common.Authorization);
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
      growthRate: investment.growth_rate ? parseFloat(investment.growth_rate) : undefined,
      createdAt: investment.created_at,
      updatedAt: investment.updated_at,
    } as Investment;
  } catch (error: any) {
    console.error('Error creating investment:', error);
    if (error.response?.status === 400) {
      throw new Error('Invalid investment data. Please check your input.');
    }
    if (error.response?.status === 401) {
      throw new Error('Authentication required. Please log in again.');
    }
    throw error;
  }
};

/**
 * Updates an existing investment
 */
export const updateInvestment = async (investmentId: string, investmentData: UpdateInvestmentRequest, token?: string) => {
  try {
    if (!investmentId) {
      throw new Error('Investment ID is required for update');
    }

    const headers: any = { 'Content-Type': 'application/json' };
    if (token) {
      headers.Authorization = `Token ${token}`;
    } else {
      const hasHeader = Boolean(apiClient.defaults.headers.common.Authorization);
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
      growthRate: investment.growth_rate ? parseFloat(investment.growth_rate) : undefined,
      createdAt: investment.created_at,
      updatedAt: investment.updated_at,
    } as Investment;
  } catch (error: any) {
    console.error('Error updating investment:', error);
    if (error.response?.status === 404) {
      throw new Error(`Investment with ID ${investmentId} not found`);
    }
    if (error.response?.status === 400) {
      throw new Error('Invalid investment data. Please check your input.');
    }
    if (error.response?.status === 401) {
      throw new Error('Authentication required. Please log in again.');
    }
    throw error;
  }
};

/**
 * Deletes an investment
 */
export const deleteInvestment = async (investmentId: string, token?: string) => {
  try {
    if (!investmentId) {
      throw new Error('Investment ID is required for deletion');
    }

    const headers: any = { 'Content-Type': 'application/json' };
    if (token) {
      headers.Authorization = `Token ${token}`;
    } else {
      const hasHeader = Boolean(apiClient.defaults.headers.common.Authorization);
      if (!hasHeader) {
        const stored = await AsyncStorage.getItem('authToken');
        if (stored) setAuthToken(stored);
      }
    }

    const response = await apiClient.delete(`/investments/${investmentId}/`, { headers });
    return response.data;
  } catch (error: any) {
    console.error('Error deleting investment:', error);
    if (error.response?.status === 404) {
      throw new Error(`Investment with ID ${investmentId} not found`);
    }
    if (error.response?.status === 401) {
      throw new Error('Authentication required. Please log in again.');
    }
    throw error;
  }
};

/**
 * Fetches historical chart data for a specific investment
 */
export const fetchChartData = async (symbol: string, timeframe: 'daily' | 'weekly' | 'monthly' = 'daily', token?: string) => {
  try {
    const headers: any = { 'Content-Type': 'application/json' };
    if (token) {
      headers.Authorization = `Token ${token}`;
    } else {
      const hasHeader = Boolean(apiClient.defaults.headers.common.Authorization);
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
  } catch (error: any) {
    console.error('Error fetching chart data:', error);
    if (error.response?.status === 404) {
      throw new Error(`Chart data not found for symbol: ${symbol}`);
    }
    if (error.response?.status === 401) {
      throw new Error('Authentication required. Please log in again.');
    }
    throw error;
  }
};

/**
 * Fetches real-time prices for multiple symbols
 */
export const fetchRealTimePrices = async (symbols: string[], token?: string) => {
  try {
    if (!symbols || symbols.length === 0) {
      throw new Error('No symbols provided for price fetch');
    }

    const headers: any = { 'Content-Type': 'application/json' };
    if (token) {
      headers.Authorization = `Token ${token}`;
    } else {
      const hasHeader = Boolean(apiClient.defaults.headers.common.Authorization);
      if (!hasHeader) {
        const stored = await AsyncStorage.getItem('authToken');
        if (stored) setAuthToken(stored);
      }
    }

    const response = await apiClient.post('/investments/real-time-prices/', { symbols }, { headers });
    return response.data as PriceUpdate[];
  } catch (error: any) {
    console.error('Error fetching real-time prices:', error);
    if (error.response?.status === 401) {
      throw new Error('Authentication required. Please log in again.');
    }
    throw error;
  }
};

/**
 * Refreshes all investment prices for the authenticated user
 */
export const refreshInvestmentPrices = async (token?: string) => {
  const headers: any = { 'Content-Type': 'application/json' };
  if (token) {
    headers.Authorization = `Token ${token}`;
  } else {
    const hasHeader = Boolean(apiClient.defaults.headers.common.Authorization);
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
    growthRate: investment.growth_rate ? parseFloat(investment.growth_rate) : undefined,
    createdAt: investment.created_at,
    updatedAt: investment.updated_at,
  })) as Investment[];
};

// ===== Assets API =====

/**
 * Fetches all assets for the authenticated user (comprehensive portfolio)
 * Note: Currently uses investments endpoint as assets endpoint is not implemented
 */
export const fetchAssets = async (token?: string) => {
  try {
    const headers: any = { 'Content-Type': 'application/json' };
    if (token) {
      headers.Authorization = `Token ${token}`;
    } else {
      const hasHeader = Boolean(apiClient.defaults.headers.common.Authorization);
      if (!hasHeader) {
        const stored = await AsyncStorage.getItem('authToken');
        if (stored) setAuthToken(stored);
      }
    }

    // Use investments endpoint for now since assets endpoint doesn't exist
    const response = await apiClient.get('/investments/', { headers });

    // Transform investments response to assets format
    return response.data.map((investment: any) => {
      return {
        id: investment.id.toString(),
        name: investment.name,
        symbol: investment.symbol,
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
        aiAnalysis: investment.ai_analysis || 'AI analysis will be generated for this asset.',
        riskLevel: investment.risk_level || 'medium',
        recommendation: investment.recommendation || 'hold',
        logoUrl: investment.logo_url,
        sector: investment.sector,
        volume: investment.volume || '1.2M',
        marketCap: investment.market_cap ? parseFloat(investment.market_cap) : undefined,
        growthRate: investment.growth_rate ? parseFloat(investment.growth_rate) : undefined,
        createdAt: investment.created_at,
        updatedAt: investment.updated_at,
      } as TradableAsset;
    }) as Asset[];
  } catch (error: any) {
    console.error('Error fetching assets:', error);
    if (error.response?.status === 401) {
      throw new Error('Authentication required. Please log in again.');
    }
    throw error;
  }
};

/**
 * Creates a new asset for the authenticated user
 * Note: Currently uses investments endpoint for tradeable assets only
 */
export const createAsset = async (assetData: CreateAssetRequest, token?: string) => {
  try {
    const headers: any = { 'Content-Type': 'application/json' };
    if (token) {
      headers.Authorization = `Token ${token}`;
    } else {
      const hasHeader = Boolean(apiClient.defaults.headers.common.Authorization);
      if (!hasHeader) {
        const stored = await AsyncStorage.getItem('authToken');
        if (stored) setAuthToken(stored);
      }
    }

    // Only support tradeable assets for now (stocks, ETFs, bonds, crypto)
    if (!['stock', 'etf', 'bond', 'crypto'].includes(assetData.assetType)) {
      throw new Error('Physical assets are not yet supported. Please use investments for tradeable assets only.');
    }

    // Transform frontend request to investments format
    const investmentData = {
      asset_type: assetData.assetType,
      name: assetData.name,
      symbol: assetData.symbol || assetData.name,
      exchange: assetData.exchange,
      currency: assetData.currency,
      quantity: assetData.quantity,
      average_purchase_price: assetData.purchasePrice,
    };

    const response = await apiClient.post('/investments/', investmentData, { headers });

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
        volume: asset.volume || '1.2M',
        marketCap: asset.market_cap ? parseFloat(asset.market_cap) : undefined,
        growthRate: asset.growth_rate ? parseFloat(asset.growth_rate) : undefined,
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

      manuallyUpdated: asset.manually_updated || false,
    } as PhysicalAsset;
  } catch (error: any) {
    console.error('Error creating asset:', error);
    if (error.response?.status === 400) {
      throw new Error('Invalid asset data provided. Please check your input.');
    }
    if (error.response?.status === 401) {
      throw new Error('Authentication required. Please log in again.');
    }
    throw error;
  }
};



/**
 * Deletes an asset
 */
export const deleteAsset = async (assetId: string, token?: string) => {
  try {
    if (!assetId) {
      throw new Error('Asset ID is required for deletion');
    }

    const headers: any = { 'Content-Type': 'application/json' };
    if (token) {
      headers.Authorization = `Token ${token}`;
    } else {
      const hasHeader = Boolean(apiClient.defaults.headers.common.Authorization);
      if (!hasHeader) {
        const stored = await AsyncStorage.getItem('authToken');
        if (stored) setAuthToken(stored);
      }
    }

    const response = await apiClient.delete(`/investments/${assetId}/`, { headers });
    return response.data;
  } catch (error: any) {
    console.error('Error deleting asset:', error);
    if (error.response?.status === 404) {
      throw new Error(`Asset with ID ${assetId} not found`);
    }
    if (error.response?.status === 401) {
      throw new Error('Authentication required. Please log in again.');
    }
    throw error;
  }
};

/**
 * Fetches enhanced market data for a symbol including PE ratio, market cap, volume etc.
 */
export const fetchEnhancedMarketData = async (
  symbol: string, 
  assetType: string = 'stock', 
  token?: string, 
  forceRefresh: boolean = false
) => {
  try {
    if (!symbol) {
      throw new Error('Symbol is required for enhanced market data fetch');
    }

    const headers: any = { 'Content-Type': 'application/json' };
    if (token) {
      headers.Authorization = `Token ${token}`;
    } else {
      const hasHeader = Boolean(apiClient.defaults.headers.common.Authorization);
      if (!hasHeader) {
        const stored = await AsyncStorage.getItem('authToken');
        if (stored) setAuthToken(stored);
      }
    }

    const response = await apiClient.get('/investments/enhanced_data/', {
      headers,
      params: { 
        symbol, 
        asset_type: assetType,
        force_refresh: forceRefresh ? 'true' : 'false'
      }
    });

    return response.data;
  } catch (error: any) {
    console.error('Error fetching enhanced market data:', error);
    if (error.response?.status === 404) {
      throw new Error(`Enhanced market data not found for symbol: ${symbol}`);
    }
    if (error.response?.status === 401) {
      throw new Error('Authentication required. Please log in again.');
    }
    throw error;
  }
};

/**
 * Fetches OHLC data for line chart display
 */
export const fetchOHLCData = async (
  symbol: string, 
  timeframe: string = '1Day', 
  days: number = 30, // Default to 30 days for monthly chart
  token?: string,
  forceRefresh: boolean = false
) => {
  try {
    if (!symbol) {
      throw new Error('Symbol is required for OHLC data fetch');
    }

    const headers: any = { 'Content-Type': 'application/json' };
    if (token) {
      headers.Authorization = `Token ${token}`;
    } else {
      const hasHeader = Boolean(apiClient.defaults.headers.common.Authorization);
      if (!hasHeader) {
        const stored = await AsyncStorage.getItem('authToken');
        if (stored) setAuthToken(stored);
      }
    }

    const response = await apiClient.get('/investments/get_ohlc_data/', {
      headers,
      params: { 
        symbol, 
        timeframe, 
        days,
        force_refresh: forceRefresh ? 'true' : 'false'
      }
    });

    return response.data;
  } catch (error: any) {
    console.error('Error fetching OHLC data:', error);
    if (error.response?.status === 404) {
      throw new Error(`OHLC data not found for symbol: ${symbol}`);
    }
    if (error.response?.status === 401) {
      throw new Error('Authentication required. Please log in again.');
    }
    throw error;
  }
};

/**
 * Fetches monthly OHLC data (30 days) for line chart display
 * This is a convenience function that wraps fetchOHLCData with monthly parameters
 */
export const fetchMonthlyOHLCData = async (
  symbol: string,
  token?: string,
  forceRefresh: boolean = false
) => {
  return fetchOHLCData(symbol, '1Day', 30, token, forceRefresh);
};

/**
 * Fetches historical chart data for a specific tradeable asset
 */
export const fetchAssetChartData = async (symbol: string, timeframe: ChartTimeframe = 'daily', token?: string) => {
  try {
    if (!symbol) {
      throw new Error('Symbol is required for chart data fetch');
    }

    const headers: any = { 'Content-Type': 'application/json' };
    if (token) {
      headers.Authorization = `Token ${token}`;
    } else {
      const hasHeader = Boolean(apiClient.defaults.headers.common.Authorization);
      if (!hasHeader) {
        const stored = await AsyncStorage.getItem('authToken');
        if (stored) setAuthToken(stored);
      }
    }

    const response = await apiClient.get(`/investments/${symbol}/chart-data/`, {
      headers,
      params: { timeframe }
    });

    return response.data as CandlestickData[];
  } catch (error: any) {
    console.error('Error fetching asset chart data:', error);
    if (error.response?.status === 404) {
      throw new Error(`Chart data not found for symbol: ${symbol}`);
    }
    if (error.response?.status === 401) {
      throw new Error('Authentication required. Please log in again.');
    }
    throw error;
  }
};

/**
 * Fetches daily prices for multiple tradeable assets
 */
export const fetchDailyPrices = async (symbols: string[], token?: string) => {
  try {
    if (!symbols || symbols.length === 0) {
      throw new Error('No symbols provided for daily prices fetch');
    }

    const headers: any = { 'Content-Type': 'application/json' };
    if (token) {
      headers.Authorization = `Token ${token}`;
    } else {
      const hasHeader = Boolean(apiClient.defaults.headers.common.Authorization);
      if (!hasHeader) {
        const stored = await AsyncStorage.getItem('authToken');
        if (stored) setAuthToken(stored);
      }
    }

    const response = await apiClient.post('/investments/real-time-prices/', { symbols }, { headers });
    return response.data as PriceUpdate[];
  } catch (error: any) {
    console.error('Error fetching daily prices:', error);
    if (error.response?.status === 401) {
      throw new Error('Authentication required. Please log in again.');
    }
    throw error;
  }
};

/**
 * Refreshes all asset prices for the authenticated user (bulk price refresh)
 */
export const refreshAssetPrices = async (token?: string) => {
  try {
    const headers: any = { 'Content-Type': 'application/json' };
    if (token) {
      headers.Authorization = `Token ${token}`;
    } else {
      const hasHeader = Boolean(apiClient.defaults.headers.common.Authorization);
      if (!hasHeader) {
        const stored = await AsyncStorage.getItem('authToken');
        if (stored) setAuthToken(stored);
      }
    }

    const response = await apiClient.post('/investments/price-refresh/', {}, { headers });

    // The backend now returns an array of assets directly
    if (Array.isArray(response.data)) {
      return response.data.map((asset: any) => transformAssetData(asset));
    } else {
      console.log('No assets returned from price-refresh');
      return [];
    }
  } catch (error: any) {
    console.error('Error refreshing asset prices:', error);
    if (error.response?.status === 404) {
      throw new Error('Price refresh endpoint not found. Please check if the backend server is running.');
    }
    throw error;
  }
};

// Helper function to safely transform asset data
const transformAssetData = (asset: any) => {
  try {
    const baseAsset = {
      id: (asset.id || '').toString(),
      name: asset.name || 'Unknown Asset',
      assetType: asset.asset_type || 'stock',
      totalValue: parseFloat(asset.total_value || '0') || 0,
      totalGainLoss: parseFloat(asset.total_gain_loss || '0') || 0,
      totalGainLossPercent: parseFloat(asset.total_gain_loss_percent || '0') || 0,
      aiAnalysis: asset.ai_analysis || 'AI analysis will be generated for this asset.',
      riskLevel: asset.risk_level || 'medium',
      recommendation: asset.recommendation || 'hold',
      createdAt: asset.created_at || new Date().toISOString(),
      updatedAt: asset.updated_at || new Date().toISOString(),
      lastUpdated: asset.last_updated || new Date().toISOString(),
    };

    // Handle tradeable assets
    if (['stock', 'etf', 'bond', 'crypto'].includes(asset.asset_type)) {
      return {
        ...baseAsset,
        symbol: asset.symbol || baseAsset.name.substring(0, 4).toUpperCase(),
        exchange: asset.exchange || 'UNKNOWN',
        currency: asset.currency || 'USD',
        quantity: parseFloat(asset.quantity || '0') || 0,
        averagePurchasePrice: parseFloat(asset.average_purchase_price || '0') || 0,
        currentPrice: parseFloat(asset.current_price || '0') || 0,
        dailyChange: parseFloat(asset.daily_change || '0') || 0,
        dailyChangePercent: parseFloat(asset.daily_change_percent || '0') || 0,
        volume: asset.volume || '1.2M',
        marketCap: asset.market_cap || '0',
        peRatio: parseFloat(asset.pe_ratio || '0') || 0,
        growthRate: parseFloat(asset.growth_rate || '0') || undefined,
        sector: asset.sector || 'Unknown',
        logoUrl: asset.logo_url || null,
        chartData: asset.chart_data || [],
      } as TradableAsset;
    }

    // Handle physical assets
    if (['gold', 'silver', 'commodity'].includes(asset.asset_type)) {
      return {
        ...baseAsset,
        quantity: parseFloat(asset.quantity || '0') || 0,
        unit: asset.unit || 'grams',
        purchasePrice: parseFloat(asset.purchase_price || '0') || 0,
        currentMarketPrice: parseFloat(asset.current_market_price || asset.purchase_price || '0') || 0,
        manuallyUpdated: Boolean(asset.manually_updated),
      } as PhysicalAsset;
    }

    // Return base asset for unknown types
    return baseAsset;
  } catch (error) {
    console.error('Error transforming asset data:', error, asset);
    // Return a safe fallback asset
    return {
      id: (asset?.id || Math.random()).toString(),
      name: asset?.name || 'Unknown Asset',
      assetType: asset?.asset_type || 'stock',
      totalValue: 0,
      totalGainLoss: 0,
      totalGainLossPercent: 0,
      aiAnalysis: 'AI analysis will be generated for this asset.',
      riskLevel: 'medium',
      recommendation: 'hold',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
    } as Asset;
  }
};

/**
 * Updates an existing asset
 */
export const updateAsset = async (assetId: string, assetData: Partial<Asset>, token?: string) => {
  try {
    if (!assetId) {
      throw new Error('Asset ID is required for update');
    }

    const headers: any = { 'Content-Type': 'application/json' };
    if (token) {
      headers.Authorization = `Token ${token}`;
    } else {
      const hasHeader = Boolean(apiClient.defaults.headers.common.Authorization);
      if (!hasHeader) {
        const stored = await AsyncStorage.getItem('authToken');
        if (stored) setAuthToken(stored);
      }
    }

    // Transform frontend data to backend format
    const backendData: any = {};

    if (assetData.name) backendData.name = assetData.name;
    if (assetData.totalValue !== undefined) backendData.total_value = assetData.totalValue;

    // Handle tradeable asset fields
    if ('symbol' in assetData && (assetData as TradableAsset).symbol) {
      backendData.symbol = (assetData as TradableAsset).symbol;
    }
    if ('exchange' in assetData && (assetData as TradableAsset).exchange) {
      backendData.exchange = (assetData as TradableAsset).exchange;
    }
    if ('quantity' in assetData && (assetData as TradableAsset).quantity !== undefined) {
      backendData.quantity = (assetData as TradableAsset).quantity;
    }
    if ('averagePurchasePrice' in assetData && (assetData as TradableAsset).averagePurchasePrice !== undefined) {
      backendData.average_purchase_price = (assetData as TradableAsset).averagePurchasePrice;
    }
    if ('sector' in assetData && (assetData as TradableAsset).sector) {
      backendData.sector = (assetData as TradableAsset).sector;
    }

    // Handle physical asset fields
    if ('unit' in assetData && (assetData as PhysicalAsset).unit) {
      backendData.unit = (assetData as PhysicalAsset).unit;
    }
    if ('purchasePrice' in assetData && (assetData as PhysicalAsset).purchasePrice !== undefined) {
      backendData.purchase_price = (assetData as PhysicalAsset).purchasePrice;
    }
    if ('currentMarketPrice' in assetData && (assetData as PhysicalAsset).currentMarketPrice !== undefined) {
      backendData.current_market_price = (assetData as PhysicalAsset).currentMarketPrice;
    }


    const response = await apiClient.patch(`/investments/${assetId}/`, backendData, { headers });

    // Transform backend response to frontend format
    const asset = response.data;
    if (!asset) {
      throw new Error('No asset data returned from server');
    }

    const baseAsset = {
      id: asset.id?.toString() || assetId,
      name: asset.name || 'Unknown Asset',
      assetType: asset.asset_type || 'stock',
      totalValue: parseFloat(asset.total_value || '0') || 0,
      totalGainLoss: parseFloat(asset.total_gain_loss || '0') || 0,
      totalGainLossPercent: parseFloat(asset.total_gain_loss_percent || '0') || 0,
      aiAnalysis: asset.ai_analysis || 'AI analysis will be generated for this asset.',
      riskLevel: asset.risk_level || 'medium',
      recommendation: asset.recommendation || 'hold',
      createdAt: asset.created_at || new Date().toISOString(),
      updatedAt: asset.updated_at || new Date().toISOString(),
      lastUpdated: asset.last_updated || new Date().toISOString(),
    };

    // Handle tradeable assets
    if (['stock', 'etf', 'bond', 'crypto'].includes(asset.asset_type)) {
      return {
        ...baseAsset,
        symbol: asset.symbol || 'UNKNOWN',
        exchange: asset.exchange || 'UNKNOWN',
        currency: asset.currency || 'USD',
        quantity: parseFloat(asset.quantity || '0') || 0,
        averagePurchasePrice: parseFloat(asset.average_purchase_price || '0') || 0,
        currentPrice: parseFloat(asset.current_price || '0') || 0,
        dailyChange: parseFloat(asset.daily_change || '0') || 0,
        dailyChangePercent: parseFloat(asset.daily_change_percent || '0') || 0,
        chartData: asset.chart_data || [],
        logoUrl: asset.logo_url || null,
        sector: asset.sector || 'Unknown',
        volume: asset.volume || '1.2M',
        marketCap: asset.market_cap ? parseFloat(asset.market_cap) : undefined,
        growthRate: asset.growth_rate ? parseFloat(asset.growth_rate) : undefined,
        yieldToMaturity: asset.yield_to_maturity ? parseFloat(asset.yield_to_maturity) : undefined,
        maturityDate: asset.maturity_date || undefined,
      } as TradableAsset;
    }

    // Handle physical assets
    return {
      ...baseAsset,
      quantity: parseFloat(asset.quantity || '0') || 0,
      unit: asset.unit || 'units',
      purchasePrice: parseFloat(asset.purchase_price || '0') || 0,
      currentMarketPrice: asset.current_market_price ? parseFloat(asset.current_market_price) : undefined,

      manuallyUpdated: Boolean(asset.manually_updated),
    } as PhysicalAsset;
  } catch (error: any) {
    console.error('Error updating asset:', error);
    if (error.response?.status === 404) {
      throw new Error(`Asset with ID ${assetId} not found`);
    }
    if (error.response?.status === 400) {
      throw new Error('Invalid asset data provided. Please check your input.');
    }
    if (error.response?.status === 401) {
      throw new Error('Authentication required. Please log in again.');
    }
    throw error;
  }
};