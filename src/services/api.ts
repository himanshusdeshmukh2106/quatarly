import axios from 'axios';
import { NewsArticle, Category, Tag, UserPreferences, QuestionnaireResponse, Goal, CreateGoalRequest, UpdateGoalRequest, Opportunity, UserProfile } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';

// IMPORTANT: Replace with your computer's IP address
// For Android emulator, use 10.0.2.2
// For physical device or iOS simulator, use your computer's IP address
const API_BASE_URL = __DEV__ 
  ? 'http://192.168.1.7:8000/api'  // Change this to your computer's IP
  : 'http://192.168.1.7:8000/api';

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
    image: goal.image_url || 'https://via.placeholder.com/600x240.png?text=Goal',
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
    image: goal.image_url || 'https://via.placeholder.com/600x240.png?text=Goal',
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
    image: goal.image_url || 'https://via.placeholder.com/600x240.png?text=Goal',
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
    image: goal.image_url || 'https://via.placeholder.com/600x240.png?text=Goal',
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