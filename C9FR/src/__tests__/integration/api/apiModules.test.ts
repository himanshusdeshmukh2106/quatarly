/**
 * API Modules Integration Tests
 * 
 * Tests the integration of API modules with the API client
 */

import { authApi, assetsApi, investmentsApi, goalsApi, opportunitiesApi } from '../../../api';

// Mock the API client
jest.mock('../../../api/client', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
  setAuthToken: jest.fn(),
  clearAuthToken: jest.fn(),
  isAuthenticated: jest.fn(),
  getAuthToken: jest.fn(),
}));

import { apiClient } from '../../../api/client';

describe('API Modules Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('authApi', () => {
    it('calls correct endpoint for login', async () => {
      const mockResponse = { data: { token: 'test-token' } };
      (apiClient.post as jest.Mock).mockResolvedValue(mockResponse);

      await authApi.login({ username: 'test', password: 'pass' });

      expect(apiClient.post).toHaveBeenCalledWith(
        '/auth/login/',
        { username: 'test', password: 'pass' }
      );
    });

    it('calls correct endpoint for register', async () => {
      const mockResponse = { data: { token: 'test-token' } };
      (apiClient.post as jest.Mock).mockResolvedValue(mockResponse);

      await authApi.register({
        username: 'test',
        email: 'test@example.com',
        password: 'pass',
      });

      expect(apiClient.post).toHaveBeenCalledWith(
        '/auth/registration/',
        expect.objectContaining({ username: 'test' })
      );
    });
  });

  describe('assetsApi', () => {
    it('calls correct endpoint for fetchAll', async () => {
      const mockResponse = { data: [] };
      (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);

      await assetsApi.fetchAll();

      expect(apiClient.get).toHaveBeenCalledWith('/investments/');
    });

    it('calls correct endpoint for create', async () => {
      const mockResponse = { data: { id: '1' } };
      (apiClient.post as jest.Mock).mockResolvedValue(mockResponse);

      await assetsApi.create({
        assetType: 'stock',
        name: 'Test',
        symbol: 'TEST',
        quantity: 10,
        purchasePrice: 100,
      });

      expect(apiClient.post).toHaveBeenCalledWith(
        '/investments/',
        expect.any(Object)
      );
    });

    it('calls correct endpoint for delete', async () => {
      (apiClient.delete as jest.Mock).mockResolvedValue({});

      await assetsApi.delete('123');

      expect(apiClient.delete).toHaveBeenCalledWith('/investments/123/');
    });
  });

  describe('goalsApi', () => {
    it('calls correct endpoint for fetchAll', async () => {
      const mockResponse = { data: [] };
      (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);

      await goalsApi.fetchAll();

      expect(apiClient.get).toHaveBeenCalledWith('/goals/');
    });

    it('calls correct endpoint for create', async () => {
      const mockResponse = { data: { id: '1' } };
      (apiClient.post as jest.Mock).mockResolvedValue(mockResponse);

      await goalsApi.create({
        name: 'Test Goal',
        target_amount: 1000,
        current_amount: 0,
        deadline: '2025-12-31',
      } as any);

      expect(apiClient.post).toHaveBeenCalledWith(
        '/goals/',
        expect.any(Object)
      );
    });

    it('calls correct endpoint for updateProgress', async () => {
      const mockResponse = { data: { id: '1' } };
      (apiClient.patch as jest.Mock).mockResolvedValue(mockResponse);

      await goalsApi.updateProgress('123', 500);

      expect(apiClient.patch).toHaveBeenCalledWith(
        '/goals/123/',
        { current_amount: 500 }
      );
    });
  });

  describe('opportunitiesApi', () => {
    it('calls correct endpoint for fetchAll', async () => {
      const mockResponse = { data: [] };
      (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);

      await opportunitiesApi.fetchAll();

      expect(apiClient.get).toHaveBeenCalledWith('/opportunities/');
    });

    it('calls correct endpoint for refresh', async () => {
      const mockResponse = { data: { success: true, count: 5 } };
      (apiClient.post as jest.Mock).mockResolvedValue(mockResponse);

      await opportunitiesApi.refresh();

      expect(apiClient.post).toHaveBeenCalledWith('/opportunities/refresh/');
    });

    it('calls correct endpoint for dismiss', async () => {
      const mockResponse = { data: { id: '1' } };
      (apiClient.patch as jest.Mock).mockResolvedValue(mockResponse);

      await opportunitiesApi.dismiss('123');

      expect(apiClient.patch).toHaveBeenCalledWith(
        '/opportunities/123/',
        { status: 'dismissed' }
      );
    });
  });

  describe('investmentsApi', () => {
    it('calls correct endpoint for fetchPortfolioSummary', async () => {
      const mockResponse = { data: [] };
      (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);

      await investmentsApi.fetchPortfolioSummary();

      expect(apiClient.get).toHaveBeenCalledWith('/investments/');
    });

    it('calls correct endpoint for refreshPrices', async () => {
      const mockResponse = { data: { success: true } };
      (apiClient.post as jest.Mock).mockResolvedValue(mockResponse);

      await investmentsApi.refreshPrices();

      expect(apiClient.post).toHaveBeenCalledWith('/investments/refresh-prices/');
    });
  });
});
