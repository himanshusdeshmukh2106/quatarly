import { fetchInvestments, createInvestment, updateInvestment, deleteInvestment, refreshInvestmentPrices } from '../api';
import { CreateInvestmentRequest, UpdateInvestmentRequest } from '../../types';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

// Mock axios
jest.mock('axios', () => ({
  create: jest.fn(() => ({
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
    defaults: {
      headers: {
        common: {},
      },
    },
  })),
}));

const mockApiResponse = {
  data: [
    {
      id: 1,
      symbol: 'AAPL',
      name: 'Apple Inc.',
      asset_type: 'stock',
      exchange: 'NASDAQ',
      currency: 'USD',
      quantity: '10',
      average_purchase_price: '150.00',
      current_price: '175.50',
      total_value: '1755.00',
      daily_change: '2.50',
      daily_change_percent: '1.45',
      total_gain_loss: '255.00',
      total_gain_loss_percent: '17.00',
      chart_data: [],
      last_updated: new Date().toISOString(),
      ai_analysis: 'Strong buy recommendation',
      risk_level: 'medium',
      recommendation: 'buy',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ],
};

describe('Investment API Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchInvestments', () => {
    it('should fetch and transform investments data', async () => {
      const mockGet = jest.fn().mockResolvedValue(mockApiResponse);
      require('../api').apiClient.get = mockGet;

      const result = await fetchInvestments();

      expect(mockGet).toHaveBeenCalledWith('/investments/', expect.any(Object));
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: '1',
        symbol: 'AAPL',
        name: 'Apple Inc.',
        assetType: 'stock',
        quantity: 10,
        currentPrice: 175.50,
      });
    });

    it('should handle API errors', async () => {
      const mockGet = jest.fn().mockRejectedValue(new Error('API Error'));
      require('../api').apiClient.get = mockGet;

      await expect(fetchInvestments()).rejects.toThrow('API Error');
    });
  });

  describe('createInvestment', () => {
    it('should create a new investment', async () => {
      const mockPost = jest.fn().mockResolvedValue({ data: mockApiResponse.data[0] });
      require('../api').apiClient.post = mockPost;

      const investmentData: CreateInvestmentRequest = {
        symbol: 'AAPL',
        quantity: 10,
        purchase_price: 150.00,
      };

      const result = await createInvestment(investmentData);

      expect(mockPost).toHaveBeenCalledWith('/investments/', investmentData, expect.any(Object));
      expect(result).toMatchObject({
        id: '1',
        symbol: 'AAPL',
        quantity: 10,
      });
    });
  });

  describe('updateInvestment', () => {
    it('should update an existing investment', async () => {
      const mockPatch = jest.fn().mockResolvedValue({ data: mockApiResponse.data[0] });
      require('../api').apiClient.patch = mockPatch;

      const updateData: UpdateInvestmentRequest = {
        id: '1',
        quantity: 15,
      };

      const result = await updateInvestment('1', updateData);

      expect(mockPatch).toHaveBeenCalledWith('/investments/1/', updateData, expect.any(Object));
      expect(result).toMatchObject({
        id: '1',
        symbol: 'AAPL',
      });
    });
  });

  describe('deleteInvestment', () => {
    it('should delete an investment', async () => {
      const mockDelete = jest.fn().mockResolvedValue({ data: {} });
      require('../api').apiClient.delete = mockDelete;

      await deleteInvestment('1');

      expect(mockDelete).toHaveBeenCalledWith('/investments/1/', expect.any(Object));
    });
  });

  describe('refreshInvestmentPrices', () => {
    it('should refresh all investment prices', async () => {
      const mockPost = jest.fn().mockResolvedValue(mockApiResponse);
      require('../api').apiClient.post = mockPost;

      const result = await refreshInvestmentPrices();

      expect(mockPost).toHaveBeenCalledWith('/investments/refresh-prices/', {}, expect.any(Object));
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: '1',
        symbol: 'AAPL',
      });
    });
  });
});