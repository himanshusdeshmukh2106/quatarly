import axios from 'axios';
import { NewsArticle, Category, Tag, UserPreferences, QuestionnaireResponse } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';

// IMPORTANT: Replace with your computer's IP address
const API_BASE_URL = 'http://192.168.1.100:8000/api';

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