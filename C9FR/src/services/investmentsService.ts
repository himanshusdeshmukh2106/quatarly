import { apiClient } from './apiClient';
import { Investment, CreateInvestmentRequest, UpdateInvestmentRequest, CandlestickData, ChartTimeframe } from '../types';

/**
 * Investments API Service
 * Handles all investment-related API calls
 */
export class InvestmentsService {
  /**
   * Fetch all investments for the authenticated user
   */
  static async fetchInvestments(): Promise<Investment[]> {
    try {
      const response = await apiClient.get('/investments/');
      return response.data;
    } catch (error) {
      console.error('Error fetching investments:', error);
      throw error;
    }
  }

  /**
   * Create a new investment
   */
  static async createInvestment(investmentData: CreateInvestmentRequest): Promise<Investment> {
    try {
      const response = await apiClient.post('/investments/', investmentData);
      return response.data;
    } catch (error) {
      console.error('Error creating investment:', error);
      throw error;
    }
  }

  /**
   * Update an existing investment
   */
  static async updateInvestment(
    investmentId: string, 
    investmentData: UpdateInvestmentRequest
  ): Promise<Investment> {
    try {
      const response = await apiClient.patch(`/investments/${investmentId}/`, investmentData);
      return response.data;
    } catch (error) {
      console.error('Error updating investment:', error);
      throw error;
    }
  }

  /**
   * Delete an investment
   */
  static async deleteInvestment(investmentId: string): Promise<void> {
    try {
      await apiClient.delete(`/investments/${investmentId}/`);
    } catch (error) {
      console.error('Error deleting investment:', error);
      throw error;
    }
  }

  /**
   * Refresh investment prices
   */
  static async refreshInvestmentPrices(): Promise<Investment[]> {
    try {
      const response = await apiClient.post('/investments/refresh-prices/');
      return response.data;
    } catch (error) {
      console.error('Error refreshing investment prices:', error);
      throw error;
    }
  }

  /**
   * Fetch candlestick chart data for an investment
   */
  static async fetchInvestmentCandlestickData(
    investmentId: string, 
    timeframe: ChartTimeframe = '1D'
  ): Promise<CandlestickData[]> {
    try {
      const response = await apiClient.get(`/investments/${investmentId}/candlestick/`, {
        params: { timeframe }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching investment candlestick data:', error);
      throw error;
    }
  }

  /**
   * Get investment portfolio summary
   */
  static async getPortfolioSummary(): Promise<{
    totalValue: number;
    totalGainLoss: number;
    totalGainLossPercentage: number;
    topPerformers: Investment[];
    worstPerformers: Investment[];
  }> {
    try {
      const response = await apiClient.get('/investments/portfolio-summary/');
      return response.data;
    } catch (error) {
      console.error('Error fetching portfolio summary:', error);
      throw error;
    }
  }

  /**
   * Get investment recommendations
   */
  static async getInvestmentRecommendations(riskTolerance?: string): Promise<any[]> {
    try {
      const response = await apiClient.get('/investments/recommendations/', {
        params: { risk_tolerance: riskTolerance }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching investment recommendations:', error);
      throw error;
    }
  }

  /**
   * Search for investment symbols
   */
  static async searchInvestmentSymbols(query: string): Promise<any[]> {
    try {
      const response = await apiClient.get('/investments/search/', {
        params: { q: query }
      });
      return response.data;
    } catch (error) {
      console.error('Error searching investment symbols:', error);
      throw error;
    }
  }

  /**
   * Get market status
   */
  static async getMarketStatus(): Promise<{
    isOpen: boolean;
    nextOpen: string;
    nextClose: string;
    timezone: string;
  }> {
    try {
      const response = await apiClient.get('/investments/market-status/');
      return response.data;
    } catch (error) {
      console.error('Error fetching market status:', error);
      throw error;
    }
  }
}

// Export individual functions for backward compatibility
export const fetchInvestments = InvestmentsService.fetchInvestments;
export const createInvestment = InvestmentsService.createInvestment;
export const updateInvestment = InvestmentsService.updateInvestment;
export const deleteInvestment = InvestmentsService.deleteInvestment;
export const refreshInvestmentPrices = InvestmentsService.refreshInvestmentPrices;
export const fetchInvestmentCandlestickData = InvestmentsService.fetchInvestmentCandlestickData;
export const getPortfolioSummary = InvestmentsService.getPortfolioSummary;
export const getInvestmentRecommendations = InvestmentsService.getInvestmentRecommendations;
export const searchInvestmentSymbols = InvestmentsService.searchInvestmentSymbols;
export const getMarketStatus = InvestmentsService.getMarketStatus;
