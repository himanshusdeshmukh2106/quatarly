import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchGoals, createGoal, updateGoal, deleteGoal, generateGoalImage } from '../api';
import { apiClient } from '../api';

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

describe('Goals API', () => {
  const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;
  const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchGoals', () => {
    it('fetches goals successfully', async () => {
      const mockBackendResponse = [
        {
          id: 1,
          title: 'Emergency Fund',
          current_amount: '30000.00',
          target_amount: '50000.00',
          description: 'For emergencies',
          category: 'Savings',
          image_url: 'https://example.com/image.jpg',
          ai_analysis: 'Good progress',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          progress_percentage: 60,
        },
      ];

      mockApiClient.get.mockResolvedValue({ data: mockBackendResponse });

      const result = await fetchGoals();

      expect(mockApiClient.get).toHaveBeenCalledWith('/goals/', { headers: { 'Content-Type': 'application/json' } });
      expect(result).toEqual([
        {
          id: '1',
          title: 'Emergency Fund',
          currentAmount: 30000,
          targetAmount: 50000,
          description: 'For emergencies',
          category: 'Savings',
          image_url: 'https://example.com/image.jpg',
          logo: 'https://logo.clearbit.com/chase.com',
          aiAnalysis: 'Good progress',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
          progressPercentage: 60,
        },
      ]);
    });

    it('uses stored auth token when available', async () => {
      mockAsyncStorage.getItem.mockResolvedValue('stored-token');
      mockApiClient.defaults.headers.common = {};
      mockApiClient.get.mockResolvedValue({ data: [] });

      await fetchGoals();

      expect(mockAsyncStorage.getItem).toHaveBeenCalledWith('authToken');
    });

    it('uses provided token', async () => {
      mockApiClient.get.mockResolvedValue({ data: [] });

      await fetchGoals('test-token');

      expect(mockApiClient.get).toHaveBeenCalledWith('/goals/', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Token test-token',
        },
      });
    });
  });

  describe('createGoal', () => {
    it('creates goal successfully', async () => {
      const goalData = {
        title: 'New Goal',
        target_amount: 10000,
        description: 'Test goal',
        category: 'Savings',
      };

      const mockBackendResponse = {
        id: 1,
        title: 'New Goal',
        current_amount: '0.00',
        target_amount: '10000.00',
        description: 'Test goal',
        category: 'Savings',
        image_url: 'https://example.com/image.jpg',
        ai_analysis: 'New goal created',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        progress_percentage: 0,
      };

      mockApiClient.post.mockResolvedValue({ data: mockBackendResponse });

      const result = await createGoal(goalData);

      expect(mockApiClient.post).toHaveBeenCalledWith('/goals/', goalData, {
        headers: { 'Content-Type': 'application/json' },
      });
      expect(result.title).toBe('New Goal');
      expect(result.targetAmount).toBe(10000);
    });
  });

  describe('updateGoal', () => {
    it('updates goal successfully', async () => {
      const goalId = '1';
      const updateData = {
        current_amount: 5000,
        title: 'Updated Goal',
      };

      const mockBackendResponse = {
        id: 1,
        title: 'Updated Goal',
        current_amount: '5000.00',
        target_amount: '10000.00',
        description: 'Test goal',
        category: 'Savings',
        image_url: 'https://example.com/image.jpg',
        ai_analysis: 'Goal updated',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        progress_percentage: 50,
      };

      mockApiClient.patch.mockResolvedValue({ data: mockBackendResponse });

      const result = await updateGoal(goalId, updateData);

      expect(mockApiClient.patch).toHaveBeenCalledWith(`/goals/${goalId}/`, updateData, {
        headers: { 'Content-Type': 'application/json' },
      });
      expect(result.title).toBe('Updated Goal');
      expect(result.currentAmount).toBe(5000);
    });
  });

  describe('deleteGoal', () => {
    it('deletes goal successfully', async () => {
      const goalId = '1';
      mockApiClient.delete.mockResolvedValue({ data: {} });

      const result = await deleteGoal(goalId);

      expect(mockApiClient.delete).toHaveBeenCalledWith(`/goals/${goalId}/`, {
        headers: { 'Content-Type': 'application/json' },
      });
      expect(result).toEqual({});
    });
  });

  describe('generateGoalImage', () => {
    it('generates goal image successfully', async () => {
      const goalId = '1';
      const mockBackendResponse = {
        id: 1,
        title: 'Test Goal',
        current_amount: '0.00',
        target_amount: '10000.00',
        description: 'Test goal',
        category: 'Savings',
        image_url: 'https://example.com/new-image.jpg',
        ai_analysis: 'Image generated',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        progress_percentage: 0,
      };

      mockApiClient.post.mockResolvedValue({ data: mockBackendResponse });

      const result = await generateGoalImage(goalId);

      expect(mockApiClient.post).toHaveBeenCalledWith(`/goals/${goalId}/generate_image/`, {}, {
        headers: { 'Content-Type': 'application/json' },
      });
      expect(result.image_url).toBe('https://example.com/new-image.jpg');
    });
  });

  describe('Error handling', () => {
    it('handles network errors gracefully', async () => {
      mockApiClient.get.mockRejectedValue(new Error('Network error'));

      await expect(fetchGoals()).rejects.toThrow('Network error');
    });

    it('handles API errors gracefully', async () => {
      mockApiClient.post.mockRejectedValue({
        response: {
          status: 400,
          data: { error: 'Invalid data' },
        },
      });

      const goalData = {
        title: 'Invalid Goal',
        target_amount: -100,
      };

      await expect(createGoal(goalData)).rejects.toMatchObject({
        response: {
          status: 400,
          data: { error: 'Invalid data' },
        },
      });
    });
  });

  describe('Data transformation', () => {
    it('transforms backend response correctly', async () => {
      const mockBackendResponse = [
        {
          id: 1,
          title: 'Test Goal',
          current_amount: '1500.50',
          target_amount: '5000.00',
          description: null,
          category: '',
          image_url: '',
          ai_analysis: '',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          progress_percentage: null,
        },
      ];

      mockApiClient.get.mockResolvedValue({ data: mockBackendResponse });

      const result = await fetchGoals();

      expect(result[0]).toEqual({
        id: '1',
        title: 'Test Goal',
        currentAmount: 1500.5,
        targetAmount: 5000,
        description: null,
        category: '',
        image_url: 'https://via.placeholder.com/600x240.png?text=Goal',
        logo: 'https://logo.clearbit.com/chase.com',
        aiAnalysis: 'AI analysis will be generated for this goal.',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        progressPercentage: 0,
      });
    });
  });
});